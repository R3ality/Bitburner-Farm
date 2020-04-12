// Farming script which manages money, security and RAM usage

// Inspiration, reference or copied sources:
// https://github.com/blankcode/Bitburner-scripts/blob/master/replicator_fork/milk.script

disableLog("sleep");
disableLog("getServerMoneyAvailable");
disableLog("getServerSecurityLevel");
disableLog("exec");

var host = getHostname();

// Get target from file (if available)
var target = read("__target-money.txt").trim();
if (!target) {
    // Otherwise, get target from args (if available)
    if (args.length > 0) target = args[0];
    else {
        // Otherwise default to self
        target = host;
    }
}

// Avoid targeting some servers
if (target == "home") {
    tprint("<font color=red>FAILURE:</font> Avoiding targeting host: " + target + ". Exiting..");
    exit();
} else tprint("<font color=cyan> NOTIFY:</font> [" + host + "]: Specific target set: " + target);

var pathWeak = "_weak.script";
var pathGrow = "_grow.script";
var pathHack = "_hack.script";

var moneyMax = getServerMaxMoney(target);
var moneyThreshold = (moneyMax * 0.9); // Do not drain money lower than this threshold before running grow()

// If the server cannot have any money we have nothing to do here
if (moneyMax < 1) {
    tprint("<font color=red>FAILURE:</font> [" + host + "]: getServerMaxMoney(" + target + ") returned 0. Exiting..");
    exit();
}

var securityMin = getServerMinSecurityLevel(target);
var securityThreshold = (securityMin * 1.15); // Do not lower security unless it is lowe than this threshold
if (target != host) securityThreshold = (securityMin * 2); // Assuming many hosts are focusing this target, raise the threshold

var ram = getServerRam(host);
var ramFree = ram[0] - ram[1];
if (target == "home") ramFree = ramFree * 0.98 // If we're on home, leave 2% free ram for other scripts

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

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function getExtraSleepTime() {
    return Math.round(getRandom(1000, 4000)); // Between 1000 and 4000 msec
}

while (true) {
    var moneyNow = getServerMoneyAvailable(target);
    var securityNow = getServerSecurityLevel(target);

    // If security over threshold
    if (securityNow > securityThreshold) {
        print("<font color=cyan> NOTIFY:</font> Security exceeds threshold: " + nFormat(securityNow, '0,0.00') + " > " + nFormat(securityThreshold, '0,0.00') + ". Weakening until " + nFormat(securityMin, '0,0.00') + "</font>");
        while (getServerSecurityLevel(target) > securityMin) { // Weaken it to minimum level
            var timeWeak = getWeakenTime(target);
            print("<font color=white> INVOKE:</font> " + pathWeak + " [" + target + "] with " + threadCountWeak + " threads. Await " + nFormat(timeWeak, '00:00:00'));
            exec(pathWeak, host, threadCountWeak, target);
            sleep(Math.ceil(timeWeak * 1000) + getExtraSleepTime()); // Add extra sleep time for some variance
        }
    }

    // Else if money is not maxed, grow it until max
    else if (moneyNow < moneyMax) {
        print("<font color=cyan> NOTIFY:</font> Money not maxed. Growing while " + nFormat(moneyNow, '$0.000a') + " < " + nFormat(moneyMax, '$0.000a'));
        while (getServerMoneyAvailable(target) < moneyMax) {
            var timeGrow = getGrowTime(target);
            print("<font color=white> INVOKE:</font> " + pathGrow + " [" + target + "] with " + threadCountGrow + " threads. Await " + nFormat(timeGrow, '00:00:00'));
            exec(pathGrow, host, threadCountGrow, target);
            sleep(Math.ceil(timeGrow * 1000) + getExtraSleepTime()); // Add extra sleep time for some variance
        }
    }

    // Otherwise hack the target
    else {
        print("<font color=cyan> NOTIFY:</font> Hacking money while over threshold: " + nFormat(moneyNow, '$0.000a') + " < " + nFormat(moneyThreshold, '$0.000a'));
        while (getServerMoneyAvailable(target) > moneyThreshold) { // Until money is under threshold
            var timeHack = getHackTime(target);
            print("<font color=white> INVOKE:</font> " + pathHack + " [" + target + "] with " + threadCountHack + " threads. Await " + nFormat(timeHack, '00:00:00'));
            exec(pathHack, host, threadCountHack, target);
            sleep(Math.ceil(timeHack * 1000) + getExtraSleepTime()); // Add extra sleep time for some variance
        }
    }
}
