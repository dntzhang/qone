/* qone v1.0.0 - Next-generation web query language, extend .NET LINQ for javascript.
 * By dntzhang https://github.com/dntzhang
 * Github: https://github.com/dntzhang/qone
 * MIT Licensed.
 */

; (function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory()
    } else {
        root.qone = factory()
    }
}(this, function() {
    var WHITESPACE_CHARS = array2hash(characters(' \r\t\u200b'))
    var OPERATOR_CHARS = array2hash(characters('+-*&%=<>!?|~^'))
    var PUNC_CHARS = array2hash(characters('[]{}(),;:'))
    var PUNC_BEFORE_EXPRESSION = array2hash(characters('[{}(,.;:'))
    var KEYWORDS_ATOM = array2hash([
        'false',
        'null',
        'true',
        'undefined'
    ])
    var atomMapping = { 'null': null, 'undefined': undefined, 'true': true, 'false': false }
    function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop)
    }

    function isArray(item) {
        return Object.prototype.toString.call(item) === '[object Array]'
    }

    function isObject(obj) {
        return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
    }

    function obj2keys(obj) {
        var keys = []
        for (var key in obj) keys.push(key)
        return keys
    }

    function array2hash(a) {
        var ret = {}
        for (var i = 0; i < a.length; ++i) {
            ret[a[i]] = true
        }
        return ret
    }

    function isDigit(ch) {
        ch = ch.charCodeAt(0)
        return ch >= 48 && ch <= 57 // XXX: find out if "UnicodeDigit" means something else than 0..9
    }

    function isAlphanumericChar(ch) {
        return isDigit(ch) || isLetter(ch)
    }

    function characters(str) {
        return str.split('')
    }

    var RE_HEX_NUMBER = /^0x[0-9a-f]+$/i
    var RE_OCT_NUMBER = /^0[0-7]+$/
    var RE_DEC_NUMBER = /^\d*\.?\d*(?:e[+-]?\d*(?:\d\.?|\.?\d)\d*)?$/i

    function parseJsNumber(num) {
        if (RE_HEX_NUMBER.test(num)) {
            return parseInt(num.substr(2), 16)
        } else if (RE_OCT_NUMBER.test(num)) {
            return parseInt(num.substr(1), 8)
        } else if (RE_DEC_NUMBER.test(num)) {
            return parseFloat(num)
        }
    }

    var KEYWORD = array2hash(['from', 'in', 'where', 'select', 'orderby', 'desc', 'asc', 'groupby', 'limit'])
    var UNICODE = {
        letter: new RegExp('[\\u0041-\\u005A\\u0061-\\u007A\\u00AA\\u00B5\\u00BA\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0370-\\u0374\\u0376\\u0377\\u037A-\\u037D\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481\\u048A-\\u0523\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06E5\\u06E6\\u06EE\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u07F4\\u07F5\\u07FA\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0971\\u0972\\u097B-\\u097F\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0\\u0AE1\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58\\u0C59\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3D\\u0D60\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E46\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EDC\\u0EDD\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8B\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10A0-\\u10C5\\u10D0-\\u10FA\\u10FC\\u1100-\\u1159\\u115F-\\u11A2\\u11A8-\\u11F9\\u1200-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u1676\\u1681-\\u169A\\u16A0-\\u16EA\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17D7\\u17DC\\u1820-\\u1877\\u1880-\\u18A8\\u18AA\\u1900-\\u191C\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19A9\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE\\u1BAF\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C7D\\u1D00-\\u1DBF\\u1E00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2071\\u207F\\u2090-\\u2094\\u2102\\u2107\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u212F-\\u2139\\u213C-\\u213F\\u2145-\\u2149\\u214E\\u2183\\u2184\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2C6F\\u2C71-\\u2C7D\\u2C80-\\u2CE4\\u2D00-\\u2D25\\u2D30-\\u2D65\\u2D6F\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u2E2F\\u3005\\u3006\\u3031-\\u3035\\u303B\\u303C\\u3041-\\u3096\\u309D-\\u309F\\u30A1-\\u30FA\\u30FC-\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31B7\\u31F0-\\u31FF\\u3400\\u4DB5\\u4E00\\u9FC3\\uA000-\\uA48C\\uA500-\\uA60C\\uA610-\\uA61F\\uA62A\\uA62B\\uA640-\\uA65F\\uA662-\\uA66E\\uA67F-\\uA697\\uA717-\\uA71F\\uA722-\\uA788\\uA78B\\uA78C\\uA7FB-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA90A-\\uA925\\uA930-\\uA946\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAC00\\uD7A3\\uF900-\\uFA2D\\uFA30-\\uFA6A\\uFA70-\\uFAD9\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF21-\\uFF3A\\uFF41-\\uFF5A\\uFF66-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC]'),
        non_spacing_mark: new RegExp('[\\u0300-\\u036F\\u0483-\\u0487\\u0591-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05C5\\u05C7\\u0610-\\u061A\\u064B-\\u065E\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E4\\u06E7\\u06E8\\u06EA-\\u06ED\\u0711\\u0730-\\u074A\\u07A6-\\u07B0\\u07EB-\\u07F3\\u0816-\\u0819\\u081B-\\u0823\\u0825-\\u0827\\u0829-\\u082D\\u0900-\\u0902\\u093C\\u0941-\\u0948\\u094D\\u0951-\\u0955\\u0962\\u0963\\u0981\\u09BC\\u09C1-\\u09C4\\u09CD\\u09E2\\u09E3\\u0A01\\u0A02\\u0A3C\\u0A41\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A51\\u0A70\\u0A71\\u0A75\\u0A81\\u0A82\\u0ABC\\u0AC1-\\u0AC5\\u0AC7\\u0AC8\\u0ACD\\u0AE2\\u0AE3\\u0B01\\u0B3C\\u0B3F\\u0B41-\\u0B44\\u0B4D\\u0B56\\u0B62\\u0B63\\u0B82\\u0BC0\\u0BCD\\u0C3E-\\u0C40\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C62\\u0C63\\u0CBC\\u0CBF\\u0CC6\\u0CCC\\u0CCD\\u0CE2\\u0CE3\\u0D41-\\u0D44\\u0D4D\\u0D62\\u0D63\\u0DCA\\u0DD2-\\u0DD4\\u0DD6\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E\\u0EB1\\u0EB4-\\u0EB9\\u0EBB\\u0EBC\\u0EC8-\\u0ECD\\u0F18\\u0F19\\u0F35\\u0F37\\u0F39\\u0F71-\\u0F7E\\u0F80-\\u0F84\\u0F86\\u0F87\\u0F90-\\u0F97\\u0F99-\\u0FBC\\u0FC6\\u102D-\\u1030\\u1032-\\u1037\\u1039\\u103A\\u103D\\u103E\\u1058\\u1059\\u105E-\\u1060\\u1071-\\u1074\\u1082\\u1085\\u1086\\u108D\\u109D\\u135F\\u1712-\\u1714\\u1732-\\u1734\\u1752\\u1753\\u1772\\u1773\\u17B7-\\u17BD\\u17C6\\u17C9-\\u17D3\\u17DD\\u180B-\\u180D\\u18A9\\u1920-\\u1922\\u1927\\u1928\\u1932\\u1939-\\u193B\\u1A17\\u1A18\\u1A56\\u1A58-\\u1A5E\\u1A60\\u1A62\\u1A65-\\u1A6C\\u1A73-\\u1A7C\\u1A7F\\u1B00-\\u1B03\\u1B34\\u1B36-\\u1B3A\\u1B3C\\u1B42\\u1B6B-\\u1B73\\u1B80\\u1B81\\u1BA2-\\u1BA5\\u1BA8\\u1BA9\\u1C2C-\\u1C33\\u1C36\\u1C37\\u1CD0-\\u1CD2\\u1CD4-\\u1CE0\\u1CE2-\\u1CE8\\u1CED\\u1DC0-\\u1DE6\\u1DFD-\\u1DFF\\u20D0-\\u20DC\\u20E1\\u20E5-\\u20F0\\u2CEF-\\u2CF1\\u2DE0-\\u2DFF\\u302A-\\u302F\\u3099\\u309A\\uA66F\\uA67C\\uA67D\\uA6F0\\uA6F1\\uA802\\uA806\\uA80B\\uA825\\uA826\\uA8C4\\uA8E0-\\uA8F1\\uA926-\\uA92D\\uA947-\\uA951\\uA980-\\uA982\\uA9B3\\uA9B6-\\uA9B9\\uA9BC\\uAA29-\\uAA2E\\uAA31\\uAA32\\uAA35\\uAA36\\uAA43\\uAA4C\\uAAB0\\uAAB2-\\uAAB4\\uAAB7\\uAAB8\\uAABE\\uAABF\\uAAC1\\uABE5\\uABE8\\uABED\\uFB1E\\uFE00-\\uFE0F\\uFE20-\\uFE26]'),
        space_combining_mark: new RegExp('[\\u0903\\u093E-\\u0940\\u0949-\\u094C\\u094E\\u0982\\u0983\\u09BE-\\u09C0\\u09C7\\u09C8\\u09CB\\u09CC\\u09D7\\u0A03\\u0A3E-\\u0A40\\u0A83\\u0ABE-\\u0AC0\\u0AC9\\u0ACB\\u0ACC\\u0B02\\u0B03\\u0B3E\\u0B40\\u0B47\\u0B48\\u0B4B\\u0B4C\\u0B57\\u0BBE\\u0BBF\\u0BC1\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCC\\u0BD7\\u0C01-\\u0C03\\u0C41-\\u0C44\\u0C82\\u0C83\\u0CBE\\u0CC0-\\u0CC4\\u0CC7\\u0CC8\\u0CCA\\u0CCB\\u0CD5\\u0CD6\\u0D02\\u0D03\\u0D3E-\\u0D40\\u0D46-\\u0D48\\u0D4A-\\u0D4C\\u0D57\\u0D82\\u0D83\\u0DCF-\\u0DD1\\u0DD8-\\u0DDF\\u0DF2\\u0DF3\\u0F3E\\u0F3F\\u0F7F\\u102B\\u102C\\u1031\\u1038\\u103B\\u103C\\u1056\\u1057\\u1062-\\u1064\\u1067-\\u106D\\u1083\\u1084\\u1087-\\u108C\\u108F\\u109A-\\u109C\\u17B6\\u17BE-\\u17C5\\u17C7\\u17C8\\u1923-\\u1926\\u1929-\\u192B\\u1930\\u1931\\u1933-\\u1938\\u19B0-\\u19C0\\u19C8\\u19C9\\u1A19-\\u1A1B\\u1A55\\u1A57\\u1A61\\u1A63\\u1A64\\u1A6D-\\u1A72\\u1B04\\u1B35\\u1B3B\\u1B3D-\\u1B41\\u1B43\\u1B44\\u1B82\\u1BA1\\u1BA6\\u1BA7\\u1BAA\\u1C24-\\u1C2B\\u1C34\\u1C35\\u1CE1\\u1CF2\\uA823\\uA824\\uA827\\uA880\\uA881\\uA8B4-\\uA8C3\\uA952\\uA953\\uA983\\uA9B4\\uA9B5\\uA9BA\\uA9BB\\uA9BD-\\uA9C0\\uAA2F\\uAA30\\uAA33\\uAA34\\uAA4D\\uAA7B\\uABE3\\uABE4\\uABE6\\uABE7\\uABE9\\uABEA\\uABEC]'),
        connector_punctuation: new RegExp('[\\u005F\\u203F\\u2040\\u2054\\uFE33\\uFE34\\uFE4D-\\uFE4F\\uFF3F]')
    }

    function isLetter(ch) {
        return UNICODE.letter.test(ch)
    }

    // deep-equal from npm

    var deepEqual = function(actual, expected, opts) {
        if (!opts) opts = {}
        // 7.1. All identical values are equivalent, as determined by ===.
        if (actual === expected) {
            return true
        } else if (actual instanceof Date && expected instanceof Date) {
            return actual.getTime() === expected.getTime()

            // 7.3. Other pairs that do not both pass typeof value == 'object',
            // equivalence is determined by ==.
        } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
            return opts.strict ? actual === expected : actual == expected

            // 7.4. For all other Object pairs, including Array objects, equivalence is
            // determined by having the same number of owned properties (as verified
            // with Object.prototype.hasOwnProperty.call), the same set of keys
            // (although not necessarily the same order), equivalent values for every
            // corresponding key, and an identical 'prototype' property. Note: this
            // accounts for both named and indexed properties on Arrays.
        } else {
            return objEquiv(actual, expected, opts)
        }
    }

    function isUndefinedOrNull(value) {
        return value === null || value === undefined
    }

    function objEquiv(a, b, opts) {
        var i, key
        if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) { return false }
        // an identical 'prototype' property.
        if (a.prototype !== b.prototype) return false
        // ~~~I've managed to break Object.keys through screwy arguments passing.
        //   Converting to array solves the problem.

        try {
            var ka = obj2keys(a),
                kb = obj2keys(b)
        } catch (e) { // happens when one is a string literal and the other isn't
            return false
        }
        // having the same number of owned properties (keys incorporates
        // hasOwnProperty)
        if (ka.length != kb.length) { return false }
        // the same set of keys (although not necessarily the same order),
        ka.sort()
        kb.sort()
        // ~~~cheap key test
        for (i = ka.length - 1; i >= 0; i--) {
            if (ka[i] != kb[i]) { return false }
        }
        // equivalent values for every corresponding key, and
        // ~~~possibly expensive deep test
        for (i = ka.length - 1; i >= 0; i--) {
            key = ka[i]
            if (!deepEqual(a[key], b[key], opts)) return false
        }
        return typeof a === typeof b
    }

    /*
    object-assign
    (c) Sindre Sorhus
    @license MIT
    */

    var getOwnPropertySymbols = Object.getOwnPropertySymbols
    var hasOwnProperty = Object.prototype.hasOwnProperty
    var propIsEnumerable = Object.prototype.propertyIsEnumerable

    function toObject(val) {
        if (val === null || val === undefined) {
            throw new TypeError('Object.assign cannot be called with null or undefined')
        }

        return Object(val)
    }

    function shouldUseNative() {
        try {
            if (!Object.assign) {
                return false
            }

            // Detect buggy property enumeration order in older V8 versions.

            // https://bugs.chromium.org/p/v8/issues/detail?id=4118
            var test1 = new String('abc') // eslint-disable-line no-new-wrappers
            test1[5] = 'de'
            if (Object.getOwnPropertyNames(test1)[0] === '5') {
                return false
            }

            // https://bugs.chromium.org/p/v8/issues/detail?id=3056
            var test2 = {}
            for (var i = 0; i < 10; i++) {
                test2['_' + String.fromCharCode(i)] = i
            }
            var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
                return test2[n]
            })
            if (order2.join('') !== '0123456789') {
                return false
            }

            // https://bugs.chromium.org/p/v8/issues/detail?id=3056
            var test3 = {}
            'abcdefghijklmnopqrst'.split('').forEach(function(letter) {
                test3[letter] = letter
            })
            if (Object.keys(Object.assign({}, test3)).join('') !==
                'abcdefghijklmnopqrst') {
                return false
            }

            return true
        } catch (err) {
            // We don't expect any of the above to throw, but better to be safe.
            return false
        }
    }

    var objAssign = shouldUseNative() ? Object.assign : function(target, source) {
        var from
        var to = toObject(target)
        var symbols

        for (var s = 1; s < arguments.length; s++) {
            from = Object(arguments[s])

            for (var key in from) {
                if (hasOwnProperty.call(from, key)) {
                    to[key] = from[key]
                }
            }

            if (getOwnPropertySymbols) {
                symbols = getOwnPropertySymbols(from)
                for (var i = 0; i < symbols.length; i++) {
                    if (propIsEnumerable.call(from, symbols[i])) {
                        to[symbols[i]] = from[symbols[i]]
                    }
                }
            }
        }

        return to
    }

    var Lexer = function(text) {
        this.line = 0
        this.pos = 0
        this.col = 0
        this.text = text
        this.list = []
    }

    Lexer.prototype = {
        readNum: function(prefix) {
            var has_e = false, after_e = false, has_x = false, has_dot = prefix == '.'
            var num = this.readWhile(function(ch, i) {
                if (ch == 'x' || ch == 'X') {
                    if (has_x) return false
                    return has_x = true
                }
                if (!has_x && (ch == 'E' || ch == 'e')) {
                    if (has_e) return false
                    return has_e = after_e = true
                }
                if (ch == '-') {
                    if (after_e || (i == 0 && !prefix)) return true
                    return false
                }
                if (ch == '+') return after_e
                after_e = false
                if (ch == '.') {
                    if (!has_dot && !has_x) { return has_dot = true }
                    return false
                }
                return isAlphanumericChar(ch)
            })
            if (prefix) { num = prefix + num }
            return {
                value: parseJsNumber(num),
                type: 'number'
            }
        },

        readWhile: function(pred) {
            var ret = '', ch = this.peek(), i = 0
            while (ch && pred(ch, i++)) {
                ret += this.next()
                ch = this.peek()
            }
            return ret
        },

        readName: function() {
            var name = '', ch
            while ((ch = this.peek()) != null) {
                if (isLetter(ch) || isDigit(ch)) {
                    name += this.next()
                } else {
                    break
                }
            }
            return name
        },

        readString: function() {
            var quote = this.next(), ret = ''
            for (; ;) {
                var ch = this.next()
                // if (ch == "\\") ch = read_escaped_char();
                if (ch == quote) break
                ret += ch
            }
            return {
                type: 'string',
                value: ret,
                line: this.line,
                pos: this.pos,
                col: this.col
            }
        },

        readWord: function() {
            var word = this.readName()
            if (HOP(KEYWORD, word)) {
                return {
                    type: 'keyword',
                    value: word,
                    line: this.line,
                    pos: this.pos,
                    col: this.col
                }
            } else if (HOP(KEYWORDS_ATOM, word)) {
                return {
                    type: 'atom',
                    value: word,
                    line: this.line,
                    pos: this.pos,
                    col: this.col
                }
            } else {
                return {
                    type: 'name',
                    value: word,
                    line: this.line,
                    pos: this.pos,
                    col: this.col
                }
            }
        },

        next: function() {
            var ch = this.text.charAt(this.pos++)

            if (ch == '\n') {
                this.line++
                this.col = 0
            } else {
                this.col++
            }
            return ch
        },

        peek: function() {
            return this.text.charAt(this.pos)
        },

        skipWhitespace: function() {
            while (HOP(WHITESPACE_CHARS, this.peek())) {
                this.next()
            }
        },

        scan: function() {
            this.skipWhitespace()
            var ch = this.peek()

            if (isLetter(ch)) {
                return this.readWord()
            } else if (HOP(PUNC_CHARS, ch)) {
                return {
                    type: 'punc',
                    value: this.next()
                }
            } else if (HOP(PUNC_BEFORE_EXPRESSION, ch)) {
                return {
                    type: 'punc',
                    value: this.next()
                }
            } else if (HOP(OPERATOR_CHARS, ch)) {
                if (ch === '&' && this.text.charAt(this.pos + 1) === '&') {
                    this.col += 2
                    this.pos += 2
                    return {
                        type: 'operator',
                        value: '&&'
                    }
                } else if (ch === '|' && this.text.charAt(this.pos + 1) === '|') {
                    this.col += 2
                    this.pos += 2
                    return {
                        type: 'operator',
                        value: '||'
                    }
                } else if (ch === '!' && this.text.charAt(this.pos + 1) === '=') {
                    if (this.text.charAt(this.pos + 2) === '=') {
                        this.col += 3
                        this.pos += 3
                    } else {
                        this.col += 2
                        this.pos += 2
                    }

                    return {
                        type: 'operator',
                        value: '!='
                    }
                } else if (ch === '<' && this.text.charAt(this.pos + 1) === '>') {
                    this.col += 2
                    this.pos += 2
                    return {
                        type: 'operator',
                        value: '!='
                    }
                } else if (ch === '=' && this.text.charAt(this.pos + 1) === '=') {
                    if (this.text.charAt(this.pos + 2) === '=') {
                        this.col += 3
                        this.pos += 3
                    } else {
                        this.col += 2
                        this.pos += 2
                    }
                    return {
                        type: 'operator',
                        value: '='
                    }
                } else if (ch === '>' && this.text.charAt(this.pos + 1) === '=') {
                    this.col += 2
                    this.pos += 2

                    return {
                        type: 'operator',
                        value: '>='
                    }
                } else if (ch === '<' && this.text.charAt(this.pos + 1) === '=') {
                    this.col += 2
                    this.pos += 2

                    return {
                        type: 'operator',
                        value: '<='
                    }
                }

                return {
                    type: 'operator',
                    value: this.next()
                }
            } else if (isDigit(ch)) {
                return this.readNum()
            } else if (ch == '\n') {
                return {
                    type: 'br',
                    value: this.next()
                }
            } else if (ch == '"' || ch == "'") {
                return this.readString()
            }
        },

        start: function() {
            var t = this.scan()
            if (t !== undefined) {
                this.list.push(t)
                this.start()
            }
        }
    }

    var Parser = function(tokens) {
        this.tokens = tokens
        this.index = 0
        this.ast = []
    }

    Parser.prototype = {
        start: function() {
            this.parse()
        },

        _isKeyword: function(item) {
            return item.type === 'keyword' && (item.value === 'from' || item.value === 'where' || item.value === 'select' || item.value === 'orderby' || item.value === 'groupby' || item.value === 'limit')
        },

        _conditions: function() {
            var exp = []

            var item = this.tokens[this.index]
            while (!this._isKeyword(item)) {
                if (this._is('punc', '(')) {
                    this.index++
                    exp.push([this._conditionBlock()])
                } else if (item.value === '&&' || item.value === '||') {
                    this.index++
                    exp.push(item.value)
                    exp.push(this._condition())
                } else if (this._is(item, 'operator', '!')) {
                    var next = this.tokens[this.index + 1]
                    if (this._is(next, 'punc', '(')) {
                        this.index += 2

                        exp.push(['!', this._conditionBlock()])
                    } else if (next.type === 'name') {
                        this.index++
                        exp.push(['!', this._prop()])
                    }
                } else {
                    var arr = this._condition()
                    if (arr.length > 0) {
                        exp.push(arr)
                    }
                }

                this.index++
                item = this.tokens[this.index]
            }

            return exp
        },

        _conditionBlock: function() {
            var exp = []
            var item = this.tokens[this.index]
            while (!(this._is(item, 'punc', ')') || this._isKeyword(item))) {
                if (this._is(item, 'punc', '(')) {
                    this.index++
                    exp.push(this._conditionBlock())
                } else if (item.value === '&&' || item.value === '||') {
                    this.index++
                    exp.push(item.value)
                    exp.push(this._condition())
                } else if (this._is(item, 'operator', '!')) {
                    var next = this.tokens[this.index + 1]
                    if (this._is(next, 'punc', '(')) {
                        this.index += 2
                        exp.push(['!', this._conditionBlock()])
                    } else if (next.type === 'name') {
                        this.index++
                        exp.push(['!', this._prop()])
                    }
                } else {
                    exp.push(this._condition())
                }
                this.index++
                item = this.tokens[this.index]
            }
            return exp
        },

        _condition: function() {
            var exp = []
            var item = this.tokens[this.index]
            while (!(
                this._is(item, 'punc', ')') ||
                ((item.value === '&&' || item.value === '||') && item.type === 'operator') ||
                this._isKeyword(item)
            )) {
                if (this._is(item, 'punc', '(')) {
                    this.index++
                    exp.push(this._conditionBlock())
                } else if (item.type === 'name') {
                    exp.push(this._prop())
                } else if (this._is(item, 'operator', '!')) {
                    var next = this.tokens[this.index + 1]
                    if (this._is(next, 'punc', '(')) {
                        this.index += 2
                        exp.push(['!', this._conditionBlock()])
                    } else if (next.type === 'name') {
                        this.index++
                        exp.push(['!', this._prop()])
                    }
                } else if (item.type === 'atom') {
                    exp.push(atomMapping[item.value])
                } else if (item.type !== 'br') {
                    exp.push(item.value)
                }
                this.index++
                item = this.tokens[this.index]
            }
            this.index--
            return exp
        },

        _prop: function() {
            var result = []
            var item = this.tokens[this.index]
            if (item.type === 'name' && this._is(this.tokens[this.index + 1], 'punc', '(')) {
                this.index += 2
                result = { name: item.value, args: this._args() }
            } else {
                while ((item.type === 'string' || item.type === 'number' || item.type === 'name' || item.type === 'atom' ||
                    (item.type === 'punc' &&
                        (item.value === '.' || item.value === '[' || item.value === ']')))) {
                    if (!(item.type === 'punc' &&
                        (item.value === '.' || item.value === '[' || item.value === ']'))) {
                        if (result.length > 0 || item.type === 'name') {
                            result.push(item.value)
                        } else {
                            result = item
                        }
                    }
                    this.index++
                    item = this.tokens[this.index]
                }
                this.index--
            }

            return result
        },

        _parseCondition: function(preCond) {
            var cond = this._splitArray(preCond, '||'),
                self = this

            cond.forEach(function(item, index) {
                if (isArray(item)) {
                    cond[index] = self._parseCondition(item)
                }
            })

            return cond
        },

        _splitArray: function(array, key) {
            if (array.indexOf(key) === -1) {
                return array
            }

            var result = [],
                current = []

            array.forEach(function(item) {
                if (item !== key) {
                    current.push(item)
                } else {
                    result.push(current)
                    result.push(key)
                    current = []
                }
            })
            result.push(current)
            return result
        },

        _select: function() {
            var item = this.tokens[this.index]
            if (item.value === '{') {
                this.index++
                if (this.tokens[this.index + 1].value === ':') {
                    return this._json()
                } else {
                    return this._simpleJson()
                }
            } else {
                return this._propList()
            }
        },

        _json: function() {
            var result = []
            var item = this.tokens[this.index],
                current = {}

            while (item.value !== '}') {
                if (this.tokens[this.index + 1].value === ':') {
                    current.key = this._prop()[0]
                }
                if (item.value === ':') {
                    this.index++
                    current.value = this._prop()
                } else if (item.value === ',') {
                    this.index++
                    result.push(current)
                    current = {}
                    current.key = this._prop()[0]
                }

                this.index++
                item = this.tokens[this.index]
            }
            result.push(current)
            this.index--
            return { json: result }
        },

        _simpleJson: function() {
            var result = []
            var item = this.tokens[this.index]

            while (item.value !== '}') {
                result = this._propList()
                item = this.tokens[this.index]
            }
            this.index--
            var jsonArr = []
            result.forEach(function(item) {
                jsonArr.push({ key: item[item.length - 1], value: item })
            })
            return { json: jsonArr }
        },

        _propList: function() {
            var result = []
            var item = this.tokens[this.index]

            while (item && item.value !== '}' && !this._isKeyword(item)) {
                if (item.value === ',' || item.type === 'br') {
                    this.index++
                } else {
                    result.push(this._prop())
                    this.index++
                }
                item = this.tokens[this.index]
            }

            return result
        },

        _is: function(item, type, value) {
            return item.type === type && item.value === value
        },

        _args: function() {
            var result = [],
                item = this.tokens[this.index]
            while (!(this._is(item, 'punc', ')'))) {
                if (this._is(this.tokens[this.index], 'punc', ',')) {
                    this.index++
                }

                var exp = this._prop()

                result.push(exp)

                this.index++
                item = this.tokens[this.index]
            }

            return result
        },

        _orderby: function() {
            var prop = []
            var item = this.tokens[this.index]
            var current = { desc: false }
            while (!(item.type === 'keyword' && item.value !== 'desc' && item.value !== 'asc')) {
                if (item.type === 'name') {
                    current.prop = this._prop()
                } else if (this._is(item, 'keyword', 'desc')) {
                    current.desc = true
                    prop.push(current)
                    current = { desc: false }
                } else if (this._is(item, 'punc', ',')) {
                    if (current.prop) {
                        prop.push(current)
                    }
                    current = { desc: false }
                }
                this.index++
                item = this.tokens[this.index]
            }
            if (current.prop) {
                prop.push(current)
            }
            return prop
        },

        _limit: function() {
            var result = []
            var item = this.tokens[this.index]
            while (item && !this._isKeyword(item)) {
                if (item.type === 'number') {
                    result.push(item.value)
                }
                this.index++
                item = this.tokens[this.index]
            }
            return result
        },

        parse: function() {
            var item = this.tokens[this.index]
            if (!item) {
                return
            }

            switch (item.type) {
            case 'keyword':
                switch (item.value) {
                case 'from':
                    var key = this.tokens[this.index + 1].value
                    this.index += 3
                    this.ast.push(['from', [key, this._prop()]])
                    this.index += 1
                    this.parse()
                    break

                case 'where':
                    this.index++
                    this.ast.push(['where', this._parseCondition(this._conditions())])
                    this.parse()
                    break

                case 'select':
                    this.index++
                    this.ast.push(['select', this._select()])
                    this.parse()
                    break

                case 'orderby':
                    this.index++
                    this.ast.push(['orderby', this._orderby()])
                    this.parse()
                    break

                case 'groupby':
                    this.index++
                    this.ast.push(['groupby', this._propList()])
                    this.parse()
                    break

                case 'limit':
                    this.index++
                    this.ast.push(['limit', this._limit()])
                    this.parse()
                    break
                }
                break
            case 'br':
                this.index++
                this.parse()
                break
            }
        }
    }

    var Qone = function(data) {
        this.data = this.extend(data)
        this.ast = null
        this.keyMap = {}
    }

    Qone.methodMap = {}

    Qone.prototype = {
        extend: function(from, to) {
            if (from == null || typeof from != 'object') return from
            if (from.constructor != Object && from.constructor != Array) return from
            if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
                from.constructor == String || from.constructor == Number || from.constructor == Boolean) { return new from.constructor(from) }

            to = to || new from.constructor()

            for (var name in from) {
                to[name] = typeof to[name] == 'undefined' ? this.extend(from[name], null) : to[name]
            }

            return to
        },

        query: function(text) {
            var lexer = new Lexer(text)
            lexer.start()
            var parser = new Parser(lexer.list)
            parser.start()
            this.ast = parser.ast
            this.exce()

            return this.result
        },

        preprocessData: function(key, list) {
            list.forEach(function(subItem, index, self) {
                self[index] = {}
                self[index][key] = subItem
            })
        },

        productSelf: function(key, path) {
            var self = this,
                newCp = []
            this.cp.forEach(function(item) {
                var list = JSON.parse(JSON.stringify(self._getDataByPath(item, path)))
                self.preprocessData(key, list)
                self.productOut([item], list, newCp)
            })
            this.cp = newCp
        },

        exce: function() {
            var ast = this.ast,
                key

            var i = 0, len = ast.length
            for (; i < len; i++) {
                var cmd = ast[i]
                switch (cmd[0]) {
                case 'from':
                    var topName = cmd[1][1][0]
                    if (this.keyMap[topName]) {
                        this.keyMap[cmd[1][0]] = cmd[1][1]
                        this.productSelf(cmd[1][0], cmd[1][1], this.keyMap, this.cp)
                    } else {
                        key = cmd[1][0]
                        var list = this._getDataByPath(this.data, cmd[1][1])
                        this.preprocessData(key, list)
                        if (this.cp) {
                            this.cp = this.product(this.cp, list)
                        } else {
                            this.cp = list
                        }
                        this.keyMap[cmd[1][0]] = cmd[1][1]
                    }

                    if (ast[i + 1][0] === 'where') {
                        this.filter(ast[i + 1][1])
                        i++
                    }
                    break

                case 'where':
                    this.filter(ast[i][1])
                    break

                case 'select':
                    this.select(cmd[1])
                    break

                case 'orderby':
                    var keys = []
                    var orders = []
                    cmd[1].forEach(function(item) {
                        keys.push(item.prop)
                        orders.push(item.desc ? 'desc' : 'asc')
                    })
                    this._orderby(this.cp, keys, orders)
                    break

                case 'groupby':
                    this.groupby(this.cp, cmd[1])
                    key = obj2keys(this.keyMap)[0]
                    this.result.forEach(function(arr) {
                        arr.forEach(function(item, index, scope) {
                            scope[index] = item[key]
                        })
                    })
                    break

                case 'limit':
                    this.limitData(cmd[1])
                    break
                }
            }
        },

        limitData: function(arr) {
            this.result = this.result.splice(arr[0], arr[1])
        },

        // grouper from npm
        groupby: function(arr, props, opts) {
            var comparator,
                self = this
            if (typeof props === 'function') {
                comparator = props
            } else {
                if (isObject(props)) { // argument shuffling for grouping by object value
                    opts = props
                    props = []
                }
                opts = opts || {}
                if (typeof opts.strict === 'undefined') {
                    opts.strict = true // default to strict `===`
                }
                props = [].concat(props).filter(Boolean)
                var propsLen = props.length
                if (propsLen === 0) {
                    comparator = function(a, b) {
                        return deepEqual(a, b, opts)
                    }
                } else {
                    comparator = function(a, b) {
                        var k = -1
                        while (++k < propsLen) {
                            // check if `a` has the same values as `b` for every property in `props`
                            var prop = props[k],
                                left,
                                right

                            if (isArray(prop)) {
                                left = self._getDataByPath(a, prop)
                                right = self._getDataByPath(b, prop)
                            } else {
                                left = self.callMethod(a, prop.name, prop.args)
                                right = self.callMethod(b, prop.name, prop.args)
                            }
                            if (!deepEqual(left, right, opts)) {
                                return false
                            }
                        }
                        return true
                    }
                }
            }

            var result = []
            var arrLen = arr.length
            var i = -1
            // for every `arr[i]` in `arr`...
            while (++i < arrLen) {
                var wasAdded = false
                var resultLen = result.length
                var j = -1
                // for every `result[j]` group in `result`...
                while (++j < resultLen) {
                    // check if `arr[i]` belongs to the `result[j]` group
                    if (comparator(arr[i], result[j][0])) {
                        result[j].push(arr[i])
                        wasAdded = true
                    }
                }
                // if `arr[i]` was not added to any group, create a new group containing only
                // `arr[i]` and add it to `result`
                if (!wasAdded) {
                    result.push([arr[i]])
                }
            }

            this.result = result
        },

        callMethod: function(scope, name, args) {
            var argsValue = [],
                self = this

            args.forEach(function(arg) {
                if (isArray(arg)) {
                    argsValue.push(self._getDataByPath(scope, arg))
                } else {
                    argsValue.push(arg.value)
                }
            })

            return Qone.methodMap[name].apply(null, argsValue)
        },

        select: function(cmd) {
            var result = [],
                self = this,
                json = cmd.json,
                data = null

            if (json) {
                this.cp.forEach(function(item) {
                    var obj = {}
                    if (json.length === 1) {
                        var prop = json[0]
                        if (isArray(prop.value)) {
                            data = self._getDataByPath(item, prop.value)
                        } else {
                            data = self.callMethod(item, prop.value.name, prop.value.args)
                        }
                        obj[prop.key] = data
                        result.push(obj)
                    } else {
                        json.forEach(function(prop) {
                            if (isArray(prop.value)) {
                                data = self._getDataByPath(item, prop.value)
                            } else {
                                data = self.callMethod(item, prop.value.name, prop.value.args)
                            }
                            obj[prop.key] = data
                        })
                        result.push(obj)
                    }
                })
            } else {
                this.cp.forEach(function(item) {
                    if (cmd.length === 1) {
                        var prop = cmd[0]

                        if (isArray(prop)) {
                            data = self._getDataByPath(item, prop)
                        } else {
                            data = self.callMethod(item, prop.name, prop.args)
                        }
                        result.push(data)
                    } else {
                        var arr = []
                        cmd.forEach(function(prop) {
                            if (isArray(prop)) {
                                data = self._getDataByPath(item, prop)
                            } else {
                                data = self.callMethod(item, prop.name, prop.args)
                            }

                            arr.push(data)
                        })
                        result.push(arr)
                    }
                })
            }
            this.result = result
        },

        filter: function(where) {
            var self = this

            var result = []
            this.cp.forEach(function(item) {
                if (self._check(item, where)) {
                    result.push(item)
                }
            })

            this.result = result
            this.cp = result
        },

        product: function(a, b) {
            var result = []
            a.forEach(function(itemA) {
                b.forEach(function(itemB) {
                    result.push(objAssign({}, itemA, itemB))
                })
            })
            return result
        },

        productOut: function(a, b, out) {
            a.forEach(function(itemA) {
                b.forEach(function(itemB) {
                    out.push(objAssign({}, itemA, itemB))
                })
            })
        },

        _isBool: function(cond) {
            var result = true,
                i = 0,
                len = cond.length
            for (; i < len; i++) {
                if (typeof cond[i] === 'object') {
                    result = false
                    break
                }
            }

            return result
        },

        _check: function(item, cond) {
            var self = this
            var len = cond.length

            if (len === 1 && isArray(cond)) {
                return this._check(item, cond[0])
            } else if (len === 2 && cond[0] === '!') {
                return !this._check(item, cond[1])
            } else if (this._isBool(cond)) {
                if (isArray(cond)) {
                    return this._getDataByPath(item, cond)
                } else {
                    return this.callMethod(item, cond.name, cond.args)
                }
            } else if (len === 3 && (cond[1] !== '||' && cond[1] !== '&&')) {
                return this._checkCond(item, cond)
            } else {
                var i = 0,
                    result = true
                while (i < len) {
                    var condItem = cond[i]
                    result = self._check(item, condItem)
                    i++
                    if (result) {
                        if (cond[i] === '||') {
                            return true
                        }
                    } else {
                        if (cond[i] === '&&') {
                            return false
                        }
                    }

                    i++
                }

                return result
            }
        },

        _checkCond: function(item, cond) {
            var result = true,
                left = cond[0],
                right = cond[2]

            if (isArray(left)) {
                left = this._getDataByPath(item, left)
            } else if (isObject(left)) {
                left = this.callMethod(item, left.name, left.args)
            }

            if (isArray(right)) {
                right = this._getDataByPath(item, right)
            } else if (isObject(right)) {
                right = this.callMethod(item, right.name, right.args)
            }
            if (!this._cond(left, cond[1], right)) {
                result = false
            }
            return result
        },

        _cond: function(a, op, b) {
            switch (op) {
            case '>':
                return a > b
            case '<':
                return a < b
            case '>=':
                return a >= b
            case '<=':
                return a <= b
            case '=':
                return a === b
            case '!=':
                return a !== b
            }
        },

        _getDataByPath: function(root, arr) {
            var current = root
            arr.forEach(function(prop, index) {
                current = current[prop]
            })
            return current
        },

        // ipe from https://gist.github.com/finom/727b971ca5d62d25a228
        _orderby: function(arr, keys, orders) {
            var defaultOrder = 'asc',
                commonOrder,
                self = this,
                left,
                right

            if ('length' in arr && typeof arr == 'object') {
                if (!(orders instanceof Array)) {
                    commonOrder = orders || defaultOrder
                }

                keys = keys instanceof Array ? keys : [keys]

                return arr.sort(function(a, b) {
                    var length = keys.length,
                        i,
                        order,
                        key

                    if (a && b) {
                        for (i = 0; i < length; i++) {
                            key = keys[i]
                            order = (commonOrder || orders[i] || defaultOrder) == 'asc' ? -1 : 1

                            if (isArray(key)) {
                                left = self._getDataByPath(a, key)
                                right = self._getDataByPath(b, key)
                            } else {
                                left = self.callMethod(a, key.name, key.args)
                                right = self.callMethod(b, key.name, key.args)
                            }

                            if (left > right) {
                                return -order
                            } else if (left < right) {
                                return order
                            }
                        }
                    }

                    return 0
                })
            } else {
                return []
            }
        }
    }

    var qone = function qone(data) {
        if (arguments.length === 2) {
            var methodName = arguments[0]
            if (Qone.methodMap[methodName]) {
                console.warn('[' + methodName + '] method has been defined. you will rewrite it.')
            }
            Qone.methodMap[methodName] = arguments[1]
        } else {
            return new Qone(data)
        }
    }

    return qone
}))
