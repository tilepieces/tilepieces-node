/*
https://stackoverflow.com/questions/448981/which-characters-are-valid-in-css-class-names-selectors
https://www.w3.org/TR/selectors-3/#specificity
https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
*/
/*
A selector's specificity is calculated as follows:

count the number of ID selectors in the selector (= a)
count the number of class selectors, attributes selectors, and pseudo-classes in the selector (= b)
count the number of type selectors and pseudo-elements in the selector (= c)
ignore the universal selector
Selectors inside the negation pseudo-class are counted like any other, but the negation itself does not count as a pseudo-class.

Concatenating the three numbers a-b-c (in a number system with a large base) gives the specificity.

*             {}  /* a=0 b=0 c=0 d=0 -> specificity = 0,0,0,0
b                 /* a=0 b=0 c=0 d=1 -> specificity = 0,0,0,1
li            {}  /* a=0 b=0 c=0 d=1 -> specificity = 0,0,0,1
li:first-line {}  /* a=0 b=0 c=0 d=2 -> specificity = 0,0,0,2
ul li         {}  /* a=0 b=0 c=0 d=2 -> specificity = 0,0,0,2
ul ol+li      {}  /* a=0 b=0 c=0 d=3 -> specificity = 0,0,0,3
h1 + *[rel=up]{}  /* a=0 b=0 c=1 d=1 -> specificity = 0,0,1,1
ul ol li.red  {}  /* a=0 b=0 c=1 d=3 -> specificity = 0,0,1,3
li.red.level  {}  /* a=0 b=0 c=2 d=1 -> specificity = 0,0,2,1
#x34y         {}  /* a=0 b=1 c=0 d=0 -> specificity = 0,1,0,0
style=""          /* a=1 b=0 c=0 d=0 -> specificity = 1,0,0,0
/* a=0 b=0 c=0 -> specificity =   0
LI              /* a=0 b=0 c=1 -> specificity =   1
li:first-line   /* a=0 b=0 c=2 -> specificity =   2
UL OL+LI        /* a=0 b=0 c=3 -> specificity =   3
H1 + *[REL=up]  /* a=0 b=1 c=1 -> specificity =  11
UL OL LI.red    /* a=0 b=1 c=3 -> specificity =  13
LI.red.level    /* a=0 b=2 c=1 -> specificity =  21
#x34y           /* a=1 b=0 c=0 -> specificity = 100
#s12:not(FOO)   /* a=1 b=0 c=1 -> specificity = 101
#s12:not(FOO):not( .crazyness )   /* a=1 b=1 c=1 -> specificity = 111
div:where(.outer) p /* a=0 b=0 c=2 -> specificity = 2
*/

