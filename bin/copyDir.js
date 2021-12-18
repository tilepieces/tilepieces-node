// https://stackoverflow.com/a/64255382
module.exports = async function copyDir(src,dest){
  const { promises: fs } = require("fs")
  const path = require("path")
  await fs.mkdir(dest, {recursive: true});
  try {
    var entries = await fs.readdir(src, {withFileTypes: true});
  }
  catch(e){
    return;
  }
  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory() ?
      await copyDir(srcPath, destPath) :
      await fs.copyFile(srcPath, destPath);
  }
}