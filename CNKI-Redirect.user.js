// ==UserScript==
// @name         重定向知网至海外版 — PDF、CAJ均可下载
// @namespace    cnki_to_oversea
// @description  将知网文献页重定向至海外版以便下载文献。支持下载硕博论文PDF，支持机构IP登录，支持知网主站、知网空间、知网编客、知网拾贝、知网百科、知网阅读、知网文化、知网法律、手机知网等站点。
// @version      3.8
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAB10lEQVQ4jZVSP8hpcRj+nZs6oiPkpFBkoCxnQCeT0rdQyiCZDAwYTOQsBsOR/aRshlMymsSK/JkMysDgz3KOZDmO8t/vDu79fO51b33P9r71vO/7PO+DwKIbfAuw6Ia/IQhCPB6nKEoURfgWRbfkK/l0OrXb7dlsZrPZIpHI2wU/vha322273fp8Pq/X+6+LXgij0Wi32+VyueVymc1m1+v1/zRsNhuCIFQqVSwWUyqVarV6Op1+Hs9xnCiKsOh+Emia/pyi0+mazSaE8HK59Pv9TCbjcDjy+fyL6FAohGEYwzD3+73RaJjN5mq1utlsptOpxWK5Xq/dbhd8vNq63+8ZhjEajbVabbFYGAyGRCJxPB5Pp1MwGOx0Os8Nk8mE4zipVDoYDFarVblcdjqdBEFgGIaiaKVSQRDE5XKBHpAAAHie93g85/PZbrfP53OKotLptEajsVqtrVZLJpPRNO33+w+HAwaABAAAISRJEsfxbDZbr9f1er1Go0EQJJVKDYfDXq9XKpU8Ho9cLn/aKgjCw9lAIFAoFMLh8Gw2e3T2+/2baCgUCp7no9EoSZLRaNRkMkEIWZbFcfyPv/0ijMfjh6HJZFKr1bIsi6KoRCIBfwH5brx/AseDLUJKQoGcAAAAAElFTkSuQmCC
// @author       MkQtS
// @license      MIT
// @homepage     https://github.com/MkQtS/CNKI-Redirect
// @supportURL   https://github.com/MkQtS/CNKI-Redirect/issues
// @run-at       document-end
// @match        *://cnki.net/*
// @match        *://*.cnki.net/*
// @match        *://*.cnki.com.cn/*
// @exclude      *://*.cnki.net/kcms/detail/frame/list.aspx*
// @exclude      *://*.cnki.net/kcms/detail/knetsearch.aspx*
// @exclude      *://*.cnki.net/kcms2/video/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function CNKI_Redirect() {
    'use strict';

    //const targetSite = 'https://oversea.cnki.net/kcms/detail/detail.aspx?';
    const targetSite = 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?';
    //const targetSite = 'https://tra.oversea.cnki.net/kcms/detail/detail.aspx?';

    function GetSituation(url) {
        const CNKITYPE = {
            'ERROR': {
                Check: /^https?:\/\/[^/]+\.cnki\.net\/kcms\/detail\/error/,
                Type: 'error'
            }, 'IDEAL': {
                Check: /^https?:\/\/(\w+\.)?oversea\.cnki\.net\/kcms\/detail\/detail\.aspx\?dbcode=\w+&filename=[\w\.]+$/,
                Type: 'ideal'
            }, 'BIANKE': {
                Check: /^https?:\/\/bianke\.cnki\.net\/web\/article\//,
                Type: 'bianke'
            }, 'MALL': {
                Check: /^https?:\/\/mall\.cnki\.net\/magazine\/article\//,
                Type: 'mall'
            }, 'MY': {
                Check: /^https?:\/\/my\.cnki\.net\/(m\/)?documentdetail\.html\?/,
                Type: 'my'
            }, 'SPACE': {
                Check: /^https?:\/\/[^/]+\.cnki\.com\.cn\/article\//,
                Type: 'space'
            }, 'URTPWEB': {
                Check: /^https?:\/\/\w+\.cnki\.net\/urtpweb\/detail\?/,
                Type: 'urtpweb'
            }, 'WAP': {
                Check: /^https?:\/\/(read|wap)\.cnki\.net\/(((touch\/)?web\/\w+\/article)|(\w+-[\w\.]+\.htm))/,
                Type: 'wap'
            }, 'WENHUA': {
                Check: /^https?:\/\/wh\.cnki\.net\/article\/detail\//,
                Type: 'wenhua'
            }, 'XUEWEN': {
                Check: /^https?:\/\/xuewen\.cnki\.net\/\w+-[\w\.]+\.htm/,
                Type: 'xuewen'
            }, 'COMMON': {
                Check: /^https?:\/\/([\w\.]+)?cnki\.net\/kcms\d*\/(article|detail|doi)\//,
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
        let dbcode, filename;
        switch (type) {
            case 'bianke': {
                let downlink = document.querySelector('.abstract.clearfix > .wrap > .aBtn')?.href;
                if (downlink) {
                    let fileinfo = downlink.replace(/^https?:\/\/bianke\.cnki\.net\/z\/download\/article\/([\w\.]+)\/(\w+)\/.+$/i, '$2-$1');
                    dbcode = fileinfo.replace(/^(\w+)-[\w\.]+$/, '$1');
                    filename = fileinfo.replace(/^\w+-([\w\.]+)$/, '$1');
                }
                break;
            } case 'mall': {
                dbcode = document.getElementById('articleType')?.value;
                filename = document.getElementById('articleFileName')?.value;
                if (!dbcode || !filename) {
                    let fileinfo = url.replace(/^https?:\/\/mall\.cnki\.net\/magazine\/article\/(\w+)\/([\w\.]+)\.htm.*$/, '$1-$2');
                    dbcode = fileinfo.replace(/^(\w+)-[\w\.]+$/, '$1');
                    filename = fileinfo.replace(/^\w+-([\w\.]+)$/, '$1');
                }
                break;
            } case 'my': {
                let urlParams = new URLSearchParams(url.split('?')[1]);
                dbcode = urlParams.get('productid');
                filename = urlParams.get('filename');
                break;
            } case 'space': {
                let fileinfo = url.replace(/^https?:\/\/(\w+)\.cnki\.com\.cn\/article\/([\w\.-]+)\.htm.*$/, '$2@$1').replace(/^(\w+)((-\d+-)|(total-))/, '$1-').replace(/^([\w\.]+)@(\w+)$/, '$2-$1@$2');
                dbcode = fileinfo.replace(/^(\w+)-[\w\.]+@\w+$/, '$1');
                filename = fileinfo.replace(/^\w+-([\w\.]+)@\w+$/, '$1');
                break;
            } case 'urtpweb': {
                dbcode = document.getElementById('rescode')?.value;
                filename = document.getElementById('filename')?.value;
                break;
            } case 'wap': {
                dbcode = document.getElementById('a_download')?.dataset.type;
                filename = document.getElementById('a_download')?.dataset.filename;
                if (!dbcode || !filename) {
                    let fileinfo = url.replace(/^https?:\/\/\w+\.cnki\.net\/(touch\/)?(web\/)?(\S+)\.htm.*$/, '$3').replace(/^(\w+)\/article\/(\w+-)?([\w\.]+)$/, '$1-$3');
                    const DBLINK = ['conference', 'dissertation', 'journal', 'newspaper', 'huiyi', 'lunwen', 'qikan', 'baozhi'];
                    const DBREAL = ['CIPD', 'CDMD', 'CJFD', 'CCND', 'CIPD', 'CDMD', 'CJFD', 'CCND'];
                    dbcode = DBREAL[DBLINK.indexOf(fileinfo.replace(/^(\w+)-[\w\.]+$/, '$1'))];
                    filename = fileinfo.replace(/^\w+-([\w\.]+)$/, '$1');
                }
                break;
            } case 'wenhua': {
                dbcode = document.getElementById('journalimg')?.src?.replace(/^https?:\/\/[^/]+\.cnki\.net\/([^/]+)\/.+$/i, '$1');
                filename = url.replace(/^https?:\/\/wh\.cnki\.net\/article\/detail\/([\w\.]+).*$/, '$1');
                break;
            } case 'xuewen': {
                dbcode = url.replace(/^https?:\/\/xuewen\.cnki\.net\/(\w+)-[\w\.]+\.htm.*$/, '$1');
                filename = url.replace(/^https?:\/\/xuewen\.cnki\.net\/\w+-([\w\.]+)\.htm.*$/, '$1');
                break;
            } case 'common': {
                dbcode = document.getElementById('paramdbcode')?.value;
                filename = document.getElementById('paramfilename')?.value;
                if (!dbcode || !filename) {
                    let favfile = document.getElementById('addfavtokpc')?.onclick?.toString();
                    if (favfile) {
                        let fileinfo = favfile.replace(/^[\S\s]+AddFavToMyCnki\(([^)]+)\)[\S\s]+$/, '$1').replace(/^[^,]+,\s+'([^']+)',\s+'([^']+)'$/, '$1-$2');
                        dbcode = fileinfo.replace(/^(\w+)-[\w\.]+$/, '$1');
                        filename = fileinfo.replace(/^\w+-([\w\.]+)$/, '$1');
                    } else {
                        let snapfile = document.getElementById('SnapshotSearchButton')?.onclick?.toString();
                        if (snapfile) {
                            let fileinfo = snapfile.replace(/^[\S\s]+StartSnapShotSearch\(([^)]+)\)[\S\s]+$/, '$1').replace(/^'([^']+)'[^']+'([^']+)'.*$/, '$1-$2');
                            dbcode = fileinfo.replace(/^(\w+)-[\w\.]+$/, '$1');
                            filename = fileinfo.replace(/^\w+-([\w\.]+)$/, '$1');
                        }
                    }
                }
                break;
            }
        }

        let fileID;
        if (dbcode && filename) {
            let dbcodeIn = dbcode.toUpperCase();
            dbcode = dbcodeIn.replace(/^[A-Z]+_([A-Z]+)$/, '$1');
            const cmnDB = ['CCJD', 'CCND', 'CDMD', 'CIPD', 'CJFD', 'CYFD'];
            if (cmnDB.indexOf(dbcode) == -1) {
                const oddDB = ['BNJK', 'CACM', 'CLKB', 'CLKC', 'CPVD', 'IPFD'];
                if (oddDB.indexOf(dbcode) !== -1) {
                    const odd2cmn = ['CJFD', 'CJFD', 'CDMD', 'BAD-DB', 'BAD-DB', 'CIPD'];
                    dbcode = odd2cmn[oddDB.indexOf(dbcode)];
                } else {
                    let dbkey = dbcode.replace(/^C(\w)F\w+$/, '$1').replace(/^CF(\w)\w+$/, '$1').replace(/^\w+(\w)$/, '$1');
                    const dbkeys = ['D', 'I', 'J', 'M', 'N', 'P', 'Y'];
                    const key2cmn = ['CDMD', 'CIPD', 'CJFD', 'CDMD', 'CCND', 'CIPD', 'CYFD'];
                    dbcode = key2cmn[dbkeys.indexOf(dbkey)] || dbcodeIn;
                }
                console.log('[CNKI-Redirect] Convert dbcode from %s to %s.', dbcodeIn, dbcode);
            }
            filename = filename.toUpperCase();
            if (dbcode == 'CDMD') {
                filename = filename.replace(/^([\w\.]+)$/, '$1.NH').replace(/^([\w\.]+?)(\.NH)+$/, '$1.nh');
            }
            fileID = 'dbcode=' + dbcode + '&filename=' + filename;
            let fileID_Check = /^dbcode=\w+&filename=[\w\.]+$/;
            if (!fileID_Check.test(fileID)) {
                console.log('[CNKI-Redirect] Invalid fileID: ' + fileID);
                fileID = undefined;
            }
        }
        return fileID;
    }

    let currentUrl = window.location.href;
    let situation = GetSituation(currentUrl.toLowerCase());

    switch (situation) {
        case 'error': {
            let source = GM_getValue('source');
            if (source[1] !== 'clear') {
                GM_setValue('banRedirect', source[0]);
                console.log('[CNKI-Redirect] Error! Go back to previous page...');
                window.location.replace(source[1]);
            } else {
                console.log('[CNKI-Redirect] Previous page not found, stay here.');
            }
            break;
        } case 'ideal': {
            let source = GM_getValue('source');
            if (source[1] !== 'clear') {
                (source => {
                    const BTNTEXT = {
                        'oversea.cnki.net': '🙃 Open original',
                        'chn.oversea.cnki.net': '🙃 打开源页面',
                        'tra.oversea.cnki.net': '🙃 打開源頁面',
                    }
                    const srcBtn = `<li class='btn-go2src' style='background-color: rgb(238, 119, 85); color: rgb(255, 255, 255); text-align: center; border: none; border-radius: 4px;'><a id='go2src' title='${source[1]}'>${BTNTEXT[window.location.host]}</a></li>`;
                    let targetArea = document.getElementById('DownLoadParts').querySelector('.operate-btn') || document.getElementById('DownLoadParts').querySelector('.operate-left');
                    targetArea?.insertAdjacentHTML('beforeend', srcBtn);
                    document.getElementById('go2src')?.addEventListener('click', () => {
                        GM_setValue('banRedirect', source[0]);
                        console.log('[CNKI-Redirect] Open original page...');
                        window.open(source[1], '_blank');
                    });
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
            let fileID = GetFileID(situation, currentUrl.toLowerCase());
            if (fileID) {
                console.log('[CNKI-Redirect] Got file ID: ' + fileID);
                let banCheck = GM_getValue('banRedirect');
                if (fileID == banCheck) {
                    GM_setValue('banRedirect', 'clear');
                    console.log('[CNKI-Redirect] Redirect for this file is not allowed. Refresh to try again.');
                } else {
                    window.stop();
                    GM_setValue('source', [fileID, currentUrl]);
                    window.location.replace(targetSite + fileID);
                }
            } else {
                console.log('[CNKI-Redirect] No proper file ID found.');
            }
            break;
        }
    }
})();
