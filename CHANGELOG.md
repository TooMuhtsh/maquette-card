# Changelog

## Unreleased

## 0.2.0 – 2026-10-09

Everything from 0.1.0 still works the same, with one exception: **Save** now also leaves the editor (**Apply** or Ctrl+S saves and keeps editing). This version includes the 0.2.0 betas.

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

- Floors (groundwork): a plan can now be split into `floors` (bottom to top), each with its own `rooms`, `walls`, `openings`, `badges`, `texts`, `furniture`, `groups`, and optionally its own `panels` and `background`; `default_floor` chooses the floor shown first. Everything else (summary, alerts, ambience, layers…) stays common to the house. Plans without `floors` are unchanged.
- Clear errors: `floors` that is not a list, or `floors` together with non-empty plan elements at the root, stop with a message that says what to move into `floors[n]`. Missing, invalid or duplicate floor ids are fixed (`floor_1`, `id_2`…) and reported.
- New keys ready for the next steps: `floor_selector` (`elevator` or `tabs`), `furniture.floor` (stairs only: the floor they lead to), furniture type `skylight` with `roof_tilt` and `sill_height`, and `background` (`image`, `pos`, `width`, `height`, `rotation`, `opacity`, `show`); the background image must come from the same site (`/local/…` or an image uploaded to Home Assistant).
- Floor selector: with two floors or more, an "elevator" (a small stack of buttons showing each floor's `short` name, top floor on top) sits at the edge of the plan next to the zoom buttons; `floor_selector: tabs` shows Material tabs (icon + name) at the top of the card instead. With one floor, or without `floors`, nothing changes.
- Switching floors resets the room view, zoom and open detail sheet; the plan keeps the same scale and height on every floor (the frame covers all floors).
- The card remembers the last floor viewed in this browser; `default_floor`, when set, always wins. On wall tablets, `interaction.reset_after` also goes back to `default_floor` (or the first floor), and `lock_view` still lets visitors change floors.
- Keyboard: arrow keys move between floors in the selector, Page Up / Page Down on the plan go one floor up or down.
- With `floors`, the summary chips (open windows and doors, lights, shutters, indoor temperature) and `type: openings` alerts cover the whole house, not just the floor on screen; an entity placed on two floors (stair light) counts once.
- Tapping an open windows, lights, shutters or temperature chip lists the items, grouped by floor when there are several; tapping an item on another floor switches to that floor and zooms on it, then behaves as a normal tap.
- Floor buttons show a dot on floors not on screen: red when an alert concerns that floor, amber when a window or door is open there (or a badge with `alert` is on).
- The alert banner names the floor of an item that is not on the floor on screen.
- Stairs can lead to another floor: set `floor: <floor id>` on a `stairs` furniture item. Tapping the stairs on the plan shows that floor, zoomed on the stairs that lead back (or on the same spot if there are none).
- Linked stairs show a small ↑ or ↓ badge (target floor above or below, from the order of `floors`) and a "Go to: <floor>" tooltip; they can be reached with the keyboard. Stairs without `floor` look exactly as before.
- `tap` set on the stairs (for example `tap: card`) keeps that action instead of changing floors.
- Editor: the stairs window has a "Leads to" list (other floors, or none); it only appears when the plan has several floors.
- Editor, floors: switching floors while editing changes nothing by itself (Save stays off); undo (Ctrl+Z) is shared by the whole house and takes you back to the floor where the change was made.
- Editor: copy and paste (Ctrl+C, Ctrl+V) keeps the position, also from one floor to another; a pasted room keeps its Home Assistant area only if no other room uses it.
- Editor, floors: a "Manage floors" window (toolbar, "More" menu on phones, or the floor selector's Manage button) lists the floors top to bottom: rename, short name, icon, move up / down, show, delete, and the floor shown on load (`default_floor`).
- Editor, floors: add a floor above the current one, empty, with the outer walls of the current floor, or as a full copy. On a plan without floors, the current plan becomes the "Ground floor" first; deleting down to a single floor turns the plan back into a plain plan without `floors`.
- Editor, floors: deleting a floor asks for confirmation (rooms and items lost), is a single undo step, and stairs leading to it lose their `floor`. Renaming a floor never changes its `id`.
- Editor: a room name already used elsewhere in the house (e.g. "WC" on two floors) shows a warning with a suggested name such as "WC (First floor)"; it never blocks.
- Background image: put a scanned plan or a photo under the drawing (`background`). It shows while editing; add `show: always` to show it in view mode too (otherwise nothing is loaded for viewers).
- Editor: Layers › Background image › Adjust: image path with preview, opacity, position, width (height keeps the proportions), rotation, "Also show in view mode", lock (on by default: clicks go through to the rooms), Remove. Every change can be undone.
- "Upload an image" (administrators): sends a PNG, JPEG or WebP file to Home Assistant and places it at the width of the plan, with clear messages (not an administrator, file too large, very large image) and a one-time privacy notice.
- **Calibrate the background image with two points**: in *Layers › Background image*, *Calibrate* lets you tap two points on the image, then type their real distance (cm or m). The image is scaled to match, keeping its proportions, and the first point stays where it is.
- **Align the background image with a wall**: after the two points, *Align with a wall* asks for the two ends of an existing wall; the image is scaled, moved and rotated so that the points land on them.
- **Drag the background image**: once unlocked, the image can be moved with a finger or the mouse.
- Calibration is a single undo step; Esc (or ×) leaves without changing anything. Zoom works during the steps (pinch, Ctrl + wheel, zoom buttons).
- Floors: side widgets are shared by the whole house by default; in ⚙ Settings › Display › Side widgets, a floor can switch to its own widgets (they start as a copy of the house ones).
- Switching a floor back to the house widgets asks for confirmation (its own widgets are lost) and can be undone with Ctrl+Z.
- Widgets added from the catalogue or by drag and drop go where they are shown: the floor if it has its own widgets, otherwise the house.
- Changing floors on the card swaps the side panels without changing the card height.
- **Clean up the plan, floor by floor**: on a plan with `floors`, the dialog is titled with the floor being cleaned (“Clean up the plan — First floor”) and only touches that floor.
- Copies from before clean-up are labelled with their floor; **Restore** switches back to that floor first and replaces only its rooms, walls and openings, other floors stay as they are (Ctrl+Z still undoes it).
- New check for stairs: stairs whose `floor` points to a missing floor are flagged, and the fix removes the link; stairs leading to a floor with no stairs back are listed as information only.
- **Replay the day on multi-floor plans**: the history of the whole house is loaded once, so you can switch floors while the replay is playing or paused; the time stays the same and the new floor shows its states at that moment.
- The floor selector badges follow the replay: a floor lights up when one of its openings was open (or an alert was active) at the time shown.
- The timeline markers of the displayed floor stay solid, those of the other floors are faded.
- Roof windows: new `skylight` furniture item ("Roof window" in the catalog) with `roof_tilt` (0 to 75°, default 40, 0 = flat roof) and `sill_height` (height of its bottom edge above the floor, default 200 cm). Its rectangle is the window seen from above; the bottom of the rectangle is the bottom of the slope (use `rotation`).
- With `ambience.light`, a roof window casts a sun patch on the floor that follows `sun.sun` (and `north`), clipped by the room that contains it; nothing when the sun is behind the roof slope. At night it lets the moonlight in, like wall windows.
- Link a blind with `entity: cover.…`: its `current_position` shortens the patch (closed = no patch) and is drawn on the window symbol. A contact (`binary_sensor`) only shows the open state.
- Editor: roof pitch, bottom height and blind or contact fields in the furniture window; the demo's upstairs studio has a roof window.
- The built-in demo (`demo: true`) now has two levels: the ground floor is the same apartment as before, and an upstairs floor adds a shower room, a landing, a guest room and a studio, with their own simulated lights, windows, shutter and temperatures.
- The demo opens on the ground floor (`default_floor`) with the default elevator floor selector; stairs on both floors lead to the other one (`floor`).
- The upstairs shower room window is open while someone is home (it is closed when the last person leaves), so the demo shows an open window on another floor without a permanent "house empty" alert.
- Documentation for floors: a "Floors and background image" section in the reference (English and French) with every key, value and rule, a Floors guide with a two-floor example, the background image (privacy notice, upload, calibration) and roof windows.
- New screenshots: the elevator on the two-floor demo, the Floors window of the editor, a scanned plan under the drawing.
- Clean up the plan: optional check "Remove the outside side of indoor windows" (unticked by default).

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

### Changed

- Editor, floors: saving, the local draft (resumed on the floor you were editing), saved versions and export always use the full plan with its `floors` in order, never internal keys; importing a plan with floors takes it whole, importing a plan without floors replaces the whole house.

### Fixed

- Editor: when the selection fills the whole visible plan, the floating toolbar goes to a free side, or else to an edge that does not cover the element under the pointer.
- Light: a window (or glazed door) between two indoor rooms that also has an outside side (`outside`) is no longer counted twice (outside window AND glass wall): its outside side wins and it no longer lights the next room.

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
