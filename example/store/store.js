class Store  {
    constructor(data) {
        this.items = data.items
        this.text = data.text
        this.change = data.change || function(){}
    }

    add(text){
        this.items.push({id: this.items.length + 1, text: text})
    }

    clear(){
        this.items.length = 0
    }
}

export default Store