// ==UserScript==
// @name         add JQuery
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  add JQuery...
// @author       Luy
// @match        https://cn.pornhub.com/view_video.php*
// @match        https://cn.pornhub.com/channels/japanhdv/videos*
// @grant        GM_log
// @grant        window.close
// @require      https://cdn.bootcss.com/jquery/1.10.1/jquery.js
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...

    var importJs = document.createElement('script');
    importJs.setAttribute("type", "text/javascript");
    importJs.setAttribute("src", 'https://cdn.bootcss.com/jquery/1.10.1/jquery.js');
    document.getElementsByTagName("head")[0].appendChild(importJs);


})();