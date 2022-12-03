import getHostnames from "lib/getHostnames";
import getRoot from "lib/getRoot";

/** @param {import(".").NS} ns */
export async function getTargets(ns) {
  let hostnames = await getHostnames(ns);
  let targets = [];
  for (let hostname of hostnames) {
    let got_root = await getRoot(ns, hostname);
    if (got_root) targets.push(hostname);
  }
  return targets;
}

/** @param {import(".").NS} ns */
export async function getWeakenTargets(ns, targets) {
  let jobs = [];
  for (let hostname of targets) {
    let minSecurityLevel = ns.getServerMinSecurityLevel(hostname);
    let securityLevel = ns.getServerSecurityLevel(hostname);
    if (minSecurityLevel === securityLevel) continue;
    let diff = securityLevel - minSecurityLevel;
    let iters = Math.floor(diff / 0.05);
    let time = ns.getWeakenTime(hostname);
    let total_time = time * iters;
    jobs.push({
      hostname,
      iters,
      securityLevel,
      minSecurityLevel,
      time,
      total_time,
    });
  }
  return jobs;
}

/** @param {import(".").NS} ns */
export async function getGrowTargets(ns, targets) {
  let jobs = [];
  for (let hostname of targets) {
    let moneyAvailable = ns.getServerMoneyAvailable(hostname);
    let moneyMax = ns.getServerMaxMoney(hostname);
    if (moneyMax <= 0) continue;
    if (moneyAvailable === moneyMax) continue;
    let multNeeded = moneyMax / moneyAvailable;
    let iters = ns.growthAnalyze(hostname, multNeeded);
    let time = ns.getGrowTime(hostname);
    let total_time = time * iters;
    jobs.push({ hostname, iters, moneyAvailable, moneyMax, time });
  }
  return jobs;
}

/** @param {import(".").NS} ns */
export async function getHackTargets(ns, targets) {
  let jobs = [];
  for (let hostname of targets) {
    let moneyAvailable = ns.getServerMoneyAvailable(hostname);
    let moneyMax = ns.getServerMaxMoney(hostname);
    let hackAnalyze = ns.hackAnalyze(hostname);
    let hackAnalyzeChance = ns.hackAnalyzeChance(hostname);
    let moneyPerThread = moneyAvailable * hackAnalyze;
    let time = ns.getHackTime(hostname);
    let requiredLevel = ns.getServerRequiredHackingLevel(hostname);
    jobs.push({
      hostname,
      moneyPerThread,
      moneyAvailable,
      hackAnalyze,
      hackAnalyzeChance,
      time,
      moneyMax,
      requiredLevel,
    });
  }
  return jobs;
}

/** @param {import(".").NS} ns */
export async function getWorkerTargets(ns, targets) {
  let workers = [];
  for (let hostname of targets) {
    let ramUsed = ns.getServerUsedRam(hostname);
    let ramMax = ns.getServerMaxRam(hostname);
    let ramAvail = ramMax - ramUsed;
    let processes = ns.ps(hostname);
    workers.push({ hostname, ramUsed, ramMax, ramAvail, processes });
  }
  return workers;
}

export async function getAllTargets(ns) {
  let targets = await getTargets(ns);

  let grow = await getGrowTargets(ns, targets);
  let weaken = await getWeakenTargets(ns, targets);
  let hack = await getHackTargets(ns, targets);
  let workers = await getWorkerTargets(ns, targets);

  return { grow, weaken, hack, workers };
}

/** @param {import(".").NS} ns */
export async function main(ns) {
  let all_targets = await getAllTargets(ns);

  ns.tprint(JSON.stringify(all_targets, null, 2));
}
