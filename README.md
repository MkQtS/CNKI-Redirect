# CNKI-Redirect

## 作用

将知网文献页重定向至海外版以便下载文献。支持知网空间、知网百科、知网阅读、知网文化及手机知网。

## 为什么要使用海外版知网？

- 部分文献只在海外版提供PDF下载
- 部分知网站点不提供CAJ格式
- 海外版既能下载PDF也能下载CAJ
- 部分知网站点不能通过IP免登录下载

## 使用方法

在浏览器中安装*Tampermonkey*类插件后安装此脚本

[从 Greasy Fork 安装](https://greasyfork.org/scripts/453031)

[从 GitHub 安装](https://raw.githubusercontent.com/MkQtS/CNKI-Redirect/main/CNKI-Redirect.user.js)

安装后，打开知网文献页时，会自动跳转到同一文献的海外版知网页面，无需任何操作，不会影响非文献页。

**提示:** 因部分文献未上线海外版，此脚本可能跳转至错误页面，随后会自动回到原页面，无需任何操作。

## 原理

知网可供下载的文献大都具有*dbcode*和*filename*两个基本属性，只需确定这两个属性值，就能生成海外版链接。

此脚本会从知网页面中提取当前文献的*dbcode*和*filename*值，随后跳转至海外版，并非简单地切换域名。

