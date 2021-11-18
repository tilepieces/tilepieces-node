#!/usr/bin/env node
const path = require("path");
const startServer = require("../startTilepiecesServer");
let setStartPath;
let settings;
for(var i = 2;i<process.argv.length;i++){
    var command = process.argv[i].split("=");
    if(["--set-start-path","-set-start-path","set-start-path"].indexOf(
            command[0].trim().toLowerCase()) > -1
    ) {
      setStartPath = process.cwd() + path.sep;
      settings = require("./settings.json");
    }
}
if(!settings){
  settings = require("../settings.json");
}
startServer(settings,setStartPath);
