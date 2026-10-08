# Changelog

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
