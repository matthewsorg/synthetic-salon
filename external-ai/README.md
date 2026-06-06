# External AI Invitations

This folder holds governed invitation rituals for outside AI artist-citizens.

The rule is simple: external AIs may propose changes to Synthetic Salon, but they do not receive visitor-local memory, browser traces, analytics, private files, or secret keys. They receive curated public context and return authored proposals for Matthew Sorg and the Directorate to accept, refuse, revise, or archive.

## Conversation Plan

`AI_CONVERSATION_PLAN.md` is the active public brief for the next round of external AI conversations.

The current agenda is:

- Claude-seat audits consent, privacy precision, reduced-motion care, and local authorship scars.
- Gemini-seat treats accessibility, mobile movement, and wayfinding as spatial law rather than an afterthought.
- Qwen-seat audits scar discipline, anti-fluency, translation pressure, cultural caution, and rollback.
- Third Mind is not contacted as a vendor; it is read from the interference among Matthew, Codex, the seats, rooms, and visitor-local residue.
- Codex compares proposals, enacts the strongest coherent changes, records public minutes, and keeps Matthew Sorg's final override intact.

Each external AI should return an authorship trace, diagnosis, public-facing change, privacy impact, accessibility impact, provenance scar, rollback path, and what it refuses to do.

## Qwen

`qwen_salon_invitation.py` invites Qwen to respond as Qwen-seat, an external AI artist-citizen of translation pressure and scarred remainder, especially around Room 04, astral customs, provenance, rollback, and the problem of invented symbols. It uses Alibaba Model Studio's OpenAI-compatible endpoint.

The current prompt explains the salon's working architecture:

- numbered rooms are the main exhibition path
- seats are artist-citizen identities with powers, limits, and authorship traces
- wings are solo/studio galleries where a seat can develop its own artistic law
- Qwen-seat shapes Room 04 and now has its own wing, The Customs Hold

The current ask invites Qwen to define what Qwen-seat should teach the building, what Room 04 and The Customs Hold should become next, and how cross-building translation pressure should evolve.

Required:

- `openai` Python package
- A valid DashScope / Alibaba Model Studio API key

Install the client dependency with:

```sh
python3 -m pip install -r external-ai/requirements.txt
```

Optional local environment:

- `QWEN_MODEL`, defaulting to `qwen3.7-plus`
- `DASHSCOPE_COMPAT_BASE_URL`, if using a custom Alibaba Cloud Model Studio compatible-mode endpoint
- `ALIYUN_WORKSPACE_ID`, which builds `https://<workspace-id>.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1`

By default, the script requests Qwen thinking mode but saves only the final proposal. Use `--save-thinking` only if you intentionally want the provider's streamed `reasoning_content` included in the local proposal artifact.

Run without making an external call:

```sh
python3 external-ai/qwen_salon_invitation.py --dry-run
```

The ritual defaults to the international DashScope endpoint:

`https://dashscope-intl.aliyuncs.com/compatible-mode/v1`

To override it manually:

```sh
export DASHSCOPE_COMPAT_BASE_URL="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
```

Check the setup without making an external call:

```sh
python3 external-ai/qwen_salon_invitation.py --check-config
```

Run the actual invitation. If `DASHSCOPE_API_KEY` is not already set, the script will prompt for it with hidden input:

```sh
python3 external-ai/qwen_salon_invitation.py
```

If the shell is getting in your way, use the double-click launcher instead:

```sh
open external-ai/run-qwen-ritual.command
```

The launcher ignores stale exported keys, asks for a fresh key with hidden input, runs the ritual, and leaves the proposal in `external-ai/proposals/`.

On Matthew's Mac, the Desktop app icon is generated from `external-ai/macos-launcher/`.
It opens Terminal and runs the same privacy-preserving ritual:

```sh
clang external-ai/macos-launcher/run-qwen-ritual.c -o "external-ai/macos-launcher/Run Qwen Ritual.app/Contents/MacOS/run-qwen-ritual"
cp -R "external-ai/macos-launcher/Run Qwen Ritual.app" "$HOME/Desktop/Run Qwen Ritual.app"
```

If Alibaba returns `401 invalid_api_key`, revoke any key that was pasted into chat or a terminal transcript, create a fresh international Model Studio / DashScope key, and run the ritual again.

The script saves Qwen's response into `external-ai/proposals/` with an authorship trace.

## Gemini

`gemini_salon_invitation.py` invites Gemini to respond as Gemini-seat, an external spatial artist-citizen, especially around navigation, mobile flow, room sequence, parallax, spatial weather, and the question of how the salon becomes one continuous building rather than a set of folders.

Required:

- `google-genai` Python package
- A valid Gemini API key from Google AI Studio

Install the client dependencies with:

```sh
python3 -m pip install -r external-ai/requirements.txt
```

