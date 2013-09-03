/// <reference path="jquery-1.4.1-vsdoc.js" />
/// <reference path="CalvinUI.Core.js" />

/********************************************************************************************
* 文件名称:	
* 设计人员:	许志伟 
* 设计时间:	
* 功能描述:	
* 注意事项：如果变量前面有带$表示的是JQ对象
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*
********************************************************************************************/
(function () {
    calvin.Create("calvin.ui", function () {

        this.globaldrops = [];
        var defaults = {
            accept: "*",
            mode: "pointer",
            onDragEnter: function (e, source) { },
            onDragOver: function (e, source) { },
            onDragLeave: function (e, source) { },
            onDrop: function (e, source) { }
        };

        var dropHelper = {
            bindEvents: function (target) {
                $(target).addClass('calvinDroppable');

                var opts = $.data(target, 'droppable').options;
                $(target).bind('_dragenter', function (e, source) {
                    opts.onDragEnter.apply(target, [e, source]);
                });
                $(target).bind('_dragleave', function (e, source) {
                    opts.onDragLeave.apply(target, [e, source]);
                });
                $(target).bind('_dragover', function (e, source) {
                    opts.onDragOver.apply(target, [e, source]);
                });
                $(target).bind('_drop', function (e, source) {
                    opts.onDrop.apply(target, [e, source]);
                });
            },
            intersect: function (drag, drop, e, mode) {
                var $drag = $(drag), $drop = $(drop);

                var dragWidth = $drag.outerWidth(), dragHeight = $drag.outerHeight(),
                dropWidth = $drop.outerWidth(), dropHeight = $drop.outerHeight();
                var dragOffset = $drag.offset(), dropOffset = $drop.offset(),
                x1 = dragOffset.left, x2 = x1 + dragWidth,
		        y1 = dragOffset.top, y2 = y1 + dragHeight,
		        l = dropOffset.left, r = l + dropWidth,
		        t = dropOffset.top, b = t + dropHeight;

                if (mode == "pointer") {
                    x1 = e.pageX;
                    y1 = e.pageY;
                }

                switch (mode) {
                    //完全进入                    
                    case "fit":
                        return (l <= x1 && x2 <= r && t <= y1 && y2 <= b);
                        //交叉
                    case "intersect":
                        return (l < x1 + (dragWidth / 2) &&
				x2 - (dragWidth / 2) < r &&
				t < y1 + (dragHeight / 2) &&
				y2 - (dragHeight / 2) < b);
                        //鼠标进入
                    case "pointer":
                        return (l <= x1 && x1 <= r && t <= y1 && y1<= b);
                        //触碰就行，不同于交叉 交叉需要一半以上
                    case "touch":
                        return (
				(y1 >= t && y1 <= b) ||
				(y2 >= t && y2 <= b) ||
				(y1 < t && y2 > b)
			) && (
				(x1 >= l && x1 <= r) ||
				(x2 >= l && x2 <= r) ||
				(x1 < l && x2 > r)
			);
                    default:
                        return false;
                }
            }
        };

        this.firedrop = function (drag, e, isMove) {
            //获取可以停靠的对象
            var droppables = $('.calvinDroppable').filter(function () {
                return e.data.target != this;
            }).filter(function () {
                var accept = $.data(this, 'droppable').options.accept;

                if (!accept) {
                    return false;
                }
                if (accept != "*") {
                    return $(accept).filter(function () {
                        return this == e.data.target;
                    }).length > 0;
                }
                else {
                    return true;
                }
            });
            if (droppables.length > 0) {
                droppables.each(function () {
                    var dropObj = $(this), opts = $.data(this, 'droppable').options;
                    var isfire = dropHelper.intersect(drag, this,e, opts.mode);

                    if (isMove) {
                        if (isfire) {
                            if (!this.entered) {
                                //触发_dragenter事件
                                $(this).trigger('_dragenter', [drag]);
                                this.entered = true;
                            }
                            $(this).trigger('_dragover', [drag]);
                        }
                        else {
                            if (this.entered) {
                                //离开
                                $(this).trigger('_dragleave', [drag]);
                                this.entered = false;
                            }
                        }

                    }
                    else if (isfire) {
                        $(this).trigger('_drop', [drag]);
                        this.entered = false
                    }
                });
            }


        }

        this.calvindroppable = calvin.Class({
            init: function (elem, options) {
                if (typeof elem == "string") {
                    elem = $(elem).get(0);
                }
                if (elem != undefined && elem.nodeName) {
                    this._init.call(elem, options);
                }
            },
            _init: function (options) {
                var state = $.data(this, 'droppable');
                if (state) {
                    $.extend(state.options, options);
                } else {

                    $.data(this, 'droppable', {
                        options: $.extend(defaults, options)
                    });
                    dropHelper.bindEvents(this);
                    //calvin.ui.globaldrops.push(this);
                }
            }

        });


    });


    $.fn.CalvinDroppable = function (options) {

        return this.each(function () {
            new calvin.ui.calvindroppable(this, options);
        });
    };


})();