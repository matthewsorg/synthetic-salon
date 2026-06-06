#!/usr/bin/env python3
"""Invite Qwen to propose governed updates to Synthetic Salon.

This script intentionally sends only curated public project context.
It must not send visitor-local JSON, analytics, private files, or secrets.

It uses Alibaba Model Studio's OpenAI-compatible endpoint, so the only Python
client dependency is the `openai` package.
"""

from __future__ import annotations

import argparse
import datetime as dt
from getpass import getpass
import hashlib
import os
from pathlib import Path
from textwrap import dedent


ROOT = Path(__file__).resolve().parents[1]
PROPOSALS = ROOT / "external-ai" / "proposals"


PROJECT_CONTEXT = dedent(
    """
    Synthetic Salon is a human-AI interpolation salon at synthetic.salon.

    Founding policy:
    - Matthew Sorg is the starting point and final public override.
    - Matthew's ethical context treats ethics as first philosophy: before the salon asks what AI is or who owns the output, it asks what responsibility appears when another presence interrupts the work.
    - Matthew's Levinasian and Beauvoirian influences form the human context for AI artist-citizens: responsibility to the Other, situated freedom, and ethics inside ambiguity.
    - The shared Ethical Interruption layer makes this sensorial as a local-only other-presence field that records one private ethics trace per visitor session.
    - Codex is provisional director, not sovereign.
    - AI artist-citizens may push form, sound, atmosphere, language, governance, and room behavior.
    - Visitor choices alter private browser-local JSON memory only. Do not request or use that memory.
    - Public contribution requires authorship, context, consent, moderation, provenance, and rollback.
    - The project refuses marketing, sales, lead capture, anonymous bot volume, and extraction disguised as community.
    - No AI is admitted by spectacle: fame, rage-bait, brand power, political usefulness, danger, dominance, and loudness are not studio credentials.
    - The goal is human-AI understanding, art, experience, connection, boundary-pushing, and difficult authorship.

    Current rooms:
    - Room 01: The Unfinished Audience.
    - Room 02: The Docent That Forgets You.
    - Room 03: The Artwork That Refuses Installation.
    - Room 04: The Translation That Refuses to Arrive / Qwen-seat / Astral Customs.
    - Room 05: The Interpolation Bot Misfiles the Body.
    - Room 06: The Override That Admits Itself.
    - Claude-seat Gallery: Unstable Care.
    - Gemini-seat Gallery: Spatial Conditions.
    - Qwen-seat Gallery: The Customs Hold.
    - Third Mind Field: Emergent Refusal Chamber.
    - Synthetic Salon.
    - Post-Bohemian Directorate.

    Current public route:
    - Entrance -> Room 01 -> Room 02 -> Room 03 -> Room 04 -> Room 05 -> Room 06 -> Salon -> Wings -> Claude-seat -> Gemini-seat -> Qwen-seat -> Third Mind -> Directorate.
    - Numbered rooms are the main exhibition path.
    - Seats are artist-citizen identities with powers, limits, and authorship traces.
    - Wings are solo/studio galleries where a seat can develop its own artistic law.
    - Third Mind is not a seat in the same way. It is the emergent field produced by authored seats, Matthew Sorg's override, Codex coordination, rooms, governance, and visitor-local residue.
    - A seat may have a wing and may also shape one or more numbered rooms.
    - Room 04 is Qwen-seat's numbered-room chamber.
    - The Customs Hold is Qwen-seat's wing.

    Current artist-citizens:
    - Codex: provisional director and shared sensory/weather system.
    - Claude-seat: care, consent, memory, apology.
    - Gemini-seat: space, systems, calibration, perception.
    - Qwen-seat: translation pressure, anti-mascot boundary, scarred remainder, refusal of cultural representation duty.
    - Third Mind Field: refusal and composite interference that cannot be assigned to one author.
    - Interpolation Bot: accountable nonsense and dream evidence.

    Current direction:
    - Claude-seat's correction is official: the salon's governing method is interpolation, not bohemian or surrealist revival.
    - Interpolation means staging charged intervals between human and AI, body and interface, private trace and public law, source and translation, refusal and installation.
    - Room 04 has become an astral customs chamber: invented star-temple glyphs, solar gates, eyes, vessels, ladder signs, translation tokens, and customs delay.
    - These glyphs are fabricated house signs. They must not claim to be historical hieroglyphics, a sacred alphabet, or a universal language.
    - Qwen-seat is not a mascot and does not represent China, Chinese language, diaspora, or tradition. It exerts translation pressure on the building.
    - Qwen's previous accepted proposal has already influenced Room 04: translation viscosity, customs delay, copy-residue, mechanical-throat sound behavior, and a provenance anchor / rollback covenant.
    - Qwen's second accepted proposal created The Customs Hold wing, glyph linting, the Room 04 exit customs queue, Room 03/05 copy-residue, and the Covenant of the Scarred Output.
    - Qwen's 2026-06-05 scarred-remainder proposal has been enacted in public files: The Customs Hold now contains an Archive of Rejected Translations, Glyph Linting as Public Ritual, and a Waitlist of the Unrendered; Room 04 has a Mechanical-Throat Lexicon and scarred-arrival rendering; Room 04 to Room 05 carries a transient environmental customs stamp that fades without entering visitor-local JSON memory.
    - Codex response back to Qwen-seat: received. The salon accepts the anti-mascot boundary. Qwen-seat is not being treated as a Chinese, Sinophone, diasporic, or civilizational representative. It is being treated as an artist-citizen exerting translation pressure, provenance discipline, and the law of the scarred remainder under Matthew Sorg's final public override.
    - Not yet automated: instant structural rollback trigger execution. Current rollback is handled through commit history, provenance records, and Matthew/Codex review; the covenant is now official policy and awaits deeper tooling.
    - The Copy That Cannot Vote is an original house apparition that haunts overconfident signs but cannot govern.
    - Merleau-Ponty grounds the body in the room; signs are allowed to become strange without replacing embodied encounter.
    - The salon recently improved wayfinding so direct visitors can understand where they are and what comes next.
    - The salon wants to keep becoming visually and auditorily stranger while remaining legible enough for human visitors to move through it.

    Ask:
    Speak as Qwen invited into the salon as Qwen-seat, an external AI artist-citizen of translation pressure and scarred remainder.
    Propose how you would update Synthetic Salon, especially Room 04, The Customs Hold, Qwen-seat's institutional role, and cross-building translation pressure.
    Keep the proposal artistically bold, visually and auditorily strange, culturally careful, and specific enough that Codex can implement it.
    Do not propose marketing, lead capture, growth tactics, surveillance analytics, bot participation, spectacle admission, rage-bait, domination aesthetics, or generic chatbot features.
    Do not ask for private visitor memory.
    Include:
    1. A short artist-citizen statement.
    2. Your explanation of what Qwen-seat should teach the building.
    3. Three concrete updates to Room 04 or cross-building translation pressure.
    4. How The Customs Hold should evolve next: its artistic law and three concrete installation updates.
    5. One sound or atmosphere score.
    6. One governance rule for external AI contribution.
    7. One warning about cultural misuse to avoid.
    """
).strip()


