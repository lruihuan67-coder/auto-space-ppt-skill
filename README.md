# 凹凸时空技能仓库（auto-space-ppt-skill）

凹凸时空（AUTO SPACE）品牌技能的发布源，目前包含两个技能：

| 内容 | 说明 |
| --- | --- |
| `auto-space-ppt-skill.zip` | 「凹凸-PPT」品牌演示稿技能压缩包（45 页 React 模板 + 制作技能） |
| `auto-space-ui-design-skill.zip` | 「凹凸-UI」品牌 UI 设计技能压缩包（品牌 Token + React 组件库 starter） |
| `skills/auto-space-ppt/` | PPT 技能展开目录，便于查看与 diff |
| `skills/auto-space-ui-design/` | UI 技能展开目录 |
| `skills/auto-space-ppt-install/` | 索引 / 安装 skill：从 GitHub 下载压缩包落地到本地，支持多技能统一同步 |
| `skills/auto-space-ppt-install/agent/凹凸-PPT.md` | 「凹凸-PPT」智能体定义 |
| `scripts/` | 辅助脚本目录（预留） |

## 安装（PowerShell）

```powershell
$repo = "lruihuan67-coder/auto-space-ppt-skill"
$dir  = "$env:USERPROFILE\.agents\skills\auto-space-ppt-install"
New-Item -ItemType Directory -Path "$dir\scripts" -Force | Out-Null
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/install.ps1"     -OutFile "$dir\scripts\install.ps1"
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ppt-install/scripts/daily-sync.ps1" -OutFile "$dir\scripts\daily-sync.ps1"

# 安装 PPT 技能 + 智能体 + 每日同步
powershell -NoProfile -ExecutionPolicy Bypass -File "$dir\scripts\install.ps1" -Repo $repo -WithAgent -WithSchedule -ScheduleTime 09:00

# 追加安装 UI 技能（同一条每日同步任务会一并维护它）
powershell -NoProfile -ExecutionPolicy Bypass -File "$dir\scripts\install.ps1" -Repo $repo -SkillName auto-space-ui-design -AssetName auto-space-ui-design-skill.zip
```

安装后：

- 技能：`~/.agents/skills/auto-space-ppt/`、`~/.agents/skills/auto-space-ui-design/`
- 索引 skill：`~/.agents/skills/auto-space-ppt-install/`
- 智能体：`./.opencode/agent/凹凸-PPT.md`（需重启 SpaceAgents 生效）
- 定时任务：`AutoSpacePPT-SkillSync`，每天 `09:00` 拉取所有已登记技能的最新压缩包（登记表在索引 skill 的 `config.json` → `skills` 数组）

## 手动更新

```powershell
# 更新全部已登记技能
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\scripts\daily-sync.ps1"

# 只更新某一个
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\scripts\install.ps1" -SkillName auto-space-ppt -AssetName auto-space-ppt-skill.zip
```

哈希没变化就跳过；有变化才覆盖，旧版备份在 `~/.agents/skills/.backup/`。

## 查看定时任务

```powershell
schtasks /Query /TN "AutoSpacePPT-SkillSync" /V /FO LIST
Get-Content "$env:USERPROFILE\.agents\skills\auto-space-ppt-install\logs\daily-sync.log" -Tail 20
```

## 手动发布新版本

```powershell
# 在仓库根目录，替换对应压缩包（及 skills/ 下的展开目录）后
git add -A
git commit -m "chore: update skill packages"
git push
```

每天的任务会在下次运行时自动装上最新版。新增第三个技能时：压缩包放仓库根目录、展开目录放 `skills/<技能名>/`，然后对本地跑一次
`install.ps1 -SkillName <技能名> -AssetName <压缩包文件名>`，它就会自动登记进每日同步列表。
