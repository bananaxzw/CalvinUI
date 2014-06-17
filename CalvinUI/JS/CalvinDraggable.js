/// <reference path="jquery-1.4.1-vsdoc.js" />
/// <reference path="CalvinBase.js" />
/// <reference path="CalvinDroppable.js" />

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
        var defaults = {
            //值为"clone"或者是返回jq元素的function
            proxy: false,
            revert: false,
            cursor: 'move',
            //handle代表对象拖拉的 手柄的区域 比如有个panel可以设置它的handle为header部位
            handle: null,
            disabled: false,
            //可拖动的偏移量
            edge: 0,
            //拖动偏移

            //移动限制 只能在某个范围内移动 值为Dom元素
            containment: null,
            axis: null, // v or h
            onStartDrag: function (e) { },
            onDrag: function (e) { },
            onStopDrag: function (e) { }
        };
        var dragHelper = {
            getBasePositon: function (e) {
                var baseTop = 0, baseLeft = 0;
                var proxy = $.data(e.data.target, 'draggable').proxy;
                if (proxy) {
                    baseLeft = parseFloat(proxy.attr("_startLeft"));
                    baseTop = parseFloat(proxy.attr("_startTop"));

                } else {
                    baseLeft = e.data.startLeft;
                    baseTop = e.data.startTop;
                }
                baseLeft = isNaN(baseLeft) ? 0 : baseLeft;
                baseTop = isNaN(baseTop) ? 0 : baseTop;
                return {
                    baseTop: baseTop,
                    baseLeft: baseLeft
                }
            },
            createProxy: function (e) {
                var target = $(e.data.target),
                offset = target.offset(),
                zIndex = target.css('zIndex');

                // 代理元素的zIndex值始终比拖拽元素的zIndex高
                if (!zIndex) {
                    target.css('zIndex', '1');
                    zIndex = '2';
                }
                else {
                    zIndex = parseInt(zIndex) + 1;
                }
                var proxy = $.data(e.data.target, 'draggable').proxy;
                if (!proxy) {
                    proxy = $('<div class="eui_drag_proxy" style="position:absolute;' +
                    'border:1px dashed #a0a1a2;"/>');
                }

                proxy.css({
                    top: offset.top + 'px',
                    left: offset.left + 'px',
                    cursor: 'move',
                    width: target.width() - 4 + 'px',
                    height: target.height() - 4 + 'px',
                    zIndex: zIndex
                });
                proxy.attr({ "_startLeft": offset.left, "_startTop": offset.top });
                return proxy;
            }


        };

        var Boundary = {
            getContainerBoundary: function (container) {
                var isWindow = (container == null || container == window || container == document || !container.tagName || (/^(?:body|html)$/i).test(container.tagName));
                if (isWindow) {
                    container = document.body || document.documentElement;
                }
                container = $(container);
                var borderTopWidth = 0,
                borderRightWidth = 0,
                borderBottomWidth = 0,
                borderLeftWidth = 0,
                cOffset = container.offset(),
                cOffsetTop = cOffset.top,
                cOffsetLeft = cOffset.left;


                borderTopWidth = parseFloat(container.css('borderTopWidth'));
                borderRightWidth = parseFloat(container.css('borderRightWidth'));
                borderBottomWidth = parseFloat(container.css('borderBottomWidth'));
                borderLeftWidth = parseFloat(container.css('borderLeftWidth'));
                return {
                    top: cOffsetTop + borderTopWidth,
                    right: cOffsetLeft + container.outerWidth() - borderRightWidth,
                    left: cOffsetLeft + borderLeftWidth,
                    bottom: cOffsetTop + container.outerHeight() - borderBottomWidth
                };
            },
            getTargetBoundary: function (target) {
                target = $(target);
                var cOffset = target.offset(),
                cOffsetTop = cOffset.top,
                cOffsetLeft = cOffset.left;

                return {
                    top: cOffsetTop,
                    right: cOffsetLeft + target.outerWidth(),
                    left: cOffsetLeft,
                    bottom: cOffsetTop + target.outerHeight()
                };
            }
        }
        var eventHelper = {
            beginDrag: function (e) {
                var opts = $.data(e.data.target, 'draggable').options;

                //拖动元素时候的代理元素  值为"clone"或者是返回jq元素的function 如果没有的话 就使用本身
                var proxy = $.data(e.data.target, 'draggable').proxy;
                if (!proxy) {
                    if (opts.proxy) {
                        //                    if (opts.proxy == 'clone') {
                        //                        proxy = $(e.data.target).clone().insertAfter(e.data.target);
                        //                    }
                        //                    else {
                        //                        proxy = opts.proxy.call(e.data.target, e.data.target);
                        //                    }
                        proxy = dragHelper.createProxy(e);
                        proxy.appendTo(document.body);
                        $.data(e.data.target, 'draggable').proxy = proxy;
                        //                    //proxy.css('position', 'absolute');
                    }
                    else {
                        proxy = $(e.data.target);
                    }
                }



                //eventHelper.onDrag(e);
                //eventHelper.applyDrag(e);

                opts.onStartDrag.call(e.data.target, e);
                return false;
            },
            onDrag: function (e) {
                var opts = $.data(e.data.target, 'draggable').options;
                if (opts.containment && e.data.startPosition != 'fixed') {
                    eventHelper.moveInContainment(e);
                }
                else {
                    eventHelper.drag(e);
                }
                if ($.data(e.data.target, 'draggable').options.onDrag.call(e.data.target, e) != false) {
                    eventHelper.applyDrag(e);
                }

                var source = e.data.target;
                //触发droppable事件
                if (calvin.ui.firedrop) {
                    calvin.ui.firedrop(source, e, true);
                }

                return false;


            },
            endDrag: function (e) {
                var opts = $.data(e.data.target, 'draggable').options;
                if (opts.containment && e.data.startPosition != 'fixed') {
                    eventHelper.moveInContainment(e);
                }
                else {
                    eventHelper.drag(e);
                }
                var proxy = $.data(e.data.target, 'draggable').proxy,
             basePositon = dragHelper.getBasePositon(e),
            baseTop = basePositon.baseTop,
            baseLeft = basePositon.baseLeft;
                //如果设置revert 为true则会还原到原先位置
                if (opts.revert) {
                    //如果是拖动到可drop对象内 应该立即消失 模拟已经放到容器中 （可定制事件）
                    if (checkDrop() == true) {
                        removeProxy();
                        $(e.data.target).css({
                            //position: e.data.startPosition,
                            left: e.data.startLeft,
                            top: e.data.startTop
                        });
                    }
                    else {
                        //如果没有拖动对象内 则用动画返回
                        if (proxy) {
                            proxy.animate({
                                left: baseLeft,
                                top: baseTop
                            }, function () {
                                removeProxy();
                            });
                        }
                        else {
                            $(e.data.target).animate({
                                left: e.data.startLeft,
                                top: e.data.startTop
                            }, function () {
                                $(e.data.target).css('position', e.data.startPosition);
                            });
                        }
                    }
                }
                else {
                    //一定采用拖拉对象的开始位置 因为proxy可能存在
                    $(e.data.target).css({
                        left: e.data.left + e.data.startLeft,
                        top: e.data.top + e.data.startTop
                    });
                    removeProxy();
                    //拖放事件
                    if (calvin.ui.firedrop) {
                        calvin.ui.firedrop(e.data.target, e, false);
                    }
                }

                opts.onStopDrag.call(e.data.target, e);

                function removeProxy() {
                    if (proxy) {
                        proxy.remove();
                    }
                    $.data(e.data.target, 'draggable').proxy = null;
                };

                $(document).unbind('.draggable');
                return false;

            },
            applyDrag: function (e) {
                var opts = $.data(e.data.target, 'draggable').options;
                var proxy = $.data(e.data.target, 'draggable').proxy;
                // var baseTop = 0, baseLeft = 0;
                if (proxy) {
                    proxy.css('cursor', opts.cursor);
                } else {
                    proxy = $(e.data.target);
                    //baseLeft = e.data.startLeft;
                    // baseTop = e.data.startTop;
                    $.data(e.data.target, 'draggable').handle.css('cursor', opts.cursor);
                }
                var basePostion = dragHelper.getBasePositon(e);
                proxy.css({
                    left: e.data.left + basePostion.baseLeft,
                    top: e.data.top + basePostion.baseTop
                });
            },
            drag: function (e) {
                /// <summary>
                /// 无容器的移动 这里只是获取e的位置信息 然后applyDrag应用这个位置信息
                /// </summary>
                /// <param name="e"></param>
                var opts = $.data(e.data.target, 'draggable').options;

                var dragData = e.data;
                var left = e.pageX - dragData.startX; //dragData.startLeft + e.pageX - dragData.startX;
                var top = e.pageY - dragData.startY; //dragData.startTop + e.pageY - dragData.startY;
                //console.log(left);
                //如果父元素不是body就加上滚动条
                if (e.data.parent != document.body) {
                    if ($.boxModel == true && e.data.startPosition != 'fixed') {
                        left += $(e.data.parent).scrollLeft();
                        top += $(e.data.parent).scrollTop();
                    }
                }
                //如果只允许水平或者垂直 只单单设置top或者left
                if (opts.axis == 'h') {
                    dragData.left = left;
                } else if (opts.axis == 'v') {
                    dragData.top = top;
                } else {
                    dragData.left = left;
                    dragData.top = top;
                }
            },
            moveInContainment: function (e) {
                /// <summary>
                /// 有容器的移动 这里只是获取e的位置信息 然后applyDrag应用这个位置信息
                /// </summary>
                /// <param name="e"></param>
                var data = $.data(e.data.target, 'draggable');
                var opts = data.options;
                var containment = opts.containment;
                var dragData = e.data;
                var ConstrainArea = dragData.ConstrainArea;
                var elementArea = dragData.targetArea;

                //移动的X方向距离
                var moveX = e.pageX - dragData.startX;
                //移动的Y方向距离
                var moveY = e.pageY - dragData.startY;

                //向左移动 但是移动距离不能超过2者的右边之差
                if (moveX > 0) {
                    moveX = Math.min((ConstrainArea.right - elementArea.right), moveX);
                }
                else {
                    moveX = Math.max((ConstrainArea.left - elementArea.left), moveX);
                }
                //向下移动 但是移动距离不能超过2者的下边之差
                if (moveY > 0) {
                    moveY = Math.min((ConstrainArea.bottom - elementArea.bottom), moveY);
                }
                else {
                    moveY = Math.max((ConstrainArea.top - elementArea.top), moveY);
                }

                dragData.left = moveX; // dragData.startLeft + moveX;
                dragData.top = moveY; // dragData.startTop + moveY;

            }
        };

        this.cavindrag = calvin.Class({
            init: function (elem, options) {
                if (typeof elem == "string") {
                    elem = $(elem).get(0);
                }
                if (elem != undefined && elem.nodeName) {
                    this._init.call(elem, options);
                }
            },
            _init: function (options) {
                //handle代表对象拖拉的 手柄的区域 比如有个panel可以设置它的handle为header部位
                var opts, $this = $(this);
                var state = $.data(this, 'draggable');
                if (state) {
                    state.handle.unbind('.draggable');
                    opts = $.extend(state.options, options);
                } else {
                    opts = $.extend({}, defaults, options || {});
                }

                if (opts.disabled == true) {
                    $this.css('cursor', 'default');
                    return;
                }
                if (opts.containment) {
                    $this.css("margin", "0px");
                }

                var handle = null;
                if (typeof opts.handle == 'undefined' || opts.handle == null) {
                    handle = $(this);
                } else {
                    handle = (typeof opts.handle == 'string' ? $(opts.handle, this) : opts.handle);
                }
                $.data(this, 'draggable', {
                    options: opts,
                    handle: handle
                });
                var positiontype = $this.css("position")
                if (positiontype == "" || positiontype == "static") {
                    $this.css({ "position": "relative", "top": 0, "left": 0 });
                }


                // bind mouse event using event namespace draggable
                handle.bind('mousedown.draggable', { target: this }, onMouseDown);
                handle.bind('mousemove.draggable', { target: this }, onMouseMove);

                function onMouseDown(e) {
                    if (checkArea(e) == false) return;
                    var $target = $(e.data.target);
                    var position = $target.position(), startLeft = 0, startTop = 0;
                    if (positiontype == "fixed" || positiontype == "absolute") {
                        startLeft = position.left - (positiontype == "fixed" ? $(document).scrollLeft() : 0);
                        startTop = position.top - (positiontype == "fixed" ? $(document).scrollTop() : 0);
                    } else {
                        startLeft = parseFloat($target.css("left"));
                        startTop = parseFloat($target.css("top"));
                        startLeft = isNaN(startLeft) ? 0 : startLeft;
                        startTop = isNaN(startTop) ? 0 : startTop;
                    }
                    var data = {
                        startPosition: positiontype,
                        startLeft: startLeft,
                        startTop: startTop,
                        left: position.left,
                        top: position.top,
                        startX: e.pageX,
                        startY: e.pageY,
                        target: e.data.target,
                        parent: $(e.data.target).parent()[0],
                        targetArea: {},
                        ConstrainArea: {},
                        proxy: opts.proxy
                    };
                    computeArea(opts.containment, e.data.target);
                    $(document).bind('mousedown.draggable', data, eventHelper.beginDrag);
                    $(document).bind('mousemove.draggable', data, eventHelper.onDrag);
                    $(document).bind('mouseup.draggable', data, eventHelper.endDrag);
                    //计算目标区划 和 限制区划
                    function computeArea(constrain, target) {
                        data.ConstrainArea = Boundary.getContainerBoundary(constrain);
                        data.targetArea = Boundary.getTargetBoundary(target);
                    }
                };

                function onMouseMove(e) {
                    if (checkArea(e)) {
                        $(this).css('cursor', opts.cursor);
                    } else {
                        $(this).css('cursor', 'default');
                    }
                };

                // 鼠标是不是在手柄的可拖动区域
                function checkArea(e) {
                    var offset = $(handle).offset();
                    var width = $(handle).outerWidth();
                    var height = $(handle).outerHeight();
                    var edge = opts.edge;
                    if (e.pageY - offset.top > edge) {
                        if (offset.left + width - e.pageX > edge) {
                            if (offset.top + height - e.pageY > edge) {
                                if (e.pageX - offset.left > edge) {
                                    return true;
                                }
                                return false;
                            }
                            return false;
                        }
                        return false;
                    }
                    return false;
                };


            }
        });

    });



    $.fn.CalvinDraggable = function (options, params) {

        return this.each(function () {

            new calvin.ui.cavindrag(this, options);


        });
    };
})();