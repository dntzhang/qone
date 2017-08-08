import Omi from '../../src/index.js'
import './nodes-list.js'
import './hello.js'

class App extends Omi.Component {
    install(){
        this.name = 'abcd'
    }

    render() {
        return <notes-list a="a" class="sfds">
            <span>hello</span>
            <span>world</span>
            <hello name={this.name}></hello>
        </notes-list>
    }
}

Omi.render(new App(), 'body')
