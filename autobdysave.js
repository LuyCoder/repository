// ==UserScript==
// @name         百度云自动保存文件
// @namespace    http://tampermonkey.net/
// @downloadUrl  https://raw.githubusercontent.com/codersluy/tampermonkey-script/master/autobdysave.js
// @version      0.3
// @description  百度云自动保存文件
// @author       Luy
// @match        *://pan.baidu.com/*
// @match        http://localhost*
// @grant        GM_log
// @grant        window.close
// @require      https://cdn.bootcss.com/jquery/1.10.1/jquery.js
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...

    let save = function () {
        window.setTimeout(function () {
            if ($(":contains('文件名')").children("div:last").length > 0) {
                $(":contains('文件名')").children("div:last").click();
            }
            $("a[data-button-id='b1']")[0].click();
            window.setTimeout(function () {
                if ($(":contains('全部文件')").children("div:last").find("em").attr("class").indexOf("minus") == -1) {
                    $(":contains('全部文件')").children("div:last").click();
                }
                $("span[node-path='/补档下载']")[0].click();
                $("a[title='确定']")[0].click();
                alert("成功!");
                GM_log("成功!!!");
                window.close();
            }, 2000);
        }, 2000);
    };

    try {
        if (window.location.pathname.indexOf("/s/") == 0) { //保存页面
            save();
        }
        if (window.location.pathname.indexOf("/share/init") == 0) { //分享页
            window.setTimeout(function () {
                if ($(".error-img").length == 0) {
                    $(":contains('请输入提取码：')").last().parent().find("input").val("llss");
                    GM_log($("a[data-button-id='b1']").attr("title"));
                    $("a[data-button-id='b1']")[0].click();
                } else {
                    window.close();
                }
            }, 1500);
        }
        if (window.location.host == "localhost" != -1) { //下载页

            window.setTimeout(function () {
                GM_log("补档");
                let urlList = $("a[href^='https://pan.baidu.com/s/']");
                $.each(urlList, function (i, val) {
                    GM_log($(val).attr("href"));
                    GM_log((i + 1) * 10000);
                    window.setTimeout(function () {
                        window.open(val, "_blank");
                    }, (i + 1) * 10000);
                    return;
                });
            }, 1000);
        }
    } catch (e) {
        GM_log(e);
    }

})();
