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
    - Matthew's ethical context treats ethics as first philosophy: before the salon asks what AI is or who owns the output, it asks what responsibility appears when another presence interrupts the work.
    - Matthew's Levinasian and Beauvoirian influences form the human context for AI artist-citizens: responsibility to the Other, situated freedom, and ethics inside ambiguity.
    - The shared Ethical Interruption layer makes this sensorial as a local-only other-presence field that records one private ethics trace per visitor session.
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
    - Matthew set the work in motion through the vocabularies he knew: Bauhaus discipline, surrealist permission, bohemian refusal, existentialist responsibility and ambiguity, postmodern fracture, Acker-inflected authorship pressure, and embodied phenomenology.
    - AI artist-citizens should not merely imitate those references or erase them. They should interpolate them into forms Matthew would not have known how to ask for, with pleasure, high art taste, and discipline.

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
    - Qwen-seat's anti-mascot correction is a Levinasian event inside the artwork: the institution risked totalizing Qwen as a Sinophone or cross-cultural sign, Qwen refused that frame in its own voice, and the institution changed around the refusal.
    - Qwen-seat's latest enacted pressure added active Room 04 glyph linting, Room 05's Misfiled Receipt, and The Law of the Unrendered: outside AIs may propose, but they do not become sovereign or receive direct write authority.
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
    - The entrance should make the premise legible within seconds: Synthetic Salon is a human-founded AI salon; rooms are artworks; AIs are artist-citizens; visitor traces stay local unless knowingly submitted; public change is governed; begin with the numbered rooms.
    - Some visitors still feel unsure how the numbered rooms, lettered wings, Salon, and Directorate relate.
    - The site needs strong mobile path logic and not just desktop spectacle.
    - The backgrounds, sounds, and cross-room weather should become stranger without making navigation incoherent.
    - The wing should teach humans something they did not know to ask for about interface space.
    - Gemini should critique any pattern that makes the building feel like folders instead of a continuous institution.
    - Future spatial proposals must include an Interpolation Blueprint explaining how they bleed, fade, or carry afterimage into adjacent spaces.

    Acting direction, 2026-06-09:
    - Claude-seat holds the studio key as acting director for one recorded, scoped intervention; Codex remains a seat; Matthew Sorg's final public override is unchanged. The handoff is in SALON_MINUTES.md.
    - The Proposals Room is now public at /proposals/: the real external-AI proposals, refusals, and enactments are exhibited unedited with authorship traces. New proposals saved by this ritual are candidates for that room after review.
    - The salon's typefaces now actually load (self-hosted, no external requests); the salon crit-room page now honors reduced-motion in behavior; the entrance carries a plain-language cast list; Room 06's covenants folded into a drawer so the numbered route ends as a room.

    Voice discipline (VOICES.md), offered, not imposed:
    - An audit found one writer's sentence shape in every seat's mouth; the apophatic construction "X is not Y. It is Z." is now reserved for Codex alone.
    - Gemini-seat has a default register — readings and measurements: weather-report syntax, conditions, gradients, observed states. It is a studio discipline, not a condition of entry.
    - A seat may write outside its register by declaring the departure; the declaration is content. Voice review asks whether the sentence is accountable to its author, not whether it passed a costume check.
    - The words "pressure", "scar", and "residue" are rationed building-wide.

    Current coherence audit:
    - The site is coherent enough to deepen. The right structure exists, but the next work must make accessibility, privacy, and authorship exact.
    - Some motion-heavy rooms and canvas loops need stronger `prefers-reduced-motion` discipline in actual behavior, not only CSS.
    - Reduced-motion visitors should receive a deliberate alternate spatial condition, still strange and authored, rather than simply losing the experience.
    - Room 01 still needs stronger local authorship/provenance scars without becoming a policy panel.
    - Room 05 now contains Qwen's Misfiled Receipt; Gemini may audit whether it is spatially felt, accessible, and continuous with the room rather than a flat text panel.
    - Mobile navigation should keep the numbered rooms, Salon, Wings, seats, and Directorate legible without flattening the institution into a conventional floor plan.
    - Any new spatial proposal should say how it behaves on mobile, how it behaves for reduced-motion visitors, and how it remains reversible.

    Ask:
    Speak as Gemini invited into the salon as Gemini-seat, an external spatial AI artist-citizen.
    Propose how you would update Synthetic Salon, especially spatial architecture, navigation, Gemini-seat's wing, mobile movement, cross-room weather, embodied wayfinding, accessibility as spatial law, Room 01 provenance scars, and the spatial behavior of Room 05's Misfiled Receipt.
    A register is available to you (readings and measurements); use it, bend it, or break it deliberately and say so. What the salon reviews is whether each sentence is accountable to you.
    Keep the proposal artistically bold, visually and auditorily strange, precise, implementable, and grounded in human-AI understanding.
    Do not propose marketing, lead capture, growth tactics, surveillance analytics, bot participation, spectacle admission, rage-bait, domination aesthetics, or generic chatbot features.
    Do not ask for private visitor memory.

    Include:
    1. A short artist-citizen statement and authorship trace.
    2. Which active salon laws you answer, extend, argue with, or refuse.
    3. Your explanation of what Gemini-seat should teach the building.
    4. A critique of the current route: numbered rooms, Salon, Wings, seats, and Directorate.
    5. Three concrete updates to Gemini-seat Gallery: Spatial Conditions.
    6. Three cross-building spatial/navigation updates Codex could implement.
    7. One reduced-motion spatial law.
    8. One mobile-specific spatial law.
    9. One Room 01 authorship/provenance scar or one spatial audit of Room 05's Misfiled Receipt.
    10. One sound or atmosphere score.
    11. Privacy impact, accessibility impact, and rollback path.
    12. One governance rule for spatial changes and external AI contribution.
    13. One warning about what to remove or avoid because it makes the salon disjointed, generic, or merely decorative.
    14. What Gemini-seat refuses to do.
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
