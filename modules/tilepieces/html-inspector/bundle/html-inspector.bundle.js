"use strict";
(()=>{
HtmlTreeBuilder.prototype.collapseChildren = function () {
  var carets = this.selected.querySelectorAll(".html-tree-builder__caret");
  [...carets].forEach(v => v.classList.remove("open"));
}
let opener = window.opener || (window.parent || window);
// tree builder originally conceived as singleton ( as a simple function ).
// Later changed as constructor, however at the moment only one instance for document is supported.
// these below are the variables that are setted in constructor and shared among the functions
let htmlTreeBuilderTarget; // DOM target
let showEmptyNodes = null;
const voidElementsRegex = /^(AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TRACK|WBR)$/;

function createAttributes(attrs) {
  var attrsTokens = [];
  var returnString = "";
  for (var i = 0; i < attrs.length; i++)
    attrsTokens[i] = `<span class="html-tree-builder-attribute" spellcheck="false">` +
      `<span class="attribute-key" data-key="${attrs[i].name}">${attrs[i].name}</span>` +
      `="<span class="attribute-value" data-value="${attrs[i].value}">${attrs[i].value}</span>"</span>`;

  returnString +=
    `<span class="html-tree-builder-attributes ${attrsTokens.length ? `` : `no-pad`}">
            ${attrsTokens.join("&nbsp;")}</span>`;
  return returnString;
}
function createDocType(el) {
  if (el.doctype) {
    var doctype = {
      name: el.doctype.name,
      publicId: el.doctype.publicId,
      systemId: el.doctype.systemId
    };
    var html = '<!DOCTYPE ' + doctype.name;
    if (doctype.publicId.length) html += ' PUBLIC "' + doctype.publicId + '"';
    if (doctype.systemId.length) html += ' "' + doctype.systemId + '"';
    html += ">";
    return html;
  }
  return "<!DOCTYPE html>";
}
function createDocumentRoot(el) {
  var html = htmlTreeBuilderTarget.ownerDocument.createDocumentFragment();
  // creating doctype
  var documentDeclarationDiv = htmlTreeBuilderTarget.ownerDocument.createElement("div");
  documentDeclarationDiv.className = "html-tree-builder__doctype";
  documentDeclarationDiv.textContent = createDocType(el);
  createMenuToggler(documentDeclarationDiv);
  html.appendChild(documentDeclarationDiv);
  // creating html tag
  var htmlDiv = htmlTreeBuilderTarget.ownerDocument.createElement("div");
  htmlDiv.innerHTML = createElementRepresentation(el.documentElement);
  htmlDiv.className = "html-tree-builder-element html-tree-builder-el";
  htmlDiv["__html-tree-builder-el"] = el.documentElement;
  html.appendChild(htmlDiv);
  // creating head, body
  var headUl = htmlTreeBuilderTarget.ownerDocument.createElement("ul");
  headUl.appendChild(treeBuilder(el.head));
  html.appendChild(headUl);
  // creating body tag
  var bodyUl = htmlTreeBuilderTarget.ownerDocument.createElement("ul");
  bodyUl.className = "html-tree-builder-body";
  bodyUl.appendChild(treeBuilder(el.body));
  html.appendChild(bodyUl);
  return html;
}
function createElementRepresentation(target) {
  var closure = target.nodeName.match(voidElementsRegex) ? "/&gt;" : "&gt;";
  var attrRepr = createAttributes(target.attributes);
  return `<span>&lt;</span><span class="html-tree-builer__tag-span">` +
    `${target.tagName.toLowerCase()}</span>${attrRepr}` +
    `<span class="html-tree-builer__tag-span">${closure}</span>`;
}
function createMenuToggler(div,noCreateDrag) {
  var divWrapper = document.createElement("div");
  divWrapper.className = "menu-toggle-wrapper"
  if(!noCreateDrag) {
    var dragToggler = document.createElement("span");
    dragToggler.className = "html-tree-build-dragger";
    dragToggler.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
<g>
	<g>
		<g>
			<path style="fill:#727272;" d="M17.5,8.4c-0.4,0-0.7-0.1-1-0.4L12,3.4L7.5,7.8C7,8.4,6.1,8.4,5.6,7.8C5,7.3,5,6.4,5.6,5.9L11,0.5
			c0.5-0.5,1.4-0.5,1.9,0L18.4,6C19,6.6,19,7.4,18.4,8C18.2,8.2,17.8,8.4,17.5,8.4z"/>
		</g>
		<g>
			<path style="fill:#727272;" d="M12,11c-0.8,0-1.4-0.6-1.4-1.4l0-8.2c0-0.8,0.6-1.4,1.4-1.4c0.8,0,1.4,0.6,1.4,1.4l0,8.2
			C13.4,10.4,12.8,11,12,11z"/>
		</g>
	</g>
	<g>
		<g>
			<path style="fill:#727272;" d="M6.5,15.6c0.4,0,0.7,0.1,1,0.4l4.5,4.6l4.5-4.5c0.5-0.5,1.4-0.5,1.9,0c0.5,0.5,0.5,1.4,0,1.9
			L13,23.5c-0.5,0.5-1.4,0.5-1.9,0L5.6,18C5,17.4,5,16.6,5.6,16C5.8,15.8,6.2,15.6,6.5,15.6z"/>
		</g>
		<g>
			<path style="fill:#727272;" d="M12,13c0.8,0,1.4,0.6,1.4,1.4l0,8.2c0,0.8-0.6,1.4-1.4,1.4c-0.8,0-1.4-0.6-1.4-1.4l0-8.2
			C10.6,13.6,11.2,13,12,13z"/>
		</g>
	</g>
</g>
</svg>`;
    divWrapper.prepend(dragToggler);
  }
  var menuToggler = document.createElement("a");
  menuToggler.setAttribute("href", "javascript:void(0)");
  menuToggler.className = "menu-toggle";
  menuToggler.textContent = "..."
  divWrapper.prepend(menuToggler);
  div.prepend(divWrapper);
}
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function handleClick(e, $self) {
  if (e.target.classList.contains("html-tree-builder__caret"))
    return;
  if (e.target.closest(".menu-toggle-wrapper"))
    return;
  /* get target */
  var target = e.target.closest(".html-tree-builder-el");
  if ($self.preventDefaultClickOnMs && $self.preventDefaultClickOnMs(e, target))
    return;
  var multiselection = $self.multiselection;
  var multiselected = $self.multiselected;
  if (multiselection) {
    var multiSelectionIndex = $self.multiselected.findIndex(v => v.listEl == target);
    if (multiSelectionIndex > -1) {
      var el = $self.multiselected[multiSelectionIndex].el;
      $self.removeItemSelected(multiSelectionIndex);
      opener.dispatchEvent(
        new CustomEvent("html-tree-remove-multiselection", {
          detail: {
            el,
            index: multiSelectionIndex,
            target
          }
        })
      );
      return;
    }
  }
  if ($self.selected == target)
    return;
  if (multiselection &&
    multiselected.find(v => v.listEl.contains(target) || target.contains(v.listEl))) {
    console.warn("clicked inside an element already selected. quit");
    return;
  }
  // normal handling select el
  $self.toggleClassListHighlight(target);
  opener.dispatchEvent(
    new CustomEvent('html-tree-builder-click', {
      detail: {
        selected: target,
        target: target["__html-tree-builder-el"],
        e,
        multiselection
      }
    })
  );
}
HtmlTreeBuilder.prototype.expandRecursively = function () {
  openTreeRecursively(this.selected);
}
function getLevels(el, bodyRoot) {
  /*
  var levels = [el];
  while(el && el != bodyRoot){
      if((el.tagName == "HTML" && el.ownerDocument.defaultView.frameElement)||
          (el == el.ownerDocument.body && el != bodyRoot))
          el = el.ownerDocument.defaultView.frameElement;
      else
          el = el.parentNode;
      levels.unshift(el);
  }
  return levels;*/
  var levels = [];
  var swap = el;
  while (swap) {
    levels.unshift(swap);
    swap = swap.parentNode;
  }
  return levels
}
HtmlTreeBuilder.prototype.highlightElement = function (target, highlight = true) {
  //var treeBuilderDOMRepr = htmlTreeBuilderTarget.ownerDocument.querySelector(".html-tree-builder");
  var treeBuilderDOMRepr = htmlTreeBuilderTarget.children[0];
  //var rootElement = treeBuilderDOMRepr.querySelector(".html-tree-builder-body > li");
  var rootElement = treeBuilderDOMRepr;
  //var levels = getLevels(target,root || rootElement["__html-tree-builder-el"]);
  var levels = getLevels(target);
  levels.forEach((level) => {
    var caret = rootElement.querySelector(".html-tree-builder__caret");
    var li = caret.closest("li");
    if (!li.classList.contains("open"))
      openTree({target: caret});
    var ul = rootElement === treeBuilderDOMRepr ? rootElement : rootElement.querySelector("ul");
    // childrens are represented inside an ul tag ( except for the main html )
    [...ul.children].forEach((children) => {
      if (children["__html-tree-builder-el"] == level)
        rootElement = children;
      /*
      else if(children["__html-tree-builder-el"] &&
          children["__html-tree-builder-el"].nodeName == "IFRAME"){
      }
      */
      /*
      else if(children.classList.contains("html-tree-builder-body")) // we are inside an iframe representation
          if(children.children[0]["__html-tree-builder-el"] == level) // if the body is ancestor, assign it
              rootElement = children.children[0];
              */
    });
  });
  // get rootElement immediately visible by scrolling html-tree-builder container
  if (highlight) {
    this.toggleClassListHighlight(rootElement);
    //rootElement.querySelector(".html-tree-builder-element").scrollIntoView(false);
    var win = rootElement.ownerDocument.defaultView;
    var bound = rootElement.querySelector(".html-tree-builder__tag").getBoundingClientRect();
    win.scroll({
      top: bound.top + (bound.height / 2 ) + win.scrollY - (win.innerHeight / 2),
      left: 0,
      behavior: 'smooth'
    });
  }
  return rootElement;
}
function HtmlTreeBuilder(target, el, options = {}) {
  var isDoc = el.nodeType == 9;
  var $self = this;
  el = isDoc ? el.documentElement : el;
  target.innerHTML = "";
  htmlTreeBuilderTarget = target;
  var html = htmlTreeBuilderTarget.ownerDocument.createDocumentFragment();
  var ul = htmlTreeBuilderTarget.ownerDocument.createElement("ul");
  ul.className = "html-tree-builder";
  html.appendChild(ul);
  this.showEmptyNodes = options.showEmptyNodes;
  showEmptyNodes = options.showEmptyNodes;
  treeBuilder(el, ul);

  function hc(e) {
    handleClick(e, $self)
  }

  function mouseover(e) {
    var target = e.target.closest(".html-tree-builder-el");
    if (!target || !target["__html-tree-builder-el"]) return;
    htmlTreeBuilderTarget.dispatchEvent(
      new CustomEvent('html-tree-builder-mouseover', {
        detail: target["__html-tree-builder-el"]
      })
    );
  }

  function mouseout(e) {
    htmlTreeBuilderTarget.dispatchEvent(new Event('html-tree-builder-mouseout'));
  }

  target.appendChild(html);
  target.addEventListener("click", openTree);
  target.addEventListener("click", hc);
  target.addEventListener("mouseover", mouseover);
  target.addEventListener("mouseout", mouseout);
  if (isDoc) {
    var htmlTag = ul.children[0];
    htmlTag.querySelector(".html-tree-builder__caret").click();
    var ulChildrens = htmlTag.querySelector("ul").children;
    for (var HTMLchildrenI = 0; HTMLchildrenI < ulChildrens.length; HTMLchildrenI++) {
      var HTMLchildren = ulChildrens[HTMLchildrenI].children[0];
      if (HTMLchildren.dataset.tagName == "</body>") {
        var caret = HTMLchildren.querySelector(".html-tree-builder__caret");
        caret && caret.click();
        break;
      }
    }
  }
  this.preventDefaultClickOnMs = options.preventDefaultClickOnMs;
  this.target = target;
  this.selected = null;
  this.multiselected = [];
  this.multiselection = false;
  this.removeItemSelected = i => {
    if (typeof i === "undefined")
      i = this.multiselected.length - 1;
    var listEl = this.multiselected[i].listEl;
    listEl.classList.remove("html-tree-builder__highlight");
    this.multiselected.splice(i, 1);
    if (listEl == this.selected) {
      var newIndex = this.multiselected.length - 1;
      this.selected = newIndex > -1 ? this.multiselected[newIndex].listEl : null;
    }
  };
  this.removeMultiSelection = () => {
    this.multiselection = false;
    this.multiselected.forEach(v => v.listEl != this.selected && v.listEl.classList.remove("html-tree-builder__highlight"))
    this.multiselected = [];
  };
  this.activateMultiSelection = () => {
    this.multiselection = true;
    this.selected &&
    this.multiselected.push({listEl: this.selected, el: this.selected["__html-tree-builder-el"]});
  };
  this.clearMultiSelection = () => {
    this.multiselected.forEach(v => v.listEl != this.selected && v.listEl.classList.remove("html-tree-builder__highlight"))
    this.multiselected = [];
  };
  this.deSelect = () => {
    this.selected && this.selected.classList.remove("html-tree-builder__highlight");
    this.selected = null;
  };
  this.el = el;
  this.openTree = openTree;
  this.select = select;
  this.treeBuilder = treeBuilder;
  this.createAttributes = createAttributes;
  this.isInView = isInView;
  this.destroy = () => {
    target.removeEventListener("click", openTree);
    target.removeEventListener("click", hc);
    target.removeEventListener("mouseover", mouseover);
    target.removeEventListener("mouseout", mouseout);
    htmlTreeBuilderTarget = null;
  };
}

window.htmlTreeBuilder = (target, el, options) => {
  return new HtmlTreeBuilder(target, el, options);
}
function isInView(target) {
  return [...htmlTreeBuilderTarget.querySelectorAll("li")]
    .find(v => v["__html-tree-builder-el"] == target);
}
window.addEventListener("resize",e=>{
  var highlights = document.querySelectorAll(".html-tree-builder__highlight");
  highlights.forEach(h=>{
    var treeBuilderElement = h.querySelector(".html-tree-builder__tag");
    var toggleWrapper = h.querySelector(".menu-toggle-wrapper");
    toggleWrapper.style.height = treeBuilderElement.offsetHeight + "px";
  })
});
function openTree(e) {
  if (e.target.closest(".CodeMirror"))
    return;
  if (!e.target.classList.contains("html-tree-builder__caret"))
    return;
  var doc = htmlTreeBuilderTarget.ownerDocument;
  var win = doc.defaultView;
  e.preventDefault && e.preventDefault(); // this is an exposed method, could be called without an event
  var parent = e.target.closest("li");
  var ul = parent.querySelector("ul");
  if (parent.classList.contains("open")) {
    parent.classList.remove("open");
    ul && ul.remove();
  } else {
    parent.classList.add("open");
    if (!ul) {
      ul = doc.createElement("ul");
      parent.lastElementChild.before(ul);
      var el = parent["__html-tree-builder-el"];
      var attributeIs = el.getAttribute("is");
      if (el.tagName == "IFRAME") {
        var link = doc.createElement("a");
        link.href = "javascript:void(0)";
        link.className = "link-to-iframe";
        link.innerHTML = "<span>" + (el.src || '""') + "</span>";
        ul.append(link);
      } else if (el.shadowRoot || win.customElements.get(el.tagName.toLowerCase()) ||
        (attributeIs && win.customElements.get(attributeIs))) {
        var div = doc.createElement("div");
        div.className = "shadow-root";
        div.innerHTML = `<span>#shadow-root ${el.shadowRoot ? "(open)" : "(closed)"}</span>`;
        ul.append(div);
      } else {
        var frag = doc.createDocumentFragment();
        [...el.childNodes].forEach(obj => treeBuilder(obj, frag));
        ul.appendChild(frag);
      }
    }
  }
}
function openTreeRecursively(el) {
  var caret = el.querySelector(".html-tree-builder__caret");
  if (!caret)
    return;
  if (!caret.classList.contains("open"))
    openTree({target: caret});
  var ul = el.querySelector("ul");
  var carets = ul.querySelectorAll(".html-tree-builder-el");
  for (var i = 0; i < carets.length; i++)
    openTreeRecursively(carets[i])
}
function select(el) {
  htmlTreeBuilderTarget.innerHTML = "";
  var ul = htmlTreeBuilderTarget.ownerDocument.createElement("ul");
  ul.className = "html-tree-builder";
  ul.appendChild(treeBuilder(el));
  htmlTreeBuilderTarget.appendChild(ul);
  var caret = ul.querySelector(".html-tree-builder__caret");
  caret && openTree({target: caret});
}
function setTogglerPosition(div, target, menuToggler, spanClose) {
  if (!div) return;
  var menuTogglerLeft = div.getBoundingClientRect().left - target.getBoundingClientRect().left;
  menuToggler.style.left = "-" + menuTogglerLeft + "px";
  menuToggler.style.paddingLeft = menuTogglerLeft + "px";
  if (spanClose) {
    spanClose.style.left = "-" + menuTogglerLeft + "px";
    spanClose.style.paddingLeft = menuTogglerLeft + "px";
  }
}
HtmlTreeBuilder.prototype.toggleClassListHighlight = function (element) {
  var multiselection = this.multiselection;
  // toggle previous highlight class
  !multiselection && this.selected && this.selected.classList.remove("html-tree-builder__highlight");
  if(element){
    element.classList.add("html-tree-builder__highlight");
    var treeBuilderElement = element.querySelector(".html-tree-builder__tag");
    var toggleWrapper = element.querySelector(".menu-toggle-wrapper");
    toggleWrapper.style.height = treeBuilderElement.offsetHeight + "px";
  }
  this.multiselection &&
  !this.multiselected.find(v => v.listEl == element) &&
  this.multiselected.push({listEl: element, el: element["__html-tree-builder-el"]});
  if (element)
    this.selected = element;
}
function treeBuilder(el, whereAppend, t) {
  // document case
  /*
   if (el.nodeName == '#document')
   return createDocumentRoot(el);
   */
  var target = t || htmlTreeBuilderTarget;
  var doc = target.ownerDocument;
  var html = doc.createDocumentFragment();
  //exclude comments and empty text fragments
  if (!showEmptyNodes) {
    if (el.nodeName == "#text" && !el.nodeValue.trim().length)
      return html;
  }
  var li = doc.createElement("li");
  var div = doc.createElement("div");
  div.className = "html-tree-builder__tag";
  if (el.nodeName != "#text" && el.nodeName != "#comment")
    div.innerHTML = createElementRepresentation(el);
  else if (el.nodeName == "#text" && el.nodeValue.trim().length)
    div.innerHTML = "<span class='html-tree-builder-node-value' spellcheck='false'>" +
      escapeHtml(el.nodeValue) + "</span>";
  else if (el.nodeName == "#text")
    div.innerHTML = "<span><i><small>empty node</small></i></span>";
  else if (el.nodeName == "#comment")
    div.innerHTML = "<span class='html-tree-builder-comment' spellcheck='false'>" +
      escapeHtml(el.nodeValue) + "</span>";
  li.appendChild(div);
  // create caret if childNodes or is an iframe
  if (el.childNodes.length || el.nodeName == "IFRAME") {
    var caret = doc.createElement("span");
    caret.className = "html-tree-builder__caret";
    div.appendChild(caret)
  }
  // add a css class to represent the closure tag
  // css ::after reads from dataset the tag name ( only when closed)
  if (el.tagName && !el.tagName.match(voidElementsRegex)) {
    div.dataset.tagName = "</" + el.tagName.toLowerCase() + ">";
    div.className += " html-tree-builder-element";
    var spanClose = doc.createElement("span");
    spanClose.className = "span-close";
    spanClose.textContent = "</" + el.tagName.toLowerCase() + ">";
    li.appendChild(spanClose);
  }
  li.classList.add("html-tree-builder-el");
  li["__html-tree-builder-el"] = el;
  createMenuToggler(div,el.tagName?.match(/^(HEAD|BODY|HTML)$/));
  html.appendChild(li);
  whereAppend.appendChild(html);
  return li;
}

})();
function events(){
    var events = {};
    return {
        on : function (name, callback) {
            if (!events[name])
                events[name] = [];
            events[name].push(callback);
            return events[name].length;
        },
        dispatch : function (name, data) {
            if ( !events[name] )
                return false;
            var eventArray = events[name];
            for (var i = 0; i < eventArray.length; i++)
                events[name][i](data);
        },
        get events(){
            return events
        },
        destroy : function(name,id){
            var response = false;
            if ( typeof name === 'undefined' || !events[name] )
                return response;
            else if ( typeof id === 'undefined' && events[name])
                response = delete events[name];
            else if( events[name] && events[name][id] )
                response = events[name].splice(id);

            return response;
        }
    }
}
// Get document-relative position by adding viewport scroll to viewport-relative gBCR
// From jQuery.fn.extend( {offset});
// https://code.jquery.com/jquery-3.5.0.js
// https://api.jquery.com/offset/
function offset(target){
  var rect = target.getBoundingClientRect();
  var win = target.ownerDocument.defaultView;
  return {
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset
  };
}
(()=>{
// private - defaults
// prova
var defaults = {
    preventMouseOut : false,
    noBorderWindowEscape : false,
    onlyHandler : false,
    handle : null,
    grabCursors : true,
    drop : true,
    dragNoTransform : false,
    dragElementConstraint : function(){return false},
    constraint : function(){return false},
    target : null,
    grabClass : '__drag-cursor-grab',
    grabbingClass : '__drag-cursor-grabbing',
    noDrop : false,
    noDropClass : '__drag-cursor-no-drop',
    styleDrop : '__drag__drop-overlay',
    insertElement : 'beforeend'
};
//var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
// private - mouse case
function mouse(HandlerEl){
    var $self = this;
    var options = $self.options;
    var frameElement = HandlerEl.ownerDocument.defaultView.frameElement;
    function mousedown(e){
        if(options.onlyHandler && e.target !== HandlerEl)
            return;
        if(options.handle && !e.target.closest(options.handle))
            return;
        var ev = {
            x : e.pageX,
            y : e.pageY,
            target : e.target,
            ev : e
        };
        if($self.preventMouseOut)
            $self.preventMouseOut.style.display = "block";
        $self.events.dispatch("down",ev);
        HandlerEl.ownerDocument.addEventListener("mouseup",mouseup);
        HandlerEl.ownerDocument.addEventListener('mousemove',mousemove);
        frameElement &&
        frameElement.addEventListener("mouseout",mouseup);
    }
    HandlerEl.addEventListener("mousedown",mousedown);
    function mouseup(e){
        if(options.grabbingClass) {
          HandlerEl.ownerDocument.body.classList.remove(options.grabbingClass);
          //e.target.classList.remove(options.grabbingClass)
        }
        var ev = {
            x : e.pageX,
            y : e.pageY,
            target : e.target,
            ev : e
        };
        if($self.preventMouseOut)
            $self.preventMouseOut.style.display = "none";
        HandlerEl.ownerDocument.removeEventListener("mouseup",mouseup);
        HandlerEl.ownerDocument.removeEventListener('mousemove',mousemove);
        frameElement &&
        frameElement.removeEventListener("mouseout",mouseup);
        $self.events.dispatch("up",ev);
    }
    function mousemove(e){
        if(options.grabbingClass) {
            //document.body.classList.remove(options.grabClass);
          HandlerEl.ownerDocument.body.classList.add(options.grabbingClass);
          //e.target.classList.add(options.grabbingClass);
        }
        var ev = {
            x : e.pageX,
            y : e.pageY,
            target : e.target,
            ev : e
        };
        $self.events.dispatch("move",ev);
    }
    return function(){
        HandlerEl.removeEventListener("mousedown",mousedown);
    }
}
// private - touch case
function touch(HandlerEl) {
    var $self = this;
    var options = this.options;
    function touchstart(e){
        if(options.onlyHandler && e.target !== HandlerEl)
            return;
        if(options.handle && !e.target.closest(options.handle))
            return;
        var ev = {
            x : e.changedTouches[0].pageX,
            y : e.changedTouches[0].pageY,
            target : e.target,
            ev : e
        };
        $self.events.dispatch("down",ev);
        HandlerEl.ownerDocument.addEventListener('touchend', touchend,{passive:false});
        HandlerEl.ownerDocument.addEventListener('touchcancel', touchend,{passive:false});
        HandlerEl.ownerDocument.addEventListener('touchmove', touchmove,{passive:false});
    }
    // listeners
    HandlerEl.addEventListener('touchstart', touchstart,{passive:false});
    function touchmove(e){
        var ev = {
            x : e.changedTouches[0].pageX,
            y : e.changedTouches[0].pageY,
            ev : e,
            target : HandlerEl.ownerDocument.elementFromPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY)
        };
        $self.events.dispatch("move",ev);
    }
    function touchend(e){
        if(e.type == "touchend") {
            var ev = {
                x: e.changedTouches[0].pageX,
                y: e.changedTouches[0].pageY,
                target: HandlerEl.ownerDocument.elementFromPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY),
                ev: e
            };
            $self.events.dispatch("up", ev);
        }
        HandlerEl.ownerDocument.removeEventListener('touchend', touchend,{passive:false});
        HandlerEl.ownerDocument.removeEventListener('touchcancel', touchend,{passive:false});
        HandlerEl.ownerDocument.removeEventListener('touchmove',touchmove,{passive:false});
    }

    return function(){
        HandlerEl.removeEventListener('touchstart', touchstart,{passive:false});
    }
}
// constructor
function init(HandlerEl,options){
    var $self = this;
    $self.events = events();
    $self.on = function(n,cb){
        $self.events.on(n,cb);
        return $self;
    };
    $self.options = options;
    if($self.options.preventMouseOut){
        $self.preventMouseOut = document.querySelector(".__drag-prevent-mouse-out");
        if(!$self.preventMouseOut){
            $self.preventMouseOut = HandlerEl.ownerDocument.createElement("div");
            $self.preventMouseOut.className = "__drag-prevent-mouse-out";
            HandlerEl.ownerDocument.body.appendChild($self.preventMouseOut);
        }
    }
    var touchDestroy = touch.call($self,HandlerEl);
    var mouseDestroy = mouse.call($self,HandlerEl);
    $self.destroy = ()=>{
        touchDestroy();
        mouseDestroy();
    }

}
//init.prototype.dispatch = dispatch;
// append __drag namespace to window
window.__drag = function(HandlerEl,options = {}){
    return new init(HandlerEl,Object.assign({},defaults,options));
};
function getComputed(element,options){
    var X = 0,Y=0;
    var computed = element.ownerDocument.defaultView.getComputedStyle(element,null);
    if(options.dragNoTransform){
        X = +computed.left.replace("px","");
        Y = +computed.top.replace("px","");
    }
    else{
        var matrix = computed.transform.match(/\(([^)]+)\)/);
        var values = matrix && matrix[1] && matrix[1].split(",");
        X = values ? +values[values.length-2] : 0;
        Y = values ? +values[values.length-1] : 0;
    }
    return{X,Y};
}
function __dragElement(HandlerEl,options = {}){
    var $self = this;
    var destroyItems = [];
    options = Object.assign({},defaults,options);
    $self.events = events();
    $self.on = function(n,cb){
        $self.events.on(n,cb);
        return $self;
    };
    var elements = HandlerEl.length ? HandlerEl : [HandlerEl];
    for(var i = 0;i<elements.length;i++)
        (function(element){
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, X = 0,Y=0;
            var drag = new init(element, options);
            drag.on("down", function (e) {
                e.ev.preventDefault();
                // get the mouse cursor position at startup:
                var comp = getComputed(element,options);
                X = comp.X , Y = comp.Y;
                pos3 = e.x;
                pos4 = e.y;
                $self.events.dispatch("down",e);
            })
            .on("move", function (e) {
                e.ev.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.x;
                pos2 = pos4 - e.y;
                pos3 = e.x;
                pos4 = e.y;
                var newX = X - pos1;
                var newY = Y - pos2;
                if(options.dragElementConstraint(newX,newY,pos1,pos2)) {
                    return;
                }
                X = newX;
                Y = newY;
                // set the element's new position:
                if(options.dragNoTransform){
                    element.style.top = Y + "px";
                    element.style.left = X + "px";
                }
                else
                    element.style.transform = "translate(" + X + "px," + Y + "px)";
                e.newX = X;
                e.newY = Y;
                $self.events.dispatch("move",e);
            })
            .on("up",function(e){
                $self.events.dispatch("up",e);
            });
            destroyItems.push(drag)
        })(elements[i]);
    $self.destroy  = function(){
        destroyItems.forEach(function(v){ v.destroy()})
    };
    return $self;
};
window.__dragElement = function(HandlerEl,options){
    return new __dragElement(HandlerEl,options);
};
let dragListDefaults = {
    noDrop : false,
    convalidate : ()=>true,
    convalidateStart : ()=>true,
    handlerSelector : ""
};
function __dragList(el,options) {
    var $self = this;
    options = Object.assign({},dragListDefaults,options);
    $self.events = events();
    $self.el = el;
    $self.on = function(n,cb){
        $self.events.on(n,cb);
        return $self;
    };
    var d = __drag(el, {
        handle: "li " + options.handlerSelector,
        noBorderWindowEscape: true
    });
    var target,
        triggered,
        targetExDisplay,
        areSequential,
        targetExCssProperty,
        targetClone,
        targetCloneToAppend,
        started;
    d.on("down", e=> {
        //e.ev.preventDefault();
        var newX = e.ev.clientX || e.x;
        var newY = e.ev.clientY || e.y;
        var originalEl = e.ev.target.ownerDocument.elementFromPoint(newX, newY);
        var elStart = originalEl.closest("li");
        var convalidate = options.convalidateStart(elStart,originalEl);
        if(convalidate){
            started = true;
            triggered = true;
            target = convalidate.multiselection || [elStart];
        }
    });
    d.on("up", e=> {
        if(!started)
            return;
        started = false;
        e.ev.preventDefault();
        if (targetClone) {
            targetClone.parentNode.removeChild(targetClone);
            targetClone = null;
        }
        if (targetExCssProperty)
            target.forEach(n=>n.style[targetExCssProperty] = "");
        if (targetCloneToAppend) {
            if(targetCloneToAppend[0].parentNode) {
                var prev = targetCloneToAppend[0].previousElementSibling;
                var next = targetCloneToAppend[targetCloneToAppend.length-1].nextElementSibling;
                if(!options.noDrop)
                    targetCloneToAppend.forEach((n,i)=>n.replaceWith(target[i]));
                else
                    targetCloneToAppend.forEach(n=>n.remove());
                $self.events.dispatch("move", {target,prev,next});
            }
            targetCloneToAppend = null;
        }
      $self.events.dispatch("up");
    });
    d.on("move", e=> {
        if(!started)
            return;
        e.ev.preventDefault();
        var newX = e.ev.clientX || e.x;
        var newY = e.ev.clientY || e.y;
        var el = e.ev.target.ownerDocument.elementFromPoint(newX, newY);
        if(!el)
            return;
        el = el.closest("li");
        if (!el || el == targetCloneToAppend)
            return;
        var isInTarget = target.find(v=>v.contains(el));
        if (isInTarget) {
            /*
            targetCloneToAppend &&
            targetCloneToAppend[0].parentNode &&
            targetCloneToAppend.forEach(n=>n.remove());*/
            return;
        }
        var bounding = el.getBoundingClientRect();
        var mediumEl = (el.ownerDocument.defaultView.scrollY + bounding.bottom) - (bounding.height / 2);
        var positionBefore = e.y < mediumEl;
        if (triggered) {
            targetCloneToAppend = target.map(v=>v.cloneNode(true));
            targetClone = target[0].ownerDocument.createElement("div");
            targetClone.append(...target.map(v=>v.cloneNode(true)));
            targetClone.classList.add("targetClone");
            targetCloneToAppend.forEach(v=>v.classList.add("cloneToAppend"));
            target.forEach((v,i)=>{
                v.style.opacity = "0.4";
                targetExCssProperty = "opacity";
                if(i==0) areSequential = true;
                else if(areSequential)
                    areSequential = target[i-1] == v.previousElementSibling || target[i-1] == v.nextElementSibling;
            });
            target[0].ownerDocument.body.appendChild(targetClone);
            triggered = false;
        }
        targetClone.style.transform = `translate(${e.x}px,${e.y}px)`;
        if(targetCloneToAppend.find(n=>n.contains(el)))
            return;
        var whereInsert = positionBefore ? el : el.nextSibling;
        var toCompare = positionBefore ? el : el.nextElementSibling;
        var isNotAppendingOnItself = !toCompare ? true :
            target.length == 1 ?
            toCompare!=target[0] && target[0].nextElementSibling!=toCompare :
            areSequential ?
            toCompare!=target[0] && target[target.length-1].nextElementSibling!=toCompare :
                true;
        if(options.convalidate(el,positionBefore,target) && isNotAppendingOnItself) {
            if(whereInsert)
                whereInsert.before(...targetCloneToAppend);
            else
                el.after(...targetCloneToAppend)
        }
        else{
            targetCloneToAppend[0].parentNode &&
            targetCloneToAppend.forEach(n=>n.remove())
        }
    });
    return $self;
}
window.__dragList = function(el,options){
    return new __dragList(el,options);
};
function __dropElement(HandlerEl,options = {}){
    var $self = this;
    options = Object.assign({},defaults,options);
    var destroyItems = [], target;
    $self.events = events();
    $self.on = function(n,cb){
        $self.events.on(n,cb);
        return $self;
    };
    var ownerDoc = HandlerEl.ownerDocument || HandlerEl[0].ownerDocument;
    var dummy = ownerDoc.querySelector("body>dummy-drag");
    if(!dummy) {
        dummy = ownerDoc.createElement("dummy-drag");
        ownerDoc.body.appendChild(dummy);
    }
    var elements = HandlerEl.length ? HandlerEl : [HandlerEl];
    for(var i = 0;i<elements.length;i++) {
        ((element)=>{
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, originalPosition;
            var X = 0, Y = 0;
            var drag = new init(element, Object.assign(defaults, options));
            drag.on("down", function (e) {
                var ev = e.ev;
                ev.preventDefault();
                var target = e.target;
                // get the mouse cursor position at startup:
                var originalPosition = offset(target);
                X = originalPosition.left;
                Y = originalPosition.top;
                pos3 = e.x;
                pos4 = e.y;
                dummy.innerHTML = element.outerHTML;
                $self.events.dispatch("down", e);
            })
            .on("move", function (e) {
                var ev = e.ev;
                ev.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.x;
                pos2 = pos4 - e.y;
                pos3 = e.x;
                pos4 = e.y;
                X = X - (pos1);
                Y = Y - (pos2);
                // set the element's new position:
                dummy.style.transform = "translate3d(" + X + "px," + Y + "px,0)";
                var isTarget = e.target.matches(options.target) ? e.target :
                    e.target.closest(options.target);
                if (options.drop && isTarget) {
                    target = isTarget;
                    target.classList.add(options.styleDrop);
                }
                else
                    target && target.classList.remove(options.styleDrop);
                $self.events.dispatch("move", e);
            })
            .on("up", function (e) {
                var isTarget = e.target.matches(options.target) ? e.target :
                    e.target.closest(options.target);
                if (options.drop && isTarget)
                    isTarget.insertAdjacentHTML(options.insertElement, dummy.innerHTML);

                target.classList.remove(options.styleDrop);
                dummy.style.transform = "translate3d(-9999px,-9999px,0)";
                dummy.innerHTML = "";
                $self.events.dispatch("up", e);
            });
            destroyItems.push(drag)
        })(elements[i])
    }
    $self.destroy  = function(){
        destroyItems.forEach(function(v){ v.destroy()})
    };
    return $self;
};
window.__dropElement = function(HandlerEl,options){
    return new __dropElement(HandlerEl,options);
};

})();
(()=>{
const alertDialogEl = document.getElementById("tilepieces-alert-dialog");
const alertDialogLabel = document.getElementById("tilepieces-alert-dialog-label");
const alertCloseButton = alertDialogEl.children[1];
const alertDialogForm = document.getElementById("tilepieces-dialog-alert-form");
alertCloseButton.addEventListener("click",()=>{
    alertDialogEl.classList.remove("open");
    window.dispatchEvent(
        new Event('alert-dialog-reject')
    );
});
alertDialogEl.ownerDocument.addEventListener("keydown",e=> {
    if (e.key == "Escape" || e.key == "Enter")
        submit(e)
});
function submit(e){
    e.preventDefault();
    alertDialogForm.removeEventListener("submit",submit);
    alertDialogEl.classList.remove("open");
    window.dispatchEvent(
        new Event('alert-dialog-submit')
    );
}
window.alertDialog = function(docFragment,error){
    if(typeof docFragment === 'string')
        alertDialogLabel.innerHTML = docFragment;
    else
        alertDialogLabel.appendChild(docFragment);
    if(error)
        alertDialogEl.classList.add("error");
    else
        alertDialogEl.classList.remove("error");
    alertDialogForm.addEventListener("submit",submit);
    alertDialogEl.classList.add("open");
}
})();
(()=>{
    const confirmDialogEl = document.getElementById("tilepieces-confirm-dialog");
    const confirmDialogLabel = document.getElementById("tilepieces-confirm-dialog-label");
    const confirmButton = document.getElementById("tilepieces-confirm-dialog-button");
    const rejectButton = document.getElementById("tilepieces-reject-dialog-button");
    const confirmCloseButton = confirmDialogEl.children[1];
    let evs;
    confirmCloseButton.addEventListener("click",reject);
    rejectButton.addEventListener("click",reject);
    confirmButton.addEventListener("click",confirm);

    confirmDialogEl.addEventListener("keydown",e=> {
        if (e.key == "Escape")
            rejectButton.click();
    },true);
    function reject(){
        window.dispatchEvent(
            new Event('confirm-dialog-reject')
        );
        confirmDialogEl.classList.remove("open");
        evs.dispatch("confirm",false);
    }
    function confirm(e){
        e.preventDefault();
        window.dispatchEvent(
            new Event('confirm-dialog-submit')
        );
        confirmDialogEl.classList.remove("open");
        evs.dispatch("confirm",true);
    }
    window.confirmDialog = function(label){
        confirmDialogLabel.innerText = label;
        confirmDialogEl.classList.add("open");
        evs = events();
        return {
            events:evs
        };
    };
})();
((w)=>{
    var dialog = document.getElementById("tilepieces-dialog");
    let evs;
    var dialogContent = dialog.children[0]; // .tilepieces-dialog-content
    var closeButton = dialog.children[1]; // .tilepieces-dialog-close
    closeButton.addEventListener("click",()=>{
        if(dialog.classList.contains("lock-down")){
            window.dispatchEvent(new Event("release"));
            dialog.classList.remove("lock-down");
        }
        dialog.classList.remove("open","on-top");
        document.body.style.overflow = "";
        evs.dispatch("close",dialog);
    });
    dialog.addEventListener("keydown",e=> {
        if (e.key == "Escape" && !dialog.classList.contains("lock-down")) {
            dialog.classList.remove("open","on-top");
            document.body.style.overflow = "";
            evs.dispatch("close",dialog);
        }
    },true);
    w.dialog = {
        closeDisabled : false,
        open: (docFragment,closeDisabled,onTop)=>{
            document.body.style.overflow = "hidden";
            if(docFragment) {
                dialogContent.innerHTML = "";
                if (typeof docFragment === 'string')
                    dialogContent.innerHTML = docFragment;
                else
                    try {
                        dialogContent.appendChild(docFragment);
                    }
                    catch(e){
                        console.error(e,docFragment);
                        dialogContent.innerHTML = "an error has occurred";
                    }
            }
            if(closeDisabled) {
                closeButton.style.display = "none";
                dialog.classList.add("lock-down");
                window.dispatchEvent(new Event("lock-down"))
            }
            else
                closeButton.style.display = "block";
            dialog.classList.add("open");
            /* first input focus. here because it's common */
            var inputToFocus = dialogContent.querySelector("input:not([type=hidden])");
            inputToFocus && inputToFocus.focus();
            evs = events();
            if(onTop){
                dialog.classList.add("on-top");
            }
            else
                dialog.classList.remove("on-top");
            return {
                dialog:dialogContent,
                events:evs
            };
        },
        close: ()=>{
            if(dialog.classList.contains("lock-down")){
                window.dispatchEvent(new Event("release"));
                dialog.classList.remove("lock-down");
            }
            dialog.classList.remove("open","on-top");
            document.body.style.overflow = "";
            evs.dispatch("close",dialog);
        },
        dialogElement : dialog
    };
})(window);
(()=>{
    const promptDialogEl = document.getElementById("tilepieces-prompt-dialog");
    const promptDialogLabel = document.getElementById("tilepieces-prompt-dialog-label");
    const promptDialogForm = document.getElementById("tilepieces-dialog-prompt-form");
    const promptDialogButton = document.getElementById("tilepieces-prompt-dialog-button");
    const promptDialogInput = promptDialogForm.querySelector("input");
    const promptCloseButton = promptDialogEl.children[1];
    const errorLabel = document.getElementById("tilepieces-prompt-dialog-label-error");
    let patternFunction;
    let checkOnSubmit;
    let evs;
    function close(){
        promptDialogEl.classList.remove("open");
        document.body.style.overflow="";
    }
    promptCloseButton.addEventListener("click",()=>{
        window.dispatchEvent(
            new Event('prompt-dialog-reject')
        );
        close()
    });
    promptDialogEl.addEventListener("keydown",e=> {
        if (e.key == "Escape")
            promptCloseButton.click();
        if (e.key == "Enter")
            submit(e)
    },true);
    function checking(target){
        if(!target.value || (target.dataset.pattern && target.value.match(new RegExp(target.dataset.pattern))) ||
            (patternFunction && !patternFunction(target.value,target))
        ) {
            target.setAttribute("data-invalid","");
        }
        else {
            target.removeAttribute("data-invalid");
        }
    }
    function checkValidity(e){
        if(checkOnSubmit) {
            e.target.removeAttribute("data-invalid");
            return;
        }
        if(!e.target.dataset.pattern && !patternFunction)
            return;
        checking(e.target)
    }
    function submit(e){
        e.preventDefault();
        var target = promptDialogForm[0];
        if(checkOnSubmit)
            checking(target);
        if(target.hasAttribute("data-invalid")) {
            return;
        }
        var value = target.value.trim();
        //if(target.value)
        window.dispatchEvent(
            new CustomEvent('prompt-dialog-submit', { detail: { value } })
        );
        evs.dispatch("submit",value);
        close()
    }
    promptDialogInput.addEventListener("input",checkValidity);
    promptDialogForm.addEventListener("submit",submit);
    window.promptDialog = function(options = {
        label : "",
        buttonName : "",
        pattern : "",
        patternFunction : false,
        patternExpl : "",
        checkOnSubmit : false,
        onTop : false
    }){
        promptDialogInput.value = "";
        if(options.label)
            promptDialogLabel.textContent=options.label;
        if(options.buttonName)
            promptDialogButton.textContent=options.buttonName;
        if(options.pattern) {
            promptDialogInput.dataset.pattern = options.pattern;
        }
        patternFunction = options.patternFunction || null;
        checkOnSubmit = options.checkOnSubmit;
        errorLabel.innerHTML = options.patternExpl || "invalid";
        document.body.style.overflow="hidden";
        promptDialogEl.classList.add("open");
        if(options.onTop)
            promptDialogEl.classList.add("on-top");
        else
            promptDialogEl.classList.remove("on-top");
        promptDialogInput.focus();
        evs = events();
        return {
            events:evs
        };
    }
})();

