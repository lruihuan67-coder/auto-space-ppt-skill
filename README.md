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
| `scripts/` | 辅助脚本目录（预留） |

两套安装器的对应关系：

| | PPT | UI |
| --- | --- | --- |
| 索引 skill | `auto-space-ppt-install` | `auto-space-ui-design-install` |
| 安装的技能 | `auto-space-ppt` | `auto-space-ui-design` |
| 压缩包 | `auto-space-ppt-skill.zip` | `auto-space-ui-design-skill.zip` |
| 本地配置 | `~/.agents/skills/auto-space-ppt-install/config.json` | `~/.agents/skills/auto-space-ui-design-install/config.json` |
| 计划任务 | `AutoSpacePPT-SkillSync`（每天 09:00） | `AutoSpaceUI-SkillSync`（每天 09:10） |
| 日志 | `.../auto-space-ppt-install/logs/` | `.../auto-space-ui-design-install/logs/` |

## 安装（PowerShell）

```powershell
$repo = "lruihuan67-coder/auto-space-ppt-skill"

# —— PPT：技能 + 智能体 + 每日同步（09:00）——
$ppt = "$env:USERPROFILE\.agents\skills\auto-space-ppt-install"
New-Item -ItemType Directory -Path "$ppt\scripts" -Force | Out-Null
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/install.ps1"     -OutFile "$ppt\scripts\install.ps1"
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/daily-sync.ps1" -OutFile "$ppt\scripts\daily-sync.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -File "$ppt\scripts\install.ps1" -Repo $repo -WithAgent -WithSchedule -ScheduleTime 09:00

# —— UI：技能 + 每日同步（09:10，错峰）——
$ui = "$env:USERPROFILE\.agents\skills\auto-space-ui-design-install"
New-Item -ItemType Directory -Path "$ui\scripts" -Force | Out-Null
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ui-design-install/scripts/install.ps1"     -OutFile "$ui\scripts\install.ps1"
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ui-design-install/scripts/daily-sync.ps1" -OutFile "$ui\scripts\daily-sync.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -File "$ui\scripts\install.ps1" -Repo $repo -WithSchedule -ScheduleTime 09:10
```

安装后：

- 技能：`~/.agents/skills/auto-space-ppt/`、`~/.agents/skills/auto-space-ui-design/`
- 智能体：`./.opencode/agent/凹凸-PPT.md`（需重启 SpaceAgents 生效）
- 两个独立定时任务：`AutoSpacePPT-SkillSync`（09:00）、`AutoSpaceUI-SkillSync`（09:10）

## 手动更新

```powershell
# 只更新 PPT
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\scripts\daily-sync.ps1"

# 只更新 UI
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ui-design-install\scripts\daily-sync.ps1"
```

哈希没变化就跳过；有变化才覆盖，旧版备份在 `~/.agents/skills/.backup/`。

## 查看定时任务

```powershell
schtasks /Query /TN "AutoSpacePPT-SkillSync" /V /FO LIST
schtasks /Query /TN "AutoSpaceUI-SkillSync"  /V /FO LIST
Get-Content "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\logs\daily-sync.log"      -Tail 20
Get-Content "$env:USERPROFILE\.agents\skills\auto-space-ui-design-install\logs\daily-sync.log" -Tail 20
```

## 手动发布新版本

```powershell
# 在仓库根目录，替换对应压缩包（及 skills/ 下的展开目录）后
git add -A
git commit -m "chore: update skill packages"
git push
```

每天各自的定时任务会在下次运行时自动装上最新版。
