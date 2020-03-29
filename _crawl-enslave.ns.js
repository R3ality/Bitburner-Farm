// Crawl all servers and enslave any which are possible

// Referenced or copied sources:
// https://github.com/iuriguilherme/netscripts.d/blob/master/deepscan-nuke.script
// https://github.com/Nolshine/bitburner-scripts/master/crawlkill.ns.js
// https://github.com/Nolshine/bitburner-scripts/blob/master/spidercrack.ns.js

export async function main(ns) {
    ns.disableLog("sleep");

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

        // If it is rooted, and not yet enslaved, attempt to enslave it
        if (ns.hasRootAccess(target) && !ns.isRunning("_farm.script", target)) {
            ns.exec("_enslave.script", "home", 1, target);

            // Wait until enslave script is finished
            while (ns.isRunning("_enslave.script", "home", target)) {
                await ns.sleep(1000);
            }

            // Verify results
            if (ns.isRunning("_farm.script", target)) {
                ns.tprint("<font color=green>SUCCESS:</font> Target enslaved: " + target);
            } else {
                ns.tprint("<font color=red>FAILURE:</font> Enslaving failed: " + target);
            }
        }
    }

    ns.tprint("<font color=cyan>INFORMA:</font> Finished crawling " + (visited.length - 1) + " targets");
}
