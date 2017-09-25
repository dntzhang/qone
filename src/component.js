import Omi from './omi.js'
import style from './style.js'

import diff from 'virtual-dom-omi/diff'
import patch from 'virtual-dom-omi/patch'
import createElement from 'virtual-dom-omi/create-element'

class Component {
    constructor(data) {
        this.data = data || {}
        this.id = Omi.getInstanceId()
        this.children = []
        this._omi_scopedAttr = Omi.PREFIX + this.id
        Omi.instances[this.id] = this
        this.refs = {}
    }

    render() {

    }

    install() {

    }

    beforeUpdate() {

    }

    update() {
        this._resetUsing(this)
        this.beforeUpdate()
        // this._childrenBeforeUpdate(this)
        this.beforeRender()
        this._preVirtualDom = this._virtualDom
        this._virtualDom = this.render()
        this._normalize(this._virtualDom)

        this._fixVirtualDomCount(this._virtualDomCount(this._preVirtualDom, [[this._preVirtualDom]]))
        this._fixVirtualDomCount(this._virtualDomCount(this._virtualDom, [[this._virtualDom]]))

        patch(this.node, diff(this._preVirtualDom, this._virtualDom))

        this._mixAttr(this)

        this._childrenAfterUpdate(this)
        this.afterUpdate()

        this._childrenInstalled(this)
        if (!this.renderTo) {
            // 子节点自己更新之后同步至父节点的虚拟
            this.parent._virtualDom.children[this._omi_instanceIndex] = this._virtualDom
        }

        this._fixForm()
    }

    _virtualDomCount(root, arr) {
        root.count = root.children.length
        let list = []
        root.children.forEach(child => {
            list.push(child)
            if (child.children) {
                child.count = child.children.length
                child._pp = root
            }
        })

        arr.push(list)

        root.children.forEach(child => {
            if (child.children) {
                this._virtualDomCount(child, arr)
            }
        })
        return arr
    }

    _fixVirtualDomCount(list) {
        for (let i = list.length - 1; i >= 0; i--) {
            var children = list[i]
            children.forEach(child => {
                if (child._pp) {
                    child._pp.count += child.count || 0
                }
            })
        }
    }

    // _childrenBeforeUpdate(root) {
    //    root.children.forEach((child) => {
    //        child.beforeUpdate()
    //        this._childrenBeforeUpdate(child)
    //    })
    // }

    _childrenAfterUpdate(root) {
        root.children.forEach((child) => {
            this._childrenAfterUpdate(child)
            child.afterUpdate()
        })
    }

    afterUpdate() {

    }

    beforeRender() {

    }

    installed() {

    }

    style() {

    }

    onInstalled(handler) {
        if (!this._omi_installedHandlers) {
            this._omi_installedHandlers = []
        }
        this._omi_installedHandlers.push(handler)
    }

    _execInstalledHandlers() {
        this._omi_installedHandlers && this._omi_installedHandlers.forEach((handler) => {
            handler()
        })
    }

    _render(first) {
        this._generateCss()
        this._virtualDom = this.render()
        this._normalize(this._virtualDom, first)
        if (this.renderTo) {
            this.node = createElement(this._virtualDom)
            if(!this._omi_increment) {
                while (this.renderTo.firstChild) {
                    this.renderTo.removeChild(this.renderTo.firstChild)
                }
            }
            this.renderTo.appendChild(this.node)
            this._mixAttr(this)
            this._fixForm()
        }
    }

    _generateCss() {
        const name = this.constructor.is
        this.css = (this.style() || '').replace(/<\/?style>/g, '')
        let shareAttr = name ? (this.data.scopedSelfCss ? this._omi_scopedAttr : Omi.PREFIX + name.toLowerCase()) : (this._omi_scopedAttr)

        if (this.css) {
            if(this.data.closeScopedStyle){
                Omi.style[shareAttr+'_g'] = this.css
                if (!Omi.ssr) {
                    if (this.css !== this._preCss) {
                        style.addStyle(this.css, this.id)
                        this._preCss = this.css
                    }
                }
            }else if (this.data.scopedSelfCss || !Omi.style[shareAttr]) {
                if (Omi.scopedStyle) {
                    this.css = style.scoper(this.css, this.data.scopedSelfCss ? '[' + this._omi_scopedAttr + ']' : '[' + shareAttr + ']')
                }
                Omi.style[shareAttr] = this.css
                if (!Omi.ssr) {
                    if (this.css !== this._preCss) {
                        style.addStyle(this.css, this.id)
                        this._preCss = this.css
                    }
                }
            }
        }
    }

