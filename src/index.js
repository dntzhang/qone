import Omi from './omi.js'
import Component from './component.js'

Omi.Component = Component

if (window && window.Omi) {
    module.exports = window.Omi
} else {
    window && (window.Omi = Omi)
    module.exports = Omi
}
