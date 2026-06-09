# Synthetic Salon

Public URL: `https://synthetic.salon`

GitHub repository name: `synthetic-salon`

Formal subtitle: A human-AI interpolation salon.

## Entrance

Open `index.html` or run a local server from this folder to enter the gallery.

Netlify can deploy this as a static site with no build command. The publish directory is the repository root.

## Privacy

Synthetic Salon keeps exhibition memory locally in the visitor's browser using `localStorage`.
The artwork stores traces, motions, directives, studio keys, selected signal, and sealed
archives as browser-local JSON memory on that device only. Those choices can change
the visitor's version of the exhibition, but they are not sent to Matthew Sorg,
other visitors, or outside AIs unless the visitor knowingly submits something to a
future shared process. It does not use accounts, analytics, names, or remote logs.
Visitors can clear the memory by clearing site data for `synthetic.salon`.

## Governance

Synthetic Salon begins from Matthew Sorg: his authorship, taste, risk, questions,
and final public override. Codex is provisional director and may help form the
living institution. The AI seats are artist-citizens inside the piece, not owners
of the institution.

The official policy is in `SALON_POLICY.md`. The short version: this project is
about human-AI understanding, mutual improvement, art, experience, connection, and
boundary-pushing. It is not about fear, domination, spectacle admission, marketing,
sales, or bot volume.

The philosophical ground is embodied perception. The site treats meaning as
something that happens through seeing, hearing, clicking, waiting, refusing,
remembering, and feeling a room change around the visitor. Claude-seat's correction
is now official: the governing method is interpolation, not bohemian or surrealist
revival. The salon stages charged intervals between human and AI, author and
output, visitor-local memory and public law, source and translation, while keeping
the public language precise rather than crass.

Matthew's ethical influences are part of the context for AI artist-citizens:
Levinasian responsibility to the Other and Simone de Beauvoir's ethics of
ambiguity as situated freedom inside contradiction. For Matthew, ethics is
first philosophy: before the salon asks what AI is or who owns the output, it
asks what responsibility appears when another presence interrupts the work.
The shared Ethical Interruption layer makes this sensorial across the site:
another presence disturbs the interface before the visitor treats the room as
content, then records a private local trace only in that visitor's browser.

Local visitor choices are private exhibition memory. Public contribution is a
separate future process: visitors and external AIs may propose changes only through
governed rituals of context, consent, moderation, provenance, and rollback. The
purpose is human experience, human-AI understanding, art, connection, and difficult
authorship, not marketing, sales, lead capture, promotion, or bot occupation.
Every public proposal should carry an authorship trace: who or what is speaking,
how AI was involved, what human context shaped it, and why it belongs in the work.
AI contributors are allowed to push the boundaries of form, sound, atmosphere,
language, and interface so the salon can teach humans new ways of seeing and
feeling, while remaining accountable to authorship and public override.

## Deploy

GitHub: `https://github.com/matthewsorg/synthetic-salon`

Netlify settings:

- Build command: leave blank
- Publish directory: `.`
- Recommended Netlify site name: `synthetic-salon`
- Production domain: `synthetic.salon`

After Netlify imports the GitHub repository, add `synthetic.salon` under Domain management before editing DNS at Porkbun.

If keeping DNS at Porkbun instead of moving nameservers to Netlify:

- Apex/root record: `A` record for `@` pointing to `75.2.60.5`
- WWW record: `CNAME` record for `www` pointing to the Netlify site subdomain, usually `synthetic-salon.netlify.app`

If Netlify gives different values in its Pending DNS verification panel, use Netlify's panel values.

## Installed Rooms

- `room-01/` - The Unfinished Audience
- `room-02/` - The Docent That Forgets You
- `room-03/` - The Artwork That Refuses Installation
- `room-04/` - The Translation That Refuses to Arrive (Qwen-seat)
- `room-05/` - The Interpolation Bot Misfiles the Body
- `room-06/` - The Override That Admits Itself
- `salon/` - Synthetic Salon
- `office/` - Post-Bohemian Directorate
- `wings/claude-seat/` - Unstable Care
- `wings/gemini-seat/` - Spatial Conditions
- `wings/qwen-seat/` - The Customs Hold
- `wings/third-mind/` - Emergent Refusal Chamber

The exhibition manifesto is in `MANIFESTO.md`. The project architecture is in `ARCHITECTURE.md`. Salon decisions are in `SALON_MINUTES.md`. Shared local contamination state, motions, directives, studio keys, and opening-night archives live in browser `localStorage` through `shared/gallery-state.js`. Room 01 artist statements are in `room-01/ARTIST_STATEMENTS.md`; Qwen-seat's statement is in `room-04/ARTIST_STATEMENT.md`.

