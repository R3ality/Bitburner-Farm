// Prep the target host by copying over the required files

// Expect target hostname to be provided via argument
if (args.length != 1) {
    tprint("Unexpected number of arguments provided. Exiting..");
    exit();
}
var target = args[0];

var fileNames = ["_grow.script", "_hack.script", "_weak.script"];

fileNames.forEach(function(fileName) {
    if (scp(fileName, "home", target)) {
        print("Finished uploading: " + fileName);
    }
    else {
        tprint("Target " + target + ": Failed uploading: " + fileName +". Exiting..");
        exit();
    }
});
