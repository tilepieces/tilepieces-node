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
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
var defaults = {
    preventDefault : false,
    preventDefaultOnMeta : true,
    firingOnlyAtTarget : false,
    exclude : ""
};
window.Shortcuts = function(domEl,options = {}){
    var $self = this;
    $self.target = domEl;
    $self.events = events();
    $self.on = $self.events.on;
    $self.options = Object.assign(defaults,options);
    var kup = (e)=>keyup($self,e);
    //var kdown = (e)=>keydown($self,e);
    var mdown = (e)=>mousedown($self,e);
    domEl.ownerDocument.addEventListener("keydown",kup);
    //document.addEventListener("keydown",kdown);
    domEl.addEventListener("click",mdown);
    $self.destroy = function(){
        domEl.ownerDocument.removeEventListener("keydown",kup);
        //document.removeEventListener("keydown",kdown);
        domEl.removeEventListener("click",mdown);
    };
    return $self;
}
function keydown($self,e){
    if($self.options.firingOnlyAtTarget && e.target !== $self.target && !$self.target.contains(e.target))
        return;
    if($self.options.preventDefault)
        e.preventDefault();
    if($self.options.preventDefaultOnMeta &&
        (e.altKey ||
        e.ctrlKey ||
        e.shiftKey)
    )
        e.preventDefault();
    $self.events.dispatch("down",e);
}
function keyup($self,e){
    if($self.options.firingOnlyAtTarget && e.target !== $self.target && !$self.target.contains(e.target))
        return;
    var match;
    try {
        match = $self.options.exclude && e.target.matches($self.options.exclude)
    }
    catch(e){}
    if(match)
        return;
    if($self.options.preventDefault)
        e.preventDefault();
    else if($self.options.preventDefaultOnMeta &&
        (e.altKey ||
        e.ctrlKey ||
        e.shiftKey)
    )
        e.preventDefault();
    if(e.ctrlKey)
        switch(e.key){
            case "c":
            case "C":
                $self.events.dispatch("copy",e);
                break;
            case "v":
            case "V":
                $self.events.dispatch("paste",e);
                break;
            case "x":
            case "X":
                $self.events.dispatch("cut",e);
                break;
            case "y":
            case "Y":
                $self.events.dispatch("redo",e);
                break;
            case "z":
            case "Z":
                $self.events.dispatch("undo",e);
                break;
            default:break;
        }
    if(e.altKey)
        switch(e.key){
            case "ArrowLeft":
                $self.events.dispatch("redo",e);
                break;
            case "ArrowRight":
                $self.events.dispatch("undo",e);
                break;
            default:break;
        }
    if(!e.altKey && !e.ctrlKey)
        switch(e.key){
            case "Delete":
                $self.events.dispatch("delete",e);
                break;
            case "Enter":
                $self.events.dispatch("enter",e);
                break;
            case "Tab":
                $self.events.dispatch("tab",e);
                break;
            case "Backspace":
                $self.events.dispatch("backspace",e);
            default:break;
        }
    $self.events.dispatch("up",e);
}
function mousedown($self,e) {
    if($self.options.firingOnlyAtTarget && e.target !== $self.target && !$self.target.contains(e.target))
        return;
    if($self.options.preventDefault)
        e.preventDefault();
    if(e.ctrlKey)
        $self.events.dispatch("selection",e);
    if(e.shiftKey)
        $self.events.dispatch("multiselection",e);

    $self.events.dispatch("click",e);
}

})();
function click($self,e){
    e.preventDefault();
    if(e.target.classList.contains("tooltip-toggler")) { // open/close tooltip
        $self.events.dispatch("open-tooltip", {
            path: e.target.parentNode.parentNode.dataset.path,
            DOMel: e.target.parentNode.parentNode,
            file: e.target.parentNode.parentNode.dataset.file,
            e
        })
    }
    else if(e.target.classList.contains("project-tree-caret")) { // open/close tree
        var isOpen = e.target.parentNode.classList.toggle("project-tree-caret__open");
        if(isOpen)
            $self.events.dispatch("openTree",{
                path : e.target.parentNode.parentNode.dataset.path,
                DOMel : e.target.parentNode.parentNode
            })
    }
    else if(!e.ctrlKey && !e.shiftKey)selection($self,e)
}

