// ==UserScript==
// @name         重定向知网至海外版 — PDF、CAJ均可下载
// @namespace    cnki_to_oversea
// @description  将知网文献页重定向至海外版以便下载文献。知网海外版支持下载硕博论文PDF、支持机构IP登录。此脚本支持知网主站、知网空间、知网编客、知网拾贝、知网百科、知网阅读、知网文化、知网法律、知网医院数字图书馆、手机知网等站点。
// @version      4.0
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAB10lEQVQ4jZVSP8hpcRj+nZs6oiPkpFBkoCxnQCeT0rdQyiCZDAwYTOQsBsOR/aRshlMymsSK/JkMysDgz3KOZDmO8t/vDu79fO51b33P9r71vO/7PO+DwKIbfAuw6Ia/IQhCPB6nKEoURfgWRbfkK/l0OrXb7dlsZrPZIpHI2wU/vha322273fp8Pq/X+6+LXgij0Wi32+VyueVymc1m1+v1/zRsNhuCIFQqVSwWUyqVarV6Op1+Hs9xnCiKsOh+Emia/pyi0+mazSaE8HK59Pv9TCbjcDjy+fyL6FAohGEYwzD3+73RaJjN5mq1utlsptOpxWK5Xq/dbhd8vNq63+8ZhjEajbVabbFYGAyGRCJxPB5Pp1MwGOx0Os8Nk8mE4zipVDoYDFarVblcdjqdBEFgGIaiaKVSQRDE5XKBHpAAAHie93g85/PZbrfP53OKotLptEajsVqtrVZLJpPRNO33+w+HAwaABAAAISRJEsfxbDZbr9f1er1Go0EQJJVKDYfDXq9XKpU8Ho9cLn/aKgjCw9lAIFAoFMLh8Gw2e3T2+/2baCgUCp7no9EoSZLRaNRkMkEIWZbFcfyPv/0ijMfjh6HJZFKr1bIsi6KoRCIBfwH5brx/AseDLUJKQoGcAAAAAElFTkSuQmCC
// @author       MkQtS
// @license      MIT
// @homepage     https://github.com/MkQtS/CNKI-Redirect
// @supportURL   https://github.com/MkQtS/CNKI-Redirect/issues
// @run-at       document-end
// @match        *://cnki.net/*
// @match        *://*.cnki.net/*
// @match        *://*.cnki.com.cn/*
// @exclude      *://*.cnki.net/kcms/detail/frame/*
// @exclude      *://*.cnki.net/kcms/detail/knetsearch.*
// @exclude      *://*.cnki.net/kcms2/video/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function CNKI_Redirect() {
    'use strict';
    const sitePref = 'oversea', langPref = 'hans';
    const targetPrefixes = {
        global: {
            en: 'https://global.cnki.net/kcms/detail/detail.aspx?',
            hans: 'https://gb.global.cnki.net/kcms/detail/detail.aspx?',
            hant: 'https://big5.global.cnki.net/kcms/detail/detail.aspx?',
        }, oversea: {
            en: 'https://oversea.cnki.net/kcms/detail/detail.aspx?',
            hans: 'https://chn.oversea.cnki.net/kcms/detail/detail.aspx?',
            hant: 'https://tra.oversea.cnki.net/kcms/detail/detail.aspx?',
        },
    };

    function GetSituation(url) {
        url = url.toLowerCase();
        const CNKICASES = ['error', 'ideal', 'ideal', 'bianke', 'mall', 'my', 'space', 'urtpweb', 'wap', 'wenhua', 'xuewen', 'common'];
        const CNKIREGEXES = [
            /^https?:\/\/[\w\.]+\.cnki\.net\/kcms\/detail\/error/,
            /^https?:\/\/(\w+\.)?(global|oversea)\.cnki\.net\/kcms\/detail\/detail\.aspx\?dbcode=\w+&filename=[\w\.]+$/,
            /^https?:\/\/kns\.cnki\.net\/kcms\/detail\/detail\.aspx\?dbcode=cyfd&filename=[\w\.]+$/,
            /^https?:\/\/bianke\.cnki\.net\/web\/article\//,
            /^https?:\/\/mall\.cnki\.net\/magazine\/article\//,
            /^https?:\/\/my\.cnki\.net\/(m\/)?documentdetail\.html\?/,
            /^https?:\/\/\w+\.cnki\.com\.cn\/article\//,
            /^https?:\/\/\w+\.cnki\.net\/urtpweb\/detail\?/,
            /^https?:\/\/(read|wap)\.cnki\.net\/(((touch\/)?web\/\w+\/article\/)|(\w+-[\w\.]+\.htm))/,
            /^https?:\/\/wh\.cnki\.net\/article\/detail\//,
            /^https?:\/\/xuewen\.cnki\.net\/\w+-[\w\.]+\.htm/,
            /^https?:\/\/([\w\.]+\.)?cnki\.net\/kcms\d*\/(article|detail|doi)\//,
        ];
        let situation = 'skip';
        for (let i = 0; i < CNKIREGEXES.length; i++) {
            if (CNKIREGEXES[i].test(url)) {
                console.log('[CNKI-Redirect] Rule for %s matched.', CNKICASES[i]);
                situation = CNKICASES[i];
                break;
            }
        }
        return situation;
    }

    function GetFileID(type, url) {
        url = url.toLowerCase();
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
                    let fileinfo = url.replace(/^https?:\/\/\w+\.cnki\.net\/(?:touch\/)?(?:web\/)?(\S+)\.htm.*$/, '$1').replace(/^(\w+)\/article\/(?:\w*-)?([\w\.]+)$/, '$1-$2');
                    const DBLINK = ['conference', 'dissertation', 'journal', 'newspaper', 'huiyi', 'lunwen', 'qikan', 'baozhi'];
                    const DBREAL = ['CIPD', 'CDMD', 'CJFD', 'CCND', 'CIPD', 'CDMD', 'CJFD', 'CCND'];
                    dbcode = DBREAL[DBLINK.indexOf(fileinfo.replace(/^(\w+)-[\w\.]+$/, '$1'))];
                    filename = fileinfo.replace(/^\w+-([\w\.]+)$/, '$1');
                }
                break;
            } case 'wenhua': {
                dbcode = document.getElementById('journalimg')?.src?.replace(/^https?:\/\/[\w\.]+\.cnki\.net\/(\w+)\/.+$/i, '$1');
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
                    let trackfile = (document.getElementById('addfavtokpc') || document.getElementById('SnapshotSearchButton'))?.onclick?.toString();
                    if (trackfile) {
                        let fileinfo = trackfile.replace(/^[\S\s]+(?:AddFavToMyCnki|StartSnapShotSearch)\([^')]*'([^']+)'[^')]+'([^']+)'[^)]*\)[\S\s]+$/, '$1-$2');
                        dbcode = fileinfo.replace(/^(\w+)-[\w\.]+$/, '$1');
                        filename = fileinfo.replace(/^\w+-([\w\.]+)$/, '$1');
                    } else {
                        let urlParams = new URLSearchParams(url.split('?')[1]);
                        dbcode = urlParams.get('dbcode') || urlParams.get('dbname')?.replace(/^(\w{4})\w*$/, '$1');
                        filename = urlParams.get('filename');
                    }
                }
                break;
            }
        }
        let fileID = ((dbcode, filename) => {
            let fileObj, rawFileID, targetFileID, alterFileID;
            if (!dbcode || !filename) {
                console.log('[CNKI-Redirect] Insufficient parameters. dbcode: %s, filename: %s', dbcode, filename);
            } else if (/^\w+$/.test(dbcode) && /^[\w\.]+$/.test(filename)) {
                rawFileID = [dbcode.toUpperCase(), filename.toUpperCase()];
                dbcode = rawFileID[0].replace(/^[A-Z]+_([A-Z]+)$/, '$1');
                const cmnDB = ['CCJD', 'CCND', 'CDMD', 'CIPD', 'CJFD', 'CYFD'];
                if (cmnDB.indexOf(dbcode) === -1) {
                    const oddDB = ['BNJK', 'BSFD', 'CACM', 'CDMH', 'CLKB', 'IPFD'];
                    const badDB = ['CCVD', 'CISD', 'CLKC', 'CPVD', 'SCEF', 'SCHF', 'SCOD', 'SCPD', 'SCSF', 'SMSD', 'SNAD', 'SOPD'];
                    if (oddDB.indexOf(dbcode) !== -1) {
                        const odd2cmn = ['CJFD', 'CYFD', 'CJFD', 'CDMD', 'CDMD', 'CIPD'];
                        dbcode = odd2cmn[oddDB.indexOf(dbcode)];
                    } else if (badDB.indexOf(dbcode) !== -1) {
                        dbcode = dbcode + '-BAD';
                    } else {
                        let dbkey = dbcode.replace(/^C(\w)F\w+$/, '$1').replace(/^CF(\w)\w+$/, '$1').replace(/^\w+(\w)$/, '$1');
                        const dbkeys = ['D', 'I', 'J', 'M', 'N', 'P', 'Y'];
                        const key2cmn = ['CDMD', 'CIPD', 'CJFD', 'CDMD', 'CCND', 'CIPD', 'CYFD'];
                        dbcode = key2cmn[dbkeys.indexOf(dbkey)] || rawFileID[0] + '-BAD';
                    }
                    console.log('[CNKI-Redirect] Convert dbcode from %s to %s.', rawFileID[0], dbcode);
                }
                if (/^\w+-BAD$/.test(dbcode)) {
                    console.log('[CNKI-Redirect] The dbcode: %s is out of my scope.', rawFileID[0]);
                } else {
                    filename = rawFileID[1];
                    if (dbcode === 'CDMD') {
                        filename = filename.replace(/^([\w\.]+)$/, '$1.NH').replace(/^([\w\.]+?)(\.NH)+$/, '$1.nh');
                    } else if (dbcode === 'CJFD') {
                        console.log('[CNKI-Redirect] Set alternate file ID: dbcode=CCJD&filename=%s', filename);
                        alterFileID = ['CCJD', filename];
                    }
                    console.log('[CNKI-Redirect] Got file ID: dbcode=%s&filename=%s', dbcode, filename);
                    targetFileID = [dbcode, filename];
                    fileObj = { raw: rawFileID, target: targetFileID, alter: alterFileID };
                }
            } else {
                console.log('[CNKI-Redirect] Invalid file ID: dbcode=%s&filename=%s', dbcode, filename);
            }
            return fileObj;
        })(dbcode, filename);
        return fileID;
    }

    let currentUrl = window.location.href;
    let situation = GetSituation(currentUrl);
    switch (situation) {
        case 'skip': {
            console.log('[CNKI-Redirect] Skipped.');
            break;
        } case 'error': {
            let recordedSrc = GM_getValue('source') || { sourceUrl: 'clear', fileID: { raw: ['clear', 'clear'], target: ['clear', 'clear'] } };
            if (!!recordedSrc.fileID.alter) {
                console.log('[CNKI-Redirect] First target failed, try alternate');
                GM_setValue('source', { sourceUrl: recordedSrc.sourceUrl, fileID: { raw: recordedSrc.fileID.raw, target: recordedSrc.fileID.alter } });
                window.location.replace(targetPrefixes[sitePref][langPref] + 'dbcode=' + recordedSrc.fileID.alter[0] + '&filename=' + recordedSrc.fileID.alter[1]);
            } else if (recordedSrc.sourceUrl !== 'clear') {
                console.log('[CNKI-Redirect] Error! Go back to original page...');
                GM_setValue('banRedirect', [recordedSrc.fileID.raw[0], recordedSrc.fileID.raw[1]]);
                window.location.replace(recordedSrc.sourceUrl);
            } else {
                console.log('[CNKI-Redirect] Original page not found, stay here.');
            }
            break;
        } case 'ideal': {
            let recordedSrc = GM_getValue('source') || { sourceUrl: 'clear', fileID: { raw: ['clear', 'clear'], target: ['clear', 'clear'] } };
            if (recordedSrc.sourceUrl !== 'clear') {
                (source => {
                    const BTNTEXT = {
                        'kns.cnki.net': '🙃 打开源页面',
                        'oversea.cnki.net': '🙃 Open original', 'chn.oversea.cnki.net': '🙃 打开源页面', 'tra.oversea.cnki.net': '🙃 打開源頁面',
                        'global.cnki.net': '🙃 Open original', 'gb.global.cnki.net': '🙃 打开源页面', 'big5.global.cnki.net': '🙃 打開源頁面',
                    }
                    const srcBtn = `<li class='btn-go2src' style='background-color: rgb(238, 119, 85); color: rgb(255, 255, 255); text-align: center; border: none; border-radius: 4px;'><a id='go2src' title='${source.sourceUrl}'>${BTNTEXT[window.location.host]}</a></li>`;
                    let targetArea = document.getElementById('DownLoadParts').querySelector('.operate-btn') || document.getElementById('DownLoadParts').querySelector('.operate-left');
                    targetArea?.insertAdjacentHTML('beforeend', srcBtn);
                    document.getElementById('go2src')?.addEventListener('click', () => {
                        GM_setValue('banRedirect', [source.fileID.raw[0], source.fileID.raw[1]]);
                        console.log('[CNKI-Redirect] Open original page...');
                        window.open(source.sourceUrl, '_blank');
                    });
                    return 0;
                })(recordedSrc);
                GM_setValue('source', { sourceUrl: 'clear', fileID: { raw: ['clear', 'clear'], target: ['clear', 'clear'] } });
            }
            console.log('[CNKI-Redirect] Ideal case, done.');
            break;
        } default: {
            let fileID = GetFileID(situation, currentUrl);
            if (fileID) {
                let banCheck = GM_getValue('banRedirect') || ['clear', 'clear'];
                if (fileID.raw.toString() === banCheck.toString()) {
                    GM_setValue('banRedirect', ['clear', 'clear']);
                    console.log('[CNKI-Redirect] Redirect for this file is not allowed. Refresh to try again.');
                } else {
                    window.stop();
                    GM_setValue('source', { sourceUrl: currentUrl, fileID: fileID });
                    if (fileID.target[0] === 'CYFD') {
                        window.location.replace('https://kns.cnki.net/kcms/detail/detail.aspx?dbcode=CYFD&filename=' + fileID.target[1]);
                    } else {
                        window.location.replace(targetPrefixes[sitePref][langPref] + 'dbcode=' + fileID.target[0] + '&filename=' + fileID.target[1]);
                    }
                }
            } else {
                console.log('[CNKI-Redirect] No proper file ID found.');
            }
            break;
        }
    }
})();
