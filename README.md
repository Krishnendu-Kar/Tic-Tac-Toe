# Retro Arcade Collection

Eleven browser games in one place — Tic-Tac-Toe, Snake, 2048, Breakout, Space
Invaders and more. No build step, no framework, no install: every page is plain
HTML, CSS and JavaScript served straight off the filesystem.

**Live:** open `index.html`.
**Repo:** [Krishnendu-Kar/Tic-Tac-Toe](https://github.com/Krishnendu-Kar/Tic-Tac-Toe)

---

## The games

| Game | Folder | Controls | Notes |
|---|---|---|---|
| Tic-Tac-Toe V2 | `tic-tac-toe v2/` | Tap / click | Three difficulties; "Impossible" is a full minimax search |
| Tic-Tac-Toe V1 | `tic-tac-toe v1/` | Tap / click | The original version that started the collection |
| Neon Snake | `snake/` | Arrows, WASD, **swipe**, on-screen D-pad | High score persisted |
| 2048 | `2048/` | Arrows or swipe | High score persisted |
| Space Invaders | `space/` | Arrows + space, or the on-screen pad | High score persisted |
| Neon Breakout | `breakout/` | Mouse or drag | — |
| Neon Pong | `pong/` | Mouse or drag | First to 5 against the computer |
| Memory Match | `memory/` | Tap / click | 16 cards, 8 pairs |
| Flappy Box | `flappy/` | Tap, click or space | High score persisted |
| Whack-a-Mole | `whack/` | Tap / click | 30-second run |
| Rock Paper Scissors | `rps/` | Tap / click | — |

Each game folder is self-contained: `index.html` + `script.js` + `style.css`
(the two Tic-Tac-Toe folders use their own file names).

---

## Layout

```
index.html                 Home / hub — search, category filter, shuffle
arcade-home.css            Hub styles (tokens, hero, grid, light + dark)
arcade-home.js             Hub behaviour — renders the game list, filters, theme

arcade-responsive.css      Shared responsive layer, loaded on every game page
arcade-mobile.js           Shared touch layer, loaded on every game page
theme.js                   Dark/light toggle + Enter-to-start, used by the games
favicon.js                 Injects the favicon link
manifest.webmanifest       PWA manifest (installable, standalone)

arcade-style.css           Styles for the previous home page
old-version.html           The previous home page, kept for reference

<game>/                    One folder per game
new-design/                Design-tool prototype (React + Babel at runtime)
```

### How a game page is wired

```html
<link rel="stylesheet" href="style.css">            <!-- the game's own styles -->
<link rel="stylesheet" href="../arcade-responsive.css">  <!-- shared overrides -->
...
<script src="script.js"></script>                   <!-- the game -->
<script src="../favicon.js"></script>
<script src="../theme.js"></script>
<script src="../arcade-mobile.js"></script>         <!-- shared touch layer -->
```

Order matters: `arcade-responsive.css` is loaded **after** each game's own
stylesheet so its rules win, and `arcade-mobile.js` loads after the game so it
can drive it. Each page also carries `data-game="<name>"` on `<body>`, which is
how the shared stylesheet targets one board without touching the others.

---

## The shared responsive layer

`arcade-responsive.css` is the reason all eleven games behave the same way at
every size. It is organised in numbered sections; the parts worth knowing:

- **Dynamic viewport units.** `100dvh` with a `100vh` fallback, so a collapsing
  mobile URL bar does not cut the board off. `arcade-mobile.js` pins a pixel
  height for browsers too old for `dvh`.
- **Safe-area insets.** `env(safe-area-inset-*)` padding plus
  `viewport-fit=cover`, so notches and home indicators never overlap the UI.
- **Fluid type and spacing.** `clamp()` throughout instead of breakpoints, so
  there is no width the layout was not designed for.
- **Touch targets.** Every button, chip and link is at least 44px.
- **Aspect-ratio-correct canvases.** Each board draws into a fixed buffer
  (Snake 400×400, Breakout and Pong 800×600, Flappy 400×600, Space 600×600) and
  is scaled by CSS. Constraining width *and* height at once stretches the board
  off-ratio, so the layer caps **only the width**, derived from the height
  budget times the buffer ratio, and lets the height follow.
- **Landscape mode.** Under 520px of height the header collapses to one line,
  the logo hides and the scoreboards become single-line — a phone in landscape
  keeps the whole board on screen.
- **Accessibility.** `:focus-visible` rings, `prefers-reduced-motion` support,
  and hover effects gated behind `(hover: hover)` so they do not stick after a
  tap.

## The shared touch layer

`arcade-mobile.js` adds what the games could not do on a phone:

- **Swipe controls for Snake**, which was keyboard-only and therefore
  unplayable on a touch device. A swipe dispatches the same `keydown` event the
  game already listens for, so no game logic had to change.
- **An on-screen D-pad**, rendered only when `(pointer: coarse)` matches.
- **Double-tap-zoom suppression** on play surfaces.
- **Light haptics** on primary actions where the platform supports it.

---

## Themes

One key, `arcadeTheme` in `localStorage`, shared by the hub and every game.
The hub applies the saved theme in a blocking inline script before first paint,
so a light-theme visitor never sees a dark flash, and falls back to the OS
`prefers-color-scheme` on a first visit. The class lives on `<body>`
(`body.light-theme`), which is the hook `theme.js` and every game stylesheet
already use.

## High scores

Four games persist a high score to `localStorage`, and the hub reads the same
keys to show a "Best" badge on the card and a best-score stat in the hero:

| Game | Key |
|---|---|
| Snake | `snakeHighScore` |
| 2048 | `2048HighScore` |
| Flappy Box | `flappyHighScore` |
| Space Invaders | `spaceHighScore` |

---

## Running it

Any static server works. From the repo root:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` from the filesystem works too, though `manifest.webmanifest`
and PWA install need to be served over HTTP.

### External dependencies

All from CDNs, all optional to the layout:

- [Phosphor Icons](https://phosphoricons.com/) — icon font
- Google Fonts — Inter and Outfit

---

## Testing responsiveness

The layout was checked at 320, 360, 380, 390, 420, 768, 1024, 1100 and 1440
pixels wide, plus 740×360 landscape, in both themes. A quick way to reproduce
that is an iframe harness — a page of fixed-size iframes evaluates media
queries and `vw`/`dvh` against each iframe's own viewport, which browser window
resizing cannot do below the OS minimum window width:

```html
<iframe src="http://localhost:8000/snake/index.html" width="360" height="740"></iframe>
<iframe src="http://localhost:8000/snake/index.html" width="768" height="740"></iframe>
```

---

## `new-design/`

A prototype exported from a design tool. `Arcade-Website.dc.html` and
`Arcade-Mobile-App.dc.html` are template files driven by `support.js`, which
pulls React and Babel Standalone from a CDN and transpiles in the browser at
runtime. It is useful as a visual reference but not suited to being the live
home page — it is several megabytes of runtime before anything renders, and it
does not work offline. The hand-written `index.html` serves that role instead;
the prototype is linked from the footer.

## Conventions

- No build step. Everything runs as-authored in the browser.
- Games stay self-contained; anything cross-cutting goes in a shared root file.
- Shared CSS loads last and uses `!important` deliberately, to override inline
  styles and per-game rules without editing eleven stylesheets.
- New game? Add the folder, wire the four shared files into its `index.html`,
  set `data-game` on `<body>`, and add one entry to the `GAMES` array in
  `arcade-home.js` — the hub card, search and filtering follow automatically.
