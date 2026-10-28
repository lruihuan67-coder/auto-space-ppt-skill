#!/usr/bin/env python3
"""Build (and optionally publish) the Auto Space skill archive.

1. Repack skills/<skill>/assets/starter.zip from the deck project source.
2. Mirror the local skill source into skills/<skill>/.
3. Rebuild <skill>-skill.zip at the repo root, keeping the skills/<skill>/ folder
   inside the archive (both installers expect that layout).
4. Optionally commit + push, so every installed machine picks the new hash up on
   its next daily sync.

Examples
  python scripts/release.py
  python scripts/release.py --push -m "feat: add gallery layout"
  python scripts/release.py --push --local-install
  python scripts/release.py --no-starter -m "docs: clarify authoring tips"
"""

from __future__ import annotations

import argparse
import hashlib
import os
import shutil
import subprocess
import sys
import zipfile
from datetime import datetime
from pathlib import Path

SKIP_DIRS = {"node_modules", "dist", "qa", "tmp", ".git", ".vite", ".cache", "__pycache__", ".backup"}
SKIP_FILES = {".gitignore", ".DS_Store", "Thumbs.db", "desktop.ini", "DECK_BRIEF.md", "config.json", "installed.json"}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def iter_files(root: Path):
    for current, dirs, files in os.walk(root):
        dirs[:] = sorted(item for item in dirs if item not in SKIP_DIRS)
        base = Path(current)
        for name in sorted(files):
            if name in SKIP_FILES:
                continue
            path = base / name
            yield path, path.relative_to(root)


def build_starter(deck: Path, target: Path) -> int:
    entries = list(iter_files(deck))
    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
        for path, rel in entries:
            archive.write(path, rel.as_posix())
    print(f"starter.zip 重建完成：{len(entries)} 个文件，{target.stat().st_size / (1 << 20):.1f} MB")
    return len(entries)


def mirror_skill(source: Path, target: Path) -> None:
    if source.resolve() == target.resolve():
        print(f"技能源目录即仓库目录，跳过同步：{target}")
        return
    if target.exists():
        shutil.rmtree(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(
        source,
        target,
        ignore=shutil.ignore_patterns("__pycache__", ".DS_Store", "logs", "config.json", "installed.json"),
    )
    print(f"技能源已同步到仓库：{target}")


def build_skill_zip(skill_dir: Path, output: Path) -> int:
    entries = list(iter_files(skill_dir))
    names = [rel.as_posix() for _, rel in entries]
    if "SKILL.md" not in names:
        raise RuntimeError(f"{skill_dir} 缺少 SKILL.md，无法发布")
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
        for path, rel in entries:
            archive.write(path, f"{skill_dir.name}/{rel.as_posix()}")
    print(f"技能包重建完成：{len(entries)} 个文件，{output.stat().st_size / (1 << 20):.1f} MB")
    return len(entries)


def git(repo: Path, *args: str, capture: bool = False) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=repo, check=True, capture_output=capture, text=capture)


def publish(repo: Path, zip_name: str, message: str | None, digest: str) -> None:
    git(repo, "add", "--", zip_name, "skills")
    staged = git(repo, "status", "--porcelain", capture=True).stdout.strip()
    if not staged:
        print("仓库没有变更，跳过提交")
        return
    git(repo, "commit", "-m", message or f"chore: publish {zip_name} ({digest[:12]})")
    git(repo, "push", "origin", "HEAD")
    print("已提交并推送到 origin")


def local_install(repo: Path, archive: Path, skill_name: str) -> None:
    installer = repo / "skills" / f"{skill_name}-install" / "scripts" / "install.py"
    if not installer.is_file():
        print(f"未找到本地安装器：{installer}，跳过本地安装")
        return
    subprocess.run(
        [sys.executable, str(installer), "--source-zip", str(archive), "--skill-name", skill_name, "--force"],
        check=True,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Build and publish the Auto Space skill archive.")
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parent.parent)
    parser.add_argument("--skill-name", default="auto-space-ppt")
    parser.add_argument("--deck", type=Path, help="deck project used to rebuild assets/starter.zip")
    parser.add_argument("--skill-src", type=Path, help="skill source folder to mirror into the repo")
    parser.add_argument("--no-starter", action="store_true", help="keep the existing starter.zip")
    parser.add_argument("--push", action="store_true", help="commit and push to origin")
    parser.add_argument("-m", "--message", help="commit message")
    parser.add_argument("--local-install", action="store_true", help="install the new archive on this machine")
    args = parser.parse_args()

    repo = args.repo_root.resolve()
    skill_dir = repo / "skills" / args.skill_name
    if not skill_dir.is_dir():
        parser.error(f"仓库内不存在技能目录：{skill_dir}")

    deck = (args.deck or repo.parent / "auto-space-deck").expanduser()
    skill_src = (args.skill_src or repo.parent / args.skill_name).expanduser()
    if not skill_src.is_dir() or not (skill_src / "SKILL.md").is_file():
        skill_src = skill_dir

    if not args.no_starter:
        if not deck.is_dir():
            parser.error(f"找不到演示稿工程目录：{deck}（可用 --deck 指定，或加 --no-starter 跳过）")
        if not (deck / "src" / "slides.tsx").is_file():
            parser.error(f"{deck} 不像演示稿工程（缺少 src/slides.tsx）")

    print(f"仓库：{repo}")
    print(f"技能源：{skill_src}")
    if not args.no_starter:
        print(f"演示稿工程：{deck}")

    mirror_skill(skill_src, skill_dir)
    if not args.no_starter:
        build_starter(deck, skill_dir / "assets" / "starter.zip")

    archive = repo / f"{args.skill_name}-skill.zip"
    build_skill_zip(skill_dir, archive)
    digest = sha256(archive)
    print(f"SHA256：{digest}")
    print(f"发布时间：{datetime.now():%Y-%m-%d %H:%M:%S}")

    if args.push:
        publish(repo, archive.name, args.message, digest)
    else:
        print("未推送。加 --push 提交并推送，装过该技能的机器会在下次每日同步时自动更新。")

    if args.local_install:
        local_install(repo, archive, args.skill_name)
    return 0


if __name__ == "__main__":
    sys.exit(main())
