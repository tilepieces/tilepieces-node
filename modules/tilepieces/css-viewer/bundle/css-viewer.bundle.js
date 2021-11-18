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
(()=>{
var hint = document.querySelector(".autocomplete-hint");
hint.addEventListener("mousedown",click);
var dlProperty = "__autocomplete__target_element";
var defaults = {
    suggestions : [],
    matchToLowerCase : false,
    max : 15
};
var globalTarget;
var globalFlagOnArrowMove;
window.autocomplete = function(target){
    target.addEventListener("focus",e=>{
        if(e.target.classList.contains("autocomplete")) {
            globalTarget = e.target;
            keyup(e)
        }
    },true);
    target.addEventListener("keydown",e=>{
        if(e.target.classList.contains("autocomplete")) {
            globalTarget = e.target;
            shortcuts(e)
        }
    },true);
    target.addEventListener("input",e=>{
        if(globalFlagOnArrowMove) {
            globalFlagOnArrowMove = false;
            return;
        }
        if(e.target.classList.contains("autocomplete")) {
            globalTarget = e.target;
            keyup(e)
        }
    },true);
    target.addEventListener("blur",e=>{
        if(e.target.classList.contains("autocomplete")) {
            globalTarget = e.target;
            blur(e)
        }
    },true);
    return {
        blur
    }
};

function blur(e){
    hint.style.display = "none";
    hint.innerHTML = "";
}
function click(e){
    if(e.target.nodeName != "DT" && e.target.parentElement.nodeName != "DT")
        return;
    update(e.target,true);
}
function getGlobalSuggestion(string){
    var keys = string.split(".");
    var global = window;
    keys.forEach(v=>global = global[v]);
    return global;
}
function keyup(e){
    var el = e.target;
    var val = el.tagName == "INPUT" ? el.value : el.innerText;
    val = val.trim().toLocaleLowerCase();
    var suggestions = el.__autocomplete_suggestions || getGlobalSuggestion(el.dataset.autoGlobalSuggestion);
    var matches = match(val,suggestions);
    if(!matches) {
        hint.style.display = "none";
        hint.innerHTML = "";
        el.__autocomplete_is_running = false;
        return;
    }
    var frag = document.createDocumentFragment();
    var dl = document.createElement("dl");
    dl[dlProperty] = e.target;
    frag.appendChild(dl);
    var pos = el.getBoundingClientRect();
    var scrollY = el.ownerDocument.defaultView.scrollY;
    var left = pos.x + el.ownerDocument.defaultView.scrollX;
    var top = pos.y + scrollY;
    var bottom = top + pos.height;
    matches.forEach(v=>dl.insertAdjacentHTML( 'beforeend', `<dt>${v}</dt>` ));
    hint.innerHTML = "";
    hint.appendChild(frag);
    hint.style.height="";
    hint.style.width = pos.width + "px";
    if(hint.style.display!="block")
        hint.style.display = "block";
    //var hintPos = hint.getBoundingClientRect();
    var hintHeight = hint.offsetHeight;
    var hintWidth = hint.offsetWidth;
    var spaceToBottom = window.innerHeight-bottom;
    var spaceToRight = window.innerWidth - left;
    var y = bottom;
    if(spaceToBottom<hintHeight){
        if(top>=hintHeight)
            y = top - hintHeight;
        else {
            var onTop = top > spaceToBottom;
            var height = onTop ? top : spaceToBottom;
            hint.style.height = height + "px";
            y = onTop ? top - height : y;
        }
    }
    if(spaceToRight < hintWidth){
        if(left>=hintWidth)
            left = (left + pos.width) -  hintWidth;
        else{
            var onLeft = left>spaceToRight;
            var width = onLeft ? left : spaceToRight;
            hint.style.width=width+"px";
            left = onLeft ? left - width : left;
        }
    }
    hint.style.transform = `translate(${left}px,${y}px)`;
    el.__autocomplete_is_running = true;
    if(el.classList.contains("placeholder"))
        el.classList.remove("placeholder")
}
function match(input,arr){
    var max = 9;
    var suggestions = input ? arr.filter(v=>v.toLocaleLowerCase().startsWith(input) && v!=input) : arr;
    if(!suggestions.length)
        return false;
    if(suggestions.length > max)
        suggestions = suggestions.slice(0, max-1);
    return suggestions.map(v=>{
        var toLowercase = v.toLocaleLowerCase();
        var m = "<b>" + toLowercase.substr(toLowercase.indexOf(input),input.length) + "</b>";
        return toLowercase.replace(input,m)
    })
}
function shortcuts(e){
    var target = e.target;
    var dl = hint.querySelector("dl");
    var el = e.target;
    var selected;
    if(dl)
        selected = dl.querySelector(".selected");
    switch(e.key){
        case "ArrowUp":
        case "ArrowDown":
            if(!dl)
                return;
            e.preventDefault();
            e.stopPropagation();
            var toUpdate;
            if(selected){
                selected.classList.remove("selected");
                if(e.key == "ArrowUp") {
                    if (selected.previousElementSibling)
                        toUpdate = selected.previousElementSibling;
                    else
                        toUpdate = dl.children[dl.children.length - 1];
                }
                else{
                    if(selected.nextElementSibling)
                        toUpdate = selected.nextElementSibling;
                    else
                        toUpdate = dl.children[0];
                }
            }
            else {
                var first = dl.children[0];
                if(first && !first.classList.contains("no-suggestions"))
                    toUpdate = first;
            }
            if(toUpdate) {
                toUpdate.classList.add("selected");
                globalFlagOnArrowMove = true;
                update(toUpdate);
            }
            break;
        case "ArrowRight":
        case "Enter":
        case "Tab":
            e.key=="Enter" && e.preventDefault();
            if(selected) {
                update(selected,e.key=="Enter"||e.key=="ArrowRight");
            }
            hint.style.display = "none";
            hint.innerHTML = "";
        default:break;
    }
}
function translateToPos(x,y){
    var box = hint.getBoundingClientRect();
    if(y+box.height > window.innerHeight){
        y = y-box.height;
        if(y<0) y = 0;
        hint.style.transform = `translate(${x}px,${y}px)`;
    }
    //hint.style.transform = "translate3d(" + Math.round(left) + "px," + Math.round(bottom) + "px,0)";
}
function update(selection,tofocus){
    var isInputType = globalTarget.tagName == "INPUT";
    if(isInputType)
        globalTarget.value = selection.textContent;
    else
        globalTarget.textContent = selection.textContent;
    globalTarget.dispatchEvent(new KeyboardEvent("input", {bubbles : true}));
    if(tofocus){
        globalTarget.focus();
        if(!isInputType){
            var sel = globalTarget.ownerDocument.defaultView.getSelection();
            var range = new Range();
            range.selectNode(globalTarget.childNodes[0]);
            range.collapse();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
}

})();
(()=>{
let cssColors = [
    {
        "name": "AliceBlue",
        "hex": "#F0F8FF"
    },
    {
        "name": "AntiqueWhite",
        "hex": "#FAEBD7"
    },
    {
        "name": "Aqua",
        "hex": "#00FFFF"
    },
    {
        "name": "Aquamarine",
        "hex": "#7FFFD4"
    },
    {
        "name": "Azure",
        "hex": "#F0FFFF"
    },
    {
        "name": "Beige",
        "hex": "#F5F5DC"
    },
    {
        "name": "Bisque",
        "hex": "#FFE4C4"
    },
    {
        "name": "Black",
        "hex": "#000000"
    },
    {
        "name": "BlanchedAlmond",
        "hex": "#FFEBCD"
    },
    {
        "name": "Blue",
        "hex": "#0000FF"
    },
    {
        "name": "BlueViolet",
        "hex": "#8A2BE2"
    },
    {
        "name": "Brown",
        "hex": "#A52A2A"
    },
    {
        "name": "BurlyWood",
        "hex": "#DEB887"
    },
    {
        "name": "CadetBlue",
        "hex": "#5F9EA0"
    },
    {
        "name": "Chartreuse",
        "hex": "#7FFF00"
    },
    {
        "name": "Chocolate",
        "hex": "#D2691E"
    },
    {
        "name": "Coral",
        "hex": "#FF7F50"
    },
    {
        "name": "CornflowerBlue",
        "hex": "#6495ED"
    },
    {
        "name": "Cornsilk",
        "hex": "#FFF8DC"
    },
    {
        "name": "Crimson",
        "hex": "#DC143C"
    },
    {
        "name": "Cyan",
        "hex": "#00FFFF"
    },
    {
        "name": "DarkBlue",
        "hex": "#00008B"
    },
    {
        "name": "DarkCyan",
        "hex": "#008B8B"
    },
    {
        "name": "DarkGoldenRod",
        "hex": "#B8860B"
    },
    {
        "name": "DarkGray",
        "hex": "#A9A9A9"
    },
    {
        "name": "DarkGrey",
        "hex": "#A9A9A9"
    },
    {
        "name": "DarkGreen",
        "hex": "#006400"
    },
    {
        "name": "DarkKhaki",
        "hex": "#BDB76B"
    },
    {
        "name": "DarkMagenta",
        "hex": "#8B008B"
    },
    {
        "name": "DarkOliveGreen",
        "hex": "#556B2F"
    },
    {
        "name": "DarkOrange",
        "hex": "#FF8C00"
    },
    {
        "name": "DarkOrchid",
        "hex": "#9932CC"
    },
    {
        "name": "DarkRed",
        "hex": "#8B0000"
    },
    {
        "name": "DarkSalmon",
        "hex": "#E9967A"
    },
    {
        "name": "DarkSeaGreen",
        "hex": "#8FBC8F"
    },
    {
        "name": "DarkSlateBlue",
        "hex": "#483D8B"
    },
    {
        "name": "DarkSlateGray",
        "hex": "#2F4F4F"
    },
    {
        "name": "DarkSlateGrey",
        "hex": "#2F4F4F"
    },
    {
        "name": "DarkTurquoise",
        "hex": "#00CED1"
    },
    {
        "name": "DarkViolet",
        "hex": "#9400D3"
    },
    {
        "name": "DeepPink",
        "hex": "#FF1493"
    },
    {
        "name": "DeepSkyBlue",
        "hex": "#00BFFF"
    },
    {
        "name": "DimGray",
        "hex": "#696969"
    },
    {
        "name": "DimGrey",
        "hex": "#696969"
    },
    {
        "name": "DodgerBlue",
        "hex": "#1E90FF"
    },
    {
        "name": "FireBrick",
        "hex": "#B22222"
    },
    {
        "name": "FloralWhite",
        "hex": "#FFFAF0"
    },
    {
        "name": "ForestGreen",
        "hex": "#228B22"
    },
    {
        "name": "Fuchsia",
        "hex": "#FF00FF"
    },
    {
        "name": "Gainsboro",
        "hex": "#DCDCDC"
    },
    {
        "name": "GhostWhite",
        "hex": "#F8F8FF"
    },
    {
        "name": "Gold",
        "hex": "#FFD700"
    },
    {
        "name": "GoldenRod",
        "hex": "#DAA520"
    },
    {
        "name": "Gray",
        "hex": "#808080"
    },
    {
        "name": "Grey",
        "hex": "#808080"
    },
    {
        "name": "Green",
        "hex": "#008000"
    },
    {
        "name": "GreenYellow",
        "hex": "#ADFF2F"
    },
    {
        "name": "HoneyDew",
        "hex": "#F0FFF0"
    },
    {
        "name": "HotPink",
        "hex": "#FF69B4"
    },
    {
        "name": "IndianRed ",
        "hex": "#CD5C5C"
    },
    {
        "name": "Indigo  ",
        "hex": "#4B0082"
    },
    {
        "name": "Ivory",
        "hex": "#FFFFF0"
    },
    {
        "name": "Khaki",
        "hex": "#F0E68C"
    },
    {
        "name": "Lavender",
        "hex": "#E6E6FA"
    },
    {
        "name": "LavenderBlush",
        "hex": "#FFF0F5"
    },
    {
        "name": "LawnGreen",
        "hex": "#7CFC00"
    },
    {
        "name": "LemonChiffon",
        "hex": "#FFFACD"
    },
    {
        "name": "LightBlue",
        "hex": "#ADD8E6"
    },
    {
        "name": "LightCoral",
        "hex": "#F08080"
    },
    {
        "name": "LightCyan",
        "hex": "#E0FFFF"
    },
    {
        "name": "LightGoldenRodYellow",
        "hex": "#FAFAD2"
    },
    {
        "name": "LightGray",
        "hex": "#D3D3D3"
    },
    {
        "name": "LightGrey",
        "hex": "#D3D3D3"
    },
    {
        "name": "LightGreen",
        "hex": "#90EE90"
    },
    {
        "name": "LightPink",
        "hex": "#FFB6C1"
    },
    {
        "name": "LightSalmon",
        "hex": "#FFA07A"
    },
    {
        "name": "LightSeaGreen",
        "hex": "#20B2AA"
    },
    {
        "name": "LightSkyBlue",
        "hex": "#87CEFA"
    },
    {
        "name": "LightSlateGray",
        "hex": "#778899"
    },
    {
        "name": "LightSlateGrey",
        "hex": "#778899"
    },
    {
        "name": "LightSteelBlue",
        "hex": "#B0C4DE"
    },
    {
        "name": "LightYellow",
        "hex": "#FFFFE0"
    },
    {
        "name": "Lime",
        "hex": "#00FF00"
    },
    {
        "name": "LimeGreen",
        "hex": "#32CD32"
    },
    {
        "name": "Linen",
        "hex": "#FAF0E6"
    },
    {
        "name": "Magenta",
        "hex": "#FF00FF"
    },
    {
        "name": "Maroon",
        "hex": "#800000"
    },
    {
        "name": "MediumAquaMarine",
        "hex": "#66CDAA"
    },
    {
        "name": "MediumBlue",
        "hex": "#0000CD"
    },
    {
        "name": "MediumOrchid",
        "hex": "#BA55D3"
    },
    {
        "name": "MediumPurple",
        "hex": "#9370DB"
    },
    {
        "name": "MediumSeaGreen",
        "hex": "#3CB371"
    },
    {
        "name": "MediumSlateBlue",
        "hex": "#7B68EE"
    },
    {
        "name": "MediumSpringGreen",
        "hex": "#00FA9A"
    },
    {
        "name": "MediumTurquoise",
        "hex": "#48D1CC"
    },
    {
        "name": "MediumVioletRed",
        "hex": "#C71585"
    },
    {
        "name": "MidnightBlue",
        "hex": "#191970"
    },
    {
        "name": "MintCream",
        "hex": "#F5FFFA"
    },
    {
        "name": "MistyRose",
        "hex": "#FFE4E1"
    },
    {
        "name": "Moccasin",
        "hex": "#FFE4B5"
    },
    {
        "name": "NavajoWhite",
        "hex": "#FFDEAD"
    },
    {
        "name": "Navy",
        "hex": "#000080"
    },
    {
        "name": "OldLace",
        "hex": "#FDF5E6"
    },
    {
        "name": "Olive",
        "hex": "#808000"
    },
    {
        "name": "OliveDrab",
        "hex": "#6B8E23"
    },
    {
        "name": "Orange",
        "hex": "#FFA500"
    },
    {
        "name": "OrangeRed",
        "hex": "#FF4500"
    },
    {
        "name": "Orchid",
        "hex": "#DA70D6"
    },
    {
        "name": "PaleGoldenRod",
        "hex": "#EEE8AA"
    },
    {
        "name": "PaleGreen",
        "hex": "#98FB98"
    },
    {
        "name": "PaleTurquoise",
        "hex": "#AFEEEE"
    },
    {
        "name": "PaleVioletRed",
        "hex": "#DB7093"
    },
    {
        "name": "PapayaWhip",
        "hex": "#FFEFD5"
    },
    {
        "name": "PeachPuff",
        "hex": "#FFDAB9"
    },
    {
        "name": "Peru",
        "hex": "#CD853F"
    },
    {
        "name": "Pink",
        "hex": "#FFC0CB"
    },
    {
        "name": "Plum",
        "hex": "#DDA0DD"
    },
    {
        "name": "PowderBlue",
        "hex": "#B0E0E6"
    },
    {
        "name": "Purple",
        "hex": "#800080"
    },
    {
        "name": "RebeccaPurple",
        "hex": "#663399"
    },
    {
        "name": "Red",
        "hex": "#FF0000"
    },
    {
        "name": "RosyBrown",
        "hex": "#BC8F8F"
    },
    {
        "name": "RoyalBlue",
        "hex": "#4169E1"
    },
    {
        "name": "SaddleBrown",
        "hex": "#8B4513"
    },
    {
        "name": "Salmon",
        "hex": "#FA8072"
    },
    {
        "name": "SandyBrown",
        "hex": "#F4A460"
    },
    {
        "name": "SeaGreen",
        "hex": "#2E8B57"
    },
    {
        "name": "SeaShell",
        "hex": "#FFF5EE"
    },
    {
        "name": "Sienna",
        "hex": "#A0522D"
    },
    {
        "name": "Silver",
        "hex": "#C0C0C0"
    },
    {
        "name": "SkyBlue",
        "hex": "#87CEEB"
    },
    {
        "name": "SlateBlue",
        "hex": "#6A5ACD"
    },
    {
        "name": "SlateGray",
        "hex": "#708090"
    },
    {
        "name": "SlateGrey",
        "hex": "#708090"
    },
    {
        "name": "Snow",
        "hex": "#FFFAFA"
    },
    {
        "name": "SpringGreen",
        "hex": "#00FF7F"
    },
    {
        "name": "SteelBlue",
        "hex": "#4682B4"
    },
    {
        "name": "Tan",
        "hex": "#D2B48C"
    },
    {
        "name": "Teal",
        "hex": "#008080"
    },
    {
        "name": "Thistle",
        "hex": "#D8BFD8"
    },
    {
        "name": "Tomato",
        "hex": "#FF6347"
    },
    {
        "name": "Turquoise",
        "hex": "#40E0D0"
    },
    {
        "name": "Violet",
        "hex": "#EE82EE"
    },
    {
        "name": "Wheat",
        "hex": "#F5DEB3"
    },
    {
        "name": "White",
        "hex": "#FFFFFF"
    },
    {
        "name": "WhiteSmoke",
        "hex": "#F5F5F5"
    },
    {
        "name": "Yellow",
        "hex": "#FFFF00"
    },
    {
        "name": "YellowGreen",
        "hex": "#9ACD32"
    }
]
const opener = window.opener || window.parent;
let cssUnits = ["em","ex","ch","rem", "vh", "vw", "vmin", "vmax", "%", "cm", "mm", "in", "px", "pt", "pc", "fr"];
//cssUnitsRegex = /(?:[+-]?\d+(?:\.\d+)?)?(em|ex|ch|rem|vh|vw|vmin|vmax|cm|mm|in|px|pt|pc|fr)\b|(?:[+-]?\d+(?:\.\d+)?)%/;
let cssUnitsRegex = /^(em|ex|ch|rem|vh|vw|vmin|vmax|cm|mm|in|px|pt|pc|fr)\b|^%/;
let urlRegex = /url\([^)]*\)/;
let colorRegexFunctions = "rgb\\([^)]*\\)|rgba\\([^)]*\\)|#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})\\b|hsl\\([^)]*\\)|hsla\\([^)]*\\)";
let cssColorRegex = "(^|\\s)(" + cssColors.map(v=>v.name).join("|") + ")($|\\s)";
let colorRegex = new RegExp(colorRegexFunctions+"|"+cssColorRegex,"i");
/*
 /([+-]?\d+(?:\.\d+)?|[+-]?\.\d+?)((em|ex|ch|rem|vh|vw|vmin|vmax|cm|mm|in|px|pt|pc|fr)\b|%(\s|,|$))/
 */
let numberRegex = /[+-]?\d+(?:\.\d+)?|[+-]?\.\d+?/;
let timeUnits = ["s","ms"];
let timeRegex = /\d+(s|ms)/;
let mapArrValues = ["number","unit","url","color"];
function inputCss(root){
    var inps = [...root.querySelectorAll(".input-css")];
    inps.forEach(t=>{
        if(!t.hasAttribute("contenteditable"))
            return;
        if(t.nextElementSibling && t.nextElementSibling.classList.contains("input-css-placeholder") &&
            (t.innerText == t.nextElementSibling.innerText))
            return;
        setTargetHTML(t)
    });
    if(root.dataset.inputCssStarted)
        return;
    root.dataset.inputCssStarted = true;
    //root.addEventListener("paste",onPaste);
    root.addEventListener("click",clickButtonsListener);
    root.addEventListener("click",focusInput);
    root.addEventListener("blur",blur,true);
}
function setTargetHTML(target){
    var text = target.innerText;
    var placeholderEl;
    if(!target.nextElementSibling || !target.nextElementSibling.classList.contains("input-css-placeholder")){
        placeholderEl = target.ownerDocument.createElement("div");
        placeholderEl.className="input-css-placeholder";
        target.parentNode.insertBefore(placeholderEl,target.nextElementSibling)
    }
    else
        placeholderEl = target.nextElementSibling;
    var matchInputCssValues = matchValue(text);
    var padding = 0;
    matchInputCssValues.forEach((v,i)=> {
        var start = v.start + padding;
        var end = v.end + padding;
        var value = text.substring(start, end);
        var dti = `data-token-index="${i}"`;
        if (v.type == "number") {
            var numberWrap = `<div class='number-wrap token' ${dti}><span class="arrow-up prevent-click"></span><span class="number-value">${value}</span><span class="arrow-down prevent-click"></span></div>`;
            text = text.substring(0, start) + numberWrap + text.substring(end);
            padding += numberWrap.length - value.length;
        }
        if (v.type == "color") {
            var spanColorButton =
                `<div class="token" ${dti}>
                <span class='span-color-button prevent-click' style="background:${value}"></span>
                <span class="color-value">${value}</span>
                </span>
                </div>`;
            text = text.substring(0, start) + spanColorButton + text.substring(end);
            padding += spanColorButton.length - value.length;
        }
        if (v.type == "url") {
            var spanUrlsButtons =
                `<div class="token" ${dti}>
                <span class='input-css-search-image-in-project prevent-click'></span>
                <span class="url-value">${value}</span>
                </span>
                </div>`;
            text = text.substring(0, start) + spanUrlsButtons + text.substring(end);
            padding += spanUrlsButtons.length - value.length;
        }
    });
    target.classList.add("focus-control");
    placeholderEl.innerHTML = text;
}
window.inputCss = inputCss;

function findValues(value){
    var mNumber = value.match(numberRegex);
    if(mNumber) { //lookbehind
        var prev = value.charAt(mNumber.index - 1);
        if(prev && !prev.match(/\s|,|\(/))
            mNumber = null;
    }
    var mUnit= value.match(cssUnitsRegex);
    var mUrl= value.match(urlRegex);
    var mColor= value.match(colorRegex);
    var arrValues = [mNumber,mUnit,mUrl,mColor];
    return {
        arrValues,
        found : arrValues.filter(f=>f)
    };
}
function matchValue(value){
    var tokens = [];
    var incr = 0;
    var values = findValues(value);
    while(values.found.length){
        var first = values.found.sort((a, b)=>a.index-b.index)[0];
        var indexForMap = values.arrValues.indexOf(first);
        var end = first.index + first[0].length;
        tokens.push({
            end : incr+end,
            type: mapArrValues[indexForMap],
            start : incr + first.index
        });
        value = value.substring(end);
        values = findValues(value);
        incr+=end;
    }
    return tokens
}
function move(target,token,dir,range,incr){
    var string = target.innerHTML;
    if(token.type == "number"){
        var number = Number(string.substring(token.start, token.end));
        var originalDecimalLength = ("" + number).split(".")[1];
        var newValue = 0;
        if(dir == "up")
            newValue = number + incr;
        if(dir == "down")
            newValue = number - incr;
        if(originalDecimalLength)
            newValue = newValue.toFixed(originalDecimalLength.length);
    }
    /*
    if(type == "unit") {
        var unit = string.substring(token.start, token.end);
        var index = cssUnits.indexOf(unit);
        if(dir == "up")
            newValue = cssUnits[index+1<cssUnits.length ? index+1 : 0];
        else
            newValue = cssUnits[index-1>=0 ? index-1 : cssUnits.length-1];
    }*/
    var firstP = string.substring(0, token.start);
    var endP = string.substring(token.end);
    target.textContent = firstP + newValue + endP;
    range.setStart(target.childNodes[0], token.start);
    range.setEnd(target.childNodes[0],token.start + ("" + newValue).length);
    target.dispatchEvent(new KeyboardEvent("input", {bubbles : true}));
}
function setText(inputCssPlaceholder){
    var inputCss = inputCssPlaceholder.previousElementSibling;
    inputCss.textContent = textNodesUnder(inputCssPlaceholder).map(t=>t.textContent).join("");
    inputCss.dispatchEvent(new KeyboardEvent("input", {bubbles : true}));
    inputCss.dispatchEvent(new Event("css-input-set-text", {bubbles : true}))
}
// https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page
function textNodesUnder(el){
    var n, a=[], walk=el.ownerDocument.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
    while(n=walk.nextNode()) a.push(n);
    return a;
}
function blur(e){
    var t = e.target;
    if(!t.classList.contains("input-css"))
        return;
    t.__current_token = false;
    if(!t.hasAttribute("contenteditable")) {
        t.classList.add("focus-control");
        return;
    }
    setTargetHTML(e.target);
}
function clickButtonsListener(e){
    var inputCssPlaceholder = e.target.closest(".input-css-placeholder");
    var t = e.target;
    var isColorButton = t.classList.contains("span-color-button");
    var isNumberArrowUp = t.classList.contains("arrow-up");
    var isNumberArrowDown = t.classList.contains("arrow-down");
    var isSearchImgInProjectButton = t.classList.contains("input-css-search-image-in-project");
    if(isColorButton)
        colorButtonClick(e);
    else if(isNumberArrowUp || isNumberArrowDown) {
        var numberSpan = t.parentNode.querySelector(".number-value");
        var originalDecimalLength = numberSpan.textContent.split(".")[1];
        var numberValue = +numberSpan.textContent;
        var newValue = isNumberArrowUp ? numberValue+1 : numberValue-1;
        numberSpan.textContent = originalDecimalLength ? newValue.toFixed(originalDecimalLength.length) : newValue;
        setText(inputCssPlaceholder)
    }
    else if(isSearchImgInProjectButton)
        clickImageInProject(e);
}
function clickImageInProject (e){
    var inputCssPlaceholder = e.target.closest(".input-css-placeholder");
    var imageSearch = opener.dialogReader();
    imageSearch.then(imageSearchDialog=>{
        imageSearchDialog.on("submit",src=>{
            e.target.nextElementSibling.textContent = "url("+src+")";
            setText(inputCssPlaceholder)
        });
    },e=>{
        opener.alertDialog.open(e.error || e.err || e.toString(),true);
        console.log(e);
    })
}

function colorButtonClick(e){
    var inputCssPlaceholder = e.target.closest(".input-css-placeholder");
    var color = e.target.nextElementSibling.textContent;
    var isNameColor = cssColors.find(c=>c.name.toLocaleLowerCase() == color.trim().toLowerCase());
    if(isNameColor)
        color = isNameColor.hex;
    //opener.app.colorPicker.show();
    var throttle;
    opener.tilepieces.colorPicker(color).onChange(c=>{
        clearTimeout(throttle);
        throttle = setTimeout(()=>{
            var rgbColor = c.rgba[3] < 1 ? `rgba(${c.rgba[0]}, ${c.rgba[1]}, ${c.rgba[2]}, ${c.rgba[3]})` :
                `rgb(${c.rgba[0]}, ${c.rgba[1]}, ${c.rgba[2]})`;// TODO only rgb?
            e.target.nextElementSibling.textContent = rgbColor;
            e.target.style.background =rgbColor;
            setText(inputCssPlaceholder)
        },32)
    })
}
function focusInput(e){
    var el = e.target;
    var cssInputPlaceholder = el.closest(".input-css-placeholder");
    if(!cssInputPlaceholder)
        return;
    if(el.classList.contains("prevent-click") || el.closest(".prevent-click"))
        return;
    var cssInput = cssInputPlaceholder.previousElementSibling;
    cssInput.classList.remove("focus-control");
    if(!cssInputPlaceholder.innerText.trim()){
        cssInput.focus();
        return;
    }
    var isToken = el.closest("div.token");
    var dti = isToken && isToken.dataset.tokenIndex;
    var selection = cssInput.ownerDocument.defaultView.getSelection();
    var range = new Range();
    if(dti) {
        var tokens = matchValue(cssInput.innerText);
        var token = tokens[dti];
        range.setStart(cssInput.childNodes[0], token.start);
        range.setEnd(cssInput.childNodes[0],token.end);
    }
    else
        range.selectNodeContents(cssInput.childNodes[0]);
    selection.removeAllRanges();
    selection.addRange(range);
    cssInput.focus();
}
function onInput(e){
    var target = e.target;
    if(!target || !target.classList)
        return;
    if(!target.classList.contains("input-css"))
        return;
    if(!target.hasAttribute("contenteditable"))
        return;
    if(target.__autocomplete_is_running)
        return;
    var sel = e.target.ownerDocument.defaultView.getSelection();
    var range = sel.getRangeAt(0);
    var tokens = matchValue(target.innerHTML);
    var token = tokens
        .find(v=>range.startOffset>=v.start && range.endOffset<=v.end);
    if(e.key == "Enter")
        e.preventDefault();
    if(!token)
        return;
    if((e.key == "ArrowUp" || e.key == "ArrowDown" || e.key == "PageUp" || e.key == "PageDown") && token.type=="number") {
        e.preventDefault();
        var moveDir = e.key == "ArrowUp" || e.key == "PageUp" ? "up" : "down";
        var incr = 1;
        if(e.ctrlKey)
            incr = 100;
        else if(e.shiftKey)
            incr = 10;
        else if (e.altKey)
            incr = 0.1;
        move(target,token,moveDir,range,incr);
    }
}
document.addEventListener("keydown",onInput,true);
function mousewheel(e){
    var target = e.target;
    if(!target || !target.classList)
        return;
    if(!target.classList.contains("input-css"))
        return;
    if(!target.hasAttribute("contenteditable"))
        return;
    if(target.__autocomplete_is_running)
        return;
    var sel = target.ownerDocument.defaultView.getSelection();
    var range = sel.getRangeAt(0);
    var tokens = matchValue(target.innerHTML);
    var token = tokens
        .find(v=>range.startOffset>=v.start && range.endOffset<=v.end);
    if(e.key == "Enter")
        e.preventDefault();
    if(!token)
        return;
    var delta = Math.sign(e.deltaY);
    var moveDir = delta < 0 ? "up" : "down";
    var incr;
    if(e.ctrlKey)
        incr = 100;
    else if(e.shiftKey)
        incr = 10;
    else if (e.altKey)
        incr = 0.1;
    else incr = 1;
    move(target,token,moveDir,range,incr);
    e.preventDefault();
}
window.addEventListener('mousewheel',mousewheel,{passive: false});
window.addEventListener("window-popup-open",e=>{
    var doc = e.detail.newWindow.document;
    doc.addEventListener("keydown",onInput,true);
    e.detail.newWindow.addEventListener('mousewheel',mousewheel,{passive: false});
});
function insertTextAtCursor(text,t) {
    var sel, range;
    sel = t.ownerDocument.defaultView.getSelection();
    range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(t.ownerDocument.createTextNode(text));
    var en = new KeyboardEvent("input", {bubbles : true});
    t.dispatchEvent(en);
}
function onPaste(e){
    if(!e.target.classList.contains("input-css"))
        return;
    e.preventDefault();
    if (e.clipboardData && e.clipboardData.getData) {
        var text = e.clipboardData.getData("text/plain");
        if(text.length)
            insertTextAtCursor(text,e.target);
    }
}

})();
(()=>{
TT.prototype.bindingEl = function(el,stringModel,targetEl,ttobj,newScope){
  var $self = this;
  var events = el.dataset[$self.bindEventsAttr];
  if(events)
    events = events.split(",");
  else
    events = ["change"];
  events.forEach(e=>
    el.addEventListener(e,(ev)=>{
      /*
      if(!ttobj.el.contains(ev.target) && ttobj.el != ev.target)
          return;*/
      targetEl.dispatchEvent(
          new CustomEvent(stringModel,{detail:ev})
      );
      var value;
      if(el.tagName == "INPUT" && el.type == "checkbox")
          value = ev.target.checked;
      else if(el.tagName == "INPUT" && el.type == "radio") {
          var c = targetEl.querySelector(`[name="${el.name}"]:checked`);
          value = c ? c.value : null;
      }
      else if(el.tagName == "INPUT" && el.type == "number")
          value = Number(ev.target.value);
      else if((el.tagName == "INPUT" && el.type != "file") || el.tagName == "SELECT" ||
          el.tagName == "TEXTAREA")
          value = ev.target.value;
      else if(el.type != "file")
          value = ev.target.textContent;
      var match = getParamFromString(convertVarToModel(stringModel,newScope),ttobj.scope);
      if(match == value){
          console.log("returning");
          return;
      }
      ttobj.set(stringModel,value);
      Object.defineProperty(ev,"stringModel",{value:stringModel});
      targetEl.dispatchEvent(new CustomEvent("template-digest",{detail:ev}));
    })
  );
}
TT.prototype.declare = function(el,scope,model,newScope = []) {
    var $self = this;
    if(el.nodeType == 1) {
        if (el.dataset[$self.ifAttr]) {
            var condition = el.dataset[$self.ifAttr];
            var sc = Object.assign({},$self.scope);
            newScope.forEach(n=>{
                sc[n.variable] = getParamFromString(
                    convertVarToModel(n.iterable || n.original,newScope),sc);
                n.originalValue = sc[n.variable];
            });
            var result = ifResolver(condition, sc);
            var m = {
                node: el,
                clone: el.cloneNode(true),
                parentNode: el.parentNode,
                condition,
                type: "if",
                model: [],
                newScope,
                result
            };
            if (!result) {
                m.placeholder = el.ownerDocument.createComment("if( " + condition + " ) placeholder");
                el.parentNode.replaceChild(m.placeholder, el);
                if (el == $self.el)
                    $self.el = m.placeholder;
                model.push(m);
                return;
            }
            else {
                el.parentNode.replaceChild(m.clone, el);
                if (el == $self.el)
                    $self.el = m.clone
            }
            model.push(m);
            model = m.model;
            el = m.clone;
        }
        if (el.dataset[$self.foreachAttr]) {
            var iterableName = el.dataset[$self.foreachAttr];
            var iterable = getParamFromString(
                convertVarToModel(iterableName,newScope), scope) || [];
            if(!Array.isArray(iterable)) {
              try{
                iterable = Object.values(iterable);
              }
              catch(e) {
                console.error("[TT foreach declare error] iterableName ->\"", iterableName + '\"');
                console.error("[TT foreach declare error] iterable ->", iterable);
                console.error("[TT foreach declare error] iterableName ->\"", iterableName + '\"');
                console.error("[TT foreach declare error] iterable ->", iterable);
                throw new Error("[TT foreach declare error] Passed a non-array to foreach");
              }
            }
            var variable = el.dataset[$self.foreachKeyNameAttr] || "key";
            var firstPart = "" + iterableName;
            variable = convertVarToModel(variable,newScope);
            var m = {
                node: el,
                type: "foreach",
                variable,
                iterable:copyObjectIterable(iterable),
                model: [],
                newScope,
                iterableName: firstPart
            };
            model.push(m);
            model = m.model;
            for (var k in iterable) {
                var newEl = el.cloneNode(true);
                newEl.removeAttribute("data-"+$self.foreachAttr);
                newEl.removeAttribute("data-"+$self.foreachKeyNameAttr);
                var n = newScope.slice(0);
                var aName = firstPart + `[${k}]`;
                n.push({variable, iterable: aName, originalValue: iterable[k]});
                var foreachObj = {type: "foreach-item", node: newEl, model: [], value: iterable[k]};
                model.push(foreachObj);
                $self.declare(newEl, scope, foreachObj.model, n);
                el.parentNode.insertBefore(newEl, el);
            }
            m.placeholder = $self.el.ownerDocument.createComment("foreach( " + iterableName + " ) placeholder");
            el.parentNode.replaceChild(m.placeholder, el);
            return;
        }
        [...el.attributes].forEach(attr=> {
            $self.replaceNodeValue(attr.name, attr, scope, newScope, model, {type: "name", owner: el});
            $self.replaceNodeValue(attr.nodeValue, attr, scope, newScope, model, {type: "value", owner: el});
        });
        if (el.dataset[$self.bindDOMPropAttr]) {
            var params = el.dataset[$self.bindDOMPropAttr].split(",");
            if ((params.length % 2)) {
                console.error("[tilepieces TEMPLATE ERROR], bindObject not divisible by 2", console.trace())
                return;
            }
            for (var i = 0; i < params.length; i += 2) {
              var variable = convertVarToModel(params[i + 1].trim(),newScope);
              var s = getParamFromString(variable, scope);
              var nameAttr = params[i].trim();
              Object.defineProperty(el,nameAttr,{value:s,configurable:true,writable:true});
              model.push({
                  node: el,
                  variables: [{variable:convertVarToModel(variable,newScope), value: s}],
                  newScope,
                  nameAttr,
                  type: "bind-attr"
              })
            }
        }
        if (el.dataset[$self.bindAttr]) {
            var variable = el.dataset[$self.bindAttr];
            variable = convertVarToModel(variable,newScope);
            try {
                var res = getParamFromString(variable, $self.scope);
            }
            catch (e) {
                console.error("[binding error] --> e -->", e);
                console.error("[binding error]--> el -->", el, model, scope, newScope);
                return;
            }
            if (el.tagName == "INPUT" && el.type == "checkbox")
                el.checked = res;
            else if (el.tagName == "INPUT" && el.type == "radio") {
                setTimeout(()=> {
                    var radioEl = $self.el.querySelector(`[name="${el.name}"][value="${res}"]`);
                    if (radioEl)
                        radioEl.checked = true;
                })
            }
            else if ((el.tagName == "INPUT" && el.type!="file") || el.tagName == "SELECT")
                el.value = res;
            else if(el.type!="file") {
                el.textContent = res;
            }
            $self.bindingEl(el, variable, $self.el, $self,newScope);
            model.push({
                node: el,
                value: res,
                variable,
                newScope,
                type: "binding"
            })
        }
        if (el.dataset[$self.setTemplateAttr]){
            $self.templates.push({
                name : el.dataset[$self.setTemplateAttr],
                el
            });
            el.removeAttribute("data-"+$self.setTemplateAttr);
            el.remove();
            return;
        }
        if (el.dataset[$self.useTemplateAttr]){
            var templateToUse = el.dataset[$self.useTemplateAttr];
            var template = $self.templates.find(v=>v.name == templateToUse);
            el.appendChild(template.el.cloneNode(true));
            var params = el.dataset[$self.useTemplateParamsAttr];
            if(params){
                params = params.split(",");
                var newNewScope = [];
                for (var i = 0; i < params.length; i += 2) {
                    newNewScope.push({
                        variable: params[i].trim(),
                        original : convertVarToModel(params[i + 1].trim(),newScope)
                    });
                }
                newScope = newNewScope;
            }
        }
        if(typeof el.dataset[$self.isolateAttribute] === "string")
            return;
    }
    [...el.childNodes].forEach(child=>{
        if(child.nodeType == 1)
            $self.declare(child,scope,model,newScope);
        else if (child.nodeType == 3) {
          var test = child.textContent.match($self.interpolation);
          if(test) {
            child.textContent = $self.replaceNodeValue(child.textContent, child, scope, newScope, model)
          }
        }
    });
}
function ifResolver(condition,scope){
    var names = [], values = [];
    for (var k in scope) {
        names.push(k);
        values.push(scope[k]);
    }
    return new Function(names,
        'try{return ' + condition + ' }catch(e){return false}')
        .apply(this,values);
}
//let triggerAttribute = "frontart-template";
let bindNoTriggerAttribute = "t-bind-no-trigger"; // TODO ???
function TT(el,data,options = {}){
    this.model = [];
    this.el = el;
    this.interpolation = options.interpolation || /\$\{([\s\S]+?)\}/;
    this.ifAttr = options.ifAttr || "if";
    this.foreachAttr = options.foreachAttr || "foreach";
    this.foreachKeyNameAttr = options.foreachKeyNameAttr || "foreachKeyName";
    this.bindAttr = options.bindAttr || "bind";
    this.bindDOMPropAttr = options.bindDOMPropAttr || "bindDomProp";
    this.bindEventsAttr = options.bindEventsAttr || "bindEvents";
    this.setTemplateAttr = options.setTemplateAttr || "set";
    this.useTemplateAttr = options.useTemplateAttr || "use";
    this.useTemplateParamsAttr = options.useTemplateParamsAttr || "params";
    this.isolateAttribute = options.isolateAttribute || "isolate";
    this.srcAttribute = options.srcAttribute || "src";
    this.toChange = [];
    this.templates = [];
    if(options.templates)
        this.templates = this.templates.concat(options.templates);
    this.getParamFromString = (string)=>{
        return getParamFromString(string,this.scope);
    };
    this.setParamFromString = (string,value)=>{
        return setParamFromString(string,this.scope,value);
    };
    this.scope = data;
    this.declare(el,data,this.model);
    return this;
}
window.TT = TT;
TT.prototype.bindingProcess = function(m,stringMatched,parentModel,index) {
    var $self = this;
    try {
        var res = getParamFromString(
            convertVarToModel(m.variable,m.newScope), $self.scope);
    }
    catch(e){
        var findToChange = $self.toChange.find(v=>v.parentModel==parentModel && v.index==index);
        findToChange && $self.toChange.push({parentModel,index});
        return;
    }
    if(res != m.value && m.node.tagName.match(/INPUT|SELECT|TEXTAREA/)) {
        if (m.node.type == "checkbox")
            m.node.checked = res;
        else if (m.node.type == "radio") {
            var radioEl = $self.el.querySelector(`[name="${m.node.name}"][value="${res}"]`);
            if (radioEl)
                radioEl.checked = true;
        }
        else
            m.node.value = res;
        m.value = res;
    }
    else if(m.node.textContent!=res && !m.node.tagName.match(/INPUT|SELECT|TEXTAREA/)) {
        m.node.textContent = res;
        m.value = res;
    }
}
TT.prototype.foreachProcess = function(m,stringMatched,parentModel,index){
    var $self = this;
    var variable = m.iterableName;
    var modelVariable = splitStringInModel(variable);
    var ok = !stringMatched || splitStringInModel(stringMatched).slice(0,modelVariable.length);
    if(variable == stringMatched || ok) {
        var value = getParamFromString(convertVarToModel(variable,m.newScope),$self.scope) || [];
        if(!Array.isArray(value)) {
          try{
            value = Object.values(value);
          }
          catch(e) {
            console.error("[TT foreach process error]. Passed a non-array to foreach", convertVarToModel(variable, m.newScope), value);
            throw new Error("[TT foreach process error]. Passed a non-array to foreach");
          }
        }
        var firstPart = ""+m.iterableName;
        firstPart = convertVarToModel(firstPart,m.newScope);
        var valueLength = value.length;
        var iterableLength = m.iterable.length;
        var muchLonger = iterableLength > valueLength ? m.iterable : value;
        var newModel = m.model.slice(0);
        // m.iterable is the old value
        // value is the new value
        // m.model are the objects associated with the list.
        for(var count = 0;count<muchLonger.length;count++){
            if(m.model[count] && typeof value[count] == "undefined") {
                var modelIndex = m.model[count];
                modelIndex.node.parentNode.removeChild(modelIndex.node);
                newModel.splice(newModel.findIndex(nm=>modelIndex.node == nm.node),1);
            }
            else if(m.model[count]) {
                var n = newModel.find(nm=>m.model[count] && m.model[count].node == nm.node);
                n.value = value[count];
                $self.process(m.model[count],stringMatched,m.model,count)
            }
            else if(!m.model[count]){
                var newEl = m.node.cloneNode(true);
                newEl.removeAttribute("data-"+$self.foreachAttr);
                newEl.removeAttribute("data-"+$self.foreachKeyNameAttr);
                var sc = Object.assign({},$self.scope);
                sc[m.variable] = muchLonger[count];
                var n = m.newScope.slice(0);
                var aName = firstPart + `[${count}]`;
                n.push({variable:m.variable,iterable : aName,originalValue : value[count]});
                var foreachObj = {type:"foreach-item",node:newEl,model:[],value:value[count]};
                $self.declare(newEl,sc,foreachObj.model,n);
                var nu = newModel[newModel.length-1] && newModel[newModel.length-1].node;
                if(nu)
                    nu.parentNode.insertBefore(newEl,nu.nextSibling);
                else
                    m.placeholder.parentNode.insertBefore(newEl,m.placeholder.nextSibling);
                newModel.push(foreachObj);
            }
            else{
                $self.process(m.model[count],stringMatched,m.model,count)
            }
        }
        m.iterable = copyObjectIterable(value);
        m.model = newModel;
    }
    else{
        m.model.forEach((mi,i,a)=>$self.process(mi,stringMatched,m.model,i));
    }
}

TT.prototype.ifProcess = function(m,stringMatched,parentModel,index){
    var $self = this;
    var sc = Object.assign({},$self.scope);
    m.newScope.forEach(n=>{
        sc[n.variable] = getParamFromString(
            convertVarToModel(n.iterable  || n.original,m.newScope),sc);
        n.originalValue = sc[n.variable];
    });
    var result = ifResolver(m.condition,sc);
    if(!!result != !!m.result) {
        if(result) {
            m.model = [];
            var newIf = m.node.cloneNode(true);
            newIf.removeAttribute("data-"+$self.ifAttr);
            $self.declare(newIf, sc,m.model, m.newScope);
            if(m.placeholder && m.placeholder.parentNode){
                m.placeholder.parentNode.replaceChild(newIf,m.placeholder);
                if($self.el == m.placeholder)
                    $self.el = newIf;
            }
            else {
                m.clone.parentNode.replaceChild(newIf, m.clone);
                if($self.el == m.clone)
                    $self.el = newIf;
            }
            m.clone = newIf;
        }
        else{
            if(!m.placeholder) {
                m.placeholder = m.node.ownerDocument.createComment("if( " + m.condition + " ) placeholder");
            }
            m.clone.parentNode.replaceChild(m.placeholder, m.clone);
            if($self.el == m.clone)
                $self.el = m.placeholder;
            m.clone = null;
            m.model = [];
        }
        m.result = result;
    }
    else if(result){
        m.model.forEach((mi,i,a)=>$self.process(mi,stringMatched,m.model,i));
    }
}

TT.prototype.process = function(m,stringMatched,parentModel,index){
    var $self = this;
    if(m.type == "foreach-item")
        m.model.forEach((mi,i)=>$self.process(mi,stringMatched,m.model,i));
    else if(m.type == "if"){
        $self.ifProcess(m,stringMatched,parentModel,index)
    }
    else if(m.type == "foreach"){
        if(!m.iterable){
            var newIterable = getParamFromString(convertVarToModel(m.iterableName,m.newScope),$self.scope);
            if(newIterable)
                m.iterable = newIterable;
            else return;
        }
        $self.foreachProcess(m,stringMatched,parentModel,index)
    }
    else if(m.type == "binding"){
        $self.bindingProcess(m,stringMatched,parentModel,index)
    }
    else{
        var variables = m.variables.slice(0);
        for(var iV = 0;iV<variables.length;iV++){
            var v = variables[iV];
            try {
                var match = getParamFromString(
                    convertVarToModel(v.variable,m.newScope), $self.scope);
            }
            catch(e){
                console.error(e);
                console.error(m);
                var findToChange = $self.toChange.find(v=>v.parentModel==parentModel && v.index==index);
                !findToChange && $self.toChange.push({parentModel,index});
                return;
            }
            if(match != v.value) {
                var findToChange = $self.toChange.find(v=>v.parentModel==parentModel && v.index==index);
                !findToChange && $self.toChange.push({parentModel,index});
                if(m.type && m.type=="name-attr"){
                    try {
                        var val = m.node.getAttribute(v.value);
                        var newValue = $self.replaceNodeValue(m.value,
                            {nodeName:v.value,nodeValue:val},$self.scope,m.newScope.slice(0),
                            parentModel,{type:"name",owner:m.node});
                        //newValue && m.node.setAttribute(newValue,val);
                        m.node.removeAttribute(v.value);
                        if(newValue &&
                            ( m.node.tagName == "INPUT" || m.node.tagName == "SELECT")&&
                            newValue == "value") {
                            m.node.value = val || "";
                            console.log(newValue,"name-attr",val);
                        }
                    }
                    catch(e){console.error("error in assigning attr name",e)}
                }
                else if(m.type && m.type=="value-attr"){
                    try {
                        var newValue = $self.replaceNodeValue(m.value,
                            {nodeName:m.nameAttr,nodeValue:m.value},$self.scope,m.newScope.slice(0),
                            parentModel,{type:"value",owner:m.node});
                        //m.node.setAttribute(m.nameAttr, newValue);
                        if(( m.node.tagName == "INPUT" || m.node.tagName == "SELECT") &&
                            m.nameAttr == "value") {
                            m.node.value = newValue;
                            console.log(newValue,"value-attr");
                        }
                    }
                    catch(e){console.error("error in assigning attr value",e)}
                }
                else if(m.type && m.type=="bind-attr"){
                    m.node[m.nameAttr] = match;
                    m.variables[0].value = match;
                    parentModel.push(m)
                }
                else {
                    var newValue = $self.replaceNodeValue(m.value,
                        m.node,$self.scope,m.newScope.slice(0),
                        parentModel);
                    m.node.nodeValue = newValue;
                }
            }
        }
    }
}
TT.prototype.replaceNodeValue = function(value,node,scope,newScope,model,attrType) {
    var $self = this;
    var v = "" + value;
    var test = value.match($self.interpolation);
    var t = test;
    var variables = [];
    while (t) {
        var variable = t[1].trim();
        variable = convertVarToModel(variable,newScope);
        var s = getParamFromString(variable, scope);
        value = value.substring(0, t.index) + s +
            value.substring(t.index + t[0].length, value.length);
        variables.push({variable,value:s});
        t = value.match($self.interpolation);
    }
    if(test && !attrType){
        model.push({
            node,
            value : v,
            variables,
            newScope
        })
    }
    else if(test && attrType){
        if(attrType.type == "name") {
            try {
                attrType.owner.setAttribute(value, node.nodeValue || "");
                attrType.owner.removeAttribute(node.nodeName);
            }
            catch(e){}
            model.push({
                node:attrType.owner,
                value : v,
                variables,
                newScope,
                type:"name-attr"
            })
        }
        else {
            try {
                if(node.nodeName=="data-"+$self.srcAttribute &&
                    attrType.owner.nodeName.match(/IMG|IFRAME|VIDEO|AUDIO|SOURCE/) &&
                    attrType.owner.getAttribute("src") != value){
                    attrType.owner.setAttribute("src", value);
                }
                else
                    attrType.owner.setAttribute(node.nodeName, value);
            }
            catch(e){}
            model.push({
                node:attrType.owner,
                value : v,
                variables,
                newScope,
                nameAttr : node.nodeName,
                type:"value-attr"
            })
        }
    }
    return value;
}
TT.prototype.set = function(string,value){
    var $self = this;
    if(string) {
        var newValue = setParamFromString(string, $self.scope, value);
        if (!string)
            $self.scope = newValue;
    }
    else $self.scope = value;
    $self.model.slice(0).forEach((m,i,a)=>{
        try {
            $self.process(m, string || "", $self.model, i)
        }
        catch(e){
            console.error("[TT.prototype.set error on model process]");
            console.error("string,value",string,value);
            console.error("model,index,array",m,i,a);
            console.error("$self.model ->",$self.model);
            console.trace();
        }
    });
    for(var i=$self.toChange.length-1;i>=0;i--)
        $self.toChange[i].parentModel.splice($self.toChange[i].index,1);
    $self.toChange = [];
}
function convertVarToModel(variable,newScope) {
    var find = newScope
        .findIndex(v=>variable.startsWith(v.variable + ".") ||
        v.variable == variable || variable.startsWith(v.variable + "["));
    var count= 0;
    var swapVariable = variable;
    while (find > -1) {
        variable = variable.replace(newScope[find].variable, newScope[find].iterable || newScope[find].original);
        find = newScope.findIndex(v=>variable.startsWith(v.variable + ".") ||
        v.variable == variable || variable.startsWith(v.variable + "["));
        count++;
        if(count>newScope.length) {
            console.error("[TT] Model generate infinite loop:\nVariable->\"",swapVariable,
                "\"\nnewScope->",newScope);
            throw new Error();
        }
    }
    return variable;
}
function copyObjectIterable(obj){
    if(Array.isArray(obj))
        return obj.slice(0)
    else{
        var newObj = {};
        for(var k in obj)
            newObj[k] = obj[k]
        return obj;
    }
}
function getParamFromString(string, root, separator = ".") {
    if(!string.length) {
        return root;
    }
    var model = string.split(/\[|\]|\./).filter(v=>v);//splitStringInModel(string,separator);
    var actualModel = root;
    for (var i = 0; i < model.length - 1; i++)
        actualModel = actualModel[model[i]];
    try {
        return actualModel[model[model.length - 1]];
    }
    catch(e){
        console.error("can't find " + string + " in model\n",root);
        console.trace();
        throw new Error(e);
    }
}

// https://stackoverflow.com/questions/21714808/array-isarray-does-not-work-on-a-nodelist-is-there-an-alternative

// Determine if o is an array-like object.
// Strings and functions have numeric length properties, but are 
// excluded by the typeof test. In client-side JavaScript, DOM text
// nodes have a numeric length property, and may need to be excluded 
// with an additional o.nodeType != 3 test.
function isArrayLike(o) {
    if (o &&                                // o is not null, undefined, etc.
        typeof o === "object" &&            // o is an object
        isFinite(o.length) &&               // o.length is a finite number
        o.length >= 0 &&                    // o.length is non-negative
        o.length===Math.floor(o.length) &&  // o.length is an integer
        o.length < 4294967296)              // o.length < 2^32
        return true;                        // Then o is array-like
    else
        return false;                       // Otherwise it is not
}
function setParamFromString(string, root, value, separator = ".") {
    if(!string.length) {
        root = value;
        return root;
    }
    var model = splitStringInModel(string,separator);
    var actualModel = root;
    for (var i = 0; i < model.length - 1; i++)
        actualModel = actualModel[model[i]];
    return actualModel[model[model.length - 1]] = value;
}
function splitStringInModel(string){
    var swap = string;
    var cursor = 0;
    var tokens = [];
    var values = [];
    var value = "";
    var currentToken;
    while(cursor < swap.length) {
        var sub = swap.substring(cursor);
        if (sub[0] == '[') {
            values.push(value.trim());
            value = "";
            var newcurrentToken = {start: cursor,childs:[],father:currentToken||tokens};
            if(currentToken && currentToken!=tokens) {
                currentToken.childs.push(newcurrentToken);
                currentToken = newcurrentToken;
            }
            else {
                tokens.push(newcurrentToken);
                currentToken = newcurrentToken
            }
        }
        else if(sub[0] == ']'){
            values.push(value.trim());
            value = "";
            currentToken.end=cursor+1;
            currentToken = currentToken.father;
        }
        else if(sub[0] == "." && (!currentToken || currentToken==tokens)){
            value.trim() && values.push(value.trim());
            value = "";
        }
        else if(cursor == swap.length-1){
            value+=sub[0];
            values.push(value.trim());
        }
        else
            value+=sub[0];
        cursor+=1;
    }
    return values;
}

})();
(()=>{
const opener = window.opener || window.parent;
const tilepieces = opener.tilepieces;
const cssDefaultValues = tilepieces.cssDefaultValues;
const cssDefaultProperties = tilepieces.cssDefaultProperties;

window.cssDefaults = opener.tilepieces.cssDefaultValues;
window.css_rule_modification = o=>{
    var t = o.tilepiecesTemplate;
    var m = o.tilepiecesTemplateModel;
    var appView = o.appView;
    var cb = o.cbFunctionOnValueUpdate;
    var autocompleteSingleton = autocomplete(appView);
    appView.addEventListener("click",(e)=>{
        if(!e.target.classList.contains("rule-block__add-property"))
            return;
        var ruleEl = e.target.previousElementSibling;//closest(".rule-block__list");
        addProperty(ruleEl,t,m)
    });
    appView.addEventListener("click",activateKey);
    appView.addEventListener("blur",createAutocomplete,true);
    appView.addEventListener("blur",(e)=>{
        keyInpuOnBlur(e,t,m);
    },true);
    appView.addEventListener("input",valueInputOnInput);
    appView.addEventListener("blur",e=> {
        if(!e.target.classList.contains("rule-block__value"))
            return;
        updateRuleOnBlur(e.target,t,m,appView,cb);
    },true);
    appView.addEventListener("paste",e=>{
        onPaste(e,autocompleteSingleton,t,m,appView,cb);
    });
    appView.addEventListener("keydown",e=>{
        onKeyDown(e,t,m)
    });
    appView.addEventListener("change",e=>{
        if (!e.target.classList.contains("rule-block__checked"))
            return;
        checkProperty(e,cb);
    })
};
function modifyValueProperty(rule,prop,value,isStyle){
    var priority = "";
    var matchImportant = value.match(/!important/i);
    if(matchImportant) {
        value = value.substring(0,matchImportant.index) +
            value.substring(matchImportant.index+matchImportant[0].length);
        priority = "important";
    }
    if(isStyle)
        opener.tilepieces.core.htmlMatch.style(rule.rule,prop,value,priority);
    else
        opener.tilepieces.core.setCssProperty(rule.rule,prop,value,priority);
};

function activateKey(e){
    if(!e.target.classList.contains("rule-block__key") || !e.isTrusted)
        return;
    if(e.target.dataset.contenteditable) { // removing on createAutocomplete
        e.target.setAttribute("contenteditable", "");
        e.target.focus();
    }
}
function addProperty(ruleEl,t,model){
    var rule = ruleEl["__css-viewer-rule"];
    // rule.inheritedProps is css-inspector
    rule.properties.push({
        property:"",
        value:"",
        index:rule.properties.length,
        checked:true,
        isInheritedClass:rule.inheritedProps ?
            (rule.isInherited  ? "is-inherited" : "is-not-inherited") : "",
        disabled : rule.isEditable ? "" : "disabled",
        contenteditable : rule.isEditable ? "contenteditable" : ""
    });
    t.set("",model);
    var keys = ruleEl.querySelectorAll(".rule-block__key");
    var key = keys[keys.length-1];
    key.setAttribute("contenteditable","");
    key.focus();
}
function checkProperty(e,cb) {
    var target = e.target;
    var closestContainer = target.closest(".css-inspector__container");
    var ruleEl = target.closest(".rule-block__list");
    var rule = ruleEl["__css-viewer-rule"];
    var propertyBlock = target.closest(".rule__property");
    var valueEl = propertyBlock.querySelector(".rule-block__value");
    var propertyIndex = propertyBlock.dataset.index;
    var item = rule.properties[propertyIndex];
    var prop = rule.properties[propertyIndex].property;
    var value = rule.properties[propertyIndex].value;
    modifyValueProperty(rule, prop, !target.checked ? "" : value, rule.isStyle);
    var isAlreadyCachedIndex = opener.tilepieces.core.cachedProperties.findIndex(v=>v.rule == rule.rule);
    var isAlreadyCached = opener.tilepieces.core.cachedProperties[isAlreadyCachedIndex];
    if (isAlreadyCached && target.checked) {
        var indexCached = isAlreadyCached.properties.findIndex(v=>v.index == propertyIndex);
        isAlreadyCached.properties.splice(indexCached, 1);
        if (!isAlreadyCached.properties.length)
            opener.tilepieces.core.cachedProperties.splice(isAlreadyCachedIndex, 1);
    }
    else if (!isAlreadyCached) {
        item.contenteditable = "";
        item.checked = false;
        opener.tilepieces.core.cachedProperties.push({
            properties: [item],
            rule: rule.rule
        });
    }
    else {
        item.contenteditable = "";
        item.checked = false;
        isAlreadyCached.properties.push(item);
    }
    ruleEl.querySelectorAll(".input-css-placeholder").forEach(v=>v.remove());
    valueEl.dispatchEvent(new Event("blur"));
}
function createAutocomplete(e){
    var target = e.target;
    if(!target.classList.contains("rule-block__key") || !e.isTrusted)
        return;
    target.nextElementSibling.nextElementSibling.__autocomplete_suggestions =
        target.dataset.key == "font-family" ?
        tilepieces.core.fontSuggestions :
        cssDefaultValues[e.target.textContent] || [];
    target.removeAttribute("contenteditable")
}
function keyInpuOnBlur(e,t,model){
    if(!e.target.classList.contains("rule-block__key") || !e.isTrusted)
        return;
    var exprop = e.target.dataset.key;
    var value = e.target.textContent.trim();
    var ruleEl = e.target.closest(".rule-block__list");
    var rule = ruleEl["__css-viewer-rule"];
    var propertyIndex = e.target.closest(".rule__property").dataset.index;
    if(!value || cssDefaultProperties.indexOf(value)==-1) {
        var indexProp = rule.properties.length - 1;
        for ( ; indexProp >= 0; indexProp--) {
            if (indexProp != propertyIndex &&
                rule.properties[indexProp].property == exprop) {
                value = rule.properties[indexProp].value;
                break;
            }
        }
        modifyValueProperty(rule,exprop,value,rule.isStyle);
        rule.properties.splice(propertyIndex, 1);
        rule.properties.forEach((v,i)=>v.index=i);
        t.set("", model);
    }
    else if(value){
        if (value == exprop)
            return;
        rule.properties[propertyIndex].property = value;
        t.set("", model);
        if(!exprop)
            return;
        modifyValueProperty(rule,exprop,"",rule.isStyle);
        var valueStatement = e.target.nextElementSibling.nextElementSibling.textContent;
        if (!valueStatement.trim().length)
            return;
        modifyValueProperty(rule,value,valueStatement,rule.isStyle)
    }
}
function insertTextAtCursor(text,t) {
    var sel, range;
    sel = t.ownerDocument.defaultView.getSelection();
    range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(t.ownerDocument.createTextNode(text));
    var en = new KeyboardEvent("input", {bubbles : true});
    t.dispatchEvent(en);
}
function onPaste(e,autocompleteSingleton,t,model,appView,cbFunction){
    if(!e.target.classList.contains("rule-block__key") &&
        !e.target.classList.contains("rule-block__value"))
        return;
    if (e.clipboardData && e.clipboardData.getData) {
        e.preventDefault();
        var text = e.clipboardData.getData("text/plain");
        if(!text.length)
            return;
        var semicomma = text.indexOf(";");
        if(semicomma==-1){
            insertTextAtCursor(text,e.target);
        }
        else {
            var ruleEl = e.target.closest(".rule-block__list");
            var rule = ruleEl["__css-viewer-rule"];
            if(e.target.classList.contains("rule-block__value")){
                var newTextSplitted = text.slice(0,semicomma);
                insertTextAtCursor(newTextSplitted,e.target);
                text = text.slice(semicomma+1);
            }
            opener.getCssTextProperties(text).forEach(v=>{
                modifyValueProperty(rule,v.property,v.value,rule.isStyle);
            });
            if(e.target.classList.contains("rule-block__key")) {
                autocompleteSingleton.blur();
                updateRuleOnBlur(e.target,t,model,appView,cbFunction);
            }
            else
                e.target.blur();
        }
    }
}
function onKeyDown(e,t,model){
    if (e.target.classList.contains("rule-block__key")) {
        if (e.key == "Enter") {
            e.preventDefault();
            e.target.blur();
            e.target.nextElementSibling.nextElementSibling.focus();
        }
    }
    if(e.target.classList.contains("rule-block__value")){
        if (e.key == "Enter" || (e.key == "Tab" && !e.shiftKey)) {
            e.preventDefault();
            var ruleEl = e.target.closest(".rule-block__list");
            e.target.blur();
            if(e.target.parentNode.nextElementSibling){
                var key = e.target.parentNode.nextElementSibling.querySelector(".rule-block__key");
                setTimeout(()=>{
                    key.focus();
                })
            }
            else
                setTimeout(()=> {
                    addProperty(ruleEl,t,model);
                })
        }
    }
}
function updateRuleOnBlur(target,t,model,appView,cbFunction){
    var input = target;
    // this line is just for the css inspector. No time to find a more elegant way
    var closestContainer = input.closest(".css-inspector__container");
    var ruleEl = input.closest(".rule-block__list");
    var rule = ruleEl["__css-viewer-rule"];
    rule.properties = opener.getCssTextProperties(rule.rule.style.cssText).map((v,i,a)=>{
        v.index=i;
        v.checked = true;
        v.disabled = rule.isEditable ? "" : "disabled";
        v.isInheritedClass = rule.inheritedProps ?
            (v.isInherited  ? "is-inherited" : "is-not-inherited") : "";
        v.contenteditable = rule.isEditable && v.checked ? "contenteditable" : "";
        v.autocomplete_suggestions = cssDefaultValues[v.property] || [];
        return v;
    });
    var hasCachedProperties = opener.tilepieces.core.cachedProperties.find(v=>v.rule == rule.rule);
    if(hasCachedProperties){
        hasCachedProperties.properties.forEach(v=>{
            v.index = rule.properties.length;
            v.isInheritedClass = rule.inheritedProps ?
                (v.isInherited  ? "is-inherited" : "is-not-inherited") : "";
            v.disabled = rule.isEditable ? "" : "disabled";
            v.checked = false;
            v.contenteditable = rule.isEditable && v.checked ? "contenteditable" : "";
            rule.properties.push(v);
        })
    }
    t.set("", model);
    inputCss(appView);
    //strikePropertyNotApplied(closestContainer);
    cbFunction && cbFunction(closestContainer)
}
function valueInputOnInput(e){
    if(!e.target.classList.contains("rule-block__value"))
        return;
    var prop = e.target.dataset.prop;
    var ruleEl = e.target.closest(".rule-block__list");
    var rule = ruleEl["__css-viewer-rule"];
    var inputCss = e.target;
    var value = inputCss ? inputCss.innerText : "";
    var originalValue = value;
    var propertyEl = e.target.closest(".rule__property");
    var propertyIndex = propertyEl.dataset.index;
    rule.properties[propertyIndex].value = originalValue;
    modifyValueProperty(rule,prop,value,rule.isStyle);
}




})();
(()=>{
function equalsCssValues(key,valueStored,valueWritten) {
    var equal0 = valueWritten == "0" && valueStored == "0px";
    var equalWithoutQuotationsMarks = key=="font-family" &&
        valueStored.replace(/'|"/g,"") == valueWritten.replace(/'|"/g,"");
    return equal0 || equalWithoutQuotationsMarks;
}
const opener = window.opener || window.parent;
const appView = document.getElementById("css-inspector");
const vendorPrefixesToDel = /-(moz|webkit|ms|o)-/;
const app = opener.tilepieces;
let isChanging = false;
let d; // cached detail
let selectedRule = null;
let cssDefaultProperties = app.cssDefaultProperties;
let cssDefaultValues = app.cssDefaultValues;
let newRuleButton = document.getElementById("css-target-new-rule");
let deleteRuleButton = document.getElementById("css-target-delete-rule");
let mainRules = document.getElementById("main-rules");
let pseudoStates = document.getElementById("pseudo-states");
let pseudoElements = document.getElementById("pseudo-elements");
opener.addEventListener("highlight-click",setTemplate);
opener.addEventListener("edit-page",e=>{
    if(!e.detail) {
        model.isVisible = false;
        t.set("",model);
    }
});
opener.addEventListener("edit-mode",e=> {
    if(!app.editMode)
        t.set("isVisible",false)
});
opener.addEventListener("html-rendered",e=>{
    model.isVisible = false;
    t.set("",model);
});
let model = {
    cssDefaultProperties,
    isVisible : false,
    classes : [],
    rules : [],
    ancestors : [],
    menuPlusHide : "css-inspector__hide",
    menuClassHide : "css-inspector__hide",
    deleteRuleDisabled : "css-inspector__disabled",
    showPseudoStates : false,
    showPseudoElements : false,
    showMainRules : true,
    groupingRules : [],
    pseudoStates : [],
    pseudoElements : []
};
let t = new opener.TT(appView,model,{
    templates : [{
        name : "css-properties-list",
        el : document.getElementById("css-properties-list").content
    },{
        name : "css-rule",
        el : document.getElementById("css-rule").content
    }]
});
css_rule_modification({
    tilepiecesTemplate : t,
    tilepiecesTemplateModel : model,
    appView,
    cbFunctionOnValueUpdate : closestContainer=>strikePropertyNotApplied(closestContainer)
});
inputCss(appView);
if(app.elementSelected)
    setTemplate({detail:app.selectorObj});
    //opener.tilepieces.elementSelected.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
function createElementRepresentation(target) {
    var myObject = [];
    var attributes = target.attributes;
    // attribute cycle to print element
    for (var i = 0; i < attributes.length; i++)
        myObject[i] = attributes[i].nodeName.toLowerCase() + "=\"" + attributes[i].nodeValue + "\"";
    return "<" + target.tagName + " " + myObject.join(" ") + " >";
}
function mapPseudoRules(rules){
    var resObj = [];
    rules.forEach((rule,i)=>{
        var newRule = Object.assign({},rule);
        newRule.index = i;
        newRule.parentRules = [];
        newRule.selected = "";
        newRule.contenteditable = (newRule.isStyle && model.match) ||
        newRule.rule.parentStyleSheet == opener.tilepieces.core.currentStyleSheet ?
            "contenteditable" : "";
        newRule.isEditable = newRule.contenteditable == "contenteditable";
        var swapRule = newRule.rule;
        while(swapRule.parentRule){
            if(swapRule.parentRule.type==CSSRule.MEDIA_RULE)
                newRule.parentRules.unshift({type:"media",conditionText:swapRule.parentRule.conditionText});
            if(swapRule.parentRule.type==CSSRule.SUPPORTS_RULE)
                newRule.parentRules.unshift({type:"supports",conditionText:swapRule.parentRule.conditionText});
            swapRule = swapRule.parentRule;
        }
        newRule.loc = newRule.href || opener.tilepieces.core.currentDocument.location.href;
        newRule.locPop = newRule.loc.split("/").pop();
        newRule.editSelector = false;
        newRule.selectorMatch = true;
        newRule.properties = newRule.properties.map((v,i,a)=>{
            v.index=i;
            v.checked = typeof v.checked !== "undefined" ? v.checked : true;
            v.isInheritedClass = "";
            v.contenteditable = newRule.isEditable && v.checked ? "contenteditable" : "";
            v.disabled = newRule.isEditable ? "" : "disabled";
            v.autocomplete_suggestions = cssDefaultValues[v.property] || [];
            return v;
        });
        var hasCachedProperties = opener.tilepieces.core.cachedProperties.find(v=>v.rule == newRule.rule);
        if(hasCachedProperties){
            hasCachedProperties.properties.forEach(v=>{
                if(newRule.properties.find(pr=>pr.property == v.property && pr.value == v.value)){
                    var indexCached = hasCachedProperties.properties.findIndex(hc=>hc.property == v.property && hc.value == v.value);
                    hasCachedProperties.properties.splice(indexCached, 1);
                    if (!hasCachedProperties.properties.length) {
                        opener.tilepieces.core.cachedProperties.splice(opener.tilepieces.core.cachedProperties.indexOf(hasCachedProperties), 1);
                    }
                    return;
                }
                v.index = newRule.properties.length;
                v.isInheritedClass = newRule.inheritedProps ?
                    (v.isInherited  ? "is-inherited" : "is-not-inherited") : "";
                v.disabled = newRule.isEditable ? "" : "disabled";
                v.contenteditable = newRule.isEditable && v.checked ? "contenteditable" : "";
                newRule.properties.push(v);
            })
        }
        newRule.pseudos.forEach(v=>{
            var found = resObj.find(ps=>ps.name == v);
            if(!found)
                resObj.push({name : v,rules:[newRule]});
            else
                found.rules.push(newRule);
        })
    });
    return resObj.sort((a,b)=>a.name.localeCompare(b.name));
}
function mapRules(rule,index){
    var newRule = Object.assign({},rule);
    newRule.parentRules = [];
    newRule.selected = "";
    /*
    rule.contenteditable = rule.type != "external" &&
        (model.match || !rule.isStyle) ? "contenteditable" : "";*/ // TODO
    var currentStyleSheet = opener.tilepieces.core.currentStyleSheet;
    newRule.contenteditable = (newRule.isStyle && model.match) ||
        (currentStyleSheet && newRule.rule.parentStyleSheet == currentStyleSheet) ?
        "contenteditable" : "";
    newRule.isEditable = newRule.contenteditable == "contenteditable";
    var swapRule = rule.rule;
    while(swapRule.parentRule){
        if(swapRule.parentRule.type==CSSRule.MEDIA_RULE)
            newRule.parentRules.unshift({type:"media",conditionText:swapRule.parentRule.conditionText});
        if(swapRule.parentRule.type==CSSRule.SUPPORTS_RULE)
            newRule.parentRules.unshift({type:"supports",conditionText:swapRule.parentRule.conditionText});
        swapRule = swapRule.parentRule;
    }
    if(!newRule.isStyle) {
        newRule.loc = newRule.href || opener.tilepieces.core.currentDocument.location.href;
        newRule.locPop = newRule.loc.split("/").pop();
        newRule.editSelector = false;
        newRule.selectorMatch = true;
    }
    newRule.properties = newRule.properties.map((v,i,a)=>{
        v.index=i;
        v.checked = typeof v.checked !== "undefined" ? v.checked : true;
        v.disabled = newRule.isEditable ? "" : "disabled";
        v.contenteditable = newRule.isEditable && v.checked ? "contenteditable" : "";
        v.isInheritedClass = newRule.inheritedProps ?
            (v.isInherited  ? "is-inherited" : "is-not-inherited") : "";
        v.autocomplete_suggestions = cssDefaultValues[v.property] || [];
        return v;
    });
    var hasCachedProperties = opener.tilepieces.core.cachedProperties.find(v=>v.rule == newRule.rule);
    if(hasCachedProperties){
        hasCachedProperties.properties.forEach(v=>{
            if(newRule.properties.find(pr=>pr.property == v.property && pr.value == v.value)){
                var indexCached = hasCachedProperties.properties.findIndex(hc=>hc.property == v.property && hc.value == v.value);
                hasCachedProperties.properties.splice(indexCached, 1);
                if (!hasCachedProperties.properties.length) {
                    opener.tilepieces.core.cachedProperties.splice(opener.tilepieces.core.cachedProperties.indexOf(hasCachedProperties), 1);
                }
                return;
            }
            v.index = newRule.properties.length;
            v.isInheritedClass = newRule.inheritedProps ?
                (v.isInherited  ? "is-inherited" : "is-not-inherited") : "";
            v.disabled = newRule.isEditable ? "" : "disabled";
            v.contenteditable = newRule.isEditable && v.checked ? "contenteditable" : "";
            newRule.properties.push(v);
        })
    }
    newRule.index = index;
    return newRule;
}
function setTemplate(e){
    if(e && e.detail && e.detail.target.nodeType !=1){
        model.isVisible = false;
        t.set("",model);
        return;
    }
    d = e ? e.detail : d; // cached detail
    model.elementPresent = d.target;
    model.match = d.match;
    model.isVisible = true;
    //model.editingClass = "";
    model.rules = d.cssRules.cssMatches.slice(0).map(mapRules);
    model.pseudoStates = mapPseudoRules(d.cssRules.pseudoStates);
    model.pseudoElements= mapPseudoRules(d.cssRules.pseudoElements);
    model.ancestors = d.cssRules.ancestors.slice(0).map((ancestor,i)=>{
        if(ancestor.ancestorStyle)
            ancestor.ancestorstyle = mapRules(ancestor.ancestorStyle);
        ancestor.elementRepresentation=createElementRepresentation(ancestor.ancestor);
        ancestor.matches = ancestor.matches.map(mapRules);
        ancestor.index = i;
        return ancestor;
    });
    model.isVisible = true;
    model.deleteRuleDisabled="css-inspector__disabled";
    t.set("",model);
    console.log(model);
    inputCss(appView);
    [...document.querySelectorAll(".css-inspector__container")].forEach(v=>strikePropertyNotApplied(v))
}

function strikePropertyNotApplied(block){
    var selectorRules = {};
    var blocks = block.querySelectorAll(".css-inspector__rule-block");
    for(var i = 0;i<blocks.length;i++){
        var rule = blocks[i]["__css-viewer-rule"];
        var keys = blocks[i].querySelectorAll(".rule-block__key");
        for(var k = keys.length-1;k>=0;k--) {
            var parent = keys[k].parentNode;
            if(!keys[k].previousElementSibling.checked){
                parent.classList.add("css-inspector__rule-block__strike");
                continue;
            }
            var keyValue = keys[k].textContent.trim();
            var key = keyValue.replace(vendorPrefixesToDel,"");
            var value = keys[k].nextElementSibling.nextElementSibling &&
                keys[k].nextElementSibling.nextElementSibling.textContent.trim();
            if(!value)
                continue;
            var important = value && value.match(/!important/i);
            var shortHand = app.selectorObj.cssRules.isShortHand(key);
            var keyPresent = selectorRules[key] || (shortHand && selectorRules[shortHand]);
            var inherited = blocks[i].classList.contains("css-inspector__rule-block__inherited");
            var cssPropertyValue = rule.rule.style.getPropertyValue(key);
            var cssPropertyPriority = rule.rule.style.getPropertyPriority(key);
            //////////
            var isWrong = !cssPropertyValue ||
                (cssPropertyValue != value.replace(/!important/i,"").trim() &&
                !equalsCssValues(key,cssPropertyValue,value)) ||
                (inherited && parent.classList.contains("is-not-inherited"));
            var notExists = !keyPresent ||
                keyPresent.parent.closest(".css-inspector__rule-block") == blocks[i];
            /*
            var isImportantAndThereAreNotImportant =
                (keyPresent && important && !keyPresent.value.match(/!important/i) &&
                (!inherited || (keyPresent.inherited && !keyPresent.value.match(/!important/i))));*/
            var isActive = !isWrong && (notExists || cssPropertyPriority);
            if(keyPresent && isActive)
                keyPresent.parent.classList.add("css-inspector__rule-block__strike");
            if(isActive) {
                selectorRules[key] = {value, inherited, parent};
                parent.classList.remove("css-inspector__rule-block__strike");
            }
            else
                parent.classList.add("css-inspector__rule-block__strike");
        }
    }
}
// same in css-matcher\src\findPseudoStates.js
const PSEUDOSTATES = /(:hover|:active|:focus|:focus-within|:visited)(?=$|:|\s|,)/g;
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("rule-selector"))
        return;
    var ruleBlock = e.target.closest(".css-inspector__rule-block");
    if(!ruleBlock.classList.contains("selected") ||
        ruleBlock.classList.contains("css-inspector__rule-block__inherited"))
        return;
    var rule = ruleBlock["__css-viewer-rule"];
    rule.editSelector = true;
    t.set("",model);
    ruleBlock.querySelector(".rule-selector-edit").focus();
});

appView.addEventListener("blur",e=>{
    if(!e.target.classList.contains("rule-selector-edit"))
        return;
    var ruleBlock = e.target.closest(".css-inspector__rule-block");
    var rule = ruleBlock["__css-viewer-rule"];
    var el = model.elementPresent;
    var selectorText = e.target.innerText.trim();
    var selectorMatch;
    try {
        selectorMatch = el.matches(selectorText.replace(PSEUDOSTATES,""));
    }
    catch(e){
        selectorMatch = false;
    }
    if(!selectorMatch && !rule.selectorMatch){
        rule.editSelector = false;
        rule.selectorMatch = true;
    }
    else if(!selectorMatch){
        rule.selectorMatch = selectorMatch;
        e.target.focus();
    }
    else{
        //opener.tilepieces.core.deleteOrChangeCssRule(rule.rule,selectorText+"{"+rule.rule.style.cssText+"}");
        opener.tilepieces.core.setSelectorText(rule.rule,selectorText);
        model.elementPresent.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
        return;
    }
    t.set("",model);
},true);

appView.addEventListener("input",e=>{
    if(!e.target.classList.contains("rule-selector-edit"))
        return;
    var ruleBlock = e.target.closest(".css-inspector__rule-block");
    var rule = ruleBlock["__css-viewer-rule"];
    var el = model.elementPresent;
    var selectorText = e.target.innerText.trim();
    try {
        rule.selectorMatch = el.matches(selectorText.replace(PSEUDOSTATES,""));
    }
    catch(e){
        rule.selectorMatch = false;
    }
    t.set("",model);
});
deleteRuleButton.addEventListener("click",e=>{
    if(e.target.classList.contains("css-inspector__disabled"))
        return;
    var rule = selectedRule.rule;
    opener.tilepieces.core.deleteCssRule(rule);
    //opener.tilepieces.core.deleteOrChangeCssRule(rule);
    selectedRule = null;
    model.deleteRuleDisabled="css-inspector__disabled";
    d.cssRules = opener.tilepieces.core.cssMatcher(model.elementPresent,
        opener.tilepieces.core.styles.styleSheets);
    setTemplate();
});
function updateTemplateOnNewRule(){
    d.cssRules = opener.tilepieces.core.cssMatcher(model.elementPresent,
        opener.tilepieces.core.styles.styleSheets);
    setTemplate();
}
newRuleButton.addEventListener("click",e=>{
    var selectorText = opener.tilepieces.cssSelector + "{}";
    var currentStylesheet = opener.tilepieces.core.currentMediaRule || opener.tilepieces.core.currentStyleSheet;
    model.menuPlusHide = "css-inspector__hide";
    if(currentStylesheet) {
        var index = currentStylesheet.cssRules.length;
        opener.tilepieces.core.insertCssRule(currentStylesheet,selectorText,index);
        updateTemplateOnNewRule();
    }
    else {
        opener.addEventListener("cssMapper-changed",updateTemplateOnNewRule,{once:true});
        selectorText = opener.tilepieces.currentMediaRule
            ? opener.tilepieces.utils.convertGroupingRuleToSelector(
            opener.tilepieces.cssSelector,opener.tilepieces.core.currentMediaRule)
            : selectorText;
        opener.tilepieces.core.
            createCurrentStyleSheet(selectorText);
    }
});
appView.addEventListener("click",e=>{
    var ruleBlock = e.target.closest(".css-inspector__rule-block");
    if(!ruleBlock)
        return;
    var rule = ruleBlock["__css-viewer-rule"];
    if(!rule.isStyle && rule.type != "external")
        model.deleteRuleDisabled="";
    else
        model.deleteRuleDisabled="css-inspector__disabled";
    if(rule.type == "external")
        return;
    if(rule.selected)
        return;
    if(selectedRule)
        selectedRule.selected = "";
    rule.selected = "selected";
    selectedRule = rule;
    t.set("",model);
});
let togglePseudoStates = document.getElementById("toggle-pseudo-states");
let togglePseudoElements = document.getElementById("toggle-pseudo-elements");
togglePseudoStates.addEventListener("click",e=>{
    model.showMainRules = model.showPseudoStates; //? true : false;
    model.showPseudoElements = false;
    togglePseudoElements.classList.remove("pseudo-trigger-selected");
    togglePseudoStates.classList.toggle("pseudo-trigger-selected");
    model.showPseudoStates = !model.showPseudoStates;
    t.set("",model);
});
togglePseudoElements.addEventListener("click",e=>{
    model.showMainRules = model.showPseudoElements; //? true : false;
    model.showPseudoStates = false;
    togglePseudoStates.classList.remove("pseudo-trigger-selected");
    togglePseudoElements.classList.toggle("pseudo-trigger-selected");
    model.showPseudoElements = !model.showPseudoElements;
    t.set("",model);
});

})();
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
(()=>{
function addPointer($self){
    $self.gradientDOM.addEventListener("pointerdown",e=>{
        if(!e.target.classList.contains("color-stops") || $self.stopPointDragged)
            return;
        // get new array position
        var bounds = $self.colorStops.getBoundingClientRect();
        var pos = e.clientX - bounds.left;
        var colorStopsOffsets = getPxColorStopsOffsets($self);
        var newColorStopFake = {left:pos,index:-1};
        colorStopsOffsets.push(newColorStopFake);
        colorStopsOffsets.sort((a, b)=>a.left- b.left);
        var newColorStopPos = colorStopsOffsets.findIndex(el=>el==newColorStopFake);
        var previous = colorStopsOffsets[newColorStopPos-1];
        var next = colorStopsOffsets[newColorStopPos+1];
        var newColorStopColor;
        // pos : colorStops.offsetWidth = x : 100
        var percentage = Math.round((pos * 100) / bounds.width);
        if(!previous)
            newColorStopColor = next.color;
        else if(!next)
            newColorStopColor = previous.color;
        else {
            var total = next.left-previous.left;
            var posOverTwoStops = pos-previous.left;
            var ratio = posOverTwoStops / total;
            previous.color = normalizeColor(previous.color);
            next.color = normalizeColor(next.color);
            console.log(ratio,posOverTwoStops,total);
            var c = _interpolateColor(previous.color,next.color,ratio);
            newColorStopColor = "rgba("+ c.join(",")+")";
        }
        $self.model.colorStops.splice(newColorStopPos,0,{c:newColorStopColor,
            stopPos:percentage + "%"});
        $self.model.colorStops.forEach((v,i,a)=>{
            v.index=i;
            if(i == a.length-1)
                v.endPos = null;
            if(i != a.length-1) {
                v.nextColor = a[i+1].c;
                var indexPos = i + 1;
                var nextStop = a[indexPos].stopPos;
                calculateEndPos($self, v, nextStop);
            }

        });
        $self.t.set("colorStops",$self.model.colorStops);
        getImageFromModel($self)
    });
}

function calculateEndPos($self,stopPos,nextStop){
    var pos = stopPos.stopPos;
    var thisStopUnit = pos.match(cssUnitsRegex);
    var posNumber = +pos.match(numberRegex)[0];
    if(thisStopUnit[0] != "%"){
        if(thisStopUnit[0] == "px")
            posNumber = (100 * posNumber)/$self.gradientImage.offsetWidth;
        else
            posNumber = (100 * getDimension($self.gradientImage,nextStop))/$self.gradientImage.offsetWidth;
    }
    var nextStopUnit = nextStop.match(cssUnitsRegex);
    var nextStopNumber = +nextStop.match(numberRegex)[0];
    if(nextStopUnit[0] != "%"){
        if(nextStopUnit[0] == "px")
            nextStopNumber = (100 * nextStopNumber)/$self.gradientImage.offsetWidth;
        else
            nextStopNumber = (100 * getDimension($self.gradientImage,nextStop))/$self.gradientImage.offsetWidth;
    }
    stopPos.endPos = ((nextStopNumber + posNumber)/2)+"%";
    console.log(stopPos.stopPos);
}
function convertStopToPerc(pos,$self){
    var posStopUnit = pos.match(cssUnitsRegex);
    var posStopNumber = +pos.match(numberRegex)[0];
    if(posStopUnit[0] != "%"){
        if(posStopUnit[0] == "px")
            posStopNumber = (100 * posStopNumber)/$self.gradientImage.offsetWidth;
        else
            posStopNumber = (100 * getDimension($self.gradientImage,posStopNumber))/$self.gradientImage.offsetWidth;
    }
    return posStopNumber;
}
let cssColors = [
    {
        "name": "AliceBlue",
        "hex": "#F0F8FF"
    },
    {
        "name": "AntiqueWhite",
        "hex": "#FAEBD7"
    },
    {
        "name": "Aqua",
        "hex": "#00FFFF"
    },
    {
        "name": "Aquamarine",
        "hex": "#7FFFD4"
    },
    {
        "name": "Azure",
        "hex": "#F0FFFF"
    },
    {
        "name": "Beige",
        "hex": "#F5F5DC"
    },
    {
        "name": "Bisque",
        "hex": "#FFE4C4"
    },
    {
        "name": "Black",
        "hex": "#000000"
    },
    {
        "name": "BlanchedAlmond",
        "hex": "#FFEBCD"
    },
    {
        "name": "Blue",
        "hex": "#0000FF"
    },
    {
        "name": "BlueViolet",
        "hex": "#8A2BE2"
    },
    {
        "name": "Brown",
        "hex": "#A52A2A"
    },
    {
        "name": "BurlyWood",
        "hex": "#DEB887"
    },
    {
        "name": "CadetBlue",
        "hex": "#5F9EA0"
    },
    {
        "name": "Chartreuse",
        "hex": "#7FFF00"
    },
    {
        "name": "Chocolate",
        "hex": "#D2691E"
    },
    {
        "name": "Coral",
        "hex": "#FF7F50"
    },
    {
        "name": "CornflowerBlue",
        "hex": "#6495ED"
    },
    {
        "name": "Cornsilk",
        "hex": "#FFF8DC"
    },
    {
        "name": "Crimson",
        "hex": "#DC143C"
    },
    {
        "name": "Cyan",
        "hex": "#00FFFF"
    },
    {
        "name": "DarkBlue",
        "hex": "#00008B"
    },
    {
        "name": "DarkCyan",
        "hex": "#008B8B"
    },
    {
        "name": "DarkGoldenRod",
        "hex": "#B8860B"
    },
    {
        "name": "DarkGray",
        "hex": "#A9A9A9"
    },
    {
        "name": "DarkGrey",
        "hex": "#A9A9A9"
    },
    {
        "name": "DarkGreen",
        "hex": "#006400"
    },
    {
        "name": "DarkKhaki",
        "hex": "#BDB76B"
    },
    {
        "name": "DarkMagenta",
        "hex": "#8B008B"
    },
    {
        "name": "DarkOliveGreen",
        "hex": "#556B2F"
    },
    {
        "name": "DarkOrange",
        "hex": "#FF8C00"
    },
    {
        "name": "DarkOrchid",
        "hex": "#9932CC"
    },
    {
        "name": "DarkRed",
        "hex": "#8B0000"
    },
    {
        "name": "DarkSalmon",
        "hex": "#E9967A"
    },
    {
        "name": "DarkSeaGreen",
        "hex": "#8FBC8F"
    },
    {
        "name": "DarkSlateBlue",
        "hex": "#483D8B"
    },
    {
        "name": "DarkSlateGray",
        "hex": "#2F4F4F"
    },
    {
        "name": "DarkSlateGrey",
        "hex": "#2F4F4F"
    },
    {
        "name": "DarkTurquoise",
        "hex": "#00CED1"
    },
    {
        "name": "DarkViolet",
        "hex": "#9400D3"
    },
    {
        "name": "DeepPink",
        "hex": "#FF1493"
    },
    {
        "name": "DeepSkyBlue",
        "hex": "#00BFFF"
    },
    {
        "name": "DimGray",
        "hex": "#696969"
    },
    {
        "name": "DimGrey",
        "hex": "#696969"
    },
    {
        "name": "DodgerBlue",
        "hex": "#1E90FF"
    },
    {
        "name": "FireBrick",
        "hex": "#B22222"
    },
    {
        "name": "FloralWhite",
        "hex": "#FFFAF0"
    },
    {
        "name": "ForestGreen",
        "hex": "#228B22"
    },
    {
        "name": "Fuchsia",
        "hex": "#FF00FF"
    },
    {
        "name": "Gainsboro",
        "hex": "#DCDCDC"
    },
    {
        "name": "GhostWhite",
        "hex": "#F8F8FF"
    },
    {
        "name": "Gold",
        "hex": "#FFD700"
    },
    {
        "name": "GoldenRod",
        "hex": "#DAA520"
    },
    {
        "name": "Gray",
        "hex": "#808080"
    },
    {
        "name": "Grey",
        "hex": "#808080"
    },
    {
        "name": "Green",
        "hex": "#008000"
    },
    {
        "name": "GreenYellow",
        "hex": "#ADFF2F"
    },
    {
        "name": "HoneyDew",
        "hex": "#F0FFF0"
    },
    {
        "name": "HotPink",
        "hex": "#FF69B4"
    },
    {
        "name": "IndianRed ",
        "hex": "#CD5C5C"
    },
    {
        "name": "Indigo  ",
        "hex": "#4B0082"
    },
    {
        "name": "Ivory",
        "hex": "#FFFFF0"
    },
    {
        "name": "Khaki",
        "hex": "#F0E68C"
    },
    {
        "name": "Lavender",
        "hex": "#E6E6FA"
    },
    {
        "name": "LavenderBlush",
        "hex": "#FFF0F5"
    },
    {
        "name": "LawnGreen",
        "hex": "#7CFC00"
    },
    {
        "name": "LemonChiffon",
        "hex": "#FFFACD"
    },
    {
        "name": "LightBlue",
        "hex": "#ADD8E6"
    },
    {
        "name": "LightCoral",
        "hex": "#F08080"
    },
    {
        "name": "LightCyan",
        "hex": "#E0FFFF"
    },
    {
        "name": "LightGoldenRodYellow",
        "hex": "#FAFAD2"
    },
    {
        "name": "LightGray",
        "hex": "#D3D3D3"
    },
    {
        "name": "LightGrey",
        "hex": "#D3D3D3"
    },
    {
        "name": "LightGreen",
        "hex": "#90EE90"
    },
    {
        "name": "LightPink",
        "hex": "#FFB6C1"
    },
    {
        "name": "LightSalmon",
        "hex": "#FFA07A"
    },
    {
        "name": "LightSeaGreen",
        "hex": "#20B2AA"
    },
    {
        "name": "LightSkyBlue",
        "hex": "#87CEFA"
    },
    {
        "name": "LightSlateGray",
        "hex": "#778899"
    },
    {
        "name": "LightSlateGrey",
        "hex": "#778899"
    },
    {
        "name": "LightSteelBlue",
        "hex": "#B0C4DE"
    },
    {
        "name": "LightYellow",
        "hex": "#FFFFE0"
    },
    {
        "name": "Lime",
        "hex": "#00FF00"
    },
    {
        "name": "LimeGreen",
        "hex": "#32CD32"
    },
    {
        "name": "Linen",
        "hex": "#FAF0E6"
    },
    {
        "name": "Magenta",
        "hex": "#FF00FF"
    },
    {
        "name": "Maroon",
        "hex": "#800000"
    },
    {
        "name": "MediumAquaMarine",
        "hex": "#66CDAA"
    },
    {
        "name": "MediumBlue",
        "hex": "#0000CD"
    },
    {
        "name": "MediumOrchid",
        "hex": "#BA55D3"
    },
    {
        "name": "MediumPurple",
        "hex": "#9370DB"
    },
    {
        "name": "MediumSeaGreen",
        "hex": "#3CB371"
    },
    {
        "name": "MediumSlateBlue",
        "hex": "#7B68EE"
    },
    {
        "name": "MediumSpringGreen",
        "hex": "#00FA9A"
    },
    {
        "name": "MediumTurquoise",
        "hex": "#48D1CC"
    },
    {
        "name": "MediumVioletRed",
        "hex": "#C71585"
    },
    {
        "name": "MidnightBlue",
        "hex": "#191970"
    },
    {
        "name": "MintCream",
        "hex": "#F5FFFA"
    },
    {
        "name": "MistyRose",
        "hex": "#FFE4E1"
    },
    {
        "name": "Moccasin",
        "hex": "#FFE4B5"
    },
    {
        "name": "NavajoWhite",
        "hex": "#FFDEAD"
    },
    {
        "name": "Navy",
        "hex": "#000080"
    },
    {
        "name": "OldLace",
        "hex": "#FDF5E6"
    },
    {
        "name": "Olive",
        "hex": "#808000"
    },
    {
        "name": "OliveDrab",
        "hex": "#6B8E23"
    },
    {
        "name": "Orange",
        "hex": "#FFA500"
    },
    {
        "name": "OrangeRed",
        "hex": "#FF4500"
    },
    {
        "name": "Orchid",
        "hex": "#DA70D6"
    },
    {
        "name": "PaleGoldenRod",
        "hex": "#EEE8AA"
    },
    {
        "name": "PaleGreen",
        "hex": "#98FB98"
    },
    {
        "name": "PaleTurquoise",
        "hex": "#AFEEEE"
    },
    {
        "name": "PaleVioletRed",
        "hex": "#DB7093"
    },
    {
        "name": "PapayaWhip",
        "hex": "#FFEFD5"
    },
    {
        "name": "PeachPuff",
        "hex": "#FFDAB9"
    },
    {
        "name": "Peru",
        "hex": "#CD853F"
    },
    {
        "name": "Pink",
        "hex": "#FFC0CB"
    },
    {
        "name": "Plum",
        "hex": "#DDA0DD"
    },
    {
        "name": "PowderBlue",
        "hex": "#B0E0E6"
    },
    {
        "name": "Purple",
        "hex": "#800080"
    },
    {
        "name": "RebeccaPurple",
        "hex": "#663399"
    },
    {
        "name": "Red",
        "hex": "#FF0000"
    },
    {
        "name": "RosyBrown",
        "hex": "#BC8F8F"
    },
    {
        "name": "RoyalBlue",
        "hex": "#4169E1"
    },
    {
        "name": "SaddleBrown",
        "hex": "#8B4513"
    },
    {
        "name": "Salmon",
        "hex": "#FA8072"
    },
    {
        "name": "SandyBrown",
        "hex": "#F4A460"
    },
    {
        "name": "SeaGreen",
        "hex": "#2E8B57"
    },
    {
        "name": "SeaShell",
        "hex": "#FFF5EE"
    },
    {
        "name": "Sienna",
        "hex": "#A0522D"
    },
    {
        "name": "Silver",
        "hex": "#C0C0C0"
    },
    {
        "name": "SkyBlue",
        "hex": "#87CEEB"
    },
    {
        "name": "SlateBlue",
        "hex": "#6A5ACD"
    },
    {
        "name": "SlateGray",
        "hex": "#708090"
    },
    {
        "name": "SlateGrey",
        "hex": "#708090"
    },
    {
        "name": "Snow",
        "hex": "#FFFAFA"
    },
    {
        "name": "SpringGreen",
        "hex": "#00FF7F"
    },
    {
        "name": "SteelBlue",
        "hex": "#4682B4"
    },
    {
        "name": "Tan",
        "hex": "#D2B48C"
    },
    {
        "name": "Teal",
        "hex": "#008080"
    },
    {
        "name": "Thistle",
        "hex": "#D8BFD8"
    },
    {
        "name": "Tomato",
        "hex": "#FF6347"
    },
    {
        "name": "Turquoise",
        "hex": "#40E0D0"
    },
    {
        "name": "Violet",
        "hex": "#EE82EE"
    },
    {
        "name": "Wheat",
        "hex": "#F5DEB3"
    },
    {
        "name": "White",
        "hex": "#FFFFFF"
    },
    {
        "name": "WhiteSmoke",
        "hex": "#F5F5F5"
    },
    {
        "name": "Yellow",
        "hex": "#FFFF00"
    },
    {
        "name": "YellowGreen",
        "hex": "#9ACD32"
    }
]
function degFromAngleDeclaration(dec){
    var angle = dec.match(angleTypes);
    var number = Number(dec.match(numberRegex)[0]);
    switch(angle[0]){
        case "rad":
            return Math.round(number * (180 / Math.PI));
        case "turn":
            return number*360;
        case "grad":
            return Math.round((360 * number)/400);
    }
    console.log("pos number",number);
    if(number<0)
        return 180-Math.abs(number)-(360*Math.trunc(Math.abs(number)/360));
    if(number>360)
        return number-(360*Math.trunc(number/360));
    return number;
}
function dragStopEnds($self){
    let pos1,pos2,left,bounds;
    $self.colorInterpolationSlider.addEventListener("pointerdown",e=>{
        var colorInterpolationEl = e.target.closest(".color-interpolation");
        if(!colorInterpolationEl ||
            $self.stopPointDragged)
            return;
        $self.stopPointDragged = colorInterpolationEl;
        bounds = $self.gradientDOM.getBoundingClientRect();
        left = $self.stopPointDragged.offsetLeft;
        pos1 = e.clientX;
        $self.gradientDOM.ownerDocument.addEventListener("pointermove",move);
        $self.gradientDOM.ownerDocument.addEventListener("pointerup",up);
    });
    function move(e) {
        pos2 = e.clientX - pos1;
        pos1 = e.clientX;
        left += pos2;
        var percentage = Math.round((left * 100) / bounds.width) + "%";
        var index = +$self.stopPointDragged.dataset.index;
        $self.model.colorStops[index].endPos = percentage;
        getImageFromModel($self)
    }
    function up(e){
        $self.stopPointDragged=null;
        $self.gradientDOM.ownerDocument.removeEventListener("pointermove",move);
        $self.gradientDOM.ownerDocument.removeEventListener("pointerup",up);
    }

}
let padding = 12; //color-stops has padding of 12px;
function moveColorStops($self){
    let pos1,pos2,X,left,bounds,movedOffset;
    var colorStopsOffsets = [];
    $self.colorStops.addEventListener("pointerdown",e=>{
        if(!e.target.classList.contains("color-stop-dragger") ||
            $self.stopPointDragged)
            return;
        $self.stopPointDragged = e.target.closest(".color-stop");
        $self.model.canAdd = "";
        document.documentElement.classList.add("dragGradient");
        bounds = $self.gradientDOM.getBoundingClientRect();
        left = $self.stopPointDragged.offsetLeft+padding;
        pos1 = e.clientX;
        colorStopsOffsets = getPxColorStopsOffsets($self);
        var index = +$self.stopPointDragged.dataset.index;
        $self.model.colorStops[index].endPos = null;
        if($self.model.colorStops[index-1])
            $self.model.colorStops[index-1].endPos = null;
        e.target.setPointerCapture(e.pointerId);
        //$self.gradientDOM.ownerDocument.addEventListener("pointermove",move);
        //$self.gradientDOM.ownerDocument.addEventListener("pointerup",up);
        e.target.addEventListener("pointermove",move);
        e.target.addEventListener("pointerup",up);
        e.preventDefault();
    });
    function move(e) {
        pos2 = e.clientX - pos1;
        pos1 = e.clientX;
        left += pos2;
        var percentage = Math.round((left * 100) / bounds.width) + "%";
        var index = +$self.stopPointDragged.dataset.index;
        movedOffset = index;
        /* if we are not in the same position than before*/
        var thisStop = colorStopsOffsets.find(v=>v.index == index);
        thisStop.left = left;
        colorStopsOffsets.sort((a, b)=>a.left - b.left);
        var newColorStopPos = colorStopsOffsets.findIndex(el=>el == thisStop);
        if (newColorStopPos != index) {
            var swap1 = JSON.stringify($self.model.colorStops[newColorStopPos]);
            $self.model.colorStops[newColorStopPos] = $self.model.colorStops[index];
            $self.model.colorStops[index] = JSON.parse(swap1);
            var swap2 = JSON.stringify(colorStopsOffsets[newColorStopPos]);
            colorStopsOffsets[newColorStopPos] = colorStopsOffsets[index];
            colorStopsOffsets[index] = JSON.parse(swap2);
            $self.model.colorStops[newColorStopPos].stopPos = percentage;
            //model.colorStops.forEach((v,i)=>v.index=i);
            $self.stopPointDragged.dataset.index = newColorStopPos;
            colorStopsOffsets.forEach((v, i)=>v.index = i);
            movedOffset = newColorStopPos;
        }
        else
            $self.model.colorStops[index].stopPos = percentage;
        getImageFromModel($self)
    }
    function up(e){
        $self.stopPointDragged=null;
        $self.model.canAdd = "canAdd";
        document.documentElement.classList.remove("dragGradient");
        //$self.gradientDOM.ownerDocument.removeEventListener("pointermove",move);
        //$self.gradientDOM.ownerDocument.removeEventListener("pointerup",up);
        e.target.removeEventListener("pointermove",move);
        e.target.removeEventListener("pointerup",up);
        $self.model.colorStops.forEach((v,i,a)=>{
            v.index=i;
            if(i != a.length-1)
                v.nextColor = a[i + 1].c;
            if(!v.endPos && i != a.length-1){
                var indexPos = i+1;
                var nextStop = a[indexPos].stopPos;
                calculateEndPos($self,v,nextStop);
            }
            if(i == a.length-1)
                v.endPos = null;
        });
        $self.t.set("",$self.model);
        e.target.releasePointerCapture(e.pointerId)
    }

}
function getAngleFromParameters(parameters){
    var p = parameters;
    var matchSideOrCorner = p.match(sideOrCorner);
    var angle = 180;
    if(matchSideOrCorner) {
        var token = "";
        while (matchSideOrCorner) {
            token += matchSideOrCorner[0];
            p = p.substring(matchSideOrCorner.index + matchSideOrCorner[0].length);
            matchSideOrCorner = p.match(sideOrCorner);
        }
        angle = token ? sideOrCornerMap[token] : 180;
    }
    else
        angle = degFromAngleDeclaration(parameters);
    return angle;
}
function getDimension(el,cssString,property="width"){
    var old = el.style.getPropertyValue(property);
    var win = el.ownerDocument.defaultView;
    el.style.setProperty(property,cssString,"important");
    var px = +(win.getComputedStyle(el,null)[property].replace("px",""));
    el.style.setProperty(property,old);
    return px;
}
let colorRegexFunctions = "rgb\\([^)]*\\)|rgba\\([^)]*\\)|#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})|hsl\\([^)]*\\)|hsla\\([^)]*\\)";
let cssColorRegex = cssColors.map(v=>v.name).join("|");
let colorRegex = new RegExp(colorRegexFunctions+"|"+cssColorRegex,"i");
function getGradientStops(arr,gradientType){
    var parameters = "";
    if(arr[0] && !arr[0].match(colorRegex)) {
        parameters = arr[0];
        arr.splice(0, 1);
    }
    else{
        if(gradientType == "linear-gradient"){
            parameters = "180deg"
        }
    }
    var colorStops = arr.reduce((acc,v,i,a)=>{
        var cMatch = v.trim().match(colorRegex);
        var color = cMatch && cMatch[0];
        if(color) {
            var isNameColor = cssColors.find(cssc=>cssc.name.toLocaleLowerCase() == color.toLowerCase());
            if (isNameColor)
                color = isNameColor.hex;
        }
        var stop = cMatch ? v.replace(cMatch[0],"").trim() : v.trim();
        var endPos = null;
        if(!color) {
            acc[acc.length-1].endPos = stop;
            return acc;
        }
        if(!stop){
            if(i==0)
                stop = "0%";
            else if(i==a.length-1)
                stop = "100%";
        }
        acc.push({c:color,stopPos:stop,endPos,index:acc.length});
        return acc;
    },[]);
    return {parameters,colorStops,gradientType}
}
function getImageFromModel($self){
    var model = $self.model;
    var func = model.gradientType;
    var p = model.parameters?model.parameters+",":"";
    var colorStopsForG = model.colorStops.map((cs,i,a)=>cs.c + " " + cs.stopPos+
    (cs.endPos && i!=a.length-1?","+cs.endPos:"")).join(",");
    var dec = func+"("+p+colorStopsForG+")";
    model.declarationForView = `linear-gradient(90deg,${colorStopsForG})`;
    $self.t.set("declarationForView",model.declarationForView);
    $self.gradientDOM.dispatchEvent(new CustomEvent("gradient-change",{
        detail : dec
    }));
}
function getPxColorStopsOffsets($self){
    var colorStops = $self.colorStops.querySelectorAll(".color-stop");
    return [...colorStops].map(cs=>{
        return {
            left:cs.offsetLeft,
            index:cs.dataset.index,
            color:cs.dataset.color
        }}).sort((a, b)=>a.left- b.left);
}
function handleParamsChange($self){
    $self.parameters.addEventListener("input",e=>{
        $self.model.parameters = $self.parameters.innerText;
        getImageFromModel($self);
        if($self.model.gradientType == "linear-gradient" ||
            $self.model.gradientType == "repeating-linear-gradient"){
            var newAngle = getAngleFromParameters($self.model.parameters)
            $self.knob.set(newAngle);
        }
    });
    $self.gradientDOM.addEventListener("gradientType",e=>{
        $self.model.parameters = "";
        $self.parameters.textContent = "";
        $self.model.gradientType = e.detail.target.value;
        $self.model.knobIsVisible = $self.model.gradientType == "linear-gradient" ||
            $self.model.gradientType == "repeating-linear-gradient";
        $self.t.set("",$self.model);
        getImageFromModel($self)
    });
    $self.colorStops.addEventListener("click",e=>{
        if(!e.target.classList.contains("color-stop-button"))
            return;
        var color = e.target.style.backgroundColor;
        var index = +e.target.dataset.index;
        opener.tilepieces.colorPicker(color).onChange(c=>{
            var newColor = c.rgba[3] < 1 ? c.rgbaString : c.rgbString;
            $self.model.colorStops[index].c = newColor;
            if(index>0)
                $self.model.colorStops[index-1].nextColor = newColor;
            $self.t.set("", $self.model);
            getImageFromModel($self);
        })
    })
}
function hexToRGBA(hex) {
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        var c;
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return [(c>>16)&255, (c>>8)&255, c&255,1];
    }
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16),
        a = hex.slice(7, 9) ? parseInt(hex.slice(7, 9), 16) : 255;

    return [r,g,b,(a/255)];
    //return "rgba(" + r + ", " + g + ", " + b + ", " + (a/255) + ")";
}
// https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
function hslToRgba(h, s, l,a = 1){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255),a];
}
// https://codepen.io/njmcode/pen/axoyD?editors=0010
// Interpolates two [r,g,b] colors and returns an [r,g,b] of the result
// Taken from the awesome ROT.js roguelike dev library at
// https://github.com/ondras/rot.js
var _interpolateColor = function(color1, color2, factor) {
    if (arguments.length < 3) { factor = 0.5; }
    var result = color1.slice();
    for (var i=0;i<3;i++)
        result[i] = Math.round(result[i] + factor*(color2[i]-color1[i]));
    result[3]= color1[3];
    if(color1[3]!=color2[3])
        result[3] = (color1[3] + color2[3])*factor;
    return result;
};
function DOMKnob(DOMel){
    var $self = this;
    $self.knob = DOMel;
    $self.centerX = 0;
    $self.centerY = 0;
    $self.UP = false;
    $self.changeCbs = [];
    $self.onChange = cb=>{
        $self.changeCbs.push(cb);
    };
    $self.set=degrees=>{
        $self.knob.style.transform = "rotate("+degrees+"deg)";
    }
    $self.bounds = {};
    function calculateAngle(x,y){
        return Math.atan((x-$self.centerX)/(y-$self.centerY));// * (180 / Math.PI)
    }
    function start(e){
        $self.UP = true;
        $self.bounds = $self.knob.getBoundingClientRect();
        $self.centerX = $self.bounds.left + ($self.bounds.width/2);
        $self.centerY = $self.bounds.top + ($self.bounds.height/2);
        knobRotation(e);
        $self.knob.ownerDocument.addEventListener("pointermove",knobRotation);
        $self.knob.ownerDocument.addEventListener("pointerup",release);
    }
    function knobRotation(e){
        if(!$self.UP)
            return;
        var angle = calculateAngle(e.clientX,e.clientY);
        var topRight = e.clientX>=$self.centerX && e.clientY<$self.centerY;
        var bottomRight = e.clientX>=$self.centerX && e.clientY>=$self.centerY;
        var bottomLeft = e.clientX<$self.centerX && e.clientY>=$self.centerY;
        var topLeft = e.clientX<$self.centerX && e.clientY<$self.centerY;
        var angleInDeg = Math.round(angle * (180 / Math.PI));
        if(topRight)
            angleInDeg = -(angleInDeg);
        else if(bottomRight)
            angleInDeg = 180 - angleInDeg;
        else if(bottomLeft)
            angleInDeg = 180 - angleInDeg;
        else if(topLeft)
            angleInDeg = 360 - angleInDeg;
        $self.knob.style.transform = "rotate("+ angleInDeg+"deg)";
        $self.changeCbs.forEach(cb=>cb(angleInDeg));

    }
    function release(){
        if($self.UP)
            $self.UP = false;
        $self.knob.ownerDocument.removeEventListener("pointermove",knobRotation);
        $self.knob.ownerDocument.removeEventListener("pointerup",release);
    }
    $self.knob.addEventListener("pointerdown",start);
    return $self;
}
const rgbaRegex = /rgb.?\(([^)]*)\)/;
const hslRegex = /hsl.?\(([^)]*)\)/;
const hexRegex = /#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})/;
const numberRegex = /[+-]?\d+(?:\.\d+)?|[+-]?\.\d+?/;
const numberRegexGlobal = /[+-]?\d+(?:\.\d+)?|[+-]?\.\d+?/g;
const angleTypes = /deg(\s|$)|rad(\s|$)|turn(\s|$)|grad(\s|$)/;
const numAndValueRegex = /([+-]?\d+(?:\.\d+)?|[+-]?\.\d+?)(em|ex|ch|rem|vh|vw|vmin|vmax|cm|mm|in|px|pt|pc|fr|%)/;
const cssUnitsRegex = /em|ex|ch|rem|vh|vw|vmin|vmax|cm|mm|in|px|pt|pc|fr|%/;
//let colorRegex = /rgb\([^)]*\)|rgba\([^)]*\)|#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})\b|hsl\([^)]*\)|hsla\([^)]*\)/g;
let parenthesisToAvoid = /rgb\([^)]*\)|rgba\([^)]*\)|hsl\([^)]*\)|hsla\([^)]*\)|url\([^)]*\)/;
let sideOrCorner = /top|bottom|left|right/;
let sideOrCornerMap = {
    top : 0,
    left : 270,
    right : 90,
    bottom : 180,
    topleft : 315,
    topright : 45,
    bottomright : 135,
    bottomleft : 225
};
let opener = window.opener || window.parent || window.top;
let app =opener.app;
let TT = opener.TT;
function GradientView(view,model,noInputCss){
    this.gradientDOM = view;
    this.noInputCss = noInputCss;
    this.gradientImage = this.gradientDOM.querySelector(".gradient-image");
    this.colorStops = this.gradientDOM.querySelector(".color-stops");
    this.colorInterpolationSlider = this.gradientDOM.querySelector(".color-interpolation-slider");
    this.parameters = this.gradientDOM.querySelector(".parameters");
    var knobEl = this.gradientDOM.querySelector(".knob");
    this.knob= new DOMKnob(knobEl);
    this.model = model ? adjustModel(model,this) : {
            parameters : "",
            colorStops : [],
            declarationForView : "",
            gradientType : ""
    };
    this.parameters.textContent = this.model.parameters;
    this.stopPointDragged = false;
    this.t = new TT(view,this.model);
    removePointerEvents(this);
    addPointer(this);
    moveColorStops(this);
    dragStopEnds(this);
    handleParamsChange(this);
    this.knob.onChange(degree=>{
        if(!this.model.declarationForView)
            return;
        this.t.set("parameters",degree + "deg");
        this.parameters.dispatchEvent(new Event("blur"));
        //this.parameters.textContent = degree + "deg";
        getImageFromModel(this)
    });
    return this;
};
window.gradientView = function(view,model){
    return new GradientView(view,model)
};
let linearGradientRegex = /linear-gradient\(([^)]*)\)|repeting-linear-gradient\(([^)]*)\)|radial-gradient\(([^)]*)\)|repeting-radial-gradient\(([^)]*)\)/;
let gradientsName = /linear-gradient|repeting-linear-gradient|radial-gradient|repeting-radial-gradient/;
function matchGradients(cssBackgroundStyle){
    // first, change all rgb[a],hls[a] removing commas and parenthesis with another character
    var s = cssBackgroundStyle;
    var m = s.match(parenthesisToAvoid);
    var st = 0;
    while(m){
        cssBackgroundStyle = cssBackgroundStyle.substring(0,st + m.index) +
            m[0].replace(/\(/g,"[").replace(/\)/g,"]").replace(/,/g,"?") + cssBackgroundStyle.substring(st + m.index + m[0].length);
        st = st + m.index + m[0].length;
        s = s.substring(m.index + m[0].length);
        m = s.match(parenthesisToAvoid);
    }
    // then match gradients;
    var gradients = [];
    var gradient = cssBackgroundStyle.match(linearGradientRegex);
    while(gradient){
        s = gradient[1];
        var g = gradient[1].replace(/\[/g,"(").replace(/]/g,")");
        var gradientParameters = g.split(",").map(v=>v.replace(/\?/g,","));
        var gradientType = gradient[0].match(gradientsName)[0];
        var gradientDecompiled = getGradientStops(gradientParameters,gradientType);
        gradientDecompiled.declarationForView = `linear-gradient(90deg,${gradientParameters.join(",")})`;
        gradients.push(gradientDecompiled);
        cssBackgroundStyle = cssBackgroundStyle.substring(gradient.index + gradient[0].length);
        gradient = cssBackgroundStyle.match(linearGradientRegex);
    }
    return gradients
}
window.matchGradients = matchGradients;
function normalizeColor(c) {
    if (!c.match(rgbaRegex)) {
        if (c.match(hexRegex))
            c = hexToRGBA(c);
        if (c.match(hslRegex))
            c = hslToRgba(c.match(numberRegexGlobal).map(n=>+n));
    }
    else {
        c = c.match(numberRegexGlobal).map(n=>+n);
        if (typeof c[3] === "undefined")
            c[3] = 1;
    }
    return c;
}
function removePointerEvents($self) {
    $self.colorStops.addEventListener("pointerdown", e=> {
        if (!e.target.classList.contains("remove-color-stop") || $self.stopPointDragged)
            return;
        $self.model.colorStops.splice(+e.target.dataset.index, 1);
        $self.model.colorStops.forEach((v, i,a)=>{
            v.index = i;
            if(i == a.length-1)
                v.endPos = null;
            if(i != a.length-1) {
                v.nextColor = a[i+1].c;
                var indexPos = i + 1;
                var nextStop = a[indexPos].stopPos;
                calculateEndPos($self, v, nextStop);
            }
        });
        $self.t.set("colorStops", $self.model.colorStops);
        getImageFromModel($self)
    });
}
function adjustModel(newModel,$self){
    if(newModel.gradientType == "linear-gradient" || newModel.gradientType == "repeating-linear-gradient"){
        newModel.knobIsVisible = true;
        var angle = getAngleFromParameters(newModel.parameters);
        newModel.linearGradientAngle =angle;
        $self.knob.set(angle)
    }
    else{ // isRadial
        newModel.knobIsVisible = false;
    }
    // fill colorStops
    newModel.colorStops = newModel.colorStops.map((v,i,a)=>{
        if(!v.stopPos){
            var indexFindPrevious = i-1;
            var previousStop = a[indexFindPrevious];
            while(!previousStop.stopPos && indexFindPrevious>-1){
                indexFindPrevious--;
                previousStop = a[indexFindPrevious]
            }
            var perc1 = convertStopToPerc(previousStop.stopPos,$self);
            var indexFindNext = i+1;
            var nextStop = a[indexFindNext];
            var nextStopsWithout = 1;
            while(!nextStop.stopPos && indexFindNext>-1){
                indexFindNext++;
                nextStopsWithout++;
                nextStop = a[indexFindNext];
            }
            var total = nextStopsWithout+1;
            var perc2 = convertStopToPerc(nextStop.stopPos,$self);
            v.stopPos = (perc1 + ((perc2 - perc1) / total))+"%";
        }
        return v;
    })
        .map((v,i,a)=>{// fill colorEnd
            if(!v.endPos && i != a.length-1){
                var indexPos = i+1;
                var nextStop = a[indexPos].stopPos;
                calculateEndPos($self,v,nextStop);
            }
            if(i != a.length-1)
                v.nextColor = a[i+1].c;
            return v;
        });
    newModel.canAdd = "canAdd";
    return newModel;
}
GradientView.prototype.set = function(newModel){
    var $self = this;
    this.model = adjustModel(newModel,$self);
    this.t.set("",this.model);
    //if($self.parameters.ownerDocument.activeElement != $self.parameters)
        $self.parameters.textContent = $self.model.parameters;
    !this.noInputCss && inputCss(this.gradientDOM);
}

})();
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
function SVGtoXY(svg){
    var svgBounds = svg.getBoundingClientRect();
    var circleTest = svg.querySelector(".circle-test");
    var lineTest = svg.querySelector(".line-test");
    var onChangeListeners = [];
    var drag = __drag(circleTest,{noBorderWindowEscape:true});
    var X = svgBounds.width / 2,
        Y = svgBounds.height / 2,pos1,pos2,pos3,pos4,UP;
    svg.addEventListener("mouseup",e=>{
        svgBounds = svg.getBoundingClientRect();
        if(e.target!=circleTest && !UP) {
            X = e.clientX - svgBounds.left;
            Y = e.clientY - svgBounds.top;
            circleTest.setAttribute("cx", X);
            circleTest.setAttribute("cy", Y);
            lineTest.setAttribute("x2",X);
            lineTest.setAttribute("y2",Y);
            onChangeListeners.forEach(func=>func(X,Y))
        }
    })
    drag.on("down", function (e) {
        e.ev.preventDefault();
        // get the mouse cursor position at startup:
        svgBounds = svg.getBoundingClientRect();
        pos3 = e.x;
        pos4 = e.y;
        UP = true;
    })
    .on("move", function (e) {
        e.ev.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.x;
        pos2 = pos4 - e.y;
        pos3 = e.x;
        pos4 = e.y;
        X = X - pos1;
        Y = Y - pos2;
        if(X >= svgBounds.width) {
            X = svgBounds.width;
        }
        if(X <= 0) {
            X = 0;
        }
        if(Y <= 0){
            Y = 0;
        }
        if(Y >= svgBounds.height){
            Y = svgBounds.height;
        }
        circleTest.setAttribute("cx", X);
        circleTest.setAttribute("cy", Y);
        lineTest.setAttribute("x2",X);
        lineTest.setAttribute("y2",Y);
        onChangeListeners.forEach(func=>func(X,Y))
    })
    .on("up",e=>UP = false);
    return {
        target : svg,
        onChange : (f)=>{
            onChangeListeners.push(f)
        },
        setXY : (x,y)=>{
            X = x;
            Y = y;
            circleTest.setAttribute("cx", X);
            circleTest.setAttribute("cy", Y);
            lineTest.setAttribute("x2",X);
            lineTest.setAttribute("y2",Y);
        }
    }
}
(()=>{
const opener = window.opener || window.parent;
const app = opener.app;
window.cssDefaults = opener.tilepieces.cssDefaultValues;
const ftWysiwyg = opener.ftWysiwyg;
const appView = document.getElementById("border-style");
const urlPlaceholder = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=)";
const gradientEl = appView.querySelector(".gradient");
let gradientObject = gradientView(gradientEl);
let shadows = [];
let model = {
    isVisible : false,
    boxShadows : []
};
let t = new opener.TT(appView,model);
autocomplete(appView);
if(opener.tilepieces.elementSelected)
    setTemplate({detail:opener.tilepieces.cssSelectorObj});
opener.addEventListener("highlight-click",setTemplate);
opener.addEventListener("edit-mode",e=> {
    if(!opener.tilepieces.editMode)
        t.set("isVisible",false);
});
tilepieces_tabs({
    el : document.getElementById("tab-border")
});
appView.addEventListener("borderImageInput",e=>{
    var target = e.detail.target;
    opener.tilepieces.utils.processFile(target.files[0]).then(res=>{
        if(res)
            setCss("border-image-source",res);
    })
});
appView.addEventListener("template-digest",e=>{
    var target = e.detail.target;
    if(target.dataset.shadow){
        if(target.dataset.bind=="boxShadowValue.blurToSlider")
            model.boxShadows[target.dataset.index][target.dataset.shadow] = target.value;
        model.boxShadow = setShadow();
        t.set("",model);
        inputCss(appView);
        if(target.dataset.shadow.startsWith("offset")) {
            var offsetX = model.boxShadows[target.dataset.index].offsetX;
            var offsetY = model.boxShadows[target.dataset.index].offsetY;
            var svg = appView.querySelector(".shadow[data-index='" + target.dataset.index + "'] svg");
            var isAlreadyShadow = shadows.find(v=>v.target == svg);
            isAlreadyShadow.setXY((offsetX * 5)+100,(offsetY * 5)+100);
        }
    }
},true);

appView.addEventListener("css-input-set-text",e=> {
    if (!e.target.classList.contains("input-css") ||
        e.target.dataset.cssPropJs!="boxShadow")
        return;
    mapBoxShadow(e.target.innerText.trim());
    t.set("",model);
    setBoxShadowSVGtoXY()
},true);
/*
appView.addEventListener("blur",e=>{
    var target = e.target;
    if(target.dataset.textShadow){

    }
},true);*/
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("add-box-shadow"))
        return;
    model.boxShadows.push({
        index : model.boxShadows.length,
        type : "outset",
        color : "rgb(0,0,0)",
        offsetX : 0,
        offsetY : 0,
        blur : 0,
        spread : 0
    });
    model.boxShadow = setShadow();
    t.set("",model);
    inputCss(appView);
    setBoxShadowSVGtoXY();
});
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("remove-box-shadow"))
        return;
    var index = +e.target.dataset.index;
    model.boxShadows.splice(index,1);
    model.boxShadow = setShadow();
    if(!model.textShadow)
        model.elementPresent.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
    else {
        t.set("", model);
        inputCss(appView);
    }
});
appView.addEventListener("imageType",e=>{ // change from gradient to url
    var value = e.detail.target.value;
    var imageSource;
    if(value=="none")
        imageSource = value;
    else
        imageSource = value=="url" ? urlPlaceholder : "linear-gradient(" + model.realBorderColor + "," + model.realBorderColor + ")";
    setCss("border-image-source",imageSource);
    model.elementPresent.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
},true);
var throttleGradientChange;
gradientEl.addEventListener("gradient-change",e=>{
    clearTimeout(throttleGradientChange);
    throttleGradientChange = setTimeout(()=> {
        var value = e.detail;
        model.borderImageSource = setCss("border-image-source", value);
        t.set("", model);
        inputCss(appView);
    });
});
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("color-button"))
        return;
    var target = e.target;
    var cssProperty = target.dataset.cssProp;
    opener.tilepieces.colorPicker(target.style.backgroundColor).onChange(c=>{
        target.style.backgroundColor = c.hex;
        if(cssProperty) {
            model[target.dataset.name] = c.hex;
            model[target.dataset.cssPropJs] = setCss(cssProperty, c.hex);
        }
        else {
            model.boxShadows[target.dataset.index].color = c.hex;//TODO change with preference
            model.textShadow = setShadow(model.boxShadows);
        }
        t.set("",model);
        inputCss(appView)
    })
});
/*
appView.addEventListener("input",e=>{
    var target = e.target;
    var inputCss = target.querySelector(".input-css");
    if(!inputCss)
        return;
    var cssProp = target.dataset.cssProperty;
    if(!cssProp)
        return;
    setCss(cssProp, inputCss.textContent);
},true);*/
appView.addEventListener("blur",e=> {
    if (!e.target.classList.contains("input-css"))
        return;
    if(!e.target.dataset.cssProp)
        return;
    if(e.target.dataset.value == e.target.innerText)
        return;
    model.elementPresent.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
},true);
appView.addEventListener("input",e=>{
    var target = e.target;
    if(!target.classList.contains("input-css"))
        return;
    var prop = target.dataset.cssProp;
    if(prop){
        var value = target.innerText;
        var newSetted = setCss(prop, value);
    }
},true);
appView.addEventListener("css-input-set-text",e=> { // handle borders changes
    if (!e.target.classList.contains("input-css"))
        return;
    var inputCss = e.target;
    var cssPropJs = inputCss.dataset.cssPropJs;
    if (cssPropJs.startsWith("border")){
        model.elementPresent.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
    }
});
/*
appView.addEventListener("input",e=>{ // box-shadow
    var target = e.target;
    var inputCss = target.querySelector(".input-css");
    if(!inputCss)
        return;
    var shadow = target.dataset.shadow;
    if(!shadow)
        return;
    model.boxShadows[target.dataset.index][target.dataset.shadow] = inputCss.textContent;
    setShadow();
},true);
appView.addEventListener("change",e=>{ // box-shadow
    var target = e.target;
    var shadow = target.dataset.shadow;
    if(!shadow)
        return;
    model.boxShadows[target.dataset.index][target.dataset.shadow] = target.value;
    setShadow();
},true);*/
function getProp(name,_default){
    return model._properties[name] ? model._properties[name].value : (_default || model._styles[name]);
}
function mapBoxShadow(boxShadowStat){
    if(boxShadowStat == "none")
        model.boxShadows = [];
    else{
        var boxShadows = opener.tilepieces.utils.splitCssValue(boxShadowStat);
        model.boxShadows = boxShadows.map((s,index)=>{
            var colorMatch = s.match(opener.tilepieces.utils.colorRegex);
            var values = s.match(opener.tilepieces.utils.valueRegex);
            var numberoffsetX = values[0].match(opener.tilepieces.utils.numberRegex);
            var numberoffsetY = values[1].match(opener.tilepieces.utils.numberRegex);
            var blur = values[2] ?  values[2].match(opener.tilepieces.utils.numberRegex) : 0;
            var spread = values[3] ?  values[3].match(opener.tilepieces.utils.numberRegex) : 0;
            var inset = s.match(/(^|\s)inset($|\s)/);
            return {
                index,
                type : inset ? "inset" : "outset",
                color : colorMatch ? colorMatch[0] : "rgb(0,0,0)",
                offsetX : numberoffsetX ? numberoffsetX[0] : 0,
                offsetY : numberoffsetY ? numberoffsetY[0] : 0,
                blur: blur ? blur[0] : 0,
                spread:spread ? spread[0] : 0
            }
        });
    }
}
appView.addEventListener("click",e=>{
    var closest = e.target.closest(".link-button");
    if(!closest)
        return;
    var prop = closest.dataset.prop;
    model[prop+"Link"] = !model[prop+"Link"];
    model[prop+"Unlink"] = !model[prop+"Unlink"];
    t.set("",model);
})
function setShadow() {
    var newBoxShadows = model.boxShadows.map(ts=> {
        return (ts.type == "inset" ? "inset " : "")+ts.offsetX + "px " +
            ts.offsetY + "px "  + ts.blur + "px " + ts.spread + "px " + ts.color;
    }).join(",");
    return setCss("box-shadow", newBoxShadows);
}
function setBoxShadowSVGtoXY(){
    var textShadowElsDOM = appView.querySelectorAll(".shadow");
    shadows = [...textShadowElsDOM].map(tse=>{
        var svg = tse.querySelector("svg");
        var isAlreadyShadow = shadows.find(v=>v.target==svg);
        var offsetX = model.boxShadows[tse.dataset.index].offsetX;
        var offsetY = model.boxShadows[tse.dataset.index].offsetY;
        if(!isAlreadyShadow){
            var newSvgTextShadow = SVGtoXY(svg);
            // 100 = svg width / 2
            // 5 : arbitrary change value on axis
            var throttle = false;
            newSvgTextShadow.onChange((x,y)=>{
                if (!throttle) {
                    requestAnimationFrame(e=>{
                        var xAxis = Math.trunc((x - 100) / 5);
                        var yAxis = Math.trunc((y - 100) / 5);
                        model.boxShadows[svg.dataset.index].offsetX = xAxis;
                        model.boxShadows[svg.dataset.index].offsetY = yAxis;
                        model.boxShadow = setShadow();
                        t.set("",model);
                        inputCss(appView);
                        throttle = false;
                    });
                    throttle = true;
                }
            });
            newSvgTextShadow.setXY((offsetX * 5)+100,(offsetY * 5)+100);
            return newSvgTextShadow;
        }
        else{
            isAlreadyShadow.setXY((offsetX * 5)+100,(offsetY * 5)+100);
            return isAlreadyShadow;
        }
    });
}
function setCss(name,value){
    var target = model.elementPresent;
    var setCss = opener.tilepieces.core.setCss(
        target,name,value,model.selector);
    console.log("setcss", name, value);
    return setCss;
}
function setTemplate(e){
    if(e && e.detail && e.detail.target.nodeType !=1){
        model.isVisible = false;
        t.set("",model);
    }
    var d = e.detail;
    var properties = d.cssRules.properties;
    model.elementPresent = d.target;
    model._properties = d.cssRules.properties;
    model._styles = d.styles;
    model.border = getProp("border");
    /* border width */
    model.borderWidth = getProp("border-width");
    model.borderWidthLink = (d.styles.borderTopWidth==d.styles.borderLeftWidth&&
    d.styles.borderLeftWidth==d.styles.borderBottomWidth&&
    d.styles.borderBottomWidth==d.styles.borderRightWidth);
    model.borderWidthUnlink = !model.borderWidthLink;
    model.borderTopWidth = getProp("border-top-width");
    model.borderLeftWidth = getProp("border-left-width");
    model.borderBottomWidth = getProp("border-bottom-width");
    model.borderRightWidth = getProp("border-right-width");

    /* border style */
    model.borderStyle = getProp("border-style");
    model.borderStyleLink = (d.styles.borderTopStyle==d.styles.borderLeftStyle&&
    d.styles.borderLeftStyle==d.styles.borderBottomStyle&&
    d.styles.borderBottomStyle==d.styles.borderRightStyle);
    model.borderStyleUnlink = !model.borderStyleLink;
    model.borderTopStyle = getProp("border-top-style");
    model.borderLeftStyle = getProp("border-left-style");
    model.borderBottomStyle = getProp("border-bottom-style");
    model.borderRightStyle = getProp("border-right-style");

    /* border color*/
    model.borderColor = getProp("border-color");
    model.realBorderColor = d.styles.borderColor.match(/rgb\([^)]*\)|rgba\([^)]*\)/)[0];
    model.borderColorLink = (d.styles.borderTopColor==d.styles.borderLeftColor&&
    d.styles.borderLeftColor==d.styles.borderBottomColor&&
    d.styles.borderBottomColor==d.styles.borderRightColor);
    model.borderColorUnlink = !model.borderColorLink;
    model.borderTopColor = getProp("border-top-color");
    model.realBorderTopColor = d.styles.borderTopColor;
    model.borderLeftColor = getProp("border-left-color");
    model.realBorderLeftColor = d.styles.borderLeftColor;
    model.borderBottomColor = getProp("border-bottom-color");
    model.realBorderBottomColor = d.styles.borderBottomColor;
    model.borderRightColor = getProp("border-right-color");
    model.realBorderRightColor = d.styles.borderRightColor;

    /* border radius*/
    model.borderRadius = getProp("border-radius");
    model.borderRadiusLink = (d.styles.borderTopLeftRadius==d.styles.borderTopRightRadius&&
    d.styles.borderTopRightRadius==d.styles.borderBottomRightRadius&&
    d.styles.borderBottomRightRadius==d.styles.borderBottomLeftRadius);
    model.borderRadiusUnlink = !model.borderRadiusLink;
    model.borderTopLeftRadius = getProp("border-top-left-radius");
    model.borderTopRightRadius = getProp("border-top-right-radius");
    model.borderBottomRightRadius = getProp("border-bottom-right-radius");
    model.borderBottomLeftRadius = getProp("border-bottom-left-radius");

    /* border image */
    model.borderImage = getProp("border-image");
    model.borderImageSource = getProp("border-image-source");
    var gradient = matchGradients(d.styles.borderImageSource);
    model.hasGradient = !!gradient.length;
    var hasUrl = d.styles.borderImageSource.match(/url\([^)]*\)/);
    model.hasUrl = !!hasUrl;
    model.imageSrc = hasUrl ? hasUrl[0].replace("url(","").replace(/"|'|\)/g,"") : "";
    model.imageType = model.hasGradient ? "gradient" : model.hasUrl ? "url" : "none";
    model.borderImageSlice = getProp("border-image-slice");
    model.borderImageWidth = getProp("border-image-width");
    model.borderImageOutset = getProp("border-image-outset");
    model.borderImageRepeat = getProp("border-image-repeat");
    model.boxShadow = getProp("box-shadow");
    mapBoxShadow(d.styles.boxShadow);
    /* outline */
    model.outline = getProp("outline");
    model.outlineWidth = getProp("outline-width");
    model.outlineStyle = getProp("outline-style");
    model.outlineColor = getProp("outline-color");
    model.realOutlineColor = d.styles.outlineColor;
    model.outlineOffset = getProp("outline-offset");

    model.isVisible = true;
    t.set("",model);
    inputCss(appView);
    if(model.hasGradient)
        gradientObject.set(gradient[0]);
    setBoxShadowSVGtoXY()
}


})();
(()=>{
function dragLeave(e){
    e.preventDefault();
    var target = e.target;
    var dropzone = target.closest("[data-dropzone]");
    if(dropzone)
        dropzone.classList.remove("ondrop");
}
function dragover(e){
    e.preventDefault();
    var target = e.target;
    var dropzone = target.closest("[data-dropzone]");
    if(dropzone)
        dropzone.classList.add("ondrop");
}
function drop(e){
  e.preventDefault();
  var target = e.target;
  var dropzone = target.closest("[data-dropzone]");
  if(!dropzone)
    return;
  dropzone.classList.remove("ondrop");
  var files = e.dataTransfer.files;
  if(files.length) {
    dropzone.dispatchEvent(new CustomEvent("dropzone-dropping",{
      bubbles:true,
      detail:{
          type : "files",
          target : dropzone,
          files
      }
    }))
  }
  else{
    /*
    var html = e.dataTransfer.getData("text/html");
    var placeholder = document.createElement("div");
    placeholder.innerHTML = html;
    dropzone.dispatchEvent(new CustomEvent("dropzone-dropping",{
      bubbles:true,
        detail:{
            type : "url",
            target : dropzone,
            dataTransfer : e.dataTransfer,
            text : e.dataTransfer.getData("text"),
            placeholderHTML : placeholder
        }
      }))*/
  }
}
document.addEventListener("drop",drop,true);
document.addEventListener("dragover",dragover,true);
document.addEventListener("dragleave",dragLeave,true);
document.addEventListener("paste",onPaste,true);
function onPaste(e){
  var target = e.target;
  var dropzone = target.closest("[data-dropzone]");
  if(!dropzone)
    return;
  var clipboardData = e.clipboardData;
  if (clipboardData.files.length) {
    e.preventDefault();
    dropzone.dispatchEvent(new CustomEvent("dropzone-dropping", {
      bubbles:true,
      detail:{
        type : "files",
        target : dropzone,
        files : clipboardData.files
      }
    }))
  }
}

})();
(()=>{
const opener = window.opener || window.parent;
let app = opener.tilepieces;
const appView = document.getElementById("fonts");
const addFont = document.getElementById("add-font");
const urlRegex = /url\([^)]*\)/;
const localRegex = /local\([^)]*\)/;
const formatRegex = /format\([^)]*\)/;
/*
opener.addEventListener("edit-page",e=>{
    if(!e.detail)
        t.set("",{isVisible : false});
});*/
opener.addEventListener("edit-mode",e=> {
    if(!app.editMode)
        t.set("",{isVisible : false});
});
/*
opener.addEventListener("html-rendered",e=>{
    t.set("",{isVisible : false});
});*/
let model = {};
let t;
tilepieces_tabs({
    el : document.getElementById("font-tabs"),
    noAction : true
});
//autocomplete(appView);
if(app.core)
    assignModel({detail:app.core});
