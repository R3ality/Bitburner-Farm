// Program manager for purchasing software tools off the darkweb

// Inspiration, reference or copied sources:
// https://github.com/MercuriusXeno/BitBurnerScripts/blob/master/program-manager.js

export async function main(ns) {
    const programNames = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe", "DeepscanV1.exe", "DeepscanV2.exe", "Autolink.exe"];
    const programCosts = [500000, 1500000, 5000000, 30000000, 250000000, 500000, 25000000, 1000000];

    var hasAllPrograms = false;
    while (true) {
        if (hasAllPrograms) break;
        if (!hasTor(ns)) {
            await ns.sleep(5000);
            continue;
        }
        var foundMissingProgram = false;
        for (var i = 0; i < programNames.length; ++i) {
            var prog = programNames[i];
            if (hasProgram(ns, prog)) {
                continue;
            } else {
                foundMissingProgram = true;
            }
            var cost = programCosts[i];
            if (cost <= getPlayerMoney(ns)) {
                ns.tprint("INFO: Purchasing program " + prog + " for " + ns.nFormat(cost, "$0.000a") + " money");
                ns.purchaseProgram(prog);
            }
        }
        if (!foundMissingProgram) {
            hasAllPrograms = true;
            ns.tprint("SUCCESS: All predefined programs already available. Exiting..");
        }
        await ns.sleep(5000);
    }
}

function getPlayerMoney(ns) {
    return ns.getServerMoneyAvailable("home");
}

function hasProgram(ns, program) {
    return ns.fileExists(program, "home");
}

function hasTor(ns) {
    var homeNodes = ns.scan("home");
    return homeNodes.includes("darkweb");
}
