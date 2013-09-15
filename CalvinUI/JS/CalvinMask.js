/// <reference path="jquery-1.4.1-vsdoc.js" />
/// <reference path="CalvinUI.Core.js" />

/********************************************************************************************
* 文件名称:	
* 设计人员:	许志伟 
* 设计时间:	
* 功能描述:	遮罩层
* 注意事项：
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*
********************************************************************************************/
calvin.Create("calvin.ui", function () {
    var defaults = {
        //遮罩层的样式
        overlayCSS: {
            backgroundColor: '#fff',
            opacity: 0.5
        },
        // IE issues: 'about:blank' fails on HTTPS and javascript:false is s-l-o-w
        // (hat tip to Jorge H. N. de Vasconcelos)
        //IE问题："about:blank" fails on HTTPS and javascript:false is s-l-o-w
        iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',
        //在非IE浏览器中强制使用iframe(handy for blocking applets)
        forceIframe: false,
        baseZ: 1000,
        applyPlatformOpacityRules: true,
        //  http://groups.google.com/group/jquery-en/browse_thread/thread/36640a8730503595/2f6a79a77a78e493#2f6a79a77a78e493
        quirksmodeOffsetHack: 4
    };
    this.masker = calvin.Class(
    {
        init: function (elem, options) {
            this.opts = $.extend(true, options, defaults);
            if (calvin.BodyOrHtmlOrWindow(elem)) {
                this.elem = /body/i.test(elem.nodeName) ? elem : (elem.body || elem.document.body);
                this.full = true; //是页面遮罩还是局部的元素遮罩
            }
            else {
                this.elem = elem;
                this.full = false; //是页面遮罩还是局部的元素遮罩
                //如果不是full的话 元素要设置position=relative 这样是为了方便遮罩层top:0 width100% left:0 height100%
                //遮盖元素
                var position = this.elem.style.position;
                if (position == 'static' || position == "")
                    this.elem.style.position = 'relative';
            }
            this.ie6 = ($.browser.msie & $.browser.version === 6.0), this.boxModel = $.boxModel;
            this.CreateMask();
            this.SetMaskStyle();

        },
        CreateMask: function () {
            var opts = this.opts, z_index = opts.baseZ;
            //构造iframe层 遮住select
            var iframeLayer;
            //在IE6或者非IE浏览器强制使用iframe iframe的作用是为了遮盖住select 是完全透明的
            if (this.ie6 || opts.forceIframe) {
                iframeLayer = $('<iframe class="CalvinUIBlock" style="z-index:' + (z_index++) + ';border:none;margin:0;padding:0;width:100%;height:100%;top:0px;left:0px;" src="' + opts.iframeSrc + '"></iframe>');
            }
            else {
                //如果是其他的浏览器默认给一个空值
                iframeLayer = $('<div class="CalvinUIBlock" style="width:0px;height:0px;top:0px; left:0px;"></div>');
            }
            //该div层的作用在iframe层上形成一个半透明的灰色（可以自定义颜色）遮罩
            var divOverlay = $('<div class="CalvinUIBlock blockOverlay" style="z-index:' + (z_index++) + ';border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');
            iframeLayer.appendTo(this.elem), divOverlay.appendTo(this.elem);
            this.$lyr1 = iframeLayer, this.$lyr2 = divOverlay;

        },
        SetMaskStyle: function () {
            var opts = this.opts;
            //要把body的margin和padding设置为0 不然有滚动条
            if (this.full) {
                $("body").css({ "margin": "0px", "padding": "0px" });
            }
            //设置透明度 iframe为完全透明
            if (this.ie6 || opts.forceIframe) {
                this.$lyr1.css('opacity', 0);
            }
            this.$lyr2.css(opts.overlayCSS);

            //IE6下不支持fixed要重新设置
            if (!this.ie6 && this.boxModel) {
                this.$lyr1.css('position', this.full ? 'fixed' : 'absolute');
                this.$lyr2.css('position', this.full ? 'fixed' : 'absolute');
            }
            else {
                $('html,body').css({ 'height': '100%', 'width': '100%', 'margin': '0px' });
                this.$lyr1.css("position", 'absolute');
                this.$lyr2.css("position", 'absolute');

                if (this.full) {
                    var height = Math.max(document.body.scrollHeight, document.body.offsetHeight);
                    var width = document.documentElement.offsetWidth || document.body.offsetWidth;
                    if (!this.boxModel) {
                        height -= opts.quirksmodeOffsetHack;
                    }
                    if (this.ie6) {
                        width -= 20; //IE6下100%多出20个像素
                    }
                    this.$lyr1.height(height).width(width);
                    this.$lyr2.height(height).width(width);
                }
                else {
                    var s1P = this.$lyr1.parent(), s2p = this.$lyr2.parent();
                    this.$lyr1.height(s1P.innerHeight()).width(s1P.width() - (this.ie6 ? 20 : 0));
                    this.$lyr2.height(s2p.innerHeight()).width(s2p.width() - (this.ie6 ? 20 : 0));
                }
            }
        },
        /**
        * @description 移除遮罩层
        */
        removeMask: function () {
            this.$lyr1.remove();
            this.$lyr2.remove();
        },
        /**
        * @description 隐藏遮罩层
        */
        hideMask: function () {
            this.$lyr1.hide();
            this.$lyr2.hide();
        },
        /**
        * @description 显示遮罩层
        */
        showMask: function () {
            this.$lyr1.show();
            this.$lyr2.show();
        }

    });
});