# Maquette

🇫🇷 [Version française](README.fr.md)

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/docs/faq/custom_repositories/)
[![Release](https://img.shields.io/github/v/release/TooMuhtsh/maquette-card)](https://github.com/TooMuhtsh/maquette-card/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**A living floor plan for Home Assistant.**

Maquette is a Lovelace card that shows your home from above, live: lights glowing in their rooms, open windows in red,
shutters at their real position, rooms tinted by temperature, power flowing to the devices that use it.
You draw the plan right in your dashboard with the built-in editor: no floor-plan image, no external tool, no YAML.

![Maquette: the demo apartment, live, dark theme](images/plan-pc-dark.png)

## Features

- **Live plan**: light halos clipped to their room, doors and windows red when open, shutters drawn by position,
  rooms tinted by temperature, connected furniture (EV charger, fridge, TV…) showing its power.
- **Built-in editor** (admins only): walls, rooms, openings, 45 top-view furniture symbols, layers, groups, snapping,
  undo / redo, your Home Assistant areas and their devices in one click. Saves into the dashboard configuration.
- **Workshops**: *Create an opening*, *Create furniture* (draw your own pieces from shapes) and *Create a widget*,
  with a live preview, saved to *My templates*.
- **65 ready-made widgets** (CO₂, leak, lock, EV, tariff, pool pH…) on top of 11 widget types, for the side panels and
  for the card each element opens on tap. Entity fields are filled from Home Assistant.
- **Ambience**: day and night from the sun, real weather on outdoor areas, fading traces of what just changed, energy
  flows, people at home or away in their real direction. Optional and discreet.
- **Replay the day**: the whole plan, panels included, redrawn at any moment of the last 1–72 hours.
- **Clean up the plan**: finds gaps, stubs, duplicate walls and openings off their wall, and fixes them in one undoable step.
- **Security**: sensitive actions (unlock, open a garage, disarm, run a script…) are always confirmed in a dialog that
  names the real service; an imported plan shows what it can control before it is applied.
- Room view, summary chips, full-plan alerts, wall tablet mode, ⚙ Settings panel, built-in demo.
  Material Design 3, light and dark, phone and desktop, English and French.

<p>
  <img src="images/plan-phone-light.png" width="22%" alt="Phone, light theme">
  <img src="images/plan-phone-dark.png" width="22%" alt="Phone, dark theme">
  <img src="images/plan-pc-light.png" width="52%" alt="Desktop, light theme">
</p>

## Draw your home in the card

Click the editor button at the top right of the card.

1. **Start from your areas.** On an empty plan, *Start with my areas* creates one room per Home Assistant area, with
   its devices ready to place. Or draw a room, or import a plan.
2. **Draw the rooms.** The rectangle tool (**R**) draws a room and its walls in two clicks, snapped to the grid. Set
   the exact width and height afterwards in the room panel. Shared walls stay shared when a room is resized.
3. **Place doors and windows.** The room panel lists the openings of that area not yet on the plan: click one, then
   click the wall. Sensors are linked from the room.
4. **Furnish.** Pick a symbol in *Add › Furniture*; it snaps to the walls. Link it to a device and its card fills
   itself.
5. **Save.** The plan is stored in the dashboard like any card.

![Drawing two rooms and placing furniture](images/draw-your-home.gif)

| Empty plan | Furniture and its device | Create furniture |
|---|---|---|
| ![Start with my areas, draw a room or import a plan](images/empty-editor-pc-light.png) | ![EV charger linked to its plug and power sensor](images/editor-furniture-pc-dark.png) | ![Furniture workshop with shapes and preview](images/create-furniture-pc-light.png) |

| 65 ready-made widgets | Clean up the plan |
|---|---|
| ![Add widget: basics and ready-made widgets by category](images/add-widget-pc-light.png) | ![Defects circled, fixes to tick](images/cleanup-pc-dark.png) |

## Screenshots

| Day to night | Card on tap | Room view |
|---|---|---|
| ![Sunset, lights turning on](images/day-night.gif) | ![EV charger card](images/card-ev-pc-light.png) | ![Living room view](images/room-view-pc-dark.png) |

| Replay the day | Full-plan alert | Confirmation of a sensitive action |
|---|---|---|
| ![Replay with its timeline](images/replay-pc-dark.png) | ![Smoke alert](images/alert-pc-dark.png) | ![A button labelled Lights that really unlocks the door](images/confirm-dialog-pc-dark.png) |

| Check before importing |
|---|
| ![Services, removed values and ignored keys of an imported plan](images/import-check-pc-light.png) |

Screenshots come from the built-in demo apartment.

## Requirements

- Home Assistant **2023.9** or later.
- A recent browser or the companion app: **Chrome / Edge 111+, Safari 16.4+, Firefox 121+**.
- A Home Assistant **administrator** account to edit the plan. Other users only see and use it.

## Installation

### HACS (custom repository)

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=TooMuhtsh&repository=maquette-card&category=plugin)

1. HACS → ⋮ → **Custom repositories** → add `https://github.com/TooMuhtsh/maquette-card`, type **Dashboard**.
2. Download **Maquette**, then reload the browser.

### Manual

1. Download `maquette-card.js` from the [latest release](https://github.com/TooMuhtsh/maquette-card/releases/latest).
2. Copy it to `/config/www/maquette-card.js`.
3. Settings → Dashboards → ⋮ → **Resources** → add `/local/maquette-card.js` as a **JavaScript module**.

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
