import getTargets from "lib/getTargets";

/** @param {import(".").NS} ns */
export default async function getWorkers(ns) {
  let targets = await getTargets(ns);
  let workers = {};
  for (let hostname of targets) {
    let ramUsed = ns.getServerUsedRam(hostname);
    let ramMax = ns.getServerMaxRam(hostname);
    let ramAvail = ramMax - ramUsed;
    let processes = ns.ps(hostname);
    workers[hostname] = { hostname, ramUsed, ramMax, ramAvail, processes };
  }
  return workers;
}

/** @param {import(".").NS} ns */
export async function main(ns) {
  let workers = await getWorkers(ns);
  ns.tprint(JSON.stringify(workers, null, 2));
}
