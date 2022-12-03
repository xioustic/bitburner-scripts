import getHostnames from "lib/getHostnames";
import getRoot from "lib/getRoot";
import { buildASCIITable } from "utils";
import { findPathReadable } from "lib/findPath";

const HOME_RESERVE_RAM = 16
/** @param {(import("/../NetscriptDefinitions").NS)} ns */
export async function scanAnalyze(ns, hostnames = undefined) {
  if (hostnames === undefined) hostnames = await getHostnames(ns);
  if (typeof hostnames === 'string') hostnames = [hostnames]

  let scan_data = {};
  for (let hostname of hostnames) {
    let hasRoot = await getRoot(ns, hostname);
    let reqdHackingSkill = await ns.getServerRequiredHackingLevel(hostname);
    let reqdHackingPorts = await ns.getServerNumPortsRequired(hostname);
    let maxRam = await ns.getServerMaxRam(hostname);
    let usedRam = await ns.getServerUsedRam(hostname);
    
    let availRam = maxRam - usedRam;
    let realAvailRam = availRam
    if (hostname === 'home') availRam = Math.max(0, availRam - HOME_RESERVE_RAM)

    let securityLevel = await ns.getServerSecurityLevel(hostname);
    let minSecurityLevel = await ns.getServerMinSecurityLevel(hostname);
    let maxMoney = await ns.getServerMaxMoney(hostname);
    let availMoney = await ns.getServerMoneyAvailable(hostname);
    let growTime = await ns.getGrowTime(hostname);
    let hackTime = await ns.getHackTime(hostname);
    let weakenTime = await ns.getWeakenTime(hostname);
    let growthRate = await ns.getServerGrowth(hostname);
    // % of funds that will be stolen with a single thread
    let hackAnalyze = await ns.hackAnalyze(hostname);
    // % chance hack will be successful
    let hackAnalyzeChance = await ns.hackAnalyzeChance(hostname);
    // number of threads needed to hack the money on the server now
    let hackAnalyzeThreadsAvailMoney = Math.ceil(await ns.hackAnalyzeThreads(
      hostname,
      availMoney
    ));
    let files = await ns.ls(hostname);
    let processes = ns.ps(hostname);
    // processes = processes.map(proc => ({...proc, filename: proc.filename.trim()}))
    let neighbors = ns.scan(hostname);

    // getServer lookup
    let server = await ns.getServer(hostname)
    let hasBackdoor = server.backdoorInstalled
    let isPurchased = server.purchasedByPlayer

    // growth calculations
    // percentage of money growth we need to reach max money
    let growthAmtNeeded = maxMoney ? maxMoney / Math.max(availMoney, 1) : null
    // number of threads needed to reach max money
    let growthThreadsNeeded = maxMoney ? Math.ceil(ns.growthAnalyze(hostname, growthAmtNeeded)) : null

    // hack calculations
    let moneyPerHackTime = availMoney / hackTime
    let evPerHackTime = (availMoney * hackAnalyzeChance) / hackTime

    // prepTime calculations
    let prepTimeGrow = growthThreadsNeeded * growTime
    let postGrowSecurityLevel = securityLevel + (growthThreadsNeeded * 0.004)
    let numWeakensNeeded = (postGrowSecurityLevel - minSecurityLevel) / 0.05
    let prepTimeWeaken = numWeakensNeeded * weakenTime
    let totalPrepTime = prepTimeGrow + prepTimeWeaken

    scan_data[hostname] = {
      hostname,
      hasRoot,
      hasBackdoor,
      isPurchased,
      reqdHackingSkill,
      reqdHackingPorts,
      maxRam,
      usedRam,
      availRam,
      realAvailRam,
      securityLevel,
      minSecurityLevel,
      maxMoney,
      availMoney,
      growTime,
      hackTime,
      weakenTime,
      growthRate,
      hackAnalyze,
      hackAnalyzeChance,
      hackAnalyzeThreadsAvailMoney,
    //   hackAnalyzeThreadsMax,
      files,
      processes,
      neighbors,
      moneyPerHackTime,
    //   moneyPerHackTimeMax,
      evPerHackTime,
    //   evPerHackTimeMax,
      growthThreadsNeeded,
    //   maxSecurityLevel
    prepTimeGrow,
    postGrowSecurityLevel,
    numWeakensNeeded,
    prepTimeWeaken,
    totalPrepTime,
    server
    };
  }

  return scan_data
}

/** @param {import(".").NS} ns */
export async function main(ns) {
    let results = await scanAnalyze(ns)

    let sort = 'reqdHackingSkill'
    let sort_reverse = false

    let results_list = Object.values(results)
    let target = null
    let tablekeys
    if (ns.args.length) {
        let flag = ''
        for (let arg of ns.args) {
            if (flag === 'sort') {
                sort = arg
                flag = ''
            }
            else if (flag === 'table') {
              tablekeys = arg.split(',')
              if (arg === '*') tablekeys = Object.keys(results_list[0])
              flag = ''
            }
            else if (arg === '--root-only') results_list = results_list.filter(r => r.hasRoot)
            else if (arg === '--hackable') results_list = results_list.filter(r => r.hasRoot && ns.getHackingLevel() >= r.reqdHackingSkill && !r.isPurchased && r.maxMoney)
            else if (arg === '--needs-backdoor') results_list = results_list.filter(r => r.hasRoot && !r.server.backdoorInstalled && !r.isPurchased && ns.getHackingLevel() >= r.reqdHackingSkill)
            else if (arg === '--cct-only') results_list = results_list.filter(r => {
                let files = r.files
                for (let file of files) {
                    if (file.endsWith('.cct')) {ns.tprint(r.hostname, file) ; return true}
                }
                return false
            })
            else if (arg === '--table') flag = 'table'
            else if (arg === '--sort') flag = 'sort'
            else if (arg === '--reverse') sort_reverse = true
            else if (arg === '--purchased') results_list = results_list.filter(r => r.isPurchased)
            else target = arg
        }
        // results = arrToObj(results_list, 'hostname')
    }

    if (target !== null) results_list = results_list.filter(r => r.hostname === target)
    results_list.sort((a, b) => a[sort] - b[sort])
    if (sort_reverse) results_list.reverse()

    // print as table if tablekeys given
    if (tablekeys !== undefined) {
      if (tablekeys.includes('findPath')) {
        for (let result of results_list) {
          result['findPath'] = findPathReadable(ns, result.hostname)
        }
      }
      ns.tprint('\n' + buildASCIITable(results_list, tablekeys))
    } else {
      ns.tprint(JSON.stringify(results_list, null, 2))
    }
    
    ns.tprint(results_list.length)

    // ns.tprint(['hack', 'grow', 'weaken', 'hack/grow', 'hack/weaken', 'grow/weaken'].join('\t\t\t\t'))
    // for (let result of results_list) {
    //     // ns.tprint(result)
    //     let {growTime, hackTime, weakenTime} = result
    //     ns.tprint([hackTime,growTime,weakenTime,hackTime/growTime,hackTime/weakenTime,growTime/weakenTime].join('\t'))
    // }
}