import Omi from '../../src/index.js'
import './hello.js'

const $ = Omi.tags

class App extends Omi.Component {
    handleClick(e) {
        alert(e.target.innerHTML)
    }

    style() {
        return `
        <style>
        h3{
            color:red;
            cursor: pointer;
        }
        `
    }

    render() {
        return $.div([
            $.HelloTest({name: 'Omi'}),
            $.h3({onclick: this.handleClick.bind(this)}, 'scoped css and event test! click me!')
        ])
    }
}

Omi.render(new App(), 'body')
