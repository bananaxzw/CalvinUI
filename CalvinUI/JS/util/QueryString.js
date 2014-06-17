/// <reference path="../CalvinUI.Core.js" />

/**    
*
* @version    1.0
* @author    bananaxzw(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*/

calvin.Create(function () {

    /**
    *查询字符串帮助
    *@class
    *@name QueryString
    *@param {String} str 查询字符串的值
    *@example
    *window.onload = function () {
    *     var quering = new calvin.QueryString("jj.aspx?name=xuzhiwei&age=11");
    *     console.log(quering.name);
    *     console.log(quering.age);
    *     console.log(quering.toString());
    * }
    */
    var QueryString = function (str) {
        this.string = str;
        this.length = 0;
        var re = /[?&]([^=]+)=([^&]*)/g;
        var match = re.exec(str);
        while (match) {
            var name = match[1];
            var value = decodeURI(match[2]);
            this[name] = value;
            this[this.length] = new QueryString.Pair(name, value);
            this.length++;
            match = re.exec(str);
        }
    };
    /**
    *@ignore
    */
    QueryString.prototype = {
        /**
        *@ignore
        */
        toString: function () {
            return this.string;
        }
    };
    /**
    *@ignore
    */
    QueryString.Pair = function (name, value) {
        this.name = name;
        this.value = value;
    };
    /**
    *@ignore
    */
    QueryString.Pair.prototype.toString = function () {
        return this.name + '=' + this.value;
    };
    calvin.QueryString = function (str) {
        return new QueryString(str);
    };
});