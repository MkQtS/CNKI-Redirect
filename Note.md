## CNKI 文献数据库

|类型|辑刊|报纸|硕博|会议|期刊|年鉴|
|---|---|---|---|---|---|---|
|目标形式|CCJD|CCND|CDMD|CIPD|CJFD|CYFD|
|子类|...|...|CMFD 硕士<br>CDFD 博士|CPFD 国内<br>CPVD 视频<br>IPFD 国际|CJFQ|...|
|基础教育|...|CFND|CFMD|CFPD|CFJD<br>CFJW 完中<br>CFJG 高中<br>CFJC 初中<br>CFJX 小学|...|
|法律|...|CLKN|CLKM 硕士<br>CLKD, CLKB 博士|CLKP|CLKJ|...|
|chkdx|...|CHKJ|CDMH|CHKP|CHKJ|BSFD|
|ds|...|ZKZN|ZKZM 硕士<br>ZKZD 博士|ZKZP 国内<br>ZKZI 国际|ZKZJ|ZKZY|
|hypt01|...|DXXN|DXXM 硕士<br>DXXD 博士|DXXP 国内|DXXJ|DXXY|
|hypt02|...|WKDN|WKDM 硕士<br>WKDD 博士|WKDP 国内<br>WKDI 国际|WKDJ|WKDY|
|hypt03|...|GDKN|GDKM 硕士<br>GDKD 博士|GDKP 国内<br>GDKI 国际|GDKJ|GDKY|
|jw|...|NTCN|NTCM 硕士<br>NTCD 博士|NTCP 国内<br>NTCI 国际|NTCJ|NTCY|
|ste|...|SCGN|SCGM 硕士<br>SCGD 博士|SCGP 国内<br>SCGI 国际|BNJK<br>SCGJ|SCGY|
|snqk|...|...|...|...|CACM|...|
|web01|...|JNGN|JNGM 硕士<br>JNGD 博士|JNGP 国内<br>JNGI 国际|JNGJ|JNGY|
|web02|...|DJSN|DJSM 硕士<br>DJSD 博士|DJSP 国内|JYSJ<br>DJSJ|...|
|web03|...|LRIN|LRIM 硕士<br>LRID 博士|LRIP 国内<br>LRII 国际|LRIJ|LRIY|
|...|...|...|...|...|...|...|

目前脚本只计划适配以上6类文献，相关dbcode来自知网文献页、搜索页。部分dbcode在`oversea.cnki.net`中直接使用可能会报错。脚本会将各种（疑似）dbcode变体转换为`CCJD, CCND, CDMD, CIPD, CJFD, CYFD`之一。

CCJD(辑刊)在非文献知网节(如`kns.cnki.net`, `oversea.cnki.net`, `www.cnki.net`)站点可能会使用CJFD(期刊)的形式，但文献知网节页面只能使用CCJD。

### 不支持的类型

|dbcode|属性|
|---|---|
|CCVD|教学视频|
|CISD|标准|
|CLKLP|法律法规|
|CPVD|会议视频|
|SCOD|专利|
|SCPD|中国专利|
|SMSD|标准题录|
|SNAD|成果|
|SOPD|海外专利|
|...|...|

## 脚本中对dbcode的转换

```javascript
fileIDObj = { raw: [dbcode.toUpperCase(), filename.toUpperCase()] };
dbcode = fileIDObj.raw[0].replace(/^[A-Z]+_([A-Z]+)$/, '$1');
const cmnDB = ['CCJD', 'CCND', 'CDMD', 'CIPD', 'CJFD', 'CYFD'];
if (cmnDB.indexOf(dbcode) === -1) {
	const oddDB = ['BNJK', 'BSFD', 'CACM', 'CDMH', 'CLKB', 'IPFD'],
		badDB = ['CCVD', 'CISD', 'CLKLP', 'CPVD', 'SCOD', 'SCPD', 'SMSD', 'SNAD', 'SOPD'];
	if (oddDB.indexOf(dbcode) !== -1) {
		const odd2cmn = ['CJFD', 'CYFD', 'CJFD', 'CDMD', 'CDMD', 'CIPD'];
		dbcode = odd2cmn[oddDB.indexOf(dbcode)];
	} else if (badDB.indexOf(dbcode) !== -1) {
		dbcode = 'BAD-DB';
	} else {
		let dbKey = dbcode.replace(/^C(\w)F\w+$/, '$1').replace(/^CF(\w)\w+$/, '$1').replace(/^\w+(\w)$/, '$1');
		const dbKeys = ['D', 'I', 'J', 'M', 'N', 'P', 'Y'],//博士 国际会议 期刊 硕士 报纸 国内会议 年鉴
			key2cmn = ['CDMD', 'CIPD', 'CJFD', 'CDMD', 'CCND', 'CIPD', 'CYFD'];
		dbcode = key2cmn[dbKeys.indexOf(dbKey)] || 'BAD-DB';
	}
	console.debug('[CNKI-Redirect] Convert dbcode from %s to %s.', fileIDObj.raw[0], dbcode);
}
```

## 修改脚本目标链接

*脚本不需要额外的修改就能正常运行，没有特殊需求就不要给自己制造麻烦*

<details>

脚本在获取到dbcode和filename以后通过`GenerateTargetUrl`函数生成目标链接，可以修改此函数来改变最终到达的链接。可能的场景：

1. 使用英文或繁体中文版知网
2. 使用所在机构建立的知网本地镜像

注意：

1. 需要一定的动手能力**自己尝试**
2. 跳转至其他知网站点可能导致无限循环
3. 跳转至错误页面可能无法自动回到原页面

</details>

