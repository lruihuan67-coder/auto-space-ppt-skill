# Windows wrapper for daily-sync.py.
# Existing scheduled tasks point at this file, so it stays as the Windows entry point.
[CmdletBinding()]
param(
  [string]$Repo,
  [string]$Ref,
  [string]$SkillHome,
  [string]$SkillName,
  [string]$AssetName,
  [switch]$NoSelfUpdate
)

$ErrorActionPreference = "Stop"
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) { $python = Get-Command python3 -ErrorAction SilentlyContinue }
if (-not $python) { throw "Python 3 is required but was not found on PATH." }

$argv = @((Join-Path $PSScriptRoot "daily-sync.py"))
if ($Repo) { $argv += @("--repo", $Repo) }
if ($Ref) { $argv += @("--ref", $Ref) }
if ($SkillHome) { $argv += @("--skill-home", $SkillHome) }
if ($SkillName) { $argv += @("--skill-name", $SkillName) }
if ($AssetName) { $argv += @("--asset", $AssetName) }
if ($NoSelfUpdate) { $argv += "--no-self-update" }

& $python.Source @argv
exit $LASTEXITCODE
