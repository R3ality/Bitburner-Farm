// Prepare the host for enslaving

// Expect the host to be provided via argument
if (args.length != 1) {
    tprint("ERROR: Missing required arguments. Exiting..");
    exit();
}
var host = args[0];

// Files to copy over to the host
var fileNames = [
    "_grow.script",
    "_hack.script",
    "_weak.script",
    "_farm-money.script",
    "_farm-exp.script",
    "__target-money.txt",
    "__target-exp.txt"
];

fileNames.forEach(function(fileName) {
    rm(fileName, host); // scp() should overwrite but this did not appear to be working
    if (scp(fileName, "home", host)) {
        print("Finished uploading: " + fileName);
    } else {
        if (!fileName.startsWith('__target')) { // Ignore if failure is a target file as these are allowed to be missing
            tprint("ERROR: Failed uploading " + fileName + " to host " + host + ". Exiting..");
            exit();
        }
    }
});
