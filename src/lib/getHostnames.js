/** @param {import(".").NS} ns */
export default async function getHostnames(ns, with_neighbors = false) {
  let seen = new Set(await ns.scan());
  let scanned = new Set(); 

  let scan_objs = {}
  for (let i = 0; i < 1000; i++) {
    let diff = [...seen].filter((hostname) => !scanned.has(hostname));

    if (diff.length === 0) break;
    let choice = diff[0];

    let _scan = ns.scan(choice);
    for (let hostname of _scan) seen.add(hostname);
    scanned.add(choice);
    scan_objs[choice] = {hostname: choice, neighbors: _scan}
  }

  if (with_neighbors) return scan_objs
  else return [...seen];
}

/** @param {import(".").NS} ns */
export async function main(ns) {
  let result
  if (ns.args.length && ns.args[0] === '--with-neighbors') {
    result = await getHostnames(ns, true)
  } else {
    result = await getHostnames(ns, false)
  }
  ns.tprint(JSON.stringify(result, null, 2));
}