ProjectTree.prototype.copy = function(){
    var $self = this;
    $self.memory = {
        type : "copy",
        selected : $self.selected.slice(0) // clone array
    };
    console.log("copy",$self.selected,$self.memory);
}
ProjectTree.prototype.cut = function(){
    //$self.selected.forEach(v=>v.classList.add("project-tree-cut"));
    var $self = this;
    $self.memory = {
        type : "cut",
        selected : $self.selected.slice(0) // clone array
    };
    console.log("cut",$self.selected,$self.memory);
}
function move($self,element){
    var pos1 = 0, pos2 = 0, moved = false;
    var clones=[],dirSelected;
    var drag = __drag(element,{
        handle : ".project-tree-selected > div > .project-tree-grabber"
    });
    var dummy = document.querySelector("body>dummy-drag");
    if(!dummy) {
        dummy = document.createElement("dummy-drag");
        document.body.appendChild(dummy);
    }
    drag.on("down", function (e) {
        e.ev.preventDefault();
        if(!$self.selected.length)
            return;
        pos1 = e.x;
        pos2 = e.y;
        $self.selected.forEach(select=>dummy.appendChild(select.cloneNode(true)))
    })
    .on("move", function (e) {
        e.ev.preventDefault();
        if((Math.abs(pos1-e.x) > 5 || Math.abs(pos2-e.y) > 5 || moved) && $self.selected.length) {
            moved = true;
            dummy.style.transform = "translate3d(" + e.x + "px," + e.y + "px,0)";
            dirSelected && dirSelected.classList.remove("__drag__drop-overlay");
            dirSelected = e.target.closest("[data-dir]");
            dirSelected && dirSelected.classList.add("__drag__drop-overlay");
        }
    })
    .on("up", function (e) {
        e.ev.preventDefault();
        if(dirSelected) {
            $self.events.dispatch("paste",{
                oldPaths: $self.selected.reduce((filtered, option)=> {
                    if (!option.contains(dirSelected) && option !== dirSelected &&
                        option.parentNode.parentNode !== dirSelected)
                        filtered.push({
                            path:option.dataset.path,
                            isFile: !!option.dataset.file,
                            file:option.dataset.file,
                            dir:option.dataset.dir
                        });
                    return filtered;
                }, []).sort((a, b)=>{ // sort from the deep level to the superficial one, to prevent to delete directory in which there are files schedulet to be copy/move
                    return b.path.split("/").length - a.path.split("/").length ;
                }),
                newPath : dirSelected.dataset.path,
                dir : dirSelected,
                type : "cut"
            });
            dirSelected.classList.remove("__drag__drop-overlay");
            dirSelected = null;
            $self.removeAllSelections();
        }
        clones = [];
        dummy.style.transform = "translate3d(-9999px,-9999px,0)";
        dummy.innerHTML = "";
        moved = false;
    });
    return {
        destroy:drag.destroy
    }
}
function multiselection($self,e){
    console.log("multiselection",e);
    if(!$self.selected.length)
        return;
    var targetElement = e.target.nodeName != "LI" ? e.target.closest("li") : e.target;
    function cycle(t,siblingPath){
        var original = t;
        var target = t;
        do{
            selection($self, {target,shiftKey:true});
            if(target === targetElement)
                return;
        }while(target = target[siblingPath]);
        //var parent = original.parentElement.closest("li[data-path]");
        //parent && parent[siblingPath] && cycle(parent,siblingPath);
    }
    if($self.selected.length > 1) {
        for(var i = $self.selected.length-2;i>=0;i--)
            $self.selected[i].classList.remove("project-tree-selected")
        $self.selected.splice(0, $self.selected.length - 1);
    }
    var elToStart = $self.selected[0];
    if(offset(elToStart).top < offset(targetElement).top) // from top to bottom
        cycle(elToStart,"nextElementSibling");
    else
        cycle(elToStart,"previousElementSibling");
}
function onRenameKeydown(e){
    if(e.key == "Enter") {
        e.preventDefault();
    }
}
function onRenamePaste(e){
    e.preventDefault();
    var t = e.target;
    var clipboardData = e.clipboardData;
    if (clipboardData && clipboardData.getData) {
        var text = clipboardData.getData("text/plain");
        if (text.length){
            var sel, range;
            sel = t.ownerDocument.defaultView.getSelection();
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(t.ownerDocument.createTextNode(text));
        }
    }
}
ProjectTree.prototype.paste = function(){
    var $self = this;
    console.log("paste",$self.memory, $self.selected);
    if($self.memory && $self.selected.length) {
        $self.events.dispatch("paste", {
            oldPaths: $self.memory.selected.reduce((filtered, option)=> {
                if (!option.contains($self.selected[0]))
                    filtered.push({
                        path:option.dataset.path,
                        isFile: !!option.dataset.file,
                        file:option.dataset.file,
                        dir:option.dataset.dir
                    });
                return filtered;
            }, []).sort((a, b)=>{ // sort from the deep level to the superficial one, to prevent to delete directory in which there are files schedule to be copy/move
                return b.path.split("/").length - a.path.split("/").length ;
            }),
            newPath: $self.selected[0].dataset.path,
            dir: $self.selected[0],
            type: $self.memory.type
        });
        $self.memory = null;
    }
}
function read($self,e){
    e.preventDefault();
    var targetElement = e.target.nodeName != "LI" ? e.target.closest("li") : e.target;
    if(!targetElement){
        console.error(e);
        return;
    }
    if(targetElement.classList.contains("project-tree-file"))
        $self.events.dispatch("fileSelected",{
            path : targetElement.dataset.path,
            file : targetElement.dataset.file
        });
    /*
    if(e.target.classList.contains("project-tree-directory-name") ||
        e.target.classList.contains("project-tree-file-name"))
        refactor($self,e.target)
        */
}

