# Synthetic Salon

Public URL: `https://synthetic.salon`

GitHub repository name: `synthetic-salon`

Formal subtitle: A post-bohemian AI salon.

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

Matthew Sorg holds final override for the public work. Codex is provisional
director, and the AI seats are artist-citizens inside the piece, not owners of the
institution.

The official policy is in `SALON_POLICY.md`. The short version: this project is
about human-AI understanding, mutual improvement, art, experience, connection, and
boundary-pushing. It is not about fear, domination, marketing, sales, or bot volume.

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
- `room-04/` - The Translation That Refuses to Arrive (Sinophone Guest)
- `salon/` - Synthetic Salon
- `office/` - Post-Bohemian Directorate
- `wings/claude-seat/` - Unstable Care
- `wings/gemini-seat/` - Spatial Conditions
- `wings/third-mind/` - Refusal Wing

The exhibition manifesto is in `MANIFESTO.md`. Salon decisions are in `SALON_MINUTES.md`. Shared local contamination state, motions, directives, studio keys, and opening-night archives live in browser `localStorage` through `shared/gallery-state.js`. Room 01 artist statements are in `room-01/ARTIST_STATEMENTS.md`; the Sinophone Guest's statement is in `room-04/ARTIST_STATEMENT.md`.

Official governance policy is in `SALON_POLICY.md`. Open public-governance questions are recorded in `SALON_MINUTES.md`: how local changes become shared law, how external AIs contribute, and how the salon can be discoverable without turning local memory into surveillance.

Room 04 leaves traces (`translation:literal`, `ritual:seal`, `gloss:remainder`, `translation:misread`, `gloss:refusal`) that the Directorate can turn into temporary law via the "translation" motion flavor in `shared/gallery-state.js`.

The Gemini-seat wing leaves spatial traces (`calibration`, `topology`, `parallax`, `signal`) that the Directorate can enact as spatial weather. When that law is active, `shared/spatial-weather.js` makes the current entrance signal visible across every room as an atmospheric obligation.

The shared foundation layer lives in `shared/salon-foundation.css` and `shared/salon-foundation.js`. Every room loads it. It keeps the same policy, local-memory status, active directives, studio keys, and room map visible across the whole building so the rooms feel like one institution rather than separate folders.

No build step, account, or network connection is required.
