// List servers

var servers = getPurchasedServers();
for (var i = 0; i < servers.length; i++) {
    var server = servers[i];
    var ram = getServerRam(server);

    tprint("Node " +
        String("           " + server).slice(-7) +
        " RAM: " +
        String("           " + nFormat(Math.round(ram[0]), '0,0')).slice(-9) +
        " GB (total) " +
        String("           " + nFormat(Math.round(ram[0] - ram[1]), '0,0')).slice(-9) +
        " GB (free)" +
        String("           " + ((ram[1] / ram[0]) * 100).toFixed(2)).slice(-6) +
        "% (used)");
}

tprint("INFO: Finished listing " + servers.length + " nodes");