function cssSpecificity(selector,inside){
  var arr = [0,0,0];
  var idMatch = /#[_a-zA-Z0-9-]+/g;
  var attributeMatch = /\[[_a-zA-Z0-9-="]+]+/g;
  var classMatch = /\.[_a-zA-Z0-9-]+/g;
  //var pseudoClassMatch = /:active|:any-link|:blank|:checked|:current|:default|:defined|:dir|:disabled|:drop|:empty|:enabled|:first(?!-)|:first-child|:first-of-type|:fullscreen|:future|:focus(?!-)|:focus-visible|:focus-within|:has|:host|:host|:host-context|:hover|:indeterminate|:in-range|:invalid|:is|:lang|:last-child|:last-of-type|:left|:link|:local-link|:nth-child|:nth-col|:nth-last-child|:nth-last-col|:nth-last-of-type|:nth-of-type|:only-child|:only-of-type|:optional|:out-of-range|:past|:placeholder-shown|:read-only|:read-write|:required|:right|:root|:scope|:target|:target-within|:user-invalid|:valid|:visited/gi;
  var pseudoClassMatch = /:[a-z-]+/gi;
  //var pseudoElementMatch = /:after|:before|:backdrop|:cue|:first-letter|:first-line|:grammar-error|:marker|:placeholder|:selection|:spelling-error|:slotted/gi;
  var pseudoElementMatch =/:{1,2}before|:{1,2}after|:{1,2}first-letter|:{1,2}first-line|::[a-z-]+/gi;
  //var elementMatch = /(?<![#.([:_a-zA-Z0-9-=])[_a-zA-Z0-9-]+/g;
  var elementMatch =/(\s+|^|\*|\+|>|~|\|\|)[_a-zA-Z0-9-]+/g;
  selector = selector.replaceAll(":not(", " ");
  selector = selector.replace(/:is\(([^)]*)\)/g,(match,variable)=> {
    var maxSpecificity = variable.split(",").map(v=>{
      var newArr = cssSpecificity(v,true);
      return{
        arr : newArr,
        specificity : Number(newArr.join(""))
      }
    }).sort((a, b)=>b-a)[0];
    maxSpecificity.arr.forEach((a,i)=>arr[i]+=a);
    return "";
  });
  // replace special case :not, :is and :where
  selector = selector.replace(/:where\([^)]*\)/g, " ");

  var ids = selector.match(idMatch);
  if(ids)
      arr[0] += ids.length;
  var classes = selector.match(classMatch);
  if(classes)
      arr[1] += classes.length;
  var attributes = selector.match(attributeMatch);
  if(attributes)
      arr[1] += attributes.length;
  var pseudosClasses = selector.match(pseudoClassMatch);
  if(pseudosClasses) {
      pseudosClasses.forEach(p=>{
          if(!p.match(pseudoElementMatch))
              arr[1] += 1
      });
  }
  var pseudoElements = selector.match(pseudoElementMatch);
  if(pseudoElements)
      arr[2] += pseudoElements.length;
  var elements = selector.match(elementMatch);
  if(elements)
      arr[2] += elements.length;
  if(!inside)
    return Number(arr.join(""));
  else
    return arr;
}
if(typeof module !== "undefined" &&
  typeof module.exports !== "undefined")
  module.exports = cssSpecificity;
window.tilepieces_tabs = function(options){
  var outside = options.el;
  var inside = outside.querySelector(".tab-buttons-inside");
  var tabPrev = outside.querySelector(".tab-prev");
  var tabNext = outside.querySelector(".tab-next");
  var tabSelected = inside.querySelector(".selected");
  var tabSelectedElement = !options.noAction && tabSelected && outside.ownerDocument.querySelector(tabSelected.getAttribute("href"));
  var maximumRight;
  var left = 0;
  var moveOnBottom;
  var throttle;
  function callbackObserver(){
    clearTimeout(throttle);
    throttle = setTimeout(()=>{
      if(!inside.lastElementChild)
        return;
      maximumRight = (inside.lastElementChild.offsetLeft + inside.lastElementChild.offsetWidth) - inside.offsetWidth;
      if(moveOnBottom){
          left = -maximumRight;
          inside.style.transform = "translateX(" + left +"px)";
          moveOnBottom = null;
      }
      else{
          left = 0;
          inside.style.transform = "translateX(" + left +"px)";
      }
      displayArrows();
    },32);
  }
  var resizeObserver = new ResizeObserver(callbackObserver);
  resizeObserver.observe(outside);
  var observer = new MutationObserver(callbackObserver);
  observer.observe(inside, {childList: true, subtree: true});
  tabPrev.addEventListener("click",function(e){
    left+=inside.offsetWidth/3;
    if(left>0)
        left = 0;
    inside.style.transform = "translateX(" + left +"px)";
    displayArrows();
  });
  tabNext.addEventListener("click",function(e){
    left-=inside.offsetWidth/3;
    if(left<-maximumRight)
        left = -maximumRight;
    inside.style.transform = "translateX(" + left +"px)";
    displayArrows();
  });
  function displayArrows(e){
    if(inside.scrollWidth == inside.offsetWidth){
        tabPrev.style.display = "none";
        tabNext.style.display = "none";
        return;
    }
    if(left == 0)
        tabPrev.style.display = "none";
    else
        tabPrev.style.display = "block";
    if(left<-maximumRight) {
        left = -maximumRight;
        inside.style.transform = "translateX(" + left + "px)";
    }
    if(left == -maximumRight)
        tabNext.style.display = "none";
    else
        tabNext.style.display = "block";
  }
  inside.addEventListener("click",e=>{
    var target = e.target.closest("a");
    if(!target)
        return;
    e.preventDefault();
    if(target!=tabSelected){
      options.onSelect && options.onSelect(e,target);
      if(options.noAction)
        return;
      if(tabSelected) {
          tabSelected.classList.remove("selected");
          //tabSelectedElement.style.display = "none";
          tabSelectedElement.hidden = true;
          if(tabSelectedElement.style.display)
              tabSelectedElement.style.display = "";
      }
      tabSelected = target;
      tabSelectedElement = target.ownerDocument.querySelector(tabSelected.getAttribute("href"));
      tabSelectedElement.hidden = false;
      if(tabSelectedElement.style.display)
          tabSelectedElement.style.display = options.display || "block";
      tabSelected.classList.add("selected");
    }
  });
  return {
    moveOnBottom : ()=>{
        moveOnBottom = true;
    }
  }
};
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
const opener = window.opener || window.parent;
const app = opener.tilepieces;
window.tilepieces = app;
window.TT = opener.TT;
const copyButton = document.getElementById("copy-button");
const moveButton = document.getElementById("move-button");
const copyMoveAction = "";
const elementSumSection = document.getElementById("element-sum");
const insidePath = document.getElementById("inside-path");
const wrapper = document.getElementById("wrapper");
let mainTab = tilepieces_tabs({
  el : document.getElementById("tabs")
});
let pathTab = tilepieces_tabs({
    el : elementSumSection,
    noAction : true
});
/* attributes view */
const attributesView = document.getElementById("attributes");
const addAttrButton = document.getElementById("add-attribute");
const delNodeAttribute = document.getElementById("remove-element");
let attributeSelected;
let modelAttributes = {
    attributes : [],
    nodeName : "",
    isVisible: "none"
};
let attrsTemplate = new opener.TT(attributesView,modelAttributes,{
  interpolation:/\$\{\{([\s\S]+?)\}\}/
});
/* interfaces */
const interfacesAssociatedSection = document.getElementById("component-interface");
let componentsModel = {
    interfacesAssociated : "",
    interfaces : []
};
let componentsTemplate = new opener.TT(interfacesAssociatedSection,componentsModel);


