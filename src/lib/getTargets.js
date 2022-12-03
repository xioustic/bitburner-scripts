import getHostnames from "lib/getHostnames";
import getRoot from "lib/getRoot";
 
/** @param {import(".").NS} ns */
export default async function getTargets(ns) {
  let hostnames = await getHostnames(ns);
  let rooted = [];
  for (let hostname of hostnames) {
    let got_root = await getRoot(ns, hostname);
    if (got_root) rooted.push(hostname);
  }
  return rooted;
}

/** @param {import(".").NS} ns */
export async function main(ns) {
  ns.tprint(JSON.stringify(await getTargets(ns), null, 2));
}
