const CONSERVE_HOME_RAM = 16

/** @param {import(".").NS} ns */
export default async function calcMaxThreads(ns, script_name, hostname) {
    let ramAvail = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)
    if (hostname === 'home') ramAvail = Math.max(0, ramAvail - CONSERVE_HOME_RAM)
    let threads = Math.floor(ramAvail / ns.getScriptRam(script_name))
    return threads
  }