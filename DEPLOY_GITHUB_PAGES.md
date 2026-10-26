# 发布 MetaMani 到 GitHub Pages

目标仓库：https://github.com/Xuann26/MetaMani

预期网站：https://xuann26.github.io/MetaMani/

这是静态网站，无需 npm、构建命令、数据库或后端服务。

## 网页上传方式

1. 解压 `work/MetaMani-github-pages.zip`。
2. 打开目标仓库，使用空仓库中的 **uploading an existing file** 入口；已有文件时使用 **Add file → Upload files**。
3. 上传解压目录中的 `index.html`、整个 `assets` 文件夹、`.nojekyll` 和 `README.md`。上传后 `index.html` 必须直接位于仓库根目录，不能再套一层文件夹。ZIP 本身不能作为网站入口。
4. 提交到 `main` 分支。
5. 打开 https://github.com/Xuann26/MetaMani/settings/pages ，设置 **Source → Deploy from a branch**，选择 **main** 和 **/(root)**，点击 **Save**。
6. 等待 Pages 部署完成，再访问预期网站；可在仓库 **Actions** 查看部署状态。

浏览器上传时留意隐藏文件 `.nojekyll`。当前网站没有下划线资源目录，即使上传界面遗漏该文件，也不影响现有页面的基本发布。

## 发布范围

发布包只含网站入口、样式、脚本、图像、`.nojekyll` 和简短说明。不包含 `work/`、本地论文 PDF、内容核对记录。原有网页内容和模板署名保持不变。

六个视频目前仍为空槽位，Supplement 和 Code 仍为 Coming soon，不影响网站上线。后续添加视频到 `assets/videos/`，再更新 `assets/main.js` 中的 `demonstrations`。

## 根域名选项

使用 `MetaMani` 仓库时，网址带 `/MetaMani/`。若希望网站位于 `https://xuann26.github.io/`，需使用名为 `Xuann26.github.io` 的仓库，并配置该仓库的 Pages。

官方说明：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
