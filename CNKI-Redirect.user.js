// ==UserScript==
// @name         重定向知网至海外版
// @namespace    cnki_redirect_to_oversea
// @description  将部分知网界面重定向到海外版知网，支持多数知网文献页、知网空间和手机知网。
// @version      1.2
// @icon         https://cnki.net/favicon.ico
// @author       MkQtS
// @homepage     https://github.com/MkQtS/CNKI-Redirect
// @match        *://cnki.net/*
// @match        *://*.cnki.net/*
// @match        *://*.cnki.com.cn/*
// @grant        none
// ==/UserScript==

(function () {

    var current_url = window.location.href;
    var situation, dbcode, filename;

    if (current_url.match(/^https?:\/\/chn\.oversea\.cnki\.net\/kcms\/detail\/detail\.aspx\?dbcode=[^&]+&filename=[^&]+$/i)) {
        situation = 'skip';//IDEAL URL
    }
    else if (current_url.match(/^https?:\/\/\S+\.cnki\.com\.cn\/article\//i)) {
        situation = 'space';//CNKI.COM.CN
    }
    else if (current_url.match(/^https?:\/\/wap\.cnki\.net\/touch\/web\//i)) {
        situation = 'wap';//WAP.CNKI.NET
    }
    else if (current_url.match(/^https?:\/\/\S*\.?cnki\.net\/kcms\/detail/i)) {
        situation = 'common';//OTHER CNKI.NET
    }
    else {
        situation = 'skip';//NOT MATCH
    };

    switch (situation) {
        case 'skip':
            break;
        case 'space':
            var spacetype = current_url.replace(/^https?:\/\/(\S+)\.cnki\.com\.cn\/.*$/i, '$1');
            switch (spacetype) {
                case 'cdmd':
                    dbcode = current_url.replace(/^https?:\/\/cdmd\.cnki\.com\.cn\/article\/(\w{4})-\d+-\d+\.htm.*$/i, '$1');
                    filename = current_url.replace(/^https?:\/\/cdmd\.cnki\.com\.cn\/article\/\w{4}-\d+-(\d+)\.htm.*$/i, '$1.nh');
                    break;
                case 'cpfd':
                    dbcode = current_url.replace(/^https?:\/\/cpfd\.cnki\.com\.cn\/article\/(\w{4})total-\w+\.htm.*$/i, '$1');
                    filename = current_url.replace(/^https?:\/\/cpfd\.cnki\.com\.cn\/article\/\w{4}total-(\w+)\.htm.*$/i, '$1');
                    break;
                case 'cyfd':
                    dbcode = 'CYFD';
                    filename = current_url.replace(/^https?:\/\/cyfd\.cnki\.com\.cn\/article\/(\w+)\.htm.*$/i, '$1');
                    break;
                case 'www':
                    dbcode = current_url.replace(/^https?:\/\/www\.cnki\.com\.cn\/article\/(\w{4})total-\w+\.htm.*$/i, '$1');
                    filename = current_url.replace(/^https?:\/\/www\.cnki\.com\.cn\/article\/\w{4}total-(\w+)\.htm.*$/i, '$1');
                    break;
                default:
                    break;
            };
            break;
        case 'wap':
            var wap_article_info = document.getElementById('a_download').onclick.toString();
            dbcode = wap_article_info.replace(/^[\S\s]+GetDownloadInfo_\d+\('\w+','(\w+)'\)[\S\s]+/, '$1');
            filename = wap_article_info.replace(/^[\S\s]+GetDownloadInfo_\d+\('(\w+)','\w+'\)[\S\s]+/, '$1');
            break;
        case 'common':
            dbcode = document.getElementById('paramdbcode').value;
            filename = document.getElementById('paramfilename').value;
            break;
    };

    var new_url = 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?dbcode=' + dbcode + '&filename=' + filename;
    if (dbcode && current_url != new_url) {
        window.location.href = new_url;
    };

}
)();

