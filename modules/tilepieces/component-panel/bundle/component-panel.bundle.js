window.tilepieces_tabs=function(options){var outside=options.el;var inside=outside.querySelector(".tab-buttons-inside");var tabPrev=outside.querySelector(".tab-prev");var tabNext=outside.querySelector(".tab-next");var tabSelected=inside.querySelector(".selected");var tabSelectedElement=!options.noAction&&tabSelected&&outside.ownerDocument.querySelector(tabSelected.getAttribute("href"));var maximumRight;var left=0;var throttle;function callbackObserver(){clearTimeout(throttle);throttle=setTimeout((()=>{if(!inside.lastElementChild)return;maximumRight=-Math.abs(inside.lastElementChild.offsetLeft+inside.lastElementChild.offsetWidth-inside.offsetWidth);var swapleft=left;tabSelected&&moveTabSelected(tabSelected);if(left!=swapleft)inside.style.transform="translateX("+left+"px)";displayArrows()}),32)}var resizeObserver=new ResizeObserver(callbackObserver);resizeObserver.observe(outside);var observer=new MutationObserver(callbackObserver);observer.observe(inside,{childList:true,subtree:true});tabPrev.addEventListener("click",(function(e){left+=inside.offsetWidth/2;if(left>0)left=0;inside.style.transform="translateX("+left+"px)";displayArrows()}));tabNext.addEventListener("click",(function(e){left-=inside.offsetWidth/2;if(left<maximumRight)left=maximumRight;inside.style.transform="translateX("+left+"px)";displayArrows()}));function moveTabSelected(tabSelected){var tabSelectedLeft=tabSelected.offsetLeft;var tabSelectedWidth=tabSelected.offsetWidth;var sum=-(tabSelectedLeft+tabSelectedWidth);var tabPrevOffsetWidth=tabPrev.offsetWidth||37;var tabNextOffsetWidth=tabNext.offsetWidth||37;if(-tabSelectedLeft>left-tabPrevOffsetWidth||sum<left-inside.offsetWidth+tabNextOffsetWidth){var delta=-tabSelectedLeft+tabPrevOffsetWidth;left=delta>0?0:delta<maximumRight?maximumRight:delta}}function displayArrows(e){if(inside.scrollWidth<=inside.offsetWidth){if(left){left=0;inside.style.transform="translateX(0px)"}tabPrev.style.display="none";tabNext.style.display="none";return}if(left==0)tabPrev.style.display="none";else tabPrev.style.display="block";if(left<maximumRight){left=maximumRight;inside.style.transform="translateX("+left+"px)"}if(left==maximumRight)tabNext.style.display="none";else tabNext.style.display="block"}inside.addEventListener("click",(e=>{var target=e.target.closest("a");if(!target)return;e.preventDefault();if(target!=tabSelected){options.onSelect&&options.onSelect(e,target);if(options.noAction)return;if(tabSelected){tabSelected.classList.remove("selected");tabSelectedElement.hidden=true;if(tabSelectedElement.style.display)tabSelectedElement.style.display=""}tabSelected=target;tabSelectedElement=target.ownerDocument.querySelector(tabSelected.getAttribute("href"));tabSelectedElement.hidden=false;if(tabSelectedElement.style.display)tabSelectedElement.style.display=options.display||"block";tabSelected.classList.add("selected");var swapleft=left;moveTabSelected(tabSelected);if(left!=swapleft){inside.style.transform="translateX("+left+"px)";displayArrows()}}}))};const opener=window.opener||window.top||window;const app=opener.tilepieces;const dialog=opener.dialog;const templatesDOM=document.querySelectorAll("template");let templates={};const textPermittedPhrasingTags=app.utils.textPermittedPhrasingTags;const textPermittedFlowTags=app.utils.textPermittedFlowTags;for(var i=0;i<templatesDOM.length;i++){var v=templatesDOM[i];templates[v.dataset.id]=v.content}tilepieces_tabs({el:document.getElementById("tab-component")});const tagsSection=document.getElementById("standard-tags");const buttons=[...tagsSection.querySelectorAll("button.first-button")];const utf8CharsSection=document.getElementById("utf-8-characters");const utf8CharsDetails=[...utf8CharsSection.querySelectorAll("details")];const insertionModeInput=document.getElementById("insertion-mode");const componentSection=document.getElementById("components");const componentSectionRoot=componentSection.querySelector("ul");const componentChildTemplate=document.getElementById("component-child");const newTagNameInput=document.getElementById("new-tag-name");const addNewTagForm=document.getElementById("add-new-tag-form");const addNewTagFormSmall=addNewTagForm.querySelector("small");const addNewTagFormButton=addNewTagForm.querySelector("button[type=submit]");componentSectionRoot.hidden=!app.elementSelected;insertionModeInput.value=app.insertionMode;let componentModel={components:turnComponentsToArray(app.localComponents)||[]};const componentTemplate=new opener.TT(componentSection,componentModel);opener.addEventListener("highlight-click",(e=>{selectButtonsToInsert(app.selectorObj);newTagNameInput.disabled=false;addNewTagFormButton.disabled=false}));opener.addEventListener("edit-mode",(e=>{if(app.editMode&&app.elementSelected){selectButtonsToInsert(app.selectorObj);newTagNameInput.disabled=false;addNewTagFormButton.disabled=false}else{newTagNameInput.disabled=true;addNewTagFormButton.disabled=true}}));opener.addEventListener("deselect-element",(e=>{buttons.forEach((v=>v.disabled=true));utf8CharsDetails.forEach((detail=>{detail.open&&detail.removeAttribute("open");detail.classList.add("disabled")}));newTagNameInput.disabled=true;addNewTagFormButton.disabled=true;componentSectionRoot.hidden=true}));opener.addEventListener("WYSIWYG-start",(e=>{selectButtonsContentEditable(e.detail);componentSectionRoot.hidden=true;newTagNameInput.disabled=true;addNewTagFormButton.disabled=true}));opener.addEventListener("WYSIWYG-end",(()=>{selectButtonsToInsert(app.selectorObj);newTagNameInput.disabled=false;addNewTagFormButton.disabled=false}));opener.addEventListener("content-editable-end",(()=>{utf8CharsDetails.forEach((detail=>{detail.open&&detail.removeAttribute("open");detail.classList.add("disabled")}));if(app.elementSelected)componentSectionRoot.hidden=false}));if(app.lastEditable&&app.lastEditable.el)selectButtonsContentEditable(app.lastEditable.el);if(app.elementSelected)selectButtonsToInsert(app.selectorObj);function changeComponents(){componentTemplate.set("components",turnComponentsToArray(app.localComponents)||[])}opener.addEventListener("project-setted",changeComponents);opener.addEventListener("settings-updated",changeComponents);async function addComponentCss(component,index,dependenciesFlat){var currentDoc=app.core.currentDocument;try{var toRemove=currentDoc.querySelectorAll(`[${app.componentAttribute}="${component.name}"]`)}catch(e){console.error(e);opener.dialog.open(e);return}let setCurrentStylesheet;toRemove.forEach((v=>{if(v.tagName=="LINK"||v.tagName=="STYLE"){if(app.core.currentStyleSheet?.ownerNode==v)setCurrentStylesheet=true;app.core.htmlMatch.removeChild(v)}}));var linkEl=await getBundleFromComponent(component,"stylesheet","href","link");var oldBundleLinkDep=dependenciesFlat[index-1];var oldBundleLink;if(oldBundleLinkDep){oldBundleLink=currentDoc.querySelector(`link[${app.componentAttribute}="${oldBundleLinkDep.name}"]`);oldBundleLink&&app.core.htmlMatch.after(oldBundleLink,linkEl)}if(!oldBundleLink){for(var obli=index+1;obli<dependenciesFlat.length;obli++){oldBundleLink=currentDoc.querySelector(`link[${app.componentAttribute}="${dependenciesFlat[obli].name}"]`);if(oldBundleLink)break}if(oldBundleLink)app.core.htmlMatch.before(oldBundleLink,linkEl);else app.core.htmlMatch.append(currentDoc.head,linkEl)}if(setCurrentStylesheet){await app.core.setCurrentStyleSheet(linkEl)}}async function addComponentHTML(component){var elementSelected=app.elementSelected.nodeType!=1?app.elementSelected.parentNode:app.elementSelected;if(!component.html||!elementSelected&&!component.fixedHTML)return;var currentDoc=app.core.currentDocument;var newElText=await app.storageInterface.read((component.path||"")+"/"+component.html);if(component.parseHTML){try{var functionToParse=await app.storageInterface.read((component.path||"")+"/"+component.parseHTML);var HTMLText=newElText;var customParseFunction=new Function("HTMLText","tilepieces","return ("+functionToParse+")(HTMLText, tilepieces)");HTMLText=customParseFunction(HTMLText,app);if(typeof HTMLText!=="string"){console.error("[HTMLText received] : ",HTMLText);throw"HTMLText received is not a string"}newElText=HTMLText}catch(e){console.error(e)}}try{var toRemove=currentDoc.querySelectorAll(component.selector||`[${app.componentAttribute}="${component.name}"]`)}catch(e){console.error(e);opener.dialog.open(e);return}var fixedPlaceholder;var indexHTML=0;toRemove.forEach(((v,i)=>{if(v.tagName!="LINK"&&v.tagName!="STYLE"&&(v.tagName!="SCRIPT"||app.utils.javascriptMimeTypes.indexOf(v.type)==-1)&&component.fixedHTML){if(indexHTML==0){fixedPlaceholder=app.core.currentDocument.createComment(component.name+" placeholder");app.core.htmlMatch.replaceWith(v,fixedPlaceholder)}else app.core.htmlMatch.removeChild(v);indexHTML++}}));var parser=new DOMParser;var doc=parser.parseFromString(newElText,"text/html");var fragment=currentDoc.createDocumentFragment();doc.querySelectorAll("link").forEach((l=>l.remove()));doc.querySelectorAll("script").forEach((s=>{if(app.utils.javascriptMimeTypes.indexOf(s.type)>-1)s.remove()}));[...doc.body.children].forEach((v=>{v.setAttribute(app.componentAttribute,component.name);fragment.append(v)}));var newHTMLElement=fragment.children[0];if(component.fixedHTML){if(fixedPlaceholder){app.core.htmlMatch.insertAdjacentElement(fixedPlaceholder,"after",fragment);app.core.htmlMatch.removeChild(fixedPlaceholder)}else{var scriptToAppendBefore,scriptMatch;var scriptsToAppendBefore=app.core.htmlMatch.source.querySelectorAll("body > script");scriptToAppendBefore=scriptsToAppendBefore?[...scriptsToAppendBefore].find((s=>app.utils.javascriptMimeTypes.indexOf(s.type)>-1)):null;if(scriptToAppendBefore)scriptMatch=app.core.htmlMatch.match(scriptToAppendBefore,false,false,true);app.core.htmlMatch.insertAdjacentElement(scriptMatch||app.core.currentDocument.body,scriptMatch?"before":"append",fragment)}}else{var iel=0;var el=app.cssSelectorObj.composedPath[iel];while(el.tagName.match(app.utils.notEditableTags)||el.tagName.match(app.utils.notInsertableTags)){iel++;el=app.cssSelectorObj.composedPath[iel]}var elWhereInsert=el.nodeName=="HTML"?el.ownerDocument.body:el;var insertionMode=app.insertionMode;if(elWhereInsert.tagName=="BODY"&&insertionMode=="before")insertionMode="prepend";else if(elWhereInsert.tagName=="BODY"&&insertionMode=="after")insertionMode="append";app.core.htmlMatch.insertAdjacentElement(elWhereInsert,insertionMode,fragment)}return newHTMLElement}async function addComponentJs(component,index,dependenciesFlat){var currentDoc=app.core.currentDocument;try{var toRemove=currentDoc.querySelectorAll(`[${app.componentAttribute}="${component.name}"]`)}catch(e){console.error(e);opener.dialog.open(e);return}let setCurrentStylesheet;toRemove.forEach((v=>{if(v.tagName=="SCRIPT"&&app.utils.javascriptMimeTypes.indexOf(v.type)>-1){app.core.htmlMatch.removeChild(v)}}));var scriptEl=await getBundleFromComponent(component);var oldBundleScriptDep=dependenciesFlat[index-1];var oldBundleScript;if(oldBundleScriptDep){oldBundleScript=findBundleScripts(oldBundleScriptDep.name);oldBundleScript&&app.core.htmlMatch.after(oldBundleScript,scriptEl)}if(!oldBundleScript){for(var obsi=index+1;obsi<dependenciesFlat.length;obsi++){oldBundleScript=findBundleScripts(dependenciesFlat[obsi].name);if(oldBundleScript)break}if(oldBundleScript)app.core.htmlMatch.before(oldBundleScript,scriptEl);else app.core.htmlMatch.append(currentDoc.body,scriptEl)}}componentSection.addEventListener("click",(e=>{var t=e.target;if(!t.classList.contains("component-highlight"))return;e.preventDefault();var c=t.__component;var rDS=app.utils.getResourceAbsolutePath;var template=`\n    <ul>\n    <li><h2>${c.name}<h2></li>\n    <li>description:<b>${c.name}</b></li>\n    <li>version: <b>${c.version}</b></li>\n    ${c.website?`<li>website: <a href="${c.website}" target="_blank">${c.website}</a></li>`:""}\n    <li>${c.html?`<iframe src=${rDS(c.path+"/"+c.html)}></iframe></li><li><b>HTML is fixed:</b><span>${c.fixedHTML}</span></li>`:"</li>"}\n    ${c.bundle.stylesheet.href?`<h3>Bundle stylesheet</h3>\n<li><a href="${rDS(c.path+"/"+c.bundle.stylesheet.href)}" target="_blank">${c.bundle.stylesheet.href}</a></li>\n<li><pre><code>&lt;link ${Object.keys(c.bundle.stylesheet).map((s=>`${s}=${c.bundle.stylesheet[s]}`)).join(" ")}/&gt;</code></pre></li>`:""}\n    ${c.bundle.script.src?`<h3>Bundle script</h3>\n<li><a href="${rDS(c.path+"/"+c.bundle.script.src)}" target="_blank">${c.bundle.script.src}</a></li>\n<li><pre><code>&lt;link ${Object.keys(c.bundle.script).map((s=>`${s}=${c.bundle.script[s]}`)).join(" ")}/&gt;</code></pre></li>`:""}\n    </ul>`;dialog.open(template)}));async function getBundleFromComponent(component,resourceType="script",resourceAttrRef="src",tagType="script"){var componentPath=getComponentPath(component);var scriptModel=Object.assign({},component.bundle[resourceType]);var src=scriptModel[resourceAttrRef];var pathRelativeToProject=componentPath+(componentPath&&!componentPath.endsWith("/")&&!src.startsWith("/")?"/":"")+src;var DOMel=app.core.currentDocument.createElement(tagType);scriptModel[resourceAttrRef]=pathRelativeToProject;if(tagType=="link")scriptModel.rel="stylesheet";for(var k in scriptModel){DOMel.setAttribute(k,scriptModel[k])}DOMel.setAttribute(app.componentAttribute,component.name);return DOMel}function getDependenciesFlat(component,dependenciesFlat=[],startComponent=null){var name=component.name;if(component.dependencies){for(var i=component.dependencies.length-1;i>=0;i--){var nameDep=component.dependencies[i];var pkgDep=app.localComponentsFlat[nameDep];if(!pkgDep)throw"Dependency '"+nameDep+"' needed by '"+name+"' is not present in local components";var indexOfPkgDep=dependenciesFlat.indexOf(pkgDep);var indexOfMainComp=dependenciesFlat.indexOf(component);if(indexOfPkgDep<0||indexOfPkgDep>indexOfMainComp){indexOfPkgDep>-1&&dependenciesFlat.splice(indexOfPkgDep,1);dependenciesFlat.unshift(pkgDep);dependenciesFlat=getDependenciesFlat(pkgDep,dependenciesFlat,startComponent||component)}}}var pkg=app.localComponentsFlat[name];dependenciesFlat.indexOf(pkg)<0&&dependenciesFlat.push(pkg);return dependenciesFlat}async function getFiles(globs,project){var search=await app.storageInterface.search(project.path,globs,null);var files=search.searchResult;var f=[];for(var i=0;i<files.length;i++){var filePath=files[i];var file=await app.storageInterface.read(filePath);f.push({path:filePath,file:file})}return f}async function getTagsFromComponent(component,resourceType="scripts",resourceAttrRef="src",tagType="script"){var scripts=component.sources[resourceType];var componentPath=getComponentPath(component);var elements=[];for(var i=0;i<scripts.length;i++){var s=scripts[i];var srcOrHref=s[resourceAttrRef];if(!srcOrHref)continue;var files=await getFiles(srcOrHref,component.name);for(var iF=0;iF<files.length;iF++){var file=files[i];var pathRelativeToProject=componentPath+file.path;var script=app.core.currentDocument.createElement(tagType);for(var k in s){script.setAttribute(k,s[k])}script.setAttribute(resourceAttrRef,pathRelativeToProject);if(tagType=="link")script.rel="stylesheet";script.setAttribute(app.componentAttribute,component.name);elements.push(script)}}return elements}async function insertComponent(component,index,dependenciesFlat,dependenciesInBundle){var currentDoc=app.core.currentDocument;try{var toRemove=currentDoc.querySelectorAll(`[${app.componentAttribute}="${component.name}"]`)}catch(e){console.error(e);opener.dialog.open(e);return}let setCurrentStylesheet;toRemove.forEach((v=>{if((v.tagName=="LINK"||v.tagName=="SCRIPT"&&app.utils.javascriptMimeTypes.indexOf(v.type)>-1||component.fixedHTML)&&app.core.currentDocument.contains(v)){if(app.core.currentStyleSheet?.ownerNode==v)setCurrentStylesheet=true;app.core.htmlMatch.removeChild(v)}}));var newHTMLElement;var elementSelected=app.elementSelected.nodeType!=1?app.elementSelected.parentNode:app.elementSelected;if(component.html){if(app.editMode=="selection"&&!app.contenteditable&&elementSelected&&!elementSelected.closest("head")){var iel=0;var el=app.cssSelectorObj.composedPath[iel];while(el.tagName.match(app.utils.notEditableTags)||el.tagName.match(app.utils.notInsertableTags)){iel++;el=app.cssSelectorObj.composedPath[iel]}var elWhereInsert=component.fixedHTML?el.ownerDocument.body:el.nodeName=="HTML"?el.ownerDocument.body:el;var insertionMode=app.insertionMode;var scriptToAppendBefore,scriptMatch;var scriptsToAppendBefore=app.core.htmlMatch.source.querySelectorAll("body > script");scriptToAppendBefore=scriptsToAppendBefore?[...scriptsToAppendBefore].find((s=>app.utils.javascriptMimeTypes.indexOf(s.type)>-1)):null;if(scriptToAppendBefore)scriptMatch=app.core.htmlMatch.match(scriptToAppendBefore,false,false,true);if(component.fixedHTML){elWhereInsert=scriptMatch||elWhereInsert;insertionMode=scriptMatch?"before":"append"}if(elWhereInsert.tagName=="BODY"&&insertionMode=="before")insertionMode="prepend";else if(elWhereInsert.tagName=="BODY"&&insertionMode=="after")insertionMode="append";if(elWhereInsert.tagName=="BODY"&&insertionMode=="append"&&scriptMatch){elWhereInsert=scriptMatch;insertionMode="before"}var newElText=await app.storageInterface.read((component.path||"")+"/"+component.html);if(component.parseHTML){try{var functionToParse=await app.storageInterface.read((component.path||"")+"/"+component.parseHTML);var HTMLText=newElText;var customParseFunction=new Function("HTMLText","tilepieces","return ("+functionToParse+")(HTMLText, tilepieces)");HTMLText=customParseFunction(HTMLText,app);if(typeof HTMLText!=="string"){console.error("[HTMLText received] : ",HTMLText);throw"HTMLText received is not a string"}newElText=HTMLText}catch(e){console.error(e)}}var parser=new DOMParser;var doc=parser.parseFromString(newElText,"text/html");var fragment=currentDoc.createDocumentFragment();doc.querySelectorAll("link").forEach((l=>l.remove()));doc.querySelectorAll("script").forEach((s=>{if(app.utils.javascriptMimeTypes.indexOf(s.type)>-1)s.remove()}));[...doc.body.children].forEach((v=>{v.setAttribute(app.componentAttribute,component.name);fragment.append(v)}));newHTMLElement=fragment.children[0];app.core.htmlMatch.insertAdjacentElement(elWhereInsert,insertionMode,fragment)}}if(dependenciesInBundle&&component!=dependenciesInBundle.main)return newHTMLElement;if(component.bundle&&component.bundle.script&&component.bundle.script.src){var scriptEl=await getBundleFromComponent(component);var oldBundleScriptDep=dependenciesFlat[index-1];var oldBundleScript;if(oldBundleScriptDep){oldBundleScript=findBundleScripts(oldBundleScriptDep.name);oldBundleScript&&app.core.htmlMatch.after(oldBundleScript,scriptEl)}if(!oldBundleScript){for(var obsi=index+1;obsi<dependenciesFlat.length;obsi++){oldBundleScript=findBundleScripts(dependenciesFlat[obsi].name);if(oldBundleScript)break}if(oldBundleScript)app.core.htmlMatch.before(oldBundleScript,scriptEl);else app.core.htmlMatch.append(currentDoc.body,scriptEl)}}if(component.bundle&&component.bundle.stylesheet&&component.bundle.stylesheet.href){var linkEl=await getBundleFromComponent(component,"stylesheet","href","link");var oldBundleLinkDep=dependenciesFlat[index-1];var oldBundleLink;if(oldBundleLinkDep){oldBundleLink=currentDoc.querySelector(`link[${app.componentAttribute}="${oldBundleLinkDep.name}"]`);oldBundleLink&&app.core.htmlMatch.after(oldBundleLink,linkEl)}if(!oldBundleLink){for(var obli=index+1;obli<dependenciesFlat.length;obli++){oldBundleLink=currentDoc.querySelector(`link[${app.componentAttribute}="${dependenciesFlat[obli].name}"]`);if(oldBundleLink)break}if(oldBundleLink)app.core.htmlMatch.before(oldBundleLink,linkEl);else app.core.htmlMatch.append(currentDoc.head,linkEl)}if(setCurrentStylesheet){await app.core.setCurrentStyleSheet(linkEl)}}if(newHTMLElement)return newHTMLElement}componentSection.addEventListener("click",(async e=>{var target=e.target;var t=target.closest(".components-children");if(!t)return;var opened=t.classList.toggle("open");var tParent=t.parentNode;if(!opened){var previous=tParent.querySelector("ul");previous&&previous.remove();return}var component=t.__component;var childrens=component.components;var doc=t.getRootNode();var newList=doc.createElement("ul");for(var childName in childrens){var childComponentData=childrens[childName];var model={component:childComponentData};var li=componentChildTemplate.content.cloneNode(true);new opener.TT(li,model);newList.appendChild(li)}tParent.appendChild(newList)}));insertionModeInput.addEventListener("change",(e=>{app.insertionMode=insertionModeInput.value;app.elementSelected&&selectButtonsToInsert(app.selectorObj)}));async function clickOnComponent(e){var target=e.target;var isAddCss=target.classList.contains("add-component-css");var isAddJs=target.classList.contains("add-component-js");var isAddHtml=target.classList.contains("add-component-html");var isAddBundle=target.classList.contains("add-component-bundle");if(!isAddCss&&!isAddJs&&!isAddHtml&&!isAddBundle)return;opener.dialog.open("importing component in project...",true);var name=target.dataset.name;var component=app.localComponentsFlat[name];if(!component&&app.isComponent&&name==app.isComponent.name)component=app.isComponent;var newHTMLElement;try{var dependenciesFlat=getDependenciesFlat(component);for(var d=0;d<dependenciesFlat.length;d++){var c=dependenciesFlat[d];newHTMLElement=(isAddHtml||isAddBundle)&&await addComponentHTML(c);if(component.addDependenciesToBundles&&c!=component)continue;(isAddCss||isAddBundle)&&c.bundle?.stylesheet?.href&&await addComponentCss(c,d,dependenciesFlat);(isAddJs||isAddBundle)&&c.bundle?.script?.src&&await addComponentJs(c,d,dependenciesFlat)}}catch(e){opener.dialog.close();console.error("[error in reading and importing script src from component]",e);opener.alertDialog("error in reading and importing script src from component",true);return}opener.dialog.open("component installed correctly")}componentSection.addEventListener("click",clickOnComponent);utf8CharsSection.addEventListener("click",(e=>{if(e.target.tagName!="BUTTON")return;var empyChar=e.target.dataset.emptyCharDec;var string=empyChar?String.fromCharCode(empyChar):e.target.textContent;opener.wysiwyg.insertString(string);app.lastEditable.el.dispatchEvent(new Event("input"));app.lastEditable.el.focus()}));addNewTagForm.addEventListener("submit",(e=>{e.preventDefault();var newTag=newTagNameInput.value.trim().toUpperCase();if(!newTag.length)return;var composedPath=app.selectorObj.composedPath;var composedPathSliced=composedPath;if(app.insertionMode=="after"||app.insertionMode=="before")composedPathSliced=composedPath.slice(1,composedPath.length);var isNotAdmittedHere=app.elementSelected.nodeType!=1||app.utils.notAdmittedTagNameInPosition(newTag,composedPathSliced);if(isNotAdmittedHere)addNewTagFormSmall.classList.add("show");else{var newEl;if(templates[newTag])newEl=templates[newTag].cloneNode(true);else{newEl=app.elementSelected.getRootNode().createElement(newTag);newEl.innerHTML=!newTag.match(app.utils.notEditableTags)?"This is a "+newTag+" tag":""}app.core.htmlMatch.insertAdjacentElement(app.elementSelected,app.insertionMode,newEl);newTagNameInput.value=""}}));function removeNewTagErrorBanner(){addNewTagFormSmall.classList.remove("show")}newTagNameInput.addEventListener("input",removeNewTagErrorBanner);newTagNameInput.addEventListener("focus",removeNewTagErrorBanner);buttons.forEach((b=>{var tagName=b.textContent.trim();var node=null;if(b.hasAttribute("data-component")&&templates[tagName])node=templates[tagName].cloneNode(true);if(tagName.match(app.utils.phrasingTags))opener.wysiwyg.buttonTextLevelTag(b,tagName,tagName=="A"?[{name:"href",value:"#"}]:[],node);b.addEventListener("click",(e=>{var elementSelected=app.elementSelected.nodeType!=1?app.elementSelected.parentNode:app.elementSelected;if(app.contenteditable||!elementSelected)return;if(elementSelected.closest("head"))return;var elWhereInsert=elementSelected.nodeName=="HTML"?elementSelected.ownerDocument.body:app.elementSelected;var insertionMode=app.insertionMode;var newEl=node?node.cloneNode(true):elementSelected.getRootNode().createElement(tagName);var toDispatch=node?newEl.children[0]:newEl;if(!tagName.match(app.utils.notEditableTags)&&!node)newEl.innerHTML="This is a "+tagName+" tag";tagName=="A"&&newEl.setAttribute("href","#");app.core.htmlMatch.insertAdjacentElement(elWhereInsert,insertionMode,newEl)}))}));function findBundleScripts(name){var possibleScripts=app.core.currentDocument.querySelectorAll(`script[${app.componentAttribute}="${name}"]`);for(var i=0;i<possibleScripts.length;i++){var possibleScript=possibleScripts[i];if(app.utils.javascriptMimeTypes.indexOf(possibleScript.type)>-1)return possibleScript}}function getComponentPath(component){var path=component.path?component.path.startsWith("/")?component.path.substring(1):component.path:"";if(!path.endsWith("/"))path+="/";return app.relativePaths?app.utils.getRelativePath(app.utils.getDocumentPath(),path):"/"+path}function selectButtonsContentEditable(elContentEditable){newTagNameInput.disabled=true;addNewTagFormButton.disabled=true;utf8CharsDetails.forEach((detail=>detail.classList.remove("disabled")));buttons.forEach((v=>{var tagName=v.textContent.trim();v.disabled=!tagName.match(app.utils.phrasingTags)||tagName==elContentEditable.tagName}))}function selectButtonsToInsert(selectorObject){if(app.contenteditable)return;var selectTagName=selectorObject.target.tagName;var composedPath=selectorObject.composedPath;var isMatching=selectorObject.match&&(selectorObject.match.HTML||selectorObject.target.tagName=="BODY");componentSectionRoot.hidden=!isMatching||selectorObject.target.tagName=="HTML"||selectorObject.target.tagName=="HEAD"&&(app.insertionMode=="after"||app.insertionMode=="before")||selectorObject.target.tagName=="BODY"&&(app.insertionMode=="after"||app.insertionMode=="before");newTagNameInput.disabled=componentSectionRoot.hidden;addNewTagFormButton.disabled=componentSectionRoot.hidden;var composedPathSliced=composedPath;if(app.insertionMode=="after"||app.insertionMode=="before")composedPathSliced=composedPath.slice(1,composedPath.length);buttons.forEach((button=>{button.classList.remove("selected");var tagName=button.textContent.trim();var directParentTagName=composedPath[0].tagName;var HTMLHEADBODYRestrinction=directParentTagName&&directParentTagName.match(/(HTML|HEAD)$/)||directParentTagName=="BODY"&&(app.insertionMode=="after"||app.insertionMode=="before");var isTextNodeType=composedPath[0].nodeType!=1&&(app.insertionMode=="prepend"||app.insertionMode=="append");if(!isMatching||HTMLHEADBODYRestrinction||isTextNodeType)button.disabled=true;else button.disabled=app.utils.notAdmittedTagNameInPosition(tagName,composedPathSliced)}))}function turnComponentsToArray(comps,isDep=false){var compsOrdered=Object.keys(comps).sort(((a,b)=>a.localeCompare(b))).reduce(((obj,key)=>{obj[key]=comps[key];return obj}),{});var toArray=[];var frameResourcePath=app.frameResourcePath();if(frameResourcePath[0]!="/")frameResourcePath="/"+frameResourcePath;if(!frameResourcePath.endsWith("/"))frameResourcePath=frameResourcePath+"/";for(var key in compsOrdered){var c=Object.assign({},compsOrdered[key]);toArray.push(c);if(c.html){var p=c.path?c.path[0]=="/"?c.path:"/"+c.path:"/";c.__iframe_path=(frameResourcePath+p+"/"+c.html).replace(/\/\//g,"/")}if(c.components)c.components=turnComponentsToArray(c.components,true)}return toArray}