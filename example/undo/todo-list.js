class TodoList extends Omi.Component {
    render() {
        return (
            <ul>
                {this.$store.items.map(item => (
                    <li data-id={item.id}>{item.text}</li>
                ))}
            </ul>
        )
    }
}

export default TodoList