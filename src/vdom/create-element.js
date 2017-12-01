
import applyProperties from './apply-properties.js'

function isObject(x) {
    return typeof x === 'object' && x !== null;
}



function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}






function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

   // vnode = handleThunk(vnode).a

    if (typeof vnode == 'string') {

        return doc.createTextNode(vnode)
    } else if (!isObject(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = doc.createElement(vnode.tagName)

    var props = vnode.props


    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

export default createElement