---
name: auto-space-ppt-install
description: 凹凸-PPT 技能索引与安装器。从 GitHub 下载凹凸时空品牌演示稿技能压缩包（auto-space-ppt-skill.zip），落地为本地技能与「凹凸-PPT」智能体，并可注册每天自动拉取最新版的定时任务。当用户提到安装/更新/同步 凹凸-PPT、凹凸时空 PPT 技能、auto-space-ppt、从 GitHub 拉技能包、每天自动更新技能时使用。
---

# 凹凸-PPT 技能索引与安装器

本 skill 是「凹凸-PPT」能力的入口：它不生产 PPT，而是负责把真正的制作技能
`auto-space-ppt`（凹凸时空品牌演示稿）从 GitHub 取到本地并保持最新。
它只负责演示稿技能；UI 组件库技能由 `auto-space-ui-design-install` 单独安装与同步。

| 资源 | 位置 |
| --- | --- |
| 技能压缩包 | `<repo>/auto-space-ppt-skill.zip`（分支 `main`） |
| 制作技能 | `auto-space-ppt`（安装后位于 `~/.agents/skills/auto-space-ppt`） |
| 智能体模板 | `<repo>/skills/auto-space-ppt-install/agent/凹凸-PPT.md` |
| 安装脚本（核心） | `skills/auto-space-ppt-install/scripts/install.py` |
| 每日同步脚本（核心） | `skills/auto-space-ppt-install/scripts/daily-sync.py` |
| Windows 封装 | `install.ps1` / `daily-sync.ps1`（Windows 计划任务） |
| macOS 封装 | `install.sh` / `daily-sync.sh`（LaunchAgent） |

安装与同步逻辑只有一份（Python 3，无第三方依赖），`.ps1` 与 `.sh` 只负责按平台传参。仓库默认值写在 `install.py` 的 `--repo` 默认值里（`lruihuan67-coder/auto-space-ppt-skill`），每天 **09:10** 同步。

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

# 2. 取安装脚本
$repo = "lruihuan67-coder/auto-space-ppt-skill"
foreach ($f in "install.ps1","install.py","daily-sync.ps1","daily-sync.py") {
  Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/$f" -OutFile "$dir\scripts\$f"
}

# 3. 安装技能 + 智能体 + 每日同步（09:10）
powershell -NoProfile -ExecutionPolicy Bypass -File "$dir\scripts\install.ps1" -Repo $repo -WithAgent -WithSchedule -ScheduleTime 09:10
```

macOS 同样只需两个核心脚本加两个封装（无 PowerShell）：

```bash
repo="lruihuan67-coder/auto-space-ppt-skill"
d="$HOME/.agents/skills/auto-space-ppt-install/scripts"
mkdir -p "$d"
for f in install.sh install.py daily-sync.sh daily-sync.py; do
  curl -fsSL "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/$f" -o "$d/$f"
done
bash "$d/install.sh" --repo "$repo" --with-agent --with-schedule --schedule 09:10
```

macOS 侧注册的是 `~/Library/LaunchAgents/com.auto-space.auto-space-ppt.sync.plist`，`StartCalendarInterval` 每天 09:10 触发 `daily-sync.sh`。

安装脚本参数：

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `-Repo` | 脚本内置 | GitHub 仓库，`owner/repo` |
| `-Ref` | `main` | 分支或 tag |
| `-SkillName` | `auto-space-ppt` | 安装的技能目录名 |
| `-AssetName` | `auto-space-ppt-skill.zip` | 压缩包文件名 |
| `-SkillHome` | `~/.agents/skills` | 技能落地目录 |
| `-AgentDir` | `./.opencode/agent` | 智能体文件目录（配合 `-WithAgent`） |
| `-WithAgent` | 关 | 部署「凹凸-PPT」智能体 |
| `-WithSchedule` | 关 | 注册每天自动同步（任务名 `AutoSpacePPT-SkillSync`） |
| `-ScheduleTime` / `--schedule` | `09:10` | 每日同步时间 |
| `-TaskName` / `--task-name` | `AutoSpacePPT-SkillSync` | 计划任务名 |
| `-Force` / `--force` | 关 | 忽略哈希比对，强制重装 |
| `-Status` / `--status` | 关 | 只比对本机与远端版本，不安装 |

## 脚本行为

1. **安装器自更新**：`daily-sync.py` 先从仓库拉取本目录最新的 `install.py` / `daily-sync.py` 与封装脚本，
   校验通过（Python 语法编译 + 内容非空）且哈希不同才替换本地版本；校验失败则保留旧版并继续。
2. 下载 `https://raw.githubusercontent.com/<repo>/<ref>/auto-space-ppt-skill.zip`（失败回退 `github.com/<repo>/raw/...`）。
3. 计算 SHA256，与 `installed.json` 比对；一致则跳过（`--force` 可强制）。
4. 解压校验必须存在 `auto-space-ppt/SKILL.md`。
5. 旧版本移动到 `<SkillHome>/.backup/auto-space-ppt-<时间戳>`，再复制新版本。
6. 写入 `installed.json`（repo / ref / sha256 / 时间）与 `config.json`（只登记本技能）。
7. 可选：复制 `agent/凹凸-PPT.md` 到智能体目录。
8. 可选：注册每日任务，Windows 用 `Register-ScheduledTask`（允许电池启动、错过补跑），macOS 用 LaunchAgent。