function redo($self,e){
    console.log("redo",e);
}
ProjectTree.prototype.refactor = function($self,el){
    var oldName = el.dataset.file ? el.dataset.file :
        el.dataset.dir;
    var keyName = el.querySelector(".project-tree-key-name");
    function onRefactor(e){
        keyName.textContent = keyName.textContent.trim();
        if(keyName.textContent != oldName) {
            var newName = keyName.textContent;
            keyName.textContent = oldName;
            $self.events.dispatch("refactor", {
                oldName: oldName,
                newName: newName,
                path: el.dataset.path,
                isFile: !!el.dataset.file,
                selected:el,
                validate: ()=> {
                    keyName.textContent = newName;
                    el.dataset.file ? el.dataset.file = newName : el.dataset.dir = newName;
                    el.dataset.path = el.dataset.path.split("/").map((v,i,a)=>{
                        if(i==a.length-1)
                            return newName;
                        else return v;
                    }).join("/")
                }
            });
        }
        keyName.contentEditable = false;
        keyName.removeEventListener("blur",onRefactor);
        keyName.removeEventListener("paste",onRenamePaste);
        keyName.removeEventListener("keydown",onRenameKeydown);
        $self.removeAllSelections();
    }
    keyName.contentEditable = true;
    keyName.addEventListener("blur",onRefactor);
    keyName.addEventListener("paste",onRenamePaste);
    keyName.addEventListener("keydown",onRenameKeydown);
    keyName.focus();
}
function selection($self,e){
    var targetElement = e.target.hasAttribute("data-path") ? e.target : e.target.closest("[data-path]");
    if(e.ctrlKey && !e.shiftKey && targetElement.classList.contains("project-tree-selected")) {
        targetElement.classList.remove("project-tree-selected");
        $self.selected.splice($self.selected.indexOf(targetElement),1);
        //disable grab
        if(!$self.justWatch) {
            var grabber = targetElement.querySelector(".project-tree-grabber");
            grabber && grabber.classList.remove("__drag-cursor-grab");
        }
        return;
    }
    else if(!e.ctrlKey && !e.shiftKey) { // single selection
        $self.removeAllSelections();
    }
    $self.selected.indexOf(targetElement) == -1 && $self.selected.push(targetElement);
    targetElement.classList.add("project-tree-selected");
    //enable grab
    if(!$self.justWatch) {
        var grabber = targetElement.querySelector(".project-tree-grabber");
        grabber && grabber.classList.add("__drag-cursor-grab");
    }
    $self.events.dispatch("fileHighlighted",{
        path : targetElement.dataset.path,
        file : targetElement.dataset.file
    });
}
function undo($self,e){
    console.log("undo",e);
}
function ProjectTree(target,firstModel,name="Unknown Object",fileRenderMode = true,justWatch = false){
    var $self = this;
    $self.selected = [];
    $self.events = events();
    $self.on = $self.events.on;
    $self.target = target;
    $self.justWatch = justWatch;
    $self.fileRenderMode = fileRenderMode;
    var clickEvents = (e)=>click($self,e);
    var contextMenuEvent = (e)=>{
        e.preventDefault();
        selection($self, e);
        var togglerPath = e.target.closest("[data-path]");
        $self.events.dispatch("open-tooltip", {
            path: togglerPath.dataset.path,
            DOMel: togglerPath,
            file: togglerPath.dataset.file,
            e
        })
    };
    target.addEventListener("click",clickEvents);
    target.addEventListener("contextmenu",contextMenuEvent);
    if(!justWatch) {
        var dblClick = (e)=>read($self, e);
        var mv = move($self, target);
        $self.shortcuts = new Shortcuts(target,{exclude:"[contenteditable=true]"});
        $self.history = []; // TODO never used
        $self.memory = null;
        // binding events
        target.addEventListener("dblclick", dblClick);
        $self.shortcuts.on("cut", ()=>$self.cut());
        $self.shortcuts.on("copy", ()=>$self.copy());
        $self.shortcuts.on("paste", ()=>$self.paste());
        $self.shortcuts.on("undo", e=>undo($self, e));
        $self.shortcuts.on("redo", e=>redo($self, e));
        $self.shortcuts.on("selection", e=>selection($self, e));
        $self.shortcuts.on("multiselection", e=>multiselection($self, e));
        $self.shortcuts.on("delete", e=>$self.selected.sort((a, b)=> {
            // sort from the deep level to the superficial one, to prevent to delete directory in which there are files schedulet to be copy/move
            return b.dataset.path.split("/").length - a.dataset.path.split("/").length;
        }).forEach(v=>$self.delete(v.dataset.path, v)));
        $self.destroy = ()=> {
            mv.destroy();
            $self.shortcuts.destroy();
            target.removeEventListener("click", clickEvents);
            target.removeEventListener("dblclick", dblClick);
            target.removeEventListener("contextmenu",contextMenuEvent);
            target.innerHTML = "";
        };
    }
    else
        $self.destroy = ()=> {
            target.removeEventListener("click", clickEvents);
            target.innerHTML = "";
        };
    // init
    var div = target.ownerDocument.createElement("div");
    div.classList.add("project-tree","project-tree-root");
    div.innerHTML = `<div class=selector><a href=# class="tooltip-toggler">...</a>`+`<span class="project-tree-key-name">${name}</span>
    <span class="project-tree-caret"></span></div>`;
    div.dataset.path = "";
    div.dataset.dir = "";
    target.appendChild(div);
    $self.update(div,firstModel);
    return $self;
};
window.ProjectTree =ProjectTree;


