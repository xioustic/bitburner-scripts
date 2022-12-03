import getHostnames from "lib/getHostnames";

/** @param {import(".").NS} ns */
export default async function getAllProcesses(ns) {
    let hostnames = await getHostnames(ns);
    let processes = [];
    for (let hostname of hostnames) {
      let _processes = ns.ps(hostname)
      for (let process of _processes) {
        processes.push({...process, hostname})
      }
    }
    return processes
  }