#!/usr/bin/env node
(async ()=>{
  const path = require("path");
  const startServer = require("../startTilepiecesServer.js");
  const install = require("./install.js");
  const checkIfInstalled = require("./checkIfInstalled.js");
  const processCwd = process.cwd();
  let startPath = processCwd + path.sep;
  let isInstalled;
  for(var i = 2;i<process.argv.length;i++){
    var command = process.argv[i].split("=");
    if(command[0].trim().toLowerCase() === "install") {
      try{
        isInstalled = await install();
      }
      catch(e){
        console.error(e);
        console.error("Cannot install tilepieces in path " + processCwd);
        process.exit(1);
      }
    }
  }
  if(!isInstalled && !checkIfInstalled(processCwd)){
    console.log("The current directory " + processCwd + " does not have the tilepieces relevant files. Run 'tilepieces install'");
    process.exit(1);
  }
  startServer(require(startPath + "settings.json"),startPath);
})();
