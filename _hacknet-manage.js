// Automatically manage hacknet nodes

export async function main(ns) {
  const params = ns.flags([
    ['keep', 0], // Percent of current money to keep from spending
    ['verbose', true] // Toggle verbose output
  ]);

  // Disable logging for certain functions
  // https://bitburner.readthedocs.io/en/latest/netscript/basicfunctions/disableLog.html
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  ns.disableLog('getServerMoneyAvailable');

  // Open log window
  ns.tail();

  // ----------------------------------------
  // Generic functions
  // ----------------------------------------

  function leftPad(value, padding = '00') {
    // https://stackoverflow.com/questions/13859538/simplest-inline-method-to-left-pad-a-string
    // Length of 'padding' is used as the desired length of the output string
    // For padded value '0023' from input value '23' use padding '0000'
    return value.toString().length < padding.length ? (padding + value.toString()).slice(-padding.length) : value;
  }

  function getTimeString(date) {
    if (typeof date === 'undefined') date = new Date();
    if (!date instanceof Date) date = new Date();
    return leftPad(date.getHours()) + ':' + leftPad(date.getMinutes()) + ':' + leftPad(date.getSeconds());
  }

  // ----------------------------------------
  // NetScript-specific functions
  // ----------------------------------------

  function out(str) {
    ns.print('[' + getTimeString() + '] ' + str);
  }

  function outInfo(str) {
    ns.print('INFO [' + getTimeString() + '] ' + str);
  }

  function outWarn(str) {
    ns.print('WARN [' + getTimeString() + '] ' + str);
  }

  function formatNum(n) {
    return ns.nFormat(n, '0,0.00');
  }

  function formatMoney(n) {
    return ns.nFormat(n, '$0.000a');
  }

  // ----------------------------------------

  const hn = ns.hacknet;

  async function buyNode() {
    outInfo('Purchase hacknet-node-' + hn.numNodes() + ' (' + formatMoney(hn.getPurchaseNodeCost()) + ')');
    return hn.purchaseNode();
  }

  async function buyCore(node) {
    outInfo('Upgrade CORE on hacknet-node-' + node + ' (' + formatMoney(hn.getCoreUpgradeCost(node)) + ')');
    return hn.upgradeCore(node);
  }

  async function buyRam(node) {
    outInfo('Upgrade RAM on hacknet-node-' + node + ' (' + formatMoney(hn.getRamUpgradeCost(node)) + ')');
    return hn.upgradeRam(node);
  }

  async function buyLevel(node) {
    outInfo('Upgrade LEVEL on hacknet-node-' + node + ' (' + formatMoney(hn.getLevelUpgradeCost(node)) + ')');
    return hn.upgradeLevel(node);
  }

  // ----------------------------------------

  let keepMoney = 0;
  if (params.keep > 0) {
    keepMoney = ns.getServerMoneyAvailable('home') * (params.keep / 100);
    outWarn('Will keep money from dropping below ' + formatMoney(keepMoney));
  }

  while (true) {
    if (hn.numNodes() === 0) {
      // If we don't have any nodes at all, save enough money and buy one
      out('No nodes owned, purchasing first one..');
      while (ns.getServerMoneyAvailable('home') < hn.getPurchaseNodeCost()) {
        let sleepTime = 10000;
        let needMoney = hn.getPurchaseNodeCost() - (ns.getServerMoneyAvailable('home') - keepMoney);
        if (params.verbose) out("Can't afford node (missing " + formatMoney(needMoney) + '). Waiting ' + ns.tFormat(sleepTime));
        await ns.sleep(sleepTime);
      }
      await buyNode();
      await ns.sleep(100);
      continue; // Iterate loop just in case purchase failed
    }

    let cheapestCost = hn.getPurchaseNodeCost(); // Default to node cost
    let cheapestNode = null;
    let cheapestOperation = 'node';

    // Check all operations on all nodes to find the cheapest
    for (let i = 0; i < hn.numNodes(); i++) {
      let coreCost = hn.getCoreUpgradeCost(i);
      if (coreCost < cheapestCost) {
        cheapestCost = coreCost;
        cheapestNode = i;
        cheapestOperation = 'core';
      }

      let ramCost = hn.getRamUpgradeCost(i);
      if (ramCost < cheapestCost) {
        cheapestCost = ramCost;
        cheapestNode = i;
        cheapestOperation = 'ram';
      }

      let levelCost = hn.getLevelUpgradeCost(i);
      if (levelCost < cheapestCost) {
        cheapestCost = levelCost;
        cheapestNode = i;
        cheapestOperation = 'level';
      }
    }

    if (params.verbose) out(ns.sprintf('Cheapest operation is %s for hacknet-node-%s (%s)',
      cheapestOperation.toUpperCase(),
      cheapestNode,
      formatMoney(cheapestCost)
    ));

    // Wait for enough money for whichever operation turned out to be the cheapest
    while (ns.getServerMoneyAvailable('home') - keepMoney < cheapestCost) {
      let sleepTime = 10000;
      let needMoney = cheapestCost - (ns.getServerMoneyAvailable('home') - keepMoney);
      if (params.verbose) out("Can't afford operation (missing " + formatMoney(needMoney) + '). Waiting ' + ns.tFormat(sleepTime));
      await ns.sleep(sleepTime);
    }

    switch (cheapestOperation) {
      case 'core':
        await buyCore(cheapestNode);
        break;
      case 'ram':
        await buyRam(cheapestNode);
        break;
      case 'level':
        await buyLevel(cheapestNode);
        break;
      default:
        await buyNode();
    }

    await ns.sleep(100);
  }
}
