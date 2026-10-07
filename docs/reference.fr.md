🇬🇧 [English version](reference.md)

# Référence de Maquette

Chaque élément d'une carte Maquette et chaque clé qu'elle accepte, une section par élément, avec les types, les valeurs,
les défauts, un exemple YAML valide et l'endroit où le trouver dans l'éditeur intégré.

> **Langue.** Les clés de configuration (et les valeurs énumérées) sont **en anglais uniquement** : c'est ce qu'on écrit
> dans le YAML, quelle que soit la langue. L'interface de la carte et de son éditeur suit la langue du profil Home
> Assistant (français ou anglais, voir [`language`](#réglages-généraux)) ; cette page cite donc les libellés français de
> l'éditeur.

> **Lien avec configuration.md (`docs/configuration.md`, publié avec le code)** (en anglais). Cette page est la *référence* exhaustive : une table
> de consultation de chaque clé publique et de chaque valeur énumérée. configuration.md (`docs/configuration.md`, publié avec le code) reste le
> *guide* détaillé : fonctionnement, manipulations dans l'éditeur et explications plus longues. En cas de désaccord entre
> les deux, c'est le code qui fait foi ; merci de le signaler.

## Sommaire

- [Conventions](#conventions)
- [Racine de la carte](#racine-de-la-carte)
- [Réglages généraux](#réglages-généraux)
- [Pièces et sous-zones](#pièces-et-sous-zones)
- [Murs](#murs)
- [Limites et clôtures](#limites-et-clôtures)
- [Ouvertures](#ouvertures)
- [Bulles d'appareils](#bulles-dappareils)
- [Textes et zones d'informations](#textes-et-zones-dinformations)
- [Meubles](#meubles)
- [Meubles connectés](#meubles-connectés)
- [Fiches](#fiches)
- [Panneaux](#panneaux)
- [Widgets](#widgets) :
  [tariff](#widget-tariff) · [ev](#widget-ev) · [gauge](#widget-gauge) · [tile](#widget-tile) ·
  [entities](#widget-entities) · [periods](#widget-periods) · [divider](#widget-divider) · [cover](#widget-cover) ·
  [thermostat](#widget-thermostat) · [climate](#widget-climate)
- [Puces de résumé](#puces-de-résumé)
- [Calques](#calques)
- [Groupes](#groupes)
- [Modèles](#modèles)
- [Ambiance](#ambiance) :
  [jour et nuit](#jour-et-nuit) · [météo](#météo) · [traces](#traces) · [flux d'énergie](#flux-dénergie) · [personnes](#personnes)
- [Style des bulles](#style-des-bulles)
- [Alertes plein plan](#alertes-plein-plan)
- [Animations](#animations)
- [Revoir la journée](#revoir-la-journée)
- [Exemples sous le plan](#exemples-sous-le-plan)
- [Interaction](#interaction)
- [Tablette murale](#tablette-murale)
- [Niveau d'animation](#niveau-danimation)
- [Démo](#démo)
- [Clés Home Assistant conservées](#clés-home-assistant-conservées)
- [Index des clés](#index-des-clés)
- [Valeurs énumérées](#valeurs-énumérées)

## Conventions

- **Unités.** Les coordonnées et les tailles sur le plan sont en **centimètres**. `x` croît vers la droite, **`y` croît
  vers le bas** (convention de l'écran). Un point s'écrit `[x, y]`, un segment `[x1, y1, x2, y2]`, un polygone est une
  liste de points.
- **Les angles** sont en degrés, dans le sens horaire (`rotation`, `north`, `direction`).
- **Entités.** Tout champ de type *entité* prend un identifiant d'entité Home Assistant (`sensor.living_temperature`).
  Les champs de type *attribut* prennent le nom d'un attribut de cette entité (`current_temperature`).
- **Les booléens** s'écrivent `true` / `false`. Les booléens écrits en texte (`"false"`, `"no"`, `"off"`, `"0"`,
  `"true"`, `"yes"`…) sont lus comme des booléens pour les clés booléennes ; les nombres écrits en texte (`"120"`) sont
  acceptés pour les coordonnées et les nombres.
- **Valeurs libres.** Les noms, identifiants d'entités, icônes (`mdi:…`), couleurs (`#rrggbb`, un nom de couleur CSS ou
  `var(--…)`), nombres, coordonnées, `data` de service et états HA sont recopiés tels quels. Seules les **clés** et les
  **valeurs énumérées** (colonne *Valeurs*, reprise sous [Valeurs énumérées](#valeurs-énumérées)) font partie du schéma.
- **Clés inconnues.** Une clé absente de cette page, ou une valeur énumérée écrite sous son ancien nom français, est
  ignorée avec un avertissement dans la console du navigateur (`maquette-card : unknown key « … » (ignored)`). Une
  configuration écrite entièrement avec les anciennes clés françaises (`pieces`, `murs`…) est refusée avec un message ;
  voir le CHANGELOG.
- **Les clés omises** prennent le défaut indiqué. *—* signifie « absent / non défini ». L'éditeur supprime une clé
  remise à sa valeur par défaut, pour que le YAML enregistré reste minimal.
- **Clés communes aux éléments.** Les pièces, ouvertures, bulles, textes et meubles acceptent aussi `hidden`, `level` et
  `group` (voir [Calques](#calques) et [Groupes](#groupes)).
- **Les chemins de l'éditeur** reprennent les libellés français de l'interface : *Éditeur : ⚙ Paramètres › Affichage*
  désigne le bouton ⚙ Paramètres de la barre d'outils de l'éditeur, section *Affichage*. *Ajouter › Meubles* désigne le
  bouton **Ajouter** (touche `A`), onglet *Meubles*.

## Racine de la carte

La carte elle-même : son type, son identité, son titre, et les listes de tous les éléments du plan.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `type` | texte | `custom:maquette-card` | — | Type de carte (obligatoire). L'ancien `custom:plan-maison-card` fonctionne encore comme alias |
| `id` | texte | | écrit par l'éditeur | Identifiant qui permet à l'éditeur de retrouver la carte à l'enregistrement ; sert aussi de clé aux choix de calques propres à chaque navigateur |
| `title` | texte | | — | Titre au-dessus du plan. `""` (vide) supprime l'en-tête en [mode tablette](#tablette-murale) |
| `summary` | liste / booléen | | 4 puces par défaut | [Puces de résumé](#puces-de-résumé) ; `false` ou `[]` = aucune |
| `rooms` | liste | | `[]` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `walls` | liste | | `[]` | [Murs](#murs) |
| `fences` | liste | | `[]` | [Limites et clôtures](#limites-et-clôtures) |
| `openings` | liste | | `[]` | [Ouvertures](#ouvertures) |
| `badges` | liste | | `[]` | [Bulles d'appareils](#bulles-dappareils) |
| `texts` | liste | | `[]` | [Textes et zones d'informations](#textes-et-zones-dinformations) |
| `furniture` | liste | | `[]` | [Meubles](#meubles) et [meubles connectés](#meubles-connectés) |
| `panels` | objet | | — | [Panneaux](#panneaux) de la vue d'ensemble |
| `layers` | objet | | — | [Calques](#calques) |
| `groups` | liste | | — | [Groupes](#groupes) |
| `templates` | liste | | — | [Modèles](#modèles) enregistrés par l'éditeur |
| `ambience` | objet | | — | [Ambiance](#ambiance) |
| `animations` | objet | | — | [Animations](#animations) par événement |
| `alerts` | liste | | — | [Alertes plein plan](#alertes-plein-plan) |
| `badge_style` | objet | | — | [Style des bulles](#style-des-bulles) |
| `replay` | booléen / objet | | — | [Revoir la journée](#revoir-la-journée) |
| `showcase` | booléen / objet | | — | [Exemples sous le plan](#exemples-sous-le-plan) |
| `interaction` | objet | | — | [Interaction](#interaction) |
| `tablet` | booléen / objet | | — | [Tablette murale](#tablette-murale) |
| `animation_level` | énum | `full` `reduced` `none` | `full` | [Niveau d'animation](#niveau-danimation) |
| `demo` | booléen | | — | [Démo](#démo) |
| `language`, `full_page`, `margin`, `editor`, `show_furniture`, `presence`, `room_labels`, `temperature_tint`, `legend` | | | | [Réglages généraux](#réglages-généraux) |
| `view_layout`, `layout_options`, `grid_options`, `visibility`, `card_mod` | | | | [Clés Home Assistant conservées](#clés-home-assistant-conservées) |

```yaml
type: custom:maquette-card
id: home
title: Maison
rooms:
  - name: Séjour
    poly: [[0, 0], [500, 0], [500, 420], [0, 420]]
walls:
  - [0, 0, 500, 0]
```

Éditeur : la carte s'ajoute depuis le sélecteur de cartes de Home Assistant (*Maquette*) ; `title` se trouve dans
⚙ Paramètres › Général ; `id` est écrit automatiquement au premier enregistrement.

## Réglages généraux

Options valables pour toute la carte, qui portent sur son fonctionnement plutôt que sur ce qu'elle dessine.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `language` | texte | `auto` `en` `fr` | `auto` | Langue de l'interface. `auto` suit le profil Home Assistant (français pour `fr*`, anglais sinon). Les nombres et les dates suivent toujours la locale de HA |
| `full_page` | booléen | | `true` | Mise en page pleine hauteur, sans barre de défilement, quand la carte fait au moins 760 px de large |
| `margin` | nombre (cm) | éditeur : 0–2000, pas de 10 | `40` | Marge autour du dessin |
| `editor` | booléen | | `true` | Affiche le bouton de l'éditeur (crayon), aux administrateurs seulement. `false` le masque : supprimer la clé dans l'éditeur de code de HA pour le retrouver |
| `show_furniture` | booléen / énum | `true` `false` `desktop` | `true` | `false` masque les meubles (comme `furniture` dans `layers.hidden`) ; `desktop` ne les affiche que si la carte fait au moins 760 px de large |
| `presence` | entité | zone, personne, groupe… | `zone.home` | Présence par défaut pour les puces avec `show` et les alertes avec `when_away` : une zone compte les personnes (> 0 = quelqu'un est là), une personne / un groupe / un capteur binaire est présent quand il vaut `home` / `on` |
| `room_labels` | objet | | tout à `true` | Contenu des étiquettes des pièces, voir ci-dessous |
| `room_labels.name` | booléen | | `true` | Nom de la pièce (toujours lu par les lecteurs d'écran quand `false`) |
| `room_labels.temperature` | booléen | | `true` | Température |
| `room_labels.humidity` | booléen | | `true` | Humidité. Une étiquette restée vide est masquée |
| `temperature_tint` | objet / `false` | | `{min: 17, max: 28}` | Couleur des pièces selon la température, et bornes du dégradé de la légende. `false` = ni teinte ni dégradé |
| `temperature_tint.min` | nombre (°C) | éditeur : −30–60, pas de 0,5 | `17` | Bleu à cette température et en dessous |
| `temperature_tint.max` | nombre (°C) | éditeur : −30–60, pas de 0,5 | `28` | Rouge à cette température et au-dessus. Si `min` ≥ `max`, les deux reprennent leurs défauts |
| `legend` | booléen | | `true` | `false` masque la légende sous le plan |

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

Éditeur : ⚙ Paramètres › Général (`title`, `language`, `full_page`, `margin`, `editor`), › Affichage (`show_furniture`,
`layers.view_button`), › Fonctions (`replay`, `showcase`, `presence`), › Pièces et légende (`room_labels`,
`temperature_tint`, `legend`).

## Pièces et sous-zones

Une pièce est un polygone, avec en option des capteurs de température et d'humidité ; la toucher ouvre la vue de la
pièce. Avec `sub_area: true`, elle devient une sous-zone : un contour pointillé et nommé à l'intérieur d'une autre pièce
(cuisine, douche…).

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `name` | texte | | — | Nom de la pièce (étiquette, vue de la pièce, listes) |
| `poly` | liste de `[x, y]` | ≥ 3 points | obligatoire | Contour. Une pièce sans 3 points valides est ignorée |
| `label` | `[x, y]` | | — | Position de l'étiquette ; pas d'étiquette sans elle |
| `temperature` | entité | | — | Capteur de température : valeur de l'étiquette et teinte de la pièce |
| `humidity` | entité | | — | Capteur d'humidité |
| `temperature_attribute` | attribut | | — | Lire cet attribut de `temperature` au lieu de son état (par exemple une entité `weather` ou `climate`) |
| `humidity_attribute` | attribut | | — | Idem pour `humidity` |
| `tap` | entité | | — | Entité ouverte depuis l'étiquette dans la vue de la pièce, et par `interaction.room_tap: more_info` (sinon `temperature`) |
| `outside` | booléen | | `false` | Espace extérieur : pas de teinte de température ; reçoit la météo et une teinte de nuit plus marquée |
| `zoom` | booléen | | `true` | `false` : pas de vue de la pièce au toucher (terrasse, cour…) ; l'étiquette ouvre toujours son entité |
| `area` | texte | id de pièce HA | — | Pièce Home Assistant liée : ses appareils, scènes et automatisations dans la vue de la pièce |
| `auto_actions` | booléen | | `true` | Boutons automatiques dans la vue de la pièce (lumières, volets) |
| `automations` | booléen | | `true` | Affiche les automatisations et scripts liés dans la vue de la pièce |
| `actions` | liste | | — | Boutons personnalisés de la vue de la pièce, voir ci-dessous |
| `panels` | objet | `{left, right}` | — | [Panneaux](#panneaux) affichés dans la vue de cette pièce |
| `sub_area` | booléen | | `false` | Sous-zone : contour pointillé, sans teinte, sans murs, non comptée dans les puces de résumé ; un clic ouvre la pièce qui la contient |
| `hidden` | booléen | | `false` | Masquée en vue (toujours comptée dans les puces de résumé) |
| `level` | nombre | | `0` | Ordre dans son calque (plus grand = au-dessus) |
| `group` | texte | `id` de groupe | — | Groupe de l'éditeur |

**Boutons de la pièce** (`rooms[].actions[]`) :

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `name` | texte | | — | Libellé du bouton |
| `icon` | icône | | — | Icône du bouton |
| `action` | texte | `domaine.service` | — | Service appelé (par exemple `scene.turn_on`, `light.turn_off`) |
| `target` | entité / énum | un id d'entité, ou `room` | — | Entité cible ; `room` = toute la pièce (sa pièce HA `area` si elle est liée, sinon les entités de la pièce de ce domaine) |
| `data` | objet | | `{}` | Données du service, recopiées telles quelles |
| `confirm` | booléen | | `false` | Confirmation en deux appuis |

```yaml
rooms:
  - name: Séjour
    poly: [[0, 0], [500, 0], [500, 420], [0, 420]]
    label: [250, 210]
    temperature: sensor.living_temperature
    humidity: sensor.living_humidity
    tap: sensor.living_temperature
    area: living_room
    auto_actions: true
    automations: true
    actions:
      - name: Mode cinéma
        icon: mdi:movie-open-outline
        action: scene.turn_on
        target: scene.movie
        data: {}
        confirm: true
      - {name: Tout éteindre, icon: mdi:lightbulb-off, action: light.turn_off, target: room}
    panels:
      right:
        - {type: tile, title: Température, entity: sensor.living_temperature, history: 24}
  - name: Terrasse
    poly: [[0, 420], [500, 420], [500, 700], [0, 700]]
    outside: true
    zoom: false
    temperature: weather.home
    temperature_attribute: temperature
    humidity: weather.home
    humidity_attribute: humidity
  - name: Cuisine
    sub_area: true
    poly: [[20, 20], [200, 20], [200, 120], [20, 120]]
    label: [110, 70]
    level: 1
    hidden: false
    group: ground_floor
```

Éditeur : barre d'outils *Pièce rectangulaire avec ses murs (R)* ou *Pièce de forme libre (P)* ; *Ajouter › Pièces*
(*Pièce Home Assistant*, *Toutes mes pièces HA*) ; sélectionner une pièce pour la modifier dans le panneau latéral
(*Boutons d'action*, *Panneau gauche* / *Panneau droit*, *Sous-zone*). Sous-zones : *Ajouter › Meubles › Sous-zones
(cuisine, douche…)*.

## Murs

Les murs sont de simples segments épais. Ils ne portent que leur calque et un groupe facultatif.

| Élément | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `[x1, y1, x2, y2]` | liste de 4 nombres | | obligatoire | Segment, de (`x1`, `y1`) à (`x2`, `y2`) |
| 5e valeur | texte | `id` de groupe | — | [Groupe](#groupes) facultatif : `[x1, y1, x2, y2, "<id>"]` |

```yaml
walls:
  - [0, 0, 500, 0]
  - [500, 0, 500, 420, ground_floor]
```

Éditeur : barre d'outils *Mur (M)* ; sélectionner un mur pour *En limite* (le transformer en clôture) et *Couper en
deux*. Masquer ou verrouiller tous les murs dans *Calques*.

## Limites et clôtures

Clôtures et limites de propriété : segments plus fins, soulignés d'un contour, au même format que les murs.

| Élément | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `[x1, y1, x2, y2]` | liste de 4 nombres | | obligatoire | Segment |
| 5e valeur | texte | `id` de groupe | — | [Groupe](#groupes) facultatif |

```yaml
fences:
  - [-300, -200, 900, -200]
  - [900, -200, 900, 800, garden]
```

Éditeur : barre d'outils *Limite / clôture (L)* ; en sélectionner une pour *En mur* et *Couper en deux*.

## Ouvertures

Fenêtres, portes et portails dessinés sur un segment de mur, avec leur contact, leur volet ou leur entité motorisée.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `type` | énum | `window` `door` `gate` | obligatoire | Genre d'ouverture (dessin, icônes) |
| `seg` | `[x1, y1, x2, y2]` | | obligatoire | Segment sur le mur. Une ouverture sans `seg` valide est ignorée |
| `name` | texte | | — | Nom (listes, en-tête de la fiche, puce des ouvertures) |
| `contact` | entité | | — | Capteur d'ouverture : rouge quand il vaut `on` / `open` |
| `shutter` | entité | | — | Volet (`cover`) : dessiné côté extérieur, plus sombre quand il est fermé, animé pendant qu'il bouge |
| `entity` | entité | | — | Ouverture motorisée (portail, porte de garage), utilisée en l'absence de `contact` |
| `outside` | `[dx, dy]` | `[-1, 0]` `[1, 0]` `[0, -1]` `[0, 1]` | `[0, 0]` | Direction de l'extérieur (gauche, droite, haut, bas) : le volet est dessiné de ce côté |
| `shutter_only` | booléen | | `false` | Ne dessiner que le volet, sans le trait de la fenêtre |
| `bay` | texte | | — | Nom de baie : les vantaux qui ont la même `bay` forment une seule baie (une fiche, une ligne, comptée une fois) |
| `animation` | énum / objet | voir [Animations](#animations) | `animations.opening` | Animation de cette ouverture quand elle est ouverte |
| `shutter_animation` | énum / objet | voir [Animations](#animations) | `animations.shutter` | Animation de son volet pendant qu'il bouge |
| `tap` | énum | `card` `more_info` `none` | `card` s'il y a une `card`, sinon plus d'infos | Effet d'un toucher, voir [Fiches](#fiches) |
| `protected` | booléen | | `false` | Pas d'interrupteur « éteindre » dans sa fiche |
| `card` | objet / liste | | — | Sa [fiche](#fiches) |
| `hidden` | booléen | | `false` | Masquée en vue |
| `level` | nombre | | `0` | Ordre dans le calque Ouvertures |
| `group` | texte | `id` de groupe | — | Groupe de l'éditeur |

```yaml
openings:
  - type: window
    seg: [90, 0, 410, 0]
    name: Fenêtre du séjour
    contact: binary_sensor.living_window
    shutter: cover.living_shutter
    outside: [0, -1]
    shutter_only: false
    bay: Baie du séjour
    animation: wave
    shutter_animation: {type: pulse, duration: 1}
    tap: card
    protected: false
    card:
      title: Baie du séjour
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

Éditeur : barre d'outils *Ouverture (O)*, ou *Ajouter › Ouvertures* (*Fenêtre + contact*, *Portail / garage*…) ; la
sélectionner pour le panneau latéral (*Contact*, *Volet*, *Côté extérieur*, *Baie (vantaux regroupés)*, *Animation
(ouverte)*, *Animation du volet (en mouvement)*, *Fiche*).

## Bulles d'appareils

Une bulle est une icône ronde d'appareil posée sur le plan, colorée quand son entité est active, avec en option une
valeur, un halo lumineux, une animation et une fiche.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `entity` | entité | | — | Entité principale : état, couleur, plus d'infos, allumer / éteindre dans sa fiche |
| `pos` | `[x, y]` | | obligatoire | Position. Une bulle sans `pos` valide est ignorée |
| `icon` | icône | | `mdi:circle` | Icône |
| `name` | texte | | nom de l'entité | Info-bulle, listes, en-tête de la fiche |
| `color` | couleur | | couleur principale du thème | Couleur quand elle est active |
| `light_color` | booléen | | déduit de `color` | La couleur est claire : l'icône est dessinée en sombre quand la bulle est active |
| `halo` | nombre (cm) / booléen | | — | Rayon du halo lumineux quand elle est active ; `true` = 130 |
| `room` | texte | un `name` de pièce | — | Limiter le halo à cette pièce |
| `alert` | booléen | | `false` | Bulle d'alerte : utilise `animations.alert` (pulsation) quand elle est active |
| `active` | entité | | `entity` | Entité qui définit l'état « actif » |
| `active_attribute` | attribut | | — | Utiliser cet attribut de l'entité active au lieu de son état |
| `threshold` | nombre | | — | Active quand la valeur active dépasse ce nombre. Sans lui : active pour `on`, `open`, `opening`, `closing`, `playing`, `heating`, `cooling`, `cleaning`, `detected`, `home` |
| `value` | entité | | — | Valeur numérique affichée dans la bulle |
| `attribute` | attribut | | — | Affiche cet attribut de `entity` comme valeur (prime sur `value`) |
| `unit` | texte | | unité de l'entité | Unité après la valeur (écrite telle quelle, par exemple `" °C"`) |
| `decimals` | nombre | 0–6 | `0` | Décimales de `value` |
| `tap` | énum | `card` `more_info` `none` | `card` s'il y a une `card`, sinon plus d'infos | Voir [Fiches](#fiches) |
| `protected` | booléen | | `false` | Pas d'interrupteur « éteindre » dans sa fiche |
| `card` | objet / liste | | — | Sa [fiche](#fiches) |
| `animation` | énum / objet | voir [Animations](#animations) | `animations.light`, `.alert` ou `.badge` | Animation quand elle est active |
| `hidden` | booléen | | `false` | Masquée en vue (toujours comptée, toujours présente dans la vue de la pièce et les listes) |
| `level` | nombre | | `0` | Ordre dans le calque Appareils |
| `group` | texte | `id` de groupe | — | Groupe de l'éditeur |

```yaml
badges:
  - entity: light.living_lamp
    pos: [230, 200]
    icon: mdi:floor-lamp
    name: Lampe
    color: "#f6c445"
    light_color: true
    halo: 170
    room: Séjour
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
    card: {title: Lave-linge, widgets: [{type: tile, entity: sensor.washer_power, history: 24}]}
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

Éditeur : *Ajouter › Appareils* (*Lumière*, *Appareil libre*…), puis cliquer sur le plan ; la sélectionner pour le
panneau latéral (*Valeur affichée sur la pastille*, *Réglages avancés*, *Fiche*, *Animation*).

## Textes et zones d'informations

Un texte est une étiquette libre sur le plan. Avec `info`, il devient une zone d'informations : une liste encadrée de
valeurs d'entités en direct.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `text` | texte | | — | Le texte ; le titre d'une zone d'informations (facultatif dans ce cas) |
| `pos` | `[x, y]` | | obligatoire | Centre. Un texte sans `pos` valide est ignoré |
| `size` | nombre | | `1` | Facteur de taille de la police (1 = taille par défaut) ; les textes suivent le zoom |
| `style` | énum | `subtle` | encadré | Zones d'informations seulement : `subtle` = sans fond |
| `info` | liste | | — | Lignes de la zone d'informations, voir ci-dessous |
| `hidden` | booléen | | `false` | Masqué en vue |
| `level` | nombre | | `0` | Ordre dans le calque Textes |
| `group` | texte | `id` de groupe | — | Groupe de l'éditeur |

**Lignes d'une zone d'informations** (`texts[].info[]`) :

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `entity` | entité | | — | Entité affichée (un toucher ouvre sa fenêtre plus d'infos) |
| `name` | texte | | nom de l'entité | Nom de la ligne |
| `attribute` | attribut | | — | Affiche cet attribut au lieu de l'état |
| `unit` | texte | | unité de l'entité | Unité |
| `decimals` | nombre | | 1 (0 à partir de 100) | Décimales |
| `icon` | icône | | icône de l'entité ou de la mesure | Icône |

```yaml
texts:
  - text: Jardin
    pos: [700, 500]
    size: 1.4
  - text: Dehors
    pos: [700, -100]
    style: subtle
    level: 1
    group: garden
    hidden: false
    info:
      - {entity: sensor.outside_temperature}
      - {entity: sensor.living_humidity, name: Séjour, decimals: 0}
      - {entity: climate.thermostat, attribute: current_temperature, unit: "°C", icon: mdi:thermostat}
```

Éditeur : barre d'outils *Texte (T)* ; *Ajouter › Zone d'informations*, puis *Entité* pour ajouter des lignes dans son
panneau.

## Meubles

Symboles vus de dessus. Un meuble simple ne capte jamais les clics en vue ; un meuble doté d'une entité, d'une valeur ou
d'une fiche est un [meuble connecté](#meubles-connectés).

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `type` | énum | voir le catalogue ci-dessous | obligatoire | Symbole. Un type inconnu est dessiné comme un rectangle |
| `pos` | `[x, y]` | | `[0, 0]` | Centre |
| `size` | `[largeur, profondeur]` / nombre | 5–5000 chacune | taille du catalogue | Taille avant rotation ; un nombre seul = un carré |
| `rotation` | nombre (°) | | `0` | Rotation dans le sens horaire |
| `mirror` | booléen | | `false` | En miroir (canapé d'angle, baignoire…) |
| `name` | texte | | nom du type | Info-bulle ; pour `area`, le libellé dessiné sur le plan |
| `chairs` | nombre | 0–12 | selon la table | Tables seulement : nombre de chaises |
| `tint` | booléen | | `true` | Meuble connecté : teinté au repos (`false` = couleur seulement quand il est actif) |
| `hidden` | booléen | | `false` | Masqué en vue |
| `level` | nombre | | `0` (`-1` pour `rug` et `area`) | Ordre dans le calque Meubles |
| `group` | texte | `id` de groupe | — | Groupe de l'éditeur |
| `entity`, `value`, `active`, `active_attribute`, `threshold`, `attribute`, `unit`, `decimals`, `color`, `tap`, `protected`, `card`, `animation` | | | | Voir [Meubles connectés](#meubles-connectés) |

```yaml
furniture:
  - type: double_bed
    pos: [420, 160]
    size: [160, 200]
    rotation: 90
    name: Lit
  - type: corner_sofa
    pos: [150, 300]
    mirror: true
  - type: round_table
    pos: [380, 330]
    chairs: 5
  - type: area
    pos: [120, 80]
    size: [220, 140]
    name: Coin lecture
    level: -1
    group: ground_floor
    hidden: false
```

**Catalogue** (catégorie telle qu'affichée dans l'éditeur, taille par défaut en cm, largeur × profondeur) :

| Catégorie | `type` | Nom | Taille par défaut | Remarques |
|---|---|---|---|---|
| Séjour | `sofa` | Canapé | 200 × 90 |  |
| Séjour | `corner_sofa` | Canapé d'angle | 250 × 200 |  |
| Séjour | `armchair` | Fauteuil | 80 × 80 |  |
| Séjour | `coffee_table` | Table basse | 100 × 60 |  |
| Séjour | `tv_unit` | Meuble TV | 160 × 45 | couleur `#7e57c2` |
| Séjour | `shelf` | Étagère | 100 × 35 |  |
| Séjour | `rug` | Tapis | 200 × 140 | niveau −1 |
| Séjour | `plant` | Plante | 45 × 45 |  |
| Séjour | `fireplace` | Cheminée / poêle | 100 × 50 |  |
| Repas | `square_table` | Table carrée | 90 × 90 | 4 chaises |
| Repas | `rect_table` | Table rectangulaire | 160 × 90 | 6 chaises |
| Repas | `round_table` | Table ronde | 110 × 110 | 4 chaises, ronde |
| Repas | `chair` | Chaise | 45 × 45 |  |
| Cuisine | `counter` | Plan de travail | 240 × 60 |  |
| Cuisine | `sink` | Évier | 100 × 60 |  |
| Cuisine | `hob` | Plaques de cuisson | 60 × 60 | couleur `#ff7043` |
| Cuisine | `fridge` | Réfrigérateur | 60 × 65 | couleur `#29b6f6` |
| Cuisine | `washing_machine` | Lave-linge | 60 × 60 | couleur `#42a5f5` |
| Cuisine | `dishwasher` | Lave-vaisselle | 60 × 60 | couleur `#42a5f5` |
| Chambre et bureau | `single_bed` | Lit simple | 90 × 190 |  |
| Chambre et bureau | `double_bed` | Lit double | 160 × 200 |  |
| Chambre et bureau | `crib` | Lit bébé | 60 × 120 |  |
| Chambre et bureau | `wardrobe` | Armoire | 120 × 60 |  |
| Chambre et bureau | `dresser` | Commode | 100 × 50 |  |
| Chambre et bureau | `desk` | Bureau | 140 × 70 | couleur `#fb8c00` |
| Chambre et bureau | `nightstand` | Table de nuit | 45 × 40 |  |
| Salle d'eau | `shower` | Douche | 90 × 90 |  |
| Salle d'eau | `bathtub` | Baignoire | 170 × 75 |  |
| Salle d'eau | `washbasin` | Lavabo | 60 × 45 |  |
| Salle d'eau | `toilet` | WC | 40 × 65 |  |
| Technique | `boiler` | Chaudière | 45 × 35 | couleur `#ef5350` |
| Technique | `water_heater` | Ballon d'eau chaude | 55 × 55 | rond, couleur `#ef5350` |
| Technique | `radiator` | Radiateur | 80 × 12 | couleur `#ef5350` |
| Technique | `electrical_panel` | Tableau électrique | 50 × 15 | couleur `#fbc02d` |
| Technique | `router` | Box internet / NAS | 35 × 25 | couleur `#26a69a` |
| Technique | `ev_charger` | Borne de recharge | 30 × 20 | couleur `#43a047` |
| Technique | `heat_pump` | Pompe à chaleur / clim (extérieur) | 90 × 35 | couleur `#26c6da` |
| Formes et espaces | `area` | Espace nommé | 300 × 200 | niveau −1 |
| Formes et espaces | `rect` | Rectangle libre | 100 × 60 |  |
| Formes et espaces | `circle` | Cercle libre | 60 × 60 | rond |
| Formes et espaces | `stairs` | Escalier | 90 × 280 |  |
| Extérieur | `car` | Voiture | 178 × 406 | couleur `#43a047` |
| Extérieur | `bike` | Vélo | 60 × 180 |  |
| Extérieur | `tree` | Arbre / arbuste | 200 × 200 | rond |
| Extérieur | `pool` | Piscine | 800 × 400 |  |

Les tapis et les espaces nommés sont dessinés sous les autres meubles (`level: -1` par défaut). Les types *ronds* n'ont
pas de bouton miroir. La *couleur* est l'accent par défaut des meubles connectés de ce type.

Éditeur : *Ajouter › Meubles* (onglets par catégorie, recherche), cliquer pour poser ; le sélectionner pour la taille,
la rotation (±15°, ±90°), *Miroir*, *Chaises*, *Modèle*.

## Meubles connectés

Tout meuble devient connecté avec une `entity`, une `value` ou une `card` : teinte d'accent, aspect « actif », pastille
de valeur, et zone tactile qui ouvre sa fiche ou sa fenêtre plus d'infos. Mêmes clés et même sens que pour les
[bulles d'appareils](#bulles-dappareils).

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `entity` | entité | | — | Entité principale : état, aspect actif, allumer / éteindre dans sa fiche |
| `value` | entité | | — | Valeur numérique affichée dans une pastille sur le meuble (masquée en dessous de 24 px à l'écran) |
| `active` | entité | | `entity` | Entité qui définit l'état « actif » |
| `active_attribute` | attribut | | — | Attribut de l'entité active |
| `threshold` | nombre | | — | Actif au-dessus de cette valeur (par exemple `50` W pour une borne de recharge) |
| `attribute` | attribut | | — | Affiche cet attribut de `entity` comme valeur |
| `unit` | texte | | unité de l'entité | Unité de la valeur |
| `decimals` | nombre | 0–6 | `0` | Décimales de la valeur |
| `color` | couleur | `#rgb`…`#rrggbbaa`, nom CSS, `var(--…)` | selon le type, sinon couleur principale du thème | Couleur d'accent (voir le catalogue) |
| `tint` | booléen | | `true` | `false` = coloré seulement quand il est actif |
| `tap` | énum | `card` `more_info` `none` | `card` s'il y a une `card`, `more_info` avec une entité ou une valeur, sinon `none` | Effet d'un toucher |
| `protected` | booléen | | `false` | Pas d'interrupteur « éteindre » dans sa fiche (réfrigérateur, congélateur…) |
| `card` | objet / liste | | — | Sa [fiche](#fiches) |
| `animation` | énum / objet | voir [Animations](#animations) | `animations.furniture` | Animation quand il est actif ; `shape: outline` suit son contour |

```yaml
furniture:
  - type: ev_charger
    pos: [495, -870]
    name: Borne
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
      title: Recharge de la voiture
      widgets:
        - {type: ev, title: Voiture, battery: sensor.ev_battery, power: sensor.charger_plug_power}
  - type: boiler
    pos: [40, 600]
    entity: climate.boiler
    active_attribute: hvac_action
    attribute: current_temperature
```

Éditeur : sélectionner le meuble › *Connecté* (entité, valeur, effet du toucher, protégé, *Réglages avancés*) ;
*Remplir depuis l'appareil* propose une fiche ; *Fusionner avec « … »* absorbe une bulle de la même entité située à
moins de 1,5 m.

## Fiches

Une fiche est la fenêtre qui s'ouvre quand on touche une ouverture, une bulle ou un meuble connecté : un en-tête (icône,
nom, état, interrupteur allumer / éteindre) et une pile de [widgets](#widgets).

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `card` | objet / liste | | — | La fiche ; une simple liste est lue comme ses `widgets` |
| `card.title` | texte | | nom de l'élément | Titre de la fiche |
| `card.widgets` | liste | [widgets](#widgets) | `[]` | Widgets, dans l'ordre (mêmes types et mêmes clés que dans les panneaux) |
| `tap` | énum | `card` `more_info` `none` | `card` s'il y a une fiche | `card` ouvre la fiche, `more_info` la fenêtre plus d'infos de HA pour l'entité principale, `none` ne fait rien |
| `protected` | booléen | | `false` | Ne jamais afficher l'interrupteur « éteindre » (un bouton « Rallumer » seulement quand l'élément est éteint) |

L'interrupteur allumer / éteindre n'apparaît que pour les entités `switch`, `light`, `fan` et `input_boolean`. Dans une
fiche, les lignes affichent des valeurs (pas d'interrupteurs) ; les seuls services appelés sont le `turn_on` /
`turn_off` de l'élément lui-même et les boutons des widgets [cover](#widget-cover) et [thermostat](#widget-thermostat).

```yaml
badges:
  - entity: switch.fridge_plug
    pos: [80, 60]
    tap: card
    protected: true
    card:
      title: Réfrigérateur
      widgets:
        - {type: tile, title: Puissance, entity: sensor.fridge_power, history: 24}
        - {type: entities, entities: [sensor.fridge_temperature, {entity: sensor.fridge_energy, name: Aujourd'hui}]}
openings:
  - type: door
    seg: [0, 100, 0, 190]
    contact: binary_sensor.back_door
    card:
      - {type: entities, entities: [binary_sensor.back_door, sensor.back_door_battery]}
```

Éditeur : sélectionner l'ouverture, la bulle ou le meuble › *Fiche* : *Ajouter un widget*, *Remplir depuis l'appareil*,
*Fiche en modèle* ; la colonne de droite montre la vraie fiche tant que l'élément est sélectionné.

## Panneaux

Colonnes latérales de widgets à côté du plan. Les `panels` de la carte s'affichent dans la vue d'ensemble ; ceux d'une
pièce dans la vue de cette pièce.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `panels.left` | liste | [widgets](#widgets) | `[]` | Colonne de gauche (fusionnée en une seule colonne sur les écrans étroits) |
| `panels.right` | liste | [widgets](#widgets) | `[]` | Colonne de droite |

```yaml
panels:
  left:
    - {type: tariff, title: Tarif, price: sensor.tempo_price, period: sensor.tempo_period}
  right:
    - {type: gauge, title: Puissance, entity: sensor.linky_power, min: 0, max: 9000}
rooms:
  - name: Bureau
    poly: [[0, 0], [300, 0], [300, 300], [0, 300]]
    panels:
      left: [{type: climate, rooms: [Bureau]}]
      right: []
```

Éditeur : *Ajouter un widget* sous les colonnes *Panneau gauche* / *Panneau droit* (ou *Ajouter › Widgets*) ; cliquer
sur un widget pour le modifier, le faire glisser pour le déplacer. Panneaux d'une pièce : sélectionner la pièce ›
*Panneau gauche* / *Panneau droit*. Masqués par défaut en [mode tablette](#tablette-murale).

## Widgets

Les widgets remplissent les [panneaux](#panneaux) et les [fiches](#fiches). Chaque widget a un `type` ; les clés
ci-dessous sont communes, et chaque type ajoute les siennes (une même clé a toujours le même sens).

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `type` | énum | `tariff` `ev` `gauge` `tile` `entities` `periods` `divider` `cover` `thermostat` `climate` | obligatoire | Type de widget |
| `title` | texte | | — | Titre de l'en-tête (`cover`, `thermostat` : nom de l'entité) |
| `icon` | icône | | selon le type | Icône de l'en-tête |
| `color` | couleur | | — | Couleur d'accent (`gauge` : couleur de l'arc) |
| `rows` | liste | | — | Lignes supplémentaires sous `tile`, `gauge`, `tariff`, `ev`, `cover` et `thermostat`, voir ci-dessous |

**Lignes** (`rows[]`, ainsi que `entities[]` du widget [entities](#widget-entities)) : un id d'entité, ou un objet :

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `entity` | entité | | — | Entité affichée (toucher = plus d'infos) |
| `name` | texte | | nom de l'entité | Nom de la ligne |
| `icon` | icône | | icône de l'entité | Icône de la ligne |
| `decimals` | nombre | | 1 (0 à partir de 100) | Décimales |
| `unit` | texte | | unité de l'entité | Unité |

```yaml
panels:
  right:
    - type: tile
      title: Dehors
      icon: mdi:thermometer
      color: "#1a73e8"
      entity: sensor.outside_temperature
      rows:
        - sensor.outside_humidity
        - {entity: sensor.outside_pressure, name: Pression, icon: mdi:gauge, decimals: 0, unit: hPa}
```

Éditeur : *Ajouter › Widgets*, ou *Ajouter un widget* dans un panneau ou une fiche ; cliquer sur le widget pour le
modifier.

### Widget `tariff`

Prix de l'électricité en direct, période en cours (heures pleines / heures creuses) et couleurs Tempo du jour et du
lendemain.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `price` | entité | | — | Capteur de prix (son unité, sinon €/kWh) |
| `period` | entité | | — | Période en cours ; verte quand elle contient « creuse » / « off-peak », orange sinon |
| `color_today` | entité | | — | Couleur Tempo du jour (`Bleu` / `Blanc` / `Rouge` ou `Blue` / `White` / `Red`) |
| `color_tomorrow` | entité | | — | Couleur Tempo du lendemain |

```yaml
panels:
  left:
    - type: tariff
      title: Tarif en direct
      price: sensor.tempo_price
      period: sensor.tempo_period
      color_today: sensor.tempo_today
      color_tomorrow: sensor.tempo_tomorrow
```

### Widget `ev`

Véhicule électrique : anneau de batterie, état de charge, autonomie et session de recharge.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `battery` | entité | | — | Niveau de batterie (%) |
| `range` | entité | | — | Autonomie |
| `power` | entité | | — | Puissance de charge (W) |
| `threshold` | nombre (W) | | `50` | En charge quand `power` dépasse ce seuil |
| `plugged` | entité | | — | État de branchement (`on`, `plugged`, `connected`, `true`) |
| `session_kwh` | entité | | — | Énergie de la session |
| `session_cost` | entité | | — | Coût de la session |

```yaml
panels:
  left:
    - type: ev
      title: Voiture
      battery: sensor.ev_battery
      range: sensor.ev_range
      power: sensor.charger_power
      threshold: 50
      plugged: binary_sensor.ev_plugged
      session_kwh: sensor.charger_session
      session_cost: sensor.charger_session_cost
```

### Widget `gauge`

Une valeur sur un arc entre un minimum et un maximum (vert, puis orange à partir de 60 %, rouge à partir de 85 %, sauf
avec `color`).

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `entity` | entité | | — | Valeur |
| `min` | nombre | | `0` | Début de l'arc |
| `max` | nombre | | `100` | Fin de l'arc (l'éditeur propose 9000) |
| `unit` | texte | | unité de l'entité | Unité |
| `decimals` | nombre | | 1 (0 à partir de 100) | Décimales |

```yaml
panels:
  right:
    - {type: gauge, title: Puissance, entity: sensor.linky_power, min: 0, max: 9000, unit: W, decimals: 0}
```

### Widget `tile`

Une grande valeur, avec en option un graphique d'historique.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `entity` | entité | | — | Valeur |
| `unit` | texte | | unité de l'entité | Unité |
| `decimals` | nombre | | 1 (0 à partir de 100) | Décimales |
| `history` | nombre (h) | | — | Heures d'historique du graphique ; `0` ou absent = pas de graphique (l'éditeur propose 24) |

```yaml
panels:
  right:
    - {type: tile, title: Réfrigérateur, entity: sensor.fridge_temperature, unit: "°C", decimals: 1, history: 24}
```

### Widget `entities`

Une liste d'entités ; les lumières, interrupteurs, ventilateurs et booléens d'entrée ont un interrupteur (valeurs
seulement dans une fiche).

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `entities` | liste | lignes | — | Même format que [`rows`](#widgets) |

```yaml
panels:
  left:
    - type: entities
      title: Lumières
      entities:
        - light.living_lamp
        - {entity: switch.coffee_maker, name: Café, icon: mdi:coffee}
```

### Widget `periods`

Un tableau jour / semaine / mois / année, tiré des statistiques à long terme de HA ou de quatre entités par colonne.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `periods` | liste | `day` `week` `month` `year` | les quatre | Lignes, dans cet ordre |
| `columns` | liste | | `[]` | Colonnes, voir ci-dessous |
| `note` | texte | | — | Note sous le tableau |

**Colonnes** (`columns[]`) :

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `name` | texte | | — | En-tête de la colonne |
| `unit` | texte | | — | Unité sous l'en-tête |
| `stat` | entité | | — | Capteur cumulatif : variation sur le jour / la semaine / le mois / l'année calendaire, d'après les statistiques de HA |
| `factor` | nombre | | `1` | Multiplicateur appliqué à `stat` (par exemple `0.001` pour passer de Wh à kWh) |
| `decimals` | nombre | | `2` | Décimales |
| `day`, `week`, `month`, `year` | entité | | — | Sans `stat` : une entité par période |
| `source` | énum | `stat` `entities` | — | Écrit par l'éditeur pour retenir laquelle des deux sources la colonne utilise |

```yaml
panels:
  left:
    - type: periods
      title: Consommation
      periods: [day, week, month, year]
      note: D'après le compteur Linky
      columns:
        - {name: Énergie, unit: kWh, stat: sensor.energy_total, factor: 0.001, decimals: 1, source: stat}
        - name: Coût
          unit: €
          source: entities
          day: sensor.cost_day
          week: sensor.cost_week
          month: sensor.cost_month
          year: sensor.cost_year
```

### Widget `divider`

Un trait horizontal, avec en option un titre de section.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `title` | texte | | — | Titre de section |
| `spacing` | nombre (px) | | — | Espace au-dessus et en dessous |

```yaml
panels:
  left:
    - {type: divider, title: Chauffage, spacing: 12}
```

### Widget `cover`

Commande d'un `cover` (volet, store, portail, garage ou porte motorisée) : état, barre de position, *Ouvrir* / *Stop* /
*Fermer*.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `entity` | entité | un `cover.*` | — | Le volet ; les autres domaines sont écartés |
| `confirm` | booléen | | `true` pour les classes d'appareil `garage`, `gate`, `door` ; sinon `false` | Confirmation en deux appuis (second appui dans les 4 s) |

Seuls `cover.open_cover`, `cover.stop_cover` et `cover.close_cover` de cette entité sont appelés ; *Stop* est masqué
quand le volet ne le prend pas en charge.

```yaml
panels:
  left:
    - type: cover
      title: Portail
      entity: cover.gate
      confirm: true
      rows: [{entity: binary_sensor.gate_closed}]
```

### Widget `thermostat`

Une entité `climate` : température mesurée, consigne avec −/+ (pas et limites de l'appareil), action en cours, mode.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `entity` | entité | un `climate.*` | — | Thermostat |

```yaml
panels:
  right:
    - {type: thermostat, entity: climate.living_room, rows: [sensor.living_humidity]}
```

### Widget `climate`

Température et humidité de chaque pièce équipée de capteurs, avec leur tendance sur une durée donnée et des alertes.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `duration` | nombre (min) | 5–240 | `30` | Fenêtre de la tendance (d'après l'historique de HA) |
| `rooms` | liste | `name` de pièces | chaque pièce munie d'un capteur | Pièces affichées (les pièces qui partagent les mêmes capteurs n'apparaissent qu'une fois) |
| `outside` | booléen | | `true` | `false` masque les pièces extérieures |
| `average` | booléen | | `false` | Première ligne : moyenne intérieure et sa tendance |
| `stable_t` | nombre (°C) | | `0.3` | Flèche horizontale en dessous de cette variation |
| `alert_t` | nombre (°C) | | `1.5` | Alerte à partir de cette variation |
| `stable_h` | nombre (%) | | `2` | Idem pour l'humidité |
| `alert_h` | nombre (%) | | `10` | Idem pour l'humidité |
| `t_min`, `t_max` | nombre (°C) | | — | Limites absolues de température (alerte en dehors) |
| `h_min`, `h_max` | nombre (%) | | — | Limites absolues d'humidité |

```yaml
panels:
  right:
    - type: climate
      title: Climat des pièces
      duration: 30
      rooms: [Chambre, Séjour]
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

## Puces de résumé

Les puces au-dessus du plan. Sans `summary`, quatre sont affichées : ouvertures ouvertes, lumières allumées, volets
baissés, température intérieure. Une liste permet de les choisir, de les ordonner et d'en ajouter.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `type` | énum | `openings` `lights` `shutters` `temperature` `entity` | obligatoire | Type de puce, voir ci-dessous |
| `icon` | icône | | selon le type | Remplace l'icône |
| `show` | énum | `away` `home` | toujours | `away` : seulement quand personne n'est à la maison ; `home` : seulement quand quelqu'un est à la maison |
| `presence` | entité | | `presence` de la racine (`zone.home`) | Présence utilisée par `show` |
| `new_line` | booléen | | `false` | Cette puce commence une nouvelle ligne |
| `below` | booléen | | `false` | Cette puce s'empile sous la précédente |

| `type` | Affiche | Clés propres |
|---|---|---|
| `openings` | Fenêtres / portes ouvertes (rouge s'il y en a ; une baie compte une fois) | — |
| `lights` | Lumières du plan allumées | — |
| `shutters` | Volets du plan en dessous de 50 % | — |
| `temperature` | Température moyenne des pièces intérieures | — |
| `entity` | `<valeur> <nom>` de n'importe quelle entité | `entity`, `name`, `unit`, `decimals`, `alert_above`, `alert_state`, `hide_if` |

**Clés de la puce `entity` :**

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `entity` | entité | | — | Entité affichée (toucher = plus d'infos) |
| `name` | texte | | nom de l'entité | Texte après la valeur ; `""` = la valeur seule |
| `unit` | texte | | unité de l'entité | Unité |
| `decimals` | nombre | | 1 (0 à partir de 100) | Décimales |
| `alert_above` | nombre | | — | Puce rouge au-dessus de cette valeur |
| `alert_state` | texte | | — | Puce rouge quand l'état vaut ceci |
| `hide_if` | texte | | — | Masquer la puce pour cet état (elle est aussi masquée tant que l'entité est absente) |

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
    name: batterie
    unit: "%"
    decimals: 0
    alert_above: 90
    alert_state: "unavailable"
    hide_if: "unknown"
    show: away
    presence: person.alex
```

Éditeur : cliquer sur une puce au-dessus du plan pour la modifier ; *+ Puce* (*Ajouter une puce au résumé*) en ajoute
une ; faire glisser une puce à côté, en dessous ou sous les autres. Aussi dans ⚙ Paramètres › Raccourcis › *Puces de
résumé*. Masquées par défaut en [mode tablette](#tablette-murale).

## Calques

Chaque élément appartient à un calque fixe selon son genre. Deux groupes de calques, chacun avec son propre ordre ; le
groupe superposé est toujours au-dessus du dessin.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `layers.drawing_order` | liste | `rooms` `sub_areas` `halos` `furniture` `fences` `walls` `openings` | cet ordre | Calques du dessin, du bas vers le haut ; ceux qui manquent suivent dans l'ordre par défaut |
| `layers.overlay_order` | liste | `room_labels` `area_labels` `badges` `texts` | cet ordre | Calques au-dessus du dessin, du bas vers le haut |
| `layers.hidden` | liste | n'importe quel calque | `[]` | Masqués en vue (dessinés à 25 % et non cliquables dans l'éditeur) |
| `layers.locked` | liste | n'importe quel calque | `[]` | Non sélectionnables dans l'éditeur (les clics passent à travers) ; sans effet en vue |
| `layers.view_button` | booléen | | `false` | Bouton *Calques* à côté des boutons de zoom : chaque visiteur masque des calques pour lui-même (mémorisé dans le navigateur) |
| `hidden` (sur un élément) | booléen | | `false` | Cet élément est masqué en vue |
| `level` (sur un élément) | nombre | | `0` | Ordre dans son calque, plus grand = au-dessus (`rug`, `area` : `-1`) |

`area_labels` contient les libellés des espaces nommés et des sous-zones ; `badges` les bulles d'appareils ;
`room_labels` les étiquettes des pièces.

```yaml
layers:
  drawing_order: [rooms, sub_areas, furniture, halos, fences, walls, openings]
  overlay_order: [room_labels, area_labels, badges, texts]
  hidden: [fences]
  locked: [walls, rooms]
  view_button: true
```

Éditeur : barre d'outils *Calques* (glisser ou ↑ / ↓ pour réordonner, œil, cadenas, *Réinitialiser l'ordre*) ; par
élément : *Masquer en vue*, *Premier plan* / *Arrière-plan* ; `view_button` aussi dans ⚙ Paramètres › Affichage.

## Groupes

Les groupes lient des éléments pour qu'ils se sélectionnent et se déplacent ensemble dans l'éditeur.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `groups[].id` | texte | | — | Identifiant du groupe, utilisé par `group` |
| `groups[].name` | texte | | — | Nom du groupe dans l'éditeur |
| `group` (sur un élément) | texte | un `id` de groupe | — | Appartenance d'une pièce, d'une ouverture, d'une bulle, d'un texte ou d'un meuble |
| 5e valeur d'un mur / d'une limite | texte | un `id` de groupe | — | Appartenance d'un mur ou d'une limite |

```yaml
groups:
  - {id: garden, name: Jardin}
badges:
  - {entity: light.garden, pos: [600, 500], group: garden}
fences:
  - [550, 450, 900, 450, garden]
```

Éditeur : sélectionner plusieurs éléments › *Grouper* (Ctrl+G) / *Dégrouper* (Ctrl+Maj+G). Le premier clic sur un
membre sélectionne le groupe, un second clic l'élément seul.

## Modèles

Éléments réutilisables enregistrés par l'éditeur et proposés à nouveau dans *Ajouter › Mes modèles*.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `name` | texte | | — | Nom du modèle |
| `kind` | énum | `badge` `opening` `furniture` `widget` | — | Nature de `item` |
| `icon` | icône | | — | Icône dans le catalogue |
| `description` | texte | | — | Sous-titre dans le catalogue |
| `type` | énum | types de meubles | — | Modèles `furniture` : le type de meuble |
| `domain` | texte | un domaine d'entité | — | Modèles `badge` : domaine proposé au moment de choisir l'entité |
| `item` | objet | | — | L'élément : une bulle, une ouverture, un meuble ou un widget, avec les clés de cet élément (sans position) |
| `items` | liste | widgets | — | Une fiche entière enregistrée comme modèle : tous ses widgets |

Sans « Garder les entités », les clés d'entité sont omises et redemandées à chaque utilisation ; `value: $entite`
représente l'entité choisie.

```yaml
templates:
  - name: Plafonnier
    kind: badge
    icon: mdi:lightbulb
    domain: light
    item: {icon: mdi:lightbulb, color: "#f6c445", halo: 130}
  - name: Mon réfrigérateur
    kind: furniture
    type: fridge
    description: 70 × 72 cm
    item: {type: fridge, size: [70, 72], tap: more_info}
  - name: Baie vitrée
    kind: opening
    icon: mdi:window-closed-variant
    item: {type: window, shutter_only: false}
  - name: Fiche voiture
    kind: widget
    icon: mdi:card-text-outline
    description: Fiche · 2 widgets
    items:
      - {type: ev, title: Voiture, battery: sensor.ev_battery}
      - {type: divider}
```

Éditeur : sélectionner un élément › *Modèle* (*Enregistrer comme modèle*) ; une fiche › *Fiche en modèle* ; réutiliser
depuis *Ajouter › Mes modèles*.

## Ambiance

Calques facultatifs et discrets, dessinés sous les bulles : teinte de nuit et ensoleillement, météo sur les pièces
extérieures, traces des changements récents, flux d'énergie et personnes. Jamais dessinés pendant l'édition (sauf en
aperçu, panneau correspondant ouvert) ; rien ne sort de Home Assistant.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `intensity` | énum / nombre | `subtle` `normal` `strong`, ou 0–1 | `subtle` | Force globale (0,45 / 0,7 / 1) |
| `north` | nombre (°) | | `0` | Direction du nord, dans le sens horaire depuis le haut du plan (45 = en haut à droite) |
| `day_night` | booléen / objet | | activé | [Jour et nuit](#jour-et-nuit) ; `false` = désactivé |
| `weather` | entité / objet | | — | [Météo](#météo) |
| `traces` | nombre / booléen / objet | | activé, 10 min | [Traces](#traces) ; `false` = désactivé |
| `energy` | booléen / objet | | — | [Flux d'énergie](#flux-dénergie) |
| `people` | booléen / liste / objet | | — | [Personnes](#personnes) |

Dès que `ambience` est présent, `day_night` et `traces` sont activés, sauf s'ils valent `false`.

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

Éditeur : barre d'outils *Ambiance et animations* › *Ambiance du plan (jour / nuit, météo, traces)* (avec *Nord du
plan*), *Flux d'énergie*, *Personnes*.

### Jour et nuit

Teinte de nuit selon la hauteur du soleil (plus marquée dehors), ensoleillement venant du côté du soleil, plus chaud au
lever et au coucher, et repère du soleil sur le bord du plan.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `day_night` | booléen / objet | | activé | `true` / `{}` = défauts, `false` = désactivé |
| `day_night.sun` | entité | | `sun.sun` | Entité du soleil (élévation, azimut) |
| `day_night.intensity` | nombre | 0–2 | `1` | Facteur appliqué à `ambience.intensity` |
| `day_night.marker` | booléen | | `true` | Repère du soleil sur le bord du plan |

```yaml
ambience:
  day_night: {sun: sun.sun, intensity: 1.2, marker: false}
```

### Météo

La météo de Home Assistant peinte sur les pièces extérieures (`outside: true`) : ombres de nuages, pluie, neige, grêle,
vent, brouillard, éclairs.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `weather` | entité / objet | | — | Une entité `weather.*`, ou l'objet ci-dessous |
| `weather.entity` | entité | | — | Entité météo (obligatoire sous forme d'objet) |
| `weather.intensity` | nombre | 0–2 | `1` | Facteur appliqué à `ambience.intensity` |
| `weather.direction` | nombre (°) / énum | un angle, ou `wind` | `135` | Sens de déplacement, dans le sens horaire depuis le haut (135 = du haut à gauche vers le bas à droite) ; `wind` = le vent réel |

```yaml
ambience:
  weather: {entity: weather.home, intensity: 0.8, direction: wind}
```

### Traces

Ce qui vient de changer garde un contour qui s'estompe (capteurs numériques exclus ; un redémarrage de HA efface les
traces).

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `traces` | nombre / booléen / objet | | `10` | Durée en minutes ; `false` ou `0` = désactivé |
| `traces.duration` | nombre (min) | jusqu'à 240 | `10` | Durée de l'estompage |
| `traces.color` | couleur | | couleur principale du thème | Couleur des traces |

```yaml
ambience:
  traces: {duration: 15, color: "#1a73e8"}
```

### Flux d'énergie

Des perles qui circulent du tableau électrique vers chaque meuble ou bulle dont la valeur est une puissance (W, kW),
plus rapides et plus nombreuses à mesure que la puissance augmente.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `energy` | booléen / objet | | — | `true` / `{}` = défauts |
| `energy.source` | nombre / énum | un indice de meuble, ou un type de meuble | `electrical_panel` | Meuble d'où partent les flux |
| `energy.threshold` | nombre (W) | | `5` | Puissance minimale pour dessiner un flux |
| `energy.color` | couleur | | couleur de la cible, sinon couleur du type, sinon `#fbc02d` | Couleur des flux |
| `energy.badges` | booléen | | `true` | `false` : pas de flux vers les bulles d'appareils (meubles seulement) |

```yaml
ambience:
  energy: {source: electrical_panel, threshold: 20, color: "#fbc02d", badges: false}
```

### Personnes

Les personnes sur le plan : à la maison, côte à côte à un point de rassemblement ; absentes, sur le bord du plan dans
leur direction réelle, avec la distance ou la zone (coordonnées de la maison dans HA + `north`).

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `people` | booléen / liste / objet | | — | `true` = toutes les `person.*` ; une liste = ces personnes ; un objet = les réglages ci-dessous |
| `people.home` | `[x, y]` / texte | un point ou un `name` de pièce | centre des pièces intérieures | Point de rassemblement à la maison (une pièce : la position de son étiquette) |
| `people.entities` | liste | ids `person.*` ou `{entity}` | toutes les `person.*` | Personnes affichées |
| `people.entities[].entity` | entité | | — | Une personne |
| `people.away` | énum | `direction` `zone` `hidden` | `direction` | Absente : sur le bord, dans sa direction, avec la distance ; `zone` : une rangée de puces en bas avec le nom de la zone HA ; `hidden` : non affichée |
| `people.at_home` | énum | `grouped` `hidden` | `grouped` | À la maison : côte à côte au point `home` ; ou non affichée |
| `people.avatar` | énum | `picture` `initials` | `picture` | Photo du profil HA (initiales s'il n'y en a pas), ou toujours les initiales |
| `people.persons` | objet | `{person.x: {away, at_home, avatar}}` | — | Réglages par personne de `away`, `at_home`, `avatar` (ils priment sur les réglages communs) |

```yaml
ambience:
  people:
    home: Séjour
    entities: [person.alex, {entity: person.camille}]
    away: direction
    at_home: grouped
    avatar: picture
    persons:
      person.camille: {away: hidden}
      person.alex: {away: zone, avatar: initials, at_home: grouped}
```

Éditeur : `away`, `at_home`, `avatar` communs dans ⚙ Paramètres › *Personnes sur le plan* ; par personne et `home` dans
*Ambiance et animations* › *Personnes* (faire glisser les avatars sur le plan pour fixer `home` en `[x, y]`).

## Style des bulles

L'aspect des bulles d'appareils sur le plan. Toutes les clés sont facultatives ; les défauts gardent l'aspect d'origine.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `badge_style.unavailable` | énum | `dimmed` `dashed` `hidden` | `dimmed` | Appareil indisponible : estompé, contour pointillé, ou non affiché |
| `badge_style.inactive` | énum | `shown` `active_only` `dimmed` | `shown` | Appareil inactif : affiché, affiché seulement quand il est actif, ou estompé |
| `badge_style.size` | énum | `small` `normal` `large` | `normal` | 0,8 ×, 1 ×, 1,25 × (même taille à l'écran quel que soit le zoom) |
| `badge_style.values` | énum | `always` `hover` `never` | `always` | Valeur dans la bulle : toujours, au survol / au focus (toujours sur écran tactile), jamais |

Une bulle masquée compte toujours dans les puces de résumé et apparaît toujours dans la vue de la pièce ; une bulle
concernée par une alerte plein plan reste visible ; dans l'éditeur, toutes les bulles restent visibles.

```yaml
badge_style:
  unavailable: dashed
  inactive: active_only
  size: small
  values: hover
```

Éditeur : ⚙ Paramètres › *Bulles d'appareils*.

## Alertes plein plan

Des règles qui illuminent tout le plan tant qu'elles sont vraies : voile pulsant, bandeau (nom, éléments, détails,
masquer jusqu'au prochain changement), éléments entourés d'une onde. Jamais pendant l'édition.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `name` | texte | | « Alerte » (`Alert` en anglais) | Titre du bandeau |
| `entity` | entité | | — | Une entité surveillée |
| `entities` | liste d'entités | | — | Plusieurs entités surveillées |
| `type` | énum | `openings` | — | Surveiller toutes les ouvertures du plan (`contact`, sinon `entity`) |
| `level` | énum | `critical` `warning` `info` | `critical` | Rouge (critique), ambre (avertissement), accent sans pulsation (info) ; le niveau actif le plus élevé l'emporte |
| `icon` | icône | | selon le niveau | Icône du bandeau |
| `above` | nombre | | — | Active quand la valeur est au-dessus |
| `below` | nombre | | — | Active quand la valeur est en dessous (en l'absence de `above`) |
| `state` | texte | | — | Active quand l'état vaut ceci (en l'absence de `above` / `below`) |
| `when_away` | booléen | | `false` | Seulement quand personne n'est à la maison |
| `presence` | entité | | `presence` de la racine (`zone.home`) | Présence utilisée par `when_away` |
| `enabled` | booléen | | `true` | `false` désactive la règle sans la supprimer |

Sans `above`, `below` ni `state`, une entité est active quand elle vaut `on`, `open`, `triggered` ou `detected`.

```yaml
alerts:
  - name: Fumée détectée
    entities: [binary_sensor.smoke_kitchen, binary_sensor.smoke_hall]
    level: critical
    icon: mdi:smoke-detector
  - name: Ouverture alors que personne n'est là
    type: openings
    when_away: true
    presence: group.family
    level: warning
  - {name: Congélateur trop chaud, entity: sensor.freezer_temperature, above: -12, level: warning}
  - {name: Cave trop froide, entity: sensor.cellar_temperature, below: 5, level: info, enabled: false}
  - {name: Alarme, entity: alarm_control_panel.home, state: triggered}
```

Éditeur : *Ambiance et animations* › *Alertes plein plan* (*Alerte sur des entités*, *Ouverture, maison vide*) ; aussi
dans ⚙ Paramètres › Raccourcis.

## Animations

Une animation par événement pour tout le plan (`animations`) ; une ouverture, une bulle ou un meuble connecté la remplace
par sa propre `animation` (`shutter_animation` pour un volet).

| Clé d'événement | S'applique à | Défaut |
|---|---|---|
| `animations.opening` | Porte / fenêtre ouverte | `{type: pulse, duration: 1.6}` |
| `animations.shutter` | Volet en mouvement | `{type: scroll, duration: 0.8}` |
| `animations.alert` | Bulle avec `alert: true`, quand elle est active | `{type: pulse, duration: 1.2}` |
| `animations.light` | Bulle `light.*` allumée | `{type: none, duration: 2.4}` |
| `animations.badge` | Autre bulle active | `{type: none, duration: 2}` |
| `animations.furniture` | Meuble connecté actif | `{type: none, duration: 2.4}` |

Une animation est un nom de type (`animation: halo`) ou un objet :

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `type` | énum | `none` `pulse` `breathe` `blink` `halo` `wave` `scroll` | selon l'événement | `none` = couleur seulement |
| `color` | couleur | | couleur de l'élément | Couleur de l'animation |
| `duration` | nombre (s) | 0,2–20 | selon l'événement | Secondes par cycle |
| `intensity` | nombre | 0,2–2 | `1` | Force |
| `shape` | énum | `outline` | — | Meubles : l'onde suit leur contour |

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

Éditeur : *Ambiance et animations* › *Animations par événement* (*Animations par défaut* les réinitialise) ; par
élément : son panneau › *Animation*. Le [niveau d'animation](#niveau-danimation) peut toutes les réduire ou les arrêter.

## Revoir la journée

Un bouton *Revoir la journée* à côté du zoom : l'historique de chaque entité du plan est chargé une fois, puis tout le
plan (couleurs, ouvertures, volets, lumières, ambiance, personnes, alertes, panneaux latéraux) est dessiné à l'instant
choisi, avec une frise chronologique (lecture / pause, vitesse, repères). Jamais pendant l'édition.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `replay` | booléen / objet | | — | `true` = défauts |
| `replay.hours` | nombre (h) | 1–72 | `24` | Période revue |
| `replay.speed` | énum (nombre) | `60` `300` `900` `3600` | `900` | Vitesse au départ, en secondes de la journée par seconde (la frise permet toujours de la changer) |

```yaml
replay:
  hours: 48
  speed: 3600
```

Éditeur : ⚙ Paramètres › Fonctions › *Bouton « Revoir la journée » (replay)*, *Période revue*, *Vitesse au départ*.

## Exemples sous le plan

Dessine sous le plan un exemple de chaque type d'animation, de chaque météo et des effets d'ambiance (nuit, soleil bas,
trace, flux d'énergie, alerte, personne absente).

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `showcase` | booléen / objet | | — | `true` = sous le plan |
| `showcase.pos` | `[x, y]` | | sous le plan, à `margin` | Coin supérieur gauche |
| `showcase.width` | nombre (cm) | au moins 700 | largeur du plan moins les marges | Largeur |

```yaml
showcase:
  pos: [0, 1200]
  width: 1200
```

Éditeur : ⚙ Paramètres › Fonctions › *Exemples sous le plan (animations, météo, ambiance)*.

## Interaction

La réaction de la carte au toucher. Sans ces clés, elle se comporte comme avant. Jamais appliqué dans l'éditeur.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `interaction.room_tap` | énum | `room_view` `more_info` `none` | `room_view` | Toucher une pièce : vue de la pièce ; plus d'infos de son entité `tap` (sinon `temperature`) ; rien. Une pièce avec `zoom: false` garde son propre comportement |
| `interaction.lock_view` | booléen | | `false` | Ni déplacement ni zoom à la molette / au pincement, boutons de zoom masqués ; les touchers fonctionnent toujours |
| `interaction.reset_after` | nombre (s) | 0–86400 (éditeur : 0–3600, pas de 10) | `0` | Retour au plan entier après ce nombre de secondes sans interaction (vue de la pièce, zoom, fiches fermées, relecture en pause ramenée au direct) ; `0` = jamais |

```yaml
interaction:
  room_tap: more_info
  lock_view: true
  reset_after: 60
```

Éditeur : ⚙ Paramètres › *Interaction* (*Toucher une pièce*, *Vue figée*, *Retour au plan entier après*).

## Tablette murale

Mode tablette : le plan occupe toute la carte, en pleine page, centré ; puces de résumé et panneaux latéraux masqués ;
avec un `title` vide, pas d'en-tête. Il ne fige pas la vue (voir [Interaction](#interaction)).

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `tablet` | booléen / objet | | `false` | `true` = `{summary: false, panels: false, burn_in: true}` ; un objet règle chaque point |
| `tablet.summary` | booléen | | `false` | Afficher les puces de résumé |
| `tablet.panels` | booléen | | `false` | Afficher les panneaux latéraux (vue d'ensemble et pièces) |
| `tablet.burn_in` | booléen | | `true` | Anti-marquage : la carte se décale d'un pixel toutes les 3 minutes, dans un rayon de 2 px |

```yaml
title: ""
tablet: {summary: false, panels: true, burn_in: true}
interaction:
  lock_view: true
  reset_after: 60
```

Éditeur : ⚙ Paramètres › *Tablette murale* (*Mode tablette*, *Puces de résumé*, *Panneaux latéraux*, *Anti-marquage de
l'écran*).

## Niveau d'animation

Une limite globale aux mouvements. Le réglage système « réduire les animations » est toujours respecté.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `animation_level` | énum | `full` `reduced` `none` | `full` | `full` : toutes les animations ; `reduced` : rien ne tourne en boucle (pulsations, ondes, météo, flux), transitions courtes ; `none` : ni animation ni transition. La relecture et les exemples sous le plan le suivent |

```yaml
animation_level: reduced
```

Éditeur : ⚙ Paramètres › *Animations* › *Niveau d'animation*.

## Démo

Un appartement de démonstration intégré, aux états simulés ; rien n'est jamais envoyé à la maison.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `demo` | booléen | | `false` | `true` remplace le plan par la démo ; seuls `title` et `language` de la configuration sont conservés |

```yaml
type: custom:maquette-card
demo: true
title: Démo
language: en
```

Éditeur : aucun ; le sélecteur de cartes propose une carte de démo et des tableaux de bord vierge / de démo.

## Clés Home Assistant conservées

Les clés que Home Assistant ajoute à n'importe quelle carte (disposition, visibilité, card-mod). Maquette les conserve
telles quelles, sans les traduire.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `view_layout` | quelconque | | — | Options de disposition de la vue (masonry, panneau, dispositions personnalisées) |
| `layout_options` | quelconque | | — | Ancienne disposition de la vue en sections |
| `grid_options` | quelconque | | — | Taille dans la vue en sections (`columns`, `rows`) |
| `visibility` | liste | | — | Conditions de visibilité de la carte |
| `card_mod` | quelconque | | — | Styles card-mod |

```yaml
type: custom:maquette-card
grid_options: {columns: full, rows: auto}
visibility:
  - {condition: screen, media_query: "(min-width: 768px)"}
card_mod:
  style: "ha-card {border-radius: 24px}"
```

Éditeur : l'éditeur de tableau de bord de HA (onglets *Disposition* et *Visibilité*) ; l'éditeur de Maquette les
conserve à l'enregistrement.

## Index des clés

Chaque clé publique, par ordre alphabétique, avec les sections qui la documentent.

| Clé | Section(s) |
|---|---|
| `above` | [Alertes plein plan](#alertes-plein-plan) |
| `action` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `actions` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `active` | [Bulles d'appareils](#bulles-dappareils), [Meubles connectés](#meubles-connectés) |
| `active_attribute` | [Bulles d'appareils](#bulles-dappareils), [Meubles connectés](#meubles-connectés) |
| `alert` | [Bulles d'appareils](#bulles-dappareils), [Animations](#animations) |
| `alert_above` | [Puces de résumé](#puces-de-résumé) |
| `alert_h` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `alert_state` | [Puces de résumé](#puces-de-résumé) |
| `alert_t` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `alerts` | [Racine de la carte](#racine-de-la-carte), [Alertes plein plan](#alertes-plein-plan) |
| `ambience` | [Racine de la carte](#racine-de-la-carte), [Ambiance](#ambiance) |
| `animation` | [Animations](#animations), [Ouvertures](#ouvertures), [Bulles d'appareils](#bulles-dappareils), [Meubles connectés](#meubles-connectés) |
| `animation_level` | [Racine de la carte](#racine-de-la-carte), [Niveau d'animation](#niveau-danimation) |
| `animations` | [Racine de la carte](#racine-de-la-carte), [Animations](#animations) |
| `area` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `at_home` | [Personnes](#personnes) |
| `attribute` | [Bulles d'appareils](#bulles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles connectés](#meubles-connectés) |
| `auto_actions` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `automations` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `avatar` | [Personnes](#personnes) |
| `average` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `away` | [Personnes](#personnes) |
| `badge` | [Animations](#animations) |
| `badge_style` | [Racine de la carte](#racine-de-la-carte), [Style des bulles](#style-des-bulles) |
| `badges` | [Racine de la carte](#racine-de-la-carte), [Bulles d'appareils](#bulles-dappareils), [Flux d'énergie](#flux-dénergie) |
| `battery` | [Widgets](#widgets), [Widget `ev`](#widget-ev) |
| `bay` | [Ouvertures](#ouvertures) |
| `below` | [Puces de résumé](#puces-de-résumé), [Alertes plein plan](#alertes-plein-plan) |
| `burn_in` | [Tablette murale](#tablette-murale) |
| `card` | [Fiches](#fiches), [Ouvertures](#ouvertures), [Bulles d'appareils](#bulles-dappareils), [Meubles connectés](#meubles-connectés) |
| `card_mod` | [Clés Home Assistant conservées](#clés-home-assistant-conservées) |
| `chairs` | [Meubles](#meubles) |
| `color` | [Widgets](#widgets), [Animations](#animations), [Bulles d'appareils](#bulles-dappareils), [Meubles connectés](#meubles-connectés), [Traces](#traces), [Flux d'énergie](#flux-dénergie) |
| `color_today` | [Widgets](#widgets), [Widget `tariff`](#widget-tariff) |
| `color_tomorrow` | [Widgets](#widgets), [Widget `tariff`](#widget-tariff) |
| `columns` | [Widgets](#widgets), [Widget `periods`](#widget-periods) |
| `confirm` | [Pièces et sous-zones](#pièces-et-sous-zones), [Widgets](#widgets), [Widget `cover`](#widget-cover) |
| `contact` | [Ouvertures](#ouvertures) |
| `data` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `day` | [Widget `periods`](#widget-periods) |
| `day_night` | [Jour et nuit](#jour-et-nuit), [Ambiance](#ambiance) |
| `decimals` | [Puces de résumé](#puces-de-résumé), [Widgets](#widgets), [Widget `gauge`](#widget-gauge), [Widget `tile`](#widget-tile), [Widget `periods`](#widget-periods), [Bulles d'appareils](#bulles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles connectés](#meubles-connectés) |
| `demo` | [Racine de la carte](#racine-de-la-carte), [Démo](#démo) |
| `description` | [Modèles](#modèles) |
| `direction` | [Météo](#météo) |
| `domain` | [Modèles](#modèles) |
| `drawing_order` | [Calques](#calques) |
| `duration` | [Widgets](#widgets), [Widget `climate`](#widget-climate), [Animations](#animations), [Traces](#traces) |
| `editor` | [Réglages généraux](#réglages-généraux) |
| `enabled` | [Alertes plein plan](#alertes-plein-plan) |
| `energy` | [Flux d'énergie](#flux-dénergie), [Ambiance](#ambiance) |
| `entities` | [Widgets](#widgets), [Widget `entities`](#widget-entities), [Personnes](#personnes), [Alertes plein plan](#alertes-plein-plan) |
| `entity` | [Puces de résumé](#puces-de-résumé), [Widgets](#widgets), [Widget `gauge`](#widget-gauge), [Widget `tile`](#widget-tile), [Widget `cover`](#widget-cover), [Widget `thermostat`](#widget-thermostat), [Ouvertures](#ouvertures), [Bulles d'appareils](#bulles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles connectés](#meubles-connectés), [Météo](#météo), [Personnes](#personnes), [Alertes plein plan](#alertes-plein-plan) |
| `factor` | [Widget `periods`](#widget-periods) |
| `fences` | [Racine de la carte](#racine-de-la-carte), [Limites et clôtures](#limites-et-clôtures) |
| `full_page` | [Réglages généraux](#réglages-généraux) |
| `furniture` | [Racine de la carte](#racine-de-la-carte), [Meubles](#meubles), [Animations](#animations) |
| `grid_options` | [Clés Home Assistant conservées](#clés-home-assistant-conservées) |
| `group` | [Pièces et sous-zones](#pièces-et-sous-zones), [Groupes](#groupes), [Ouvertures](#ouvertures), [Bulles d'appareils](#bulles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles](#meubles) |
| `groups` | [Racine de la carte](#racine-de-la-carte), [Groupes](#groupes) |
| `h_max` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `h_min` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `halo` | [Bulles d'appareils](#bulles-dappareils) |
| `hidden` | [Pièces et sous-zones](#pièces-et-sous-zones), [Calques](#calques), [Ouvertures](#ouvertures), [Bulles d'appareils](#bulles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles](#meubles) |
| `hide_if` | [Puces de résumé](#puces-de-résumé) |
| `history` | [Widgets](#widgets), [Widget `tile`](#widget-tile) |
| `home` | [Personnes](#personnes) |
| `hours` | [Revoir la journée](#revoir-la-journée) |
| `humidity` | [Pièces et sous-zones](#pièces-et-sous-zones), [Réglages généraux](#réglages-généraux) |
| `humidity_attribute` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `icon` | [Puces de résumé](#puces-de-résumé), [Pièces et sous-zones](#pièces-et-sous-zones), [Widgets](#widgets), [Bulles d'appareils](#bulles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Modèles](#modèles), [Alertes plein plan](#alertes-plein-plan) |
| `id` | [Racine de la carte](#racine-de-la-carte), [Groupes](#groupes) |
| `inactive` | [Style des bulles](#style-des-bulles) |
| `info` | [Textes et zones d'informations](#textes-et-zones-dinformations) |
| `intensity` | [Animations](#animations), [Ambiance](#ambiance), [Jour et nuit](#jour-et-nuit), [Météo](#météo) |
| `interaction` | [Racine de la carte](#racine-de-la-carte), [Interaction](#interaction) |
| `item` | [Modèles](#modèles) |
| `items` | [Modèles](#modèles) |
| `kind` | [Modèles](#modèles) |
| `label` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `language` | [Réglages généraux](#réglages-généraux) |
| `layers` | [Racine de la carte](#racine-de-la-carte), [Calques](#calques) |
| `layout_options` | [Clés Home Assistant conservées](#clés-home-assistant-conservées) |
| `left` | [Pièces et sous-zones](#pièces-et-sous-zones), [Panneaux](#panneaux) |
| `legend` | [Réglages généraux](#réglages-généraux) |
| `level` | [Pièces et sous-zones](#pièces-et-sous-zones), [Calques](#calques), [Ouvertures](#ouvertures), [Bulles d'appareils](#bulles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles](#meubles), [Alertes plein plan](#alertes-plein-plan) |
| `light` | [Animations](#animations) |
| `light_color` | [Bulles d'appareils](#bulles-dappareils) |
| `lock_view` | [Interaction](#interaction) |
| `locked` | [Calques](#calques) |
| `margin` | [Réglages généraux](#réglages-généraux) |
| `marker` | [Jour et nuit](#jour-et-nuit) |
| `max` | [Widgets](#widgets), [Widget `gauge`](#widget-gauge), [Réglages généraux](#réglages-généraux) |
| `min` | [Widgets](#widgets), [Widget `gauge`](#widget-gauge), [Réglages généraux](#réglages-généraux) |
| `mirror` | [Meubles](#meubles) |
| `month` | [Widget `periods`](#widget-periods) |
| `name` | [Puces de résumé](#puces-de-résumé), [Pièces et sous-zones](#pièces-et-sous-zones), [Widgets](#widgets), [Widget `periods`](#widget-periods), [Ouvertures](#ouvertures), [Bulles d'appareils](#bulles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles](#meubles), [Groupes](#groupes), [Modèles](#modèles), [Alertes plein plan](#alertes-plein-plan), [Réglages généraux](#réglages-généraux) |
| `new_line` | [Puces de résumé](#puces-de-résumé) |
| `north` | [Ambiance](#ambiance) |
| `note` | [Widgets](#widgets), [Widget `periods`](#widget-periods) |
| `opening` | [Animations](#animations) |
| `openings` | [Racine de la carte](#racine-de-la-carte), [Ouvertures](#ouvertures) |
| `outside` | [Pièces et sous-zones](#pièces-et-sous-zones), [Widgets](#widgets), [Widget `climate`](#widget-climate), [Ouvertures](#ouvertures) |
| `overlay_order` | [Calques](#calques) |
| `panels` | [Pièces et sous-zones](#pièces-et-sous-zones), [Panneaux](#panneaux), [Racine de la carte](#racine-de-la-carte), [Tablette murale](#tablette-murale) |
| `people` | [Personnes](#personnes), [Ambiance](#ambiance) |
| `period` | [Widgets](#widgets), [Widget `tariff`](#widget-tariff) |
| `periods` | [Widgets](#widgets), [Widget `periods`](#widget-periods) |
| `persons` | [Personnes](#personnes) |
| `plugged` | [Widgets](#widgets), [Widget `ev`](#widget-ev) |
| `poly` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `pos` | [Bulles d'appareils](#bulles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles](#meubles), [Exemples sous le plan](#exemples-sous-le-plan) |
| `power` | [Widgets](#widgets), [Widget `ev`](#widget-ev) |
| `presence` | [Puces de résumé](#puces-de-résumé), [Alertes plein plan](#alertes-plein-plan), [Réglages généraux](#réglages-généraux) |
| `price` | [Widgets](#widgets), [Widget `tariff`](#widget-tariff) |
| `protected` | [Ouvertures](#ouvertures), [Fiches](#fiches), [Bulles d'appareils](#bulles-dappareils), [Meubles connectés](#meubles-connectés) |
| `range` | [Widgets](#widgets), [Widget `ev`](#widget-ev) |
| `replay` | [Racine de la carte](#racine-de-la-carte), [Revoir la journée](#revoir-la-journée) |
| `reset_after` | [Interaction](#interaction) |
| `right` | [Pièces et sous-zones](#pièces-et-sous-zones), [Panneaux](#panneaux) |
| `room` | [Bulles d'appareils](#bulles-dappareils) |
| `room_labels` | [Réglages généraux](#réglages-généraux) |
| `room_tap` | [Interaction](#interaction) |
| `rooms` | [Racine de la carte](#racine-de-la-carte), [Pièces et sous-zones](#pièces-et-sous-zones), [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `rotation` | [Meubles](#meubles) |
| `rows` | [Widgets](#widgets) |
| `seg` | [Ouvertures](#ouvertures) |
| `session_cost` | [Widgets](#widgets), [Widget `ev`](#widget-ev) |
| `session_kwh` | [Widgets](#widgets), [Widget `ev`](#widget-ev) |
| `shape` | [Animations](#animations) |
| `show` | [Puces de résumé](#puces-de-résumé) |
| `show_furniture` | [Réglages généraux](#réglages-généraux) |
| `showcase` | [Racine de la carte](#racine-de-la-carte), [Exemples sous le plan](#exemples-sous-le-plan) |
| `shutter` | [Ouvertures](#ouvertures), [Animations](#animations) |
| `shutter_animation` | [Animations](#animations), [Ouvertures](#ouvertures) |
| `shutter_only` | [Ouvertures](#ouvertures) |
| `size` | [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles](#meubles), [Style des bulles](#style-des-bulles) |
| `source` | [Widget `periods`](#widget-periods), [Flux d'énergie](#flux-dénergie) |
| `spacing` | [Widgets](#widgets), [Widget `divider`](#widget-divider) |
| `speed` | [Revoir la journée](#revoir-la-journée) |
| `stable_h` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `stable_t` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `stat` | [Widget `periods`](#widget-periods) |
| `state` | [Alertes plein plan](#alertes-plein-plan) |
| `style` | [Textes et zones d'informations](#textes-et-zones-dinformations) |
| `sub_area` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `summary` | [Racine de la carte](#racine-de-la-carte), [Puces de résumé](#puces-de-résumé), [Tablette murale](#tablette-murale) |
| `sun` | [Jour et nuit](#jour-et-nuit) |
| `t_max` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `t_min` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `tablet` | [Racine de la carte](#racine-de-la-carte), [Tablette murale](#tablette-murale) |
| `tap` | [Pièces et sous-zones](#pièces-et-sous-zones), [Ouvertures](#ouvertures), [Fiches](#fiches), [Bulles d'appareils](#bulles-dappareils), [Meubles connectés](#meubles-connectés) |
| `target` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `temperature` | [Pièces et sous-zones](#pièces-et-sous-zones), [Réglages généraux](#réglages-généraux) |
| `temperature_attribute` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `temperature_tint` | [Réglages généraux](#réglages-généraux) |
| `templates` | [Racine de la carte](#racine-de-la-carte), [Modèles](#modèles) |
| `text` | [Textes et zones d'informations](#textes-et-zones-dinformations) |
| `texts` | [Racine de la carte](#racine-de-la-carte), [Textes et zones d'informations](#textes-et-zones-dinformations) |
| `threshold` | [Widgets](#widgets), [Widget `ev`](#widget-ev), [Bulles d'appareils](#bulles-dappareils), [Meubles connectés](#meubles-connectés), [Flux d'énergie](#flux-dénergie) |
| `tint` | [Meubles](#meubles) |
| `title` | [Racine de la carte](#racine-de-la-carte), [Widgets](#widgets), [Widget `divider`](#widget-divider), [Fiches](#fiches) |
| `traces` | [Traces](#traces), [Ambiance](#ambiance) |
| `type` | [Racine de la carte](#racine-de-la-carte), [Puces de résumé](#puces-de-résumé), [Widgets](#widgets), [Ouvertures](#ouvertures), [Animations](#animations), [Meubles](#meubles), [Modèles](#modèles), [Alertes plein plan](#alertes-plein-plan) |
| `unavailable` | [Style des bulles](#style-des-bulles) |
| `unit` | [Puces de résumé](#puces-de-résumé), [Widgets](#widgets), [Widget `gauge`](#widget-gauge), [Widget `tile`](#widget-tile), [Widget `periods`](#widget-periods), [Bulles d'appareils](#bulles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles connectés](#meubles-connectés) |
| `value` | [Bulles d'appareils](#bulles-dappareils), [Meubles connectés](#meubles-connectés) |
| `values` | [Style des bulles](#style-des-bulles) |
| `view_button` | [Calques](#calques) |
| `view_layout` | [Clés Home Assistant conservées](#clés-home-assistant-conservées) |
| `visibility` | [Clés Home Assistant conservées](#clés-home-assistant-conservées) |
| `walls` | [Racine de la carte](#racine-de-la-carte), [Murs](#murs) |
| `weather` | [Météo](#météo), [Ambiance](#ambiance) |
| `week` | [Widget `periods`](#widget-periods) |
| `when_away` | [Alertes plein plan](#alertes-plein-plan) |
| `widgets` | [Fiches](#fiches) |
| `width` | [Exemples sous le plan](#exemples-sous-le-plan) |
| `year` | [Widget `periods`](#widget-periods) |
| `zoom` | [Pièces et sous-zones](#pièces-et-sous-zones) |

## Valeurs énumérées

Chaque valeur énumérée, par clé.

`<widget>` désigne n'importe quel widget : dans `panels.left` / `panels.right`, dans les `panels` d'une pièce, dans une `card` ou dans un modèle de widget (`templates[].items`) ; `<person>` un id d'entité `person.*`.


| Chemin(s) de clé | Valeurs |
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

Non traduites, mais restreintes par la carte :

| Clé | Valeurs |
|---|---|
| `language` | `auto` `en` `fr` (texte libre ; toute autre valeur = `auto`) |
| `show_furniture` | `true` `false` `desktop` |
| `replay.speed` | `60` `300` `900` `3600` (nombres) |
| `openings[].outside` | `[-1, 0]` `[1, 0]` `[0, -1]` `[0, 1]` |
