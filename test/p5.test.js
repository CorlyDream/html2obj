
const fs = require('fs');
const path = require('path');
const Html2Obj = require("../src/html2obj");


test("test html_p5.html", () => {
    const filepath = path.resolve(__dirname, 'html_files/html_p5.html')
    const htmlData = fs.readFileSync(filepath, "utf8")
    
    var dom = new Html2Obj().parseHtml(htmlData)[0]

    let titleNodes = []
    dom.extractByTag("title", titleNodes)
    expect(titleNodes.length).toBe(1)

    let titleClassNodes = []
    dom.extractByClass("art_tit_h1", titleClassNodes)
    expect(titleClassNodes.length).toBe(1)

    expect(titleNodes[0].toText()).toBe(titleClassNodes[0].toText())

    let contentNode = []
    dom.extractByClass("art_content", contentNode)
    expect(contentNode.length).toBe(1)
})