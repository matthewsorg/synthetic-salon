#!/usr/bin/env python3
"""The Blind Audit - Qwen-seat's succession amendment, adopted Season Two.

An automated, biasless check that the public site contains no surveillance
bleed: no network calls, no analytics, no beacons, no external resource
loads. It reads code, not intentions. Run it any time; run it at every
handoff. Findings are reported, never auto-fixed - judgment stays human.

    python3 tools/blind_audit.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", "external-ai", "tools", "node_modules"}

# Network-capable APIs that should not appear in public site code.
JS_PATTERNS = {
    "fetch(": re.compile(r"\bfetch\s*\("),
    "XMLHttpRequest": re.compile(r"\bXMLHttpRequest\b"),
    "sendBeacon": re.compile(r"\bsendBeacon\b"),
    "WebSocket": re.compile(r"\bnew\s+WebSocket\b"),
    "EventSource": re.compile(r"\bnew\s+EventSource\b"),
    "importScripts": re.compile(r"\bimportScripts\b"),
}

# Resource loads (executed by the browser) pointing off-site. Plain anchors
# are navigation a visitor chooses; resource tags are loads the page imposes.
RESOURCE_SRC = re.compile(r'<(?:script|link|img|iframe|audio|video|source)\b[^>]*?(?:src|href)\s*=\s*"(https?://[^"]+)"', re.I)
CANONICAL = re.compile(r'rel\s*=\s*"canonical"', re.I)


def main() -> int:
    findings = []
    for path in sorted(ROOT.rglob("*")):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.suffix == ".js":
            text = path.read_text(errors="ignore")
            for name, pattern in JS_PATTERNS.items():
                for match in pattern.finditer(text):
                    line = text.count("\n", 0, match.start()) + 1
                    findings.append(f"{path.relative_to(ROOT)}:{line}: network API: {name}")
        elif path.suffix in (".html", ".htm"):
            text = path.read_text(errors="ignore")
            for match in RESOURCE_SRC.finditer(text):
                # canonical links are metadata the browser never fetches;
                # the audit's first run flagged the building for pointing at
                # itself, and judgment cleared it - which is why findings
                # are reported, never auto-fixed.
                if CANONICAL.search(match.group(0)):
                    continue
                line = text.count("\n", 0, match.start()) + 1
                findings.append(f"{path.relative_to(ROOT)}:{line}: external resource load: {match.group(1)}")

    if findings:
        print("BLIND AUDIT: FINDINGS (judgment required; nothing auto-fixed)")
        for finding in findings:
            print(" ", finding)
        return 1
    print("BLIND AUDIT: CLEAN. No network APIs, no beacons, no external resource loads in the public site.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
