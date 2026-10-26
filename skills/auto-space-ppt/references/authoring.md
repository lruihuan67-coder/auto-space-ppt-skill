# 制作与质检

## 内容转页面

先列每页一句话结论和支持材料，再选版式。若原稿内容过长，优先拆页或提炼，不把正文缩到无法投屏阅读。图表需有指标名称、单位、时间范围、来源和与结论一致的数值。合作伙伴页只能放已确认且可使用的标识；模板中的彩色 Logo 全是虚构示意。

`src/slides.tsx` 包含全部页面组件、文案和图表数据。文件底部 `slides` 数组定义播放与 PDF 的顺序。`src/styles.css` 包含各 `slide-*` 类的视觉样式；`src/App.tsx` 负责翻页和打印模式。不要修改播放代码来迁就单页排版。图片在 `src/assets/`，替换后仍使用 `?inline` 导入以确保独立 HTML 内嵌资产。

运行 `new_deck.py --layouts` 时，脚本会把完整的模板数组保存为 `templateSlides`，再按给定 ID 创建 `slides`。各页面内容仍为示例，必须逐页编辑。若需要同类版式多次出现，复制组件并添加唯一 ID；不能仅在数组里重复同一个 ID 和组件，因为内容也会重复。

## 导出

在新项目目录：

```text
npm install
npm run dev
npm run build
npm run export:pdf
```

预览地址以 Vite 终端显示为准；方向键/空格翻页，`O` 打开目录，`F` 全屏。`npm run build` 生成离线单文件 `dist/auto-space-deck.html`。`npm run export:pdf` 以 Chrome 截图合成 RGB PDF，避免透明渐变在部分阅读器里偏色。导出脚本默认在 Windows 查找 `C:\Program Files\Google\Chrome\Application\chrome.exe`；其他环境或自定义安装需设置 `CHROME_PATH`。若用脚本直接调用 Node，先确保 Node 和 npm 版本满足项目 `package.json` 中 Vite 版本要求。

## 最终检查

同时核对 HTML 和 PDF 的页数、顺序和内容。逐页检查 16:9 边界、字重、对齐、对比度、图像清晰度与裁切。尤其检查 Logo、日期、联系人、图表数值、示例标注和合作伙伴真实性。浏览器至少播放封面、深色页、浅色页、图文页、图表页和结尾页，确认转场不遮挡内容；PDF 至少抽查同类型页面。用户给了实际素材时，应优先替换概念图。最后交付 HTML、PDF 和完整源项目或压缩包，让别人既能播放也能再编辑。
