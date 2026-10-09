# Configuration reference

> Every key and enumerated value at a glance, element by element: see the **[reference](reference.md)**.
> Keys are English; configs written for the former French keys must be converted (see [CHANGELOG](../CHANGELOG.md#former-french-keys)).

Everything can be edited with the built-in editor; this page documents the YAML it produces.
Coordinates are in **centimetres**; `y` grows downwards. Entity fields accept any entity id.
Keys and enumerated values (types, options) are English; names, entity ids, numbers, coordinates and service `data`
are free; colours are `#hex`, `rgb()` / `hsl()`, a CSS colour name or `var(--…)`. An unknown key (or a value of an enumeration written with its former French name) is ignored, with a warning in the
browser console. Values that end up in the drawing (coordinates, numbers, enumerated values, colours, icons, links) are
checked when the card reads its configuration: an invalid one is removed, with a warning (see
[Security](reference.md#security)).

## Card

| Key | Type | Default | Description |
|---|---|---|---|
| `type` | string | — | `custom:maquette-card` |
| `id` | string | — | Identifier used by the editor to find the card when saving (recommended if several plans) |
| `title` | string | — | Title |
| `summary` | list / bool | 4 default chips | Summary chips above the plan, see below (`false` or `[]` = none) |
| `full_page` | bool | `true` | Full-height layout without scrollbar on wide screens (≥ 760 px) |
| `editor` | bool | `true` | Show the editor button (admins only) |
| `margin` | number | `40` | Margin around the drawing (cm; editor 0–2000) |
| `language` | `auto` / `en` / `fr` | `auto` | Interface language. `auto` follows the Home Assistant profile language (French for `fr*`, English otherwise); numbers and dates follow the HA locale |
| `rooms` | list | `[]` | Rooms, see below |
| `walls` | list | `[]` | Walls: `[x1, y1, x2, y2]` segments |
| `fences` | list | `[]` | Fences / property limits: `[x1, y1, x2, y2]` |
| `openings` | list | `[]` | Windows, doors, gates |
| `badges` | list | `[]` | Devices placed on the plan |
| `texts` | list | `[]` | `{text, pos: [x, y], size}` |
| `furniture` | list | `[]` | Furniture and named areas, see below |
| `show_furniture` | bool / `"desktop"` | `true` | `false` hides furniture (same as `furniture` in `layers.hidden`), `"desktop"` shows it on wide screens only |
| `layers` | object | — | Layers: drawing order, hidden and locked layers, view button, see below |
| `groups` | list | — | Editor groups `{id, name}`, see below |
| `panels` | object | — | `{left: [widgets], right: [widgets]}` |
| `templates` | list | — | Templates saved from the editor |
| `ambience` | object | — | Night tint, weather, traces, energy flows, people, light, see below |
| `animations` | object | — | One animation per event, see below |
| `alerts` | list | — | Full-plan alerts, see below |
| `badge_style` | object | — | How device badges show (unavailable, inactive, size, values, room view only), see below |
| `palette` | object | — | Named colors `{name: color}`, usable in every color key; elements follow the palette when it changes, see [Settings](#settings-panel-and-global-options) |
| `replay` | bool / object | — | « Replay the day », see below |
| `showcase` | bool / object | — | Examples of animations and ambience under the plan |
| `presence` | entity | `zone.home` | Default presence of `show: away / home` chips and `when_away` alerts, see [Settings](#settings-panel-and-global-options) |
| `room_labels` | object | all `true` | What room labels show, see [Settings](#settings-panel-and-global-options) |
| `temperature_tint` | object / `false` | `{min: 17, max: 28}` | Room colour by temperature, see [Settings](#settings-panel-and-global-options) |
| `legend` | bool | `true` | Legend under the plan |
| `interaction` | object | — | Room tap, locked view, back to the whole plan, see [Interaction](#interaction-wall-tablet-and-animation-level-interaction-tablet-animation_level) |
| `tablet` | bool / object | `false` | Wall tablet mode |
| `animation_level` | `full` / `reduced` / `none` | `full` | Animation level |
| `demo` | bool | — | Built-in demo apartment with simulated states (the rest of the config is ignored, except `title` and `language`); also the card `custom:maquette-card-demo` |

Keys Home Assistant adds to any card (`view_layout`, `layout_options`, `grid_options`, `visibility`, `card_mod`) are kept as
they are.

## Summary chips (`summary`)

Without `summary`, four chips are shown: open windows/doors, lights on, shutters down, mean indoor temperature.
Give a list to choose, order and extend them (click a chip in the editor to configure it):

```yaml
summary:
  - type: openings          # openings | lights | shutters | temperature (computed from the plan)
  - type: temperature
    icon: mdi:thermometer   # optional icon override
  - type: entity            # any entity: "<value> <name>"
    entity: sensor.ev_battery
    name: battery           # text after the value (default: friendly name)
    unit: "%"
    decimals: 0
    alert_above: 90         # red chip above this value…
    alert_state: "on"       # …or when the state equals this
    hide_if: "off"          # hide the chip for this state
```


Every chip accepts `show: away` (only when nobody is home) or `show: home` (only when somebody is home), with `presence:` an entity
(default: the card's `presence`, else `zone.home`: number of people home; a person / group / binary sensor counts as present
when `home` / `on`).

Layout: `new_line: true` starts a new line with this chip, `below: true` stacks it under the previous chip. In the editor,
drag a chip next to another (left / right half), under it (lower part: stack) or below all chips (new line).

## Rooms (`rooms`)

```yaml
- name: Living room
  poly: [[0, 0], [500, 0], [500, 420], [0, 420]]
  label: [250, 210]              # label position (omit to hide)
  temperature: sensor.living_temperature
  humidity: sensor.living_humidity
  temperature_attribute: temperature  # read an attribute instead of the state (e.g. a weather entity); also humidity_attribute
  tap: sensor.living_temperature      # entity opened from the label in room view
  outside: false                 # outdoor area: no temperature tint
  zoom: false                    # no room view on tap (terrace, courtyard…); the label still opens its entity
  area: living_room              # linked HA area (devices, scenes, automations)
  auto_actions: true             # automatic buttons (lights, shutters)
  automations: true              # show linked automations
  actions:                       # custom buttons
    - name: Movie mode
      icon: mdi:movie-open-outline
      action: scene.turn_on
      target: scene.movie          # an entity, or "room" for the whole room
      data: {}                     # service data
      confirm: true                # confirmation dialog even for a safe service (sensitive ones always ask)
  panels: {left: [], right: []}    # widgets shown in room view
```

## Openings (`openings`)

```yaml
- type: window         # window | door | gate
  seg: [90, 0, 410, 0]
  name: Living room window
  contact: binary_sensor.living_window   # red when open; or a list: [binary_sensor.left_leaf, binary_sensor.right_leaf] (open as soon as one is)
  shutter: cover.living_shutter          # drawn outside, darker when closed
  entity: cover.garage_door              # motorised opening (gate)
  outside: [0, -1]                       # outside direction: [-1,0] left, [1,0] right, [0,-1] up, [0,1] down
  shutter_only: false                    # draw only the shutter
  bay: Bedroom bay                       # optional: same name on each leaf = one bay (one card, one line, counted once, one sun patch)
  sill: 0                                # optional, ambience light: bottom of the glazing in cm (0 = down to the floor; auto = 90, or 0 from 180 cm wide)
  height: 215                            # optional, ambience light: top of the glazing in cm
  glazed: full                           # door only, optional: full (glazed full height) | top (small pane at the top) — lets daylight in
  overhang: 80                           # optional, ambience light: roof overhang above (cm); blocks the high summer sun, not the low winter sun
  overhang_height: 0                     # optional: height of the overhang above the top of the glazing (cm)
  slats: tilt                            # optional, with a shutter: tilt (light follows current_tilt_position) | vented (a closed shutter lets streaks through)
  leaves: 2                              # optional: 1 (default) or 2
  swing: left                            # optional: left | right (hinge side seen from inside) | sliding — draws the leaves
  outward: true                          # optional: leaves open outward (default inward)
  animation: wave                        # optional: this opening's animation when open (see "Animations")
  shutter_animation: {type: pulse}       # optional: its shutter's animation while moving
  tap: card                              # optional: card | more_info | none (see "Cards on openings and badges")
  protected: false                       # optional: never "off" from the plan (its card, the room view)
  confirm: true                          # optional: its on / off switch asks for confirmation (e.g. garage door on a switch)
  card:                                  # optional: its card (panel widgets)
    title: Living room bay
    widgets:
      - {type: cover, title: Shutter, entity: cover.living_shutter}
      - {type: entities, title: Sensor, entities: [{entity: binary_sensor.living_window}, {entity: sensor.living_window_battery}]}
```

**Several sensors on one opening.** A bay with a sensor on each leaf can stay one opening: give `contact` a list
(up to 8). It is open as soon as one sensor is, closed when one answers and none is open (the card then mentions the
unavailable sensor), unavailable only when all are. It is counted once in the summary and the `openings` alert, its card
lists one line per sensor, and the replay loads all of them. A single sensor is still written as plain text.

```yaml
- type: window
  seg: [600, 0, 840, 0]
  name: Bedroom bay
  contact: [binary_sensor.bedroom_left, binary_sensor.bedroom_right]
  leaves: 2
  swing: sliding
```

Without `swing` nothing changes on the plan. With it, each leaf and its arc are drawn in thin lines (inward unless
`outward`), or two offset panels for `sliding`.

**In the editor.** *Add › Openings* offers presets (window + shutter + contact, door + shutter + contact, French window,
sliding bay window, tilt and turn window, garage door, gate…) and **Create an opening**: type, leaves, swing, sensors,
animation, with a preview on a wall; *Add* then draw it on a wall, or save it to *My templates*. When an opening is drawn,
its sensors are looked up among the free entities of the room it borders (the room's `area`, else the Home Assistant area
with the same name): one match is linked, several open a short list (that room first, « Other entity… »), none leaves the
field highlighted « to complete ». `outside` points away from the indoor room. A drawn opening keeps its place when its
type, leaves or sensors change (edit dialog, or *Edit in the workshop* to apply another preset), and its edit dialog suggests a free
contact or shutter of the same room, or the type matching the contact's device class. *Add a sensor* under *Contact*
links another one; when several contacts of the room are free, tick them in the short list, then *Link*.

## Devices (`badges`)

```yaml
- entity: light.living_lamp
  pos: [230, 200]
  icon: mdi:floor-lamp         # default: mdi:circle
  name: Lamp                   # tooltip / lists
  color: "#f6c445"             # badge colour when active (default: the theme's active colour)
  light_color: true            # optional: the colour is light, the icon is drawn dark when active (default: guessed from color)
  halo: 170                    # light halo radius (cm); true = 130
  room: Living room            # clip the halo to this room
  active: binary_sensor.motion # entity defining "active" (default: the entity itself)
  active_attribute: hvac_action  # or an attribute of it
  threshold: 20                # active when the value is above
  alert: true                  # blink when active
  value: sensor.plug_power     # value shown in the badge
  attribute: temperature       # or an attribute of the entity (1 decimal by default, `unit` written right after it)
  unit: " °C"
  decimals: 0                  # default 0 for `value`
  tap: card                    # optional: card | more_info | none (see below)
  protected: true              # optional: no "off" from the plan (its card, the room view)
  confirm: true                # optional: its on / off switch asks for confirmation
  card: {title: Lamp, widgets: [{type: tile, entity: sensor.lamp_power, history: 24}]}
```

### Cards on openings and badges

Openings and device badges take the same `card: {title, widgets}`, `tap`, `protected` and `confirm` keys as connected furniture
(see below): the same dialog, built with the same widget engine.

- `tap`: `card` opens the card, `more_info` the HA more-info of the main entity, `none` does nothing. Default: `card`
  when the element has a `card`; without `card` nor `tap` the tap behaves exactly as before (more-info).
- Header: the badge icon, or for an opening an icon by type (window, door, gate; open / closed); the element `name`,
  else the entity friendly name; the state of the main entity (`contact`, else `entity` for an opening, plus the
  shutter position; `entity` for a badge) and its value.
- The header on / off switch only appears for `switch`, `light`, `fan`, `input_boolean` and `humidifier` entities, and
  never when `protected` is set; with `confirm: true` it asks for confirmation before each call. Openings with a card can
  also be reached with the keyboard (Enter / Space). In the room view, the row of an opening or badge with a card opens it
  too; its switch follows the same `protected` (greyed out while on) and `confirm`. A badge or an opening with
  `hidden: true` is not listed in the room view.
- Editor: select an opening or a badge to get the same card tools as for furniture (tap behaviour, protected, *Always ask
  for confirmation*, title,
  widgets with the real rendering in the right column, add / remove / reorder, **Card as template**) and **Fill from
  the device**, built from the entities sharing the `device_id` of the contact, shutter, motorised entity or badge
  entity. Nothing is written before the preview is confirmed:
  - window / door: a `cover` widget for the shutter (`shutter`) or motorised entity, then the contact with its
    battery and tamper sensors, and the day counters of the same device (sensor names containing "ouvertures",
    "aeration", "openings", "airing" or "ventilation");
  - gate: a `cover` widget with `confirm: true`, plus the related sensors of the same device;
  - badge, by domain: `cover` → `cover` widget; `sensor` → tile with a 24 h chart and the other measurements;
    `binary_sensor` → the sensor with its battery / tamper; anything else → as for connected furniture.

## Information boxes (a text with `info`)

```yaml
texts:
  - text: Outside                   # optional title
    pos: [700, -100]
    style: subtle                   # optional: no background
    info:
      - {entity: sensor.outside_temperature}                       # name, icon and unit from the entity
      - {entity: sensor.living_humidity, name: Living room, decimals: 0}
      - {entity: climate.thermostat, attribute: current_temperature, unit: "°C", icon: mdi:thermostat}
```

Values are live; a tap on a line opens its « more info ». In the editor: **Add → Info box**, then add,
reorder and remove entities in its edit dialog ; it moves, groups, hides and duplicates like a text.

## Sub-areas (`sub_area: true` on a room)

A room with `sub_area: true` is a named outline inside another room (kitchen, shower, dining corner…): dashed outline,
no temperature tint, no walls, not counted in the summary chips. In the normal view a click on it opens the room that
contains it. Any polygon works (L-shaped kitchen). In the editor: **Add › Furniture › Sub-areas** (presets, then click
two opposite corners), or tick "Sub-area" on a room drawn with the Room tool. Sub-areas follow their room when it moves.

```yaml
- name: Kitchen
  sub_area: true
  poly: [[-495, -155], [-180, -155], [-180, -90], [-430, -90], [-430, 0], [-495, 0]]
  label: [-340, -122]
```

## Furniture (`furniture`)

Top-view symbols drawn under walls, openings and badges. Plain furniture never catches clicks in the normal view
(a click goes to the room underneath); connected furniture does (see below).

```yaml
- type: double_bed         # see the list below
  pos: [420, 160]          # centre (cm)
  size: [160, 200]         # width × depth before rotation (cm, 5–5000); default = catalogue size
  rotation: 90             # degrees; editor: ±15° and ±90° buttons, or any angle 0–359
  mirror: true             # mirrored (corner sofa, bath…)
  name: Bed                # tooltip; label for `area`
  chairs: 4                # tables only, 0–12
```

| Category | Types |
|---|---|
| Living room | `sofa`, `corner_sofa`, `armchair`, `coffee_table`, `tv_unit`, `shelf`, `rug`, `plant`, `fireplace` |
| Dining | `square_table`, `rect_table`, `round_table`, `chair` |
| Kitchen | `counter`, `sink`, `hob`, `fridge`, `washing_machine`, `dishwasher` |
| Bedroom and office | `single_bed`, `double_bed`, `crib`, `nightstand`, `wardrobe`, `dresser`, `desk` |
| Bathroom | `shower`, `bathtub`, `washbasin`, `toilet` |
| Utilities | `boiler`, `water_heater`, `radiator`, `electrical_panel`, `router`, `ev_charger`, `heat_pump` |
| Shapes and areas | `area` (dashed named area, e.g. "Kitchen corner"), `rect`, `circle`, `stairs` |
| Outdoor | `car`, `bike`, `tree`, `pool` |

`type: custom` is not a category: it is a piece drawn with its own `shape` (*Create furniture*, see below), shown in the
category chosen for its template.

**Custom furniture** (`type: custom`): a `shape` list drawn in order, coordinates in % of `size` from the top left corner
(so the piece can be resized). Values are bounded, unknown shapes are dropped, `color` must be `#rrggbb` (or a colour
name / `var(--…)`) and tints the piece.

```yaml
- type: custom
  pos: [250, 200]
  size: [180, 120]
  name: Corner bench
  color: "#188038"
  shape:
    - {kind: polygon, points: [[0, 0], [100, 0], [100, 40], [40, 40], [40, 100], [0, 100]]}
    - {kind: rounded_rect, x: 60, y: 60, w: 30, h: 30, radius: 8, style: dashed}   # rect | rounded_rect | ellipse
    - {kind: line, points: [[0, 50], [100, 50]]}                                   # line | polygon: 2–24 points
```

| Shape key | Values |
|---|---|
| `kind` | `rect`, `rounded_rect`, `ellipse`, `line`, `polygon` (at most 40 shapes) |
| `x`, `y`, `w`, `h` | % of the size, −50 to 150 (`w`, `h`: 0 to 200, default 100) |
| `radius` | cm, 0 to 500, default 8; `rounded_rect` only |
| `points` | `[[x, y], …]` in %, −50 to 150, at most 24; `line` (2 or more) and `polygon` (3 or more) |
| `style` | `filled` (default), `outline`, `dashed` |

**Create furniture** (*Add › Furniture*): start from a basic shape or any catalogue piece (converted to shapes), set the
name, size in cm, category, search words, colour and shapes (positions in cm) with a preview to scale, optionally
connected to an entity; *Add* to place it, or save it to *My templates*: it then shows in its category of the catalogue,
with *Edit*. A placed piece (catalogue or custom) opens in the same workshop from its edit dialog (*Edit the shape*).
Shapes can also be edited **directly in the preview**: click or tap one to select it, drag it, resize it with its 8
handles (Shift keeps the proportions), drag the points of a line or polygon (*+* in the middle of an edge adds one, a long
press or Delete removes one, at least 3 remain). Shapes snap to a 5 cm grid and to the edges and centres of the piece and
of the other shapes (Alt or the magnet button turns snapping off) and stay inside the piece. Arrows move by 1 cm (Shift:
10 cm), Delete removes the shape, Ctrl+Z / Ctrl+Y undo and redo inside the workshop. The cm fields follow, and typing a
value still works; the YAML keeps the same keys, in % of `size`.

Rugs and named areas are drawn below the other furniture (`level: -1` by default). Furniture inside a room follows it
when the room is moved or resized in the editor. To keep furniture from being selected while drawing, lock the Furniture
layer (padlock in the Layers panel, see Layers).

## Layers (`layers`)

Every element belongs to a fixed layer, by kind. Layers form two groups, each with its own order; the overlay group
(labels, badges, texts) is always above the drawing.

| Group | Layers (default order, bottom → top) |
|---|---|
| Drawing (`drawing_order`) | `rooms`, `sub_areas`, `halos`, `furniture`, `fences`, `walls`, `openings` |
| Above the drawing (`overlay_order`) | `room_labels`, `area_labels` (named areas, sub-areas), `badges` (device badges), `texts` |

```yaml
layers:
  drawing_order: [rooms, sub_areas, furniture, halos, fences, walls, openings]  # bottom → top; missing layers follow in default order
  overlay_order: [room_labels, area_labels, badges, texts]
  hidden: [fences]          # hidden in the view (drawn at 25 % and not clickable in the editor)
  locked: [walls, rooms]    # not selectable in the editor (clicks go through); no effect in the view
  view_button: true         # "Layers" button next to the zoom buttons: each viewer hides layers for himself
```

- Per element (rooms, devices, texts, openings, furniture): `hidden: true` hides it in the view (it still counts in the
  summary chips), `level: <number>` orders it inside its layer (default `0`, rugs and named areas `-1`; higher = on top).
  Walls and limits are plain segments: they only have the layer settings.
- A named area's label is hidden with the Furniture layer; a sub-area's label with the Sub-areas layer.
- The view button keeps each viewer's choice in the browser (`localStorage`, per plan `id`), never in the config;
  it is ignored once `view_button` is removed.
- Editor: the **Layers** toolbar button opens a dialog (drag handle or ↑ / ↓ keys to reorder, eye, padlock,
  element counts, reset order, view button, and *Plan elements*: every room, device, opening, piece of furniture, text,
  widget, summary chip and group by category, a click selects it and opens its edit dialog; Esc comes back to Layers). The
  element's edit dialog has **Hide in view** and **Bring to front / Send to back**, also in its floating toolbar.

### Connected furniture

Any piece of furniture can be linked to entities, with the same keys and meaning as device badges (`badges`):

```yaml
- type: ev_charger
  pos: [495, -870]
  name: Charger
  entity: switch.charger_plug                 # state → "active" look; on / off button in its card
  value: sensor.charger_plug_power            # value badge on the furniture (unit from HA, or `unit`, `decimals`)
  active: sensor.charger_plug_power           # entity defining "active" (default: entity) …
  threshold: 50                               # … above this value
  active_attribute: hvac_action               # or an attribute (as for badges)
  color: "#188038"                            # accent when active (default: theme primary colour)
  tap: card                                   # card (its card) | more_info (HA more-info) | none; default: card if `card`, else more_info
  protected: true                             # no "off" in its card (fridge, freezer…); "Turn back on" only when it is off
  confirm: true                               # its card's on / off switch asks for confirmation (even for a safe service)
  card:                                       # its card: a stack of panel widgets (same types and keys as `panels`)
    title: EV charging
    widgets:
      - {type: ev, title: Car, battery: sensor.ev_battery, power: sensor.charger_plug_power, session_kwh: sensor.charger_session}
      - {type: entities, title: Charger, entities: [{entity: sensor.charger_voltage}, {entity: sensor.charger_energy_today}]}
```

- View: active furniture gets an accent outline and tint, a dashed outline when its entity is unavailable, and a value
  badge (hidden while the furniture is smaller than 24 px on screen). Only connected furniture is clickable, through a
  centred button of at least 44 × 44 px (keyboard and screen readers: name, state and value).
- Card: a modal dialog (bottom sheet on phones) with name, state, on / off switch for `switch`, `light`, `fan`,
  `input_boolean` and `humidifier` entities (never "off" when `protected`, confirmed first with `confirm: true`), its
  widgets (updated live), a **More info** ⓘ button (configurable
  with `card.more_info`: another entity, a dashboard path or URL, or `false` to hide it) and ✕ to close. Inside a card,
  widget rows show values (no toggles, no *Activate* button; a tap on a value opens its HA more-info). The services a card
  can call: `turn_on` / `turn_off` of the element's own entity (the switch, also for `humidifier`), and the buttons of its
  `cover` (open / stop / close a cover or a valve), `lock` (lock / unlock / open) and `thermostat`
  (`climate.set_temperature`) widgets. Sensitive services (unlock, open a garage door, a gate, a valve…) always ask for
  confirmation in a dialog that names the real action and entity; `confirm: true` asks for it on safe services too (see
  [Security](reference.md#security)).
- On a computer the card grows with its widgets instead of scrolling: about 420 px for one widget, 760 px for two
  (two columns), `min(1120px, 100vw - 48px)` for three or more (up to three columns), up to 92 % of the screen height;
  scrolling only as a last resort. On phones it stays a bottom sheet, one column.
- Editor: "Connected" section in the furniture panel (entity, value, tap behaviour, protected, *Always ask for
  confirmation*, advanced: active entity /
  threshold / unit / decimals / colour) and its card: the right column shows the real card while the furniture is
  selected (click a widget to edit it with the usual widget form, drag to reorder, **Add a widget to the card**).
  **Card as template** saves all its widgets as one widget template, usable in another card or in a side panel; any
  widget template can be added to a card.
- **Fill from the device**: once the entity is chosen, the editor proposes widgets built from the other entities of
  the same HA device (`device_id`, hidden and configuration entities left out), by furniture type: EV charger (power
  chart, energy and cost per session / day / month, voltage, temperature, alerts), electrical panel (power gauge up to
  the subscribed power if a sensor gives it, else 6000; apparent power, voltage, current, daily energy; Tempo colours
  and price found anywhere in HA), boiler (climate and temperatures), any other appliance (power chart with energy and
  cost, media player for a TV). It may also propose the badge value and "active above 5 W" (50 W for a charger) for a
  plug. Nothing is written before the preview (real rendering) is confirmed: **Add** or **Replace the card**.
- **Merge with the badge**: when a device badge of the same entity is less than 1.5 m away, the furniture panel offers
  to merge it: the badge is removed, its value / active / colour settings move to the furniture (undo available).

Connected furniture is tinted with its colour at rest and brighter when active: `color` (default per type: fridge cyan,
TV violet, desk orange, electrical panel yellow, router teal, boiler red, car / charger green…), `tint: false` = colour only when active.

## Ambience (`ambience`)

Optional, discreet by default, never drawn while editing (except as a preview while its editor panel is open).

```yaml
ambience:
  intensity: subtle         # subtle (default, 0.45) | normal (0.7) | strong (1) | a number 0–1
  north: 45                 # where north points, degrees clockwise from the top of the plan
  day_night: true           # night tint from sun.sun (stronger outside), sunlight from the sun's side, sun marker on the edge
  # day_night: {sun: sun.sun, intensity: 1, marker: false}
  weather: weather.home     # Home Assistant weather painted on outdoor rooms (outside: true): drifting cloud shadows,
                            # rain, snow, hail, wind, fog, lightning ; or {entity, intensity, direction}
                            # direction: 135 (default, top left → bottom right) | any angle (clockwise from the top) | wind (real wind)
  traces: 10                # minutes (up to 240): what just changed keeps a fading outline (numeric sensors excluded) ; false = off
  # traces: {duration: 10, color: "#1a73e8"}
```

As soon as `ambience` is present (even `ambience: {}`), `day_night` and `traces` (10 min) are on unless set to `false`.

Also in `ambience`:

```yaml
  energy: {}                # beads from the electrical panel (furniture `electrical_panel`) to every furniture / device whose
                            # `value` (else `active`, else `entity`) is a power (W, kW), speed and count following the power ;
                            # {source: 3 (furniture index) or a furniture type, threshold: 5, color, badges: false (no flow to the device badges)}
  people: {home: Living room}   # person.* (or entities: [...]): at home = side by side at `home` ([x, y] or a room name),
                            # away = on the plan edge in their real direction (HA home coordinates + `north`) with the distance or zone
  # people: {home: [420, 310]}   # a free spot in cm
  light: true               # on by default with the ambience; false = off. Or {sun, moon, lamps}, each true by default:
                            # sun: patches of sunlight on the floor behind the windows facing the sun (sun.sun azimuth + `north`,
                            #   elevation = length), shortened by the linked shutter's position, nothing when it is closed
                            # moon: a cool glow at night, in the moon's direction (computed from the HA latitude / longitude and the time);
                            #   moon: sensor.moon_phase = phase from that sensor (else computed)
                            # doors: open (default) | closed: an inside door without a sensor; daylight reaches the next room through
                            #   an open inside door or an interior glass wall (one step, fainter)
                            # lamps: halos of the lights (badges with `halo`) in their color (rgb_color, hs_color, color_temp_kelvin)
                            #   and brightness, blending where they overlap, kept inside their room
                            # sky / bounce / sun: true, false or a strength from 0 to 2 (1 = default) for the sky glow, the glow
                            #   bounced around the patches and the direct patch (sun: false = no daylight at all)
                            # sky_diffusion: 0 (sharp beam) to 1 (wide blur growing with the depth), 0.6 by default
                            # sky_kelvin / sun_kelvin: auto (default) or a color temperature from 1800 to 10000 K
```

In the editor, with the *Ambience and animations* dialog open (live preview), drag the avatars of the people at home to
place them: `home` becomes `[x, y]` (cm, snapped to the grid, Alt for free). The room list of the dialog brings them back
to a room or to the centre.

Sun and moon patches only use `window` openings and glazed doors (`glazed: full | top`) with `outside` set, inside a room
(sill 90 cm, top 215 cm, a window of 180 cm or wider = a bay down to the floor; glazed door 0 to 215 cm, or 150 to 200 cm
for `top`). A roof `overhang` shortens or removes the sun patch when the sun is high. Daylight also reaches the next room
through an open inside door or an interior glass wall (`light.doors`), and `slats` (`tilt` / `vented`) lets light through a lowered shutter. With a weather entity, its
`cloud_coverage` grades the direct sun; clouds, fog and rain are only painted outside. Settings: ⚙ Settings › *Display* › *Light*.

Nothing leaves Home Assistant (no external service). Animations pause when the plan is off screen and follow
`prefers-reduced-motion`. A Home Assistant restart (many entities changing at once) leaves no traces.

## People and device badges display (`ambience.people`, `badge_style`)

How people and device badges show on the plan. Every key is optional; the defaults keep the behaviour described above.

```yaml
ambience:
  people:
    home: Living room
    away: direction        # direction (default): on the plan edge, in their real direction, with the distance or zone
                           # zone: a row of discreet chips along the bottom of the plan, with the HA zone name
                           #       ("Away" outside any zone), no direction nor distance
                           # hidden: a person away is not shown at all
    at_home: grouped       # grouped (default): side by side at `home` | hidden
    avatar: picture        # picture (default): HA profile picture if any, otherwise initials | initials
    persons:               # per person, same keys, they win over the shared ones
      person.camille: {away: hidden}
      person.sam: {away: zone, avatar: initials}

badge_style:               # device badges (`badges`)
  unavailable: dimmed      # dimmed (default, faded) | dashed (dashed outline) | hidden
  inactive: shown          # shown (default) | active_only (shown only while active: `active`, `threshold`, attribute or state,
                           #   same rule as the badge colour) | dimmed
  size: normal             # small (0.8 ×) | normal (default) | large (1.25 ×) ; badges keep the same size on screen when zooming
  values: always           # always (default) | hover (value on mouse hover and keyboard focus; always shown on touch screens
                           #   without hover) | never
  zoom_only: false         # true: badges only show in the view of their room (a badge's own `zoom_only` wins)
```

- A person or badge hidden by these settings is no longer drawn, clickable or read by screen readers. It still counts in
  the summary chips and still appears in the room view and its lists (a badge with `hidden: true` does not); a badge in a full-plan alert stays visible. In the
  editor every badge stays visible so it can be edited.
- Unavailable badges follow `unavailable` whatever `inactive` says.
- The replay, the showcase (« Person away » example) and the replay timeline follow these settings (no arrival marks for a
  person hidden both at home and away). Full-plan alerts are unchanged: `when_away` still uses `presence`.
- Editor: the shared settings are in the ⚙ Settings dialog (tabs « People on the plan », « Device badges »); in the *Ambience
  and animations* panel, the People part has one row per person with « Like the others / Direction and distance / Zone / Hidden »
  for when they are away.

## Full-plan alerts (`alerts`)

```yaml
alerts:
  - name: Smoke detected
    entities: [binary_sensor.smoke_kitchen]  # or entity: … ; active when on / open / triggered / detected
    level: critical                           # critical (default, red) | warning (amber) | info (accent, no pulse)
    icon: mdi:smoke-detector                  # optional (default by level)
  - name: Opening while nobody is home
    type: openings                            # every opening of the plan
    when_away: true                           # only when nobody is home (presence, default zone.home)
  - {name: Freezer too warm, entity: sensor.freezer_temperature, above: -12, level: warning}   # or state:, below:
```

`enabled: false` turns a rule off without removing it.
While an alert is active: a pulsing veil around the whole plan, a banner (name, elements, details, hide until the next
change) and the elements concerned circled by a wave. Never while editing.

## Replay (`replay`)

`replay: true` (or `{hours: 48}`, 1–72, default 24) adds a « Replay the day » button next to the zoom: the history of every
entity of the plan is loaded once (with every attribute change for shutters, sun, weather, people, climate and media players), then the whole plan — colours,
openings, shutters, lights, ambience, people, alerts and side panels — is drawn at the chosen moment. Timeline with play /
pause, speed (×60 to ×3600) and marks (openings in red, lights in yellow, arrivals in accent) ; live updates are ignored
until « Back to live ». Never while editing.

## Showcase (`showcase`)

`showcase: true` draws, under the plan, every animation type, every weather and the ambience effects (night, low sun,
trace, energy flow, alert, person away) ; `showcase: {pos: [x, y], width: 1200}` to place it (`width`: 700 at least,
default the plan width).

## Settings panel and global options

**Saving.** *Apply* (Ctrl+S) saves the card and keeps the editor open, with a « Plan saved. » message; *Save* saves and
leaves the editor. **Locking.** `locked: true` on a room, opening, badge, text or furniture (padlock in its floating toolbar and its edit
dialog): it stays selectable and editable in its edit dialog, but no longer moves or resizes with the mouse or the arrow keys, and a click on it goes
to what lies underneath. Walls and fences lock by layer only (`layers.locked`, above).

The **⚙ Settings** button of the editor toolbar opens a centred dialog with tabs (full screen on phones, in the « More
tools » menu ⋮) with the options that concern how the whole card works rather than the drawing. Every change is previewed live under
the dialog and can be undone (Ctrl+Z); a setting put back to its default value is **removed** from the YAML. Tabs: General
(`title`, `language`, `full_page`, `margin`, `editor`), Display (`show_furniture`, `layers.view_button`), Features (`replay`,
`replay.hours`, `replay.speed`, `showcase`, `presence`, and *Set elsewhere*: links to Full-plan alerts and Summary chips,
which have no toolbar button), Rooms and legend (`room_labels`, `temperature_tint`, `legend`), People on the plan and Device
badges (see below), Interaction (with Wall tablet and Animations). Help texts sit behind ⓘ buttons (tooltip on hover or
keyboard focus, popover on tap). Keyboard shortcuts: the ⌨ toolbar button or the « ? » key (hidden on touch-only screens). Turning
the editor button off asks for confirmation in the dialog: to get it back, edit the card in Home Assistant (code editor) and
remove `editor: false`.

| Key | Type | Default | Description |
|---|---|---|---|
| `room_labels` | object | all `true` | `{name, temperature, humidity}`: `false` removes that element from every room label (the name stays available to screen readers); a label left empty is hidden |
| `temperature_tint` | object / `false` | `{min: 17, max: 28}` | Room colour by temperature: blue at `min` (°C) and below, red at `max` and above; also the ends of the legend. `false`: no temperature tint, and no gradient in the legend. An inconsistent pair (`min` ≥ `max`) falls back to the default |
| `legend` | bool | `true` | `false` hides the legend under the plan |
| `palette` | object | — | Named colors (tab Display › *Named colors*): `{accent: "#e8710a", wall_blue: "rgb(30, 90, 160)"}`. Every color picker of the editor offers them (traces and energy flows: YAML only); a `color: accent` follows the palette when it changes. Name: lowercase letter first, then lowercase letters, digits, `_` or `-` |
| `presence` | entity | `zone.home` | Default presence of the `show: away / home` chips and of the `when_away` alerts: a zone (number of people), a person or a group (`home` / `on`). A chip or an alert with its own `presence` keeps it |
| `replay.speed` | `60` / `300` / `900` / `3600` | `900` | Starting speed of the replay (seconds of the day per second); the speed selector of the timeline still changes it |

```yaml
room_labels:
  humidity: false
temperature_tint:
  min: 18
  max: 26
legend: false
presence: group.family
replay:
  hours: 48
  speed: 3600
```

## Animations (`animations`, `animation`)

One animation per event, for the whole plan; any opening, device or connected furniture can override it.

```yaml
animations:
  opening: {type: pulse, duration: 1.6}        # door / window open (default)
  shutter: {type: scroll, duration: 0.8}       # shutter moving (default)
  alert: {type: pulse, duration: 1.2}          # device with "alert: true", when active (default)
  light: {type: halo, color: "#ffd54f"}        # light on (default: none)
  badge: wave                                  # other active device (default: none)
  furniture: {type: breathe, duration: 3}      # active connected furniture (default: none)
```

Types: `none`, `pulse`, `breathe`, `blink`, `halo`, `wave`, `scroll`. Settings: `color`, `duration`
(seconds per cycle, 0.2–20), `intensity` (0.2–2), and for furniture `shape: outline` (the wave follows its outline).
On an element: `animation: halo` or `animation: {type: wave, color: "#e91e63"}` (`shutter_animation` for a shutter).

## Interaction, wall tablet and animation level (`interaction`, `tablet`, `animation_level`)

Three root keys, all optional: without them the card behaves exactly as before. They are also in the editor's ⚙ Settings
(tab *Interaction*, sections *Interaction*, *Wall tablet* and *Animations*). None of them applies inside the editor, which always shows
everything and keeps free zoom.

```yaml
interaction:
  room_tap: room_view   # room_view (default) | more_info | none
  lock_view: false      # true: no panning nor zooming, zoom buttons hidden
  reset_after: 0        # seconds without interaction before going back to the whole plan; 0 (default) = never
tablet: true            # or {summary: false, panels: false, burn_in: true}
animation_level: full   # full (default) | reduced | none
```

| Key | Type | Default | Description |
|---|---|---|---|
| `interaction.room_tap` | `room_view` / `more_info` / `none` | `room_view` | Tapping a room (its floor or its label): open the room view; open Home Assistant's « more info » of the room's `tap` entity (otherwise its `temperature`; nothing if it has neither); or do nothing. A room with `zoom: false` keeps its own behaviour (its label opens its entity) |
| `interaction.lock_view` | bool | `false` | No panning, no wheel / pinch zoom (not even in a room view), zoom buttons hidden. Tapping rooms, badges, furniture and openings still works |
| `interaction.reset_after` | number (s, 0–86400) | `0` | After this many seconds without any interaction with the card: room view closed, initial zoom, cards and layer menu closed, a paused replay back to live. Never while editing or while a replay is playing. `0` = never |
| `tablet` | bool / object | `false` | Wall tablet mode, see below |
| `tablet.summary` | bool | `false` | Show the summary chips in tablet mode |
| `tablet.panels` | bool | `false` | Show the side panels (home and rooms) in tablet mode; the room view's own card stays |
| `tablet.burn_in` | bool | `true` | Burn-in protection: the whole card moves by one pixel every 3 minutes, within 2 px of its place, back and forth (never a jump) |
| `animation_level` | `full` / `reduced` / `none` | `full` | `full`: every animation (the system « reduce motion » setting is still respected). `reduced`: nothing loops (pulses, waves, blinking, weather, energy flows, alert pulse), state changes stay visible with short transitions. `none`: no animation and no transition at all, as with « reduce motion ». The replay and the showcase follow it |

**Tablet mode** (`tablet: true` = `{summary: false, panels: false, burn_in: true}`; an object sets each point, missing keys
keep these values): the summary chips and side panels are hidden and the plan fills the whole card, full page (like
`full_page`, whatever the width), centred in the height of the screen. With an empty `title`, there is no header: the
editor button joins the plan's buttons, and the header only comes back in a room view (back arrow and room name).
Tablet mode does not lock the view. Recommended for a wall-mounted tablet:

```yaml
title: ""
tablet: true
interaction:
  lock_view: true
  reset_after: 60
```

## Groups (`groups`)

Any element (room, wall, limit, opening, device, text, furniture) can belong to a group: `group: <id>` on objects,
a 5th value on walls / fences (`[x1, y1, x2, y2, "<id>"]`). `groups: [{id, name}]` lists them.
In the editor: select several elements, **Group** (Ctrl+G) / **Ungroup** (Ctrl+Shift+G). The first click on a member
selects the whole group (drag = move it); a second click without dragging selects the element alone.

## Templates (`templates`)

Written by the editor (*Template* button of an element, *Save card as template*), reused from **Add › My templates**:
`{id, name, kind: badge | opening | furniture | widget, icon, description, type, domain, item: {…}}` — `item` is a badge, an
opening, a piece of furniture (with `type`) or a widget, with the keys of that element; a card template keeps all its
widgets in `items: [...]`. Without « keep the entities », entity keys are left out and asked again (`value: $entite` = the
chosen entity).
Templates made with **Create a widget**, **Create an opening** or **Create furniture** carry a short `id` and `ask` (entity
fields to choose at each use, e.g. `ask: [entity]`): they are left empty and highlighted when the template is placed.
Opening templates use `ask` for their sensors (`contact`, `shutter`, `entity`), looked up in the room at each drawing;
furniture templates add `type`, `category` (`living`, `dining`, `kitchen`, `bedroom`, `bathroom`, `utility`, `shapes`,
`outdoor`) and `keywords`, and `ask: [entity]` with `domain` for a connected piece (without `domain`, any entity can be
chosen); `domain` also narrows the entity picker of a badge template.

**Ready-made widgets.** *Add a widget* also offers about 65 ready-made widgets by category (air, light, security, water,
energy, openings, heating, appliances, media, outdoor, network, presence, vehicle), built on the types below with sensible
bounds (CO₂ 400–2000 ppm with `severity`, illuminance 0–1000 lx…). On insertion, matching entities are looked up by
domain, device class and unit: one match is taken, several open a short list (the target room first, plus « Other
entity… »), none leaves the field highlighted.

## Widgets (`panels.left` / `panels.right`)

Common keys: `type`, `title`, `icon`, `color`, `confirm` and `rows` (list of `{entity, name, icon, decimals, unit}`).
`rows` is read by `tile`, `gauge`, `tariff`, `ev`, `thermostat`, `cover` and `lock` only; in a row, a light or a switch gets
a toggle and a scene / script / button an *Activate* button, as in `entities`. `title` defaults to the entity name for
`tile`, `gauge`, `cover`, `lock` and `thermostat`.

`confirm: true` asks for confirmation before every service the widget calls, even a safe one (row toggles, *Activate*,
thermostat −/+, cover and lock buttons); a sensitive service (script, unlock, open a garage door…) is confirmed anyway,
even with `confirm: false`. In the editor: *Always ask for confirmation* (lists, thermostat, widgets whose rows have a
toggle or an *Activate* button) or *Confirm before acting* (`cover`, `lock`).

| `type` | Keys |
|---|---|
| `tariff` | `price` (unit from the entity, else €/kWh), `period` (green off-peak, orange peak, neutral when unavailable), `color_today`, `color_tomorrow` (Tempo: Bleu / Blanc / Rouge or Blue / White / Red) |
| `ev` | `battery`, `range`, `power` (in its own unit: W or kW), `threshold` (W, default 50), `plugged`, `session_kwh`, `session_cost` |
| `gauge` | `entity`, `min` (default 0), `max` (default 100), decimals allowed (pH 6.5–8.5), `unit`, `decimals` (default 1, 0 from 100), `severity` (`{green, yellow, red}`: each colour from its value, like the HA gauge card) |
| `tile` | `entity`, `unit`, `decimals` (default 1, 0 from 100), `history` (hours of chart, 0–72 in the editor; absent or 0 = none) |
| `entities` | `entities` (same format as `rows`; lights, switches, fans, humidifiers and input booleans get a toggle, scenes / scripts / buttons an *Activate* button, problem sensors turn red when `on`) |
| `periods` | `periods` (default `[day, week, month, year]`), `columns`, `note` |
| `divider` | `title` (optional section title), `spacing` (px above and below) — a divider line |
| `cover` | `entity` (a `cover` or a `valve`), `confirm` (bool), `rows` — see below |
| `lock` | `entity` (a `lock`), `confirm` (bool; `true` confirms Lock too; Unlock and Open are always confirmed), `rows` — Unlock when locked, Lock when unlocked, Open if supported |
| `thermostat` | `entity` (a `climate`), `confirm`, `rows` — see below |
| `climate` | `duration` (min, default 30, 5–240), `rooms`, `outside`, `stable_t` (0.3), `alert_t` (1.5), `stable_h` (2), `alert_h` (10), `t_min`, `t_max`, `h_min`, `h_max`, `average` — see below |

`periods` columns use either **HA statistics** (calendar day/week/month/year change of a cumulative sensor):

```yaml
columns:
  - {name: Energy, unit: kWh, stat: sensor.energy_total, factor: 0.001, decimals: 1}
```

or four entities: `{name: Cost, unit: €, day: sensor.cost_day, week: …, month: …, year: …}`.
`factor` (default 1) multiplies the values in both cases; `decimals` defaults to 2.
The editor also writes `source: stat | entities` to remember which of the two a column uses.


### Cover control (`cover`)

Shutters, blinds, gates, garage and motorised doors (any `cover` entity), or a `valve` (water shut-off, irrigation:
`valve.open_valve` / `stop_valve` / `close_valve`, confirmed by default), in a side panel or a card:

```yaml
- type: cover
  title: Gate                 # default: the entity friendly name
  entity: cover.gate
  confirm: true               # default: true for device_class garage, gate or door and for a valve, false otherwise
  rows: [{entity: binary_sensor.gate_closed}]
```

It shows the state, the position (`current_position`, with a progress bar) and three buttons: **Open**, **Stop**,
**Close**, calling `cover.open_cover`, `cover.stop_cover` and `cover.close_cover` on the widget's `entity` only (Stop is
hidden when the entity's `supported_features` lacks it; buttons are inactive while it is unavailable). With
`confirm`, a dialog names the action and the entity before it runs (*Cancel* has the focus). Opening a valve, a garage
door, a gate, a door or a cover without a shutter-like device class is **always** confirmed, even with `confirm: false`.
Nothing happens from the editor's preview.

### Thermostat (`thermostat`)

```yaml
- type: thermostat
  entity: climate.living_room   # measured temperature, set point with −/+ (device step and limits), heating / idle, mode
  confirm: true                 # optional: each −/+ asks for confirmation
  rows: [...]
```

### Room climate (`climate`)

```yaml
- type: climate
  title: Room climate
  duration: 30         # trend window (minutes)
  rooms: [Bedroom, Living room]   # default: every room with a temperature or humidity sensor
  outside: false       # hide outdoor rooms
  stable_t: 0.3        # flat arrow below this change (°C), alert_t: 1.5 → alert at or above
  stable_h: 2          # same for humidity (%), alert_h: 10
  t_max: 28            # optional absolute limits: t_min, t_max, h_min, h_max
  average: true        # first line: indoor average and its trend
```
One line per room (rooms sharing the same sensors are shown once): temperature and humidity, arrow up / down / flat with the
change over `duration` minutes (from HA history), red alert icon when the change or an absolute limit is exceeded.

## Export / import

In the editor, the **file** button of the toolbar shows the whole plan as YAML or JSON (English keys, as in the dashboard):
copy it, download it, or paste / open a plan and click **Import** to replace the current one (undo with Ctrl+Z, then save).
Before anything is applied, **Check before importing** lists what the plan can control: the services of the room buttons
(sensitive or `confirm: true` ones marked *Confirmed on every tap*), the entities controlled by widgets (cover, lock,
thermostat, *Activate* rows), the *More info* links, the values
removed as invalid (with their path, e.g. `badges[0].color`) and the dashboard keys of the file that are ignored; **Import**
applies it, **Cancel** keeps the current plan. Re-importing the plan unchanged applies it directly. The card `type`, `id` and
its dashboard keys (`view_layout`, `grid_options`, `visibility`, `card_mod`…) are kept. Limits: 2 MB, 5,000 items per list.
YAML import uses [js-yaml](https://github.com/nodeca/js-yaml) (MIT), bundled, without its extended types.
An export made before the English keys (French keys `pieces`, `murs`…) is refused with a message: convert it first (see the
[CHANGELOG](../CHANGELOG.md#former-french-keys)).

## Clean up the plan

In the editor, **Clean up the plan** (magic wand in the toolbar, *More* on a phone) checks walls and openings against the
room outlines, which are the reference. A dialog shows the plan with each defect circled (click one to zoom on it),
*Before* / *After*, and the fixes to apply, each with its count:

| Fix | Default | What it does |
|---|---|---|
| Snap walls and openings to rooms | on | gaps and offsets up to 12 cm, wall ends overshooting a corner |
| Cut walls under openings | on | a common drawing style, not counted as a defect |
| Remove wall stubs sticking out | on | wall pieces under 35 cm inside a room |
| Merge aligned and duplicate walls | on | walls split at every corner, doubled, or drawn thick as 2 parallel lines (≤ 25 cm apart, no room edge between them) |
| Add missing walls | off | outer side, from the outline, room by room; also generates the walls of an indoor room that has none. Never on `outside: true` rooms |
| Close passages between rooms | off | shared edges without a wall, room by room |
| Snap nearly matching corners | off | room corners less than 6 cm apart: the only fix, with rounding, that changes room shapes |
| Round to 5 cm | off | corners, walls and openings; offered only when at least 30 % of the coordinates are off the 5 cm grid (plan traced from an image) |
| Set the outside side of windows | off | a window or glazed door without `outside` (an indoor room on one side only) gets no daylight; sets `outside` towards the exterior. An interior glass wall between two rooms is left alone |
| Remove shutters linked to nothing | off | `shutter` pointing to an entity that does not exist, or `shutter_only` without a `shutter`: the link is removed |

**Apply** is a single undoable action (Ctrl+Z, or *Undo* in the notification). Running it again right after finds
nothing more. The result does not depend on how walls were drawn nor on the plan's orientation.

Before applying, a copy of `rooms`, `walls` and `openings` is kept in this browser (the last 3, next to the saved
versions). **Plans before clean-up** (link in the dialog, *More › Restore a plan from before clean-up* on a phone)
previews them, restores one (undoable), or copies it as YAML to paste on another device. No new configuration key.

