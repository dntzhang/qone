import h from 'virtual-dom-omi/h'
import helpers from 'hyperscript-helpers'

let Omi = {
    x: h,
    tags: helpers(h),
    instances: {},
    _instanceId: 0,
    PREFIX: '__s_',
    getInstanceId: function() {
        return Omi._instanceId++
    },
    plugins: {},
    scopedStyle: true,
    mapping: {},
    style: {},
    componentConstructor: {}
}

Omi.$ = function(selector, context) {
    if (context) {
        return context.querySelector(selector)
    } else {
        return document.querySelector(selector)
    }
}

Omi.$$ = function(selector, context) {
    if (context) {
        return Array.prototype.slice.call(context.querySelectorAll(selector))
    } else {
        return Array.prototype.slice.call(document.querySelectorAll(selector))
    }
}

Omi._capitalize = function(str) {
    str = str.toLowerCase()
    str = str.replace(/\b\w+\b/g, function(word) {
        return word.substring(0, 1).toUpperCase() + word.substring(1)
    }).replace(/-/g, '')
    return str
}

Omi.tag = function(name, ctor) {
    let cname = name.replace(/-/g, '').toLowerCase()
    Omi.componentConstructor[cname] = ctor
    ctor.is = name

    let uname = Omi._capitalize(name)
    Omi.tags[uname] = Omi.tags.createTag(uname)
}

Omi.getConstructor = function(name) {
    for (var key in Omi.componentConstructor) {
        if (key === name.toLowerCase() || key === name.replace(/-/g, '').toLowerCase()) {
            return Omi.componentConstructor[key]
        }
    }
}

Omi.render = function(component, renderTo, option) {
    component.renderTo = typeof renderTo === 'string' ? document.querySelector(renderTo) : renderTo
    if (typeof option === 'boolean') {
        component._omi_increment = option
    } else if (option) {
        component._omi_increment = option.increment
    }
    component.install()
    component.beforeRender()
    component._render(true)
    component._childrenInstalled(component)
    component.installed()
    component._execInstalledHandlers()
    return component
}

Omi.get = function(name) {
    return Omi.mapping[name]
}

Omi.extendPlugin = function(name, handler) {
    Omi.plugins[name] = handler
}

Omi.deletePlugin = function(name) {
    delete Omi.plugins[name]
}

function spread(vd) {
    let str = ''
    const type = vd.type
    switch (type) {
    case 'VirtualNode':
        str += `<${vd.tagName} ${props2str(vd.properties)}>${vd.children.map(child => {
            return spread(child)
        }).join('')}</${vd.tagName}>`
        break
    case 'VirtualText':
        return vd.text
    }

    return str
}

function props2str(props) {
    let result = ''
    for (let key in props) {
        let val = props[key]
        let type = typeof val
        if (type !== 'function' && type !== 'object') {
            result += key + '="' + val + '" '
        }
    }
    return result
}

function spreadStyle() {
    let css = ''
    for (var key in Omi.style) {
        css += `\n${Omi.style[key]}\n`
    }
    return css
}

function stringifyData(component){
    return `<input type="hidden" id="_omix-ssr-data" value="${JSON.stringify(component.data)}" />`
}

Omi.renderToString = function(component) {
    Omi.ssr = true
    component.install()
    component.beforeRender()
    component._render(true)
    Omi.ssr = false
    let result = `<style>${spreadStyle()}</style>\n${spread(component._virtualDom)}${stringifyData(component)}`
    Omi.style = {}
    Omi._instanceId = 0
    return result
}

export default Omi
