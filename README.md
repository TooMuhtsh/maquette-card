# Maquette

🇫🇷 [Version française](README.fr.md)

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/docs/faq/custom_repositories/)
[![Release](https://img.shields.io/github/v/release/TooMuhtsh/maquette-card)](https://github.com/TooMuhtsh/maquette-card/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**A living floor plan for Home Assistant.**
Your home seen from above, live, drawn right in your dashboard: no floor-plan image, no external tool, no YAML.

![Maquette: the demo apartment, live, dark theme](images/plan-pc-dark.png)

<p align="center">
  <a href="https://toomuhtsh.github.io/maquette-card/"><b>Try it online</b></a> (the demo apartment, nothing to install)
  &nbsp;·&nbsp;
  <a href="#installation"><b>Install</b></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/TooMuhtsh/maquette-card/wiki"><b>Wiki</b></a>
</p>

## What it does

- Lights glow in their room, open doors and windows turn red, shutters sit at their real position.
- Rooms are tinted by temperature; connected furniture (EV charger, fridge, TV…) shows its power.
- One plan per floor, with stairs to the next one and alerts that cover the whole house.
- A built-in editor (admins only): walls, rooms, openings, 48 furniture items and shapes, your Home Assistant areas in one click.
- In the editor too: a widget library and sharing, plan clean-up, layers and undo. And a wall tablet mode.
- 65 ready-made widgets (CO₂, leak, lock, EV, tariff, pool pH…) for the side panels and the card each element opens on tap.
- Optional ambience: day and night from the sun, real weather, energy flows, sun and moon light through the windows.
- Replay the last 1–72 hours of the whole plan.
- Sensitive actions (unlock, open a garage, disarm…) are always confirmed in a dialog that names the real service.
- Seven themes, light and dark, phone and desktop, English and French.

The full list is on the [wiki](https://github.com/TooMuhtsh/maquette-card/wiki).

## Draw your home

Click the editor button at the top right of the card. On an empty plan, *Start with my areas* creates one room per
Home Assistant area with its devices ready to place; then draw the rooms (**R**), place doors and windows on the walls,
add furniture and save. The plan is stored in the dashboard like any card.

![Drawing two rooms and placing furniture](images/draw-your-home.gif)

Step by step: [Editor guide](https://github.com/TooMuhtsh/maquette-card/wiki/Editor-guide).

## New in 0.4.0

- Seven built-in themes; `ha`, the new default, blends in like a classic Lovelace card (`material` keeps the previous look).
- Public `--maquette-*` CSS variables and checked custom CSS, under ⚙ Settings › Appearance.
- Lighter at rest, mostly on phones, and a notice when a newer version is out (with HACS).

![The seven themes on the demo widgets, light (left) and dark (right); night is always dark](images/themes-pc.png)

Details: [What's new in 0.4.0](https://github.com/TooMuhtsh/maquette-card/wiki#whats-new-in-040) · [Changelog](https://github.com/TooMuhtsh/maquette-card/wiki/Changelog).

More screenshots on the [wiki](https://github.com/TooMuhtsh/maquette-card/wiki/Screenshots), or try everything in the [online demo](https://toomuhtsh.github.io/maquette-card/).

## Requirements

- Home Assistant **2023.9** or later.
- A recent browser or the companion app: **Chrome / Edge 111+, Safari 16.4+, Firefox 121+**.
- A Home Assistant **administrator** account to edit the plan. Other users only see and use it.

## Installation

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=TooMuhtsh&repository=maquette-card&category=plugin)

1. HACS → ⋮ → **Custom repositories** → add `https://github.com/TooMuhtsh/maquette-card`, type **Dashboard**.
2. Download **Maquette**, then reload the browser.

<details>
<summary>Manual installation</summary>

1. Download `maquette-card.js` **and** `maquette-editeur.js` from the
   [latest release](https://github.com/TooMuhtsh/maquette-card/releases/latest).
2. Copy both to `/config/www/` (same folder).
3. Settings → Dashboards → ⋮ → **Resources** → add `/local/maquette-card.js` as a **JavaScript module** (only this
   one: the card loads the editor by itself when you open it).

</details>

## Getting started

Add the **Maquette** card (best alone in a **Panel** view), or create a **Maquette** dashboard:

```yaml
type: custom:maquette-card
title: My home
```

Then click the editor button and draw. To look around first, add the **Maquette — demo** card: a simulated
apartment where everything works and nothing reaches your home.

## Documentation

Everything else is in the **[wiki](https://github.com/TooMuhtsh/maquette-card/wiki)**: getting started, editor guide,
entities, widgets, ambience, recipes, FAQ, [security](https://github.com/TooMuhtsh/maquette-card/wiki/Security) and the
full [configuration reference](docs/reference.md). Changes are listed in the [CHANGELOG](CHANGELOG.md); to report a
vulnerability, see [SECURITY.md](SECURITY.md).

Feedback, bug reports and translation help are welcome in the [issues](https://github.com/TooMuhtsh/maquette-card/issues).

Built with [Claude Code](https://claude.com/claude-code) under the author's direction, and tested on a real home.

## License

[MIT](LICENSE).
