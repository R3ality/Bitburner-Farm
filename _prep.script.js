// Prepare the host for enslaving

// Expect the host to be provided via argument
if (args.length != 1) {
    tprint("<font color=red>ERROR:</font> Missing required arguments. Exiting..");
    exit();
}
var host = args[0];

// Files to copy over to the host
var fileNames = [
    "_grow.script",
    "_hack.script",
    "_weak.script",
    "_farm.script",
    "_target.txt"
];

fileNames.forEach(function(fileName) {
    rm(fileName, host); // scp() should overwrite but this did not appear to be working
    if (scp(fileName, "home", host)) {
        print("Finished uploading: " + fileName);
    }
    else {
        if (fileName != '_target.txt') { // Ignore if failure is target file as it is allowed to be unset.
            tprint("<font color=red>ERROR:</font> Failed uploading " + fileName +" to host " + host + ". Exiting..");
            exit();
        }
    }
});
