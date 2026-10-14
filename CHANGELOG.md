# Changelog

## Unreleased

## 0.3.0 – 2026-10-14

### Changed

- Editor toolbar on two rows on desktop: drawing tools, grid, fit and *Add* / *Exit* / *Apply* / *Save* on the first row; *Floors*, *Layers*, *Ambience*, *Clean up the plan*, *Export / import*, *Settings* and *Keyboard shortcuts*, now with their names, on the second. On a narrower window the grid, *Exit* and *Apply* keep only their icon. Phones are unchanged (these commands stay in the ⋮ menu).
- Templates (`templates`) stay the single library: older templates keep working as they are; one without `id` gets one when a first copy is placed. A widget type unknown to this version is shown as such and kept as is.
- Rain, downpour, snow, hail and wind no longer use SMIL: they slide with a CSS animation (same direction, distance and speed), which Chromium-based browsers and the Android app run on the compositor without repainting the plan. On the real test plan (phone, CPU slowed down 4×), rain or snow went from about 85 % CPU and 60 repaints per second to about 20 %, the same as with no weather. Paused when the card is off screen or the page is hidden, as before.
- Energy flow dots now move at 10 steps per second (same path, same speed) instead of being redrawn on every screen frame, on desktop and on phones: the plan no longer keeps the browser busy while it sits idle. With `animation_level: reduced` or the system "reduce motion" setting, flows still show only their dashed lines, without dots.
- Dawn and dusk fades (night tint, sunlight, sun marker) now advance in small regular steps (at most two per second, below what the eye can see) over the same 40 seconds, instead of a continuous transition repainted on every frame.
- **Faster loading**: the editor now lives in its own file, `maquette-editeur.js`, loaded only the first time you open it (with the plan clean-up engine, the YAML reader and the editor texts). The card itself is about a third of its former size (≈ 300 KB instead of ≈ 920 KB in the release), so dashboards show the plan sooner, and people who never edit never download the editor. HACS installs both files; a manual install needs both in the same folder (only `maquette-card.js` is added as a resource). If the editor file is missing or from another version, the card keeps working and says so when you try to edit.
- Plan animations (energy flows, weather, pulses) now also pause while the page is hidden (other tab, screen off), not only when the card is off screen, and stay paused when the plan is redrawn meanwhile.
- **Previous versions follow your Home Assistant account.** The last 5 saved versions and the last 3 plans from before a clean-up are now stored in your Home Assistant user data (`frontend/set_user_data`, key `maquette-versions:<id>`, no server-side integration) instead of this browser only: they are available on every device you sign in with, and each user has their own history. The editor shows *Versions of this account*. Nothing is sent anywhere but your Home Assistant.
- The browser copy stays as a fallback (older Home Assistant, error): versions already kept in a browser are merged into your account the first time the editor opens, without duplicates. In Home Assistant the list is compressed and limited to 1 MB per card; beyond that the oldest entries go first, never the latest version.

### Fixed

