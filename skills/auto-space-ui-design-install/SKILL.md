---
name: auto-space-ui-design-install
description: 凹凸-UI 技能索引与安装器。从 GitHub 下载凹凸时空品牌 UI 设计技能压缩包（auto-space-ui-design-skill.zip，含品牌 Token 与 React 组件库 starter），落地为本地技能并可注册每天自动拉取最新版的定时任务（Windows 计划任务 / macOS LaunchAgent，每天 09:10）。当用户提到安装/更新/同步 凹凸-UI、凹凸时空 UI 技能、auto-space-ui-design、品牌组件库、从 GitHub 拉 UI 技能包时使用。
---

# 凹凸-UI 技能索引与安装器

本 skill 负责把 UI 设计技能 `auto-space-ui-design`（凹凸时空品牌 Token 与 React UI 组件）
从 GitHub 取到本地并保持最新。它只负责 UI 技能；品牌演示稿技能由
`auto-space-ppt-install` 单独安装与同步。两者各自有独立的配置、日志与定时任务。

| 资源 | 位置 |
| --- | --- |
| 技能压缩包 | `<repo>/auto-space-ui-design-skill.zip`（分支 `main`） |
| UI 设计技能 | `auto-space-ui-design`（安装后位于 `~/.agents/skills/auto-space-ui-design`） |
| 安装脚本（核心） | `skills/auto-space-ui-design-install/scripts/install.py` |
| 每日同步脚本（核心） | `skills/auto-space-ui-design-install/scripts/daily-sync.py` |
| Windows 封装 | `install.ps1` / `daily-sync.ps1` |
| macOS 封装 | `install.sh` / `daily-sync.sh` |

安装与同步逻辑只有一份（Python 3，无第三方依赖）。仓库默认值写在 `install.py` 的
`DEFAULT_*` 常量里（`lruihuan67-coder/auto-space-ppt-skill`）。UI 技能与 PPT 技能同仓库发布，但安装与同步完全独立。

## 一键安装 / 更新（推荐）

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ui-design-install\scripts\install.ps1"
```

首次从零安装（Windows）：

```powershell
$dir = "$env:USERPROFILE\.agents\skills\auto-space-ui-design-install"
New-Item -ItemType Directory -Path "$dir\scripts" -Force | Out-Null

$repo = "lruihuan67-coder/auto-space-ppt-skill"
foreach ($f in "install.ps1","install.py","daily-sync.ps1","daily-sync.py") {
  Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ui-design-install/scripts/$f" -OutFile "$dir\scripts\$f"
}

# 安装技能 + 注册每日同步（09:10）
powershell -NoProfile -ExecutionPolicy Bypass -File "$dir\scripts\install.ps1" -Repo $repo -WithSchedule -ScheduleTime 09:10
```

macOS：

```bash
repo="lruihuan67-coder/auto-space-ppt-skill"
d="$HOME/.agents/skills/auto-space-ui-design-install/scripts"
mkdir -p "$d"
for f in install.sh install.py daily-sync.sh daily-sync.py; do
  curl -fsSL "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ui-design-install/scripts/$f" -o "$d/$f"
