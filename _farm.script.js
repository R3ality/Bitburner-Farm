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
exec(pathPrep, getHostname(), 1, target);
while (isRunning(pathPrep, getHostname(), target)) {
    sleep(2000);
}

var moneyNow;
var moneyMax = getServerMaxMoney(target);
var moneyThreshold = (moneyMax * 0.9); // Do not drain money lower than this threshold before running grow()

// If the server cannot have any money we have nothing to do here
if (moneyMax < 1) exit();

var securityNow;
var securityMin = getServerMinSecurityLevel(target);

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
    tprint("Target " + target + ": Thread count for a script returned 0. Exiting..");
    exit();
}

var sleepTime;

while (true) {
    moneyNow = getServerMoneyAvailable(target);
    securityNow = getServerSecurityLevel(target);

    if (securityNow > securityMin) {
        sleepTime = getWeakenTime(target);
        exec(pathWeak, target, threadCountWeak, target);
    } else if (moneyNow < moneyMax) {
        sleepTime = getGrowTime(target);
        exec(pathGrow, target, threadCountGrow, target);
    } else {
        while (getServerMoneyAvailable(target) > moneyThreshold) {
            exec(pathHack, target, threadCountHack, target);
            sleep(Math.ceil(getHackTime(target) * 1000));
        }
    }
    sleep(Math.ceil(sleepTime * 1000) + 2000); // Sleep until triggered script should be done. Add extra 2 sec just in case
}
