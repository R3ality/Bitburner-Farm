// Crawl all servers and fetches any found files to predefined server

// Inspiration, reference or copied sources:
// https://github.com/iuriguilherme/netscripts.d/blob/master/deepscan-literature.script

export async function main(ns) {
  ns.disableLog("sleep");

  let storage = "foodnstuff"; // Server name to use for storage
  let stored = []; // Array of stored filenames

  // Arrays for ignored, visited and planned targets
  let ignored = ["home"]; // ADD ANY SERVERS HERE WHICH SHOULD BE SKIPPED
  let visited = [];
  let planned = ns.scan("home");

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

    // If it is rooted..
    if (ns.hasRootAccess(target)) {
      let files = ns.ls(target);
      for (let i = 0; i < files.length; ++i) {
        // Skip the files which are likely ours
        if (files[i].startsWith("_") && (files[i].endsWith(".script") || files[i].endsWith(".ns") || files[i].endsWith(".txt"))) {
          continue;
        }

        // scp() does not work with this file type. It only works for .script, .lit, and .txt files
        // Apparently scp is rather limited. So fetch the ones which we can..
        if (files[i].endsWith(".script") || files[i].endsWith(".lit") || files[i].endsWith(".txt")) {
          //ns.tprint("SUCCESS: Fetching file " + files[i] + " from " + target);
          ns.scp(files[i], target, storage);
          stored.push(files[i]);
          continue;
        }

        // .. and just notify about the rest
        ns.tprint("WARN: Unable to fetch file " + files[i] + " from " + target);
      }
    }
  }

  ns.tprint("INFO: Finished crawling " + visited.length + " targets. Fetched files: " + stored.length);
}
