
const fs = require('fs');
const path = require('path');
const Html2Obj = require("../src/html2obj");


test("tet html_p2.html", () => {
    const filepath = path.resolve(__dirname, 'html_files/html_p3.html')
    const htmlData = fs.readFileSync(filepath, "utf8")
    
    var dom = new Html2Obj().parseHtml(htmlData)
    expect(dom.length).toBe(3)
    expect(dom[1].tagName).toBe("svg")
    expect(dom[0].child.length).toBe(5)
    expect(dom[0].child[0].attrs.class).toBe("first-unpaire-div")
    expect(dom[0].child[1].child[0].tagName).toBe("path")
    expect(dom[0].child[3].attrs.class).toBe("nomrmal-div")
    expect(dom[0].child[3].child.length).toBe(1)
    expect(dom[2].child[0].tagName).toBe("rect")
})