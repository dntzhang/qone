import Omi from '../../src/index.js'
import TodoApp from './todo-app.js'
import Store from './store.js'


let app = new TodoApp()
let store = new Store({
    items: [
        {id: 1, text: 'Omi'},
        {id: 2, text: 'AlloyTeam'}
    ],
    text: ''
},{
    change: ()=> {
        app.update()
    }
})



Omi.render(app, 'body', {
    store
})
