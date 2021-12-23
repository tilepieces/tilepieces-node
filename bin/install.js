// https://stackoverflow.com/a/64255382
const copyDir = require("./copyDir.js");
module.exports = async ()=>{
  const path = require("path")
  const copyDir = require("./copyDir.js")
  var basePath = path.resolve(__dirname, "..") + path.sep;
  var processCwd = process.cwd() + path.sep;
  const {promises: fs} = require("fs");
  var settingsDefault = await fs.readFile(basePath + "settings.json","utf8");
  try {
    await fs.access(processCwd + 'components.json', fs.F_OK);
  } catch (e) {
    await fs.writeFile(processCwd + 'components.json', "{}");
  }
  try {
    await fs.access(processCwd + 'projects.json', fs.F_OK);
  } catch (e) {
    await fs.writeFile(processCwd + 'projects.json', "[]");
  }
  var isOldSettings;
  try {
    await fs.access(processCwd + 'settings.json', fs.F_OK);
    isOldSettings = true;
  } catch (e) {
    await fs.writeFile(processCwd + 'settings.json', settingsDefault);
  }
  var indexHtml = await fs.readFile(basePath + "index.html","utf8");
  await fs.writeFile(processCwd + 'index.html', indexHtml);
  await fs.writeFile(processCwd + 'tp-favi.png', await fs.readFile(basePath + "tp-favi.png"));
  await fs.writeFile(processCwd + 'tp-favi-180.png', await fs.readFile(basePath + "tp-favi-180.png"));
  await fs.rm(processCwd + "modules",{recursive:true});
  await copyDir(basePath + "modules", processCwd + "modules");
  await copyDir(basePath + "components", processCwd + "components");
  if(isOldSettings) {
    var oldSettings = await fs.readFile(processCwd + "settings.json","utf8");
    var oldSettings = JSON.parse(oldSettingsRaw);
    await fs.writeFile('settings.json', JSON.stringify(Object.assign({}, JSON.parse(settingsDefault), oldSettings),null,2));
  }
  return true;
}