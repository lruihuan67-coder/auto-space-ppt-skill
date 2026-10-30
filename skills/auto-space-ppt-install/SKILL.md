---
name: auto-space-ppt-install
description: 凹凸-PPT 技能索引与安装器。从 GitHub（lruihuan67-coder/auto-space-ppt-skill）下载凹凸时空品牌演示稿技能包 auto-space-ppt-skill.zip，落地为本地技能与「凹凸-PPT」智能体，并可注册每天自动拉取最新版的定时任务。当用户提到安装/更新/同步 凹凸-PPT、凹凸时空 PPT 技能、auto-space-ppt、从 GitHub 拉技能包时使用。
---

# 凹凸-PPT 技能索引与安装器

本 skill 只负责演示稿技能 `auto-space-ppt`。UI 组件库技能由独立仓库的
`auto-space-ui-design-install` 负责，两者配置、日志、定时任务完全分开。

| 资源 | 位置 |
| --- | --- |
| 仓库 | `lruihuan67-coder/auto-space-ppt-skill`（分支 `main`） |
| 技能包 | `<repo>/auto-space-ppt-skill.zip` |
| 技能源码 | `<repo>/skills/auto-space-ppt/` |
| 安装后位置 | `~/.agents/skills/auto-space-ppt/` |
| 智能体模板 | `<repo>/skills/auto-space-ppt-install/agent/凹凸-PPT.md` |

## 一键安装 / 更新

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\scripts\install.ps1"
```

首次从零安装：

```powershell
$repo = "lruihuan67-coder/auto-space-ppt-skill"
$dir  = "$env:USERPROFILE\.agents\skills\auto-space-ppt-install"
New-Item -ItemType Directory -Path "$dir\scripts" -Force | Out-Null
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/install.ps1"     -OutFile "$dir\scripts\install.ps1"
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/daily-sync.ps1" -OutFile "$dir\scripts\daily-sync.ps1"

powershell -NoProfile -ExecutionPolicy Bypass -File "$dir\scripts\install.ps1" -Repo $repo -WithAgent -WithSchedule -ScheduleTime 09:00
```

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `-Repo` | `lruihuan67-coder/auto-space-ppt-skill` | GitHub 仓库 |
| `-Ref` | `main` | 分支或 tag |
| `-SkillName` | `auto-space-ppt` | 技能目录名 |
| `-AssetName` | `auto-space-ppt-skill.zip` | 压缩包文件名 |
| `-SkillHome` | `~/.agents/skills` | 技能落地目录 |
| `-AgentDir` | `./.opencode/agent` | 智能体目录（配合 `-WithAgent`） |
| `-WithAgent` | 关 | 部署「凹凸-PPT」智能体 |
| `-WithSchedule` | 关 | 注册每日同步（`AutoSpacePPT-SkillSync`） |
| `-ScheduleTime` | `09:00` | 每日同步时间 |
| `-SourceZip` | — | 直接用本地压缩包，跳过下载（离线安装） |
| `-Force` | 关 | 忽略哈希比对，强制重装 |

## 脚本行为

1. 下载 `https://raw.githubusercontent.com/<repo>/<ref>/auto-space-ppt-skill.zip`，失败回退 `github.com/<repo>/raw/...`。
2. 算 SHA256 与 `installed.json` 比对，一致则跳过（`-Force` 强制）。
3. 解压校验必须存在 `auto-space-ppt/SKILL.md`。
4. 旧版移到 `<SkillHome>/.backup/auto-space-ppt-<时间戳>`，再复制新版。
5. 写 `installed.json` 与 `config.json`（只登记本技能）。
6. 可选：部署智能体、注册 `AutoSpacePPT-SkillSync`。

日志：`<InstallerDir>/logs/install-YYYY-MM.log`、`daily-sync.log`。

## 智能体「凹凸-PPT」

部署后为 `<AgentDir>/凹凸-PPT.md`（primary 模式）。核心约束：

- 先要内容清单，不先要设计；缺信息用明确占位，不编造业绩与客户；
- 遵守品牌规则：16:9 / 1600×900、电光蓝 `#0D7CFD`、原版 Logo（浅底 `logo-blue.png` / 深底 `logo-white.png`）；
- 交付单文件 HTML + 静态 PDF + 可编辑源码，不做假 `.pptx`；
- 开工前确认 `~/.agents/skills/auto-space-ppt/SKILL.md` 在位，缺失或过旧先跑一次同步。

**改动智能体文件后需重启 SpaceAgents 才生效。**

## 每日自动同步

```powershell
schtasks /Query /TN "AutoSpacePPT-SkillSync" /V /FO LIST
schtasks /Run   /TN "AutoSpacePPT-SkillSync"
schtasks /Delete /TN "AutoSpacePPT-SkillSync" /F
Get-Content "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\logs\daily-sync.log" -Tail 20
```

## 校验

```powershell
Test-Path "$env:USERPROFILE\.agents\skills\auto-space-ppt\SKILL.md"
Test-Path "$env:USERPROFILE\.agents\skills\auto-space-ppt\assets\starter.zip"
Get-Content "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\installed.json"
```

## 常见问题

- **404**：确认仓库为 public，`-Ref` 分支存在，`auto-space-ppt-skill.zip` 在仓库根目录。
- **解压后多套一层**：包内顶层目录必须是 `auto-space-ppt/`；脚本按 `-SkillName` 校验，不匹配会报“压缩包结构异常”。
- **不生效**：确认 `~/.agents/skills/auto-space-ppt/SKILL.md` 存在，重启 SpaceAgents。
- **导出 PDF 失败**：需要本机 Chrome，或设置 `CHROME_PATH`。