(()=>{
let opener = window.opener || window.parent || window;
let overlay = document.getElementById("overlay");
let overlayInner = document.getElementById("overlay-inner");
//
let selected;
let selectedIsMatch;
let treeBuilder;
let app = opener.tilepieces;
let over;
let resizeObserver;
let isPasteEvent;
let attributeSelected;
let tooltipEl = document.querySelector(".frontart-tooltip");
let multiselectionToolTip = document.getElementById("multiselection-tooltip");
let tooltipElHide;
let cut;
let copy;
let paste;
let isAutoInsertionFlag;
let history = {
  entries: [],
  pointer: 0
};
let historyMethods = {};
let treeChangeEv = "tree-change";

/* search elements */
let searchBar = document.getElementById("search-bar");
let searchBarEntries = document.getElementById("search-bar-entries");
let searchBarUp = document.getElementById("search-bar-up");
let searchBarDown = document.getElementById("search-bar-down");
let findButton = document.getElementById("find-button");
let searchSelected = searchBar.children[1];
let pointer = 0;
let selectionText = "";
let selections = [];
let currentSearchEl;

let htmlTreeBuilderOptions = {
  preventDefaultClickOnMs: (e, target) => {
    if ((e.shiftKey || e.ctrlKey) && target != selected) {
      var matchLLI = app.core.htmlMatch.find(target["__html-tree-builder-el"]);
      if (!matchLLI) {
        target.classList.add("not-match");
        return;
      } else
        target.classList.remove("not-match");
      if (!treeBuilder.multiselection)
        multiselectButton.click();
      if (selectedIsMatch && e.shiftKey) {
        multiselectionOnShiftKey(target, matchLLI);
        return true;
      }
    } else if (e.shiftKey || e.ctrlKey) {
      if (!treeBuilder.multiselection) {
        multiselectButton.click();
        return true;
      }
    }
  }
}
// multiselect
let multiselectButton = document.getElementById("multiselect");
let multiSelection;
let internalMultiremove;
const menuBarTabs = document.querySelectorAll(".menu-bar-tabs");

// CSS VIEW
const cssViewDOM = document.getElementById("css-view");
const cssViewDOMList = document.getElementById("css-view-list");
const cssViewTooltip = document.getElementById("css-view-tooltip");
const addStylesheetModal = document.getElementById("add-stylesheet-modal-template");
const addStyleSheetButton = document.getElementById("add-stylesheet");
let stylesheetTagSelect,
  stylesheetTagPosition,
  isStyleSheetPending;
/*
let selectedCSS,
    selectedCSSMatch,
    autoInsertionCss,
    multiSelectionCss = [];*/

const jsViewDOM = document.getElementById("js-view");
const jsViewDOMList = document.getElementById("js-view-list");
const jsViewTooltip = document.getElementById("js-view-tooltip");
const addScriptModal = document.getElementById("add-script-modal-template");
const addScriptButton = document.getElementById("add-script");

let selectedJsCSS,
  selectedJsCSSMatch,
  autoInsertionJsCss,
  multiSelectionJsCss = [];

let jsDragList = cssJsMove(jsViewDOMList);
let cssDragList = cssJsMove(cssViewDOMList);
cssJsKeyDown(jsViewDOMList);
cssJsKeyDown(cssViewDOMList);
onListClick(jsViewDOMList, jsViewTooltip, handleJsTooltip);
onListClick(cssViewDOMList, cssViewTooltip, handleCssTooltip);
cssJsTooltipEvent(jsViewTooltip);
cssJsTooltipEvent(cssViewTooltip);

// block/unblock on events
opener.addEventListener("content-editable-start", e => {
  document.body.classList.add("content-editable-start")
});
opener.addEventListener("content-editable-end", e => {
  document.body.classList.remove("content-editable-start")
});
if (app.contenteditable) {
  document.body.classList.add("content-editable-start")
}
function activateAttributeContentEditable(attributeSpan, target) {
  var sel = overlay.ownerDocument.defaultView.getSelection();
  var range = sel.anchorNode ? sel.getRangeAt(0) : overlay.ownerDocument.createRange();
  attributeSpan.setAttribute("contenteditable", "");
  attributeSpan.addEventListener("blur", addAttributeValidation);
  attributeSpan.addEventListener("paste", onAttrPaste);
  attributeSpan.addEventListener("keydown", attributeKeyDown);
  attributeSpan.focus();
  setTimeout(() => {
    sel.removeAllRanges();
    range.selectNodeContents(target);
    sel.addRange(range);
  })
}

function activateTextNodeContentEditable() {
  var s = selected.querySelector(".html-tree-builder-node-value");
  s.setAttribute("contenteditable", "");
  s.addEventListener("blur", changeText);
  s.addEventListener("paste", onAttrPaste);
  s.addEventListener("keydown", e => e.key == "Enter" && s.blur());
  s.focus();
}
function addAttribute() {
  var attributes = [...selected.children[0].children].find(v => v.classList.contains("html-tree-builder-attributes"));
  if (!attributes) {
    var pivot = selected.querySelector(".html-tree-builer__tag-span");
    attributes = document.createElement("span");
    attributes.className = "html-tree-builder-attributes";
    selected.insertBefore(attributes, pivot.nextSibling);
  }
  attributes.classList.remove("no-pad");
  var newAttrsSpan = document.createElement("span");
  newAttrsSpan.className = "new-attr-span";
  newAttrsSpan.setAttribute("spellcheck", "false");
  newAttrsSpan.setAttribute("contenteditable", "");
  attributes.appendChild(newAttrsSpan);
  newAttrsSpan.addEventListener("blur", addAttributeValidation);
  newAttrsSpan.addEventListener("paste", onAttrPaste);
  newAttrsSpan.addEventListener("keydown", attributeKeyDown);
  newAttrsSpan.focus();
}

function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  var win = el.ownerDocument.defaultView;
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= win.innerHeight &&
    rect.right <= win.innerWidth
  );
}
function enableTooltipActions(setArray, inversed) {
  if (!setArray.length && !inversed)
    tooltipElHide = true;
  else {
    [...tooltipEl.children].forEach(child => {
      if (child.classList.contains("multiselection-tooltip"))
        return;
      if (!child.dataset.name) {
        var search = child.previousElementSibling;
        var enabled = false;
        while (search != tooltipEl.children[0] && search.tagName != "HR") {
          if (search.getAttribute("disabled") == null) {
            enabled = true;
            break;
          }
          search = search.previousElementSibling;
        }
        if (enabled)
          child.style.display = "block";
        else
          child.style.display = "none";
      } else if ((setArray.find(v => v == child.dataset.name) && inversed) ||
        (!setArray.find(v => v == child.dataset.name) && !inversed))
        child.setAttribute("disabled", "");
      else
        child.removeAttribute("disabled");
    });
    tooltipElHide = false;
  }
}
opener.addEventListener('html-tree-builder-click', handleClick);
window.addEventListener('blur', e => {
  tooltipEl.style.display = "none"
});
overlay.addEventListener('keydown', onKeyDown);
overlay.addEventListener('click', e => {
  if (!treeBuilder) // on load, when we open the html and the body.
    return;
  var target = e.target;
  /* toggle tooltip */
  if (tooltipEl.style.display == "block" && !tooltipEl.contains(target)) {
    tooltipEl.style.display = "none";
    return;
  }
  /* activate tooltip */
  var menuToggle = target.closest(".menu-toggle");
  if (!menuToggle)
    return;
  /* multiselection */
  var multiselection = treeBuilder.multiselection;
  if (multiselection) {
    tooltipEl.classList.add("multiselection");
    tooltipHandle({target});
    !tooltipElHide && tooltip(e);
  } else if (selectedIsMatch) {
    tooltipEl.classList.remove("multiselection");
    tooltipHandle({target});
    !tooltipElHide && tooltip(e);
  }
});
overlay.addEventListener("dblclick", dblclick);
overlay.addEventListener("contextmenu", contextMenu);
overlayInner.addEventListener("html-tree-builder-mouseover", e => {
  var target = e.detail.nodeType == 1 ? e.detail : e.detail.parentNode;
  app.highlight = target
});
overlayInner.addEventListener("html-tree-builder-mouseout", e => app.highlight = null);
opener.addEventListener("html-rendered", e => {
  treeBuilder && treeBuilder.destroy();
  document.body.hidden = false;
  treeBuilder = htmlTreeBuilder(overlayInner, e.detail.htmlDocument, htmlTreeBuilderOptions);
  if (app.multiselected)
    treeBuilder.activateMultiSelection();
});
opener.addEventListener("frame-DOM-selected", e => {
  treeBuilder && treeBuilder.highlightElement(e.detail.target);
});
opener.addEventListener("highlight-click", function (e) {
  if (overlay.style.display == "none")
    return;
  if (selected && selected["__html-tree-builder-el"] == e.detail.target)
    return;
  selected = treeBuilder.highlightElement(e.detail.target);
  if (!toMatch(app.selectorObj.match))
    selected.classList.add("not-match");
});
opener.addEventListener("tilepieces-mutation-event", mutation);

