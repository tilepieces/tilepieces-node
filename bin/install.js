// https://stackoverflow.com/a/64255382
const copyDir = require("./copyDir.js");
module.exports = async ()=>{
  const path = require("path")
  const copyDir = require("./copyDir.js")
  let basePath = path.resolve(__dirname, "..") +  + path.sep;
  let processCwd = process.cwd() +  + path.sep;
  const {promises: fs} = require("fs");
  let settingsDefault = await fs.readFile(basePath + "settings","utf8");
  try {
    await fs.access(basePath + 'components.json', fs.F_OK);
  } catch (e) {
    await fs.writeFile(processCwd + 'components.json', "{}");
  }
  try {
    await fs.access(basePath + 'components.json', fs.F_OK);
  } catch (e) {
    await fs.writeFile(processCwd + 'projects.json', "[]");
  }
  var isOldSettings;
  try {
    await fs.access(basePath + 'settings.json', fs.F_OK);
    isOldSettings = true;
  } catch (e) {
    await fs.writeFile(processCwd + 'settings.json', "[]");
  }
  let indexHtml = await fs.readFile(basePath + "index.html","utf8");
  await fs.writeFile(processCwd + 'index.html', indexHtml);
  await copyDir(basePath + "modules", processCwd + "modules");
  await copyDir(basePath + "components", processCwd + "components");
  if(isOldSettings) {
    let oldSettingsRaw = await fs.readFile(processCwd + "settings.json");
    let oldSettings = JSON.parse(oldSettingsRaw);
    await fs.writeFile('settings.json', JSON.stringify(Object.assign({}, settingsDefault, oldSettings)));
  }
  return true;
}