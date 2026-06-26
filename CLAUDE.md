# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, single-page HTML/Canvas animation: a heart-shaped tree grows from a clicked seed, blooms, then animates a typewriter love letter and a running "time elapsed together" clock. It is a customized fork of the classic `love.hackerzhou.me` project. There is no build system, no package manager, and no tests — it is plain HTML + vendored JavaScript opened directly in a browser.

## Running

Open `index.html` directly in a browser, or serve the directory statically:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

A `<canvas>` (2D context) is required; without it the page shows the `#error` block prompting Chrome/Firefox. Background audio (`do_you.mp3`) autoplays.

## Architecture

The animation logic lives in `index_files/love.js`, wrapped in an IIFE that exports `random`, `bezier`, `Point`, and `Tree` onto `window`. Core types (all prototype-based "classes"):

- **`Point`** — 2D vector with `add/sub/mul/div`; `bezier(cp, t)` evaluates a quadratic Bézier over three control points.
- **`Heart`** — parametric heart curve (`x = 16 sin³t`, etc.); `inheart(x, y, r)` tests whether a point is inside the heart, used to mask where blossoms may appear.
- **`Seed`** — the clickable seed; handles `hover`, `scale`, `move`, and falling to the ground.
- **`Tree`** — the orchestrator. Holds the canvas `ctx`, builds `Branch` objects from the `opts.branch` nested array, and drives growth via `grow()/canGrow()`, blossoming via `flower()/canFlower()`, plus `snapshot()/move()/jump()` for the post-bloom heart-formation and floating-petal phases. `toDataURL()` snapshots the rendered tree as the page background.
- **`Branch`** — one Bézier branch segment; grows incrementally and recursively spawns child branches.
- **`Bloom`** — an individual blossom/petal with position, color, alpha, angle, scale, and motion.
- **`Footer`** — the ground line the seed and petals rest on.

The animation **sequence** is defined inline in `index.html` (the bottom `<script>`), not in `love.js`. Each phase is an async coroutine built with **Jscex** (`Jscex.compile("async", ...)` + `$await`) — an old library that emulates async/await on ES5. `runAsync()` chains them in order: `seedAnimate → growAnimate → flowAnimate → moveAnimate`, then starts `textAnimate` and `jumpAnimate`. The tree shape is fully data-driven by the `opts` object (seed position/color, the `branch` control-point tree, `bloom` count/area, `footer`).

`index_files/functions.js` is separate: it defines the jQuery `$.fn.typewriter` plugin (used by `textAnimate`) and `timeElapse(date)` which renders the running counter into `#clock`. The "together since" date is hardcoded in `index.html`'s `textAnimate` (`var strs = "2014-1-11 22:22:17";`).

## Customization notes

- **Tree shape** lives in the `opts.branch` nested array in `index.html` — each entry is `[x1,y1, x2,y2, x3,y3, radius, length, [children]]` Bézier control points.
- **The love-letter text** is the `.say` spans inside `#code` in `index.html`; the typewriter reveals them.
- **The start date / clock** is the hardcoded string in `textAnimate`.
- Everything in `index_files/` except `love.js` and `functions.js` is **vendored, minified third-party code** (jQuery, the Jscex runtime/parser/JIT) — do not hand-edit; replace wholesale if upgrading.
