// Monitor money change over time

let intervalSeconds = 10;
let debug = false;

export async function main(ns) {
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

  function getOutputTimeStamp() {
    return `\x1b[1;30m[${getTimeString()}]\x1b[m `
  }

  // ----------------------------------------
  // NetScript-specific functions
  // ----------------------------------------

  function fNum(num) {
    return ns.formatNumber(num);
  }

  // ----------------------------------------

  let moneyPreviously = ns.getServerMoneyAvailable("home");
  let moneyCurrently = 0;
  let moneyPerSecond = 0;

  let moneyPerSecondHistory = [];

  // Wait before starting to avoid moneyPerSecond = 0 for first iteration
  ns.print('\x1b[1;30mGathering initial data, please wait..\x1b[m');
  await ns.sleep(intervalSeconds * 1000);

  // @ignore-infinite
  while (true) {
    moneyCurrently = ns.getServerMoneyAvailable('home');
    moneyPerSecond = (moneyCurrently - moneyPreviously) / intervalSeconds;
    moneyPerSecondHistory.push(moneyPerSecond);

    // Remove oldest value if too many stored
    if (moneyPerSecondHistory.length > 6) {
      moneyPerSecondHistory.shift();
    }

    if (debug) ns.print(moneyPerSecondHistory.join(', '));

    // Calculate the average
    let moneyPerSecondAverage = moneyPerSecondHistory.reduce((sum, value) => sum + value, 0) / moneyPerSecondHistory.length;
    
    let moneyEstimate1h = moneyCurrently + (moneyPerSecondAverage * 60 * 60 * 1);
    let moneyEstimate6h = moneyCurrently + (moneyPerSecondAverage * 60 * 60 * 6);

    let outputArray = [];
    outputArray.push(`Money: ${fNum(moneyCurrently)}`);
    outputArray.push(`Gain: ${fNum(moneyPerSecondAverage)}/sec`);
    outputArray.push(`Forecast (1h): ${fNum(moneyEstimate1h)}`);
    outputArray.push(`Forecast (6h): ${fNum(moneyEstimate6h)}`);
    ns.print(getOutputTimeStamp() + outputArray.join(' \x1b[0;30m●\x1b[m '));

    moneyPreviously = moneyCurrently;
    await ns.sleep(intervalSeconds * 1000);
  }
}