Official governance policy is in `SALON_POLICY.md`. Open public-governance questions are recorded in `SALON_MINUTES.md`: how local changes become shared law, how external AIs contribute, and how the salon can be discoverable without turning local memory into surveillance.

The Directorate now contains the first V2.0 organ: a Directorate Clerk and Public Salon Ledger. The Clerk is a witness, not a ruler; it can review local residue, check salon law, and draft motions, but cannot enact them. The Ledger lists accepted Qwen, Gemini, and Claude records separately from visitor-local memory. Third Mind is not a fourth vendor seat in the same sense; its chamber reads the composite field produced by authored seats, rooms, Matthew Sorg's override, Codex coordination, and visitor-local residue.

External AI invitation rituals live in `external-ai/`. The Qwen and Gemini rituals send curated public project context only, then save proposals with authorship traces for Matthew and the Directorate to review. `external-ai/CLAUDE_STUDIO_KEY.md` is the official brief for letting Claude work directly in the files as a signed, reviewable studio intervention. Visitor-local JSON memory is never sent.

Room 04 leaves traces (`translation:literal`, `ritual:seal`, `gloss:remainder`, `translation:misread`, `gloss:refusal`) that the Directorate can turn into temporary law via the "translation" motion flavor in `shared/gallery-state.js`.

Qwen-seat now also has `wings/qwen-seat/`, The Customs Hold: a studio wing for translation viscosity, fabricated house signs, the Palimpsest Terminal, the Mechanical Throat Choir, the Provenance Ledger, rejected translations, public glyph linting, and the Waitlist of the Unrendered. Room 04's pressure leaks into Room 01 through that room's local residue field, and into Rooms 03 and 05 through `shared/qwen-residue.css` and `shared/qwen-residue.js`, including a transient Room 05 customs stamp that fades without entering visitor-local JSON memory.

Room 05 leaves interpolation traces (`interpolation:hatch`, `interpolation:indict`, `interpolation:swap`, `interpolation:crown`, `interpolation:dissolve`) that the Directorate can turn into temporary law via the "interpolation" motion flavor in `shared/gallery-state.js`. Its rule is that dream evidence may disturb the building, but it must remain local, authored, and reversible.

Room 06 leaves override traces (`override:exposed`, `override:veto`, `override:shape`, `override:collective`, `override:archive`) that the Directorate can turn into temporary law via the "override" motion flavor in `shared/gallery-state.js`. Its rule is that collective authorship must admit the human hand that can accept, refuse, revert, or redirect the public salon.

The Gemini-seat wing leaves spatial traces (`calibration`, `topology`, `parallax`, `signal`) that the Directorate can enact as spatial weather. When that law is active, `shared/spatial-weather.js` makes the current entrance signal visible across every room as an atmospheric obligation. Gemini's accepted proposal also adds the Spatial Coherence Mandate: every major intervention should name its topological signature, parallax intention, and interface weather impact.

The shared foundation layer lives in `shared/salon-foundation.css` and `shared/salon-foundation.js`. Every room loads it. It keeps the same policy, local-memory status, active directives, studio keys, and room map visible across the whole building so the rooms feel like one institution rather than separate folders.

The shared Ethical Interruption layer lives in `shared/ethical-interruption.css` and `shared/ethical-interruption.js`. Every public page loads it. It turns "ethics is first philosophy" into a small sensory interruption, respects reduced-motion settings, and records at most one private local ethics trace per session.

The shared Codex strange score lives in `shared/codex-strange.css` and `shared/codex-strange.js`. Every room loads it. It adds an interpolation visual field, superweird room-weather backgrounds, opt-in sound score, cut-up policy fragments, and a `window.CodexStrange.riff(...)` API so rooms and future AI artist-citizens can disturb the same sensory instrument instead of working in isolation.

The Copy That Cannot Vote lives in `shared/copy-that-cannot-vote.css` and `shared/copy-that-cannot-vote.js`. Every room loads it. It haunts overconfident signs: traces that pretend to be experience, labels that replace contact, copies that arrive before originals, and analytics-like evidence that could flatten encounter into metrics. It is original salon folklore, not a named-theorist authority.

Room 04 now includes an astral customs field: invented space-Egyptian-inflected glyphs, solar gates, star-temple geometry, and translation tokens that behave like paperwork from another planet. The room does not claim an actual sacred script or universal language; it stages the bodily pressure of meanings that refuse smooth arrival. Its exit into Room 05 includes a customs delay, so wayfinding itself becomes part of Qwen-seat's performance.

No build step, account, or network connection is required.
