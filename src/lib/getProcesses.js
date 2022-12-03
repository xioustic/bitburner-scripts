/** @param {import(".").NS} ns */
export default async function getProcesses(ns, hostname) {
  let processes = ns.ps(hostname); 
  let retval = [];
  for (let process of processes) {
    let script_data = ns.getRunningScript(process.pid);
    retval.push(script_data);
  }
  return retval;
}

/** @param {import(".").NS} ns */
export async function main(ns) {
  let hostname = ns.args[0];
  let processes = await getProcesses(ns, hostname);
  ns.tprint(JSON.stringify(processes, null, 2));
}
