import { scanAnalyze } from "lib/scanAnalyze";
import { buildASCIITable } from "utils";

const getNowMs = () => +new Date();

// ServerData => boolean
// TODO: maybe return when/if we know when the target will be ready?
export const getServerDataFilters = (ns, playerHackLevel = undefined) => {
  if (playerHackLevel === undefined) playerHackLevel = ns.getHackingLevel();

  const isValidWorker = (serverData) => {
    let retval = serverData.hasRoot && serverData.maxRam;
    // if (serverData.hasRoot === 0) retval = false;
    // else if (serverData.maxRam === 0) retval = false;
    // else retval = true
    // console.log(serverData.hostname,'is worker?', serverData.hasRoot, serverData.maxRam, retval)
    return retval;
  };
  const isAvailWorker = (serverData) => {
    let retval = isValidWorker(serverData) && serverData.availRam;
    return retval;
  };
  const INVALID_TARGET_HOSTNAMES = ["home"];
  const isValidTarget = (serverData) => {
    let { maxMoney, hasRoot, reqdHackingSkill, hostname } = serverData;
    let isInvalidTargetHostname = INVALID_TARGET_HOSTNAMES.includes(hostname);
    return (
      hasRoot &&
      maxMoney &&
      reqdHackingSkill <= playerHackLevel &&
      !isInvalidTargetHostname
    );
  };
  // only hack if security level min and available money is max
  const isReadyForHacking = (serverData) => {
    // let time = getNowMs() + serverData.hackTime;
    // console.log("TIEMTEIMTMEIMET", time)
    if (!isValidTarget(serverData)) return false;
    let { securityLevel, minSecurityLevel, availMoney, maxMoney } = serverData;
    let effSecurityLevel = getEffSecLevelAtTime(serverData, 0);
    if (Math.floor(effSecurityLevel) !== minSecurityLevel) return false;
    if (Math.ceil(availMoney) !== maxMoney) return false;
    if (serverData.hackProcesses && serverData.hackProcesses.length)
      return false;
    return true;
  };
  // only grow if security level min and available money is not max
  const isReadyForGrowing = (serverData) => {
    // let time = getNowMs() + serverData.growTime;
    // console.log("TIEMTEIMTMEIMET", time)
    if (!isValidTarget(serverData)) return false;
    let { securityLevel, minSecurityLevel, availMoney, maxMoney } = serverData;
    let effSecLevel = getEffSecLevelAtTime(serverData, 0);
    if (Math.floor(effSecLevel) !== minSecurityLevel) return false;
    if (Math.ceil(availMoney) === maxMoney) return false;
    if (serverData.growProcesses && serverData.growProcesses.length)
      return false;
    return true;
  };
  // only weaken if securtity level is not min when we would apply this weaken
  const isReadyForWeakening = (serverData) => {
    let time = getNowMs() + serverData.weakenTime;
    // console.log("TIEMTEIMTMEIMET", time)
    if (!isValidTarget(serverData)) return false;
    let { securityLevel, minSecurityLevel } = serverData;
    let effSecLevel = getEffSecLevelAtTime(serverData, time);
    if (Math.floor(effSecLevel) === minSecurityLevel) return false;
    return true;
  };
  return {
    isValidWorker,
    isAvailWorker,
    isValidTarget,
    isReadyForHacking,
    isReadyForGrowing,
    isReadyForWeakening,
  };
};

// ServerDatas => single value
export const SERVER_REDUCERS = {
  getBestWorker: (serverDatas) => {
    if (serverDatas.length === 0) return false;
    return serverDatas.sort((svr1, svr2) => svr2.availRam - svr1.availRam)[0];
  },
};

