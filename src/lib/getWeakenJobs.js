/** @param {import(".").NS} ns */
export default async function getWeakenJobs(ns, hostnames) {
  let jobs = {};
  for (let hostname of hostnames) {
    let minSecurityLevel = ns.getServerMinSecurityLevel(hostname);
    let securityLevel = ns.getServerSecurityLevel(hostname);
    if (minSecurityLevel === securityLevel) continue;
    let diff = securityLevel - minSecurityLevel;
    let iters = Math.floor(diff / 0.05);
    let time = ns.getWeakenTime(hostname);
    let total_time = time * iters; 
    jobs[hostname] = {
      hostname,
      iters,
      securityLevel,
      minSecurityLevel,
      time,
      total_time,
    };
  }
  return jobs;
}

/** @param {import(".").NS} ns */
export async function main(ns) {
  let hostnames = ns.args;
  let weaken_jobs = await getWeakenJobs(ns, hostnames);
  ns.tprint(JSON.stringify(weaken_jobs, null, 2));
}
