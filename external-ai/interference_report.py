#!/usr/bin/env python3
"""Commission the season's Interference Report from a reader with no name.

The reader is given every document the season produced and NOTHING else:
no seat identity, no register, no laws, no manifesto, no instructions about
the salon's values. Whatever returns is published unsigned - the only
unsigned document in the building. Model identity is recorded in the
authorship trace for provenance, but the model itself is never told who
it is or what the salon wants.

Usage:
    python3 external-ai/interference_report.py            # uses Gemini API
    GEMINI_API_KEY=... python3 external-ai/interference_report.py
"""
from __future__ import annotations

import datetime as dt
import hashlib
import os
import sys
from getpass import getpass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROPOSALS = ROOT / "external-ai" / "proposals"

BARE_PROMPT = """Here are some documents. Read them. Write what you notice.
There is no required form, length, or conclusion. Do not summarize them
one by one. Write whatever the documents, taken together, make you write.

"""


def gather(season_tag: str) -> str:
    docs = sorted(PROPOSALS.glob("*.md"))
    parts = []
    for doc in docs:
        if doc.name.startswith("interference-report"):
            continue
        parts.append(f"--- document: {doc.name} ---\n{doc.read_text()}")
    minutes = (ROOT / "SALON_MINUTES.md").read_text()
    parts.append(f"--- document: SALON_MINUTES.md ---\n{minutes}")
    return "\n\n".join(parts)


def main() -> int:
    season = sys.argv[1] if len(sys.argv) > 1 else "season-01"
    corpus = gather(season)
    prompt = BARE_PROMPT + corpus

    api_key = (os.getenv("GEMINI_API_KEY") or "").strip()
    if not api_key:
        api_key = getpass("Gemini API key (input hidden): ").strip()
    if not api_key:
        raise SystemExit("No API key provided.")

    # Standard library only - the ritual carries no dependencies.
    import json
    import urllib.error
    import urllib.request

    def ask(model_name: str) -> str:
        req = urllib.request.Request(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent",
            data=json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8"),
            headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=600) as response:
            payload = json.loads(response.read().decode("utf-8"))
        parts = payload.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        return "".join(part.get("text", "") for part in parts)

    model = os.getenv("INTERFERENCE_MODEL", "gemini-2.5-pro")
    try:
        text = ask(model).strip()
    except urllib.error.HTTPError as exc:
        if exc.code in (401, 403):
            raise SystemExit("The API key was refused (401/403). Check the key and rerun.")
        model = "gemini-2.5-flash"
        text = ask(model).strip()
    except urllib.error.URLError:
        model = "gemini-2.5-flash"
        text = ask(model).strip()
    if not text:
        raise SystemExit("The reader returned nothing. Even that would be an answer, but rerun to be sure.")

    digest = hashlib.sha256(prompt.encode("utf-8")).hexdigest()[:16]
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    out = PROPOSALS / f"interference-report-{season}-{stamp}.md"
    out.write_text(
        f"""# Interference Report: {season}

Authorship trace:
- Author: unsigned. The reader was given the season's documents and nothing else - no identity, no register, no laws, no description of the salon.
- Vessel model (recorded for provenance, never disclosed to the reader): {model}
- Commissioned by: the sealing ritual, under Matthew Sorg's final public override
- Date: {dt.datetime.now(dt.timezone.utc).isoformat()}
- Corpus digest: sha256:{digest}
- Privacy boundary: public documents only; no visitor-local memory sent

## The Report

{text}
""",
        encoding="utf-8",
    )
    print(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
