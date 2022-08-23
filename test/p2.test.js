
const fs = require('fs');
const path = require('path');
const Html2Obj = require("../src/html2obj");


test("tet html_p2.html", () => {
    const filepath = path.resolve(__dirname, 'html_files/html_p2.html')
    const htmlData = fs.readFileSync(filepath, "utf8")
    
    var dom = new Html2Obj().parseHtml(htmlData)[0]
    var bodyNode = dom.extractById('activity-detail')
    expect(bodyNode.child.length).toBe(16)
    var contentNode = dom.extractById('js_content')
    expect(contentNode.child.length).toBe(61)
    expect(contentNode.child[0].tagName).toBe("p")
    expect(contentNode.child[0].child.length).toBe(9)
    expect(contentNode.child[0].child[7].toText()).toBe("3%")
})