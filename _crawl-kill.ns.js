// Crawl all servers and call killall()
// Or if arg[0] is specified as a script name, kill that instead

// Inspiration, reference or copied sources:
// https://raw.githubusercontent.com/Nolshine/bitburner-scripts/master/crawlkill.ns.js

export async function main(ns) {
    // Arrays for visited and planned targets
    let visited = ["home"]; // ADD ANY SERVERS HERE WHICH SHOULD BE SKIPPED
    visited.concat(ns.getPurchasedServers()); // Ignore our purchased nodes as well
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

        // If any scripts are running on it, run killall().
        if (ns.getServerRam(target)[1] > 0) {

            // Accept argument in case a specific script needs to be killed
            if (ns.args.length > 0) {
                ns.tprint("Killing script " + ns.args[0] + " on: " + target);
                ns.scriptKill(ns.args[0], target);
            } else {
                ns.tprint("Killing all scripts on: " + target);
                ns.killall(target);
            }

        }
    }

    ns.tprint("<font color=cyan> NOTIFY:</font> Finished crawling " + (visited.length - 1) + " targets");
}
