# CNKI-Redirect

## 作用

将知网文献页重定向到海外版知网，支持多数知网文献页、知网空间、知网百科、知网阅读、知网文化及手机知网。

**提示:** 因部分文献未上线海外版，此脚本可能跳转至错误页面，随后会自动回到原页面，无需任何操作。

## 为什么要使用海外版知网？

- 部分文献只在海外版提供完整PDF下载（海外版也能下载CAJ格式）
- 知网百科`xuewen.cnki.net`只提供CAJ格式
- 知网阅读`mall.cnki.net`部分期刊不提供下载
- 知网文化`wh.cnki.net`不提供CAJ格式
- 手机知网`wap.cnki.net`不能通过IP免登录下载

## 使用方法

在浏览器中安装*Tampermonkey*类插件后安装此脚本

[从 Greasy Fork 安装](https://greasyfork.org/scripts/453031)

[从 GitHub 安装](https://raw.githubusercontent.com/MkQtS/CNKI-Redirect/main/CNKI-Redirect.user.js)

## 原理

知网可供下载的文献基本都具有*dbcode*（或*dbname*）和*filename*两个关键属性，只要确定这两个属性值，就能直接生成海外版的链接。

此脚本会从当前网页URL及页面元素中提取当前文献的*dbcode*和*filename*值，而后跳转至海外版知网，并非简单地切换域名。

