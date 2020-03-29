// Crawl all servers and nuke any which are possible, output all skipped

// Referenced or copied sources:
// https://github.com/iuriguilherme/netscripts.d/blob/master/deepscan-nuke.script
// https://github.com/Nolshine/bitburner-scripts/master/crawlkill.ns.js
// https://github.com/Nolshine/bitburner-scripts/blob/master/spidercrack.ns.js

export async function main(ns) {
    ns.disableLog("sleep");

    let crackTools = ["BruteSSH.exe", "FTPCrack.exe", "RelaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
    let crackFuncs = [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject];

    // Check how many ports we could crack
    let crackCount = 0;
    crackTools.forEach(function(tool) {
        if (ns.fileExists(tool, "home")) crackCount++;
    });

    // Arrays for visited and planned targets
    let visited = ["home"]; // ADD ANY SERVERS HERE WHICH SHOULD BE SKIPPED
    let planned = ns.scan("home");

    while (planned.length > 0) {
        let target = planned.pop();

        // If it is already visited, ignore it and jump to next iteration
        if (visited.includes(target)) {
            ns.print("<font color=cyan>Ignoring target:</font> " + target);
            continue;
        }

        // Scan for new targets and mark this one as visited
        let scanned = ns.scan(target);
        planned = planned.concat(scanned);
        visited.push(target);

        let reasons = [];
        let crackRequired = ns.getServerNumPortsRequired(target);
        let levelRequired = ns.getServerSecurityLevel(target);

        // Check if target is eligible
        if (ns.hasRootAccess(target)) reasons.push("Target already rooted");
        else {
            if (levelRequired > ns.getHackingLevel()) {
                reasons.push("Requires Hacking level " + levelRequired);
            }
            if (crackRequired > crackCount) {
                reasons.push("Requires " + crackRequired + " crack tools");
            }
        }

        // If there were reasons for skipping it, jump to next iteration
        if (reasons.length > 0) {
            ns.tprint("<font color=yellow>WARNING:</font> Skipping target: " + target + " (" + reasons.join(", ") + ")");
            continue;
        }

        // Otherwise crack the target
        for (let i = 0; i < crackRequired; i++) {
            crackFuncs[i](target);
        }

        // ..and nuke it
        ns.nuke(target);

        // Wait for a little while and verify results
        await ns.sleep(1000);
        if (ns.hasRootAccess(target)) {
            ns.tprint("<font color=green>SUCCESS:</font> Target rooted: " + target);
        } else {
            ns.tprint("<font color=red>FAILURE:</font> Rooting failed: " + target);
        }
    }

    ns.tprint("<font color=cyan>INFORMA:</font> Finished crawling targets: " + (visited.length - 1));
}
