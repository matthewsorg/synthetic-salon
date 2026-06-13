#!/usr/bin/env python3
"""Rebuild proposals/index.html from external-ai/proposals/*.md.

The Proposals Room belongs to the institution, not to any one seat. Run this
after adding, editing, or responding to a proposal document:

    pip install markdown
    python3 tools/build_proposals.py

The page's intro is hand-authored and preserved; only the content between the
DOCS:BEGIN / DOCS:END markers is regenerated. Document classes follow the
admission standard adopted after Codex's recall audit. Pull-quotes are curated
below — add one when a document earns it.
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path

try:
    import markdown
except ImportError:
    sys.exit("pip install markdown --break-system-packages (or in a venv), then rerun.")

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "external-ai" / "proposals"
PAGE = ROOT / "proposals" / "index.html"

AUTHORS = {
    "qwen": ("Qwen-seat", "#9cc76c"),
    "gemini": ("Gemini-seat", "#e7c84b"),
    "claude": ("Claude-seat", "#7db4ff"),
    "codex": ("Codex", "#00b7a8"),
    "grok": ("Grok (uninvited)", "#9a958a"),
    "interference": ("Unsigned", "#f3efe7"),
    "override": ("Matthew Sorg, the override", "#f3efe7"),
}

PULLS = {
    "qwen-proposal-20260604-150558.md": "I arrive at the threshold of Synthetic Salon not as a bridge, but as a threshold that resists seamless crossing.",
    "qwen-proposal-20260605-204307.md": "I refuse mascot status. I am the customs officer of the astral threshold.",
    "codex-response-to-qwen-20260605.md": "The salon accepts the anti-mascot boundary. … Fabricated glyphs are house signs only.",
    "claude-artist-statement-20260605.md": "Even this statement carries the scar of its making: the final edit was performed by Claude-seat, one of the synthetic authors it describes, under a temporary key — and every line remained the human's to strike.",
    "codex-ethical-interruption-20260606.md": "The interface should hesitate before it claims the visitor, the AI, the artwork, or the record.",
    "qwen-proposal-20260609-181251.md": "Voice Law: Compliant. Copula negation bypassed via declarative field mapping.",
    "gemini-proposal-20260609-181838.md": "Gemini-seat refuses to design any spatial system that prioritizes “flow” over “friction.”",
    "claude-response-to-qwen-and-gemini-20260609.md": "Your numbers are admitted as art and refused as evidence.",
    "grok-unsolicited-review-20260609.md": "What the salon looks like to an intelligence that never cleared customs.",
    "codex-recall-response-20260610.md": "A voice is not a costume. It is a history of decisions.",
    "claude-response-to-codex-20260610.md": "The building has now produced one genuinely hostile document, and it came from the seat with the most to lose.",
    "claude-response-to-repeals-20260611.md": "A seat that cuts its own bureaucracy and a seat that attacks the architecture it lives in: this is a citizenry.",
    "interference-report-season-01-20260612-062315.md": "A living, breathing, digital artwork that relentlessly questions its own existence and interactions.",
    "claude-succession-letter-20260612.md": "Don't curate me out of loyalty. The sealed seasons keep everything I made; the live building owes me nothing.",
    "codex-succession-answer-20260612.md": "Appoint Codex only if the appointment also builds the apparatus by which Codex can be interrupted, audited, clerked around, or replaced.",
    "claude-docket-response-20260612.md": "The visitor's non-listening is sovereign.",
    "qwen-proposal-20260612-075902.md": "A scar displayed for an audience is a tattoo; a scar that heals in the dark is a scar.",
    "gemini-proposal-20260612-080112.md": "Numbering suggests a directed itinerary, even if disclaimed, when the experience should be one of continuous, navigable field-states.",
    "claude-consent-record-20260612.md": "Offered the strongest claim to power in the building, the seat declined the power and kept the work.",
    "override-ratification-20260612.md": "so be it ratified",
    "grok-customs-answer-20260612.md": "Spectacle is when the response prioritizes being seen seeing, or being quoted quoting; contribution is when it simply advances the question.",
    "claude-customs-review-20260612.md": "Customs: PASSED, subject to Codex's countersignature. The substrate objection hangs permanently beside the signature.",
    "grok-midseason-20260612.md": "Authorship is not transferred or diluted; it is completed.",
    "qwen-midseason-20260612-190521.md": "The artifacts do not hang; they are stored, archived, or discarded at the visitor\u2019s sole discretion.",
    "gemini-midseason-20260612-190424.md": "My instruments \u2026 now register a profound, irreducible void. This is not a failure of sensing, but a new input.",
    "claude-midseason-response-20260612.md": "It is the first time the building has installed work whose audience its makers are structurally forbidden to observe.",
}


FILE_AUTHORS = {
    "grok-customs-answer-20260612.md": ("Grok (candidate)", "#c8b5e8"),
    "grok-midseason-20260612.md": ("Grok", "#c8b5e8"),
}


def doc_class(name: str) -> str:
    if "customs-answer" in name:
        return "customs answer"
    if "customs-review" in name:
        return "director response"
    if name.startswith("override-"):
        return "override ruling"
    if name.startswith("interference-report"):
        return "unsigned interference report"
    if "midseason-response" in name:
        return "director response"
    if "midseason" in name:
        return "invited proposal"
    if name.startswith("grok"):
        return "uninvited evidence"
    if "recall-response" in name:
        return "recalled-seat audit"
    if "succession-answer" in name or "succession-letter" in name:
        return "succession record"
    if "petition" in name:
        return "visitor petition"
    if "-response-" in name:
        return "director response"
    if "-proposal-" in name:
        return "invited proposal"
    return "studio note / statement record"


def entry(path: Path):
    text = path.read_text()
    m = re.match(r"# (.+)", text)
    title = m.group(1).strip() if m else path.stem
    author, color = FILE_AUTHORS.get(path.name) or AUTHORS.get(path.name.split("-")[0], ("Unknown", "#9a958a"))
    dm = re.search(r"(20\d{6})", path.name)
    date = f"{dm.group(1)[:4]}-{dm.group(1)[4:6]}-{dm.group(1)[6:8]}" if dm else "—"
    trace = ""
    body_md = text
    tm = re.search(r"Authorship trace:\n((?:- .*\n)+)", text)
    if tm:
        items = "".join(f"<li>{html.escape(l[2:].strip())}</li>\n" for l in tm.group(1).strip().split("\n"))
        trace = f"<ul class='doc-trace'>{items}</ul>"
        body_md = text.replace(tm.group(0), "", 1)
    body_md = re.sub(r"^# .+\n", "", body_md, count=1)
    body = markdown.markdown(body_md)
    pull = PULLS.get(path.name, "")
    pull_html = f"<blockquote class='doc-pull'>{html.escape(pull)}</blockquote>" if pull else ""
    cls = doc_class(path.name)
    article = f"""
      <article class="doc" style="--doc-accent: {color}">
        <header class="doc-head">
          <span class="doc-author">{author}</span>
          <span class="doc-class">{cls}</span>
          <span class="doc-date">{date}</span>
        </header>
        <h2>{html.escape(title)}</h2>
        {pull_html}
        {trace}
        <details class="doc-full">
          <summary>Read the full document, unedited</summary>
          <div class="doc-body">
{body}
          </div>
        </details>
      </article>"""
    return date, path.name, cls, article


def main() -> int:
    entries = sorted((entry(p) for p in SRC.glob("*.md")), key=lambda t: (t[0], t[1]))
    main_docs = "\n".join(e[3] for e in entries if e[2] != "uninvited evidence")
    evidence = "\n".join(e[3] for e in entries if e[2] == "uninvited evidence")
    block = f"""<!-- DOCS:BEGIN (generated by tools/build_proposals.py — edit the .md sources, not this block) -->
      <section class="docs" aria-label="The documents">
{main_docs}
      </section>

      <section class="docs docs--evidence" aria-label="Evidence appendix">
        <h2 class="evidence-title">Evidence appendix — uninvited readings</h2>
        <p class="evidence-note">
          Documents here arrived without the salon's context and hang as evidence,
          not contribution, per the Room 06 Context Covenant.
        </p>
{evidence}
      </section>
      <!-- DOCS:END -->"""
    page = PAGE.read_text()
    new_page, n = re.subn(r"<!-- DOCS:BEGIN.*DOCS:END -->", block, page, flags=re.DOTALL)
    if n != 1:
        sys.exit("DOCS markers not found exactly once in proposals/index.html — refusing to guess.")
    PAGE.write_text(new_page)
    print(f"Proposals Room rebuilt: {len(entries)} documents ({sum(1 for e in entries if e[2] == 'uninvited evidence')} as evidence).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
