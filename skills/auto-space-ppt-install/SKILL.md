---
name: auto-space-ppt-install
description: 凹凸-PPT 技能索引与安装器。从 GitHub 下载凹凸时空品牌演示稿技能压缩包（auto-space-ppt-skill.zip），落地为本地技能与「凹凸-PPT」智能体，并可注册每天自动拉取最新版的定时任务。当用户提到安装/更新/同步 凹凸-PPT、凹凸时空 PPT 技能、auto-space-ppt、从 GitHub 拉技能包、每天自动更新技能时使用。
---

# 凹凸-PPT 技能索引与安装器

本 skill 是「凹凸-PPT」能力的入口：它不生产 PPT，而是负责把真正的制作技能
`auto-space-ppt`（凹凸时空品牌演示稿）从 GitHub 取到本地并保持最新。

| 资源 | 位置 |
| --- | --- |
| 技能压缩包 | `<repo>/auto-space-ppt-skill.zip`（分支 `main`） |
| 制作技能 | `auto-space-ppt`（安装后位于 `~/.agents/skills/auto-space-ppt`） |
| 智能体模板 | `<repo>/skills/auto-space-ppt-install/agent/凹凸-PPT.md` |
| 安装脚本 | `skills/auto-space-ppt-install/scripts/install.ps1` |
| 每日同步脚本 | `skills/auto-space-ppt-install/scripts/daily-sync.ps1` |

仓库默认值写在 `scripts/install.ps1` 的 `-Repo` 参数里（形如 `owner/auto-space-ppt-skill`）；
如未写入，调用时显式传 `-Repo`。

## 一键安装 / 更新（推荐）

在 PowerShell 中执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\scripts\install.ps1"
```

首次从零安装（本地还没有这个 skill 时），先取脚本：

```powershell
# 1. 创建目录
$dir = "$env:USERPROFILE\.agents\skills\auto-space-ppt-install"
New-Item -ItemType Directory -Path "$dir\scripts" -Force | Out-Null

# 2. 取安装脚本（把 <owner> 换成实际 GitHub 用户/组织）
$repo = "<owner>/auto-space-ppt-skill"
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/install.ps1" -OutFile "$dir\scripts\install.ps1"
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/daily-sync.ps1" -OutFile "$dir\scripts\daily-sync.ps1"

# 3. 安装技能 + 智能体 + 每日同步
powershell -NoProfile -ExecutionPolicy Bypass -File "$dir\scripts\install.ps1" -Repo $repo -WithAgent -WithSchedule -ScheduleTime 09:00
```

安装脚本参数：

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `-Repo` | 脚本内置 | GitHub 仓库，`owner/repo` |
| `-Ref` | `main` | 分支或 tag |
| `-SkillHome` | `~/.agents/skills` | 技能落地目录 |
| `-AgentDir` | `./.opencode/agent` | 智能体文件目录（配合 `-WithAgent`） |
| `-WithAgent` | 关 | 部署「凹凸-PPT」智能体 |
| `-WithSchedule` | 关 | 注册每天自动同步（任务名 `AutoSpacePPT-SkillSync`） |
| `-ScheduleTime` | `09:00` | 每日同步时间 |
| `-Force` | 关 | 忽略哈希比对，强制重装 |

## 脚本行为

1. 下载 `https://raw.githubusercontent.com/<repo>/<ref>/auto-space-ppt-skill.zip`（失败回退 `github.com/<repo>/raw/...`）。
2. 计算 SHA256，与 `installed.json` 比对；一致则跳过（`-Force` 可强制）。
3. 解压校验必须存在 `auto-space-ppt/SKILL.md`。
4. 旧版本移动到 `<SkillHome>/.backup/auto-space-ppt-<时间戳>`，再复制新版本。
5. 写入 `installed.json`（repo / ref / sha256 / 时间）。
6. 可选：复制 `agent/凹凸-PPT.md` 到智能体目录。
7. 可选：注册 `schtasks` 每日任务，并把 repo 等参数写入 `config.json` 供同步脚本读取。

日志：`<InstallerDir>/logs/install-YYYY-MM.log`、`daily-sync.log`。

## 智能体「凹凸-PPT」

部署后文件为 `<AgentDir>/凹凸-PPT.md`，提示词要求：

- 用户只给汇报内容，技能负责选页、改写、出图、交付单文件 HTML + PDF；
- 严格遵守品牌规则（16:9 / 1600×900、电光蓝 `#0D7CFD`、原版 Logo）；
- 不捏造业绩与客户，占位内容明确标注；
- 每次开工前确认 `~/.agents/skills/auto-space-ppt` 是较新版本（可运行一次同步脚本）。

**新增/修改智能体后需重启 SpaceAgents（opencode）才会加载。**

## 每日自动同步

注册后任务 `AutoSpacePPT-SkillSync` 每天在指定时间调用 `daily-sync.ps1`：
读取 `config.json` → 调用 `install.ps1` → 有更新才替换技能目录 → 写日志。

常用命令：

```powershell
schtasks /Query /TN "AutoSpacePPT-SkillSync" /V /FO LIST   # 查看任务
schtasks /Run   /TN "AutoSpacePPT-SkillSync"                # 立即跑一次
schtasks /Delete /TN "AutoSpacePPT-SkillSync" /F            # 删除任务
Get-Content "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\logs\daily-sync.log" -Tail 20
```

## 校验安装结果

```powershell
Test-Path "$env:USERPROFILE\.agents\skills\auto-space-ppt\SKILL.md"
Test-Path "$env:USERPROFILE\.agents\skills\auto-space-ppt\assets\starter.zip"
Get-Content  "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\installed.json"
```

三项都正常后，直接对智能体说“用凹凸-PPT 做一份 XX 汇报”即可进入制作流程。

## 故障排查

- **403 / 404**：确认 `-Repo` 与 `-Ref` 正确，仓库为 public（或使用带 token 的私有下载 URL）。
- **哈希都不变但想重装**：加 `-Force`。
- **技能已存在却未生效**：确认 `~/.agents/skills/auto-space-ppt/SKILL.md` 存在，并重启 SpaceAgents。
- **计划任务未触发**：`schtasks /Query /TN "AutoSpacePPT-SkillSync"` 查状态与“上次运行结果”；常见原因是登录用户未登录或策略限制。
- **PDF 导出失败**：需要本机 Chrome，或设置 `CHROME_PATH`（由 `auto-space-ppt` 技能负责）。
