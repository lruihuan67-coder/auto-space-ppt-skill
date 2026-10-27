<#
.SYNOPSIS
  每日自动同步：拉取 GitHub 上最新的凹凸时空技能压缩包（PPT / UI 等）并安装到本地。
  由 Windows 计划任务 AutoSpacePPT-SkillSync 每天调用。
#>
[CmdletBinding()]
param(
  [string]$Repo,
  [string]$Ref,
  [string]$SkillHome
)

$ErrorActionPreference = "Stop"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$InstallerDir = Split-Path -Parent $ScriptRoot
$cfgPath = Join-Path $InstallerDir "config.json"
$installScript = Join-Path $ScriptRoot "install.ps1"

function Write-SyncLog {
  param([string]$Message, [string]$Level = "INFO")
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $line = "[$ts] [$Level] $Message"
  $logDir = Join-Path $InstallerDir "logs"
  if (-not (Test-Path -LiteralPath $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
  Add-Content -LiteralPath (Join-Path $logDir "daily-sync.log") -Value $line -Encoding UTF8
}

try {
  $cfg = $null
  if (Test-Path -LiteralPath $cfgPath) {
    $cfg = Get-Content -LiteralPath $cfgPath -Raw -Encoding UTF8 | ConvertFrom-Json
  }
  if (-not $Repo) { $Repo = $cfg.repo }
  if (-not $Ref) { $Ref = if ($cfg.ref) { $cfg.ref } else { "main" } }
  if (-not $SkillHome) { $SkillHome = if ($cfg.skillHome) { $cfg.skillHome } else { Join-Path $env:USERPROFILE ".agents\skills" } }

  if (-not $Repo) { throw "缺少仓库配置。请在 $cfgPath 中写入 repo 字段，或传入 -Repo。" }

  # 组装待同步技能列表：优先 skills 数组，兼容旧的单技能字段
  $items = @()
  if ($cfg.skills) {
    $items = @($cfg.skills)
  } elseif ($cfg.skillName -and $cfg.asset) {
    $items = @([pscustomobject]@{ skillName = $cfg.skillName; asset = $cfg.asset })
  } else {
    $items = @([pscustomobject]@{ skillName = "auto-space-ppt"; asset = "auto-space-ppt-skill.zip" })
  }

  $failed = 0
  foreach ($item in $items) {
    $sn = $item.skillName
    $an = if ($item.asset) { $item.asset } else { "$sn-skill.zip" }
    Write-SyncLog "开始同步 $Repo@$Ref → $SkillHome\$sn（$an）"
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $installScript -Repo $Repo -Ref $Ref -SkillHome $SkillHome -SkillName $sn -AssetName $an
    if ($LASTEXITCODE -ne 0) {
      Write-SyncLog "技能 $sn 同步失败（install.ps1 退出码 $LASTEXITCODE）" "ERROR"
      $failed++
    }
  }

  if ($failed -gt 0) { throw "$failed 个技能同步失败，详见日志" }
  Write-SyncLog "同步结束（共 $($items.Count) 个技能）"
} catch {
  Write-SyncLog ("同步失败：" + $_.Exception.Message) "ERROR"
  exit 1
}
