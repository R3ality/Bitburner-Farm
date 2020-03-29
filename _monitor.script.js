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

while (true) {
    var moneyNow = getServerMoneyAvailable(target);
    var securityNow = getServerSecurityLevel(target);

    tprint("<font color=magenta>MONITOR:</font> [" + target + "]: Money: " + nFormat(moneyNow, '0,0.00') + " / Security: " + nFormat(securityNow, '0,0.00'));
    sleep(Math.ceil(getHackTime(target) * 1000));
}
