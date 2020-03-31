// List servers

var servers = getPurchasedServers();
for (var i = 0; i < servers.length; i++) {
    var server = servers[i];
    var ram = getServerRam(server);

    tprint("Node " +
        String("           " + server).slice(-7) +
        " RAM: " +
        String("           " + nFormat(Math.round(ram[1]), '0,0')).slice(-9) +
        " GB (used) " +
        String("           " + nFormat(ram[0], '0,0')).slice(-9) +
        " GB (free)");
}
