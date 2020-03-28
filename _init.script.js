// Download the other relevant scripts

var fileNames = ["_farm.script", "_farm-local.script", "_grow.script", "_hack.script", "_prep.script", "_weak.script"];

fileNames.forEach(function(fileName) {
    rm(fileName); // wget() should overwrite but this did not appear to be working
    var url = "https://raw.githubusercontent.com/R3ality/Bitburner-Farm/master/" + fileName + ".js";
    wget(url, fileName);
});