opener.addEventListener("cssMapper-changed",assignModel);
addFont.addEventListener("click",e=>{
    var fonts = model.fonts.slice(0);
    var currentStylesheet = app.core.currentStyleSheet;
    var ffr = fontFaceRule(fontModel);
    if (!currentStylesheet) {
        app.core.createCurrentStyleSheet(ffr);
    }
    else{
        app.core.insertCssRule(currentStylesheet,ffr);
        var index = currentStylesheet.cssRules.length;
        var rule = currentStylesheet.cssRules[index-1];
        var mapped = {
            fontFamily: "",
            fontWeight: "",
            fontStyle: "",
            fontDisplay: "",
            unicodeRange: "",
            fontStretch: "",
            fontVariant: "",
            fontFeatureSettings: "",
            fontVariationSettings: "",
            src : ""
        };
        app.core.styles.fonts.push({mapped,fontFaceRule:rule,cssText:rule.cssText});
        assignModel({detail:app.core});
    }
});
function assignModel(e) {
    var f = e.detail.styles && e.detail.styles.fonts;
    var fonts = f || [];
    var newFonts = fonts.reverse().map((font,index)=>{
        var newFont = {};
        newFont.fontFaceRule = font.fontFaceRule;
        newFont.cssText = font.cssText;
        newFont.mapped = font.mapped;
        var src = newFont.mapped.src;
        var srcResources = !src ? [] : app.utils.splitCssValue(src);
        newFont.disabled = font.fontFaceRule.parentStyleSheet != e.detail.currentStyleSheet ?
            "disabled":"";
        newFont.index = index;
        newFont.srcResources = srcResources.map((srcRes,index)=>{
            var url = srcRes.match(urlRegex);
            var type;
            if(url){
                url = url[0].substring(0,url[0].length-1).replace(/url\(/g,"");
                type = "url";
            }
            else url = "";
            var format = srcRes.match(formatRegex);
            if(format){
                format = format[0].substring(0,format[0].length-1).replace(/format\(/g,"");
            }
            else format = "";
            var local = srcRes.match(localRegex);
            if(local){
                local = local[0].substring(0,local[0].length-1).replace(/local\(/g,"");
                type = "local";
            }
            else local = "";
            return {url,format,local,type,index};
        });
        newFont.isSelected = index == 0 ? "selected" : ""; // 0 is selected, others not
        return newFont;
    });
    model = {
        fonts : newFonts
    };
    if(!t)
        t = new opener.TT(appView, model);
    else
        t.set("",model);
}
function changeTab(e){
    if(e.target.classList.contains("true"))
        return;
    var exSel = model.fonts.find(f=>f.isSelected);
    exSel.isSelected = "";
    model.fonts[e.target.dataset.targetIndex].isSelected = "selected";
    t.set("",model);
}
appView.addEventListener("click",e=>{
    if(e.target.classList.contains("tab-link"))
        changeTab(e);
});
function fontFaceRule(fontModel){
    var fontFace =
    `@font-face {
        src : ${fontModel.srcResources.map(src=>{
            if(src.type == "local")
                return `local(${src.local})`;
            else
                return `url(${src.url})${src.format ? ` format(${src.format})` : ""}`;
        })};
        font-family : ${fontModel.mapped.fontFamily};
        ${fontModel.mapped.fontWeight ? `font-weight : ${fontModel.mapped.fontWeight};` : ``}
        ${fontModel.mapped.fontStyle ? `font-style : ${fontModel.mapped.fontStyle};` : ``}
        ${fontModel.mapped.fontDisplay ? `font-display : ${fontModel.mapped.fontDisplay};` : ``}
        ${fontModel.mapped.unicodeRange ? `unicode-range : ${fontModel.mapped.unicodeRange};` : ``}
        ${fontModel.mapped.fontStretch ? `font-stretch : ${fontModel.mapped.fontStretch};` : ``}
        ${fontModel.mapped.fontVariant ? `font-variant : ${fontModel.mapped.fontVariant};` : ``}
        ${fontModel.mapped.fontFeatureSettings ? `font-feature-settings : ${fontModel.mapped.fontFeatureSettings};` : ``}
        ${fontModel.mapped.fontVariationSettings ? `font-variation-settings : ${fontModel.mapped.fontVariationSettings};` : ``}
    }`;
    return fontFace
}
let fontModel = {
    src : "",
    srcResources : [],
    mapped: {
        fontFamily: "",
        fontWeight: "",
        fontStyle: "",
        fontDisplay: "",
        unicodeRange: "",
        fontStretch: "",
        fontVariant: "",
        fontFeatureSettings: "",
        fontVariationSettings: ""
    },
    disabled : "",
    index:0
};
appView.addEventListener("template-digest",ev=>{
    var e = ev.detail;
    if(e.target.classList.contains("change-src-type")){
        console.log(e.target.value);
        return;
    }
    var font = e.target.closest(".font");
    var fontModel = model.fonts[font.dataset.index];
    var rule = fontModel.fontFaceRule;
    var parentStyles = rule.parentRule || rule.parentStyleSheet || app.core.currentStyleSheet;
    fontModel.mapped.src = fontModel.srcResources.map(src=>{
        if(src.type == "local")
            return `local(${src.local})`;
        else
            return `url(${src.url})${src.format ? ` format(${src.format})` : ""}`;
    }).join(",");
    var fontIndexRule = -1;
    if(parentStyles) {
        fontIndexRule = [...parentStyles.cssRules].indexOf(rule);
        if (fontIndexRule > -1)
            app.core.deleteCssRule(rule);
    }
    var ffr = fontFaceRule(fontModel);
    var newRule = app.core.insertCssRule(parentStyles,ffr, fontIndexRule>-1 ? fontIndexRule : parentStyles.cssRules.length);
    var fontObj = {mapped:fontModel.mapped,fontFaceRule:newRule,cssText:newRule.cssText};
    var alreadyInFont = app.core.styles.fonts.findIndex(f=>f.fontFaceRule == rule);
    if(alreadyInFont>-1)
        app.core.styles.fonts.splice(alreadyInFont,1,fontObj);
    else
        app.core.styles.fonts.push(fontObj);
    assignModel({detail:app.core});
},true);

appView.addEventListener("click",e=>{
    var target = e.target;
    var font = target.closest(".font");
    if(target.classList.contains("add-src")){
        var srcResources = model.fonts[font.dataset.index].srcResources.splice(0);
        srcResources.push({url:"",format:"",local:"",type:"url"});
        srcResources = srcResources.map((v,i)=>{
            v.index = i;
            return v;
        });
        t.set("fonts["+font.dataset.index+"].srcResources",srcResources);
    }
    if(target.classList.contains("remove-src")){
        var srcResources = model.fonts[font.dataset.index].srcResources.splice(0);
        srcResources.splice(Number(target.dataset.indexSrc),1);

        t.set("fonts["+font.dataset.index+"].srcResources",srcResources);
        var fontFamilyInputToTrigger = font.querySelector(".font-family");
        fontFamilyInputToTrigger.dispatchEvent(new Event("change"))
    }
    if(target.classList.contains("remove-font")){
        var ffr = model.fonts[font.dataset.index].fontFaceRule;
        app.core.deleteCssRule(ffr);
        assignModel({detail:app.core});
    }
})
appView.addEventListener("dropzone-dropping",onDropFiles,true);
async function onDropFiles(e){
  e.preventDefault();
  var dropzone = e.detail.target;
  var file = e.detail.files[0];
  if(!file)
    return;
  var font = e.target.closest(".font");
  var fontModel = model.fonts[font.dataset.index];
  var index = +dropzone.nextElementSibling.dataset.index;
  var result = await app.utils.processFile(file,null,app.core.currentStylesheet?.href?.replace(location.origin,""));
  fontModel.srcResources[index].url = result;
  appView.dispatchEvent(new CustomEvent("template-digest",{detail:{target:e.target}}))
}
appView.addEventListener("click",e=>{
  if(!e.target.classList.contains("search-button"))
    return;
  var font = e.target.closest(".font");
  var fontModel = model.fonts[font.dataset.index];
  var index = +e.target.dataset.index;
  var dialogSearch = opener.dialogReader("fonts",app.core.currentStylesheet?.href?.replace(location.origin,""));
  dialogSearch.then(dialog=>{
    dialog.on("submit",src=>{
      fontModel.srcResources[index].url = src;
      appView.dispatchEvent(new CustomEvent("template-digest",{detail:{target:e.target}}))
    })
  })
});


})();
(()=>{
const opener = window.opener || window.parent;
let app = opener.tilepieces;
window.cssDefaults = app.cssDefaultValues;
let gradientIsChanging;
const appView = document.getElementById("background-box");
const addBackgroundButton = appView.querySelector("#add-background");
const urlPlaceholder = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=)";
appView.addEventListener("click",e=>{
    if(e.target.classList.contains("tab-link"))
        changeTab(e);
    if(e.target.classList.contains("remove-background"))
        removeBackground(e);
});
addBackgroundButton.addEventListener("click",addBackground);
let gradientsEls = [];
//opener.addEventListener("WYSIWYG-el-parsed", setTemplate);
opener.addEventListener("highlight-click",setTemplate);
opener.addEventListener("edit-page",e=>{
    if(!e.detail)
        t.set("",{isVisible : false});
});
opener.addEventListener("edit-mode",e=> {
    if(!app.editMode)
        t.set("",{isVisible : false});
});
opener.addEventListener("html-rendered",e=>{
    t.set("",{isVisible : false});
});
let model = {
    isVisible : false,
    backgrounds : [],
    tabActive : 0
};
let t = new opener.TT(appView,model,{
    templates : [{
        name : "gradient-template",
        el : document.getElementById("gradient-template").content
    }]
});
autocomplete(appView);
if(app.elementSelected)
    setTemplate({detail:app.cssSelectorObj});

tilepieces_tabs({
    el : document.getElementById("background-tabs"),
    noAction : true
});
function addBackground(){
    //var templateToAdd = "linear-gradient(" + model.backgroundColor + "," + model.backgroundColor + ")";
    var templateToAdd = urlPlaceholder;
    var newBackground;
    if(model.backgroundImage == "initial" || model.backgroundImage == "unset" ||
        model.backgroundImage == "inherit" || model.backgroundImage == "none"){
        newBackground = templateToAdd
    }
    else {
        newBackground = model.backgroundImage + "," + templateToAdd;
        model.tabToSelect = model.backgrounds.length;
    }
    setCss("background-image",newBackground);
    var exSel = model.backgrounds.find(f=>f.isSelected);
    exSel.isSelected = "";
    model.tabToSelect = model.backgrounds.length;
    setBgModel(templateToAdd,model.tabToSelect);
    t.set("",model);
    inputCss(appView);
}
function removeBackground(e){
    var index = +e.target.dataset.index;
    model.backgroundsImages.splice(index,1);
    model.backgrounds.splice(index,1);
    var newBackground = model.backgroundsImages.join(",") || "none";
    model.backgroundImage = newBackground;
    model.tabToSelect = index-1>-1?index-1:0;
    model.backgrounds.forEach((v,i)=>{
        if(i == model.tabToSelect){
            v.isSelected = "selected";
        }
        else v.isSelected = "";
        v.index = i;
    });
    setCss("background-image",newBackground);
    t.set("",model);
}
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("color-button"))
        return;
    var target = e.target;
    var cssProperty = target.dataset.cssProp;
    var throttle;
    app.colorPicker(target.style.backgroundColor).onChange(c=>{
        clearTimeout(throttle);
        throttle = setTimeout(()=> {
            model.realBgColor = c.hex;
            var newColor = setCss(cssProperty, c.hex);
            model.backgroundColor = newColor;
            t.set("",model);
            inputCss(appView)
        },32)
    })
})
appView.addEventListener("change",e=>{ // change from gradient to url
    if(!e.target.classList.contains("image-type-select"))
        return;
    var value = e.target.value;
    var index = +e.target.dataset.index;
    if(value=="url") {
        model.backgrounds[index].backgroundImage = urlPlaceholder;
        var exGradient = e.target.parentNode.querySelector(".gradient");
        if(exGradient) {
            var i = gradientsEls.findIndex(v=>v.gradientDOM == exGradient);
            gradientsEls.splice(i,1);
        }
    }
    else
        model.backgrounds[index].backgroundImage = "linear-gradient(" + model.backgroundColor + "," + model.backgroundColor + ")";
    setCss("background-image",createNewBgProp("backgroundImage"));
    setBgModel(model.backgrounds[index].backgroundImage,index);
    t.set("",model);
    if(value!="url")
        gradientsEls.push(createNewGradient(e.target.parentNode.querySelector(".gradient"),index));
    inputCss(appView);
},true);
appView.addEventListener("input",e=>{
    if(!e.target.classList.contains("input-css"))
        return;
    var inputCss = e.target;
    var cssProp = inputCss.dataset.cssProp;
    if(!cssProp)
        return;
    var cssPropJs = inputCss.dataset.cssPropJs;
    /*
    if(cssPropJs=="backgroundImage")
        return;*/
    var newRule;
    var index;
    if(cssPropJs!="backgroundColor") {
        index = +inputCss.closest(".backgrounds").dataset.index;
        model.backgrounds[index][cssPropJs] = inputCss.innerText;
        newRule = createNewBgProp(cssPropJs);
    }
    else
        newRule = inputCss.innerText;
    setCss(cssProp, newRule);
},true);
appView.addEventListener("css-input-set-text",e=>{
    if(!e.target.classList.contains("input-css"))
        return;
    var inputCss = e.target;
    var cssPropJs = inputCss.dataset.cssPropJs;
    if(cssPropJs!="backgroundImage")
        return;
    var index = +inputCss.closest(".backgrounds").dataset.index;
    model.backgrounds[index][cssPropJs] = inputCss.innerText;
    var realNewValue = setCss("background-image", createNewBgProp("backgroundImage"));
    realNewValue = matchBackgrounds(realNewValue)[index];
    if(cssPropJs=="backgroundImage") {
        setBgModel(realNewValue, +inputCss.closest(".backgrounds").dataset.index);
        t.set("", model);
        if(model.backgrounds[index].hasGradient){
            var gradient = appView.querySelector(".backgrounds[data-index='" + index + "'] .gradient");
            var isAlreadyGradientObject = gradientsEls.find(v=>gradient);
            if(!isAlreadyGradientObject)
                gradientsEls.push(createNewGradient(gradient,index));
            else
                isAlreadyGradientObject.set(model.backgrounds[index].gradientModel);
        }
    }
},true);
appView.addEventListener("blur",e=> {
    if (!e.target.classList.contains("input-css"))
        return;
    if(!e.target.dataset.cssProp)
        return;
    if(e.target.dataset.value == e.target.innerText)
        return;
    model.elementPresent.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
},true);
/*
appView.addEventListener("blur",e=>{
    if(!e.target.classList.contains("input-css"))
        return;
    var inputCssEl = e.target;
    var cssProp = inputCssEl.dataset.cssProp;
    var cssPropJs = inputCssEl.dataset.cssPropJs;
    if(!cssProp)
        return;
    var realNewRule = inputCssEl.dataset.realNewValue;
    if(cssPropJs != "backgroundImage" &&
        typeof realNewRule != "string")
        return;
    var index;
    if(realNewRule!=inputCssEl.innerText) {
        if (cssPropJs != "backgroundColor" && cssPropJs != "backgroundImage") {
            index = +inputCssEl.closest(".backgrounds").dataset.index;
            model.backgrounds[index][cssPropJs] = realNewRule;
        }
        else if(cssPropJs == "backgroundImage"){
            index = +inputCssEl.closest(".backgrounds").dataset.index;
            model.backgrounds[index][cssPropJs] = inputCssEl.innerText;
            var realNewValue = setCss("background-image", createNewBgProp("backgroundImage"));
            model.backgrounds[index][cssPropJs] = matchBackgrounds(realNewValue)[index] || "none";
        }
        else
            model.backgroundColor = realNewRule;
    }
    delete inputCssEl.dataset.realNewValue;
    if(cssPropJs=="backgroundImage") {
        setBgModel(model.backgrounds[index].backgroundImage, index);
        t.set("", model);
        if(model.backgrounds[index].hasGradient){
            var gradient = appView.querySelector(".backgrounds[data-index='" + index + "'] .gradient");
            var isAlreadyGradientObject = gradientsEls.find(v=>gradient)
            if(!isAlreadyGradientObject)
                gradientsEls.push(createNewGradient(gradient,index));
            else
                isAlreadyGradientObject.set(model.backgrounds[index].gradientModel);
        }
    }
    else
        t.set("", model);
    inputCss(appView);
},true);
    */
