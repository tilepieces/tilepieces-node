const server = require("@tilepieces/server");
const open = require('open');
const settingsPath = "./settings.json";
let settings = require(settingsPath);
function startServer() {
    var a = server(settings);
    a.then(res=> {
        console.log("application name response",res.applicationName);
        open(res.home);
    }).catch(err=> {
        if (err.code == "EADDRINUSE") {
            console.log("port " + settings.server.port + " already in use. Try next number...");
            settings.server.port+=1;
            startServer();
        }
    });
}
startServer();