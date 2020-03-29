// Farming script which manages money, security and RAM usage

// Referenced or copied sources:
// https://github.com/blankcode/Bitburner-scripts/blob/master/replicator_fork/milk.script

disableLog("sleep");
disableLog("getServerMoneyAvailable");
disableLog("getServerSecurityLevel");

var host = getHostname();

// If available, get target from file. Otherwise default to self
var target = read("_target.txt");
if (!target) target = host;
else tprint("<font color=cyan> NOTIFY:</font> [" + host + "]: Specific target set: " + target);

// Avoid targeting some servers
if (target == "home") {
    tprint("<font color=red>FAILURE:</font> Avoiding targeting host: " + target + ". Exiting..");
    exit();
}

var pathWeak = "_weak.script";
var pathGrow = "_grow.script";
var pathHack = "_hack.script";

var moneyNow;
var moneyMax = getServerMaxMoney(target);
var moneyThreshold = (moneyMax * 0.9); // Do not drain money lower than this threshold before running grow()

// If the server cannot have any money we have nothing to do here
if (moneyMax < 1) {
    tprint("<font color=red>FAILURE:</font> [" + host + "]: getServerMaxMoney(" + target + ") returned 0. Exiting..");
    exit();
}

var securityNow;
var securityMin = getServerMinSecurityLevel(target);
var securityThreshold = (securityMin * 1.15); // Do not lower security unless it is lowe than this threshold

var ram = getServerRam(host);
var ramFree = ram[0] - ram[1];

var ramNeedWeak = getScriptRam(pathWeak);
var ramNeedGrow = getScriptRam(pathGrow);
var ramNeedHack = getScriptRam(pathHack);

if (ramNeedWeak == 0 || ramNeedGrow == 0 || ramNeedHack == 0) {
    tprint("<font color=red>FAILURE:</font> [" + host + "]: getScriptRam() 0. Exiting..");
    exit();
}

var threadCountWeak = Math.floor(ramFree / ramNeedWeak);
var threadCountGrow = Math.floor(ramFree / ramNeedGrow);
var threadCountHack = Math.floor(ramFree / ramNeedHack);

if (threadCountWeak == 0 || threadCountGrow == 0 || threadCountHack == 0) {
    tprint("<font color=red>FAILURE:</font> [" + host + "]: Thread count for a script returned 0. Exiting..");
    exit();
}

function formatNum(x) {
    return x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

while (true) {
    moneyNow = getServerMoneyAvailable(target);
    securityNow = getServerSecurityLevel(target);

    if (securityNow > securityThreshold) { // If security over threshold
        print("<font color=cyan>Weakening security while " + formatNum(securityNow) + " > " + formatNum(securityMin) + "</font>");
        while (getServerSecurityLevel(target) > securityMin) { // Weaken it to minimum level
            exec(pathWeak, host, threadCountWeak, target);
            sleep(Math.ceil(getWeakenTime(target) * 1000) + 1000); // Sleep 1 extra sec to be safe
        }
    } else if (moneyNow < moneyMax) { // If money is not maxed, grow it until max
        print("<font color=cyan>Growing money while " + formatNum(moneyNow) + " < " + formatNum(moneyMax) + "</font>");
        exec(pathGrow, host, threadCountGrow, target);
        sleep(Math.ceil(getGrowTime(target) * 1000) + 1000); // Sleep 1 extra sec to be safe
    } else { // Otherwise hack the host
        print("<font color=cyan>Hacking money while " + formatNum(moneyNow) + " < " + formatNum(moneyThreshold) + "</font>");
        while (getServerMoneyAvailable(target) > moneyThreshold) { // Until money is under threshold
            exec(pathHack, host, threadCountHack, target);
            sleep(Math.ceil(getHackTime(target) * 1000) + 1000); // Sleep 1 extra sec to be safe
        }
    }
}
