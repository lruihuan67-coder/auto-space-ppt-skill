<#
.SYNOPSIS
  凹凸时空 PPT 技能安装器 —— 从 GitHub 拉取最新技能压缩包并落地到本地。

.DESCRIPTION
  下载 auto-space-ppt-skill.zip → 校验 → 解压 → 覆盖安装到技能目录。
  可选：部署「凹凸-PPT」智能体、注册每日自动同步计划任务。

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File install.ps1

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File install.ps1 -WithAgent -WithSchedule -ScheduleTime 09:00
#>
[CmdletBinding()]
param(
  [string]$Repo = "lruihuan67-coder/auto-space-ppt-skill",
  [string]$Ref = "main",
  [string]$AssetName = "auto-space-ppt-skill.zip",
  [string]$SkillName = "auto-space-ppt",
  [string]$SkillHome = (Join-Path $env:USERPROFILE ".agents\skills"),
  [string]$AgentDir = (Join-Path (Get-Location).Path ".opencode\agent"),
  [switch]$WithAgent,
  [switch]$WithSchedule,
  [string]$ScheduleTime = "09:00",
  [string]$SourceZip,
  [switch]$Force,
  [switch]$Quiet
)

$ErrorActionPreference = "Stop"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$InstallerDir = Split-Path -Parent $ScriptRoot

