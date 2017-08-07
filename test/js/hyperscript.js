import  './Hello'

const $ = Omi.tags

class App extends Omi.Component {

    handleClick(e) {
        this.name = 'Omi2'
        this.update()
    }

    style() {
        return `
        <style>
        h3{
            color:red;
            cursor: pointer;
        }
        `
    }

    render() {

        return $.div([
                    $.HelloTag({name: 'Omi'}),
                    $.h3({onclick: this.handleClick.bind(this)}, 'scoped css and event test! click me!')
                ])
    }
}

document.body.innerHTML+='<div id="ctn3"></div>'

Omi.render(new App(),'#ctn3')

let ctn =  document.querySelector('#ctn3')


describe('base', function() {
    it('test hyperscript render', function() {
        expect(ctn.innerHTML).toBe('<div __s_4=""><div __s_hello-tag="" __s_5=""> Hello Omi!</div><h3 __s_4="">scoped css and event test! click me!</h3></div>')
    })
})


