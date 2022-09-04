'use strict';

const util = require('./util');
const HtmlNode = require('./HtmlNode');
const readDocType = require("./DocTypeReader");


const defaultOptions = {
  stopNodes: [ "*.script", "*.video", "*.style"],
  unpairedTags: util.unpairedTags,
  processEntities: true,
  trimValues: true,
  allowBooleanAttributes: true,
  htmlEntities: true,
  processComment: false,
  commentPropName: "#comment",
  attributeNamePrefix: '',
  textNodeName: '#text',
  tagValueProcessor: function (tagName, val) {
    return val;
  },
  attributeValueProcessor: function (attrName, val) {
    return val;
  },
  nodePostProcessor: false,
  transformTagName: false
}

const buildOptions = function (options) {
  return Object.assign({}, defaultOptions, options);
}

class Html2Obj {
  constructor(options) {
    this.options = buildOptions(options);
    this.currentNode = null;
    this.tagsNodeStack = [];
    this.docTypeEntities = {};
    this.lastEntities = {
      "amp": { regex: /&(amp|#38|#x26);/g, val: "&" },
      "apos": { regex: /&(apos|#39|#x27);/g, val: "'" },
      "gt": { regex: /&(gt|#62|#x3E);/g, val: ">" },
      "lt": { regex: /&(lt|#60|#x3C);/g, val: "<" },
      "quot": { regex: /&(quot|#34|#x22);/g, val: "\"" },
    };
    this.htmlEntities = {
      "space": { regex: /&(nbsp|#160);/g, val: " " },
      "lt" : { regex: /&(lt|#60);/g, val: "<" },
      "gt" : { regex: /&(gt|#62);/g, val: ">" },
      "amp" : { regex: /&(amp|#38);/g, val: "&" },
      "quot" : { regex: /&(quot|#34);/g, val: "\"" },
      "apos" : { regex: /&(apos|#39);/g, val: "'" },
      "cent": { regex: /&(cent|#162);/g, val: "¢" },
      "pound": { regex: /&(pound|#163);/g, val: "£" },
      "yen": { regex: /&(yen|#165);/g, val: "¥" },
      "euro": { regex: /&(euro|#8364);/g, val: "€" },
      "copyright": { regex: /&(copy|#169);/g, val: "©" },
      "reg": { regex: /&(reg|#174);/g, val: "®" },
      "inr": { regex: /&(inr|#8377);/g, val: "₹" },
    };
    this.addExternalEntities = addExternalEntities;
    this.parseHtml = parseHtml;
    this.parseTextData = parseTextData;
    this.buildAttributesMap = buildAttributesMap;
    this.isItStopNode = isItStopNode;
    this.replaceEntitiesValue = replaceEntitiesValue;
    this.readStopNodeData = readStopNodeData;
    this.saveTextToParentTag = saveTextToParentTag;
  }

}

function addExternalEntities(externalEntities) {
  const entKeys = Object.keys(externalEntities);
  for (let i = 0; i < entKeys.length; i++) {
    const ent = entKeys[i];
    this.lastEntities[ent] = {
      regex: new RegExp("&" + ent + ";", "g"),
      val: externalEntities[ent]
    }
  }
}

/**
 * @param {string} val
 * @param {string} tagName
 * @param {string} jPath
 * @param {boolean} dontTrim
 * @param {boolean} escapeEntities
 */
function parseTextData(val, tagName, jPath, dontTrim, escapeEntities) {
  if (val !== undefined) {
    if (this.options.trimValues && !dontTrim) {
      val = val.trim();
    }
    if (val.length > 0) {
      if (!escapeEntities) val = this.replaceEntitiesValue(val);

      const newval = this.options.tagValueProcessor(tagName, val, jPath);
      if (newval === null || newval === undefined) {
        //don't parse
        return val;
      } else if (typeof newval !== typeof val || newval !== val) {
        //overwrite
        return newval;
      } else if (this.options.trimValues) {
        return parseValue(val);
      } else {
        const trimmedVal = val.trim();
        if (trimmedVal === val) {
          return parseValue(val);
        } else {
          return val;
        }
      }
    }
  }
}


// 匹配属性正则
const attrsRegx = new RegExp('([^\\s=]+)\\s*(=\\s*([\'"])([\\s\\S]*?)\\3)?', 'gm');

function buildAttributesMap(attrStr, jPath) {
  if (!this.options.ignoreAttributes && typeof attrStr === 'string') {

    const matches = util.getAllMatches(attrStr, attrsRegx);
    const len = matches.length; //don't make it inline
    const attrs = {};
    for (let i = 0; i < len; i++) {
      const attrName = matches[i][1]
      let oldVal = matches[i][4];
      const aName = this.options.attributeNamePrefix + attrName;
      if (attrName.length) {
        if (oldVal !== undefined) {
          if (this.options.trimValues) {
            oldVal = oldVal.trim();
          }
          oldVal = this.replaceEntitiesValue(oldVal);
          const newVal = this.options.attributeValueProcessor(attrName, oldVal, jPath);
          if (newVal === null || newVal === undefined) {
            //don't parse
            attrs[aName] = oldVal;
          } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
            //overwrite
            attrs[aName] = newVal;
          } else {
            //parse
            attrs[aName] = parseValue(oldVal);
          }
        } else if (this.options.allowBooleanAttributes) {
          attrs[aName] = true;
        }
      }
    }
    if (!Object.keys(attrs).length) {
      return;
    }
    if (this.options.attributesGroupName) {
      const attrCollection = {};
      attrCollection[this.options.attributesGroupName] = attrs;
      return attrCollection;
    }
    return attrs;
  }
}

const parseHtml = function (htmlData) {
  htmlData = htmlData.replace(/\r\n?/g, "\n");
  const rootNode = new HtmlNode('!root');
  let currentNode = rootNode;
  let textData = "";
  let jPath = "";
  for (let i = 0; i < htmlData.length; i++) {//for each char in html data
    const ch = htmlData[i];
    if (ch === '<') {
      if (htmlData[i + 1] === '/') {//Closing Tag
        const closeIndex = findClosingIndex(htmlData, ">", i, "Closing Tag is not closed.")
        let tagName = htmlData.substring(i + 2, closeIndex).trim();

        if (this.options.transformTagName) {
          tagName = this.options.transformTagName(tagName);
        }

        if (currentNode) {
          textData = this.saveTextToParentTag(textData, currentNode, jPath);
          if(tagName != currentNode.tagName){
            console.error("html2obj tagName not pair", i, currentNode.tagName)
          }
        }

        currentNode = this.tagsNodeStack.pop();
        jPath = jPath.substring(0, jPath.lastIndexOf("."));

        textData = "";
        i = closeIndex;
      } else if (htmlData[i + 1] === '?') {
        throw new Error("不支持标签 ? " + i)
      } else if (htmlData.substr(i + 1, 3) === '!--') {
        const endIndex = findClosingIndex(htmlData, "-->", i + 4, "Comment is not closed.")
        if (this.options.processComment) {
          const comment = htmlData.substring(i + 4, endIndex - 2);

          textData = this.saveTextToParentTag(textData, currentNode, jPath);
          currentNode.add(this.options.commentPropName, comment);
        }
        i = endIndex;
      } else if (htmlData.substr(i + 1, 2) === '!D') {
        const result = readDocType(htmlData, i);
        this.docTypeEntities = result.entities;
        i = result.i;
      } else if (htmlData.substr(i + 1, 2) === '![') {
        const closeIndex = findClosingIndex(htmlData, "]]>", i, "CDATA is not closed.") - 2;
        const tagExp = htmlData.substring(i + 9, closeIndex);

        textData = this.saveTextToParentTag(textData, currentNode, jPath);

        //cdata should be set even if it is 0 length string
        if (this.options.cdataPropName) {
          // let val = this.parseTextData(tagExp, this.options.cdataPropName, jPath + "." + this.options.cdataPropName, true, false, true);
          // if(!val) val = "";
          currentNode.add(this.options.cdataPropName, [{ [this.options.textNodeName]: tagExp }]);
        } else {
          let val = this.parseTextData(tagExp, currentNode.tagName, jPath, true, true);
          if (val == undefined) val = "";
          currentNode.add(this.options.textNodeName, val);
        }

        i = closeIndex + 2;
      } else {//Opening tag
        let result = readTagExp(htmlData, i);
        let tagName = result.tagName;
        let tagExp = result.tagExp;
        let attrExpPresent = result.attrExpPresent;
        let closeIndex = result.closeIndex;

        if (this.options.transformTagName) {
          tagName = this.options.transformTagName(tagName);
        }

        //save text as child node
        if (currentNode && textData) {
          //when nested tag is found
          textData = this.saveTextToParentTag(textData, currentNode, jPath);
        }

        jPath += jPath ? "." + tagName : tagName;

        if (this.isItStopNode(this.options.stopNodes, jPath, tagName)) {
          let tagContent = "";
          //self-closing tag
          if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
            i = result.closeIndex;
          }
          //boolean tag
          else if (this.options.unpairedTags.indexOf(tagName) !== -1) {
            i = result.closeIndex;
          } else {  //normal tag
            //read until closing tag is found
            const result = this.readStopNodeData(htmlData, tagName, closeIndex + 1);
            if (!result) {
                throw new Error(`Unexpected end of ${tagName}`);
            }
            i = result.i;
            tagContent = result.tagContent;
          }

          const childNode = new HtmlNode(tagName);
          if (tagName !== tagExp && attrExpPresent) {
            childNode.addAttrs(this.buildAttributesMap(tagExp, jPath));
          }
          if (tagContent) {
            tagContent = this.parseTextData(tagContent, tagName, jPath, true, true);
          }

          jPath = jPath.substring(0, jPath.lastIndexOf("."));
          if(tagContent){
            childNode.add(this.options.textNodeName, tagContent);
          }

          currentNode.addChild(childNode);
          if(this.options.nodePostProcessor){
            this.options.nodePostProcessor(childNode)
          }
        } else {
          //selfClosing tag
          if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
            if (tagName[tagName.length - 1] === "/") { //remove trailing '/'
              tagName = tagName.substring(0, tagName.length - 1);
              tagExp = tagName;
            } else {
              tagExp = tagExp.substring(0, tagExp.length - 1);
            }

            if (this.options.transformTagName) {
              tagName = this.options.transformTagName(tagName);
            }

            const childNode = new HtmlNode(tagName);
            if (tagName !== tagExp && attrExpPresent) {
              childNode.addAttrs(this.buildAttributesMap(tagExp, jPath));
            }
            jPath = jPath.substring(0, jPath.lastIndexOf("."));
            currentNode.addChild(childNode);
            if(this.options.nodePostProcessor){
              this.options.nodePostProcessor(childNode)
            }
          } else { //opening tag
            const childNode = new HtmlNode(tagName);

            if (tagName !== tagExp && attrExpPresent) {
              childNode.addAttrs(this.buildAttributesMap(tagExp, jPath));
            }
            currentNode.addChild(childNode);
            if(this.options.nodePostProcessor){
              this.options.nodePostProcessor(childNode)
            }
            this.tagsNodeStack.push(currentNode);
            currentNode = childNode;
          }
          textData = "";
          i = closeIndex;

        }
        //check if last tag was unpaired tag
        if (currentNode && this.options.unpairedTags.indexOf(currentNode.tagName) !== -1) {
          currentNode = this.tagsNodeStack.pop();
          jPath = jPath.substring(0, jPath.lastIndexOf('.'))
        }
      }
    } else {
      textData += htmlData[i];
    }
  }
  return rootNode.child;
}

const replaceEntitiesValue = function (val) {
  if (this.options.processEntities) {
    for (let entityName in this.docTypeEntities) {
      const entity = this.docTypeEntities[entityName];
      val = val.replace(entity.regx, entity.val);
    }
    for (let entityName in this.lastEntities) {
      const entity = this.lastEntities[entityName];
      val = val.replace(entity.regex, entity.val);
    }
    if (this.options.htmlEntities) {
      for (let entityName in this.htmlEntities) {
        const entity = this.htmlEntities[entityName];
        val = val.replace(entity.regex, entity.val);
      }
    }
  }
  return val;
}
function saveTextToParentTag(textData, currentNode, jPath) {
  if (textData) { //store previously collected data as textNode

    textData = this.parseTextData(textData,
      currentNode.tagName,
      jPath,
      false);

    if (textData !== undefined && textData !== "")
      currentNode.add(this.options.textNodeName, textData);
    textData = "";
  }
  return textData;
}

//TODO: use jPath to simplify the logic
/**
 * 
 * @param {string[]} stopNodes 
 * @param {string} jPath
 * @param {string} currentTagName 
 */
function isItStopNode(stopNodes, jPath, currentTagName) {
  const allNodesExp = "*." + currentTagName;
  for (const stopNodePath in stopNodes) {
    const stopNodeExp = stopNodes[stopNodePath];
    if (allNodesExp === stopNodeExp || jPath === stopNodeExp) return true;
  }
  return false;
}

/**
 * Returns the tag Expression and where it is ending handling single-dobule quotes situation
 * @param {string} htmlData 
 * @param {number} i starting index
 * @returns 
 */
function tagExpWithClosingIndex(htmlData, i, closingChar = ">") {
  let attrBoundary;
  let tagExp = "";
  for (let index = i; index < htmlData.length; index++) {
    let ch = htmlData[index];
    if (attrBoundary) {
      if (ch === attrBoundary) attrBoundary = "";//reset
    } else if (ch === '"' || ch === "'") {
      attrBoundary = ch;
    } else if (ch === closingChar[0]) {
      if (closingChar[1]) {
        if (htmlData[index + 1] === closingChar[1]) {
          return {
            data: tagExp,
            index: index
          }
        }
      } else {
        return {
          data: tagExp,
          index: index
        }
      }
    } else if (ch === '\t') {
      ch = " "
    }
    tagExp += ch;
  }
}

function findClosingIndex(htmlData, str, i, errMsg) {
  const closingIndex = htmlData.indexOf(str, i);
  if (closingIndex === -1) {
    throw new Error(errMsg)
  } else {
    return closingIndex + str.length - 1;
  }
}

function readTagExp(htmlData, i, closingChar = ">") {
  const result = tagExpWithClosingIndex(htmlData, i + 1, closingChar);
  if (!result) return;
  let tagExp = result.data;
  const closeIndex = result.index;
  const separatorIndex = tagExp.search(/\s/);
  let tagName = tagExp;
  let attrExpPresent = true;
  if (separatorIndex !== -1) {//separate tag name and attributes expression
    tagName = tagExp.substr(0, separatorIndex).replace(/\s\s*$/, '');
    tagExp = tagExp.substr(separatorIndex + 1);
  }


  return {
    tagName: tagName,
    tagExp: tagExp,
    closeIndex: closeIndex,
    attrExpPresent: attrExpPresent,
  }
}
/**
 * find paired tag for a stop node
 * @param {string} htmlData 
 * @param {string} tagName 
 * @param {number} i 
 */
function readStopNodeData(htmlData, tagName, i) {
  const startIndex = i;
  // Starting at 1 since we already have an open tag
  let openTagCount = 1;

  for (; i < htmlData.length; i++) {
    if (htmlData[i] === "<") {
      if (htmlData[i + 1] === "/") {//close tag
        const closeIndex = findClosingIndex(htmlData, ">", i, `${tagName} is not closed`);
        let closeTagName = htmlData.substring(i + 2, closeIndex).trim();
        if (closeTagName === tagName) {
          openTagCount--;
          if (openTagCount === 0) {
            return {
              tagContent: htmlData.substring(startIndex, i),
              i: closeIndex
            }
          }
        }
        i = closeIndex;
      } 
    }
  }//end for loop
}

function parseValue(val) {
  if (util.isExist(val)) {
    return val;
  } else {
    return '';
  }
}


module.exports = Html2Obj;
