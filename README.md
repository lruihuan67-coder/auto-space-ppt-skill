# 凹凸时空 PPT 技能（auto-space-ppt）

凹凸时空（AUTO SPACE）「凹凸-PPT」品牌演示稿技能的源码仓库，同时提供技能包与索引/安装 skill。

| 路径 | 说明 |
| --- | --- |
| `auto-space-ppt-skill.zip` | 可下载的技能包（顶层目录 `auto-space-ppt/`） |
| `skills/auto-space-ppt/SKILL.md` | 技能说明与制作流程（45 种演示版式） |
| `skills/auto-space-ppt/references/authoring.md` | 内容编写与版式选择规范 |
| `skills/auto-space-ppt/references/layouts.md` | 版式清单与适用场景 |
| `skills/auto-space-ppt/assets/starter.zip` | 45 页 React 模板工程 |
| `skills/auto-space-ppt/assets/layout-preview.jpg` | 版式总览图 |
| `skills/auto-space-ppt/scripts/new_deck.py` | 基于 starter 生成新演示稿工程 |
| `skills/auto-space-ppt-install/` | 索引/安装 skill：从本仓库下载技能包并安装 |

## 使用（手动）

把 `skills/auto-space-ppt/` 整个目录放到你的技能目录（例如 `~/.agents/skills/auto-space-ppt/`），按 `SKILL.md` 的流程制作演示稿。
也可以直接解压 `auto-space-ppt-skill.zip` 到技能目录。

## 使用（索引 skill：安装 + 每日自动更新）

```powershell
$repo = "lruihuan67-coder/auto-space-ppt-skill"
$dir  = "$env:USERPROFILE\.agents\skills\auto-space-ppt-install"
New-Item -ItemType Directory -Path "$dir\scripts" -Force | Out-Null
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/install.ps1"     -OutFile "$dir\scripts\install.ps1"
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/daily-sync.ps1" -OutFile "$dir\scripts\daily-sync.ps1"

# 安装技能 + 智能体 + 每日同步（09:00）；智能体模板会按需从仓库自动下载
powershell -NoProfile -ExecutionPolicy Bypass -File "$dir\scripts\install.ps1" -Repo $repo -WithAgent -WithSchedule -ScheduleTime 09:00
```

- 任务名：`AutoSpacePPT-SkillSync`，每天 09:00 拉取最新 `auto-space-ppt-skill.zip`
- 哈希没变就跳过；有变化才覆盖，旧版备份在 `~/.agents/skills/.backup/`
- 离线安装：加 `-SourceZip <本地 zip 路径>`
- 查看：`schtasks /Query /TN "AutoSpacePPT-SkillSync" /V /FO LIST`

UI 技能在独立仓库 `auto-space-ui-design-skill`，由它自己的索引 skill 管理，与本仓库互不影响。

## 发布新版本

替换 `auto-space-ppt-skill.zip` 与 `skills/auto-space-ppt/` 后提交推送，第二天的定时任务自动装上。