const classes = document.getElementById("classes");
let classesModel = {
  classes : []
};
let classesTemplate = new opener.TT(classes,classesModel,{
  interpolation:/\$\{\{([\s\S]+?)\}\}/
});
let associatedClasses = []; // global classes where to store references of removed classes
let flagForInternalModifications; // we rely on mutationObserver to track changes.
let newClassForm = document.getElementById("new-class");

const childrenElementUL = document.querySelector("#children ul");

const tagComponents = [{
    path : "tag-components/TABLE",
    name : "TABLE",
    selector : "table",
    interface : "interface.html",
    specificity : 1
}];
function assignComponentsToElement(el){
    if([1].indexOf(el.nodeType) == -1)
        el = el.parentNode;
    var comps = [];
    for(var k in app.localComponentsFlat){
        var v = app.localComponentsFlat[k];
        var selector = v.selector;
        if(v.interface && selector && el.matches(selector)) {
            var componentBundle = Object.assign({},v);
            componentBundle.specificity = cssSpecificity(selector);
            componentBundle.path = v.path;
            comps.push(v)
        }
    }
    return comps.concat(tagComponents.filter(v=>el.matches(v.selector)))
        .sort((a, b)=> b.specificity-a.specificity)
}
childrenElementUL.addEventListener("click",e=>{
  if(e.target.classList.contains("children-grabber"))
    return;
  var link = e.target.closest("li");
  if(!link)
      return;
  var el = app.elementSelected.children[link.dataset.index];
  app.core.selectElement(el);
});
childrenElementUL.addEventListener("mousemove",e=>{
  var link = e.target.closest("li");
  if(!link) {
      app.highlight = null;
      return;
  }
  app.highlight = app.elementSelected.children[link.dataset.index];
});
childrenElementUL.addEventListener("mouseout",e=>{
    app.highlight = null;
});

