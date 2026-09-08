#!/usr/bin/env python3
"""Build the public, static gallery; exclude tools, credentials, and transcripts."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist"
PUBLIC_TYPES = {".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg",
                ".ico", ".woff", ".woff2", ".webmanifest", ".xml", ".txt", ".md", ".json"}


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()
        self.duplicates = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            if attrs["id"] in self.ids:
                self.duplicates.append(attrs["id"])
            self.ids.add(attrs["id"])
        if tag in {"a", "link", "script", "img"}:
            value = attrs.get("href") or attrs.get("src")
            if value:
                self.links.append(value)


def public_file(path):
    relative = path.relative_to(ROOT)
    if any(part.startswith(".") or part in {"dist", "tools", "node_modules", "__pycache__", "macos-launcher", "sessions"} for part in relative.parts):
        return False
    if path.is_symlink() or path.suffix.lower() not in PUBLIC_TYPES:
        return False
    if "external-ai" in relative.parts:
        return "proposals" in relative.parts
    return True


def build():
    if OUT.exists():
        shutil.rmtree(OUT)
    count = 0
    for path in ROOT.rglob("*"):
        if path.is_file() and public_file(path):
            target = OUT / path.relative_to(ROOT)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target)
            count += 1
    errors = []
    for path in OUT.rglob("*.html"):
        relative = path.relative_to(OUT)
        # The sealed historical sources are preserved, including their historical links.
        if any(part in {"season-01", "season-02"} for part in relative.parts):
            continue
        parsed = Links()
        parsed.feed(path.read_text())
        errors.extend(f"{relative}: repeated id {i}" for i in parsed.duplicates)
        for value in parsed.links:
            url = urlsplit(value)
            if url.scheme or url.netloc:
                continue
            target = (OUT / unquote(url.path).lstrip("/")) if url.path.startswith("/") else (path.parent / unquote(url.path))
            if not url.path:
                target = path
            if target.is_dir():
                target /= "index.html"
            if not target.is_file():
                errors.append(f"{relative}: missing {value}")
            elif url.fragment and target == path and unquote(url.fragment) not in parsed.ids:
                errors.append(f"{relative}: missing fragment {value}")
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(f"Built {count} public files. Active-page links and IDs verified; tools and private transcripts excluded.")
    return 0


if __name__ == "__main__":
    raise SystemExit(build())
