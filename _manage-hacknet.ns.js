// Manage the hacknet
// Used sources:
// https://github.com/Nolshine/bitburner-scripts/blob/master/hacknet.ns.js

export async function main(ns) {
    let hn = ns.hacknet;

    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");

    while (true) {
        // if we have no hacknet nodes, buy one when possible.
        if (hn.numNodes() === 0) {
            while (ns.getServerMoneyAvailable("home") < hn.getPurchaseNodeCost()) {
                await ns.sleep(5000);
            }
            ns.print("<font color=cyan>Purchase first Node!</font>");
            hn.purchaseNode();
        } else {
            let nextIteration = false;
            // otherwise, check if it's cheaper to upgrade existing nodes, or buy new one.
            let buyCost = hn.getPurchaseNodeCost();
            for (let i = 0; i < hn.numNodes(); i++) {
                let stats = hn.getNodeStats(i);
                if (stats.cores < 16) {
                    let coreCost = hn.getCoreUpgradeCost(i);
                    if (coreCost < buyCost) {
                        // upgrading a core is cheaper than buying a node, upgrade immediately.
                        while (ns.getServerMoneyAvailable("home") < coreCost) {
                            await ns.sleep(5000);
                        }
                        ns.print("<font color=cyan>Upgrade Core for node " + i + "</font>");
                        hn.upgradeCore(i);
                        nextIteration = true;
                        break;
                    }
                }
                if (stats.ram < 64) {
                    let ramCost = hn.getRamUpgradeCost(i);
                    if (ramCost < buyCost) {
                        while (ns.getServerMoneyAvailable("home") < ramCost) {
                            await ns.sleep(5000);
                        }
                        ns.print("<font color=cyan>Upgrade RAM for node " + i + "</font>");
                        hn.upgradeRam(i);
                        nextIteration = true;
                        break;
                    }
                }
                if (stats.level < 200) {
                    let levelCost = hn.getLevelUpgradeCost(i);
                    if (levelCost < buyCost) {
                        while (ns.getServerMoneyAvailable("home") < levelCost) {
                            await ns.sleep(5000);
                        }
                        ns.print("<font color=cyan>Upgrade Level of node " + i + "</font>");
                        hn.upgradeLevel(i);
                        nextIteration = true;
                        break;
                    }
                }
            }
            if (!nextIteration) {
                // couldn't find a cheaper cost than buying, so we buy a new node when possible
                while (ns.getServerMoneyAvailable("home") < buyCost) {
                    await ns.sleep(5000);
                }
                ns.print("<font color=cyan>Purchase Node " + hn.numNodes() + "</font>");
                hn.purchaseNode();
            }
        }
    }
}
