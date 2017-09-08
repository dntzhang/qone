<p align="center">
  <a href="##Omix"><img src="http://images2017.cnblogs.com/blog/105416/201708/105416-20170807145434955-1872305404.png" alt="Omi"></a>
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
* [Change Log](https://github.com/AlloyTeam/omix/blob/master/change-log.md)
* [Use Omi if you like template](https://github.com/AlloyTeam/omi)

## Features

* Super fast, [click here!!!!](https://alloyteam.github.io/omix/example/perfs)
* Super tiny size, 7 KB (gzip)
* Good compatibility, support IE8
* Support Scoped CSS, reusable components are composed of HTML, Scoped CSS and JS
* More free updates, each component has a update method, free to choose the right time to update

## Omix 

### with JSX

``` js
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

Please attention, custom component tags must be lowercase!

### with hyperscript

``` js
const $ = Omi.tags

class Hello extends Omi.Component {
    render() {
        return $.div( 'Hello' + this.data.name+'!')
    }
}

Omi.tag('hello-tag', Hello)

class App extends Omi.Component {
    handleClick(e) {
        alert(e.target.innerHTML)
    }

    render() {
        return $.div([
	            $.HelloTag({name: 'Omi'}),
	            $.h3({onclick: this.handleClick.bind(this)}, 'scoped css and event test! click me!')
	        ])
    }
}
```

### hyperscript API

```js
const $ = Omi.tags
$.TagName(selector)
$.TagName(attrs)
$.TagName(children)
$.TagName(attrs, children)
$.TagName(selector, children)
$.TagName(selector, attrs, children)
$.TagName(selector, attrs, child, child, child ...)
```

## omi-cli

```bash
$ npm install omi-cli -g         # install cli
$ omi init-x your_project_name   # init project, you can also exec 'omi init-x' in an empty folder
$ cd your_project_name           # please ignore this command if you executed 'omi init' in an empty folder
$ npm start                      # develop
$ npm run dist                   # release
```

## Install

``` bash
npm install omix
```

or get it from CDN:

* [https://unpkg.com/omix@1.1.12/dist/omix.min.js](https://unpkg.com/omix@1.1.12/dist/omix.min.js)
* [https://unpkg.com/omix@1.1.12/dist/omix.js](https://unpkg.com/omix@1.1.12/dist/omix.js)

# License
This content is released under the [MIT](http://opensource.org/licenses/MIT) License.
