const MAX_SPEND_PCT = .01

/** @param {import("../lib").NS} ns */
export async function main(ns) {
    let {hacknet} = ns
    let runs = 0
    while (true) {
        let cheapestUpgrade

        let purchaseCost = hacknet.getPurchaseNodeCost()
        let numNodes = hacknet.numNodes()
        let maxNodes = hacknet.maxNumNodes()
        let nodesLeftToPurchase = Math.max(maxNodes - numNodes, 0)
        if (nodesLeftToPurchase) cheapestUpgrade = {type: 'purchase', cost: purchaseCost}
        
        for (let i = 0; i < numNodes; i++) {
            let cacheUpgrade = hacknet.getCacheUpgradeCost(i, 1)
            let levelUpgrade = hacknet.getLevelUpgradeCost(i, 1)
            let ramUpgrade = hacknet.getRamUpgradeCost(i, 1)

            let cost = Math.min(cacheUpgrade, levelUpgrade, ramUpgrade)
            if (cheapestUpgrade === undefined || cheapestUpgrade.cost > cost) {
                cheapestUpgrade.cost = cost
                cheapestUpgrade.i = i
                if (cost === cacheUpgrade) cheapestUpgrade.type = 'cache'
                if (cost === levelUpgrade) cheapestUpgrade.type = 'level'
                if (cost === ramUpgrade) cheapestUpgrade.type = 'ram'
            }
        }

        console.log(cheapestUpgrade)
        ns.print(cheapestUpgrade)
        let availToSpend = Math.floor(ns.getServerMoneyAvailable('home') * MAX_SPEND_PCT)
        if (availToSpend > cheapestUpgrade.cost) {
            let {type} = cheapestUpgrade
            if (type === 'purchase') hacknet.purchaseNode()
            else {
                let {i} = cheapestUpgrade
                if (type === 'cache') hacknet.upgradeCache(i, 1)
                if (type === 'level') hacknet.upgradeLevel(i, 1)
                if (type === 'ram') hacknet.upgradeRam(i, 1)
            }
        } 
        else {
            ns.print('cant afford', availToSpend)
            await ns.sleep(2000)
            // break
        }
        await ns.sleep(100)
    }
}