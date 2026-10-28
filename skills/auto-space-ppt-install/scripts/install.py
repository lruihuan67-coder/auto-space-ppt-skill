#!/usr/bin/env python3
"""Cross-platform installer for Auto Space brand skills.

Windows: registers a scheduled task that also runs on battery and catches up
missed runs. macOS: registers a LaunchAgent with a daily calendar interval.
Both compare the archive SHA256 before reinstalling.

Examples:
  python install.py --with-agent --with-schedule --schedule 09:10
  python install.py --source-zip ../../auto-space-ppt-skill.zip --force
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.parse
import urllib.request
import zipfile
from datetime import datetime
from pathlib import Path

DEFAULT_REPO = "lruihuan67-coder/auto-space-ppt-skill"
DEFAULT_ASSET = "auto-space-ppt-skill.zip"
DEFAULT_SKILL = "auto-space-ppt"
DEFAULT_TASK = "AutoSpacePPT-SkillSync"
USER_AGENT = "auto-space-skill-install"


def installer_dir() -> Path:
    """Config, state and logs always live next to the installed installer.

    daily-sync may run a freshly downloaded copy from a temp directory; the env
    override keeps that copy writing to the real installer directory.
    """
    override = os.environ.get("AUTO_SPACE_INSTALLER_DIR")
    return Path(override).expanduser() if override else Path(__file__).resolve().parent.parent


def log(message: str, level: str = "INFO", quiet: bool = False) -> None:
    line = f"[{datetime.now():%Y-%m-%d %H:%M:%S}] [{level}] {message}"
    if not quiet:
        print(line)
    log_dir = installer_dir() / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    with (log_dir / f"install-{datetime.now():%Y-%m}.log").open("a", encoding="utf-8") as handle:
        handle.write(line + "\n")


def download(url: str, dest: Path, quiet: bool = False) -> None:
    log(f"下载 {url}", quiet=quiet)
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=300) as response, dest.open("wb") as handle:
        shutil.copyfileobj(response, handle)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def read_json(path: Path) -> dict:
    if not path.is_file():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except (ValueError, OSError):
        return {}


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=4, ensure_ascii=False), encoding="utf-8")


def save_config(data: dict) -> None:
    """Keep the documented config shape so existing scripts stay compatible."""
    ordered = {
        "repo": data["repo"],
        "ref": data["ref"],
        "skillHome": data["skillHome"],
        "schedule": data["schedule"],
        "skillName": data["skillName"],
        "asset": data["asset"],
        "sha256": data["sha256"],
    }
    write_json(installer_dir() / "config.json", ordered)


def register_windows_task(task_name: str, daily_script: Path, schedule_time: str, quiet: bool) -> None:
    script = (
        "$ErrorActionPreference = 'Stop';"
        "$a = New-ScheduledTaskAction -Execute 'powershell.exe' "
        f"-Argument '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"{daily_script}\"';"
        f"$t = New-ScheduledTaskTrigger -Daily -At '{schedule_time}';"
        "$s = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries "
        "-StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 2);"
        f"Register-ScheduledTask -TaskName '{task_name}' -Action $a -Trigger $t -Settings $s -Force | Out-Null"
    )
    result = subprocess.run(
        ["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"计划任务注册失败：{(result.stderr or result.stdout).strip()}")
    log(f"Windows 计划任务已注册：{task_name}（每天 {schedule_time}，电池可用、错过补跑）", quiet=quiet)


def register_macos_agent(label: str, daily_script: Path, schedule_time: str, quiet: bool) -> None:
    hour, minute = (int(part) for part in schedule_time.split(":"))
    log_dir = installer_dir() / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    plist = Path.home() / "Library" / "LaunchAgents" / f"{label}.plist"
    plist.parent.mkdir(parents=True, exist_ok=True)
    plist.write_text(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
        "<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" "
        "\"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n"
        "<plist version=\"1.0\">\n<dict>\n"
        f"  <key>Label</key><string>{label}</string>\n"
        "  <key>ProgramArguments</key>\n"
        f"  <array><string>/bin/bash</string><string>{daily_script}</string></array>\n"
        "  <key>StartCalendarInterval</key>\n"
        f"  <dict><key>Hour</key><integer>{hour}</integer><key>Minute</key><integer>{minute}</integer></dict>\n"
        f"  <key>StandardOutPath</key><string>{log_dir / 'launchd.out.log'}</string>\n"
        f"  <key>StandardErrorPath</key><string>{log_dir / 'launchd.err.log'}</string>\n"
        "</dict>\n</plist>\n",
        encoding="utf-8",
    )
    domain = f"gui/{os.getuid()}"
    subprocess.run(["launchctl", "bootout", domain, str(plist)], capture_output=True, text=True)
    result = subprocess.run(["launchctl", "bootstrap", domain, str(plist)], capture_output=True, text=True)
    if result.returncode != 0:
        legacy = subprocess.run(["launchctl", "load", "-w", str(plist)], capture_output=True, text=True)
        if legacy.returncode != 0:
            raise RuntimeError(f"LaunchAgent 注册失败：{(result.stderr or legacy.stderr).strip()}")
    log(f"macOS LaunchAgent 已注册：{plist.name}（每天 {schedule_time}）", quiet=quiet)


def register_schedule(task_name: str, skill_name: str, daily_script: Path, schedule_time: str, quiet: bool) -> None:
    if sys.platform.startswith("win"):
        register_windows_task(task_name, daily_script, schedule_time, quiet)
    elif sys.platform == "darwin":
        register_macos_agent(f"com.auto-space.{skill_name}.sync", daily_script, schedule_time, quiet)
    else:
        log(f"当前平台 {sys.platform} 不支持自动计划任务，请自行调度 {daily_script}", "WARN", quiet)


def show_status(args, quiet: bool) -> int:
    """Print the installed archive hash next to the one GitHub currently serves."""
    state = read_json(installer_dir() / "installed.json")
    config = read_json(installer_dir() / "config.json")
    skill_home = Path(args.skill_home or config.get("skillHome") or Path.home() / ".agents" / "skills").expanduser()
    skill_name = args.skill_name or config.get("skillName") or DEFAULT_SKILL
    asset = args.asset or config.get("asset") or DEFAULT_ASSET
    repo = args.repo or config.get("repo") or DEFAULT_REPO
    ref = args.ref or config.get("ref") or "main"
    schedule = config.get("schedule", "—")
    target = skill_home / skill_name

    local = state.get("sha256") or "未安装"
    updated = state.get("updated") or "—"
    remote = "获取失败"
    error = ""
    with tempfile.TemporaryDirectory(prefix="auto-space-status-") as tmp:
        remote_zip = Path(tmp) / asset
        try:
            try:
                download(f"https://raw.githubusercontent.com/{repo}/{ref}/{asset}", remote_zip, quiet)
            except Exception:  # noqa: BLE001 - fall back to the github.com URL
                download(f"https://github.com/{repo}/raw/{ref}/{asset}", remote_zip, quiet)
            remote = sha256(remote_zip)
        except Exception as exc:  # noqa: BLE001 - offline or blocked
            error = str(exc)

    if not (target / "SKILL.md").is_file():
        verdict = "未安装（或技能目录被清理），下次同步会重装"
    elif remote == "获取失败":
        verdict = f"无法联网比对（{error}）"
    elif local[:12] == remote[:12]:
        verdict = "已是最新"
    else:
        verdict = "有新版，下次每日同步会自动安装"

    print(f"仓库       : {repo}@{ref}（{asset}）")
    print(f"技能目录   : {target}")
    print(f"本机版本   : {local[:12] if local != '未安装' else local}  更新于 {updated}")
    print(f"远端版本   : {remote[:12] if remote != '获取失败' else '—'}")
    print(f"状态       : {verdict}")
    print(f"每日时间   : {schedule}")
    return 0


def fetch_text(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", "replace")


def remote_hash(repo: str, ref: str, asset: str) -> str | None:
    """Read the tiny published hash file instead of downloading the whole archive."""
    for url in (
        f"https://raw.githubusercontent.com/{repo}/{ref}/{asset}.version",
        f"https://github.com/{repo}/raw/{ref}/{asset}.version",
    ):
        try:
            for line in fetch_text(url).splitlines():
                candidate = line.strip()
                if re.fullmatch(r"[0-9A-Fa-f]{64}", candidate):
                    return candidate.upper()
        except Exception:  # noqa: BLE001 - try the fallback host, then give up
            continue
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Install an Auto Space skill from a GitHub archive.")
    parser.add_argument("--repo", default=DEFAULT_REPO, help="owner/repo on GitHub")
    parser.add_argument("--ref", default="main")
    parser.add_argument("--asset", default=DEFAULT_ASSET)
    parser.add_argument("--skill-name", default=DEFAULT_SKILL)
    parser.add_argument("--skill-home", default=str(Path.home() / ".agents" / "skills"))
    parser.add_argument("--agent-dir", default=str(Path.cwd() / ".opencode" / "agent"))
    parser.add_argument("--with-agent", action="store_true", help="deploy the agent markdown template")
    parser.add_argument("--with-schedule", action="store_true", help="register the daily sync job")
    parser.add_argument("--schedule", default="09:10", help="daily run time, HH:MM")
    parser.add_argument("--task-name", default=DEFAULT_TASK)
    parser.add_argument("--source-zip", help="install from a local archive instead of GitHub")
    parser.add_argument("--force", action="store_true", help="reinstall even when the hash matches")
    parser.add_argument("--status", action="store_true", help="compare the installed version with GitHub")
    parser.add_argument("--ensure", action="store_true", help="快速核对并只在有新版本时安装")
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args()

    quiet = args.quiet
    if args.status:
        return show_status(args, quiet)

    skill_home = Path(args.skill_home).expanduser()
    skill_target = skill_home / args.skill_name

    if args.ensure and not args.source_zip:
        state = read_json(installer_dir() / "installed.json")
        latest = remote_hash(args.repo, args.ref, args.asset)
        if latest is None:
            log("无法获取远端版本（离线或网络受限），按本机现有版本继续", "WARN", quiet)
            return 0
        if latest == (state.get("sha256") or "").upper() and (skill_target / "SKILL.md").is_file():
            print("技能已是最新，无需更新")
            return 0
        log("发现新版本，开始更新", quiet=quiet)

    url = ""
    if not args.source_zip:
        if not re.fullmatch(r"[A-Za-z0-9._-]+/[A-Za-z0-9._-]+", args.repo or ""):
            parser.error("仓库地址无效，请使用 --repo <owner>/<repo> 或改用 --source-zip")
        url = f"https://raw.githubusercontent.com/{args.repo}/{args.ref}/{args.asset}"

    state_file = installer_dir() / "installed.json"
    log(f"仓库：{args.repo}  分支：{args.ref}  技能目录：{skill_target}", quiet=quiet)

    tmp_dir = Path(tempfile.mkdtemp(prefix="auto-space-skill-"))
    zip_path = tmp_dir / args.asset
    try:
        if args.source_zip:
            source = Path(args.source_zip).expanduser()
            if not source.is_file():
                parser.error(f"找不到指定的压缩包：{source}")
            shutil.copyfile(source, zip_path)
            log(f"使用本地压缩包 {source}", quiet=quiet)
        else:
            try:
                download(url, zip_path, quiet)
            except Exception as error:  # noqa: BLE001 - fall back to the github.com URL
                fallback = f"https://github.com/{args.repo}/raw/{args.ref}/{args.asset}"
                log(f"raw.githubusercontent 失败（{error}），回退 {fallback}", "WARN", quiet)
                download(fallback, zip_path, quiet)

        digest = sha256(zip_path)
        size_mb = round(zip_path.stat().st_size / (1 << 20), 2)
        log(f"压缩包就绪：{size_mb} MB  SHA256={digest}", quiet=quiet)

        result = ""
        state = read_json(state_file)
        if not args.force and state.get("sha256") == digest and (skill_target / "SKILL.md").is_file():
            result = "up-to-date"
            log("已是最新版本，跳过安装。", quiet=quiet)

        if not result:
            extract_dir = tmp_dir / "extract"
            with zipfile.ZipFile(zip_path) as archive:
                for name in archive.namelist():
                    member = Path(name)
                    if member.is_absolute() or ".." in member.parts:
                        raise RuntimeError(f"压缩包包含不安全路径：{name}")
                archive.extractall(extract_dir)
            source_skill = extract_dir / args.skill_name
            if not (source_skill / "SKILL.md").is_file():
                raise RuntimeError(f"压缩包结构异常：缺少 {args.skill_name}/SKILL.md")

            skill_home.mkdir(parents=True, exist_ok=True)
            if skill_target.exists():
                backup_root = skill_home / ".backup"
                backup_root.mkdir(parents=True, exist_ok=True)
                backup = backup_root / f"{args.skill_name}-{datetime.now():%Y%m%d-%H%M%S}"
                shutil.move(str(skill_target), str(backup))
                log(f"旧版本已备份到 {backup}", quiet=quiet)
            shutil.copytree(source_skill, skill_target)
            log(f"技能已安装到 {skill_target}", quiet=quiet)

            write_json(
                state_file,
                {
                    "repo": args.repo,
                    "ref": args.ref,
                    "asset": args.asset,
                    "sha256": digest,
                    "skill": str(skill_target),
                    "updated": datetime.now().astimezone().isoformat(),
                    "url": url,
                },
            )
            result = "installed"

        if args.with_agent:
            agent_src = installer_dir() / "agent" / "凹凸-PPT.md"
            if not agent_src.is_file() and url:
                agent_url = (
                    f"https://raw.githubusercontent.com/{args.repo}/{args.ref}/"
                    f"skills/{installer_dir().name}/agent/{urllib.parse.quote('凹凸-PPT.md')}"
                )
                log(f"本地无智能体模板，从 {agent_url} 下载", quiet=quiet)
                agent_src = tmp_dir / "agent.md"
                try:
                    download(agent_url, agent_src, quiet)
                except Exception as error:  # noqa: BLE001
                    log(f"智能体模板下载失败：{error}", "WARN", quiet)
                    agent_src = None
            if agent_src and agent_src.is_file():
                agent_dir = Path(args.agent_dir).expanduser()
                agent_dir.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(agent_src, agent_dir / "凹凸-PPT.md")
                log(f"智能体「凹凸-PPT」已部署到 {agent_dir}", quiet=quiet)
            else:
                log("跳过智能体部署", "WARN", quiet)

        if args.with_schedule:
            scripts = Path(__file__).resolve().parent
            daily = scripts / ("daily-sync.ps1" if sys.platform.startswith("win") else "daily-sync.sh")
            if not daily.is_file():
                log(f"未找到 {daily}，跳过计划任务注册", "WARN", quiet)
            else:
                register_schedule(args.task_name, args.skill_name, daily, args.schedule, quiet)

        save_config(
            {
                "repo": args.repo,
                "ref": args.ref,
                "skillHome": str(skill_home),
                "schedule": args.schedule,
                "skillName": args.skill_name,
                "asset": args.asset,
                "sha256": digest,
            }
        )
        log(f"完成：{result}", quiet=quiet)
        return 0
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
