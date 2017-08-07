import Omi from '../../src/index.js'
import './hello.js'

class App extends Omi.Component {
    render() {
        return <notes-list a="a" class="sfds">
            <span>hello</span>
            <span>world</span>
        </notes-list>
    }
}

Omi.render(new App(), 'body')
