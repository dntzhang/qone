import Omi from '../../src/index.js'

class Hello extends Omi.Component {
    render() {
        return <div>I am Hello Component!  from parent:{this.data.name}</div>
    }
}

Omi.tag('hello', Hello)

export default Hello