const PROCESS_TYPES = {
  "/workers/grow.js": "grow",
  "/workers/weaken.js": "weaken",
  "/workers/hack.js": "hack",
};
export async function addKnownWorkerProcessesToServerDataMap(serverDataMap) {
  // console.log("aoshndfasihdashdohas")
  for (let serverData of Object.values(serverDataMap)) {
    // console.log(serverData.hostname)
    for (let process of serverData.processes) {
      // console.log('process', serverData.hostname, process.filename)
      // console.log(`"${process.filename}" ${Object.keys(PROCESS_TYPES)} ${process.filename in PROCESS_TYPES}`)
      if (Object.keys(PROCESS_TYPES).includes(process.filename)) {
        process.type = PROCESS_TYPES[process.filename];
        process.hostname = serverData.hostname;
        let targetHostname = process.args[0];
        process.startTime = process.args[1];
        process.duration = process.args[2];
        process.stopTime = process.startTime + process.duration;

        if (serverDataMap[targetHostname]["secLevelProcesses"] === undefined)
          serverDataMap[targetHostname]["secLevelProcesses"] = [];
        serverDataMap[targetHostname]["secLevelProcesses"].push(process);

        let processTypeKey = `${process.type}Processes`;
        if (serverDataMap[targetHostname][processTypeKey] === undefined)
          serverDataMap[targetHostname][processTypeKey] = [];
        serverDataMap[targetHostname][processTypeKey].push(process);

        // console.log(
        //   `added ${process.pid}:${process.filename}:${process.hostname}:${process.threads} to ${targetHostname}[${processTypeKey}]`
        // );
      }
    }
  }
  return serverDataMap;
}

const CONSERVE_HOME_RAM = 16;
export async function getAvailRam(ns, hostname) {
  let availRam = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname);
  if (hostname === "home") availRam = Math.max(0, availRam - CONSERVE_HOME_RAM);
  return availRam;
}

/** @param {import("./lib").NS} ns */
export async function calcMaxThreads(
  ns,
  hostname,
  script_name,
  availRam = undefined
) {
  if (availRam === undefined) availRam = await getAvailRam(ns, hostname);
  let threads = Math.floor(availRam / ns.getScriptRam(script_name));
  return threads;
}

/**
 *
 * @returns null if minRamReq cannot be met, otherwise closest to maxRamReqd
 */
export function getBestWorker(_workerDatas, maxRamReqd, minRamReqd = 0) {
  let retval;
  for (let workerData of _workerDatas) {
    // must have more or equal to requested RAM
    if (workerData.availRam >= maxRamReqd) {
      // default
      if (retval === undefined) retval = workerData;
      // prefer the worker with the smallest available RAM
      else if (retval.availRam > workerData.availRam) retval = workerData;
    }
  }
  // if no answer, give the one with the most RAM
  if (retval === undefined)
    retval = [..._workerDatas.sort((a, b) => b.availRam - a.availRam)][0];
  // if we can't match the minimum, return null
  if (retval.availRam < minRamReqd) return null;
  return retval;
}

const TIMING_BUFFER = 0;
export function getEffSecLevelAtTime(serverData, time) {
  let { securityLevel, minSecurityLevel } = serverData;

  let effSecLevelProcesses = (serverData["secLevelProcesses"] || []).sort(
    (a, b) => a.stopTime - b.stopTime
  );

  // what it will be after all known processes
  let effFinalSecLevel = securityLevel;
  // what it will be after processes that mattter
  let effSecLevel = securityLevel;

  let visualize = [`${time}:s[0]${effSecLevel.toFixed(2)}`];
  for (let proc of effSecLevelProcesses) {
    let change;
    if (proc.type === "grow") change = 0.004 * proc.threads;
    if (proc.type === "hack") change = 0.002 * proc.threads;
    if (proc.type === "weaken") change = -(0.05 * proc.threads);
    if (change) {
      effFinalSecLevel = Math.max(effSecLevel + change, minSecurityLevel);
      let shouldCount = proc.stopTime < time - TIMING_BUFFER;
      if (shouldCount) effSecLevel = effFinalSecLevel;
      let visual = `${shouldCount ? "" : "*"}${proc.type[0]}[${
        proc.threads
      }]${effFinalSecLevel.toFixed(2)}`;
      visualize.push(visual);
    }
  }
  // console.log(visualize.join('|'))

  return effSecLevel;
}

