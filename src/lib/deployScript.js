import calcMaxThreads from "lib/calcMaxThreads";

/** @param {import(".").NS} ns */
export default async function deployScript(
  ns,
  script_name,
  hostname,
  _threads = 1,
  ..._args
) {
  let threads = _threads;
  if (_threads === -1) threads = await calcMaxThreads(ns, script_name, hostname);
  if (threads === 0) return false;

  ns.tprint('deploying script')
  await ns.scp(script_name, hostname);
  ns.tprint('should be copied')
  return await ns.exec(script_name, hostname, threads, ..._args);
}

/** @param {import(".").NS} ns */
export async function main(ns) {
  if (ns.args.length === 0 || ns.args[0] === "--help") {
    ns.tprint(
      `./lib/deployScript.js script_name host_name [thread_count] [args]... `
    );
    return;
  }

  let script_name = ns.args[0];
  let _hostnames = ns.args[1];
  let hostnames = _hostnames.split(",");

  let threads = 1;
  if (ns.args.length > 2) threads = ns.args[2];

  let _args = []
  if (ns.args.length > 3) _args = ns.args.slice(3);

  for (let hostname of hostnames) {
    if (threads === -1) {
      threads = await calcMaxThreads(ns, script_name, hostname);
      if (threads === 0) {
        ns.tprint(`No threads available on ${hostname}!`);
        continue
      }
    }

    ns.tprint(
      `deploying ${script_name}[${threads}](${_args.join(" ")}) to ${hostname}`
    );
    let result = await deployScript(
      ns,
      script_name,
      hostname,
      threads,
      ..._args
    );
  }
}