function changeTab(e){
    if(e.target.classList.contains("true"))
        return;
    //var backgrounds = model.backgrounds.slice(0);
    var exSel = model.backgrounds.find(f=>f.isSelected);
    exSel.isSelected = "";
    var index = +e.target.dataset.targetIndex;
    model.backgrounds[index].isSelected = "selected";
    model.tabToSelect = index;
    t.set("backgrounds",model.backgrounds);
}
function createNewBgProp(prop){
    return model.backgrounds.reduce((string,v,i,a)=>{
        string+=v[prop] + (i!=a.length-1 ? "," : "");
        return string
    },"");
}
function createNewGradient(gEl,index){
    var throttle;
    gEl.addEventListener("gradient-change",e=>{
        model.backgrounds[index].backgroundImage = e.detail;
        clearTimeout(throttle);
        throttle = setTimeout(()=>{
            setCss("background-image", createNewBgProp("backgroundImage"));
            t.set("",model);
            inputCss(appView);
        },32);
    });
    return gradientView(gEl,model.backgrounds[index].gradientModel,true);
}
function changeUrlBackground(URL,index){
    model.backgrounds[index].backgroundImage = "url("+URL+")";
    model.backgrounds[index].imageSrc = URL;
    setCss("background-image", createNewBgProp("backgroundImage"));
    t.set("",model);
    inputCss(appView);
}
appView.addEventListener("change",e=>{
    if(e.target.dataset.type != "url-background") return;
    var index = e.target.dataset.index;
    var files = e.target.files;
    app.utils.processFile(files[0]).then(res=>{
        if(res) changeUrlBackground(res,index)
    })
});
window.addEventListener("dropzone-dropping",e=>{
    if(e.detail.target.dataset.type != "url-background") return;
    var index = e.detail.target.dataset.index;
    var type = e.detail.type;
    if(type == "files")
        app.utils.processFile(e.detail.files[0]).then(res=>{
            if(res) changeUrlBackground(res,index)
        });
    else{
        var img = e.detail.placeholderHTML.querySelector("img");
        if(img) changeUrlBackground(img.src,index)
    }
});
appView.addEventListener("click",e=>{
    var target = e.target.closest("[dropzone]");
    if(!target)
        return;
    var index = target.dataset.index;
    if(target && !target.classList.contains("ondrop")){
        var imageSearch = app.projectResourceReader("");
        imageSearch.then(imageSearchDialog=>{
            imageSearchDialog.on("submit",res=>changeUrlBackground(res,index));
        },e=>{
            opener.dialog.open(e.toString());
            console.error(e);
        })
    }
});
function matchBackgrounds(cssBackgroundStyle){
    var swap = cssBackgroundStyle;
    var cursor = 0;
    var tokens = [];
    var backgrounds = [];
    var background = "";
    var currentToken;
    while(cursor < swap.length) {
        var sub = swap.substring(cursor);
        if (sub[0] == '(') {
            var newcurrentToken = {start: cursor,childs:[],father:currentToken||tokens};
            if(currentToken && currentToken!=tokens) {
                currentToken.childs.push(newcurrentToken);
                currentToken = newcurrentToken;
            }
            else {
                tokens.push(newcurrentToken);
                currentToken = newcurrentToken
            }
        }
        if(sub[0] == ')'){
            currentToken.end=cursor+1;
            currentToken = currentToken.father;
        }
        if(sub[0] == "," && (!currentToken || currentToken==tokens)){
            backgrounds.push(background.trim());
            background = "";
        }
        else if(cursor == swap.length-1){
            background+=sub[0];
            backgrounds.push(background.trim());
        }
        else
            background+=sub[0];
        cursor+=1;
    }
    return backgrounds;
}
// type : 0 up, 1 down
function moveBackground(type,index){
    var moveIndex = type ? index+1 : index-1;
    var swap = model.backgrounds[index];
    model.backgrounds[index] = model.backgrounds[moveIndex];
    model.backgrounds[index].index = index;
    model.backgrounds[moveIndex] = swap;
    model.backgrounds[moveIndex].index = moveIndex;
    setCss("background-image",createNewBgProp("backgroundImage"));
    setCss("background-repeat",createNewBgProp("backgroundRepeat"));
    setCss("background-position",createNewBgProp("backgroundPosition"));
    setCss("background-origin",createNewBgProp("backgroundOrigin"));
    setCss("background-clip",createNewBgProp("backgroundClip"));
    setCss("background-attachment",createNewBgProp("backgroundAttachment"));
    setCss("background-size",createNewBgProp("backgroundSize"));
    setCss("background-blend-mode",createNewBgProp("backgroundBlendMode"));
    model.tabToSelect = moveIndex;
    t.set("",model);
    if(model.backgrounds[index].hasGradient)
        gradientsEls.push(createNewGradient(appView.querySelector(".backgrounds[data-index='" + index + "'] .gradient"),index));
    if(model.backgrounds[moveIndex].hasGradient)
        gradientsEls.push(createNewGradient(appView.querySelector(".backgrounds[data-index='" + moveIndex + "'] .gradient"),moveIndex));
    inputCss(appView);
}
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("move-background-up")) return;
    moveBackground(0,+e.target.dataset.index);
})
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("move-background-down")) return;
    moveBackground(1,+e.target.dataset.index);
})
function setBgModel(bi,i){
    var newB = {};
    newB.index = i;
    var gradient = matchGradients(bi);
    newB.hasGradient = !!gradient.length;
    newB.hasUrl = bi.match(/url\([^)]*\)/);
    newB.imageSrc = newB.hasUrl ? newB.hasUrl[0].replace("url(","").replace(/"|'|\)/g,"") : "";
    newB.imageType = newB.hasGradient ? "gradient" : newB.hasUrl ? "url" : "";
    newB.gradientModel = gradient.length ? gradient[0] : null;
    newB.backgroundImage = bi;
    var bg = model.backgrounds[i] || {};
    newB.backgroundRepeat = bg.backgroundRepeat || model.backgroundsRepeat[i] ||  "repeat";
    newB.backgroundPositionX = bg.backgroundPositionX || model.backgroundsPositionX[i] || "0%";
    newB.backgroundPositionY = bg.backgroundPositionY || model.backgroundsPositionY[i] || "0%";
    newB.backgroundOrigin = bg.backgroundOrigin || model.backgroundsOrigin[i] || "padding-box";
    newB.backgroundClip = bg.backgroundClip || model.backgroundsClip[i] || "border-box";
    newB.backgroundAttachment = bg.backgroundAttachment || model.backgroundsAttachment[i] || "scroll";
    newB.backgroundSize = bg.backgroundSize || model.backgroundsSize[i] || "auto auto";
    newB.backgroundBlendMode = bg.backgroundBlendMode || model.backgroundsBlendMode[i] || "normal";
    console.log(model.tabToSelect);
    newB.isSelected = i == model.tabToSelect ? "selected" : "";
    model.backgrounds[i] = newB;
}
let setCssRefreshThrottle;
function setCss(name,value){
    var target = model.elementPresent;
    var setCss = app.core.setCss(target,name,value);
    console.log("setcss", name, value);
    return setCss;
    //target.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
}
function setGradientEls(){
    return [...appView.querySelectorAll(".gradient")].map(gEl=>{
        var isAlreadyGradientObject = gradientsEls.find(v=>v.gradientDOM==gEl);
        var index = +gEl.closest(".backgrounds").dataset.index;
        if(!isAlreadyGradientObject)
            return createNewGradient(gEl,index);
        else {
            isAlreadyGradientObject.set(model.backgrounds[index].gradientModel);
            return isAlreadyGradientObject;
        }
    });
}
function setTemplate(e){
    if(e && e.detail && e.detail.target.nodeType !=1){
        model.isVisible = false;
        t.set("",model);
        return;
    }
    var d = e.detail;
    model.match = d.match;
    model.isVisible = true;
    var properties = d.cssRules.properties;
    model.backgroundColor = properties["background-color"] ? properties["background-color"].value :
        d.styles.backgroundColor;
    model.realBgColor = d.styles.backgroundColor;
    if(d.target != model.elementPresent)
        model.tabToSelect = 0;
    model.elementPresent = d.target;
    var backgroundImage = properties["background-image"] ?
        properties["background-image"].value : d.styles.backgroundImage;
    model.backgroundImage = backgroundImage;
    model.backgroundsImages = matchBackgrounds(backgroundImage);
    var backgroundRepeat = properties["background-repeat"] ? properties["background-repeat"].value
            : d.styles.backgroundRepeat;
    model.backgroundsRepeat = backgroundRepeat.split(",").map(v=>v.trim());

    var backgroundPositionX = properties["background-position-x"] ?
        properties["background-position-x"].value : d.styles.backgroundPositionX;
    model.backgroundsPositionX = backgroundPositionX.split(",").map(v=>v.trim());

    var backgroundPositionY = properties["background-position-y"] ?
        properties["background-position-y"].value : d.styles.backgroundPositionY;
    model.backgroundsPositionY = backgroundPositionY.split(",").map(v=>v.trim());

    var backgroundSize = properties["background-size"] ?
        properties["background-size"].value : d.styles.backgroundSize;
    model.backgroundsSize = backgroundSize.split(",").map(v=>v.trim());

    var backgroundAttachment = properties["background-attachment"] ?
        properties["background-attachment"].value : d.styles.backgroundAttachment;
    model.backgroundsAttachment = backgroundAttachment.split(",").map(v=>v.trim());

    var backgroundClip = properties["background-clip"] ?
        properties["background-clip"].value : d.styles.backgroundClip;
    model.backgroundsClip = backgroundClip.split(",").map(v=>v.trim());

    var backgroundOrigin = properties["background-origin"] ?
        properties["background-origin"].value : d.styles.backgroundOrigin;
    model.backgroundsOrigin = backgroundOrigin.split(",").map(v=>v.trim());

    var backgroundBlendMode = properties["background-blend-mode"] ?
        properties["background-blend-mode"].value : d.styles.backgroundBlendMode;
    model.backgroundsBlendMode = backgroundBlendMode.split(",").map(v=>v.trim());
    model.backgrounds = [];
    model.backgroundsImages.forEach(setBgModel);
    t.set("",model);
    gradientsEls = [...appView.querySelectorAll(".gradient")].map(gEl=>{
        var isAlreadyGradientObject = gradientsEls.find(v=>v.gradientDOM==gEl);
        var index = +gEl.closest(".backgrounds").dataset.index;
        if(!isAlreadyGradientObject)
            return createNewGradient(gEl,index);
        else {
            isAlreadyGradientObject.set(model.backgrounds[index].gradientModel);
            return isAlreadyGradientObject;
        }
    });
    inputCss(appView);
}


})();
(()=>{
const opener = window.opener || window.parent;
let app = opener.tilepieces;
window.cssDefaults = app.cssDefaultValues;
const appView = document.getElementById("layout-box");
var model = {
    hideClass : "hide",
    gridAreasTemplate : [],
    positionLinked : "selected",
    borderLinked : "selected",
    marginLinked : "selected",
    paddingLinked : "selected"
};
opener.addEventListener("highlight-click",setTemplate);
opener.addEventListener("edit-page",e=>{
    if(!e.detail)
        t.set("",{isVisible : false});
});
opener.addEventListener("edit-mode",e=> {
    if(!app.editMode)
        t.set("",{isVisible : false});
});
opener.addEventListener("html-rendered",e=>{
    t.set("",{isVisible : false});
});
autocomplete(appView);
let t = new opener.TT(appView,model);
if(app.elementSelected)
    setTemplate({detail:app.cssSelectorObj});

tilepieces_tabs({
    el : document.getElementById("tab-layout")
})

function getProp(name,_default){
    return model._properties[name] ? model._properties[name].value : (_default || model._styles[name]);
}
function setCss(name,value){
    var target = model.elementPresent;
    var setCss = app.core.setCss(target,name,value);
    console.log("setcss", name, value);
    return setCss;
}
function setTemplate(e){
    if(e && e.detail && e.detail.target.nodeType !=1){
        model.isVisible = false;
        t.set("",model);
        return;
    }
    var d = e.detail;
    model.match = d.match;
    model.isVisible = true;
    model._properties = d.cssRules.properties;
    model._styles = d.styles;
    model.elementPresent = d.target;
    model.fatherStyle = d.fatherStyle || {display:"none"}; // HTML TAG HAS NO FATHER
    var fatherStyle = model.fatherStyle;
    model.display = getProp("display");
    var display = d.styles.display;
    model.inlineStyles= display == 'inline' || display == 'inline-block' || display == 'table-cell';
    if(model.inlineStyles) {
        model.verticalAlign = getProp("vertical-align");
    }
    model.listStyle = display == 'list-item' || d.target.nodeName == "UL" || d.target.nodeName == "OL";
    if(model.listStyle){
        model.listStyleType =getProp("list-style-type");
        model.listStylePosition =getProp("list-style-position");
        model.listStyleImage=getProp("list-style-image");
    }
    model.displayBlock = display == 'block' || display == 'inline-block';
    if(model.displayBlock){
        model.clear = getProp("clear");
    }
    model.flexContainer = display == 'flex' || display == 'inline-flex';
    if(model.flexContainer){
        model.alignContent = getProp("align-content");
        model.flexDirection = getProp("flex-direction");
        model.flexWrap = getProp("flex-wrap");
        model.justifyContent = getProp("justify-content");
    }
    model.flexOrGridChildren = fatherStyle.display == 'flex' || fatherStyle.display == 'inline-flex' || fatherStyle.display == 'grid';
    if(model.flexOrGridChildren){
        model.alignSelf = getProp("align-self");
    }
    model.flexChildren = fatherStyle.display == 'flex' || fatherStyle.display == 'inline-flex';
    if(model.flexChildren) {
        model.flexBasis = getProp("flex-basis");
        model.flexGrow = getProp("flex-grow");
        model.flexShrink= getProp("flex-shrink");
        model.order = getProp("order");
    }
    model.tableContainer = display == 'table' || display == 'inline-table';
    model.borderSpacingAllowed = false;
    if(model.tableContainer){
        model.borderCollapse = getProp("border-collapse");
        model.borderSpacingAllowed = d.styles.borderCollapse!="collapse";
        if(model.borderSpacingAllowed)
            model.borderSpacing = getProp("border-spacing");
        model.tableLayout = getProp("table-layout");
        model.captionSide = getProp("caption-side");
    }
    model.emptyCellsAllowed = false;
    var tableParent = d.target.closest("table");
    if(tableParent){
        model.emptyCellsAllowed = tableParent &&
            tableParent.ownerDocument.defaultView.getComputedStyle(tableParent,null).borderCollapse == "separate";
        if(model.emptyCellsAllowed)
            model.emptyCells = getProp("empty-cells");
    }
    model.gridContainer = display =='grid' || display =='inline-grid';
    model.gridChildren = fatherStyle.display == 'grid' || fatherStyle.display == 'inline-grid';
    if(model.gridContainer){
        model.gridAreasTemplate = gridTemplateAssignment(d);
        model.gridTemplateColumns = getProp("grid-template-columns");
        model.gridTemplateRows = getProp("grid-template-rows");
        model.gridAutoColumns = getProp("grid-auto-columns");
        model.gridAutoFlow = getProp("grid-auto-flow");
        model.gridAutoRows = getProp("grid-auto-rows");
        model.gridColumnGap = getProp("grid-column-gap");
        model.gridRowGap = getProp("grid-row-gap");
    }
    else model.gridAreasTemplate = [];
    if(model.gridChildren){
        model.gridArea = getProp("grid-area");
        model.gridColumnStart = getProp("grid-column-start");
        model.gridColumnEnd = getProp("grid-column-end");
        model.gridRowStart = getProp("grid-row-start");
        model.gridRowEnd = getProp("grid-row-end");
    }
    model.float = getProp("float");
    model.position = getProp("position");
    model.positionVisible = d.styles.position != "static";
    model.top = getProp("top","0px");//d.styles.top;
    model.left = getProp("left","0px");
    model.right = getProp("right","0px");
    model.bottom = getProp("bottom","0px");
    model.marginTop = getProp("margin-top");
    model.marginLeft = getProp("margin-left");
    model.marginRight = getProp("margin-right");
    model.marginBottom = getProp("margin-bottom");
    model.borderTopWidth = getProp("border-top-width");
    model.borderLeftWidth = getProp("border-left-width");
    model.borderRightWidth = getProp("border-right-width");
    model.borderBottomWidth = getProp("border-bottom-width");
    model.paddingTop = getProp("padding-top");
    model.paddingLeft = getProp("padding-left");
    model.paddingRight = getProp("padding-right");
    model.paddingBottom = getProp("padding-bottom");
    model.objectEl = d.target.nodeName == 'IMG' || d.target.nodeName == 'VIDEO';
    model.objectFit = getProp("object-fit");
    model.objectPosition = getProp("object-position");
    model.width = getProp("width");
    model.maxWidth = getProp("max-width");
    model.minWidth = getProp("min-width");
    model.height = getProp("height");
    model.maxHeight = getProp("max-height");
    model.minHeight = getProp("min-height");
    model.boxSizing = getProp("box-sizing");
    model.visibility = getProp("visibility");
    model.opacity = getProp("opacity");
    model.overflow = getProp("overflow");
    model.overflowX = getProp("overflowX");
    model.overflowY = getProp("overflowY");
    model.cursor = getProp("cursor");

    t.set("",model);
    inputCss(appView);
}

appView.querySelector("#show-measure")
    .addEventListener("click",e=>{
    if(!e.target.closest("button"))
        return;
    var propType = e.target.closest("div").id;
    var isSelected = e.target.closest(".label").classList.contains("selected");
    model[propType+"Linked"] = isSelected ? "" : "selected";
    t.set("",model);
});
appView.addEventListener("template-digest",e=>{
    var target = e.detail.target;
    if(target.dataset.cssProp && target.value){
        setCss(target.dataset.cssProp,target.value);
        inputCss(appView);
    }
},true);
appView.addEventListener("css-input-set-text",e=> {
    if (!e.target.classList.contains("input-css"))
        return;
    var prop = e.target.dataset.cssProp;
    if(prop.match(/^(margin|padding|border)/) && e.target.dataset.linked){
        if (prop.startsWith("margin")) {
            model.marginTop = e.target.innerText;
            model.marginLeft = e.target.innerText;
            model.marginRight = e.target.innerText;
            model.marginBottom = e.target.innerText;
        }
        if (prop.startsWith("padding")) {
            model.paddingTop = e.target.innerText;
            model.paddingLeft = e.target.innerText;
            model.paddingRight = e.target.innerText;
            model.paddingBottom = e.target.innerText;
        }
        if (prop.startsWith("border")) {
            model.borderTopWidth = e.target.innerText;
            model.borderLeftWidth = e.target.innerText;
            model.borderRightWidth = e.target.innerText;
            model.borderBottomWidth = e.target.innerText;
        }
        t.set("", model);
        inputCss(appView);
    }
},true);
appView.addEventListener("focus",e=>{
    if(!e.target.classList.contains("input-css"))
        return;
    e.target.parentNode.classList.add("focus");
},true);
appView.addEventListener("blur",e=> {
    if (!e.target.classList.contains("input-css"))
        return;
    if(!e.target.dataset.cssProp)
        return;
    e.target.parentNode.classList.remove("focus");
    if(e.target.dataset.value == e.target.innerText)
        return;
    model.elementPresent.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
},true);
appView.addEventListener("input",e=>{
    var target = e.target;
    if(!target.classList.contains("input-css"))
        return;
    var prop = target.dataset.cssProp;
    if(prop){
        var value = target.innerText;
        if(prop.startsWith("margin") && target.dataset.linked)
            prop = "margin";
        if(prop.startsWith("padding") && target.dataset.linked)
            prop = "padding";
        if(prop.startsWith("border") && target.dataset.linked)
            prop = "border";
        setCss(prop, value);
    }
},true);
function gridTemplateAssignment(d){
    var areas = d.styles.gridTemplateAreas;
    var gridAreasTemplate;
    if(areas && areas != "none") {
        var rows = areas.substring(1, areas.length - 1).split(/"\s+"/);
        gridAreasTemplate = rows.map((r,ri)=>{
            var arr = r.split(/\s/);
            var cells = arr.map((v,ci)=>{
                return {label:v,index:ci}
            });
            return {
                index:ri,
                cells
            }
        });
    }
    else gridAreasTemplate = [];
    return gridAreasTemplate;
}
function computeGridTemplateAreas(){
    if(model.gridAreasTemplate.length && model.gridAreasTemplate.find(c=>c.cells.length))
        return model.gridAreasTemplate
            .map(row=>`"${row.cells.map(c=>c.label).join(" ")}"`).join(" ");
    else return ""
}
appView.addEventListener("change",e=>{
    var target = e.target;
    if(target.hasAttribute("data-row-index")){
        setTimeout(()=>{
            setCss("grid-template-areas",computeGridTemplateAreas());
        })
    }
},true);
appView.addEventListener("click",e=>{
    var target = e.target;
    if(target.id=="add-css-grid-column"){
        var gridAreas = model.gridAreasTemplate.slice(0);
        gridAreas.forEach(row=>row.cells.push({label:".",index:i}));
        t.set("gridAreasTemplate",gridAreas);
        setCss("grid-template-areas",computeGridTemplateAreas());
    }
    if(target.id=="add-css-grid-row"){
        var gridAreas = model.gridAreasTemplate.slice(0);
        var cellsLength = gridAreas[0] ? gridAreas[0].cells.length : 1;
        var cells = [];
        for(var i = 0;i<cellsLength;i++)
            cells.push({label:".",index:i});
        gridAreas.push({cells,index:gridAreas.length});
        t.set("gridAreasTemplate",gridAreas);
        setCss("grid-template-areas",computeGridTemplateAreas());
    }
    if(target.id=="remove-css-grid-row"){
        var gridAreas = model.gridAreasTemplate.slice(0);
        gridAreas.splice(gridAreas.length-1,1);
        t.set("gridAreasTemplate",gridAreas);
        setCss("grid-template-areas",computeGridTemplateAreas());
    }
    if(target.id=="remove-css-grid-column"){
        var gridAreas = model.gridAreasTemplate.slice(0);
        var cellsLength = gridAreas[0].cells.length;
        gridAreas.forEach(row=>row.cells.splice(cellsLength-1,1));
        t.set("gridAreasTemplate",gridAreas);
        setCss("grid-template-areas",computeGridTemplateAreas());
    }
},true);

})();
(()=>{
const opener = window.opener || window.parent;
const app = opener.tilepieces;
window.cssDefaults = app.cssDefaultValues;
const ftWysiwyg = opener.ftWysiwyg;
const appView = document.getElementById("transform");
let model = {
    isVisible : false,
    functions : [],
    transformNewType: "translate(0px,0px)"
};
let t = new opener.TT(appView,model);
autocomplete(appView);
if(app.elementSelected)
    setTemplate({detail:app.cssSelectorObj});
opener.addEventListener("highlight-click",setTemplate);
opener.addEventListener("edit-mode",e=> {
    if(!app.editMode)
        t.set("isVisible",false);
});
tilepieces_tabs({
    el : document.getElementById("transform-tabs")
});
/*
appView.addEventListener("change",e=>{
    if(e.target.classList.contains("selector")) // TODO
        return;
    if(!e.target.hasAttribute("data-css-prop"))
        return;
    setCss(e.target.dataset.cssProp,e.target.value)
});
appView.addEventListener("input",e=>{
    if(!e.target.hasAttribute("data-css-prop"))
        return;
    setCss(e.target.dataset.cssProp,e.target.textContent);
    if(e.target.dataset.cssProp == "transform"){
        model.functions = matchTransformFunctions(e.target.textContent).reverse();
        t.set("functions",model.functions);
        inputCss(appView);
    }
});*/
/*
appView.addEventListener("input",e=>{
    if(e.target.dataset.type != "transform-function")
        return;
    model.functions[Number(e.target.dataset.index)].value = e.target.textContent.trim();
    var transform = model.functions.map(v=>v.name+"("+v.value+")").reverse().join(" ");
    setCss("transform",transform);
    t.set("transform",transform);
    inputCss(appView);
});*/


function setCss(name,value){
    var target = model.elementPresent;
    var setCss = app.core.setCss(target,name,value);
    console.log("setcss name,value", name, value, setCss);
    console.log("setcss",setCss);
    return setCss;
}
function setTemplate(e) {
    if(e && e.detail && e.detail.target.nodeType !=1){
        model.isVisible = false;
        t.set("",model);
        return;
    }
    var d = e.detail;
    var properties = d.cssRules.properties;
    model.elementPresent = d.target;
    model.transform = properties.transform ? properties.transform.value : d.styles.transform;
    model.transformOrigin = properties["transform-origin"] ? properties["transform-origin"].value :
        d.styles.transformOrigin;
    model.transformStyle = properties["transform-style"] ? properties["transform-style"].value :
        d.styles.transformStyle;
    model.perspective = properties.perspective ? properties.perspective.value : d.styles.perspective;
    model.perspectiveOrigin = properties["perspective-origin"] ? properties["perspective-origin"].value :
        d.styles.perspectiveOrigin;
    model.functions = matchTransformFunctions(model.transform).reverse()
        .map((v,i)=>{v.index=i;return v});
    model.isVisible = true;
    t.set("",model);
    inputCss(appView);
}
let tabSelected = document.getElementById("general-transform");
// tabs
let tabsLinks = appView.querySelectorAll(".tab-component-buttons span");
[...tabsLinks].forEach(tabLink=>tabLink.addEventListener("click",e=>{
    e.preventDefault();
    if(e.target.classList.contains("selected"))
        return;
    e.target.parentNode.querySelector(".selected").classList.remove("selected");
    e.target.classList.add("selected");
    var tabIdToSelect = e.target.dataset.href;
    var newTabSelected = document.getElementById(tabIdToSelect);
    tabSelected.style.display = "none";
    newTabSelected.style.display = "block";
    tabSelected = newTabSelected;
}));
function matchTransformFunctions(string) {
    var m;
    var tokens = [];
    var index = 0;
    while(string && (m=string.match(/([a-zA-Z0-9]+)\([^)]*\)/))){
        var token = {
            name : m[1],
            value : m[0].replace(m[1] + "(", "").replace(")", ""),
            index
        };
        tokens.push(token);
        string = string.substring(m.index+m[1].length);
        index++;
    }
    return tokens;
}
appView.addEventListener("click",e=>{
    if(e.target.classList.contains("remove-function")){
        model.functions.splice(+e.target.dataset.index,1);
        var transform = model.functions.length ?
            model.functions.map(v=>v.name+"("+v.value+")").reverse().join(" ") : "none";
        model.transform = setCss("transform",transform);
        //model.elementPresent.click();
        t.set("",model);
    }
    if(e.target.classList.contains("add-function")){
        var newToken = matchTransformFunctions(model.transformNewType);
        newToken[0].index = model.functions.length;
        t.set("functions",model.functions.concat(newToken));
        inputCss(appView);
    }
})
appView.addEventListener("blur",e=> {
    if (!e.target.classList.contains("input-css"))
        return;
    if(!e.target.dataset.cssProp)
        return;
    if(e.target.dataset.value == e.target.innerText)
        return;
    model.elementPresent.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
},true);
appView.addEventListener("input",e=>{
    var target = e.target;
    if(!target.classList.contains("input-css"))
        return;
    var prop = target.dataset.cssProp;
    if(prop){
        var value = target.innerText;
        var newSetted = setCss(prop, value);
    }
},true);
appView.addEventListener("input",e=>{
    if(e.target.dataset.type != "transform-function")
        return;
    model.functions[+e.target.dataset.index].value = e.target.textContent.trim();
    var transform = model.functions.map(v=>v.name+"("+v.value+")").reverse().join(" ");
    setCss("transform",transform);
    //t.set("transform",transform);
    //inputCss(appView);
});
appView.addEventListener("blur",e=>{
    if(e.target.dataset.type != "transform-function")
        return;
    //model.functions[Number(e.target.dataset.index)].value = e.target.textContent.trim();
    //var transform = model.functions.map(v=>v.name+"("+v.value+")").reverse().join(" ");
    //setCss("transform",transform);
    //t.set("transform",transform);
    //inputCss(appView);
    model.elementPresent.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
},true);
var dragList = __dragList(appView,{
    noDrop:true,
    handlerSelector : ".handler"
});
dragList.on("move",moveObj=>{
    var targetIndex = moveObj.target[0].dataset.index;
    var newIndex = (moveObj.prev && moveObj.prev.dataset.index) || 0;
    var swap = model.functions[targetIndex];
    model.functions.splice(targetIndex,1);
    model.functions.splice(newIndex,0,swap);
    var transform = model.functions.map(v=>v.name+"("+v.value+")").reverse().join(" ");
    setCss("transform",transform);
    t.set("transform",transform);
    inputCss(appView);
});

})();
(()=>{
const opener = window.opener || window.parent;
const app = opener.tilepieces;
let d; // cached detail
let selectedAnimation = null;
let selectedKeyframe = null;
window.cssDefaults = app.cssDefaultValues;
const appView = document.getElementById("animations");
let newAnimationButton = appView.querySelector("#new-animation");
/*
let deleteAnimationButton = appView.querySelector("#delete-animation");
let newKeyframeButton=appView.querySelector("#new-keyframe");
let deleteKeyframe=appView.querySelector("#delete-keyframe");
*/
let model = {
    cssDefaultProperties :app.cssDefaultProperties,
    isVisible: false,
    animations : []
};
let t = new opener.TT(appView,model,{
    templates : [{
        name : "css-properties-list",
        el : document.getElementById("css-properties-list").content
    }]
});
css_rule_modification({
    tilepiecesTemplate : t,
    tilepiecesTemplateModel : model,
    appView
});
if(app.elementSelected)
    setTemplate({detail:app.cssSelectorObj});
opener.addEventListener("highlight-click",setTemplate);
opener.addEventListener("edit-mode",e=> {
    if(!app.editMode)
        t.set("isVisible",false);
    /*
    else{
        model.animations = app.core.styles.animations.slice(0).map(mapAnimations);
        model.deleteRuleDisabled="animation__disabled";
        t.set("",model);
        inputCss(appView);
    }*/
});
window.debugModel = model;
appView.addEventListener("blur",e=> {
    if (!e.target.classList.contains("input-css"))
        return;
    if(!e.target.dataset.cssProp)
        return;
    if(e.target.dataset.value == e.target.innerText)
        return;
    model.elementPresent.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
},true);
appView.addEventListener("css-input-set-text",e=>{
    model.elementPresent.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
},true);
appView.addEventListener("input",e=>{
    var target = e.target;
    if(!target.classList.contains("input-css"))
        return;
    var prop = target.dataset.cssProp;
    if(prop){
        var value = target.innerText;
        var newSetted = setCss(prop, value);
    }
},true);
function getProp(name,_default){
    return model._properties[name] ? model._properties[name].value : (_default || model._styles[name]);
}
function mapAnimations(animationRule,index){
    var contenteditable = animationRule.parentStyleSheet == app.core.currentStyleSheet ? "contenteditable" : "";
    return {
        name:animationRule.name,
        cssRules:mapKeyframes([...animationRule.cssRules],contenteditable),
        contenteditable,
        show:false,
        rule:animationRule,
        index
    }
}
function mapKeyframes(keyframes,contenteditable){
    return keyframes.map((keyframe,kindex)=>{
        var isEditable = contenteditable == "contenteditable";
        var properties = opener.getCssTextProperties(keyframe.style.cssText).map((v,i)=>{
            v.index=i;
            v.checked = true;
            v.disabled = contenteditable ? "" : "disabled";
            v.contenteditable = contenteditable;
            v.autocomplete_suggestions = window.cssDefaults[v.property] || [];
            return v
        });
        var hasCachedProperties = opener.tilepieces.core.cachedProperties.find(v=>v.rule == newRule.rule);
        if(hasCachedProperties){
            hasCachedProperties.properties.forEach(v=>{
                if(properties.find(pr=>pr.property == v.property && pr.value == v.value)){
                    var indexCached = hasCachedProperties.properties.findIndex(hc=>hc.property == v.property && hc.value == v.value);
                    hasCachedProperties.properties.splice(indexCached, 1);
                    if (!hasCachedProperties.properties.length) {
                        opener.tilepieces.core.cachedProperties.splice(opener.tilepieces.core.cachedProperties.indexOf(hasCachedProperties), 1);
                    }
                    return;
                }
                v.index = properties.length;
                v.disabled = isEditable ? "" : "disabled";
                v.contenteditable = isEditable && v.checked ? "contenteditable" : "";
                properties.push(v);
            })
        }
        return{
            keyText : keyframe.keyText,
            properties,
            isEditable,
            contenteditable,
            rule:keyframe,
            index:kindex
        }}).sort((a, b) =>{
            var c1 = a.keyText.match(/\d+/)[0];
            var c2 = b.keyText.match(/\d+/)[0];
            return c1 - c2;
        })
}
function setCss(name,value){
    var target = model.elementPresent;
    var setCss = app.core.setCss(
        target,name,value,model.selector);
    console.log("setcss", name, value);
    return setCss;
}
function setTemplate(e){
    if(e && e.detail && e.detail.target.nodeType !=1){
        model.isVisible = false;
        t.set("",model);
        return;
    }
    d = e ? e.detail : d; // cached detail
    model.elementPresent = d.target;
    model.match = d.match;
    model.isVisible = true;
    model._properties = d.cssRules.properties;
    model._styles = d.styles;
    model.animation = getProp("animation");
    model.animationName = getProp("animation-name");
    model.animationDuration = getProp("animation-duration");
    model.animationTimingFunction = getProp("animation-timing-function");
    model.animationDelay = getProp("animation-delay");
    model.animationIterationCount = getProp("animation-iteration-count");
    model.animationDirection = getProp("animation-direction");
    model.animationFillMode = getProp("animation-fill-mode");
    model.animationPlayState = getProp("animation-play-state");
    model.transition = getProp("transition");
    model.transitionProperty = getProp("transition-property");
    model.transitionDuration = getProp("transition-duration");
    model.transitionTimingFunction = getProp("transition-timing-function");
    model.transitionDelay = getProp("transition-delay");
    model.animations = app.core.styles.animations.slice(0).map(mapAnimations);
    model.deleteRuleDisabled="animation__disabled";
    t.set("",model);
    inputCss(appView);
}

let tabSelected = document.getElementById("general-animations");
// tabs
let tabsLinks = appView.querySelectorAll(".tab-component-buttons span");
[...tabsLinks].forEach(tabLink=>tabLink.addEventListener("click",e=>{
    e.preventDefault();
    if(e.target.classList.contains("selected"))
        return;
    e.target.parentNode.querySelector(".selected").classList.remove("selected");
    e.target.classList.add("selected");
    var tabIdToSelect = e.target.dataset.href;
    var newTabSelected = document.getElementById(tabIdToSelect);
    tabSelected.style.display = "none";
    newTabSelected.style.display = "block";
    tabSelected = newTabSelected;
}));
appView.addEventListener("blur",e=>{
    if(e.target.dataset.bind!="animation.name")
        return;
    var ruleBlock = e.target.closest(".animation__rule-block");
    var rule = ruleBlock.__animation;
    try {
        app.core.setRuleName(rule.rule,e.target.innerText);
    }
    catch(e){
    }
    rule.name = rule.rule.name;
    t.set("",model);
},true);
appView.addEventListener("blur",e=>{
    if(!e.target.classList.contains("keyframe__rule__selector-name"))
        return;
    var ruleBlock = e.target.closest(".keyframe__rule-block");
    var rule = ruleBlock["__keyframe-rule"];
    var selectorText = e.target.innerText.trim();
    try {
        app.core.setKeyText(rule.rule,selectorText);
    }
    catch(e){
    }
    rule.keyText = rule.rule.keyText;
    t.set("",model);
},true);
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("delete-animation"))
        return;
    var ruleBlock = e.target.closest(".animation__rule-block");
    var rule = ruleBlock.__animation.rule;
    //var parent = rule.parentRule || rule.parentStyleSheet;
    //app.core.deleteCssRule(parent,[...parent.cssRules].indexOf(rule));
    app.core.deleteCssRule(rule);
    var index = +ruleBlock.dataset.index;
    model.animations.splice(index,1);
    t.set("",model)
});
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("delete-keyframe"))
        return;
    var ruleBlock = e.target.closest(".animation__rule-block");
    var rule = ruleBlock.__animation;
    app.core.deleteKeyframe(rule.rule,rule.cssRules[+e.target.dataset.index].rule);
    rule.cssRules = mapKeyframes([...rule.rule.cssRules]);
    t.set("",model);
    inputCss(appView);
});
let modalNewAnimation=document.getElementById("modal-new-animation");
let newAnimationForm=document.getElementById("new-animation-form");
let newAnimationError=document.getElementById("new-animation-error");
let newAnimationName=document.getElementById("new-animation-name");
let modalNewAnimationClose=modalNewAnimation.querySelector(".modal-animation-close");
newAnimationButton.addEventListener("click",e=>{
    newAnimationForm[0].value = "";
    modalNewAnimation.style.display="block";
    newAnimationError.style.display="none";
    document.body.classList.add("modal");
    newAnimationForm[0].focus();
});
modalNewAnimationClose.addEventListener("click",e=>{
    modalNewAnimation.style.display="none";
    document.body.classList.remove("modal");
});
newAnimationName.addEventListener("input",e=>{
    newAnimationError.style.display="none";
});
modalNewAnimation.addEventListener("keydown",e=> {
    if (e.key == "Escape")
        modalNewAnimationClose.click();
},true);
newAnimationForm.addEventListener("submit",e=>{
    e.preventDefault();
    var value = e.target[0].value.trim();
    if(!value) {
        newAnimationError.style.display="block";
        return;
    }
    if(model.animations.find(v=>v.name == value)){
        // TODO
        newAnimationError.style.display="block";
        return;
    }
    if(!app.core.currentStyleSheet){
        app.core.
            createCurrentStyleSheet("");
    }
    var newRule;
    try {
        newRule = app.core.insertCssRule(app.core.currentStyleSheet,"@keyframes "+value+"{0%{}100%{}}");
    }
    catch(e){
        newAnimationError.style.display="block";
        return;
    }
    app.core.appendKeyframe(newRule,"0%{}");
    app.core.appendKeyframe(newRule,"100%{}");
    var newAnimation = app.core.currentStyleSheet.cssRules[app.core.currentStyleSheet.cssRules.length-1];
    app.core.styles.animations.push(newAnimation);
    var newMappedAnimation = mapAnimations(newAnimation,model.animations.length);
    var alreadySel = model.animations.find(a=>a.show);
    alreadySel && (alreadySel.show=false);
    newMappedAnimation.show = true;
    model.animations.push(newMappedAnimation);
    t.set("",model);
    modalNewAnimationClose.click();
    var animationKeyframe = appView.querySelector(".animation_keyframe.true");
    appView.ownerDocument.defaultView.scrollTo(0,animationKeyframe.offsetTop);
});
let modalNewKeyframe=document.getElementById("modal-new-keyframe");
let newKeyframeForm=document.getElementById("new-keyframe-form");
let newKeyframeError=document.getElementById("new-keyframe-error");
let newKeyframeName=document.getElementById("new-keyframe-name");
let modalNewKeyframeClose=modalNewKeyframe.querySelector(".modal-animation-close");
let ruleWhereToAppendKeyFrame;
appView.addEventListener("click",e=>{
    if(!e.target.closest(".new-keyframe"))
        return;
    newKeyframeForm.value = "";
    var ruleBlock = e.target.closest(".animation__rule-block");
    ruleWhereToAppendKeyFrame = ruleBlock.__animation;
    modalNewKeyframe.style.display="block";
    newKeyframeError.style.display="none";
    document.body.classList.add("modal");
    newKeyframeForm.focus();
});
modalNewKeyframeClose.addEventListener("click",e=>{
    modalNewKeyframe.style.display="none";
    document.body.classList.remove("modal");
});
newKeyframeName.addEventListener("input",e=>{
    newKeyframeError.style.display="none";
});
modalNewKeyframe.addEventListener("keydown",e=> {
    if (e.key == "Escape")
        modalNewKeyframeClose.click();
},true);
newKeyframeForm.addEventListener("submit",e=>{
    e.preventDefault();
    var value = e.target[0].value.trim();
    if(!value) {
        newKeyframeError.style.display="block";
        return;
    }
    try {
        app.core.appendKeyframe(ruleWhereToAppendKeyFrame.rule,value+"%{}");
    }
    catch(e){
        newKeyframeError.style.display="block";
        return;
    }
    ruleWhereToAppendKeyFrame.cssRules = mapKeyframes([...ruleWhereToAppendKeyFrame.rule.cssRules]);
    t.set("",model);
    modalNewKeyframeClose.click();
});
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("open-animation"))
        return;
    var ruleBlock = e.target.closest(".animation__rule-block");
    var rule = ruleBlock.__animation;
    var toggle = !rule.show;
    model.animations.forEach(v=>{if(v.show)v.show=!toggle});
    rule.show = toggle;
    t.set("",model)
})

})();
(()=>{
const opener = window.opener || window.parent;
let app = opener.tilepieces;
window.app = app;
window.cssDefaults = app.cssDefaultValues;
const appView = document.getElementById("css-text");
let fontAlreadyDeclared = [];
let textShadowEls = [];
const commaToNotTakeInConsideration = /rgb\([^)]*\)|rgba\([^)]*\)|hsl\([^)]*\)|hsla\([^)]*\)/;
const fontFamilyInput = document.getElementById("font-family-input");
var model = {
    isVisible : false,
    textShadows : []
};
opener.addEventListener("highlight-click",setTemplate);
opener.addEventListener("edit-page",e=>{
    if(!e.detail)
        t.set("",{isVisible : false});
});
opener.addEventListener("edit-mode",e=> {
    if(!app.editMode)
        t.set("",{isVisible : false});
});
opener.addEventListener("html-rendered",e=>{
    t.set("",{isVisible : false});
});
autocomplete(appView);
let t = new opener.TT(appView,model);
if(app.elementSelected)
    setTemplate({detail:app.cssSelectorObj});