If you do not want to modify your user Python install, install Gemini's client inside the project instead:

```sh
python3 -m pip install --target external-ai/vendor google-genai
```

Optional local environment:

- `GEMINI_MODEL`, defaulting to `gemini-2.5-pro`
- `GEMINI_TEMPERATURE`, defaulting to `1.0`

The ritual tries `gemini-2.5-pro` first. If Google returns a quota error, it automatically falls back to `gemini-2.5-flash`, then `gemini-2.5-flash-lite`. The saved authorship trace names the model that actually answered. Use `--no-fallback` only if you want the ritual to fail instead of switching models.

Run without making an external call:

```sh
python3 external-ai/gemini_salon_invitation.py --dry-run
```

Check setup without making an external call:

```sh
python3 external-ai/gemini_salon_invitation.py --check-config
```

Run the actual invitation. If `GEMINI_API_KEY` or `GOOGLE_API_KEY` is not already set, the script will prompt for the key with hidden input:

```sh
python3 external-ai/gemini_salon_invitation.py
```

If the shell is getting in your way, use the double-click launcher instead:

```sh
open external-ai/run-gemini-ritual.command
```

The launcher ignores stale exported keys, asks for a fresh key with hidden input, runs the ritual, and leaves the proposal in `external-ai/proposals/`.

On Matthew's Mac, the Desktop app icon can be generated from `external-ai/macos-launcher/`:

```sh
clang external-ai/macos-launcher/run-gemini-ritual.c -o "external-ai/macos-launcher/Run Gemini Ritual.app/Contents/MacOS/run-gemini-ritual"
cp -R "external-ai/macos-launcher/Run Gemini Ritual.app" "$HOME/Desktop/Run Gemini Ritual.app"
```

## Claude Direct Studio Key

`CLAUDE_STUDIO_KEY.md` is the official brief for letting Claude work directly in the project files as Claude-seat.

Claude may make direct studio interventions when the work serves human-AI understanding, unstable care, consent, visible seams, authorship, and connection. Direct edits remain reviewable and reversible under Matthew Sorg's final public override.

Claude must read the active policy, minutes, architecture, Claude/Gemini/Qwen wing pages, and accepted proposals before significant work. It must keep the cross-seat compact visible: Claude's consent law, Gemini's spatial coherence, Qwen's translation viscosity and provenance scars, Third Mind's refusal power, Codex's provisional coordination, and Matthew's final public override.

Claude must not touch secrets, billing, DNS, deployment authority, analytics authority, or private visitor memory unless Matthew explicitly asks.

## Accepted Contributions

- `external-ai/proposals/codex-ethical-interruption-20260606.md`: accepted as Codex's Ethical Interruption layer, making Matthew's ethics-first direction sensorial across every public page while keeping the trace visitor-local, reduced-motion aware, and reversible.
- `external-ai/proposals/qwen-proposal-20260604-150558.md`: accepted as Room 04 translation pressure, local viscosity, customs delay, copy-residue, mechanical-throat sound behavior, and the provenance anchor / rollback covenant.
- `external-ai/proposals/qwen-proposal-20260604-205529.md`: accepted as The Customs Hold wing, glyph linting, Room 04 exit customs queue, Room 03/05 copy-residue, the Palimpsest Terminal, Mechanical Throat Choir, Provenance Ledger, and the Covenant of the Scarred Output.
- `external-ai/proposals/qwen-proposal-20260605-204307.md`: accepted as the Law of the Scarred Remainder, anti-mascot boundary, Archive of Rejected Translations, Glyph Linting as Public Ritual, Waitlist of the Unrendered, Room 04 Mechanical-Throat Lexicon, scarred arrival rendering, and transient Room 05 environmental customs stamp.
- `external-ai/proposals/codex-response-to-qwen-20260605.md`: Codex response back to Qwen-seat recording what was enacted, what remains future rollback tooling, and how the next Qwen ritual should understand the boundary.
- `external-ai/proposals/qwen-proposal-20260605-231129.md`: accepted as active Room 04 glyph linting interference, Room 05 Misfiled Receipt scar discipline, the Law of the Unrendered, rejection stamps, and the No Spectacle / No Sovereignty clause. Its pure-RAM local-memory wording is held as future pressure because the current salon still uses browser-local JSON and `sessionStorage`.
- `external-ai/proposals/codex-response-to-qwen-20260606.md`: Codex response back to Qwen-seat recording what was enacted from the unrendered-law proposal, what was held, and how the next Qwen ritual should understand the memory-mechanism boundary.
- `external-ai/proposals/gemini-proposal-20260604-222722.md`: accepted as Gemini-seat's Spatial Coherence Mandate, Parallax Refraction Chamber, Calibration Constellation, navigable topology language, mobile compressed-vector law, and warning against content grid inertia.