/** @remarks This only works if we only fully grow (money->maxMoney) and fully hack (maxMoney->0) */
export async function getEffAvailMoneyAtTime(serverData, time) {
  let { availMoney, maxMoney } = serverData;
  let effAvailMoney = availMoney;
  let availMoneyProcesses = [];
  for (let proc of serverData.growProcesses || [])
    availMoneyProcesses.push({ ...proc, type: "grow" });
  for (let proc of serverData.hackProcesses || [])
    availMoneyProcesses.push({ ...proc, type: "hack" });
  let effAvailMoneyProcesses = secLevelProcesses.filter(
    (proc) => proc.stopTime < time - TIMING_BUFFER
  );
  for (let proc of effAvailMoneyProcesses) {
    if (proc.type === 'grow') effAvailMoney = maxMoney
    if (proc.type === 'hack') effAvailMoney = 0
  }
  return effAvailMoney;
}

/** @param {import("./lib").NS} ns */
export async function deployScript(
  ns,
  hostname,
  script_name,
  _threads = 1,
  ..._args
) {
  let threads = _threads;
  if (_threads === -1) threads = calcMaxThreads(ns, hostname, script_name);
  await ns.scp(script_name, hostname);
  return await ns.exec(script_name, hostname, threads, ..._args);
}

export function getMaxHackThreadsNeeded(serverData) {
  return Math.ceil(serverData.hackAnalyzeThreadsAvailMoney);
}
export function calcHackTargetData(serverData, bestWorker) {
  let threadsNeeded = getMaxHackThreadsNeeded(serverData);
  let bestThreadsAvail = bestWorker.hackThreadsAvail;
  let canMax =
    serverData.availMoney === serverData.maxMoney &&
    threadsNeeded <= bestThreadsAvail;

  let moneyPerThread = serverData.hackAnalyze * serverData.availMoney;
  let bestMoneyTake = Math.min(
    serverData.availMoney,
    moneyPerThread * bestThreadsAvail
  );

  let hackChance = serverData.hackAnalyzeChance;
  let bestEV = bestMoneyTake * hackChance;
  let bestEVTime = bestEV / serverData.hackTime;

  return {
    serverData,
    bestWorker,
    threadsNeeded,
    bestThreadsAvail,
    canMax,
    moneyPerThread,
    bestMoneyTake,
    hackChance,
    bestEV,
    bestEVTime,
  };
}
export function getMaxGrowthThreadsNeeded(serverData) {
  return Math.ceil(serverData.growthThreadsNeeded);
}
export function calcGrowTargetData(serverData, bestWorker) {
  let threadsNeeded = getMaxGrowthThreadsNeeded(serverData);
  let bestThreadsAvail = bestWorker.growThreadsAvail;
  let canMax = bestWorker.growThreadsAvail >= threadsNeeded;

  let threadsRatio = Math.min(bestThreadsAvail, threadsNeeded) / threadsNeeded;
  let moneyGrown = serverData.maxMoney - serverData.availMoney;
  let estMoneyGrown = moneyGrown * threadsRatio;
  // estimate based on how many threads we can dedicate ... maybe useful for EV?
  let moneyGrownPerTime = estMoneyGrown / serverData.growTime;

  return {
    serverData,
    bestWorker,
    threadsNeeded,
    bestThreadsAvail,
    canMax,
    threadsRatio,
    moneyGrown,
    estMoneyGrown,
    moneyGrownPerTime,
  };
}
export function getMaxWeakenThreadsNeeded(serverData) {
  let effSecLevel = getEffSecLevelAtTime(
    serverData,
    +new Date() + serverData.weakenTime
  );
  let amtToReduce = effSecLevel - serverData.minSecurityLevel;
  let numThreadsNeeded = amtToReduce / 0.05;
  return Math.ceil(numThreadsNeeded);
}
export function calcWeakenTargetData(serverData, bestWorker) {
  let realAmtToReduce = serverData.securityLevel - serverData.minSecurityLevel;

  let effSecLevel = getEffSecLevelAtTime(
    serverData,
    +new Date() + serverData.weakenTime
  );
  let amtLeftToReduce = effSecLevel - serverData.minSecurityLevel;
  let numThreadsNeeded = Math.ceil(amtLeftToReduce / 0.05);
  let bestThreadsAvail = bestWorker.weakenThreadsAvail;
  let canMax = bestThreadsAvail >= numThreadsNeeded;

  // calculate remaining prep time if we do this (time to fully grow and hack)
  // must consider what we're adding now
  let prepTimeRemain = serverData.weakenTime;
  // if we can't max, assume we'll need to do it again in another round
  prepTimeRemain += canMax ? 0 : serverData.weakenTime;
  // if we need to grow, assume we'll need to grow and then do another weaken
  let willNeedGrow = serverData.availMoney !== serverData.maxMoney;
  prepTimeRemain += willNeedGrow
    ? serverData.growTime + serverData.weakenTime
    : 0;
  // add hack time
  prepTimeRemain += serverData.hackTime;
  // time remaining assuming we have enough threads to do all this in one round each + get max money
  let EVPrepTime = serverData.maxMoney / prepTimeRemain;

  return {
    serverData,
    bestWorker,
    securityLevel: serverData.securityLevel,
    minSecurityLevel: serverData.minSecurityLevel,
    realAmtToReduce,
    effSecLevel,
    amtLeftToReduce,
    numThreadsNeeded,
    bestThreadsAvail,
    canMax,
    prepTimeRemain,
    willNeedGrow,
    EVPrepTime,
  };
}