function Write-Log {
  param([string]$Message, [string]$Level = "INFO")
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $line = "[$ts] [$Level] $Message"
  if (-not $Quiet) { Write-Host $line }
  $logDir = Join-Path $InstallerDir "logs"
  if (-not (Test-Path -LiteralPath $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
  $logFile = Join-Path $logDir ("install-" + (Get-Date -Format "yyyy-MM") + ".log")
  Add-Content -LiteralPath $logFile -Value $line -Encoding UTF8
}

function Get-RemoteZip {
  param([string]$Url, [string]$OutFile)
  Write-Log "下载 $Url"
  if ($Quiet) { $progress = "SilentlyContinue" } else { $progress = "Continue" }
  $old = $ProgressPreference
  $ProgressPreference = $progress
  try {
    Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing -TimeoutSec 300 -Headers @{ "User-Agent" = "auto-space-ppt-install" }
  } finally {
    $ProgressPreference = $old
  }
}

function Save-Config {
  # 把当前技能按名字合并进 config.json 的 skills 数组（支持多技能共存）
  param([hashtable]$Data)
  $path = Join-Path $InstallerDir "config.json"
  $entry = [ordered]@{
    skillName = $Data.skillName; asset = $Data.asset; sha256 = $Data.sha256
  }
  $skills = @()
  if (Test-Path -LiteralPath $path) {
    try {
      $old = Get-Content -LiteralPath $path -Raw -Encoding UTF8 | ConvertFrom-Json
      if ($old.skills) {
        $skills = @($old.skills)
      } elseif ($old.skillName -and $old.asset) {
        # 兼容旧单技能格式，迁移进数组
        $skills = @([pscustomobject]@{ skillName = $old.skillName; asset = $old.asset })
      }
    } catch { }
  }
  $skills = @($skills | Where-Object { $_.skillName -ne $Data.skillName })
  $skills += [pscustomobject]$entry
  $cfg = [ordered]@{
    repo = $Data.repo; ref = $Data.ref; skillHome = $Data.skillHome
    schedule = $Data.schedule; skills = $skills
  }
  ($cfg | ConvertTo-Json -Depth 6) | Set-Content -LiteralPath $path -Encoding UTF8
}

# ---------- 0. 参数校验 ----------
$url = ""
if (-not $SourceZip) {
  if ([string]::IsNullOrWhiteSpace($Repo) -or $Repo -notmatch "^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$") {
    throw "仓库地址无效：'$Repo'。请使用 -Repo <owner>/<repo> 指定，或改用 -SourceZip 指定本地压缩包。"
  }
  $url = "https://raw.githubusercontent.com/$Repo/$Ref/$AssetName"
}
$skillTarget = Join-Path $SkillHome $SkillName
$stateFile = Join-Path $InstallerDir "installed.json"

Write-Log "仓库：$Repo  分支：$Ref  技能目录：$skillTarget"

# ---------- 1. 下载 ----------
$tmpDir = Join-Path $env:TEMP ("auto-space-ppt-install-" + [guid]::NewGuid().ToString("N").Substring(0, 8))
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null
$zipPath = Join-Path $tmpDir $AssetName

try {
  if ($SourceZip) {
    if (-not (Test-Path -LiteralPath $SourceZip)) { throw "找不到指定的压缩包：$SourceZip" }
    Copy-Item -LiteralPath $SourceZip -Destination $zipPath -Force
    Write-Log "使用本地压缩包 $SourceZip"
  } elseif ($url) {
    try {
      Get-RemoteZip -Url $url -OutFile $zipPath
    } catch {
      $fallback = "https://github.com/$Repo/raw/$Ref/$AssetName"
      Write-Log "raw.githubusercontent 失败，回退 $fallback" "WARN"
      Get-RemoteZip -Url $fallback -OutFile $zipPath
    }
  }

  $hash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash
  $sizeMB = [math]::Round((Get-Item -LiteralPath $zipPath).Length / 1MB, 2)
  Write-Log "下载完成：$sizeMB MB  SHA256=$hash"

  # ---------- 2. 比对版本 ----------
  if ((-not $Force) -and (Test-Path -LiteralPath $stateFile)) {
    $state = Get-Content -LiteralPath $stateFile -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($state.sha256 -eq $hash -and (Test-Path -LiteralPath (Join-Path $skillTarget "SKILL.md"))) {
      Write-Log "已是最新版本，跳过安装。"
      $script:Result = "up-to-date"
    }
  }

  if (-not $script:Result) {
    # ---------- 3. 解压 ----------
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $extractDir = Join-Path $tmpDir "extract"
    [System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $extractDir)
    $srcSkill = Join-Path $extractDir $SkillName
    if (-not (Test-Path -LiteralPath (Join-Path $srcSkill "SKILL.md"))) {
      throw "压缩包结构异常：缺少 $SkillName/SKILL.md"
    }

    # ---------- 4. 备份并安装 ----------
    if (-not (Test-Path -LiteralPath $SkillHome)) { New-Item -ItemType Directory -Path $SkillHome -Force | Out-Null }
    if (Test-Path -LiteralPath $skillTarget) {
      $backupRoot = Join-Path $SkillHome ".backup"
      if (-not (Test-Path -LiteralPath $backupRoot)) { New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null }
      $backup = Join-Path $backupRoot ("$SkillName-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
      Move-Item -LiteralPath $skillTarget -Destination $backup
      Write-Log "旧版本已备份到 $backup"
    }
    Copy-Item -LiteralPath $srcSkill -Destination $skillTarget -Recurse -Force
    Write-Log "技能已安装到 $skillTarget"

    # ---------- 5. 记录状态 ----------
    $stateData = [ordered]@{
      repo     = $Repo
      ref      = $Ref
      asset    = $AssetName
      sha256   = $hash
      skill    = $skillTarget
      updated  = (Get-Date).ToString("o")
      url      = $url
    }
    $stateData | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $stateFile -Encoding UTF8
    $script:Result = "installed"
  }

  # ---------- 6. 可选：部署智能体 ----------
  if ($WithAgent) {
    $agentSrc = Join-Path $InstallerDir "agent\凹凸-PPT.md"
    if (-not (Test-Path -LiteralPath $agentSrc)) {
      $agentRel = "skills/auto-space-ppt-install/agent/" + [uri]::EscapeDataString("凹凸-PPT.md")
      $agentUrl = "https://raw.githubusercontent.com/$Repo/$Ref/$agentRel"
      Write-Log "本地无智能体模板，从 $agentUrl 下载"
      $agentSrc = Join-Path $tmpDir "agent-凹凸-PPT.md"
      try {
        Get-RemoteZip -Url $agentUrl -OutFile $agentSrc
      } catch {
        Write-Log "智能体模板下载失败：$($_.Exception.Message)" "WARN"
        $agentSrc = $null
      }
    }
    if (-not $agentSrc -or -not (Test-Path -LiteralPath $agentSrc)) {
      Write-Log "跳过智能体部署" "WARN"
    } else {
      if (-not (Test-Path -LiteralPath $AgentDir)) { New-Item -ItemType Directory -Path $AgentDir -Force | Out-Null }
      Copy-Item -LiteralPath $agentSrc -Destination (Join-Path $AgentDir "凹凸-PPT.md") -Force
      Write-Log "智能体「凹凸-PPT」已部署到 $AgentDir"
    }
  }

  # ---------- 7. 可选：注册每日同步 ----------
  if ($WithSchedule) {
    $dailySync = Join-Path $InstallerDir "scripts\daily-sync.ps1"
    if (-not (Test-Path -LiteralPath $dailySync)) {
      Write-Log "未找到 $dailySync，跳过计划任务注册" "WARN"
    } else {
      $taskName = "AutoSpacePPT-SkillSync"
      $arg = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$dailySync`""
      schtasks.exe /Create /TN $taskName /TR "powershell.exe $arg" /SC DAILY /ST $ScheduleTime /F | Out-Null
      if ($LASTEXITCODE -eq 0) {
        Write-Log "每日自动同步任务已注册：$taskName（每天 $ScheduleTime）"
      } else {
        Write-Log "计划任务注册失败，退出码 $LASTEXITCODE。可手动执行：schtasks /Create /TN $taskName /TR `"powershell.exe $arg`" /SC DAILY /ST $ScheduleTime /F" "ERROR"
      }
    }
  }

  Save-Config @{
    repo = $Repo; ref = $Ref; skillName = $SkillName; asset = $AssetName
    sha256 = $hash; skillHome = $SkillHome; schedule = $ScheduleTime
  }
  Write-Log "同步配置写入 $(Join-Path $InstallerDir 'config.json')"

  Write-Log "完成：$script:Result"
} finally {
  Remove-Item -LiteralPath $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
}
