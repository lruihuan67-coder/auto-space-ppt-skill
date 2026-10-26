<#
.SYNOPSIS
  每日自动同步：拉取 GitHub 上最新的 auto-space-ppt 技能压缩包并安装到本地。
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

  Write-SyncLog "开始同步 $Repo@$Ref → $SkillHome"
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $installScript -Repo $Repo -Ref $Ref -SkillHome $SkillHome
  if ($LASTEXITCODE -ne 0) { throw "install.ps1 退出码 $LASTEXITCODE" }
  Write-SyncLog "同步结束"
} catch {
  Write-SyncLog ("同步失败：" + $_.Exception.Message) "ERROR"
  exit 1
}
