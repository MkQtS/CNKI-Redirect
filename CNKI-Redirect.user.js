// ==UserScript==
// @name         重定向知网至海外版
// @namespace    cnki_redirect_to_oversea
// @description  将部分知网界面重定向到海外版知网
// @version      1.0
// @icon         https://cnki.net/favicon.ico
// @author       MkQtS
// @homepage     https://github.com/MkQtS/CNKI-Redirect
// @match        *://cnki.net/*
// @match        *://*.cnki.net/*
// @match        *://*.cnki.com.cn/*
// @exclude      *://chn.oversea.cnki.net/kcms/detail/*
// @grant        none
// ==/UserScript==

/**
Chrome等浏览器支持添加自定义搜索引擎，CNKI海外版格式：
https://chn.oversea.cnki.net/kns/defaultresult/index?&kw=%s
**/

(function () {

    //知网空间-cdmd
    if (window.location.href.match(/^https?:\/\/cdmd\.cnki\.com\.cn\/article\/(\w{4})-\d+-(\d+)\.htm.*$/i)) {
        window.location.href = window.location.href.replace(/^https?:\/\/cdmd\.cnki\.com\.cn\/article\/(\w{4})-\d+-(\d+)\.htm.*$/i, 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?dbcode=$1&filename=$2.nh');
    };

    //知网空间-cpfd
    if (window.location.href.match(/^https?:\/\/cpfd\.cnki\.com\.cn\/article\/\w{4}total-\w+\.htm/i)) {
        window.location.href = window.location.href.replace(/^https?:\/\/cpfd\.cnki\.com\.cn\/article\/(\w{4})total-(\w+)\.htm.*$/i, 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?dbcode=$1&filename=$2');
    };

    //知网空间-www
    if (window.location.href.match(/^https?:\/\/www\.cnki\.com\.cn\/article\/\w{4}total-\w+\.htm/i)) {
        window.location.href = window.location.href.replace(/^https?:\/\/www\.cnki\.com\.cn\/article\/(\w{4})total-(\w+)\.htm.*$/i, 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?dbcode=$1&filename=$2');
    };

    //知网-dbcode
    if (window.location.href.match(/^https?:\/\/\S*\.?cnki\.net\/kcms\/detail\/detail\.aspx\?(?=.*dbcode\=(\w+))(?=.*filename\=([\w\.]+))/i)) {
        window.location.href = window.location.href.replace(/^https?:\/\/\S*\.?cnki\.net\/kcms\/detail\/detail\.aspx\?(?=.*dbcode\=(\w+))(?=.*filename\=([\w\.]+)).*$/i, 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?dbcode=$1&filename=$2');
    };

    //知网-无dbcode
    if (window.location.href.match(/^https?:\/\/\S*\.?cnki\.net\/kcms\/detail\/detail\.aspx\?(?!.*dbcode\=\w+)(?=.*dbname\=(\w+))(?=.*filename\=([\w\.]+))/i)) {
        window.location.href = window.location.href.replace(/^https?:\/\/\S*\.?cnki\.net\/kcms\/detail\/detail\.aspx\?(?!.*dbcode\=\w+)(?=.*dbname\=(\w+))(?=.*filename\=([\w\.]+)).*$/i, 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?dbcode=$1&filename=$2');
    };

})();
