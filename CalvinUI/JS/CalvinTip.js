﻿/// <reference path="jquery-1.4.1-vsdoc.js" />
/// <reference path="../../JsLib/jq1.72.js" />
/// <reference path="CalvinAutoComplete.js" />
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


    function formtoolTip(options) {
        var html = "<div  class='tooltip tooltip-" + options.arrow + "'>" +
        "<div class='tooltip-arrow tooltip-arrow-" + options.arrow.charAt(0) + "'>" +
        "</div>" +
         "<div class='tooltip-arrow tooltip-arrow-in-" + options.arrow.charAt(0) + "'>" +
        "</div>" +
        "<div class='tooltip-inner'>" + options.content +
         "</div>" +
        "</div>";
        var $toolTip = $(html);
        $(document.body).append($toolTip);
        return $toolTip;
    }
    var ItemHelper =
    {
        show: function (elem) {
            var cacheData = $.data(elem, "CalvinToolTip.data"),
             $element = $(elem),
             $tip = cacheData.$toolTip,
             arrow = cacheData.options.arrow,
             options = cacheData.options;
            var pos = $.extend({}, $element.offset(), {
                width: elem.offsetWidth,
                height: elem.offsetHeight
            });
            var actualWidth = $tip.get(0).offsetWidth,
                    actualHeight = $tip.get(0).offsetHeight;
            var tp;
            switch (arrow.charAt(0)) {
                case 'n':
                    tp = { top: pos.top + pos.height + options.offset, left: pos.left + pos.width / 2 - actualWidth / 2 };
                    break;
                case 's':
                    tp = { top: pos.top - actualHeight - options.offset, left: pos.left + pos.width / 2 - actualWidth / 2 };
                    break;
                case 'e':
                    tp = { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - options.offset };
                    break;
                case 'w':
                    tp = { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + options.offset };
                    break;
            }
            if (arrow.length == 2) {
                if (arrow.charAt(1) == 'w') {
                    tp.left = pos.left + pos.width / 2 - 15;
                } else {
                    tp.left = pos.left + pos.width / 2 - actualWidth + 15;
                }
            }
            $tip.css(tp);

        },
        hide: function (elem) {
            var cacheData = $.data(elem, "CalvinToolTip.data"),
            $tip = cacheData.$toolTip;
            $tip.hide();
        }

    }

    var Defaluts = {
        arrow: 'n',
        offset: 0,
        content: '&nbsp;&nbsp;',
        show: false
    };

    $.fn.CalvinToolTip = function (options, param) {


        if (typeof options === "string") {
            switch (options.toUpperCase()) {
                case "HIDE":
                    ItemHelper.hide(this.get(0));
                    return;

            }
        }
        return this.each(function () {
            var opts = {},
             $this = $(this),
             state = $.data(this, 'CalvinToolTip.data');
            if (state) {
                $.extend(opts, state.options, options);
                state.options = opts;
            }
            else {
                $.extend(opts, Defaluts, options);
                var $toolTip = formtoolTip(opts);
                $this.data("CalvinToolTip.data", { options: opts, $toolTip: $toolTip });
                ItemHelper.show(this);
            }
        });
    };

})();

