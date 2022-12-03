import getAllProcesses from "lib/getAllProcesses";

/** @param {import("lib/").NS} ns */
export async function main(ns) {
  let script_name = ns.args[0];

  let killed = [];
  let processes = await getAllProcesses(ns);
  for (let process of processes) {
    if (process.filename === script_name) {
      ns.tprint(`killing ${process.filename}[${process.threads}](${process.args.join(' ')}) on ${process.hostname}`)
      ns.kill(process.pid);
      killed.push(process);
    }
  }

  return killed;
}
