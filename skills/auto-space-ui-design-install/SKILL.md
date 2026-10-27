---
name: auto-space-ui-design-install
description: 凹凸-UI 技能索引与安装器。从 GitHub 下载凹凸时空品牌 UI 设计技能压缩包（auto-space-ui-design-skill.zip，含品牌 Token 与 React 组件库 starter），落地为本地技能并可注册每天自动拉取最新版的定时任务。当用户提到安装/更新/同步 凹凸-UI、凹凸时空 UI 技能、auto-space-ui-design、品牌组件库、从 GitHub 拉 UI 技能包时使用。
---

# 凹凸-UI 技能索引与安装器

本 skill 负责把 UI 设计技能 `auto-space-ui-design`（凹凸时空品牌 Token 与 React UI 组件）
从 GitHub 取到本地并保持最新。它只负责 UI 技能；品牌演示稿技能由
`auto-space-ppt-install` 单独安装与同步。两者各自有独立的配置、日志与计划任务。

| 资源 | 位置 |
| --- | --- |
| 技能压缩包 | `<repo>/auto-space-ui-design-skill.zip`（分支 `main`） |
| UI 设计技能 | `auto-space-ui-design`（安装后位于 `~/.agents/skills/auto-space-ui-design`） |
| 安装脚本 | `skills/auto-space-ui-design-install/scripts/install.ps1` |
| 每日同步脚本 | `skills/auto-space-ui-design-install/scripts/daily-sync.ps1` |

仓库默认值写在 `scripts/install.ps1` 的 `-Repo` 参数里（`lruihuan67-coder/auto-space-ppt-skill`）。
UI 技能与 PPT 技能同仓库发布，但安装与同步完全独立。

## 一键安装 / 更新（推荐）

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.agents\skills\auto-space-ui-design-install\scripts\install.ps1"
```

首次从零安装：

```powershell
$dir = "$env:USERPROFILE\.agents\skills\auto-space-ui-design-install"
New-Item -ItemType Directory -Path "$dir\scripts" -Force | Out-Null

$repo = "lruihuan67-coder/auto-space-ppt-skill"
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ui-design-install/scripts/install.ps1" -OutFile "$dir\scripts\install.ps1"
Invoke-WebRequest "https://raw.githubusercontent.com/$repo/main/skills/auto-space-ui-design-install/scripts/daily-sync.ps1" -OutFile "$dir\scripts\daily-sync.ps1"

# 安装技能 + 注册每日同步（09:10，与 PPT 的 09:00 错峰）
powershell -NoProfile -ExecutionPolicy Bypass -File "$dir\scripts\install.ps1" -Repo $repo -WithSchedule -ScheduleTime 09:10
```

安装脚本参数：

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `-Repo` | 脚本内置 | GitHub 仓库，`owner/repo` |
| `-Ref` | `main` | 分支或 tag |
| `-SkillName` | `auto-space-ui-design` | 安装的技能目录名 |
| `-AssetName` | `auto-space-ui-design-skill.zip` | 压缩包文件名 |
| `-SkillHome` | `~/.agents/skills` | 技能落地目录 |
| `-WithSchedule` | 关 | 注册每天自动同步（任务名 `AutoSpaceUI-SkillSync`） |
| `-ScheduleTime` | `09:10` | 每日同步时间（与 PPT 的 09:00 错峰） |
| `-TaskName` | `AutoSpaceUI-SkillSync` | 计划任务名 |
| `-Force` | 关 | 忽略哈希比对，强制重装 |

本安装器不部署智能体；UI 技能由当前对话直接按需加载使用。

## 脚本行为

1. 下载 `https://raw.githubusercontent.com/<repo>/<ref>/auto-space-ui-design-skill.zip`（失败回退 `github.com/<repo>/raw/...`）。
2. 计算 SHA256，与 `installed.json` 比对；一致则跳过（`-Force` 可强制）。
3. 解压校验必须存在 `auto-space-ui-design/SKILL.md`。
4. 旧版本移动到 `<SkillHome>/.backup/auto-space-ui-design-<时间戳>`，再复制新版本。
5. 写入 `installed.json` 与 `config.json`（只登记本技能）。
6. 可选：注册 `schtasks` 每日任务 `AutoSpaceUI-SkillSync`。

日志：`<InstallerDir>/logs/install-YYYY-MM.log`、`daily-sync.log`。

## 每日自动同步

任务 `AutoSpaceUI-SkillSync` 每天调用 `daily-sync.ps1`：
读取本目录 `config.json` → 调用 `install.ps1` → 有更新才替换技能目录 → 写日志。

```powershell
schtasks /Query /TN "AutoSpaceUI-SkillSync" /V /FO LIST
schtasks /Run   /TN "AutoSpaceUI-SkillSync"
schtasks /Delete /TN "AutoSpaceUI-SkillSync" /F
Get-Content "$env:USERPROFILE\.agents\skills\auto-space-ui-design-install\logs\daily-sync.log" -Tail 20
```

## 校验安装结果

```powershell
Test-Path "$env:USERPROFILE\.agents\skills\auto-space-ui-design\SKILL.md"
Test-Path "$env:USERPROFILE\.agents\skills\auto-space-ui-design\assets\ui-starter\package.json"
Get-Content  "$env:USERPROFILE\.agents\skills\auto-space-ui-design-install\installed.json"
```

安装后直接说“用凹凸-UI 搭一个 XX 后台界面”，对话会按 `auto-space-ui-design` 技能的设计规范工作。

## 故障排查

- **403 / 404**：确认 `-Repo` 与 `-Ref` 正确，仓库为 public。
- **哈希都不变但想重装**：加 `-Force`。
- **技能已存在却未生效**：确认 `~/.agents/skills/auto-space-ui-design/SKILL.md` 存在，并重启 SpaceAgents。
- **计划任务未触发**：`schtasks /Query /TN "AutoSpaceUI-SkillSync"` 查状态；常见原因是登录用户未登录或策略限制。
- **starter 跑不起来**：`npm install` 需要网络；Node 版本建议 18+。
