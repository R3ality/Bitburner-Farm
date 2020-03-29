// Prep the target host by copying over the required files

// Expect target hostname to be provided via argument
if (args.length != 1) {
    tprint("Unexpected number of arguments provided. Exiting..");
    exit();
}
var target = args[0];

var fileNames = [
    "_grow.script",
    "_hack.script",
    "_weak.script",
    "_farm.script"
];

fileNames.forEach(function(fileName) {
    rm(fileName, target); // scp() should overwrite but this did not appear to be working
    if (scp(fileName, "home", target)) {
        print("Finished uploading: " + fileName);
    }
    else {
        tprint("Target " + target + ": Failed uploading: " + fileName +". Exiting..");
        exit();
    }
});
