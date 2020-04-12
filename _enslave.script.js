// Enslave the target host

// Expect arguments
if (args.length != 1) {
    tprint("<font color=red>ERROR:</font> Unexpected number of arguments provided. Exiting..");
    exit();
}
var target = args[0];

var execScript = "_farm-exp.script" // Default to exp farming script
if (args.length > 1) execScript = args[1];  // Or accept second argument as target script name

function runLocalAwait(script, arg) { // Run local script and await for it to finish
    if (exec(script, "home", 1, arg) > 0) {
        while (isRunning(script, "home", arg)) {
            sleep(1000);
        }
    } else {
        tprint("<font color=red>ERROR:</font> runLocalAwait(" + script + ", " + arg + ") failed!. Exiting..");
        exit();
    }
}

// If target is rooted, prep it, clean RAM and run framing script
if (hasRootAccess(target)) {
    runLocalAwait("_prep.script", target);
    killall(target);
    exec(execScript, target, 1);
}
else {
    tprint("<font color=red>FAILURE:</font> Target is not rooted: " + target);
}