    _normalize(root, first, parent, index, parentInstance) {
        let ps = root.properties
        // for scoped css
        if (ps) {
            if (Omi.scopedStyle && this.constructor.is) {
                ps[Omi.PREFIX + this.constructor.is.toLowerCase()] = ''
            }
            ps[this._omi_scopedAttr] = ''
        }

        if (root.tagName) {
            let Ctor = Omi.getConstructor(root.tagName)
            if (Ctor) {
                let cmi = this._getNextChild(root.tagName, parentInstance)
                // not using pre instance the first time
                if (cmi && !first) {
                    if (cmi.data.selfDataFirst) {
                        cmi.data = Object.assign({}, root.properties, cmi.data)
                    } else {
                        cmi.data = Object.assign({}, cmi.data, root.properties)
                    }
                    cmi.beforeUpdate()
                    cmi.beforeRender()
                    cmi._render()
                    parent[index] = cmi._virtualDom
                } else {
                    if (Ctor) {
                        let instance = new Ctor(root.properties)
                        if (instance.data.children !== undefined) {
                            instance.data._children = instance.data.children
                            console.warn('The children property will be covered.access it by _children')
                        }
                        instance.data.children = root.children
                        instance._using = true
                        instance.install()
                        instance.beforeRender()
                        instance._render(first)
                        instance.parent = parentInstance
                        instance._omi_needInstalled = true
                        if (parentInstance) {
                            instance.parent = parentInstance
                            instance._omi_instanceIndex = parentInstance.children.length
                            parentInstance.children.push(instance)
                            parent[index] = instance._virtualDom
                            if (root.properties['omi-name']) {
                                parentInstance[root.properties['omi-name']] = instance
                            }
                        } else {
                            this._virtualDom = instance._virtualDom
                            if (root.properties['omi-name']) {
                                this[root.properties['omi-name']] = instance
                            }
                        }

                        if (root.properties['omi-id']) {
                            Omi.mapping[root.properties['omi-id']] = instance
                        }
                    }
                }
            }
        }

        root.children && root.children.forEach((child, index) => {
            this._normalize(child, first, root.children, index, this)
        })
    }

    _resetUsing(root) {
        root.children.forEach((child) => {
            this._resetUsing(child)
            child._using = false
        })
    }

    _getNextChild(cn, parentInstance) {
        if (parentInstance) {
            for (let i = 0, len = parentInstance.children.length; i < len; i++) {
                let child = parentInstance.children[i]
                if (cn.replace(/-/g, '').toLowerCase() === child.constructor.is.replace(/-/g, '').toLowerCase() && !child._using) {
                    child._using = true
                    return child
                }
            }
        }
    }

    _fixForm() {
        Omi.$$('input', this.node).forEach(element => {
            let type = element.type.toLowerCase()
            if (element.getAttribute('value') === '') {
                element.value = ''
            }
            if (type === 'checked' || type === 'radio') {
                if (element.hasAttribute('checked')) {
                    element.checked = 'checked'
                } else {
                    element.checked = false
                }
            }
        })

        Omi.$$('textarea', this.node).forEach(textarea => {
            textarea.value = textarea.getAttribute('value')
        })

        Omi.$$('select', this.node).forEach(select => {
            let value = select.getAttribute('value')
            if (value) {
                Omi.$$('option', select).forEach(option => {
                    if (value === option.getAttribute('value')) {
                        option.selected = true
                    }
                })
            } else {
                let firstOption = Omi.$$('option', select)[0]
                firstOption && (firstOption.selected = true)
            }
        })
    }

    _childrenInstalled(root) {
        root.children.forEach((child) => {
            this._childrenInstalled(child)
            child._omi_needInstalled && child.installed()
            child._omi_needInstalled = false
            child._execInstalledHandlers()
        })
    }

    _mixPlugins() {
        Object.keys(Omi.plugins).forEach(item => {
            let nodes = Omi.$$('*[' + item + ']', this.node)
            nodes.forEach(node => {
                if (node.hasAttribute(this._omi_scopedAttr)) {
                    Omi.plugins[item](node, this)
                }
            })
            if (this.node.hasAttribute(item)) {
                Omi.plugins[item](this.node, this)
            }
        })
    }

    _mixRefs() {
        this.refs = {}
        let nodes = Omi.$$('*[ref]', this.node)
        nodes.forEach(node => {
            if (node.hasAttribute(this._omi_scopedAttr)) {
                this.refs[node.getAttribute('ref')] = node
            }
        })
        let attr = this.node.getAttribute('ref')
        if (attr) {
            this.refs[attr] = this.node
        }
    }

    _mixAttr(current) {
        current._mixRefs()
        current._mixPlugins()
        for (let i = 0, len = current.children.length; i < len; i++) {
            let child = current.children[i]
            child.node = Omi.$('[' + child._omi_scopedAttr + ']', current.node)
            if (!child.node) {
                child._virtualDom = null
                current.children.splice(i, 1)
                i--
                len--
            } else {
                child._omi_instanceIndex = i
                current._mixAttr(child)
            }
        }
    }
}

export default Component
