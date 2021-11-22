/*
'create' sets server in mapped projectName directory
if projectName directory doesn't exists, create new in workspace
return json type schema of directory , ex :
* {
*   "folder1" : {},
*   "folder2" : {},
*   "file.txt" : "file.txt"
* }
*
* IMPORTANT! IF THIS METHOD IS NOT CALLED, ANY OTHER METHOD ( EXCEPT SETTINGS SET/GET ) WILL NOT
* WORK!
* */
function create(projectName){
    return new Promise(async (resolve,reject)=> {
        console.log("[frontart storage => 'create']", projectName);
        projectName = projectName.replace(/&/g,"%26");
        fetch(API.create + "&projectName=" + projectName).then(res=>{
            handleResult(res)
                .then(r=>{
                    tilepieces.currentProject = projectName;
                    resolve(r);
                })
                .catch(e=>reject(e))
        },reject);
    })
}