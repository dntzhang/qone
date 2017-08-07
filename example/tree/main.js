import Omi from '../../src/index.js'

import Tree from './tree.js'

Omi.tag('tree', Tree)

class App extends Omi.Component {
    render() {
        return <div>
            <div> {this.data.demoName}</div>
            <tree root={this.data.rootNode}></tree>
        </div>
    }
}

Omi.render(new App({
    demoName: 'Omi Tree Demo (support drag and drop to move the node)',
    rootNode: {
        name: 'Root',
        nodes: [
            {
                name: 'A',
                id: 1,
                nodes: [
                    { id: 4, name: 'A1', nodes: [] },
                    { id: 7, name: 'A2', nodes: [] }
                ]
            },
            {
                name: 'B',
                id: 2,
                nodes: [
                ]
            }
        ]
    }
}), '#container')
