import Omi from '../../dist/omix.js'

class Hello extends Omi.Component {
    render(){
        return <div> Hello {this.data.name}!</div>
    }
}

Omi.tag('hello-tag',Hello)

export default Hello