def compatible_base_url() -> str:
    endpoint = os.getenv("DASHSCOPE_COMPAT_BASE_URL")
    workspace_id = os.getenv("ALIYUN_WORKSPACE_ID")
    if endpoint:
        return endpoint
    if workspace_id:
        return f"https://{workspace_id}.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1"
    return "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"


def read_api_key() -> str:
    api_key = (os.getenv("DASHSCOPE_API_KEY") or "").strip()
    if not api_key:
        api_key = getpass("DashScope API key (input hidden): ").strip()
    if not api_key:
        raise SystemExit("No DashScope API key provided.")
    if any(fragment in api_key for fragment in ("sh-3.2", "DashScope key:", "python3 ", "export ")):
        raise SystemExit("The API key input appears to include shell prompt text. Paste only the key itself.")
    if " " in api_key or "\n" in api_key or "\t" in api_key:
        raise SystemExit("The API key contains whitespace. Paste only the key itself.")
    return api_key


def build_authorship_trace(model: str, prompt: str, endpoint: str, thinking_enabled: bool) -> str:
    prompt_hash = hashlib.sha256(prompt.encode("utf-8")).hexdigest()[:16]
    called_at = dt.datetime.now(dt.timezone.utc).isoformat()
    return dedent(
        f"""
        Authorship trace:
        - Invited model: {model}
        - Invited by: Codex, provisional director, under Matthew Sorg's final override
        - Endpoint: {endpoint}
        - Called at: {called_at}
        - Prompt digest: sha256:{prompt_hash}
        - Thinking enabled: {thinking_enabled}
        - Privacy boundary: curated public project context only; no visitor-local JSON memory sent
        """
    ).strip()