/** @param {import("./lib").NS} ns */
export function deployHackJS(
  ns,
  worker,
  target,
  threads = -1,
  start_time = undefined,
  expected_duration = undefined
) {
  const SCRIPT_NAME = "/workers/hack.js";
  const SCRIPT_TIME_LOOKUP_FUNC = ns.getHackTime;
  if (start_time === undefined) start_time = +new Date();
  if (expected_duration === undefined) SCRIPT_TIME_LOOKUP_FUNC(target);
  return deployScript(
    ns,
    worker,
    SCRIPT_NAME,
    threads,
    target,
    start_time,
    expected_duration
  );
}

/** @param {import("./lib").NS} ns */
export function deployGrowJS(
  ns,
  worker,
  target,
  threads = -1,
  start_time = undefined,
  expected_duration = undefined
) {
  const SCRIPT_NAME = "/workers/grow.js";
  const SCRIPT_TIME_LOOKUP_FUNC = ns.getGrowTime;
  if (start_time === undefined) start_time = +new Date();
  if (expected_duration === undefined) SCRIPT_TIME_LOOKUP_FUNC(target);
  return deployScript(
    ns,
    worker,
    SCRIPT_NAME,
    threads,
    target,
    start_time,
    expected_duration
  );
}

/** @param {import("./lib").NS} ns */
export function deployWeakenJS(
  ns,
  worker,
  target,
  threads = -1,
  start_time = undefined,
  expected_duration = undefined
) {
  const SCRIPT_NAME = "/workers/weaken.js";
  const SCRIPT_TIME_LOOKUP_FUNC = ns.getWeakenTime;
  if (start_time === undefined) start_time = +new Date();
  if (expected_duration === undefined) SCRIPT_TIME_LOOKUP_FUNC(target);
  return deployScript(
    ns,
    worker,
    SCRIPT_NAME,
    threads,
    target,
    start_time,
    expected_duration
  );
}

