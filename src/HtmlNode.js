'use strict';
const util = require('./util');

class HtmlNode {
  constructor(tagName) {
    this.tagName = tagName;
    this.child = []; // 子节点
    this.attrs = {}; //attributes map
  }
  add(key, val) {
    var node = new HtmlNode(key)
    node.addChild(val)
    this.child.push(node);
  }
  addChild(node) {
    this.child.push(node);
  }
  addAttrs(attrs){
    if(!attrs){
      return
    }
    this.attrs = attrs
  }
  toHtml(){
    if(this.tagName[0] == '#'){
      if(this.tagName != '#text'){
        return ''
      }
      return this.child[0]
    }
    let html = `<${this.tagName}`
    for(const key in this.attrs){
      let val = this.attrs[key]
      html += ` ${key}="${val}"`
    }
    if(util.unpairedTags.indexOf(this.tagName) != -1 && this.child.length == 0){
      html += '/>'
      return html
    }
    html += '>'
    for(let item of this.child){
      html+=item.toHtml()
    }
    html += `</${this.tagName}>`
    return html
  }
  toText(){
    if(this.tagName[0] == '#'){
      if(this.tagName != '#text'){
        return ''
      }
      return this.child[0]
    }
    let text = ''
    for(let item of this.child){
      text += item.toText()
    }
    return text;
  }
  extractById(id){

    if(this.attrs['id'] && this.attrs['id'] == id){
      return this
    }
    for(let item of this.child){
      if(!(item instanceof HtmlNode)){
        continue
      }
      let node = item.extractById(id)
      if(node){
        return node
      }
    }
  }
};


module.exports = HtmlNode;