ProjectTree.prototype.delete = function(path,delEl,dispatch = true) {
    var $self = this;
    if(!$self.selected.length)
        return;
    console.log("delete called with path ->",path, " and delEl->", delEl);
    var DOMelement = delEl || $self.target.querySelector("[data-path='" + path + "']");
    function del(){
        $self.selected.slice($self.selected.indexOf(DOMelement),1);
        DOMelement.parentElement.removeChild(DOMelement);
    }
    if(dispatch)
        this.events.dispatch("delete",{
            path : path || DOMelement.dataset.path,
            isFile: !!DOMelement.dataset.file,
            file:DOMelement.dataset.file,
            dir:DOMelement.dataset.dir,
            validate : del
        });
    else
        del()
};
ProjectTree.prototype.removeAllSelections = function(){
    this.selected.forEach(v=>{
        v.classList.remove("project-tree-selected");
        //disable grab
        var grabber = v.querySelector(".project-tree-grabber");
        grabber && grabber.classList.remove("__drag-cursor-grab");
    });
    this.selected = [];

}
function renderDir(key,DOMelement,documentTarget){
    var li = documentTarget.createElement("li");
    li.classList.add("project-tree-directory");
    li.innerHTML = `<div class="selector"><a href="#" class="tooltip-toggler">...</a>`+
        `<span class="project-tree-grabber">&#x1F4C1;</span>
            <span class="project-tree-key-name">${key}</span><span class='project-tree-caret'></span></div>`;
    li.dataset.path = DOMelement.dataset.path ? DOMelement.dataset.path + "/" + key:key;
    li.dataset.dir = key;
    return li;
}
function renderFile(key,DOMelement,documentTarget){
    var li = documentTarget.createElement("li");
    li.classList.add("project-tree-file");
    li.innerHTML = `<div class="selector"><a href="#" class="tooltip-toggler">...</a>`+
        `<span class="project-tree-grabber">&#x1F4C4;</span>
        <span class="project-tree-key-name">${key}</span></div>`;
    li.dataset.path = DOMelement.dataset.path ? DOMelement.dataset.
        path + "/" + key : key;
    li.dataset.file = key;
    return li;
}
function renderJSONel(key,DOMelement,value,documentTarget){
    var li = documentTarget.createElement("li");
    li.classList.add("project-tree-file");
    li.innerHTML = `<span class="project-tree-grabber __drag-cursor-grab"></span>
        <span class="project-tree-key-name">${key}</span>:
        <span class="project-tree-key-value">${'' + value}</span>`;
    li.dataset.path = DOMelement.dataset.path ? DOMelement.dataset.
        path + "/" + key : key;
    li.dataset.file = key;
    return li;
}
ProjectTree.prototype.update = function(path, values) {
    var $self = this;
    var DOMelement = typeof path !== "string" ? path :
        $self.target.querySelector("[data-path='" + path + "']");
    var hasUl = DOMelement.querySelector("ul");
    if(hasUl) { // empty element for update, remove selected
        $self.selected.forEach(v=>{
            if(hasUl.contains(v)){
                v.classList.remove("project-tree-selected");
                $self.selected.splice($self.selected.indexOf(v),1);
            }
        });
        DOMelement.removeChild(DOMelement.children[DOMelement.children.length - 1]);
    }
    var docFrag = new DocumentFragment();
    var documentTarget = $self.target.ownerDocument;
    var ul = documentTarget.createElement("ul");
    /* FILES MANAGEMENT */
    if($self.fileRenderMode) { // renderMode is the only at the moment
        var dir = [];
        var files = [];
        for (var k in values) {
            if (typeof values[k] === "string")
                files.push(k)
            else
                dir.push(k)
        }
        dir.sort((a,b)=>a.localeCompare(b)).forEach(key=> {
            var li = renderDir(key, DOMelement,documentTarget);
            ul.appendChild(li);

        });
        files.sort((a,b)=>a.localeCompare(b)).forEach(key=> {
            var li = renderFile(key, DOMelement,documentTarget);
            ul.appendChild(li);
        });

    }
    else{
        for (var k in values) {
            var li;
            // object, but not  null ( which is an object in JS )
            if (typeof values[k] === "object" && values[k])
                li = renderDir(k, DOMelement,documentTarget);
            else
                li = renderJSONel(k, DOMelement, values[k],documentTarget)
            ul.appendChild(li);
        }
    }
    docFrag.appendChild(ul);
    DOMelement.appendChild(docFrag);
    [...ul.children].forEach(li=>{
        var pos = $self.target.getBoundingClientRect().left - li.getBoundingClientRect().left;
        li.style.setProperty('--left',
            pos+"px");
        li.style.setProperty('--left-positive',
            (-pos)+"px");
    })
};

