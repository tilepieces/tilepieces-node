console.log("This is startTilepiecesServer.js tilepieces version 0.1.7");
const server = require("@tilepieces-official/node-server");
const open = require('open');
function startServer(settings,basePath) {
  var a = server(settings,basePath);
  a.then(res=> {
    console.log("application name response",res.applicationName);
    open(res.home);
  }).catch(err=> {
    if (err.code == "EADDRINUSE") {
      console.log("port " + settings.server.port + " already in use. Try next number...");
      settings.server.port+=1;
      startServer(settings,basePath);
    }
    else {
      console.error("[tilepieces shutdown error]",err);
      process.exit();
    }
  });
}
module.exports = startServer;