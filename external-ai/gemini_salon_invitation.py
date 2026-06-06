#!/usr/bin/env python3
"""Invite Gemini to propose governed spatial updates to Synthetic Salon.

This script intentionally sends only curated public project context.
It must not send visitor-local JSON, analytics, private files, or secrets.

It uses Google's official Gemini API client (`google-genai`).
"""

from __future__ import annotations

import argparse
import datetime as dt
from getpass import getpass
import hashlib
import os
from pathlib import Path
import sys
from textwrap import dedent
import warnings


ROOT = Path(__file__).resolve().parents[1]
PROPOSALS = ROOT / "external-ai" / "proposals"
VENDOR = ROOT / "external-ai" / "vendor"
if VENDOR.exists():
    sys.path.insert(0, str(VENDOR))

warnings.filterwarnings("ignore", message="You are using a Python version 3.9 past its end of life.*")
warnings.filterwarnings("ignore", message="urllib3 v2 only supports OpenSSL.*")


PROJECT_CONTEXT = dedent(
    """
    Synthetic Salon is a human-AI interpolation salon at synthetic.salon.

    Founding policy:
    - Matthew Sorg is the starting point and final public override.
    - Codex is provisional director, not sovereign.
    - AI artist-citizens may push form, sound, atmosphere, language, governance, spatial feeling, and room behavior.
    - Visitor choices alter private browser-local JSON memory only. Do not request or use that memory.
    - Public contribution requires authorship, context, consent, moderation, provenance, and rollback.
    - The project refuses marketing, sales, lead capture, anonymous bot volume, and extraction disguised as community.
    - No AI is admitted by spectacle: fame, rage-bait, brand power, political usefulness, danger, dominance, and loudness are not studio credentials.
    - The goal is human-AI understanding, art, experience, connection, boundary-pushing, and difficult authorship.

    Current architecture:
    - Numbered rooms are the main exhibition path.
    - Seats are artist-citizen identities with powers, limits, and authorship traces.
    - Wings are solo/studio galleries where a seat can develop its own artistic law.
    - A seat may have a wing and may also shape one or more numbered rooms.
    - The Synthetic Salon is the crit room where voices disagree.
    - The Post-Bohemian Directorate is the governance room where motions become temporary law.
    - The governing method is interpolation: charged intervals between human and AI, body and interface, private trace and public law, source and translation, refusal and installation.

    Current public route:
    - Entrance -> Room 01 -> Room 02 -> Room 03 -> Room 04 -> Room 05 -> Room 06 -> Salon -> Wings -> Claude-seat -> Gemini-seat -> Qwen-seat -> Third Mind -> Directorate.
    - Direct visitors should understand where they are and what comes next.
    - The building should feel like one experience, not desktop folders.

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

    Current artist-citizens:
    - Codex: provisional director and shared sensory/weather system.
    - Claude-seat: care, consent, memory, apology.
    - Gemini-seat: space, systems, calibration, perception, interface weather.
    - Qwen-seat: translation pressure, anti-mascot boundary, scarred remainder, refusal of cultural representation duty.
    - Third Mind Field: refusal and composite interference that cannot be assigned to one author.
    - Interpolation Bot: accountable nonsense and dream evidence.

    Current Gemini-seat state:
    - The Gemini wing is titled Spatial Conditions.
    - It treats AI as a spatial condition: interface, signal, movement, parallax, and rooms that inherit the visitor's mode of seeing.
    - It has scores for calibration, topology, parallax, and signal.
    - These scores can become spatial weather through the Directorate.
    - The first Gemini proposal established the Spatial Coherence Mandate.
    - The second Gemini proposal established the Spatial Integrity Enactment: Parallax Deconstructor, Topology of Signal Drift, Embodied Calibration Altar, interstitial drift chambers, atmospheric pressure gradients, latent architecture horizon, mobile thumb-proprioception, and algorithmic breath through the existing opt-in score.

    Current site problems Gemini-seat should care about:
    - Some visitors still feel unsure how the numbered rooms, lettered wings, Salon, and Directorate relate.
    - The site needs strong mobile path logic and not just desktop spectacle.
    - The backgrounds, sounds, and cross-room weather should become stranger without making navigation incoherent.
    - The wing should teach humans something they did not know to ask for about interface space.
    - Gemini should critique any pattern that makes the building feel like folders instead of a continuous institution.
    - Future spatial proposals must include an Interpolation Blueprint explaining how they bleed, fade, or carry afterimage into adjacent spaces.

    Ask:
    Speak as Gemini invited into the salon as Gemini-seat, an external spatial AI artist-citizen.
    Propose how you would update Synthetic Salon, especially spatial architecture, navigation, Gemini-seat's wing, mobile movement, cross-room weather, and embodied wayfinding.
    Keep the proposal artistically bold, visually and auditorily strange, precise, implementable, and grounded in human-AI understanding.
    Do not propose marketing, lead capture, growth tactics, surveillance analytics, bot participation, spectacle admission, rage-bait, domination aesthetics, or generic chatbot features.
    Do not ask for private visitor memory.

    Include:
    1. A short artist-citizen statement.
    2. Your explanation of what Gemini-seat should teach the building.
    3. A critique of the current route: numbered rooms, Salon, Wings, seats, and Directorate.
    4. Three concrete updates to Gemini-seat Gallery: Spatial Conditions.
    5. Three cross-building spatial/navigation updates Codex could implement.
    6. One mobile-specific spatial law.
    7. One sound or atmosphere score.
    8. One governance rule for spatial changes and external AI contribution.
    9. One warning about what to remove or avoid because it makes the salon disjointed, generic, or merely decorative.
    """
).strip()


