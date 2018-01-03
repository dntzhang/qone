class Store {
    constructor(data, callbacks) {
        this.items = data.items
        this.text = data.text
        const noop = function () {
        }
        this.onAdd = callbacks.add || noop
        this.onRemove = callbacks.remove || noop
        this.onClear = callbacks.clear || noop
        this.onAddItems = callbacks.addItems || noop
        this.onChangeText = callbacks.changeText || noop
        this.onUndo = callbacks.undo || noop
        this.onRedo = callbacks.redo || noop
        this.actionLog = []
        this.actionUndoLog = []
        this.actionRedoLog = []
        this.actionIndex = 0
    }

    addAction(text) {

        let item = {id: this.items.length + 1, text: text}
        this.items.push(item)
        this.onAdd(text)

        this.actionLog.push({
            action: 'add',
            args: [text]
        })
        this.actionUndoLog.push({
            action: 'remove',
            args: [item.id]
        })
        this.actionIndex++
    }


    add(text){
        this.addAction(text)
        this.actionRedoLog.length = 0
    }

    remove(id) {
        this.removeAction(id)
        this.actionRedoLog.length = 0
    }

    removeAction(id) {
        for (let i = 0, len = this.items.length; i < len; i++) {
            if (this.items[i].id === id) {

                this.items.splice(i, 1)
                break
            }
        }
        this.onRemove(id)
        this.actionIndex++
    }

    addItemsAction(items) {
        items.forEach(item=> {
            this.items.push(item)
        })

        this.onAddItems()
        this.actionIndex++
    }

    addItems(items) {
        this.addItemsAction(items)
        this.actionRedoLog.length = 0
    }

    clearAction() {

        this.actionIndex++
        this.actionLog.push({
            action: 'clear',
            args: [this.items.slice(0)]
        })

        this.actionUndoLog.push({
            action: 'addItems',
            args: [this.items.slice(0)]
        })

        this.items.length = 0


        this.onClear()
    }

    clear(){
        this.clearAction()
        this.actionRedoLog.length = 0
    }

    undo() {

        if (this.actionIndex > 0) {
            this.actionIndex--
            let log = this.actionUndoLog[this.actionIndex]
            this[log.action+'Action'].apply(this, log.args)
            this.actionIndex--
            this.actionUndoLog.pop()
            this.actionRedoLog.push(this.actionLog.pop())
        }

    }

    redo() {
        let log = this.actionRedoLog[this.actionRedoLog.length-1]
        if(log) {
            this[log.action+'Action'].apply(this, log.args)
            this.actionRedoLog.pop()
        }
    }
}

export default Store