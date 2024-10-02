// Manage the hacknet

// Referenced or copied sources:
// https://github.com/Nolshine/bitburner-scripts/blob/master/hacknet.ns.js

// cspell:ignore cheapestOper

export async function main(ns) {
  let hn = ns.hacknet;

  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("sleep");

  while (true) {
    // If we have no hacknet nodes at all, wait until enough money to buy one
    if (hn.numNodes() === 0) {
      while (ns.getServerMoneyAvailable("home") < hn.getPurchaseNodeCost()) {
        await ns.sleep(5000);
      }
      ns.print("INFO: Purchase FIRST node!");
      hn.purchaseNode();
      continue; // Iterate loop just in case purchase failed
    }

    let cheapestCost = hn.getPurchaseNodeCost(); // Default to node cost
    let cheapestNode = null;
    let cheapestOper = null;

    // Check all operations on all nodes to find the cheapest
    for (let i = 0; i < hn.numNodes(); i++) {
      let coreCost = hn.getCoreUpgradeCost(i);
      if (coreCost < cheapestCost) {
        cheapestCost = coreCost;
        cheapestNode = i;
        cheapestOper = "core";
      }

      let ramCost = hn.getRamUpgradeCost(i);
      if (ramCost < cheapestCost) {
        cheapestCost = ramCost;
        cheapestNode = i;
        cheapestOper = "ram";
      }

      let levelCost = hn.getLevelUpgradeCost(i);
      if (levelCost < cheapestCost) {
        cheapestCost = levelCost;
        cheapestNode = i;
        cheapestOper = "level";
      }
    }

    // Wait for enough money for whichever operation turned out to be the cheapest
    while (ns.getServerMoneyAvailable("home") < cheapestCost) {
      await ns.sleep(5000);
    }

    if (cheapestNode === null || cheapestOper === null) {
      // No operation was found to be cheaper, buy new node instead
      ns.print("INFO: Purchase hacknet-node-" + hn.numNodes());
      hn.purchaseNode();
    } else {
      // Buy the cheapest upgrade
      ns.print("INFO: Upgrade " + cheapestOper.toUpperCase() + " on hacknet-node-" + cheapestNode);
      if (cheapestOper == "core") hn.upgradeCore(cheapestNode);
      else if (cheapestOper == "ram") hn.upgradeRam(cheapestNode);
      else if (cheapestOper == "level") hn.upgradeLevel(cheapestNode);
    }

    await ns.sleep(500); // Sleep before next iteration
  }
}
