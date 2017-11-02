<p align="center">
  <a href="##Omix"><img src="http://images2017.cnblogs.com/blog/105416/201708/105416-20170807145434955-1872305404.png" alt="Omi"></a>
</p>
<p align="center">
Build UI with JSX - 使用 JSX 创建用户界面
</p>
<p align="center">
  <a href="https://circleci.com/gh/AlloyTeam/omix/tree/master"><img src="https://img.shields.io/circleci/project/AlloyTeam/omix/master.svg" alt="Build Status"></a>
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

## Hello Omix 

``` js
class Hello extends Omi.Component {
    render() {
        return <div> Hello {this.data.name}!</div>
    }
}

class App extends Omi.Component {
    install() {
        this.name = 'Omi'
        this.handleClick = this.handleClick.bind(this)
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
	            <Hello name={this.name}></Hello>
	            <h3 onclick={this.handleClick}>Scoped css and event test! click me!</h3>
	        </div>
    }
}

Omi.render(new App(), '#container')
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

* [https://unpkg.com/omix@1.2.3/dist/omix.min.js](https://unpkg.com/omix@1.2.3/dist/omix.min.js)
* [https://unpkg.com/omix@1.2.3/dist/omix.js](https://unpkg.com/omix@1.2.3/dist/omix.js)


## Plugins

* [omi-router](https://github.com/AlloyTeam/omix/tree/master/plugins/omi-router): Router for Omi.
* [omi-finger](https://github.com/AlloyTeam/omix/tree/master/plugins/omi-finger): Omi /[AlloyFinger](https://github.com/AlloyTeam/AlloyFinger) integration.
* [omi-transform](https://github.com/AlloyTeam/omix/tree/master/plugins/omi-transform): Omi /[transformjs](https://alloyteam.github.io/AlloyTouch/transformjs/) integration.
* [omi-touch](https://github.com/AlloyTeam/omix/tree/master/plugins/omi-touch): Omi /[AlloyTouch](https://github.com/AlloyTeam/AlloyTouch) integration.

# License
This content is released under the [MIT](http://opensource.org/licenses/MIT) License.
