# Changelog

## Unreleased

## 0.2.0-beta.1 – 2026-10-09

### Added

- **Light between rooms, slats, moon direction**: daylight reaches the next room through an open inside door (`contact`; without a sensor = open, `light.doors: closed` to change it) or an interior glass wall, one step only; `slats: tilt | vented` on an opening with a shutter (tilting slats follow `current_tilt_position`, vented slats let streaks through; default unchanged); the moon's direction and phase are computed from the HA coordinates (patch behind the windows that see it, night-sky glow elsewhere); *Clean up the plan* flags windows without `outside` and shutters linked to nothing.
- **Glazed doors, roof overhangs and readable daylight** (ambience light): `glazed: full | top` on a door lets daylight in like a window (shutter included; editor: *Light* fold of the opening, and the *French window* preset is glazed); `overhang` / `overhang_height` cut the high summer sun and let the low winter sun in; the direct sun follows the weather's `cloud_coverage`; sky light is now a warm beam widening into the room plus a faint light over the whole room, blended in screen mode, and the weather (clouds, fog, rain) is no longer painted over indoor rooms.
- **Several sensors on one opening**: `contact` also takes a list (up to 8 entities). The opening is open as soon as one sensor is, closed when one answers (the card mentions an unavailable one), unavailable only when all are; counted once in the summary and alerts, one line per sensor in its card, all of them in the replay. Editor: *Add a sensor* under *Contact*, and tick several free contacts when drawing. A single entity is still plain text.
- **Ambience light** (`ambience.light`, on by default with the ambience; `light: false` turns it off): sunlight patches
  on the floor behind the windows facing the sun (sun.sun azimuth + `north`, length from the elevation, shortened by the
  linked shutter, clipped to the room), a cool moonlight glow at night (`moon: sensor.moon_phase` for the phase), and
  lamp halos in the light's color and brightness that blend where they overlap (`sun`, `moon`, `lamps`). In the editor:
  ⚙ Settings › Display › Light. The demo shows all three.
- **Ambience light, more natural**: a soft daylight glow through every window that is not closed (even out of the sun, weaker when overcast), soft-edged sun patches with a warm bounced glow, adjoining leaves merged into one bay (one patch, no seam), and per-window `sill` / `height` (Opening panel › Light).
- **Light settings**: strength of the sky glow, the bounced glow and the direct sun (`sky`, `bounce`, `sun`: 0 to 2) and their color temperature (`sky_kelvin`, `sun_kelvin`: 1800 to 10000 K, `auto` by default), with sliders and a live preview in the editor.
- **Sky light diffusion** (`light.sky_diffusion`, 0 to 1, `0.6` by default): the sky beam blurs more and more with the depth, nearly sharp against the glass and spreading into the room without a visible edge (`0` = the former sharp beam); *Diffusion* slider under *Sky light* in the Ambience dialog, with the live preview.

### Editing comfort

- **No more side panel in the editor**: badges, furniture (connected or not), texts and info boxes, walls, fences, widgets, summary chips and multiple selections now work like rooms and openings: floating toolbar next to the element, then a tabbed edit dialog with a live preview (the element in its room; a widget or chip shows itself; a multiple selection gets the shared settings — align, hide, group name — and grouped actions — group, lock, duplicate, delete). *Layers* is a dialog too, and an element picked there or inside another dialog opens its own, ← or Esc going back.
- **Rooms and openings without the side panel**: a click selects them on the plan with a small floating toolbar next to them (*Edit*, *Duplicate*, lock, order, *Delete*) that stays outside the element and in view, following zoom and pan; *Edit*, a double-click or Enter opens a tabbed edit dialog with a live preview of the element in its room, cropped from the real plan (Ctrl+Z, *Apply*, Esc; full screen on a phone).
- **Ambience dialog**: the Ambience and animations panel is now a tabbed dialog like ⚙ Settings (General, Light, People, Energy, Animations, Alerts), with a live preview on the plan behind it and a sample room drawn by the card itself (preview time of day and weather, nothing saved); ⚙ Settings › Display › Light links to its Light tab.
- **Lock an element** (`locked: true` on a room, opening, badge, text or furniture): still selectable and editable in its
  panel, but it no longer moves or resizes with the mouse or the arrow keys, and a click on it goes to the element
  underneath. Padlock in its panel and in *Layers › Plan elements*. Walls and fences keep the layer lock
  (`layers.locked`).
