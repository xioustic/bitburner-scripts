import getHostnames from 'lib/getHostnames'

const CANT_ROOT = ['darkweb']

/** @param {import(".").NS} ns */
export default async function getRoot(ns, hostname) {
  // ns.tprint('getRoot ', hostname)
  if (typeof hostname === "object") hostname = hostname.hostname;
  // if (CANT_ROOT.includes(hostname)) return false;

  let already_root = ns.hasRootAccess(hostname);
  if (already_root) {
    // ns.tprint('already have root', hostname)
    return true;
  }

  //let tools = [ns.brutessh, ns.ftpcrack]
  let possible_tools = [
    ["BruteSSH.exe", ns.brutessh.bind(ns)],
    ["FTPCrack.exe", ns.ftpcrack.bind(ns)],
    ["relaySMTP.exe", ns.relaysmtp.bind(ns)],
    ["HTTPWorm.exe", ns.httpworm.bind(ns)],
    ["SQLInject.exe", ns.sqlinject.bind(ns)]
  ]
  for (let [filename, func] of possible_tools) {
    if (ns.fileExists(filename)) {
      // console.log('trying', filename, 'on', hostname)
      await func(hostname)
    }
  }

  try {
    await ns.nuke(hostname);
    return true;
  } catch {
    return false;
  }
}

/** @param {import(".").NS} ns */
export async function main(ns) {
  let hostnames = ns.args
  if (ns.args.length === 0) hostnames = await getHostnames(ns)
  for (let hostname of hostnames) {
    ns.tprint('working on ', hostname)
    let get_root = await getRoot(ns, hostname);
    ns.tprint(hostname, " ", get_root);
  }
}