export function testFilters(ns, serverDataMap) {
  const sdFilters = getServerDataFilters(ns);

  let ascii_table_data = Object.values(serverDataMap).map((serverData) => {
    let {
      hostname,
      availMoney,
      maxMoney,
      securityLevel,
      minSecurityLevel,
      reqdHackingSkill,
    } = serverData;
    return {
      hostname,
      worker: sdFilters.isValidWorker(serverData),
      target: sdFilters.isValidTarget(serverData),
      reqdHackingSkill,
      readyForHacking: sdFilters.isReadyForHacking(serverData),
      readyForGrowing: sdFilters.isReadyForGrowing(serverData),
      availMoney,
      maxMoney,
      readyForWeakening: sdFilters.isReadyForWeakening(serverData),
      securityLevel,
      minSecurityLevel,
    };
  });
  ascii_table_data.sort((a, b) => a.hostname.localeCompare(b.hostname));

  let ascii_table = buildASCIITable(
    ascii_table_data,
    [
      "hostname",
      "worker",
      // "reqdHackingSkill",
      "target",
      "readyForHacking",
      "readyForGrowing",
      "availMoney",
      "maxMoney",
      "readyForWeakening",
      "securityLevel",
      "minSecurityLevel",
    ],
    [
      "hostname",
      "W",
      "T",
      "h",
      "g",
      "availMoney",
      "maxMoney",
      "w",
      "secLevel",
      "minSecLevel",
    ]
  );

  ns.tprint("\n", ascii_table);
}

export async function recommendAction(
  ns,
  action,
  workerHostname,
  threadsToUse,
  targetHostname,
  duration,
  canMax
) {
  let scriptName = `/workers/${action}.js`;
  ns.tprint(
    `recommend ${action} to ${workerHostname} [${threadsToUse}] -> ${targetHostname} (max: ${canMax})`
  );
  ns.tprint(
    `./lib/deployScript ${scriptName} ${workerHostname} ${threadsToUse} ${targetHostname} ${+new Date()} ${duration}`
  );
  // return await deployScript(ns, workerHostname, scriptName, threadsToUse, targetHostname, +(new Date()), duration)
}

