# 凹凸时空 PPT 技能仓库（auto-space-ppt-skill）

凹凸时空（AUTO SPACE）「凹凸-PPT」品牌演示稿技能的发布源。

> **UI 技能已拆分**：`auto-space-ui-design` 现独立发布于
> [lruihuan67-coder/auto-space-ui-design-skill](https://github.com/lruihuan67-coder/auto-space-ui-design-skill)。
> 此前从本仓库安装 UI 技能的机器，请按新仓库 README 的「迁移」一节把安装器 `repo` 指向新地址，否则每日同步会因 404 失败。

| 内容 | 说明 |
| --- | --- |
| `auto-space-ppt-skill.zip` | 「凹凸-PPT」技能压缩包（45 页 React 模板 + 制作技能） |
| `auto-space-ppt-skill.zip.version` | 压缩包 SHA256 清单，供 `--ensure` / `--status` 快速比对 |
| `skills/auto-space-ppt/` | PPT 技能展开目录 |
| `skills/auto-space-ppt-install/` | PPT 专属安装器（含「凹凸-PPT」智能体模板） |
| `scripts/release.py` | 一键发布：重打 starter.zip、重打技能包、提交推送 |

## 跨平台说明

安装逻辑写在 `scripts/install.py`（Python 3，无第三方依赖），`install.ps1` / `install.sh` 只是按平台取默认值的薄封装。

| | Windows | macOS |
| --- | --- | --- |
| 安装入口 | `install.ps1` | `install.sh` |
| 每日同步 | `daily-sync.ps1` | `daily-sync.sh` |
| 定时机制 | 计划任务（`Register-ScheduledTask`） | LaunchAgent（`StartCalendarInterval`） |

## 安装（Windows）

```powershell
$repo = "lruihuan67-coder/auto-space-ppt-skill"
$ppt  = "$env:USERPROFILE\.agents\skills\auto-space-ppt-install"
New-Item -ItemType Directory -Path "$ppt\scripts" -Force | Out-Null

foreach ($f in "install.ps1","install.py","daily-sync.ps1","daily-sync.py") {
  Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/$f" -OutFile "$ppt\scripts\$f"
}

powershell -NoProfile -ExecutionPolicy Bypass -File "$ppt\scripts\install.ps1" -Repo $repo -WithAgent -WithSchedule -ScheduleTime 09:10
```

## 安装（macOS）

```bash
repo="lruihuan67-coder/auto-space-ppt-skill"
d="$HOME/.agents/skills/auto-space-ppt-install/scripts"
mkdir -p "$d"
for f in install.sh install.py daily-sync.sh daily-sync.py; do
  curl -fsSL "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/$f" -o "$d/$f"
done
bash "$d/install.sh" --repo "$repo" --with-agent --with-schedule --schedule 09:10
```

安装后：

- 技能：`~/.agents/skills/auto-space-ppt/`
- 智能体：`./.opencode/agent/凹凸-PPT.md`（需重启 SpaceAgents 生效）
- 定时任务：Windows 计划任务 `AutoSpacePPT-SkillSync`（每天 09:10）／macOS LaunchAgent
- 旧版本备份：`~/.agents/skills/.backup/`

## 手动更新 / 查看定时任务

```powershell
# Windows
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\scripts\daily-sync.ps1"
schtasks /Query /TN "AutoSpacePPT-SkillSync" /V /FO LIST
Get-Content "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\logs\daily-sync.log" -Tail 20
```

```bash
# macOS
bash "$HOME/.agents/skills/auto-space-ppt-install/scripts/daily-sync.sh"
launchctl list | grep auto-space
tail -n 20 ~/.agents/skills/auto-space-ppt-install/logs/daily-sync.log
```

哈希没变化就跳过；有变化才覆盖，旧版备份在 `~/.agents/skills/.backup/`。

## 发布新版本（一条命令）

改完模板（`auto-space-deck`）或技能文档（`auto-space-ppt`）后，在仓库根目录执行：

```bash
python scripts/release.py --push -m "feat: add gallery layout"
```

它会依次：按演示稿工程重打 `assets/starter.zip` → 把本地技能源同步进 `skills/auto-space-ppt/` → 重打 `auto-space-ppt-skill.zip` → 更新 `.version` → 提交并推送，并打印新压缩包的 SHA256。

| 常用参数 | 作用 |
| --- | --- |
| `--push` | 提交并推送到 origin（不加只构建不推送） |
| `-m "..."` | 提交信息 |
| `--local-install` | 发布后立刻在本机强制安装一遍 |
| `--no-starter` | 只改了文档、不需要重打 45 页源码时使用 |
| `--deck <路径>` | 演示稿工程不在 `../auto-space-deck` 时指定 |
| `--skill-src <路径>` | 技能源不在 `../auto-space-ppt` 时指定 |

打包使用固定时间戳，内容没变时哈希不变，重跑发布不会让各机器白下载。

## 每日同步做了什么

```
daily-sync（09:10）
  ├─ 1. 安装器自更新：拉 skills/auto-space-ppt-install/scripts/ 下的核心脚本
  ├─ 2. 读 config.json（仓库 / 分支 / 技能目录 / 压缩包名）
  ├─ 3. 下载技能压缩包 → 比 SHA256
  └─ 4. 有变化才备份旧版并覆盖安装
```

## 使用时保证最新（--ensure）与版本自检

```powershell
# Windows：开工前自检（只拉几十字节的 .version 清单）
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\scripts\install.ps1" -Ensure

# 查看本机 / 远端版本
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\scripts\install.ps1" -Status
```

```bash
# macOS
bash "$HOME/.agents/skills/auto-space-ppt-install/scripts/install.sh" --ensure
bash "$HOME/.agents/skills/auto-space-ppt-install/scripts/install.sh" --status
```

## 相关仓库

- UI 技能：`lruihuan67-coder/auto-space-ui-design-skill`
