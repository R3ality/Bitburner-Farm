// Enslave the target host

// Expect target hostname to be provided via argument
if (args.length != 1) {
    tprint("<font color=red>ERROR:</font> Unexpected number of arguments provided. Exiting..");
    exit();
}
var target = args[0];

function runLocalAwait(script, target) { // Run local script and await for it to finish
    if (exec(script, "home", 1, target) > 0) {
        while (isRunning(script, "home", target)) {
            sleep(2000);
        }
    } else {
        tprint("<font color=red>ERROR:</font> runAwait(" + script + ", " + target + ") failed!. Exiting..");
        exit();
    }
}

// If target is rooted, prep it, clean RAM and run framing script
if (hasRootAccess(target)) {
    runLocalAwait("_prep.script", target);
    killall(target);
    exec("_farm.script", target, 1);

    tprint("<font color=green>SUCCESS:</font> Target enslaved: " + target);
}
else {
    tprint("<font color=red>FAILURE:</font> Target is not rooted: " + target);
}