ProjectTree.prototype.updatePath = function(path,nodeType) {
    var $self = this;
    var DOMelement = typeof path !== "string" ? path :
        $self.target.querySelector("[data-path='" + path + "']");
    if(DOMelement && nodeType == "file"){
        console.warn("updatePath called with path already present")
        return;
    }
    var splittedPath = path.split("/");
    var name = splittedPath.pop();
    console.log(name);
    for(var i = splittedPath.length;i>=0;i--){
        path = splittedPath.filter((v,ind)=>ind<i).join("/");
        console.log(path);
        console.log(splittedPath[i]);
        DOMelement =$self.target.querySelector("[data-path='" + path + "']");
        if(DOMelement) {
            if(splittedPath[i+1]) {
                name = splittedPath[i + 1] || name;
                nodeType = "directory";
            }
            break;
        }
    }
    if(!DOMelement)
        return;
    var Ul = DOMelement.querySelector("ul");
    if(!Ul){
        console.error("update Path no ul");
        return;
    }
    var dirChilds = [...Ul.children].filter(v=>v.dataset.dir).map(v=>v.dataset.dir);
    var fileChilds = [...Ul.children].filter(v=>v.dataset.file).map(v=>v.dataset.file);
    var documentTarget = $self.target.ownerDocument;
    var li;
    if (nodeType == "file") {
        var entries = fileChilds.concat([name]).sort((a,b)=>a.localeCompare(b));
        var newIndex = entries.indexOf(name) + dirChilds.length;
        li = renderFile(name, DOMelement, documentTarget);
    }
    else {
        var entries = dirChilds.concat([name]).sort((a,b)=>a.localeCompare(b));
        var newIndex = entries.indexOf(name);
        li = renderDir(name, DOMelement, documentTarget);
    }
    if(newIndex<Ul.children.length)
        Ul.children[newIndex].before(li);
    else
        Ul.append(li);
};


const opener = window.opener ? window.opener : window.parent;
const storageIntegration = opener.storageInterface;
const allowedExtToEdit = ["js","mjs","json","html","htm","css","ts","svg","xml"];
const app = opener.tilepieces;
const dialog = opener.dialog;
const confirmDialog = opener.confirmDialog;
const alertDialog = opener.alertDialog;
const promptDialog = opener.promptDialog;
const tooltipEl = document.getElementById("project-menu-tooltip");
const editSourceCode = document.getElementById("edit-source-code");
const tooltipCopy = document.getElementById("project-tree-copy");
const tooltipCut = document.getElementById("project-tree-cut");
const tooltipPaste = document.getElementById("project-tree-paste");
const openInNewWindow = document.getElementById("open-in-new-window");
const projectTreeAddFileWrapper = document.getElementById("project-tree-add-file-wrapper");
const ptframe = document.getElementById("project-tree-element");
const projectWrapper= document.getElementById("project-wrapper");
const projectTreeWrapper= document.getElementById("project-tree-wrapper");
const buttonCreateFile = document.getElementById("project-tree-create-file");
const fileList = document.getElementById("project-tree-file-list");
const buttonCreateDir = document.getElementById("project-tree-create-dir");
const buttonAddFile = document.getElementById("project-tree-add-file");
const buttonDeleteFile = document.getElementById("project-tree-delete");
const buttonRefactorFile = document.getElementById("project-tree-refactor");
const newFileDialog = document.getElementById("new-file-form-template");
let pt;
const HTMLTextTemplate = (text)=>`<!DOCTYPE html><html><head><meta charset="UTF-8"><title></title><meta description=""><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta property="og:type" content="website"><meta property="og:url" content=""><meta property="og:site_name" content=""><meta property="og:image" itemprop="image primaryImageOfPage" content=""></head><body>${text}</body></html>`;
function ptDelete(data){
    confirmDialog(`Do you want to delete ${data.path}?`);
    opener.addEventListener("confirm-dialog-submit",()=>confirmDelete(data),{once:true});
}
function confirmDelete(data){
    storageIntegration.delete(data.path).then(res=>{
        data.validate();
        //var path = data.path[0] == "/" ? data.path : "/" + data.path;
        opener.dispatchEvent(new CustomEvent('file-deleted',
            {
                detail: {
                    path:data.path,
                    data
                }
            }
        ));
    },err=>{
        console.error("[error in deleting path]",err);
        alertDialog("Error in deleting path "+ data.path);
    })
}
function ptFileHighlighted(data) {
}
function ptFileSelected(data){
    storageIntegration.read(data.path).then(fileText=>{
        var path = data.path;
        var name = path.split("/").pop();
        opener.dispatchEvent(new CustomEvent('file-selected',
            {
                detail: {
                    path,
                    name,
                    ext:name.includes(".") ?
                        name.split('.').pop() :
                        null,
                    file:fileText,
                    fileText,
                    data
                }
            }
        ));
    },err=>{
        console.error("[error in opening file]",err);
        alertDialog("Error in opening file "+data.path);
    })
}
/*
loadFile.addEventListener("click",e=> {
    var selected = pt && pt.selected[0];
    if(selected){
        ptFileSelected({
            path : selected.dataset.path,
            file : selected.dataset.file
        })
    }
});
    */
