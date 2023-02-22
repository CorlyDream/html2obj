
const fs = require('fs');
const path = require('path');
const Html2Obj = require("../src/html2obj");
const contentRegx = /window\.desc\s*=\s*(.*);\n/ig

function baseTest(file, title, gongzhonghaoName, contentLength) {
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
// 公众号图片格式
function baseTestPhoto(file, title, gongzhonghaoName, contentLength) {
    const filepath = path.resolve(__dirname, `html_files/weixin/${file}`)
    const htmlData = fs.readFileSync(filepath, "utf8")

    var dom = new Html2Obj().parseHtml(htmlData)[0]
    var titleNodes = []
    dom.extractByProperty('property', 'og:title', titleNodes)
    var titleNode = titleNodes[0]
    var gongzhonghaoNameNodes = []
    dom.extractByClass('account_nickname_inner', gongzhonghaoNameNodes)
    var gongzhonghaoNameNode = gongzhonghaoNameNodes[0]
    expect(titleNode.attrs['content']).toBe(title)
    expect(gongzhonghaoNameNode.toText()).toBe(gongzhonghaoName)
    // 解析 content
    const contentMatch = contentRegx.exec(htmlData)
    const content = eval(contentMatch[1])
    expect(content.length).toBe(contentLength)
}

test("test weixin_p1.html", () => {
    baseTest("weixin_p1.html", "量子理论中的哲学问题", "哲学园", 20366)
})

test("test weixin_p2.html", () => {
    baseTest("weixin_p2.html", "党的二十大报告100题", "插本政治通", 5998)
})

test("test weixinp3.html", () => {
    baseTestPhoto("weixin_p3.html", "先洪水，后猛兽", "老钱日日谈", 398)
})