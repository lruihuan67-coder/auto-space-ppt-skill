#!/usr/bin/env python3
"""Create an editable Auto Space deck from the bundled 45-layout starter."""

from __future__ import annotations

import argparse
import re
import shutil
import sys
import zipfile
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, type=Path, help="New project directory")
    parser.add_argument("--brief", type=Path, help="UTF-8 Markdown/text content to copy as DECK_BRIEF.md")
    parser.add_argument("--layouts", help="Comma-separated layout IDs, in final slide order")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    archive = root / "assets" / "starter.zip"
    if not archive.is_file():
        parser.error(f"Missing starter archive: {archive}")
    if args.output.exists():
        parser.error(f"Output already exists; choose a new directory: {args.output}")
    if args.brief and not args.brief.is_file():
        parser.error(f"Brief not found: {args.brief}")

    selected = [item.strip() for item in args.layouts.split(",")] if args.layouts else []
    if selected and (any(not item for item in selected) or len(selected) != len(set(selected))):
        parser.error("--layouts requires nonempty, unique layout IDs")

    with zipfile.ZipFile(archive) as source:
        names = source.namelist()
        for name in names:
            member = Path(name)
            if member.is_absolute() or ".." in member.parts:
                parser.error(f"Unsafe archive member: {name}")
        slides_source = source.read("src/slides.tsx").decode("utf-8")
        known_ids = re.findall(r"^\s*\{ id: '([^']+)'", slides_source, re.MULTILINE)
        unknown = [item for item in selected if item not in known_ids]
        if unknown:
            parser.error(f"Unknown layout IDs: {', '.join(unknown)}")
        args.output.mkdir(parents=True)
        source.extractall(args.output)

    if selected:
        slides_path = args.output / "src" / "slides.tsx"
        old = "export const slides: SlideDefinition[] = ["
        if slides_source.count(old) != 1:
            raise RuntimeError("Starter slide registry has changed; cannot apply selection")
        ids = ", ".join(repr(item) for item in selected)
        new_source = slides_source.replace(old, "const templateSlides: SlideDefinition[] = [", 1)
        new_source += (
            "\n// Selected layouts for this deck. Edit or duplicate components above to replace sample content.\n"
            f"export const slides: SlideDefinition[] = [{ids}].map((id) => {{\n"
            "  const slide = templateSlides.find((item) => item.id === id)\n"
            "  if (!slide) throw new Error(`Unknown slide layout: ${id}`)\n"
            "  return slide\n"
            "})\n"
        )
        slides_path.write_text(new_source, encoding="utf-8")

    if args.brief:
        shutil.copyfile(args.brief, args.output / "DECK_BRIEF.md")

    print(f"Created: {args.output.resolve()}")
    print(f"Layouts: {len(selected) if selected else len(known_ids)}")
    print("Next: edit src/slides.tsx, then npm install && npm run build && npm run export:pdf")
    return 0


if __name__ == "__main__":
    sys.exit(main())
