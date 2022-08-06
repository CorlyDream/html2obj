
const Html2Obj = require("../src/html2obj");

const html = `
<!DOCTYPE html>
        <html lang="en">
            <head>
                <title id='title-id'>测试标题</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" href="static/css/bootstrap.min.css">
                <link rel="stylesheet" href="static/css/jquery-confirm.min.css">
                <link rel="stylesheet" type="text/css" href="style.css">
        
                <script src="static/js/jquery-3.2.1.min.js"></script>
                <style>
                    .CodeMirror{
                        height: 100%;
                        width: 100%;
                    }
                </style>
            </head>
            <body role="document" style="background-color: #2c3e50;">
            <h1>Heading</h1>
            <hr>
            <h2>&inr;</h2>
                <pre id='pre-id'>
                    <h1>Heading</h1>
                    <hr>
                    <h2>&inr;</h2>
                </pre>
                <script>
                  let highlightedLine = null;
                  let editor;
                    <!-- this should not be parsed separately -->
                  function updateLength(){
                      const xmlData = editor.getValue();
                      $("#lengthxml")[0].innerText = xmlData.replace(/>\s*</g, "><").length;
                  }
                </script>
            </body>
        </html>
`
var dom = new Html2Obj({
    tagValueProcessor: function (tagName, val) {
        return val;
    },
    attributeValueProcessor: function (attrName, val) {
        console.log(val)
        return val;
    },
    nodePostProcessor(node) {
        if(node.tagName === 'h1'){
            node.tagName = 'h2'
        }
    }
}).parseHtml(html)[0]
console.log(JSON.stringify(dom))
console.log(dom.extractById('title-id').toText())
console.log(dom.extractById('pre-id').toHtml())