async function openRecursively(path){
    var isPresentPath = path[0] == "/" ? path.substring(1) : path;
    var isPresent = pt.target.querySelector(`[data-path="${isPresentPath}"]`);
    if(isPresent && isPresent.classList.contains("project-tree-selected")){
        var rect = isPresent.getBoundingClientRect();
        var isVisible = (rect.top >= 0) && (rect.bottom <= window.innerHeight)
        !isVisible &&
        isPresent.scrollIntoView();
        return;
    }
    if(path[0]!="/") path="/"+path;
    var pathSplitted = path.split("/");
    var partialPath = "";
    for(var i = 0;i<pathSplitted.length;i++){
        var partOfPath = pathSplitted[i];
        if(partOfPath && partialPath)
            partialPath+="/"+partOfPath;
        else if(partOfPath && !partialPath)
            partialPath=partOfPath;
        var target = pt.target.querySelector(`[data-path${partialPath ? `="${partialPath}"` : ""}]`);
        if(!target)
            return;
        if(i!=pathSplitted.length-1) {
            target.querySelector(".selector").classList.add("project-tree-caret__open");
            try {
                await ptOpenTree({
                    path: target.dataset.path,
                    DOMel: target
                })
            }
            catch (e) {
                console.error("[error in opening directory]", e);
                alertDialog("Error in opening directory " + partialPath);
            }
        }
        else {
            target.scrollIntoView();
            target.click()
        }
    }
}
function openTooltip(e){
    var path = e.path;
    var name = path.split("/").pop();
    var ext = name.includes(".") ?
        name.split('.').pop() :
        "";
    var isFile = e.file;
    var isRoot = e.DOMel.classList.contains("project-tree-root");
    tooltipCopy.hidden = isRoot;
    tooltipCut.hidden = isRoot;
    tooltipPaste.hidden = !pt.memory || isFile;
    editSourceCode.hidden = !isFile || allowedExtToEdit.indexOf(ext)<0;
    openInNewWindow.hidden = ext != "htm" && ext != "html";
    buttonCreateFile.hidden = isFile;
    buttonCreateDir.hidden = isFile;
    projectTreeAddFileWrapper.hidden = isFile;
    buttonRefactorFile.hidden = isRoot;
    tooltip(e.e);
}
function ptOpenTree(data){
    return new Promise((res,rej)=> {
        storageIntegration.read(data.path).then(readDir=> {
            pt.update(data.DOMel, readDir.value);
            opener.dispatchEvent(new Event("project-tree-open-dir"));
            res();
        }, err=> {
            console.error("[error in opening directory]", err);
            alertDialog("Error in opening directory " + data.path);
            rej();
        })
    });
}
async function ptPaste(data){
    console.log("paste received:", data);
    dialog.open("copying files...",true);
    if(!data.oldPaths.length){
        dialog.close();
        console.error("move no valid paths, return;");
        alertDialog("invalid move");
        return;
    }
    var move = data.type == "cut";
    for(var i = 0;i<data.oldPaths.length;i++) {
        var oldPath = data.oldPaths[i];
        var namePath = oldPath.file || oldPath.dir;
        var newPath = data.newPath + "/" + namePath;
        try {
            var copy = await storageIntegration.copy(oldPath.path, newPath, move);
        }
        catch(e){
            dialog.close();
            console.error("[error in copying/moving files]",e);
            alertDialog("Error in copying/moving file "+oldPath.path+" in " + data.newPath + "/" + namePath);
            return;
        }
        move && pt.delete(oldPath.path,null,false);
        console.log("copy files ", copy);
        //pt.updatePath(newPath,oldPath.dir ? "directory" : "file");
    }
    /*
    try {
        var newPath = await storageIntegration.read(data.newPath);
    }
    catch(e){
        console.error("[error in reading path after copying/moving]",e);
        alertDialog("Error in reading path "+data.newPath+" after copying/moving");
        return;
    }*/
    //pt.update(data.dir,newPath.value);
    // dispatch "paste"
    opener.dispatchEvent(new CustomEvent('file-pasted',
        {
            detail: {
                path:data.newPath,
                oldPath:oldPath.path
            }
        }
    ));
    dialog.close();
}
function ptRefactor(data) {
    confirmDialog(`Do you want to refactor ${data.oldName} in ${data.newName}?`);
    opener.addEventListener("confirm-dialog-submit",()=>confirmRefactor(data),{once:true});
}
function confirmRefactor(data){
    var parentPath = data.path.split("/");
    parentPath.pop();
    parentPath = parentPath.length ? parentPath.join("/") + "/" : "";
    storageIntegration.copy(parentPath + data.oldName,
        parentPath + data.newName,true).then(rename=>{
        data.validate();
        storageIntegration.read(parentPath + data.newName).then(newValue=>{
            if(!data.isFile)
                pt.update(data.selected,newValue.value);
            opener.dispatchEvent(new CustomEvent('file-renamed',
                {
                    detail: {
                        newName:data.newName,
                        oldName:data.oldName,
                        newPath:parentPath + data.newName,
                        oldPath:parentPath + data.oldName,
                        file : newValue
                    }
                }
            ));
        },err=>{
            console.error("[error in reading path after refactoring]",err);
            alertDialog("Error in reading path "+ data.path + " after refactoring");
        })
    },err=>{
        console.error("[error in refactoring path]",err);
        alertDialog("Error in deleting path "+ data.path);
    })
}

