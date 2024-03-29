# CNKI-Redirect

## 作用

将来自知网主站、知网空间、知网编客、知网百科、知网阅读、知网文化、知网法律、知网医院数字图书馆、手机知网等站点的知网文献页重定向至知网主站`kns.cnki.net`，支持获取知网文献无追踪链接。

`kns.cnki.net`支持通过机构IP免个人账号下载。其中，KCMS2支持硕博论文全文PDF下载，页面内容更丰富，但链接参数可能被知网追踪；KCMS链接更简洁，不含跟踪参数，但页面可能缺少部分内容。

## 使用方法

在浏览器中安装*Tampermonkey*类插件后安装此脚本

从 [Greasy Fork](https://greasyfork.org/scripts/453031) 或 [GitHub](https://raw.githubusercontent.com/MkQtS/CNKI-Redirect/main/CNKI-Redirect.user.js) 安装

安装后，打开知网文献页时，会自动跳转到同一文献的知网页面，不会影响非文献页。若有需要可通过页面中的`打开源页面`按钮打开原文献页面。

**提示:** 若脚本自动跳转出错，会自动回退到原页面，无需任何操作。

## 原理

几乎所有知网文献都具有*dbcode*和*filename*两个属性值，只需确定这两个值，就能生成标准文献链接。

此脚本会从知网页面中提取当前文献的*dbcode*和*filename*随后跳转，并非简单地切换域名。
