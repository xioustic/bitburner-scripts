import pprint from "lib/pprint.js";

/** @param {import(".").NS} ns */
export default function rmdir(ns, path, dry_run = false, hostname = "home") {
  let files = ns.ls(hostname, path);
  for (let file of files) {
    ns.tprint("rm " + file);
    if (dry_run === false) ns.rm(file);
  }
  // pprint(ns, files)
}

/** @param {import(".").NS} ns */
export async function main(ns) {
  let dry_run = false;
  if (ns.args.includes("-d")) dry_run = true;
  let path = ns.args.slice(-1)[0];
  let result = await rmdir(ns, path, dry_run);
  return result;
}