const dragList = __dragList(childrenElementUL,{
  handlerSelector : ".children-grabber",
  convalidate : function(el){
    if(el.querySelector(".children-grabber")) {
      return true
    }
  }
});
dragList.on("move",e=>{
  var nodes = e.target;
  for(var i = nodes.length-1;i>=0;i--){
    var node = nodes[i];
    var index = +node.dataset.index;
    var el = app.elementSelected.children[index];
    if(e.prev){
      var indexP = +e.prev.dataset.index;
      var prevEl = app.elementSelected.children[indexP];
      app.core.htmlMatch.move(prevEl, el, "after");
    }
    else {
      var indexN = +e.next.dataset.index;
      var nextEl = app.elementSelected.children[indexN];
      app.core.htmlMatch.move(nextEl, el, "before");
    }
  }
  [...childrenElementUL.children].forEach((v,i)=>v.dataset.index = i);
})
insidePath.addEventListener("click",e=>{
    var link = e.target.closest("a");
    if(!link)
        return;
    var el = app.cssSelectorObj.composedPath[link.dataset.index];
    app.core.selectElement(el);
});
insidePath.addEventListener("mousemove",e=>{
    var link = e.target.closest("a");
    if(!link) {
        app.highlight = null;
        return;
    }
    app.highlight = app.cssSelectorObj.composedPath[link.dataset.index];
});
insidePath.addEventListener("mouseout",e=>{
    app.highlight = null;
});

opener.addEventListener("deselect-element",e=> {
    wrapper.setAttribute("hidden","");
  elementSumSection.style.display="none";
});
opener.addEventListener("WYSIWYG-start",e=>{
  wrapper.setAttribute("hidden","");
  elementSumSection.style.display="none";
});
opener.addEventListener("WYSIWYG-end",()=>{
  if(app.elementSelected) {
    wrapper.removeAttribute("hidden");
    elementSumSection.style.display="block";
  }
});
opener.addEventListener("content-editable-end",()=>{
});
opener.addEventListener("frame-unload",()=>{
  wrapper.setAttribute("hidden","");
  elementSumSection.style.display="none";
});
function onSelected(dontSetInterfaces){
  if(app.elementSelected.nodeType == 1) {
    wrapper.removeAttribute("hidden");
    setAttrsTemplate(app.elementSelected, app.selectorObj.match);
    !dontSetInterfaces && setInterfaces();
    setClasses();
  }
  else wrapper.setAttribute("hidden","");
}
if(app.elementSelected) {
    onSelected()
}
opener.addEventListener("highlight-click",()=>onSelected());
attributesView.addEventListener("dropzone-dropping",onDropFiles,true);