// ON READY
function htmlInspectorInit() {
  if (app && app.core && app.core.currentDocument) {
    document.body.hidden = false;
    treeBuilder = htmlTreeBuilder(overlayInner, app.core.currentDocument, htmlTreeBuilderOptions);
    if (app.elementSelected) {
      selected = treeBuilder.highlightElement(app.elementSelected);
      if (!toMatch(app.selectorObj.match))
        selected.classList.add("not-match");
    }
    app.treeBuilder = treeBuilder;
    if (app.multiselected) {
      multiselectButton.classList.add("selected")
      treeBuilder.activateMultiSelection();
    }
  }
  else
    document.body.hidden = true;
}

htmlInspectorInit();
opener.addEventListener("deselect-multielement", e => {
  if (internalMultiremove) {
    internalMultiremove = false;
    console.warn("exit from multiselected", e);
    return;
  }
  var el = e.detail;
  var index = treeBuilder.multiselected.findIndex(v => v.el == el);
  if (index < 0) {
    console.error("[html-inspector] deselect multielement not exists in treeBuilder.multiselected", e);
    return;
  }
  treeBuilder.removeItemSelected(index);
  selected = treeBuilder.selected;
});
opener.addEventListener("html-tree-remove-multiselection", e => {
  internalMultiremove = true;
  selected = treeBuilder.selected;
  var index = app.multiselections.findIndex(v => v.el == e.detail.el);
  if (index < 0) {
    console.error("[html-inspector] deselect multielement not exists in treeBuilder.multiselected", e);
    return;
  }
  app.removeItemSelected(index);
  /*
  app.multiselections.forEach((v,i)=>{
    if(treeBuilder.multiselected[i])
      v.el = treeBuilder.multiselected[i].el
  })*/
});
opener.addEventListener("deselect-element", e => {
  if (!treeBuilder.multiselection) {
    selected = null;
    treeBuilder.deSelect();
  }
});
/*
opener.addEventListener("multiselection-enabled",e=>{
    if(!multiselectButton.classList.contains("selected")){
        treeBuilder.activateMultiSelection();
        app.enableMultiselection();
    }
})
 */
