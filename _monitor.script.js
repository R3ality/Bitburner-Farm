// Monitor the security and money of the target

// If available, get target from file
var target = read("_target.txt");
if (!target) {
    if (args.length > 0) target = args[0];
    else {
        tprint("<font color=red>ERROR:</font> No target specified. Exiting..");
        exit();
    }
}

function formatNum(x) {
    return x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

while (true) {
    var moneyNow = getServerMoneyAvailable(target);
    var securityNow = getServerSecurityLevel(target);

    tprint("<font color=magenta>MONITOR:</font> [" + target + "]: Money: " + formatNum(moneyNow) + " / Security: " + formatNum(securityNow));
    sleep(Math.ceil(getHackTime(target) * 1000));
}
