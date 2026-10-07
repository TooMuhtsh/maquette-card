🇫🇷 [Version française](reference.fr.md)

# Maquette reference

Every element of a Maquette card and every key it accepts, one section per element, with types, values, defaults, a
valid YAML example and where to find it in the built-in editor.

> **How this page relates to configuration.md (`docs/configuration.md`, published with the code).** This page is the exhaustive *reference*: a lookup
> table for every public key and enumerated value. configuration.md (`docs/configuration.md`, published with the code) remains the detailed *guide*:
> behaviour, editor workflows and longer explanations. When the two disagree, the code wins; please report it.

## Contents

- [Conventions](#conventions)
- [Card root](#card-root)
- [Global settings](#global-settings)
- [Rooms and sub-areas](#rooms-and-sub-areas)
- [Walls](#walls)
- [Fences](#fences)
- [Openings](#openings)
- [Device badges](#device-badges)
- [Texts and info boxes](#texts-and-info-boxes)
- [Furniture](#furniture)
- [Connected furniture](#connected-furniture)
- [Cards](#cards)
- [Panels](#panels)
- [Widgets](#widgets):
  [tariff](#widget-tariff) · [ev](#widget-ev) · [gauge](#widget-gauge) · [tile](#widget-tile) ·
  [entities](#widget-entities) · [periods](#widget-periods) · [divider](#widget-divider) · [cover](#widget-cover) ·
  [thermostat](#widget-thermostat) · [climate](#widget-climate)
- [Summary chips](#summary-chips)
- [Layers](#layers)
- [Groups](#groups)
- [Templates](#templates)
- [Ambience](#ambience):
  [day and night](#day-and-night) · [weather](#weather) · [traces](#traces) · [energy flows](#energy-flows) · [people](#people)
- [Badge style](#badge-style)
- [Full-plan alerts](#full-plan-alerts)
- [Animations](#animations)
- [Replay](#replay)
- [Showcase](#showcase)
- [Interaction](#interaction)
- [Wall tablet](#wall-tablet)
- [Animation level](#animation-level)
- [Demo](#demo)
- [Preserved Home Assistant keys](#preserved-home-assistant-keys)
- [Key index](#key-index)
- [Enumerated values](#enumerated-values)

## Conventions

- **Units.** Coordinates and sizes on the plan are in **centimetres**. `x` grows to the right, **`y` grows downwards**
  (screen convention). A point is `[x, y]`, a segment `[x1, y1, x2, y2]`, a polygon a list of points.
- **Angles** are in degrees, clockwise (`rotation`, `north`, `direction`).
- **Entities.** Any field typed *entity* takes a Home Assistant entity id (`sensor.living_temperature`). Fields typed
  *attribute* take an attribute name of that entity (`current_temperature`).
- **Booleans** are `true` / `false`. Booleans written as text (`"false"`, `"no"`, `"off"`, `"0"`, `"true"`, `"yes"`…) are
  read as booleans for boolean keys; numbers written as text (`"120"`) are accepted for coordinates and numbers.
- **Free values.** Names, entity ids, icons (`mdi:…`), colours (`#rrggbb`, a CSS colour name or `var(--…)`), numbers,
  coordinates, service `data` and HA states are copied as they are. Only **keys** and **enumerated values** (the
  *Values* column, listed again under [Enumerated values](#enumerated-values)) are part of the schema.
- **Unknown keys.** A key that is not in this page, or an enumerated value written with its former French name, is
  ignored with a warning in the browser console (`maquette-card : unknown key « … » (ignored)`). A configuration written
  entirely with the former French keys (`pieces`, `murs`…) is refused with a message; see the CHANGELOG.
- **Omitted keys** use the default shown. *—* means “absent / not set”. The editor removes a key whose value is put
  back to its default, so saved YAML stays minimal.
- **Common element keys.** Rooms, openings, badges, texts and furniture also take `hidden`, `level` and `group`
  (see [Layers](#layers) and [Groups](#groups)).
- **Editor paths** use the English interface labels: *Editor: ⚙ Settings › Display* means the ⚙ Settings button of the
  editor toolbar, section *Display*. *Add › Furniture* is the **Add** button (key `A`), tab *Furniture*.

## Card root

The card itself: its type, identity, title, and the lists of every element of the plan.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `type` | string | `custom:maquette-card` | — | Card type (required). The former `custom:plan-maison-card` still works as an alias |
| `id` | string | | written by the editor | Identifier used by the editor to find the card when saving; also keys the per-browser layer choices |
| `title` | string | | — | Title above the plan. `""` (empty) removes the header in [tablet mode](#wall-tablet) |
| `summary` | list / bool | | 4 default chips | [Summary chips](#summary-chips); `false` or `[]` = none |
| `rooms` | list | | `[]` | [Rooms and sub-areas](#rooms-and-sub-areas) |
| `walls` | list | | `[]` | [Walls](#walls) |
| `fences` | list | | `[]` | [Fences](#fences) |
| `openings` | list | | `[]` | [Openings](#openings) |
| `badges` | list | | `[]` | [Device badges](#device-badges) |
| `texts` | list | | `[]` | [Texts and info boxes](#texts-and-info-boxes) |
| `furniture` | list | | `[]` | [Furniture](#furniture) and [connected furniture](#connected-furniture) |
| `panels` | object | | — | [Panels](#panels) of the home view |
| `layers` | object | | — | [Layers](#layers) |
| `groups` | list | | — | [Groups](#groups) |
| `templates` | list | | — | [Templates](#templates) saved by the editor |
| `ambience` | object | | — | [Ambience](#ambience) |
| `animations` | object | | — | [Animations](#animations) per event |
| `alerts` | list | | — | [Full-plan alerts](#full-plan-alerts) |
| `badge_style` | object | | — | [Badge style](#badge-style) |
| `replay` | bool / object | | — | [Replay](#replay) |
| `showcase` | bool / object | | — | [Showcase](#showcase) |
| `interaction` | object | | — | [Interaction](#interaction) |
| `tablet` | bool / object | | — | [Wall tablet](#wall-tablet) |
| `animation_level` | enum | `full` `reduced` `none` | `full` | [Animation level](#animation-level) |
| `demo` | bool | | — | [Demo](#demo) |
| `language`, `full_page`, `margin`, `editor`, `show_furniture`, `presence`, `room_labels`, `temperature_tint`, `legend` | | | | [Global settings](#global-settings) |
| `view_layout`, `layout_options`, `grid_options`, `visibility`, `card_mod` | | | | [Preserved Home Assistant keys](#preserved-home-assistant-keys) |

```yaml
type: custom:maquette-card
id: home
title: Home
rooms:
  - name: Living room
    poly: [[0, 0], [500, 0], [500, 420], [0, 420]]
walls:
  - [0, 0, 500, 0]
```

Editor: the card is added from the Home Assistant card picker (*Maquette*); `title` is in ⚙ Settings › General; `id`
is written automatically on the first save.

## Global settings

Card-wide options about how the card works rather than what it draws.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `language` | string | `auto` `en` `fr` | `auto` | Interface language. `auto` follows the Home Assistant profile (French for `fr*`, English otherwise). Numbers and dates always follow the HA locale |
| `full_page` | bool | | `true` | Full-height layout without scrollbar when the card is at least 760 px wide |
| `margin` | number (cm) | editor: 0–2000, step 10 | `40` | Margin around the drawing |
| `editor` | bool | | `true` | Show the editor (pencil) button, to administrators only. `false` hides it: remove the key in HA's code editor to get it back |
| `show_furniture` | bool / enum | `true` `false` `desktop` | `true` | `false` hides furniture (like `furniture` in `layers.hidden`); `desktop` shows it only when the card is at least 760 px wide |
| `presence` | entity | zone, person, group… | `zone.home` | Default presence for chips with `show` and alerts with `when_away`: a zone counts people (> 0 = somebody home), a person / group / binary sensor is present when `home` / `on` |
| `room_labels` | object | | all `true` | What room labels show, see below |
| `room_labels.name` | bool | | `true` | Room name (still read by screen readers when `false`) |
| `room_labels.temperature` | bool | | `true` | Temperature |
| `room_labels.humidity` | bool | | `true` | Humidity. A label left empty is hidden |
| `temperature_tint` | object / `false` | | `{min: 17, max: 28}` | Room colour by temperature, also the ends of the legend gradient. `false` = no tint and no gradient |
| `temperature_tint.min` | number (°C) | editor: −30–60, step 0.5 | `17` | Blue at and below this temperature |
| `temperature_tint.max` | number (°C) | editor: −30–60, step 0.5 | `28` | Red at and above. If `min` ≥ `max`, both fall back to the defaults |
| `legend` | bool | | `true` | `false` hides the legend under the plan |

```yaml
language: en
full_page: true
margin: 60
editor: true
show_furniture: desktop
presence: group.family
room_labels:
  name: true
  temperature: true
  humidity: false
temperature_tint:
  min: 18
  max: 26
legend: false
```

Editor: ⚙ Settings › General (`title`, `language`, `full_page`, `margin`, `editor`), › Display (`show_furniture`,
`layers.view_button`), › Features (`replay`, `showcase`, `presence`), › Rooms and legend (`room_labels`,
`temperature_tint`, `legend`).

## Rooms and sub-areas

A room is a polygon with optional temperature and humidity sensors; tapping it opens its room view. With
`sub_area: true` it becomes a sub-area: a dashed, named outline inside another room (kitchen, shower…).

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `name` | string | | — | Room name (label, room view, lists) |
| `poly` | list of `[x, y]` | ≥ 3 points | required | Outline. A room without 3 valid points is ignored |
| `label` | `[x, y]` | | — | Label position; no label without it |
| `temperature` | entity | | — | Temperature sensor: label value and room tint |
| `humidity` | entity | | — | Humidity sensor |
| `temperature_attribute` | attribute | | — | Read this attribute of `temperature` instead of its state (e.g. a `weather` or `climate` entity) |
| `humidity_attribute` | attribute | | — | Same for `humidity` |
| `tap` | entity | | — | Entity opened from the label in room view, and by `interaction.room_tap: more_info` (else `temperature`) |
| `outside` | bool | | `false` | Outdoor area: no temperature tint; receives the weather and stronger night tint |
| `zoom` | bool | | `true` | `false`: no room view on tap (terrace, courtyard…); the label still opens its entity |
| `area` | string | HA area id | — | Linked Home Assistant area: its devices, scenes and automations in the room view |
| `auto_actions` | bool | | `true` | Automatic buttons in the room view (lights, shutters) |
| `automations` | bool | | `true` | Show the linked automations and scripts in the room view |
| `actions` | list | | — | Custom buttons of the room view, see below |
| `panels` | object | `{left, right}` | — | [Panels](#panels) shown in this room's view |
| `sub_area` | bool | | `false` | Sub-area: dashed outline, no tint, no walls, not counted in the summary chips; a click opens the room that contains it |
| `hidden` | bool | | `false` | Hidden in the view (still counted in the summary chips) |
| `level` | number | | `0` | Order inside its layer (higher = on top) |
| `group` | string | group `id` | — | Editor group |

**Room buttons** (`rooms[].actions[]`):

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `name` | string | | — | Button label |
| `icon` | icon | | — | Button icon |
| `action` | string | `domain.service` | — | Service called (e.g. `scene.turn_on`, `light.turn_off`) |
| `target` | entity / enum | an entity id, or `room` | — | Target entity; `room` = the whole room (its HA `area` if linked, else the room's entities of that domain) |
| `data` | object | | `{}` | Service data, copied as is |
| `confirm` | bool | | `false` | Two-tap confirmation |

```yaml
rooms:
  - name: Living room
    poly: [[0, 0], [500, 0], [500, 420], [0, 420]]
    label: [250, 210]
    temperature: sensor.living_temperature
    humidity: sensor.living_humidity
    tap: sensor.living_temperature
    area: living_room
    auto_actions: true
    automations: true
    actions:
      - name: Movie mode
        icon: mdi:movie-open-outline
        action: scene.turn_on
        target: scene.movie
        data: {}
        confirm: true
      - {name: All off, icon: mdi:lightbulb-off, action: light.turn_off, target: room}
    panels:
      right:
        - {type: tile, title: Temperature, entity: sensor.living_temperature, history: 24}
  - name: Terrace
    poly: [[0, 420], [500, 420], [500, 700], [0, 700]]
    outside: true
    zoom: false
    temperature: weather.home
    temperature_attribute: temperature
    humidity: weather.home
    humidity_attribute: humidity
  - name: Kitchen
    sub_area: true
    poly: [[20, 20], [200, 20], [200, 120], [20, 120]]
    label: [110, 70]
    level: 1
    hidden: false
    group: ground_floor
```

Editor: toolbar *Rectangular room with its walls (R)* or *Freeform room (P)*; *Add › Rooms* (*Home Assistant area*,
*All my HA areas*); select a room to edit it in the side panel (*Action buttons*, *Left panel* / *Right panel*,
*Sub-area*). Sub-areas: *Add › Furniture › Sub-areas (kitchen, shower…)*.

## Walls

Walls are plain thick segments. They only carry their layer and an optional group.

| Item | Type | Values | Default | Description |
|---|---|---|---|---|
| `[x1, y1, x2, y2]` | list of 4 numbers | | required | Segment, from (`x1`, `y1`) to (`x2`, `y2`) |
| 5th value | string | group `id` | — | Optional [group](#groups): `[x1, y1, x2, y2, "<id>"]` |

```yaml
walls:
  - [0, 0, 500, 0]
  - [500, 0, 500, 420, ground_floor]
```

Editor: toolbar *Wall (M)*; select a wall for *To boundary* (turn it into a fence) and *Split in two*. Hide or lock all
walls in *Layers*.

## Fences

Fences and property limits: thinner, outlined segments, same format as walls.

| Item | Type | Values | Default | Description |
|---|---|---|---|---|
| `[x1, y1, x2, y2]` | list of 4 numbers | | required | Segment |
| 5th value | string | group `id` | — | Optional [group](#groups) |

```yaml
fences:
  - [-300, -200, 900, -200]
  - [900, -200, 900, 800, garden]
```

Editor: toolbar *Boundary / fence (L)*; select one for *To wall* and *Split in two*.

## Openings

Windows, doors and gates drawn on a wall segment, with their contact, shutter or motorised entity.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `type` | enum | `window` `door` `gate` | required | Kind of opening (drawing, icons) |
| `seg` | `[x1, y1, x2, y2]` | | required | Segment on the wall. An opening without a valid `seg` is ignored |
| `name` | string | | — | Name (lists, card header, open-openings chip) |
| `contact` | entity | | — | Contact sensor: red when `on` / `open` |
| `shutter` | entity | | — | Shutter (`cover`): drawn on the outside, darker when closed, animated while moving |
| `entity` | entity | | — | Motorised opening (gate, garage door), used when there is no `contact` |
| `outside` | `[dx, dy]` | `[-1, 0]` `[1, 0]` `[0, -1]` `[0, 1]` | `[0, 0]` | Outside direction (left, right, up, down): the shutter is drawn on that side |
| `shutter_only` | bool | | `false` | Draw only the shutter, not the window line |
| `bay` | string | | — | Bay name: leaves with the same `bay` form one bay (one card, one line, counted once) |
| `animation` | enum / object | see [Animations](#animations) | `animations.opening` | This opening's animation while open |
| `shutter_animation` | enum / object | see [Animations](#animations) | `animations.shutter` | Its shutter's animation while moving |
| `tap` | enum | `card` `more_info` `none` | `card` with a `card`, else more-info | What a tap does, see [Cards](#cards) |
| `protected` | bool | | `false` | No “off” switch in its card |
| `card` | object / list | | — | Its [card](#cards) |
| `hidden` | bool | | `false` | Hidden in the view |
| `level` | number | | `0` | Order inside the Openings layer |
| `group` | string | group `id` | — | Editor group |

```yaml
openings:
  - type: window
    seg: [90, 0, 410, 0]
    name: Living room window
    contact: binary_sensor.living_window
    shutter: cover.living_shutter
    outside: [0, -1]
    shutter_only: false
    bay: Living room bay
    animation: wave
    shutter_animation: {type: pulse, duration: 1}
    tap: card
    protected: false
    card:
      title: Living room bay
      widgets:
        - {type: cover, entity: cover.living_shutter}
  - type: door
    seg: [500, 100, 500, 190]
    contact: binary_sensor.front_door
    level: 1
  - type: gate
    seg: [200, -200, 500, -200]
    entity: cover.gate
    tap: more_info
    group: garden
    hidden: false
```

Editor: toolbar *Opening (O)*, or *Add › Openings* (*Window + contact*, *Gate / garage*…); select it for the side panel
(*Contact*, *Shutter*, *Outside side*, *Bay (grouped leaves)*, *Animation (open)*, *Shutter animation (moving)*, *Card*).

## Device badges

A badge is a round device icon placed on the plan, coloured when its entity is active, with an optional value, light
halo, animation and card.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `entity` | entity | | — | Main entity: state, colour, more-info, on / off in its card |
| `pos` | `[x, y]` | | required | Position. A badge without a valid `pos` is ignored |
| `icon` | icon | | `mdi:circle` | Icon |
| `name` | string | | entity name | Tooltip, lists, card header |
| `color` | colour | | theme primary colour | Colour when active |
| `light_color` | bool | | guessed from `color` | The colour is light: the icon is drawn dark when active |
| `halo` | number (cm) / bool | | — | Light halo radius while active; `true` = 130 |
| `room` | string | a room `name` | — | Clip the halo to this room |
| `alert` | bool | | `false` | Alert badge: uses `animations.alert` (pulse) when active |
| `active` | entity | | `entity` | Entity that defines “active” |
| `active_attribute` | attribute | | — | Use this attribute of the active entity instead of its state |
| `threshold` | number | | — | Active when the active value is above this number. Without it: active for `on`, `open`, `opening`, `closing`, `playing`, `heating`, `cooling`, `cleaning`, `detected`, `home` |
| `value` | entity | | — | Numeric value shown in the badge |
| `attribute` | attribute | | — | Show this attribute of `entity` as the value (wins over `value`) |
| `unit` | string | | entity unit | Unit after the value (written as is, e.g. `" °C"`) |
| `decimals` | number | 0–6 | `0` | Decimals of `value` |
| `tap` | enum | `card` `more_info` `none` | `card` with a `card`, else more-info | See [Cards](#cards) |
| `protected` | bool | | `false` | No “off” switch in its card |
| `card` | object / list | | — | Its [card](#cards) |
| `animation` | enum / object | see [Animations](#animations) | `animations.light`, `.alert` or `.badge` | Animation while active |
| `hidden` | bool | | `false` | Hidden in the view (still counted, still in the room view and lists) |
| `level` | number | | `0` | Order inside the Devices layer |
| `group` | string | group `id` | — | Editor group |

```yaml
badges:
  - entity: light.living_lamp
    pos: [230, 200]
    icon: mdi:floor-lamp
    name: Lamp
    color: "#f6c445"
    light_color: true
    halo: 170
    room: Living room
    animation: {type: halo, color: "#ffd54f"}
  - entity: switch.washer_plug
    pos: [60, 380]
    icon: mdi:washing-machine
    active: sensor.washer_power
    threshold: 5
    value: sensor.washer_power
    unit: " W"
    decimals: 0
    tap: card
    protected: true
    card: {title: Washer, widgets: [{type: tile, entity: sensor.washer_power, history: 24}]}
  - entity: climate.living_room
    pos: [300, 60]
    icon: mdi:thermostat
    attribute: temperature
    unit: " °C"
    active_attribute: hvac_action
    alert: false
    level: 2
    hidden: false
    group: ground_floor
```

Editor: *Add › Devices* (*Light*, *Any device*…), then click on the plan; select it for the side panel (*Value shown on
the badge*, *Advanced settings*, *Card*, *Animation*).

## Texts and info boxes

A text is a free label on the plan. With `info`, it becomes an info box: a framed list of live entity values.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `text` | string | | — | The text; the title of an info box (optional there) |
| `pos` | `[x, y]` | | required | Centre. A text without a valid `pos` is ignored |
| `size` | number | | `1` | Size factor of the font (1 = default size); texts scale with the zoom |
| `style` | enum | `subtle` | boxed | Info boxes only: `subtle` = no background |
| `info` | list | | — | Lines of the info box, see below |
| `hidden` | bool | | `false` | Hidden in the view |
| `level` | number | | `0` | Order inside the Texts layer |
| `group` | string | group `id` | — | Editor group |

**Info box lines** (`texts[].info[]`):

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `entity` | entity | | — | Entity shown (a tap opens its more-info) |
| `name` | string | | entity name | Line name |
| `attribute` | attribute | | — | Show this attribute instead of the state |
| `unit` | string | | entity unit | Unit |
| `decimals` | number | | 1 (0 at 100 and above) | Decimals |
| `icon` | icon | | entity or measurement icon | Icon |

```yaml
texts:
  - text: Garden
    pos: [700, 500]
    size: 1.4
  - text: Outside
    pos: [700, -100]
    style: subtle
    level: 1
    group: garden
    hidden: false
    info:
      - {entity: sensor.outside_temperature}
      - {entity: sensor.living_humidity, name: Living room, decimals: 0}
      - {entity: climate.thermostat, attribute: current_temperature, unit: "°C", icon: mdi:thermostat}
```

Editor: toolbar *Text (T)*; *Add › Info box*, then *Entity* to add lines in its panel.

## Furniture

Top-view symbols. Plain furniture never catches clicks in the view; furniture with an entity, a value or a card is
[connected furniture](#connected-furniture).

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `type` | enum | see the catalogue below | required | Symbol. An unknown type is drawn as a rectangle |
| `pos` | `[x, y]` | | `[0, 0]` | Centre |
| `size` | `[width, depth]` / number | 5–5000 each | catalogue size | Size before rotation; a single number = a square |
| `rotation` | number (°) | | `0` | Clockwise rotation |
| `mirror` | bool | | `false` | Mirrored (corner sofa, bath…) |
| `name` | string | | type name | Tooltip; for `area`, the label drawn on the plan |
| `chairs` | number | 0–12 | per table | Tables only: number of chairs |
| `tint` | bool | | `true` | Connected furniture: tinted at rest (`false` = colour only when active) |
| `hidden` | bool | | `false` | Hidden in the view |
| `level` | number | | `0` (`-1` for `rug` and `area`) | Order inside the Furniture layer |
| `group` | string | group `id` | — | Editor group |
| `entity`, `value`, `active`, `active_attribute`, `threshold`, `attribute`, `unit`, `decimals`, `color`, `tap`, `protected`, `card`, `animation` | | | | See [Connected furniture](#connected-furniture) |

```yaml
furniture:
  - type: double_bed
    pos: [420, 160]
    size: [160, 200]
    rotation: 90
    name: Bed
  - type: corner_sofa
    pos: [150, 300]
    mirror: true
  - type: round_table
    pos: [380, 330]
    chairs: 5
  - type: area
    pos: [120, 80]
    size: [220, 140]
    name: Reading corner
    level: -1
    group: ground_floor
    hidden: false
```

**Catalogue** (category as shown in the editor, default size in cm as width × depth):

| Category | `type` | Name | Default size | Notes |
|---|---|---|---|---|
| Living room | `sofa` | Sofa | 200 × 90 |  |
| Living room | `corner_sofa` | Corner sofa | 250 × 200 |  |
| Living room | `armchair` | Armchair | 80 × 80 |  |
| Living room | `coffee_table` | Coffee table | 100 × 60 |  |
| Living room | `tv_unit` | TV unit | 160 × 45 | colour `#7e57c2` |
| Living room | `shelf` | Shelf | 100 × 35 |  |
| Living room | `rug` | Rug | 200 × 140 | level −1 |
| Living room | `plant` | Plant | 45 × 45 |  |
| Living room | `fireplace` | Fireplace / stove | 100 × 50 |  |
| Dining | `square_table` | Square table | 90 × 90 | 4 chairs |
| Dining | `rect_table` | Rectangular table | 160 × 90 | 6 chairs |
| Dining | `round_table` | Round table | 110 × 110 | 4 chairs, round |
| Dining | `chair` | Chair | 45 × 45 |  |
| Kitchen | `counter` | Worktop | 240 × 60 |  |
| Kitchen | `sink` | Sink | 100 × 60 |  |
| Kitchen | `hob` | Hob | 60 × 60 | colour `#ff7043` |
| Kitchen | `fridge` | Fridge | 60 × 65 | colour `#29b6f6` |
| Kitchen | `washing_machine` | Washing machine | 60 × 60 | colour `#42a5f5` |
| Kitchen | `dishwasher` | Dishwasher | 60 × 60 | colour `#42a5f5` |
| Bedroom and office | `single_bed` | Single bed | 90 × 190 |  |
| Bedroom and office | `double_bed` | Double bed | 160 × 200 |  |
| Bedroom and office | `crib` | Cot | 60 × 120 |  |
| Bedroom and office | `wardrobe` | Wardrobe | 120 × 60 |  |
| Bedroom and office | `dresser` | Chest of drawers | 100 × 50 |  |
| Bedroom and office | `desk` | Desk | 140 × 70 | colour `#fb8c00` |
| Bedroom and office | `nightstand` | Bedside table | 45 × 40 |  |
| Bathroom | `shower` | Shower | 90 × 90 |  |
| Bathroom | `bathtub` | Bathtub | 170 × 75 |  |
| Bathroom | `washbasin` | Washbasin | 60 × 45 |  |
| Bathroom | `toilet` | Toilet | 40 × 65 |  |
| Utilities | `boiler` | Boiler | 45 × 35 | colour `#ef5350` |
| Utilities | `water_heater` | Water heater | 55 × 55 | round, colour `#ef5350` |
| Utilities | `radiator` | Radiator | 80 × 12 | colour `#ef5350` |
| Utilities | `electrical_panel` | Electrical panel | 50 × 15 | colour `#fbc02d` |
| Utilities | `router` | Router / NAS | 35 × 25 | colour `#26a69a` |
| Utilities | `ev_charger` | EV charger | 30 × 20 | colour `#43a047` |
| Utilities | `heat_pump` | Heat pump / AC (outdoor unit) | 90 × 35 | colour `#26c6da` |
| Shapes and areas | `area` | Named area | 300 × 200 | level −1 |
| Shapes and areas | `rect` | Rectangle | 100 × 60 |  |
| Shapes and areas | `circle` | Circle | 60 × 60 | round |
| Shapes and areas | `stairs` | Stairs | 90 × 280 |  |
| Outdoor | `car` | Car | 178 × 406 | colour `#43a047` |
| Outdoor | `bike` | Bike | 60 × 180 |  |
| Outdoor | `tree` | Tree / shrub | 200 × 200 | round |
| Outdoor | `pool` | Pool | 800 × 400 |  |

Rugs and named areas are drawn under the other furniture (`level: -1` by default). *Round* types have no mirror button.
The *colour* is the default accent of connected furniture of that type.

Editor: *Add › Furniture* (tabs by category, search), click to place; select it for size, rotation (±15°, ±90°),
*Mirror*, *Chairs*, *Template*.

## Connected furniture

Any piece of furniture becomes connected with an `entity`, a `value` or a `card`: accent tint, “active” look, value
badge, and a tap target that opens its card or more-info. Same keys and meaning as [device badges](#device-badges).

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `entity` | entity | | — | Main entity: state, active look, on / off in its card |
| `value` | entity | | — | Numeric value shown in a badge on the furniture (hidden below 24 px on screen) |
| `active` | entity | | `entity` | Entity that defines “active” |
| `active_attribute` | attribute | | — | Attribute of the active entity |
| `threshold` | number | | — | Active above this value (e.g. `50` W for a charger) |
| `attribute` | attribute | | — | Show this attribute of `entity` as the value |
| `unit` | string | | entity unit | Unit of the value |
| `decimals` | number | 0–6 | `0` | Decimals of the value |
| `color` | colour | `#rgb`…`#rrggbbaa`, CSS name, `var(--…)` | per type, else theme primary | Accent colour (see the catalogue) |
| `tint` | bool | | `true` | `false` = coloured only when active |
| `tap` | enum | `card` `more_info` `none` | `card` with a `card`, `more_info` with an entity or value, else `none` | What a tap does |
| `protected` | bool | | `false` | No “off” switch in its card (fridge, freezer…) |
| `card` | object / list | | — | Its [card](#cards) |
| `animation` | enum / object | see [Animations](#animations) | `animations.furniture` | Animation while active; `shape: outline` follows its outline |

```yaml
furniture:
  - type: ev_charger
    pos: [495, -870]
    name: Charger
    entity: switch.charger_plug
    value: sensor.charger_plug_power
    active: sensor.charger_plug_power
    threshold: 50
    unit: W
    decimals: 0
    color: "#188038"
    tint: true
    tap: card
    protected: true
    animation: {type: wave, shape: outline}
    card:
      title: EV charging
      widgets:
        - {type: ev, title: Car, battery: sensor.ev_battery, power: sensor.charger_plug_power}
  - type: boiler
    pos: [40, 600]
    entity: climate.boiler
    active_attribute: hvac_action
    attribute: current_temperature
```

Editor: select the furniture › *Connected* (entity, value, tap behaviour, protected, *Advanced settings*); *Fill from
device* proposes a card; *Merge with “…”* absorbs a badge of the same entity less than 1.5 m away.

## Cards

A card is the dialog opened by tapping an opening, a badge or connected furniture: a header (icon, name, state,
on / off switch) and a stack of [widgets](#widgets).

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `card` | object / list | | — | The card; a plain list is read as its `widgets` |
| `card.title` | string | | element name | Card title |
| `card.widgets` | list | [widgets](#widgets) | `[]` | Widgets, in order (same types and keys as panels) |
| `tap` | enum | `card` `more_info` `none` | `card` when there is a card | `card` opens the card, `more_info` the HA more-info of the main entity, `none` does nothing |
| `protected` | bool | | `false` | Never show the “off” switch (a “Turn back on” button only when it is off) |

The on / off switch only appears for `switch`, `light`, `fan` and `input_boolean` entities. Inside a card, rows show
values (no toggles); the only services called are the element's own `turn_on` / `turn_off` and the buttons of
[cover](#widget-cover) and [thermostat](#widget-thermostat) widgets.

```yaml
badges:
  - entity: switch.fridge_plug
    pos: [80, 60]
    tap: card
    protected: true
    card:
      title: Fridge
      widgets:
        - {type: tile, title: Power, entity: sensor.fridge_power, history: 24}
        - {type: entities, entities: [sensor.fridge_temperature, {entity: sensor.fridge_energy, name: Today}]}
openings:
  - type: door
    seg: [0, 100, 0, 190]
    contact: binary_sensor.back_door
    card:
      - {type: entities, entities: [binary_sensor.back_door, sensor.back_door_battery]}
```

Editor: select the opening, badge or furniture › *Card*: *Add widget*, *Fill from device*, *Save card as template*;
the right column shows the real card while it is selected.

## Panels

Side columns of widgets next to the plan. The card's `panels` are shown in the home view; a room's `panels` in its
room view.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `panels.left` | list | [widgets](#widgets) | `[]` | Left column (merged into one column on narrow screens) |
| `panels.right` | list | [widgets](#widgets) | `[]` | Right column |

```yaml
panels:
  left:
    - {type: tariff, title: Tariff, price: sensor.tempo_price, period: sensor.tempo_period}
  right:
    - {type: gauge, title: Power, entity: sensor.linky_power, min: 0, max: 9000}
rooms:
  - name: Office
    poly: [[0, 0], [300, 0], [300, 300], [0, 300]]
    panels:
      left: [{type: climate, rooms: [Office]}]
      right: []
```

Editor: *Add widget* below the *Left panel* / *Right panel* columns (or *Add › Widgets*); click a widget to edit it,
drag to reorder. Room panels: select the room › *Left panel* / *Right panel*. Hidden by default in
[tablet mode](#wall-tablet).

## Widgets

Widgets fill [panels](#panels) and [cards](#cards). Every widget has a `type`; the keys below are shared, and each
type adds its own (one key always means the same thing).

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `type` | enum | `tariff` `ev` `gauge` `tile` `entities` `periods` `divider` `cover` `thermostat` `climate` | required | Widget type |
| `title` | string | | — | Header title (`cover`, `thermostat`: entity name) |
| `icon` | icon | | per type | Header icon |
| `color` | colour | | — | Accent colour (`gauge`: arc colour) |
| `rows` | list | | — | Extra lines under `tile`, `gauge`, `tariff`, `ev`, `cover` and `thermostat`, see below |

**Rows** (`rows[]`, also `entities[]` of the [entities](#widget-entities) widget): an entity id, or an object:

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `entity` | entity | | — | Entity shown (tap = more-info) |
| `name` | string | | entity name | Line name |
| `icon` | icon | | entity icon | Line icon |
| `decimals` | number | | 1 (0 at 100 and above) | Decimals |
| `unit` | string | | entity unit | Unit |

```yaml
panels:
  right:
    - type: tile
      title: Outside
      icon: mdi:thermometer
      color: "#1a73e8"
      entity: sensor.outside_temperature
      rows:
        - sensor.outside_humidity
        - {entity: sensor.outside_pressure, name: Pressure, icon: mdi:gauge, decimals: 0, unit: hPa}
```

Editor: *Add › Widgets*, or *Add widget* in a panel or a card; click the widget to edit it.

### Widget: tariff

Live electricity price, current period (peak / off-peak) and Tempo colours of today and tomorrow.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `price` | entity | | — | Price sensor (unit, else €/kWh) |
| `period` | entity | | — | Current period; green when it contains “creuse” / “off-peak”, orange otherwise |
| `color_today` | entity | | — | Tempo colour of today (`Bleu` / `Blanc` / `Rouge` or `Blue` / `White` / `Red`) |
| `color_tomorrow` | entity | | — | Tempo colour of tomorrow |

```yaml
panels:
  left:
    - type: tariff
      title: Live rate
      price: sensor.tempo_price
      period: sensor.tempo_period
      color_today: sensor.tempo_today
      color_tomorrow: sensor.tempo_tomorrow
```

### Widget: ev

Electric vehicle: battery ring, charging state, range and charging session.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `battery` | entity | | — | Battery level (%) |
| `range` | entity | | — | Range |
| `power` | entity | | — | Charging power (W) |
| `threshold` | number (W) | | `50` | Charging when `power` is above |
| `plugged` | entity | | — | Plugged state (`on`, `plugged`, `connected`, `true`) |
| `session_kwh` | entity | | — | Energy of the session |
| `session_cost` | entity | | — | Cost of the session |

```yaml
panels:
  left:
    - type: ev
      title: Car
      battery: sensor.ev_battery
      range: sensor.ev_range
      power: sensor.charger_power
      threshold: 50
      plugged: binary_sensor.ev_plugged
      session_kwh: sensor.charger_session
      session_cost: sensor.charger_session_cost
```

### Widget: gauge

A value on an arc between a minimum and a maximum (green, then orange from 60 %, red from 85 %, unless `color`).

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `entity` | entity | | — | Value |
| `min` | number | | `0` | Start of the arc |
| `max` | number | | `100` | End of the arc (the editor proposes 9000) |
| `unit` | string | | entity unit | Unit |
| `decimals` | number | | 1 (0 at 100 and above) | Decimals |

```yaml
panels:
  right:
    - {type: gauge, title: Power, entity: sensor.linky_power, min: 0, max: 9000, unit: W, decimals: 0}
```

### Widget: tile

A large value with an optional history chart.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `entity` | entity | | — | Value |
| `unit` | string | | entity unit | Unit |
| `decimals` | number | | 1 (0 at 100 and above) | Decimals |
| `history` | number (h) | | — | Hours of history chart; `0` or absent = no chart (the editor proposes 24) |

```yaml
panels:
  right:
    - {type: tile, title: Fridge, entity: sensor.fridge_temperature, unit: "°C", decimals: 1, history: 24}
```

### Widget: entities

A list of entities; lights, switches, fans and input booleans get a toggle (values only inside a card).

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `entities` | list | rows | — | Same format as [`rows`](#widgets) |

```yaml
panels:
  left:
    - type: entities
      title: Lights
      entities:
        - light.living_lamp
        - {entity: switch.coffee_maker, name: Coffee, icon: mdi:coffee}
```

### Widget: periods

A day / week / month / year table, from HA long-term statistics or from four entities per column.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `periods` | list | `day` `week` `month` `year` | all four | Rows, in this order |
| `columns` | list | | `[]` | Columns, see below |
| `note` | string | | — | Note under the table |

**Columns** (`columns[]`):

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `name` | string | | — | Column header |
| `unit` | string | | — | Unit under the header |
| `stat` | entity | | — | Cumulative sensor: change over the calendar day / week / month / year from HA statistics |
| `factor` | number | | `1` | Multiplier applied to `stat` (e.g. `0.001` for Wh → kWh) |
| `decimals` | number | | `2` | Decimals |
| `day`, `week`, `month`, `year` | entity | | — | Without `stat`: one entity per period |
| `source` | enum | `stat` `entities` | — | Written by the editor to remember which of the two the column uses |

```yaml
panels:
  left:
    - type: periods
      title: Consumption
      periods: [day, week, month, year]
      note: From the Linky meter
      columns:
        - {name: Energy, unit: kWh, stat: sensor.energy_total, factor: 0.001, decimals: 1, source: stat}
        - name: Cost
          unit: €
          source: entities
          day: sensor.cost_day
          week: sensor.cost_week
          month: sensor.cost_month
          year: sensor.cost_year
```

### Widget: divider

A horizontal line, with an optional section title.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `title` | string | | — | Section title |
| `spacing` | number (px) | | — | Space above and below |

```yaml
panels:
  left:
    - {type: divider, title: Heating, spacing: 12}
```

### Widget: cover

Control of a `cover` (shutter, blind, gate, garage or motorised door): state, position bar, *Open* / *Stop* / *Close*.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `entity` | entity | a `cover.*` | — | The cover; other domains are dropped |
| `confirm` | bool | | `true` for device class `garage`, `gate`, `door`; else `false` | Two-tap confirmation (second tap within 4 s) |

Only `cover.open_cover`, `cover.stop_cover` and `cover.close_cover` of this entity are ever called; *Stop* is hidden
when the cover does not support it.

```yaml
panels:
  left:
    - type: cover
      title: Gate
      entity: cover.gate
      confirm: true
      rows: [{entity: binary_sensor.gate_closed}]
```

### Widget: thermostat

A `climate` entity: measured temperature, set point with −/+ (device step and limits), current action, mode.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `entity` | entity | a `climate.*` | — | Thermostat |

```yaml
panels:
  right:
    - {type: thermostat, entity: climate.living_room, rows: [sensor.living_humidity]}
```

### Widget: climate

Temperature and humidity of every room with sensors, with their trend over a duration and alerts.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `duration` | number (min) | 5–240 | `30` | Trend window (from HA history) |
| `rooms` | list | room `name`s | every room with a sensor | Rooms shown (rooms sharing the same sensors are shown once) |
| `outside` | bool | | `true` | `false` hides outdoor rooms |
| `average` | bool | | `false` | First line: indoor average and its trend |
| `stable_t` | number (°C) | | `0.3` | Flat arrow below this change |
| `alert_t` | number (°C) | | `1.5` | Alert at or above this change |
| `stable_h` | number (%) | | `2` | Same for humidity |
| `alert_h` | number (%) | | `10` | Same for humidity |
| `t_min`, `t_max` | number (°C) | | — | Absolute temperature limits (alert outside) |
| `h_min`, `h_max` | number (%) | | — | Absolute humidity limits |

```yaml
panels:
  right:
    - type: climate
      title: Room climate
      duration: 30
      rooms: [Bedroom, Living room]
      outside: false
      average: true
      stable_t: 0.3
      alert_t: 1.5
      stable_h: 2
      alert_h: 10
      t_min: 16
      t_max: 28
      h_min: 30
      h_max: 70
```

## Summary chips

Chips above the plan. Without `summary`, four are shown: open openings, lights on, shutters down, indoor temperature.
A list chooses, orders and extends them.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `type` | enum | `openings` `lights` `shutters` `temperature` `entity` | required | Chip type, see below |
| `icon` | icon | | per type | Icon override |
| `show` | enum | `away` `home` | always | `away`: only when nobody is home; `home`: only when somebody is home |
| `presence` | entity | | root `presence` (`zone.home`) | Presence used by `show` |
| `new_line` | bool | | `false` | This chip starts a new line |
| `below` | bool | | `false` | This chip stacks under the previous one |

| `type` | Shows | Own keys |
|---|---|---|
| `openings` | Open windows / doors (red when any; a bay counts once) | — |
| `lights` | Lights of the plan that are on | — |
| `shutters` | Shutters of the plan below 50 % | — |
| `temperature` | Mean temperature of the indoor rooms | — |
| `entity` | `<value> <name>` of any entity | `entity`, `name`, `unit`, `decimals`, `alert_above`, `alert_state`, `hide_if` |

**`entity` chip keys:**

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `entity` | entity | | — | Entity shown (tap = more-info) |
| `name` | string | | entity name | Text after the value; `""` = value only |
| `unit` | string | | entity unit | Unit |
| `decimals` | number | | 1 (0 at 100 and above) | Decimals |
| `alert_above` | number | | — | Red chip above this value |
| `alert_state` | string | | — | Red chip when the state equals this |
| `hide_if` | string | | — | Hide the chip for this state (also hidden while the entity is missing) |

```yaml
summary:
  - type: openings
  - type: lights
    show: home
  - type: shutters
    new_line: true
  - type: temperature
    icon: mdi:thermometer
    below: true
  - type: entity
    entity: sensor.ev_battery
    name: battery
    unit: "%"
    decimals: 0
    alert_above: 90
    alert_state: "unavailable"
    hide_if: "unknown"
    show: away
    presence: person.alex
```

Editor: click a chip above the plan to edit it; *+ Chip* (*Add a chip to the summary*) adds one; drag a chip next to,
under or below the others. Also ⚙ Settings › Shortcuts › *Summary chips*. Hidden by default in [tablet mode](#wall-tablet).

## Layers

Every element belongs to a fixed layer by kind. Two groups, each with its own order; the overlay group is always above
the drawing.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `layers.drawing_order` | list | `rooms` `sub_areas` `halos` `furniture` `fences` `walls` `openings` | that order | Drawing layers, bottom → top; missing ones follow in default order |
| `layers.overlay_order` | list | `room_labels` `area_labels` `badges` `texts` | that order | Layers above the drawing, bottom → top |
| `layers.hidden` | list | any layer | `[]` | Hidden in the view (drawn at 25 % and not clickable in the editor) |
| `layers.locked` | list | any layer | `[]` | Not selectable in the editor (clicks go through); no effect in the view |
| `layers.view_button` | bool | | `false` | *Layers* button next to the zoom buttons: each viewer hides layers for himself (kept in the browser) |
| `hidden` (on an element) | bool | | `false` | This element is hidden in the view |
| `level` (on an element) | number | | `0` | Order inside its layer, higher = on top (`rug`, `area`: `-1`) |

`area_labels` holds the labels of named areas and sub-areas; `badges` the device badges; `room_labels` the room labels.

```yaml
layers:
  drawing_order: [rooms, sub_areas, furniture, halos, fences, walls, openings]
  overlay_order: [room_labels, area_labels, badges, texts]
  hidden: [fences]
  locked: [walls, rooms]
  view_button: true
```

Editor: toolbar *Layers* (drag or ↑ / ↓ to reorder, eye, padlock, *Reset order*); per element: *Hide in view*,
*Bring to front* / *Send to back*; `view_button` also in ⚙ Settings › Display.

## Groups

Groups bind elements so that they select and move together in the editor.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `groups[].id` | string | | — | Group identifier, used by `group` |
| `groups[].name` | string | | — | Group name in the editor |
| `group` (on an element) | string | a group `id` | — | Membership of a room, opening, badge, text or furniture |
| 5th value of a wall / fence | string | a group `id` | — | Membership of a wall or fence |

```yaml
groups:
  - {id: garden, name: Garden}
badges:
  - {entity: light.garden, pos: [600, 500], group: garden}
fences:
  - [550, 450, 900, 450, garden]
```

Editor: select several elements › *Group* (Ctrl+G) / *Ungroup* (Ctrl+Shift+G). The first click on a member selects the
group, a second click the element alone.

## Templates

Reusable elements saved by the editor and offered again in *Add › My templates*.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `name` | string | | — | Template name |
| `kind` | enum | `badge` `opening` `furniture` `widget` | — | What `item` is |
| `icon` | icon | | — | Icon in the catalogue |
| `description` | string | | — | Subtitle in the catalogue |
| `type` | enum | furniture types | — | `furniture` templates: the furniture type |
| `domain` | string | an entity domain | — | `badge` templates: domain proposed when choosing the entity |
| `item` | object | | — | The element: a badge, an opening, a furniture or a widget, with the keys of that element (no position) |
| `items` | list | widgets | — | A whole card saved as a template: all its widgets |

Without “Keep the entities”, entity keys are left out and asked again at each use; `value: $entite` stands for the
chosen entity.

```yaml
templates:
  - name: Ceiling light
    kind: badge
    icon: mdi:lightbulb
    domain: light
    item: {icon: mdi:lightbulb, color: "#f6c445", halo: 130}
  - name: My fridge
    kind: furniture
    type: fridge
    description: 70 × 72 cm
    item: {type: fridge, size: [70, 72], tap: more_info}
  - name: Bay window
    kind: opening
    icon: mdi:window-closed-variant
    item: {type: window, shutter_only: false}
  - name: EV card
    kind: widget
    icon: mdi:card-text-outline
    description: Card · 2 widgets
    items:
      - {type: ev, title: Car, battery: sensor.ev_battery}
      - {type: divider}
```

Editor: select an element › *Template* (*Save as template*); a card › *Save card as template*; reuse from *Add ›
My templates*.

## Ambience

Optional, discreet layers drawn under the badges: night tint and sunlight, weather on outdoor rooms, traces of recent
changes, energy flows and people. Never drawn while editing (except as a preview with its panel open); nothing leaves
Home Assistant.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `intensity` | enum / number | `subtle` `normal` `strong`, or 0–1 | `subtle` | Overall strength (0.45 / 0.7 / 1) |
| `north` | number (°) | | `0` | Where north points, clockwise from the top of the plan (45 = top right) |
| `day_night` | bool / object | | on | [Day and night](#day-and-night); `false` = off |
| `weather` | entity / object | | — | [Weather](#weather) |
| `traces` | number / bool / object | | on, 10 min | [Traces](#traces); `false` = off |
| `energy` | bool / object | | — | [Energy flows](#energy-flows) |
| `people` | bool / list / object | | — | [People](#people) |

As soon as `ambience` is present, `day_night` and `traces` are on unless set to `false`.

```yaml
ambience:
  intensity: normal
  north: 45
  day_night: true
  weather: weather.home
  traces: 10
  energy: true
  people: true
```

Editor: toolbar *Ambience and animations* › *Plan ambience (day / night, weather, trails)* (with *Plan north*),
*Energy flow*, *People*.

### Day and night

Night tint from the sun's elevation (stronger outdoors), sunlight from the sun's side, warmer at sunrise and sunset, and a
sun marker on the edge of the plan.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `day_night` | bool / object | | on | `true` / `{}` = defaults, `false` = off |
| `day_night.sun` | entity | | `sun.sun` | Sun entity (elevation, azimuth) |
| `day_night.intensity` | number | 0–2 | `1` | Factor on `ambience.intensity` |
| `day_night.marker` | bool | | `true` | Sun marker on the edge of the plan |

```yaml
ambience:
  day_night: {sun: sun.sun, intensity: 1.2, marker: false}
```

### Weather

The Home Assistant weather painted on outdoor rooms (`outside: true`): cloud shadows, rain, snow, hail, wind, fog,
lightning.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `weather` | entity / object | | — | A `weather.*` entity, or the object below |
| `weather.entity` | entity | | — | Weather entity (required in the object form) |
| `weather.intensity` | number | 0–2 | `1` | Factor on `ambience.intensity` |
| `weather.direction` | number (°) / enum | an angle, or `wind` | `135` | Direction of travel, clockwise from the top (135 = top left → bottom right); `wind` = the real wind |

```yaml
ambience:
  weather: {entity: weather.home, intensity: 0.8, direction: wind}
```

### Traces

What just changed keeps a fading outline (numeric sensors excluded; a HA restart leaves no traces).

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `traces` | number / bool / object | | `10` | Duration in minutes; `false` or `0` = off |
| `traces.duration` | number (min) | up to 240 | `10` | Fading duration |
| `traces.color` | colour | | theme primary | Trace colour |

```yaml
ambience:
  traces: {duration: 15, color: "#1a73e8"}
```

### Energy flows

Beads travelling from the electrical panel to every furniture / badge whose value is a power (W, kW), faster and more
numerous as the power grows.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `energy` | bool / object | | — | `true` / `{}` = defaults |
| `energy.source` | number / enum | a furniture index, or a furniture type | `electrical_panel` | Furniture the flows start from |
| `energy.threshold` | number (W) | | `5` | Minimum power to draw a flow |
| `energy.color` | colour | | target colour, else type colour, else `#fbc02d` | Flow colour |
| `energy.badges` | bool | | `true` | `false`: no flows to device badges (furniture only) |

```yaml
ambience:
  energy: {source: electrical_panel, threshold: 20, color: "#fbc02d", badges: false}
```

### People

People on the plan: at home side by side at a gathering point; away on the plan edge in their real direction with the
distance or zone (HA home coordinates + `north`).

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `people` | bool / list / object | | — | `true` = every `person.*`; a list = these people; an object = the settings below |
| `people.home` | `[x, y]` / string | a point or a room `name` | centre of the indoor rooms | Gathering point at home (a room: its label position) |
| `people.entities` | list | `person.*` ids or `{entity}` | every `person.*` | People shown |
| `people.entities[].entity` | entity | | — | A person |
| `people.away` | enum | `direction` `zone` `hidden` | `direction` | Away: on the edge in their direction with the distance; `zone`: a row of chips along the bottom with the HA zone name; `hidden`: not shown |
| `people.at_home` | enum | `grouped` `hidden` | `grouped` | At home: side by side at `home`; or not shown |
| `people.avatar` | enum | `picture` `initials` | `picture` | HA profile picture (initials when there is none), or always initials |
| `people.persons` | object | `{person.x: {away, at_home, avatar}}` | — | Per-person overrides of `away`, `at_home`, `avatar` (they win over the shared ones) |

```yaml
ambience:
  people:
    home: Living room
    entities: [person.alex, {entity: person.camille}]
    away: direction
    at_home: grouped
    avatar: picture
    persons:
      person.camille: {away: hidden}
      person.alex: {away: zone, avatar: initials, at_home: grouped}
```

Editor: shared `away`, `at_home`, `avatar` in ⚙ Settings › *People on the plan*; per person and `home` in *Ambience and
animations* › *People* (drag the avatars on the plan to set `home` as `[x, y]`).

## Badge style

How device badges show on the plan. Every key is optional; the defaults keep the original look.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `badge_style.unavailable` | enum | `dimmed` `dashed` `hidden` | `dimmed` | Unavailable device: faded, dashed outline, or not shown |
| `badge_style.inactive` | enum | `shown` `active_only` `dimmed` | `shown` | Inactive device: shown, shown only while active, or faded |
| `badge_style.size` | enum | `small` `normal` `large` | `normal` | 0.8 ×, 1 ×, 1.25 × (same size on screen whatever the zoom) |
| `badge_style.values` | enum | `always` `hover` `never` | `always` | Value in the badge: always, on hover / focus (always on touch screens), never |

A hidden badge still counts in the summary chips and still appears in the room view; a badge in a full-plan alert stays
visible; in the editor every badge stays visible.

```yaml
badge_style:
  unavailable: dashed
  inactive: active_only
  size: small
  values: hover
```

Editor: ⚙ Settings › *Device badges*.

## Full-plan alerts

Rules that light up the whole plan while they hold: pulsing veil, banner (name, elements, details, hide until the next
change), elements circled by a wave. Never while editing.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `name` | string | | `Alert` | Banner title |
| `entity` | entity | | — | One watched entity |
| `entities` | list of entities | | — | Several watched entities |
| `type` | enum | `openings` | — | Watch every opening of the plan (`contact`, else `entity`) |
| `level` | enum | `critical` `warning` `info` | `critical` | Red (critical), amber (warning), accent without pulse (info); the highest active level wins |
| `icon` | icon | | per level | Banner icon |
| `above` | number | | — | Active when the value is above |
| `below` | number | | — | Active when the value is below (if no `above`) |
| `state` | string | | — | Active when the state equals this (if no `above` / `below`) |
| `when_away` | bool | | `false` | Only when nobody is home |
| `presence` | entity | | root `presence` (`zone.home`) | Presence used by `when_away` |
| `enabled` | bool | | `true` | `false` turns the rule off without removing it |

Without `above`, `below` or `state`, an entity is active when `on`, `open`, `triggered` or `detected`.

```yaml
alerts:
  - name: Smoke detected
    entities: [binary_sensor.smoke_kitchen, binary_sensor.smoke_hall]
    level: critical
    icon: mdi:smoke-detector
  - name: Opening while nobody is home
    type: openings
    when_away: true
    presence: group.family
    level: warning
  - {name: Freezer too warm, entity: sensor.freezer_temperature, above: -12, level: warning}
  - {name: Cellar too cold, entity: sensor.cellar_temperature, below: 5, level: info, enabled: false}
  - {name: Alarm, entity: alarm_control_panel.home, state: triggered}
```

Editor: *Ambience and animations* › *Full-plan alerts* (*Alert on entities*, *Opening, empty home*); also ⚙ Settings ›
Shortcuts.

## Animations

One animation per event for the whole plan (`animations`); an opening, badge or connected furniture overrides it with
its own `animation` (`shutter_animation` for a shutter).

| Event key | Applies to | Default |
|---|---|---|
| `animations.opening` | Door / window open | `{type: pulse, duration: 1.6}` |
| `animations.shutter` | Shutter moving | `{type: scroll, duration: 0.8}` |
| `animations.alert` | Badge with `alert: true`, while active | `{type: pulse, duration: 1.2}` |
| `animations.light` | `light.*` badge on | `{type: none, duration: 2.4}` |
| `animations.badge` | Other active badge | `{type: none, duration: 2}` |
| `animations.furniture` | Active connected furniture | `{type: none, duration: 2.4}` |

An animation is a type name (`animation: halo`) or an object:

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `type` | enum | `none` `pulse` `breathe` `blink` `halo` `wave` `scroll` | per event | `none` = colour only |
| `color` | colour | | element colour | Animation colour |
| `duration` | number (s) | 0.2–20 | per event | Seconds per cycle |
| `intensity` | number | 0.2–2 | `1` | Strength |
| `shape` | enum | `outline` | — | Furniture: the wave follows its outline |

```yaml
animations:
  opening: {type: pulse, duration: 1.6}
  shutter: {type: scroll, duration: 0.8}
  alert: {type: blink, duration: 1.2, intensity: 1.5}
  light: {type: halo, color: "#ffd54f"}
  badge: wave
  furniture: {type: breathe, duration: 3, shape: outline}
badges:
  - {entity: binary_sensor.motion, pos: [100, 100], animation: {type: wave, color: "#e91e63"}}
```

Editor: *Ambience and animations* › *Animations per event* (*Default animations* resets them); per element: its panel ›
*Animation*. The [animation level](#animation-level) can reduce or stop them all.

## Replay

A *Replay the day* button next to the zoom: the history of every entity of the plan is loaded once, then the whole plan
(colours, openings, shutters, lights, ambience, people, alerts, side panels) is drawn at the chosen moment, with a
timeline (play / pause, speed, marks). Never while editing.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `replay` | bool / object | | — | `true` = defaults |
| `replay.hours` | number (h) | 1–72 | `24` | Period replayed |
| `replay.speed` | enum (number) | `60` `300` `900` `3600` | `900` | Starting speed, in seconds of the day per second (the timeline still changes it) |

```yaml
replay:
  hours: 48
  speed: 3600
```

Editor: ⚙ Settings › Features › *“Replay the day” button*, *Replayed period*, *Starting speed*.

## Showcase

Draws under the plan an example of every animation type, every weather and the ambience effects (night, low sun, trace,
energy flow, alert, person away).

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `showcase` | bool / object | | — | `true` = under the plan |
| `showcase.pos` | `[x, y]` | | under the plan, at `margin` | Top-left corner |
| `showcase.width` | number (cm) | at least 700 | plan width minus margins | Width |

```yaml
showcase:
  pos: [0, 1200]
  width: 1200
```

Editor: ⚙ Settings › Features › *Examples below the plan (animations, weather, ambience)*.

## Interaction

How the card reacts to touch. Without these keys it behaves as before. Never applied inside the editor.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `interaction.room_tap` | enum | `room_view` `more_info` `none` | `room_view` | Tapping a room: room view; more-info of its `tap` entity (else `temperature`); nothing. A room with `zoom: false` keeps its own behaviour |
| `interaction.lock_view` | bool | | `false` | No panning nor wheel / pinch zoom, zoom buttons hidden; taps still work |
| `interaction.reset_after` | number (s) | 0–86400 (editor: 0–3600, step 10) | `0` | Back to the whole plan after this many seconds without interaction (room view, zoom, cards closed, paused replay back to live); `0` = never |

```yaml
interaction:
  room_tap: more_info
  lock_view: true
  reset_after: 60
```

Editor: ⚙ Settings › *Interaction* (*Tapping a room*, *Locked view*, *Back to the whole plan after*).

## Wall tablet

Tablet mode: the plan fills the whole card, full page, centred; summary chips and side panels hidden; with an empty
`title`, no header. It does not lock the view (see [Interaction](#interaction)).

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `tablet` | bool / object | | `false` | `true` = `{summary: false, panels: false, burn_in: true}`; an object sets each point |
| `tablet.summary` | bool | | `false` | Show the summary chips |
| `tablet.panels` | bool | | `false` | Show the side panels (home and rooms) |
| `tablet.burn_in` | bool | | `true` | Burn-in protection: the card moves by one pixel every 3 minutes, within 2 px |

```yaml
title: ""
tablet: {summary: false, panels: true, burn_in: true}
interaction:
  lock_view: true
  reset_after: 60
```

Editor: ⚙ Settings › *Wall tablet* (*Tablet mode*, *Summary chips*, *Side panels*, *Screen burn-in protection*).

## Animation level

A global limit on motion. The system “reduce motion” setting is always respected.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `animation_level` | enum | `full` `reduced` `none` | `full` | `full`: every animation; `reduced`: nothing loops (pulses, waves, weather, flows), short transitions; `none`: no animation nor transition. Replay and showcase follow it |

```yaml
animation_level: reduced
```

Editor: ⚙ Settings › *Animations* › *Animation level*.

## Demo

A built-in demo apartment with simulated states; nothing is ever sent to the house.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `demo` | bool | | `false` | `true` replaces the plan with the demo; only `title` and `language` of the config are kept |

```yaml
type: custom:maquette-card
demo: true
title: Demo
language: en
```

Editor: none; the card picker offers a demo card and blank / demo dashboards.

## Preserved Home Assistant keys

Keys that Home Assistant adds to any card (layout, visibility, card-mod). Maquette keeps them as they are, untranslated.

| Key | Type | Values | Default | Description |
|---|---|---|---|---|
| `view_layout` | any | | — | Layout options of the view (masonry, panel, custom layouts) |
| `layout_options` | any | | — | Former sections-view layout |
| `grid_options` | any | | — | Sections-view size (`columns`, `rows`) |
| `visibility` | list | | — | Card visibility conditions |
| `card_mod` | any | | — | card-mod styles |

```yaml
type: custom:maquette-card
grid_options: {columns: full, rows: auto}
visibility:
  - {condition: screen, media_query: "(min-width: 768px)"}
card_mod:
  style: "ha-card {border-radius: 24px}"
```

Editor: the HA dashboard editor (*Layout* and *Visibility* tabs); kept by the Maquette editor on save.

## Key index

Every public key, alphabetically, with the sections that document it.

| Key | Section(s) |
|---|---|
| `above` | [Full-plan alerts](#full-plan-alerts) |
| `action` | [Rooms and sub-areas](#rooms-and-sub-areas) |
| `actions` | [Rooms and sub-areas](#rooms-and-sub-areas) |
| `active` | [Device badges](#device-badges), [Connected furniture](#connected-furniture) |
| `active_attribute` | [Device badges](#device-badges), [Connected furniture](#connected-furniture) |
| `alert` | [Device badges](#device-badges), [Animations](#animations) |
| `alert_above` | [Summary chips](#summary-chips) |
| `alert_h` | [Widgets](#widgets), [Widget: climate](#widget-climate) |
| `alert_state` | [Summary chips](#summary-chips) |
| `alert_t` | [Widgets](#widgets), [Widget: climate](#widget-climate) |
| `alerts` | [Card root](#card-root), [Full-plan alerts](#full-plan-alerts) |
| `ambience` | [Card root](#card-root), [Ambience](#ambience) |
| `animation` | [Animations](#animations), [Openings](#openings), [Device badges](#device-badges), [Connected furniture](#connected-furniture) |
| `animation_level` | [Card root](#card-root), [Animation level](#animation-level) |
| `animations` | [Card root](#card-root), [Animations](#animations) |
| `area` | [Rooms and sub-areas](#rooms-and-sub-areas) |
| `at_home` | [People](#people) |
| `attribute` | [Device badges](#device-badges), [Texts and info boxes](#texts-and-info-boxes), [Connected furniture](#connected-furniture) |
| `auto_actions` | [Rooms and sub-areas](#rooms-and-sub-areas) |
| `automations` | [Rooms and sub-areas](#rooms-and-sub-areas) |
| `avatar` | [People](#people) |
| `average` | [Widgets](#widgets), [Widget: climate](#widget-climate) |
| `away` | [People](#people) |
| `badge` | [Animations](#animations) |
| `badge_style` | [Card root](#card-root), [Badge style](#badge-style) |
| `badges` | [Card root](#card-root), [Device badges](#device-badges), [Energy flows](#energy-flows) |
| `battery` | [Widgets](#widgets), [Widget: ev](#widget-ev) |
| `bay` | [Openings](#openings) |
| `below` | [Summary chips](#summary-chips), [Full-plan alerts](#full-plan-alerts) |
| `burn_in` | [Wall tablet](#wall-tablet) |
| `card` | [Cards](#cards), [Openings](#openings), [Device badges](#device-badges), [Connected furniture](#connected-furniture) |
| `card_mod` | [Preserved Home Assistant keys](#preserved-home-assistant-keys) |
| `chairs` | [Furniture](#furniture) |
| `color` | [Widgets](#widgets), [Animations](#animations), [Device badges](#device-badges), [Connected furniture](#connected-furniture), [Traces](#traces), [Energy flows](#energy-flows) |
| `color_today` | [Widgets](#widgets), [Widget: tariff](#widget-tariff) |
| `color_tomorrow` | [Widgets](#widgets), [Widget: tariff](#widget-tariff) |
| `columns` | [Widgets](#widgets), [Widget: periods](#widget-periods) |
| `confirm` | [Rooms and sub-areas](#rooms-and-sub-areas), [Widgets](#widgets), [Widget: cover](#widget-cover) |
| `contact` | [Openings](#openings) |
| `data` | [Rooms and sub-areas](#rooms-and-sub-areas) |
| `day` | [Widget: periods](#widget-periods) |
| `day_night` | [Day and night](#day-and-night), [Ambience](#ambience) |
| `decimals` | [Summary chips](#summary-chips), [Widgets](#widgets), [Widget: gauge](#widget-gauge), [Widget: tile](#widget-tile), [Widget: periods](#widget-periods), [Device badges](#device-badges), [Texts and info boxes](#texts-and-info-boxes), [Connected furniture](#connected-furniture) |
| `demo` | [Card root](#card-root), [Demo](#demo) |
| `description` | [Templates](#templates) |
| `direction` | [Weather](#weather) |
| `domain` | [Templates](#templates) |
| `drawing_order` | [Layers](#layers) |
| `duration` | [Widgets](#widgets), [Widget: climate](#widget-climate), [Animations](#animations), [Traces](#traces) |
| `editor` | [Global settings](#global-settings) |
| `enabled` | [Full-plan alerts](#full-plan-alerts) |
| `energy` | [Energy flows](#energy-flows), [Ambience](#ambience) |
| `entities` | [Widgets](#widgets), [Widget: entities](#widget-entities), [People](#people), [Full-plan alerts](#full-plan-alerts) |
| `entity` | [Summary chips](#summary-chips), [Widgets](#widgets), [Widget: gauge](#widget-gauge), [Widget: tile](#widget-tile), [Widget: cover](#widget-cover), [Widget: thermostat](#widget-thermostat), [Openings](#openings), [Device badges](#device-badges), [Texts and info boxes](#texts-and-info-boxes), [Connected furniture](#connected-furniture), [Weather](#weather), [People](#people), [Full-plan alerts](#full-plan-alerts) |
| `factor` | [Widget: periods](#widget-periods) |
| `fences` | [Card root](#card-root), [Fences](#fences) |
| `full_page` | [Global settings](#global-settings) |
| `furniture` | [Card root](#card-root), [Furniture](#furniture), [Animations](#animations) |
| `grid_options` | [Preserved Home Assistant keys](#preserved-home-assistant-keys) |
| `group` | [Rooms and sub-areas](#rooms-and-sub-areas), [Groups](#groups), [Openings](#openings), [Device badges](#device-badges), [Texts and info boxes](#texts-and-info-boxes), [Furniture](#furniture) |
| `groups` | [Card root](#card-root), [Groups](#groups) |
| `h_max` | [Widgets](#widgets), [Widget: climate](#widget-climate) |
| `h_min` | [Widgets](#widgets), [Widget: climate](#widget-climate) |
| `halo` | [Device badges](#device-badges) |
| `hidden` | [Rooms and sub-areas](#rooms-and-sub-areas), [Layers](#layers), [Openings](#openings), [Device badges](#device-badges), [Texts and info boxes](#texts-and-info-boxes), [Furniture](#furniture) |
| `hide_if` | [Summary chips](#summary-chips) |
| `history` | [Widgets](#widgets), [Widget: tile](#widget-tile) |
| `home` | [People](#people) |
| `hours` | [Replay](#replay) |
| `humidity` | [Rooms and sub-areas](#rooms-and-sub-areas), [Global settings](#global-settings) |
| `humidity_attribute` | [Rooms and sub-areas](#rooms-and-sub-areas) |
| `icon` | [Summary chips](#summary-chips), [Rooms and sub-areas](#rooms-and-sub-areas), [Widgets](#widgets), [Device badges](#device-badges), [Texts and info boxes](#texts-and-info-boxes), [Templates](#templates), [Full-plan alerts](#full-plan-alerts) |
| `id` | [Card root](#card-root), [Groups](#groups) |
| `inactive` | [Badge style](#badge-style) |
| `info` | [Texts and info boxes](#texts-and-info-boxes) |
| `intensity` | [Animations](#animations), [Ambience](#ambience), [Day and night](#day-and-night), [Weather](#weather) |
| `interaction` | [Card root](#card-root), [Interaction](#interaction) |
| `item` | [Templates](#templates) |
| `items` | [Templates](#templates) |
| `kind` | [Templates](#templates) |
| `label` | [Rooms and sub-areas](#rooms-and-sub-areas) |
| `language` | [Global settings](#global-settings) |
| `layers` | [Card root](#card-root), [Layers](#layers) |
| `layout_options` | [Preserved Home Assistant keys](#preserved-home-assistant-keys) |
| `left` | [Rooms and sub-areas](#rooms-and-sub-areas), [Panels](#panels) |
| `legend` | [Global settings](#global-settings) |
| `level` | [Rooms and sub-areas](#rooms-and-sub-areas), [Layers](#layers), [Openings](#openings), [Device badges](#device-badges), [Texts and info boxes](#texts-and-info-boxes), [Furniture](#furniture), [Full-plan alerts](#full-plan-alerts) |
| `light` | [Animations](#animations) |
| `light_color` | [Device badges](#device-badges) |
| `lock_view` | [Interaction](#interaction) |
| `locked` | [Layers](#layers) |
| `margin` | [Global settings](#global-settings) |
| `marker` | [Day and night](#day-and-night) |
| `max` | [Widgets](#widgets), [Widget: gauge](#widget-gauge), [Global settings](#global-settings) |
| `min` | [Widgets](#widgets), [Widget: gauge](#widget-gauge), [Global settings](#global-settings) |
| `mirror` | [Furniture](#furniture) |
| `month` | [Widget: periods](#widget-periods) |
| `name` | [Summary chips](#summary-chips), [Rooms and sub-areas](#rooms-and-sub-areas), [Widgets](#widgets), [Widget: periods](#widget-periods), [Openings](#openings), [Device badges](#device-badges), [Texts and info boxes](#texts-and-info-boxes), [Furniture](#furniture), [Groups](#groups), [Templates](#templates), [Full-plan alerts](#full-plan-alerts), [Global settings](#global-settings) |
| `new_line` | [Summary chips](#summary-chips) |
| `north` | [Ambience](#ambience) |
| `note` | [Widgets](#widgets), [Widget: periods](#widget-periods) |
| `opening` | [Animations](#animations) |
| `openings` | [Card root](#card-root), [Openings](#openings) |
| `outside` | [Rooms and sub-areas](#rooms-and-sub-areas), [Widgets](#widgets), [Widget: climate](#widget-climate), [Openings](#openings) |
| `overlay_order` | [Layers](#layers) |
| `panels` | [Rooms and sub-areas](#rooms-and-sub-areas), [Panels](#panels), [Card root](#card-root), [Wall tablet](#wall-tablet) |
| `people` | [People](#people), [Ambience](#ambience) |
| `period` | [Widgets](#widgets), [Widget: tariff](#widget-tariff) |
| `periods` | [Widgets](#widgets), [Widget: periods](#widget-periods) |
| `persons` | [People](#people) |
| `plugged` | [Widgets](#widgets), [Widget: ev](#widget-ev) |
| `poly` | [Rooms and sub-areas](#rooms-and-sub-areas) |
| `pos` | [Device badges](#device-badges), [Texts and info boxes](#texts-and-info-boxes), [Furniture](#furniture), [Showcase](#showcase) |
| `power` | [Widgets](#widgets), [Widget: ev](#widget-ev) |
| `presence` | [Summary chips](#summary-chips), [Full-plan alerts](#full-plan-alerts), [Global settings](#global-settings) |
| `price` | [Widgets](#widgets), [Widget: tariff](#widget-tariff) |
| `protected` | [Openings](#openings), [Cards](#cards), [Device badges](#device-badges), [Connected furniture](#connected-furniture) |
| `range` | [Widgets](#widgets), [Widget: ev](#widget-ev) |
| `replay` | [Card root](#card-root), [Replay](#replay) |
| `reset_after` | [Interaction](#interaction) |
| `right` | [Rooms and sub-areas](#rooms-and-sub-areas), [Panels](#panels) |
| `room` | [Device badges](#device-badges) |
| `room_labels` | [Global settings](#global-settings) |
| `room_tap` | [Interaction](#interaction) |
| `rooms` | [Card root](#card-root), [Rooms and sub-areas](#rooms-and-sub-areas), [Widgets](#widgets), [Widget: climate](#widget-climate) |
| `rotation` | [Furniture](#furniture) |
| `rows` | [Widgets](#widgets) |
| `seg` | [Openings](#openings) |
| `session_cost` | [Widgets](#widgets), [Widget: ev](#widget-ev) |
| `session_kwh` | [Widgets](#widgets), [Widget: ev](#widget-ev) |
| `shape` | [Animations](#animations) |
| `show` | [Summary chips](#summary-chips) |
| `show_furniture` | [Global settings](#global-settings) |
| `showcase` | [Card root](#card-root), [Showcase](#showcase) |
| `shutter` | [Openings](#openings), [Animations](#animations) |
| `shutter_animation` | [Animations](#animations), [Openings](#openings) |
| `shutter_only` | [Openings](#openings) |
| `size` | [Texts and info boxes](#texts-and-info-boxes), [Furniture](#furniture), [Badge style](#badge-style) |
| `source` | [Widget: periods](#widget-periods), [Energy flows](#energy-flows) |
| `spacing` | [Widgets](#widgets), [Widget: divider](#widget-divider) |
| `speed` | [Replay](#replay) |
| `stable_h` | [Widgets](#widgets), [Widget: climate](#widget-climate) |
| `stable_t` | [Widgets](#widgets), [Widget: climate](#widget-climate) |
| `stat` | [Widget: periods](#widget-periods) |
| `state` | [Full-plan alerts](#full-plan-alerts) |
| `style` | [Texts and info boxes](#texts-and-info-boxes) |
| `sub_area` | [Rooms and sub-areas](#rooms-and-sub-areas) |
| `summary` | [Card root](#card-root), [Summary chips](#summary-chips), [Wall tablet](#wall-tablet) |
| `sun` | [Day and night](#day-and-night) |
| `t_max` | [Widgets](#widgets), [Widget: climate](#widget-climate) |
| `t_min` | [Widgets](#widgets), [Widget: climate](#widget-climate) |
| `tablet` | [Card root](#card-root), [Wall tablet](#wall-tablet) |
| `tap` | [Rooms and sub-areas](#rooms-and-sub-areas), [Openings](#openings), [Cards](#cards), [Device badges](#device-badges), [Connected furniture](#connected-furniture) |
| `target` | [Rooms and sub-areas](#rooms-and-sub-areas) |
| `temperature` | [Rooms and sub-areas](#rooms-and-sub-areas), [Global settings](#global-settings) |
| `temperature_attribute` | [Rooms and sub-areas](#rooms-and-sub-areas) |
| `temperature_tint` | [Global settings](#global-settings) |
| `templates` | [Card root](#card-root), [Templates](#templates) |
| `text` | [Texts and info boxes](#texts-and-info-boxes) |
| `texts` | [Card root](#card-root), [Texts and info boxes](#texts-and-info-boxes) |
| `threshold` | [Widgets](#widgets), [Widget: ev](#widget-ev), [Device badges](#device-badges), [Connected furniture](#connected-furniture), [Energy flows](#energy-flows) |
| `tint` | [Furniture](#furniture) |
| `title` | [Card root](#card-root), [Widgets](#widgets), [Widget: divider](#widget-divider), [Cards](#cards) |
| `traces` | [Traces](#traces), [Ambience](#ambience) |
| `type` | [Card root](#card-root), [Summary chips](#summary-chips), [Widgets](#widgets), [Openings](#openings), [Animations](#animations), [Furniture](#furniture), [Templates](#templates), [Full-plan alerts](#full-plan-alerts) |
| `unavailable` | [Badge style](#badge-style) |
| `unit` | [Summary chips](#summary-chips), [Widgets](#widgets), [Widget: gauge](#widget-gauge), [Widget: tile](#widget-tile), [Widget: periods](#widget-periods), [Device badges](#device-badges), [Texts and info boxes](#texts-and-info-boxes), [Connected furniture](#connected-furniture) |
| `value` | [Device badges](#device-badges), [Connected furniture](#connected-furniture) |
| `values` | [Badge style](#badge-style) |
| `view_button` | [Layers](#layers) |
| `view_layout` | [Preserved Home Assistant keys](#preserved-home-assistant-keys) |
| `visibility` | [Preserved Home Assistant keys](#preserved-home-assistant-keys) |
| `walls` | [Card root](#card-root), [Walls](#walls) |
| `weather` | [Weather](#weather), [Ambience](#ambience) |
| `week` | [Widget: periods](#widget-periods) |
| `when_away` | [Full-plan alerts](#full-plan-alerts) |
| `widgets` | [Cards](#cards) |
| `width` | [Showcase](#showcase) |
| `year` | [Widget: periods](#widget-periods) |
| `zoom` | [Rooms and sub-areas](#rooms-and-sub-areas) |

## Enumerated values

Every enumerated value, by key.

`<widget>` stands for any widget: in `panels.left` / `panels.right`, in a room's `panels`, in a `card` or in a widget template (`templates[].items`); `<person>` for a `person.*` entity id.

| Key path(s) | Values |
|---|---|
| `<widget>.columns[].source` | `stat` `entities` |
| `<widget>.periods[]` | `day` `week` `month` `year` |
| `<widget>.type` | `tariff` `ev` `gauge` `tile` `entities` `periods` `divider` `cover` `thermostat` `climate` |
| `alerts[].level` | `critical` `warning` `info` |
| `alerts[].type` | `openings` |
| `ambience.energy.source`<br>`furniture[].type`<br>`templates[].type` | `sofa` `corner_sofa` `armchair` `coffee_table` `tv_unit` `shelf` `rug` `plant` `fireplace` `square_table` `rect_table` `round_table` `chair` `counter` `sink` `hob` `fridge` `washing_machine` `dishwasher` `single_bed` `double_bed` `crib` `nightstand` `wardrobe` `dresser` `desk` `shower` `bathtub` `washbasin` `toilet` `boiler` `water_heater` `radiator` `electrical_panel` `router` `ev_charger` `heat_pump` `car` `bike` `tree` `pool` `area` `rect` `circle` `stairs` |
| `ambience.intensity` | `subtle` `normal` `strong` |
| `ambience.people.at_home`<br>`ambience.people.persons.<person>.at_home` | `grouped` `hidden` |
| `ambience.people.avatar`<br>`ambience.people.persons.<person>.avatar` | `picture` `initials` |
| `ambience.people.away`<br>`ambience.people.persons.<person>.away` | `direction` `zone` `hidden` |
| `ambience.weather.direction` | `wind` |
| `animation_level` | `full` `reduced` `none` |
| `animations.alert`<br>`animations.alert.type`<br>`animations.badge`<br>`animations.badge.type`<br>`animations.furniture`<br>`animations.furniture.type`<br>`animations.light`<br>`animations.light.type`<br>`animations.opening`<br>`animations.opening.type`<br>`animations.shutter`<br>`animations.shutter.type`<br>`badges[].animation`<br>`badges[].animation.type`<br>`furniture[].animation`<br>`furniture[].animation.type`<br>`openings[].animation`<br>`openings[].animation.type`<br>`openings[].shutter_animation`<br>`openings[].shutter_animation.type` | `none` `pulse` `breathe` `blink` `halo` `wave` `scroll` |
| `animations.alert.shape`<br>`animations.badge.shape`<br>`animations.furniture.shape`<br>`animations.light.shape`<br>`animations.opening.shape`<br>`animations.shutter.shape`<br>`badges[].animation.shape`<br>`furniture[].animation.shape`<br>`openings[].animation.shape`<br>`openings[].shutter_animation.shape` | `outline` |
| `badge_style.inactive` | `shown` `active_only` `dimmed` |
| `badge_style.size` | `small` `normal` `large` |
| `badge_style.unavailable` | `dimmed` `dashed` `hidden` |
| `badge_style.values` | `always` `hover` `never` |
| `badges[].tap`<br>`furniture[].tap`<br>`openings[].tap` | `card` `more_info` `none` |
| `interaction.room_tap` | `room_view` `more_info` `none` |
| `layers.drawing_order[]`<br>`layers.hidden[]`<br>`layers.locked[]`<br>`layers.overlay_order[]` | `rooms` `sub_areas` `halos` `furniture` `fences` `walls` `openings` `room_labels` `area_labels` `badges` `texts` |
| `openings[].type` | `window` `door` `gate` |
| `rooms[].actions[].target` | `room` |
| `show_furniture` | `desktop` |
| `summary[].show` | `away` `home` |
| `summary[].type` | `openings` `lights` `shutters` `temperature` `entity` |
| `templates[].kind` | `widget` `furniture` `badge` `opening` |
| `texts[].style` | `subtle` |

Not translated, but restricted by the card:

| Key | Values |
|---|---|
| `language` | `auto` `en` `fr` (free string; anything else = `auto`) |
| `show_furniture` | `true` `false` `desktop` |
| `replay.speed` | `60` `300` `900` `3600` (numbers) |
| `openings[].outside` | `[-1, 0]` `[1, 0]` `[0, -1]` `[0, 1]` |
