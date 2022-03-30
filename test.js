const fsPromises = require('fs').promises;
const glob = require("glob");
var authors = [];
glob("node_modules/**/package.json", {}, async (er, files) =>{
  for(var i = 0;i<files.length;i++) {
    var file = files [i];
    var p = await fsPromises.readFile(file,"utf8")
    var pkg = JSON.parse(p);
    var project = {
      author : pkg.author,
      library : pkg.name
    }
    authors.push(project);
  }
  fsPromises.writeFile("authors.json",JSON.stringify(authors,null,2))
    .then(res=>{
      console.log("done");
    })
    .catch(err=>{console.error(err)})
})
