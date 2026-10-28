# Windows wrapper for install.py (the cross-platform core).
# Keeps the original PowerShell parameter names so existing docs and scripts keep working.
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
  [string]$ScheduleTime = "09:10",
  [string]$TaskName = "AutoSpacePPT-SkillSync",
  [string]$SourceZip,
  [switch]$Force,
  [switch]$Quiet
)

$ErrorActionPreference = "Stop"
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) { $python = Get-Command python3 -ErrorAction SilentlyContinue }
if (-not $python) { throw "Python 3 is required but was not found on PATH." }

$argv = @(
  (Join-Path $PSScriptRoot "install.py"),
  "--repo", $Repo,
  "--ref", $Ref,
  "--asset", $AssetName,
  "--skill-name", $SkillName,
  "--skill-home", $SkillHome,
  "--agent-dir", $AgentDir,
  "--schedule", $ScheduleTime,
  "--task-name", $TaskName
)
if ($WithAgent) { $argv += "--with-agent" }
if ($WithSchedule) { $argv += "--with-schedule" }
if ($SourceZip) { $argv += @("--source-zip", $SourceZip) }
if ($Force) { $argv += "--force" }
if ($Quiet) { $argv += "--quiet" }

& $python.Source @argv
exit $LASTEXITCODE
