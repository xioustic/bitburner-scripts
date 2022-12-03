const HOSTNAMES = [
    "action","enid","marion","sawtooth","alturas","erie","meade","seeley",
    "bantam","fairfax","merritt","seminole","baron","fallriver","michigan",
    "sevuer","beaver","fenton","minnetonkas","shasta","beshear","geneva",
    "mono","sinclair","bluestone","george","navajo","spirit","bluewater",
    "greenbo","okeechobee","storm","burke","greers","ontario","stump","caddo",
    "greeson","ozarks","summer","candlewood","gull","patoka","sunapee","cedar",
    "harding","peck","superior","champlain","harris","perry","sutton","claytor",
    "hartwell","placid","tahoe","como","hauser","pleasant","texoma","cowan","heron",
    "pontchartrain","travis","crater","higgins","powell","trinity","crescent","holt",
    "pyramid","tule","crystal","horsehead","redfish","tupper","cumberland","houghton",
    "rend","tygart","cypress","huron","rico","ute","degray","isabella","rush","verret",
    "delta","kickapoo","sabbatia","walker","donner","kissimmee","sabine","walloon","eagle",
    "leech","sakakawea","wheeler","elk","liberty","salton","wilson","elwell","locust","sardis",
    "zoar","emporia","lurleen","saugatuck"
]
const MIN_RAM = 2

let ns
/** @param {import("../lib").NS} _ns */
export async function main(_ns) {
    ns = _ns
    let runs = 0
    while (true) {
        runs += 1
        console.log(runs)
        let amtToSave = 0
        if (ns.args) amtToSave = ns.args[0]

        let purchased_servers = ns.getPurchasedServers()
        let servers = purchased_servers.map(hostname => ({hostname, ram: ns.getServerMaxRam(hostname)}))
        console.log('purchased:', purchased_servers)
        
        servers.sort((a, b) => b.ram - a.ram)
        //servers.reverse() // reverse this sort if you want to upgrade all evenly (horizontal scaling)

        console.log(servers)
        let playerMoney = ns.getServerMoneyAvailable('home')

        let didUpgrade = false
        for (let {hostname, ram} of servers) {
            // console.log('check upgrade of', hostname, ram)
            let upgradeCost = ns.getPurchasedServerUpgradeCost(hostname, ram*2)
            let canUpgrade = upgradeCost <= playerMoney
            // console.log('upgrade of', hostname, ram, ram*2, upgradeCost, canUpgrade)
            if (canUpgrade) {
                // console.log('want to upgrade', hostname, ram, ram*2)
                ns.upgradePurchasedServer(hostname, ram*2)
                didUpgrade = true
                break
            }
        }
        if (didUpgrade) continue

        let haveMaxServers = ns.getPurchasedServerLimit() - purchased_servers.length <= 0
        let canAffordNewServer = ns.getPurchasedServerCost(MIN_RAM) <= playerMoney
        if (canAffordNewServer) {
            if (!haveMaxServers) {
                let hostname = HOSTNAMES[servers.length]
                // console.log('want to buy', hostname, MIN_RAM)
                ns.purchaseServer(hostname, MIN_RAM)
                continue
            }
        }
        break
    }
    ns.tprint('')
}