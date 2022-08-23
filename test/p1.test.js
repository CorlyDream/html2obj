
const fs = require('fs');
const path = require('path');
const Html2Obj = require("../src/html2obj");

test('test html_p1.html', () => {
    const filepath = path.resolve(__dirname, 'html_files/html_p1.html')
    const htmlData = fs.readFileSync(filepath, "utf8")
    
    var dom = new Html2Obj().parseHtml(htmlData)[0]
    var bodyNode = dom.extractById('activity-detail')
    expect(bodyNode.child.length).toBe(45)
    var contentNode = dom.extractById('js_content')
    expect(contentNode.child.length).toBe(5)
    expect(contentNode.child[4].tagName).toBe("section")
    expect(contentNode.child[4].child.length).toBe(16)
});
