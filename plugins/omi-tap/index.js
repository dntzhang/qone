/*!
 *  omi-tap v0.1.0 by dntzhang
 *  Support tap event in your Omi project.
 *  Github: https://github.com/AlloyTeam/omix
 *  MIT Licensed.
 */

;(function () {

    if(typeof Omi === 'undefined') return

    var OmiTap = {};



    var noop = function(){

    };


    Omi.extendPlugin('omi-tap',function(dom, instance) {

        var x1,
            y1
        dom.addEventListener('touchstart', function (evt) {
            x1 = evt.touches[0].pageX
            y1 = evt.touches[0].pageY

        }, false)
        dom.addEventListener('touchend', function (evt) {

            if (evt.changedTouches[0].pageX - x1 < 30 && evt.changedTouches[0].pageY - y1 < 30) {
                getHandler('tap',dom,instance)(evt)
            }
        }, false)
    });

    function getHandler(name, dom, instance) {
        var value = dom.getAttribute(name);
        if (value === null) {
            if (dom[name]) {
                return function (evt) {
                    dom[name].bind(instance)(evt, dom);
                }
            }
            return noop;
        } else {
            return function (evt) {
                instance[value].bind(instance)(evt, dom);
            }
        }
    };

    if (typeof exports == "object") {
        module.exports = OmiTap;
    } else if (typeof define == "function" && define.amd) {
        define([], function(){ return OmiTap });
    } else {
        window.OmiFinger = OmiTap;
    }

})();