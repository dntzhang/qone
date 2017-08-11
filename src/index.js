import Omi from './omi.js'
import Component from './component.js'

Omi.Component = Component

if (typeof window !== 'undefined' && window.Omi) {
    module.exports = window.Omi
} else {
    (typeof window !== 'undefined') && (window.Omi = Omi)
    module.exports = Omi
}
