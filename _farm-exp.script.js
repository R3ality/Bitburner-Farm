// Farming script for exp gain

disableLog("sleep");
disableLog("exec");

var host = getHostname();
var scriptPath = {
    weak: "_weak.script",
    grow: "_grow.script",
    hack: "_hack.script"
}

// Get target from file (if available)
var target = read("__target-exp.txt").trim();
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

// RAM variables
var ram = getServerRam(host);
var ramFree = ram[0] - ram[1];
var ramNeed = {
    weak: getScriptRam(scriptPath.weak),
    grow: getScriptRam(scriptPath.grow),
    hack: getScriptRam(scriptPath.hack)
}

// Error checking for ramNeed 0 which probably means the script file is missing
if (ramNeed.weak == 0 || ramNeed.grow == 0 || ramNeed.hack == 0) {
    tprint("<font color=red>FAILURE:</font> [" + host + "]: getScriptRam() 0. Exiting..");
    exit();
}

// Calculate how many threads we can fit
var threadCount = {
    weak: Math.floor(ramFree / ramNeed.weak),
    grow: Math.floor(ramFree / ramNeed.grow),
    hack: Math.floor(ramFree / ramNeed.hack)
}

// Error checking for threadCount 0 which probably means we have no ram
if (threadCount.weak == 0 || threadCount.grow == 0 || threadCount.hack == 0) {
    tprint("<font color=red>FAILURE:</font> [" + host + "]: Thread count for a script returned 0. Exiting..");
    exit();
}

while (true) {
    var sleepTime = { weak: getWeakenTime(target) };

    // Just bombard the target with weaken for exp gain
    print("<font color=white> INVOKE:</font> " + scriptPath.weak + " [" + target + "] with " + threadCount.weak + " threads. Await " + nFormat(sleepTime.weak, '00:00:00'));
    exec(scriptPath.weak, host, threadCount.weak, target);
    sleep(Math.ceil(sleepTime.weak * 1000) + 1000); // Add extra sleep time to be safe
}
