# omix v1.1.9

* node 环境不会执行 Omi.render

# omix v1.1.8

* 支持直出的数据前后端共享
* Omi.render 支持配置 ssr 代表二次渲染

```js
Omi.render(component, renderTo, { ssr : true })
```

# omix v1.1.7

* 美化 ssr css 输出格式

# omix v1.1.6

* fix node 环境 document 报错
* fix ssr 下，同类组件的 css 重复合成的问题

# omix v1.1.5

* fix node 环境 window 报错

# omix v1.1.4

* 新增 babel-preset-omi ,不再使用 virtual-dom-loader。  omi-cli 已经同步更新~~
* `Omi.renderToString` 支持服务器端渲染局部CSS

# omix v1.1.3

* 新增一种 hyperscript 方式

```js
$.tagName(selector, attrs, child, child, child ...)
```

# omix v1.1.2

* 新增了 `Omi.renderToString` 用于服务器端渲染
