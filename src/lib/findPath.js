/** @param {import(".").NS} ns */
export default function findPath(ns, hostname, dest = "home") {
  let found = [];
  let visited = new Set();

  let path_queue = [[hostname]];

  const MAX_ITERS = 1000;
  let iter = 0;
  while (true) {
    iter++;
    if (iter > MAX_ITERS) {
      ns.tprint("max iters reached!");
      break;
    }

    let this_path = path_queue.pop();
    if (this_path === undefined) break
    // ns.tprint('working on ', this_path)
    let this_node = this_path.slice(-1)[0];
    if (this_node === dest) {
      found.push(this_path);
      continue;
    }

    let this_neighbors = ns.scan(this_node);
    let new_neighbors = this_neighbors.filter(
      (neighbor) => !this_path.includes(neighbor)
    );
    let new_paths = new_neighbors.map((neighbor) => [...this_path, neighbor]);
    path_queue = [...new_paths, ...path_queue];
  }

  found.forEach(reverse_path => reverse_path.reverse())
  found = found.map(path => path.slice(1))
  return found;
}

export function findPathReadable(ns, hostname, dest = "home") {
  let paths = findPath(ns, hostname, dest)
  let path = paths[0]
  return `home; connect ${path.join('; connect ')}`
}

/** @param {import(".").NS} ns */
export async function main(ns) {
  let target = ns.args[0];
  let result = await findPath(ns, target);
  ns.tprint(JSON.stringify(result, null, 2));
  let shortest
  for (let _result of result) {
    if (shortest === undefined) shortest = _result
    else if (_result.length < shortest) shortest = _result
  }
  // shortest.reverse()
  shortest = shortest.filter(hostname => !(hostname === 'home'))
  ns.tprint(`home;connect ${shortest.join(';connect ')}`)
}
