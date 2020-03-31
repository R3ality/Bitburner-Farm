// Crawl all servers and map the whole network to file nmap.txt

// Inspiration, reference or copied sources:
// https://www.reddit.com/r/Bitburner/comments/7lmbpa/scripts_using_files/
// https://raw.githubusercontent.com/Nolshine/bitburner-scripts/master/crawlkill.ns.js

export async function main(ns) {
    // Arrays for visited and planned targets
    let visited = ["home"]; // ADD ANY SERVERS HERE WHICH SHOULD BE SKIPPED
    let planned = ns.scan("home");

    ns.clear("_nmap.txt"); // Start with an empty file

    // Add header row, this is optional
    ns.write("_nmap.txt", "hostname" +
        ",hasRootAccess" +
        ",getServerRam" +
        ",getServerNumPortsRequired" +
        ",getServerRequiredHackingLevel" +
        ",getServerMoneyAvailable" +
        ",getServerMaxMoney" +
        ",getServerSecurityLevel" +
        ",getServerMinSecurityLevel" +
        ",getServerGrowth" +
        ",getHackTime" +
        ",score" +
        "\r\n");

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

        // Determine the score for the server
        let securityMin = ns.getServerMinSecurityLevel(target);
        let moneyMax = ns.getServerMaxMoney(target);
        let rateGrowth = ns.getServerGrowth(target);
        let timeHack = ns.getHackTime(target);
        let score = Math.round((100 - securityMin) * moneyMax * rateGrowth / timeHack);

        // Write details to file
        ns.write("_nmap.txt", target +
            "," + ns.hasRootAccess(target) +
            "," + ns.getServerRam(target)[0] +
            "," + ns.getServerNumPortsRequired(target) +
            "," + ns.getServerRequiredHackingLevel(target) +
            "," + Math.floor(ns.getServerMoneyAvailable(target)) +
            "," + moneyMax +
            "," + Math.round(ns.getServerSecurityLevel(target)) + // This may lose a lot of precision but dont want to deal with the decimal separator
            "," + securityMin +
            "," + rateGrowth +
            "," + Math.round(timeHack) +
            "," + score +
            "\r\n");

        await ns.sleep(15);
    }

    // Determine best server based on the score
    let bestTargetScore = 0;
    let bestTargetName = null;

    let rows = ns.read("_nmap.txt").split("\r\n");
    for (let i = 0; i < rows.length; ++i) {
        let stats = rows[i].split(',');
        if (stats.length < 7) break; // Ignore last blank row

        let server = {
            hostname: stats[0],
            isRooted: parseBoolean(stats[1]),
            ramTotal: parseInt(stats[2]),
            portsReq: parseInt(stats[3]),
            levelReq: parseInt(stats[4]),
            moneyNow: parseInt(stats[5]),
            moneyMax: parseInt(stats[6]),
            secNow: parseInt(stats[7]),
            secMin: parseInt(stats[8]),
            rateGrow: parseInt(stats[9]),
            timeHack: parseInt(stats[10]),
            score: parseInt(stats[11])
        };

        if (server.isRooted && server.score > bestTargetScore) {
            if (server.levelReq <= ns.getHackingLevel()) { // Make sure we have high enough level
                bestTargetScore = server.score;
                bestTargetName = server.hostname;
            }
        }
    }

    // Write best target to file (if found)
    ns.rm("_target.txt");
    if (bestTargetName) {
        ns.write("_target.txt", bestTargetName);
    }

    ns.tprint("<font color=cyan> NOTIFY:</font> Finished crawling " + (visited.length - 1) + " targets. See output file for details. Best rooted target: " + (bestTargetName ? bestTargetName : "n/a"));
}

function parseBoolean(str) {
    if (str == 'true') return true;
    else return false;
}
