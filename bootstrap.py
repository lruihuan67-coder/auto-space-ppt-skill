#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""auto-space-ppt 技能包引导器（幂等安装）。

用法：
    python bootstrap.py --workspace <工作区绝对路径>
    python bootstrap.py --workspace <工作区绝对路径> --version v1.0.0 --force
    python bootstrap.py --workspace <工作区绝对路径> --verify

约定：
    - 只从本仓库（GitHub 官方地址）下载，并用 SHA256SUMS 校验；不一致立即退出。
    - 不写死版本目录名：运行时路径一律从 current.json 读取。
    - 旧的运行时目录保留一版，用于回滚。
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path

REPO = "lruihuan67-coder/auto-space-ppt-skill"
SKILL_NAME = "auto-space-ppt"
ASSET = "auto-space-ppt-skill.zip"
BUNDLE_ID = ".spaceagents/plugins/auto-space-ppt"
CLI_ENTRY = "scripts/new_deck.py"
VERIFY_FILES = ["SKILL.md", "assets/starter.zip"]


def log(msg: str) -> None:
    print(msg, flush=True)


def http_get(url: str, dest: Path | None = None, timeout: int = 180, retries: int = 3) -> bytes | None:
    last = None
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "auto-space-bootstrap"})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                data = resp.read()
            if dest is not None:
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(data)
                return None
            return data
        except Exception as exc:  # noqa: BLE001
            last = exc
            if attempt < retries:
                time.sleep(2)
    raise last  # type: ignore[misc]


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _version_key(tag: str) -> list[int]:
    parts = tag.lstrip("v").split(".")
    return [int(p) if p.isdigit() else 0 for p in parts]


def resolve_version(explicit: str | None) -> str:
    if explicit:
        return explicit if explicit.startswith("v") else "v" + explicit
    try:
        out = subprocess.run(
            ["git", "ls-remote", "--tags", f"https://github.com/{REPO}"],
            capture_output=True, text=True, timeout=40,
        )
        tags = set()
        for line in out.stdout.splitlines():
            ref = line.split("\t")[-1].strip()
            if ref.startswith("refs/tags/") and not ref.endswith("^{}"):
                tags.add(ref[len("refs/tags/"):])
        if tags:
            return sorted(tags, key=_version_key)[-1]
    except Exception:
        pass
    try:
        txt = http_get(f"https://raw.githubusercontent.com/{REPO}/main/VERSION")
        return (txt or b"").decode("utf-8").strip() or "v0.0.0"
    except Exception:
        return "v0.0.0"


def download_asset(version: str, dest: Path) -> str:
    urls = [
        f"https://github.com/{REPO}/releases/download/{version}/{ASSET}",
        f"https://raw.githubusercontent.com/{REPO}/{version}/{ASSET}",
    ]
    last_error = None
    for url in urls:
        try:
            log(f"下载 {url}")
            http_get(url, dest)
            return url
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            log(f"  失败：{exc}")
    raise SystemExit(f"下载失败，已尝试全部官方地址。最后错误：{last_error}")


def expected_sha(version: str) -> str | None:
    try:
        txt = http_get(f"https://raw.githubusercontent.com/{REPO}/{version}/SHA256SUMS")
    except Exception:
        return None
    for line in (txt or b"").decode("utf-8-sig", "replace").splitlines():
        parts = line.split()
        if len(parts) >= 2 and parts[-1].lstrip("*") == ASSET:
            return parts[0].lower()
    return None


def read_current(bundle: Path) -> dict | None:
    path = bundle / "current.json"
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def verify(bundle: Path) -> int:
    cur = read_current(bundle)
    if not cur:
        log("未安装：缺少 current.json")
        return 2
    root = Path(cur.get("skill_root") or cur.get("runtime_root", ""))
    failed = []
    if not root.is_dir():
        failed.append(f"技能目录不存在：{root}")
    for rel in VERIFY_FILES:
        target = root / rel
        if not target.exists():
            failed.append(f"缺少 {rel}")
        elif target.stat().st_size == 0:
            failed.append(f"{rel} 为空文件")
    if failed:
        log("校验失败：")
        for item in failed:
            log(f"  - {item}")
        return 1
    log(f"校验通过：{SKILL_NAME} {cur.get('version')} @ {root}")
    log(f"  入口：{root / 'SKILL.md'}")
    log(f"  CLI：{cur.get('cli')}")
    return 0