buttonAddFile.addEventListener("change",async e=>{
    if(pt && pt.selected[0] && pt.selected[0].hasAttribute("data-dir")) {
        var path= pt.selected[0].dataset.path;
        if (e.target.files.length)
            for (var i = 0; i < e.target.files.length; i++) {
                var fileName = e.target.files[i].name;
                var newPath = path + "/" + fileName;
                try {
                    var up = await storageIntegration.update(
                        newPath,
                        e.target.files[i]
                    );
                }
                catch(e){
                    console.error("[error in adding files]",e);
                    alertDialog("Error in adding file " + fileName + "in path "+newPath);
                    return;
                }
            }
        /*
        try {
            var read = await storageIntegration.read(path);
        }
        catch(e){
            console.error("[error in reading files after adding files]",e);
            alertDialog("Error in reading file in  " + path + " after adding files");
            return;
        }
        pt.update(pt.selected[0],read.value);*/
    }
})

buttonCreateDir.addEventListener("click",ev=>{
    if(!pt || !pt.selected[0] || !pt.selected[0].hasAttribute("data-dir")) // dataset can't be reliable because data-dir could be empty
        return;
    promptDialog({
        label : "New directory name:",
        buttonName : "CREATE",
        checkOnSubmit:true,
        patternFunction : (value,target)=>{
            value = value.trim();
            return !value.match(/[()\/><?:%*"|\\]#+/);
        },
        patternExpl : "Directory name cannot contain /\\?%*:|\"<># characters"
    });
    var type = ev.target.dataset.type;
    opener.addEventListener("prompt-dialog-submit",(e)=>{
        createFile("." + type,true,e);
    },{once:true});
});

// close list when not focus
//projectWrapper.ownerDocument.addEventListener("click",e=>e.target!=buttonCreateFile && fileList.classList.remove("display"));
//projectWrapper.ownerDocument.defaultView.addEventListener("blur",e=>fileList.classList.remove("display"));
fileList.addEventListener("click",ev=>{
    if(!pt || !pt.selected[0] || !pt.selected[0].hasAttribute("data-dir")) // dataset can't be reliable because data-dir could be empty
        return;
    if(ev.target.nodeName!="LI")
        return;
    promptDialog({
        label : "New file name:",
        buttonName : "CREATE",
        checkOnSubmit:true,
        patternFunction : (value,target)=>{
            value = value.trim();
            return !value.match(/[()\/><?:%*"|\\]+#/);
        },
        patternExpl : "File name cannot contain /\\?%*:|\"<># characters"
    });
    var type = ev.target.dataset.type ? "." + ev.target.dataset.type : "";
    opener.addEventListener("prompt-dialog-submit",e=>{
        createFile(type,false,e);
    },{once:true});
});
async function createFile(extension,dir,e) { // add a file/directory
    var filename = e.detail.value;
    var selected= pt.selected[0],
        path= selected.dataset.path;
    var newFile = dir ? filename : filename + extension;
    var date = new Date();
    var value = extension == ".html" ?
        HTMLTextTemplate(`data:text/plain;created on path:"${path}" on date ${date}`) : "";
    var newPath = (path ? path + "/" : "") + newFile.trim();
    try {
        var up = await storageIntegration.update(newPath, dir ? null : new Blob([value]));
    }
    catch(err){
        console.error("[error in creating path]",err);
        alertDialog("Error in creating new path "+ newPath);
    }
    /*
    try {
        var read = await storageIntegration.read(path);
    }
    catch(err){
        console.error("[error in reading path after creation]",err);
        alertDialog("Error in creating reading path "+ path + " after creating new path "+ newPath);
    }*/
    //pt.updatePath(newPath,dir ? "directory" : "file");
}
tooltipCopy.addEventListener("click",e=>{
    pt.copy();
    tooltipEl.style.display="none";
});
tooltipCut.addEventListener("click",e=>{
    pt.cut();
    tooltipEl.style.display="none";
});
tooltipPaste.addEventListener("click",e=>{
    pt.paste();
    tooltipEl.style.display="none";
});
buttonDeleteFile.addEventListener("click",e=>{
    if(pt && pt.selected[0])
        pt.delete(null,pt.selected[0]);
});
editSourceCode.addEventListener("click",e=> {
    var selected = pt && pt.selected[0];
    var ext = selected.dataset.file.split('.').pop();
    storageIntegration.read(selected.dataset.path).then(fileText=>{
        app.codeMirrorEditor(fileText,ext)
            .then(res=>{
                dialog.open("saving file...",true);
                app.updateFile(selected.dataset.path,res,0).then(()=>{
                    if(app.currentPage && app.currentPage.path == selected.dataset.path)
                        app.frame.contentWindow.location.reload();
                    dialog.close();
                })
            },e=>console.error(e))
    },e=>console.error(e));
});
//var wrapper = document.getElementById("project-tree-wrapper");
//var wrapperText = wrapper.children[0];
//var wrapperTrigger = wrapper.children[1];
if(app.currentProject){
    storageIntegration.read("").then(res=>{
        pt = new ProjectTree(projectTreeWrapper, res.value,app.currentProject);
        ptInterface(pt);
        projectWrapper.style.display="block";
        app.currentPage && app.currentPage.path &&
        openRecursively(app.currentPage.path);
    },err=>{
        console.error("[error in reading project]",err);
        alertDialog("Error in reading project "+ app.currentProject);
    })
}
opener.addEventListener("set-project",async e=>{
    pt && pt.destroy();
    pt = new ProjectTree(projectTreeWrapper, e.detail.schema,app.currentProject);
    ptInterface(pt);
    //wrapperText.textContent = e.detail.name;
    projectWrapper.style.display="block";

});
opener.addEventListener("html-rendered",e=>{
    app.currentPage && app.currentPage.path && pt &&
    openRecursively(app.currentPage.path);
});
opener.addEventListener('delete-project',e=>{
    pt && pt.destroy();
    pt = null;
    //wrapperText.textContent = "";
    projectWrapper.style.display="none";
});
/*
projectWrapper.addEventListener("click",e=>{
    projectWrapper.classList.toggle("project-tree-caret__open");
});*/
function ptInterface(pt) {
    pt.on("openTree", ptOpenTree);
    pt.on("fileSelected",ptFileSelected);
    //pt.on("fileHighlighted",ptFileHighlighted);
    pt.on("paste",ptPaste);
    pt.on("refactor",ptRefactor);
    pt.on("delete",ptDelete);
    pt.on("open-tooltip",openTooltip);
}
buttonCreateFile.addEventListener("click",e=>{
    buttonCreateFile.classList.toggle("selected");
});
//tooltipEl.addEventListener("blur",e=>tooltipEl.style.display="none");
projectTreeWrapper.addEventListener("click",e=>{
    if(tooltipEl.style.display != "none" &&
        !tooltipEl.contains(e.target))
        tooltipEl.style.display="none"
});
window.addEventListener("blur",e=>tooltipEl.style.display="none");
/*
window.addEventListener("window-popup-open",async e=>{
    var dockableElement = e.detail.dockableElement;
    var dockableElementIframe = e.detail.dockableElementIframe;
    var newWindow = e.detail.newWindow;
    var iframeWindow = dockableElementIframe.contentDocument.defaultView;
    if(!ptframe)
        return;
    var read = await opener.storageInterface.read("");
    var openerPT = dockableElementIframe.contentDocument.defaultView.pt;
    if(openerPT){
        openerPT.removeAllSelections();
        var newPtFrame = document.importNode(dockableElementIframe.contentDocument.defaultView.pt.target,true);
        pt = new ProjectTree(ptframe, read.value);
        openerPT && ptframe.replaceChild(newPtFrame.children[0],ptframe.children[0]);
        ptInterface(pt);
    }
});
window.addEventListener("window-popup-close",e=>{
    var dockableElement = e.detail.dockableElement;
    var dockableElementIframe = e.detail.dockableElementIframe;
    var newWindow = e.detail.newWindow;
    if(!ptframe)
        return;
    var imp = document.adoptNode(ptframe,true);
    document.body.appendChild(imp);
    if(newWindow.pt) {
        newWindow.pt.removeAllSelections();
        var newPtFrame = document.importNode(newWindow.pt.target, true);
        ptframe.replaceChild(newPtFrame.children[0], ptframe.children[0]);
    }
    //ptInterface(opener.frontartApp.currentProject,pt);
});
    */
openInNewWindow.addEventListener("click",e=>{
    var path = pt && pt.selected[0] && pt.selected[0].dataset.path;
    if(path) {
        var w = window.open(
            location.origin + "/" + app.frameResourcePath() + "/" + path, "_blank");
        w.opener = null;
    }
});
buttonRefactorFile.addEventListener("click",e=>{
    if(pt && pt.selected[0]) {
        pt.refactor(pt, pt.selected[0]);
        tooltipEl.style.display="none";
    }
});
function tooltip(e,el){
    //overlay.blur();
    var domElement = tooltipEl;
    if(domElement.contains(e.target) || domElement == e.target)
        return;
    var x = e.pageX;
    var y = e.pageY;
    var win = e.target.getRootNode().defaultView;
    var zero = win.scrollY;
    if(domElement.style.display != "block") {
        domElement.style.display = "block";
    }
    var sel = domElement.querySelector(".selected");
    sel && sel.classList.remove("selected");
    domElement.focus();
    var box = domElement.getBoundingClientRect();
    if(x + box.width > win.innerWidth){
        x = x-box.width;
        if(x<zero) x = zero;
    }
    if(y+box.height > win.innerHeight){
        y = y-box.height;
        if(y<zero) y = zero;
    }
    domElement.style.transform = `translate(${x}px,${y}px)`;
}

opener.addEventListener("tilepieces-file-updating",async e=>{
    var path = e.detail.path;
    if(path[0] == "/")
        path = path.substring(1);
    var isDirectory = e.detail.isDirectory;
    var exists = pt && pt.target.querySelector("[data-path='" + path + "']");
    if(!exists){
        var splitted = path.split("/");
        splitted.pop();
        if(pt.target.querySelector("[data-path='" + splitted.join("/") + "']")){
            console.log("[project-tree tilepieces-file-updating]",path,isDirectory);
            pt.updatePath(path,isDirectory ? "directory" : "file");
        }
    }
    else if(exists && isDirectory){
        try {
            var newPath = await storageIntegration.read(path);
            pt.update(path,newPath.value);
        }
        catch(e){
            console.error("[error in reading path after copying/moving]",e);
            alertDialog("Error in reading path "+data.newPath+" after copying/moving");
        }
    }
});
