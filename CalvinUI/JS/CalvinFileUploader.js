/// <reference path="jquery-1.4.1-vsdoc.js" />
/// <reference path="../../JsLib/json2.js" />
/// <reference path="CalvinUI.Core.js" />


/********************************************************************************************
* 文件名称:	CalvinFileUploader.js
* 设计人员:	许志伟 
* 设计时间:	
* 功能描述:	多文件上传
* 注意事项：
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*
********************************************************************************************/
(function () {
    function compare(obj1, obj2) {
        if (obj1 == null || obj2 == null) return (obj1 === obj2);
        return (obj1 == obj2 && obj1.constructor.toString() == obj2.constructor);
    }
    Array.prototype.indexOf = function (obj) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (compare(this[i], obj)) return i;
        }
        return -1;
    }
    function format(str) {
        var args = arguments;
        return new String(str).replace(/\{(\d+)\}/g,
        function (m, i) {
            i = parseInt(i);
            return args[i + 1];
        }).toString();
    }
    function getFileName(str1) {
        var regstr = /\\/,
        regresult = new RegExp(regstr),
        parts = str1.split(regresult),
        fileName = parts[parts.length - 1];
        return fileName.split('.');
    };

    var defaults = {
        itemTemplate: "<li><span class='icon_addfj'></span>" +
        "<span class='fileName'>{0}</span>&nbsp;&nbsp;" +
        "<span class='file_delete'><a href='javascript:void(0);'>删除</a></span></li>",
        existFunction: function (name) {
            alert("文件" + name + "已经存在");
        },
        filesContainer: "#fileList",
        text: "添加附件"

    };



    var uploaderHelper = {

        create: function (o, options) {
            var text = "<span class='icon_addfj'></span><span class='blank_addfileContainer'><input class='blank_addfile' type='file' size='1' />" +
                "</span><a href='javascript:void(0);' class='file_text'>{0}</a>";

            $(o).append($(format(text, options.text)));


        },
        isexist: function (name, options) {
            var s = false;
            $("span.fileName", $(options.filesContainer)).each(function () {
                if ($(this).text() == name) {
                    s = true;
                    return false;
                }
            });
            return s;
        },
        createBlankFile: function (input_container, options) {
            var $input_temp = $("<input class='blank_addfile' type='file' size='1'/>");
            input_container.append($input_temp);
            $input_temp.change(function () {
                uploaderHelper.change(this, options);
            });

        },
        change: function (input, options) {
            var input_container = $(input).parent();
            //添加文件到列表
            if (uploaderHelper.addfile(input, options)) {
                //新建一个空文件
                uploaderHelper.createBlankFile(input_container, options);
            }
            input = null;
        },
        addfile: function (input_file, options) {

            var filePath = $(input_file).val(),
            fileName = getFileName(filePath).join("."),
            itemTemplate = options.itemTemplate,
            filesContainer = options.filesContainer;
            if (uploaderHelper.isexist(fileName, options)) {
                options.existFunction.call(input_file, fileName);
                return false;
            }
            var $s = $(format(itemTemplate, fileName));
            $(filesContainer).append($s);
            input_file.name = "file_data";
            $(input_file).css({ position: "", opacity: 0, height: 0, width: 0 });
            $s.append(input_file);
            return true;
        }

    };

    calvin.Create("calvin.ui", function () {

        this.calvinfileuploader = calvin.Class({
            init: function (elem, options) {
                if (typeof elem == "string") {
                    elem = $(elem).get(0);
                }
                if (elem != undefined && elem.nodeName) {
                    this._init.call(elem, options);
                }
            },
            _init: function (options) {
                var opts = {};
                var $this = $(this);
                var state = $.data(this, 'fileuploader');
                if (state) {
                    $.extend(true, opts, state.options, options);
                    state.options = opts
                } else {
                    $.extend(true, opts, defaults, options);
                    $this.data("fileuploader", {
                        options: opts
                    });
                    var postion = $this.css("position");
                    if (postion == "static" || postion == "") {
                        $(this).css({ position: "relative" });
                    }

                    uploaderHelper.create(this, opts);
                    //文件选择
                    $("input.blank_addfile", this).change(function () {
                        uploaderHelper.change(this, opts);
                    });
                    //删除事件 代理 以便新加的东西能实现删除
                    $(opts.filesContainer).delegate(".file_delete", "click", function () {
                        $(this).parent().remove();
                    });
                }
            }

        });
    });



    $.fn.CalvinFileUploader = function (options, param) {
        return this.each(function () {

            new calvin.ui.calvinfileuploader(this, options);
        });
    };
})();