import Omi from '../../src/index.js'
import './hello.js'

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

Omi.render(new App(), 'body')
