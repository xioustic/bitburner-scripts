export default function pprint(ns, obj) {
  ns.tprint(JSON.stringify(obj, null, 2));
}