opener.addEventListener("tilepieces-mutation-event",e=>{
  var mutationList = e.detail.mutationList;
  console.log("[element panel log mutationList and flagForInternalModifications]->",mutationList,flagForInternalModifications);
  if(flagForInternalModifications){
    flagForInternalModifications = false;
    return;
  }
  var findAttributeMutation,removedNode;
  mutationList.forEach(mutation=> {
    if(mutation.type == "attributes" &&
      mutation.target == app.elementSelected)
      findAttributeMutation = true;
    mutation.removedNodes.forEach(v=>{
      if (v == app.elementSelected)
        removedNode = true;
    });
  });
  if(removedNode) {
    wrapper.setAttribute("hidden", "");
    return;
  }
  if(findAttributeMutation)
    onSelected(true);
})
window.addEventListener("window-popup-open",e=>{
});
window.addEventListener("window-popup-close",e=>{
  window.location.reload();
});
function setAttrsTemplate(target,match){
  modelAttributes.attributes = [...target.attributes].reverse().map((a,i)=>{
    var name = a.nodeName;
    var value = a.nodeValue;
    var tagName = target.tagName;
    var parentNode = target.parentNode;
    var classSrc = (
      tagName.match(/^(VIDEO|AUDIO|IMG)$/) ||
    (parentNode?.tagName.match(/^(VIDEO|AUDIO|IMG)$/) && tagName == "SOURCE")
    ) &&
    name.toLowerCase() == "src" ?
      "src-box" :
      "";
    var disabled = !match.match || match.match.getAttribute(name) != value ? "disabled" : "";
    return {
      name,
      value,
      disabled,
      index : i,
      classSrc,
      dropzone : classSrc && !disabled ? "data-dropzone" : ""
    }
  });
  modelAttributes.nodeName = target.tagName;
  modelAttributes.nodenamedisabled = match.match ? "" : "disabled";
  modelAttributes.isVisible = "block";
  modelAttributes.notmatch = !match.match || !match.attributes || !match.HTML ? "" : "hidden";
  modelAttributes.not_matching_phrase = !match.match ? "cannot find the element in the original tree" :
  !match.attributes && !match.HTML ? "A match was found for the element, but both HTML and attributes are different." :
  !match.attributes ? "A match was found for the element, but attributes are different." :
  !match.HTML ? "A match was found for the element, but HTML is different." : "";
  modelAttributes.nodenameinvalid = "hidden";
  attrsTemplate.set("",modelAttributes);
  addAttrButton.disabled = false;
  attributeSelected && attributeSelected.parentNode.classList.remove("attr-sel");
  //
  insidePath.innerHTML = app.cssSelectorObj.composedPath
      .reduce((filtered,v,i)=>{
      if(v.tagName && i>0)
       filtered.push(`<a href='#' data-index='${i}'>${app.utils.elementSum(v)}</a>`);
      return filtered
    },[]).reverse().join("");
  pathTab.moveOnBottom();
  elementSumSection.style.display="block";
  childrenElementUL.innerHTML = [...app.elementSelected.children]
    .map((v,i,a)=>{
      var isNodeMatch = !v.tagName.match(/^(HTML|BODY|HEAD|THEAD|TBODY|TFOOT)$/) && app.core.htmlMatch.find(v);
      var grabber = isNodeMatch && a.length > 1 ? `<span class="children-grabber">G</span>` : "";
      return `<li data-index=${i}>${grabber}<a href='#'>${app.utils.elementSum(v)}</a></li>`
    })
    .join("");
}
function setClasses(){
  var target = app.elementSelected;
  var classesTokens = target.classList;
  var iterator = classesTokens.values();
  classesModel.classes = [];
  for(var name of iterator) {
    classesModel.classes.push({
      name,
      checked:true
    });
  }
  var associated = associatedClasses.find(v=>v.el == target);
  if(associated)
    classesModel.classes = classesModel.classes.concat(associated.classes);
  classesModel.classes.forEach((v,i)=>v.index = i);
  var match = app.selectorObj.match;
  classesModel.canadd = !match.match ||
    match.match.getAttribute("class") != app.elementSelected.getAttribute("class") ?
    "disabled" : "";
  classesModel.newClassName = "";
  classesModel.classinvalid = "hidden";
  classesTemplate.set("",classesModel);
}
function setInterfaces(){
    var componentsToElement = assignComponentsToElement(app.elementSelected);
    var interfaces = componentsToElement
        .map((v,i)=>{
            if(i==0 && componentsModel.interfaceAssociated != v.name) {
                componentsModel.interfaceAssociated = v.name;
            }
            return {interface:v.path + "/" + v.interface,name:v.name,index:i,selected:i==0?"selected":""};
        });
    var interfacesInherited = app.selectorObj.composedPath.reduce((acc,v)=>{
        if(v == app.elementSelected)
            return acc;
        // https://stackoverflow.com/a/385427
        if(!(typeof v == "object" && "nodeType" in v &&
            v.nodeType === 1 && v.cloneNode))
            return acc;
        var arr = assignComponentsToElement(v);
        arr = arr.reduce((accu,value,index)=>{
          // just one interface for element.
          var foundInInterface = interfaces.find(i=>i.name == value.name);
          var foundInAccu = acc.find(a=>a.name == value.name);
          if(!foundInInterface && !foundInAccu) {
              var accuIndex = index + interfaces.length;
              var isTagComponent = tagComponents.find(v=>v.name == value.name);
              var absoluteStart = isTagComponent ? "" : "/";
              var interfacePath = isTagComponent ? value.path + "/" + value.interface :
                  ("/" + tilepieces.frameResourcePath() + "/" + value.path + "/" + value.interface).replace(/\/\//g,"/");
              accu.push(
                  {
                      interface: interfacePath,
                      name: value.name, index: accuIndex, selected: accuIndex == 0 ? "selected" : ""
                  }
              );
          }
          return accu;
        },[]);
        return acc.concat(arr);
    },[]);
    interfaces = interfaces.concat(interfacesInherited);
    if(!interfaces){
        interfacesAssociatedSection.classList.add("hidden");
    }
    else
        interfacesAssociatedSection.classList.remove("hidden");
    // if they are equal, it means that there is no need to update interface
    if(JSON.stringify(componentsModel.interfaces) == JSON.stringify(interfaces))
        return;
    componentsModel.interfaces = interfaces;
    componentsTemplate.set("",componentsModel);
}
addAttrButton.addEventListener("click",e=>{
    modelAttributes.attributes.forEach(v=>v.index+=1);
    modelAttributes.attributes.unshift({
            name : "",
            value : "",
            disabled : "",
            index : 0
    });
    attrsTemplate.set("attributes",modelAttributes.attributes);
    var attributes = attributesView.querySelectorAll(".attribute-name");
    attributes[0].focus();
});
attributesView.addEventListener("click",e=>{
    var t = e.target;
    if(!t.classList.contains("remove-attr"))
        return;
    var index = t.dataset.index;
    var attr = modelAttributes.attributes[index];
    app.core.htmlMatch.removeAttribute(app.elementSelected,attr.name);// || attributeSelected.value);
    var match = tilepieces.core.htmlMatch.find(app.elementSelected);
});

attributesView.addEventListener("change",e=>{
    var currentElement = app.elementSelected;
    var target = e.target;
    var isAttributeName = target.classList.contains("attribute-name");
    var isAttributeValue = target.classList.contains("attribute-value");
    if(!isAttributeValue && !isAttributeName)
        return;
    var match = app.core.htmlMatch.find(app.elementSelected);
    if(isAttributeName){
        target.dataset.prev && app.core.htmlMatch.removeAttribute(currentElement,target.dataset.prev);
        app.core.htmlMatch.setAttribute(currentElement,target.value,target.dataset.value);
    }
    else if(isAttributeValue){
        app.core.htmlMatch.setAttribute(currentElement,target.dataset.key,target.value);
    }
},true);


classes.addEventListener("template-digest",e=>{
  var target = e.detail.target;
  if(target.closest("#new-class")) { // from the input box
    if(classesModel.classinvalid == "")
      classesTemplate.set("classinvalid","hidden");
    return;
  }
  var className = target.dataset.value;
  var index = +target.dataset.index;
  var classStructure = classesModel.classes[index];
  var isInAssociated = associatedClasses.find(v=>v.el = app.elementSelected);
  if(target.checked) {
    app.core.htmlMatch.addClass(app.elementSelected, className);
    var exAssociated = isInAssociated.classes.findIndex(v=>v.name == classStructure.name);
    isInAssociated.classes.splice(exAssociated,1);
  }
  else {
    classStructure.checked = false;
    if(!isInAssociated)
      associatedClasses.push({
        el : app.elementSelected,
        classes : [classStructure]
      });
    else if(!isInAssociated.classes.find(v=>v.name == classStructure.name))
      isInAssociated.classes.push(classStructure);
    app.core.htmlMatch.removeClass(app.elementSelected,className);
  }
  var classAttribute = modelAttributes.attributes.find(v=>v.name == "class");
  classAttribute.value = app.elementSelected.getAttribute("class");
  attrsTemplate.set("",modelAttributes);
  flagForInternalModifications = true;
});
newClassForm.addEventListener("submit",e=>{
  e.preventDefault();
  try {
    app.core.htmlMatch.addClass(app.elementSelected, classesModel.newClassName);
  }
  catch(e){
    classesModel.classinvalid = "";
    classesModel.classinvalid_phrase = e;
    classesTemplate.set("",classesModel);
    return;
  }
  setClasses();
  flagForInternalModifications = true;
});
attributesView.addEventListener("nodeName",e=>{
  var currentElement = app.elementSelected;
  var newNodeName = e.detail.target.value.toUpperCase();
  var composedPath = app.selectorObj.composedPath.slice(1,app.selectorObj.composedPath.length);
  var isNotAdmitted = app.utils.notAdmittedTagNameInPosition(newNodeName,composedPath);
  if(isNotAdmitted) {
    modelAttributes.nodenameinvalid = "";
    attrsTemplate.set("",modelAttributes);
    return;
  }
  // check for all nodes under if they can stay with the new tag.
  var treeWalker = document.createTreeWalker(
    app.elementSelected,
    NodeFilter.SHOW_ELEMENT
  );
  var currentNode = treeWalker.currentNode;
  while(currentNode) {
    var swap = currentNode.parentNode;
    var subComposedPath = [];
    while(swap){
      subComposedPath.push(swap);
      swap = swap.parentNode;
    }
    if(app.utils.notAdmittedTagNameInPosition(currentNode.tagName,subComposedPath)){
      modelAttributes.nodenameinvalid = "";
      attrsTemplate.set("",modelAttributes);
      return;
    }
    currentNode = treeWalker.nextNode();
  }
  modelAttributes.nodenameinvalid = "hidden";
  attrsTemplate.set("",modelAttributes);
  var newNode = currentElement.ownerDocument.createElement(newNodeName);
  for(var i = 0, l = currentElement.attributes.length; i < l; ++i){
      var nodeName  = currentElement.attributes.item(i).nodeName;
      var nodeValue = currentElement.attributes.item(i).nodeValue;
      newNode.setAttribute(nodeName, nodeValue);
  }
  [...currentElement.childNodes].forEach(c=>newNode.appendChild(c));
  app.core.htmlMatch.replaceWith(currentElement,newNode);
  newNode.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
});
document.getElementById("node-name").addEventListener("blur",e=>{
  if(modelAttributes.nodenameinvalid == ""){
    modelAttributes.nodenameinvalid = "hidden";
    modelAttributes.nodeName = app.elementSelected.nodeName;
    attrsTemplate.set("",modelAttributes);
  }
})
function onDropFiles(e){
  e.preventDefault();
  var dropzone = e.detail.target;
  var file = e.detail.files[0];
  if(!file)
    return;
  var tagName = modelAttributes.nodeName;
  var tagParentName = app.elementSelected.parentNode.tagName;
  var isSOURCE = tagName == "SOURCE";
  var isIMG = (tagName == "IMG" || (isSOURCE && tagParentName == "IMG")) &&
    file.type.startsWith("image/");
  var isVIDEO = (tagName == "VIDEO" || (isSOURCE && tagParentName == "VIDEO")) &&
    file.type.startsWith("video/");
  var isAUDIO = (tagName == "AUDIO" || (isSOURCE && tagParentName == "AUDIO")) &&
    file.type.startsWith("audio/");
  var allowed = isIMG || isVIDEO || isAUDIO;
  if(allowed){
    app.utils.processFile(file).then(res=>{
      var sel = app.elementSelected;
      app.core.htmlMatch.setAttribute(sel, "src", res);
      if(isVIDEO || isAUDIO)
        isSOURCE ? sel.parentNode.load() : sel.load()
    })
  }
}
attributesView.addEventListener("click",e=>{
  if(!e.target.classList.contains("search-button"))
    return;
  var tagName = modelAttributes.nodeName;
  var tagParentName = app.elementSelected.parentNode.tagName;
  var isSOURCE = tagName == "SOURCE";
  var typeSearch = isSOURCE ? tagParentName.toLowerCase() : tagName.toLowerCase();
  var dialogSearch = opener.dialogReader(typeSearch);
  dialogSearch.then(dialog=>{
    dialog.on("submit",src=>{
      var sel = app.elementSelected;
      app.core.htmlMatch.setAttribute(isSOURCE ? sel.parentNode : sel, "src", src);
    })
  })
})

delNodeAttribute.addEventListener("click",e=>{
  app.core.htmlMatch.removeChild(app.elementSelected);
  if(app.multiselected){
    var index = app.multiselections.findIndex(v=>v.el == app.elementSelected);
    app.removeItemSelected(index);
  }
  else
    app.core.deselectElement();
});
interfacesAssociatedSection.addEventListener("interfaceAssociated",e=>{
    console.log("[interfaceAssociated]",e,e.detail,e.detail.target.value);
    // componentsModel.interfaceAssociated is the last value;
    var exSelectedIndex = componentsModel.interfaces.findIndex(v=>v.name == componentsModel.interfaceAssociated);
    componentsModel.interfaces[exSelectedIndex].selected = "";
    var newSelected = componentsModel.interfaces.find(v=>v.name == e.detail.target.value);
    newSelected.selected = "selected";
    componentsTemplate.set("",componentsModel);
})

