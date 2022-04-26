# CNKI-Redirect

作用：将知网文献页重定向到海外版知网

## 方法1：油猴脚本

在浏览器中安装*Tampermonkey*插件后安装[此脚本](https://raw.githubusercontent.com/MkQtS/CNKI-Redirect/main/CNKI-Redirect.user.js)

- 推荐，稳定但会慢一些
- 支持多数知网文献页、知网空间和手机知网

## 方法2：Header Editor

首先在浏览器中安装*Header Editor*插件：

|[Chrome Store](https://chrome.google.com/webstore/detail/header-editor/eningockdidmgiojffjmkdblpjocbhgh)|[Firefox Store](https://addons.mozilla.org/zh-CN/firefox/addon/header-editor/)|[GitHub](https://github.com/FirefoxBar/HeaderEditor)|
|--|--|--|

然后在Header Editor中导入此[规则文件](https://raw.githubusercontent.com/MkQtS/CNKI-Redirect/main/CNKI-Redirect.bib)

- 纯URL匹配跳转，部分文献会出问题，但比较快
- 支持部分知网文献页和知网空间