opener.addEventListener("multiselection-canceled", e => {
  if (multiselectButton.classList.contains("selected")) {
    multiselectButton.click();
  }
})

function destroyTreeBuilder() {
  treeBuilder.destroy();
  overlayInner.innerHTML = "";
  document.body.hidden = true;
}

opener.addEventListener("set-project", destroyTreeBuilder);
opener.addEventListener("delete-project", destroyTreeBuilder);
opener.addEventListener("frame-unload",destroyTreeBuilder)


window.addEventListener("window-popup-open", e => {
  var newWindow = e.detail.newWindow;
  if (!selected)
    selected = newWindow.document.querySelector(".html-tree-builder__highlight");
  selected && newWindow.scrollTo(0, selected.offsetTop);
  newWindow.addEventListener('blur', e => {
    tooltipEl.style.display = "none";
    cssViewTooltip.style.display = "none";
  });
  newWindow.addEventListener("resize",e=>{
    var highlights = newWindow.document.querySelectorAll(".html-tree-builder__highlight");
    highlights.forEach(h=>{
      var treeBuilderElement = h.querySelector(".html-tree-builder__tag");
      var toggleWrapper = h.querySelector(".menu-toggle-wrapper");
      toggleWrapper.style.height = treeBuilderElement.offsetHeight + "px";
    })
  });
});
window.addEventListener("window-popup-close", e => {
  //htmlInspectorInit();
  var newWindow = e.detail.panelElementIframe.contentWindow;
  selected && newWindow.scrollTo(0, selected.offsetTop);
});
function toMatch(match) {
  var sourceTarget = selected["__html-tree-builder-el"];
  //var toMatch = sourceTarget.nodeType == 3 ? sourceTarget.parentNode : sourceTarget;
  selectedIsMatch = match || app.core.htmlMatch.find(sourceTarget);
  if (sourceTarget.nodeType == 3 && selectedIsMatch)
    selectedIsMatch = selectedIsMatch.HTML && selectedIsMatch;
  if (!selectedIsMatch) {
    console.warn("no match :", toMatch);
    //selectedIsMatch = false;
    //return false;
  }
  //else
  //selectedIsMatch = true;
  return selectedIsMatch;
}
function tooltip(e, el) {
  //overlay.blur();
  var domElement = el || tooltipEl;
  if (domElement.contains(e.target) || domElement == e.target)
    return;
  var win = e.target.getRootNode().defaultView;
  var x = e.pageX;
  var y = e.pageY;
  var zero = win.scrollY;
  if (domElement.style.display != "block") {
    domElement.style.display = "block";
  }
  var sel = domElement.querySelector(".selected");
  sel && sel.classList.remove("selected");
  var box = domElement.getBoundingClientRect();
  if (x + box.width > win.innerWidth) {
    x = x - box.width;
    if (x < zero) x = zero;
  }
  if (y + box.height > win.innerHeight) {
    y = y - box.height;
    if (y < zero) y = zero;
  }
  domElement.style.transform = `translate(${x}px,${y}px)`;
  domElement.focus();
}
function addAttributeValidation(e) {
  e.target.removeEventListener("blur", addAttributeValidation);
  e.target.removeEventListener("paste", onAttrPaste);
  e.target.removeEventListener("keydown", attributeKeyDown);
  var newFakeEl = document.createElement("fake");
  var attributes = selected.querySelector(".html-tree-builder-attributes");
  var el = selected["__html-tree-builder-el"];
  newFakeEl.innerHTML = "<span " + attributes.innerText + "></span>"
  while (el.attributes.length) {
    isAutoInsertionFlag = true;
    app.core.htmlMatch.removeAttribute(el, el.attributes[0].nodeName)
  }
  newFakeEl.firstChild && ([...newFakeEl.firstChild.attributes]).forEach(v => {
    var name = v.name.trim().replace(/\u00A0/, " ");
    if (!name)
      return;
    var value = v.value.trim().replace(/\u00A0/, " ");
    isAutoInsertionFlag = true;
    try {
      app.core.htmlMatch.setAttribute(el, name, value);
    } catch (e) {
      console.error(e)
    }
  });
  attributes.outerHTML = treeBuilder.createAttributes(el.attributes);
}
function attributeKeyDown(e) {
  var attributeSpan = e.target;
  console.warn("attributeSpan", attributeSpan);
  if (e.key == "Enter") {
    attributeSpan.blur();
    return;
  }
  if (e.key == "Tab" &&
    attributeSpan.nextElementSibling &&
    attributeSpan.nextElementSibling.classList.contains("html-tree-builder-attribute")) {
    e.preventDefault();
    var attr = attributeSpan.nextElementSibling;
    var span = attr.querySelector(".attribute-value") || attr.querySelector(".attribute-key");
    attributeSpan.blur();
    activateAttributeContentEditable(attr, span);
  }
}
function onAttrPaste(e) {
  e.preventDefault();
  var t = e.target;
  var clipboardData = e.clipboardData;
  if (clipboardData && clipboardData.getData) {
    var text = clipboardData.getData("text/plain");
    if (text.length) {
      var sel, range;
      sel = t.ownerDocument.defaultView.getSelection();
      range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(t.ownerDocument.createTextNode(text));
    }
  }
}
function changeText(e) {
  var el = selected["__html-tree-builder-el"];
  isAutoInsertionFlag = true;
  app.core.htmlMatch.textContent(el, e.target.textContent);
}
function delEl(t, s, autoInsertion = true) {
  isAutoInsertionFlag = autoInsertion;
  app.core.htmlMatch.removeChild(t);
  s.parentNode.removeChild(s);
}

