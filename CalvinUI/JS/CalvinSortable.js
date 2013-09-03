/// <reference path="jquery-1.4.1-vsdoc.js" />
/// <reference path="CalvinUI.Core.js" />
/// <reference path="CalvinDraggable.js" />
/// <reference path="CalvinDroppable.js" />
;
(function () {
    calvin.Create("calvin.ui", function () {
        var defaults = {};
        var sortHelper = {
            startDrag: function (e) {
                $(this).css({
                    opacity: '0.3',
                    zIndex: '10000'

                });

            },
            stopDrag: function (e) {
                $(this).css({
                    opacity: 1,
                    top: 0,
                    left: 0,
                    zIndex: ""

                });
            },
            enter: function (e, drag) {
                var $dropElem = $(this),
                $dragElem = $(drag),
                dragIndex = $dragElem.index(),
                dropIndex = $dropElem.index();
                $dropElem[dragIndex < dropIndex ? 'after' : 'before']($dragElem);

            }
        };

        this.calvinsortable = calvin.Class({
            init: function (elem, options) {
                if (typeof elem == "string") {
                    elem = $(elem).get(0);
                }
                if (elem != undefined && elem.nodeName) {
                    this._init.call(elem, options);
                }
            },
            _init: function (options) {
                var state = $.data(this, 'sortable');


                if (state) {
                    $.extend(state.options, options);
                } else {

                    $.data(this, 'sortable', {
                        options: $.extend(defaults, options)
                    });
                    $(this).children().each(function () {

                        new calvin.ui.cavindrag(this, {
                            proxy: true,
                            onStartDrag: sortHelper.startDrag,
                            onStopDrag: sortHelper.stopDrag
                        });

                        new calvin.ui.calvindroppable(this, {
                            onDragEnter: sortHelper.enter

                        });

                    });

                }

            }
        });

    });

    $.fn.CalvinSortable = function (options, params) {

        return this.each(function () {

            new calvin.ui.calvinsortable(this, options);


        });
    };
})();