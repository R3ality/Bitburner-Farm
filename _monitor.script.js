// Monitor the security and money of the target

// If available, get target from file
var target = read("_target.txt");
if (!target) {
    // Otherwise get from argument
    if (args.length > 0) target = args[0];
    else {
        tprint("<font color=red>ERROR:</font> No target specified. Exiting..");
        exit();
    }
}

while (true) {
    var moneyNow = getServerMoneyAvailable(target);
    var moneyMax = getServerMaxMoney(target);
    var moneyDif = moneyMax - moneyNow;

    var securityNow = getServerSecurityLevel(target);
    var securityMin = getServerMinSecurityLevel(target);
    var securityDif = securityNow - securityMin;

    tprint("<font color=magenta>MONITOR:</font> [" + target + "]: Money: " + nFormat(moneyNow, '0,0.00') + " (" + nFormat(moneyDif, '0,0.00') + " under max) / Security: " + nFormat(securityNow, '0,0.00') + " (" + nFormat(securityDif, '0,0.00') + " over min)");
    sleep(Math.ceil(getHackTime(target) * 1000));
}