tilepieces_tabs({
    el : document.getElementById("tab-css-text")
});

appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("color-button"))
        return;
    var target = e.target;
    var cssProperty = target.dataset.cssProp;
    var throttle;
    app.colorPicker(target.style.backgroundColor).onChange(c=>{
        clearTimeout(throttle);
        throttle = setTimeout(()=> {
            if(target.dataset.textShadow){
                model.textShadows[target.dataset.index].color = c.hex;
                model.textShadow = setTextShadow(model.textShadows);
            }
            else {
                model.realColor = c.hex;
                model.color = setCss(cssProperty, c.hex);
            }
            t.set("",model);
            inputCss(appView)
        },32)
    })
})
/*
appView.addEventListener("template-digest",e=>{
    var target = e.detail.target;
    if(target.dataset.cssProp && target.value){
        setCss(target.dataset.cssProp,target.value);
        inputCss(appView);
    }
},true);*/
/*
appView.addEventListener("css-input-set-text",e=> {
    if (!e.target.classList.contains("input-css"))
        return;
    t.set("",model);
},true);*/
appView.addEventListener("blur",e=> {
    if (!e.target.classList.contains("input-css"))
        return;
    if(!e.target.dataset.cssProp)
        return;
    if(e.target.dataset.value == e.target.innerText)
        return;
    model.elementPresent.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
},true);
appView.addEventListener("input",e=>{
    var target = e.target;
    if(!target.classList.contains("input-css"))
        return;
    var prop = target.dataset.cssProp;
    if(prop){
        var value = target.innerText;
        var newSetted = setCss(prop, value);
    }
},true);
appView.addEventListener("template-digest",e=>{
    var target = e.detail.target;
    if(target.dataset.textShadow){
        if(target.dataset.bind=="textShadowValue.blurToSlider")
            model.textShadows[target.dataset.index][target.dataset.textShadow] = target.value;
        model.textShadow = setTextShadow(model.textShadows);
        t.set("",model);
        inputCss(appView);
        setTextShadowSVGtoXY();
    }
},true);
appView.addEventListener("css-input-set-text",e=> {
    if (!e.target.classList.contains("input-css") ||
        e.target.dataset.cssPropJs!="textShadow")
        return;
    mapTextShadow(e.target.innerText.trim());
    t.set("",model);
    setTextShadowSVGtoXY();
},true);
/*
appView.addEventListener("blur",e=>{
    var target = e.target;
    if(target.dataset.textShadow){

    }
},true);*/
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("add-text-shadow"))
        return;
    model.textShadows.push({
        index : model.textShadows.length,
        color : "rgb(0,0,0)",
        offsetX : 0,
        offsetY : 0,
        blur : 0,
        blurToSlider :0
    });
    model.textShadow = setTextShadow(model.textShadows);
    t.set("",model);
    inputCss(appView);
    setTextShadowSVGtoXY();
});
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("remove-text-shadow"))
        return;
    var index = +e.target.dataset.index;
    model.textShadows.splice(index,1);
    model.textShadow = setTextShadow(model.textShadows);
    if(!model.textShadow)
        model.elementPresent.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
    else {
        t.set("", model);
        inputCss(appView);
    }
});
function getProp(name,_default){
    return model._properties[name] ? model._properties[name].value : (_default || model._styles[name]);
}
function mapTextShadow(textShadowStat){
    if(textShadowStat == "none"){
        model.textShadows = []
    }
    else{
        var textShadows =  app.utils.splitCssValue(textShadowStat);//splitTextShadow();
        model.textShadows = textShadows.map((s,index)=>{
            var colorMatch = s.match(app.utils.colorRegex);
            var values = s.match(app.utils.valueRegex);
            var numberoffsetX = values[0].match(app.utils.numberRegex);
            var numberoffsetY = values[1].match(app.utils.numberRegex);
            var blur = values[2] ?  values[2].match(app.utils.numberRegex) : 0;
            var blurToSlider = !blur ? 0 : blur[0];
            return {
                index,
                color : colorMatch ? colorMatch[0] : "rgb(0,0,0)",
                offsetX : numberoffsetX ? numberoffsetX[0] : 0,
                offsetY : numberoffsetY ? numberoffsetY[0] : 0,
                blur : blurToSlider,
                blurToSlider
            }
        })
    }
}
function setCss(name,value){
    var target = model.elementPresent;
    var setCss = app.core.setCss(target,name,value);
    console.log("setcss", name, value);
    return setCss;
}
function setTemplate(e){
    if(e && e.detail && e.detail.target.nodeType !=1){
        model.isVisible = false;
        t.set("",model);
        return;
    }
    var d = e.detail;
    model.match = d.match;
    model.isVisible = true;
    model._properties = d.cssRules.properties;
    model._styles = d.styles;
    model.elementPresent = d.target;
    model.fatherStyle = d.fatherStyle || {display:"none"}; // HTML TAG HAS NO FATHER
    var fatherStyle = model.fatherStyle;
    model.fontSize = getProp("font-size");
    model.fontFamily = getProp("font-family");
    model.fontWeight = getProp("font-weight");
    model.fontStyle = getProp("font-style");
    model.lineHeight = getProp("line-height");
    model.textAlign = getProp("text-align");
    model.realColor = d.styles["color"];
    model.color = getProp("color");
    model.textDecoration = getProp("text-decoration");
    model.textTransform = getProp("text-transform");
    model.textIndent = getProp("text-indent");
    model.letterSpacing = getProp("letter-spacing");
    model.wordSpacing = getProp("word-spacing");
    model.textShadow = getProp("text-shadow");
    mapTextShadow(d.styles.textShadow);
    t.set("",model);
    inputCss(appView);
    setTextShadowSVGtoXY();
}

