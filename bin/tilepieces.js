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
    var lineSplit = process.argv[i].split("=");
    var command = lineSplit[0].trim().toLowerCase()
    if(command === "install") {
      try{
        isInstalled = await install();
      }
      catch(e){
        console.error(e);
        console.error("Cannot install tilepieces in path " + processCwd);
        process.exit(1);
      }
    }
    else if(command === "version" || command === "v"){
      const pkg = require("../package.json");
      console.log(pkg.version);
      process.exit(1);
    }
    else{
      console.log("invalid command " + command);
      process.exit(1);
    }
  }
  if(!isInstalled && !checkIfInstalled(processCwd)){
    console.log("tilepieces does not appear to be installed in directory " + processCwd + ". Run 'tilepieces install'");
    process.exit(1);
  }
  startServer(require(startPath + "settings.json"),startPath);
})();
