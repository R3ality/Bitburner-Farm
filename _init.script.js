// Initialize the environment

var fileNames = [
    "_farm.script",
    "_farm-remote.script",
    "_grow.script",
    "_hack.script",
    "_prep.script",
    "_weak.script",
    "_enslave.script",
    "_manage-hacknet.ns.js"
];

fileNames.forEach(function(fileName) {
    rm(fileName); // wget() should overwrite but this did not appear to be working
    var url = "https://raw.githubusercontent.com/R3ality/bitburner-scripts/master/" + fileName + ".js";
    wget(url, fileName);
});

tprint("<font color=green>SUCCESS:</font> Environment initialization completed!");