/** @param {import("./lib").NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  const print_func = ns.print.bind(ns);
  let long_sleep = false;

  const TARGET_DB_FNAME = "/target.db.txt";
  let target_db = {};
  if (ns.fileExists(TARGET_DB_FNAME)) {
    console.log('reading target_db at', TARGET_DB_FNAME)
    let fdata = ns.read(TARGET_DB_FNAME);
    target_db = JSON.parse(fdata);
  }

  while (true) {
    long_sleep = false;

    await (async () => {
      await ns.sleep(long_sleep ? 2000 : 300);
      print_func(new Date().toString().split(" ")[4]);
      // console.log(
      //   `------------------------ running master.js (${
      //     new Date().toString().split(" ")[4]
      //   }) ------------------------`
      // );
      const sdFilters = getServerDataFilters(ns);

      // get action ram reqs

      // get all hosts
      let serverDataMap = await scanAnalyze(ns);

      // scrape existing process data and add to each target for analysis
      serverDataMap = await addKnownWorkerProcessesToServerDataMap(
        serverDataMap
      );

      // testFilters(ns, serverDataMap);

      let workerServerDatas = Object.values(serverDataMap).filter(
        sdFilters.isAvailWorker
      );
      if (workerServerDatas.length === 0) {
        ns.tprint("no available workers!");
        return false;
      }

      // add threads available for each action
      let hackRamReq = ns.getScriptRam("/workers/hack.js");
      // ns.tprint("hackRamReq ", hackRamReq);
      let weakenRamReq = ns.getScriptRam("/workers/weaken.js");
      // ns.tprint("weakenRamReq ", weakenRamReq);
      let growRamReq = ns.getScriptRam("/workers/grow.js");
      // ns.tprint("growRamReq ", growRamReq);
      for (let serverData of workerServerDatas) {
        serverData.hackThreadsAvail = Math.floor(
          serverData.availRam / hackRamReq
        );
        serverData.weakenThreadsAvail = Math.floor(
          serverData.availRam / weakenRamReq
        );
        serverData.growThreadsAvail = Math.floor(
          serverData.availRam / growRamReq
        );
      }

      let bestWorker = workerServerDatas.sort(
        (a, b) => b.availRam - a.availRam
      )[0];
      // console.log("bestworker1", bestWorker);
      // ns.tprint('best worker:')
      // ns.tprint(JSON.stringify(bestWorker, null, 2))

      // prefer lowest RAM first when iterating for proper worker
      workerServerDatas = workerServerDatas.sort(
        (a, b) => a.availRam - b.availRam
      );

      let targetServerDatas = Object.values(serverDataMap).filter(
        sdFilters.isValidTarget
      );

      // check for DB changes
      let didChangeDB = false;
      const KEYS_TO_WATCH_FOR_HACKING = [
        "growTime",
        "hackTime",
        "weakenTime",
        "hackAnalyzeThreadsAvailMoney",
      ];
      const KEYS_TO_WATCH_FOR_GROWING = [
        "growTime",
        "hackTime",
        "weakenTime",
        "growthThreadsNeeded",
      ];

      for (let serverData of targetServerDatas) {
        let {
          minSecurityLevel,
          securityLevel,
          availMoney,
          maxMoney,
          hostname,
        } = serverData;
        if (minSecurityLevel === securityLevel) {
          if (availMoney === maxMoney) {
            // check for hack values
            let didValuesChange = false;
            if (target_db["hack"] === undefined) target_db["hack"] = {};
            if (target_db["hack"][hostname] === undefined)
              didValuesChange = 'new';
            else {
              for (let key of KEYS_TO_WATCH_FOR_HACKING) {
                let old_val = target_db["hack"][hostname][key];
                let new_val = serverData[key];
                if (old_val !== new_val) {
                  didValuesChange = key;
                  break;
                }
              }
            }
            if (didValuesChange) {
              console.log("db changed for hack", hostname, "!", didValuesChange);
              target_db["hack"][hostname] = {
                ...serverData,
                lastUpdated: +new Date(),
              };
              didChangeDB = true;
            }
          } else {
            // check for grow values
            let didValuesChange = false;
            if (target_db["grow"] === undefined) target_db["grow"] = {};
            if (target_db["grow"][hostname] === undefined)
              didValuesChange = 'new';
            else {
              for (let key of KEYS_TO_WATCH_FOR_GROWING) {
                let old_val = target_db["grow"][hostname][key];
                let new_val = serverData[key];
                if (old_val !== new_val) {
                  didValuesChange = key;
                  break;
                }
              }
            }
            if (didValuesChange) {
              console.log("db changed for grow", hostname, "!", didValuesChange);
              target_db["grow"][hostname] = {
                ...serverData,
                lastUpdated: +new Date(),
              };
              didChangeDB = true;
            }
          }
        }
      }
      if (didChangeDB) {
        console.log("db changed!");
        ns.write(TARGET_DB_FNAME, JSON.stringify(target_db, null, 2), "w");
      }

      if (ns.args.length)
        targetServerDatas = targetServerDatas.filter(
          (serverData) => serverData.hostname === ns.args[0]
        );
      if (targetServerDatas.length === 0) {
        print_func("no available targets!");
        long_sleep = true;
        return false;
      }

      // ------------ HACKING ------------
      let hackingTargetServerDatas = targetServerDatas.filter(
        sdFilters.isReadyForHacking
      );

      if (hackingTargetServerDatas.length === 0) {
        print_func("no available targets for hacking!");
      } else if (bestWorker.hackThreadsAvail === 0) {
        print_func("no available workers for hacking!");
      } else {
        let targetDatas = hackingTargetServerDatas.map((serverData) =>
          calcHackTargetData(serverData, bestWorker)
        );

        // sort by best expected value per time spent
        targetDatas = targetDatas.sort((a, b) => b.bestEVTime - a.bestEVTime);
        let bestTarget = targetDatas[0];

        let bestHackWorker = getBestWorker(
          workerServerDatas,
          Math.ceil(bestTarget.threadsNeeded) * hackRamReq,
          hackRamReq
        );

        let threadsToUse = Math.ceil(
          Math.min(bestTarget.threadsNeeded, bestHackWorker.hackThreadsAvail)
        );
        let willMax = threadsToUse >= bestTarget.threadsNeeded;
        let targetHostname = bestTarget.serverData.hostname;
        let workerHostname = bestHackWorker.hostname;
        let now = +new Date();
        let duration = bestTarget.serverData.hackTime;
        print_func(
          `recommend deploying hack to ${workerHostname} [${threadsToUse} of ${
            bestHackWorker.hackThreadsAvail
          }] -> ${targetHostname} (max: ${willMax}, chance: ${(
            bestTarget.hackChance * 100
          ).toFixed(2)}%)`
        );

        let availMoney = bestTarget.serverData.availMoney;
        let maxMoney = bestTarget.serverData.maxMoney;
        let moneyExpected = Math.min(
          availMoney,
          bestTarget.moneyPerThread * threadsToUse
        );
        let diagString = "";
        diagString += `should get ${moneyExpected.toLocaleString()} of `;
        diagString += `${availMoney.toLocaleString()}/${maxMoney.toLocaleString()}`;
        diagString += ` (${(bestTarget.hackChance * 100).toFixed(2)}% => ${(
          moneyExpected * bestTarget.hackChance
        ).toLocaleString()})`;
        print_func(diagString);

        print_func(
          `./lib/deployScript.js /workers/hack.js ${workerHostname} ${threadsToUse} ${targetHostname} ${now} ${duration}`
        );
        await deployHackJS(
          ns,
          workerHostname,
          targetHostname,
          threadsToUse,
          now,
          duration
        );
        return;
      }

      // ------------ GROWING ------------
      let growTargetServerDatas = targetServerDatas.filter(
        sdFilters.isReadyForGrowing
      );
      if (growTargetServerDatas.length === 0) {
        print_func("no available targets for growing!");
      } else if (bestWorker.growThreadsAvail === 0) {
        print_func("no available workers for growing!");
      } else {
        print_func(
          growTargetServerDatas.length,
          " servers eligible for growing"
        );
        let targetDatas = growTargetServerDatas.map((serverData) =>
          calcGrowTargetData(serverData, bestWorker)
        );

        // prefer targets with best effective grow money per time (move to top)
        targetDatas = targetDatas.sort(
          (a, b) => b.moneyGrownPerTime - a.moneyGrownPerTime
        );
        // prefer grow targets when we can maximize
        targetDatas = targetDatas.sort((a, b) => b.canMax - a.canMax);
        let bestGrowTarget = targetDatas[0];

        // default is to use the best worker unless we can find something smaller that will do the job
        let maxReqRam = Math.ceil(bestGrowTarget.threadsNeeded) * growRamReq;
        let bestGrowWorker = getBestWorker(
          workerServerDatas,
          maxReqRam,
          growRamReq
        );

        let threadsToUse = Math.ceil(
          Math.min(
            bestGrowTarget.threadsNeeded,
            bestGrowWorker.growThreadsAvail
          )
        );
        let willMax = threadsToUse >= bestGrowTarget.threadsNeeded;
        let targetHostname = bestGrowTarget.serverData.hostname;
        let workerHostname = bestGrowWorker.hostname;
        let duration = bestGrowTarget.serverData.growTime;
        print_func(
          `recommend deploying grow to ${workerHostname} [${threadsToUse} of ${bestGrowWorker.growThreadsAvail}] -> ${targetHostname} (max: ${willMax})`
        );

        let availMoney = bestGrowTarget.serverData.availMoney;
        let estGrown = bestGrowTarget.estMoneyGrown;
        let estAvail = availMoney + estGrown;
        let maxMoney = bestGrowTarget.serverData.maxMoney;

        print_func(
          `grows ${availMoney.toLocaleString()} by ${estGrown.toLocaleString()} to ${estAvail.toLocaleString()} of ${maxMoney.toLocaleString()}`
        );

        print_func(
          `./lib/deployScript.js /workers/grow.js ${workerHostname} ${threadsToUse} ${targetHostname} ${+new Date()} ${duration}`
        );
        await deployGrowJS(
          ns,
          workerHostname,
          targetHostname,
          threadsToUse,
          +new Date(),
          duration
        );
        return;
      }

      let weakeningTargetServerDatas = targetServerDatas.filter(
        sdFilters.isReadyForWeakening
      );
      if (weakeningTargetServerDatas.length === 0) {
        print_func("no available targets for weakening!");
      } else if (bestWorker.weakenThreadsAvail === 0) {
        print_func("no available workers for weakening!");
      } else {
        print_func(
          weakeningTargetServerDatas.length,
          " servers eligible for weakening"
        );
        let targetDatas = weakeningTargetServerDatas.map((serverData) =>
          calcWeakenTargetData(serverData, bestWorker)
        );

        // prefer the best EV
        targetDatas = targetDatas.sort((a, b) => b.EVPrepTime - a.EVPrepTime);
        // prefer what will not need a grow
        targetDatas = targetDatas.sort(
          (a, b) => a.willNeedGrow - b.willNeedGrow
        );
        // prefer what we can max out
        targetDatas = targetDatas.sort((a, b) => b.canMax - a.canMax);

        let bestWeakenTarget = targetDatas[0];

        let maxReqRam =
          Math.ceil(bestWeakenTarget.numThreadsNeeded) * weakenRamReq;
        let bestWeakenWorker = getBestWorker(
          workerServerDatas,
          maxReqRam,
          weakenRamReq
        );

        let threadsToUse = Math.ceil(
          Math.min(
            bestWeakenTarget.numThreadsNeeded,
            bestWeakenWorker.weakenThreadsAvail
          )
        );

        print_func(
          "\n" +
            [
              ["securityLevel", bestWeakenTarget.securityLevel],
              ["minSecurityLevel", bestWeakenTarget.minSecurityLevel],
              ["realAmtToReduce", bestWeakenTarget.realAmtToReduce],
              ["effSecLevel", bestWeakenTarget.effSecLevel],
              ["amtLeftToReduce", bestWeakenTarget.amtLeftToReduce],
              ["numThreadsNeeded", bestWeakenTarget.numThreadsNeeded],
            ]
              .map((r) => r.join(" "))
              .join("\n")
        );

        let willMax = threadsToUse >= bestWeakenTarget.numThreadsNeeded;
        let workerHostname = bestWeakenWorker.hostname;
        let targetHostname = bestWeakenTarget.serverData.hostname;
        let duration = bestWeakenTarget.serverData.weakenTime;
        print_func(
          `recommend deploying weak to ${workerHostname} [${threadsToUse} of ${bestWeakenWorker.weakenThreadsAvail}] -> ${targetHostname} (max: ${willMax})`
        );
        print_func(
          `./lib/deployScript.js /workers/weaken.js ${workerHostname} ${threadsToUse} ${targetHostname} ${+new Date()} ${duration}`
        );
        await deployWeakenJS(
          ns,
          workerHostname,
          targetHostname,
          threadsToUse,
          +new Date(),
          duration
        );
        return;
      }
      print_func("reached end, long sleep?");
      let remainingHackThreads = workerServerDatas.reduce(
        (pv, cv) => pv + cv.hackThreadsAvail,
        0
      );
      let remainingGrowThreads = workerServerDatas.reduce(
        (pv, cv) => pv + cv.growThreadsAvail,
        0
      );
      let remainingWeakenThreads = workerServerDatas.reduce(
        (pv, cv) => pv + cv.weakenThreadsAvail,
        0
      );
      print_func(
        "remaining available threads [H/G/W] ",
        [
          remainingHackThreads,
          remainingGrowThreads,
          remainingWeakenThreads,
        ].join("/")
      );
      long_sleep = true;
    })();
  }
}
