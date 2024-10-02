// Manage server purchases

// Inspiration, reference or copied sources:
// https://github.com/MercuriusXeno/BitBurnerScripts/blob/master/host-manager.js

var maxServerRam = 1048576; // Maximum amount of RAM for a single server. getPurchasedServerMaxRam();
var maxServerCount = 25; // Maximum number of servers. getPurchasedServerLimit();
var costPerEachGb = 440000 / 8; // Server cost per each GB of RAM it has

/*
    RAM      COST_PER_25
      2        2,750,000
      4        5,500,000
      8       11,000,000
     16       22,000,000
     32       44,000,000
     64       88,000,000
    128      176,000,000
    256      352,000,000
    512      704,000,000
   1024    1,408,000,000
   2048    2,816,000,000
   4096    5,632,000,000
   8192   11,264,000,000
  16384   22,528,000,000
  32768   45,056,000,000
  65536   90,112,000,000
 131072      1,80224E+11
 262144      3,60448E+11
 524288      7,20896E+11
1048576      1,44179E+12
*/

// Allows setting a maximum RAM limit for a single server. Use this to limit spending
// Reference the information above
var ramLimit = null;
if (args.length > 0) {
    ramLimit = args[0];
    ramLimit = getNearestSmallerPow2(ramLimit + 1); // Make sure its a power of 2
    tprint("INFO: Ram limit set to " + ramLimit + " GB");
} else {
    if (!prompt("Are your sure you want to continue without a RAM limit ?")) {
        exit();
    }
}

var name = "node"; // Prefix for server names. Numbers will be added automatically (eg. pserv-4)
var confirm = false; // If purchases should be confirmed with user

// Return nearest smaller power of 2 for the specified number
function getNearestSmallerPow2(n) {
    return Math.pow(2, Math.floor(Math.log(n) / Math.log(2)));
}

// Get the maximum amount of RAM we could affor for the server purchase
function getMaxAffordableRamAmount() {
    var money = getServerMoneyAvailable("home");
    var maxAffordableRam = Math.floor(money / costPerEachGb);
    if (maxAffordableRam > maxServerRam) maxAffordableRam = maxServerRam; // Do not exceed maximum allowed
    return getNearestSmallerPow2(maxAffordableRam);
}

// Get the name and ram amoun for the weakest server
function getWeakestServer(servers) {
    var weakest = { hostname: null, ram: null };
    for (var i = 0; i < servers.length; i++) {
        var serverName = servers[i];
        var serverRam = getServerRam(serverName)[0];
        if (!weakest.ram || serverRam < weakest.ram) {
            weakest.hostname = serverName;
            weakest.ram = serverRam;
        }
    }
    return weakest;
}

// Get next free server name index
function getFreeServerIndex(servers) {
    var indices = [];
    for (var i = 0; i < servers.length; i++) {
        var index = servers[i].split("-")[1];
        if (index) indices.push(parseInt(index));
    }

    var index = 1;
    while (indices.includes(index)) {
        index++;
    }
    return index;
}

while (true) {
    var purchaseRam = getMaxAffordableRamAmount();
    if (ramLimit && purchaseRam > ramLimit) purchaseRam = ramLimit; // If ram limit is set, do not exceed it
    var purchaseCost = purchaseRam * costPerEachGb;
    var servers = getPurchasedServers();
    var purchaseName = name + "-" + getFreeServerIndex(servers);

    // If specific ramLimit was not set and planned server is weaker than home, do not purchase
    if (!ramLimit && purchaseRam < getServerRam("home")[0]) {
        tprint("INFO: Skipping purchase of a server weaker than home. Waiting for next iteration..");
        sleep(15000);
        continue;
    }

    // If we are not at the cap, make the purchase
    if (servers.length < maxServerCount) {
        var txt = "purchaseName: " + purchaseName + "; purchaseRam: " + nFormat(purchaseRam, '0,0') + "; purchaseCost: " + nFormat(purchaseCost, '$0.000a');

        if (confirm) {
            if (!prompt(txt.split(";").join("<br>") + "<br><br>Purchase server ?")) {
                exit();
            }
        }

        // Purchase and see if it was successful
        if (purchaseServer(purchaseName, purchaseRam) != purchaseName) {
            tprint("ERROR: Purchase failed: " + purchaseName);
            sleep(5000);
            continue;
        }
        tprint("SUCCESS: Purchased " + txt);

        // Enslave it as well
        exec("_enslave.script", "home", 1, purchaseName);

        // Wait until enslave script is finished
        while (isRunning("_enslave.script", "home", purchaseName)) {
            sleep(1000);
        }

        // Verify results
        if (isRunning("_farm-money.script", purchaseName) || isRunning("_farm-exp.script", purchaseName)) {
            tprint("SUCCESS: Node enslaved: " + purchaseName);
        } else {
            tprint("ERROR: Enslaving failed: " + purchaseName);
        }
    }

    // Else we are at the cap, see if any can be upgraded
    else {
        var weakest = getWeakestServer(servers);
        if (weakest.ram < purchaseRam) {
            // Remove the weakest server
            killall(weakest.hostname);
            sleep(1000);
            deleteServer(weakest.hostname);
            tprint("INFO: At server limit! Deleted weakest server " + weakest.hostname + " with " + nFormat(weakest.ram, '0,0') + " GB RAM");
        } else {
            tprint("INFO: At server limit! Unable to upgrade any existing servers. Waiting for next iteration..");
            sleep(15000);
        }
    }

}
