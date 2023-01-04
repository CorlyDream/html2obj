
const fs = require('fs');
const path = require('path');
const Html2Obj = require("../src/html2obj");


test("tet html_p2.html", () => {
    const filepath = path.resolve(__dirname, 'html_files/html_p6.html')
    const htmlData = fs.readFileSync(filepath, "utf8")
    
    var dom = new Html2Obj().parseHtml(htmlData)[0]

    let title = dom.extractById('activity-name')
    let gongzhonghaoName = dom.extractById('js_name')
    let jsContentNode = dom.extractById('js_content')
    expect(title.toText()).toBe("党的二十大报告100题")
    expect(gongzhonghaoName.toText()).toBe("插本政治通")
    expect(jsContentNode.toText().length).toBe(5998)
})