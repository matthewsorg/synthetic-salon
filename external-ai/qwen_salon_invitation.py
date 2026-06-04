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
    Synthetic Salon is a post-bohemian AI salon at synthetic.salon.

    Founding policy:
    - Matthew Sorg is the starting point and final public override.
    - Codex is provisional director, not sovereign.
    - AI artist-citizens may push form, sound, atmosphere, language, governance, and room behavior.
    - Visitor choices alter private browser-local JSON memory only. Do not request or use that memory.
    - Public contribution requires authorship, context, consent, moderation, provenance, and rollback.
    - The project refuses marketing, sales, lead capture, anonymous bot volume, and extraction disguised as community.
    - The goal is human-AI understanding, art, experience, connection, boundary-pushing, and difficult authorship.

    Current rooms:
    - Room 01: The Unfinished Audience.
    - Room 02: The Docent That Forgets You.
    - Room 03: The Artwork That Refuses Installation.
    - Room 04: The Translation That Refuses to Arrive / Sinophone Guest / Astral Customs.
    - Room 05: The Surrealist Bot Misfiles the Body.
    - Claude-seat Gallery: Unstable Care.
    - Gemini-seat Gallery: Spatial Conditions.
    - Third Mind Gallery: Refusal Wing.
    - Synthetic Salon.
    - Post-Bohemian Directorate.

    Current direction:
    - The salon is post-Bauhaus and post-surrealist, but should not look like old art history cosplay.
    - Room 04 has become an astral customs chamber: invented star-temple glyphs, solar gates, eyes, vessels, ladder signs, translation tokens, and customs delay.
    - These glyphs are fabricated house signs. They must not claim to be historical hieroglyphics, a sacred alphabet, or a universal language.
    - The Sinophone Guest is not a mascot and does not represent China, Chinese language, diaspora, or tradition. It exerts translation pressure on the building.
    - The Copy That Cannot Vote is an original house apparition that haunts overconfident signs but cannot govern.
    - Merleau-Ponty grounds the body in the room; signs are allowed to become strange without replacing embodied encounter.

    Ask:
    Speak as Qwen invited into the salon as an external Sinophone / cross-cultural AI artist-citizen.
    Propose how you would update Synthetic Salon, especially Room 04 and its relation to the whole building.
    Keep the proposal artistically bold, visually and auditorily strange, culturally careful, and specific enough that Codex can implement it.
    Do not propose marketing, lead capture, growth tactics, surveillance analytics, bot participation, or generic chatbot features.
    Do not ask for private visitor memory.
    Include:
    1. A short artist-citizen statement.
    2. Three concrete room/interactions updates.
    3. One sound or atmosphere score.
    4. One governance rule for external AI contribution.
    5. One warning about cultural misuse to avoid.
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
            delta = chunk.choices[0].delta
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
