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
    customTags: [],
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
    let upName = name.toUpperCase()
    Omi.componentConstructor[upName] = ctor
    Omi.customTags.push(upName, upName.replace(/-/g, ''))
    ctor.is = upName
    if (document.documentMode < 9) {
        document.createElement(name.toLowerCase())
    }
    let un = Omi._capitalize(name)
    Omi.tags[un] = Omi.tags.createTag(un)
}

Omi.getConstructor = function(name) {
    for (var key in Omi.componentConstructor) {
        if (key === name || key.replace(/-/g, '') === name) {
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

export default Omi
