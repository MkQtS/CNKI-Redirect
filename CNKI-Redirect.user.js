// ==UserScript==
// @name         重定向知网至海外版
// @namespace    cnki_to_oversea
// @description  将知网文献页重定向至海外版以便下载文献。支持知网空间、知网百科、知网阅读、知网文化及手机知网。
// @version      2.6
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAB10lEQVQ4jZVSP8hpcRj+nZs6oiPkpFBkoCxnQCeT0rdQyiCZDAwYTOQsBsOR/aRshlMymsSK/JkMysDgz3KOZDmO8t/vDu79fO51b33P9r71vO/7PO+DwKIbfAuw6Ia/IQhCPB6nKEoURfgWRbfkK/l0OrXb7dlsZrPZIpHI2wU/vha322273fp8Pq/X+6+LXgij0Wi32+VyueVymc1m1+v1/zRsNhuCIFQqVSwWUyqVarV6Op1+Hs9xnCiKsOh+Emia/pyi0+mazSaE8HK59Pv9TCbjcDjy+fyL6FAohGEYwzD3+73RaJjN5mq1utlsptOpxWK5Xq/dbhd8vNq63+8ZhjEajbVabbFYGAyGRCJxPB5Pp1MwGOx0Os8Nk8mE4zipVDoYDFarVblcdjqdBEFgGIaiaKVSQRDE5XKBHpAAAHie93g85/PZbrfP53OKotLptEajsVqtrVZLJpPRNO33+w+HAwaABAAAISRJEsfxbDZbr9f1er1Go0EQJJVKDYfDXq9XKpU8Ho9cLn/aKgjCw9lAIFAoFMLh8Gw2e3T2+/2baCgUCp7no9EoSZLRaNRkMkEIWZbFcfyPv/0ijMfjh6HJZFKr1bIsi6KoRCIBfwH5brx/AseDLUJKQoGcAAAAAElFTkSuQmCC
// @author       MkQtS
// @license      MIT
// @homepage     https://github.com/MkQtS/CNKI-Redirect
// @supportURL   https://github.com/MkQtS/CNKI-Redirect/issues
// @match        *://cnki.net/*
// @match        *://*.cnki.net/*
// @match        *://*.cnki.com.cn/*
// @exclude      *://*.cnki.net/kcms/detail/frame/list.aspx*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    const target = 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?';
    //const target = 'https://oversea.cnki.net/kcms/detail/detail.aspx?';
    //const target = 'https://tra.oversea.cnki.net/kcms/detail/detail.aspx?';

    function GetSituation(url) {
        const CNKITYPE = {
            'ERROR': {
                Check: /^https?:\/\/[^/]+\.cnki\.net\/kcms\/detail\/error/i,
                Type: 'error'
            },
            'IDEAL': {
                Check: /^https?:\/\/(\w+\.)?oversea\.cnki\.net\/kcms\/detail\/detail\.aspx\?dbcode=[\w]+&filename=[\w\.]+$/i,
                Type: 'skip'
            },
            'MALL': {
                Check: /^https?:\/\/mall\.cnki\.net\/magazine\/article\//i,
                Type: 'mall'
            },
            'READ': {
                Check: /^https?:\/\/read\.cnki\.net\/web\/\w+\/article\//i,
                Type: 'read'
            },
            'SPACE': {
                Check: /^https?:\/\/[^/]+\.cnki\.com\.cn\/article\//i,
                Type: 'space'
            },
            'WAP': {
                Check: /^https?:\/\/wap\.cnki\.net\/touch\/web\//i,
                Type: 'wap'
            },
            'WENHUA': {
                Check: /^https?:\/\/wh\.cnki\.net\/article\/detail\//i,
                Type: 'wenhua'
            },
            'XUEWEN': {
                Check: /^https?:\/\/xuewen\.cnki\.net\/\w+-[\w\.]+\.htm/i,
                Type: 'xuewen'
            },
            'COMMON': {
                Check: /^https?:\/\/([\w\.]+)?cnki\.net\/kcms\/detail/i,
                Type: 'common'
            },
        };

        let situation = 'skip';
        for (let i in CNKITYPE) {
            if (CNKITYPE[i].Check.test(url)) {
                console.log('[CNKI-Redirect] Rule for %s matched.', i);
                situation = CNKITYPE[i].Type;
                break;
            }
        }
        return situation;
    }

    function GetFileID(type, url) {
        let dbcode, filename
        switch (type) {
            case 'skip':
                break;
            case 'mall': {
                dbcode = document.getElementById('articleType').value;
                filename = document.getElementById('articleFileName').value;
                break;
            }
            case 'read': {
                dbcode = document.getElementById('a_download').dataset.type;
                filename = document.getElementById('a_download').dataset.filename;
                break;
            }
            case 'space': {
                let spacetype = url.replace(/^https?:\/\/([^/]+)\.cnki\.com\.cn\/.+$/i, '$1').toLowerCase();
                switch (spacetype) {
                    case 'cdmd':
                        dbcode = url.replace(/^https?:\/\/cdmd\.cnki\.com\.cn\/article\/(\w+)-\d+-\d+\.htm.*$/i, '$1');
                        filename = url.replace(/^https?:\/\/cdmd\.cnki\.com\.cn\/article\/\w+-\d+-(\d+)\.htm.*$/i, '$1.nh');
                        break;
                    case 'cpfd':
                        dbcode = url.replace(/^https?:\/\/cpfd\.cnki\.com\.cn\/article\/(\w+)total-[\w\.]+\.htm.*$/i, '$1');
                        filename = url.replace(/^https?:\/\/cpfd\.cnki\.com\.cn\/article\/\w+total-([\w\.]+)\.htm.*$/i, '$1');
                        break;
                    case 'cyfd':
                        dbcode = 'CYFD';
                        filename = url.replace(/^https?:\/\/cyfd\.cnki\.com\.cn\/article\/([\w\.]+)\.htm.*$/i, '$1');
                        break;
                    case 'www':
                        dbcode = url.replace(/^https?:\/\/www\.cnki\.com\.cn\/article\/(\w+)total-[\w\.]+\.htm.*$/i, '$1');
                        filename = url.replace(/^https?:\/\/www\.cnki\.com\.cn\/article\/\w+total-([\w\.]+)\.htm.*$/i, '$1');
                        break;
                    default:
                        break;
                }
                break;
            }
            case 'wap': {
                dbcode = document.getElementById('a_download').dataset.type;
                filename = document.getElementById('a_download').dataset.filename;
                break;
            }
            case 'wenhua': {
                dbcode = document.getElementById('journalimg').src.replace(/^https?:\/\/[^/]+\.cnki\.net\/([^/]+)\/.+$/i, '$1');
                filename = url.replace(/^https?:\/\/wh\.cnki\.net\/article\/detail\/([\w\.]+).*$/i, '$1');
                break;
            }
            case 'xuewen':
                dbcode = url.replace(/^https?:\/\/xuewen\.cnki\.net\/(\w+)-[\w\.]+\.htm.*$/i, '$1');
                filename = url.replace(/^https?:\/\/xuewen\.cnki\.net\/\w+-([\w\.]+)\.htm.*$/i, '$1');
                break;
            case 'common': {
                dbcode = document.getElementById('paramdbcode').value;
                filename = document.getElementById('paramfilename').value;
                break;
            }
        }

        let fileID;
        if (dbcode && filename) {
            dbcode = dbcode.toUpperCase();
            filename = filename.toUpperCase().replace(/^(\w+)\.NH$/, '$1.nh');
            fileID = 'dbcode=' + dbcode + '&filename=' + filename;
            let fileID_Check = /^dbcode=\w+&filename=[\w\.]+$/;
            if (!fileID_Check.test(fileID)) {
                console.log('[CNKI-Redirect] Invalid fileID:\n%s', fileID);
                fileID = undefined;
            }
        }
        return fileID;
    }

    let currentUrl = window.location.href;
    let situation = GetSituation(currentUrl);

    if (situation == 'error') {
        let source = GM_getValue('source');
        GM_setValue('banRedirect', source[0]);
        console.log('[CNKI-Redirect] Error! Go back to previous page...');
        window.location.href = source[1];
    }
    else {
        let fileID = GetFileID(situation, currentUrl);
        if (fileID) {
            console.log('[CNKI-Redirect] Got file ID: ' + fileID);
            let banCheck = GM_getValue('banRedirect');
            if (fileID == banCheck) {
                GM_setValue('banRedirect', 'clear');
                console.log('[CNKI-Redirect] Already failed, so stay here.');
                console.log('[CNKI-Redirect] Refresh to try again.');
            }
            else {
                let source = [];
                source[0] = fileID;
                source[1] = currentUrl;
                GM_setValue('source', source);
                let newUrl = target + fileID;
                window.location.href = newUrl;
            }
        }
    }
})();
