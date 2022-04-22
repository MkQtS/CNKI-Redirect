// ==UserScript==
// @name         重定向知网至海外版
// @namespace    cnki_redirect_to_oversea
// @description  将部分知网界面重定向到海外版知网
// @version      1.1
// @icon         https://cnki.net/favicon.ico
// @author       MkQtS
// @homepage     https://github.com/MkQtS/CNKI-Redirect
// @match        *://cnki.net/*
// @match        *://*.cnki.net/*
// @match        *://*.cnki.com.cn/*
// @exclude      *://chn.oversea.cnki.net/*
// @exclude      *://web01.cnki.net/*
// @grant        none
// ==/UserScript==

/**
Chrome等浏览器支持添加自定义搜索引擎，CNKI海外版格式：
https://chn.oversea.cnki.net/kns/defaultresult/index?&kw=%s
**/

(function() {
    var current_url=window.location.href;

    //知网空间 CNKI.COM.CN
    if (current_url.match(/^https?:\/\/\S+\.cnki\.com\.cn\/article\//i)) {
        //cdmd
        if (current_url.match(/^https?:\/\/cdmd\.cnki\.com\.cn\/article\/\w{4}-\d+-\d+\.htm.*$/i)) {
            window.location.href = current_url.replace(/^https?:\/\/cdmd\.cnki\.com\.cn\/article\/(\w{4})-\d+-(\d+)\.htm.*$/i, 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?dbcode=$1&filename=$2.nh');
        }
        //cpfd
        else if (current_url.match(/^https?:\/\/cpfd\.cnki\.com\.cn\/article\/\w{4}total-\w+\.htm/i)) {
            window.location.href = current_url.replace(/^https?:\/\/cpfd\.cnki\.com\.cn\/article\/(\w{4})total-(\w+)\.htm.*$/i, 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?dbcode=$1&filename=$2');
        }
        //cyfd
        else if (current_url.match(/^https?:\/\/cyfd\.cnki\.com\.cn\/article\/\w+\.htm/i)) {
            window.location.href = current_url.replace(/^https?:\/\/cyfd\.cnki\.com\.cn\/article\/(\w+)\.htm.*$/i, 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?dbcode=CYFD&filename=$1');
        }
        //www
        else if (current_url.match(/^https?:\/\/www\.cnki\.com\.cn\/article\/\w{4}total-\w+\.htm/i)) {
            window.location.href = current_url.replace(/^https?:\/\/www\.cnki\.com\.cn\/article\/(\w{4})total-(\w+)\.htm.*$/i, 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?dbcode=$1&filename=$2');
        }
        else {}
    };

    //知网 CNKI.NET
    if (current_url.match(/^https?:\/\/\S*\.?cnki\.net\//i)) {
        //wap
        if (current_url.match(/^https?:\/\/wap\.cnki\.net\/touch\/web\//i)) {
            var wap_article = document.getElementById('a_download').onclick.toString();
            var wap_article_info=wap_article.replace(/^[\S\s]+GetDownloadInfo_\d+\('(\w+)','(\w+)'\)[\S\s]+/,'dbcode=$2&filename=$1');
            var wap_oversea_link = 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?' + wap_article_info;
            window.location.href = wap_oversea_link;
        }
        //common-dbcode
        else if (current_url.match(/^https?:\/\/\S*\.?cnki\.net\/kcms\/detail\/detail\.aspx\?(?=.*dbcode\=\w+)(?=.*filename\=[\w\.]+)/i)) {
            window.location.href = current_url.replace(/^https?:\/\/\S*\.?cnki\.net\/kcms\/detail\/detail\.aspx\?(?=.*dbcode\=(\w+))(?=.*filename\=([\w\.]+)).*$/i, 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?dbcode=$1&filename=$2');
        }
        //common-dbname
        else if (current_url.match(/^https?:\/\/\S*\.?cnki\.net\/kcms\/detail\/detail\.aspx\?(?!.*dbcode\=\w+)(?=.*dbname\=\w+)(?=.*filename\=[\w\.]+)/i)) {
            window.location.href = current_url.replace(/^https?:\/\/\S*\.?cnki\.net\/kcms\/detail\/detail\.aspx\?(?!.*dbcode\=\w+)(?=.*dbname\=(\w+))(?=.*filename\=([\w\.]+)).*$/i, 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?dbname=$1&filename=$2');
        }
        //other situations
        else if (current_url.match(/^https?:\/\/\S*\.?cnki\.net\/kcms\/detail/i)) {
            var var_dbcode = document.getElementById('paramdbcode').value;
            var var_filename = document.getElementById('paramfilename').value;
            var oversea_link = 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?dbcode=' + var_dbcode + '&filename=' + var_filename;
            window.location.href = oversea_link;
        }
        else{}
    };

})();