def install(workspace: Path, bundle_id: str, version: str | None, force: bool, quiet: bool) -> int:
    bundle = workspace / bundle_id
    target_version = resolve_version(version)
    cur = read_current(bundle)
    if cur and target_version == "v0.0.0" and cur.get("version"):
        target_version = cur["version"]
        log(f"版本探测失败，沿用已安装版本：{target_version}")
    log(f"目标版本：{target_version}")

    if cur and not force:
        root = Path(cur.get("skill_root") or cur.get("runtime_root", ""))
        if cur.get("version") == target_version and root.is_dir() and (root / "SKILL.md").exists():
            log(f"已安装且完整（{target_version}），跳过下载。")
            return 0

    tmp = Path(tempfile.mkdtemp(prefix="as-bootstrap-"))
    try:
        zip_path = tmp / ASSET
        download_asset(target_version, zip_path)
        actual = sha256_file(zip_path)
        expect = expected_sha(target_version)
        if not expect:
            raise SystemExit("无法获取官方 SHA256SUMS，按纪律停止（不使用无校验来源）。")
        if actual != expect:
            raise SystemExit(f"SHA-256 校验失败\n期望：{expect}\n实际：{actual}")
        log(f"SHA-256 校验通过：{actual}")

        extract_dir = tmp / "x"
        with zipfile.ZipFile(zip_path) as zf:
            zf.extractall(extract_dir)
        src = extract_dir / SKILL_NAME
        if not (src / "SKILL.md").exists():
            raise SystemExit(f"压缩包结构异常：缺少 {SKILL_NAME}/SKILL.md")

        runtime = bundle / "runtime" / target_version
        staging = bundle / "runtime" / (target_version + ".staging")
        if staging.exists():
            shutil.rmtree(staging)
        staging.mkdir(parents=True, exist_ok=True)
        shutil.copytree(src, staging / SKILL_NAME)

        if runtime.exists():
            backup = bundle / "runtime" / (target_version + ".old")
            if backup.exists():
                shutil.rmtree(backup)
            runtime.rename(backup)
        staging.rename(runtime)

        cli_target = runtime / SKILL_NAME / CLI_ENTRY
        cli = f"python {cli_target}" if CLI_ENTRY else "python bootstrap.py --verify"
        data = {
            "version": target_version,
            "runtime_root": str(runtime),
            "skill_root": str(runtime / SKILL_NAME),
            "cli": cli,
            "installed_at": datetime.now(timezone.utc).isoformat(),
            "source": f"https://github.com/{REPO}",
            "asset": ASSET,
            "sha256": actual,
        }
        bundle.mkdir(parents=True, exist_ok=True)
        (bundle / "current.json").write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        if not quiet:
            log(f"已安装：{SKILL_NAME} {target_version}")
            log(f"  runtime_root：{runtime}")
            log(f"  current.json：{bundle / 'current.json'}")
        return 0
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass
    parser = argparse.ArgumentParser(description=f"{SKILL_NAME} 引导器")
    parser.add_argument("--workspace", required=True, help="工作区根目录（安装与指针落点）")
    parser.add_argument("--bundle-id", default=BUNDLE_ID, help="安装落点（相对工作区）")
    parser.add_argument("--version", default=None, help="指定 tag，默认取最新")
    parser.add_argument("--force", action="store_true", help="忽略幂等判断，强制重装")
    parser.add_argument("--verify", action="store_true", help="只校验已安装内容")
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args()

    workspace = Path(args.workspace).expanduser().resolve()
    if not workspace.is_dir():
        raise SystemExit(f"工作区不存在：{workspace}")
    bundle = workspace / args.bundle_id

    if args.verify:
        return verify(bundle)
    return install(workspace, args.bundle_id, args.version, args.force, args.quiet)


if __name__ == "__main__":
    raise SystemExit(main())
