#!/usr/bin/env python3
"""Daily sync: keep the installer itself current, then pull the latest skill.

Windows: called by the scheduled task (via daily-sync.ps1).
macOS: called by the LaunchAgent (via daily-sync.sh).

Self-update exists so a fix to the installer reaches every machine that already
installed it; otherwise those machines would keep running the installer they
downloaded on day one.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from datetime import datetime
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
INSTALLER = SCRIPTS.parent
CORE_FILES = ("install.py", "daily-sync.py")
WRAPPER_FILES = ("install.ps1", "daily-sync.ps1", "install.sh", "daily-sync.sh")


def log(message: str, level: str = "INFO") -> None:
    line = f"[{datetime.now():%Y-%m-%d %H:%M:%S}] [{level}] {message}"
    print(line)
    try:
        log_dir = INSTALLER / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        with (log_dir / "daily-sync.log").open("a", encoding="utf-8") as handle:
            handle.write(line + "\n")
    except OSError:
        # Never let a logging failure abort the sync itself.
        pass


def fetch(url: str, dest: Path, attempts: int = 3) -> None:
    last: Exception | None = None
    for attempt in range(attempts):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "auto-space-skill-install"})
            with urllib.request.urlopen(request, timeout=120) as response, dest.open("wb") as handle:
                shutil.copyfileobj(response, handle)
            return
        except Exception as error:  # noqa: BLE001 - retry transient proxy/TLS failures
            last = error
            time.sleep(1 + attempt)
    raise last if last else RuntimeError(f"下载失败：{url}")


def valid(path: Path) -> bool:
    try:
        data = path.read_bytes()
    except OSError:
        return False
    if len(data) < 50:
        return False
    if path.suffix == ".py":
        try:
            compile(data.decode("utf-8"), str(path), "exec")
        except (SyntaxError, UnicodeDecodeError):
            return False
        return True
    try:
        data.decode("utf-8")
    except UnicodeDecodeError:
        return False
    return True


def digest(path: Path) -> str:
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()
    except OSError:
        # Locked or unreadable (antivirus, editor): treat as different, never raise.
        return ""


def prepare_update(repo: str, ref: str) -> tuple[Path | None, list[str]]:
    """Download the repo's installer scripts into a temp dir and validate them.

    Nothing is written into the installed scripts directory here: the fresh copy
    is executed for this run, and only applied afterwards, so a half-finished
    download can never break the installer that is currently running.
    """
    base = f"https://raw.githubusercontent.com/{repo}/{ref}/skills/{INSTALLER.name}/scripts"
    stage = Path(tempfile.mkdtemp(prefix="auto-space-installer-"))
    staged: dict[str, Path] = {}
    for name in CORE_FILES + WRAPPER_FILES:
        target = stage / name
        try:
            fetch(f"{base}/{name}", target)
        except Exception as error:  # noqa: BLE001 - optional file or offline
            log(f"安装器自更新：{name} 拉取失败（{error}）", "WARN")
            continue
        if not valid(target):
            log(f"安装器自更新：{name} 校验未通过，保留本地版本", "WARN")
            continue
        staged[name] = target

    missing = [name for name in CORE_FILES if name not in staged]
    if missing:
        log(f"安装器自更新：核心脚本缺失（{', '.join(missing)}），本次跳过", "WARN")
        shutil.rmtree(stage, ignore_errors=True)
        return None, []

    changed = [name for name, path in staged.items()
               if not (SCRIPTS / name).is_file() or digest(SCRIPTS / name) != digest(path)]
    if not changed:
        log("安装器已是最新")
        shutil.rmtree(stage, ignore_errors=True)
        return None, []
    return stage, changed


def apply_update(stage: Path, changed: list[str]) -> None:
    try:
        for name in changed:
            shutil.copyfile(stage / name, SCRIPTS / name)
    except OSError as error:
        log(f"安装器自更新：写入失败（{error}），下次同步再试", "WARN")
        return
    log(f"安装器已更新：{', '.join(changed)}（下次运行生效）")


def main() -> int:
    parser = argparse.ArgumentParser(description="Pull the latest installer and skill archive.")
    parser.add_argument("--repo")
    parser.add_argument("--ref")
    parser.add_argument("--skill-home")
    parser.add_argument("--skill-name")
    parser.add_argument("--asset")
    parser.add_argument("--no-self-update", action="store_true")
    args = parser.parse_args()

    config_path = INSTALLER / "config.json"
    config = {}
    if config_path.is_file():
        try:
            config = json.loads(config_path.read_text(encoding="utf-8-sig"))
        except ValueError:
            log(f"无法解析 {config_path}，改用默认值", "WARN")

    repo = args.repo or config.get("repo")
    if not repo:
        log(f"缺少仓库配置。请在 {config_path} 中写入 repo 字段。", "ERROR")
        return 1
    ref = args.ref or config.get("ref", "main")
    skill_home = args.skill_home or config.get("skillHome", str(Path.home() / ".agents" / "skills"))
    skill_name = args.skill_name or config.get("skillName", "auto-space-ppt")
    asset = args.asset or config.get("asset", "auto-space-ppt-skill.zip")

    stage = None
    changed: list[str] = []
    if not args.no_self_update:
        try:
            stage, changed = prepare_update(repo, ref)
        except Exception as error:  # noqa: BLE001 - self-update must never block the sync
            log(f"安装器自更新：失败（{error}），本次沿用本地版本", "WARN")
            stage = None

    install_script = (stage / "install.py") if stage else (SCRIPTS / "install.py")
    command = [
        sys.executable,
        str(install_script),
        "--repo", repo,
        "--ref", ref,
        "--skill-home", skill_home,
        "--skill-name", skill_name,
        "--asset", asset,
        "--schedule", config.get("schedule", "09:10"),
        "--quiet",
    ]
    # The staged copy lives in a temp dir; keep its state and logs in the real installer dir.
    env = dict(os.environ, AUTO_SPACE_INSTALLER_DIR=str(INSTALLER))
    log(f"开始同步 {repo}@{ref} → {Path(skill_home) / skill_name}（{asset}）")
    result = subprocess.run(command, env=env)
    if result.returncode != 0:
        log(f"同步失败：install.py 退出码 {result.returncode}", "ERROR")
    else:
        log("同步结束")

    if stage:
        apply_update(stage, changed)
        shutil.rmtree(stage, ignore_errors=True)
    return result.returncode


if __name__ == "__main__":
    sys.exit(main())