- **Apply**: saves without leaving the editor (Ctrl+S), with a confirmation message; **Save** now saves and leaves the editor.
- **Named colors** (`palette: {name: color}`, ⚙ Settings › Display): offered in every color picker of the editor (badges,
  furniture, widgets, animations of an element or of an event, furniture workshop); an element using a name follows the
  palette when it changes. `ambience.traces.color` and `ambience.energy.color`, set in YAML, take a name too. Names and
  colors are validated like every other color.
- **Badges only in their room view**: `zoom_only: true` on a badge, or `badge_style.zoom_only: true` for all of them.

## 0.1.0 – 2026-10-08

First public version.

### Main features

- **Live floor plan** of the home: rooms tinted by temperature, windows and doors in red when open, shutters, lights
  with their halo, device badges, connected furniture with their value, summary chips above the plan.
- **Room view**: tap a room to see its devices, openings, automations and action buttons, with its own side panels.
- **Side panels and widgets**: tile with chart, gauge, entity list, live tariff (Tempo), electric vehicle, periods
  table, room climate, thermostat, cover / valve control, lock, divider; about 65 ready-made widgets by category.
- **Cards** on furniture, openings and badges: a dialog with the element's state, on / off switch and its own widgets.
- **Built-in editor** (admins): drawing tools with snapping, catalogue of furniture, openings and widgets, furniture
  and opening workshops, templates, groups and layers, *Clean up the plan*, YAML / JSON export and import, local
  versions and drafts, ⚙ Settings. No YAML needed, but everything it writes is plain YAML.
- **Ambience**: day and night from `sun.sun`, weather on outdoor areas, traces of what just changed, energy flows,
  people at home or in their real direction.
- **Replay the day**, full-plan alerts, animations, wall tablet mode, showcase and a built-in demo
  (`custom:maquette-card-demo`).
- English and French interface (follows Home Assistant or `language`), light and dark themes, phones and tablets.
- Everything stays in Home Assistant: no external service, no account.

### Security

- Every value of a plan (configuration, import, template, draft) is checked before it is drawn: a crafted plan cannot
  run code in the dashboard. Invalid values are removed, with a warning in the browser console.
- **Sensitive services are always confirmed** in a dialog that names the real action, the service and the entities:
  unlock, open a garage door, a gate or a valve, disarm an alarm, run a script, and anything outside a list of known
  safe services. `confirm: false` never skips it.
- **`confirm: true` forces the confirmation** on anything that calls a service, even a safe one: room buttons, badges,
  openings and furniture (on / off from their card and from the room view) and widgets (switches, *Activate*,
  thermostat, cover, lock). Typical case: a garage door driven by a `switch`.
- `protected: true` keeps a device from being turned off from the plan (its card and the room view).
- Importing a plan first shows what it can control, its links and what was removed.
- See [Security](docs/reference.md#security) and [SECURITY.md](SECURITY.md).

### Requirements

Home Assistant 2023.9 or later. Install with HACS (custom repository) or by hand: see the README.

### Former French keys

Test versions before 0.1.0 used French keys (`pieces`, `murs`, `ouvertures`, `points`, `meubles`…). They are no longer
read: a card still written with them shows an error, and the editor refuses to import such a plan. To convert one, rename
every key and enumerated value to its English name (`rooms`, `walls`, `openings`, `badges`, `furniture`,
`type: window`…; names, entities, numbers and coordinates are unchanged), or run
`customElements.get("maquette-card").versAnglais(config)` in the browser console. Versions and drafts kept by the editor
in the browser are converted automatically.
