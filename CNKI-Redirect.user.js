// ==UserScript==
// @name         重定向知网至海外版 — PDF、CAJ均可下载
// @namespace    cnki_to_oversea
// @description  将知网文献页重定向至海外版以便下载文献。支持下载硕博论文PDF，支持机构IP登录，支持知网空间、知网拾贝、知网百科、知网阅读、知网文化、知网法律、手机知网等站点。
// @version      3.4
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAB10lEQVQ4jZVSP8hpcRj+nZs6oiPkpFBkoCxnQCeT0rdQyiCZDAwYTOQsBsOR/aRshlMymsSK/JkMysDgz3KOZDmO8t/vDu79fO51b33P9r71vO/7PO+DwKIbfAuw6Ia/IQhCPB6nKEoURfgWRbfkK/l0OrXb7dlsZrPZIpHI2wU/vha322273fp8Pq/X+6+LXgij0Wi32+VyueVymc1m1+v1/zRsNhuCIFQqVSwWUyqVarV6Op1+Hs9xnCiKsOh+Emia/pyi0+mazSaE8HK59Pv9TCbjcDjy+fyL6FAohGEYwzD3+73RaJjN5mq1utlsptOpxWK5Xq/dbhd8vNq63+8ZhjEajbVabbFYGAyGRCJxPB5Pp1MwGOx0Os8Nk8mE4zipVDoYDFarVblcdjqdBEFgGIaiaKVSQRDE5XKBHpAAAHie93g85/PZbrfP53OKotLptEajsVqtrVZLJpPRNO33+w+HAwaABAAAISRJEsfxbDZbr9f1er1Go0EQJJVKDYfDXq9XKpU8Ho9cLn/aKgjCw9lAIFAoFMLh8Gw2e3T2+/2baCgUCp7no9EoSZLRaNRkMkEIWZbFcfyPv/0ijMfjh6HJZFKr1bIsi6KoRCIBfwH5brx/AseDLUJKQoGcAAAAAElFTkSuQmCC
// @author       MkQtS
// @license      MIT
// @homepage     https://github.com/MkQtS/CNKI-Redirect
// @supportURL   https://github.com/MkQtS/CNKI-Redirect/issues
// @match        *://cnki.net/*
// @match        *://*.cnki.net/*
// @match        *://*.cnki.com.cn/*
// @exclude      *://*.cnki.net/kcms/detail/frame/list.aspx*
// @exclude      *://*.cnki.net/kcms2/video/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    //const targetSite = 'https://oversea.cnki.net/kcms/detail/detail.aspx?';
    const targetSite = 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?';
    //const targetSite = 'https://tra.oversea.cnki.net/kcms/detail/detail.aspx?';

    function GetSituation(url) {
        const CNKITYPE = {
            'ERROR': {
                Check: /^https?:\/\/[^/]+\.cnki\.net\/kcms\/detail\/error/i,
                Type: 'error'
            }, 'IDEAL': {
                Check: /^https?:\/\/(\w+\.)?oversea\.cnki\.net\/kcms\/detail\/detail\.aspx\?dbcode=[\w]+&filename=[\w\.]+$/i,
                Type: 'ideal'
            }, 'LAW': {
                Check: /^https?:\/\/lawnew\.cnki\.net\/kcms\/detail\//i,
                Type: 'law'
            }, 'MALL': {
                Check: /^https?:\/\/mall\.cnki\.net\/magazine\/article\//i,
                Type: 'mall'
            }, 'MY': {
                Check: /^https?:\/\/my\.cnki\.net\/documentdetail\.html\?/i,
                Type: 'my'
            }, 'READ': {
                Check: /^https?:\/\/read\.cnki\.net\/web\/\w+\/article\//i,
                Type: 'read'
            }, 'SPACE': {
                Check: /^https?:\/\/[^/]+\.cnki\.com\.cn\/article\//i,
                Type: 'space'
            }, 'STE': {
                Check: /^https?:\/\/(hypt01|hypt02|hypt03|hypt04|ste|web01|web02|web03)\.cnki\.net\/kcms\/detail\//i,
                Type: 'ste'
            }, 'WAP': {
                Check: /^https?:\/\/wap\.cnki\.net\/((touch\/web\/\w+\/article)|(\w+-[\w\.]+\.htm))/i,
                Type: 'wap'
            }, 'WENHUA': {
                Check: /^https?:\/\/wh\.cnki\.net\/article\/detail\//i,
                Type: 'wenhua'
            }, 'XUEWEN': {
                Check: /^https?:\/\/xuewen\.cnki\.net\/\w+-[\w\.]+\.htm/i,
                Type: 'xuewen'
            }, 'COMMON': {
                Check: /^https?:\/\/([\w\.]+)?cnki\.net\/kcms\d*\/(article|detail)\//i,
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
            case 'law': {
                let snapfile = document.getElementById('SnapshotSearchButton')?.onclick?.toString();
                if (snapfile) {
                    let fileinfo = snapfile.replace(/^[\S\s]+StartSnapShotSearch\(([^)]+)\)[\S\s]+$/, '$1').replace(/^'([^']+)'[^']+'([^']+)'.*$/, '$1-$2');
                    dbcode = fileinfo.replace(/^(\w+)-[\w\.]+$/, '$1');
                    filename = fileinfo.replace(/^\w+-([\w\.]+)$/, '$1');
                }
                break;
            } case 'mall': {
                dbcode = document.getElementById('articleType')?.value;
                filename = document.getElementById('articleFileName')?.value;
                if (!dbcode || !filename) {
                    let linkinfo = url.replace(/^https?:\/\/mall\.cnki\.net\/magazine\/article\/(\w+)\/([\w\.]+)\.htm.*$/i, '$1-$2');
                    dbcode = linkinfo.replace(/^(\w+)-[\w\.]+$/, '$1');
                    filename = linkinfo.replace(/^\w+-([\w\.]+)$/, '$1');
                }
                break;
            } case 'my': {
                let urlParams = new URLSearchParams(url.toLowerCase().split('?')[1]);
                dbcode = urlParams.get('productid');
                filename = urlParams.get('filename');
                break;
            } case 'read': {
                dbcode = document.getElementById('a_download')?.dataset.type;
                filename = document.getElementById('a_download')?.dataset.filename;
                if (!dbcode || !filename) {
                    const DBLINK = ['conference', 'dissertation', 'journal', 'newspaper'];
                    const DBREAL = ['CIPD', 'CDMD', 'CJFD', 'CCND'];
                    dbcode = DBREAL[DBLINK.indexOf(url.replace(/^https?:\/\/read\.cnki\.net\/web\/(\w+)\/article\/.*$/i, '$1').toLowerCase())];
                    filename = url.replace(/^https?:\/\/read\.cnki\.net\/web\/\w+\/article\/([\w\.]+)\.htm.*$/i, '$1');
                }
                break;
            } case 'space': {
                let linkinfo = url.replace(/^https?:\/\/(\w+)\.cnki\.com\.cn\/article\/([\w\.-]+)\.htm.*$/i, '$2@$1').replace(/^(\w+)(-\d+-)|(total-)/i, '$1-').replace(/^([\w\.]+)@(\w+)$/, '$2-$1@$2');
                dbcode = linkinfo.replace(/^(\w+)-[\w\.]+@\w+$/i, '$1');
                filename = linkinfo.replace(/^\w+-([\w\.]+)@\w+$/i, '$1');
                break;
            } case 'ste': {
                let favfile = document.getElementById('addfavtokpc')?.onclick?.toString();
                if (favfile) {
                    let fileinfo = favfile.replace(/^[\S\s]+AddFavToMyCnki\(([^)]+)\)[\S\s]+$/, '$1').replace(/^[^,]+,\s+'([^']+)',\s+'([^']+)'$/, '$1-$2');
                    dbcode = fileinfo.replace(/^(\w+)-[\w\.]+$/, '$1');
                    filename = fileinfo.replace(/^\w+-([\w\.]+)$/, '$1');
                }
                break;
            } case 'wap': {
                dbcode = document.getElementById('a_download')?.dataset.type;
                filename = document.getElementById('a_download')?.dataset.filename;
                if (!dbcode || !filename) {
                    let linkinfo = url.replace(/^https?:\/\/wap\.cnki\.net\/(touch\/web\/)?(\S+)\.htm.*$/i, '$2').replace(/^(\w+)\/\w+\/([\w\.]+)$/, '$1-$2');
                    const DBLINK = ['conference', 'dissertation', 'journal', 'newspaper', 'huiyi', 'lunwen', 'qikan', 'baozhi'];
                    const DBREAL = ['CIPD', 'CDMD', 'CJFD', 'CCND', 'CIPD', 'CDMD', 'CJFD', 'CCND'];
                    dbcode = DBREAL[DBLINK.indexOf(linkinfo.replace(/^(\w+)-[\w\.]+$/, '$1').toLowerCase())];
                    filename = linkinfo.replace(/^\w+-([\w\.]+)$/, '$1');
                }
                break;
            } case 'wenhua': {
                dbcode = document.getElementById('journalimg')?.src?.replace(/^https?:\/\/[^/]+\.cnki\.net\/([^/]+)\/.+$/i, '$1');
                filename = url.replace(/^https?:\/\/wh\.cnki\.net\/article\/detail\/([\w\.]+).*$/i, '$1');
                break;
            } case 'xuewen': {
                dbcode = url.replace(/^https?:\/\/xuewen\.cnki\.net\/(\w+)-[\w\.]+\.htm.*$/i, '$1');
                filename = url.replace(/^https?:\/\/xuewen\.cnki\.net\/\w+-([\w\.]+)\.htm.*$/i, '$1');
                break;
            } case 'common': {
                dbcode = document.getElementById('paramdbcode')?.value;
                filename = document.getElementById('paramfilename')?.value;
                break;
            }
        }

        let fileID;
        if (dbcode && filename) {
            dbcode = dbcode.toUpperCase();
            const cmnDB = ['CCND', 'CDMD', 'CIPD', 'CJFD', 'CYFD', 'BAD-DB'];
            if (cmnDB.indexOf(dbcode) == -1) {
                const oddDB = [['CFND', 'CLKN', 'DJSN', 'DXXN', 'FDCT_PHAN', 'GDKN', 'HJTT_HBYN', 'JNGN', 'LRIN', 'SCGN'],
                ['CDFD', 'CFMD', 'CLKB', 'CLKD', 'CLKM', 'CMFD', 'DJSD', 'DJSM', 'DXXD', 'DXXM', 'FDCT_PHAD', 'FDCT_PHAM', 'GDKD', 'GDKM', 'HJTT_HBYD', 'HJTT_HBYM', 'JNGD', 'JNGM', 'LRID', 'LRIM', 'SCGD', 'SCGM'],
                ['CFPD', 'CLKP', 'CPFD', 'DJSP', 'DXXP', 'FDCT_PHAI', 'FDCT_PHAP', 'GDKI', 'GDKP', 'HJTT_HBYI', 'HJTT_HBYP', 'IPFD', 'JNGI', 'JNGP', 'LRII', 'LRIP', 'SCGI', 'SCGP'],
                ['CFJC', 'CFJD', 'CFJG', 'CFJW', 'CFJX', 'CJFQ', 'CLKJ', 'DJSJ', 'DXXJ', 'FDCT_PHAJ', 'GDKJ', 'HJTT_HBYJ', 'JNGJ', 'JYSJ', 'LRIJ', 'SCGJ'],
                ['DXXY', 'FDCT_PHAY', 'GDKY', 'HJTT_HBYY', 'JNGY', 'LRIY', 'SCGY'],
                ['CLKC', 'CPVD']];
                for (let dbType = 0; dbType <= 5; dbType++) {
                    let oddType = oddDB[dbType].indexOf(dbcode);
                    if (oddType !== -1) {
                        dbcode = cmnDB[dbType];
                        console.log('[CNKI-Redirect] Convert dbcode from %s to %s.', oddDB[dbType][oddType], cmnDB[dbType]);
                        break;
                    }
                }
            }
            filename = filename.toUpperCase();
            if (dbcode == 'CDMD') {
                filename = filename.replace(/^([\w\.]+)$/, '$1.NH').replace(/^([\w\.]+?)(\.NH)+$/, '$1.nh');
            }
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

    switch (situation) {
        case 'error': {
            let source = GM_getValue('source');
            if (source[1] !== 'clear') {
                GM_setValue('banRedirect', source[0]);
                console.log('[CNKI-Redirect] Error! Go back to previous page...');
                window.location.href = source[1];
            } else {
                console.log('[CNKI-Redirect] Previous page not found, stay here.');
            }
            break;
        } case 'ideal': {
            let source = GM_getValue('source');
            if (source[1] !== 'clear') {
                (source => {
                    let retBtnLi = document.createElement('li');
                    retBtnLi.setAttribute('class', 'btn-go2src');
                    retBtnLi.setAttribute('style', 'background-color: rgb(238, 119, 85); color: rgb(255, 255, 255); text-align: center; border: none; border-radius: 4px;');
                    let retBtnA = document.createElement('a');
                    retBtnA.setAttribute('id', 'go2src');
                    const BTNTEXT = {
                        'oversea.cnki.net': '🙃 Open original',
                        'chn.oversea.cnki.net': '🙃 打开源页面',
                        'tra.oversea.cnki.net': '🙃 打開源頁面',
                    }
                    retBtnA.textContent = BTNTEXT[window.location.host];
                    retBtnA.setAttribute('title', source[1]);
                    retBtnA.addEventListener('click', () => {
                        GM_setValue('banRedirect', source[0]);
                        console.log('[CNKI-Redirect] Back to original...');
                        window.open(source[1], '_blank');
                    });
                    retBtnLi.appendChild(retBtnA);
                    let targetArea = document.getElementById('DownLoadParts').querySelector('.operate-btn');
                    if (!!targetArea) {
                        targetArea.appendChild(retBtnLi);
                    } else {
                        document.getElementById('DownLoadParts')?.appendChild(retBtnLi);
                    }
                    return 0;
                })(source);
                GM_setValue('source', ['clear', 'clear']);
            }
            console.log('[CNKI-Redirect] Ideal link, done.');
            break;
        } case 'skip': {
            console.log('[CNKI-Redirect] Skipped.');
            break;
        } default: {
            let fileID = GetFileID(situation, currentUrl);
            if (fileID) {
                console.log('[CNKI-Redirect] Got file ID: ' + fileID);
                let banCheck = GM_getValue('banRedirect');
                if (fileID == banCheck) {
                    GM_setValue('banRedirect', 'clear');
                    console.log('[CNKI-Redirect] Redirect for this file is not allowed. Refresh to try again.');
                } else {
                    window.stop();
                    GM_setValue('source', [fileID, currentUrl]);
                    window.location.href = targetSite + fileID;
                }
            } else {
                console.log('[CNKI-Redirect] No proper file ID found.');
            }
            break;
        }
    }
})();
