# 凹凸-PPT 技能仓库（auto-space-ppt-skill）

凹凸时空（AUTO SPACE）品牌演示稿技能的发布源。包含三样东西：

| 内容 | 说明 |
| --- | --- |
| `auto-space-ppt-skill.zip` | 可直接下载的技能压缩包（制作技能本体 + 45 页模板素材） |
| `skills/auto-space-ppt/` | 同一份技能的展开目录，便于查看与 diff |
| `skills/auto-space-ppt-install/` | 索引 / 安装 skill：从 GitHub 下载上面的压缩包并落地到本地 |
| `agent/凹凸-PPT.md` | 「凹凸-PPT」智能体定义 |
| `scripts/` | 辅助脚本目录（预留） |

## 安装（PowerShell）

```powershell
$repo = "lruihuan67-coder/auto-space-ppt-skill"
$dir  = "$env:USERPROFILE\.agents\skills\auto-space-ppt-install"
New-Item -ItemType Directory -Path "$dir\scripts" -Force | Out-Null
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/install.ps1"     -OutFile "$dir\scripts\install.ps1"
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/daily-sync.ps1" -OutFile "$dir\scripts\daily-sync.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -File "$dir\scripts\install.ps1" -Repo $repo -WithAgent -WithSchedule -ScheduleTime 09:00
```

安装后：

- 技能：`~/.agents/skills/auto-space-ppt/`
- 索引 skill：`~/.agents/skills/auto-space-ppt-install/`
- 智能体：`./.opencode/agent/凹凸-PPT.md`（需重启 SpaceAgents 生效）
- 定时任务：`AutoSpacePPT-SkillSync`，每天 `09:00` 拉取最新压缩包

## 手动更新

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\scripts\install.ps1"
```

有变化才覆盖，旧版备份在 `~/.agents/skills/.backup/`。

## 查看定时任务

```powershell
schtasks /Query /TN "AutoSpacePPT-SkillSync" /V /FO LIST
Get-Content "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\logs\daily-sync.log" -Tail 20
```

## 手动发布新版本

```powershell
# 在仓库根目录，替换压缩包后
git add -A
git commit -m "chore: update auto-space-ppt skill package"
git push
```

每天的任务会在下次运行时自动装上最新版。
