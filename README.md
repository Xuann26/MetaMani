# MetaMani project website

英文论文项目网页。原生 HTML / CSS / JavaScript，无需 npm 安装和构建，可直接部署到 GitHub Pages。

目标仓库：https://github.com/Xuann26/MetaMani

目标网址：https://Xuann26.github.io/MetaMani/

## 本地预览

在本文件所在目录打开终端：

```powershell
python -m http.server 4173
```

浏览器访问 http://localhost:4173 。也可以直接打开 `index.html`；复制功能在本地服务器或 HTTPS 下支持更好。

## 发布到 GitHub Pages

1. 打开现有仓库 https://github.com/Xuann26/MetaMani 。
2. 选择 **Add file → Upload files**，上传本目录内的文件与 `assets` 文件夹，确保 `index.html` 位于仓库根目录。不要额外套一层 `metamani-site` 文件夹。
3. 提交到 `main` 分支。若网页上传工具未包含 `.nojekyll`，通过 **Add file → Create new file** 创建该空文件。
4. 打开 **Settings → Pages**。
5. **Source** 选择 **Deploy from a branch**。
6. **Branch** 选择 `main`，目录选择 `/(root)`，点击 **Save**。
7. 等待 Pages 部署成功，再打开 https://Xuann26.github.io/MetaMani/ 。部署进度可以在仓库 **Actions** 查看。

所有本地资源均使用相对路径，适用于 `/MetaMani/` 项目子目录。`.nojekyll` 关闭 Jekyll 处理。

## 替换 Demo 视频

视频区域已经使用论文截图作为封面，并明确标注 `Video coming soon`。这些是待替换位置，不是可播放的机器人录像。

1. 将 MP4（推荐 H.264 编码）放进 `assets/videos/`。
2. 打开 `script.js`，修改顶部配置：

```javascript
const DEMO_VIDEOS = {
  titration: 'assets/videos/titration.mp4',
  pouring: 'assets/videos/pouring.mp4',
  cabinet: 'assets/videos/cabinet.mp4'
};
```

3. 只填写已有视频；没有的保留空字符串。
4. 刷新页面，已配置的视频会自动替换静态占位，出现播放器控件。视频不会自动播放。

大视频建议存放在你选定的视频托管或静态媒体服务，再配置允许浏览器访问的 MP4 直链。

## 添加作者和机构

输入论文为匿名稿，未提供可用的作者和机构信息。因此网页未虚构姓名、单位、会议、录用状态或年份。

可在 `index.html` 的 `.paper-title` 后增加：

```html
<p class="authors">Author One · Author Two</p>
<p class="affiliations">Institution</p>
```

如需要样式，可在 `styles.css` 添加：

```css
.authors { margin-top: 16px; font-size: 13px; color: var(--blue); }
.affiliations { margin-top: 5px; font-size: 11px; color: var(--muted); }
```

## 更新论文和引用

- 替换 `assets/paper.pdf` 即可更新阅读和下载入口。
- 当前 PDF 保留了原稿中的匿名投稿说明；公开正式版本准备好后建议替换该文件。
- 页面底部 BibTeX 明确标记为 title-only draft。正式元数据确定后替换 `#citation-text` 内的内容，更新说明和标签。
- Repository 按钮指向用户提供的仓库，不宣称算法代码已经发布。

## 内容和数据来源

- 所有研究数字来自所提供的 9 页 MetaMani PDF。
- Framework：Figure 2。
- 真实机器人任务截图：Figure 3(a)。
- 真实实验：120 matched trials；Flat-Single 25.8%，MetaMani-Single 70.8%，完整异构系统 81.7%。
- Table 2(a)：RoboCasa365（页面表格展示选定基线，完整基线见 PDF）。
- Table 2(b)：RoboTwin 2.0，8 个任务的 Easy / Hard 均值。
- Table 3：恢复消融，不同机制有不同的尝试次数上限，页面保留相关说明。
- 交互执行流程是讲解机制的示意动画，明确不代表真实 rollout 或测量时间。

## 文件结构

```text
index.html              页面内容和 SEO 信息
styles.css              响应式样式、动画与减少动态效果设置
script.js               图表切换、流程播放、图片放大、引用复制、视频配置
.nojekyll               GitHub Pages 静态文件标记
assets/favicon.svg      本地站点图标
assets/paper.pdf         论文全文
assets/images/          论文图片及任务封面
assets/videos/          预留的真实视频目录
```

字体来自 Google Fonts（DM Sans / Manrope），加载失败时自动使用系统字体；其余资源均在本地。

## 可访问性和交互

- 响应式手机导航，支持 Escape 关闭。
- 结果页签支持左右方向键、Home、End。
- 流程支持播放、暂停、继续、重播、重置。
- 图片支持原生 dialog 放大，Escape 关闭并还原键盘焦点。
- 引用支持剪贴板复制，失败时选中文本供手动复制。
- 支持 `prefers-reduced-motion`，内容在无 JavaScript 时仍可阅读（交互图表需要 JavaScript，完整表格与 PDF 可用）。
