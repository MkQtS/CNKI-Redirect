// ==UserScript==
// @name         重定向知网至海外版
// @namespace    cnki_to_oversea
// @description  将部分知网界面重定向到海外版知网，支持多数知网文献页、知网空间和手机知网。
// @version      1.8
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAB10lEQVQ4jZVSP8hpcRj+nZs6oiPkpFBkoCxnQCeT0rdQyiCZDAwYTOQsBsOR/aRshlMymsSK/JkMysDgz3KOZDmO8t/vDu79fO51b33P9r71vO/7PO+DwKIbfAuw6Ia/IQhCPB6nKEoURfgWRbfkK/l0OrXb7dlsZrPZIpHI2wU/vha322273fp8Pq/X+6+LXgij0Wi32+VyueVymc1m1+v1/zRsNhuCIFQqVSwWUyqVarV6Op1+Hs9xnCiKsOh+Emia/pyi0+mazSaE8HK59Pv9TCbjcDjy+fyL6FAohGEYwzD3+73RaJjN5mq1utlsptOpxWK5Xq/dbhd8vNq63+8ZhjEajbVabbFYGAyGRCJxPB5Pp1MwGOx0Os8Nk8mE4zipVDoYDFarVblcdjqdBEFgGIaiaKVSQRDE5XKBHpAAAHie93g85/PZbrfP53OKotLptEajsVqtrVZLJpPRNO33+w+HAwaABAAAISRJEsfxbDZbr9f1er1Go0EQJJVKDYfDXq9XKpU8Ho9cLn/aKgjCw9lAIFAoFMLh8Gw2e3T2+/2baCgUCp7no9EoSZLRaNRkMkEIWZbFcfyPv/0ijMfjh6HJZFKr1bIsi6KoRCIBfwH5brx/AseDLUJKQoGcAAAAAElFTkSuQmCC
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

var currentUrl = window.location.href;
var situation = 'skip';
var fileID;

const CNKITYPE = {
    'IDEAL': {
        Check: /^https?:\/\/(\w+\.)?oversea\.cnki\.net\/kcms\/detail\/detail\.aspx\?dbcode=[\w]+&filename=[\w\.]+$/i,
        Type: 'skip'
    },
    'WAP.CNKI.NET': {
        Check: /^https?:\/\/wap\.cnki\.net\/touch\/web\//i,
        Type: 'wap'
    },
    'CNKI.COM.CN': {
        Check: /^https?:\/\/[^/]+\.cnki\.com\.cn\/article\//i,
        Type: 'space'
    },
    'COMMON': {
        Check: /^https?:\/\/([\w\.]+)?cnki\.net\/kcms\/detail/i,
        Type: 'common'
    },
};

for (let i in CNKITYPE) {
    if (CNKITYPE[i].Check.test(currentUrl)) {
        situation = CNKITYPE[i].Type;
        break;
    };
};

switch (situation) {
    case 'skip':
        break;
    case 'space': {
        let spacetype = currentUrl.replace(/^https?:\/\/([^/]+)\.cnki\.com\.cn\/.+$/i, '$1');
        switch (spacetype) {
            case 'cdmd':
                fileID = currentUrl.replace(/^https?:\/\/cdmd\.cnki\.com\.cn\/article\/(\w+)-\d+-(\d+)\.htm.*$/i, 'dbcode=$1&filename=$2.nh');
                window.stop();
                break;
            case 'cpfd':
                fileID = currentUrl.replace(/^https?:\/\/cpfd\.cnki\.com\.cn\/article\/(\w+)total-(\w+)\.htm.*$/i, 'dbcode=$1&filename=$2');
                window.stop();
                break;
            case 'cyfd':
                fileID = currentUrl.replace(/^https?:\/\/cyfd\.cnki\.com\.cn\/article\/(\w+)\.htm.*$/i, 'dbcode=CYFD&filename=$1');
                window.stop();
                break;
            case 'www':
                fileID = currentUrl.replace(/^https?:\/\/www\.cnki\.com\.cn\/article\/(\w+)total-(\w+)\.htm.*$/i, 'dbcode=$1&filename=$2');
                window.stop();
                break;
            default:
                break;
        };
        break;
    };
    case 'wap': {
        let wap_info_check = /^[\S\s]+GetDownloadInfo_\d+\('[\w\.]+','\w+'[\S\s]+$/;
        let wap_info = document.getElementById('a_download').onclick.toString();
        if (wap_info_check.test(wap_info)) {
            fileID = wap_info.replace(/^[\S\s]+GetDownloadInfo_\d+\('([\w\.]+)','(\w+)'[\S\s]+$/, 'dbcode=$2&filename=$1');
        };
        break;
    };
    case 'common': {
        let dbcode = document.getElementById('paramdbcode').value;
        let filename = document.getElementById('paramfilename').value;
        if (dbcode && filename) {
            filename = filename.toUpperCase().replace(/^([^.]+)\.NH$/i, '$1.nh');
            fileID = "dbcode=" + dbcode + "&filename=" + filename;
        };
        break;
    };
};

if (fileID) {
    let newUrl = target + fileID;
    window.location.href = newUrl;
};

