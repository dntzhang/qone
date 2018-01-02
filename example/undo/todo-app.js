import TodoList from './todo-list.js'

class TodoApp extends Omi.Component {
    constructor(data) {
        super(data)
        this.undo = this.undo.bind(this)
        this.handleSubmit= this.handleSubmit.bind(this)
        this.handleChange= this.handleChange.bind(this)
        this.clear = this.clear.bind(this)
    }

    handleSubmit(e) {
        e.preventDefault()
        const text = this.$store.text
        this.$store.text = ''
        this.$store.add(text)
    }

    handleChange(e) {
        this.$store.text = e.target.value
    }

    undo(){
        this.$store.undo()
    }

    clear(){
        this.$store.clear()
    }

    render() {
        return <div>
            <h3>TODO <button onClick={this.undo}>Undo</button></h3>
            <TodoList></TodoList>

            <form onSubmit={this.handleSubmit}>
                <input onChange={this.handleChange} value={this.$store.text} />
                <button>{'Add #' + (this.$store.items.length )}</button>

            </form>
            <button onClick={this.clear}>Clear</button>
        </div>
    }
}

export default TodoApp