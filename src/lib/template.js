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
  