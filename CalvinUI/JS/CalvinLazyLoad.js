﻿//正交加载只会加载指定视窗范围内的元素 
//水平方向  满足水平坐标的元素都加载 一列一列
//垂直方向 满足垂直坐标的元素都加载 一行一行
/********************************************************************************************
* 文件名称:	
* 设计人员:	许志伟 
* 设计时间:	
* 功能描述:	
* 注意事项：
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*
********************************************************************************************/

(function () {
    calvin.Create("calvin.ui", function () {
        var lazyloadHelper = {
            getVisibleRect: function (elem, addBoarder) {
                /// <summary>
                /// 获取可视区域
                /// </summary>
                /// <param name="addBoarder">是否包括边框</param>
                if (!elem) return { top: 0, bottom: 0, left: 0, right: 0 };
                var isTop = calvin.BodyOrHtmlOrWindow(elem);
                var $elem = $(elem), offset = $elem.offset(), top = offset.top, left = offset.left, right, bottom;
                var borderTopWidth = parseFloat($elem.css("borderTopWidth")), borderRightWidth = parseFloat($elem.css("borderRightWidth")),
            borderLeftWidth = parseFloat($elem.css("borderLeftWidth")), borderBottomWidth = parseFloat($elem.css("borderBottomWidth")),
            innerHeight = parseFloat($elem.innerHeight()), innerWidth = parseFloat($elem.innerWidth());
                if (isTop) {
                    top = 0, left = 0, bottom = 0, right = 0;
                    innerHeight = parseFloat(document.documentElement["clientHeight"] || document.body["clientHeight"]);
                    innerWidth = parseFloat(document.documentElement["clientWidth"] || document.body["clientWidth"]);
                    top += $(document).scrollTop(), left += $(document).scrollLeft();
                }
                if (!addBoarder) {
                    top = top + borderTopWidth, bottom = top + innerHeight, left = left + borderLeftWidth, right = left + innerWidth;
                }
                else {
                    bottom = top + borderTopWidth + innerHeight + borderBottomWidth, right = left + borderLeftWidth + innerWidth + borderRightWidth;
                }
                return { top: top, bottom: bottom, left: left, right: right };
            },
            insideRange: function (containerRect, elemRect, mode) {
                /// <summary>
                /// 判断元素是否在容器范围内
                /// </summary>
                /// <param name="containerRect"></param>
                /// <param name="elemRect"></param>
                /// <param name="mode"></param>
                /// <returns type=""></returns>
                var insideH = elemRect.right >= containerRect.left && elemRect.left <= containerRect.right,
		insideV = elemRect.bottom >= containerRect.top && elemRect.top <= containerRect.bottom,
		inside = {
		    "horizontal": insideH,
		    "vertical": insideV,
		    "cross": insideH && insideV
		}[mode || "cross"];
                //在加载范围内加载数据
                return inside;

            },
            setElemsRect: function (elems) {
                /// <summary>
                /// 给elems添加范围的属性 rect
                /// </summary>
                /// <param name="elems"></param>
                var elem;
                for (var i = 0; i < elems.length; i++) {
                    elem = elems[i];
                    elem.rect = lazyloadHelper.getVisibleRect(elem, true);
                }

            }

        }
        this.calvinlazyload = calvin.Class({
            init: function (elems, options) {
                if (!elems || elems.length == 0) {
                    return false;
                }
                //初始化程序
                this.initialize(elems, options);
                //如果没有元素就退出
                if (this.isFinish()) return false;
                //进行第一次触发
                var othis = this;
                setTimeout(function () {
                    if (!othis.initializeLoaded)
                    { $(othis.isTop ? window : othis.container).trigger("scroll"); }
                }, 50);
            }

        });
        $.extend(this.calvinlazyload.prototype, {
            initializeLoaded: false,
            elems: [],
            isTop: false,
            initialize: function (elems, options) {
                this.setOptions(options);
                this.elems = elems;
                this.container = this.initContainer(this.opts.container);
                lazyloadHelper.setElemsRect(this.elems);
            },
            setOptions: function (options) {
                this.opts = {//默认值
                    container: window, //容器
                    mode: "cross", //模式
                    delay: 50, //延时时间
                    beforeLoad: function () { }, //加载前执行
                    onLoadData: function () { } //显示加载数据
                };
                return $.extend(this.opts, options || {});
            },
            //初始化容器设置
            initContainer: function (container) {
                var doc = document, isTop = calvin.BodyOrHtmlOrWindow(container);
                this.isTop = isTop;
                if (isTop) {
                    container = doc.compatMode == 'CSS1Compat' ? doc.documentElement : doc.body;
                }
                var $container = $(container);
                //定义执行方法
                var oThis = this, width = container.clientWidth, height = container.clientHeight;
                //绑定事件 滚动时候和relize时候触发
                $(isTop ? window : container).bind("scroll", calvin.CalvinTimeDelayMaker.throttle(oThis.delay, function () {
                    oThis.load.call(oThis);
                    this.initializeLoaded = true;
                }, true));
                isTop && $(window).bind("resize", calvin.CalvinTimeDelayMaker.throttle(oThis.delay, function () {
                    //是否已经改变了 宽度
                    var clientWidth = container.clientWidth, clientHeight = container.clientHeight;
                    if (clientWidth != width || clientHeight != height) {
                        width = clientWidth; height = clientHeight;
                        this.initializeLoaded = true;
                        oThis.load.call(oThis)
                    }
                }, true));
                this.containerRect = lazyloadHelper.getVisibleRect(container);

                return container;
            },
            //加载程序
            load: function (force) {
                if (this.isFinish()) {
                    this.dispose();
                }
                if (this.isTop) {
                    this.containerRect = lazyloadHelper.getVisibleRect(this.container);
                } else {
                    lazyloadHelper.setElemsRect(this.elems);

                }
                //加载数据
                //this.beforeLoad();
                this._loadData(force);
            },
            _loadData: function (force) {
                /// <summary>
                /// 内部使用
                /// </summary>
                /// <param name="force"></param>
                var mode = this.opts.mode, elem;
                var onloadData = this.opts.onLoadData;
                for (var i = 0; i < this.elems.length; i++) {
                    elem = this.elems[i];
                    if (lazyloadHelper.insideRange(this.containerRect, elem.rect, mode)) {
                        onloadData.call(this, elem);
                        calvin.Array.remove(this.elems, elem);
                        --i;
                    }
                }

            },
            //是否完成加载
            isFinish: function () {
                if (!this.elems || !this.elems.length) {
                    this.dispose();
                    return true;
                } else {
                    return false;
                }
            },
            //销毁程序
            dispose: function (load) {
                if (this.isTop) {
                    $(window).unbind("scroll").unbind("resize");
                }
                else {
                    $(this.container).unbind("scroll");
                }
            }
        });

    });

 })();


