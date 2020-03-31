// Initialize the environment

// Accept an argument to only clean existing scripts without downloading new ones
var cleanOnly = false;
if (args.length > 0) cleanOnly = true;

var fileNames = [
    "_crawl-enslave.ns",
    "_crawl-fetch.ns",
    "_crawl-kill.ns",
    "_crawl-nmap.ns",
    "_crawl-nuke.ns",
    "_enslave.script",
    "_farm.script",
    "_grow.script",
    "_hack.script",
    "_manage-hacknet.ns",
    "_manage-nodes.ns",
    "_monitor.script",
    "_prep.script",
    "program-manager.ns",
    "_weak.script",
];

for (var i = 0; i < fileNames.length; i++) {
    var file = fileNames[i];
    rm(file);
    if (cleanOnly) continue;
    var url = "https://raw.githubusercontent.com/R3ality/bitburner-scripts/master/" + file + ".js";
    wget(url, file);
}

tprint("<font color=green>SUCCESS:</font> Environment initialization completed!");
