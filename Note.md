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
|hypt02|...|WKDN<br>FDCT_PHAN|WKDM, FDCT_PHAM 硕士<br>WKDD, FDCT_PHAD 博士|WKDP, FDCT_PHAP 国内<br>WKDI, FDCT_PHAI 国际|WKDJ<br>FDCT_PHAJ|WKDY<br>FDCT_PHAY|
|hypt03|...|GDKN|GDKM 硕士<br>GDKD 博士|GDKP 国内<br>GDKI 国际|GDKJ|GDKY|
|jw|...|NTCN|NTCM 硕士<br>NTCD 博士|NTCP 国内<br>NTCI 国际|NTCJ|NTCY|
|ste|...|SCGN|SCGM 硕士<br>SCGD 博士|SCGP 国内<br>SCGI 国际|BNJK<br>SCGJ|SCGY|
|snqk|...|...|...|...|CACM|...|
|web01|...|JNGN|JNGM 硕士<br>JNGD 博士|JNGP 国内<br>JNGI 国际|JNGJ|JNGY|
|web02|...|DJSN|DJSM 硕士<br>DJSD 博士|DJSP 国内|JYSJ<br>DJSJ|...|
|web03|...|LRIN<br>HJTT_HBYN|LRIM, HJTT_HBYM 硕士<br>LRID, HJTT_HBYD 博士|LRIP, HJTT_HBYP 国内<br>LRII, HJTT_HBYI 国际|LRIJ<br>HJTT_HBYJ|LRIY<br>HJTT_HBYY|
|...|...|...|...|...|...|...|

以上dbcode来自相关知网文献页、搜索页。部分dbcode在`oversea.cnki.net`中直接使用可能会报错，未报错的也可能不显示文献目录。暂未发现非目标dbcode的优点，目前脚本会直接将其转换为目标形式。

CCJD(辑刊)在非文献知网节(如`kns.cnki.net`, `oversea.cnki.net`, `www.cnki.net`)站点可能会使用CJFD(期刊)，但文献知网节站点只能使用CCJD。

### 不支持的类型

|dbcode|属性|
|---|---|
|CCVD|教学视频|
|CISD|标准|
|CLKC|案例|
|CLKLP|法律法规|
|CPVD|会议视频|
|SCEF|企业标准|
|SCHF|行业标准|
|SCOD|专利|
|SCPD|中国专利|
|SCSF|国家标准|
|SMSD|标准题录|
|SNAD|成果|
|SOPD|海外专利|
|...|...|

## 脚本中对dbcode的转换处理

```javascript
rawFileID = [dbcode.toUpperCase(), filename.toUpperCase()];
dbcode = rawFileID[0].replace(/^[A-Z]+_([A-Z]+)$/, '$1');
const cmnDB = ['CCJD', 'CCND', 'CDMD', 'CIPD', 'CJFD', 'CYFD'];
if (cmnDB.indexOf(dbcode) === -1) {
    const oddDB = ['BNJK', 'BSFD', 'CACM', 'CDMH', 'CLKB', 'IPFD'];
    const badDB = ['CCVD', 'CISD', 'CLKC', 'CLKLP', 'CPVD', 'SCEF', 'SCHF', 'SCOD', 'SCPD', 'SCSF', 'SMSD', 'SNAD', 'SOPD'];
    if (oddDB.indexOf(dbcode) !== -1) {
        const odd2cmn = ['CJFD', 'CYFD', 'CJFD', 'CDMD', 'CDMD', 'CIPD'];
        dbcode = odd2cmn[oddDB.indexOf(dbcode)];
    } else if (badDB.indexOf(dbcode) !== -1) {
        dbcode = dbcode + '-BAD';
    } else {
        let dbkey = dbcode.replace(/^C(\w)F\w+$/, '$1').replace(/^CF(\w)\w+$/, '$1').replace(/^\w+(\w)$/, '$1');
        const dbkeys = ['D', 'I', 'J', 'M', 'N', 'P', 'Y'];//博士 国际会议 期刊 硕士 报纸 国内会议 年鉴
        const key2cmn = ['CDMD', 'CIPD', 'CJFD', 'CDMD', 'CCND', 'CIPD', 'CYFD'];
        dbcode = key2cmn[dbkeys.indexOf(dbkey)] || rawFileID[0] + '-BAD';
    }
    console.log('[CNKI-Redirect] Convert dbcode from %s to %s.', rawFileID[0], dbcode);
}
```

