<p align="center">
  <a href="##Omix"><img src="http://images2017.cnblogs.com/blog/105416/201708/105416-20170807101916221-348284001.png" alt="Omi"></a>
</p>
<p align="center">
Build UI with JSX or hyperscript - 使用 JSX 或 hyperscript 创建用户界面
</p>
<p align="center">
  <a href="https://travis-ci.org/AlloyTeam/omix"><img src="https://travis-ci.org/AlloyTeam/omix.svg"></a>
  <a href="https://www.npmjs.com/package/omix"><img src="https://img.shields.io/npm/v/omix.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/omix"><img src="https://img.shields.io/npm/dm/omix.svg" alt="Download"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs"></a>
</p>


* [中文文档](./docs/README.md)
* [Omi REPL](https://alloyteam.github.io/omix/repl/)

## Features

* Super tiny size, 7 KB (gzip)
* Super fast，[click here!!!!](https://alloyteam.github.io/omix/example/perfs)
* Good compatibility, support IE8
* Support Scoped CSS, reusable components are composed of HTML, Scoped CSS and JS
* More free updates, each component has a update method, free to choose the right time to update

## Omix 

### with JSX

```
class Hello extends Omi.Component {
    render() {
        return <div> Hello {this.data.name}!</div>
    }
}

Omi.tag('hello', Hello)

class App extends Omi.Component {
    install() {
        this.name = 'Omi'
    }

    handleClick(e) {
        this.name = 'Omix' 
        this.update()
    }

    style() {
        return `h3{
	            color:red;
	            cursor: pointer;
	        }`
    }

    render() {
        return <div>
            <hello name={this.name}></hello>
            <h3 onclick={this.handleClick.bind(this)}>Scoped css and event test! click me!</h3>
        </div>
    }
}

Omi.render(new App(), '#container')
```

### with hyperscript

```
const $ = Omi.tags
class Hello extends Omi.Component {
    render() {
        return $.div( 'Hello' + this.data.name+'!')
    }
}

class App extends Omi.Component {
    handleClick(e) {
        alert(e.target.innerHTML)
    }

    render() {
        return $.div([
            $.HelloTest({name: 'Omi'}),
            $.h3({onclick: this.handleClick}, 'scoped css and event test! click me!')
        ])
    }
}
```

### hyperscript API

```js
const $ = Omi.tags
$.tagName(selector)
$.tagName(attrs)
$.tagName(children)
$.tagName(attrs, children)
$.tagName(selector, children)
$.tagName(selector, attrs, children)
```

## omi-cli

```bash
$ npm install omi-cli -g         # install cli
$ omi init-x your_project_name   # init project, you can also exec 'omi init' in an empty folder
$ cd your_project_name           # please ignore this command if you executed 'omi init' in an empty folder
$ npm start                      # develop
$ npm run dist                   # release
```

## Install

``` bash
npm install omix
```

or get it from CDN:

``` html
<script src="https://unpkg.com/omix@0.1.0/dist/omix.min.js"></script>
```


# License
This content is released under the [MIT](http://opensource.org/licenses/MIT) License.
