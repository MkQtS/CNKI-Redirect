// ==UserScript==
// @name         重定向知网至海外版 — PDF、CAJ均可下载
// @namespace    cnki_to_oversea
// @description  将知网文献页重定向至海外版以便下载文献。知网海外版支持下载硕博论文PDF、支持机构IP登录。此脚本支持知网主站、知网空间、知网编客、知网拾贝、知网百科、知网阅读、知网文化、知网法律、知网医院数字图书馆、手机知网等站点。
// @version      4.3
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
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function CNKI_Redirect(currentUrl) {
	'use strict';
	function GenerateTargetUrl(dbcode, filename) {
		let targetSite, targetUrl;
		const [sitePref, langPref] = ['oversea', 'hans'],
			idealSites = {
				global: { en: 'global.cnki.net', hans: 'gb.global.cnki.net', hant: 'big5.global.cnki.net' },
				oversea: { en: 'oversea.cnki.net', hans: 'chn.oversea.cnki.net', hant: 'tra.oversea.cnki.net' },
			};
		dbcode === 'CYFD' ? targetSite = 'kns.cnki.net' : targetSite = idealSites[sitePref][langPref];
		targetUrl = 'https://' + targetSite + '/kcms/detail/detail.aspx?dbcode=' + dbcode + '&filename=' + filename;
		return targetUrl;
	}

	function GetSituation(url) {
		url = url.toLowerCase();
		const CNKICASES = ['common', 'xuewen', 'wenhua', 'wap', 'urtpweb', 'space', 'my', 'mall', 'bianke', 'ideal', 'ideal', 'error'],
			CNKIREGEXES = [
				/^https?:\/\/(?:[\w\.]+\.)?cnki\.net\/(?:law|kcms\d?)\/(?:article\/|detail(?:\?|\/detail)|doi\/)/,
				/^https?:\/\/xuewen\.cnki\.net\/\w+-[\w\.]+\.htm/,
				/^https?:\/\/wh\.cnki\.net\/(?:m\/)?article\/detail\//,
				/^https?:\/\/(?:read|wap)\.cnki\.net\/(?:(?:(?:touch\/)?web\/\w+\/article\/)|(?:\w+-[\w\.]+\.htm))/,
				/^https?:\/\/\w+\.cnki\.net\/urtpweb\/detail\?/,
				/^https?:\/\/\w+\.cnki\.com\.cn\/article\//,
				/^https?:\/\/my\.cnki\.net\/(?:m\/)?documentdetail\.html\?/,
				/^https?:\/\/mall\.cnki\.net\/magazine\/article\//,
				/^https?:\/\/bianke\.cnki\.net\/web\/article\//,
				/^https?:\/\/kns\.cnki\.net\/kcms\/detail\/detail\.aspx\?dbcode=cyfd&filename=[\w\.]+$/,
				/^https?:\/\/(?:\w+\.)?(global|oversea)\.cnki\.net\/kcms\/detail\/detail\.aspx\?dbcode=\w+&filename=[\w\.]+$/,
				/^https?:\/\/[\w\.]+\.cnki\.net\/kcms\/detail\/error/,
			];
		let situation = 'skip';
		for (let i = CNKIREGEXES.length - 1; i >= 0; i--) {
			if (CNKIREGEXES[i].test(url)) {
				situation = CNKICASES[i];
				console.info('[CNKI-Redirect] Rule for %s matched.', situation);
				break;
			}
		}
		return situation;
	}

	const defFileID = { raw: ['clear', 'clear'], target: ['clear', 'clear'] };
	function GetFileID(type, url) {
		url = url.toLowerCase();
		let dbcode, filename, fileID = defFileID;
		switch (type) {
			case 'bianke': {
				let dbinfo = (document.querySelector('.abstract.clearfix > .wrap > .aBtn') || document.querySelector('.articleInfo > .title > .clearfix > strong > a'))?.href.toLowerCase();
				if (dbinfo) {
					dbcode = dbinfo.replace(/^https?:\/\/bianke\.cnki\.net\/z\/download\/article\/[\w\.]+\/(\w+)\/.+$/, '$1').replace(/^https?:\/\/search\.cnki\.com\.cn\/(\w+)\/.+$/, '$1');
					filename = url.replace(/^https?:\/\/bianke\.cnki\.net\/web\/article\/([\w\.]+)\.htm.*$/, '$1');
				}
				break;
			} case 'mall': {
				dbcode = document.getElementById('articleType')?.value;
				filename = document.getElementById('articleFileName')?.value;
				if (!dbcode || !filename) {
					let downParams = new URLSearchParams(document.getElementsByClassName('articledownload')[0]?.href.toLowerCase().split('?')[1]);
					dbcode = downParams.get('dbtype');
					filename = downParams.get('filename');
				}
				break;
			} case 'my': {
				let urlParams = new URLSearchParams(url.split('?')[1]);
				dbcode = urlParams.get('productid');
				filename = urlParams.get('filename');
				break;
			} case 'space': {
				let fileinfo = url.replace(/^https?:\/\/(\w+)\.cnki\.com\.cn\/article\/([\w\.-]+)\.htm.*$/, '$1-$2').replace(/^\w+-(\w+)(?:(?:-\d+)|(?:total))-([\w\.]+)$/, '$1-$2');
				[dbcode, filename] = fileinfo.split('-');
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
					[dbcode, filename] = fileinfo.split('-');
					const DBLINK = ['conference', 'dissertation', 'journal', 'newspaper', 'huiyi', 'lunwen', 'qikan', 'baozhi'],
						DBREAL = ['CIPD', 'CDMD', 'CJFD', 'CCND', 'CIPD', 'CDMD', 'CJFD', 'CCND'];
					dbcode = DBREAL[DBLINK.indexOf(dbcode)] || dbcode;
				}
				break;
			} case 'wenhua': {
				if (document.getElementById('journalimg') || document.getElementsByClassName('hero-cover-img').length) {
					dbcode = 'CJFD';
					filename = url.replace(/^https?:\/\/wh\.cnki\.net\/(?:m\/)?article\/detail\/([\w\.]+).*$/, '$1');
				}
				break;
			} case 'xuewen': {
				let fileinfo = url.replace(/^https?:\/\/xuewen\.cnki\.net\/(\w+-[\w\.]+)\.htm.*$/, '$1');
				[dbcode, filename] = fileinfo.split('-');
				break;
			} case 'common': {
				dbcode = document.getElementById('paramdbcode')?.value;
				filename = document.getElementById('paramfilename')?.value;
				if (!dbcode || !filename) {
					let trackfile = (document.getElementById('addfavtokpc') || document.getElementById('SnapshotSearchButton'))?.onclick.toString().toLowerCase();
					if (trackfile) {
						let fileinfo = trackfile.replace(/^[\S\s]+(?:addfavtomycnki|startsnapshotsearch)\([^')]*'([^']+)'[^')]+'([^']+)'[^)]*\)[\S\s]+$/, '$1-$2');
						[dbcode, filename] = fileinfo.split('-');
					} else {
						let urlParams = new URLSearchParams(url.split('?')[1]);
						dbcode = urlParams.get('dbcode') || urlParams.get('dbname')?.replace(/(auto|day|last|temp|total|\d+)/g, '').replace(/^\w+(\w{4})$/, '$1');
						filename = urlParams.get('filename');
					}
				}
				break;
			}
		}
		if (!dbcode || !filename) {
			console.debug('[CNKI-Redirect] Insufficient file ID. dbcode: %s, filename: %s', dbcode, filename);
		} else if (/^\w+$/.test(dbcode) && /^[\w\.]+$/.test(filename)) {
			fileID = ((dbcode, filename) => {
				let fileIDObj = { raw: [dbcode.toUpperCase(), filename.toUpperCase()] };
				dbcode = fileIDObj.raw[0].replace(/^[A-Z]+_([A-Z]+)$/, '$1');
				filename = fileIDObj.raw[1];
				const cmnDB = ['CCJD', 'CCND', 'CDMD', 'CIPD', 'CJFD', 'CYFD'];
				if (cmnDB.indexOf(dbcode) === -1) {
					const oddDB = ['BNJK', 'BSFD', 'CACM', 'CDMH', 'CLKB', 'IPFD'],
						badDB = ['CCVD', 'CISD', 'CLKLP', 'CPVD', 'SCOD', 'SCPD', 'SMSD', 'SNAD', 'SOPD'];
					if (oddDB.indexOf(dbcode) === badDB.indexOf(dbcode)) {
						let dbKey = dbcode.replace(/^C(\w)F\w+$/, '$1').replace(/^CF(\w)\w+$/, '$1').replace(/^\w+(\w)$/, '$1');
						const dbKeys = ['D', 'I', 'J', 'M', 'N', 'P', 'Y'],
							key2cmn = ['CDMD', 'CIPD', 'CJFD', 'CDMD', 'CCND', 'CIPD', 'CYFD'];
						dbcode = key2cmn[dbKeys.indexOf(dbKey)] || 'BAD-DB';
					} else {
						const odd2cmn = ['CJFD', 'CYFD', 'CJFD', 'CDMD', 'CDMD', 'CIPD'];
						dbcode = odd2cmn[oddDB.indexOf(dbcode)] || 'BAD-DB';
					}
					console.debug('[CNKI-Redirect] Convert dbcode from %s to %s.', fileIDObj.raw[0], dbcode);
				}
				switch (dbcode) {
					case 'BAD-DB': {
						[dbcode, filename] = defFileID.target;
						console.info('[CNKI-Redirect] The dbcode %s should be abandoned.', fileIDObj.raw[0]);
						break;
					} case 'CDMD': {
						filename = filename.replace(/^([\w\.]+)$/, '$1.NH').replace(/^([\w\.]+?)(\.NH)+$/, '$1.nh');
						break;
					} case 'CJFD': {
						fileIDObj.alter = ['CCJD', filename];
						console.debug('[CNKI-Redirect] Set CCJD as alternate dbcode.');
						break;
					}
				}
				fileIDObj.target = [dbcode, filename];
				return fileIDObj;
			})(dbcode, filename);
		} else {
			console.debug('[CNKI-Redirect] Invalid file ID. dbcode: %s, filename: %s', dbcode, filename);
		}
		return fileID;
	}

	let situation = GetSituation(currentUrl);
	switch (situation) {
		case 'skip': {
			console.log('[CNKI-Redirect] Skipped.');
			break;
		} case 'error': {
			let storedSrc = GM_getValue('source') || { sourceUrl: 'clear', fileID: defFileID };
			if (!!storedSrc.fileID.alter) {
				console.log('[CNKI-Redirect] First target failed, try alternate...');
				GM_setValue('source', { sourceUrl: storedSrc.sourceUrl, fileID: { raw: storedSrc.fileID.raw, target: storedSrc.fileID.alter } });
				window.location.replace(GenerateTargetUrl(storedSrc.fileID.alter[0], storedSrc.fileID.alter[1]));
			} else if (storedSrc.sourceUrl !== 'clear') {
				console.log('[CNKI-Redirect] Error! Go back to original page...');
				GM_setValue('banRedirect', storedSrc.fileID.raw);
				window.location.replace(storedSrc.sourceUrl);
			} else {
				console.log('[CNKI-Redirect] Original page not found, stay here.');
			}
			break;
		} case 'ideal': {
			let storedSrc = GM_getValue('source') || { sourceUrl: 'clear', fileID: defFileID };
			if (storedSrc.sourceUrl !== 'clear') {
				GM_setValue('source', { sourceUrl: 'clear', fileID: defFileID });
				(source => {
					const BTNTEXT = {
						'kns.cnki.net': '🙃 打开源页面',
						'oversea.cnki.net': '🙃 Open original', 'chn.oversea.cnki.net': '🙃 打开源页面', 'tra.oversea.cnki.net': '🙃 打開源頁面',
						'global.cnki.net': '🙃 Open original', 'gb.global.cnki.net': '🙃 打开源页面', 'big5.global.cnki.net': '🙃 打開源頁面',
					};
					const srcBtn = `<li class='btn-go2src'><a id='go2src' title='${source.sourceUrl}' style='background-color: #e85; color: #fff; padding: 0 8px'>${BTNTEXT[window.location.host]}</a></li>`;
					let targetArea = document.getElementById('DownLoadParts');
					if (targetArea) {
						(targetArea.querySelector('.operate-btn') || targetArea.querySelector('.operate-left'))?.insertAdjacentHTML('beforeend', srcBtn);
						document.getElementById('go2src')?.addEventListener('click', () => {
							GM_setValue('banRedirect', source.fileID.raw);
							window.open(source.sourceUrl, '_blank');
						});
					}
				})(storedSrc);
			}
			console.log('[CNKI-Redirect] Ideal case, done.');
			break;
		} default: {
			let fileID = GetFileID(situation, currentUrl);
			if (fileID.target[0] !== 'clear') {
				console.log('[CNKI-Redirect] Got file ID: dbcode=%s&filename=%s', fileID.target[0], fileID.target[1]);
				let banCheck = GM_getValue('banRedirect') || ['clear', 'clear'];
				if (fileID.raw.toString() === banCheck.toString()) {
					GM_setValue('banRedirect', ['clear', 'clear']);
					console.log('[CNKI-Redirect] Redirect for this file is not allowed. Refresh to try again.');
				} else {
					window.stop();
					GM_setValue('source', { sourceUrl: currentUrl, fileID: fileID });
					window.location.replace(GenerateTargetUrl(fileID.target[0], fileID.target[1]));
				}
			} else {
				console.log('[CNKI-Redirect] No proper file ID found.');
			}
			break;
		}
	}
})(window.location.href);
