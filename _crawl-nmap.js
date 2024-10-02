// Crawl all servers and map the whole network to file nmap.txt

// Inspiration, reference or copied sources:
// https://www.reddit.com/r/Bitburner/comments/7lmbpa/scripts_using_files/
// https://raw.githubusercontent.com/Nolshine/bitburner-scripts/master/crawlkill.ns.js

export async function main(ns) {
    // Arrays for ignored, visited and planned targets
    let ignored = ["home"]; // ADD ANY SERVERS HERE WHICH SHOULD BE SKIPPED
    ignored = ignored.concat(ns.getPurchasedServers()); // Ignore our purchased nodes as well
    let visited = [];
    let planned = ns.scan("home");

    let hackLevel = ns.getHackingLevel();
    let filename = '__nmap.txt';

    ns.clear(filename); // Start with an empty file

    // Add header row, this is optional
    ns.write(filename, "hostname" +
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
        ",getWeakenTime" +
        ",getGrowTime" +
        ",score" +
        "\r\n");

    while (planned.length > 0) {
        let target = planned.pop();

        // If it is ignored or already visited, skip it and jump to next iteration
        if (ignored.includes(target) || visited.includes(target)) {
            ns.print("INFO: Ignoring target: " + target);
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
        ns.write(filename, target +
            "," + ns.hasRootAccess(target) +
            "," + ns.getServerRam(target)[0] +
            "," + ns.getServerNumPortsRequired(target) +
            "," + ns.getServerRequiredHackingLevel(target) +
            "," + Math.floor(ns.getServerMoneyAvailable(target)) +
            "," + moneyMax +
            "," + Math.round(ns.getServerSecurityLevel(target)) + // This may lose a lot of precision but don't want to deal with the decimal separator
            "," + securityMin +
            "," + rateGrowth +
            "," + Math.round(timeHack) +
            "," + Math.round(ns.getWeakenTime(target)) +
            "," + Math.round(ns.getGrowTime(target)) +
            "," + score +
            "\r\n");

        await ns.sleep(15);
    }

    // Determine best server based on the score
    let target = {
        money: { hostname: null, benchmark: null, filename: '__target-money.txt' },
        exp: { hostname: null, benchmark: null, filename: '__target-exp.txt' }
    };

    let rows = ns.read(filename).split("\r\n");
    for (let i = 1; i < rows.length; ++i) { // skip header row (index 0)
        let row = rows[i].trim();
        if (!row) break; // Ignore blank row at the end
        let stats = row.split(',');

        let server = {
            hostname: stats[0],
            isRooted: parseBoolean(stats[1]),
            levelReq: parseInt(stats[4]),
            weakenTime: parseInt(stats[11]),
            score: parseInt(stats[13])
        };

        if (server.isRooted) {
            // If current server has higher score than any previous, select as target
            if (server.score > target.money.benchmark && server.levelReq <= hackLevel) {
                target.money.benchmark = server.score;
                target.money.hostname = server.hostname;
            }
            // If no exp target so far, or if current server has lower weaken time
            if (!target.exp.benchmark || server.weakenTime < target.exp.benchmark) {
                target.exp.benchmark = server.weakenTime;
                target.exp.hostname = server.hostname;
            }
        }
    }

    // Remove old files
    ns.rm(target.money.filename);
    ns.rm(target.exp.filename);

    // Write new files (if targets were found)
    if (target.money.hostname) ns.write(target.money.filename, target.money.hostname);
    if (target.exp.hostname) ns.write(target.exp.filename, target.exp.hostname);

    ns.tprint("INFO: Finished crawling " + visited.length + " targets. See output file for details");
    ns.tprint("INFO: Optimal money target: " + (target.money.hostname ? target.money.hostname : "n/a") + ". Optimal exp target: " + (target.exp.hostname ? target.exp.hostname : "n/a"));
}

function parseBoolean(str) {
    if (str == 'true') return true;
    else return false;
}
