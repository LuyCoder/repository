// ==UserScript==
// @name         pronhub auto download
// @namespace    http://tampermonkey.net/
// @downloadUrl  https://raw.githubusercontent.com/codersluy/tampermonkey-script/master/pronhubAautoDownload.js
// @version      0.5
// @description  pronhub auto download...
// @author       Luy
// @match        https://cn.pornhub.com/view_video.php*
// @match        https://cn.pornhub.com/channels/*/videos*
// @match        https://cn.pornhub.com/playlist/*
// @match        https://cn.pornhub.com/video*
// @match        https://cn.pornhub.com/search*
// @match        https://cn.pornhub.com/channels/asian-sex-diary/videos*
// @grant        GM_log
// @grant        window.close
// @require      https://cdn.bootcss.com/jquery/1.10.1/jquery.js
// ==/UserScript==

(function () {
    'use strict';

    var Config = (function ($) {
        $.filter = {
            watched: false, //true看过的也下载,false看过的不下载
            hd: true, //true HD视频下载,false 所有清晰度都下载
            tinyVideoEvaluate: 60,
            smallVideoEvaluate: 80,
            bigVideoEvaluate: 85,
            exist: false, //true 下载过的也下载,false 下载过的不下载
            vr: false //true VR视频下载,false VR视频不下载
        };
        return $;
    })(window.Config || {});

    // Your code here...
    let canOperate = false;

    function getArrayBylocalStorage(key) {
        let arrayStr = localStorage.getItem(key);
        let array = arrayStr == null ? [] : JSON.parse(arrayStr);
        return array;
    }

    function pushArrayBylocalStorage(key, value) {
        let arrayStr = localStorage.getItem(key);
        let array = arrayStr == null ? [] : JSON.parse(arrayStr);
        array.push(value);
        localStorage.setItem(key, JSON.stringify(array))
    }

    function addKey(key) {
        GM_log("add key:" + key);
        pushArrayBylocalStorage("key_arr", key);
    }

    function existKey(key) {
        let array = getArrayBylocalStorage("key_arr");
        if (array == null || array.indexOf(key) == -1) {
            GM_log("not exist key:" + key);
            return false;
        }
        GM_log("exist key:" + key);
        return true;
    }

    function addName(name) {
        GM_log("add name:" + name);
        pushArrayBylocalStorage("name_arr", name);
    }

    function existName(name) {
        let array = getArrayBylocalStorage("name_arr");
        if (array == null || array.indexOf(name) == -1) {
            GM_log("not exist name:" + name);
            return false;
        }
        GM_log("exist name:" + name);
        return true;
    }

    function putNameAndTitle(name, title) {
        try {
            GM_log("setNameAndTitle:" + name + "  | " + title);
            let mameAndTitleObj = localStorage.getItem('mameAndTitleObj');
            let obj = mameAndTitleObj == null ? {} : JSON.parse(mameAndTitleObj);
            if (!obj[name]) {
                obj[name] = title;
                GM_log("put :" + "key=" + name + "   value=" + title);
                localStorage.setItem('mameAndTitleObj', JSON.stringify(obj));
            }
        } catch (e) {
            GM_log(e);
        }
    }

    // 获取URL参数值
    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1];
            }
        }
        return "";
    }

    $(function () {

        function stop(msg) {
            GM_log(msg);
            localStorage.setItem("next", "false");
            localStorage.setItem("msg", msg);
        }

        function start() {
            localStorage.setItem("next", "true");
            localStorage.setItem("msg", "");
        }

        // 下载视频
        function downloadVideo() {
            GM_log("start...");
            // https://cn.pornhub.com/view_video.php

            //是否登录
            let loginElement = $(".video-action-tab.download-tab").find('a[href="javascript:signinbox.show(textPHTranslation.loginTitleDownload);"]');
            if (loginElement.length == 1) {
                stop("not log in,stop the downloading...");
                return;
            }

            let $downloadLinkElement = $(".video-action-tab.download-tab").find("a[target='_blank']:first");

            if (!$downloadLinkElement[0] && $(":contains('我是人类')").length > 0) {
                let msg = "Robot verification...";
                if (localStorage.getItem("msg") == null || localStorage.getItem("msg").indexOf(msg) == -1) {
                    // 短信提醒
                    window.open("http://**", "_blank")
                }
                stop(msg);
                return;
            } else if (!$downloadLinkElement[0]) {
                GM_log("not get link,shut down in five seconds...");
                window.setTimeout(function () {
                    window.close();
                }, 5000);
                return;
            }

            let downloadUrl = $downloadLinkElement.attr("href");
            GM_log(downloadUrl);

            let _url = downloadUrl.substr(0, downloadUrl.indexOf("?"));
            let videoName = _url.substr(_url.lastIndexOf("/") + 1);
            let videoKey = getQueryVariable("viewkey");

            if (existName(videoName)) { //已存在
                addKey(videoKey);
                GM_log("exist name,shut down in five seconds...");
                window.setTimeout(function () {
                    window.close();
                }, 5000)
            } else {
                addName(videoName);
                addKey(videoKey);
                putNameAndTitle(videoName, $downloadLinkElement.attr("download"));
                $downloadLinkElement.removeAttr("target"); //当前页面下载
                window.setTimeout(function () {
                    $downloadLinkElement[0].click();
                    GM_log("download success...");
                }, 5000);
            }
        }

        let liArray = null;

        function initLiArray() {
            let pathname = window.location.pathname;
            if (pathname.indexOf("/playlist/") == 0) { //播单
                liArray = $(".container.playlistSectionWrapper").find(".js-pop.videoblock");
            } else if (pathname.indexOf("/video") == 0) { //分类
                liArray = $("#videoCategory").find(".js-pop.videoblock");
            } else if (pathname.indexOf("/video/search") == 0) { //搜索
                liArray = $("#videoSearchResult").find(".js-pop.videoblock");
            } else { //频道
                liArray = $(".rightSide.floatRight").find("div.widgetContainer>ul>li");
            }
        }

        function getRecord() {
            let record = localStorage.getItem("record");
            return record == null ? 0 : Number(record); //总下载数
        }

        function recordPlusOne() {
            localStorage.setItem("record", getRecord() + 1);
        }

        function recordReset() {
            localStorage.setItem("record", 0);
        }

        function getIndex() {
            let i = localStorage.getItem("index");
            return i == null ? 0 : Number(i);
        }

        var index = getIndex();

        function indexPlusOne() {
            index++;
            localStorage.setItem("index", getIndex() + 1);
        }

        function indexReset() {
            localStorage.setItem("index", 0);
        }

        function getPageNo() {
            return Number($(".page_current>span").eq(0).text());
        }

        function claerLocalStorage() {

        }


        // 获取秒数
        function getSeconds(dateStr) {
            let s = 0;
            if (dateStr) {
                let arr = dateStr.split(":");
                for (let i = 0; i < arr.length; i++) {
                    if (i == arr.length - 1) {
                        s += Number(arr[i]);
                    } else {
                        let x = arr.length - i - 1;
                        s += Number(arr[i]) * (60 ** (x < 1 ? 1 : x));
                    }
                }
            }
            return s;
        }

        // 下次休息时间
        let pauseTimeMinute = 0;

        // 检查是否下载
        function canDownload($li) {
            let $phimage = $li.find(".phimage");

            // 已看
            let watched = $phimage.find("a>div").length > 0;
            // HD
            let hd = $phimage.find(".hd-thumbnail").length > 0;
            let vr = $phimage.find(".hd-thumbnail.vr-thumbnail").length > 0;

            // 时长 秒
            let duration = getSeconds($phimage.find(".duration").text());

            // 好评 0 ~ 100
            let evaluateStr = $li.find(".rating-container.up").find(".value").text().replace("%", "");
            let evaluate = evaluateStr ? Number(evaluateStr) : 0;

            // 已下载过
            let exist = existKey($li.attr("_vkey"));
            GM_log("EXIST:" + exist + ";  " + "WATCHED:" + watched + ";  " + "HD:" + hd + ";  " + "VR:" + vr + ";  " + "DURATION(S):" + duration + ";   " + "EVALUATE:" + evaluate + "%;");

            if(exist != Config.filter.exist){
                return;
            }

            if(watched != Config.filter.watched){
                return;
            }

            if(vr != Config.filter.vr){
                return;
            }

            if(hd != Config.filter.hd){
                return;
            }

            if(duration <= 1200 && evaluate < Config.filter.tinyVideoEvaluate){ //小于20分钟
                return false;
            }

            if(duration <= 1800 && evaluate < Config.filter.smallVideoEvaluate){ //小于30分钟
                return false;
            }

            if(duration > 1800 && evaluate < Config.filter.bigVideoEvaluate){ //大于30分钟
                return false;
            }

            let second = null;
            if (hd) {
                second = Math.ceil(duration * 0.025);
            } else {
                second = Math.ceil(duration * 0.015);
            }
            pauseTimeMinute += Math.floor(second * 0.06);
            return true;
        }


        const intervalTime = 45000;

        function nextPage() {

            let nextPageFlag = "pageOpenedSuccess_" + (getPageNo() + 1);
            localStorage.removeItem(nextPageFlag); //清除
            $(".page_next.omega>a").attr("target", "_blank"); //新窗口打开
            $(".page_next.omega>a")[0].click();

            // 检测页面是否成功打开
            setTimeout(function () {
                if (localStorage.getItem(nextPageFlag) != "true") {
                    GM_log("Failure to open next page,Wait for the next...");
                    nextPage();
                } else {
                    GM_log("Open next page successfully,shut down in five seconds...");
                    localStorage.removeItem(nextPageFlag);
                    setTimeout(function () {
                        window.close();
                    })
                }
            }, 180000);
        }


        function jumpToDetails(time = intervalTime) {
            GM_log("=======================================================");
            canOperate = false;
            setTimeout(function () {

                let next = localStorage.getItem("next");
                if (next == "false") { //暂停下载
                    GM_log(localStorage.getItem("msg"));
                    canOperate = true;
                    return;
                }

                let nextExecutionInterval = intervalTime;
                let $li = liArray.eq(index);
                let key = $li.attr("_vkey");
                indexPlusOne();
                GM_log("So let's start the " + index + " video...");
                let url = "https://cn.pornhub.com/view_video.php?viewkey=" + key;
                GM_log("LINK: " + url);

                // 是否下载
                if (canDownload($li)) {
                    recordPlusOne();
                    GM_log("OPEN URL...");
                    window.open(url, "_blank");
                } else {
                    GM_log("CAN NOT DOWNLOAD...");
                    nextExecutionInterval = 1000;
                }

                //最后一个视频
                if (index >= liArray.length) {

                    //下标重置
                    indexReset();

                    if ($(".page_next.omega")[0]) {//有下一页
                        //下一页
                        GM_log("page next...");
                        nextPage();
                        return;
                    }
                    GM_log("download complete,shut down in five seconds...");
                    setTimeout(function () {
                        window.close();
                    }, 5000);
                    return;
                }

                // 是否休息
                if (getRecord() != 0 && getRecord() % 5 == 0) {
                    nextExecutionInterval = pauseTimeMinute * 60000;
                    recordReset();
                    pauseTimeMinute = 0;
                }
                //递归
                GM_log("Next execution time: " + nextExecutionInterval / 1000 + " S");
                jumpToDetails(nextExecutionInterval);
            }, time);
        }

        function startDownload() {
            GM_log("startDownload...");
            start();
            if (canOperate) {
                jumpToDetails();
            } else {
                GM_log("start but no execute jumpToDetails()");
            }
        }

        function startDownloadVideo() {
            GM_log("start downlad video...");
            start();
            downloadVideo();
        }

        try {

            $("#headerMainMenu").find("li").eq(-1).remove();
            $("#headerMainMenu").append('<li class="menu realsex "><a id="go_on" href="javascript:void(0);" class="js-topMenuLink"><span class="itemName">继续下载</span></a>');
            let pathname = window.location.pathname;
            GM_log(window.location.pathname);
            let regx = /^\/channels\/(.+)\/videos$/i;
            if (regx.test(pathname) || pathname.indexOf("/playlist/") == 0 || pathname.indexOf("/video") == 0 || pathname.indexOf("/video/search") == 0) { // 列表页

                // 标记页面成功
                localStorage.setItem("pageOpenedSuccess_" + getPageNo(), "true");

                $("#headerMainMenu").find("li").eq(-2).remove();
                $("#headerMainMenu").append('<li class="menu realsex "><a id="suspend" href="javascript:void(0);" class="js-topMenuLink"><span class="itemName">暂停下载</span></a>');

                $("#go_on").click(function () {
                    startDownload();
                });
                $("#suspend").click(function () {
                    stop("Manually stop downloading...");
                });

                initLiArray();
                jumpToDetails();
            }
            if (window.location.pathname.indexOf("/view_video.php") == 0) { // 详情页
                $("#go_on").click(function () {
                    startDownloadVideo();
                });
                downloadVideo();
            }
        } catch (e) {
            GM_log(e);
        }
    });


})();