function setTextShadow(textShadows) {
    var newTextShadows = textShadows.map(ts=> {
        return ts.offsetX + "px " + ts.offsetY + "px " + ts.blur + "px " + ts.color;
    }).join(",");
    return setCss("text-shadow", newTextShadows);
}
function setTextShadowSVGtoXY(){
    var textShadowElsDOM = appView.querySelectorAll(".text-shadow");
    textShadowElsDOM.forEach(tse=>{
        var svg = tse.querySelector("svg");
        var textShadow = svg.closest(".text-shadow");
        var isAlreadyShadow = textShadowEls.find(v=>v.target==svg);
        var offsetXInput = textShadow.querySelector("[data-text-shadow=offsetX]");
        var offsetYInput = textShadow.querySelector("[data-text-shadow=offsetY]");
        if(!isAlreadyShadow){
            var newSvgTextShadow = SVGtoXY(svg);
            // 100 = svg width / 2
            // 5 : arbitrary change value on axis
            var throttle;
            newSvgTextShadow.onChange((x,y)=>{
                clearTimeout(throttle);
                throttle = setTimeout(()=>{
                    var xAxis = Math.trunc((x-100)/5);
                    var yAxis = Math.trunc((y-100)/5);
                    //offsetXInput.value = xAxis;
                    //offsetYInput.value = yAxis;
                    model.textShadows[svg.dataset.index].offsetX = xAxis;
                    model.textShadows[svg.dataset.index].offsetY = yAxis;
                    model.textShadow = setTextShadow(model.textShadows);
                    t.set("",model);
                    inputCss(appView);
                })
            });
            newSvgTextShadow.setXY((offsetXInput.value * 5)+100,(offsetYInput.value * 5)+100);
            textShadowEls.push(newSvgTextShadow);
        }
        else{
            isAlreadyShadow.setXY((offsetXInput.value * 5)+100,(offsetYInput.value * 5)+100);
        }
    })
}
// todo remove
function splitTextShadow(textShadow){
    var textShadowSwap = textShadow;
    var commas = [];
    var possibleComma = textShadow.indexOf(",");
    var falseIndex = 0;
    var count = 0;
    while(possibleComma>-1){
        var falseComma = textShadowSwap.match(commaToNotTakeInConsideration);
        if(!falseComma ||
            (possibleComma<falseComma.index ||
            possibleComma>(falseComma.index + falseComma[0].length))){
            commas.push(falseIndex + possibleComma);
            falseIndex+= possibleComma
        }
        else falseIndex = falseIndex + falseComma[0].length;
        textShadowSwap = textShadowSwap.substring(falseIndex);
        possibleComma = textShadowSwap.indexOf(",");
        count++;
        if(count>50000)
            throw new Error(["textShadow",textShadow,"textShadowSwap",textShadowSwap,"possibleComma",possibleComma,
                "falseIndex",falseIndex].join(","))
    }
    if(!commas.length)
        return[textShadow];
    else {
        var textShadows = [];
        var start = 0;
        commas.forEach((c,i,a)=> {
            textShadows.push(textShadow.substring(start,start+c).trim());
            if(i == a.length-1){
                textShadows.push(textShadow.substring(start+c+1,textShadow.length).trim());
            }
            start = c;
        });
        return textShadows;
    }
}

})();
(()=>{
const opener = window.opener || window.parent;
const appView = document.getElementById("css-viewer");
const app = opener.tilepieces;
// the same in cssMatcher
const mainPseudoRegex = /(:{1,2}before|:{1,2}after|:{1,2}first-letter|:{1,2}first-line|::[a-z-]+)(?=$|,)/;
// the same in cssMatcher
const PSEUDOSTATES = /(:hover|:active|:focus|:focus-within|:visited)(?=$|:|\s|,)/;
const replacePseudos = new RegExp(mainPseudoRegex.source + "|" + PSEUDOSTATES.source,"g");
let model = {
  isVisible : false,
  groupingRules : [],
  selectorMatch : true,
  mediaQueries : [],
  mediaQueryUIMask : "min-max-width",
  mediaQueryUIMinWidth : 0,
  mediaQueryUIMaxWidth : 0,
  newGroupingType : "0",
  supportCondition : "",
  mediaQueryMainLogicalOperator : "",
  newgrbuttondisabled : "disabled",
  mediaQueryUIFreeHand : "",
  mediaQueryUICheck : true,
  mediaqueryuidisabled : "disabled",
  mediaQueryUIMaskMediaType : "screen",
  mediaQueryUIMaskFeatures : [],
  relatedSelectors : []
};
let d; // cached detail
let addGrButton = document.getElementById("add-gr-rule");
const modalNewGr = document.getElementById("modal-new-gr");
let addQueryAppliedCond = ""; // new media condition
let appendOn = null; // gr to append new media rule
let mediaQueryUiMask = document.getElementById("media-query-UI-mask");
let t = new opener.TT(appView,model);
opener.addEventListener("highlight-click",setTemplate);
/*
opener.addEventListener("edit-mode",e=> {
    if(!app.editMode)
        document.body.style.display = "none";
    else
        document.body.style.display = "block";
        //t.set("isVisible",false)
    model.currentSelector = app.cssSelector;
    t.set("",model);
});*/
opener.addEventListener("deselect-element",e=> {
    document.body.style.display = "none";
});
opener.addEventListener("frame-unload",e=> {
  document.body.style.display = "none";
});
opener.addEventListener("html-rendered",e=>{
    //model.isVisible = false;
    //t.set("",model);
});
opener.addEventListener("frame-resize",e=>{
    if(!model.isVisible)
        return;
  /*
    model.groupingRules = mapGrouping(app.core.styles.conditionalGroups);
    model.grChosen = model.groupingRules.find(v=>v.isCurrentGr);
    t.set("",model);*/
  app.elementSelected.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}))
});
// main tabs
tilepieces_tabs({
    el : document.getElementById("main-tab"),
    onSelect : ()=>{
        app.elementSelected.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}))
    }
});
if(app.elementSelected)
  setTemplate({detail:{target:app.elementSelected}})
    //app.elementSelected.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));

