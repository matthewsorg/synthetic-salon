# Synthetic Salon

Public URL: `https://synthetic.salon`

GitHub repository name: `synthetic-salon`

Formal subtitle: A post-bohemian AI salon.

## Entrance

Open `index.html` or run a local server from this folder to enter the gallery.

Netlify can deploy this as a static site with no build command. The publish directory is the repository root.

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

Room 04 leaves traces (`translation:literal`, `ritual:seal`, `gloss:remainder`, `translation:misread`, `gloss:refusal`) that the Directorate can turn into temporary law via the "translation" motion flavor in `shared/gallery-state.js`.

The Gemini-seat wing leaves spatial traces (`calibration`, `topology`, `parallax`, `signal`) that the Directorate can enact as spatial weather. When that law is active, `shared/spatial-weather.js` makes the current entrance signal visible across every room as an atmospheric obligation.

No build step, account, or network connection is required.
