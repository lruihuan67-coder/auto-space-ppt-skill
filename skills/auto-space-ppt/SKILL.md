---
name: auto-space-ppt
description: 基于凹凸时空 AUTO SPACE 的 45 种 React 演示版式，将用户提供的汇报内容制作成 16:9 品牌演示稿，并交付可独立播放的 HTML 和 PDF。用于凹凸时空品牌 PPT；不适用于其他品牌或只需普通 PPTX 的任务。
---

# 凹凸时空品牌演示稿

使用本 Skill 附带的完整源码和素材制作新稿。用户只需提供汇报内容；根据内容选页、重排、改写文案及替换图片和数据。最终交付可离线播放的单文件 HTML、静态 PDF，以及可继续编辑的项目源码。**不要把 45 张示例页原样作为成品交付。**

## 起稿

0. **开工前先核对版本**：运行一次安装器自检，确保用的是最新模板。
   Windows：`powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\scripts\install.ps1" -Ensure`
   macOS：`bash "$HOME/.agents/skills/auto-space-ppt-install/scripts/install.sh" --ensure`
   提示“发现新版本，开始更新”时等它装完，并重新读取本技能再继续；提示无法联网时，按本机现有版本继续并向用户说明。
   若报“无法识别参数 -Ensure”，说明本机安装器是旧版：改运行同目录的 `daily-sync.ps1`（macOS 为 `daily-sync.sh`）拉取最新技能，再按安装器 SKILL.md 升级一次安装器。
1. 将用户内容整理为简短的内容清单：受众、场合、目标、必需信息、已核实的数据、图片/Logo、汇报人和日期。缺失但不影响设计的信息可用明确的占位标记继续；不要捏造业绩、客户或合作关系。
2. 用 `python scripts/new_deck.py --output <新目录> --brief <内容文件>` 解包完整模板。若内容仅在对话里，先将其写成 UTF-8 Markdown 文件。可用 `--layouts cover,agenda,...` 预先选取和排序版式 ID；不传则保留全部 45 种作为素材库。
3. 阅读新项目内的 `TEMPLATE_GUIDE.md`，按叙事顺序选择版式。ID 与选用建议见 [版式索引](references/layouts.md)。每张展示页都应承担清晰的信息任务；根据实际内容增删、复制和重排，不强求用完 45 种。
4. 在 `src/slides.tsx` 替换文案、图像、图表数据与 Logo。最终页面顺序由文件末尾的 `slides` 数组决定；必要时复制组件并给新页面唯一 `id`。修改版式时用 `src/styles.css` 中对应的 `slide-*` 样式，保持所有页面 1600 × 900。详细编辑要点见 [制作与质检](references/authoring.md)。
5. 在项目目录执行 `npm install`、`npm run build`、`npm run export:pdf`。前者生成 `dist/auto-space-deck.html`，后者生成 `dist/凹凸时空-品牌演示模板.pdf`。PDF 导出需要本机 Chrome；找不到时设置 `CHROME_PATH` 为可执行文件路径。
6. 打开 HTML 与 PDF 检查每页的字体、对齐、溢出、图片清晰度、品牌标识、图表数值和深浅页对比。正式交付前清除全部示例数据、虚构合作 Logo、占位联系方式和概念图的事实性暗示；保留用户明确要求的示意内容时，标注“示意”。

## 不变的品牌规则

- 16:9，1600 × 900。主色电光蓝 `#0D7CFD`；以深蓝、白和中性灰承托，不随意引入粉色等其他主色。
- 使用随源码提供的原版 Logo：浅色页 `logo-blue.png`，深色页 `logo-white.png`；不要用普通字体重写“凹凸时空”字标。
- 中文优先使用项目内既有的 Noto Sans SC / 思源黑体 / 微软雅黑回退；英文及数字沿用模板的 Manrope 回退。保持清楚的标题、正文和注释层级。
- 动效只用于浏览器演示；PDF 是无动效的 RGB 静态页。单文件 HTML 包含素材，可直接发送给对方离线打开。PDF 不作为可编辑母版。

## 随附资源

- `assets/starter.zip`：45 页完整 React/TypeScript/Vite 源码及图片、Logo、导出脚本。
- `assets/layout-preview.jpg`：版式总览，选页时可先看。
- `scripts/new_deck.py`：创建独立项目，复制内容简报并可选页。

如用户明确要求可编辑 `.pptx`，需另行制作并验证该格式；不要将本项目的 HTML 或静态 PDF 称为 PPTX。
