console.log("This is node version 0.1.2");
const path = require("path");
const pathPase = __dirname + path.sep;
const settingsPath = pathPase + "settings.json";
const startServer = require(pathPase + "startTilepiecesServer.js");
let settings = require(settingsPath);
startServer(settings,pathPase);
