import getRooted from "lib/getRooted";
import calcMaxThreads from "lib/calcMaxThreads";
import deployScript from "lib/deployScript";

/** @param {import(".").NS} ns */
export default async function deployScriptAll(
  ns,
  script_name,
  _threads = 1,
  ..._args
) {
  let hostnames = await getRooted(ns);

  for (let hostname in hostnames) {
    let _threads = threads;
    if (threads === -1)
      _threads = await calcMaxThreads(ns, script_name, hostname);
    await deployScript(ns, script_name, hostname, _threads, ..._args);
  }
}

/** @param {import(".").NS} ns */
export async function main(ns) {
    if (ns.args.length === 0 || ns.args[0] === "--help") {
      ns.tprint(
        `./lib/deployScriptAll.js script_name [thread_count] [args]... `
      );
      return;
    }
  
    let script_name = ns.args[0];
    let hostnames = await getRooted(ns)
  
    let threads = 1;
    if (ns.args.length > 1) threads = ns.args[1];
  
    let _args = []
    if (ns.args.length > 2) _args = ns.args.slice(2);
  
    for (let hostname of hostnames) {
        let _threads = threads;
      if (_threads === -1) {
        _threads = await calcMaxThreads(ns, script_name, hostname);
        if (_threads === 0) {
          ns.tprint(`No threads available on ${hostname}!`);
          continue
        }
      }
  
      ns.tprint(
        `deploying ${script_name}[${_threads}](${_args.join(" ")}) to ${hostname}`
      );
      let result = await deployScript(
        ns,
        script_name,
        hostname,
        _threads,
        ..._args
      );
    }
  }