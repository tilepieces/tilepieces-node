module.exports = (path)=> {
  const fs = require('fs');
  var componentsExists = fs.existsSync(path + "/" + 'components.json');
  if (!componentsExists)
    return;
  var projectsExists = fs.existsSync(path + "/" + 'projects.json');
  if (!projectsExists)
    return;
  var settingsExists = fs.existsSync(path + "/" + 'settings.json');
  if (!settingsExists)
    return
  var indexExists = fs.existsSync(path + "/" + 'index.html');
  if (!indexExists)
    return
  return true;
}