opener.addEventListener("cssMapper-changed",e=>{
    model.isVisible &&
    app.elementSelected &&
    app.elementSelected.dispatchEvent(new PointerEvent("pointerdown",{bubbles: true}));
});

appView.addEventListener("click",e=>{
  if(!e.target.classList.contains("delete-gr-rule"))
      return;
  var index = +e.target.dataset.index;
  var gr = model.groupingRules[index];
  app.core.deleteCssRule(gr.rule);
  // this will run "cssMapper-changed"
});
let groupingRuleTrigger = appView.querySelector(".css-selector-gr-trigger");
/*
groupingRuleTrigger
  .addEventListener("click",e=>{
      //if(e.target.closest(".css-selector-gr-data"))
      if(e.target.classList.contains("delete-gr-rule"))
          return;
      groupingRuleTrigger.classList.toggle("open");
  });*/
appView.addEventListener("click",e=>{
  if(!e.target.classList.contains("grouping-condition"))
    return;
  var item = e.target.closest(".grouping-rule-item");
  if(!item)
      return;
  var selected = item.dataset.iscurrent == "true";
  var index = item.dataset.index;
  app.core.currentMediaRule = !selected ? model.groupingRules[index].rule : null;
  model.groupingRules = mapGrouping(app.core.styles.conditionalGroups);
  model.grChosen = model.groupingRules.find(v=>v.isCurrentGr);
  t.set("", model);
});
function mapGrouping(grules){
  var currentStyle = app.core.currentStyleSheet;
  return grules.reduce((filtered, option)=> {
    if(option.rule.parentStyleSheet != currentStyle)
        return filtered;
    var type = option.rule.type;
    var isMatch = type == window.CSSRule.SUPPORTS_RULE
        ? app.core.currentWindow.CSS.supports(option.rule.conditionText)
        : type == window.CSSRule.MEDIA_RULE
        ? app.core.currentWindow.matchMedia(option.rule.conditionText).matches
        : null;
    if(!isMatch)
        return filtered;
    var parentRule = option.rule.parentRule;
    while(parentRule){
        isMatch = parentRule.type == window.CSSRule.SUPPORTS_RULE
            ? app.core.currentWindow.CSS.supports(parentRule.conditionText)
            : parentRule.type == window.CSSRule.MEDIA_RULE
            ? app.core.currentWindow.matchMedia(parentRule.conditionText).matches
            : null;
        if(!isMatch)
            return filtered;
        parentRule = parentRule.parentRule;
    }
    option.isCurrentGr = app.core.currentMediaRule == option.rule;
    option.index = filtered.length;
    filtered.push(option);
    return filtered;
  }, []);
}
appView.addEventListener("click",e=>{
  if(!e.target.classList.contains("related-selectors-select"))
    return;
  e.preventDefault();
  if(model.relatedSelectors.length<=1)
    return;
  if(app.multiselected) {
    app.destroyMultiselection();
  }
  app.enableMultiselection();
  model.relatedSelectors.forEach(node=>{
    app.createSelectionClone(node)
  });
  setTimeout(()=>app.destroyMultiselection(),1500);
});
appView.addEventListener("template-digest",e=>{
  // Input. On 'blur', event should not fired because the old value will be equal the new one ( see TT bindingEl )
  var el = model.elementPresent;
  var selectorText = model.currentSelector.trim();
  var selectorTextsWithoutPseudos = selectorText.replace(replacePseudos,"");
    try {
      model.selectorMatch = el.matches(selectorTextsWithoutPseudos);
      model.relatedSelectors = app.core.currentDocument.querySelectorAll(
        selectorTextsWithoutPseudos);
    }
    catch (e) {
        model.selectorMatch = false;
    }

    t.set("",model);
});
appView.addEventListener("currentSelector",e=>{
    // see above
    if(e.detail.type != "blur")
        return;
    if(!model.selectorMatch){
        model.currentSelector = app.cssSelector;
        model.selectorMatch = true;
    }
    else {
        model.currentSelector = model.currentSelector.trim();
        app.cssSelector = model.currentSelector;
    }
    t.set("",model);
});
appView.addEventListener("keydown",e=>{
    if(e.target.dataset.bind=="currentSelector"){
        if(e.key == "Enter")
            e.preventDefault();
    }
});
function setTemplate(e){
  if(e && e.detail && e.detail.target.nodeType !=1){
    document.body.style.display = "none";
    model.isVisible = false;
    t.set("",model);
    return;
  }
  d = e ? e.detail : d; // cached detail
  document.body.style.display = "block";
  model.elementPresent = d.target;
  model.match = d.match;
  model.groupingRules = mapGrouping(app.core.styles.conditionalGroups);
  model.grChosen = model.groupingRules.find(v=>v.isCurrentGr);
  model.currentSelector = app.cssSelector;
  model.isVisible = true;
  try {
    model.relatedSelectors = app.core.currentDocument.querySelectorAll(
      app.cssSelector.replace(replacePseudos, ""));
  }
  catch(e){model.relatedSelectors = [app.elementSelected]}
  model.editMode = app.editMode;
  document.body.style.display = "block";
  t.set("",model);
}

