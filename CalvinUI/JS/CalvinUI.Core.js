/// <reference path="jquery-1.4.1-vsdoc.js" />
(function () {
    var topNamespace = this; window.calvin = window.calvin || {};
    calvin.registerNamespace = function (namespacePath) {
        var rootObject = topNamespace;
        var namespaceParts = namespacePath.split('.');

        for (var i = 0, l = namespaceParts.length; i < l; i++) {
            var currentPart = namespaceParts[i];
            var ns = rootObject[currentPart];
            var nsType = typeof (ns);
            if (!ns) {
                ns = rootObject[currentPart] = {};
            }
            if (!ns.__namespace) {

                ns.__namespace = true;
                ns.__typeName = namespaceParts.slice(0, i + 1).join('.');
                ns.getName = function ns$() { return this.__typeName; }
            }
            rootObject = ns;
        }
        return rootObject;
    };
    calvin.Create = function () {

        var name = arguments[0],
						func = arguments[arguments.length - 1],
						ns = topNamespace,
						returnValue;
        if (typeof func === "function") {
            if (typeof name === "string") {
                ns = calvin.registerNamespace(name);
            } else if (typeof name === "object") {
                ns = name;
            }
            ns.instanceName = name;
            returnValue = func.call(ns, this);
        } else {
            throw new Error("Function required");
        }

    };
    calvin.Class = function () {
        var length = arguments.length, members = arguments[length - 1];

        if (length == 2) {
            var superClass = arguments[0].base;
            var subClass = function () {
                //构造base 可以不用关注
                this.base = this.base || {};
                var _this = this;
                for (var name in superClass.prototype) {
                    if (typeof superClass.prototype[name] == "function") {
                        this.base[name] = (function _helper(x, scope) {
                            return function () {
                                superClass.prototype[x].apply(scope, arguments);
                            };
                        })(name, _this);
                    }
                }
                this.init.apply(this, arguments);
            }
            // 指定原型
            subClass.prototype = new superClass();
            // 重新指定构造函数
            subClass.prototype.constructor = subClass;
            //扩展子类
            this.extend(subClass.prototype, members);
            return subClass;

        }
        else {
            members.init = members.init || function () { };
            var newClass = function () {
                this.init.apply(this, arguments);
            }
            //修正 改为扩展 废除newClass.prototype = members;
            topNamespace.jQuery.extend(newClass.prototype, members);
            return newClass;
        }

    };
    calvin.Create("CalvinTimeDelayMaker", function () {
        this.throttle = function (delay, action, tail, debounce, ctx) {
            var now = function () {
                return new Date();
            }, last_call = 0, last_exec = 0, timer = null, curr, diff,
       args, exec = function () {
           last_exec = now();
           action.apply(ctx, args);
       };

            return function () {
                ctx = ctx || this, args = arguments,
        curr = now(), diff = curr - (debounce ? last_call : last_exec) - delay;

                clearTimeout(timer);

                if (debounce) {
                    if (tail) {
                        timer = setTimeout(exec, delay);
                    } else if (diff >= 0) {
                        exec();
                    }
                } else {
                    if (diff >= 0) {
                        exec();
                    } else if (tail) {
                        timer = setTimeout(exec, -diff);
                    }
                }

                last_call = curr;
            }
        }

        this.debounce = function (idle, action, tail, ctx) {
            return CalvinTimeDelayMaker.throttle(idle, action, tail, true, ctx);
        }

    })
})();