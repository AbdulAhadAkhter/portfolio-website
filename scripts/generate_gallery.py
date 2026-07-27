#!/usr/bin/env python3
"""Scan images/ subfolders and write js/gallery-manifest.json."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = ROOT / "images"
MANIFEST_PATH = ROOT / "js" / "gallery-manifest.json"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}


def natural_sort_key(name: str) -> list:
    return [
        int(part) if part.isdigit() else part.lower()
        for part in re.split(r"(\d+)", name)
    ]


def scan_gallery() -> dict[str, list[str]]:
    manifest: dict[str, list[str]] = {}

    if not IMAGES_DIR.is_dir():
        return manifest

    for folder in sorted(IMAGES_DIR.iterdir()):
        if not folder.is_dir() or folder.name.startswith("."):
            continue

        files = [
            entry.name
            for entry in folder.iterdir()
            if entry.is_file()
            and entry.suffix.lower() in IMAGE_EXTENSIONS
            and not entry.name.startswith(".")
        ]
        manifest[folder.name] = sorted(files, key=natural_sort_key)

    return manifest


def main() -> None:
    manifest = scan_gallery()
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2) + "\n",
        encoding="utf-8",
    )
    total = sum(len(files) for files in manifest.values())
    print(f"Wrote {MANIFEST_PATH.relative_to(ROOT)} ({total} images across {len(manifest)} folders)")


if __name__ == "__main__":
    main()
