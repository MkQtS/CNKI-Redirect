## CNKI 文献数据库

|dbcode|含义|
|---|---|
|CCND|报纸|
|CDMD|硕博|
|CIPD|会议|
|CJFD|期刊|
|CYFD|年鉴|

## CNKI 文献数据库变体

部分dbcode在`oversea.cnki.net`中直接使用可能会报错，未报错的也可能不显示文献目录。

暂未发现这些dbcode的优点，目前脚本会直接将其替换为通用形式。

|类型|子类|基础教育|法律|hypt01|hypt02|hypt03|jw|ste|web01|web02|web03|
|---|---|---|---|---|---|---|---|---|---|---|---|
|报纸|...|CFND|CLKN|DXXN|FDCT_PHAN|GDKN|NTCN|SCGN|JNGN|DJSN|HJTT_HBYN<br>LRIN|
|硕博|CMFD 硕士<br>CDFD 博士|CFMD|CLKM 硕士<br>CLKD, CLKB 博士|DXXM 硕士<br>DXXD 博士|FDCT_PHAM 硕士<br>FDCT_PHAD 博士|GDKM 硕士<br>GDKD 博士|NTCM 硕士<br>NTCD 博士|SCGM 硕士<br>SCGD 博士|JNGM 硕士<br>JNGD 博士|DJSM 硕士<br>DJSD 博士|HJTT_HBYM, LRIM 硕士<br>HJTT_HBYD, LRID 博士|
|会议|CPFD 国内<br>CPVD 视频<br>IPFD 国际|CFPD|CLKP|DXXP 国内|FDCT_PHAP 国内<br>FDCT_PHAI 国际|GDKP 国内<br>GDKI 国际|NTCP 国内<br>NTCI 国际|SCGP 国内<br>SCGI 国际|JNGP 国内<br>JNGI 国际|DJSP 国内|HJTT_HBYP, LRIP国内<br>HJTT_HBYI, LRII 国际|
|期刊|CJFQ|CFJD<br>CFJW 完中<br>CFJG 高中<br>CFJC 初中<br>CFJX 小学|CLKJ|DXXJ|FDCT_PHAJ|GDKJ|NTCJ|SCGJ|JNGJ|JYSJ<br>DJSJ|HJTT_HBYJ<br>LRIJ|
|年鉴|...|...|...|DXXY|FDCT_PHAY|GDKY|NTCY|SCGY|JNGY|...|HJTT_HBYY<br>LRIY|

### 放弃的类型

- CPVD（会议视频）在`oversea.cnki.net`上总是报错，且不涉及CAJ、PDF格式问题
- CLKC（案例）不属于此脚本目标类型（在`oversea.cnki.net`上也会报错）

## 来源

```
https://kns.cnki.net/kns/brief/result.aspx
https://chn.oversea.cnki.net/kns/defaultresult/index
https://ste.cnki.net/kns/brief/result.aspx?dbprefix=SCGJ
```

以上dbcode来自此类知网搜索页、文献页。

```
https://web03.cnki.net/KNavi/journal/navi/LRIJ
https://kns.cnki.net/kns8?dbcode=CIPD
```

可在此类页面查看数据库介绍。

## 脚本中的处理方法

```javascript
const oddDB = ['CLKB', 'CLKC', 'CPVD', 'IPFD'];
if (oddDB.indexOf(dbcodeIn) !== -1) {
    const odd2cmn = ['CDMD', 'BAD-DB', 'BAD-DB', 'CIPD'];
    dbcode = odd2cmn[oddDB.indexOf(dbcodeIn)];
} else {
    let dbkey = dbcodeIn.replace(/^C(\w)F\w+$/, '$1').replace(/^CF(\w)\w+$/, '$1').replace(/^\w+(\w)$/, '$1');
    const dbkeys = ['D', 'I', 'J', 'M', 'N', 'P', 'Y'];//博士 国际会议 期刊 硕士 报纸 国内会议 年鉴
    const key2cmn = ['CDMD', 'CIPD', 'CJFD', 'CDMD', 'CCND', 'CIPD', 'CYFD'];
    dbcode = key2cmn[dbkeys.indexOf(dbkey)];
}
```