addGrButton.addEventListener("click",e=>{
    e.stopPropagation();
    appendOn = model.grChosen ? model.grChosen.rule : null;
    model.mediaQueryUIMaskFeatures = [{logicalOperator : "and",feature:"max-width",
        value:app.core.currentWindow.innerWidth + "px",featureInput:"input",index:0}];
    modalNewGr.style.display="block";
    document.body.classList.add("modal");
    changeMediaCondition()
});
modalNewGr.querySelector(".modal-new-gr-close").addEventListener("click",e=>{
    modalNewGr.style.display="none";
    document.body.classList.remove("modal");
});
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("support-done"))
        return;
    if(appendOn){
        app.core.insertCssRule(appendOn,"@supports " + model.supportCondition + "{}");
    }
    else {
        app.core.setCssMedia("@supports " + model.supportCondition + "{}");
    }
    app.core.runcssMapper()
        .then(styles=>{
            console.log("new @support created -> appendOn ->",appendOn,
                "\nactual rule ->",appendOn ? appendOn.cssRules[appendOn.cssRules.length-1] :
                    app.core.currentStyleSheet.cssRules[app.core.currentStyleSheet.cssRules.length-1]);

            if(model.mediaQueryUICheck)
                app.core.currentMediaRule = appendOn ? appendOn.cssRules[appendOn.cssRules.length-1] :
                    app.core.currentStyleSheet.cssRules[app.core.currentStyleSheet.cssRules.length-1];
            model.newGroupingType="0";
            model.grFreehand = "";
            model.newgrbuttondisabled = "disabled";
            setTemplate();
            modalNewGr.style.display="none";
            document.body.classList.remove("modal");
        });
});
appView.addEventListener("supportCondition",e=>{
    var d = e.detail;
    d.target.value = d.target.value.trim();
    var support;
    try {
        support = app.core.currentWindow.CSS.supports(d.target.value)
    }
    catch(e){}
    if(!support)
        model.newgrbuttondisabled = "disabled";
    else
        model.newgrbuttondisabled = "";
});
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("add-media-feature"))
        return;
    model.mediaQueryUIMaskFeatures.push(
        {logicalOperator : "and",feature:"max-width",
            mediaQueryMainLogicalOperator : "",
            value:app.core.currentWindow.innerWidth + "px",featureInput:"input",index:0}
    );
    changeMediaCondition();
});
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("delete-feature"))
        return;
    model.mediaQueryUIMaskFeatures.splice(e.target.dataset.index,1);
    model.mediaQueryUIMaskFeatures = model.mediaQueryUIMaskFeatures.map((v,i)=>{
        v.index=i;
        return v;
    });
    changeMediaCondition();
});
appView.addEventListener("change",e=>{
  var target = e.target;
  if(!target.classList.contains("media-feature"))
      return;
  var value = target.value;
  model.mediaQueryUIMaskFeatures[target.dataset.index].featureInput =
      value=="orientation" ? "orientation" : "input";
  if(value!="orientation")
      model.mediaQueryUIMaskFeatures[target.dataset.index].value = value.indexOf("width")>=0 ?
      app.core.currentWindow.innerWidth + "px" :
      app.core.currentWindow.innerHeight + "px";
  changeMediaCondition();
});

