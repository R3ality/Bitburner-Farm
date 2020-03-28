// Expect target hostname to be provided via argument
if (args.length != 1) {
    tprint("Unexpected number of arguments provided. Exiting..");
    exit();
}

var target = args[0];

var pathWeak = "_weak.script";
var pathGrow = "_grow.script";
var pathHack = "_hack.script";

if (scp(pathWeak, "home", target) && scp(pathGrow, "home", target) && scp(pathHack, "home", target)) {
    print("Finished uploading scripts");
} else {
    tprint("Target " + target + ": Failed uploading scripts. Exiting..");
    exit();
}
