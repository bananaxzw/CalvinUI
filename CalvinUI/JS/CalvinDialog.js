﻿/// <reference path="jquery.min.js" />
/// <reference path="CalvinUI.Core.js" />
/// <reference path="CalvinMask.js" />
/// <reference path="CalvinDraggable.js" />

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
calvin.Create("calvin.ui", function () {
    var Defaults = {
        title: "",
        footer: "",
        message: "",
        showTitle: true,
        showFooter: true,
        zIndex: 1000,
        showClose: true,
        autoShow: false,
        centerX: true,
        centerY: true,
        showOverlay: true,
        overlayCSS: {
            backgroundColor: '#fff',
            opacity: 50
        },
        dialogCSS: {},
        messageCSS: {},
        dragable: false
    };
    this.dialog = calvin.Class({
        init: function (elem, options) {

            var full, ie6 = calvin.ie6(), options = $.extend(true, Defaults, options);
            if (calvin.BodyOrHtmlOrWindow(elem)) {
                this.elem = /body/i.test(elem.nodeName) ? elem : (elem.body || elem.document.body);
                full = true; //window或者document为true
            }
            else {
                this.elem = elem;
                full = false; //window或者document为true
                //如果不是full的话 元素要设置position=relative 这样是为了方便遮罩层top:0 width100% left:0 height100%
                //遮盖元素
                var positionType = this.elem.style.position;
                if (positionType === 'static' || positionType === "") {
                    this.elem.style.position = 'relative';
                }
            }
            $.data(this.elem, "calvindialog", { options: options, ie6: ie6, full: full, container: this.elem });
            DialogHelper.createMask(this.elem);
            //返回同期id
            var id = DialogHelper.wrapDialog(this.elem);
            DialogHelper.setDialogStyle(this.elem);
            if (!options.autoShow) {
                this.close();
            }
            if (options.showTitle) {
                if (options.dragable) {
                    $(id).CalvinDraggable({ containment: this.elem, handle: "div.Dialog_title" });
                }
            }
        },
        close: function () {
            DialogHelper.close(this.elem);
        },
        open: function () {
            DialogHelper.open(this.elem);
        }

    });
    var DialogHelper = {

        close: function (elem) {
            var dialogData = $.data(elem, "calvindialog");
            dialogData.$dialog.hide();
            if (dialogData.mask) {
                dialogData.mask.hideMask();
            }
        },
        open: function (elem) {
            var dialogData = $.data(elem, "calvindialog");
            dialogData.$dialog.show();
            if (dialogData.mask) {
                dialogData.mask.showMask();
            }
        },
        wrapDialog: function (elem) {
            var dialogData = $.data(elem, "calvindialog"),
            id = new Date().getTime(),
            opts = dialogData.options,
            $dialog = $("<div id='calvinDialog" + id + "' class='calvinDialog' style='display:block;position:" + (dialogData.full ? 'fixed' : 'absolute') + ";z-index:" + (opts.zIndex + 2) + ";margin: 0px;'></div>"),
            dialogContent = $('<div class="Dialog_content"></div>'),
            message = opts.message;
            $(opts.globalAppend ? opts.globalAppend : elem).append($dialog);
            $dialog.append(dialogContent);
            $dialog.css(opts.dialogCSS);
            if (opts.showTitle) {
                var dialogTitle = $('<div class="Dialog_title" id=\"Dialog_title' + id + '" style="cursor: move;"><h4 style="float:left;display:inline-block;margin:0;">' + opts.title + '</h4></div>');
                if (opts.showClose) {
                    var closeBtn = $('<a href="javascript:void(0)" title="关闭窗口" class="close_btn" id="calvinCloseBtn' + id + '">×</a>');
                    closeBtn.click(function () {
                        DialogHelper.close(elem);
                    });
                    dialogTitle.prepend(closeBtn);
                }
                dialogContent.append(dialogTitle);
                dialogContent.append("<div class='line'/>");
            }
            //消息体
            var dialogMessage = $('<div class="Dialog_message"></div>').append($(message));
            dialogContent.append(dialogMessage);
            dialogMessage.css(opts.messageCSS);
            if (opts.showFooter) {
                dialogContent.append("<div class='line'/>");
                var dialogFooter = $('<div class="Dialog_footer"></div>').append($(opts.footer));
                dialogContent.append(dialogFooter);
            }

            dialogData.$dialog = $dialog;
            return "#calvinDialog" + id;
        },
        createMask: function (elem) {
            var dialogData = $.data(elem, "calvindialog"), opts = dialogData.options;
            dialogData.mask = null;
            if (opts.showOverlay) {
                var mask = new calvin.ui.masker(dialogData.container, { baseZ: opts.zIndex++, overlayCSS: opts.overlayCSS });
                dialogData.mask = mask;
            }

        },
        setDialogStyle: function (elem) {
            var dialogData = $.data(elem, "calvindialog"),
             $dialog = dialogData.$dialog,
             opts = dialogData.options,
             full = dialogData.full;
            //IE6的话 可以采用setExpression来居中消息   其他的可以采用fiexed属性来居中
            if (calvin.ie6() && full) {
                $dialog.css("position", 'absolute');
                $dialog[0].style.setExpression('top', '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (document.documentElement.scrollTop||document.body.scrollTop) + "px"');
                $dialog[0].style.setExpression('left', '(document.documentElement.clientWidth || document.body.clientWidth) / 2 - (this.offsetWidth / 2) + (document.documentElement.scrollLeft||document.body.scrollLeft) + "px"');

            }
            else if (full) {
                $dialog.addClass('Dialogfull');
            }
            else {
                StyleHelper.center($dialog.get(0), opts.centerX, opts.centerY);
            }

            //设置中间消息体的高度
            var dialogHeight = $dialog.height(), dialogWidth = $dialog.width(),
            titleHeight = $("div.Dialog_title", $dialog).outerHeight() + 1,
            footerHeight = $("div.Dialog_footer", $dialog).outerHeight() + 1,
            $message = $("div.Dialog_message", $dialog),
            message_paddingV = parseFloat($message.css("paddingTop")) + parseFloat($message.css("paddingBottom")),
            message_paddingH = parseFloat($message.css("paddingLeft")) + parseFloat($message.css("paddingRight")),
            message_marginV = parseFloat($message.css("marginTop")) + parseFloat($message.css("marginBottom")),
            message_marginH = parseFloat($message.css("marginLeft")) + parseFloat($message.css("marginRight")),
            messageHeight = dialogHeight - message_paddingV - message_marginV;
            messageWidth = dialogWidth - message_paddingH - message_marginH;
            if (opts.showTitle) {
                messageHeight -= titleHeight;
            }
            if (opts.showFooter) {
                messageHeight -= footerHeight;
            }
            $("div.Dialog_message", $dialog).height(messageHeight).width(messageWidth);

        }
    };
    var StyleHelper = {
        /*
        *@description 让对象在父元素中居中
        *@param  {el} 要居中的对象
        *@param {x} 是否X方向居中
        *@param {Y} 是否Y方向居中
        */
        center: function (el, x, y) {
            if (!x && !y) return;
            var p = el.parentNode, s = el.style;
            var $p = $(p);
            var borderAndPaddingWidth, borderAndPaddingHeight;

            if ($.support.boxModel) {
                borderAndPaddingWidth = $p.outerWidth() - $p.width();
                borderAndPaddingHeight = $p.outerHeight() - $p.height();
            }
            var l, t;
            if ($.support.boxModel) {
                l = ((p.offsetWidth - el.offsetWidth) / 2) - (borderAndPaddingWidth / 2);
                t = ((p.offsetHeight - el.offsetHeight) / 2) - (borderAndPaddingHeight / 2);

            }
            else {
                l = (p.offsetWidth - el.offsetWidth) / 2;
                t = (p.offsetHeight - el.offsetHeight) / 2;
            }
            if (x) s.left = l > 0 ? (l + 'px') : '0';
            if (y) s.top = t > 0 ? (t + 'px') : '0';
        }

    };
});