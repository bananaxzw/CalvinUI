﻿/// <reference path="jquery-1.4.1-vsdoc.js" />
/// <reference path="json2.js" />
/// <reference path="CalvinTimeDelayMaker.js" />
/// <reference path="CalvinUI.Core.js" />

/********************************************************************************************
* 文件名称:	CalvinComboBox.js
* 设计人员:	许志伟 
* 设计时间:	
* 功能描述:	CalvinComboBox
* 注意事项：如果变量前面有带$表示的是JQ对象
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*
********************************************************************************************/


(function () {

    calvin.Create("calvin.ui", function () {

        var defaults = { min: 1, url: "", height: 200, source: [], selected: function (event, item) { } };
        this.combobox = calvin.Class({
            init: function (elem, options) {
                if (typeof elem == "string") {
                    elem = $(elem).get(0);
                }
                if (elem != undefined && elem.nodeName) {
                    this._init.call(elem, options);
                }
            },
            _init: function (options) {
                var $this = $(this), opts = {};
                if (data = $this.data("CalvinAutoComplete.data")) {
                    opts = data.options;
                    MenuItemHelper.clearAll(this);
                    data.ItemsContainer = null, data.TextBoxContainer = null, data.dropdownIcon = null;

                }
                else {
                   
                    $.extend(true, opts, defaults, options);
                    $this.data("CalvinAutoComplete.data", {
                        options:opts,
                        ItemsContainer:null, 
                        TextBoxContainer: null, 
                        dropdownIcon :null
                    });
                }
                WrapTextBox(this,opts);
                MenuItemHelper.RemoveMenuItems(this);
                //移除现有的Items元素
                EventHelper.SetTextBoxKeyUpDownEvent(this);
                $(document).click(function (event) {
                    MenuItemHelper.RemoveMenuItems($this[0]);
                });
            }



        });
        var EventHelper = {
            /**
            * @description  设置item（li元素）的点击事件
            * @param {$MenuItem} 选项元素
            *@param {$textBox} textbox元素
            */
            SetMenuItemClickEvent: function ($MenuItem, $textBox, options) {
                var ItemData = $MenuItem.data("MenuItem.Data");
                $MenuItem.bind("selected", options.selected);
                //设置item点击的事件 默认事件自动填写text框
                $MenuItem.bind("click", function () {
                    $textBox.val(ItemData.text);
                    $MenuItem.trigger("selected", [ItemData]);
                    $MenuItem.parent().hide();
                    ItemData.Selected = true;
                    MenuItemHelper.RemoveMenuItems($textBox[0]);
                });
            },

            /**
            * @description  设置textbox的键盘事件
            * @param {textBox} textbox元素
            */
            SetTextBoxKeyUpDownEvent: function (textBox) {
                var $this = $(textBox),
                 data = $this.data("CalvinAutoComplete.data"),
                 dropDownIconData = data.dropdownIcon.data("AllMenusItems"),
                 options = data.options;

                $this.unbind("keydown");
                $this.unbind("keyup");

                $this.keydown(function (event) {
                  
                    if ((data == null || data.ItemsContainer == null) && (dropDownIconData == null || dropDownIconData.AllMenusItems == null || dropDownIconData.AllMenusItems.is(":hidden"))) return;

                    var $itemContainer = data.ItemsContainer || dropDownIconData.AllMenusItems;
                    var $items = $(">li", $itemContainer[0]);
                    var itemsCount = $items.length;
                    var $SelectedItem = $(">li.ui-menu-itemHover", $itemContainer[0]);
                    var SelectIndex = $items.index($SelectedItem[0]);
                    switch (event.keyCode) {
                        //向上                                                                                                                                                                     
                        case 38:
                            MenuItemHelper.RemoveItemHoverStyle($itemContainer);

                            if (SelectIndex != 0) {
                                $SelectedItem.prev().addClass("ui-menu-itemHover");
                            }
                            MenuItemHelper.ScrollToSelectedItem($itemContainer, options);
                            break;
                            //向下                                                                                                                                                                  
                        case 40:
                            MenuItemHelper.RemoveItemHoverStyle($itemContainer);
                            //没有选中的项
                            if ($SelectedItem.length == 0) {
                                $items.eq(0).addClass("ui-menu-itemHover");
                            }
                            else if (SelectIndex == itemsCount - 1) {
                                $items.eq(0).addClass("ui-menu-itemHover");
                            }
                            else {
                                $SelectedItem.next().addClass("ui-menu-itemHover");
                            }
                            MenuItemHelper.ScrollToSelectedItem($itemContainer, options);
                            break;
                        default:
                            break;
                    }
                    var $newSelectedItem = $(">li.ui-menu-itemHover", $itemContainer[0]).eq(0);
                    if ($newSelectedItem.length != 0) {
                        $this.val($newSelectedItem.data("MenuItem.Data").text);
                    }

                });

                $this.bind("keyup", function (event) {
                    var $textBoxContainer = $this.data("CalvinAutoComplete.data").TextBoxContainer;
                    var StyleInfo = GetElementStyle($textBoxContainer[0]);
                    var data = $this.data("CalvinAutoComplete.data");
                    var $dropdownIcon = data.dropdownIcon;
                    var dropdownIconData = $dropdownIcon.data("AllMenusItems");
                    switch (event.keyCode) {
                        case 38:
                            break;
                        case 40:
                            break;
                        case 13: //回车键
                            var $SelectedItem = MenuItemHelper.getSelectedItem(data.ItemsContainer || dropdownIconData.AllMenusItems);
                            if ($SelectedItem != null) {
                                var ItemData = $SelectedItem.data("MenuItem.Data");
                                $SelectedItem.trigger("selected", [ItemData]);
                            }
                            MenuItemHelper.RemoveMenuItems(textBox);


                            break;
                        default:
                            MenuItemHelper.RemoveMenuItems(textBox);
                            if ($dropdownIcon) {
                                $dropdownIcon.data("AllMenusItems").AllMenusItems.hide();
                            }
                            var minLength = options.min;
                            if ($this.val().length >= minLength) {
                                var $MenuItems = MenuItemHelper.GenrateMenuItems(this, OtherHelper.FilterOptionSouces($this.val(),options), StyleInfo.height, StyleInfo.width, StyleInfo.top, StyleInfo.left);
                                $this.data("CalvinAutoComplete.data").ItemsContainer = $MenuItems;
                            }
                            break;
                    }
                });

            }

        };
        var MenuItemHelper = {

            /**
            * @description 生成自动补全菜单
            * @param {textBox} textBox元素
            * @param {SouceArray} 数组元素[{text:'',value:''}]或者["fsa","safsafs"]
            * @param  {height } 产生自动补全的textbox的高度
            * @param  {width } 产生自动补全的textbox的宽度
            * @param  {top } 产生自动补全的textbox的top属性
            * @param  {left } 产生自动补全的textbox的left属性
            */
            GenrateMenuItems: function (textBox, SouceArray, height, width, top, left) {
                var $textbox = $(textBox),
                    data = $textbox.data("CalvinAutoComplete.data"),
                    options = data.options;
                if (!SouceArray.length) return;
                var $ItemsContainer = $("<ul class='ui-autocomplete ui-menu'></ul>");
                var iframeLayer = $('<iframe style="position:absolute; z-index:-1;border:none;margin:0;padding:0;width:100%;top:0;left:0;" src="about:blank"></iframe>').css("opacity", 0);
                //遍历产生item源数组
                $.each(SouceArray, function (i, d) {
                    var $MenuItem = $("<li class='ui-menu-item'></li>");

                    var $MenuItemText = $("<a></a>");
                    if ($.isPlainObject(d)) {
                        $MenuItem.data("MenuItem.Data", { "text": d.text, "value": d.value, "Selected": false });
                        $MenuItemText.append(d.text);
                    }
                    else {
                        $MenuItem.data("MenuItem.Data", { "text": d, "value": "", "Selected": false });
                        $MenuItemText.append(d);
                    }
                    $MenuItem.append($MenuItemText);
                    $ItemsContainer.append($MenuItem);
                    //设置item属性移动上去的样式
                    $MenuItem.mouseover(function () {
                        MenuItemHelper.RemoveItemHoverStyle($ItemsContainer);
                        MenuItemHelper.SetItemHover($MenuItem);
                    });
                    //绑定点击事件
                    EventHelper.SetMenuItemClickEvent($MenuItem, $(textBox),options);

                });

                $ItemsContainer.appendTo("body");
                iframeLayer.height($ItemsContainer.height());
                $ItemsContainer.append(iframeLayer);
                if ($ItemsContainer.height() <= options.height) {
                    //设置只能提示选项的位置
                    $ItemsContainer.css({ "left": left + "px", "width": width - 4 + "px", "top": (top + height) + "px" });
                }
                else {
                    $ItemsContainer.css({ "height": options.height + "px", "left": left + "px", "width": width - 4 + "px", "top": (top + height) + "px" });
                }
                return $ItemsContainer
            },
            /**
            * @description  设置选项移动上去的样式
            * @param {itemsContainer} item的容器元素 也就是ul
            * @param {item} item的元素 也就是li
            */
            SetItemHover: function ($item) {
                $item.addClass("ui-menu-itemHover");
            },

            /**
            * @description 获取选中的元素
            * @param {$itemContainer} textBox元素
            * @return 返回选中元素的jq对象
            */
            getSelectedItem: function ($itemContainer) {
                var $SelectedItem = $(">li.ui-menu-itemHover", $itemContainer[0]);
                if ($SelectedItem.length != 0) {
                    return $SelectedItem.eq(0);
                }
                return null;
            },
            /*
            * @description输入框有值时候 打开下拉按钮时候 匹配到第一项选中的
            */
            ScrollToMarchedItem: function (key, $itemContainer, options) {

                var hasMatched = false;
                var height = 0;
                $(">li", $itemContainer).each(function (i, d) {
                    height += $(d).height();
                    if (key === $(d).data("MenuItem.Data").text) {
                        hasMatched = true;
                        MenuItemHelper.SetItemHover($(d));
                        return false;
                    }
                });
                if (hasMatched) {
                    if (height > options.height) {
                        $itemContainer.scrollTop(height - options.height);
                    }
                }
            },
            /*
            * @description移动键盘上下键的时候 滚动到选中的项目
            */
            ScrollToSelectedItem: function ($itemContainer, options) {
                var hasMatched = false;
                var height = 0;
                $(">li", $itemContainer).each(function (i, d) {
                    height += $(d).height();
                    if ($(d).is(".ui-menu-itemHover")) {
                        hasMatched = true;
                        MenuItemHelper.SetItemHover($(d));
                        return false;
                    }
                });
                if (hasMatched) {

                    if (height > options.height) {
                        $itemContainer.scrollTop(height - options.height);
                    }
                    else {
                        if ($itemContainer.scrollTop()) {
                            $itemContainer.scrollTop(0);
                        }
                    }

                }
            },

            /**
            * @description 移除自动补全菜单 并且隐藏下拉的菜单
            * @param {textBox} textBox元素
            **/
            RemoveMenuItems: function (textBox) {
                var $this = $(textBox);
                if ($this.data("CalvinAutoComplete.data")) {
                    data = $this.data("CalvinAutoComplete.data");
                    if (data.ItemsContainer) {
                        data.ItemsContainer.remove();
                        $this.data("CalvinAutoComplete.data").ItemsContainer = null;
                    }

                }
                var $dropdownIcon = $this.data("CalvinAutoComplete.data").dropdownIcon;
                if ($dropdownIcon && $dropdownIcon.length) {
                    $dropdownIcon.data("AllMenusItems").AllMenusItems.hide();
                }
            },

            /**
            * @description  移除item的选中样式
            * @param {itemsContainer} item的容器元素 也就是ul
            */
            RemoveItemHoverStyle: function ($itemsContainer) {
                $(">li", $itemsContainer).removeClass("ui-menu-itemHover");
            },

            clearAll: function (textBox) {

                var $this = $(textBox);
                var data = $this.data("CalvinAutoComplete.data");
                if (data) {
                    if (data.dropdownIcon && data.dropdownIcon.data("AllMenusItems") && data.dropdownIcon.data("AllMenusItems").AllMenusItems) {
                        data.dropdownIcon.data("AllMenusItems").AllMenusItems.remove();
                    }
                    if (data.ItemsContainer) {
                        data.ItemsContainer.remove();
                    }
                    if (data.TextBoxContainer) {
                        $this.next().remove();
                        $this.unwrap();
                        //data.TextBoxContainer.remove();
                    }

                }
            }
        };
        var OtherHelper = {

            /**
            * @description 根据指定的key 过滤options.sources数组 以便再生成菜单
            * @param {Key} 值
            **/
            FilterOptionSouces: function (Key, options) {
                var fileterArray = new Array();
                $.each(options.source, function (t, d) {
                    if ($.isPlainObject(d)) {
                        var reg = new RegExp(".*" + Key + ".*", "g");
                        if (reg.test(d.text)) {
                            fileterArray.push(d);
                        }
                    }
                    else {
                        var reg = new RegExp(".*" + Key + ".*", "g");
                        if (reg.test(d)) {
                            fileterArray.push(d);
                        }
                    }
                });
                return fileterArray;
            }
        };



        /**
        * @description 生成下拉菜单按钮并和textbox包裹
        * @param {textBox} textBox元素
        * @param {options} 参数
        */
        function WrapTextBox(textbox, options) {
            var $textbox = $(textbox);
            $textbox.wrap("<span class='combo'></span>");
            var $ContainerSpan = $textbox.parent();
            $textbox.addClass("combo-text");
            var $dropdownIcon = $("<span><span class='combo-arrow'></span></span>");
            $dropdownIcon.data("AllMenusItems", { AllMenusItems: null });
            $ContainerSpan.append($dropdownIcon);
            $textbox.data("CalvinAutoComplete.data").TextBoxContainer = $ContainerSpan;
            $textbox.data("CalvinAutoComplete.data").dropdownIcon = $dropdownIcon;
            var StyleInfo = GetElementStyle($ContainerSpan[0]);
            var $ItemsContainerAll = MenuItemHelper.GenrateMenuItems(textbox, options.source, StyleInfo.height, StyleInfo.width, StyleInfo.top, StyleInfo.left);
            $dropdownIcon.data("AllMenusItems").AllMenusItems = $ItemsContainerAll;
            $ItemsContainerAll.toggle();
            $dropdownIcon.bind("click", function (event) {
                event.cancelBubble = true;
                event.stopPropagation();
                MenuItemHelper.RemoveItemHoverStyle($ItemsContainerAll);
                if ($ItemsContainerAll.is(":hidden")) {
                    $ItemsContainerAll.show();
                    MenuItemHelper.ScrollToMarchedItem($textbox.val(), $ItemsContainerAll, options);
                    textbox.focus();
                }
                else {
                    $ItemsContainerAll.hide();
                }
                if ($textbox.data("CalvinAutoComplete.data").ItemsContainer) {
                    $textbox.data("CalvinAutoComplete.data").ItemsContainer.hide();

                }
            });
            return $ContainerSpan;
        }

        /**
        * @description  获取产生自动补全效果的textbox的位置和宽高信息
        * @param {textBox} textbox DOM元素
        */
        function GetElementStyle(ele) {
            var $ele = $(ele);
            var offset = $ele.offset();
            return { left: offset.left, top: offset.top, width: $ele.width(), height: $ele.outerHeight() };
        }

    });

    $.fn.CalvinComboBox = function (options, param) {
        return this.each(function () {
            new calvin.ui.combobox(this, options);

        });
    };
})();