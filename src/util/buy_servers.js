import { awaitMs } from "utils"

const HOSTNAMES = ["action","enid","marion","sawtooth","alturas","erie","meade","seeley","bantam","fairfax","merritt","seminole","baron","fallriver","michigan","sevuer","beaver","fenton","minnetonkas","shasta","beshear","geneva","mono","sinclair","bluestone","george","navajo","spirit","bluewater","greenbo","okeechobee","storm","burke","greers","ontario","stump","caddo","greeson","ozarks","summer","candlewood","gull","patoka","sunapee","cedar","harding","peck","superior","champlain","harris","perry","sutton","claytor","hartwell","placid","tahoe","como","hauser","pleasant","texoma","cowan","heron","pontchartrain","travis","crater","higgins","powell","trinity","crescent","holt","pyramid","tule","crystal","horsehead","redfish","tupper","cumberland","houghton","rend","tygart","cypress","huron","rico","ute","degray","isabella","rush","verret","delta","kickapoo","sabbatia","walker","donner","kissimmee","sabine","walloon","eagle","leech","sakakawea","wheeler","elk","liberty","salton","wilson","elwell","locust","sardis","zoar","emporia","lurleen","saugatuck"]

const canBuyServer = ns => {
    let purchased_servers = ns.getPurchasedServers()
    let limit = ns.getPurchasedServerLimit()
    return Math.max(0, limit - purchased_servers.length)
}

/** @param {import("../lib").NS} ns */
export async function main(ns) {
    let amtToSave = 0
    if (ns.args.length) ns.args[0] = amtToSave

    for (let i of [0,1,2,3,4,5,6,7,8,9,10,11,12]) {
        let ram = 2**i
        ns.tprint(ram.toString().padEnd('8'), ns.getPurchasedServerCost(ram).toLocaleString().padStart(11))
    }

    while (true) {
        let cost = ns.getPurchasedServerCost(2)
        let money = Math.max(0,ns.getServerMoneyAvailable('home') - amtToSave)
        if (money <= cost) {
            ns.tprint("can't afford any more servers")
            break
        }
        let remaining_to_buy = canBuyServer(ns)
        if (remaining_to_buy <= 0) {
            ns.tprint("not allowed to buy more servers");
            break
        }
        await awaitMs(200)
    }
}