done
bash "$d/install.sh" --repo "$repo" --with-schedule --schedule 09:10
```

macOS 注册的是 `~/Library/LaunchAgents/com.auto-space.auto-space-ui-design.sync.plist`。

安装脚本参数：

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `-Repo` / `--repo` | 脚本内置 | GitHub 仓库，`owner/repo` |
| `-Ref` / `--ref` | `main` | 分支或 tag |
| `-SkillName` / `--skill-name` | `auto-space-ui-design` | 安装的技能目录名 |
| `-AssetName` / `--asset` | `auto-space-ui-design-skill.zip` | 压缩包文件名 |
| `-SkillHome` / `--skill-home` | `~/.agents/skills` | 技能落地目录 |
| `-WithSchedule` / `--with-schedule` | 关 | 注册每天自动同步（任务名 `AutoSpaceUI-SkillSync`） |
| `-ScheduleTime` / `--schedule` | `09:10` | 每日同步时间 |
| `-TaskName` / `--task-name` | `AutoSpaceUI-SkillSync` | 计划任务名 |
| `-Force` / `--force` | 关 | 忽略哈希比对，强制重装 |
| `-Status` / `--status` | 关 | 只比对本机与远端版本，不安装 |

本安装器不部署智能体；UI 技能由当前对话直接按需加载使用。

## 脚本行为

1. **安装器自更新**：`daily-sync.py` 先从仓库拉取本目录最新的 `install.py` / `daily-sync.py` 与封装脚本，
   校验通过（Python 语法编译 + 内容非空）且哈希不同才替换本地版本；校验失败则保留旧版并继续。
2. 下载 `https://raw.githubusercontent.com/<repo>/<ref>/auto-space-ui-design-skill.zip`（失败回退 `github.com/<repo>/raw/...`）。
3. 计算 SHA256，与 `installed.json` 比对；一致则跳过（`--force` 可强制）。
4. 解压校验必须存在 `auto-space-ui-design/SKILL.md`。
5. 旧版本移动到 `<SkillHome>/.backup/auto-space-ui-design-<时间戳>`，再复制新版本。
6. 写入 `installed.json` 与 `config.json`（只登记本技能）。
7. 可选：注册每日任务。Windows 用 `Register-ScheduledTask`（允许电池启动、错过补跑），macOS 用 LaunchAgent。

日志：`<InstallerDir>/logs/install-YYYY-MM.log`、`daily-sync.log`。

## 每日自动同步

每天 09:10 调用 `daily-sync.ps1`（Windows）或 `daily-sync.sh`（macOS）：
先自更新安装器 → 读取 `config.json` → 调用 `install.py` → 有更新才替换技能目录 → 写日志。

```powershell
schtasks /Query /TN "AutoSpaceUI-SkillSync" /V /FO LIST
schtasks /Run   /TN "AutoSpaceUI-SkillSync"
schtasks /Delete /TN "AutoSpaceUI-SkillSync" /F
Get-Content "$env:USERPROFILE\.agents\skills\auto-space-ui-design-install\logs\daily-sync.log" -Tail 20
```

```bash
launchctl kickstart -k "gui/$(id -u)/com.auto-space.auto-space-ui-design.sync"
tail -n 20 ~/.agents/skills/auto-space-ui-design-install/logs/daily-sync.log
```

## 校验安装结果

```powershell
# 一条命令看本机与远端版本
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ui-design-install\scripts\install.ps1" -Status

Test-Path "$env:USERPROFILE\.agents\skills\auto-space-ui-design\SKILL.md"
Test-Path "$env:USERPROFILE\.agents\skills\auto-space-ui-design\assets\ui-starter\package.json"
```

```bash
# macOS
bash "$HOME/.agents/skills/auto-space-ui-design-install/scripts/install.sh" --status
```

安装后直接说“用凹凸-UI 搭一个 XX 后台界面”，对话会按 `auto-space-ui-design` 技能的设计规范工作。

## 故障排查

- **403 / 404**：确认 `--repo` 与 `--ref` 正确，仓库为 public。
- **哈希都不变但想重装**：加 `--force`。
- **提示找不到 Python**：安装器核心是 Python 3，需确保在 PATH 中。
- **技能已存在却未生效**：确认 `~/.agents/skills/auto-space-ui-design/SKILL.md` 存在，并新开会话。
- **定时任务没跑**：Windows 查 `schtasks /Query /TN "AutoSpaceUI-SkillSync" /V /FO LIST` 的“上次运行结果”，
  macOS 查 `launchctl list | grep auto-space` 与 `logs/launchd.err.log`。
- **starter 跑不起来**：`npm install` 需要网络；Node 版本建议 18+。
