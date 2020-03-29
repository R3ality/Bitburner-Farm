// Enslave the target host

// Expect target hostname to be provided via argument
if (args.length != 1) {
    tprint("Unexpected number of arguments provided. Exiting..");
    exit();
}
var target = args[0];

function runLocalAwait(script, target) { // Run local script and await for it to finish
    if (exec(script, getHostname(), 1, target) > 0) {
        while (isRunning(script, getHostname(), target)) {
            sleep(2000);
        }
    } else {
        tprint("<font color=red>runAwait(" + script + ", " + target + ") failed!. Exiting..</font>");
        exit();
    }
}

runLocalAwait("_prep.script", target); // Prep the target
killall(target);
exec("_farm.script", target, 1, target);

tprint("<font color=green>Target enslaved: " + target + "</font>");
