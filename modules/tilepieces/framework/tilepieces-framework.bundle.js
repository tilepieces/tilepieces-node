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
(()=>{
function conditionalMap(rule){
    var conditionText = rule.cssText.split("{")[0].trim();
    var inheritedConditionText = "";
    var parentRule = rule.parentRule;
    while(parentRule){
        inheritedConditionText = (inheritedConditionText ? inheritedConditionText + ", " : "") +
            parentRule.cssText.split("{")[0].trim();
        parentRule = parentRule.parentRule;
    }
    return {conditionText,inheritedConditionText,rule}
}
window.conditionalRuleMap = conditionalMap;
var doc = document.implementation.createHTMLDocument("");
let cache = [];
async function createStyle(style){
  var ajaxReq;
  var alreadyParsed = cache.find(v=>v.href && v.href==style.href);
  if(alreadyParsed && alreadyParsed.sheet)
    return alreadyParsed;
  else if(alreadyParsed && !alreadyParsed.sheet)
    return;
  try {
    ajaxReq = await fetch(style.href);
    if(ajaxReq.status != 200)
      throw "404"
  }
  catch(e){
    cache.push({
        href : style.href,
        sheet : null,
        type : "external"
    });
    return;
  }
  var cssText = await ajaxReq.text();
  var innerStyle = doc.createElement("style");
  innerStyle.appendChild(doc.createTextNode(cssText));
  doc.head.appendChild(innerStyle);
  var sheet = {
      href : style.href,
      sheet : innerStyle.sheet,
      type : "external"
  };
  cache.push(sheet);
  return sheet;
}
let trimClassGenerator = /\s|,|\./g;
let trimIdGenerator = /\s|,|\./g;
async function cssMapper(doc,idGenerator,classGenerator){
    var returnObj = {
        styleSheets : [],
        fonts:[],
        fontDeclarations:[],
        animations:[],
        parseRules,
        mediaQueries : [],
        conditionalGroups : [],
        idGenerator : idGenerator ? new RegExp(`#${idGenerator}\\d+(\\s|$|,)`) : idGenerator,
        classGenerator : classGenerator ? new RegExp(`\\.${classGenerator}\\d+(\\s|$|,)`) : classGenerator,
        idIndex : 0,
        classIndex : 0
    };
    for(var i=0;i<doc.styleSheets.length;i++){
        var style = doc.styleSheets[i];
        var rules;
        try{
            rules = style.cssRules;
        }
        catch(e){
            style = await createStyle(style);
            if(style)
                rules = style.sheet.cssRules;
            else
                continue;
        }
        var media = style.media || style.sheet.media;
        if(media && media.length) {
            returnObj.mediaQueries.push({rule: style, children: []});
        }
        await parseRules(rules,returnObj);
        returnObj.styleSheets.push({
            href : style.href,
            sheet : style.sheet || style,
            type : style.type
        });
    }
    return returnObj;
}
window.cssMapper = cssMapper;
let fontModelMap = {
    "font-family" : "fontFamily",
    "font-weight" : "fontWeight",
    "font-style" : "fontStyle",
    "font-display" : "fontDisplay",
    "unicode-range" : "unicodeRange",
    "font-stretch" : "fontStretch",
    "font-variant" : "fontVariant",
    "font-feature-settings" : "fontFeatureSettings",
    "font-variation-settings" : "fontVariationSettings"
}
function isChildOfConditional(conditionalRules,rule){
    var isChildRule;
    for(var i = 0;i<conditionalRules.length;i++){
        var cond=conditionalRules[i];
        isChildRule = isChildOfConditionalRecursion(cond,
            rule.parentRule || rule.parentStyleSheet);
        if(isChildRule)
            break;
    }
    return isChildRule;
}
function isChildOfConditionalRecursion(cond,rule){
    if(cond.rule==rule)
        return cond;
    var r;
    for(var i = 0;i<cond.children.length;i++) {
        r = isChildOfMediaQueryRecursion(cond.children[i], rule);
        if(r)
            break;
    }
    return r;
}
function isChildOfMediaQuery(mediaQueries,rule){
    var isChildRule;
    for(var i = 0;i<mediaQueries.length;i++){
        var mQ=mediaQueries[i];
        isChildRule = isChildOfMediaQueryRecursion(mQ,
            rule.parentRule || rule.parentStyleSheet);
        if(isChildRule)
            break;
    }
    return isChildRule;
}
function isChildOfMediaQueryRecursion(mediaQuery,rule){
    if(mediaQuery.rule==rule)
        return mediaQuery;
    var r;
    for(var i = 0;i<mediaQuery.children.length;i++) {
        r = isChildOfMediaQueryRecursion(mediaQuery.children[i], rule);
        if(r)
            break;
    }
    return r;
}

async function parseRules(rules,returnObj) {
    // SEARCHING FOR IMPORT, FONTS AND ANIMATIONS
    for (var rulei = 0; rulei < rules.length; rulei++) {
        var rule = rules[rulei];
        switch (rule.constructor.name) {
            case "CSSStyleRule":
                if(rule.style.fontFamily && !returnObj.fontDeclarations.includes(rule.style.fontFamily))
                    returnObj.fontDeclarations.push(rule.style.fontFamily);
                if(returnObj.classGenerator){
                    var matchClassGenerator = rule.selectorText.match(returnObj.classGenerator);
                    if(matchClassGenerator) {
                        var number = matchClassGenerator[0].replace(/\s|,|\./g,"").match(/\d+/);
                        if(!number) {
                            console.error("[CSS PARSER - PARSE RULE] error finding classIndex");
                            return
                        }
                        var n = Number(number[0]);
                        if(n > returnObj.classIndex)
                            returnObj.classIndex = n;
                    }
                }
                if(returnObj.idGenerator) {
                    var matchIdGenerator = rule.selectorText.match(returnObj.idGenerator);
                    if (matchIdGenerator) {
                        var number = matchIdGenerator[0].replace(/\s|,|#/g, "").match(/\d+/);
                        if (!number) {
                            console.error("[CSS PARSER - PARSE RULE] error finding idIndex");
                            return
                        }
                        var n = Number(number[0]);
                        if (n > returnObj.idIndex)
                            returnObj.idIndex = n;
                    }
                }
                break;
            case "CSSFontFaceRule":
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
                    src:""
                };
                for(var i = 0;i<rule.style.length;i++) {
                    var prop = rule.style[i];
                    var propMapped = fontModelMap[prop] || prop;
                    mapped[propMapped] = rule.style.getPropertyValue(rule.style[i])
                }
                returnObj.fonts.push({mapped,fontFaceRule : rule,cssText:rule.cssText});
                break;
            case "CSSKeyframesRule":
                returnObj.animations.push(rule);
                break;
            case "CSSImportRule":
                if(rule.media.length) {
                    var isChildRule = isChildOfMediaQuery(returnObj.mediaQueries,rule);
                    if(isChildRule)
                        isChildRule.children.push({rule,children:[]});
                    else
                        returnObj.mediaQueries.push({rule,children:[]});
                }
                try {
                    parseRules(rule.styleSheet.cssRules,returnObj);
                }
                catch (e) {
                    var style = await createStyle(rule.styleSheet);
                    if(style) {
                        await parseRules(style.sheet.cssRules, returnObj);
                        returnObj.styleSheets.push(style);
                    }
                }
                break;
            case "CSSMediaRule":
                var isChildRule = isChildOfMediaQuery(returnObj.mediaQueries,rule);
                if(isChildRule)
                    isChildRule.children.push({rule,children:[]});
                else
                    returnObj.mediaQueries.push({rule,children:[]});
            default:
                if(rule.cssRules) {
                    returnObj.conditionalGroups.push(conditionalMap(rule));
                    parseRules(rule.cssRules, returnObj)
                }
        }
    }
}

})();
function splitCssValue(cssStyle){
    var swap = cssStyle;
    var cursor = 0;
    var tokens = [];
    var values = [];
    var value = "";
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
            values.push(value.trim());
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
(()=>{
function createProps(cssMatches){
    var properties = {};
    cssMatches.forEach(cssR=>{
        for (var i = 0;i<cssR.rule.style.length; i++) {
            var propKey = cssR.rule.style[i];
            var value = cssR.rule.style.getPropertyValue(propKey);
            var priority = cssR.rule.style.getPropertyPriority(propKey);
            var shortHand = isShortHand(propKey);
            var alreadySetted = properties[propKey] ||
                (shortHand && properties[shortHand]);
            if(!alreadySetted ||
              (priority == "important" && !alreadySetted.priority))
                properties[propKey]={value,priority,rule:cssR.rule,type:cssR.type};
        }
        /* THIS VERSION HAS A PROBLEM WITH SHORTHAND VALUES ( EX margin, or border-top )
        var props = cssR.properties;
        for(var i = 0;i<props.length;i++){
            var propKey = props[i].property;
            var value = cssR.rule.style.getPropertyValue(propKey);
            var priority = cssR.rule.style.getPropertyPriority(propKey);
            var alreadySetted;
            var alreadySetted = properties[propKey] || properties[propKey.split("-")[0]];
            if(!alreadySetted)
                properties[propKey]={value,priority};
            else if(priority == "important" && !alreadySetted.priority)
                alreadySetted.value = value;
        }
        */
    });
    return properties;
}
/*
 /:{1,2}(?<name>[-\w\u{0080}-\u{FFFF}]+)(\([^)]*\))?/gu
 /:{1,2}(?<name>[-\w]+)(\([^)]*\))?/gu
 /(:hover)/g
 lea verou : parsel
 /::[a-z-]+|:before|:after|:first-letter|:first-line/
 */
// const mainPseudoRegex = /(:{1,2}before|:{1,2}after|:{1,2}first-letter|:{1,2}first-line|::marker|::selection|::placeholder)(?=$|,)/;
const mainPseudoRegex = /(:{1,2}before|:{1,2}after|:{1,2}first-letter|:{1,2}first-line|::[a-z-]+)(?=$|,)/;
function findPseudoElements(DOMEl,rule,style){
    if(!rule.selectorText.match(mainPseudoRegex))
        return;
    var selectors = splitCssValue(rule.selectorText);
    var specificity = 0;
    var pseudos = [];
    selectors = selectors.map((v,i,a) =>{
        var match = false;
        var pseudoMatch = v.match(mainPseudoRegex);
        if(pseudoMatch){
            var withoutPseudo = v.replace(mainPseudoRegex,"").trim();
            match = DOMEl.matches(withoutPseudo || "*");
            if(match){
                pseudos.push(pseudoMatch[0]);
                var spec = cssSpecificity(v);
                if (spec > specificity)
                    specificity = spec;
            }
        }
        return {
            match,
            string: v,
            selectorText : `${i>0 ? " " : ""}${v}${i<a.length-1 ? "," : ""}`
        }
    });
    if(!pseudos.length)
        return;
    var properties = propertiesMap(getCssTextProperties(rule.style.cssText),false);
    return {
        rule: rule,
        specificity: specificity,
        selectors: selectors,
        properties : properties,
        inheritedProps : false,
        href : style.href,
        type : style.type,
        pseudos
    }
}
/*
 /:{1,2}(?<name>[-\w\u{0080}-\u{FFFF}]+)(\([^)]*\))?/gu
 /:{1,2}(?<name>[-\w]+)(\([^)]*\))?/gu
 /(:hover)/g
 /:hover(?=$|:)/g
 /(:hover|:active|:focus|:focus-within|:{1,2}before|:{1,2}after|::backdrop|:{1,2}first-letter|:{1,2}first-line|::marker|::selection|::placeholder)(?=$|:|\s|,)/g
 lea verou : parsel (https://github.com/LeaVerou/parsel)
 let specialPseudoMatch = [{
 regex: "::placeholder",
 allowedNodes: ["INPUT", "TEXTAREA"]
 }];
 */
const PSEUDOSTATES = /(:hover|:active|:focus|:focus-within|:visited)(?=$|:|\s|,)/g;
function findPseudoStates(DOMEl,rule,style){
    if(!rule.selectorText.match(PSEUDOSTATES))
        return;
    var selectors = splitCssValue(rule.selectorText);
    var specificity = 0;
    var pseudos = [];
    selectors = selectors.map((v,i,a) =>{
        v = v.trim();
        var match = false;
        var pseudoMatches = v.match(PSEUDOSTATES);
        if(pseudoMatches){
            // .ekko-lightbox-nav-overlay a > :focus ( original .ekko-lightbox-nav-overlay a>:focus )
            var withoutPseudo="";
            var m,index=0,count=0;
            while((m=PSEUDOSTATES.exec(v))){
                withoutPseudo+=v.substring(index, m.index);
                index=m.index + m[0].length;
                var previousI = m.index-1;
                if(previousI < 0 || v.charAt(previousI).match(/\s/)){
                    withoutPseudo+="*";
                }
                count++;
                if(count>500000){
                    console.error("v,withoutPseudo,m,index ->",v,withoutPseudo,m,index);
                    throw "error in parsing pseudostates";
                }
            }
            //var withoutPseudo = v.replace(PSEUDOSTATES,"").trim();
            match = DOMEl.matches(withoutPseudo);
            if(match){
                pseudoMatches.forEach(p=>pseudos.indexOf(p)<0 && pseudos.push(p));
                var spec = cssSpecificity(v);
                if (spec > specificity)
                    specificity = spec;
            }
        }
        return {
            match,
            string: v,
            selectorText : `${i>0 ? " " : ""}${v}${i<a.length-1 ? "," : ""}`
        }
    });
    if(!pseudos.length)
        return;
    var properties = propertiesMap(getCssTextProperties(rule.style.cssText),false);
    return {
        rule: rule,
        specificity: specificity,
        selectors: selectors,
        properties : properties,
        inheritedProps : false,
        href : style.href,
        type : style.type,
        pseudos
    }
}
function getCssTextProperties(cssText) {
    var statements = [];
    var index = 0;
    var quoteRegex = /("[^"]*")/g, resultQuotes, indicesQuotes = [];
    while ( (resultQuotes = quoteRegex.exec(cssText)) )
        indicesQuotes.push({start:resultQuotes.index,end:resultQuotes.index+resultQuotes[0].length});
    var semicolonRegex = /;/g,resultSearch;
    while((resultSearch = semicolonRegex.exec(cssText))){
        var isInQuote = indicesQuotes.find(v=>resultSearch.index>v.start && resultSearch.index < v.end);
        if(!isInQuote) {
            statements.push(cssText.substring(index, resultSearch.index));
            index=resultSearch.index+1;
        }
    }
    return statements.reduce((filtered, option)=> {
        var a = option.split(/:(.+)/);
        if (a[0] && a[1])
            filtered.push({
                property: a[0].trim(),
                value: a[1].trim()
            });
        return filtered
    }, []);
}
var inheritedProperties = /^\-\-|border-collapse|border-spacing|caption-side|^color|cursor|direction|empty-cells|font(?!-)|font-family|font-size|font-style|font-variant|font-weight|font-size-adjust|font-stretch|letter-spacing|line-height|list-style-image|list-style-position|list-style-type|list-style|orphans|overflow-wrap|quotes|tab-size|text-align|text-align-last|text-decoration-color|text-indent|text-justify|text-shadow|text-transform|visibility|white-space|widows|word-break|word-spacing|word-wrap/gi

window.cssMatcher = function(DOMEl,stylesheets){
    var cssMatches = [];
    var pseudoElements = [];
    var pseudoStates = [];
    // get ancestors for inherited properties
    var ancestor = DOMEl,
        ancestors = [],
        DOMElWin = DOMEl.ownerDocument.defaultView;
    // get ancestors styles
    while(ancestor = ancestor.parentElement) {
        var ancestorStyle = null;
        if(ancestor.style.length) {
            var properties = parseStyleAttribute(ancestor, true);
            if (properties && properties.length)
                ancestorStyle = {
                    rule: ancestor,
                    isStyle: true,
                    properties: properties,
                    inheritedProps: true
                };
        }
        ancestors.push({
            ancestor: ancestor,
            ancestorStyle : ancestorStyle,
            matches: []
        });
    }
    function processRules(rules,style,styles) {
        var rulesLength = rules.length;
        for (var r = 0; r < rulesLength; r++) {
            var rule = rules[r];
            switch (rule.constructor.name) {
                case "CSSImportRule":
                    if (DOMElWin.matchMedia(rule.media.mediaText).matches){
                        /*
                        var f = styles.find(v=>v.href==rule.href);
                        if(f && f.type!="external")
                            processRules(rule.styleSheet.cssRules,style,styles);
                         */
                        try{
                            processRules(rule.styleSheet.cssRules,style,styles)
                        }
                        catch(e){}

                    }
                    break;
                case "CSSStyleRule": // rule
                    var match;
                    var pseudosEl = findPseudoElements(DOMEl, rule, style);
                    if(pseudosEl) {
                        pseudoElements.unshift(pseudosEl);
                        //break;
                    }
                    var pseudosStates = findPseudoStates(DOMEl,rule,style);
                    if(pseudosStates) {
                        pseudoStates.unshift(pseudosStates);
                        //break;
                    }
                    var selector = rule.selectorText;
                    try{
                        match = DOMEl.matches(selector)
                    }
                    catch(e){
                        break;
                    }
                    if(match)
                        cssMatches.unshift(parsingRule(DOMEl, rule, style));
                    ancestors.forEach(ancestor=> {
                        if (ancestor.ancestor.matches(selector)) {
                            var ancestorInheritedRules = parsingRule(ancestor.ancestor, rule, style,true);
                            ancestorInheritedRules && ancestor.matches.unshift(ancestorInheritedRules);
                        }
                    });
                    break;
                case "CSSMediaRule":// @media
                    if (DOMElWin.matchMedia(rule.conditionText).matches)
                        processRules(rule.cssRules,style);
                    break;
                case "CSSSupportsRule":// @supports
                    if (DOMElWin.CSS && DOMElWin.CSS.supports &&
                        DOMElWin.CSS.supports(rule.conditionText))
                        processRules(rule.cssRules,style);
                    break;
                default:// other cases not handled
                    break;
            }
        }
    }
    function init(styles) {
        for (var i = 0; i < styles.length; i++) {
            var thisStylesheet = styles[i].sheet;
            if(thisStylesheet.disabled)
                continue;
            try {
                if (thisStylesheet.media.length &&
                    !DOMElWin.matchMedia(thisStylesheet.media.mediaText).matches)
                    continue;
            }
            catch(e){
                console.warn("Access denied to", thisStylesheet);
                continue;
            }
            var rulesLength = thisStylesheet.cssRules ? thisStylesheet.cssRules.length : 0;
            var rules = thisStylesheet.cssRules;

            rulesLength && processRules(rules,styles[i],styles)
        }
    }
    init(stylesheets);
    // create style property for element
    cssMatches.unshift({
        rule: DOMEl,
        isStyle : true,
        properties : DOMEl.style.length ? parseStyleAttribute(DOMEl) : [],
        inheritedProps : false,
        type : "inline"
    });
    cssMatches.sort((a, b)=> b.specificity-a.specificity);
    pseudoElements.sort((a, b)=> b.specificity-a.specificity);
    pseudoStates.sort((a, b)=> b.specificity-a.specificity);
    ancestors.map(anc=> {
        anc.matches.sort((a, b)=> b.specificity - a.specificity);
        return anc;
    });
    return {
        cssMatches,
        ancestors,
        matchStyle : function(styleNamecss,noAncestors){
            return matchStyle(styleNamecss,cssMatches,ancestors,noAncestors);
        },
        properties : createProps(cssMatches),
        pseudoElements,
        pseudoStates,
        getCssTextProperties,
        isShortHand
    };
};
window.getCssTextProperties = getCssTextProperties;
window.isCssShortHand = isShortHand;

function matchStyle(styleNamecss,cssMatches,ancestors,noAncestors = false){
    var found,importantFound;
    for(var i = 0;i<cssMatches.length;i++){
        var rule = cssMatches[i];
        var cssRule = rule.rule.style;
        if(cssRule[styleNamecss]) {
            if(!found)
                found = {
                    rule : cssRule,
                    value : cssRule[styleNamecss]
                };
            var property = rule.properties.find(v=>
            v.property == styleNamecss ||
            ( shorthandProperties[v.property] && shorthandProperties[v.property].find(v=>v==styleNamecss) )
            );
            if(property && property.value.match(/!important/i))
                importantFound = {
                    rule : cssRule,
                    value : cssRule[styleNamecss]
                };
        }
        if(found && importantFound)
            break;
    }
    if(noAncestors)
        return importantFound || found;
    if(!found){
        for(var k = 0;k<ancestors.length;k++){
            var ruleAncestor = ancestors[k];
            if(ruleAncestor.ancestorStyle &&
                ruleAncestor.ancestorStyle.rule.style[styleNamecss]) {
                    found = {rule : ruleAncestor.ancestorStyle.rule,
                        value : ruleAncestor.ancestorStyle.rule.style[styleNamecss]};
                    break;
            }
            if(!ruleAncestor.matches.length)
                continue;
            ruleAncestor.matches.sort((a, b)=> b.specificity-a.specificity);
            found = ruleAncestor.matches.find(v=>v.rule.style[styleNamecss]);
            if(found) {
                found = {rule : found.rule,
                    value : found.rule.style[styleNamecss]};
                break;
            }
        }
    }
    return importantFound || found;
}
function parseStyleAttribute(domEl,isInherited){
    var properties = [];
    var css = domEl.getAttribute("style").split(";");
    css.forEach(function(v){
        if(!v.trim().length) return;
        var prop = v.split(/:(.+)/);
        properties.push({
            property:prop[0].trim(),
            value:prop[1].trim()
        });
    });
    return propertiesMap(properties,isInherited);
}
function parsingRule(DOMEl,rule,style,inherited){
    var selectors = splitCssValue(rule.selectorText);
    var properties = propertiesMap(getCssTextProperties(rule.style.cssText),inherited);
    if(!properties)
        return null;
    var specificity = 0;
    selectors = selectors.map((v,i,a) =>{
        var match = DOMEl.matches(v);
        if(match){
            var spec = cssSpecificity(v);
            if (spec > specificity)
                specificity = spec;
        }
        return {
            match: match,
            string: v,
            selectorText : `${i>0 ? " " : ""}${v}${i<a.length-1 ? "," : ""}`
        }
    });
    return {
        rule: rule,
        specificity: specificity,
        selectors: selectors,
        properties : properties,
        inheritedProps : inherited,
        href : style.href,
        type : style.type
    }
}
function propertiesMap(properties,inherited){
    var isInherit = false;
    properties = properties.map((v)=>{
        if(typeof v.property === "undefined")
            return;

        var isInherited = inherited && v.property.match(inheritedProperties);
        if(isInherited && !isInherit)
            isInherit = true;
        return{
            property : v.property,
            value : v.value,
            isInherited : !!isInherited
        };
    });
    if(inherited && !isInherit)
        return null;
    return properties;
}
// https://github.com/gilmoreorless/css-shorthand-properties/blob/master/index.js
var shorthandProperties = {
    // CSS 2.1: https://www.w3.org/TR/CSS2/propidx.html
    'list-style':      ['list-style-type', 'list-style-position', 'list-style-image'],
    'margin':          ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
    'outline':         ['outline-width', 'outline-style', 'outline-color'],
    'padding':         ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],

    // CSS Backgrounds and Borders Module Level 3: https://www.w3.org/TR/css3-background/
    'background':           ['background-image', 'background-position', 'background-size', 'background-repeat', 'background-origin', 'background-clip', 'background-attachment', 'background-color'],
    'background-position':  ['background-position-x', 'background-position-y'],  // Not found in the spec, but already implemented by every stable browser
    'border':               ['border-width', 'border-style', 'border-color'],
    'border-color':         ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'],
    'border-style':         ['border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'],
    'border-width':         ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'],
    'border-top':           ['border-top-width', 'border-top-style', 'border-top-color'],
    'border-right':         ['border-right-width', 'border-right-style', 'border-right-color'],
    'border-bottom':        ['border-bottom-width', 'border-bottom-style', 'border-bottom-color'],
    'border-left':          ['border-left-width', 'border-left-style', 'border-left-color'],
    'border-radius':        ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
    'border-image':         ['border-image-source', 'border-image-slice', 'border-image-width', 'border-image-outset', 'border-image-repeat'],

    // CSS Fonts Module Level 3: https://www.w3.org/TR/css3-fonts/
    'font':            ['font-style', 'font-variant', 'font-weight', 'font-stretch', 'font-size', 'line-height', 'font-family'],
    'font-variant':    ['font-variant-ligatures', 'font-variant-alternates', 'font-variant-caps', 'font-variant-numeric', 'font-variant-east-asian'],

    // CSS Flexible Box Layout Module Level 1: https://www.w3.org/TR/css3-flexbox-1/
    'flex':            ['flex-grow', 'flex-shrink', 'flex-basis'],
    'flex-flow':       ['flex-direction', 'flex-wrap'],

    // CSS Grid Layout Module Level 1: https://www.w3.org/TR/css-grid-1/
    'grid':            ['grid-template-rows', 'grid-template-columns', 'grid-template-areas', 'grid-auto-rows', 'grid-auto-columns', 'grid-auto-flow'],
    'grid-template':   ['grid-template-rows', 'grid-template-columns', 'grid-template-areas'],
    'grid-row':        ['grid-row-start', 'grid-row-end'],
    'grid-column':     ['grid-column-start', 'grid-column-end'],
    'grid-area':       ['grid-row-start', 'grid-column-start', 'grid-row-end', 'grid-column-end'],
    'grid-gap':        ['grid-row-gap', 'grid-column-gap'],

    // CSS Masking Module Level 1: https://www.w3.org/TR/css-masking/
    'mask':            ['mask-image', 'mask-mode', 'mask-position', 'mask-size', 'mask-repeat', 'mask-origin', 'mask-clip'],
    'mask-border':     ['mask-border-source', 'mask-border-slice', 'mask-border-width', 'mask-border-outset', 'mask-border-repeat', 'mask-border-mode'],

    // CSS Multi-column Layout Module: https://www.w3.org/TR/css3-multicol/
    'columns':         ['column-width', 'column-count'],
    'column-rule':     ['column-rule-width', 'column-rule-style', 'column-rule-color'],

    // CSS Scroll Snap Module Level 1: https://www.w3.org/TR/css-scroll-snap-1/
    'scroll-padding':            ['scroll-padding-top', 'scroll-padding-right', 'scroll-padding-bottom', 'scroll-padding-left'],
    'scroll-padding-block':      ['scroll-padding-block-start', 'scroll-padding-block-end'],
    'scroll-padding-inline':     ['scroll-padding-inline-start', 'scroll-padding-inline-end'],
    'scroll-snap-margin':        ['scroll-snap-margin-top', 'scroll-snap-margin-right', 'scroll-snap-margin-bottom', 'scroll-snap-margin-left'],
    'scroll-snap-margin-block':  ['scroll-snap-margin-block-start', 'scroll-snap-margin-block-end'],
    'scroll-snap-margin-inline': ['scroll-snap-margin-inline-start', 'scroll-snap-margin-inline-end'],

    // CSS Speech Module: https://www.w3.org/TR/css3-speech/
    'cue':             ['cue-before', 'cue-after'],
    'pause':           ['pause-before', 'pause-after'],
    'rest':            ['rest-before', 'rest-after'],

    // CSS Text Decoration Module Level 3: https://www.w3.org/TR/css-text-decor-3/
    'text-decoration': ['text-decoration-line', 'text-decoration-style', 'text-decoration-color'],
    'text-emphasis':   ['text-emphasis-style', 'text-emphasis-color'],

    // CSS Animations (WD): https://www.w3.org/TR/css3-animations
    'animation':       ['animation-name', 'animation-duration', 'animation-timing-function',
        'animation-delay', 'animation-iteration-count', 'animation-direction', 'animation-fill-mode', 'animation-play-state'],

    // CSS Transitions (WD): https://www.w3.org/TR/css3-transitions/
    'transition':      ['transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay']
};

function isShortHand(property){
    for(var k in shorthandProperties){
        if(property.startsWith(k) && shorthandProperties[k].indexOf(property)>-1)
            return k;
    }
}

})();
(()=>{
function doLastSelection(range,currentDocument,contenteditable){
    //
    contenteditable.focus();
    //
    var start;
    var body = currentDocument.body;
    if(body.contains(range.startContainer))
        start = range.startContainer;
    else
        start = getChildFromTree(contenteditable,
            range.startContainerTree);
    var end;
    if(body.contains(range.endContainer))
        end = range.endContainer;
    else
        end = getChildFromTree(contenteditable,
            range.endContainerTree);
    var newRange = currentDocument.createRange();
    try {
        newRange.setStart(start, range.startOffset);
    }
    catch(e){
        console.error(e);
        return;
    }
    if (range.collapsed)
        newRange.collapse(true);
    else {
        try {
            newRange.setEnd(end, range.endOffset);
        }
        catch(e){
            console.error(e);
            return;
        }
    }
    var sel = currentDocument.defaultView.getSelection();
    sel.removeAllRanges();
    sel.addRange(newRange);
    // calculating if is in view. If not, scroll to pos;
    /*
    var win = frontartApp.currentDocument.defaultView;
    var pos = newRange.getBoundingClientRect();
    //var iframesPos = win.frameElement.getBoundingClientRect();
    if(pos < win.scrollY ||
        pos > ( win.scrollY + win.innerHeight )){
        var currentY = pos - 100;
        currentY = currentY < 0 ? 0 : currentY;
        win.scrollTo(win.scrollX,currentY);
    }
    */
}
function getChildFromTree(father,tree){
    var res = father;
    for(var i = 0;i<tree.length;i++) {
        var el = res.childNodes[tree[i]];
        if (el)
            res = el;
        else
            return res;
    }
    return res;
}
function getChildTree(father,child){
    var swap = child;
    var tree = [];
    while(swap!=father){
        var childIndex = [...swap.parentNode.childNodes].indexOf(swap);
        tree.unshift(childIndex);
        swap = swap.parentNode;
    }
    return tree;
}

function getLastSelection(contenteditable){
    var selection = contenteditable.ownerDocument.defaultView.getSelection();
    var range = selection.getRangeAt(0);
    return {
        startContainer : range.startContainer,
        startOffset : range.startOffset,
        startContainerTree : getChildTree(contenteditable,range.startContainer),
        collapsed : range.collapsed,
        endContainer : range.endContainer,
        endContainerTree : getChildTree(contenteditable,range.endContainer),
        endOffset : range.endOffset
    };
};
HTMLTreeMatch.prototype.getLastSelection = getLastSelection;
function highlightSelection(el){
    var sel = el.ownerDocument.getSelection();
    var isCollapsed = sel.isCollapsed;
    if(!isCollapsed){
        var range = sel.getRangeAt(0);
        var boundings = range.getBoundingClientRect();
        var win = el.ownerDocument.defaultView;
        var frame = win.frameElement;
        var ibound = frame ? frame.getBoundingClientRect() : {x:0,y:0};
        // we assume that iframe has no border, no padding etc.;
        highlightSel.style.width = boundings.width + "px";
        highlightSel.style.height = boundings.height + "px";
        highlightSel.style.transform =
            "translate("+(ibound.x + boundings.left) +"px,"+(ibound.y + boundings.top) +"px)"
    }
    else
        highlightSel.style.transform =
            "translate(-9999px,-9999px)";
}
function ctOnKeyDown(e,el){
    if(e.key == "Enter") {
        var selection = el.ownerDocument.defaultView.getSelection();
        if(selection.anchorNode.parentNode.tagName == "LI" &&
            selection.anchorNode.parentNode != el)
            return;
        if(selection.anchorNode.parentNode.tagName == "P" &&
            selection.anchorNode.parentNode != el)
            return;
        var range = selection.getRangeAt(0);
        var br = document.createElement("br");
        var textPlaceholder = document.createTextNode("\uFEFF");
        range.insertNode(br);
        range.setStartAfter(br);
        range.insertNode(textPlaceholder);
        range.setStartAfter(textPlaceholder);
        range.collapse(true);
        e.preventDefault();
        el.dispatchEvent(new Event('input'))
    }
    /*
    if((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() == "z" || e.key.toLowerCase() == "y")){
        e.preventDefault();
    }
    */
}
function insertTextAtCursor(text,t) {
    var sel, range;
    sel = t.ownerDocument.defaultView.getSelection();
    range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(t.ownerDocument.createTextNode(text));
    t.dispatchEvent(new KeyboardEvent("input", {bubbles : true}));
    window.dispatchEvent(new Event("WYSIWYG-modify"))
}
function onPaste(e){
    var target = e.target;
    var clipboardData = e.clipboardData;
    if (clipboardData && clipboardData.getData) {
        var text = clipboardData.getData("text/plain");
        if (text.length)
            return;//insertTextAtCursor(text, target);
        else{
            for(var i = 0;i<clipboardData.items.length;i++){
                var file = clipboardData.files[i];
                if(file.type.startsWith("image/"))
                    window.dispatchEvent(new CustomEvent("onContentEditablePasteImage", {
                        detail:{
                            file,
                            target
                        }
                    }))
            }
        }
    }
}
HTMLTreeMatch.prototype.redo = function(){
    var $self = this;
    var history = $self.history;
    if(!history.entries.length
        || history.pointer == history.entries.length)
        return;
    lastEditable && lastEditable.destroy();
    var pointer = history.pointer;
    var historyEntry = history.entries[pointer];
    historyMethods[historyEntry.method].redo(historyEntry,$self);
    history.pointer++;
    /* dispatching */
    window.dispatchEvent(new Event(domChangeEvent));
};
HTMLTreeMatch.prototype.setHistory = function(historyObject){
    var $self = this;
    var history = $self.history;
    var pointer = history.pointer;
    var entries = history.entries;
    if(pointer != entries.length)
        history.entries = entries.slice(0,pointer);
    history.pointer = history.entries.push(historyObject);
    /* dispatching */
    $self.dispatchEvent("history-entry",{pointer,historyObject});
    window.dispatchEvent(new Event(domChangeEvent));
};
HTMLTreeMatch.prototype.undo = function(){
    var $self = this;
    var history = $self.history;
    if(!history.entries.length || history.pointer == 0)
        return;
    lastEditable && lastEditable.destroy();
    var pointer;
    history.pointer--;
    pointer = history.pointer;
    var historyEntry = history.entries[pointer];
    if(historyEntry.method == "contenteditable"){
        if(history.pointer == 0)
            historyMethods.contenteditable.undo(historyEntry,$self.firstSelection,$self);
        else
            historyMethods.contenteditable.undo(historyEntry,{
                editable : history.entries[pointer-1].el,
                lastRange : history.entries[pointer-1].lastRange
            },$self,history.entries[pointer-1]);
    }
    else historyMethods[historyEntry.method].undo(historyEntry);
    /* dispatching */
    window.dispatchEvent(new Event(domChangeEvent));
};
const domChangeEvent = "DOM-change";
let historyMethods = {};
function HTMLTreeMatch(source,contentDocument){
    var $self = this;
    var domparser = new DOMParser();
    $self.source = domparser.parseFromString(source, "text/html");
    $self.lastMatch = {
        el : null,
        match : null
    };
    $self.firstSelection = {};
  	$self.contentDocument = contentDocument;
    $self.history = {
        entries : [],
        pointer : 0
    };
    $self.matches = [];
    [...contentDocument.querySelectorAll("*")].forEach(DOMel=>$self.match(DOMel));
    var events = {};
    $self.dispatchEvent = (event,eObj)=>{
        Array.isArray(events[event]) && events[event].forEach(func=>func(eObj))
    };
    $self.on = (e,cb)=>{
        if(events[e])
            events[e].push(cb);
        else
            events[e] = [cb]
    };
    return $self;
};
window.HTMLTreeMatch = function(source,doc){
    return new HTMLTreeMatch(source,doc || document);
};
HTMLTreeMatch.prototype.find = function(el){
    var $self = this;
    var source=$self.source;
    var findMatch;
    $self.matches = $self.matches.filter(v=>{
        if(!v.DOMel.ownerDocument || !v.DOMel.ownerDocument.documentElement.contains(v.DOMel))
            return false;
        if(el==v.DOMel)
            findMatch = v;
        return true;
    });
    if(findMatch && !source.documentElement.contains(findMatch.match))
        $self.matches.splice($self.matches.indexOf(findMatch), 1);
    else if(findMatch) {
        var textMatch = findMatch.match.nodeType == 1 ?
            findMatch.match.innerHTML :
            findMatch.match.textContent;
        var textEl = el.nodeType == 1 ?
            el.innerHTML :
            el.textContent;
        return {
            attributes: findMatch.match.cloneNode().isEqualNode(el.cloneNode()),
            HTML: textMatch.replace(/[\u200B-\u200D\uFEFF\r\n]/g, "")
            == textEl.replace(/[\u200B-\u200D\uFEFF\r\n]/g, ""),
            match: findMatch.match
        };
    }
    var match = $self.match(el);
    if(match)
        return{
            attributes:true,
            HTML:true,
            match:match
        };
    else return false;
}

function getLevels(el,bodyRoot){
    var levels = [];
    do{
        levels.unshift(el);
        if((el.tagName == "HTML" && el.ownerDocument.defaultView.frameElement)||
            (el == el.ownerDocument.body && el != bodyRoot))
            el = el.ownerDocument.defaultView.frameElement;
        else
            el = el.parentElement;
    }
    while(el && el != bodyRoot);
    return levels;
}
function isEqualNode(el,equalNode,isLast,relax=true){
    //*
    var cloneChildrenArray = isLast ? [...el.childNodes] :[...el.children];
    var find = cloneChildrenArray.filter(child=>{
        if(!isLast || relax)
            return child.cloneNode().isEqualNode(equalNode.cloneNode());
        //return child.nodeName == equalNode.nodeName;
        else {
            // innerText is not always valorized ( see drag/automatic_test )
            // textContent has some problem with spaces...
            var childText = child.textContent;
            var equalNodeText = equalNode.textContent;
            var isEqual = equalNode.nodeType == 3 ?
            childText.replace(/[\u200B-\u200D\uFEFF\r\n]/g, "") ==
            equalNodeText.replace(/[\u200B-\u200D\uFEFF\r\n]/g, "") :
            child.outerHTML == equalNode.outerHTML;
            return isEqual;
        }
    });
    if(find.length > 1){
        var originalChilds = isLast ? [...equalNode.parentNode.childNodes] : [...equalNode.parentNode.children];
        var originals = originalChilds.filter(child=>{
            if(!isLast || relax)
                return child.cloneNode().isEqualNode(equalNode.cloneNode());
            else {
                var childText = child.textContent;
                var equalNodeText = equalNode.textContent;
                var isEqual = equalNode.nodeType == 3 ?
                childText.replace(/[\u200B-\u200D\uFEFF\r\n]/g, "") ==
                equalNodeText.replace(/[\u200B-\u200D\uFEFF\r\n]/g, "") :
                child.outerHTML == equalNode.outerHTML;
                return isEqual;
            }
        });
        if(originals.length !== find.length && !relax) // comparing the two trees, there is a difference in length for the current searched noded. return false
            return false;
        var originalPosition = originals.indexOf(equalNode);
        return find[originalPosition];
    }
    return find[0];

}
HTMLTreeMatch.prototype.match = function(el,takeLastMatch = true,relax = false,inverse = false){
    var $self = this;
    var source=inverse ? $self.contentDocument : $self.source;
    var startLevel = source.body;
    var startLevelToCompare= inverse ? $self.source.body : el.getRootNode().body;
    ////
    if(el.tagName == "HTML")
        if(el.cloneNode().isEqualNode(source.documentElement.cloneNode())) {
            !$self.matches.find(v=>v.DOMel == el) &&
            $self.matches.push({
                match : source.documentElement,
                DOMel : el
            });
            return source.documentElement;
        }
        else
            return false;
    if(el.tagName == "HEAD")
        if(el.cloneNode().isEqualNode(source.head.cloneNode())) {
            !$self.matches.find(v=>v.DOMel == el) &&
            $self.matches.push({
                match : source.head,
                DOMel : el
            });
            return source.head;
        }
        else
            return false;
    if(el.ownerDocument.head.contains(el)){
        /*
        var matchHead = $self.matchHead(el);
        matchHead && !$self.matches.find(v=>v.DOMel == el) &&
        $self.matches.push({
            match : matchHead,
            DOMel : el
        });
        return matchHead*/
        startLevel = source.head;
        startLevelToCompare = el.ownerDocument.head;
    }
    if(el.tagName == "BODY")
        if(el.cloneNode().isEqualNode(source.body.cloneNode())){
            !$self.matches.find(v=>v.DOMel == el) &&
            $self.matches.push({
                match : source.body,
                DOMel : el
            });
            return source.body;
        }
        else
            return false;
    var elementToChange = null;
    var levels = getLevels(el,startLevelToCompare);
    for(var search = levels.length-1;search>=0;search--){
        var elInner = levels[search];
        if(elInner.id) {
            try {
                var searchDoubleId = source.querySelectorAll("#" + elInner.id);
            }catch(e){break}
            if(searchDoubleId.length > 1)
                break;
            startLevel = source.getElementById(elInner.id);
            if(!startLevel)
                return;
            //
            if(search == levels.length-1) {
                //if(startLevel.isEqualNode(elInner)) {
                    $self.matches.push({
                        match : startLevel,
                        DOMel : el
                    });
                    return startLevel;
                /*
                }
                else
                    return false;*/
            }
            else
                levels = levels.slice(search+1, levels.length);
            break;
        }
    }
    for(var i = 0;i<levels.length;i++){
        var elToCompare = levels[i];
        var isLast = i==levels.length-1;
        var searchMatches = $self.matches.find(v=>v.DOMel == elToCompare);
        var found = (!inverse && searchMatches &&
            $self.source.documentElement.contains(searchMatches.match) &&
            searchMatches.match) ||
            isEqualNode(startLevel,elToCompare,isLast,relax);
        if(!found)
            break;
        startLevel = found;
        if(i==levels.length-1)
            elementToChange = found;
    }
    elementToChange && !$self.matches.find(v=>v.DOMel == el) &&
        $self.matches.push({
            match : elementToChange,
            DOMel : el
        });
    return elementToChange;
};
HTMLTreeMatch.prototype.matchHead = function(node){
    var $self = this;
    return [...$self.source.head.children].find(v=>v.isEqualNode(node));
};
HTMLTreeMatch.prototype.addClass = function(el,className){
    var $self = this;
    if(el.classList.contains(className))
        return;
    var found = $self.find(el);
    if(!found || (!found.attributes && found.match.getAttribute('class') != el.getAttribute('class')))
        throw new Error("[HTMLTreeMatch addClass] no match");
    var match = found.match;
    var wasWithout;
    if(!el.hasAttribute("class"))
        wasWithout = true;
    el.classList.add(className);
    match.classList.add(className);
    $self.setHistory({
        el,
        match,
        $self,
        wasWithout,
        className,
        method : "addClass"
    });
};
historyMethods.addClass = {
    undo: ho=>{
        ho.el.classList.remove(ho.className);
        ho.match.classList.remove(ho.className);
        if(ho.wasWithout){
            ho.el.removeAttribute("class");
            ho.match.removeAttribute("class");
        }
    },
    redo: ho=>{
        ho.el.classList.add(ho.className);
        ho.match.classList.add(ho.className);
    }
}

HTMLTreeMatch.prototype.addColumn = function(tableEl,index){
    var $self = this;
    var tableFound = $self.find(tableEl);
    if(!tableFound || !tableFound.HTML)
        throw new Error("[HTMLTreeMatch addColumn] no match");
    var tableMatch = tableFound.match;
    [...tableEl.rows].forEach(v=>{
        v.insertCell(index)
    });
    [...tableMatch.rows].forEach(v=>{
        v.insertCell(index)
    });
    $self.setHistory({
        tableEl,
        $self,
        tableMatch,
        index,
        method : "addColumn"
    });
};
historyMethods.addColumn = {
    undo : ho=>{
        [...ho.tableEl.rows].forEach(v=>{
            v.deleteCell(ho.index)
        });
        [...ho.tableMatch.rows].forEach(v=>{
            v.deleteCell(ho.index)
        });
    },
    redo : ho=>{
        [...ho.tableEl.rows].forEach(v=>{
            v.insertCell(ho.index)
        });
        [...ho.tableMatch.rows].forEach(v=>{
            v.insertCell(ho.index)
        });
    }
};

HTMLTreeMatch.prototype.addHeadNode = function(node){
    var $self = this;
    var newMatch = node.cloneNode(true);
    node.ownerDocument.head.appendChild(node);
    $self.source.head.appendChild(newMatch);
    $self.setHistory({
        newMatch,
        el:node,
        nodeDocument:node.ownerDocument,
        matchDocument:$self.source,
        method : "addHeadNode"
    });
};
historyMethods.addHeadNode = {
    undo : ho=>{
        ho.nodeDocument.head.removeChild(ho.el);
        ho.matchDocument.head.removeChild(ho.newMatch);
    },
    redo : ho=>{
        ho.nodeDocument.head.appendChild(ho.el);
        ho.matchDocument.head.appendChild(ho.newMatch);
    }
};

HTMLTreeMatch.prototype.after = function(el,child){
    var $self = this;
    $self.insertAdjacentElement(el,"after",child);
};
HTMLTreeMatch.prototype.append = function(el,child){
    var $self = this;
    $self.insertAdjacentElement(el,"append",child);
};
HTMLTreeMatch.prototype.appendChild = function(el,child){
    var $self = this;
    var found = $self.find(el);
    if(!found)
        throw new Error("[HTMLTreeMatch appendChild] no match");
    var match = found.match;
    el.appendChild(child);
    var newMatch = child.cloneNode(true);
    match.appendChild(newMatch);
    $self.setHistory({
        el,
        match,
        newMatch,
        newEl:child,
        method : "appendChild"
    });
};
historyMethods.appendChild = {
    undo : ho=>{
        ho.el.removeChild(ho.newEl);
        ho.match.removeChild(ho.newMatch);
    },
    redo : ho=>{
        ho.el.appendChild(ho.newEl);
        ho.match.appendChild(ho.newMatch);
    }
}
HTMLTreeMatch.prototype.before = function(el,child){
    var $self = this;
    $self.insertAdjacentElement(el,"before",child);
};
let lastEditable;
let contentEditableThrottle;
let styleContentEditable = document.createElement("style");
styleContentEditable.innerHTML = `[contenteditable]::selection,[contenteditable] *::selection{
background:transparent!important;
}`;
let highlightSel = document.createElement("div");
highlightSel.className = "highlight-contenteditable-selection";
highlightSel.style="position:absolute;top:0;left:0;transform:translate(-9999px,-9999px);z-index:2;" +
    "box-shadow:0 0 2px 2px rgb(0,0,0,0.4), 0 0 3px 3px rgb(255,255,255,0.4)";
//document.body.appendChild(highlightSel);
let oldHTML;
let oldMatchHTML;
function contentEditableOnInput($self,el,match){
    clearTimeout(contentEditableThrottle);
    contentEditableThrottle = setTimeout(()=> {
        oldHTML = [...el.childNodes];
        var newHTML = oldHTML.map(v=>v.cloneNode(true));
        var oldMatchHTML = [...match.childNodes].map(v=>v.cloneNode(true));
        match.innerHTML = "";
        for (var i = 0; i < newHTML.length; i++)
            match.appendChild(newHTML[i].cloneNode(true));
        var lastRange = getLastSelection(el);
        $self.setHistory({
            el,
            match,
            oldHTML,
            //HTML,
            oldMatchHTML,
            newHTML,
            lastRange,
            method: "contenteditable"
        });
        //oldHTML = HTML;
    },250);
}
function ce($self,el,match){
    let wasContentEditable;
    var hasBeenEdited = false;
    oldHTML = [...el.childNodes];
    oldMatchHTML = [...match.childNodes];
    el.innerHTML = "";
    oldHTML.forEach(v=>el.appendChild(v.cloneNode(true)));
    if(el.contentEditable != "true")
        el.setAttribute("contenteditable","");
    else wasContentEditable = true;
    //el.ownerDocument.head.appendChild(el.ownerDocument.adoptNode(styleContentEditable,true));
    setTimeout(()=>{
        var sel = el.ownerDocument.defaultView.getSelection();
        var range = new Range();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
        el.focus();
        window.dispatchEvent(new CustomEvent(
            "WYSIWYG-start",{detail:el}))
    });
    var proxyInput = function(e){
        //highlightSelection(el);
        hasBeenEdited = true;
        //contentEditableOnInput($self,el,match);
    };
    var selectionChange = function(e) {
        //highlightSelection(el);
        window.dispatchEvent(new CustomEvent(
            "WYSIWYG-start",{detail:el}))
    };
    var keydown = function(e) {
        //ctOnKeyDown(e,el);
        window.dispatchEvent(new CustomEvent(
            "WYSIWYG-start",{detail:el}))
        window.dispatchEvent(new CustomEvent(
            "WYSIWYG-keydown",{detail:{e,el}}));
    };
    let throttleHighlight;
    var scrollResizeHighlight = function(e) {
        clearTimeout(throttleHighlight);
        throttleHighlight = setTimeout(()=>{
            highlightSelection(el);
        });
    };
    el.addEventListener("input",proxyInput);
    el.addEventListener("keydown",keydown);
    el.ownerDocument.addEventListener('selectionchange',selectionChange);
    el.addEventListener("paste",onPaste);
    el.ownerDocument.addEventListener("scroll",scrollResizeHighlight,true);
    el.ownerDocument.defaultView.addEventListener("resize",scrollResizeHighlight);
    return lastEditable = {
        destroy : ()=>{
            if(!wasContentEditable)
                el.removeAttribute("contenteditable");
            //styleContentEditable.remove();
            highlightSel.style.transform =
                "translate(-9999px,-9999px)";
            el.removeEventListener("input",proxyInput);
            el.removeEventListener("keydown",keydown);
            el.removeEventListener("paste",onPaste);
            el.ownerDocument.removeEventListener("scroll",scrollResizeHighlight);
            el.ownerDocument.defaultView.removeEventListener("resize",scrollResizeHighlight);
            el.ownerDocument.removeEventListener('selectionchange',selectionChange);
            lastEditable = null;
            if(hasBeenEdited) {
                var newHTML = [...el.childNodes];
                while(match.firstChild)
                    match.firstChild.remove();
                newHTML.forEach(v=>match.appendChild(v.cloneNode(true)));
                $self.setHistory({
                    el,
                    match,
                    oldHTML,
                    oldMatchHTML,
                    newMatchHtml : [...match.childNodes],
                    newHTML,
                    method: "contenteditable"
                });
            }
            else{
                while(el.firstChild)
                    el.firstChild.remove();
                oldHTML.forEach(v=>el.appendChild(v));
            }
            window.dispatchEvent(new Event("WYSIWYG-end"))
        },
        el
    };
}
HTMLTreeMatch.prototype.contenteditable = function(el){
    var $self = this;
    if(el == lastEditable)
        return;
    var found = $self.find(el);
    lastEditable && lastEditable.destroy();
    if(!found || !found.HTML)
        return {
            match : false
        };
    return ce($self,el,found.match)
};
historyMethods.contenteditable = {
    undo : ho=>{
        ho.el.innerHTML = "";
        ho.match.innerHTML = "";
        ho.oldHTML.forEach(v=>
            ho.el.appendChild(v));
        ho.oldMatchHTML.forEach(v=>
            ho.match.appendChild(v));
    },
    redo : ho=>{
        ho.el.innerHTML = "";
        ho.match.innerHTML = "";
        ho.newHTML.forEach(v=>
            ho.el.appendChild(v));
        ho.newMatchHtml.forEach(v=>
            ho.match.appendChild(v));
    }
}
/*
historyMethods.contenteditable = {
    undo : (ho,previousRange,$self)=>{
        var toChange = [];
        $self.history.entries.forEach((v,i)=>{
            if(ho.el.contains(v.el) && ho.el!=v.el) {
                v.tree = getChildTree(ho.el, v.el);
                toChange.push(i);
            }
        });
        ho.el.innerHTML = "";
        ho.match.innerHTML = "";
        for(var i = 0;i<ho.oldMatchHTML.length;i++) {
            ho.el.appendChild(ho.oldMatchHTML[i]);
            ho.match.appendChild(ho.oldMatchHTML[i].cloneNode(true));
        }
        if(ho.el != lastEditable){
            lastEditable.destroy && lastEditable.destroy();
            ce($self,ho.el,ho.match);
        }
        if(previousRange.lastRange)
            doLastSelection(previousRange.lastRange,ho.el.ownerDocument,previousRange.editable);

        toChange.forEach(index=>{
            var entry = $self.history.entries[index];
            entry.el = getChildFromTree(ho.el,entry.tree);
            lastEditable.el.removeAttribute("contenteditable");
            var found = $self.find(entry.el);
            if(!found || !found.match)
                throw new Error("error match");
            entry.match = found.match;
            lastEditable.el.setAttribute("contenteditable","");
        });
    },
    redo : (ho,$self)=>{
        var toChange = [];
        $self.history.entries.forEach((v,i)=>{
            if(ho.el.contains(v.el) && ho.el!=v.el) {
                v.tree = getChildTree(ho.el, v.el);
                toChange.push(i);
            }
        });
        ho.el.innerHTML = "";
        ho.match.innerHTML = "";
        for(var i = 0;i<ho.newHTML.length;i++) {
            ho.el.appendChild(ho.newHTML[i]);
            ho.match.appendChild(ho.newHTML[i].cloneNode(true));
        }
        if(ho.el != lastEditable){
            lastEditable.destroy && lastEditable.destroy();
            ce($self,ho.el,ho.match);
        }
        if(ho.lastRange)
            doLastSelection(ho.lastRange,ho.el.ownerDocument,ho.el);
        toChange.forEach(index=>{
            var entry = $self.history.entries[index];
            entry.el = getChildFromTree(ho.el,entry.tree);
            lastEditable.el.removeAttribute("contenteditable");
            var found = $self.find(entry.el);
            if(!found || !found.match)
                throw new Error("error match");
            entry.match = found.match;
            lastEditable.el.setAttribute("contenteditable","");
        });
    }
}
    */
HTMLTreeMatch.prototype.createCaption = function(tableEl){
    var $self = this;
    var found = $self.find(tableEl);
    if(!found || !found.HTML)
        throw new Error("[HTMLTreeMatch createCaption] no match");
    var tableMatch = found.match;
    var caption = tableEl.createCaption();
    caption.textContent = "table caption";
    var captionMatch = tableMatch.createCaption();
    captionMatch.textContent = "table caption";
    $self.setHistory({
        tableEl,
        tableMatch,
        method : "createCaption"
    });
};
historyMethods.createCaption = {
    undo: ho=>{
        ho.tableEl.deleteCaption();
        ho.tableMatch.deleteCaption();
    },
    redo: ho=>{
        var caption = ho.tableEl.createCaption();
        caption.textContent = "table caption";
        var captionMatch = ho.tableMatch.createCaption();
        captionMatch.textContent = "table caption";
    }
}

HTMLTreeMatch.prototype.createTFoot = function(tableEl){
    var $self = this;
    var found = $self.find(tableEl);
    if(!found || !found.HTML)
        throw new Error("[HTMLTreeMatch createTFoot] no match");
    var tableMatch = found.match;
    var TFoot = tableEl.createTFoot();
    var firstRow = TFoot.insertRow();
    var TFootMatch = tableMatch.createTFoot();
    var firstMatchRow = TFootMatch.insertRow();
    var cells = tableEl.rows[0] && tableEl.rows[0].cells ? tableEl.rows[0].cells.length : 1;
    for(var i = 0;i<cells;i++) {
        var newRow = firstRow.insertCell(i);
        newRow.textContent = "TFoot Cell";
        var newRowMatch = firstMatchRow.insertCell(i);
        newRowMatch.textContent = "TFoot Cell";
    }
    $self.setHistory({
        tableEl,
        tableMatch,
        TFoot,
        TFootMatch,
        method : "createTFoot"
    });
};
historyMethods.createTFoot = {
    undo: ho=>{
        ho.tableEl.deleteTFoot();
        ho.tableMatch.deleteTFoot();
    },
    redo: ho=>{
        var TFoot = ho.tableEl.createTFoot();
        TFoot.replaceWith(ho.TFoot);
        var TFootMatch = ho.tableMatch.createTFoot();
        TFootMatch.replaceWith(ho.TFootMatch);
    }
}

HTMLTreeMatch.prototype.createTHead = function(tableEl){
    var $self = this;
    var found = $self.find(tableEl);
    if(!found || !found.HTML)
        throw new Error("[HTMLTreeMatch createTHead] no match");
    var tableMatch = found.match;
    var tHead = tableEl.createTHead();
    var firstRow = tHead.insertRow();
    var tHeadMatch = tableMatch.createTHead();
    var firstMatchRow = tHeadMatch.insertRow();
    var cells = tableEl.rows[1] && tableEl.rows[1].cells ? tableEl.rows[1].cells.length : 1;
    for(var i = 0;i<cells;i++) {
        var newRow = firstRow.insertCell(i);
        newRow.textContent = "THead Cell";
        var newRowMatch = firstMatchRow.insertCell(i);
        newRowMatch.textContent = "THead Cell";
    }
    $self.setHistory({
        tableEl,
        tableMatch,
        tHead,
        tHeadMatch,
        method : "createTHead"
    });
};
historyMethods.createTHead = {
    undo: ho=>{
        ho.tableEl.deleteTHead();
        ho.tableMatch.deleteTHead();
    },
    redo: ho=>{
        var tHead = ho.tableEl.createTHead();
        tHead.replaceWith(ho.tHead);
        var tHeadMatch = ho.tableMatch.createTHead();
        tHeadMatch.replaceWith(ho.tHeadMatch);
    }
}

HTMLTreeMatch.prototype.deleteCaption = function(tableEl){
    var $self = this;
    var found = $self.find(tableEl);
    if(!found || !found.HTML)
        throw new Error("[HTMLTreeMatch deleteCaption] no match");
    var tableMatch = found.match;
    var captionDeleted = tableEl.caption;
    tableEl.deleteCaption();
    tableMatch.deleteCaption();
    $self.setHistory({
        tableEl,
        tableMatch,
        captionDeleted,
        method : "deleteCaption"
    });
};
historyMethods.deleteCaption = {
    undo: ho=>{
        ho.tableEl.createCaption();
        ho.tableEl.caption.replaceWith(ho.captionDeleted);
        ho.tableMatch.createCaption();
        ho.tableMatch.caption.replaceWith(ho.captionDeleted.cloneNode(true));
    },
    redo: ho=>{
        ho.tableEl.deleteCaption();
        ho.tableMatch.deleteCaption();
    }
}

HTMLTreeMatch.prototype.deleteCell = function(tableRow,index){
    var $self = this;
    var found = $self.find(tableRow);
    if(!found || !found.HTML)
        throw new Error("[HTMLTreeMatch deleteCell] no match");
    var tableRowMatch = found.match;
    var del = tableRow.cells[index];
    tableRow.deleteCell(index);
    var delMatch = tableRowMatch.cells[index];
    tableRowMatch.deleteCell(index);
    $self.setHistory({
        tableRow,
        tableRowMatch,
        del,
        delMatch,
        index,
        method : "deleteCell"
    });
};
historyMethods.deleteCell = {
    undo : ho=>{
        var newCell = ho.tableRow.insertCell(ho.index);
        newCell.replaceWith(ho.del);
        var newCellMatch = ho.tableRowMatch.insertCell(ho.index);
        newCellMatch.replaceWith(ho.delMatch);
    },
    redo : ho=>{
        ho.tableRow.deleteCell(ho.index);
        ho.tableRowMatch.deleteCell(ho.index);
    }
};

HTMLTreeMatch.prototype.deleteColumn = function(tableEl,index){
    var $self = this;
    var tableFound = $self.find(tableEl);
    if(!tableFound || !tableFound.HTML)
        throw new Error("[HTMLTreeMatch deleteColumn] no match");
    var tableMatch = tableFound.match;
    var removed = [];
    var removedMatch = [];
    [...tableEl.rows].forEach((v,i)=>{
        if(v.cells[index]) {
            removed.push(v.cells[index]);
            v.deleteCell(index)
        }
    });
    [...tableMatch.rows].forEach((v,i)=>{
        if(v.cells[index]) {
            removedMatch.push(v.cells[index]);
            v.deleteCell(index)
        }
    });
    $self.setHistory({
        tableEl,
        tableMatch,
        removed,
        removedMatch,
        $self,
        index,
        method : "deleteColumn"
    });
};
historyMethods.deleteColumn = {
    undo : ho=>{
        [...ho.tableEl.rows].forEach((v,i)=>{
            var newCell = v.insertCell(ho.index);
            newCell.replaceWith(ho.removed[i]);
        });
        [...ho.tableMatch.rows].forEach((v,i)=>{
            var newCell = v.insertCell(ho.index);
            newCell.replaceWith(ho.removedMatch[i]);
        });
    },
    redo : ho=>{
        [...ho.tableEl.rows].forEach(v=>{
            v.deleteCell(ho.index)
        });
        [...ho.tableMatch.rows].forEach(v=>{
            v.deleteCell(ho.index)
        });
    }
};

HTMLTreeMatch.prototype.deleteRow = function(tableEl,index){
    var $self = this;
    var found = $self.find(tableEl);
    if(!found || !found.HTML)
        throw new Error("[HTMLTreeMatch deleteRow] no match");
    var tableMatch = found.match;
    var deletedEl = tableEl.rows[index];
    var matchedEl = $self.match(deletedEl);
    tableEl.deleteRow(index);
    tableMatch.deleteRow(index);
    $self.setHistory({
        tableEl,
        deletedEl,
        matchedEl,
        tableMatch,
        index,
        method : "deleteRow"
    });
};
historyMethods.deleteRow = {
    undo : ho=>{
        var newRow = ho.tableEl.insertRow(ho.index);
        newRow.replaceWith(ho.deletedEl);
        var newRowMatch = ho.tableMatch.insertRow(ho.index);
        newRowMatch.replaceWith(ho.matchedEl);
    },
    redo : ho=>{
        ho.tableEl.deleteRow(ho.index);
        ho.tableMatch.deleteRow(ho.index);
    }
};

HTMLTreeMatch.prototype.deleteTFoot = function(tableEl){
    var $self = this;
    var found = $self.find(tableEl);
    if(!found || !found.HTML)
        throw new Error("[HTMLTreeMatch deleteTFoot] no match");
    var tableMatch = found.match;
    var TFootDeleted = tableEl.tFoot;
    var TFootDeletedMatch = tableMatch.tFoot;
    tableEl.deleteTFoot();
    tableMatch.deleteTFoot();
    $self.setHistory({
        tableEl,
        tableMatch,
        TFootDeleted,
        TFootDeletedMatch,
        method : "deleteTFoot"
    });
};
historyMethods.deleteTFoot = {
    undo: ho=>{
        ho.tableEl.createTFoot();
        ho.tableEl.tFoot.replaceWith(ho.TFootDeleted);
        ho.tableMatch.createTFoot();
        ho.tableMatch.tFoot.replaceWith(ho.TFootDeletedMatch);
    },
    redo: ho=>{
        ho.tableEl.deleteTFoot();
        ho.tableMatch.deleteTFoot();
    }
}

HTMLTreeMatch.prototype.deleteTHead = function(tableEl){
    var $self = this;
    var found = $self.find(tableEl);
    if(!found || !found.HTML)
        throw new Error("[HTMLTreeMatch deleteTHead] no match");
    var tableMatch = found.match;
    var tHeadDeleted = tableEl.tHead;
    tableEl.deleteTHead();
    tableMatch.deleteTHead();
    $self.setHistory({
        tableEl,
        tableMatch,
        tHeadDeleted,
        method : "deleteTHead"
    });
};
historyMethods.deleteTHead = {
    undo: ho=>{
        ho.tableEl.createTHead();
        ho.tableEl.tHead.replaceWith(ho.tHeadDeleted);
        ho.tableMatch.createTHead();
        ho.tableMatch.tHead.replaceWith(ho.tHeadDeleted.cloneNode(true));
    },
    redo: ho=>{
        ho.tableEl.deleteTHead();
        ho.tableMatch.deleteTHead();
    }
}

HTMLTreeMatch.prototype.innerHTML = function(el,HTML){
    var $self = this;
    var found = $self.find(el);
    if(!found || !found.HTML)
        throw new Error("[HTMLTreeMatch innerHTML] no match");
    var match = found.match;
    var oldHTML = [...el.childNodes];
    var oldMatchHTML = [...match.childNodes];
    el.innerHTML = HTML;
    match.innerHTML = HTML;
    var newHTML = [...el.childNodes];
    var newMatchHtml = [...match.childNodes];
    $self.setHistory({
        el,
        match,
        HTML,
        newHTML,
        newMatchHtml,
        oldMatchHTML,
        oldHTML,
        method : "innerHTML"
    });
};
historyMethods.innerHTML = {
    undo : ho=>{
        ho.el.innerHTML = "";
        ho.match.innerHTML = "";
        ho.oldHTML.forEach(v=>
            ho.el.appendChild(v));
        ho.oldMatchHTML.forEach(v=>
            ho.match.appendChild(v));
    },
    redo : ho=>{
        ho.el.innerHTML = "";
        ho.match.innerHTML = "";
        ho.newHTML.forEach(v=>
            ho.el.appendChild(v));
        ho.newMatchHtml.forEach(v=>
            ho.match.appendChild(v));
    }
}
HTMLTreeMatch.prototype.insertAdjacentElement = function(el,position,newEl){
    var $self = this;
    var found = $self.find(el);
    if(!found)
        throw new Error("[HTMLTreeMatch insertAdjacentElement] no match");
    var match = found.match;
    var newEls = newEl.nodeType==11 ? [...newEl.childNodes] : [newEl];
    var newMatch = newEl.cloneNode(true);
    var newMatches = newMatch.nodeType==11 ? [...newMatch.childNodes] : [newMatch];
    el[position](newEl);
    match[position](newMatch);
    $self.setHistory({
        el,
        match,
        newMatches,
        newEls,
        position,
        method : "insertAdjacentElement"
    });
};
historyMethods.insertAdjacentElement = {
    undo : ho=>{
        ho.newEls.forEach(n=>n.remove());
        ho.newMatches.forEach(n=>n.remove());
    },
    redo : ho=>{
        ho.el[ho.position](...ho.newEls);
        ho.match[ho.position](...ho.newMatches);
    }
};

HTMLTreeMatch.prototype.insertAdjacentElements = function(el,position,newEls){
    var $self = this;
    var found = $self.find(el);
    if(!found)
        throw new Error("[HTMLTreeMatch insertAdjacentElements] no match");
    var match = found.match;
    if(!Array.isArray(newEls))
        newEls = [newEls];
    var newMatchs = [];
    if(position.match(/afterbegin|afterend/))
        newEls.reverse();
    newEls.forEach(ne=>{
        var newMatch = ne.cloneNode(true);
        newMatchs.push(newMatch);
        el.insertAdjacentElement(position, ne);
        match.insertAdjacentElement(position,newMatch);
    });
    $self.setHistory({
        el,
        match,
        position,
        newEls,
        newMatchs,
        method : "insertAdjacentElements"
    });
};
historyMethods.insertAdjacentElements = {
    undo : ho=>{
        ho.newEls.forEach(ne=>ne.remove());
        ho.newMatchs.forEach(ne=>ne.remove());
    },
    redo : ho=>{
        ho.newEls.forEach(ne=>ho.el.insertAdjacentElement(ho.position, ne));
        ho.newMatchs.forEach(ne=>ho.match.insertAdjacentElement(ho.position,ne));
    }
};

HTMLTreeMatch.prototype.insertBefore = function(newNode,referenceNode){
    var $self = this;
    var found = $self.find(referenceNode);
    if(!found)
        throw new Error("[HTMLTreeMatch insertBefore] no match");
    var refMatch = found.match;
    var match = refMatch.parentNode;
    var newNodeMatch = newNode.cloneNode(true);
    var parentNode = referenceNode.parentNode;
    parentNode.insertBefore(newNode, referenceNode);
    match.insertBefore(newNodeMatch,refMatch);
    $self.setHistory({
        match,
        parentNode,
        newNode,
        newNodeMatch,
        referenceNode,
        refMatch,
        method : "insertBefore"
    });
};
historyMethods.insertBefore = {
    undo : ho=>{
        ho.parentNode.removeChild(ho.newNode, ho.referenceNode);
        ho.match.removeChild(ho.newNodeMatch,ho.refMatch);
    },
    redo : ho=>{
        ho.parentNode.insertBefore(ho.newNode, ho.referenceNode);
        ho.match.insertBefore(ho.newNodeMatch,ho.refMatch);
    }
};

HTMLTreeMatch.prototype.insertCell = function(tableRow,index){
    var $self = this;
    var tableRowFound = $self.find(tableRow);
    if(!tableRowFound || !tableRowFound.HTML)
        throw new Error("[HTMLTreeMatch insertCell] no match");
    var tableRowMatch = tableRowFound.match;
    var newCell = tableRow.insertCell(index);
    newCell.innerHTML = "new Cell";
    var newCellMatch = tableRowMatch.insertCell(index);
    newCellMatch.innerHTML = "new Cell";
    $self.setHistory({
        tableRow,
        tableRowMatch,
        index,
        method : "insertCell"
    });
};
historyMethods.insertCell = {
    undo : ho=>{
        ho.tableRow.deleteCell(ho.index);
        ho.tableRowMatch.deleteCell(ho.index);
    },
    redo : ho=>{
        var newCell = ho.tableRow.insertCell(ho.index);
        newCell.innerHTML = "new Cell";
        var newCellMatch = ho.tableRowMatch.insertCell(ho.index);
        newCellMatch.innerHTML = "new Cell";
    }
};

HTMLTreeMatch.prototype.insertRow = function(tableEl,index){
    var $self = this;
    var tableFound = $self.find(tableEl);
    if(!tableFound || !tableFound.HTML)
        throw new Error("[HTMLTreeMatch insertRow] no match");
    var tableMatch = tableFound.match;
    var cells = tableEl.rows[0].cells.length;
    var newRow = tableEl.insertRow(index);
    var newRomMatch = tableMatch.insertRow(index);
    for(var i = 0;i<cells;i++) {
        newRow.insertCell(i);
        newRomMatch.insertCell(i);
    }
    $self.setHistory({
        tableEl,
        tableMatch,
        cells,
        index,
        method : "insertRow"
    });
};
historyMethods.insertRow = {
    undo : ho=>{
        ho.tableEl.deleteRow(ho.index);
        ho.tableMatch.deleteRow(ho.index);
    },
    redo : ho=>{
        var newRow = ho.tableEl.insertRow(ho.index);
        var newRomMatch = ho.tableMatch.insertRow(ho.index);
        for(var i = 0;i<ho.cells;i++) {
            newRow.insertCell(i);
            newRomMatch.insertCell(i);
        }
    }
};

HTMLTreeMatch.prototype.mergeColumnCell = function(tableCell,type){
    var $self = this;
    var tableCellFound = $self.find(tableCell);
    if(!tableCellFound || !tableCellFound.HTML)
        throw new Error("[HTMLTreeMatch mergeColumnCell] no match");
    var tableCellMatch = tableCellFound.match;
    var table = tableCell.closest("table");
    var tableMatch = tableCellMatch.closest("table");
    var row = tableCell.parentNode;
    var rowMatch = tableCellMatch.parentNode;
    var indexRow = [...table.rows].indexOf(row);
    var index = [...row.cells].indexOf(tableCell);
    var mergeCell = type=="backward" ? row.cells[index-1] : tableCell;
    var matchMergeCellFind = $self.find(mergeCell);
    if(!matchMergeCellFind || !matchMergeCellFind.HTML)
        throw new Error("[HTMLTreeMatch mergeCell] no match");
    var matchMergeCell = matchMergeCellFind.match;
    var toRemove = type=="backward" ? tableCell : row.cells[index+1];
    var toRemoveMatchFind = $self.find(toRemove);
    if(!toRemoveMatchFind || !toRemoveMatchFind.HTML)
        throw new Error("[HTMLTreeMatch toRemoveMatch] no match");
    var toRemoveIndex = [...row.cells].indexOf(toRemove);
    var toRemoveMatch = toRemoveMatchFind.match;
    toRemove.remove();
    toRemoveMatch.remove();
    var added = [];
    [...toRemove.childNodes].forEach(v=>{
        var newEl = v.cloneNode(true);
        mergeCell.append(newEl);
        added.push(newEl);
    });
    var addedMatch = [];
    [...toRemoveMatch.childNodes].forEach(v=>{
        var newEl = v.cloneNode(true);
        matchMergeCell.append(newEl);
        addedMatch.push(newEl);
    });
    var wasColSpan = mergeCell.hasAttribute("colspan");
    var wasRowSpan = mergeCell.hasAttribute("rowspan");
    mergeCell.colSpan+=toRemove.colSpan;
    var mergeCellRowSpan = mergeCell.rowSpan;
    mergeCell.rowSpan=toRemove.rowSpan;
    matchMergeCell.colSpan=mergeCell.colSpan;
    matchMergeCell.rowSpan=mergeCell.rowSpan;
    $self.setHistory({
        tableCell,
        wasColSpan,
        wasRowSpan,
        tableCellMatch,
        mergeCellRowSpan,
        type,
        toRemove,
        toRemoveIndex,
        toRemoveMatch,
        mergeCell,
        matchMergeCell,
        index,
        rowMatch,
        row,
        added,
        addedMatch,
        method : "mergeColumnCell"
    });
};
historyMethods.mergeColumnCell = {
    undo : ho=>{
        ho.mergeCell.colSpan-=ho.toRemove.colSpan;
        ho.mergeCell.rowSpan=ho.mergeCellRowSpan;
        if(!ho.wasColSpan)
            ho.mergeCell.removeAttribute("colspan");
        if(!ho.wasRowSpan)
            ho.mergeCell.removeAttribute("rowspan");
        ho.matchMergeCell.colSpan=ho.mergeCell.colSpan;
        ho.matchMergeCell.rowSpan=ho.mergeCell.rowSpan;
        if(!ho.wasColSpan)
            ho.matchMergeCell.removeAttribute("colspan");
        if(!ho.wasRowSpan)
            ho.matchMergeCell.removeAttribute("rowspan");
        ho.added.forEach(v=>v.remove());
        ho.addedMatch.forEach(v=>v.remove());
        var newCell = ho.row.insertCell(ho.toRemoveIndex);
        newCell.replaceWith(ho.toRemove);
        var newCellMatch = ho.rowMatch.insertCell(ho.toRemoveIndex);
        newCellMatch.replaceWith(ho.toRemoveMatch);
    },
    redo : ho=>{
        ho.added.forEach(v=>{
            ho.mergeCell.append(v);
        });
        ho.addedMatch.forEach(v=>{
            ho.matchMergeCell.append(v);
        });
        ho.mergeCell.colSpan+=ho.toRemove.colSpan;
        ho.mergeCell.rowSpan=ho.toRemove.rowSpan;
        ho.matchMergeCell.colSpan=ho.mergeCell.colSpan;
        ho.matchMergeCell.rowSpan=ho.mergeCell.rowSpan;
        ho.toRemove.remove();
        ho.toRemoveMatch.remove();
    }
};

HTMLTreeMatch.prototype.mergeRowCell = function(tableCell,type){
    var $self = this;
    var tableCellFound = $self.find(tableCell);
    if(!tableCellFound || !tableCellFound.HTML)
        throw new Error("[HTMLTreeMatch mergeRowCell] no match");
    var tableCellMatch = tableCellFound.match;
    var table = tableCell.closest("table");
    var tableMatch = tableCellMatch.closest("table");
    var row = tableCell.parentNode;
    var indexRow = [...table.rows].indexOf(row);
    var indexCell = [...tableCell.parentNode.cells].indexOf(tableCell);
    var indexRowToExpand;
    var trLength = table.rows[indexRow].cells.length;
    var searchForColumn,searchRowLength;
    if(type=="backward"){
        searchForColumn = indexRow-1;
        searchRowLength = table.rows[searchForColumn].cells.length;
        var searchCellRowSpan = table.rows[searchForColumn].cells[indexCell].rowSpan;
        while(table.rows[searchForColumn] &&
            ( searchRowLength!= trLength &&
            searchCellRowSpan == 1 )
            ){
            searchForColumn--;
            searchRowLength = table.rows[searchForColumn] && table.rows[searchForColumn].cells.length;
            searchCellRowSpan = table.rows[searchForColumn] && table.rows[searchForColumn].cells[indexCell] ?
                table.rows[searchForColumn].cells[indexCell].rowSpan : 1;
        }
        if(table.rows[searchForColumn])
            indexRowToExpand = searchForColumn;
        else
            indexRowToExpand = indexRow-1;
    }
    else
        indexRowToExpand = indexRow;
    var rowToExpand = table.rows[indexRowToExpand];
    var mergeCell = rowToExpand.cells[indexCell];
    var mergeCellClone = mergeCell.cloneNode(true);
    var indexRowToRemove = indexRow+1;
    if(type=="backward")
        indexRowToRemove = indexRow;
    else if(type!="backward" && mergeCell.rowSpan > 1){
        searchForColumn = indexRow+1;
        searchRowLength = table.rows[searchForColumn].cells.length;
        while(table.rows[searchForColumn] &&
        searchRowLength != trLength){
            searchForColumn++;
            searchRowLength = table.rows[searchForColumn] && table.rows[searchForColumn].cells.length;
        }
        if(table.rows[searchForColumn])
            indexRowToRemove = searchForColumn;
        else{
            while(table.rows[indexRowToRemove] && !table.rows[indexRowToRemove].cells[indexCell])
                indexRowToRemove++;
        }
    }
    var rowToRemove =  table.rows[indexRowToRemove];
    var toRemove = rowToRemove.cells[indexCell];
    toRemove.parentNode.removeChild(toRemove);
    if(indexRowToRemove>indexRowToExpand)
        [...toRemove.childNodes].forEach(v=>{
            mergeCell.appendChild(v.cloneNode(true));
        });
    else
        [...toRemove.childNodes].forEach(v=>{
            mergeCell.insertBefore(v.cloneNode(true),mergeCell.firstChild);
        });
    var wasColSpan = mergeCell.hasAttribute("colspan");
    var wasRowSpan = mergeCell.hasAttribute("rowspan");
    mergeCell.rowSpan+=toRemove.rowSpan;
    var mergeCellColSpan = toRemove.colSpan;
    mergeCell.colSpan=toRemove.colSpan;
    tableMatch.rows[indexRowToExpand].replaceWith(rowToExpand.cloneNode(true));
    tableMatch.rows[indexRowToRemove].replaceWith(rowToRemove.cloneNode(true));
    $self.setHistory({
        tableCell,
        wasColSpan,
        wasRowSpan,
        tableCellMatch,
        tableMatch,
        type,
        toRemove,
        mergeCell,
        mergeCellColSpan,
        mergeCellnewHtml : mergeCell.innerHTML,
        indexCell,
        indexRow,
        indexRowToExpand,
        indexRowToRemove,
        row,
        rowToExpand,
        rowToRemove,
        mergeCellClone,
        method : "mergeRowCell"
    });
};
historyMethods.mergeRowCell = {
    undo : ho=>{
        ho.mergeCell.rowSpan-=ho.toRemove.rowSpan;
        ho.mergeCell.colSpan=ho.mergeCellColSpan;
        if(!ho.wasColSpan)
            ho.mergeCell.removeAttribute("colspan");
        if(!ho.wasRowSpan)
            ho.mergeCell.removeAttribute("rowspan");
        var newCell = ho.rowToRemove.insertCell(ho.indexCell);
        newCell.replaceWith(ho.toRemove);
        ho.mergeCell.innerHTML = ho.mergeCellClone.innerHTML;
        ho.tableMatch.rows[ho.indexRowToExpand].replaceWith(ho.rowToExpand.cloneNode(true));
        ho.tableMatch.rows[ho.indexRowToRemove].replaceWith(ho.rowToRemove.cloneNode(true));
    },
    redo : ho=>{
        ho.toRemove.parentNode.removeChild(ho.toRemove);
        ho.mergeCell.innerHTML = ho.mergeCellnewHtml;
        ho.mergeCell.rowSpan+=ho.toRemove.rowSpan;
        ho.mergeCell.colSpan=ho.toRemove.colSpan;
        ho.tableMatch.rows[ho.indexRowToExpand].replaceWith(ho.rowToExpand.cloneNode(true));
        ho.tableMatch.rows[ho.indexRowToRemove].replaceWith(ho.rowToRemove.cloneNode(true));
    }
};

HTMLTreeMatch.prototype.__mergeRowCell = function(tableCell,type){
    var $self = this;
    var tableCellFound = $self.find(tableCell);
    if(!tableCellFound || !tableCellFound.HTML)
        throw new Error("[HTMLTreeMatch mergeRowCell] no match");
    var tableCellMatch = tableCellFound.match;
    var table = tableCell.closest("table");
    var tableMatch = tableCellMatch.closest("table");
    var row = tableCell.parentNode;
    var indexRow = [...table.rows].indexOf(row);
    var indexCell = [...tableCell.parentNode.cells].indexOf(tableCell);
    var indexRowToExpand;
    var trLength = table.rows[indexRow].cells.length;
    var searchForColumn,searchRowLength;
    if(type=="backward"){
        searchForColumn = indexRow-1;
        searchRowLength = table.rows[searchForColumn].cells.length;
        var searchCellRowSpan = table.rows[searchForColumn].cells[indexCell].rowSpan;
        while(table.rows[searchForColumn] &&
        ( searchRowLength!= trLength &&
        searchCellRowSpan == 1 )
            ){
            searchForColumn--;
            searchRowLength = table.rows[searchForColumn] && table.rows[searchForColumn].cells.length;
            searchCellRowSpan = table.rows[searchForColumn] && table.rows[searchForColumn].cells[indexCell] ?
                table.rows[searchForColumn].cells[indexCell].rowSpan : 1;
        }
        if(table.rows[searchForColumn])
            indexRowToExpand = searchForColumn;
        else
            indexRowToExpand = indexRow-1;
    }
    else
        indexRowToExpand = indexRow;
    var rowToExpand = table.rows[indexRowToExpand];
    var mergeCell = rowToExpand.cells[indexCell];
    var matchMergeCellFind = $self.find(mergeCell);
    if(!matchMergeCellFind || !matchMergeCellFind.HTML)
        throw new Error("[HTMLTreeMatch mergeCell] no match");
    var matchMergeCell = matchMergeCellFind.match;
    var indexRowToRemove = indexRow+1;
    if(type=="backward")
        indexRowToRemove = indexRow;
    else if(type!="backward" && mergeCell.rowSpan > 1){
        searchForColumn = indexRow+1;
        searchRowLength = table.rows[searchForColumn].cells.length;
        while(table.rows[searchForColumn] &&
        searchRowLength != trLength){
            searchForColumn++;
            searchRowLength = table.rows[searchForColumn] && table.rows[searchForColumn].cells.length;
        }
        if(table.rows[searchForColumn])
            indexRowToRemove = searchForColumn;
        else{
            while(table.rows[indexRowToRemove] && !table.rows[indexRowToRemove].cells[indexCell])
                indexRowToRemove++;
        }
    }
    var rowToRemove =  table.rows[indexRowToRemove];
    var toRemove = rowToRemove.cells[indexCell];
    var toRemoveMatchFind = $self.find(toRemove);
    if(!toRemoveMatchFind || !toRemoveMatchFind.HTML)
        throw new Error("[HTMLTreeMatch toRemoveMatch] no match");
    var toRemoveIndex = [...row.cells].indexOf(toRemove);
    var toRemoveMatch = toRemoveMatchFind.match;
    toRemove.remove();
    toRemoveMatch.remove();
    var added = [];
    var addedMatch = [];
    if(indexRowToRemove>indexRowToExpand) {
        [...toRemove.childNodes].forEach(v=> {
            var newEl = v.cloneNode(true);
            mergeCell.appendChild(newEl);
            added.push(newEl);
        });
        [...toRemove.childNodes].forEach(v=> {
            var newEl = v.cloneNode(true);
            matchMergeCell.appendChild(newEl);
            addedMatch.push(newEl);
        });
    }
    else {
        [...toRemove.childNodes].forEach(v=> {
            var newEl = v.cloneNode(true);
            mergeCell.insertBefore(newEl, mergeCell.firstChild);
            added.push(newEl);
        });
        [...toRemove.childNodes].forEach(v=> {
            var newEl = v.cloneNode(true);
            mergeCell.insertBefore(newEl, mergeCell.firstChild);
            addedMatch.push(newEl);
        });
    }
    var wasColSpan = mergeCell.hasAttribute("colspan");
    var wasRowSpan = mergeCell.hasAttribute("rowspan");
    mergeCell.rowSpan+=toRemove.rowSpan;
    var mergeCellColSpan = toRemove.colSpan;
    mergeCell.colSpan=toRemove.colSpan;
    tableMatch.rows[indexRowToExpand].replaceWith(rowToExpand.cloneNode(true));
    tableMatch.rows[indexRowToRemove].replaceWith(rowToRemove.cloneNode(true));
    $self.setHistory({
        tableCell,
        wasColSpan,
        wasRowSpan,
        tableCellMatch,
        tableMatch,
        type,
        toRemove,
        mergeCell,
        mergeCellColSpan,
        mergeCellnewHtml : mergeCell.innerHTML,
        indexCell,
        indexRow,
        indexRowToExpand,
        indexRowToRemove,
        row,
        rowToExpand,
        rowToRemove,
        mergeCellClone,
        method : "mergeRowCell"
    });
};
historyMethods.__mergeRowCell = {
    undo : ho=>{
        ho.mergeCell.rowSpan-=ho.toRemove.rowSpan;
        ho.mergeCell.colSpan=ho.mergeCellColSpan;
        if(!ho.wasColSpan)
            ho.mergeCell.removeAttribute("colspan");
        if(!ho.wasRowSpan)
            ho.mergeCell.removeAttribute("rowspan");
        var newCell = ho.rowToRemove.insertCell(ho.indexCell);
        newCell.replaceWith(ho.toRemove);
        ho.mergeCell.innerHTML = ho.mergeCellClone.innerHTML;
        ho.tableMatch.rows[ho.indexRowToExpand].replaceWith(ho.rowToExpand.cloneNode(true));
        ho.tableMatch.rows[ho.indexRowToRemove].replaceWith(ho.rowToRemove.cloneNode(true));
    },
    redo : ho=>{
        ho.toRemove.parentNode.removeChild(ho.toRemove);
        ho.mergeCell.innerHTML = ho.mergeCellnewHtml;
        ho.mergeCell.rowSpan+=ho.toRemove.rowSpan;
        ho.mergeCell.colSpan=ho.toRemove.colSpan;
        ho.tableMatch.rows[ho.indexRowToExpand].replaceWith(ho.rowToExpand.cloneNode(true));
        ho.tableMatch.rows[ho.indexRowToRemove].replaceWith(ho.rowToRemove.cloneNode(true));
    }
};

HTMLTreeMatch.prototype.move = function(pivotEl,el,position){
    var $self = this;
    var pivotElFound = $self.find(pivotEl);
    if(!pivotElFound)
        throw new Error("[HTMLTreeMatch move] pivotEl no match");
    var pivotElMatch = pivotElFound.match;
    var elFound = $self.find(el);
    if(!elFound)
        throw new Error("[HTMLTreeMatch move] el no match");
    var elMatch = elFound.match;
    var parentNode = el.parentNode;
    var parentMatch = elMatch.parentNode;
    var elSibling = el.nextSibling;
    var matchSibling = elMatch.nextSibling;
    pivotEl[position](el);
    pivotElMatch[position](elMatch);
    $self.setHistory({
        el,
        pivotEl,
        pivotElMatch,
        elMatch,
        position,
        parentNode,
        parentMatch,
        elSibling,
        matchSibling,
        method : "move"
    });
};
historyMethods.move = {
    undo : ho=>{
        if(ho.elSibling && ho.elSibling.parentNode) {
            ho.parentNode.insertBefore(ho.el, ho.elSibling);
            ho.parentMatch.insertBefore(ho.elMatch, ho.matchSibling);
        }
        else{
            ho.parentNode.appendChild(ho.el);
            ho.parentMatch.appendChild(ho.elMatch);
        }
    },
    redo : ho=>{
        ho.pivotEl[ho.position](ho.el);
        ho.pivotElMatch[ho.position](ho.elMatch);
    }
};
HTMLTreeMatch.prototype.outerHTML = function(el,text){
    var $self = this;
    var found = $self.find(el);
    if(!found || !found.HTML)
        throw new Error("[HTMLTreeMatch outerHTML] no match");
    var match = found.match;
    var placeholderDiv = el.ownerDocument.createElement("div");
    var placeholderMatchDiv = match.ownerDocument.createElement("div");
    placeholderDiv.innerHTML = text;
    placeholderMatchDiv.innerHTML = text;
    var newNodes = [...placeholderDiv.childNodes];
    var newMatchNodes = [...placeholderMatchDiv.childNodes];
    el.replaceWith(...newNodes);
    match.replaceWith(...newMatchNodes);
    $self.setHistory({
        el,
        match,
        newNodes,
        newMatchNodes,
        method : "outerHTML"
    });
};
historyMethods.outerHTML = {
    undo : ho=>{
        ho.newNodes[0].before(ho.el);
        ho.newMatchNodes[0].before(ho.match);
        ho.newNodes.forEach(v=>v.remove());
        ho.newMatchNodes.forEach(v=>v.remove());
    },
    redo : ho=>{
        ho.el.replaceWith(...ho.newNodes);
        ho.match.replaceWith(...ho.newMatchNodes);
    }
}
HTMLTreeMatch.prototype.prepend = function(el,child){
    var $self = this;
    $self.insertAdjacentElement(el,"prepend",child);
};
HTMLTreeMatch.prototype.removeAttribute = function(el,attrName){
    var $self = this;
    var found = $self.find(el);
    if(!found || (!found.attributes && found.match.getAttribute(attrName) != el.getAttribute(attrName)))
        throw new Error("[HTMLTreeMatch removeAttribute] no match");
    var match = found.match;
    var oldAttribute = el.getAttribute(attrName);
    if(oldAttribute == null)
        return;
    el.removeAttribute(attrName);
    match.removeAttribute(attrName);
    $self.setHistory({
        el,
        match,
        attrName,
        oldAttribute,
        method : "removeAttribute"
    });
};
historyMethods.removeAttribute = {
    undo : historyMethods=>{
        historyMethods.el.setAttribute(historyMethods.attrName, historyMethods.oldAttribute);
        historyMethods.match.setAttribute(historyMethods.attrName, historyMethods.oldAttribute);
    },
    redo : historyMethods=>{
        historyMethods.el.removeAttribute(historyMethods.attrName);
        historyMethods.match.removeAttribute(historyMethods.attrName);
    }
}
HTMLTreeMatch.prototype.removeChild = function(node){
    var $self = this;
    var parentNode = node.parentNode;
    var found = $self.find(node);
    if(!found)
        throw new Error("[HTMLTreeMatch removeChild] no match");
    var match = found.match;
    var parentMatch = match.parentNode;
    var nodeSibling = node.nextSibling;
    var matchSibling = match.nextSibling;
    var oldChild = parentNode.removeChild(node);
    var oldMatch = parentMatch.removeChild(match);
    $self.setHistory({
        el:node,
        match,
        nodeSibling,
        parentNode,
        parentMatch,
        matchSibling,
        oldChild,
        oldMatch,
        method : "removeChild"
    });
};
historyMethods.removeChild = {
    undo:ho=>{
        var c = ho.oldChild;
        if(ho.nodeSibling && ho.nodeSibling.parentNode) {
            ho.parentNode.insertBefore(c, ho.nodeSibling);
            ho.parentMatch.insertBefore(ho.oldMatch, ho.matchSibling);
        }
        else{
            ho.parentNode.appendChild(c);
            ho.parentMatch.appendChild(ho.oldMatch);
        }
    },
    redo:ho=>{
        ho.parentNode.removeChild(ho.oldChild);
        ho.parentMatch.removeChild(ho.oldMatch);
    }
};

HTMLTreeMatch.prototype.removeClass = function(el,className){
    var $self = this;
    if(!el.classList.contains(className))
        return;
    var found = $self.find(el);
    if(!found || (!found.attributes && found.match.getAttribute('class') != el.getAttribute('class')))
        throw new Error("[HTMLTreeMatch removeClass] no match");
    var match = found.match;
    el.classList.remove(className);
    match.classList.remove(className);
    $self.setHistory({
        el,
        match,
        className,
        method : "removeClass"
    });
};
historyMethods.removeClass = {
    undo: ho=>{
        ho.el.classList.add(ho.className);
        ho.match.classList.add(ho.className);
    },
    redo: ho=>{
        ho.el.classList.remove(ho.className);
        ho.match.classList.remove(ho.className);
    }
}

HTMLTreeMatch.prototype.removeHeadNode = function(node){
    var $self = this;
    var match = [...$self.source.head.children].find(v=>v.isEqualNode(node));
    if(!match){
        console.error("no match");
        console.trace();
        return;
    }
    var parentNode = node.ownerDocument.head;
    var nodeIndex = [...parentNode.childNodes].findIndex(v=>v==node);
    var parentMatch = $self.source.head;
    var matchIndex = [...parentMatch.childNodes].findIndex(v=>v==match);
    var oldChild = node.ownerDocument.head.removeChild(node);
    var oldMatch = $self.source.head.removeChild(match);
    $self.setHistory({
        node,
        parentNode,
        match,
        nodeIndex,
        parentMatch,
        matchIndex,
        oldChild,
        oldMatch,
        method : "removeChild"
    });
    /* dispatching */
    window.dispatchEvent(new Event(domChangeEvent));
};
function addHeadNodeUndo(historyObject){
    var parentNode = historyObject.parentNode;
    var parentMatch = historyObject.parentMatch;
    var nodePivot = parentNode.childNodes[historyObject.nodeIndex];
    if(nodePivot)
        parentNode.insertBefore(historyObject.oldChild,nodePivot.nextSibling);
    else
        parentNode.appendChild(nodePivot);

    var matchPivot=parentMatch.childNodes[historyObject.matchIndex];
    if(matchPivot)
        parentMatch.insertBefore(historyObject.oldMatch,nodePivot.nextSibling);
    else
        parentMatch.appendChild(nodePivot);
    /* dispatching */
    window.dispatchEvent(new Event(domChangeEvent));
}

// TODO TESTS!
HTMLTreeMatch.prototype.removeNodeList = function(nodeList){
    var $self = this;
    var list = [];
    [...nodeList].forEach(n=>{
        var parentNode = n.parentNode;
        var found = $self.find(n);
        if(!found){
            console.error("[HTMLTreeMatch removeNodeList] not found element",n);
            console.error("[HTMLTreeMatch removeNodeList] continue",n);
            return;
        }
        var match = found.match;
        var parentMatch = match.parentNode;
        list.push({
            nodeSibling : n.nextSibling,
            matchSibling : match.nextSibling,
            oldChild : parentNode.removeChild(n),
            oldMatch : parentMatch.removeChild(match),
            parentNode,
            match,
            parentMatch
        });
    });
    $self.setHistory({
        list,
        method : "removeNodeList"
    });
};
historyMethods.removeNodeList = {
    undo:ho=>{
        ho.list.forEach(v=>{
            var c = v.oldChild;
            if(v.nodeSibling && v.nodeSibling.parentNode) {
                v.parentNode.insertBefore(c, v.nodeSibling);
                v.parentMatch.insertBefore(v.oldMatch, v.matchSibling);
            }
            else{
                v.parentNode.appendChild(c);
                v.parentMatch.appendChild(v.oldMatch);
            }
        })
    },
    redo:ho=>{
        ho.list.forEach(v=> {
            v.parentNode.removeChild(v.oldChild);
            v.parentMatch.removeChild(v.oldMatch);
        });
    }
};

HTMLTreeMatch.prototype.replaceChild = function(newChild,oldChild){
    var $self = this;
    var parentNode = oldChild.parentNode;
    var found = $self.find(parentNode);
    if(!found)
        throw new Error("[HTMLTreeMatch replaceChild] no match");
    var match = found.match;
    var oldMatch = $self.match(oldChild);
    var newMatch = newChild.cloneNode(true);
    parentNode.replaceChild(newChild, oldChild);
    match.replaceChild(newMatch,oldMatch);
    $self.lastMatch.el = newChild;
    $self.lastMatch.match = newMatch;
    $self.setHistory({
        match,
        oldMatch,
        newMatch,
        parentNode,
        newEl:newChild,
        oldEl:oldChild,
        method : "replaceChild"
    });
};
historyMethods.replaceChild = {
    undo:historyObject=>{
        historyObject.parentNode.replaceChild(historyObject.oldEl,historyObject.newEl);
        historyObject.match.replaceChild(historyObject.oldMatch,historyObject.newMatch);
    },
    redo:historyObject=>{
        historyObject.parentNode.replaceChild(historyObject.newEl,historyObject.oldEl);
        historyObject.match.replaceChild(historyObject.newMatch,historyObject.oldMatch);
    }
}
HTMLTreeMatch.prototype.replaceWith = function(el,node){
    var $self = this;
    var found = $self.find(el);
    if(!found)
        throw new Error("[HTMLTreeMatch replaceChild] no match");
    var match = found.match;
    el.replaceWith(node);
    var newMatch = node.cloneNode(true);
    match.replaceWith(newMatch);
    $self.lastMatch.el = node;
    $self.lastMatch.match = newMatch;
    $self.setHistory({
        el,
        match,
        newMatch,
        newEl:node,
        method : "replaceWith"
    });
};
historyMethods.replaceWith = {
    undo:historyObject=>{
        historyObject.newEl.replaceWith(historyObject.el);
        historyObject.newMatch.replaceWith(historyObject.match);
    },
    redo:historyObject=>{
        historyObject.el.replaceWith(historyObject.newEl);
        historyObject.match.replaceWith(historyObject.newMatch);
    }
}

HTMLTreeMatch.prototype.setAttribute = function(el,attrName,attrValue){
    var $self = this;
    var found = $self.find(el);
    if(!found || (!found.attributes && found.match.getAttribute(attrName) != el.getAttribute(attrName)))
        throw new Error("[HTMLTreeMatch setAttribute] no match");
    var match = found.match;
    var oldAttribute = el.getAttribute(attrName);
    if(oldAttribute == attrValue)
        return;
    el.setAttribute(attrName,attrValue);
    match.setAttribute(attrName,attrValue);
    $self.setHistory({
        el,
        attrName,
        attrValue,
        match,
        oldAttribute,
        method : "setAttribute"
    });
};
historyMethods.setAttribute = {
    undo : historyMethods=>{
        if(historyMethods.oldAttribute != null) {
            historyMethods.el.setAttribute(historyMethods.attrName, historyMethods.oldAttribute);
            historyMethods.match.setAttribute(historyMethods.attrName, historyMethods.oldAttribute);
        }
        else{
            historyMethods.el.removeAttribute(historyMethods.attrName);
            historyMethods.match.removeAttribute(historyMethods.attrName);
        }
    },
    redo : historyMethods=>{
        historyMethods.el.setAttribute(historyMethods.attrName,historyMethods.attrValue);
        historyMethods.match.setAttribute(historyMethods.attrName,historyMethods.attrValue);
    }
}

HTMLTreeMatch.prototype.style = function(el,prop,value,priority){
    var $self = this;
    var found = $self.find(el);
    if(!found || !found.attributes)
        throw new Error("[HTMLTreeMatch style] no match");
    var match = found.match;
    var wasWithout;
    if(!el.hasAttribute("style"))
        wasWithout = true;
    var oldValue = el.style.getPropertyValue(prop);
    var oldPriority = el.style.getPropertyPriority(prop);
    if(value == oldValue && priority == oldPriority)
        return;
    el.style.setProperty(prop, value, priority);
    var newProp = el.style.getPropertyValue(prop);
    var newPrior = el.style.getPropertyPriority(prop);
    if(newProp==oldValue && newPrior==oldPriority)
        return;
    match.style.setProperty(prop, value, priority);
    $self.setHistory({
        el,
        match,
        prop,
        value,
        oldValue,
        oldPriority,
        wasWithout,
        priority,
        method : "style"
    });
};
historyMethods.style = {
    undo:ho=>{
        ho.el.style.setProperty(ho.prop, ho.oldValue, ho.oldPriority);
        ho.match.style.setProperty(ho.prop, ho.oldValue, ho.oldPriority);
        if(ho.wasWithout){
            ho.el.removeAttribute("style");
            ho.match.removeAttribute("style");
        }
    },
    redo:ho=>{
        ho.el.style.setProperty(ho.prop,ho.value, ho.priority);
        ho.match.style.setProperty(ho.prop,ho.value, ho.priority);
    }
}

HTMLTreeMatch.prototype.textContent = function(el,text){
    var $self = this;
    var found = $self.find(el);
    if(!found || !found.HTML)
        throw new Error("[HTMLTreeMatch textContent] no match");
    var match = found.match;
    var oldTxtContent = el.textContent;
    var oldMatchTxtContent = match.textContent;
    el.textContent = text;
    match.textContent = text;
    $self.setHistory({
        el,
        match,
        text,
        oldTxtContent,
        oldMatchTxtContent,
        method : "textContent"
    });
};
historyMethods.textContent = {
    undo : ho=>{
        ho.el.textContent = ho.oldTxtContent;
        ho.match.textContent = ho.oldMatchTxtContent;
    },
    redo : ho=>{
        ho.el.textContent = ho.text;
        ho.match.textContent = ho.text;
    }
}

})();
(()=>{
window.addEventListener("WYSIWYG-end",()=>{
    tilepieces.lastEditable = null;
});
TilepiecesCore.prototype.contenteditable = function(target) {
    tilepieces.lastEditable = tilepieces.core.htmlMatch.contenteditable(target);
}
// https://bugs.chromium.org/p/chromium/issues/detail?id=922618&q=stylesheet%20href%20change&can=2
// can't use onload on chrome already added nodes even changing the href.
// however, maybe that's the only way ( safari has problem too )
TilepiecesCore.prototype.fetchingStylesheet = function(href){
    var $self = this;
    return new Promise((resolve,reject)=>{
        fetch(href).then(res=>{
            if(res.status!=200){
                console.error("[error loading stylesheet, status != 200]->",res);
                reject(res)
            }
            else{
                var contentType = res.headers.get('Content-Type');
                var contentTypeTokens = contentType ? contentType.split(";") : [];
                if(contentTypeTokens.find(v=>v.trim()=="text/css"))
                    resolve();
                else {
                    console.error("[error loading stylesheet, content-type mismatch]->",res);
                    reject(res)
                }
            }
        },err=>{
            console.error("[error loading stylesheet]->",err);
            reject(err)
        });
    })
}
function longPollingStyleSheet(style,cb){
    if(!style.sheet){
        setTimeout(()=>{
            longPollingStyleSheet(style,cb)
        });
    }
    else cb();
}

function findGeneratorIndexes($self){
    var doc = $self.currentDocument;
    var idGenerator = tilepieces.idGenerator;
    var classGenerator = tilepieces.classGenerator;
    var templates,classSearch,els;
    if(classGenerator) {
        var classMatch = new RegExp(`${classGenerator}\\d+$`);
        templates = doc.querySelectorAll("template");
        classSearch = `[class^="${classGenerator}"]`;
        els = [...doc.querySelectorAll(classSearch)];
        [...templates].forEach(t=>{
            els = els.concat([...t.content.querySelectorAll(classSearch)])
        });
        els.forEach(e=>[...e.classList].forEach(v=>{
            if(v.match(classMatch)){
                var number = v.match(/\d+/);
                if(!number)
                    return;
                number = Number(number[0]);
                if(number> $self.classIndex)
                    $self.classIndex = number;
            }
        }))
    }
    if(idGenerator) {
        var idMatch = new RegExp(`${idGenerator}\\d+$`);
        templates = doc.querySelectorAll("template");
        var idSearch = `[id^="${idGenerator}"]`;
        els = [...doc.querySelectorAll(idSearch)];
        [...templates].forEach(t=>{
            els = els.concat([...t.content.querySelectorAll(idSearch)])
        });
        els.forEach(e=> {
            var m = e.id.match(idMatch);
            if(!m)
                return;
            var number = m[0].match(/\d+/);
            if(!number)
                return;
            number = Number(number[0]);
            if (number > $self.idIndex)
                $self.idIndex = number;
        })
    }
}
window.addEventListener("cssMapper-changed",e=>{
    var styleParsed = e.detail.styles;
    var defaults = tilepieces.cssDefaultValues["font-family"];
    styleParsed.fontDeclarations.forEach(f=>{
        if(!e.detail.fontAlreadyDeclared.find(v=>v==f) &&
            !defaults.find(v=>v==f))
            e.detail.fontAlreadyDeclared.push(f);
    });
    styleParsed.fonts.forEach(f=>{
        if(f.mapped.fontFamily &&
            !e.detail.fontAlreadyDeclared.find(v=>v==f.mapped.fontFamily) &&
            !defaults.find(v=>v==f.mapped.fontFamily) &&
            e.detail.currentDocument.fonts.check("12px " + f.mapped.fontFamily))
            e.detail.fontAlreadyDeclared.push(f.mapped.fontFamily);
    });
    e.detail.fontSuggestions = e.detail.fontAlreadyDeclared.concat(defaults);
});
function getUnitProperties(d,prop){
    var declarationMatchInCss = d.cssRules.matchStyle(prop);
    var declaration = declarationMatchInCss ? declarationMatchInCss.value : d.styles[prop];
    var numberValue = declaration ? declaration.match(regexNumbers) : null;
    if(!numberValue)
        return {
            name : prop,
            value : declaration,
            declaration
        };
    else
        return {
            name : prop,
            value : numberValue[0],
            declaration,
            unit : declaration.replace(numberValue,"")
        }
}
let iframeTest = document.querySelector("iframe");
let highlightOver = document.createElement("div");
highlightOver.id = "highlight-over";
let selectionDiv = document.createElement("div");
selectionDiv.className = "highlight-selection";
selectionDiv.tabIndex="1";
document.body.appendChild(highlightOver);
document.body.appendChild(selectionDiv);

let drawSelection;//requestAnimationFrame reference

window.tilepieces = {
  // setted on run time by the environment
  projects : [],
  globalComponents : [],
  localComponents : [],
  isComponent : false,
  currentProject : null,
  fileSelected : {},
  applicationName : "tilepieces", //??,
  componentPath : "components",
  componentAttribute:"data-tilepieces-component",
  currentStyleSheetAttribute:"data-tilepieces-current-stylesheet",
  // setted on menu bar and others
  currentPage : {},
  core : null,
  panels : [],
  lastEditable : null,
  multiselections : [],
  editMode : "",
  name : "tilepieces",
  editElements : {
    highlight : highlightOver,
    selection : selectionDiv
  },
  relativePaths:true,
  imageDir : "images",
  miscDir : "miscellaneous",
  frame : iframeTest,
  panelPosition:"free",
  idGenerator : "app-",
  classGenerator : "app-",
  getFilesAsDataUrl : true,
  insertionMode:'append',
  storageInterface : window.storageInterface,
  delayUpdateFileMs : 500,
  sandboxFrame : true,
  waitForStyleSheetLoadMs : 10000,
  imageTypeProcess : window.storageInterface ? 0 : 64, // 64 : base64
  insertStyleSheets : "stylesheet",// stylesheet,inline,inline!important
  menuFileList : [],
  htmlDefaultPath : "html",
  jsDefaultPath : "js",
  cssDefaultPath : "css",
  workspace : "www",
  terserConfiguration : {
    sourceMap : true,
    JSON : {}
  },
  frameResourcePath : ()=>tilepieces.workspace ? (tilepieces.workspace + "/" + (tilepieces.currentProject || "")).replace(/\/\//g,"/") : "",
  serviceWorkers : [],
  utils:{
    numberRegex : /[+-]?\d+(?:\.\d+)?|[+-]?\.\d+?/,
    colorRegex : /rgb\([^)]*\)|rgba\([^)]*\)|#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})\b|hsl\([^)]*\)|hsla\([^)]*\)/g,
    valueRegex : /([+-]?\d+(?:\.\d+)?|[+-]?\.\d+?)(em|ex|ch|rem|vh|vw|vmin|vmax|cm|mm|in|px|pt|pc|fr)/g,
    // Phrasing content ( https://html.spec.whatwg.org/#phrasing-content )
    // Heading content ( https://html.spec.whatwg.org/#heading-content )
    // Embedded content
    // interactive content minus a
    // https://stackoverflow.com/questions/9852312/list-of-html5-elements-that-can-be-nested-inside-p-element
    // minus A,
    tagWhereCannotInsertOthers : /^(P|H1|H2|H3|H4|H5|H6|HR|ABBR|AUDIO|B|BDI|BDO|BR|BUTTON|CANVAS|CITE|CODE|DATA|DATALIST|DEL|DFN|EM|EMBED|I|IFRAME|IMG|INPUT|INS|HR|KBD|LABEL|MAP|MARK|METER|NOSCRIPT|OBJECT|OUTPUT|PICTURE|PROGRESS|Q|RUBY|SAMP|SCRIPT|SELECT|SLOT|SMALL|SPAN|STRONG|SUB|SUP|SVG|TEMPLATE|TEXTAREA|TIME|U|UL|OL|DL|VAR|VIDEO|WBR)$/,
    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories
    flowTags : /^(A|ABBR|ADDRESS|ARTICLE|ASIDE|AUDIO|B|BDO|BDI|BLOCKQUOTE|BR|BUTTON|CANVAS|CITE|CODE|COMMAND|DATA|DATALIST|DEL|DETAILS|DFN|DIV|DL|EM|EMBED|FIELDSET|FIGURE|FOOTER|FORM|H1|H2|H3|H4|H5|H6|HEADER|HGROUP|HR|I|IFRAME|IMG|INPUT|INS|KBD|KEYGEN|LABEL|MAIN|MAP|MARK|MATH|MENU|METER|NAV|NOSCRIPT|OBJECT|OL|OUTPUT|P|PICTURE|PRE|PROGRESS|Q|RUBY|S|SAMP|SCRIPT|SECTION|SELECT|SMALL|SPAN|STRONG|SUB|SUP|SVG|TABLE|TEMPLATE|TEXTAREA|TIME|UL|VAR|VIDEO|WBR)$/,
    phrasingTags : /^(A|ABBR|AUDIO|B|BDI|BDO|BR|BUTTON|CANVAS|CITE|CODE|DATA|DATALIST|DEL|DFN|EM|EMBED|I|IFRAME|IMG|INPUT|INS|KBD|LABEL|MAP|MARK|METER|NOSCRIPT|OBJECT|OUTPUT|PICTURE|PROGRESS|Q|RUBY|SAMP|SCRIPT|SELECT|S|SLOT|SMALL|SPAN|STRONG|SUB|SUP|SVG|TEMPLATE|TEXTAREA|TIME|U|VAR|VIDEO|WBR)$/,
    notInsertableTags : /^(UL|OL|DL|TABLE|COL|COLGROUP|TBODY|THEAD|TFOOT|TR)$/,
    embeddedContentTags : /AUDIO|CANVAS|EMBED|IFRAME|IMG|MATH|NOSCRIPT|PICTURE|SVG|VIDEO/,
    notEditableTags : /^(AREA|AUDIO|BR|CANVAS|DATALIST|EMBED|HEAD|HR|IFRAME|IMG|INPUT|LINK|MAP|METER|META|OBJECT|OUTPUT|MATH|PROGRESS|PICTURE|SELECT|SCRIPT|SOURCE|SVG|STYLE|TEXTAREA|TITLE|VIDEO)$/,
    textPermittedPhrasingTags : /^(A|ABBR|B|BDI|BDO|BR|CITE|CODE|DATA|DEL|DFN|EM|I|INS|KBD|MARK|OUTPUT|Q|RUBY|SAMP|S|SMALL|SPAN|STRONG|SUB|SUP|TIME|U|VAR|WBR)$/,
    textPermittedFlowTags : /^(UL|OL|H1|H2|H3|H4|H5|H6|P)$/,
    restrictedFlowInsideTags : /^(H1|H2|H3|H4|H5|H6|P)$/,
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#textjavascript
    javascriptMimeTypes : ["","module","application/javascript", "application/ecmascript", "application/x-ecmascript ", "application/x-javascript ", "text/javascript", "text/ecmascript", "text/javascript1.0 ", "text/javascript1.1 ", "text/javascript1.2 ", "text/javascript1.3 ", "text/javascript1.4 ", "text/javascript1.5 ", "text/jscript ", "text/livescript ", "text/x-ecmascript ", "text/x-javascript"],
    // https://stackoverflow.com/a/19709846
    URLIsAbsolute :/^(?:[a-z]+:)?\/\//i,
    // https://stackoverflow.com/questions/49974145/how-to-convert-rgba-to-hex-color-code-using-javascript#:~:text=Since%20the%20alpha%20channel%20in,%2Fg%2C%20'').
    // https://css-tricks.com/converting-color-spaces-in-javascript/
    // functions:
    elementSum,
    processFile,
    getDimension,
    splitCssValue,
    convertGroupingRuleToSelector,
    notAdmittedTagNameInPosition,
    download,
    createDocumentString,
    unregisterSw,
    paddingURL,
    getRelativePath,
    getDocumentPath
  }
};
tilepieces.cssDefaultProperties= [];
(()=>{
for (var k in document.body.style) {
    if(k == "cssFloat")
        continue;
    if (isNaN(k)) {
        var value = "";
        for (var i = 0; i < k.length; i++) {
            if (k.charAt(i) === k.charAt(i).toUpperCase())
                value += "-" + k.charAt(i).toLowerCase();
            else
                value += k.charAt(i)
        }
        tilepieces.cssDefaultProperties.push(value);
    }
}
})();
tilepieces.cssDefaultValues = {
    "align-content": [
    "normal",
    "stretch",
    "center",
    "flex-start",
    "flex-end",
    "space-between",
    "space-around",
    "space-evenly",
    "start",
    "end",
    "left",
    "right",
    "baseline",
    "first baseline",
    "last baseline",
    "safe",
    "unsafe",
    "initial",
    "inherit",
    "unset"
],
    "align-items": [
    "stretch",
    "center",
    "flex-start",
    "flex-end",
    "baseline",
    "initial",
    "inherit",
    "unset"
],
    "align-self": [
    "auto",
    "stretch",
    "center",
    "flex-start",
    "flex-end",
    "baseline",
    "initial",
    "inherit",
    "unset"
],
    "all": [
    "initial",
    "inherit",
    "unset"
],
    "animation": [
    "{duration} | {timing-function} | {delay} | {iteration-count} | {direction} | {fill-mode} | {play-state} | {name}",
    "300ms ease-in 1s infinite reverse both running ANIMATIONNAME",
    "600ms ease-out 0.8s 4 alternate-reverse forwards ANIMATIONNAME",
    "1.5s ease 0.8s 5 alternate ANIMATIONNAME",
    "1.7s step-start 1s 6 ANIMATIONNAME",
    "1.9s step-end 1s 7 ANIMATIONNAME",
    "2s ease-in-out 1s ANIMATIONNAME",
    "3s linear ANIMATIONNAME",
    "4s ANIMATIONNAME",
    "initial",
    "inherit",
    "unset"
],
    "animation-delay": [
    "1s",
    "200ms",
    "initial",
    "inherit",
    "unset"
],
    "animation-direction": [
    "normal",
    "reverse",
    "alternate",
    "alternate-reverse",
    "initial",
    "inherit",
    "unset"
],
    "animation-duration": [
    "1s",
    "200ms",
    "initial",
    "inherit",
    "unset"
],
    "animation-fill-mode": [
    "none",
    "forwards",
    "backwards",
    "both",
    "initial",
    "inherit",
    "unset"
],
    "animation-iteration-count": [
    "1",
    "infinite",
    "initial",
    "inherit",
    "unset"
],
    "animation-name": [
    "ANIMATIONNAME",
    "none",
    "initial",
    "inherit",
    "unset"
],
    "animation-play-state": [
    "paused",
    "running",
    "initial",
    "inherit",
    "unset"
],
    "animation-timing-function": [
    "linear",
    "ease",
    "ease-in",
    "ease-out",
    "ease-in-out",
    "step-start",
    "step-end",
    "steps(1,end)",
    "cubic-bezier(0,0,0,0)",
    "initial",
    "inherit",
    "unset"
],
    "backface-visibility": [
    "visible",
    "hidden",
    "initial",
    "inherit",
    "unset"
],
    "background": [
    "url(URL) no-repeat scroll 0 0 transparent",
    "initial",
    "inherit",
    "unset"
],
    "background-attachment": [
    "scroll",
    "fixed",
    "local",
    "initial",
    "inherit",
    "unset"
],
    "background-blend-mode": [
    "normal",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "saturation",
    "color",
    "luminosity",
    "initial",
    "unset",
    "inherit"
],
    "background-clip": [
    "border-box",
    "padding-box",
    "content-box",
    "initial",
    "inherit",
    "unset"
],
    "background-color": [
    "rgb(0, 0, 0)",
    "transparent",
    "initial",
    "inherit",
    "unset"
],
    "background-image": [
    "url('URL')",
    "none",
    "linear-gradient(45deg, black, transparent)",
    "radial-gradient(black, transparent)",
    "repeating-linear-gradient(45deg, black, transparent 100px)",
    "repeating-radial-gradient(black, transparent 100px)",
    "initial",
    "inherit",
    "unset"
],
    "background-origin": [
    "padding-box",
    "border-box",
    "content-box",
    "initial",
    "inherit",
    "unset"
],
    "background-position": [
    "left",
    "top",
    "center",
    "bottom",
    "0% 0%",
    "left top",
    "center center",
    "right bottom",
    "1px 1px",
    "initial",
    "inherit",
    "unset"
],
    "background-position-x": [
        "left",
        "center",
        "right",
        "0",
        "1px",
        "initial",
        "inherit",
        "unset"
],
    "background-position-y": [
        "top",
        "center",
        "bottom",
        "0",
        "1px",
        "initial",
        "inherit",
        "unset"
],
    "background-repeat": [
    "repeat",
    "repeat-x",
    "repeat-y",
    "no-repeat",
    "space",
    "round",
    "repeat space",
    "round space",
    "no-repeat round",
    "initial",
    "inherit",
    "unset"
],
    "background-size": [
    "auto",
    "100px 100px",
    "100% 100%",
    "cover",
    "contain",
    "initial",
    "inherit",
    "unset"
],
    "border": [
    "1px solid rgb(0,0,0)",
    "initial",
    "inherit",
    "unset"
],
    "border-bottom": [
    "1px solid rgb(0,0,0)",
    "initial",
    "inherit",
    "unset"
],
    "border-bottom-color": [
    "rgb(0,0,0)",
    "transparent",
    "initial",
    "inherit",
    "unset"
],
    "border-bottom-left-radius": [
    "100px",
    "100%",
    "initial",
    "inherit",
    "unset"
],
    "border-bottom-right-radius": [
    "100px",
    "100%",
    "initial",
    "inherit",
    "unset"
],
    "border-bottom-style": [
    "none",
    "hidden",
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
    "initial",
    "inherit",
    "unset"
],
    "border-bottom-width": [
    "medium",
    "thin",
    "thick",
    "1px",
    "initial",
    "inherit",
    "unset"
],
    "border-collapse": [
    "separate",
    "collapse",
    "initial",
    "inherit",
    "unset"
],
    "border-color": [
    "rgb(0,0,0)",
    "transparent",
    "initial",
    "inherit",
    "unset"
],
    "border-image": [
    "none 100% 1 0 stretch",
    "initial",
    "inherit",
    "unset"
],
    "border-image-outset": [
    "1px",
    "1",
    "initial",
    "inherit",
    "unset"
],
    "border-image-repeat": [
    "stretch",
    "repeat",
    "round",
    "space",
    "round stretch",
    "space repeat",
    "initial",
    "inherit",
    "unset"
],
    "border-image-slice": [
    "1",
    "2%",
    "fill",
    "initial",
    "inherit",
    "unset"
],
    "border-image-source": [
    "none",
    "url(URL)",
    "initial",
    "inherit",
    "unset"
],
    "border-image-width": [
    "1px",
    "1",
    "1%",
    "auto",
    "initial",
    "inherit",
    "unset"
],
    "border-left": [
    "1px solid rgb(0,0,0)",
    "initial",
    "inherit",
    "unset"
],
    "border-left-color": [
    "rgb(0,0,0)",
    "transparent",
    "initial",
    "inherit",
    "unset"
],
    "border-left-style": [
    "none",
    "hidden",
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
    "initial",
    "inherit",
    "unset"
],
    "border-left-width": [
    "medium",
    "thin",
    "thick",
    "1px",
    "initial",
    "inherit",
    "unset"
],
    "border-radius": [
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "border-right": [
    "1px solid rgb(0,0,0)",
    "initial",
    "inherit",
    "unset"
],
    "border-right-color": [
    "rgb(0,0,0)",
    "transparent",
    "initial",
    "inherit",
    "unset"
],
    "border-right-style": [
    "none",
    "hidden",
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
    "initial",
    "inherit",
    "unset"
],
    "border-right-width": [
    "medium",
    "thin",
    "thick",
    "1px",
    "initial",
    "inherit",
    "unset"
],
    "border-spacing": [
    "1px",
    "initial",
    "inherit",
    "unset"
],
    "border-style": [
    "none",
    "hidden",
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
    "initial",
    "inherit",
    "unset"
],
    "border-top": [
    "1px solid rgb(0,0,0)",
    "initial",
    "inherit",
    "unset"
],
    "border-top-color": [
    "rgb(0,0,0)",
    "transparent",
    "initial",
    "inherit",
    "unset"
],
    "border-top-left-radius": [
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "border-top-right-radius": [
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "border-top-style": [
    "none",
    "hidden",
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
    "initial",
    "inherit",
    "unset"
],
    "border-top-width": [
    "medium",
    "thin",
    "thick",
    "1px",
    "initial",
    "inherit",
    "unset"
],
    "border-width": [
    "medium",
    "thin",
    "thick",
    "1px",
    "initial",
    "inherit",
    "unset"
],
    "bottom": [
    "auto",
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "box-decoration-break": [
    "slice",
    "clone",
    "initial",
    "inherit",
    "unset"
],
    "box-shadow": [
    "none",
    "10px 20px 30px blue inset",
    "initial",
    "inherit",
    "unset"
],
    "box-sizing": [
    "content-box",
    "border-box",
    "initial",
    "inherit",
    "unset"
],
    "caption-side": [
    "top",
    "bottom",
    "initial",
    "inherit",
    "unset"
],
    "caret-color": [
    "auto",
    "rgb(0,0,0)",
    "initial",
    "unset",
    "inherit"
],
    "clear": [
    "none",
    "left",
    "right",
    "both",
    "initial",
    "inherit",
    "unset"
],
    "clip": [
    "auto",
    "shape",
    "initial",
    "inherit",
    "unset"
],
    "clip-path": [
    "circle(50%)",
    "none",
    "initial",
    "inherit",
    "unset"
],
    "color": [
    "rgb(0,0,0)",
    "initial",
    "inherit",
    "unset"
],
    "column-count": [
    "1",
    "auto",
    "initial",
    "inherit",
    "unset"
],
    "column-fill": [
    "balance",
    "auto",
    "initial",
    "inherit",
    "unset"
],
    "column-gap": [
    "1px",
    "normal",
    "initial",
    "inherit",
    "unset"
],
    "column-rule": [
    "column-rule-width",
    "column-rule-style",
    "column-rule-color",
    "initial",
    "inherit",
    "unset"
],
    "column-rule-color": [
    "color",
    "initial",
    "inherit",
    "unset"
],
    "column-rule-style": [
    "none",
    "hidden",
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
    "initial",
    "inherit",
    "unset"
],
    "column-rule-width": [
    "medium",
    "thin",
    "thick",
    "1px",
    "initial",
    "inherit",
    "unset"
],
    "column-span": [
    "none",
    "all",
    "initial",
    "inherit",
    "unset"
],
    "column-width": [
    "auto",
    "1px",
    "initial",
    "inherit",
    "unset"
],
    "columns": [
    "auto",
    "column-width",
    "column-count",
    "initial",
    "inherit",
    "unset"
],
    "content": [
    "normal",
    "none",
    "counter",
    "attr(attribute)",
    "string",
    "open-quote",
    "close-quote",
    "no-open-quote",
    "no-close-quote",
    "url(url)",
    "initial",
    "inherit",
    "unset"
],
    "counter-increment": [
    "none",
    "idnumber",
    "initial",
    "inherit",
    "unset"
],
    "counter-reset": [
    "none",
    "idnumber",
    "initial",
    "inherit",
    "unset"
],
    "cursor": [
    "alias",
    "all-scroll",
    "auto",
    "cell",
    "context-menu",
    "col-resize",
    "copy",
    "crosshair",
    "default",
    "e-resize",
    "ew-resize",
    "grab",
    "grabbing",
    "help",
    "move",
    "n-resize",
    "ne-resize",
    "nesw-resize",
    "ns-resize",
    "nw-resize",
    "nwse-resize",
    "no-drop",
    "none",
    "not-allowed",
    "pointer",
    "progress",
    "row-resize",
    "s-resize",
    "se-resize",
    "sw-resize",
    "text",
    "URL",
    "vertical-text",
    "w-resize",
    "wait",
    "zoom-in",
    "zoom-out",
    "initial",
    "inherit",
    "unset"
],
    "direction": [
    "ltr",
    "rtl",
    "initial",
    "inherit",
    "unset"
],
    "display": [
    "inline",
    "block",
    "contents",
    "flex",
    "grid",
    "inline-block",
    "inline-flex",
    "inline-grid",
    "inline-table",
    "list-item",
    "run-in",
    "table",
    "table-caption",
    "table-column-group",
    "table-header-group",
    "table-footer-group",
    "table-row-group",
    "table-cell",
    "table-column",
    "table-row",
    "none",
    "initial",
    "inherit",
    "unset"
],
    "empty-cells": [
    "show",
    "hide",
    "initial",
    "inherit",
    "unset"
],
    "filter": [
    "none",
    "blur(0px)",
    "brightness(0%)",
    "contrast(0%)",
    "drop-shadow(0 0 0 0 rgba(0,0,0,0))",
    "grayscale(0%)",
    "hue-rotate(0deg)",
    "invert(0%)",
    "opacity(0%)",
    "saturate(0%)",
    "sepia(0%)",
    "url(URL)",
    "initial",
    "inherit",
    "unset"
],
    "flex": [
    "0 1 auto",
    "auto",
    "initial",
    "none",
    "inherit",
    "unset"
],
    "flex-basis": [
    "1",
    "auto",
    "initial",
    "inherit",
    "unset"
],
    "flex-direction": [
    "row",
    "row-reverse",
    "column",
    "column-reverse",
    "initial",
    "inherit",
    "unset"
],
    "flex-flow": [
    "flex-direction",
    "flex-wrap",
    "initial",
    "inherit",
    "unset"
],
    "flex-grow": [
    "1",
    "initial",
    "inherit",
    "unset"
],
    "flex-shrink": [
    "1",
    "initial",
    "inherit",
    "unset"
],
    "flex-wrap": [
    "nowrap",
    "wrap",
    "wrap-reverse",
    "initial",
    "inherit",
    "unset"
],
    "float": [
    "none",
    "left",
    "right",
    "initial",
    "inherit",
    "unset"
],
    "font": [
    "normal normal 400 1em/normal Arial, Helvetica, sans-serif",
    "caption",
    "icon",
    "menu",
    "message-box",
    "small-caption",
    "status-bar",
    "initial",
    "inherit",
    "unset"
],
    "font-family": [
    "serif",
    "sans-serif",
    "monospace",
    "cursive",
    "fantasy",
    "initial",
    "inherit",
    "unset"
],
    "font-kerning": [
    "auto",
    "normal",
    "none",
    "initial",
    "unset",
    "inherit"
],
    "font-size": [
    "medium",
    "xx-small",
    "x-small",
    "small",
    "large",
    "x-large",
    "xx-large",
    "smaller",
    "larger",
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "font-size-adjust": [
    "1",
    "none",
    "initial",
    "inherit",
    "unset"
],
    "font-stretch": [
    "ultra-condensed",
    "extra-condensed",
    "condensed",
    "semi-condensed",
    "normal",
    "semi-expanded",
    "expanded",
    "extra-expanded",
    "ultra-expanded",
    "initial",
    "inherit",
    "unset"
],
    "font-style": [
    "normal",
    "italic",
    "oblique",
    "initial",
    "inherit",
    "unset"
],
    "font-variant": [
    "normal",
    "small-caps",
    "initial",
    "inherit",
    "unset"
],
    "font-weight": [
    "normal",
    "bold",
    "bolder",
    "lighter",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "initial",
    "inherit",
    "unset"
],
    "grid": [
    "none",
    "initial",
    "inherit",
    "unset"
],
    "grid-area": [
    "auto / auto / auto / auto",
    "auto",
    "itemname",
    "initial",
    "inherit",
    "unset"
],
    "grid-auto-columns": [
    "auto",
    "fit-content()",
    "max-content",
    "min-content",
    "minmax(min.max)",
    "1px",
    "1%",
    "initial",
    "unset",
    "inherit"
],
    "grid-auto-flow": [
    "row",
    "column",
    "dense",
    "rowdense",
    "columndense",
    "initial",
    "unset",
    "inherit"
],
    "grid-auto-rows": [
    "auto",
    "max-content",
    "min-content",
    "1px",
    "initial",
    "unset",
    "inherit"
],
    "grid-column": [
    "grid-column-start",
    "grid-column-end",
    "initial",
    "unset",
    "inherit"
],
    "grid-column-end": [
    "auto",
    "spann",
    "column-line",
    "initial",
    "unset",
    "inherit"
],
    "grid-column-gap": [
    "1px",
    "initial",
    "unset",
    "inherit"
],
    "grid-column-start": [
    "auto",
    "spann",
    "column-line",
    "initial",
    "unset",
    "inherit"
],
    "grid-gap": [
    "grid-row-gap",
    "grid-column-gap",
    "initial",
    "unset",
    "inherit"
],
    "grid-row": [
    "grid-row-start",
    "grid-row-end",
    "initial",
    "unset",
    "inherit"
],
    "grid-row-end": [
    "auto",
    "spann",
    "column-line",
    "initial",
    "unset",
    "inherit"
],
    "grid-row-gap": [
    "1px",
    "initial",
    "unset",
    "inherit"
],
    "grid-row-start": [
    "auto",
    "row-line",
    "initial",
    "unset",
    "inherit"
],
    "grid-template": [
    "none",
    "initial",
    "inherit",
    "unset"
],
    "grid-template-areas": [
    "none",
    "itemnames",
    "initial",
    "unset",
    "inherit"
],
    "grid-template-columns": [
    "none",
    "auto",
    "max-content",
    "min-content",
    "1px",
    "initial",
    "inherit",
    "unset"
],
    "grid-template-rows": [
    "none",
    "auto",
    "max-content",
    "min-content",
    "1px",
    "initial",
    "unset",
    "inherit"
],
    "hanging-punctuation": [
    "none",
    "first",
    "last",
    "allow-end",
    "force-end",
    "initial",
    "inherit",
    "unset"
],
    "height": [
    "auto",
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "hyphens": [
    "none",
    "manual",
    "auto",
    "initial",
    "inherit",
    "unset"
],
    "isolation": [
    "auto",
    "isolate",
    "initial",
    "inherit",
    "unset"
],
    "justify-content": [
    "flex-start",
    "flex-end",
    "center",
    "space-between",
    "space-around",
    "initial",
    "inherit",
    "unset"
],
    "left": [
    "auto",
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "letter-spacing": [
    "normal",
    "1px",
    "initial",
    "inherit",
    "unset"
],
    "line-height": [
    "normal",
    "1",
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "list-style": [
    "square",
    "georgian",
    "disc",
    "decimal",
    "'-'",
    "url('URL')",
    "initial",
    "inherit",
    "unset"
],
    "list-style-image": [
    "none",
    "url('URL')",
    "initial",
    "inherit",
    "unset"
],
    "list-style-position": [
    "inside",
    "outside",
    "initial",
    "inherit",
    "unset"
],
    "list-style-type": [
    "disc",
    "armenian",
    "circle",
    "cjk-ideographic",
    "decimal",
    "decimal-leading-zero",
    "georgian",
    "hebrew",
    "hiragana",
    "hiragana-iroha",
    "katakana",
    "katakana-iroha",
    "lower-alpha",
    "lower-greek",
    "lower-latin",
    "lower-roman",
    "none",
    "square",
    "upper-alpha",
    "upper-greek",
    "upper-latin",
    "upper-roman",
    "'\\1F44D'",
    "'\\2713'",
    "'\\2714'",
    "initial",
    "inherit",
    "unset"
],
    "margin": [
    "1px",
    "1%",
    "auto",
    "initial",
    "inherit",
    "unset"
],
    "margin-bottom": [
    "1px",
    "1%",
    "auto",
    "initial",
    "inherit",
    "unset"
],
    "margin-left": [
    "1px",
    "1%",
    "auto",
    "initial",
    "inherit",
    "unset"
],
    "margin-right": [
    "1px",
    "1%",
    "auto",
    "initial",
    "inherit",
    "unset"
],
    "margin-top": [
    "1px",
    "1%",
    "auto",
    "initial",
    "inherit",
    "unset"
],
    "max-height": [
    "none",
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "max-width": [
    "none",
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "min-height": [
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "min-width": [
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "mix-blend-mode": [
    "normal",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "color-burn",
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity",
    "initial",
    "unset",
    "inherit"
],
    "object-fit": [
    "fill",
    "contain",
    "cover",
    "none",
    "scale-down",
    "initial",
    "inherit",
    "unset"
],
    "object-position": [
    "position",
    "initial",
    "inherit",
    "unset"
],
    "opacity": [
    "1",
    "initial",
    "inherit",
    "unset"
],
    "order": [
    "1",
    "initial",
    "inherit",
    "unset"
],
    "outline": [
    "outline-width",
    "outline-style",
    "outline-color",
    "initial",
    "inherit",
    "unset"
],
    "outline-color": [
    "invert",
    "rgb(0,0,0)",
    "initial",
    "inherit",
    "unset"
],
    "outline-offset": [
    "1px",
    "initial",
    "inherit",
    "unset"
],
    "outline-style": [
    "none",
    "hidden",
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
    "initial",
    "inherit",
    "unset"
],
    "outline-width": [
    "medium",
    "thin",
    "thick",
    "1px",
    "initial",
    "inherit",
    "unset"
],
    "overflow": [
    "visible",
    "hidden",
    "scroll",
    "auto",
    "initial",
    "inherit",
    "unset"
],
    "overflow-x": [
    "visible",
    "hidden",
    "scroll",
    "auto",
    "initial",
    "inherit",
    "unset"
],
    "overflow-y": [
    "visible",
    "hidden",
    "scroll",
    "auto",
    "initial",
    "inherit",
    "unset"
],
    "padding": [
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "padding-bottom": [
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "padding-left": [
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "padding-right": [
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "padding-top": [
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "page-break-after": [
    "auto",
    "always",
    "avoid",
    "left",
    "right",
    "initial",
    "inherit",
    "unset"
],
    "page-break-before": [
    "auto",
    "always",
    "avoid",
    "left",
    "right",
    "initial",
    "inherit",
    "unset"
],
    "page-break-inside": [
    "auto",
    "avoid",
    "initial",
    "inherit",
    "unset"
],
    "perspective": [
    "1px",
    "none",
    "initial",
    "inherit",
    "unset"
],
    "perspective-origin": [
    "0 0",
    "initial",
    "inherit",
    "unset"
],
    "pointer-events": [
    "auto",
    "none",
    "initial",
    "inherit",
    "unset"
],
    "position": [
    "static",
    "absolute",
    "fixed",
    "relative",
    "sticky",
    "initial",
    "inherit",
    "unset"
],
    "quotes": [
    "none",
    "string",
    "initial",
    "inherit",
    "unset"
],
    "resize": [
    "none",
    "both",
    "horizontal",
    "vertical",
    "initial",
    "inherit",
    "unset"
],
    "right": [
    "auto",
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "scroll-behavior": [
    "auto",
    "smooth",
    "initial",
    "inherit",
    "unset"
],
    "tab-size": [
    "1",
    "1px",
    "initial",
    "inherit",
    "unset"
],
    "table-layout": [
    "auto",
    "fixed",
    "initial",
    "inherit",
    "unset"
],
    "text-align": [
    "left",
    "right",
    "center",
    "start",
    "end",
    "justify",
    "match-parent",
    "initial",
    "inherit",
    "unset"
],
    "text-align-last": [
    "auto",
    "left",
    "right",
    "center",
    "justify",
    "start",
    "end",
    "initial",
    "inherit",
    "unset"
],
    "text-decoration": [
    "none",
    "underline",
    "overline",
    "line-through",
    "blink",
    "underline dotted red",
    "underline overline",
    "overline underline line-through",
    "initial",
    "inherit",
    "unset"
],
    "text-decoration-color": [
    "red",
    "initial",
    "inherit",
    "unset"
],
    "text-decoration-line": [
    "none",
    "underline",
    "overline",
    "line-through",
    "initial",
    "inherit",
    "unset"
],
    "text-decoration-style": [
    "solid",
    "double",
    "dotted",
    "dashed",
    "wavy",
    "initial",
    "inherit",
    "unset"
],
    "text-indent": [
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "text-justify": [
    "auto",
    "inter-word",
    "inter-character",
    "none",
    "initial",
    "inherit",
    "unset"
],
    "text-overflow": [
    "clip",
    "ellipsis",
    "string",
    "initial",
    "inherit",
    "unset"
],
    "text-shadow": [
    "h-shadow",
    "v-shadow",
    "blur-radius",
    "color",
    "none",
    "initial",
    "inherit",
    "unset"
],
    "text-transform": [
    "none",
    "capitalize",
    "uppercase",
    "lowercase",
    "initial",
    "inherit",
    "unset"
],
    "top": [
    "auto",
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "transform": [
    "none",
    "matrix(0,0,0,0,0,0)",
    "matrix3d(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)",
    "translate(0,0)",
    "translate3d(0,0,0)",
    "translateX(0)",
    "translateY(0)",
    "translateZ(0)",
    "scale(0,0)",
    "scale3d(0,0,0)",
    "scaleX(0)",
    "scaleY(0)",
    "scaleZ(0)",
    "rotate(0deg)",
    "rotate3d(0,0,0,0deg)",
    "rotateX(0deg)",
    "rotateY(0deg)",
    "rotateZ(0deg)",
    "skew(0deg,0deg)",
    "skewX(0deg)",
    "skewY(0deg)",
    "perspective(0)",
    "initial",
    "inherit",
    "unset"
],
    "transform-origin": [
    "left",
    "center",
    "right",
    "top",
    "bottom",
    "1px",
    "left 2px",
    "right bottom -3px",
    "initial",
    "inherit",
    "unset"
],
    "transform-style": [
    "flat",
    "preserve-3d",
    "initial",
    "inherit",
    "unset"
],
    "transition": [
    "{name} | {duration}",
    "margin-right 4s",
    "{name} | {duration} | {delay}",
    "margin-right 4s 1",
    "{name} | {duration} | {timing function}",
    "margin-right 4s ease-in-out",
    "{name} | {duration} | {timing function} | {delay}",
    "margin-right 4s ease-in-out 1s",
    "margin-right 4s, color 1s",
    "initial",
    "inherit",
    "unset"
],
    "transition-delay": [
    "1s",
    "200ms",
    "initial",
    "inherit",
    "unset"
],
    "transition-duration": [
    "1s",
    "200ms",
    "initial",
    "inherit",
    "unset"
],
    "transition-property": [
    "none",
    "all",
    "property",
    "initial",
    "inherit",
    "unset"
],
    "transition-timing-function": [
    "ease",
    "linear",
    "ease-in",
    "ease-out",
    "ease-in-out",
    "step-start",
    "step-end",
    "steps(1,end)",
    "cubic-bezier(0,0,0,0)",
    "initial",
    "inherit",
    "unset"
],
    "unicode-bidi": [
    "normal",
    "embed",
    "bidi-override",
    "isolate",
    "isolate-override",
    "plaintext",
    "initial",
    "inherit",
    "unset"
],
    "user-select": [
    "auto",
    "none",
    "text",
    "all",
    "initial",
    "unset",
    "inherit"
],
    "vertical-align": [
    "baseline",
    "1px",
    "1%",
    "sub",
    "super",
    "top",
    "text-top",
    "middle",
    "bottom",
    "text-bottom",
    "initial",
    "inherit",
    "unset"
],
    "visibility": [
    "visible",
    "hidden",
    "collapse",
    "initial",
    "inherit",
    "unset"
],
    "white-space": [
    "normal",
    "nowrap",
    "pre",
    "pre-line",
    "pre-wrap",
    "initial",
    "inherit",
    "unset"
],
    "width": [
    "auto",
    "1px",
    "1%",
    "initial",
    "inherit",
    "unset"
],
    "word-break": [
    "normal",
    "break-all",
    "keep-all",
    "break-word",
    "initial",
    "inherit",
    "unset"
],
    "word-spacing": [
    "normal",
    "1px",
    "initial",
    "inherit",
    "unset"
],
    "word-wrap": [
    "normal",
    "break-word",
    "initial",
    "inherit",
    "unset"
],
    "writing-mode": [
    "horizontal-tb",
    "vertical-rl",
    "vertical-lr",
    "initial",
    "unset",
    "inherit"
],
    "z-index": [
    "auto",
    "1",
    "initial",
    "inherit",
    "unset"
]
}
window.addEventListener("tilepieces-core-history-change",e=>{
    if(tilepieces.elementSelected)
        tilepieces.core.deselectElement();
    if(tilepieces.multiselected)
        tilepieces.destroyMultiselection();
    if(tilepieces.lastEditable) {
        tilepieces.lastEditable.destroy();
        tilepieces.lastEditable = null;
    }
    //tilepieces.core.removeSelection();
});
TilepiecesCore.prototype.redo = async function(){
    var $self = this;
    var history = $self.history;
    if(!history.entries.length
        || history.pointer == history.entries.length)
        return;
    var pointer = history.pointer;
    var historyEntry = history.entries[pointer];
    try {
        if (historyEntry.type == "htmltreematch-entry")
            $self.htmlMatch.redo();
        else
            await historyMethods[historyEntry.method].redo(historyEntry, $self);
        history.pointer++;
        tilepieces.updateFile(
          historyEntry.__historyFileRecord.newRecord.path,
          historyEntry.__historyFileRecord.newRecord.text);
        window.dispatchEvent(new Event("tilepieces-core-history-set"));
        window.dispatchEvent(new Event("tilepieces-core-history-change"));
    }
    catch(e){
        console.error("[tilepieces-core history]",e);
        $self.history.entries = $self.history.entries.slice(0,pointer);
        $self.history.pointer = 0;
        window.dispatchEvent(new Event("tilepieces-core-history-error"));
        window.dispatchEvent(new Event("tilepieces-core-history-set"));
    }
};
TilepiecesCore.prototype.setHistory = function(historyObject){
    var $self = this;
    var history = $self.history;
    var pointer = history.pointer;
    var entries = history.entries;
    if(pointer != entries.length) {
        var lastHtmlTreeMatchEntry;
        for (var i = history.entries.length-1 ; i >= 0; i--) {
            if (history.entries[i].type == "htmltreematch-entry") {
                lastHtmlTreeMatchEntry = history.entries[i];
                break;
            }
        }
        if(lastHtmlTreeMatchEntry)
            $self.htmlMatch.history.entries = entries.slice(0, lastHtmlTreeMatchEntry.pointer+1);
        history.entries = entries.slice(0, pointer);
    }
    history.pointer = history.entries.push(historyObject);
    // handle file modification
    var isStyleSheetModification =
      historyObject.method &&
      historyObject.method.match(/appendKeyframe|deleteCssRule|deleteKeyframe|insertCssRule|setCssProperty|setKeyText|setRuleName|setSelectorText/);
    if(isStyleSheetModification) {
      var oldRecord = history.stylesheets[history.stylesheets.length - 1];
      var newRecord = $self.saveStyleSheet();
      if(!oldRecord) oldRecord = {path:newRecord.path,text:""};
      historyObject.__historyFileRecord = {oldRecord,newRecord};
      $self.history.stylesheets.push(newRecord);
    }
    else {
      var path = tilepieces.currentPage.path;
      var oldDoc = history.documents[history.documents.length - 1];
      var newDoc = $self.createDocumentText($self.htmlMatch.source);
      var oldRecord = {path, text : oldDoc};
      var newRecord = {path, text : newDoc};
      historyObject.__historyFileRecord = {oldRecord,newRecord};
      tilepieces.updateFile(path,newDoc);
      history.documents.push(newDoc);
    }
    window.dispatchEvent(new Event("tilepieces-core-history-set"));
};
TilepiecesCore.prototype.undo = function(){
    var $self = this;
    var history = $self.history;
    if(!history.entries.length || history.pointer == 0)
        return;
    var pointer;
    history.pointer--;
    pointer = history.pointer;
    var historyEntry = history.entries[pointer];
    try {
        if (historyEntry.type == "htmltreematch-entry")
            $self.htmlMatch.undo();
        else historyMethods[historyEntry.method].undo(historyEntry);
        tilepieces.updateFile(
          historyEntry.__historyFileRecord.oldRecord.path,
          historyEntry.__historyFileRecord.oldRecord.text);
        window.dispatchEvent(new Event("tilepieces-core-history-set"));
        window.dispatchEvent(new Event("tilepieces-core-history-change"));
    }
    catch(e){
        console.error("[tilepieces-core history]",e);
        $self.history.entries = $self.history.entries.slice(pointer+1);
        $self.history.pointer = 0;
        window.dispatchEvent(new Event("tilepieces-core-history-error"));
        window.dispatchEvent(new Event("tilepieces-core-history-set"));
    }
};
TilepiecesCore.prototype.init = async function(doc,HTMLText){
  var $self = this;
  $self.currentDocument = doc;
  $self.currentWindow = doc.defaultView;
  $self.htmlMatch = HTMLTreeMatch(HTMLText,doc);
  $self.styles = await cssMapper(doc,tilepieces.idGenerator,tilepieces.classGenerator);
  var currentStyle = [...doc.querySelectorAll("[data-tilepieces-current-stylesheet]")].pop();
  var currentStyleIsAccesible;
  try{
    currentStyleIsAccesible = currentStyle.sheet.cssRules
  }
  catch(e){}
  if(currentStyleIsAccesible) {
      var found = $self.htmlMatch.find(currentStyle);
      if(found) {
        $self.currentStyleSheet = currentStyle.sheet;
        $self.matchCurrentStyleSheetNode = found.match;
        $self.history.stylesheets.push($self.saveStyleSheet(true));
      }
  }
  $self.history.documents.push(HTMLText);
  $self.fontAlreadyDeclared = [];
  window.dispatchEvent(new CustomEvent("cssMapper-changed",{detail:$self}));
  $self.idIndex = $self.styles.idIndex;
  $self.classIndex = $self.styles.classIndex;
  findGeneratorIndexes($self);
  $self.htmlMatch.on("history-entry",e=>{
      $self.setHistory({type:"htmltreematch-entry",pointer:e.pointer,ho:e.historyObject});
  });
  $self.observer = $self.observe(doc);
  $self.cachedProperties = [];
  if(tilepieces.multiselected)
      tilepieces.multiselections = [];
  if(tilepieces.elementSelected)
      tilepieces.elementSelected = null;
  return $self;
};
let stopEditing = document.createElement("div");
stopEditing.id="stop-editing";
var linearGradient = "linear-gradient(rgba(0, 0, 0, 0.09) 0%, 5%, rgba(0, 0, 0, 0) 50%, 97%, rgba(0, 0, 0, 0.09) 100%)";
stopEditing.style.cssText = "position:fixed;width:100%;height:100%;z-index:44;top:0;left:0;" +linearGradient;
window.addEventListener("lock-down",()=>{
    document.body.appendChild(stopEditing);
    tilepieces.panels.forEach(d=>{
        if(!d)// colorpicker
            return;
        if(d.windowOpen){
            d.windowOpen.document.body.appendChild(stopEditing.cloneNode());
        }
    })
});
window.addEventListener("release",()=>{
    stopEditing.remove();
    tilepieces.panels.forEach(d=>{
        if(!d) // colorpicker
            return;
        if(d.windowOpen)
            d.windowOpen.document.getElementById("stop-editing").remove();
    })
});
let regexNumbers = /[+-]?\d+(?:\.\d+)?/; // https://codereview.stackexchange.com/questions/115885/extract-numbers-from-a-string-javascript
let historyMethods = {};
function TilepiecesCore(){
    var $self = this;
    $self.currentDocument = null;
    $self.styles = [];
    $self.htmlMatch = null;
    $self.history = {
        entries : [],
        pointer : 0,
        documents : [],
        stylesheets : []
    };
    $self.cssMatcher = cssMatcher;
    $self.stylesChangeListeners  = [];
    $self.unitConverter = unitConverter;
    $self.getUnitProperties = getUnitProperties;
    $self.styleChanges = {
        listeners : [],
        onChange : (cb,once)=>$self.styleChanges.listeners.push({cb,once})
    };
    $self.destroy = ()=>{
        $self.observer && $self.observer.disconnect();
        if(tilepieces) {
            tilepieces.elementSelected = null;
            tilepieces.core = null;
            tilepieces.fileSelected = {};
            tilepieces.currentPage = null;
        }
    };
    return this;
}
window.tilepiecesCore = function(o){
    return new TilepiecesCore(o);
}
tilepieces.createSelectionClone = function(el){
  /*
    if(tilepieces.multiselections.find(v=>v.el == el))
        return;*/
    var highlight = tilepieces.editElements.selection.cloneNode(true);
    highlight.classList.add("highlight-selection-clone");
    highlight.style.opacity = "0.3";
    highlight.style.transform = "translate(-9999px,-9999px)";
    document.body.appendChild(highlight);
    tilepieces.multiselections.push({el,highlight});
};
tilepieces.destroyMultiselection = function(){
    tilepieces.multiselected = null;
    tilepieces.multiselections.forEach(v=>v.highlight.remove());
    tilepieces.multiselections = [];
    window.dispatchEvent(new Event("multiselection-canceled"))
}
tilepieces.enableMultiselection = function(){
  if(tilepieces.multiselected)
    return;
  tilepieces.multiselected = true;
  if(tilepieces.elementSelected && (
      !tilepieces.selectorObj.match || tilepieces.elementSelected.tagName?.match(/HTML|HEAD|BODY/)))
      tilepieces.core.deselectElement();
  else if(tilepieces.elementSelected)
      tilepieces.createSelectionClone(tilepieces.elementSelected);
  window.dispatchEvent(new Event("multiselection-enabled"));
}
tilepieces.removeItemSelected=function(i){
    if(typeof i === "undefined")
        i = tilepieces.multiselections.length-1;
    var el = tilepieces.multiselections[i];
    var highlight = el.highlight;
    highlight.remove();
    tilepieces.multiselections.splice(i,1);
    window.dispatchEvent(new CustomEvent("deselect-multielement",{detail:el.el}));
    if(el.el == tilepieces.elementSelected){
        tilepieces.core.deselectElement();
        var newIndex = tilepieces.multiselections.length-1;
        newIndex>-1 && tilepieces.core.selectElement(tilepieces.multiselections[newIndex].el);
    }
}
TilepiecesCore.prototype.observe = function(targetNode) {
    var $self = this;
    var observerOptions = {
        childList: true,
        attributes:true,
        subtree: true,
        characterData: true
    };
    function callback(mutationList, observer) {
        observeStyleSheets(mutationList,$self);
        window.dispatchEvent(new CustomEvent("tilepieces-mutation-event",{
            detail : {
                mutationList
            }
        }));
    }

    var observer = new MutationObserver(callback);
    observer.observe(targetNode, observerOptions);
    return observer;
}
let globalPendingStyle;
function updateStyles($self){
    console.log("[is updating styles...]");
    console.log("[globalPendingStyle] ",globalPendingStyle);
    var currentStyleSheet = $self.currentStyleSheet;
    var currentStyleSheetSelector = "["+tilepieces.currentStyleSheetAttribute+"]";
    if(currentStyleSheet &&
        !$self.currentDocument.documentElement.contains(currentStyleSheet.ownerNode)){
        var match = $self.htmlMatch.match($self.matchCurrentStyleSheetNode,false,false,true);
        if(match){
            $self.currentStyleSheet = match.sheet;
        }
        else {
            var possiblesCurrentStyleSheets = [...$self.currentDocument.
                querySelectorAll(currentStyleSheetSelector)];
            if(possiblesCurrentStyleSheets.length) {
                var last = possiblesCurrentStyleSheets.pop();
                $self.matchCurrentStyleSheetNode =
                    $self.htmlMatch.match(last);
                if($self.matchCurrentStyleSheetNode)
                    $self.currentStyleSheet = last.sheet;
            }
            else {
                $self.currentStyleSheet = null;
                $self.matchCurrentStyleSheetNode = null;
            }
        }
    }
    $self.runcssMapper();
    if(globalPendingStyle)
        globalPendingStyle = false;
}
function styleObs(mutation,$self){
    var hasStylesChanged,hasStylesOnAsync;
    if(mutation.type == "attributes" &&
        (mutation.attributeName.toLowerCase() == "href" ||
        mutation.attributeName.toLowerCase() == "disabled")&&
        mutation.target.tagName == "LINK" &&
        mutation.target.rel.toLowerCase() == "stylesheet" ) {
        if(mutation.attributeName.toLowerCase() == "href")
            $self.fetchingStylesheet(mutation.target.href).then(()=>{
                // at this point, sheet should be loaded. However, we do longPolling, just in case.
                longPollingStyleSheet(mutation.target.href,()=>updateStyles($self))
            },err=>{
                globalPendingStyle && updateStyles($self);
            });
        else
            hasStylesChanged = true;
    }
    if(mutation.type == "childList" &&
        mutation.target.tagName == "STYLE")
        hasStylesChanged = true;
    mutation.addedNodes.forEach(v=>{
        if (v.tagName == "STYLE" && v.sheet)
            hasStylesChanged = true;
        if (v.tagName == "LINK" && v.rel.toLowerCase() == "stylesheet") {
            if (!v.sheet) {
                hasStylesOnAsync = true;
                $self.fetchingStylesheet(v.href).then(()=>{
                    // at this point, sheet should be loaded. However, we do longPolling, just in case.
                    longPollingStyleSheet(v,()=>updateStyles($self))
                },err=>{
                    globalPendingStyle && updateStyles($self);
                });
            }
            else hasStylesChanged = true;
        }
    });
    mutation.removedNodes.forEach(v=>{
        if ((v.tagName == "STYLE") ||
            (v.tagName == "LINK" && v.rel.toLowerCase() == "stylesheet")
            ){
            hasStylesChanged = true;
        }
    });
    return {hasStylesChanged,hasStylesOnAsync};
}
function observeStyleSheets(mutationList,$self){
    var hasStylesChanged,hasStylesOnAsync;
    mutationList.forEach(mutation=> {
        var res = styleObs(mutation, $self);
        hasStylesChanged = res.hasStylesChanged || hasStylesChanged;
        hasStylesOnAsync = res.hasStylesOnAsync || hasStylesOnAsync;
    });
    hasStylesChanged && !hasStylesOnAsync && updateStyles($self);//$self.runcssMapper();
    if(hasStylesChanged && hasStylesOnAsync)
        globalPendingStyle = true;
}
TilepiecesCore.prototype.runcssMapper = async function(){
    var $self = this;
    var styles = await cssMapper($self.currentDocument, tilepieces.idGenerator, tilepieces.classGenerator);
    $self.styles = styles;
    findGeneratorIndexes($self);
    $self.styleChanges.listeners = $self.styleChanges.listeners.filter(v=> {
        v.cb();
        return !v.once;
    });
    window.dispatchEvent(new CustomEvent("cssMapper-changed",{detail:$self}));
    return styles;
}
TilepiecesCore.prototype.deselectElement = function(){
    var obj = {target:tilepieces.elementSelected};
    tilepieces.elementSelected = null;
    tilepieces.cssSelector = null;
    tilepieces.cssSelectorObj = null;
    tilepieces.selectorObj = null;
    tilepieces.editElements.selection.style.transform = "translate(-9999px,-9999px)";
    window.dispatchEvent(
        new CustomEvent("deselect-element",{detail:obj}));
};
function drawSel(t) {
    if(tilepieces.multiselected && tilepieces.editMode == "selection" && !tilepieces.contenteditable)
        tilepieces.multiselections.forEach(v=>{
            if(v.el==tilepieces.elementSelected)
                return;
            /*
            if(!v.el.getBoundingClientRect){
                console.error("getBoundingClientRect error:",v.el);
                return;
            }*/
            tilepieces.core.translateHighlight(v.el,v.highlight);
        });
    if(tilepieces.highlight)
        tilepieces.core.translateHighlight(tilepieces.highlight, tilepieces.editElements.highlight);
    else
        tilepieces.editElements.highlight.style.transform = "translate(-9999px,-9999px)";
    if(tilepieces.elementSelected && tilepieces.editMode == "selection" && !tilepieces.contenteditable)
        tilepieces.core.translateHighlight(tilepieces.elementSelected,tilepieces.editElements.selection);
    drawSelection = requestAnimationFrame(drawSel);
}
TilepiecesCore.prototype.removeSelection = function(){
    tilepieces.editElements.selection.style.transform = "translate(-9999px,-9999px)";
    cancelAnimationFrame(drawSelection);
}
TilepiecesCore.prototype.selectElement = function(target,match,composedPath = []){
    var targetToSelect = target.nodeType!=1 ? target.parentNode : target;
    if(!composedPath.length){
        var swap = target;
        while(swap){
            composedPath.push(swap);
            swap = swap.parentNode;
        }
    }
    var $self = this;
    if(typeof match === "undefined"){
        match =  $self.htmlMatch.find(target)
    }
    var cssRules = $self.cssMatcher(targetToSelect,
        $self.styles.styleSheets);
    var styles = $self.currentWindow.getComputedStyle(targetToSelect,null);
    var fatherStyle = target.nodeName != "HTML" && targetToSelect.parentNode ?
        $self.currentWindow.getComputedStyle(targetToSelect.parentNode,null) : null;
    var firstRuleMatch = cssRules.cssMatches[1];
    var firstSelector = firstRuleMatch && cssRules.cssMatches[1].rule.selectorText;
    tilepieces.cssSelector = firstSelector || target.nodeName.toLowerCase() + [...targetToSelect.classList].map(c=>"." + c).join("");
    var obj = {cssRules,target,styles,fatherStyle,match,composedPath,targetSelected:targetToSelect};
    tilepieces.cssSelectorObj = obj;
    tilepieces.selectorObj = obj;
    tilepieces.elementSelected = target;
    if(tilepieces.multiselected)
        tilepieces.createSelectionClone(target);
    target.tagName == "IMG" &&
    setTimeout(()=>{
        tilepieces.editElements.selection.focus();
    });
    //if(target.nodeType==1)
        window.dispatchEvent(
            new CustomEvent("highlight-click",{detail:obj}));
};

TilepiecesCore.prototype.setSelection = function(){
    drawSelection = requestAnimationFrame(drawSel);
}
TilepiecesCore.prototype.translateHighlight = function (target,el,contentRect){
    if(!target.ownerDocument || !target.ownerDocument.defaultView) // during page change, this function could be fired before being canceled
        return;
    if([1,3].indexOf(target.nodeType) == -1)
        return;
    var bound;
    if(target.nodeType != 1){ // text node
        var range = target.getRootNode().createRange();
        range.selectNode(target);
        bound = range.getBoundingClientRect()
    }
    else // element node
        bound = target.getBoundingClientRect();
    el.style.width =  bound.width + "px";
    el.style.height = bound.height + "px";
  	var x = tilepieces.frame.offsetLeft + bound.x;
    var y = tilepieces.frame.offsetTop + bound.y;
    el.style.transform = "translate(" + x + "px," + y + "px)";
    el.__target = target;
}
TilepiecesCore.prototype.appendKeyframe = function(rule,cssText){
    var $self = this;
    rule.appendRule(cssText);
    var newRule = rule.cssRules[rule.cssRules.length-1];
    $self.setHistory({
        rule,
        $self,
        newRule,
        method : "appendKeyframe"
    });
    return newRule;
};
historyMethods.appendKeyframe = {
    undo: ho=>{
        var notTheRule = [];
        var foundRule = ho.rule.findRule(ho.newRule.keyText);
        var count = 0;
        while(foundRule.cssText != ho.newRule.cssText){
            notTheRule.push(foundRule);
            ho.rule.deleteRule(ho.newRule.keyText);
            foundRule = ho.rule.findRule(ho.newRule.keyText);
            count++;
            if(count>500000)
                throw "appendKeyframe error"
        }
        ho.rule.deleteRule(ho.newRule.keyText);
        notTheRule.forEach(v=>ho.rule.appendRule(v.cssText));
    },
    redo: ho=>{
        ho.rule.appendRule(ho.newRule.cssText);
        var newRule = ho.rule.cssRules[ho.rule.cssRules.length-1]
        ho.$self.history.entries.forEach(v=>{
            if(v==ho) {
                return;
            }
            if(v.rule == ho.newRule)
                v.rule=newRule;
            if(v.newRule == ho.newRule)
                v.newRule=newRule;
            if(v.keyframe == ho.newRule)
                v.keyframe=newRule;
        });
        ho.newRule = newRule;
    }
}
TilepiecesCore.prototype.createCurrentStyleSheet = function(cssText){
    var $self = this;
    var doc = $self.currentDocument;
    var sourceDoc = $self.htmlMatch.source;
    var oldStyle = $self.currentStyleSheet;
    var oldStyleMatch;
    if(oldStyle){
        var currentStyleSheetNode = $self.currentStyleSheet.ownerNode;
        oldStyleMatch = $self.matchCurrentStyleSheetNode;
        currentStyleSheetNode.removeAttribute(tilepieces.currentStyleSheetAttribute);
        oldStyleMatch.removeAttribute(tilepieces.currentStyleSheetAttribute);
    }
    var newStyle = $self.currentDocument.createElement("style");
    newStyle.innerHTML = cssText;
    $self.currentDocument.head.appendChild(newStyle);
    var newNodeSource = sourceDoc.head.appendChild(newStyle.cloneNode(true));
    newStyle.setAttribute(tilepieces.currentStyleSheetAttribute,"");
    newNodeSource.setAttribute(tilepieces.currentStyleSheetAttribute,"");
    $self.currentStyleSheet = newStyle.sheet;
    $self.matchCurrentStyleSheetNode = newNodeSource;
    $self.setHistory({
        doc,
        sourceDoc,
        $self,
        newNodeSource,
        oldStyle,
        oldStyleEl : oldStyle ? oldStyle.ownerNode : null,
        oldStyleMatch,
        newStyle,
        oldSheet : newStyle.sheet,
        method : "createCurrentStyleSheet"
    });
};
historyMethods.createCurrentStyleSheet = {
    undo: ho=>{
        ho.newStyle.remove();
        ho.newNodeSource.remove();
        ho.$self.currentStyleSheet = ho.oldStyle ? ho.oldStyle.sheet : null;
        ho.$self.matchCurrentStyleSheetNode = ho.oldStyleMatch ? ho.oldStyleMatch.sheet : null;
        if(ho.oldStyleEl){
            ho.oldStyleEl.setAttribute(tilepieces.currentStyleSheetAttribute,"");
            ho.oldStyleMatch.setAttribute(tilepieces.currentStyleSheetAttribute,"");
        }
    },
    redo: ho=>{
        ho.$self.currentDocument.head.appendChild(ho.newStyle);
        ho.sourceDoc.head.appendChild(ho.newNodeSource);
        ho.newStyle.setAttribute(tilepieces.currentStyleSheetAttribute,"");
        ho.newNodeSource.setAttribute(tilepieces.currentStyleSheetAttribute,"");
        ho.$self.currentStyleSheet = ho.newStyle.sheet;
        ho.$self.matchCurrentStyleSheetNode = ho.newNodeSource;
        ho.$self.history.entries.forEach(v=>{
            if(v.stylesheet === ho.oldSheet)
                v.stylesheet = ho.newStyle.sheet;
        });
        ho.oldSheet = ho.newStyle.sheet;
        if(ho.oldStyleEl){
            ho.oldStyleEl.removeAttribute(tilepieces.currentStyleSheetAttribute);
            ho.oldStyleMatch.removeAttribute(tilepieces.currentStyleSheetAttribute);
        }
    }
}

TilepiecesCore.prototype.deleteCssRule = function(oldRule){
    var $self = this;
    var stylesheet = oldRule.parentRule || oldRule.parentStyleSheet;
    //var parent = rule.parentRule || stylesheet;
    var index = [...stylesheet.cssRules].indexOf(oldRule);
    //var oldRule = stylesheet.cssRules[index];
    var oldCssText = oldRule.cssText;
    stylesheet.deleteRule(index);
    var exIndex;
    if(oldRule.constructor.name=="CSSMediaRule" ||
        oldRule.constructor.name=="CSSSupportsRule") {
      $self.runcssMapper()
    }
    if(oldRule.constructor.name=="CSSKeyframesRule"){
        exIndex = $self.styles.animations.findIndex(v=>v.rule == oldRule);
        $self.styles.animations.splice(exIndex,1);
    }
    if(oldRule.constructor.name=="CSSFontFaceRule"){
        exIndex = $self.styles.fonts.findIndex(v=>v.rule == oldRule);
        $self.styles.fonts.splice(exIndex,1);
    }
    $self.setHistory({
        stylesheet,
        oldRule,
        oldCssText,
        $self,
        index,
        exIndex,
        method : "deleteCssRule"
    });
};
historyMethods.deleteCssRule = {
    undo: ho=>{
        ho.stylesheet.insertRule(ho.oldCssText, ho.index);
        var rule = ho.stylesheet.cssRules[ho.index];
        if(rule.constructor.name=="CSSMediaRule"||
            rule.constructor.name=="CSSSupportsRule") {
          ho.$self.runcssMapper()
        }
        if(rule.constructor.name=="CSSKeyframesRule")
            ho.$self.styles.animations.splice(ho.exIndex,0,rule);
        if(rule.constructor.name=="CSSFontFaceRule")
            ho.$self.styles.fonts.splice(ho.exIndex,0,rule);
        ho.$self.history.entries.forEach(v=>{
            if(v.rule == ho.oldRule)
                v.rule=rule;
            if(v.oldRule == ho.oldRule)
                v.oldRule=rule;
            if(v.stylesheet == ho.oldRule)
                v.stylesheet=rule;
        });
        ho.oldRule = rule
    },
    redo: ho=>{
        ho.stylesheet.deleteRule(ho.index);
        if(ho.oldRule.constructor.name=="CSSMediaRule"||
            ho.oldRule.constructor.name=="CSSSupportsRule") {
            if(ho.oldRule == tilepieces.core.currentMediaRule)
                tilepieces.core.currentMediaRule = null;
          ho.$self.runcssMapper()
        }
        if(ho.oldRule.constructor.name=="CSSKeyframesRule"){
            ho.exIndex = ho.$self.styles.animations.findIndex(v=>v.rule == ho.oldRule);
            ho.$self.styles.animations.splice(ho.exIndex,1);
        }
        if(ho.oldRule.constructor.name=="CSSFontFaceRule"){
            ho.exIndex = ho.$self.styles.fonts.findIndex(v=>v.rule == ho.oldRule);
            ho.$self.styles.fonts.splice(ho.exIndex,1);
        }
    }
}
TilepiecesCore.prototype.deleteKeyframe = function(rule,keyframe){
    var $self = this;
    var notTheRule = [];
    var foundRule = rule.findRule(keyframe.keyText);
    var count = 0;
    while(foundRule.cssText != keyframe.cssText){
        notTheRule.push(foundRule);
        rule.deleteRule(keyframe.keyText);
        foundRule = rule.findRule(keyframe.keyText);
        count++;
        if(count>500000)
            throw "error"
    }
    rule.deleteRule(keyframe.keyText);
    notTheRule.forEach(v=>rule.appendRule(v.cssText));
    $self.setHistory({
        rule,
        $self,
        keyframe,
        method : "deleteKeyframe"
    });
}
historyMethods.deleteKeyframe = {
    undo: ho=>{
        ho.rule.appendRule(ho.keyframe.cssText);
        var newRule = ho.rule.cssRules[ho.rule.cssRules.length-1]
        ho.$self.history.entries.forEach(v=>{
            if(v==ho) {
                return;
            }
            if(v.rule == ho.keyframe)
                v.rule=newRule;
            if(v.newRule == ho.keyframe)
                v.newRule=newRule;
            if(v.keyframe == ho.keyframe)
                v.keyframe=newRule;
        });
        ho.keyframe = newRule;
    },
    redo: ho=>{
        var notTheRule = [];
        var foundRule = ho.rule.findRule(ho.keyframe.keyText);
        var count = 0;
        while(foundRule.cssText != ho.keyframe.cssText){
            notTheRule.push(foundRule);
            ho.rule.deleteRule(ho.keyframe.keyText);
            foundRule = ho.rule.findRule(ho.keyframe.keyText);
            count++;
            if(count>500000)
                throw "error"
        }
        ho.rule.deleteRule(ho.keyframe.keyText);
        notTheRule.forEach(v=>ho.rule.appendRule(v.cssText));
    }
}
TilepiecesCore.prototype.insertCssRule = function(stylesheet,cssText,index){
    var $self = this;
    if(!index)
        index = stylesheet.cssRules.length;
    stylesheet.insertRule(cssText, index);
    $self.setHistory({
        stylesheet,
        cssText,
        $self,
        index,
        oldRule : stylesheet.cssRules[index],
        method : "insertCssRule"
    });
    return stylesheet.cssRules[index];
};
historyMethods.insertCssRule = {
    undo: ho=>{
        var rule = ho.oldRule;
        ho.stylesheet.deleteRule(ho.index);
        if(rule.constructor.name=="CSSMediaRule"||
            rule.constructor.name=="CSSSupportsRule") {
            if(rule == tilepieces.core.currentMediaRule)
                tilepieces.core.currentMediaRule = null;
          ho.$self.runcssMapper()
        }
        if(rule.constructor.name=="CSSKeyframesRule"){
            ho.exIndex = ho.$self.styles.animations.findIndex(v=>v.rule == ho.oldRule);
            ho.$self.styles.animations.splice(ho.exIndex,1);
        }
        if(rule.constructor.name=="CSSFontFaceRule"){
            ho.exIndex = ho.$self.styles.fonts.findIndex(v=>v.rule == ho.oldRule);
            ho.$self.styles.fonts.splice(ho.exIndex,1);
        }
    },
    redo: ho=>{
        if(ho.stylesheet.ownerNode === null){
            ho.stylesheet = [...ho.$self.currentDocument.styleSheets].find(s=>s.href==ho.stylesheet.href);
        }
        ho.stylesheet.insertRule(ho.cssText, ho.index);
        var newRule = ho.stylesheet.cssRules[ho.index];
        if(newRule.constructor.name=="CSSMediaRule"||
            newRule.constructor.name=="CSSSupportsRule") {
          ho.$self.runcssMapper()
        }
        if(newRule.constructor.name=="CSSKeyframesRule")
            ho.$self.styles.animations.splice(ho.exIndex,0,newRule);
        if(newRule.constructor.name=="CSSFontFaceRule")
            ho.$self.styles.fonts.splice(ho.exIndex,0,newRule);
        ho.$self.history.entries.forEach(v=>{
            if(v==ho) {
                return;
            }
            if(v.oldRule == ho.oldRule)
                v.oldRule=newRule;
            if(v.rule == ho.oldRule)
                v.rule=newRule;
            if(v.stylesheet == ho.oldRule)
                v.stylesheet=newRule;
        });
        ho.oldRule = newRule;
    }
}
TilepiecesCore.prototype.setCss = function(el,name,value,selectorText) {
    var $self = this;
    var currentStylesheet = $self.currentStyleSheet;
    var insertType = tilepieces.insertStyleSheets;
    selectorText = selectorText || tilepieces.cssSelector;
    if(insertType == "stylesheet") {
        if(el.style.item(name) && $self.htmlMatch.match(el))
            $self.htmlMatch.style(el, name, "");
        if (currentStylesheet) {
            // if currentMediaRule exists anymore
            if(tilepieces.core.currentMediaRule &&
                (!tilepieces.core.currentMediaRule.parentStyleSheet||
                !tilepieces.core.currentMediaRule.parentStyleSheet.ownerNode||
                !tilepieces.core.currentDocument.documentElement.contains(tilepieces.core.currentMediaRule.parentStyleSheet.ownerNode)
                ))
                tilepieces.core.currentMediaRule = null;
            if(tilepieces.core.currentMediaRule &&
                $self.currentWindow.matchMedia(tilepieces.core.currentMediaRule.conditionText).matches)
                currentStylesheet = tilepieces.core.currentMediaRule;
            var currentRules = [...currentStylesheet.cssRules];
            var decFound = currentRules.find(cssRule=>cssRule.selectorText == selectorText);
            if (decFound) {
                $self.setCssProperty(decFound,name,value);
                return decFound.style.getPropertyValue(name);
            }
            else {
                var index = currentStylesheet.cssRules.length;
                $self.insertCssRule(currentStylesheet,selectorText + `{${name}:${value}}`,index);
                return currentStylesheet.cssRules[index].style.getPropertyValue(name);
            }
        }
        else {
            $self.createCurrentStyleSheet("");
            $self.insertCssRule($self.currentStyleSheet,selectorText + `{${name}:${value}}`);
            return $self.currentStyleSheet.cssRules[0].style.getPropertyValue(name);
        }
    }
    else{
        $self.htmlMatch.style(el, name, value, insertType == "inline!important" ? "important" : "");
        return el.style.getPropertyValue(name);
    }
};
TilepiecesCore.prototype.setCssMedia = function(cssText) {
    var $self = this;
    var currentStylesheet = $self.currentStyleSheet;
    if (currentStylesheet) {
        $self.insertCssRule(currentStylesheet,cssText,currentStylesheet.cssRules.length);
    }
    else {
        //var newStyles = $self.currentDocument.createElement("style");
        //newStyles.innerHTML = cssText;
        //$self.htmlMatch.appendChild($self.currentDocument.head, newStyles);
        //$self.currentStyleSheet = newStyles.sheet;
        $self.createCurrentStyleSheet("");
        $self.insertCssRule($self.currentStyleSheet,cssText);
    }
}
TilepiecesCore.prototype.setCssProperty = function(rule,property,value,priority){
    var $self = this;
    var oldSelector = rule.selectorText;
    var oldValue = rule.style.getPropertyValue(property);
    var oldPriority = rule.style.getPropertyPriority(property);
    if(oldValue==value && oldPriority == priority)
        return;
    rule.style.setProperty(property, value,priority);
    var newProp = rule.style.getPropertyValue(property);
    var newPrior = rule.style.getPropertyPriority(property);
    if(newProp==oldValue && newPrior==oldPriority)
        return;
    var stylesheet = rule.parentStyleSheet;
    $self.setHistory({
        oldSelector,
        rule,
        property,
        stylesheet,
        value,
        $self,
        oldValue,
        oldPriority,
        priority,
        method : "setCssProperty"
    });
};
historyMethods.setCssProperty = {
    undo: ho=>{
        ho.rule.style.setProperty(ho.property, ho.oldValue,ho.oldPriority);
    },
    redo: ho=>{
        ho.rule.style.setProperty(ho.property, ho.value,ho.priority);
    }
}

TilepiecesCore.prototype.setCurrentStyleSheet = function(node){
    return new Promise((resolve,reject)=>{
        try {
            var $self = this;
            var doc = $self.currentDocument;
            var sourceDoc = $self.htmlMatch.source;
            var oldStyle = $self.currentStyleSheet;
            var oldStyleMatch;
            if (oldStyle && oldStyle == node)
                return;
            if (oldStyle) {
                var currentStyleSheetNode = $self.currentStyleSheet.ownerNode;
                if(currentStyleSheetNode) {
                    oldStyleMatch = $self.matchCurrentStyleSheetNode;
                    currentStyleSheetNode.removeAttribute(tilepieces.currentStyleSheetAttribute);
                    oldStyleMatch.removeAttribute(tilepieces.currentStyleSheetAttribute);
                }
            }
            var newNodeSource = $self.htmlMatch.find(node).match;
            node.setAttribute(tilepieces.currentStyleSheetAttribute, "");
            newNodeSource.setAttribute(tilepieces.currentStyleSheetAttribute, "");
            longPollingStyleSheet(node, ()=> {
                $self.currentStyleSheet = node.sheet;
                $self.matchCurrentStyleSheetNode = newNodeSource;
                $self.setHistory({
                    doc,
                    sourceDoc,
                    $self,
                    newNodeSource,
                    oldStyle,
                    oldStyleEl: oldStyle ? oldStyle.ownerNode : null,
                    oldStyleMatch,
                    oldSheet:node.sheet,
                    node,
                    method: "setCurrentStyleSheet"
                });
                updateStyles($self);
                resolve();
            });
        }
        catch(e){
            reject(e);
        }
    })
};
historyMethods.setCurrentStyleSheet = {
    undo: ho=>{
        ho.node.removeAttribute(tilepieces.currentStyleSheetAttribute);
        ho.newNodeSource.removeAttribute(tilepieces.currentStyleSheetAttribute);
        ho.$self.currentStyleSheet = ho.oldStyle ? ho.oldStyle.sheet : null;
        ho.$self.matchCurrentStyleSheetNode = ho.oldStyleMatch ? ho.oldStyleMatch.sheet : null;
        if(ho.oldStyleEl){
            ho.oldStyleEl.setAttribute(tilepieces.currentStyleSheetAttribute,"");
            ho.oldStyleMatch.setAttribute(tilepieces.currentStyleSheetAttribute,"");
        }
    },
    redo: ho=>{
        return new Promise((resolve,reject)=>{
            try {
                ho.node.setAttribute(tilepieces.currentStyleSheetAttribute, "");
                ho.newNodeSource.setAttribute(tilepieces.currentStyleSheetAttribute, "");
                if (ho.oldStyleEl) {
                    ho.oldStyleEl.removeAttribute(tilepieces.currentStyleSheetAttribute);
                    ho.oldStyleMatch.removeAttribute(tilepieces.currentStyleSheetAttribute);
                }
                longPollingStyleSheet(ho.node, ()=> {
                    ho.$self.currentStyleSheet = ho.node.sheet;
                    ho.$self.matchCurrentStyleSheetNode = ho.newNodeSource;
                    ho.$self.history.entries.forEach(v=>{
                        if(v.stylesheet === ho.oldSheet)
                            v.stylesheet = ho.node.sheet;
                    });
                    ho.oldSheet = ho.node.sheet;
                    resolve();
                });
            }
            catch(e){
                reject(e);
            }
        })
    }
}

TilepiecesCore.prototype.setKeyText= function(rule,keyText){
    var $self = this;
    var exKeyText = rule.keyText;
    rule.keyText = keyText;
    $self.setHistory({
        rule,
        exKeyText,
        keyText,
        method : "setKeyText"
    });
};
historyMethods.setKeyText = {
    undo: ho=>{
        ho.rule.keyText = ho.exKeyText;
    },
    redo: ho=>{
        ho.rule.keyText = ho.keyText;
    }
}
TilepiecesCore.prototype.setNewClassSelector = function(el){
    var $self = this;
    var selectorText = "";
    var classMatch = new RegExp(`${tilepieces.classGenerator}\\d+$`);
    [...el.classList].forEach(v=>{
        if(v.match(classMatch))
            selectorText = "." + v
    });
    if(!selectorText){
        $self.classIndex+=1;
        var newClass=tilepieces.classGenerator + $self.classIndex;
        selectorText = "."+newClass;
        $self.htmlMatch.addClass(el, selectorText);
    }
    return selectorText;
};
TilepiecesCore.prototype.setRuleName = function(rule,name){
    var $self = this;
    var exName = rule.name;
    rule.name = name;
    $self.setHistory({
        rule,
        exName,
        name,
        method : "setRuleName"
    });
};
historyMethods.setRuleName = {
    undo: ho=>{
        ho.rule.name = ho.exName;
    },
    redo: ho=>{
        ho.rule.name = ho.name;
    }
}
TilepiecesCore.prototype.setSelectorText= function(rule,selectorText){
    var $self = this;
    var exSelectorText = rule.selectorText;
    rule.selectorText = selectorText;
    $self.setHistory({
        rule,
        exSelectorText,
        selectorText,
        method : "setSelectorText"
    });
};
historyMethods.setSelectorText = {
    undo: ho=>{
        ho.rule.selectorText = ho.exSelectorText;
    },
    redo: ho=>{
        ho.rule.selectorText = ho.selectorText;
    }
}
function unitConverter(type,cssProperty,elStyles,parentStyles){
    switch(type){
        case "px":
            return elStyles[cssProperty];
        case "%":
            var pxValue = elStyles[cssProperty].match(regexNumbers);
            var parentPxValue;
            if(cssProperty == "top" || cssProperty == "left" ||
                cssProperty == "width")
                parentPxValue = parentStyles["width"].match(regexNumbers);
            else
                parentPxValue = parentStyles["height"].match(regexNumbers);
            // pxValue : parentPxValue = % : 100 -> % = ( 100 * pxValue ) / parentPxValue
            var p = ( 100 * pxValue ) / parentPxValue;
            return p + "%";
    }
}
TilepiecesCore.prototype.createDocumentText = function(doc,isStyleSheetModification){
    var $self = this;
    if(isStyleSheetModification && ($self.currentStyleSheet && !$self.currentStyleSheet.href)) {
        var updateStyleSheetHTML = createStyleSheetText($self.currentStyleSheet);
        $self.matchCurrentStyleSheetNode.innerHTML = updateStyleSheetHTML;
    }
    return createDocumentString(doc)
}
function createStyleSheetText(styleSheet){
    return [...styleSheet.cssRules].map(v=>v.cssText).join("\n")
}
TilepiecesCore.prototype.saveStyleSheet = function(dontSave){
    var $self = this;
    var isStyleTag = !$self.matchCurrentStyleSheetNode ||
        $self.matchCurrentStyleSheetNode.tagName == "STYLE";
    var text = isStyleTag ?
        $self.createDocumentText($self.htmlMatch.source,true) :
        createStyleSheetText($self.currentStyleSheet);
    // TODO : ???? maybe a config BASEPATH
    var path = isStyleTag ?
        tilepieces.currentPage.path:
        decodeURI($self.currentStyleSheet.href)
            .replace(location.origin,"")
            .replace(tilepieces.frameResourcePath(),"")
            .replace(/\/\//g,"/");
    !dontSave && tilepieces.updateFile(path,text);
    return {path, text}
};
tilepieces.toUpdateFileObject = {};
tilepieces.updateFile = (path,text,delay)=>{
    return new Promise((resolve,reject)=>{
        clearTimeout(tilepieces.toUpdateFileObject[path]);
        tilepieces.toUpdateFileObject[path] = setTimeout(()=>{
            var blobFile = new Blob([text]);
            tilepieces.storageInterface &&
            tilepieces.storageInterface.update(path,blobFile)
            .then(r=> {
                    console.log("[UPDATING FILE] -> path updated: ", path, "\nresult: ", r);
                    if(tilepieces.fileSelected.path == path){
                        tilepieces.fileSelected.file = text;
                        tilepieces.fileSelected.fileText = text;
                    }
                    window.dispatchEvent(new CustomEvent("file-updated",{detail:{path,text}}));
                    delete tilepieces.toUpdateFileObject[path];
                    resolve(text);
                },
                err=>{
                    console.error("[UPDATING FILE] -> error updating path",err);
                    window.dispatchEvent(new CustomEvent("error-file-updated",{detail:{path,text}}));
                    dialog.open("error during updating current document");
                    reject(err);
                });
        },typeof delay !== "number" ? tilepieces.delayUpdateFileMs : delay)
    })
};
function commonPath(one, two) {
  var length = Math.min(one.length, two.length);
  var pos;

  // find first non-matching character
  for (pos = 0; pos < length; pos++) {
    if (one.charAt(pos) !== two.charAt(pos)) {
      pos--;
      break;
    }
  }

  if (pos < 1) {
    return one.charAt(0) === two.charAt(0) && one.charAt(0) === '/' ? '/' : '';
  }

  // revert to last /
  if (one.charAt(pos) !== '/' || two.charAt(pos) !== '/') {
    pos = one.substring(0, pos).lastIndexOf('/');
  }

  return one.substring(0, pos + 1);
};
function convertGroupingRuleToSelector(selector,rule){
    var header = rule.type == window.CSSRule.SUPPORTS_RULE
        ? "@supports" : "@media";
    selector = `${header} ${rule.conditionText}{${selector}{}}`;
    var swapRule = rule;
    while(swapRule.parentRule){
        header = swapRule.parentRule.type == window.CSSRule.SUPPORTS_RULE
            ? "@supports" : "@media";
        selector = header + " " + swapRule.parentRule.conditionText + "{" + selector + "}";
        swapRule = swapRule.parentRule;
    }
    return selector;
}
function createDocumentString(doc){
    var body = doc.documentElement.outerHTML.replace("\uFEFF","");
    if(doc.doctype) {
        var doctype = {
            name: doc.doctype.name,
            publicId: doc.doctype.publicId,
            systemId: doc.doctype.systemId
        };
        var dctype = '<!DOCTYPE ' + doctype.name;
        if (doctype.publicId.length) dctype += ' PUBLIC "' + doctype.publicId + '"';
        if (doctype.systemId.length) dctype += ' "' + doctype.systemId + '"';
        dctype += ">\r\n";
        return dctype + body;
    }
    return '<!DOCTYPE html>' + body;
}
function download(filename, blobURL) {
    var element = document.createElement('a');
    element.setAttribute('href', blobURL);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    window.URL.revokeObjectURL(blobURL);
}
function elementSum(DOMel){
    return `<span class=element-sum-tag-name>${DOMel.tagName.toLowerCase()}</span>
            ${DOMel.id ? `<span class=element-sum-id>#${DOMel.id}</span>` : ``}
            ${DOMel.classList.length ? `<span class=element-sum-classes>.${[...DOMel.classList].join(".")}</span>` : ``}`
}
function getDimension(el,cssString,property="width"){
    var old = el.style.getPropertyValue(property);
    var win = el.ownerDocument.defaultView;
    el.style.setProperty(property,cssString,"important");
    var px = +(win.getComputedStyle(el,null)[property].replace("px",""));
    el.style.setProperty(property,old);
    return px;
}
function getDocumentPath(){
  var currentDoc = tilepieces.core.currentDocument;
  var frameResourcePath = tilepieces.utils.paddingURL(tilepieces.frameResourcePath());
  return currentDoc.location.pathname.replace(frameResourcePath,"");
}
function getRelativePath(absolutePathDoc,absolutePathSource){
  // we don't need the starting "/", if there is
  if(absolutePathDoc[0] == "/")
    absolutePathDoc = absolutePathDoc.substring(1);
  if(absolutePathSource[0] == "/")
    absolutePathSource = absolutePathSource.substring(1);
  var common = commonPath(absolutePathDoc, absolutePathSource);
  absolutePathDoc = absolutePathDoc.replace(common,"");
  absolutePathSource = absolutePathSource.replace(common,"");
  var absolutePathDocSplit = absolutePathDoc.split("/");
  var arr = [];
  absolutePathDocSplit.forEach((v,i,a)=>{
    if(i!=a.length-1)
      arr.push("../")
  });
  return arr.join("") + absolutePathSource
}
function notAdmittedTagNameInPosition(tagName,composedPath){
  var doc = composedPath[0].ownerDocument;
  if(tagName == "MAIN")
      return doc.querySelector("main:not([hidden])") ||
          composedPath.find(v=>v.tagName &&
          !v.tagName.match(/^(HTML|BODY|DIV|FORM)$/));
  if(tagName.match(tilepieces.utils.phrasingTags))
      return composedPath.find((v,i)=>
          v.tagName && (
              (v.tagName.match(tilepieces.utils.notInsertableTags) && i==0) ||
              v.tagName.match(tilepieces.utils.notEditableTags)
          )
      );
  if(tagName.match(tilepieces.utils.restrictedFlowInsideTags))
      return composedPath.find((v,i)=>v.tagName && (
              (v.tagName.match(tilepieces.utils.notInsertableTags) && i==0) ||
              (tagName != "P" && v.tagName == "ADDRESS") ||
              v.tagName.match(tilepieces.utils.restrictedFlowInsideTags) ||
              v.tagName.match(tilepieces.utils.notEditableTags) ||
              v.tagName.match(tilepieces.utils.phrasingTags)
          )
      );
  if(tagName.match(/^(ARTICLE|SECTION|NAV|ASIDE|ADDRESS)$/))
      return composedPath.find((v,i)=>v.tagName && (
              (v.tagName.match(tilepieces.utils.notInsertableTags) && i==0) ||
              v.tagName=="ADDRESS" ||
              v.tagName.match(tilepieces.utils.notEditableTags) ||
              v.tagName.match(tilepieces.utils.phrasingTags) ||
              v.tagName.match(tilepieces.utils.restrictedFlowInsideTags)
          )
      );
  if(tagName.match(/^(HEADER|FOOTER)$/))
      return composedPath.find((v,i)=>v.tagName && (
              (v.tagName.match(tilepieces.utils.notInsertableTags) && i==0) ||
              v.tagName.match(/^(ADDRESS|FOOTER|HEADER)$/) ||
              v.tagName.match(tilepieces.utils.notEditableTags) ||
              v.tagName.match(tilepieces.utils.phrasingTags) ||
              v.tagName.match(tilepieces.utils.restrictedFlowInsideTags)
          )
      );
  if(tagName == "FORM")
      return composedPath.find((v,i)=>v.tagName && (
              v.tagName == "FORM" ||
              (v.tagName.match(tilepieces.utils.notInsertableTags) && i==0) ||
              v.tagName.match(tilepieces.utils.notEditableTags) ||
              v.tagName.match(tilepieces.utils.phrasingTags) ||
              v.tagName.match(tilepieces.utils.restrictedFlowInsideTags)
          )
      );
  if(tagName == "DIV")
      return composedPath.find((v,i)=>v.tagName && (
              (v.tagName.match(tilepieces.utils.notInsertableTags) && i==0 && v.tagName!="DL") ||
              v.tagName.match(tilepieces.utils.phrasingTags) ||
              v.tagName.match(tilepieces.utils.restrictedFlowInsideTags)
          )
      );
  if(tagName == "LI")
    return !composedPath[0].tagName.match(/^(UL|OL)$/);
  if(tagName == "SOURCE")
    return !composedPath[0].tagName.match(/^(VIDEO|AUDIO|PICTURE)$/);
  if(tagName.match(/^(META|LINK)$/))
    return composedPath[0].tagName != "HEAD";
  if(tagName == "TITLE")
    return composedPath[0].tagName != "HEAD" || doc.querySelector("title");
  if(tagName.match(/^(CAPTION|COLGROUP|THEAD|TBODY|TFOOT)$/))
    return composedPath[0].tagName != "TABLE";
  if(tagName.match(/^(TD|TH)$/))
    return composedPath[0].tagName != "TR";
  if(tagName == "TR")
    return !composedPath[0].tagName.match(/THEAD|TBODY|TFOOT/);
  if(tagName == "TRACK")
    return !composedPath[0].tagName.match(/VIDEO|AUDIO/);
  if(tagName.match(/^(HTML|BODY|HEAD)$/))
    return true;
  return composedPath.find((v,i)=>v.tagName && (
          (v.tagName.match(tilepieces.utils.notInsertableTags) && i==0) ||
          v.tagName.match(tilepieces.utils.notEditableTags) ||
          v.tagName.match(tilepieces.utils.phrasingTags) ||
          v.tagName.match(tilepieces.utils.restrictedFlowInsideTags)
      )
  )
}
function paddingURL(url){
  if(url[0] != "/")
    url = "/" + url;
  if(!url.endsWith("/"))
    url+="/";
  return url;
}
async function processFile(file,path,docPath){
  if(Number(tilepieces.imageTypeProcess) == 64){
      return new Promise((res,rej)=>{
          var reader = new FileReader();
          reader.addEventListener("load",()=>res(reader.result));
          reader.addEventListener("abort",e=>{
              dialog.open(e.toString());
              rej(e);
          });
          reader.addEventListener("error",e=>{
              dialog.open(e.toString());
              rej(e);
          });
          reader.readAsDataURL(file);
      })
  }
  path = path || (tilepieces.utils.paddingURL(tilepieces.miscDir) + file.name);
  await tilepieces.storageInterface.update(path, file);
  return tilepieces.relativePaths ? tilepieces.utils.getRelativePath(docPath || tilepieces.utils.getDocumentPath(),
    path) : "/" + path;
}
function splitCssValue(cssStyle){
    var swap = cssStyle;
    var cursor = 0;
    var tokens = [];
    var values = [];
    var value = "";
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
            values.push(value.trim());
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
// https://stackoverflow.com/questions/33704791/how-do-i-uninstall-a-service-worker
function unregisterSw(){
    return new Promise((resolve,reject)=>{
        navigator.serviceWorker.getRegistrations()
            .then(registrations=>{
                try {
                    for (let registration of registrations) {
                        var scriptUrl = registration.scriptURL;
                        tilepieces.serviceWorkers.indexOf(scriptUrl) < 0 &&
                        registration.unregister()
                    }
                }
                catch(e){reject(e)}
                resolve();
            },reject)
    })
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
Panel.prototype.close = function(e){
    var $self = this;
    if($self.windowOpen) {
        $self.closingWindow = true;
        $self.windowOpen.close();
        $self.windowOpen = null;
    }
    $self.panelElement.style.display = "none";
    if($self.panelElement.classList.contains("panel-element-selected"))
        $self.panelElement.classList.remove("panel-element-selected");
    $self.panelElementIframe.src = "";
    $self.panelElementIframe.parentNode.replaceChild(
        $self.placeholder,$self.panelElementIframe
    );
    window.dispatchEvent(new CustomEvent("panel-close",{detail:$self}));
}
function createDocInWin(doc,targetDocument){
    var newChilds = [];
    //var styles = doc.querySelectorAll("head link[rel=stylesheet],head style");
    //var newStyles = [...styles].map(v=>v.cloneNode(true));
    for(var i = 0;i<doc.body.childNodes.length;i++){
        var child = doc.body.childNodes[i];
        if(child.tagName == "SCRIPT")
            continue;
        newChilds.push(child)
    }
    //newStyles.forEach(newStyle=>targetDocument.head.appendChild(newStyle));
    newChilds.forEach(c=>{
        targetDocument.adoptNode(c);
        targetDocument.body.appendChild(c)
    });
}
function resetDocInFrame(doc,targetDocument){
    var newChilds = [];
    for(var i = 0;i<doc.body.childNodes.length;i++){
        var child = doc.body.childNodes[i];
        newChilds.push(child)
    }
    newChilds.forEach(c=>{
        targetDocument.adoptNode(c);
        targetDocument.body.appendChild(c)
    });
}
function getBoundingElement($self){
    var el = $self.panelElement;
    var p = el.getBoundingClientRect();
    $self.width = p.width;
    $self.height = p.height;
    var computedStyle = el.ownerDocument.defaultView.getComputedStyle(el,null);
    var matrix = computedStyle.transform;
    var computedTop = computedStyle.top;
    var computedLeft = computedStyle.left;
    $self.topPosition = computedTop != "auto" ? +computedTop.replace("px","") : 0;
    $self.leftPosition = computedLeft != "auto" ? +computedLeft.replace("px","") : 0;
    var matrixSplitted = matrix.match(/matrix/) ?
        matrix.replace(/[()]/g,"").split(",").map(n=>Number(n)) : [0,0];
    $self.top = matrix.match(/matrix3d/) ? matrixSplitted[matrixSplitted.length-3] :
        matrixSplitted[matrixSplitted.length-1];
    $self.left = matrix.match(/matrix3d/) ? matrixSplitted[matrixSplitted.length-4] :
        matrixSplitted[matrixSplitted.length-2];
    $self.x = 0;
    $self.y = 0;
}
window.panel = function(panelElement,
                           constraint,
                           openOnShow=false,
                           zIndex=null,
                           handle=".panel-handler",
                           icon = ".panel-eject",
                           closeIcon=".panel-close"){
    return new Panel(
        panelElement,constraint,openOnShow,zIndex,handle,icon,closeIcon)
};
function Panel(panelElement,
                  constraint,
                  openOnShow,
                  zIndex,
                  handle,
                  icon,
                  closeIcon) {
    var $self = this;
    $self.panelElement = panelElement;
    $self.windowOpen = null;
    $self.panelElementIframe = panelElement.querySelector("iframe");
    $self.placeholder = document.createComment("iframe src="+ $self.panelElementIframe.dataset.src);
    $self.preventIframeMousedown = panelElement.querySelector(".panel-prevent-iframe-mousedown");
    $self.spanTitle = panelElement.querySelector(".panel-title");
    $self.minimizer = panelElement.querySelector(".panel-minimize");
    var dragConstraint = constraint ? (newX,newY,deltaX,deltaY)=>constraint(newX,newY,deltaX,deltaY,$self) : false;
    setDrag($self,handle,dragConstraint);
    $self.setDrag = ()=>setDrag($self,handle,dragConstraint);
    $self.unsetDrag = ()=>{
        $self.drag.destroy();
        $self.drag = null;
    };
    function clickProxy(e){
        $self.onClick();
    };
    function updateTitle(e){
        if(!$self.spanTitle.textContent.trim())
            $self.spanTitle.textContent = $self.panelElementIframe.contentDocument.title;
        $self.panelElementIframe.contentWindow.addEventListener("mousedown",putOnTop);
    };
    function putOnTop(e){
        var alreadySelected = document.querySelector(".panel-element-selected");
        if(alreadySelected == $self.panelElement)
            return;
        alreadySelected && alreadySelected.classList.remove("panel-element-selected");
        $self.panelElement.classList.add("panel-element-selected");
    }
    function minimize(e){
        $self.panelElement.classList.add("panel-element-minimized");
        getBoundingElement($self);
    }
    $self.panelElement.addEventListener("mousedown",putOnTop);
    $self.panelElementIframe.addEventListener("load",updateTitle);
    $self.iconDOM = panelElement.querySelector(icon);
    $self.iconDOM.addEventListener("click",clickProxy);
    $self.closer = panelElement.querySelector(closeIcon);
    $self.closer.addEventListener("click",()=>$self.close());
    $self.minimizer && $self.minimizer.addEventListener("click",minimize);
    $self.putOnTop = putOnTop;
    $self.destroy = function(){
        $self.panelElement.removeEventListener("mousedown",putOnTop);
        $self.panelElementIframe.contentDocument.removeEventListener("mousedown",putOnTop);
        $self.iconDOM.removeEventListener("click",clickProxy);
        $self.panelElementIframe.removeEventListener("load",updateTitle);
        $self.drag && $self.drag.destroy();
        $self.drag = null;
    };
    // close window on window beforeunload
    window.addEventListener("unload",e=>{
        if($self.windowOpen)
            $self.windowOpen.close()
    });
    var resizeThrottle;
    window.addEventListener("resize",e=>{
        if(!$self.drag)
            return;
        clearTimeout(resizeThrottle);
        resizeThrottle = setTimeout(e=>{
            if($self.left+$self.width > window.innerWidth) {
                var left = window.innerWidth - $self.width;
                $self.left = left>0 ? left : 0;
                $self.panelElement.style.transform = "translate(" + $self.left + "px," + $self.top + "px)";
            }
            if($self.top+$self.height > window.innerHeight){
                var top = window.innerHeight - $self.height;
                $self.top = top>0 ? top : 0;
                $self.panelElement.style.transform = "translate(" + $self.left + "px," + $self.top + "px)";
            }
        },32);
    });
    if(!openOnShow)
        $self.panelElementIframe.parentNode.replaceChild(
            $self.placeholder,$self.panelElementIframe
        );
    else $self.show(true);
    resizable($self);
}

function moveE(e,$self){
    if(e.x>=window.innerWidth){
        document.dispatchEvent(new MouseEvent("mouseup"));
        document.dispatchEvent(new TouchEvent("touchcancel"));
        return;
    }
    var movePosition = e.x - $self.x;
    $self.x = e.x;
    var width = $self.width+movePosition;
    if(width<400) {
        document.dispatchEvent(new MouseEvent("mouseup"));
        document.dispatchEvent(new TouchEvent("touchcancel"));
        return;
    }
    $self.width=width;
    $self.panelElement.style.width = $self.width + "px";
}
function moveN(e,$self){
    var movePosition = $self.y - e.y;
    $self.y = e.y;
    var height = $self.height+movePosition;
    if(height<30)
        return;
    $self.height=height;
    var top = $self.top-movePosition;
    $self.top=top>0?top:0;
    if($self.top==0){
        $self.panelElement.style.transform = "translate("+$self.left + "px," + $self.top +"px)";
        document.dispatchEvent(new MouseEvent("mouseup"));
        document.dispatchEvent(new TouchEvent("touchcancel"));
        return;
    }
    $self.panelElement.style.height = $self.height + "px";
    $self.panelElement.style.transform = "translate("+$self.left + "px," + $self.top +"px)";
}
function moveS(e,$self){
    if(e.y>=window.innerHeight){
        document.dispatchEvent(new MouseEvent("mouseup"));
        document.dispatchEvent(new TouchEvent("touchcancel"));
        return;
    }
    var movePosition =  e.y - $self.y;
    $self.y = e.y;
    var height = $self.height+movePosition;
    if(height<30)
        return;
    $self.height=height;
    $self.panelElement.style.height = $self.height + "px";
}
function moveUp($self){
    $self.preventIframeMousedown.style.display = "none";
    $self.preventMouseOut.style.cursor = "";
}
function moveW(e,$self){
    var movePosition =  e.x - $self.x;
    $self.x = e.x;
    var width = $self.width-movePosition;
    if(width<400) {
        document.dispatchEvent(new MouseEvent("mouseup"));
        document.dispatchEvent(new TouchEvent("touchcancel"));
        return;
    }
    $self.width=width;
    var left = $self.left+movePosition;
    $self.left=left>0?left:0;
    if($self.left==0){
        $self.panelElement.style.transform = "translate("+$self.left + "px," + $self.top +"px)";
        document.dispatchEvent(new MouseEvent("mouseup"));
        document.dispatchEvent(new TouchEvent("touchcancel"));
        return;
    }
    $self.panelElement.style.width = $self.width + "px";
    $self.panelElement.style.transform = "translate("+$self.left + "px," + $self.top +"px)";
}
function registerPointDown(e,$self,cursor){
    $self.x = e.x;
    $self.y = e.y;
    $self.preventIframeMousedown.style.display = "block";
    $self.preventMouseOut.style.cursor = cursor+"-resize";
}

Panel.prototype.onClick= function(){
    var $self = this;
    if($self.panelElement.classList.contains("panel-element-minimized")){
        //$self.show();
      $self.panelElement.classList.remove("panel-element-minimized");
      getBoundingElement($self);
      return;
    }
    var coords = popupCoords($self.panelElement);
    var hasPopUp = $self.panelElement.dataset.altPopup;
    var newWindow = window.open(hasPopUp || $self.panelElementIframe.src,
        "_blank","top=" + coords.top + ",left=" + coords.left +
        ",width="+($self.panelElement.offsetWidth)+
        ",height="+($self.panelElement.offsetHeight));
    newWindow.addEventListener("load",function(e){
        hasPopUp && createDocInWin($self.panelElementIframe.contentDocument,newWindow.document);
        $self.panelElement.style.display = "none";
        $self.windowOpen = newWindow;
        var newEvent = new CustomEvent("window-popup-open",{detail:{
            panelElement : $self.panelElement,
            panelElementIframe:$self.panelElementIframe,
            newWindow
        }
        });
        newWindow.dispatchEvent(newEvent);
        $self.panelElementIframe.contentWindow.dispatchEvent(newEvent);
        newWindow.focus();
        newWindow.addEventListener("unload",function(e){
            if(!$self.closingWindow) {
                hasPopUp && resetDocInFrame(newWindow.document, $self.panelElementIframe.contentDocument);
                $self.panelElement.style.display = "block";
                $self.panelElementIframe.focus();
                $self.panelElementIframe.contentWindow.dispatchEvent(
                    new CustomEvent("window-popup-close", {
                        detail: {
                            panelElement: $self.panelElement,
                            panelElementIframe: $self.panelElementIframe,
                            newWindow
                        }
                    }));
                window.dispatchEvent(new Event("panel-os-window-close"))
                newWindow.close();
                newWindow = null;
                $self.windowOpen = null;
            }
            $self.closingWindow = false;
        });
    });
}
function popupCoords(offsetEl) {
    offsetEl = offset(offsetEl);
    var t = offsetEl.top;
    var l = offsetEl.left;

    var dualScreenLeft = window.screenLeft;
    var dualScreenTop = window.screenTop;

    return {
        left : (dualScreenLeft + l),
        top : (dualScreenTop + t)
    }
}
function resizable($self){
    var el = $self.panelElement;
    if(el.querySelector(".resizable-element"))
        return;
    var resizableTemplate = `<div class="nw resizable-element"></div>
    <div class="n resizable-element"></div>
    <div class="ne resizable-element"></div>
    <div class="e resizable-element"></div>
    <div class="se resizable-element"></div>
    <div class="s resizable-element"></div>
    <div class="sw resizable-element"></div>
    <div class="w resizable-element"></div>`;
        el.insertAdjacentHTML("beforeend", resizableTemplate);
    var n = el.querySelector(".n");
    var e = el.querySelector(".e");
    var w = el.querySelector(".w");
    var s = el.querySelector(".s");
    var nw = el.querySelector(".nw");
    var sw = el.querySelector(".sw");
    var se = el.querySelector(".se");
    var ne = el.querySelector(".ne");
    var dragSettings= {
        preventMouseOut:true,
        grabCursors : false,
        grabbingClass : false
    };
    // S
    var sDrag = __drag(s, dragSettings);
    sDrag.on("down", (e)=>registerPointDown(e,$self,"s"));
    sDrag.on("move", (e)=>moveS(e,$self));
    sDrag.on("up", (e)=>moveUp($self));
    $self.preventMouseOut = sDrag.preventMouseOut;
    // E
    var eDrag = __drag(e,dragSettings);
    eDrag.on("down", (e)=>registerPointDown(e,$self,"e"));
    eDrag.on("move", (e)=>moveE(e,$self));
    eDrag.on("up", (e)=>moveUp($self));
    // SE
    var seDrag = __drag(se, dragSettings);
    seDrag.on("down", (e)=>registerPointDown(e,$self,"se"));
    seDrag.on("move", (e)=>{
        moveS(e,$self);
        moveE(e,$self);
    });
    seDrag.on("up", (e)=>moveUp($self));
    // N
    var nDrag = __drag(n,dragSettings);
    nDrag.on("down", (e)=>registerPointDown(e,$self,"n"));
    nDrag.on("move", (e)=>moveN(e,$self));
    nDrag.on("up", (e)=>moveUp($self));
    // W
    var wDrag = __drag(w,dragSettings);
    wDrag.on("down", (e)=>registerPointDown(e,$self,"w"));
    wDrag.on("move", (e)=>moveW(e,$self));
    wDrag.on("up", (e)=>moveUp($self));
    // NW
    var nwDrag = __drag(nw,dragSettings);
    nwDrag.on("down", (e)=>registerPointDown(e,$self,"nw"));
    nwDrag.on("move", (e)=>{
        moveN(e,$self);
        moveW(e,$self);
    });
    nwDrag.on("up", (e)=>moveUp($self));
    // SW
    var swDrag = __drag(sw,dragSettings);
    swDrag.on("down", (e)=>registerPointDown(e,$self,"sw"));
    swDrag.on("move", (e)=>{
        moveS(e,$self);
        moveW(e,$self);
    });
    swDrag.on("up", (e)=>moveUp($self));
    // NE
    var neDrag = __drag(ne,dragSettings);
    neDrag.on("down", (e)=>registerPointDown(e,$self,"ne"));
    neDrag.on("move", (e)=>{
        moveN(e,$self);
        moveE(e,$self);
    });
    neDrag.on("up", (e)=>moveUp($self));
}
function setDrag($self,handle,constraint){
    getBoundingElement($self);
    $self.drag = __dragElement($self.panelElement, {
        handle: handle,
        dragElementConstraint : constraint || function(){return false},
        preventMouseOut : true,
        grabbingClass : false
    });
    $self.drag.on("down",e=>{
        if(!$self.panelElement.classList.contains("panel-element-minimized"))
            $self.preventIframeMousedown.style.display = "block";
    });
    $self.drag.on("move",e=>{
        $self.left = e.newX;
        $self.top = e.newY;
    });
    $self.drag.on("up",e=>{
        if(!$self.panelElement.classList.contains("panel-element-minimized"))
            $self.preventIframeMousedown.style.display = "none";
    });
}
Panel.prototype.show = function(target){
    var $self = this;
    if(!$self.windowOpen) {
        if($self.panelElement.style.display != "block" ||
            $self.panelElement.classList.contains("panel-element-minimized")) {
            $self.placeholder.parentNode && $self.placeholder.parentNode.replaceChild(
                $self.panelElementIframe,$self.placeholder
            );
            $self.panelElement.style.display = "block";
            $self.panelElementIframe.onload = function(e){
                window.dispatchEvent(
                    new CustomEvent("panel-created-iframe",{
                        detail : $self.panelElementIframe
                    })
                );
            };
            $self.panelElementIframe.src = $self.panelElementIframe.dataset.src;
            getBoundingElement($self);
        }
        if(target)
            $self.putOnTop({detail:{target}});
    }
    else {
        if(target){
            var targetCoords = popupCoords(target);
            $self.windowOpen.moveTo(targetCoords.left, targetCoords.top);
        }
        $self.windowOpen.focus();
    }
}

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
(function(){
    let codeMirrorEditor = document.getElementById("codeMirror-editor");
    let codeMirrorEditorPanel = panel(codeMirrorEditor,null,false,46);
    codeMirrorEditor.style.zIndex = 46;
    let preventDockableResizableMouseOut = document.querySelector(".__drag-prevent-mouse-out");
    let firstChange = true;
    tilepieces.codeMirrorEditor = function(sourceString,ext){
        return new Promise((resolve,reject)=>{
            tilepieces.codeMirrorEditorValue = {
                value: sourceString,
                ext
            };
            preventDockableResizableMouseOut.style.zIndex = 45;
            function dispose(){
                window.removeEventListener("codemirror-editor-done", done);
                window.removeEventListener("panel-close", close);
                preventDockableResizableMouseOut.zIndex = "";
                firstChange = true;
                tilepieces.codeMirrorEditorValue = {};
                window.dispatchEvent(new Event("release"));
            }
            function done(e) {
                dispose();
                codeMirrorEditorPanel.close();
                return resolve(e.detail);
            }
            function close() {
                dispose();
                reject();
            }
            window.dispatchEvent(new Event("lock-down"));
            codeMirrorEditorPanel.show();
            window.addEventListener("codemirror-editor-done", done);
            window.addEventListener("panel-close", close);
        });
    }
})();
(function(){
    let cpicker = panel(document.getElementById("colorpicker"),null,false,46);
    let preventDockableResizableMouseOut = document.querySelector(".__drag-prevent-mouse-out");
    let firstChange = true;
    tilepieces.colorPicker = function(c){
        tilepieces.colorPickerStartColor = c;
        preventDockableResizableMouseOut.style.zIndex = 45;
        var onChangeEvents = [];
        function change(e){
            if(firstChange)
                firstChange = false;
            else
                onChangeEvents.forEach(ev=>ev(e.detail))
        }
        function done(){
            cpicker.close();
        }
        function close(){
            window.removeEventListener("color-picker-change",change);
            window.removeEventListener("color-picker-done",done);
            window.removeEventListener("panel-close",close);
            preventDockableResizableMouseOut.zIndex = "";
            firstChange = true;
            window.dispatchEvent(new Event("release"));
        }
        window.dispatchEvent(new Event("lock-down"));
        cpicker.show();
        window.addEventListener("color-picker-change",change);
        window.addEventListener("color-picker-done",done);
        window.addEventListener("panel-close",close);
        return {
            onChange : f=>onChangeEvents.push(f)
        }
    }
})();
(()=>{
const paginationItems = 10;
const typeEnum = {
  "audio" : ".mp3,.ogg,.wav",
  "video" : ".mp4,.ogg,.webm",
  "img" : ".apng,.gif,.jpg,.jpeg,.avif,"+
  ".jfif,.pjpeg,.pjp,.png,.svg,.webp,.bmp,.ico,.cur",
  "fonts" : ".otf,.ttf,.svg,.woff,.woff2,.eot"
};
let type;
let template = document.getElementById("tilepieces-search-template");
let t;
let evs;
let selected;
let dialogObj;
let pagination;
let globalModel = {
  pagination : null,
  resources : [],
  disabled:"disabled"
};
let docPath;
let inputFile,filePathInput,fileButtonSave;
function inputFileEvents() {
  inputFile.addEventListener("change", e=> {
    globalModel.disableinputfile = "";
    var file = e.target.files[0];
    globalModel.miscpath += file.name;
    globalModel.fileUploaded = file;
    t.set("", globalModel)
  });
  fileButtonSave.addEventListener("click", async e=> {
    dialog.close();
    dialog.open("processing file...");
    try {
      var finalPath = await tilepieces.utils.processFile(
        globalModel.fileUploaded,globalModel.miscpath,docPath);
      dialog.close();
      evs.dispatch("submit", finalPath);
    }
    catch(e){
      console.error(e);
      dialog.close();
      alertDialog(e.err || e.error || e.toString(),true);
    }
  })
}
window.dialogReader = (typeProp = "img",path = "")=>{
  return new Promise(async (res,rej)=>{
    docPath = path;
    var div = document.createElement("div");
    type = typeProp;
    var blobAccepted = typeEnum[type];
    var searchResult,storageInterfaceError;
    var endsFilesAccepted = blobAccepted.split(",");
    dialog.open("please wait...",true);
    try {
      searchResult = await storageInterface.search("","*");
    }
    catch(e){
      searchResult = {searchResult:[]};
      storageInterfaceError = true;
    }
    var searchResults = searchResult.searchResult.filter(v=>endsFilesAccepted.find(ef=>v.endsWith(ef)))
    var resources = searchResults.map(i=>{
        return{
            src:tilepieces.frameResourcePath() + "/" + i,
            filename:i.split(/[\\/]/).pop()
        }
    });
    if(resources.length>paginationItems) {
        pagination = {
            total : resources.slice(0),
            pages : Math.ceil(resources.length / paginationItems),
            page:1,
            pointer:0
        };
        resources = resources.slice(0, paginationItems);
    }
    else pagination = null;
    globalModel = {
      pagination,
      resources,
      type,
      accept:blobAccepted,
      disabled:"disabled",
      disableinputfile:"disabled",
      storageInterfaceClass : storageInterfaceError ? "interface-error" : "",
      miscpath : tilepieces.utils.paddingURL(tilepieces.miscDir)
    };
    evs = events();
    var templateClone = template.cloneNode(true);
    t = new TT(templateClone.content,globalModel);
    dialogObj = dialog.open(templateClone.content);
    dialogObj.dialog.addEventListener("click",selection);
    dialogObj.events.on("close",e=>{
        evs.dispatch("close","");
    });
    inputFile = document.getElementById("dialog-reader-file-input");
    filePathInput = document.getElementById("dialog-reader-filepath-input");
    fileButtonSave= document.getElementById("dialog-reader-file-button");
    inputFileEvents();
    res(evs);
  })
};
function selection(e){
  var target = e.target;
  if(target.closest(".upload-file-mask"))
    return;
  var figure = target.closest("figure");
  var button = target.nodeName == "BUTTON";
  if(figure){
    selected && selected.classList.remove("sel");
    selected = figure;
    selected.classList.add("sel");
    t.set("disabled","");
  }
  if(button && selected){
    dialogObj.dialog.removeEventListener("click",selection);
    dialog.close();
    var selectedValue = selected.dataset.value.replace(tilepieces.frameResourcePath() + "/","");
    evs.dispatch("submit",tilepieces.relativePaths ?
      tilepieces.utils.getRelativePath(docPath || tilepieces.utils.getDocumentPath(),selectedValue) :
        "/" + selectedValue
    );
  }
  if(typeof target.dataset.prev == "string" ||
    typeof target.dataset.next == "string"){
    var pointer = target.dataset.prev == "" ?
    globalModel.pagination.pointer-paginationItems :
    globalModel.pagination.pointer+paginationItems;
    var page = target.dataset.prev == "" ? globalModel.pagination.page-1 :
    globalModel.pagination.page+1;
    globalModel.resources = globalModel.pagination.total.slice(pointer,pointer + paginationItems);
    globalModel.pagination = {
      total : pagination.total,
      pages : globalModel.pagination.pages,
      page,
      pointer
    };
    t.set("",globalModel);
    globalModel =t.scope;
    selected && selected.classList.remove("sel");
  }
}

})();
function addTag(tagName,properties = [],node = false,contenteditable = null){
    if(tagName.toUpperCase().match(app.utils.notEditableTags)){
        createNotEditableTag(tagName,node);
        return;
    }
    var range = globalRange;
    var selectionContents = textNodesUnder(globalRange.commonAncestorContainer).filter(v=>v.textContent.trim()); //getSelectedNodes(globalRange);
    var startContainer = range.startContainer.nodeType != 3 ?
        range.startContainer : range.startContainer.parentElement;
    var doc = startContainer.ownerDocument;
    if(!selectionContents.length || selectionContents.length == 1){
        var newSpan = doc.createElement(tagName);
        properties.forEach(v=>newSpan.setAttribute(v.name,v.value));
        if (range.collapsed) {
            if(tagName == "a")
                newSpan.appendChild(doc.createTextNode("\uFEFF\uFEFF"));
            else {
                newSpan.appendChild(doc.createTextNode("\uFEFF"));
            }
            range.insertNode(newSpan);
            range.collapse(true);
            range.setStart(newSpan.firstChild,1);
        }
        else{
            newSpan.appendChild(range.extractContents());
            if(tagName == "a") {
                if(newSpan.textContent.charCodeAt(0) != 65279)
                    newSpan.insertBefore(doc.createTextNode("\uFEFF"),newSpan.firstChild);
                if(newSpan.textContent.charCodeAt(newSpan.textContent.length-1) != 65279)
                    newSpan.appendChild(doc.createTextNode("\uFEFF"));
            }
            range.insertNode(newSpan);
            range.selectNodeContents(newSpan);
        }
    }
    else {
        var newRange = new Range();
        selectionContents.forEach((v, i, a)=> {
            var parent = v.parentElement;
            var newEl = doc.createElement(tagName);
            properties.forEach(v=>newEl.setAttribute(v.name,v.value));
            while(parent) { // check if already has this tag
                if(parent.tagName == tagName.toUpperCase()) {
                    break;
                }
                else parent = parent.parentElement;
            }
            if(!parent) {
                 v.replaceWith(newEl);
                 newEl.appendChild(v);
            }
            if(i==0)
                newRange.setStart(v,0);
            if(i==a.length-1)
                newRange.setEnd(v,v.textContent.length);
        });
        globalSel.removeAllRanges();
        globalSel.addRange(newRange);
        globalRange = newRange;
    }
}
function buttonTextLevelTag(element,tagName,
                            properties = [],
                            nodes = false){
    var isPermittedPhrasingTag = tagName.match(textPermittedPhrasingTags);
    var isPermittedFlowTag = tagName.match(textPermittedFlowTags);
    let aElement;
    let contenteditable;
    let tagNameLowerCase = tagName.toLowerCase();
    let tagNameUpperCase = tagName.toUpperCase();
    element.addEventListener("click",buttonProxy);
    function buttonProxy(e){
        if(!app.contenteditable)
            return;
        var doc = app.core.currentDocument;
        var win = doc.defaultView;
        globalSel = win.getSelection();
        if(!globalSel.anchorNode){
            console.error("No selection");
            return;
        }
        globalRange = globalSel.getRangeAt(0);
        if(element.classList.contains("selected"))
            removeTag(tagNameLowerCase,contenteditable);
        else
            addTag(tagNameLowerCase, properties, nodes,contenteditable);
        element.classList.toggle("selected");
        app.lastEditable.el.dispatchEvent(new Event('input'));
        app.lastEditable.el.focus();
    }
    opener.addEventListener("WYSIWYG-el-parsed",e=>{
        var parent = e.detail.target;
        contenteditable = e.detail.event.detail;
        aElement = null;
        do{
            if(parent.tagName == tagNameUpperCase) {
                aElement = parent;
                break;
            }
        }
        while(parent = parent.parentElement);
        if(aElement) {
            element.classList.add("selected");
            if(tagNameLowerCase == "a"){
                if(aElement.textContent.charCodeAt(0) != 65279)
                    aElement.insertBefore(aElement.ownerDocument.createTextNode("\uFEFF"),aElement.firstChild);
                if(aElement.textContent.charCodeAt(aElement.textContent.length-1) != 65279)
                    aElement.appendChild(aElement.ownerDocument.createTextNode("\uFEFF"));
            }
        }
        else
            element.classList.remove("selected");
    });
}
// https://stackoverflow.com/questions/56203483/how-to-detect-invisible-zero-width-or-whitespace-characters-in-unicode-in-java?noredirect=1&lq=1
// https://stackoverflow.com/questions/11305797/remove-zero-width-space-characters-from-a-javascript-string/11305926#11305926
//let zeroWidthChars = /\u{0}+|\u{feff}+|\u{200b}+|\u{200c}+|\u{200d}/gu;
let zeroWidthChars = /[\u200B-\u200D\uFEFF]/g;
let opener = window;
var app = opener.tilepieces;
let regexNumbers = /[+-]?\d+(?:\.\d+)?/; // https://codereview.stackexchange.com/questions/115885/extract-numbers-from-a-string-javascript
let globalSel,globalRange;
let textPermittedPhrasingTags = app.utils.textPermittedPhrasingTags;
let textPermittedFlowTags = app.utils.textPermittedFlowTags;
opener.addEventListener("WYSIWYG-start",e=>{
    var el = e.detail;
    globalSel = el.ownerDocument.defaultView.getSelection();
    if(!globalSel.anchorNode){
        console.error("WYSIWYG started with no selection. exit");
        return;
    }
    globalRange = globalSel.getRangeAt(0);
    var anchorNode = globalSel.anchorNode;
    var elToParse = anchorNode ?
        (anchorNode.nodeType == 3 ? anchorNode.parentElement : anchorNode) :
        el;
    opener.dispatchEvent(
        new CustomEvent("WYSIWYG-el-parsed",{detail:{target: elToParse,event:e}})
    )
});

function removeTag(tagName,contenteditable){
    var selectionContents = getSelectedNodes(globalRange);
    var range = globalRange;
    var startContainer = range.startContainer.nodeType != 3 ?
        range.startContainer : range.startContainer.parentElement;
    var commonAncestor = range.commonAncestorContainer;
    var doc = startContainer.ownerDocument;
    if(!selectionContents.length || selectionContents.length == 1) {
        var swap = startContainer;
        var frag = swap.ownerDocument.createDocumentFragment();
        var toAppend = frag;
        while (swap && swap.nodeName.toLowerCase() != tagName) {
            var cloneNode = swap.cloneNode();
            cloneNode.removeAttribute("id");
            toAppend.appendChild(cloneNode);
            toAppend = cloneNode;
            swap = swap.parentNode;
        }
        var collapsed = range.collapsed;
        var newTextT = collapsed ? "\uFEFF\uFEFF" : range.toString();
        var first = splitTag(swap, range,selectionContents[0],!collapsed);
        var newText = toAppend.appendChild(swap.ownerDocument.createTextNode(newTextT));
        if (first.textContent.replace(zeroWidthChars,"").length)
            swap.parentNode.insertBefore(first, swap);
        swap.parentNode.insertBefore(frag,swap);
        if (!swap.textContent.replace(zeroWidthChars,"").length)
            swap.parentNode.removeChild(swap);
        if(collapsed) {
            range.setStart(newText, 1);
            range.collapse(true);
        }
        else {
            range.extractContents();
            selectionContents[0] && selectionContents[0].parentNode.removeChild(selectionContents[0]);
            range.selectNodeContents(newText);
        }
    }
    else
        selectionContents.forEach((v,i,a)=>{
            var parent = v.parentElement;
            var el, toMove = [];
            while(parent!=commonAncestor){
                if(parent.tagName == tagName.toUpperCase()){
                    el = parent;
                    break;
                }
                else toMove.push(parent);
                parent = parent.parentElement;
            }
            if (el) {
                var elSanitizeContent = el.textContent.replace(zeroWidthChars, "");
                var vTextContent = v.textContent.replace(zeroWidthChars, "");
                if (elSanitizeContent != vTextContent) {
                    var startsWith = elSanitizeContent.startsWith(vTextContent);
                    var frag = doc.createDocumentFragment();
                    var newEl = frag;
                    toMove.forEach(p=> {
                        var newNested = p.cloneNode();
                        newEl.appendChild(newNested);
                        newEl = newNested;
                    });
                    newEl.appendChild(v);
                    if (startsWith)
                        el.before(frag);
                    else
                        el.after(frag);
                    if (!el.textContent.replace(zeroWidthChars, "").length)
                        el.remove();
                }
                else
                    unwrap([...el.childNodes]);
            }
            if (i == 0)
                range.setStart(v, 0);
            if (i == a.length - 1)
                range.setEnd(v, v.textContent.length);
        });
}
function createNotEditableTag(tagName,node){
    var doc = globalRange.startContainer.ownerDocument;
    var el = node ? node.cloneNode(true) : doc.createElement(tagName);
    var last = node && node.nodeType == 11 ? el.lastChild : el;
    var textPlaceholder = doc.createTextNode("\uFEFF");
    globalRange.extractContents();
    globalRange.insertNode(el);
    globalRange.setStartAfter(last);
    globalRange.insertNode(textPlaceholder);
    globalRange.setStartAfter(textPlaceholder);
    globalRange.collapse(true);
}
// https://stackoverflow.com/questions/7781963/js-get-array-of-all-selected-nodes-in-contenteditable-div
function nextNode(node) {
    if (node.hasChildNodes()) {
        return node.firstChild;
    } else {
        while (node && !node.nextSibling) {
            node = node.parentNode;
        }
        if (!node) {
            return null;
        }
        return node.nextSibling;
    }
}
function getSelectedNodes(range) {
    var node = range.startContainer;
    var endNode = range.endContainer;
    // Special case for a range that is contained within a single node
    if (node == endNode) {
        if(node.nodeType == 3) {
            if (range.endOffset != node.textContent.length)
                node.splitText(range.endOffset);
            if (range.startOffset > 0)
                node = node.splitText(range.startOffset);
        }
        return [node];
    }
    // Iterate nodes until we hit the end container
    var rangeNodes = [];
    while (node && node != endNode) {
        node = nextNode(node);
        node && node!=endNode && node.nodeType == 3 && node.nodeValue.trim() && rangeNodes.push(node);
    }
    if(node==endNode){
        if(node.nodeType == 3 && range.endOffset != node.textContent.length)
            node.splitText(range.endOffset);
        rangeNodes.push(node);
    }
    // Add partially selected nodes at the start of the range
    node = range.startContainer;
    while (node && node != range.commonAncestorContainer) {
        if(node.nodeType == 3 && node.nodeValue.trim() && node === range.startContainer) {
            if(range.startOffset > 0) {
                var newNode = node.splitText(range.startOffset);
                rangeNodes.unshift(newNode);
            }
            else
                rangeNodes.unshift(node);
        }
        node = node.parentNode;
    }
    return rangeNodes;
}
function insertString(string){
    var doc = globalRange.startContainer.ownerDocument;
    var text= doc.createTextNode(string);
    globalRange.extractContents();
    globalRange.insertNode(text);
    globalRange.setStartAfter(text);
    globalRange.collapse(true);
}
function splitLI(li){
    var list = li.parentNode;
    if(list.tagName.match(/UL|OL/))
        return;
    // avoid processing text nodes that are already removed
    var liChilds = [...li.childNodes].map(v=>v.cloneNode(true));
    var previousUl = li.ownerDocument.createElement("UL");
    while(li.previousElementSibling){
        previousUl.appendChild(li.previousElementSibling);
    }
    if(previousUl.children.length)
        list.before(previousUl);
    list.before(...liChilds);
    li.remove();
    if(!list.children.length)
        list.remove();
}
function splitTag(el,range,p,removePivot){
    var pivot = p || range.commonAncestorContainer;
    if(!el.contains(pivot) && el != pivot){
        console.error("el,parentPivot ->",el,"\n",pivot);
        throw new Error("Error in split tag. Split tag called with !el.contains(parentPivot);")
    }
    var firstAncestor = el.nodeType != 3 ? el.cloneNode() : el.ownerDocument.createDocumentFragment();
    if(pivot.nodeType == 3 && pivot == range.commonAncestorContainer && range.collapsed) {
        if(range.startOffset == 0)
            return firstAncestor;
        else
            pivot = pivot.splitText(range.startOffset);
        /*
         else if(range.startOffset == pivot.textContent.length) {
         var newPivot = pivot.ownerDocument.createTextNode("");
         pivot.parentNode.appendChild(newPivot,pivot);
         pivot = newPivot;
         }
         */
    }
    if(el.nodeType != 3)
        firstAncestor.removeAttribute("id");
    if(pivot != el) {
        var split1 = pivot;
        while (split1 != el) {
            var newAncestor = split1.cloneNode();
            split1.id && split1.removeAttribute("id");
            if(firstAncestor.childNodes.length) {
                while(firstAncestor.firstChild)
                    newAncestor.appendChild(firstAncestor.firstChild);
                firstAncestor.appendChild(newAncestor);
            }
            else if(!removePivot)
                firstAncestor.appendChild(newAncestor);

            while(split1.previousSibling)
                firstAncestor.insertBefore(split1.previousSibling,firstAncestor.firstChild);
            split1 = split1.parentNode;
        }
    }
    return firstAncestor;
}
function textNodesUnder(el){
    var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
    while(n=walk.nextNode()) a.push(n);
    return a;
}
// https://stackoverflow.com/questions/37624455/how-to-remove-wrapper-of-multiple-elements-without-jquery?noredirect=1&lq=1
function unwrap(elems) {
    elems = Array.isArray(elems) ? elems : [elems];
    var newElements = [];
    for (var i = 0; i < elems.length; i++) {
        var elem        = elems[i];
        var parent      = elem.parentNode;
        var grandparent = parent.parentNode;
        newElements.push(grandparent.insertBefore(elem, parent));
        if (!parent.firstChild)
            grandparent.removeChild(parent);
    }
    return newElements;
}
/*
 If the endContainer is a Node of type Text, Comment, or CDATASection,
 then the offset is the number of characters from the start of the endContainer
 to the boundary point of the Range. For other Node types, the endOffset is the number of child
 nodes between the start of the endContainer and the boundary point of the Range.
 */
opener.addEventListener("WYSIWYG-keydown",ev=>{
    var el = ev.detail.el;
    var e = ev.detail.e;
    var doc = el.getRootNode();
    if(e.key == "ArrowRight" && e.shiftKey){
        var parentLi = globalSel.anchorNode.nodeType == 1 ? globalSel.anchorNode.closest("li") :
            globalSel.anchorNode.parentNode.closest("li");
        var parentUl = parentLi.closest("ul,ol");
        if(parentLi && parentUl){
            var ul = doc.createElement(parentUl.tagName);
            var li = doc.createElement("li");
            li.textContent = "LI element";
            ul.appendChild(li);
            parentLi.appendChild(ul);
            globalRange.selectNodeContents(li);
        }
    }
    if(e.key == "ArrowDown" && e.shiftKey){
        var parentLi = globalSel.anchorNode.nodeType == 1 ? globalSel.anchorNode.closest("li") :
            globalSel.anchorNode.parentNode.closest("li");
        var parentUl = parentLi.closest("ul,ol");
        if(parentLi && parentUl){
            var li = doc.createElement("li");
            li.textContent = "LI element";
            parentUl.appendChild(li);
            globalRange.selectNodeContents(li);
        }
    }
    /*
    if(e.key == "ArrowLeft" && e.shiftKey){
        var parentLi = globalSel.anchorNode.nodeType == 1 ? globalSel.anchorNode.closest("li") :
            globalSel.anchorNode.parentNode.closest("li");
        var parentUl = parentLi.closest("ul");
        if(parentLi && parentUl){
            // next are going in another ul
            var next = parentLi.nextElementSibling;
            var ul;
            if(next){
                ul = doc.createElement("ul");
                while(next){
                    ul.appendChild(next);
                    next = next.nextElementSibling;
                }
            }
            var whereAppend = parentUl.parentNode;
            if(whereAppend.tagName == "UL"){
                parentUl
            }
        }
    }*/
    if(e.key == "Enter") {
        e.preventDefault();
        createNotEditableTag("br");
        el.dispatchEvent(new Event('input'))
    }
});
window.wysiwyg = {
    removeTag,
    addTag,
    buttonTextLevelTag,
    insertString,
    selection:()=>globalSel,
    range:()=>globalRange
}

const width = document.getElementById("width");
const height = document.getElementById("height");
const fitToScreen = document.getElementById("fit-to-screen-button");
const reverse = document.getElementById("reverse");
const selectScreenDimensions = document.getElementById("screen-dimensions-default");
const screenDimensionsEl = document.getElementById("screen-dimensions");
const screenDimensionsTrigger = document.getElementById("screen-dimensions-trigger");
const selectionTrigger = document.getElementById("selection-trigger");
const contenteditableTrigger = document.getElementById("contenteditable-trigger");
const menuTrigger = document.getElementById("menu-trigger");
const menuBar = document.getElementById("menu-bar");
const menuBarTrigger = document.getElementById("menu-bar-trigger");
const targetFrameWrapper = document.getElementById("target-frame-wrapper");
const menuBarsettings = document.getElementById("menu-bar-settings");
const menuBarprojects = document.getElementById("menu-bar-projects");
const menuBarcomponents = document.getElementById("menu-bar-components");
const mobileWrapper = document.getElementById("mobile-wrapper");

const windowsListEl = document.getElementById("window-list");
const dockFrame = document.getElementById("dock-frames");
let frameUIEls = [...dockFrame.querySelectorAll(".panel-element")];
let isMobile = window.innerWidth < 1024;

searchForLastProject();

tilepieces.setFrame = function(URL,htmltext){
  tilepieces.frame.removeEventListener("load",tilepieces.loadFunction);
  tilepieces.loadFunction = async function load(e){
    console.log("[tilepieces setFrame load called]");
    if(!tilepieces.frame.contentDocument) {
      console.error(e);
      alertDialog("impossible fetch document",true);
      tilepieces.core && tilepieces.core.destroy();
      tilepieces.frame.removeEventListener("load",tilepieces.loadFunction);
      document.title = `${tilepieces.project ? `${tilepieces.project.name} - ` : ``}`;
      return;
    }
    if(tilepieces.frame.contentDocument == (tilepieces.core && tilepieces.core.currentDocument))
        return;
    var pathname = decodeURI(tilepieces.frame.contentDocument.location.pathname);
    if(!htmltext) {
      try {
        var html = await fetch(pathname);
        if(html.status != 200)
            throw html;
        htmltext = await html.text();
      }
      catch(e){
        console.error(e);
        alertDialog("impossible fetch document source",true);
        tilepieces.core && tilepieces.core.destroy();
        tilepieces.frame.removeEventListener("load",tilepieces.loadFunction);
        document.title = `${tilepieces.project ? `${tilepieces.project.name} - ` : ``}`;
        return;
      }
    }
    var resourcePathToRemove = tilepieces.frameResourcePath();
    resourcePathToRemove = resourcePathToRemove.endsWith("/") ? resourcePathToRemove : resourcePathToRemove + "/";
    pathname = pathname.replace(resourcePathToRemove,"");
    tilepieces.core = await tilepiecesCore().init(tilepieces.frame.contentDocument,htmltext);
    tilepieces.currentPage = {
        path : pathname.slice(1),
        fileText : htmltext
    };
    htmltext = "";
    var name = pathname.split("/").pop();
    tilepieces.fileSelected = Object.assign({
        mainFrameLoad:true,
        file:tilepieces.currentPage.fileText,
        name,
        ext:name.includes(".") ?
        name.split('.').pop() :
        null},tilepieces.currentPage);
    //window.dispatchEvent(new CustomEvent("file-selected",{detail:tilepieces.fileSelected}));
    window.dispatchEvent(
        new CustomEvent("html-rendered",{
                detail:{
                    htmlDocument:tilepieces.frame.contentDocument
                }
            }
        )
    );
    menuBarTrigger.classList.remove("no-frame");
    // unload seems not work
    tilepieces.frame.contentWindow.addEventListener("beforeunload",e=>{
        if(tilepieces.editMode=="selection")
            selectionTrigger.click();
        menuBarTrigger.classList.add("no-frame");
        window.dispatchEvent(new Event("frame-unload"))
    });
    if(tilepieces.project && tilepieces.project.lastFileOpened != pathname) {
        tilepieces.project.lastFileOpened = pathname;
        tilepieces.storageInterface.setSettings({ // no await
            "projectSettings": {
                "lastFileOpened": pathname
            }
        });
    }
    document.title = `${tilepieces.project ? `${tilepieces.project.name} - ` : ``}${pathname} - tilepieces`;
  };
  tilepieces.frame.addEventListener("load",tilepieces.loadFunction);
  if(tilepieces.sandboxFrame)
      tilepieces.frame.setAttribute("sandbox","allow-same-origin");
  else
      tilepieces.frame.removeAttribute("sandbox");
  tilepieces.frame.src = (tilepieces.frameResourcePath() + URL).replace(/\/\//g,"/");
  /*
  tilepieces.utils.unregisterSw()
      .catch((err) => {
          console.error(err);
      }).finally(()=>{
          tilepieces.frame.src = tilepieces.frameResourcePath + URL;
      })
  */
};

let throttleResize;
function mainFrameResizeObserver(){
    var resizeObserver = new ResizeObserver(entries => {
        clearTimeout(throttleResize);
        throttleResize = setTimeout(()=>{
            var w = entries[0].contentRect.width;
            var h = entries[0].contentRect.height;
            width.value = w;
            height.value = h;
            confrontDimensionIframeWithParent(w,h);
            tilepieces.frameContentRect = entries[0].contentRect;
            window.dispatchEvent(new CustomEvent("frame-resize",{detail:entries[0].contentRect}));
        },32);
    });
    resizeObserver.observe(tilepieces.frame);
    return resizeObserver;
}
function constraintPanelsFunction(newX,newY,deltaX,deltaY,dockObj){
    // deltaX right and deltaY down are negative
    if(
        (deltaX<0 &&
        (dockObj.leftPosition + newX + dockObj.width > window.innerWidth))
        ||
        (deltaX>0 &&
        (dockObj.leftPosition + newX < 0))
        ||
        (deltaY<0 &&
        (dockObj.topPosition + newY + dockObj.height > window.innerHeight))
        ||
        (deltaY>0 &&
        (dockObj.topPosition + newY < 48))
    )
        return true;
}
function adjustPanelWrapper(disactivateEmpty){
    var panelActives = frameUIEls.filter(v=>v.style.display == "block");
    if(window.innerWidth < 1024) {
        targetFrameWrapper.classList.toggle("half",panelActives.length || disactivateEmpty);
    }
    else{
        targetFrameWrapper.classList.remove("half");
        mobileWrapper.classList.toggle("empty",!panelActives.length && !disactivateEmpty);
    }
    dockFrame.style.width = "";
    targetFrameWrapper.style.width = "";
    dockFrame.style.height = "";
    targetFrameWrapper.style.height = "";
}
function assignFramesToMenuBar(toDock) {
    tilepieces.panels = frameUIEls.map(v=> {
        var d = panel(v,constraintPanelsFunction);
        if(toDock) {
            d.drag && d.unsetDrag();
        }
        if (v.id && v.id == "component-interface")
            tilepieces.componentInterfaceFrame = d;
        var li = document.createElement("li");
        li.textContent = v.querySelector(".panel-title").textContent;
        li.onclick = ()=>{
            adjustPanelWrapper(true);
            d.show(true);
            closeMenuBar();
        };
        windowsListEl.appendChild(li);
        return d;
    });
}
window.addEventListener("panel-os-window-close",e=>adjustPanelWrapper());
window.addEventListener("panel-close",e=>adjustPanelWrapper());
assignFramesToMenuBar(isMobile);
adjustPanelWrapper();
window.addEventListener("resize",e=>{
    if(window.innerWidth < 1024 && !isMobile) {
        tilepieces.panels.forEach(v=>v.drag && v.unsetDrag());
        isMobile = true;
    }
    else if(window.innerWidth >= 1024 && isMobile) {
        tilepieces.panels.forEach(v=>{
            !v.drag && v.setDrag()
        });
        isMobile = false;
    }
    adjustPanelWrapper();
});
let moveBar = document.getElementById("move-bar");
let moveBarX = 0, dockFrameWidth = 0, dockFrameHeight = 0,moveBarY = 0,
    mobileWrapperHeight = 0,
    mobileWrapperWidth = 0,
    moveBarActivated;
const movebardummy = document.querySelector(".move-bar-dummy");
moveBar.addEventListener("mousedown",e=>{
	moveBarActivated = true;
    dockFrameWidth = dockFrame.offsetWidth;
    dockFrameHeight = dockFrame.offsetHeight;
    mobileWrapperHeight = mobileWrapper.offsetHeight;
    mobileWrapperWidth = mobileWrapper.offsetWidth;
    moveBarX = e.clientX;
    moveBarY = e.clientY;
    targetFrameWrapper.style.userSelect="none";
    movebardummy.style.display="block";
  	document.addEventListener("mousemove",moveBarMove);
	document.addEventListener("mouseup",moveBarUp);
});
function moveBarMove(e){
    if(mobileWrapper.className.match(/left|right/)) {
        dockFrameWidth+=(moveBarX - e.clientX);
        var targetFrameWrapperWidth = mobileWrapperWidth-dockFrameWidth-4;
        if(targetFrameWrapperWidth<400 || dockFrameWidth<400)
            return;
        dockFrame.style.width = dockFrameWidth + "px";
        targetFrameWrapper.style.width = targetFrameWrapperWidth + "px";
        moveBarX = e.clientX;
    }
    else{
        dockFrameHeight+=(moveBarY - e.clientY);
        var targetFrameWrapperHeight = mobileWrapperHeight-dockFrameHeight-4;
        if(targetFrameWrapperHeight<250 || dockFrameHeight<250)
            return;
        dockFrame.style.height = dockFrameHeight + "px";
        targetFrameWrapper.style.height = targetFrameWrapperHeight+"px";
        moveBarY = e.clientY;
    }

}
function moveBarUp(e){
    moveBarActivated = false;
    movebardummy.style.display="";
    targetFrameWrapper.style.userSelect="";
  	document.removeEventListener("mousemove",moveBarMove);
	document.removeEventListener("mouseup",moveBarUp);
}
async function changeGlobalSettings(propName,propValue,set=true){
    var settings = {};
    settings[propName] = propValue;
    try {
        set && await tilepieces.storageInterface.setSettings({settings});
    }
    catch(e){
        console.error(e);
        return;
    }
    if(!tilepieces.project ||
        !tilepieces.project.hasOwnProperty(propName))
        changeSettingsInPage(propName,propValue)
}
tilepieces.changeGlobalSettings = changeGlobalSettings;
async function changeSettings(propName,propValue,set=true){
    var projectSettings = {};
    projectSettings[propName] = propValue;
    try {
        set && await tilepieces.storageInterface.setSettings({projectSettings});
    }
    catch(e){
        console.error(e);
        return;
    }
    changeSettingsInPage(propName,propValue)
}
tilepieces.changeSettings = changeSettings;
function changeSettingsInPage(propName,propValue){
    if(propName == "panelPosition")
        changePanelsPosition(propValue);
    if(propName == "sandboxFrame")
        changeSandboxAttribute(propValue);
    tilepieces[propName] = propValue
}
tilepieces.changeSettingsInPage = changeSettingsInPage;
function getSettings(){
    return new Promise((res,rej)=>{
        tilepieces.storageInterface.getSettings().
            then(response=>{
                tilepieces.projects = response.settings.projects;
                tilepieces.globalComponents = response.settings.components;
                tilepieces.globalSettings = response.settings.globalSettings;
                if(tilepieces.project)
                    updateSettings(tilepieces.project.name);
                window.dispatchEvent(new Event("settings-updated"));
                res(response.settings)
            },err=>{
                console.error("[error in reading settings]",err);
                alertDialog("error in reading settings");
                rej();
            });
    });
}
tilepieces.getSettings = getSettings;
window.addEventListener('file-deleted',data=>{
    var fileData = data.detail;
    if(tilepieces.currentPage &&
        fileData.path == tilepieces.currentPage.path)
        tilepieces.setFrame("");
    if(tilepieces.fileSelected && fileData.path == tilepieces.fileSelected.path) {
        tilepieces.fileSelected = null;
    }
});
window.addEventListener('file-renamed',data=>{
    var fileData = data.detail;
    if(tilepieces.currentPage &&
        fileData.oldPath == tilepieces.currentPage.path) {
        document.title = tilepieces.currentProject + " - " + fileData.newPath + " - tilepieces";
        tilepieces.storageInterface.setSettings({
            "projectSettings" : {
                "lastFileOpened": fileData.newPath
            }
        });
        tilepieces.setFrame("/" + fileData.newPath,fileData.file);
    }
    else if(tilepieces.fileSelected && fileData.path == tilepieces.fileSelected.path) {
        tilepieces.fileSelected = {
            ext: fileData.newName.includes(".") ?
                fileData.newName.split('.').pop() :
                null,
            file: fileData.file,
            fileText: fileData.file,
            mainFrameLoad: true,
            name: fileData.newName,
            path: fileData.path
        }
    }
});
window.addEventListener("file-selected",data=>{
    var fileData = data.detail;
    var path = fileData.path[0] != "/" ? "/"+fileData.path : fileData.path;
    if(fileData.mainFrameLoad) {
        console.log("double call, returning.", path);
        return;
    }
    tilepieces.fileSelected = fileData;
    if(fileData.ext == "html" || fileData.ext == "htm"){
        document.title = tilepieces.currentProject + " - " + fileData.path + " - tilepieces";
        tilepieces.storageInterface.setSettings({
            "projectSettings" : {
                "lastFileOpened": path
            }
        });
        tilepieces.setFrame(path,fileData.fileText);
    }
});
window.addEventListener("delete-project",async e=>{
    try {
        if (e.detail.name == tilepieces.currentProject) {
            /*
            if (tilepieces.isComponent) {
                var resultSettings = await tilepieces.storageInterface.setSettings({
                    components: {
                        remove: true,
                        array: [{
                            name: tilepieces.isComponent.name
                        }]
                    }
                });
            }*/
            tilepieces.isComponent = null;
            tilepieces.project = null;
            tilepieces.currentProject = null;
            await searchForLastProject();
        }
        else
            await getSettings();
        dialog.close();
    }
    catch (e) {
        console.error(e);
        return dialog.open(JSON.stringify(e));
    }
});
async function searchForLastProject(){
  if(!tilepieces?.storageInterface?.getSettings){
    console.error("[tilepieces] no storage interface on " + window.location.href);
    return;
  }
  dialog.open("initializing...",true);
  try {
    await getSettings();
  }
  catch(e){
    console.error(e);
    dialog.close();
    alertDialog(e.err || e.error || e.toString(),true);
    return e;
  }
  var lastProject = Array.isArray(tilepieces.projects) && tilepieces.projects[0];
  if (lastProject) {
    dialog.open("Creating Project...", true);
    try{
    var newProject = await storageInterface.create(lastProject.name);
      // this is because we can load a project. during the create, it could been associated to a component. So we need to get setting again
    await getSettings();
    dialog.close();
    window.dispatchEvent(new CustomEvent('set-project', {
        detail: newProject
    }))
    }
    catch(e){
      dialog.close();
      console.error("[error in creating project]", e);
      alertDialog("error in creating project: " + lastProject.name);
    }
  }
  else{
      tilepieces.setFrame("");
  }
}
window.addEventListener("set-project",async e=>{
    var prName = e.detail.name;
    updateSettings(prName);
    var lastFileOpened = tilepieces.project.lastFileOpened;
    var startPath = lastFileOpened || "/index.html";
    storageInterface.read(startPath)
        .then(res=>{
            var name = startPath.split("/").pop();
            tilepieces.fileSelected = {
                path:startPath,
                name,
                ext:name.includes(".") ?
                    name.split('.').pop() :
                    null,
                file:res,
                fileText:res
            };
            tilepieces.setFrame(startPath,res)
        }, err=>{
            console.error("[error in reading file index.html in current project]",err);
            tilepieces.setFrame("");
        });
    window.dispatchEvent(new Event("project-setted"));
});
function changeSandboxAttribute(propValue){
    if(propValue)
        tilepieces.frame.setAttribute("sandbox","allow-same-origin");
    else
        tilepieces.frame.removeAttribute("sandbox");
    tilepieces.frame.contentWindow.location.reload(true);
}
function changePanelsPosition(propvalue) {
    mobileWrapper.classList.remove("top", "right", "bottom", "left");
    if (propvalue != "free")
        mobileWrapper.classList.add(propvalue);
    var toSet = propvalue == "free";
    tilepieces.panels.forEach(p=> {
        if (p.drag && !toSet)
            p.unsetDrag();
        if (!p.drag && toSet)
            p.setDrag();
        if((p.panelElement.style.width || p.panelElement.style.height)){
            p.panelElement.style.width = "";
            p.panelElement.style.height = "";
            var b = p.panelElement.getBoundingClientRect();
            p.width = b.width;
            p.height = b.height;
        }
    });
    dockFrame.style.width = "";
    targetFrameWrapper.style.width = "";
    dockFrame.style.height = "";
    targetFrameWrapper.style.height = "";
}
function updateSettings(prName){
    tilepieces.currentProject = prName;
    var proj = tilepieces.projects.find(v=>v.name == tilepieces.currentProject);
    if(proj) {
        tilepieces.isComponent = proj.isComponent;
        if(tilepieces.isComponent)
            tilepieces.isComponent.path = "";
        tilepieces.localComponents = proj.components;
        tilepieces.localComponentsFlat = proj.componentsFlat;
        tilepieces.componentPath = proj.componentPath || "components";
    }
    tilepieces.project = Object.assign({},proj);
  // change settings events
  var panelPosition = tilepieces.project.panelPosition || tilepieces.globalSettings.panelPosition;
  if(panelPosition != tilepieces.panelPosition)
    changeSettingsInPage("panelPosition",panelPosition);
  var sandboxFrame = tilepieces.globalSettings.sandboxFrame;
  if(typeof tilepieces.project.sandboxFrame == "boolean")
    sandboxFrame = tilepieces.project.sandboxFrame;
  if(!!sandboxFrame != !!tilepieces.sandboxFrame)
    changeSettingsInPage("sandboxFrame",sandboxFrame);
}
tilepieces.updateSettings=updateSettings;
function blurSelection(e){
    tilepieces.highlight = null;
}
function clickSelection(e) {
    if (tilepieces.lastEditable && (e.target == tilepieces.lastEditable.el || tilepieces.lastEditable.el.contains(e.target)))
        return;
    else if(tilepieces.lastEditable) {
        tilepieces.lastEditable && tilepieces.lastEditable.destroy();
        tilepieces.lastEditable = null;
    }
    tilepieces.highlight = null;
    var target = e.target.nodeName == "HTML" && tilepieces.contenteditable ?
        e.target.ownerDocument.body :
        e.target;
    var composedPath = e.composedPath ? e.composedPath() : tilepieces.selectorObj.composedPath;
    if(target.nodeType != 1 && tilepieces.contenteditable) {
        target = target.parentNode;
        composedPath = composedPath.slice(1);
    }
    var match = tilepieces.core.htmlMatch.find(target);
    if(tilepieces.multiselected &&
        (target.tagName.match(/HTML|HEAD|BODY/) ||
        !match ||
        tilepieces.multiselections.find(n=>n.el.contains(target) || target.contains(n.el)))){
        console.warn("no match or HTML|HEAD|BODY or el already in multiselection element during multiselection.exit",target);
        return;
    }
    tilepieces.core.selectElement(target,match,composedPath);
    if(tilepieces.contenteditable && match.HTML && match.match &&
        !composedPath.find(v=>v.tagName && v.tagName.match(tilepieces.utils.notEditableTags))){
        tilepieces.core.contenteditable(target);
    }
}
function highlight(e){
    if(tilepieces.lastEditable && tilepieces.lastEditable.el.contains(e.target))
        return;
    tilepieces.highlight = e.target;
}
document.addEventListener("pointerdown",e=>{
    var target = e.target;
    if(!target.classList.contains("highlight-selection"))
        return;
    if(tilepieces.multiselected){
        var index = !target.classList.contains("highlight-selection-clone") ?
            tilepieces.multiselections.findIndex(v=>v.el == tilepieces.elementSelected) :
            tilepieces.multiselections.findIndex(v=>v.highlight == e.target);
        console.warn("index multiselected",index);
        tilepieces.removeItemSelected(index);
    }
    else
        tilepieces.core.deselectElement(e.target);
});
function preventDropOnEdit(e){
    e.dataTransfer.effectAllowed = "none";
    e.dataTransfer.dropEffect = "none";
    e.preventDefault();
}
function preventUp(e){
    e.stopPropagation();
    e.preventDefault();
}
function resize(e){
    tilepieces.highlight = null;
}
menuTrigger.addEventListener("click",e=>{
    var t = menuTrigger.classList.toggle("opened");
    if(t) {
        menuBar.style.display="block";
    }
    else{
        menuBar.style.display="none";
    }
});
menuBar.addEventListener("click",e=>{
    var menuLevel1Trigger = e.target.closest(".menu-level-1-trigger");
    if(menuLevel1Trigger){
        e.preventDefault();
        menuLevel1Trigger.parentNode.classList.toggle("open");
    }
});
function closeMenuBar(){
    menuTrigger.classList.remove("opened");
    menuBar.style.display="none";
    menuBar.children[0].classList.remove("open");
    [...menuBar.querySelectorAll("li.open")].forEach(v=>v.classList.remove("open"));
}
document.addEventListener("click",e=>{
    if(!menuBar.contains(e.target) &&
      e.target!=menuTrigger &&
      !menuTrigger.contains(e.target)) closeMenuBar()
});
window.addEventListener("blur",closeMenuBar);
function confrontDimensionIframeWithParent(w,h){
    if(w > tilepieces.frame.parentNode.offsetWidth)
        tilepieces.frame.parentNode.style.overflowX = "scroll";
    else
        tilepieces.frame.parentNode.style.overflowX = "";
    if(h > tilepieces.frame.parentNode.offsetHeight)
        tilepieces.frame.parentNode.style.overflowY = "scroll";
    else
        tilepieces.frame.parentNode.style.overflowY = "";
    if(w==tilepieces.frame.parentNode.offsetWidth &&
        h==tilepieces.frame.parentNode.offsetHeight)
        fitToScreen.classList.add("fit-to-screen");
    else
        fitToScreen.classList.remove("fit-to-screen");

    var dimensions = selectScreenDimensions.value.split("x");
    if( dimensions[0] != w || dimensions[1] != h)
        selectScreenDimensions.value="";
}
width.addEventListener("change",e=>{
    var value=e.target.value;
    tilepieces.frame.style.width=value+"px";
    confrontDimensionIframeWithParent(+value,+height.value);
});
height.addEventListener("change",e=>{
    var value=e.target.value;
    tilepieces.frame.style.height=value+"px";
    confrontDimensionIframeWithParent(+width.value,+value);
});
fitToScreen.addEventListener("click",e=>{
    tilepieces.frame.style.width="";
    tilepieces.frame.style.height="";
    tilepieces.frame.parentNode.style.overflowY = "";
    tilepieces.frame.parentNode.style.overflowX = "";
});
reverse.addEventListener("click",e=>{
    tilepieces.frame.style.width = height.value+"px";
    tilepieces.frame.style.height = width.value+"px";
    confrontDimensionIframeWithParent(+width.value,+height.value);
});
selectScreenDimensions.addEventListener("change",e=>{
    var dimensions = selectScreenDimensions.value.split("x");
    var w = dimensions[0];
    var h = dimensions[1];
    tilepieces.frame.style.width = w+"px";
    tilepieces.frame.style.height = h+"px";
    confrontDimensionIframeWithParent(+w,+h);
});
let resizeObserver = mainFrameResizeObserver();
window.addEventListener("resize",()=>{
    confrontDimensionIframeWithParent(+width.value,+height.value);
});

screenDimensionsTrigger.addEventListener("click",e=>{
    var t = screenDimensionsTrigger.classList.toggle("opened");
    if(t) {
        screenDimensionsEl.style.display="block";
        mobileWrapper.style.height = `calc(100% - ${menuBarTrigger.offsetHeight}px - ${screenDimensionsEl.offsetHeight}px)`
    }
    else{
        screenDimensionsEl.style.display="none";
        mobileWrapper.style.height = ``
    }
});
selectionTrigger.addEventListener("click",e=>{
    var toggle = selectionTrigger.classList.toggle("opened");
    if(toggle) {
        tilepieces.editMode = "selection";
        tilepieces.core.setSelection();
        tilepieces.core.currentDocument.addEventListener("mousemove", highlight);
        tilepieces.core.currentDocument.addEventListener("pointerdown", clickSelection);
        tilepieces.core.currentDocument.addEventListener("click", preventUp,true);
        tilepieces.core.currentDocument.addEventListener("mouseout", blurSelection);
        tilepieces.core.currentWindow.addEventListener("resize", resize);
        tilepieces.core.currentWindow.addEventListener("scroll", resize);
        tilepieces.core.currentWindow.addEventListener("dragover", preventDropOnEdit);
        tilepieces.core.currentWindow.addEventListener("drop", preventDropOnEdit);
    }
    else{
        tilepieces.editMode = "";
        if(tilepieces.elementSelected)
            tilepieces.core.deselectElement();
        if(tilepieces.multiselected)
            tilepieces.destroyMultiselection();
        if(tilepieces.lastEditable) {
            tilepieces.lastEditable.destroy();
            tilepieces.lastEditable = null;
        }
        tilepieces.contenteditable = false;
        tilepieces.core.removeSelection();
        tilepieces.core.currentDocument.removeEventListener("mousemove", highlight);
        tilepieces.core.currentDocument.removeEventListener("pointerdown", clickSelection);
        tilepieces.core.currentDocument.removeEventListener("mouseout", blurSelection);
        tilepieces.core.currentDocument.removeEventListener("click", preventUp,true);
        tilepieces.core.currentWindow.removeEventListener("resize", resize);
        tilepieces.core.currentWindow.removeEventListener("scroll", resize);
        tilepieces.core.currentWindow.removeEventListener("dragover", preventDropOnEdit);
        tilepieces.core.currentWindow.removeEventListener("drop", preventDropOnEdit);
        if(contenteditableTrigger.classList.contains("opened"))
            contenteditableTrigger.click();
    }
    window.dispatchEvent(new Event("edit-mode"))
});
contenteditableTrigger.addEventListener("click",e=>{
    var toggle = contenteditableTrigger.classList.toggle("opened");
    if(toggle) {
        if(tilepieces.editMode!="selection")
            selectionTrigger.click();
        tilepieces.contenteditable = true;
        if(tilepieces.elementSelected) {
            tilepieces.editElements.selection.style.transform = "translate(-9999px,-9999px)";
            clickSelection({target: tilepieces.elementSelected})
        }
        window.dispatchEvent(new Event("content-editable-start"));
    }
    else{
        tilepieces.contenteditable = false;
        if(tilepieces.lastEditable) {
            tilepieces.lastEditable.destroy();
            tilepieces.lastEditable = null;
        }
        window.dispatchEvent(new Event("content-editable-end"));
    }
});

window.addEventListener("onContentEditablePasteImage",async e=>{
    var target = e.detail.target;
    var imageUrl = await tilepieces.utils.processFile(e.detail.file);
    var image = target.getRootNode().createElement("img");
    image.onload = ()=>{
        target.dispatchEvent(new KeyboardEvent("input", {bubbles : true}));
        window.dispatchEvent(new Event("WYSIWYG-modify"))
    };
    var sel, range;
    image.src = imageUrl;
    sel = target.ownerDocument.defaultView.getSelection();
    range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(image);
});
function preventDrop(doc) {
    doc.addEventListener("dragenter", function (e) {
        if (!e.target.closest("[data-dropzone],.highlight-selection")) {
            e.preventDefault();
            e.dataTransfer.effectAllowed = "none";
            e.dataTransfer.dropEffect = "none";
        }
    }, false);

    doc.addEventListener("dragover", function (e) {
        if (!e.target.closest("[data-dropzone],.highlight-selection")) {
            e.preventDefault();
            e.dataTransfer.effectAllowed = "none";
            e.dataTransfer.dropEffect = "none";
        }
    });

    doc.addEventListener("drop", function (e) {
        if (!e.target.closest("[data-dropzone],.highlight-selection")) {
            e.preventDefault();
            e.dataTransfer.effectAllowed = "none";
            e.dataTransfer.dropEffect = "none";
        }
    });
}
preventDrop(window);
window.addEventListener("panel-created-iframe",e=>{
    var frame = e.detail;
    preventDrop(frame.contentWindow);
});
function dialogNameResolver(file,ext){
    return new Promise((resolve,reject)=>{
        promptDialog({
            label : "Insert file ." + ext + " name:",
            buttonName : "CREATE",
            checkOnSubmit:true,
            patternFunction : (value,target)=>{
                value = value.trim();
                return !value.match(/[()\/><?:%*"|\\]+/);
            },
            patternExpl : "file name cannot contain /\\?%*:|\"<> characters"
        });
        window.addEventListener("prompt-dialog-submit",(prompte=>{
            dialog.open("processing file...", true);
            tilepieces.utils.processFile(file,tilepieces.miscDir + "/" + prompte.detail.value + "." + ext)
                .then(filepath=>{
                    dialog.close();
                    resolve(filepath)
                },err=>reject(err));
        }),{once:true});
    });
}
document.addEventListener("drop", async function (e) {
    var t = e.target;
    if (!t.classList.contains("highlight-selection"))
        return;
    e.preventDefault();
    var dt = t.__target;
    var files = e.dataTransfer.files;
  	var videoTag = dt.closest("video");
    if(files) {
        var file = files[0];
        var type = file.type;
        var name = file.name;
        var ext = name.split(".").pop();
        if(type.startsWith("image/") && dt.tagName == "IMG") {
            try {
                var filepath = await dialogNameResolver(file,ext);
                tilepieces.core.htmlMatch.setAttribute(dt, "src", filepath);
            }
            catch(e){
                console.error(e);
            }
        }
        if(type.startsWith("video/") && videoTag) {
            try {
                var filepath = await dialogNameResolver(file,ext);
                var source = videoTag.querySelector("source[type='" + type + "'");
                if(!source){
                    source = videoTag.getRootNode().createElement("source");
                    source.type = type;
                    tilepieces.core.htmlMatch.append(videoTag,source);
                }
                tilepieces.core.htmlMatch.setAttribute(source, "src", filepath);
                videoTag.load();
            }
            catch(e){
                console.error(e);
                dialog.close();
            }
        }
    }
});
document.addEventListener("dragover", function (e) {
    e.preventDefault();
});
document.addEventListener("dragenter", function (e) {
    e.preventDefault();
},false);
document.addEventListener("paste",async e=>{
    if (!tilepieces.elementSelected)
        return;
    /*
    if(!tilepieces.core.currentDocument.hasFocus())
        return;*/
    e.preventDefault();
    var dt = tilepieces.elementSelected;
    var clipboardData = e.clipboardData;
    if (clipboardData && clipboardData.getData) {
        var file = clipboardData.files[0];
        if(!file)
            return;
        var name = file.name;
        var ext = name.split(".").pop();
        if(!file) return;
        if(file.type.startsWith("image/") && dt.tagName == "IMG") {
            try {
                var filepath = await dialogNameResolver(file, ext);
                tilepieces.core.htmlMatch.setAttribute(dt, "src", filepath);
            }
            catch(e){
                console.error(e);
                dialog.close();
            }
        }
    }
},true);
