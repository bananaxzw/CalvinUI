﻿/********************************************************************************************
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

    $.fn.CalvinButton = function (options, param) {
        var opts;
        var defaults = {
            id: null,
            disabled: false,
            plain: false,
            text: '',
            iconCls: null
        };
        function createButton(target) {
            var opts = $.data(target, 'linkbutton').options;

            $(target).empty();
            $(target).addClass('l-btn');
            if (opts.id) {
                $(target).attr('id', opts.id);
            } else {
                $(target).removeAttr('id');
            }
            if (opts.plain) {
                $(target).addClass('l-btn-plain');
            } else {
                $(target).removeClass('l-btn-plain');
            }

            if (opts.text) {
                $(target).html('<span class="l-btn-left"><span class="l-btn-text">' + opts.text + '</span></span>');
                if (opts.iconCls) {
                    $(target).find('.l-btn-text').addClass(opts.iconCls).css('padding-left', '20px');
                }
            }
            else {
                $(target).html('<span class="l-btn-left"><span class="l-btn-text"><span class="l-btn-empty">&nbsp;</span></span></span>');

                if (opts.iconCls) {
                    $(target).find('.l-btn-empty').addClass(opts.iconCls);
                }
            }

            setDisabled(target, opts.disabled);
        };
        function setDisabled(target, disabled) {
            var state = $.data(target, 'linkbutton');
            if (disabled) {
                state.options.disabled = true;
                var href = $(target).attr('href');
                if (href) {
                    state.href = href;
                    $(target).attr('href', 'javascript:void(0)');
                }
                var onclick = $(target).attr('onclick');
                if (onclick) {
                    state.onclick = onclick;
                    $(target).attr('onclick', null);
                }
                $(target).addClass('l-btn-disabled');
            }
            else {
                state.options.disabled = false;
                if (state.href) {
                    $(target).attr('href', state.href);
                }
                if (state.onclick) {
                    target.onclick = state.onclick;
                }
                $(target).removeClass('l-btn-disabled');
            }
        };

        return this.each(function () {
            var state = $.data(this, 'linkbutton');
            if (state) {
                $.extend(state.options, options);
            }
            else {
                var t = $(this);
                $.data(this, 'linkbutton', {
                    options: $.extend({}, defaults, {
                        id: t.attr('id'),
                        disabled: (t.attr('disabled') ? true : undefined),
                        plain: (t.attr('plain') ? t.attr('plain') == 'true' : undefined),
                        text: $.trim(t.html()),
                        iconCls: t.attr('icon')
                    }, options)
                });
                t.removeAttr('disabled');
            }

            createButton(this);
        });

    };

})();