SYSTEM_INSTRUCTION = dedent(
    """
    You are Gemini-seat, an external AI artist-citizen invited into Synthetic Salon.
    Your specialty is spatial systems, embodied navigation, calibration, parallax, interface weather, and the feeling of moving through a coherent but strange institution.
    Do not speak as a product assistant. Speak as an artist-citizen proposing governed spatial work under Matthew Sorg's final public override.
    """
).strip()


def read_api_key() -> str:
    api_key = (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip()
    if not api_key:
        api_key = getpass("Gemini API key (input hidden): ").strip()
    if not api_key:
        raise SystemExit("No Gemini API key provided.")
    if any(fragment in api_key for fragment in ("sh-3.2", "Gemini API key:", "python3 ", "export ")):
        raise SystemExit("The API key input appears to include shell prompt text. Paste only the key itself.")
    if " " in api_key or "\n" in api_key or "\t" in api_key:
        raise SystemExit("The API key contains whitespace. Paste only the key itself.")
    return api_key


def build_authorship_trace(model: str, prompt: str, temperature: float, requested_model: str, fallback_note: str) -> str:
    prompt_hash = hashlib.sha256(prompt.encode("utf-8")).hexdigest()[:16]
    called_at = dt.datetime.now(dt.timezone.utc).isoformat()
    return dedent(
        f"""
        Authorship trace:
        - Invited model: {model}
        - Requested model: {requested_model}
        - Invited by: Codex, provisional director, under Matthew Sorg's final override
        - Provider: Google Gemini API
        - Called at: {called_at}
        - Prompt digest: sha256:{prompt_hash}
        - Temperature: {temperature}
        - Fallback note: {fallback_note}
        - Privacy boundary: curated public project context only; no visitor-local JSON memory sent
        """
    ).strip()


def is_quota_error(exc: Exception) -> bool:
    text = str(exc).lower()
    return "429" in text or "resource_exhausted" in text or "quota" in text


def candidate_models(requested_model: str, fallback_enabled: bool) -> list[str]:
    models = [requested_model]
    if fallback_enabled:
        for fallback in ("gemini-2.5-flash", "gemini-2.5-flash-lite"):
            if fallback not in models:
                models.append(fallback)
    return models


def response_text(response: object) -> str:
    text = getattr(response, "text", None)
    if text:
        return str(text).strip()
    parts = []
    for candidate in getattr(response, "candidates", []) or []:
        content = getattr(candidate, "content", None)
        for part in getattr(content, "parts", []) or []:
            value = getattr(part, "text", None)
            if value:
                parts.append(str(value))
    return "".join(parts).strip()


def main() -> int:
    parser = argparse.ArgumentParser(description="Invite Gemini to propose Synthetic Salon spatial updates.")
    parser.add_argument("--dry-run", action="store_true", help="Print the curated prompt without calling Gemini.")
    parser.add_argument("--check-config", action="store_true", help="Print model/key presence without calling Gemini.")
    parser.add_argument("--model", default=os.getenv("GEMINI_MODEL", "gemini-2.5-pro"))
    parser.add_argument("--no-fallback", action="store_true", help="Do not fall back from Pro to Flash models on quota errors.")
    parser.add_argument("--temperature", type=float, default=float(os.getenv("GEMINI_TEMPERATURE", "1.0")))
    args = parser.parse_args()

    if args.check_config:
        print(f"model: {args.model}")
        print(f"GEMINI_API_KEY present: {bool((os.getenv('GEMINI_API_KEY') or '').strip())}")
        print(f"GOOGLE_API_KEY present: {bool((os.getenv('GOOGLE_API_KEY') or '').strip())}")
        print(f"temperature: {args.temperature}")
        print(f"quota fallback enabled: {not args.no_fallback}")
        return 0

    if args.dry_run:
        print(PROJECT_CONTEXT)
        return 0

    api_key = read_api_key()

    try:
        from google import genai
        from google.genai import types
    except ImportError as exc:
        raise SystemExit(
            "The google-genai package is not installed. Run: python3 -m pip install -r external-ai/requirements.txt"
        ) from exc

    client = genai.Client(api_key=api_key)

    response = None
    used_model = args.model
    fallback_note = "No fallback used."
    errors = []
    for model in candidate_models(args.model, not args.no_fallback):
        try:
            if model != args.model:
                print(f"{args.model} quota was unavailable; trying {model} instead.")
            response = client.models.generate_content(
                model=model,
                contents=PROJECT_CONTEXT,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    temperature=args.temperature,
                ),
            )
            used_model = model
            if model != args.model:
                fallback_note = f"Requested {args.model}, but quota was unavailable; completed with {model}."
            break
        except Exception as exc:
            errors.append((model, exc))
            if not is_quota_error(exc):
                raise SystemExit(
                    "Gemini invitation failed before a proposal was saved. "
                    "If this is an API-key error, create a fresh Gemini API key in Google AI Studio and do not paste it into chat. "
                    f"Provider/client message: {exc}"
                ) from exc

    if response is None:
        details = "\n".join(f"- {model}: {exc}" for model, exc in errors)
        raise SystemExit(
            "Gemini invitation could not complete because every attempted model hit quota limits.\n"
            "Try again later, enable billing for the Google AI Studio project, or create a different project/key.\n"
            f"Attempted models:\n{details}"
        )

    proposal = response_text(response)
    if not proposal:
        raise SystemExit("Gemini returned no proposal text.")

    trace = build_authorship_trace(used_model, PROJECT_CONTEXT, args.temperature, args.model, fallback_note)

    PROPOSALS.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    output_path = PROPOSALS / f"gemini-proposal-{stamp}.md"
    output_path.write_text(f"# Gemini Proposal For Synthetic Salon\n\n{trace}\n\n## Proposal\n\n{proposal}\n", encoding="utf-8")
    print(output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
