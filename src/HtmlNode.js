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
    addChild(...nodes) {
        this.child.push(...nodes);
    }
    addAttrs(attrs) {
        if (!attrs) {
            return
        }
        this.attrs = attrs
    }
    /**
     * 
     * @param {Array} remainAttrs 可以为空，表示保留所有，非空时，表示只保留这些属性
     * @returns 
     */
    toHtml(includeAttrs, execludeAttrs) {
        if (this.tagName[0] == '#') {
            if (this.tagName != '#text') {
                return ''
            }
            return this.child[0]
        }
        let html = `<${this.tagName}`
        for (const key in this.attrs) {
            if (includeAttrs && includeAttrs.length > 0 && includeAttrs.indexOf(key) == -1) {
                continue
            }
            if (execludeAttrs && execludeAttrs.length > 0 && execludeAttrs.indexOf(key) > -1) {
                continue
            }
            let val = this.attrs[key]
            html += ` ${key}="${val}"`
        }
        if (util.unpairedTags.indexOf(this.tagName) != -1 && this.child.length == 0) {
            html += '/>'
            return html
        }
        html += '>'
        for (let item of this.child) {
            html += item.toHtml(includeAttrs, execludeAttrs)
        }
        html += `</${this.tagName}>`
        return html
    }
    toText() {
        if (this.tagName[0] == '#') {
            if (this.tagName != '#text') {
                return ''
            }
            return this.child[0]
        }
        let text = ''
        for (let item of this.child) {
            text += item.toText()
        }
        return text;
    }
    /**
     * 通过id 
     * @param {String} id 
     * @returns {HtmlNode}
     */
    extractById(id) {
        if (this.attrs['id'] && this.attrs['id'] == id) {
            return this
        }
        for (let item of this.child) {
            if (!(item instanceof HtmlNode)) {
                continue
            }
            let node = item.extractById(id)
            if (node) {
                return node
            }
        }
    }
    /**
     * 通过抽取标签 Node
     * @param {String} tagName 
     * @param {HtmlNode[]} resultArray 
     * @returns 
     */
    extractByTag(tagName, resultArray) {
        if (this.tagName == tagName) {
            resultArray.push(this)
        }
        for (let item of this.child) {
            if (!(item instanceof HtmlNode)) {
                continue
            }
            item.extractByTag(tagName, resultArray)
        }
    }
    /**
     * 匹配包含此 className 的节点
     * @param {String} className 
     * @param {HtmlNode[]} resultArray 
     */
    extractByClass(className, resultArray) {
        const classStr = this.attrs['class']
        if (classStr && classStr.includes(className)) {
            resultArray.push(this)
        }
        for (let item of this.child) {
            if (!(item instanceof HtmlNode)) {
                continue
            }
            item.extractByClass(className, resultArray)
        }
    }
    /**
     * 匹配包含此 property 的节点
     * @param {String} propertyName 
     * @param {String} propertyValue 
     * @param {HtmlNode[]} resultArray 
     */
    extractByProperty(propertyName, propertyValue, resultArray) {
        const pValue = this.attrs[propertyName]
        if (pValue && pValue.includes(propertyValue)) {
            resultArray.push(this)
        }
        for (let item of this.child) {
            if (!(item instanceof HtmlNode)) {
                continue
            }
            item.extractByProperty(propertyName, propertyValue, resultArray)
        }
    }
}


module.exports = HtmlNode;