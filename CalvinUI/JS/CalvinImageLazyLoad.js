/// <reference path="jquery-1.4.1-vsdoc.js" />
/// <reference path="CalvinUI.Core.js" />
/// <reference path="CalvinLazyLoad.js" />

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

        this.calvinimagelazyload = calvin.Class({ base: calvin.ui.calvinlazyload }, {

            init: function (images, options) {
                if (!images || images.length == 0) {
                    return;
                }
                this.initialize(images, options);
                //进行第一次触发
                if (this.isTop) {
                    $(window).trigger("scroll");
                } else {
                    this.load();
                }
            }

        });
        $.extend(this.calvinimagelazyload.prototype, {
            //初始化程序
            initialize: function (images, options) {
                if (!images.slice) {
                    this.elems = $.makeArray(images);
                } else {
                    this.elems = images;
                }
                this.base.initialize.call(this, this.elems, options);
                //设置子类属性
                var opt = this.opts;
                this.onLoad = opt.onLoad;
                var attribute = opt.attribute;

                if (opt.holder) {
                    $.each(this.elems, function () {
                        this.src = opt.holder;
                    });
                }
            },
            //设置默认属性
            setOptions: function (options) {
                return this.base.setOptions.call(this, $.extend({//默认值
                    attribute: "_lazysrc", //保存原图地址的自定义属性
                    holder: "", //占位图
                    onLoad: function () { } //加载时执行
                }, $.extend(options, {
                    onLoadData: this._onLoadData
                })));
            },
            //显示图片
            _onLoadData: function (img) {
                var imagePath = img.getAttribute(this.opts.attribute);
                if (imagePath) {
                    img.src = imagePath;
                    img.removeAttribute(this.opts.attribute);
                    this.onLoad(img);
                }
            }
        });


    });


})();

