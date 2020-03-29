// Expect target hostname to be provided via argument
if (args.length != 1) {
    tprint("Unexpected number of arguments provided. Exiting..");
    exit();
}

var target = args[0];

var pathWeak = "_weak.script";
var pathGrow = "_grow.script";
var pathHack = "_hack.script";
var pathPrep = "_prep.script";

// Prep the target
if (exec(pathPrep, getHostname(), 1, target) > 0) {
    while (isRunning(pathPrep, getHostname(), target)) {
        sleep(2000);
    }
} else {
    tprint("Failed to run script: " + pathPrep + ". Exiting..");
    exit();
}

var moneyNow;
var moneyMax = getServerMaxMoney(target);
var moneyThreshold = (moneyMax * 0.9); // Do not drain money lower than this threshold before running grow()

// If the server cannot have any money we have nothing to do here
if (moneyMax < 1) exit();

var securityNow;
var securityMin = getServerMinSecurityLevel(target);
var securityThreshold = (securityMin * 1.15); // Do not lower security unless it is lowe than this threshold

var ram = getServerRam(target);
var ramFree = ram[0] - ram[1];

var ramNeedWeak = getScriptRam(pathWeak);
var ramNeedGrow = getScriptRam(pathGrow);
var ramNeedHack = getScriptRam(pathHack);

if (ramNeedWeak == 0 || ramNeedGrow == 0 || ramNeedHack == 0) {
    tprint("Required RAM for a script returned 0. Exiting..");
    exit();
}

var threadCountWeak = Math.floor(ramFree / ramNeedWeak);
var threadCountGrow = Math.floor(ramFree / ramNeedGrow);
var threadCountHack = Math.floor(ramFree / ramNeedHack);

if (threadCountWeak == 0 || threadCountGrow == 0 || threadCountHack == 0) {
    tprint("[" + target + "]: Thread count for a script returned 0. Exiting..");
    exit();
}

function formatNum(x) {
    return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

while (true) {
    moneyNow = getServerMoneyAvailable(target);
    securityNow = getServerSecurityLevel(target);

    if (securityNow > securityThreshold) { // If security over threshold
        print("<font color=cyan>Weakening security wile " + formatNum(securityNow) + " > " + formatNum(securityMin) + "</font>");
        while (getServerSecurityLevel(target) > securityMin) { // Weaken it to minimum level
            exec(pathWeak, target, threadCountWeak, target);
            sleep(Math.ceil(getWeakenTime(target) * 1000) + 2000); // Sleep 2 extra sec to be safe
        }
    } else if (moneyNow < moneyMax) { // If money is not maxed, grow it until max
        print("<font color=cyan>Growing money while " + formatNum(moneyNow) + " < " + formatNum(moneyMax) + "</font>");
        exec(pathGrow, target, threadCountGrow, target);
        sleep(Math.ceil(getGrowTime(target) * 1000) + 2000); // Sleep 2 extra sec to be safe
    } else { // Otherwise hack the target
        print("<font color=cyan>Hacking money while " + formatNum(moneyNow) + " < " + formatNum(moneyThreshold) + "</font>");
        while (getServerMoneyAvailable(target) > moneyThreshold) { // Until money is under threshold
            exec(pathHack, target, threadCountHack, target);
            sleep(Math.ceil(getHackTime(target) * 1000) + 2000); // Sleep 2 extra sec to be safe
        }
    }
}
