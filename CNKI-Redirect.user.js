// ==UserScript==
// @name         重定向知网至海外版
// @namespace    cnki_redirect_to_oversea
// @description  将部分知网界面重定向到海外版知网，支持多数知网文献页、知网空间和手机知网。
// @version      1.7
// @icon         https://cnki.net/favicon.ico
// @author       MkQtS
// @homepage     https://github.com/MkQtS/CNKI-Redirect
// @updateURL    https://raw.githubusercontent.com/MkQtS/CNKI-Redirect/main/CNKI-Redirect.user.js
// @downloadURL  https://raw.githubusercontent.com/MkQtS/CNKI-Redirect/main/CNKI-Redirect.user.js
// @match        *://cnki.net/*
// @match        *://*.cnki.net/*
// @match        *://*.cnki.com.cn/*
// @grant        none
// ==/UserScript==

'use strict';

var target = 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?';
//var target = 'https://oversea.cnki.net/kcms/detail/detail.aspx?';
//var target = 'https://tra.oversea.cnki.net/kcms/detail/detail.aspx?';

var current_url = window.location.href;
var situation, fileID;

if (current_url.match(/^https?:\/\/(\w+\.)?oversea\.cnki\.net\/kcms\/detail\/detail\.aspx\?dbcode=[\w]+&filename=[\w\.]+$/i)) {
    situation = 'skip';
}//IDEAL URL
else if (current_url.match(/^https?:\/\/[^/]+\.cnki\.com\.cn\/article\//i)) {
    situation = 'space';
}//CNKI.COM.CN
else if (current_url.match(/^https?:\/\/wap\.cnki\.net\/touch\/web\//i)) {
    situation = 'wap';
}//WAP.CNKI.NET
else if (current_url.match(/^https?:\/\/([\w\.]+)?cnki\.net\/kcms\/detail/i)) {
    situation = 'common';
}//OTHER CNKI.NET
else {
    situation = 'skip';
};//NOT MATCH

switch (situation) {
    case 'skip':
        break;
    case 'space': {
        let spacetype = current_url.replace(/^https?:\/\/(\S+)\.cnki\.com\.cn\/.*$/i, '$1');
        switch (spacetype) {
            case 'cdmd':
                fileID = current_url.replace(/^https?:\/\/cdmd\.cnki\.com\.cn\/article\/(\w+)-\d+-(\d+)\.htm.*$/i, 'dbcode=$1&filename=$2.nh');
                window.stop();
                break;
            case 'cpfd':
                fileID = current_url.replace(/^https?:\/\/cpfd\.cnki\.com\.cn\/article\/(\w+)total-(\w+)\.htm.*$/i, 'dbcode=$1&filename=$2');
                window.stop();
                break;
            case 'cyfd':
                fileID = current_url.replace(/^https?:\/\/cyfd\.cnki\.com\.cn\/article\/(\w+)\.htm.*$/i, 'dbcode=CYFD&filename=$1');
                window.stop();
                break;
            case 'www':
                fileID = current_url.replace(/^https?:\/\/www\.cnki\.com\.cn\/article\/(\w+)total-(\w+)\.htm.*$/i, 'dbcode=$1&filename=$2');
                window.stop();
                break;
            default:
                break;
        };
        break;
    };
    case 'wap': {
        let wap_article_info = document.getElementById('a_download').onclick.toString();
        if (wap_article_info.match(/^[\S\s]+GetDownloadInfo_\d+\('[\w\.]+','\w+'[\S\s]+$/)) {
            fileID = wap_article_info.replace(/^[\S\s]+GetDownloadInfo_\d+\('([\w\.]+)','(\w+)'[\S\s]+$/, 'dbcode=$2&filename=$1');
        };
        break;
    };
    case 'common': {
        let dbcode = document.getElementById('paramdbcode').value;
        let filename = document.getElementById('paramfilename').value;
        if (dbcode && filename) {
            fileID = "dbcode=" + dbcode + "&filename=" + filename;
        };
        break;
    };
};

if (fileID) {
    let new_url = target + fileID;
    window.location.href = new_url;
};

