class Store  {
    constructor(data, callbacks) {
        this.items = data.items
        this.text = data.text
        const noop = function(){}
        this.onAdd = callbacks.add || noop
        this.onRemove = callbacks.remove || noop
        this.onClear = callbacks.clear || noop
        this.onAddItems= callbacks.addItems || noop
        this.onChangeText= callbacks.changeText || noop
        this.onUndo = callbacks.undo || noop
        this.actionLog = []
        this.actionUndoLog = []
       // this.actionLength = 0
        this.actionIndex = 0
    }

    add(text){

        let item  ={id: this.items.length + 1, text: text}
        this.items.push(item)
        this.onAdd(text)

        this.actionLog.push({
            action:'add',
            args:[text]
        })
        this.actionUndoLog.push({
            action:'remove',
            args:[item.id]
        })
        this.actionIndex++
    }



    remove(id) {
        for (let i = 0, len = this.items.length; i < len; i++) {
            if (this.items[i].id === id) {

                this.items.splice(i, 1)
                break
            }
        }
        this.onRemove(id)
        this.actionIndex++
    }




    addItems(items) {
        items.forEach(item=> {
            this.items.push(item)
        })

        this.onAddItems()
        this.actionIndex++
    }

    clear(){

        this.actionIndex++
        this.actionLog.push({
            action:'clear',
            args:[this.items.slice(0)]
        })

        this.actionUndoLog.push({
            action:'addItems',
            args:[this.items.slice(0)]
        })

        this.items.length = 0



        this.onClear()
    }

    undo() {

        if(this.actionIndex > 0) {
            this.actionIndex--
            let log = this.actionUndoLog[this.actionIndex]
            this[log.action].apply(this, log.args)
            this.actionIndex--
            this.actionUndoLog.pop()
        }

    }
}

export default Store