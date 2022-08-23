# html2obj

html 解析， html 转 json 对象，json 对象转 html

## 使用方式

```shell
npm install -S html2obj
```

输入的html

```html
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
```

js 代码可参考 `example/parse.example.js`

```js
var dom = new Html2Obj().parseHtml(html)[0]
console.log(JSON.stringify(dom))
```

输出结果

```json
{
    "tagName": "html",
    "child": [
        {
            "tagName": "head",
            "child": [
                {
                    "tagName": "title",
                    "child": [
                        {
                            "tagName": "#text",
                            "child": [
                                "测试标题"
                            ],
                            "attrs": {}
                        }
                    ],
                    "attrs": {
                        "id": "title-id"
                    }
                },
                {
                    "tagName": "meta",
                    "child": [],
                    "attrs": {
                        "charset": "UTF-8"
                    }
                },
                {
                    "tagName": "meta",
                    "child": [],
                    "attrs": {
                        "name": "viewport",
                        "content": "width=device-width, initial-scale=1"
                    }
                },
                {
                    "tagName": "link",
                    "child": [],
                    "attrs": {
                        "rel": "stylesheet",
                        "href": "static/css/bootstrap.min.css"
                    }
                },
                {
                    "tagName": "link",
                    "child": [],
                    "attrs": {
                        "rel": "stylesheet",
                        "href": "static/css/jquery-confirm.min.css"
                    }
                },
                {
                    "tagName": "link",
                    "child": [],
                    "attrs": {
                        "rel": "stylesheet",
                        "type": "text/css",
                        "href": "style.css"
                    }
                },
                {
                    "tagName": "script",
                    "child": [],
                    "attrs": {
                        "src": "static/js/jquery-3.2.1.min.js"
                    }
                },
                {
                    "tagName": "style",
                    "child": [
                        {
                            "tagName": "#text",
                            "child": [
                                "\n                    .CodeMirror{\n                        height: 100%;\n                        width: 100%;\n                    }\n                "
                            ],
                            "attrs": {}
                        }
                    ],
                    "attrs": {}
                }
            ],
            "attrs": {}
        },
        {
            "tagName": "body",
            "child": [
                {
                    "tagName": "h1",
                    "child": [
                        {
                            "tagName": "#text",
                            "child": [
                                "Heading"
                            ],
                            "attrs": {}
                        }
                    ],
                    "attrs": {}
                },
                {
                    "tagName": "hr",
                    "child": [],
                    "attrs": {}
                },
                {
                    "tagName": "h2",
                    "child": [
                        {
                            "tagName": "#text",
                            "child": [
                                "&inr;"
                            ],
                            "attrs": {}
                        }
                    ],
                    "attrs": {}
                },
                {
                    "tagName": "pre",
                    "child": [
                        {
                            "tagName": "#text",
                            "child": [
                                "\n                    <h1>Heading</h1>\n                    <hr>\n                    <h2>&inr;</h2>\n                "
                            ],
                            "attrs": {}
                        }
                    ],
                    "attrs": {
                        "id": "pre-id"
                    }
                },
                {
                    "tagName": "script",
                    "child": [
                        {
                            "tagName": "#text",
                            "child": [
                                "\n                  let highlightedLine = null;\n                  let editor;\n                    <!-- this should not be parsed separately -->\n                  function updateLength(){\n                      const xmlData = editor.getValue();\n                      $(\"#lengthxml\")[0].innerText = xmlData.replace(/>s*</g, \"><\").length;\n                  }\n                "
                            ],
                            "attrs": {}
                        }
                    ],
                    "attrs": {}
                }
            ],
            "attrs": {
                "role": "document",
                "style": "background-color: #2c3e50;"
            }
        }
    ],
    "attrs": {
        "lang": "en"
    }
}
```

目前支持根据属性id查找节点

```js
console.log(dom.extractById('title-id').toText())
console.log(dom.extractById('pre-id').toHtml())
```

- toText 返回节点内的文本内容
- toHtml 将节点还原成 html

## 节点结构

```json
{
  "tagName": "div", 
  "attrs": {},	
  "chid": []
}
```

- tagName：标签名
- attrs：属性对象
- chid：子节点数组



> 文本节点 tagName 为 `#text`

## 高级用法

```js
var dom = new Html2Obj({
    tagValueProcessor: function (tagName, val) {
        return val;
    },
    attributeValueProcessor: function (attrName, val) {
        return val;
    },
    nodePostProcessor(node) {
        if(node.tagName === 'h1'){
            node.tagName = 'h2'
        }
    }
}).parseHtml(html)[0]
```

- tagValueProcessor 标签中如果有文本节点，会将文本节点内容(val) 经过此方法处理
- attributeValueProcessor 标签的属性处理时会调用此方法
- nodePostProcessor 标签节点创建后调用。注意：此时还未解析子节点，所以 child 是空，只有 tagName 和 attrs