function deleteEl() {
  if (treeBuilder.multiselection) {
    /*
    treeBuilder.multiselected.forEach(n=>{
        delEl(n.el,n.listEl);
    });
    treeBuilder.removeMultiSelection();
    app.destroyMultiselection();
   */
    treeBuilder.multiselected.forEach(n => {
      delEl(n.el, n.listEl);
    });
    multiselectButton.click();
  } else
    delEl(selected["__html-tree-builder-el"], selected);
  selected = null;
  app.core.deselectElement();
}
function editInnerHtml() {
  var t = document.createElement("div");
  var ul = selected.querySelector("ul");
  var realEl = selected["__html-tree-builder-el"];
  var innerHTML = realEl.innerHTML;
  //ul && ul.replaceWith(t);
  //!ul && selected.appendChild(t);
  var type = realEl.tagName == "STYLE" ? "css" :
    realEl.tagName == "SCRIPT" ? "javascript" : "html";
  //var editor = createEditor(t,innerHTML,"text/"+ type);
  overlay.scrollTop = selected.offsetTop;
  app.codeMirrorEditor(innerHTML, type)
    .then(res => {
      if (res != innerHTML)
        app.core.htmlMatch.innerHTML(realEl, res);
    }, e => console.error(e))
    .finally(() => {
      if (ul) {
        ul.remove();
        var target = selected.querySelector(".html-tree-builder__caret");
        selected.classList.remove("open");
        treeBuilder.openTree({target});
        overlay.scrollTop = selected.offsetTop;
      }
    })
}
function editOuterHtml() {
  var t = document.createElement("div");
  var ul = selected.querySelector("ul");
  var realEl = selected["__html-tree-builder-el"];
  var outerHTML = realEl.outerHTML;
  //selected.replaceWith(t);
  overlay.scrollTop = t.offsetTop;
  app.codeMirrorEditor(outerHTML, "html")
    .then(value => {
      if (value != outerHTML)
        app.core.htmlMatch.outerHTML(realEl, value);
    }, e => console.error(e))
    .finally(() => {
      if (ul) {
        ul.remove();
        var target = selected.querySelector(".html-tree-builder__caret");
        selected.classList.remove("open");
        treeBuilder.openTree({target});
        overlay.scrollTop = selected.offsetTop;
      }
    })
}
const dragList = __dragList(overlay, {
  convalidateStart: function (el, originalEl) {
    if (originalEl.closest("[contenteditable]"))
      return;
    var selectedEl = selected ? selected["__html-tree-builder-el"] : null;
    var targetEl = el["__html-tree-builder-el"];
    if (treeBuilder.multiselected.length && targetEl &&
      treeBuilder.multiselected.find(n => n.el == targetEl)) {
      return {multiselection: treeBuilder.multiselected.map(v => v.listEl).sort((a, b) => a.offsetTop - b.offsetTop)}
    }
    if (selectedEl &&
      selectedIsMatch &&
      targetEl &&
      el == selected &&
      !selectedEl.nodeName.match(/(HTML|HEAD|BODY)$/) &&
      !targetEl.nodeName.match(/(HTML|HEAD|BODY)$/))
      return true
  },
  convalidate: function (el) {
    var selectedEl = selected ? selected["__html-tree-builder-el"] : null;
    var targetEl = el["__html-tree-builder-el"];
    var targetElMatch = targetEl && app.core.htmlMatch.find(targetEl);
    if (targetElMatch &&
      selectedEl &&
      selectedIsMatch &&
      targetEl &&
      selectedEl != targetEl &&
      !selectedEl.contains(targetEl) &&
      !selectedEl.nodeName.match(/(HTML|HEAD|BODY)$/) &&
      !targetEl.nodeName.match(/(HTML|HEAD|BODY)$/) &&
      el.parentNode != overlay.children[0] &&
      el.parentNode != overlay)
      return true;
  },
  handlerSelector: ".html-tree-build-dragger"
});
dragList.on("move", e => {
  var nodes = e.target;
  var prevEl = e.prev && e.prev["__html-tree-builder-el"];
  var prevFound = prevEl && app.core.htmlMatch.find(prevEl);
  if (prevFound) {
    for (var i = nodes.length - 1; i >= 0; i--) {
      app.core.htmlMatch.move(prevEl,
        nodes[i]["__html-tree-builder-el"],
        "after");
    }
  } else {
    for (var i = 0; i < nodes.length; i++) {
      app.core.htmlMatch.move(e.next["__html-tree-builder-el"],
        nodes[i]["__html-tree-builder-el"],
        "before");
    }
  }
})
// pivotEl for css/js view TODO remove
function pasteEl(pivotEl, insertionMode) {
  var els = treeBuilder.multiselection ? treeBuilder.multiselected : [{el: selected["__html-tree-builder-el"]}];
  var copyElements = cut || copy;
  //isPasteEvent = !(!!pivotEl);
  copyElements.sort((a, b) => a.listEl.offsetTop - b.listEl.offsetTop).forEach(n => {
    var toAppend = n.el;
    /*
    if(cut && toAppend.contains(el)){
        console.warn("pasteEl - trying to put an element inside itself");
        return;
    }*/
    els.forEach(multiObj => {
      /*
       if(el.tagName.match(app.utils.notEditableTags)){
       console.warn("pasteEl - trying to put elements inside a void element");
       return;
       }*/
      /*
       if(copy)
       toAppend = toAppend.cloneNode(true);
       app.core.htmlMatch[insertionMode || app.insertionMode](multiObj.el, toAppend, !(!!copy));*/
      var newEl = toAppend.cloneNode(true);
      app.core.htmlMatch[insertionMode || app.insertionMode](multiObj.el, newEl);
      if (cut)
        app.core.htmlMatch.removeChild(toAppend);
    })
  });
  copyElements.forEach(n => n.listEl.classList.remove("cutted,copied"));
  cut = null;
  copy = null;
}
addStyleSheetButton.addEventListener("click", e => {
  var isFormAlreadyInDialog = cssViewDOM.ownerDocument.getElementById("add-stylesheet-form");
  var template = isFormAlreadyInDialog ? null :
    cssViewDOM.ownerDocument.importNode(addStylesheetModal.content, true);
  var form = isFormAlreadyInDialog || template.children[0];
  stylesheetTagSelect = isFormAlreadyInDialog ? stylesheetTagSelect :
    template.querySelector("#add-stylesheet-tag");
  stylesheetTagSelect.addEventListener("change", stylesheetTagChange);
  form.addEventListener("submit", createNewStylesheet);
  var d = dialog.open(template);
  d.events.on("close", () => {
    form.removeEventListener("submit", createNewStylesheet);
    stylesheetTagSelect.removeEventListener("change", stylesheetTagChange);
  });
});

