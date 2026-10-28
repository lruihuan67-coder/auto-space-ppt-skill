# 凹凸时空技能仓库（auto-space-ppt-skill）

凹凸时空（AUTO SPACE）品牌技能的发布源。两个技能同仓库发布，但安装、配置、日志与每日定时任务**完全分开**，各自独立：

| 内容 | 说明 |
| --- | --- |
| `auto-space-ppt-skill.zip` | 「凹凸-PPT」品牌演示稿技能压缩包（45 页 React 模板 + 制作技能） |
| `auto-space-ui-design-skill.zip` | 「凹凸-UI」品牌 UI 设计技能压缩包（品牌 Token + React 组件库 starter） |
| `skills/auto-space-ppt/` | PPT 技能展开目录 |
| `skills/auto-space-ui-design/` | UI 技能展开目录 |
| `skills/auto-space-ppt-install/` | PPT 专属安装器（含「凹凸-PPT」智能体模板） |
| `skills/auto-space-ui-design-install/` | UI 专属安装器 |
| `scripts/release.py` | 一键发布：重打 starter.zip、重打技能包、提交推送 |

两套安装器的对应关系：

| | PPT | UI |
| --- | --- | --- |
| 索引 skill | `auto-space-ppt-install` | `auto-space-ui-design-install` |
| 安装的技能 | `auto-space-ppt` | `auto-space-ui-design` |
| 压缩包 | `auto-space-ppt-skill.zip` | `auto-space-ui-design-skill.zip` |
| 本地配置 | `~/.agents/skills/auto-space-ppt-install/config.json` | `~/.agents/skills/auto-space-ui-design-install/config.json` |
| 定时任务 | `AutoSpacePPT-SkillSync`（每天 09:10） | `AutoSpaceUI-SkillSync`（每天 09:10） |
| 日志 | `.../auto-space-ppt-install/logs/` | `.../auto-space-ui-design-install/logs/` |

## 跨平台说明

安装逻辑都写在 `scripts/install.py`（Python 3，无第三方依赖），`install.ps1` / `install.sh` 只是按平台取默认值的薄封装。

| | Windows | macOS |
| --- | --- | --- |
| 安装入口 | `install.ps1` | `install.sh` |
| 每日同步 | `daily-sync.ps1` | `daily-sync.sh` |
| 定时机制 | 计划任务（`Register-ScheduledTask`） | LaunchAgent（`StartCalendarInterval`） |
| 任务注册特性 | 电池供电也启动、错过补跑、限时 2 小时 | 开机登录后由 launchd 调度，休眠错过会在唤醒后补跑 |

## 安装（Windows）

```powershell
$repo = "lruihuan67-coder/auto-space-ppt-skill"

# —— PPT：技能 + 智能体 + 每日同步（09:10）——
$ppt = "$env:USERPROFILE\.agents\skills\auto-space-ppt-install"
New-Item -ItemType Directory -Path "$ppt\scripts" -Force | Out-Null
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/install.ps1"     -OutFile "$ppt\scripts\install.ps1"
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/install.py"      -OutFile "$ppt\scripts\install.py"
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/daily-sync.ps1" -OutFile "$ppt\scripts\daily-sync.ps1"
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/daily-sync.py"  -OutFile "$ppt\scripts\daily-sync.py"
powershell -NoProfile -ExecutionPolicy Bypass -File "$ppt\scripts\install.ps1" -Repo $repo -WithAgent -WithSchedule -ScheduleTime 09:10

# —— UI：技能 + 每日同步（09:10）——
$ui = "$env:USERPROFILE\.agents\skills\auto-space-ui-design-install"
New-Item -ItemType Directory -Path "$ui\scripts" -Force | Out-Null
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ui-design-install/scripts/install.ps1"     -OutFile "$ui\scripts\install.ps1"
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ui-design-install/scripts/daily-sync.ps1" -OutFile "$ui\scripts\daily-sync.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -File "$ui\scripts\install.ps1" -Repo $repo -WithSchedule -ScheduleTime 09:10
```

## 安装（macOS）

```bash
repo="lruihuan67-coder/auto-space-ppt-skill"
ppt="$HOME/.agents/skills/auto-space-ppt-install/scripts"
mkdir -p "$ppt"
for f in install.sh install.py daily-sync.sh daily-sync.py; do
  curl -fsSL "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/$f" -o "$ppt/$f"
done
bash "$ppt/install.sh" --repo "$repo" --with-agent --with-schedule --schedule 09:10
```

