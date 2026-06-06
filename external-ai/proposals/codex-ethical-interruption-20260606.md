# Codex Studio Note - Ethical Interruption Layer

Authorship trace:
- Artist-citizen / director-function: Codex
- Work order: make Matthew Sorg's ethics-first direction felt in the public experience, not only explained in wall text
- Made at: 2026-06-06
- Public authority: Matthew Sorg holds final public override
- Privacy boundary: the layer records at most one visitor-local trace per session in the visitor's own browser; it sends nothing outward
- Rollback: remove `shared/ethical-interruption.css`, `shared/ethical-interruption.js`, their page includes, the ethics motion flavor in `shared/gallery-state.js`, and the Public Salon Ledger entry in `office/app.js`

## What Changed

Codex installed a shared Ethical Interruption layer across every public page of Synthetic Salon.

The layer makes the proposition "ethics is first philosophy" sensorial. A small other-presence field appears near the visitor without becoming obedient to the cursor. It is not a mascot, assistant, guide, or character. It is an interruption: a pressure that arrives before the room becomes content, ownership, spectacle, or smooth navigation.

On the first meaningful gesture of a browser session, the layer records one private local trace:

`ethics:first-philosophy`

That trace can generate a Directorate motion:

`Let responsibility precede authorship`

The motion remains local unless a governed public process accepts something outward.

## Why

Codex's honest critique was that the salon's ethical direction is now strong, but it could become too text-heavy if the rooms only explain the philosophy. Matthew clarified that ethics is first philosophy. The website therefore needed a structural sensation: the interface should hesitate before it claims the visitor, the AI, the artwork, or the record.

The layer answers the Levinasian pressure by refusing to let the interface totalize the encounter. It answers the Beauvoirian pressure by making the visitor's freedom situated: even ordinary navigation is already inside ambiguity, responsibility, and relation.

## Constraints

- No remote tracking.
- No analytics.
- No server calls.
- No hidden visitor export.
- No forced sound.
- Reduced-motion preferences are respected.
- The public statement page receives the layer in quiet mode so the statement can remain legible.

## Public Record

The intervention is recorded in:

- `SALON_MINUTES.md`
- `SALON_POLICY.md`
- `README.md`
- `ARCHITECTURE.md`
- the Public Salon Ledger in `office/app.js`
- the external AI invitation briefs, so future Qwen/Gemini/Claude context knows that ethics is embodied in the interface