function stylesheetTagChange(e) {
  var v = e.target.value;
  overlay.ownerDocument.getElementById("add-stylesheet-href-field").style.display =
    v != "link" ? "none" : "block";
}
async function createNewStylesheet(e) {
  e.preventDefault();
  var newTagName = e.target["add-stylesheet-tag"].value;
  var newTag = app.core.currentDocument.createElement(newTagName);
  var isCurrent = e.target["add-stylesheet-current"].checked;
  if (newTagName == "link") {
    newTag.rel = "stylesheet";
    var href = e.target["add-stylesheet-href"].value.trim();
    opener.dialog.open("loading stylesheet...", true);
    app.core.fetchingStylesheet(href).then(async () => {
      newTag.href = href;
      opener.dialog.close();
      await closeDialogNewStylesheet(newTag, isCurrent);
    }, err => {
      if (err.status && err.status == 404 &&
        !href.match(app.utils.URLIsAbsolute) &&
        href.endsWith('.css') &&
        app.storageInterface) {
        newTag.href = href;
        var urlToUpdate = new URL(href, app.core.currentWindow.location.href);
        urlToUpdate = urlToUpdate.pathname.replace(app.frameResourcePath(), "").replace(/\/\//g, "/");
        app.storageInterface.update(urlToUpdate, new Blob([""]))
          .then(async () => {
            opener.dialog.close();
            await closeDialogNewStylesheet(newTag, isCurrent)
          }, err => {
            opener.dialog.close();
            console.error("[error in creating path" + newTag.href + "]", err);
            opener.dialog.open("creating stylesheet error");
          })
      } else {
        console.log("[fetch stylesheet " + newTag.href + " error]", err);
        opener.dialog.close();
        opener.dialog.open("loading stylesheet error");
      }
    })
  } else await closeDialogNewStylesheet(newTag, isCurrent);
}

async function closeDialogNewStylesheet(newTag, isCurrent) {
  var insertionMode = app.insertionMode == "prepend" ?
    "before" :
    app.insertionMode == "append" ?
      "after" :
      app.insertionMode;
  if (selectedJsCSS)
    app.core.htmlMatch[insertionMode](selectedJsCSS["__html-tree-builder-el"],
      newTag);
  else
    app.core.htmlMatch.append(app.core.currentDocument.head, newTag);
  selectedJsCSS = {"__html-tree-builder-el": newTag};
  if (isCurrent)
    await app.core.setCurrentStyleSheet(newTag);
  dialog.close();
}
function handleCssTooltip(li, e) {
  var el = li["__html-tree-builder-el"];
  var notDisplay = [];
  if (li.classList.contains("not-match"))
    notDisplay = [1, 2, 3];
  if (el.sheet == app.core.currentStyleSheet)
    notDisplay.push(2);
  var sameDomain = el.tagName == "STYLE" ||
    (el.tagName == "LINK" &&
      el.getAttribute("href") &&
      !el.getAttribute("href").match(/^(http:\/\/)|^(https:\/\/)/));
  if (!sameDomain || (el.tagName == "LINK" && !app.storageInterface))
    notDisplay.push(3);
  [...cssViewTooltip.children].forEach((v, i) =>
    v.style.display = notDisplay.indexOf(i) > -1 ? "none" : "block");
  tooltip(e, cssViewTooltip);
}
function cssJsView(tagSelector, DOMContainer, DOMlist) {
  var tags = app.core.currentDocument.querySelectorAll(tagSelector);
  DOMlist.innerHTML = "";
  var frag = DOMContainer.ownerDocument.createDocumentFragment();
  var updateSelectCss;
  [...tags].forEach(obj => {
    treeBuilder.treeBuilder(obj, frag, DOMContainer);
    var el = frag.lastElementChild;
    var elMatch = app.core.htmlMatch.find(el["__html-tree-builder-el"]);
    if (!elMatch)
      el.classList.add("not-match");
    if (multiSelectionJsCss) {
      var findInMultiSelection = multiSelectionJsCss.find(v => v.el == obj);
      if (findInMultiSelection) {
        findInMultiSelection.listEl = el;
        el.classList.add("html-tree-builder__highlight");
      }
    }
    if (selectedJsCSS && selectedJsCSS["__html-tree-builder-el"] == el["__html-tree-builder-el"]) {
      selectedJsCSS = el;
      el.classList.add("html-tree-builder__highlight");
      app.elementSelected = el["__html-tree-builder-el"];
    }
  });
  DOMlist.appendChild(frag);
  /*
    updateSelectCss && updateSelectCss.click();
    if(!updateSelectCss && selectedJsCSS)
        selectedJsCSS = null;
        */
}
function createEditorCssJs(src, value, mode, originalElement) {
  app.codeMirrorEditor(value, mode)
    .then(res => {
      if (src) {
        var urlToUpdate = new URL(src, app.core.currentWindow.location.href);
        urlToUpdate = urlToUpdate.pathname.replace(app.frameResourcePath(), "").replace(/\/\//g, "/");
        app.storageInterface.update(urlToUpdate, new Blob([res]))
          .then(ok => {
              var newElement = originalElement.cloneNode();
              app.core.htmlMatch.replaceWith(originalElement, newElement)
              selectedJsCSS = {"__html-tree-builder-el": newElement};
            },
            err => {
              console.error("[update resource error]", err);
              opener.alertDialog("update resource error")
            })
      } else {
        var newScript = originalElement.cloneNode();
        newScript.innerHTML = res;
        app.core.htmlMatch.replaceWith(originalElement, newScript);
        selectedJsCSS = {"__html-tree-builder-el": newScript};
      }
    }, e => console.error(e));
}
function cssJsMove(DOMList) {
  var dragList = __dragList(DOMList, {
    convalidateStart: function (el) {
      console.log(multiSelectionJsCss.find(v => v.listEl == el),);
      if (app.multiselected && multiSelectionJsCss.find(v => v.listEl == el)) {
        return {multiselection: multiSelectionJsCss.map(v => v.listEl).sort((a, b) => a.offsetTop - b.offsetTop)}
      }
      if (el == selectedJsCSS)
        return true
    },
    convalidate: function (el) {
      if (!el.classList.contains("not-match"))
        return true;
    },
    handlerSelector: ".html-tree-build-dragger"
  });
  dragList.on("move", e => {
    var nodes = e.target;
    var prevEl = e.prev && e.prev["__html-tree-builder-el"];
    var prevFound = prevEl && app.core.htmlMatch.find(prevEl);
    if (prevFound) {
      for (var i = nodes.length - 1; i >= 0; i--) {
        app.core.htmlMatch.move(prevEl,
          nodes[i]["__html-tree-builder-el"],
          "after");
      }
    } else {
      for (var i = 0; i < nodes.length; i++) {
        app.core.htmlMatch.move(e.next["__html-tree-builder-el"],
          nodes[i]["__html-tree-builder-el"],
          "before");
      }
    }
  });
  return dragList;
}
function cssJsKeyDown(DOMlist) {
  DOMlist.addEventListener("keydown", e => {
    if (e.key == "Delete" && selectedJsCSS) {
      autoInsertionJsCss = true;
      if (treeBuilder.multiselection)
        multiSelectionJsCss.forEach(mc => delEl(mc.el, mc.listEl, false));
      else
        delEl(selectedJsCSS["__html-tree-builder-el"], selectedJsCSS, false);
      selectedJsCSS = null;
      selected = null;
      app.core.deselectElement();
    }
  });
}
function onListClick(DOMlist, tooltip, handleTooltipFunction) {
  DOMlist.addEventListener("click", e => {
    var li = e.target.closest("li");
    if (!li) return;
    var multiSelected = app.multiselected;
    // activate tooltip
    if (e.target.closest(".menu-toggle")) {
      if (multiSelected && selectedJsCSS != li)
        selectedJsCSS = li;
      if (tooltip.style.display != "block")
        handleTooltipFunction(li, e);
      return;
    }
    if (e.target.closest(".menu-toggle-wrapper"))
      return;
    if (li.classList.contains("not-match")) return;
    var multiSelectionIndex = multiSelectionJsCss.findIndex(v => v.listEl == li);
    if (selectedJsCSS && selectedJsCSS == li) {
      if (multiSelected) {
        multiSelectionJsCss.splice(multiSelectionIndex, 1);
        li.classList.remove("html-tree-builder__highlight");
        selectedJsCSS = multiSelectionJsCss.length ? multiSelectionJsCss[multiSelectionJsCss.length - 1] : null;
      }
      return;
    } else if (multiSelectionIndex > -1) {
      multiSelectionJsCss.splice(multiSelectionIndex, 1);
      li.classList.remove("html-tree-builder__highlight");
      return;
    }
    li.classList.add("html-tree-builder__highlight");
    var treeBuilderElement = li.querySelector(".html-tree-builder__tag");
    var toggleWrapper = li.querySelector(".menu-toggle-wrapper");
    toggleWrapper.style.height = treeBuilderElement.offsetHeight + "px";
    multiSelected && multiSelectionJsCss.push({listEl: li, el: li["__html-tree-builder-el"]});
    selectedJsCSS &&
    selectedJsCSS instanceof HTMLElement &&
    selectedJsCSS != li &&
    !multiSelected &&
    selectedJsCSS.classList.remove("html-tree-builder__highlight");
    selectedJsCSS = li;
    var DOMelement = li["__html-tree-builder-el"];
    selectedJsCSSMatch = app.core.htmlMatch.find(DOMelement);
    app.core.selectElement(DOMelement, selectedJsCSSMatch);
  });
}
function cssJsTooltipEvent(tooltipEl) {
  tooltipEl.addEventListener("click", e => {
    var actionName = e.target.dataset.name;
    if (!actionName) return;
    switch (actionName) {
      case "reveal":
        selectedTab.click();
        break;
      case "remove-element":
        autoInsertionJsCss = true;
        if (treeBuilder.multiselection)
          multiSelectionJsCss.forEach(mc => delEl(mc.el, mc.listEl, false));
        else
          delEl(selectedJsCSS["__html-tree-builder-el"], selectedJsCSS, false);
        selectedJsCSS = null;
        selected = null;
        app.core.deselectElement();
        break;
      case "edit":
        var sel = selectedJsCSS["__html-tree-builder-el"];
        var mode = sel.tagName == "SCRIPT" ? "js" : "css";
        var valueFetch = (sel.tagName == "SCRIPT" && sel.src) || sel.tagName == "LINK";
        if (valueFetch) {
          var originalSrc = sel.tagName == "SCRIPT" ? sel.getAttribute("src") : sel.getAttribute("href");
          var src = sel.tagName == "SCRIPT" ? sel.src : sel.href;
          fetch(src)
            .then(res => {
              if (res.status == 200) {
                return res.text();
              } else {
                console.error("[trying edit, resource status not 200]", res);
                opener.alertDialog("fail to edit", true)
              }
            }, err => {
              dialog.close();
              console.error("[trying edit, network error]", err);
              opener.alertDialog("fail to edit", true)
            })
            .then(value => {
              createEditorCssJs(originalSrc, value, mode, sel)
            })
        } else createEditorCssJs("", sel.innerHTML, mode, sel);
        break;
      case "set-as-current":
        app.core.setCurrentStyleSheet(selectedJsCSS["__html-tree-builder-el"]);
        break;
    }
    tooltipEl.style.display = "none";
  });
}
cssViewTooltip.addEventListener("blur", e => {
  cssViewTooltip.style.display = "none"
});
jsViewTooltip.addEventListener("blur", e => {
  jsViewTooltip.style.display = "none"
});

function cssJsViewCM(e, handleTooltipFunc) {
  var li = e.target.closest("li");
  if (!li) return;
  selectedJsCSS != li && li.click();
  e.preventDefault();
  handleTooltipFunc(li, e);
}

cssViewDOMList.addEventListener("contextmenu", e => cssJsViewCM(e, handleCssTooltip));
jsViewDOMList.addEventListener("contextmenu", e => cssJsViewCM(e, handleJsTooltip));
addScriptButton.addEventListener("click", e => {
  var isFormAlreadyInDialog = jsViewDOM.ownerDocument.getElementById("add-script-form");
  var template = isFormAlreadyInDialog ? null :
    jsViewDOM.ownerDocument.importNode(addScriptModal.content, true);
  var form = isFormAlreadyInDialog || template.children[0];
  form.addEventListener("submit", createNewScript);
  var d = dialog.open(template);
  d.events.on("close", () => {
    form.removeEventListener("submit", createNewScript);
  });
});
function createNewScript(e) {
  e.preventDefault();
  var newTag = app.core.currentDocument.createElement("script");
  if (e.target["add-script-src-enable"].checked) {
    var src = e.target["add-script-src"].value.trim();
    opener.dialog.open("loading script...", true);
    newTag.src = src;
    fetch(src).then(res => {
      if (res.status == 200) {
        closeDialogNewScript(newTag);
        opener.dialog.close();
      } else if (res.status &&
        res.status == 404 &&
        !src.match(app.utils.URLIsAbsolute) &&
        src.endsWith('.js') &&
        app.storageInterface) {
        var urlToUpdate = new URL(src, app.core.currentWindow.location.href);
        urlToUpdate = urlToUpdate.pathname.replace(app.frameResourcePath(), "").replace(/\/\//g, "/");
        app.storageInterface.update(urlToUpdate, new Blob([""]))
          .then(() => {
            opener.dialog.close();
            closeDialogNewScript(newTag)
          }, err => {
            opener.dialog.close();
            console.error("[error in creating path" + src + "]", err);
            opener.dialog.open("creating script error");
          })
      } else {
        console.log("[fetch script " + newTag.src + " error]", res);
        opener.dialog.close();
        opener.dialog.open("fetch script error, maybe app.storageInterface not setted");
      }
    }, err => {
      console.log("[fetch script " + newTag.src + " error]", err);
      opener.dialog.close();
      opener.dialog.open("fetch script error");
    })
  } else closeDialogNewScript(newTag);
}

function closeDialogNewScript(newTag) {
  var insertionMode = app.insertionMode == "prepend" ?
    "before" :
    app.insertionMode == "append" ?
      "after" :
      app.insertionMode;
  if (selectedJsCSS)
    app.core.htmlMatch[insertionMode](selectedJsCSS["__html-tree-builder-el"],
      newTag);
  else
    app.core.htmlMatch.append(app.core.currentDocument.body, newTag);
  selectedJsCSS = {"__html-tree-builder-el": newTag};
  dialog.close();
}
function handleJsTooltip(li, e) {
  var el = li["__html-tree-builder-el"];
  var notDisplay = [];
  if (li.classList.contains("not-match"))
    notDisplay = [1, 2];
  var sameDomain = !el.src || (el.tagName == "SCRIPT" && el.src
    && !el.getAttribute("src").match(/^(http:\/\/)|^(https:\/\/)/));
  if (!sameDomain || (el.src && !app.storageInterface))
    notDisplay.push(3);
  [...jsViewTooltip.children].forEach((v, i) =>
    v.style.display = notDisplay.indexOf(i) > -1 ? "none" : "block");
  tooltip(e, jsViewTooltip);
}
let selectedTab = null;
[...menuBarTabs].forEach(mbt => mbt.addEventListener("click", e => {
  var target = e.target;
  var doc = target.getRootNode();
  var isSelected = target.classList.toggle("selected");
  if (selectedTab && selectedTab != target) {
    selectedTab.classList.remove("selected");
    doc.querySelector(selectedTab.getAttribute("href")).style.display = "none";
  }
  var cacheSel = selectedJsCSS && selectedJsCSS["__html-tree-builder-el"];
  multiSelectionJsCss = [];
  selectedJsCSS = null;
  var href = e.target.getAttribute("href");
  if (isSelected) {
    if (app.multiselected) {
      app.multiselections.slice(0).forEach((v, i) => {
        internalMultiremove = true;
        app.removeItemSelected()
      });
      treeBuilder.removeMultiSelection();
    } else
      app.core.deselectElement();
    if (searchTrigger.classList.contains("opened"))
      searchTrigger.click();
    selectedTab = e.target;
    doc.querySelector(href).style.display = "block";
    overlay.style.display = "none";
    switch (href) {
      case "#css-view":
        cssJsView("link[rel=stylesheet],style", cssViewDOM, cssViewDOMList);
        break;
      case "#js-view":
        cssJsView("script", jsViewDOM, jsViewDOMList);
    }
  } else {
    if (app.multiselected) {
      app.multiselections.slice(0).forEach((v, i) => {
        internalMultiremove = true;
        app.removeItemSelected()
      });
      treeBuilder.activateMultiSelection();
    }
    selectedTab = null;
    doc.querySelector(href).style.display = "none";
    overlay.style.display = "block";
    if (!app.elementSelected || app.elementSelected != cacheSel)
      app.core.currentDocument.documentElement.contains(cacheSel) &&
      app.core.selectElement(cacheSel)
    else if (cacheSel) {
      selected = treeBuilder.highlightElement(cacheSel);
      toMatch();
    }
  }
}));
function handleClick(e) {
  selected = e.detail.selected;
  var sourceTarget = selected["__html-tree-builder-el"];
  var multiselected = e.detail.multiselection ? treeBuilder.multiselected : false;
  var match = toMatch(e.detail.match);
  if (!match && multiselected) {
    treeBuilder.removeItemSelected();
    return;
  }
  if (!match)
    selected.classList.add("not-match");
  else
    selected.classList.remove("not-match");
  var toHighlightTarget = sourceTarget.nodeType == 3 ? sourceTarget.parentNode : sourceTarget;
  app.core.selectElement(sourceTarget, selectedIsMatch);
  if (match && app.editMode == "selection" && app.elementSelected != toHighlightTarget) {
    if (app.lastEditable && !app.lastEditable.el.contains(toHighlightTarget)) {
      app.lastEditable.destroy();
    } else if (app.contenteditable && !app.lastEditable && !multiselected) {
      app.core.contenteditable(toHighlightTarget);
    }
    //else if(!app.contenteditable)
    //app.core.setSelection();
    //app.core.translateHighlight(sourceTarget,app.editElements.selection);
  }
  //app.elementSelected = sourceTarget;
  opener.dispatchEvent(new Event("element-selected"));
}
function contextMenu(e) {
  if (e.target.closest(".CodeMirror"))
    return;
  e.preventDefault();
  tooltipEl.style.display = "none";
  var target = e.target.closest(".html-tree-builder-el");
  if (!target) // codeMirror
    return;
  var isHighlighted = target.classList.contains("html-tree-builder__highlight");
  !isHighlighted && target.click();
  tooltipHandle({target: e.target});
  !tooltipElHide && tooltip(e);
}
function copyEl(elementsToCopy) {
  var clipboard = copy || cut;
  clipboard && clipboard.forEach(n => n.listEl.classList.remove("cutted", "copied"));
  copy = elementsToCopy ||
    (treeBuilder.multiselection ? treeBuilder.multiselected.slice(0) : [{
      el: selected["__html-tree-builder-el"],
      listEl: selected
    }]);
  copy.forEach(n => n.listEl.classList.add("copied"));
  cut = null;
  // clear multiselection
  //treeBuilder.clearMultiSelection();
  // elementsToCopy means a call from css/js view. We disable multiselection in this case.
  /*
    if(treeBuilder.multiselection) {
        multiselectButton.click();
        //app.core.deselectElement();
    }
    */
}
function cutEl(elementsToCut) {
  var clipboard = copy || cut;
  clipboard && clipboard.forEach(n => n.listEl.classList.remove("cutted", "copied"));
  cut = elementsToCut ||
    (treeBuilder.multiselection ? treeBuilder.multiselected.slice(0) : [{
      el: selected["__html-tree-builder-el"],
      listEl: selected
    }]);
  cut.forEach(n => n.listEl.classList.add("cutted"));
  copy = null;
  // clear multiselection
  //treeBuilder.clearMultiSelection(); // problem with selected
  // elementsToCopy means a call from css/js view. We disable multiselection in this case.
  /*
    if(treeBuilder.multiselection) {
        multiselectButton.click();
        //app.core.deselectElement();
    }
    */
}
function dblclick(e) {
  if (!selected || !selected.contains(e.target))
    return;
  if (!selectedIsMatch)
    return;
  //var found = app.core.htmlMatch.find(selected["__html-tree-builder-el"]);
  /*
  (!found) // no match
      return;
   */
  // attributes
  var sp = e.target.closest(".html-tree-builder-attribute");
  if (sp && selectedIsMatch.attributes) {
    var tg = e.target != sp ?
      e.target :
      sp.querySelector(".attribute-value") || sp.querySelector(".attribute-key");
    activateAttributeContentEditable(sp, tg);
  }
  // text
  if (selected["__html-tree-builder-el"].nodeType == 3 && selectedIsMatch.HTML) {
    activateTextNodeContentEditable();
  }
}
function onKeyDown(e) {
  if (!e.target)
    return;
  if (e.target.closest("[contenteditable]"))
    return;
  if (e.target.closest(".CodeMirror"))
    return;
  if (tooltipEl.contains(e.target)) {
    tooltipKeyEvents(e);
    return;
  }
  var multiselection = treeBuilder.multiselection;
  if (e.key == "ArrowUp") {
    e.preventDefault();
    if (multiselection)
      multiselectButton.click();
    var previous = selected && (selected.previousElementSibling ||
      (selected.parentNode && selected.parentNode.closest("li")));
    if (previous) {
      if (!isElementInViewport(previous))
        previous.scrollIntoView();
      previous.click();
    }
  }
  if (e.key == "ArrowDown") {
    e.preventDefault();
    if (multiselection)
      multiselectButton.click();
    var next;
    if (selected) {
      if (selected.nextElementSibling) next = selected.nextElementSibling;
      else {
        var hasChildrenOpen = selected.querySelector("li");
        if (hasChildrenOpen)
          next = hasChildrenOpen;
        else {
          var closest = selected.closest("li");
          next = closest && closest.nextElementSibling
        }
      }
    }
    if (next) {
      if (!isElementInViewport(next))
        next.scrollIntoView();
      next.click();
    }
    return;
  }
  if ((e.key == "ArrowLeft" || e.key == "ArrowRight") && selected)
    treeBuilder.openTree({target: selected});
  if (!selectedIsMatch)
    return;
  if (e.key == "Delete" && selected) {
    deleteEl();
    return;
  }
  if (selected && e.key == "Enter") {
    var isMenuToggle = e.target.closest(".menu-toggle");
    if (isMenuToggle)
      return;
    if (e.target.classList.contains("html-tree-builder-attribute") ||
      e.target.classList.contains("html-tree-builder-node-value"))
      return;
    e.preventDefault();
    var attr = selected.querySelector(".html-tree-builder-attribute");
    if (attr && attr.parentNode.parentNode == selected && selectedIsMatch.attributes) {
      var span = attr.querySelector(".attribute-value") || attr.querySelector(".attribute-key");
      activateAttributeContentEditable(attr, span);
      return;
    }
    // text
    if (selected["__html-tree-builder-el"].nodeType == 3 && selectedIsMatch.HTML) {
      activateTextNodeContentEditable();
      return;
    }
  }
  if (e.ctrlKey) {
    switch (e.key) {
      case "c":
      case "C":
        e.preventDefault();
        selected && copyEl();
        break;
      case "x":
      case "X":
        e.preventDefault();
        selected && cutEl();
        break;
      case "v":
      case "V":
        e.preventDefault();
        if (!cut && !copy)
          return;
        selected && pasteEl();
        break;
    }
  }
}
function mutation(e) {
  if (isAutoInsertionFlag) {
    isAutoInsertionFlag = false;
    return;
  }
  var ml = e.detail.mutationList;
  var attr = [];
  var childs = [];
  var scriptMutation, cssMutation;
  ml.forEach(m => {
    if (m.type == "attributes") {
      if (attr.indexOf(m.target) < 0)
        attr.push(m.target)
    }
    if (m.type == "childList") {
      if (childs.indexOf(m.target) < 0)
        childs.push(m.target);
      scriptMutation = scriptMutation || [...m.addedNodes].concat([...m.removedNodes]).find(v => v.tagName == "SCRIPT");
      cssMutation = cssMutation || [...m.addedNodes].concat([...m.removedNodes]).find(v =>
        (v.tagName == "LINK" && v.rel.toLowerCase() == "stylesheet") ||
        v.tagName == "STYLE");
    }
    if (m.type == "characterData") {
      if (childs.indexOf(m.target.parentNode) < 0)
        childs.push(m.target.parentNode)
    }
    var targetTagName = m.target.tagName;
    if (
      (targetTagName == "LINK" && m.target.rel.toLowerCase() == "stylesheet") ||
      targetTagName == "STYLE"
    )
      cssMutation = true;
    if (targetTagName == "SCRIPT")
      scriptMutation = true;
  });
  attr.forEach(a => {
    var el = treeBuilder.isInView(a);
    if (el) {
      var attributes = el.querySelector(".html-tree-builder-attributes");
      attributes.outerHTML = treeBuilder.createAttributes(a.attributes);
    }
  });
  childs.forEach(c => {
    var el = treeBuilder.isInView(c);
    if (!el)
      return;
    var target = el.querySelector(".html-tree-builder__caret");
    if (!target) {
      el.querySelector(".html-tree-builder-element")
        .insertAdjacentHTML('beforeend', '<span class="html-tree-builder__caret"></span>');
      return;
    }
    var ul = el.querySelector("ul");
    ul && ul.remove();
    el.classList.remove("open");
    target && treeBuilder.openTree({target});
  });
  /*
  if(isPasteEvent){
      var className = cut ? "cutted":"copied";
      var clipboard = cut || copy;
      clipboard = clipboard.map(n=>{
          var newTarget = treeBuilder.highlightElement(n.el,false);
          newTarget.classList.add(className);
          return{listEl:newTarget,el:n.el}
      });
      if(cut)
          cut = clipboard;
      else copy = clipboard;
      isPasteEvent = false;
  }*/
  if (cssMutation && cssViewDOM.style.display == "block") {
    if (autoInsertionJsCss)
      autoInsertionJsCss = false;
    else
      cssJsView("link[rel=stylesheet],style", cssViewDOM, cssViewDOMList);
  }
  if (scriptMutation && jsViewDOM.style.display == "block")
    if (autoInsertionJsCss)
      autoInsertionJsCss = false;
    else
      cssJsView("script", jsViewDOM, jsViewDOMList);
  var mutateSelections =
    treeBuilder.multiselection ? treeBuilder.multiselected :
      selected ? [{el: selected["__html-tree-builder-el"], listEl: selected}] : [];
  mutateSelections.forEach((v, i) => {
    if (!app.core.currentDocument.documentElement.contains(v.el)) {
      if (!treeBuilder.multiselection) {
        selected = null;
        treeBuilder.deSelect();
      } else {
        treeBuilder.removeItemSelected(i);
        opener.dispatchEvent(
          new CustomEvent("html-tree-remove-multiselection", {detail: {el}})
        );
      }
      return;
    }
    var isInView = treeBuilder.isInView(v.el)
    if (!isInView)
      isInView = treeBuilder.highlightElement(v.el);
    if (isInView != v.listEl) {
      if (selected == v.listEl) {
        selected = isInView;
        treeBuilder.selected = isInView;
      }
      v.listEl = isInView;
      v.listEl.classList.add("html-tree-builder__highlight");
    }
  })
  /*
  if(app.elementSelected && selected && selected["__html-tree-builder-el"] != app.elementSelected){
      treeBuilder.highlightElement(app.elementSelected);
  }
  /*
  if(app.elementSelected && app.core.currentDocument.contains(app.elementSelected)){
      treeBuilder.highlightElement(app.elementSelected);
  }
  else if(app.elementSelected && !app.core.currentDocument.contains(app.elementSelected)){
      app.core.deselectElement();
  }*/
}
tooltipEl.addEventListener("click", e => {
  var target = e.target.closest("[data-name]");
  if (!target)
    return;
  var nameAction = target.dataset.name;
  if (!nameAction)
    return;
  switch (nameAction) {
    case "add-attribute":
      addAttribute();
      break;
    case "edit-attribute":
      dblclick({target: attributeSelected});
      break;
    case "edit-inner-html":
      editInnerHtml();
      break;
    case "edit-outer-html":
      editOuterHtml();
      break;
    case "delete-element":
      deleteEl();
      break;
    case "cut-element":
      cutEl();
      break;
    case "copy-element":
      copyEl();
      break;
    case "paste-element":
      pasteEl();
      break;
    case "expand-recursively":
      treeBuilder.expandRecursively();
      overlay.scrollTop = selected.offsetTop;
      break;
    case "collapse-children":
      treeBuilder.collapseChildren();
      break;
    case "scroll-into-view":
      selected["__html-tree-builder-el"].scrollIntoView(false);
      break;
    case "set-as-current-stylesheet":
      app.core.setCurrentStyleSheet(selected["__html-tree-builder-el"]);
      break;
  }
  tooltipEl.style.display = "none";
});
function tooltipHandle(e) {
  var el = selected["__html-tree-builder-el"];
  if (!selectedIsMatch) {
    tooltipEl.style.display = "none";
    tooltipElHide = true;
    return;
  }
    /* :after,:before disable options */
  /*
  if(e.detail.pseudo){
      enableTooltipActions(["scroll-into-view"]);
  }
  */
  else {
    tooltipElHide = false;
    var nodeType = el.nodeType;
    if (nodeType == 1 && !el.nodeName.match(/(HEAD|BODY|HTML)$/)) {
      var toDisable = [];
      /* attributes tooltip edit handle */
      if (!selectedIsMatch.attributes)
        toDisable.push("edit-attribute", "add-attribute");
      else {
        attributeSelected = e.target.closest(".html-tree-builder-attribute");
        !attributeSelected && toDisable.push("edit-attribute")
      }
      if (!selectedIsMatch.HTML)
        toDisable.push("edit-inner-html", "edit-outer-html", "cut-element", "copy-element");
      var canBeAStyle = (el.tagName === "STYLE" || el.tagName === "LINK") && el.sheet && el.sheet !== app.core.currentStyleSheet;
      if(!canBeAStyle)
        toDisable.push("set-as-current-stylesheet");
      var clipboard = cut || copy;
      /*
      if(!clipboard ||
          clipboard.find(n=>n.listEl.contains(selected))
      )*/
      if (!clipboard || !selectedIsMatch.match)
        toDisable.push("paste-element");
      if (clipboard && clipboard.length > 1)
        tooltipEl.classList.add("multiselected");
      else
        tooltipEl.classList.remove("multiselected");
      enableTooltipActions(toDisable, true);
    } else if (nodeType == 3 || nodeType == 8) {
      enableTooltipActions(["delete-element", "cut-element", "copy-element", "scroll-into-view"]);
    } else if (el.nodeName.match(/(HEAD|BODY|HTML)$/)) {
      var toDisable = ["cut-element", "copy-element", "edit-outer-html", "delete-element"];
      if (!selectedIsMatch.HTML) {
        toDisable.push("edit-inner-html")
      }
      enableTooltipActions(toDisable, true);
    } else enableTooltipActions([]);
  }
}
function tooltipKeyEvents(e) {
  var sel = tooltipEl.querySelector(".selected");
  if (e.key == "ArrowUp" || e.key == "ArrowDown") {
    var multiselection = treeBuilder.multiselection;
    var root = multiselection ? multiselectionToolTip : tooltipEl;
    if (!sel)
      root.children[0].classList.add("selected");
    else {
      sel.classList.remove("selected");
      var next;
      if (e.key == "ArrowUp") {
        var previous = sel.previousElementSibling;
        while (previous && (previous.tagName != "DIV" || previous.hasAttribute("disabled")))
          previous = previous.previousElementSibling;
        next = previous || (
          multiselection ?
            multiselectionToolTip.children[multiselectionToolTip.children.length - 1] :
            tooltipEl.children[tooltipEl.children.length - 2]
        )
      } else {
        var nextS = sel.nextElementSibling;
        while (nextS && (nextS.tagName != "DIV" || nextS.hasAttribute("disabled")))
          nextS = nextS.nextElementSibling;
        next = nextS || root.children[0]
      }
      next.classList.add("selected");
    }
  }
  if (e.key == "Enter" && sel) {
    e.preventDefault();
    sel.click();
  }
}
function nextNode(node) {
  if (node.hasChildNodes())
    return node.firstChild;
  while (node && !node.nextSibling)
    node = node.parentNode;
  if (!node)
    return null;
  return node.nextSibling;
}

function getElementsInRange(startNode, endNode) {
  var nodes = [];
  var next = startNode;
  while (next) {
    nodes.push(next);
    if (next == endNode)
      break;
    next = nextNode(next, endNode);
  }
  return nodes;
}
multiselectButton.addEventListener("click", e => {
  if (multiselectButton.classList.toggle("selected")) {
    if (selected && (!selectedIsMatch || selected.nodeName.match(/(HTML|HEAD|BODY)$/))) {
      //treeBuilder.deSelect();
      app.core.deselectElement();
      selected = null;
    }
    treeBuilder.activateMultiSelection();
    app.enableMultiselection();
    if ((jsViewDOM.style.display == "block" || cssViewDOM.style.display == "block")
      && selectedJsCSS)
      multiSelectionJsCss.push({listEl: selectedJsCSS, el: selectedJsCSS["__html-tree-builder-el"]})
  } else {
    //treeBuilder.removeMultiSelection();
    //internalMultiremove = true;
    app.destroyMultiselection();
    treeBuilder.removeMultiSelection();
    multiSelectionJsCss.forEach(v => v != selectedJsCSS &&
      v.listEl.classList.remove("html-tree-builder__highlight"));
    multiSelectionJsCss = [];
  }
});
window.addEventListener("beforeunload", e => {
  if (app.multiselected)
    app.destroyMultiselection();
});
function multiselectionOnShiftKey(targetLI, match) {
  var multiselected = treeBuilder.multiselected;
  var lastNode = multiselected[multiselected.length - 1].listEl;
  app.multiselections.slice(0).forEach((v, i) => app.removeItemSelected());
  /*
  multiselected.forEach(v=>v.listEl.classList.remove("html-tree-builder__highlight"));
  treeBuilder.multiselected = [];
  app.multiselections.forEach(n=>n.highlight.remove());
  app.multiselections = [];
  app.elementSelected && app.core.deselectElement();*/
  treeBuilder.selected = null;
  selected = null;
  if (targetLI == lastNode)
    return;
  var arr = [lastNode, targetLI].sort((a, b) => a.offsetTop - b.offsetTop);
  var range = getElementsInRange(arr[0], arr[1]);
  var ms = [];
  range.forEach(n => {
    if (n == targetLI)
      return;
    var realNode = n["__html-tree-builder-el"];
    if (n.nodeName == "LI" && !ms.find(v => n.contains(v.listEl) || v.listEl.contains(n))
      && app.core.htmlMatch.find(realNode)) {
      app.core.selectElement(realNode);
      ms.push({listEl: n, el: realNode});
      /*
        n.classList.add("html-tree-builder__highlight");
        ms.push({listEl: n, el: realNode});
        treeBuilder.toggleClassListHighlight(n);
        app.createSelectionClone(realNode);
        */
    }
  });
  app.core.selectElement(targetLI["__html-tree-builder-el"]);
  //treeBuilder.selected = targetLI;
  //selectedIsMatch = match;
  //handleClick({detail:{selected:targetLI,multiselection:true}})
}
function changeSelection(index) {
  searchBarEntries.children[0].textContent = index + 1;
  var value = selections[index];
  if (value == currentSearchEl)
    return;
  currentSearchEl = value;
  app.core.selectElement(currentSearchEl);
  //currentSearchEl.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}));
  /*
  if(currentSearchEl.nodeType == 1)
      treeBuilder.highlightElement(currentSearchEl);
  else
      treeBuilder.highlightElement(currentSearchEl.parentNode);
      */
}

searchBarUp.addEventListener("click", function (e) {
  if (e.target.disabled)
    return;
  pointer = pointer ? pointer - 1 : selections.length - 1;
  changeSelection(pointer)
});
searchBarDown.addEventListener("click", function (e) {
  if (e.target.disabled)
    return;
  pointer = pointer < selections.length - 1 ? pointer + 1 : 0;
  changeSelection(pointer)
});
searchBar.addEventListener("click", function (e) {
  if (e.target.nodeName != "BUTTON" ||
    e.target.parentNode != searchBar ||
    e.target == searchSelected)
    return;
  searchSelected.classList.remove("selected");
  e.target.classList.add("selected");
  searchSelected = e.target;
});
findButton.addEventListener("keydown", function (e) {
  if (e.key != "Enter")
    return;
  selectionText = findButton.value.trim();
  currentSearchEl = null;
  var doc = app.core.currentDocument;
  selections = doc.querySelectorAll(selectionText);
  searchBarEntries.children[0].textContent = selections.length ? "1" : "0";
  searchBarEntries.children[1].textContent = selections.length ? selections.length : "0";
  searchBarEntries.style.display = "block";
  if (!selections.length)
    return;
  searchBarDown.disabled = false;
  searchBarUp.disabled = false;
  changeSelection(0);
})
let searchTrigger = document.getElementById("search-trigger");
searchTrigger.addEventListener("click", e => {
  searchTrigger.classList.toggle("opened");
  searchTrigger.classList.toggle("selected");
  var isOpened = searchBar.classList.toggle("opened");
  isOpened && selectedTab && selectedTab.click();
});

})();