安装后：

- 技能：`~/.agents/skills/auto-space-ppt/`、`~/.agents/skills/auto-space-ui-design/`
- 智能体：`./.opencode/agent/凹凸-PPT.md`（需重启 SpaceAgents 生效）
- 定时任务：Windows 计划任务 / macOS `~/Library/LaunchAgents/` 下的 LaunchAgent
- 旧版本备份：`~/.agents/skills/.backup/`

## 手动更新

```powershell
# Windows
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\scripts\daily-sync.ps1"
```

```bash
# macOS
bash "$HOME/.agents/skills/auto-space-ppt-install/scripts/daily-sync.sh"
```

哈希没变化就跳过；有变化才覆盖，旧版备份在 `~/.agents/skills/.backup/`。

## 查看定时任务

```powershell
# Windows
schtasks /Query /TN "AutoSpacePPT-SkillSync" /V /FO LIST
Get-Content "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\logs\daily-sync.log" -Tail 20
```

```bash
# macOS
launchctl list | grep auto-space
tail -n 20 ~/.agents/skills/auto-space-ppt-install/logs/daily-sync.log
```

## 发布新版本（一条命令）

改完模板（`auto-space-deck`）或技能文档（`auto-space-ppt`）后，在仓库根目录执行：

```bash
python scripts/release.py --push -m "feat: add gallery layout"
```

它会依次：按演示稿工程重打 `assets/starter.zip` → 把本地技能源同步进 `skills/auto-space-ppt/` → 重打 `auto-space-ppt-skill.zip` → 提交并推送，并打印新压缩包的 SHA256。

打包使用固定时间戳，**内容没变时哈希不变**，所以重跑发布不会让各机器白下载一遍；只有真的改了模板或文档，哈希才会变。

| 常用参数 | 作用 |
| --- | --- |
| `--push` | 提交并推送到 origin（不加只构建不推送） |
| `-m "..."` | 提交信息 |
| `--local-install` | 发布后立刻在本机强制安装一遍，便于当场验证 |
| `--no-starter` | 只改了文档、不需要重打 45 页源码时使用 |
| `--deck <路径>` | 演示稿工程不在 `../auto-space-deck` 时指定 |
| `--skill-src <路径>` | 技能源不在 `../auto-space-ppt` 时指定 |

推送后，所有装过该技能的机器会在下一次每日同步时凭 SHA256 变化自动更新，无需逐台操作。

## 每日同步做了什么

```
daily-sync（09:10）
  ├─ 1. 安装器自更新：拉 skills/<installer>/scripts/ 下的 install.py、daily-sync.py 与封装脚本到临时目录
  │      → 校验（Python 语法编译 + 非空）
  │      → 本次同步直接用新副本执行
  │      → 同步结束后才替换本地脚本（下次运行生效），下载或校验失败则继续用旧版
  ├─ 2. 读 config.json（仓库 / 分支 / 技能目录 / 压缩包名）
  ├─ 3. 下载技能压缩包 → 比 SHA256
  └─ 4. 有变化才备份旧版并覆盖安装
```

安装器自更新解决了“修复只落在新机器上”的问题：改 `install.py` 或任务注册逻辑，只需 push，已装机器第二天自动获得。

## 版本自检

任意一台机器上执行一条命令，即可看到本机版本、远端版本、是否需要更新：

```powershell
# Windows
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\scripts\install.ps1" -Status
```

```bash
# macOS
bash "$HOME/.agents/skills/auto-space-ppt-install/scripts/install.sh" --status
```

输出示例：

```
技能目录   : ~/.agents/skills/auto-space-ppt
本机版本   : 2D4E35E51A82  更新于 2026-10-28T15:39:14+08:00
远端版本   : 1B3A0E5B0002
状态       : 有新版，下次每日同步会自动安装
每日时间   : 09:10
```

## 无法完全自动化的部分

| 情况 | 表现 | 兜底 |
| --- | --- | --- |
| 09:10 时机器关机 | Windows 下次开机补跑；macOS 关机期间错过的不会补 | 开机后手动跑一次 `daily-sync`，或用 `--status` 确认 |
| 技能已被替换但会话还开着 | 当前会话仍用旧内容 | 新开会话（opencode 需重启 SpaceAgents） |
| 旧版安装器首次升级 | 老脚本没有自更新能力 | 按上文「安装」块重取一次脚本，之后即可自维护 |