日志：`<InstallerDir>/logs/install-YYYY-MM.log`、`daily-sync.log`。

## 智能体「凹凸-PPT」

部署后文件为 `<AgentDir>/凹凸-PPT.md`，提示词要求：

- 用户只给汇报内容，技能负责选页、改写、出图、交付单文件 HTML + PDF；
- 严格遵守品牌规则（16:9 / 1600×900、电光蓝 `#0D7CFD`、原版 Logo）；
- 不捏造业绩与客户，占位内容明确标注；
- 每次开工前确认 `~/.agents/skills/auto-space-ppt` 是较新版本（可运行一次同步脚本）。

**新增/修改智能体后需重启 SpaceAgents（opencode）才会加载。**

## 每日自动同步

注册后每天在指定时间调用 `daily-sync.ps1`（Windows）或 `daily-sync.sh`（macOS）：
先自更新安装器 → 读取本目录 `config.json` → 调用 `install.py` → 有更新才替换技能目录 → 写日志。

常用命令：

```powershell
schtasks /Query /TN "AutoSpacePPT-SkillSync" /V /FO LIST   # 查看任务
schtasks /Run   /TN "AutoSpacePPT-SkillSync"                # 立即跑一次
schtasks /Delete /TN "AutoSpacePPT-SkillSync" /F            # 删除任务
Get-Content "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\logs\daily-sync.log" -Tail 20
```

```bash
launchctl list | grep auto-space                                  # macOS 查看
launchctl kickstart -k "gui/$(id -u)/com.auto-space.auto-space-ppt.sync"   # 立即跑一次
tail -n 20 ~/.agents/skills/auto-space-ppt-install/logs/daily-sync.log
```

## 校验安装结果

```powershell
# 一条命令看本机与远端版本
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\scripts\install.ps1" -Status

Test-Path "$env:USERPROFILE\.agents\skills\auto-space-ppt\SKILL.md"
Test-Path "$env:USERPROFILE\.agents\skills\auto-space-ppt\assets\starter.zip"
Get-Content  "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\installed.json"
```

```bash
# macOS
bash "$HOME/.agents/skills/auto-space-ppt-install/scripts/install.sh" --status
launchctl print "gui/$(id -u)/com.auto-space.auto-space-ppt.sync" | head -20
```

三项都正常后，直接对智能体说“用凹凸-PPT 做一份 XX 汇报”即可进入制作流程。

## 故障排查

- **403 / 404**：确认 `--repo` 与 `--ref` 正确，仓库为 public（或使用带 token 的私有下载 URL）。
- **哈希都不变但想重装**：加 `--force`。
- **提示找不到 Python**：安装器核心是 Python 3（技能本身也需要它跑 `new_deck.py`）；装好 Python 3 并确保在 PATH 中。
- **技能已存在却未生效**：确认 `~/.agents/skills/auto-space-ppt/SKILL.md` 存在，并重启 SpaceAgents / 新开会话。
- **定时任务没跑**：Windows 查 `schtasks /Query /TN "AutoSpacePPT-SkillSync" /V /FO LIST` 的“上次运行结果”；macOS 查 `launchctl list | grep auto-space` 与 `logs/launchd.err.log`。Windows 侧需确认任务设置为“允许电池启动 + 错过补跑”（本安装器默认已开）。
- **PDF 导出失败**：需要本机 Chrome，或设置 `CHROME_PATH`（由 `auto-space-ppt` 技能负责）。