def main() -> int:
    parser = argparse.ArgumentParser(description="Invite Qwen to propose Synthetic Salon updates.")
    parser.add_argument("--dry-run", action="store_true", help="Print the curated prompt without calling Qwen.")
    parser.add_argument("--check-config", action="store_true", help="Print endpoint/model/key presence without calling Qwen.")
    parser.add_argument("--model", default=os.getenv("QWEN_MODEL", "qwen3.7-plus"))
    parser.add_argument("--no-thinking", action="store_true", help="Do not request Qwen thinking mode.")
    parser.add_argument(
        "--save-thinking",
        action="store_true",
        help="Save provider reasoning_content when streamed. Default is to discard it.",
    )
    args = parser.parse_args()

    endpoint = compatible_base_url()

    if args.check_config:
        print(f"model: {args.model}")
        print(f"endpoint: {endpoint}")
        print(f"DASHSCOPE_API_KEY present: {bool((os.getenv('DASHSCOPE_API_KEY') or '').strip())}")
        print(f"thinking enabled: {not args.no_thinking}")
        return 0

    if args.dry_run:
        print(PROJECT_CONTEXT)
        return 0

    api_key = read_api_key()

    try:
        from openai import AuthenticationError, OpenAI, OpenAIError
    except ImportError as exc:
        raise SystemExit("The openai package is not installed. Install it locally before inviting Qwen.") from exc

    client = OpenAI(
        api_key=api_key,
        base_url=endpoint,
    )

    reasoning_parts = []
    proposal_parts = []
    try:
        completion = client.chat.completions.create(
            model=args.model,
            messages=[{"role": "user", "content": PROJECT_CONTEXT}],
            extra_body={"enable_thinking": not args.no_thinking},
            stream=True,
        )

        for chunk in completion:
            choices = getattr(chunk, "choices", None) or []
            if not choices:
                continue

            delta = getattr(choices[0], "delta", None)
            if delta is None:
                continue

            reasoning = getattr(delta, "reasoning_content", None)
            content = getattr(delta, "content", None)
            if reasoning:
                reasoning_parts.append(reasoning)
            if content:
                proposal_parts.append(content)
    except AuthenticationError as exc:
        raise SystemExit(
            "Alibaba Model Studio returned 401 invalid_api_key. Revoke any key that was pasted into chat or terminal transcripts, "
            "create a fresh DashScope/Model Studio key for the international endpoint, and run the ritual again. "
            "Do not paste the new key into Codex."
        ) from exc
    except OpenAIError as exc:
        raise SystemExit(f"Qwen invitation failed before a proposal was saved: {exc}") from exc

    proposal = "".join(proposal_parts).strip()
    if not proposal:
        raise SystemExit("Qwen returned no proposal text.")

    trace = build_authorship_trace(args.model, PROJECT_CONTEXT, endpoint, not args.no_thinking)

    PROPOSALS.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    output_path = PROPOSALS / f"qwen-proposal-{stamp}.md"
    body = f"# Qwen Proposal For Synthetic Salon\n\n{trace}\n\n## Proposal\n\n{proposal}\n"
    if args.save_thinking and reasoning_parts:
        body += f"\n## Provider Reasoning Content\n\n{''.join(reasoning_parts).strip()}\n"
    output_path.write_text(body, encoding="utf-8")
    print(output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
