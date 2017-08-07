import Omi from '../../src/index.js'
const $ = Omi.tags
class Hello extends Omi.Component {
    render() {
        return $.div( 'Hello2 ' + this.data.name+'!')
    }
}

Omi.tag('hello-test', Hello)

export default Hello