function changeMediaCondition(e){
    console.log("changeMediaCondition has been called");
    if(e && (
        (e.detail.target && !e.detail.target.closest("#modal-media-queries")) ||
        (!e.detail.target && modalNewGr.style.display!="block") // resize
        )
    )
        return;
    console.log("changeMediaCondition is processing");
    if(model.mediaQueryUIMask == "min-max-width")
        addQueryAppliedCond =
            (model.mediaQueryMainLogicalOperator ? model.mediaQueryMainLogicalOperator + " " : "") +
            model.mediaQueryUIMaskMediaType +
            model.mediaQueryUIMaskFeatures
                .map(v=>" " + v.logicalOperator + " ("+ v.feature + ":" + v.value+")").join("");
    else
        addQueryAppliedCond = model.mediaQueryUIFreeHand.trim();
    console.log("addQueryAppliedCond",addQueryAppliedCond);
    var matchMedia = app.core.currentWindow.matchMedia(addQueryAppliedCond);
    if(matchMedia.matches){
        model.mediaQueryUIFreeHand = matchMedia.media;
        addQueryAppliedCond = matchMedia.media;
        model.mediaqueryuidisabled = "";
    }
    else
        model.mediaqueryuidisabled = "disabled";
    t.set("",model);
    inputCss(appView);
}
appView.addEventListener("template-digest",changeMediaCondition);
opener.addEventListener("frame-resize",changeMediaCondition);
/*
mediaQueryUiMask.addEventListener("input",e=>{
    if(!e.target.classList.contains("input-css"))
        return;
    model.mediaQueryUIMaskFeatures[e.target.dataset.index].value = e.target.textContent;
    changeMediaCondition();
},true);*/
appView.addEventListener("click",e=>{
    if(!e.target.classList.contains("modal-media-done"))
        return;
    if(appendOn){
        app.core.insertCssRule(appendOn,"@media " + addQueryAppliedCond + "{}");
    }
    else {
        app.core.setCssMedia("@media " + addQueryAppliedCond + "{}");
    }
    app.core.runcssMapper()
        .then(styles=>{

            console.log("new @media created -> appendOn ->",appendOn,
                "\nactual rule ->",appendOn ? appendOn.cssRules[appendOn.cssRules.length-1] :
                    app.core.currentStyleSheet.cssRules[app.core.currentStyleSheet.cssRules.length-1]);

            if(model.mediaQueryUICheck)
                app.core.currentMediaRule = appendOn ? appendOn.cssRules[appendOn.cssRules.length-1] :
                    app.core.currentStyleSheet.cssRules[app.core.currentStyleSheet.cssRules.length-1];
            setTemplate();
            modalNewGr.style.display="none";
            document.body.classList.remove("modal");
        });
});

})();
