
const fs = require('fs');
const path = require('path');
const Html2Obj = require("../src/html2obj");

function baseTest(file, title, gongzhonghaoName, contentLength){
    const filepath = path.resolve(__dirname, `html_files/weixin/${file}`)
    const htmlData = fs.readFileSync(filepath, "utf8")
    
    var dom = new Html2Obj().parseHtml(htmlData)[0]

    let titleNode = dom.extractById('activity-name')
    let gongzhonghaoNameNode = dom.extractById('js_name')
    let jsContentNode = dom.extractById('js_content')
    expect(titleNode.toText()).toBe(title)
    expect(gongzhonghaoNameNode.toText()).toBe(gongzhonghaoName)
    expect(jsContentNode.toText().length).toBe(contentLength)
}

test("test weixin_p1.html", () => {
    baseTest("weixin_p1.html", "量子理论中的哲学问题", "哲学园", 20366)
})

test("test weixin_p2.html", () => {
    baseTest("weixin_p2.html", "党的二十大报告100题", "插本政治通", 5998)
})