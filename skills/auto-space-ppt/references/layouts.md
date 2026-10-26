# 版式索引

页面 ID 是 `src/slides.tsx` 末尾 `slides` 数组中的 `id`，可传给 `new_deck.py --layouts`。同一版式需要重复使用时，在源文件中复制对应组件、改内容、给新页唯一 ID，并将新页加入数组。

| 页码 | ID | 适用内容 |
|---|---|---|
| 01 | `cover` | 标题、副标题、团队、日期 |
| 02 | `agenda` | 章节目录 |
| 03 | `section` | 大章节过渡 |
| 04 | `statement` | 一句话主张 |
| 05 | `plain-content` | 正文阐述 |
| 06 | `bullet-content` | 四个并列要点 |
| 07 | `editorial-split` | 双栏观点 |
| 08 | `project-brief` | 项目目标与背景 |
| 09 | `questions-answers` | 常见问题与回答 |
| 10 | `priority-matrix` | 四象限优先级 |
| 11 | `evidence-chain` | 观察、判断、行动 |
| 12 | `photo` | 左文右图 |
| 13 | `capabilities` | 三项能力 |
| 14 | `partner-perspective` | 透视 Logo 墙 |
| 15 | `partner-orbit` | 环绕合作生态 |
| 16 | `partner-grid` | 4 × 4 Logo 矩阵 |
| 17 | `partner-columns` | 四列 Logo |
| 18 | `research-partners` | 6 × 3 标识矩阵 |
| 19 | `single-image` | 沉浸式单图 |
| 20 | `image-gallery` | 一主图、两辅图 |
| 21 | `product-showcase` | 产品界面截图 |
| 22 | `process` | 四步流程 |
| 23 | `architecture` | 四层架构 |
| 24 | `logic-argument` | 论证链 |
| 25 | `logic-tree` | 决策树 |
| 26 | `logic-cause` | 因果拆解 |
| 27 | `logic-loop` | 迭代闭环 |
| 28 | `logic-funnel` | 漏斗筛选 |
| 29 | `logic-swimlane` | 泳道协作 |
| 30 | `picture-one` | 一图叙事 |
| 31 | `picture-two` | 二图对照 |
| 32 | `picture-three` | 三图并列 |
| 33 | `picture-four` | 四图矩阵 |
| 34 | `picture-five` | 五图叙事 |
| 35 | `picture-six` | 六图总览 |
| 36 | `metric` | 单项大数字 |
| 37 | `comparison` | 前后或双方案对比 |
| 38 | `chart` | 柱状图 |
| 39 | `line-chart` | 折线图 |
| 40 | `donut-chart` | 环形占比 |
| 41 | `pie-chart` | 饼图 |
| 42 | `plan` | 阶段计划 |
| 43 | `summary` | 三条结论 |
| 44 | `contact` | 联系方式和下一步 |
| 45 | `closing` | 致谢与标语 |

默认叙事可从 `cover` → `agenda` → `section` → 内容/图文/逻辑/数据页 → `summary` → `contact` → `closing` 选取。根据实际内容决定页数；不要因有模板而填充无依据的页。
