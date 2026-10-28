#!/usr/bin/env python3
"""Daily sync: read config.json next to this installer and run install.py.

Windows: called by the scheduled task AutoSpacePPT-SkillSync (via daily-sync.ps1).
macOS: called by the LaunchAgent daily job (via daily-sync.sh).
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
INSTALLER = SCRIPTS.parent


def log(message: str, level: str = "INFO") -> None:
    line = f"[{datetime.now():%Y-%m-%d %H:%M:%S}] [{level}] {message}"
    print(line)
    log_dir = INSTALLER / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    with (log_dir / "daily-sync.log").open("a", encoding="utf-8") as handle:
        handle.write(line + "\n")


def main() -> int:
    parser = argparse.ArgumentParser(description="Pull the latest skill archive from GitHub.")
    parser.add_argument("--repo")
    parser.add_argument("--ref")
    parser.add_argument("--skill-home")
    parser.add_argument("--skill-name")
    parser.add_argument("--asset")
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

    command = [
        sys.executable,
        str(SCRIPTS / "install.py"),
        "--repo", repo,
        "--ref", ref,
        "--skill-home", skill_home,
        "--skill-name", skill_name,
        "--asset", asset,
        "--schedule", config.get("schedule", "09:10"),
        "--quiet",
    ]
    log(f"开始同步 {repo}@{ref} → {Path(skill_home) / skill_name}（{asset}）")
    result = subprocess.run(command)
    if result.returncode != 0:
        log(f"同步失败：install.py 退出码 {result.returncode}", "ERROR")
        return result.returncode
    log("同步结束")
    return 0


if __name__ == "__main__":
    sys.exit(main())