- Editor on a 1440 px wide screen: the keyboard shortcuts button was cut off under *Add* since the *Manage floors* button was added.
- Phone: with the zoom buttons in the header, the card title wrapped onto two lines. The header buttons are now flat icon buttons like the edit button, and the title stays on one line (slightly smaller on screens up to 380 px, cut with “…” only when it really cannot fit).
- Energy flow dots in the showcase under the plan move along their path again (since the flow dots stopped using SMIL, they stayed still in the plan's top-left corner).
- Fewer DOM writes at rest: each state update no longer rewrites identical tooltips, classes, opacities, gradient colours, labels, summary chips or alert outlines (about 200 writes per 20 s down to about 10 on a real plan).
- Editor on a phone: the zoom buttons move to the card header like outside the editor (`interaction.zoom_buttons: auto`,
  `header` or `hidden`), instead of covering the plan; `map` keeps them on the plan. Desktop unchanged.
- An invalid `level` of a room, opening, badge, text or piece of furniture is now reported in the console and the import
  summary like the other removed values.
- A piece of furniture or a badge on a thermostat (`climate`) without `attribute` or `value` shows its target temperature
  (or its low – high range) instead of nothing.
- Thin furniture (electrical panel, radiator, TV stand) keeps its value badge as long as its length is over 24 px on
  screen; the badge is hidden only when the piece is smaller than 24 px both ways.
- Empty plan: the zoom buttons no longer appear on hover.
- Editor, electrical panel card suggestion: the kWh price and the Tempo colours are chosen (current price rather than
  off-peak / peak, a colour rather than a count of remaining days) instead of the first sensor found; when two candidates
  are equally likely, none is picked.

### Added

- **Widget library** in the editor (*Add › Widgets › Widget library*, *Library* in *Add a widget*, pencil on a widget template): one window for all widget templates, with search, a real preview at PC panel or phone size, the widget's own settings and, under each entity field, *Ask each time it is placed*. *Place left* / *Place right* add a copy to the home or a room panel. *New template*, *Duplicate*, *Delete* (copies are detached, nothing breaks). Undo works inside the window. It is a real modal dialog: Esc, focus kept inside and given back.
- **Linked copies**: a widget placed from a template keeps its `id` in `template`. Its window shows *Copy of the “…” template* with *Update* (applies the template, keeps the copy's own “ask” entities), *Open* and *Detach*. *Update the N copies* in the library does the same for every copy of the plan, after a confirmation, in one undo step.
- New `effects` setting (`auto` by default, `full`, `light`; editor: ⚙ Settings › Interaction › *Animations* › *Effects*). `light` draws less while keeping the card alive: window light without blur (sun patches with sharp edges, soft sky glow drawn with gradients only), still cloud shadows and fog. `auto` picks `light` when the main pointer is a touch screen (phones, tablets) and `full` otherwise. It is independent of `animation_level`: `reduced` / `none` and the system "reduce motion" setting still freeze every loop, whatever the effects.
- **Share** templates, widgets and objects: *Share* on a selected widget, badge, opening or piece of furniture (floating bar), in the widget library, or *Share…* in *Export / import the plan*. Tick what to share; the text is a readable YAML (`maquette_share: 1`) or a *compact code* (`MAQ1:`, compressed) for messaging apps. By default your entities are replaced by placeholders (`"<<battery>>"`, with domain, device class and unit), and row and badge names, action data and links are removed; *Keep my entities* shares them as they are. Copy (with a fallback when the clipboard is blocked) or download; nothing is sent anywhere.
- **Import a share**: paste it or open a file, in the same dialog as the plan import (plan, share and compact code are detected). Before anything changes: what is imported, the commands it holds (sensitive ones marked), what was ignored (unknown kind or widget type, unknown or invalid settings), and one row per placeholder to match with your entities (*Fill from a device* proposes a whole device, a single match is proposed, nothing is applied silently; an empty one becomes a field to complete). Add to my templates (default) or place on the plan; the plan is never replaced.
- **Missing entities**: *Clean up the plan* shows *Missing entities (N)* when entities of the plan no longer exist in Home Assistant, with where each one is used, and replaces one everywhere in a single undo step.
- Editor: giving a badge, a piece of furniture, an opening, a room button or a widget a `switch.*` entity now asks
  “Confirm every tap?” (Yes / No, in a notification, nothing blocking) and writes `confirm`. *Yes* is preselected when
  the switch looks like an access (door, gate, garage, lock… in its id, name, icon or device, or a lock / garage door on
  the same device), since a switch can drive a gate. Switches already in a plan, and the card itself, are unchanged.
- Editor: before saving, the items and values the card ignores in the dashboard configuration (no valid coordinates,
  invalid or unknown values, unknown keys) are listed (what, where, why), with *Remove them* or *Keep them as they are*
  (copied unchanged, still ignored on display). They used to be dropped silently.
- `background.room_opacity` (editor: *Layers › Background image › Room floors*, default `0.6`): while a background image is drawn (in the editor, or in the view with `show: always`), room floors are see-through, so the image shows through the rooms and the temperature tint stays on the floor. `1` keeps opaque floors. Before, the floors hid the image and hiding the *Rooms* layer to see it also removed the temperature colours.

### Security

- Every command imported from a share asks for confirmation (`confirm: true`). A share goes through the same checks as a plan import (size, nesting, `__proto__`, colours, icons, numbers, unknown keys dropped), and a cap on the decompressed size of a compact code (zip bomb) and on the number of elements; template ids are regenerated and links to templates (`template`) removed.
- Plan coordinates are bounded to ± 100,000 cm (1 km): a wall, room vertex, opening, badge, text or piece of furniture
  placed further away (e.g. `1e12`) is ignored like one without valid coordinates, with a console warning, instead of
  breaking the framing and the editor. Normal plans are unchanged.

## 0.2.2 – 2026-10-13

### Changed

- **Select / Hand** share one button in the editor, on every screen: tap the active button again to switch between selecting and moving the view (V / H).

### Fixed

- Space + drag did not move the view after clicking a zoom button: Space pressed the button again. It now moves the view; a button reached with the keyboard (Tab) still activates with Space.

## 0.2.1 – 2026-10-13

### Added

- **Copy** and **Paste** buttons in the editor for phones and tablets: *Copy* in the floating toolbar of the selection, *Paste* in the editor bar (or the ⋮ menu) once something is copied. They do the same as Ctrl+C / Ctrl+V, across floors.
- **Pergola** in the furniture catalogue (Outdoor): posts and louvres. Linked to a `cover` (bioclimatic pergola), the louvres narrow as they open (`current_tilt_position`, otherwise `current_position`).
- **Garden shed** in the furniture catalogue (Outdoor), drawn with its two-sided roof seen from above.
- **Outdoor floor** in the floor manager: one click adds a floor named *Outdoor* (garden, patio, outbuildings) with the outer walls of the displayed floor to show where the house stands.
- **Zoom buttons** setting (`interaction.zoom_buttons`, Settings › Interaction), separate from *Locked view*: on the map, in the header (off the map) or hidden, where pinching and tapping a room still work. By default (`auto`) they sit in the header on a phone so they no longer cover the plan.
- **Hand** tool in the editor on touch screens (H): dragging moves the view without selecting or moving anything, handy on a phone to reach a wall once zoomed in. Space + drag still works on a computer.

### Fixed

- Lamp halos and the light coming through windows stopped at the edge of their room even where no wall stands, for example between a living room and an open kitchen drawn as two rooms. Light now spreads over rooms that share an edge with no wall or opening on it, and still stops at walls.
- The halo room setting had no real "none": *— none —* fell back to the room the lamp sits in. It now offers *Automatic (room it sits in)* and *None: free halo* (`room: false`), which is never clipped.

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
