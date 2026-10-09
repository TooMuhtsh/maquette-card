🇬🇧 [English version](reference.md)

# Référence de Maquette

Chaque élément d'une carte Maquette et chaque clé qu'elle accepte, une section par élément, avec les types, les valeurs,
les défauts, un exemple YAML valide et l'endroit où le trouver dans l'éditeur intégré.

> **Langue.** Les clés de configuration (et les valeurs énumérées) sont **en anglais uniquement** : c'est ce qu'on écrit
> dans le YAML, quelle que soit la langue. L'interface de la carte et de son éditeur suit la langue du profil Home
> Assistant (français ou anglais, voir [`language`](#réglages-généraux)) ; cette page cite donc les libellés français de
> l'éditeur.

> **Lien avec [configuration.md](configuration.md)** (en anglais). Cette page est la *référence* exhaustive : une table
> de consultation de chaque clé publique et de chaque valeur énumérée. [configuration.md](configuration.md) reste le
> *guide* détaillé : fonctionnement, manipulations dans l'éditeur et explications plus longues. En cas de désaccord entre
> les deux, c'est le code qui fait foi ; merci de le signaler.

## Sommaire

- [Conventions](#conventions)
- [Racine de la carte](#racine-de-la-carte)
- [Réglages généraux](#réglages-généraux)
- [Étages et image de fond](#étages-et-image-de-fond)
- [Pièces et sous-zones](#pièces-et-sous-zones)
- [Murs](#murs)
- [Limites et clôtures](#limites-et-clôtures)
- [Ouvertures](#ouvertures)
- [Pastilles d'appareils](#pastilles-dappareils)
- [Textes et zones d'informations](#textes-et-zones-dinformations)
- [Meubles](#meubles)
- [Meubles connectés](#meubles-connectés)
- [Fiches](#fiches)
- [Panneaux](#panneaux)
- [Widgets](#widgets) :
  [tariff](#widget-tariff) · [ev](#widget-ev) · [gauge](#widget-gauge) · [tile](#widget-tile) ·
  [entities](#widget-entities) · [periods](#widget-periods) · [divider](#widget-divider) · [cover](#widget-cover) ·
  [lock](#widget-lock) · [thermostat](#widget-thermostat) · [climate](#widget-climate)
- [Puces de résumé](#puces-de-résumé)
- [Calques](#calques)
- [Groupes](#groupes)
- [Modèles](#modèles)
- [Ambiance](#ambiance) :
  [jour et nuit](#jour-et-nuit) · [météo](#météo) · [traces](#traces) · [flux d'énergie](#flux-dénergie) · [personnes](#personnes) · [lumière](#lumière)
- [Style des pastilles](#style-des-pastilles)
- [Alertes plein plan](#alertes-plein-plan)
- [Animations](#animations)
- [Revoir la journée](#revoir-la-journée)
- [Exemples sous le plan](#exemples-sous-le-plan)
- [Interaction](#interaction)
- [Tablette murale](#tablette-murale)
- [Niveau d'animation](#niveau-danimation)
- [Démo](#démo)
- [Clés Home Assistant conservées](#clés-home-assistant-conservées)
- [Sécurité](#sécurité)
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
- **Valeurs libres.** Les noms, identifiants d'entités, icônes (`mdi:…`), couleurs (`#rgb`…`#rrggbbaa`, `rgb()` /
  `hsl()` aux valeurs numériques, un nom de couleur CSS ou `var(--…)`), nombres, coordonnées, `data` de service et états HA
  sont recopiés tels quels. Seules les **clés** et les **valeurs énumérées** (colonne *Valeurs*, reprise sous
  [Valeurs énumérées](#valeurs-énumérées)) font partie du schéma.
- **Valeurs contrôlées.** Tout ce qui finit dans le dessin est contrôlé à la lecture de la configuration : coordonnées et
  nombres doivent être des nombres finis (un point ne garde que son `x` et son `y`), valeurs énumérées connues, couleurs et
  icônes aux formats ci-dessus. Une valeur invalide est retirée (jamais d'erreur), avec un avertissement unique dans la
  console du navigateur (`maquette-card : invalid value(s) removed: …`) ; les textes s'affichent toujours comme du texte.
  Voir [Sécurité](#sécurité).
- **Clés inconnues.** Une clé absente de cette page, ou une valeur énumérée écrite sous son ancien nom français, est
  ignorée avec un avertissement dans la console du navigateur (`maquette-card : unknown key « … » (ignored)`). Une
  configuration écrite entièrement avec les anciennes clés françaises (`pieces`, `murs`…) est refusée avec un message ;
  voir le [CHANGELOG](../CHANGELOG.md#former-french-keys) (en anglais).
- **Les clés omises** prennent le défaut indiqué. *—* signifie « absent / non défini ». L'éditeur supprime une clé
  remise à sa valeur par défaut, pour que le YAML enregistré reste minimal.
- **Clés communes aux éléments.** Les pièces, ouvertures, pastilles, textes et meubles acceptent aussi `hidden`, `level`,
  `group` et `locked` (voir [Calques](#calques) et [Groupes](#groupes)). `locked: true` : dans l'éditeur, l'élément reste
  sélectionnable et modifiable dans sa fenêtre d'édition, mais ne se déplace ni ne se redimensionne plus à la souris ou aux
  flèches, et un clic dessus va à l'élément dessous quand il y en a un (cadenas dans sa barre flottante, sa fenêtre d'édition
  et *Calques › Éléments du plan*).
  Murs et limites n'ont pas de verrou par élément : on verrouille leur calque (`layers.locked: [walls, fences]`, voir
  [Calques](#calques)).
- **Couleurs nommées.** Toute clé de couleur (`color`, `animation.color`, `color` d'un widget, `animations.<événement>.color`,
  `ambience.traces.color`, `ambience.energy.color`) accepte aussi un nom de la [palette](#racine-de-la-carte) du plan :
  l'élément suit la palette quand elle change. Le `severity` d'une jauge garde son vert, son orange et son rouge fixes.
- **Les chemins de l'éditeur** reprennent les libellés français de l'interface : *Éditeur : ⚙ Paramètres › Affichage*
  désigne le bouton ⚙ Paramètres de la barre d'outils de l'éditeur (dans le menu « Plus d'outils » ⋮ sur téléphone), onglet
  *Affichage* de sa fenêtre. *Ajouter › Meubles* désigne le bouton **Ajouter** (touche `A`), onglet *Meubles*.

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
| `badges` | liste | | `[]` | [Pastilles d'appareils](#pastilles-dappareils) |
| `texts` | liste | | `[]` | [Textes et zones d'informations](#textes-et-zones-dinformations) |
| `furniture` | liste | | `[]` | [Meubles](#meubles) et [meubles connectés](#meubles-connectés) |
| `panels` | objet | | — | [Panneaux](#panneaux) de la vue d'ensemble |
| `floors` | liste | | — | [Étages](#étages-et-image-de-fond), du bas vers le haut. Avec `floors`, `rooms`, `walls`, `fences`, `openings`, `badges`, `texts`, `furniture`, `groups` et `background` passent dans chaque étage |
| `default_floor` | texte | `id` d'un étage | premier étage | [Étage](#étages-et-image-de-fond) affiché au chargement |
| `floor_selector` | énum | `elevator` `tabs` | `elevator` | [Sélecteur d'étage](#étages-et-image-de-fond) |
| `background` | objet | | — | [Image de fond](#image-de-fond) d'un plan sans `floors` |
| `layers` | objet | | — | [Calques](#calques) |
| `groups` | liste | | — | [Groupes](#groupes) |
| `templates` | liste | | — | [Modèles](#modèles) enregistrés par l'éditeur |
| `ambience` | objet | | — | [Ambiance](#ambiance) |
| `animations` | objet | | — | [Animations](#animations) par événement |
| `alerts` | liste | | — | [Alertes plein plan](#alertes-plein-plan) |
| `badge_style` | objet | | — | [Style des pastilles](#style-des-pastilles) |
| `palette` | objet | nom → couleur | — | Couleurs nommées, ex. `{accent: "#e8710a"}`. Nom : une minuscule d'abord, puis minuscules, chiffres, `_` ou `-` (31 au plus) ; couleur : `#hex`, `rgb()`, `hsl()`, nom CSS ou `var(--…)`. Proposées dans tous les sélecteurs de couleur de l'éditeur (traces et flux d'énergie n'en ont pas : YAML seulement) ; un élément dont la couleur est un nom suit la palette (un nom retiré lui rend sa couleur par défaut). Éditeur : ⚙ Paramètres › Affichage › *Couleurs nommées* |
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
`layers.view_button`), › Fonctions (`replay`, `showcase`, `presence` ; *Réglés ailleurs* : liens vers les alertes plein
plan et les puces du résumé), › Pièces et légende (`room_labels`, `temperature_tint`, `legend`). Les aides sont derrière
les boutons ⓘ.

## Étages et image de fond

Un plan peut être découpé en étages. Chaque étage a son propre dessin ; le résumé, les alertes, l'ambiance, les calques, les
modèles, la relecture et tous les autres réglages sont communs à la maison. Un plan sans `floors` fonctionne exactement comme avant.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `floors` | liste | 1 étage au moins | — | Étages, **du bas vers le haut** |
| `floors[].id` | texte | lettres, chiffres, `_` `-` `.` `:` (80 au plus) | `floor_<rang>` | Identifiant stable, utilisé par `default_floor` et `furniture[].floor`. Un id absent, invalide ou en double est corrigé (`floor_2`, `id_2`…) avec un avertissement |
| `floors[].name` | texte | | — | Nom complet, affiché au survol et dans le sélecteur `tabs` |
| `floors[].short` | texte | 3 caractères au plus | rang depuis `0` | Texte du bouton de l'ascenseur |
| `floors[].icon` | icône | `mdi:…` | `mdi:layers-outline` | Icône du sélecteur `tabs` |
| `floors[].rooms`, `walls`, `fences`, `openings`, `badges`, `texts`, `furniture`, `groups` | | | `[]` | Mêmes clés et mêmes règles qu'à la racine d'un plan sans étages |
| `floors[].panels` | objet | | — | [Panneaux](#panneaux) de cet étage seulement. Sans cette clé, l'étage montre les `panels` de la carte (communs à la maison) |
| `floors[].background` | objet | voir plus bas | — | [Image de fond](#image-de-fond) de cet étage |
| `default_floor` | texte | `id` d'un étage | premier étage | Étage affiché au chargement. Sans cette clé, la carte rouvre le dernier étage vu dans ce navigateur |
| `floor_selector` | énum | `elevator` `tabs` | `elevator` | `elevator` : une petite pile de boutons au bord du plan, l'étage le plus haut en haut. `tabs` : onglets Material (icône et nom) au-dessus du plan. Rien n'est affiché avec un seul étage |
| `furniture[].floor` | texte | `id` d'un étage | — | `stairs` seulement : l'étage où mène l'escalier. Un autre étage que le sien, sinon la clé est retirée |

```yaml
type: custom:maquette-card
default_floor: ground
floor_selector: elevator
floors:
  - id: ground
    name: Rez-de-chaussée
    short: "0"
    rooms:
      - name: Séjour
        poly: [[0, 0], [500, 0], [500, 420], [0, 420]]
    walls: [[0, 0, 500, 0], [500, 0, 500, 420], [500, 420, 0, 420], [0, 420, 0, 0]]
    furniture:
      - {type: stairs, pos: [450, 200], floor: upstairs}
  - id: upstairs
    name: Étage
    short: "1"
    rooms:
      - name: Chambre
        poly: [[0, 0], [500, 0], [500, 420], [0, 420]]
    walls: [[0, 0, 500, 0], [500, 0, 500, 420], [500, 420, 0, 420], [0, 420, 0, 0]]
    furniture:
      - {type: stairs, pos: [450, 200], floor: ground}
```

**Règles**

- `floors` doit être une liste. `floors` avec un `rooms`, `walls`, `furniture`… non vide (ou un `background`) à la racine
  s'arrête avec un message qui dit quoi déplacer dans `floors[n]`.
- Les noms de pièce devraient être uniques dans la maison (l'éditeur prévient, sans jamais bloquer). Une entité placée sur deux
  étages (lumière d'escalier) compte une seule fois dans le résumé.
- Le plan garde le même cadre sur tous les étages : changer d'étage ne décale jamais le dessin.
- Changer d'étage remet à zéro la vue d'une pièce, le zoom et la fiche ouverte. Clavier : flèches dans le sélecteur, Page
  précédente / Page suivante sur le plan.
- Un escalier avec `floor` mène à cet étage, zoomé sur l'escalier de retour, et porte une petite pastille ↑ ou ↓. Un `tap`
  posé sur l'escalier l'emporte.
- Tablettes murales : `interaction.reset_after` ramène aussi à `default_floor` (ou au premier étage).

### Fenêtre de toit

Un meuble `furniture` de type `skylight` (« Fenêtre de toit » dans le catalogue), posé sur l'étage qu'il éclaire.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `type` | énum | `skylight` | — | Fenêtre de toit. Son rectangle est la fenêtre vue du dessus ; le bas du rectangle est le bas de la pente (utiliser `rotation`). Taille par défaut 78 × 118 |
| `roof_tilt` | nombre (°) | 0–75 | `40` | Pente du toit ; `0` = toit plat |
| `sill_height` | nombre (cm) | 0–1000 | `200` | Hauteur du bord bas de la fenêtre au-dessus du sol |
| `entity` | entité | `cover.…` ou `binary_sensor.…` | — | Un store : sa `current_position` raccourcit la tache de soleil (fermé = aucune). Un contact montre seulement l'état ouvert |

Avec `ambience.light`, une fenêtre de toit projette une tache de soleil qui suit `sun.sun` et `north`, coupée par la pièce qui
la contient (rien quand le soleil est derrière le pan de toit). Les autres clés de meuble s'appliquent.

```yaml
furniture:
  - {type: skylight, pos: [250, 100], rotation: 0, roof_tilt: 35, sill_height: 180, entity: cover.store_atelier}
```

Éditeur : pente, hauteur du bas et store ou contact dans la fenêtre du meuble.

### Image de fond

Un plan scanné ou une photo, dessiné sous tout le reste. C'est le calque `background`, verrouillé par défaut dans l'éditeur
(les clics passent aux pièces). Les mêmes clés servent à la racine (plan sans étages) et dans `floors[].background`.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `background.image` | texte | `/local/….png` (`jpg`, `jpeg`, `webp`, `avif`, `svg`) ou `/api/image/serve/<id>/original` | — | Image **du même site seulement**. `http(s)://`, `data:`, `blob:` et les autres sites sont refusés. Sans image valide ou sans `width`, tout le `background` est retiré |
| `background.pos` | `[x, y]` | | `[0, 0]` | Coin haut gauche (cm) |
| `background.width` | nombre (cm) | > 0 | obligatoire | Largeur de l'image sur le plan |
| `background.height` | nombre (cm) | > 0 | garde le rapport de l'image | Hauteur ; l'omettre garde les proportions |
| `background.rotation` | nombre (°) | 0–360 | `0` | Rotation dans le sens horaire |
| `background.opacity` | nombre | 0–1 | `0.5` | Opacité |
| `background.show` | énum | `editor` `always` | `editor` | `editor` : l'image n'est dessinée qu'en édition, et même pas chargée en vue. `always` : aussi en vue (sauf si le calque est masqué) |

```yaml
floors:
  - id: ground
    background:
      image: /local/plans/rdc.png
      pos: [-40, -40]
      width: 620
      opacity: 0.6
      show: always
```

> **Confidentialité.** Tout ce qui est dans `/local` (le dossier `www`) et `/api/image/serve` est lisible **sans connexion** par
> quiconque peut joindre ton Home Assistant, s'il est exposé sur Internet. N'y mets pas un plan que tu ne veux pas rendre public.

Éditeur : *Calques › Image de fond* : chemin avec aperçu, opacité, position, largeur, rotation, *Afficher aussi en vue*,
verrou, *Envoyer une image* (administrateurs), *Calibrer* (deux points et leur vraie distance), *Aligner sur un mur*, *Retirer*.
Les étages se gèrent depuis le bouton *Étages* de la barre (*Plus › Gérer les étages* sur téléphone). Chaque changement peut être annulé.

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
| `action` | texte | `domaine.service` | — | Service appelé (par exemple `scene.turn_on`, `light.turn_off`). Un [service sensible](#sécurité) demande toujours une confirmation |
| `target` | entité / énum | un id d'entité, ou `room` | — | Entité cible ; `room` = toute la pièce (sa pièce HA `area` si elle est liée, sinon les entités de la pièce de ce domaine) |
| `data` | objet | | `{}` | Données du service, recopiées telles quelles |
| `confirm` | booléen | | `false` | `true` : un dialogue de confirmation même pour un service sûr. Un service sensible est confirmé dans tous les cas |

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
(*Pièce Home Assistant*, *Toutes mes pièces HA*). Un clic sélectionne la pièce : ses poignées apparaissent, avec une
petite barre flottante à côté (*Modifier*, *Dupliquer*, verrou, *Premier plan* / *Arrière-plan*, *Supprimer*). *Modifier*,
un double-clic ou Entrée ouvrent la modale de la pièce : onglets *Général* (nom, taille, capteurs, *Extérieur*,
*Sous-zone*…), *Pièce Home Assistant* (liaison, *Intégrer les appareils de la pièce*, entités à placer sur les murs) et
*Vue de la pièce* (*Panneau gauche* / *Panneau droit*, *Boutons d'action*), avec l'aperçu en direct de la pièce recadrée
depuis le vrai plan (à droite sur PC, en haut sur téléphone). Ctrl+Z annule, *Appliquer* ou Échap ferme. Sous-zones : *Ajouter › Meubles › Sous-zones
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

### Nettoyer le plan

*Nettoyer le plan* (baguette magique de la barre, *Plus* au téléphone) compare murs et ouvertures au contour des
pièces, qui fait foi. Le dialogue montre le plan, défauts cerclés (un clic zoome dessus), *Avant* / *Après*, et les
corrections à cocher avec leur nombre :

| Correction | Par défaut | Effet |
|---|---|---|
| Aimanter murs et ouvertures aux pièces | oui | trous et décalages jusqu'à 12 cm, bouts qui dépassent d'un angle |
| Couper les murs sous les ouvertures | oui | style courant, pas compté comme défaut |
| Retirer les bouts de mur qui dépassent | oui | moins de 35 cm dans une pièce |
| Fusionner les murs alignés et les doublons | oui | murs coupés à chaque angle, en double, ou épais en 2 traits (≤ 25 cm, sans arête de pièce entre eux) |
| Ajouter les murs manquants | non | côté extérieur, d'après le contour, pièce par pièce ; génère aussi les murs d'une pièce intérieure qui n'en a aucun. Jamais sur une pièce `outside: true` |
| Fermer les passages entre pièces | non | arêtes communes sans mur, pièce par pièce |
| Aimanter les sommets presque confondus | non | sommets à moins de 6 cm : avec l'arrondi, seule correction qui change la forme des pièces |
| Arrondir à 5 cm | non | sommets, murs, ouvertures ; proposé seulement si au moins 30 % des cotes sont hors de la grille (plan relevé sur une image) |
| Poser le côté dehors des fenêtres | non | fenêtre ou porte vitrée sans `outside` (pièce intérieure d'un seul côté) : sans lui, pas de lumière du jour ; `outside` posé vers l'extérieur. Une verrière entre deux pièces n'est pas concernée |
| Retirer les volets reliés à rien | non | `shutter` vers une entité qui n'existe pas, ou `shutter_only` sans `shutter` : le lien est retiré |
| Retirer le côté dehors des fenêtres intérieures | non | fenêtre ou porte vitrée entre deux pièces intérieures qui a aussi un `outside` : la carte la compte une fois, en fenêtre extérieure (`outside` fait foi : une terrasse dessinée en pièce reste dehors) ; `outside` est retiré, elle devient une verrière. Une terrasse : la marquer `outside` plutôt |

*Appliquer* = une seule action annulable (Ctrl+Z ou *Annuler* dans la notification) ; relancé juste après, il ne
trouve plus rien. Avant, une copie de `rooms`, `walls` et `openings` est gardée dans ce navigateur (les 3 dernières) :
*Plans d'avant nettoyage* les montre, en restaure une (annulable) ou la copie en YAML pour un autre appareil. Aucune
nouvelle clé de configuration.

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
| `contact` | entité / liste | jusqu'à 8 entités | — | Capteur d'ouverture : rouge quand il vaut `on` / `open`. Une liste pour une ouverture à plusieurs capteurs (vantail gauche et droit…) : ouverte dès que l'un l'est, fermée si l'un répond et aucun n'est ouvert, indisponible seulement si tous le sont ; comptée une fois, une ligne par capteur dans sa fiche |
| `shutter` | entité | | — | Volet (`cover`) : dessiné côté extérieur, plus sombre quand il est fermé, animé pendant qu'il bouge |
| `entity` | entité | | — | Ouverture motorisée (portail, porte de garage), utilisée en l'absence de `contact` |
| `outside` | `[dx, dy]` | `[-1, 0]` `[1, 0]` `[0, -1]` `[0, 1]` | `[0, 0]` | Direction de l'extérieur (gauche, droite, haut, bas) : le volet est dessiné de ce côté |
| `shutter_only` | booléen | | `false` | Ne dessiner que le volet, sans le trait de la fenêtre |
| `bay` | texte | | — | Nom de baie : les vantaux qui ont la même `bay` forment une seule baie (une fiche, une ligne, comptée une fois ; une seule tache de soleil pour la lumière de l'ambiance) |
| `sill` | nombre (cm) | 0–300 | auto | Lumière de l'ambiance : hauteur du bas du vitrage (`0` = jusqu'au sol). Auto = 90, ou 0 pour une baie d'au moins 180 cm de large (vantaux contigus cumulés) |
| `height` | nombre (cm) | 10–500 | `215` | Lumière de l'ambiance : hauteur du haut du vitrage (porte `glazed: top` : 200) |
| `glazed` | énum / booléen | `full` `top` (`true` = `full`) | — | Porte seulement : une porte vitrée laisse entrer la lumière du jour comme une fenêtre (lumière du ciel, tache de soleil, lueur rediffusée ; son `shutter` compte). `full` = vitrée sur toute la hauteur (0 à 215 cm, tache au pied de la porte), `top` = petite vitre en haut (150 à 200 cm : tache plus loin, plus petite, lumière du ciel plus faible). `sill` et `height` affinent toujours |
| `overhang` | nombre (cm) | 0–500 | — | Lumière de l'ambiance : profondeur d'une avancée de toit au-dessus de la fenêtre ou de la porte. Elle coupe le soleil haut (été) et laisse passer le soleil bas (hiver) : la tache est raccourcie ou supprimée selon la hauteur du soleil |
| `overhang_height` | nombre (cm) | 0–300 | `0` | Hauteur de l'avancée au-dessus du haut du vitrage |
| `slats` | énum | `tilt` `vented` | — | Lumière de l'ambiance, avec un `shutter` : `tilt` = lames orientables, la partie baissée laisse passer la lumière selon le `current_tilt_position` du volet (100 = ouvertes) ; `vented` = lames ajourées, un volet fermé laisse passer des filets de lumière. Sans cette clé, volet de base (rendu inchangé) |
| `leaves` | nombre | `1` `2` | `1` | Nombre de battants dessinés (avec `swing`) |
| `swing` | énum | `left` `right` `sliding` | — | Dessine les battants : côté des gonds vu de l'intérieur, face à `outside`, ou deux panneaux coulissants. Absent = rien n'est dessiné |
| `outward` | booléen | | `false` | Les battants s'ouvrent vers l'extérieur (`left` / `right`) |
| `animation` | énum / objet | voir [Animations](#animations) | `animations.opening` | Animation de cette ouverture quand elle est ouverte |
| `shutter_animation` | énum / objet | voir [Animations](#animations) | `animations.shutter` | Animation de son volet pendant qu'il bouge |
| `tap` | énum | `card` `more_info` `none` | `card` s'il y a une `card`, sinon plus d'infos | Effet d'un toucher, voir [Fiches](#fiches) |
| `protected` | booléen | | `false` | Pas d'arrêt depuis le plan : pas d'interrupteur « éteindre » dans sa fiche, interrupteur grisé tant qu'il est allumé dans la vue de la pièce |
| `confirm` | booléen | | `false` | `true` : son interrupteur allumer / éteindre (fiche, vue de la pièce) demande confirmation, même pour un service sûr (par exemple une porte de garage commandée par un `switch`) |
| `card` | objet / liste | | — | Sa [fiche](#fiches) |
| `hidden` | booléen | | `false` | Masquée en vue (et absente de la vue de la pièce) |
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
    shutter: cover.front_door_shutter
    leaves: 1
    swing: right
    outward: false
    level: 1
  - type: gate
    seg: [200, -200, 500, -200]
    entity: cover.gate
    tap: more_info
    group: garden
    hidden: false
  - type: window                 # une baie, deux capteurs (vantail gauche et droit)
    seg: [600, 0, 840, 0]
    name: Baie de la chambre
    contact: [binary_sensor.bedroom_left, binary_sensor.bedroom_right]
    leaves: 2
    swing: sliding
```

`bay` reste pour des vantaux dessinés comme des ouvertures séparées ; une seule ouverture avec une liste `contact` est plus
simple quand les vantaux partagent un segment.

Éditeur : barre d'outils *Ouverture (O)*, ou *Ajouter › Ouvertures* : préréglages (*Fenêtre + volet + contact*, *Porte +
volet + contact*, *Porte-fenêtre + volet + contact*, *Baie coulissante*, *Fenêtre oscillo-battante*, *Porte de garage*,
*Portail*…) et *Créer une ouverture* (type, vantaux, ouverture, capteurs, animation, aperçu ; *Ajouter* puis la tracer, ou
*Enregistrer dans Mes modèles*). Tracée sur un mur, ses capteurs sont cherchés parmi les entités libres de la pièce bordée
(`area` de la pièce, sinon l'aire HA de même nom) : une seule est reliée d'office, plusieurs ouvrent une petite liste (cette
pièce d'abord, *Autre entité…*, *Ignorer*), aucune laisse le champ surligné « à compléter » ; `outside` part à l'opposé de la
pièce intérieure (un champ « à compléter » ouvre la modale sur *Capteurs*). La sélectionner pour la barre flottante, puis
*Modifier* (ou double-clic, Entrée) pour sa modale, avec l'aperçu dans sa pièce : onglets *Général* (*Type*, *Vantaux*,
*Ouverture*, *Côté extérieur*, *Baie (vantaux regroupés)*, position), *Capteurs* (*Contact*, *Volet*, entité motorisée),
*Lumière*, *Fiche* et *Animation* ; le pied de la modale propose *Modifier dans l'atelier* pour appliquer un autre
préréglage sans la redessiner. La modale suggère un contact ou un volet libre de la
même pièce, ou le type qui correspond à la classe du contact. *Ajouter un capteur* sous *Contact* en relie un autre
(plusieurs contacts libres dans la pièce : les cocher dans la petite liste, puis *Relier*).

## Pastilles d'appareils

Une pastille est une icône ronde d'appareil posée sur le plan, colorée quand son entité est active, avec en option une
valeur, un halo lumineux, une animation et une fiche.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `entity` | entité | | — | Entité principale : état, couleur, plus d'infos, allumer / éteindre dans sa fiche |
| `pos` | `[x, y]` | | obligatoire | Position. Une pastille sans `pos` valide est ignorée |
| `icon` | icône | | `mdi:circle` | Icône |
| `name` | texte | | nom de l'entité | Info-bulle, listes, en-tête de la fiche |
| `color` | couleur | | couleur d'état actif de HA (`--state-active-color`, sinon jaune) | Couleur quand elle est active |
| `light_color` | booléen | | déduit de `color` | La couleur est claire : l'icône est dessinée en sombre quand la pastille est active |
| `halo` | nombre (cm) / booléen | | — | Rayon du halo lumineux quand elle est active ; `true` = 130 |
| `room` | texte | un `name` de pièce | — | Limiter le halo à cette pièce |
| `alert` | booléen | | `false` | Pastille d'alerte : utilise `animations.alert` (pulsation) quand elle est active |
| `active` | entité | | `entity` | Entité qui définit l'état « actif » |
| `active_attribute` | attribut | | — | Utiliser cet attribut de l'entité active au lieu de son état |
| `threshold` | nombre | | — | Active quand la valeur active dépasse ce nombre. Sans lui : active pour `on`, `open`, `opening`, `closing`, `playing`, `heating`, `cooling`, `cleaning`, `detected`, `home` |
| `value` | entité | | — | Valeur numérique affichée dans la pastille |
| `attribute` | attribut | | — | Affiche cet attribut de `entity` comme valeur (prime sur `value`) |
| `unit` | texte | | unité de l'entité | Unité après la valeur (écrite telle quelle, par exemple `" °C"`) |
| `decimals` | nombre | 0–6 | `0` (`attribute` : 1) | Décimales de `value`, ou d'un `attribute` numérique |
| `tap` | énum | `card` `more_info` `none` | `card` s'il y a une `card`, sinon plus d'infos | Voir [Fiches](#fiches) |
| `protected` | booléen | | `false` | Pas d'arrêt depuis le plan : pas d'interrupteur « éteindre » dans sa fiche, interrupteur grisé tant qu'il est allumé dans la vue de la pièce |
| `confirm` | booléen | | `false` | `true` : son interrupteur allumer / éteindre (fiche, vue de la pièce) demande confirmation, même pour un service sûr (par exemple une porte de garage commandée par un `switch`) |
| `card` | objet / liste | | — | Sa [fiche](#fiches) |
| `animation` | énum / objet | voir [Animations](#animations) | `animations.light`, `.alert` ou `.badge` | Animation quand elle est active |
| `hidden` | booléen | | `false` | Masquée en vue et dans la vue de la pièce (toujours comptée dans les puces de résumé) |
| `level` | nombre | | `0` | Ordre dans le calque Appareils |
| `zoom_only` | bool | | `badge_style.zoom_only` | `true` : absent du plan entier, affiché dans la vue de sa pièce (toujours affiché dans l'éditeur) |
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

Éditeur : *Ajouter › Appareils* (*Lumière*, *Appareil libre*…), puis cliquer sur le plan ; la sélectionner pour sa
barre flottante, puis *Modifier* (double-clic, Entrée) pour sa fenêtre d'édition : onglets *Général* (entité, nom, icône,
couleur, *Valeur affichée sur la pastille*…), *Réglages avancés*, *Fiche* et *Animation*, avec l'aperçu dans sa pièce.

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

Éditeur : barre d'outils *Texte (T)* (le nouveau texte s'ouvre dans sa fenêtre d'édition, prêt à saisir) ; *Ajouter › Zone
d'informations*, puis *Entité* pour ajouter des lignes dans l'onglet *Entités* de sa fenêtre d'édition.

## Meubles

Symboles vus de dessus. Un meuble simple ne capte jamais les clics en vue ; un meuble doté d'une entité, d'une valeur ou
d'une fiche est un [meuble connecté](#meubles-connectés).

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `type` | énum | voir le catalogue ci-dessous, ou `custom` | obligatoire | Symbole. Un type inconnu est dessiné comme un rectangle |
| `shape` | liste | 40 formes au plus | — | `custom` seulement : le dessin, voir ci-dessous |
| `pos` | `[x, y]` | | `[0, 0]` | Centre |
| `size` | `[largeur, profondeur]` / nombre | 5–5000 chacune | taille du catalogue | Taille avant rotation ; un nombre seul = un carré |
| `rotation` | nombre (°) | | `0` | Rotation dans le sens horaire |
| `mirror` | booléen | | `false` | En miroir (canapé d'angle, baignoire…) |
| `name` | texte | | nom du type | Info-bulle ; pour `area`, l'étiquette dessinée sur le plan |
| `chairs` | nombre | 0–12 | selon la table | Tables seulement : nombre de chaises |
| `tint` | booléen | | `true` | Meuble connecté : teinté au repos (`false` = couleur seulement quand il est actif) |
| `hidden` | booléen | | `false` | Masqué en vue |
| `level` | nombre | | `0` (`-1` pour `rug` et `area`) | Ordre dans le calque Meubles |
| `group` | texte | `id` de groupe | — | Groupe de l'éditeur |
| `floor`, `roof_tilt`, `sill_height` | | | | `stairs` et `skylight` : voir [Étages](#étages-et-image-de-fond) |
| `entity`, `value`, `active`, `active_attribute`, `threshold`, `attribute`, `unit`, `decimals`, `color`, `tap`, `protected`, `confirm`, `card`, `animation` | | | | Voir [Meubles connectés](#meubles-connectés) |

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
| Formes et espaces | `stairs` | Escalier | 90 × 280 | `floor` : l'étage où il mène |
| Formes et espaces | `skylight` | Fenêtre de toit | 78 × 118 | `roof_tilt`, `sill_height`, voir [Fenêtre de toit](#fenêtre-de-toit) |
| Extérieur | `car` | Voiture | 178 × 406 | couleur `#43a047` |
| Extérieur | `bike` | Vélo | 60 × 180 |  |
| Extérieur | `tree` | Arbre / arbuste | 200 × 200 | rond |
| Extérieur | `pool` | Piscine | 800 × 400 |  |

Les tapis et les espaces nommés sont dessinés sous les autres meubles (`level: -1` par défaut). Les types *ronds* n'ont
pas de bouton miroir. La *couleur* est l'accent par défaut des meubles connectés de ce type.

Éditeur : *Ajouter › Meubles* (onglets par catégorie, recherche), cliquer pour poser ; le sélectionner pour la taille,
la rotation (±15°, ±90°), *Miroir*, *Chaises*, *Modèle*.

### Meubles personnalisés

`type: custom` dessine sa forme `shape` : des formes dans l'ordre (la dernière au-dessus), coordonnées en % de `size`
depuis le coin haut gauche, pour que le meuble puisse changer de taille. Les valeurs invalides sont bornées ou retirées,
jamais écrites telles quelles dans le dessin. `color` (`#rrggbb`, un nom de couleur ou `var(--…)`, le reste est retiré)
teinte le meuble ; connecté, son accent et son aspect « actif » s'appliquent toujours.

| Clé de forme | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `kind` | énum | `rect` `rounded_rect` `ellipse` `line` `polygon` | obligatoire | Les genres inconnus sont retirés |
| `x`, `y` | nombre (%) | −50–150 | `0` | Coin haut gauche (`rect`, `rounded_rect`, `ellipse`) |
| `w`, `h` | nombre (%) | 0–200 | `100` | Largeur et profondeur (`rect`, `rounded_rect`, `ellipse`) |
| `radius` | nombre (cm) | 0–500, au plus la moitié du petit côté | `8` | Rayon des coins de `rounded_rect` |
| `points` | `[[x, y], …]` (%) | 2–24 points (`line`), 3–24 (`polygon`) | obligatoire | `line`, `polygon` |
| `style` | énum | `filled` `outline` `dashed` | `filled` | Remplissage et trait |

```yaml
furniture:
  - type: custom
    pos: [250, 200]
    size: [180, 120]
    name: Banc d'angle
    color: "#188038"
    shape:
      - {kind: polygon, points: [[0, 0], [100, 0], [100, 40], [40, 40], [40, 100], [0, 100]]}
      - {kind: ellipse, x: 10, y: 10, w: 20, h: 20}
      - {kind: line, points: [[0, 50], [100, 50]], style: dashed}
```

Éditeur : *Ajouter › Meubles › Créer un meuble* : partir d'une forme de base (rectangle, rectangle arrondi, rond, forme en
L) ou de n'importe quel meuble du catalogue (converti en formes), régler nom, taille (cm), catégorie, mots de recherche,
couleur, formes (en cm) et au besoin une entité, avec un aperçu à l'échelle ; *Ajouter* pour le poser ou *Enregistrer dans
Mes modèles* (rangé dans sa catégorie, avec *Modifier*). Un meuble posé s'ouvre dans le même atelier depuis sa fenêtre
d'édition (*Modifier la forme*, ou *Personnaliser la forme* pour un meuble du catalogue). Dans l'aperçu, les formes se choisissent,
se glissent et se redimensionnent directement (8 poignées, Maj : proportions ; sommets des traits et polygones, *+* pour en
ajouter un, appui long ou Suppr pour le retirer), aimantées à une grille de 5 cm et aux bords et centres (Alt : sans
aimant) ; flèches 1 cm (Maj : 10 cm), Ctrl+Z / Ctrl+Y annulent dans l'atelier. Les valeurs restent en % de `size`, au
centième au plus.

## Meubles connectés

Tout meuble devient connecté avec une `entity`, une `value` ou une `card` : teinte d'accent, aspect « actif », pastille
de valeur, et zone tactile qui ouvre sa fiche ou sa fenêtre plus d'infos. Mêmes clés et même sens que pour les
[pastilles d'appareils](#pastilles-dappareils).

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
| `confirm` | booléen | | `false` | `true` : l'interrupteur allumer / éteindre de sa fiche demande confirmation, même pour un service sûr |
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
*Remplir depuis l'appareil* propose une fiche ; *Fusionner avec « … »* absorbe une pastille de la même entité située à
moins de 1,5 m.

## Fiches

Une fiche est la fenêtre qui s'ouvre quand on touche une ouverture, une pastille ou un meuble connecté : un en-tête (icône,
nom, état, interrupteur allumer / éteindre, bouton ⓘ *Plus d'infos*, ✕ pour fermer) et une pile de [widgets](#widgets).

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `card` | objet / liste | | — | La fiche ; une simple liste est lue comme ses `widgets` |
| `card.title` | texte | | nom de l'élément | Titre de la fiche |
| `card.widgets` | liste | [widgets](#widgets) | `[]` | Widgets, dans l'ordre (mêmes types et mêmes clés que dans les panneaux) |
| `card.more_info` | entité / chemin / URL / `false` | | entité principale | Effet du bouton ⓘ *Plus d'infos* de l'en-tête : une entité ouvre sa fenêtre plus d'infos de HA, un chemin de tableau de bord (`/lovelace/energie`, pas `//…`) y mène, une URL (`http://…` ou `https://…`) s'ouvre dans un nouvel onglet, `false` (ou `none`) masque le bouton. Tout autre lien (`javascript:`, `data:`…) est retiré |
| `tap` | énum | `card` `more_info` `none` | `card` s'il y a une fiche | `card` ouvre la fiche, `more_info` la fenêtre plus d'infos de HA pour l'entité principale, `none` ne fait rien |
| `protected` | booléen | | `false` | Ne jamais afficher l'interrupteur « éteindre » (un bouton « Rallumer » seulement quand l'élément est éteint) |
| `confirm` | booléen | | `false` | L'interrupteur allumer / éteindre demande confirmation, même pour un service sûr (les widgets de la fiche ont leur propre `confirm`) |

L'interrupteur allumer / éteindre n'apparaît que pour les entités `switch`, `light`, `fan`, `input_boolean` et
`humidifier`. Dans une fiche, les lignes affichent des valeurs (ni interrupteur, ni bouton *Activer*). Les services qu'une
fiche peut appeler sont : le `turn_on` / `turn_off` de l'élément lui-même (l'interrupteur ; jamais `turn_off` s'il est
`protected`), et les boutons de ses widgets [cover](#widget-cover) (ouvrir / arrêter / fermer une cover ou une vanne),
[lock](#widget-lock) (verrouiller / déverrouiller / ouvrir) et [thermostat](#widget-thermostat)
(`climate.set_temperature`). Les services sensibles (déverrouiller, ouvrir une porte de garage…) demandent toujours une
confirmation, voir [Sécurité](#sécurité).

```yaml
badges:
  - entity: switch.fridge_plug
    pos: [80, 60]
    tap: card
    protected: true
    card:
      title: Réfrigérateur
      more_info: /lovelace/energie   # le bouton ⓘ ouvre le tableau de bord Énergie
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

Éditeur : sélectionner l'ouverture, la pastille ou le meuble › *Fiche* : *Ajouter un widget*, *Remplir depuis l'appareil*,
*Fiche en modèle*, *Bouton « Plus d'infos »* (par défaut, une autre entité, une page, masqué) ; la colonne de droite
montre la vraie fiche tant que l'élément est sélectionné.

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
| `type` | énum | `tariff` `ev` `gauge` `tile` `entities` `periods` `divider` `cover` `lock` `thermostat` `climate` | obligatoire | Type de widget |
| `title` | texte | | — | Titre de l'en-tête (`tile`, `gauge`, `cover`, `lock`, `thermostat` : nom de l'entité par défaut) |
| `icon` | icône | | selon le type | Icône de l'en-tête |
| `color` | couleur | | — | Couleur d'accent (`gauge` : couleur de l'arc) |
| `rows` | liste | | — | Lignes supplémentaires sous `tile`, `gauge`, `tariff`, `ev`, `cover`, `lock` et `thermostat`, voir ci-dessous |
| `confirm` | booléen | | `false` (`cover`, `lock` : voir leur section) | `true` : chaque service du widget demande confirmation, même sûr : interrupteurs et boutons *Activer* de ses lignes, consigne du thermostat, boutons de cover et de serrure. `false` ne retire jamais la confirmation d'un service sensible |

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

Éditeur : *Ajouter › Widgets*, ou *Ajouter un widget* dans un panneau ou une fiche ; cliquer sur le widget, puis
*Modifier* dans sa barre flottante : la fenêtre d'édition montre le widget lui-même en aperçu (← ou Échap revient à la
pièce ou à la fiche qui le porte).

### Widget `tariff`

Prix de l'électricité en direct, période en cours (heures pleines / heures creuses) et couleurs Tempo du jour et du
lendemain.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `price` | entité | | — | Capteur de prix (son unité, sinon €/kWh) |
| `period` | entité | | — | Période en cours ; verte quand elle contient « creuse » / « off-peak », orange sinon, neutre (contour) si elle est indisponible ou inconnue |
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
| `power` | entité | | — | Puissance de charge, dans l'unité de l'entité (`W`, `kW` ou `MW` ; sans unité = W) ; affichée en W, ou en kW dès 1000 W |
| `threshold` | nombre (W) | | `50` | En charge quand `power` (ramenée en W) dépasse ce seuil |
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
avec `color` ou `severity`).

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `entity` | entité | | — | Valeur |
| `min` | nombre | décimales permises (pH : `6.5`) | `0` | Début de l'arc |
| `max` | nombre | décimales permises | `100` | Fin de l'arc (l'éditeur propose 9000) |
| `unit` | texte | | unité de l'entité | Unité |
| `decimals` | nombre | | 1 (0 à partir de 100) | Décimales |
| `severity` | objet | `green`, `yellow`, `red` : nombres | — | Couleur de l'arc selon la valeur, comme la carte Jauge de HA : chaque couleur vaut à partir de sa valeur jusqu'à la suivante (ordre libre, une à trois couleurs) |

```yaml
panels:
  right:
    - {type: gauge, title: Puissance, entity: sensor.linky_power, min: 0, max: 9000, unit: W, decimals: 0}
    - {type: gauge, title: CO₂, entity: sensor.living_co2, min: 400, max: 2000, unit: ppm, severity: {green: 0, yellow: 800, red: 1200}}
    - {type: gauge, title: Batterie maison, entity: sensor.home_battery, unit: "%", severity: {red: 0, yellow: 20, green: 50}}
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

Une liste d'entités ; les lumières, interrupteurs, ventilateurs, humidificateurs et booléens d'entrée ont un
interrupteur, les scènes, scripts et boutons un bouton *Activer* (valeurs seulement dans une fiche) ; un script ou un
bouton demande confirmation avant de partir (pas une scène, sauf si le widget a `confirm: true`, qui confirme aussi ses
interrupteurs) ; un capteur binaire de problème (fuite, fumée, gaz, CO…) à
`on` s'affiche en rouge.

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
| `factor` | nombre | | `1` | Multiplicateur appliqué aux valeurs, avec `stat` comme avec les quatre entités (par exemple `0.001` pour passer de Wh à kWh) |
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

Commande d'un `cover` (volet, store, portail, garage ou porte motorisée) ou d'une `valve` (vanne d'arrêt, arrosage) :
état, barre de position, *Ouvrir* / *Stop* / *Fermer*.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `entity` | entité | un `cover.*` ou `valve.*` | — | Le volet ou la vanne ; les autres domaines sont écartés |
| `confirm` | booléen | | `true` pour les classes d'appareil `garage`, `gate`, `door` et pour les vannes ; sinon `false` | Dialogue de confirmation avant chaque bouton. L'ouverture est toujours confirmée pour une vanne et pour une cover qui n'est pas un volet, store, rideau, auvent ou fenêtre (`false` ne la retire pas) |

Seuls `cover.open_cover`, `cover.stop_cover` et `cover.close_cover` (ou `valve.open_valve`, `valve.stop_valve`,
`valve.close_valve`) de cette entité sont appelés ; *Stop* est masqué quand l'entité ne le prend pas en charge.

```yaml
panels:
  left:
    - type: cover
      title: Portail
      entity: cover.gate
      confirm: true
      rows: [{entity: binary_sensor.gate_closed}]
```

### Widget `lock`

Une serrure (`lock`) : état (en rouge si déverrouillée ou bloquée) et l'action utile — *Déverrouiller* si elle est
verrouillée, *Verrouiller* sinon, les deux si l'état est incertain (bloquée, en mouvement, inconnu) — et *Ouvrir* si la
serrure sait ouvrir la porte.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `entity` | entité | un `lock.*` | — | La serrure ; les autres domaines sont écartés |
| `confirm` | booléen | | déverrouiller et ouvrir seulement | `true` : *Verrouiller* est confirmé aussi. *Déverrouiller* et *Ouvrir* sont toujours confirmés (`false` ne le retire pas) |

Seuls `lock.lock`, `lock.unlock` et `lock.open` de cette entité sont appelés (aucun code n'est envoyé : une serrure qui
en demande un se commande depuis sa fenêtre « plus d'infos »). Rien ne se passe depuis l'aperçu de l'éditeur.

```yaml
panels:
  left:
    - {type: lock, title: Porte d'entrée, entity: lock.front_door}
```

### Widget `thermostat`

Une entité `climate` : température mesurée, consigne avec −/+ (pas et limites de l'appareil), action en cours, mode.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `entity` | entité | un `climate.*` | — | Thermostat |
| `confirm` | booléen | | `false` | `true` : chaque −/+ demande confirmation (`climate.set_temperature`) |

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
    presence: person.sam
```

Éditeur : cliquer sur une puce au-dessus du plan, puis *Modifier* dans sa barre flottante (aperçu : la puce elle-même) ; *+ Puce* (*Ajouter une puce au résumé*) en ajoute
une ; faire glisser une puce à côté, en dessous ou sous les autres. Aussi dans ⚙ Paramètres › Fonctions › *Puces du
résumé*. Masquées par défaut en [mode tablette](#tablette-murale).

## Calques

Chaque élément appartient à un calque fixe selon son genre. Deux groupes de calques, chacun avec son propre ordre ; le
groupe superposé est toujours au-dessus du dessin.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `layers.drawing_order` | liste | `rooms` `sub_areas` `halos` `furniture` `fences` `walls` `openings` | cet ordre | Calques du dessin, du bas vers le haut ; ceux qui manquent suivent dans l'ordre par défaut |
| `layers.overlay_order` | liste | `room_labels` `area_labels` `badges` `texts` | cet ordre | Calques au-dessus du dessin, du bas vers le haut |
| `layers.hidden` | liste | n'importe quel calque, et `background` | `[]` | Masqués en vue (dessinés à 25 % et non cliquables dans l'éditeur) |
| `layers.locked` | liste | n'importe quel calque, et `background` | `[]` | Non sélectionnables dans l'éditeur (les clics passent à travers) ; sans effet en vue |
| `layers.view_button` | booléen | | `false` | Bouton *Calques* à côté des boutons de zoom : chaque visiteur masque des calques pour lui-même (mémorisé dans le navigateur) |
| `hidden` (sur un élément) | booléen | | `false` | Cet élément est masqué en vue |
| `level` (sur un élément) | nombre | | `0` | Ordre dans son calque, plus grand = au-dessus (`rug`, `area` : `-1`) |

`background` est l'[image de fond](#image-de-fond) : sous tous les autres calques, hors de l'ordre du dessin.
`area_labels` contient les étiquettes des espaces nommés et des sous-zones ; `badges` les pastilles d'appareils ;
`room_labels` les étiquettes des pièces.

```yaml
layers:
  drawing_order: [rooms, sub_areas, furniture, halos, fences, walls, openings]
  overlay_order: [room_labels, area_labels, badges, texts]
  hidden: [fences]
  locked: [walls, rooms]
  view_button: true
```

Éditeur : barre d'outils *Calques*, une fenêtre (glisser ou ↑ / ↓ pour réordonner, œil, cadenas, *Réinitialiser l'ordre*,
*Éléments du plan* : un clic ouvre la fenêtre d'édition de l'élément, Échap revient à *Calques*) ; par
élément : *Masquer en vue*, *Premier plan* / *Arrière-plan* ; `view_button` aussi dans ⚙ Paramètres › Affichage.

## Groupes

Les groupes lient des éléments pour qu'ils se sélectionnent et se déplacent ensemble dans l'éditeur.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `groups[].id` | texte | | — | Identifiant du groupe, utilisé par `group` |
| `groups[].name` | texte | | — | Nom du groupe dans l'éditeur |
| `group` (sur un élément) | texte | un `id` de groupe | — | Appartenance d'une pièce, d'une ouverture, d'une pastille, d'un texte ou d'un meuble |
| 5e valeur d'un mur / d'une limite | texte | un `id` de groupe | — | Appartenance d'un mur ou d'une limite |

```yaml
groups:
  - {id: garden, name: Jardin}
badges:
  - {entity: light.garden, pos: [600, 500], group: garden}
fences:
  - [550, 450, 900, 450, garden]
```

Éditeur : sélectionner plusieurs éléments (cadre, Ctrl+clic, Ctrl+A) : la barre flottante agit sur tous (*Modifier*,
*Dupliquer*, verrou, *Supprimer*) ; *Modifier* ouvre une fenêtre avec les réglages communs (*Aligner*, *Masquer en vue*,
nom du groupe) et la liste de la sélection, en aperçu ensemble ; *Grouper* (Ctrl+G) / *Dégrouper* (Ctrl+Maj+G). Le premier clic sur un
membre sélectionne le groupe, un second clic l'élément seul.

## Modèles

Éléments réutilisables enregistrés par l'éditeur et proposés à nouveau dans *Ajouter › Mes modèles*.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `name` | texte | | — | Nom du modèle |
| `id` | texte | | — | Identifiant court écrit par l'éditeur (modèles de widget) |
| `kind` | énum | `badge` `opening` `furniture` `widget` | — | Nature de `item` |
| `icon` | icône | | — | Icône dans le catalogue |
| `description` | texte | | — | Sous-titre dans le catalogue |
| `type` | énum | types de meubles, `custom` | — | Modèles `furniture` : le type de meuble |
| `category` | énum | `living` `dining` `kitchen` `bedroom` `bathroom` `utility` `shapes` `outdoor` | — | Meuble personnalisé : catégorie du catalogue où il est rangé (sinon *Mes modèles*) |
| `keywords` | texte | | — | Meuble personnalisé : mots de recherche en plus |
| `domain` | texte | un domaine d'entité | — | Modèles `badge` : domaine proposé au moment de choisir l'entité ; meuble avec `ask: [entity]` : domaine cherché |
| `item` | objet | | — | L'élément : une pastille, une ouverture, un meuble ou un widget, avec les clés de cet élément (sans position) |
| `items` | liste | widgets | — | Une fiche entière enregistrée comme modèle : tous ses widgets |
| `ask` | liste | chemins de clés du widget ; `contact` `shutter` `entity` (ouvertures) ; `entity` (meubles) | — | Champs entité à choisir à chaque usage : laissés vides et surlignés « à compléter » pour un widget (`entity`, `rows`, `columns.0.stat`…) ; cherchés dans la pièce où l'on pose une ouverture ou un meuble |

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
  - name: Porte du jardin
    id: p7c2m9de
    kind: opening
    icon: mdi:door
    ask: [contact, shutter]
    item: {type: door, leaves: 2, swing: left}
  - name: Banc d'angle
    id: b4n8q1zt
    kind: furniture
    type: custom
    category: living
    keywords: banc assise
    description: 180 × 120 cm
    item: {type: custom, size: [180, 120], color: "#188038", shape: [{kind: rect, x: 0, y: 0, w: 100, h: 100}]}
  - name: Fiche voiture
    kind: widget
    icon: mdi:card-text-outline
    description: Fiche · 2 widgets
    items:
      - {type: ev, title: Voiture, battery: sensor.ev_battery}
      - {type: divider}
  - name: CO₂ de la pièce
    id: k3f9x2qa
    kind: widget
    icon: mdi:molecule-co2
    description: Jauge
    ask: [entity]
    item: {type: gauge, title: CO₂ de la pièce, min: 400, max: 2000, unit: ppm, severity: {green: 0, yellow: 800, red: 1200}}
```

Éditeur : sélectionner un élément › *Modèle* (*Enregistrer comme modèle*) ; une fiche › *Fiche en modèle* ; *Ajouter un
widget › Créer un widget*, *Ajouter › Créer une ouverture* ou *Créer un meuble* › *Enregistrer dans Mes modèles* ;
réutiliser depuis *Ajouter › Mes modèles*.

## Ambiance

Calques facultatifs et discrets, dessinés sous les pastilles : teinte de nuit et ensoleillement, météo sur les pièces
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

Des perles qui circulent du tableau électrique vers chaque meuble ou pastille dont la valeur est une puissance (W, kW),
plus rapides et plus nombreuses à mesure que la puissance augmente.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `energy` | booléen / objet | | — | `true` / `{}` = défauts |
| `energy.source` | nombre / énum | un indice de meuble, ou un type de meuble | `electrical_panel` | Meuble d'où partent les flux |
| `energy.threshold` | nombre (W) | | `5` | Puissance minimale pour dessiner un flux |
| `energy.color` | couleur | | couleur de la cible, sinon couleur du type, sinon `#fbc02d` | Couleur des flux |
| `energy.badges` | booléen | | `true` | `false` : pas de flux vers les pastilles d'appareils (meubles seulement) |

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
| `people.avatar` | énum | `picture` `initials` | `picture` | Photo du profil HA (initiales s'il n'y en a pas, ou si elle n'est pas servie par Home Assistant lui-même), ou toujours les initiales |
| `people.persons` | objet | `{person.x: {away, at_home, avatar}}` | — | Réglages par personne de `away`, `at_home`, `avatar` (ils priment sur les réglages communs) |

```yaml
ambience:
  people:
    home: Séjour
    entities: [person.sam, {entity: person.camille}]
    away: direction
    at_home: grouped
    avatar: picture
    persons:
      person.camille: {away: hidden}
      person.sam: {away: zone, avatar: initials, at_home: grouped}
```

Éditeur : `away`, `at_home`, `avatar` communs dans ⚙ Paramètres › *Personnes sur le plan* ; par personne et `home` dans
*Ambiance et animations* › *Personnes* (faire glisser les avatars sur le plan pour fixer `home` en `[x, y]`).

### Lumière

La lumière du dehors et des lampes, active par défaut dès que `ambience` est présent. SVG statique (sans animation ni
filtre), redessiné seulement quand le soleil (au degré près), un volet, la phase de la lune ou une lampe change.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `light` | booléen / objet | | `true` | `false` = désactivée ; un objet = les réglages ci-dessous |
| `light.sun` | booléen / nombre | `0` à `2` | `true` | Lumière du jour par les ouvertures `window` et les portes vitrées (`glazed`), coupée par la pièce. De jour, chaque fenêtre non fermée laisse entrer la lumière du ciel : un faisceau qui s'évase dans la pièce, plus lumineux contre la vitre et fondu en profondeur, d'un blanc légèrement chaud fondu en écran (il éclaircit le sol, jamais un voile gris), et un léger éclaircissement de toute la pièce, selon le nombre et la taille de ses fenêtres ouvertes (fondu au crépuscule civil, un peu plus forte côté soleil, un peu plus forte par temps couvert). Les fenêtres qui voient le soleil ont en plus une tache au sol à bords doux (direction d'après l'azimut de `sun.sun` + `north`, longueur d'après la hauteur, raccourcie par le `shutter` lié) et une lueur chaude rediffusée autour. Les vantaux voisins (même `bay`, même `group`, ou alignés et contigus) forment une baie, avec une seule tache. Avec une entité météo `meteo`, le soleil direct suit son `cloud_coverage` (10 % ou moins = plein soleil, 90 % ou plus = aucun), sinon sa condition (couvert = aucun) ; la pluie, le brouillard ou la neige le suppriment. Les effets météo (nuages, brume, pluie) restent dehors : jamais peints sur les pièces intérieures. `false` coupe toute la lumière du jour (lueur du ciel comprise) ; un nombre règle seulement la tache directe (`1` = défaut, `0` = pas de tache, `2` = deux fois plus lumineuse) |
| `light.sky` | booléen / nombre | `0` à `2` | `true` | Intensité de la lueur du ciel (`1` = défaut, `0` = aucune) |
| `light.bounce` | booléen / nombre | `0` à `2` | `true` | Intensité de la lueur rediffusée autour des taches, soleil et lune (`1` = défaut, `0` = aucune) |
| `light.sky_diffusion` | nombre | `0` à `1` | `0.6` | Diffusion de la lumière du ciel (et de la lueur du ciel nocturne) : `0` = faisceau net, `1` = flou large qui grandit avec la profondeur (presque net contre la vitre, de plus en plus large dans la pièce, sans bord visible). Éditeur : curseur *Diffusion*, de 0 à 100 % |
| `light.sky_kelvin` | `auto` / nombre | `1800` à `10000` | `auto` | Teinte de la lumière du ciel en température de couleur (corps noir) ; `auto` = blanc légèrement chaud |
| `light.sun_kelvin` | `auto` / nombre | `1800` à `10000` | `auto` | Teinte de la tache de soleil (la lueur rediffusée un peu plus chaude) ; `auto` = celle d'origine, dorée près du coucher |
| `light.moon` | booléen / entité | `true`, `false` ou un `sensor.*` | `true` | La nuit, une lumière froide par les mêmes fenêtres. La direction de la lune est calculée par la carte d'après la latitude / longitude de Home Assistant et l'heure : une tache faible et froide derrière les fenêtres qui la voient, seulement la lueur du ciel nocturne par les autres (et lune couchée). Phase d'après un capteur (intégration Moon, `sensor.moon_phase` pris s'il existe), sinon calculée ; plus forte vers la pleine lune. Sans coordonnées, une lueur dans l'axe de chaque fenêtre |
| `light.doors` | énum | `open` `closed` | `open` | La lumière du jour d'une pièce éclairée passe aussi dans la pièce voisine par une porte intérieure ouverte (son `contact` à on / open) ou une verrière (une `window`, ou une porte `glazed`, entre deux pièces intérieures, sans `outside` : avec, elle compte en fenêtre extérieure seulement) : une lumière plus faible sur toute la voisine et une lueur près de l'ouverture, un seul saut (pas de propagation plus loin), lampes non comprises. `closed` = une porte intérieure sans capteur compte comme fermée |
| `light.lamps` | booléen | | `true` | Les halos des pastilles `light.*` avec `halo` prennent la couleur de la lampe (`rgb_color`, sinon `hs_color`, sinon `color_temp_kelvin`) et sa luminosité, se mélangent (écran) quand ils se recouvrent et restent dans la pièce de la lampe (`room`, sinon celle où elle est posée) |

```yaml
ambience:
  north: 45
  light: {sun: true, moon: sensor.moon_phase, lamps: true}
  # plus marquée et plus chaude : light: {sky: 1.6, bounce: 1.6, sun: 1.3, sky_kelvin: 5000, sun_kelvin: 3200}
```

Fenêtres : allège à 90 cm, haut à 215 cm ; 180 cm de large ou plus = baie jusqu'au sol. Portes vitrées : 0 à 215 cm (`full`) ou 150 à 200 cm (`top`). La lumière rasante (plus de 78°)
est ignorée. Éditeur : *Ambiance et animations* › *Lumière* (curseurs de 0 à 200 %, température de couleur avec un bouton *Auto*), avec une pièce fictive pour les voir à toute heure et par tout temps.

## Style des pastilles

L'aspect des pastilles d'appareils sur le plan. Toutes les clés sont facultatives ; les défauts gardent l'aspect d'origine.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `badge_style.unavailable` | énum | `dimmed` `dashed` `hidden` | `dimmed` | Appareil indisponible : estompé, contour pointillé, ou non affiché |
| `badge_style.inactive` | énum | `shown` `active_only` `dimmed` | `shown` | Appareil inactif : affiché, affiché seulement quand il est actif, ou estompé |
| `badge_style.size` | énum | `small` `normal` `large` | `normal` | 0,8 ×, 1 ×, 1,25 × (même taille à l'écran quel que soit le zoom) |
| `badge_style.values` | énum | `always` `hover` `never` | `always` | Valeur dans la pastille : toujours, au survol / au focus (toujours sur écran tactile), jamais |
| `badge_style.zoom_only` | bool | | `false` | `true` : les pastilles n'apparaissent que dans la vue de leur pièce ; le `zoom_only` d'une pastille l'emporte |

Une pastille masquée compte toujours dans les puces de résumé et apparaît toujours dans la vue de la pièce ; une pastille
concernée par une alerte plein plan reste visible ; dans l'éditeur, toutes les pastilles restent visibles.

```yaml
badge_style:
  unavailable: dashed
  inactive: active_only
  size: small
  values: hover
```

Éditeur : ⚙ Paramètres › *Pastilles d'appareils*.

## Alertes plein plan

Des règles qui illuminent tout le plan tant qu'elles sont vraies : voile pulsant, bandeau (nom, éléments, détails,
masquer jusqu'au prochain changement), éléments entourés d'une onde. Jamais pendant l'édition.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `name` | texte | | « Alerte » (`Alert` en anglais) | Titre du bandeau |
| `entity` | entité | | — | Une entité surveillée |
| `entities` | liste d'entités | | — | Plusieurs entités surveillées |
| `type` | énum | `openings` | — | Surveiller toutes les ouvertures du plan (chacun de leurs capteurs `contact`, sinon `entity` ; une ouverture est nommée une fois) |
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
dans ⚙ Paramètres › Fonctions › *Alertes plein plan*.

## Animations

Une animation par événement pour tout le plan (`animations`) ; une ouverture, une pastille ou un meuble connecté la remplace
par sa propre `animation` (`shutter_animation` pour un volet).

| Clé d'événement | S'applique à | Défaut |
|---|---|---|
| `animations.opening` | Porte / fenêtre ouverte | `{type: pulse, duration: 1.6}` |
| `animations.shutter` | Volet en mouvement | `{type: scroll, duration: 0.8}` |
| `animations.alert` | Pastille avec `alert: true`, quand elle est active | `{type: pulse, duration: 1.2}` |
| `animations.light` | Pastille `light.*` allumée | `{type: none, duration: 2.4}` |
| `animations.badge` | Autre pastille active | `{type: none, duration: 2}` |
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
élément : sa fenêtre d'édition › *Animation*. Le [niveau d'animation](#niveau-danimation) peut toutes les réduire ou les arrêter.

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
| `interaction.reset_after` | nombre (s) | 0–86400 (éditeur : pas de 10) | `0` | Retour au plan entier après ce nombre de secondes sans interaction (vue de la pièce, zoom, fiches fermées, relecture en pause ramenée au direct) ; `0` = jamais |

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

Éditeur : ⚙ Paramètres › Interaction › *Tablette murale* (*Mode tablette*, *Puces de résumé*, *Panneaux latéraux*, *Anti-marquage de
l'écran*).

## Niveau d'animation

Une limite globale aux mouvements. Le réglage système « réduire les animations » est toujours respecté.

| Clé | Type | Valeurs | Défaut | Description |
|---|---|---|---|---|
| `animation_level` | énum | `full` `reduced` `none` | `full` | `full` : toutes les animations ; `reduced` : rien ne tourne en boucle (pulsations, ondes, météo, flux), transitions courtes ; `none` : ni animation ni transition. La relecture et les exemples sous le plan le suivent |

```yaml
animation_level: reduced
```

Éditeur : ⚙ Paramètres › Interaction › *Animations* › *Niveau d'animation*.

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
conserve à l'enregistrement. Un plan importé n'apporte jamais ces clés : la carte garde les siennes.

## Sécurité

Maquette tourne dans l'interface de Home Assistant avec les droits de l'utilisateur connecté. N'importez des plans et des
modèles que de personnes de confiance ; la carte vous protège tout de même ainsi.

**Les services sensibles sont toujours confirmés.** Chaque service appelé depuis le plan (boutons des pièces, widgets des
panneaux et des fiches, interrupteurs, *Activer*) est comparé à une liste de services sûrs. Tout autre service ouvre un
court dialogue qui nomme l'action réelle, le service (`lock.unlock`) et les entités visées, quel que soit le libellé du
bouton ; les clés de `data` sont montrées, jamais leurs valeurs (un code reste caché). *Annuler* a le focus ; Échap annule.

| Sûrs (sans dialogue) | Sensibles (toujours confirmés) |
|---|---|
| `turn_on`, `turn_off`, `toggle` de `light`, `switch`, `fan`, `input_boolean`, `humidifier`, `media_player`, `climate`, `remote`, `automation` ; marche / arrêt d'un chauffe-eau ; réglages des ventilateurs, humidificateurs, climatiseurs, chauffe-eau et lecteurs (vitesse, mode, température, volume, lecture / pause…) | `lock.unlock`, `lock.open` |
| `scene.turn_on` ; valeurs d'`input_number`, `number`, `input_select`, `select` | `alarm_control_panel.alarm_disarm`, `alarm_trigger` |
| `cover.close_cover`, `stop_cover` (et inclinaison) ; `valve.close_valve`, `stop_valve` | ouvrir une cover (`open_cover`, `set_cover_position`, `toggle`, inclinaison) sauf si toutes les cibles sont des volets, stores, rideaux, auvents ou fenêtres (`device_class`) ; portes de garage, portails, portes et covers sans classe sont confirmés |
| `lock.lock` ; `alarm_control_panel.alarm_arm_*` | `valve.open_valve`, `set_valve_position`, `toggle` |
| `homeassistant.turn_on` / `turn_off` / `toggle` quand toutes les cibles sont dans un domaine sûr ci-dessus ; `homeassistant.update_entity` | `script.*`, `button.press`, `input_button.press`, `automation.trigger`, `homeassistant.restart` / `stop`, `shell_command`, `rest_command`, `notify`… et **tout service absent de la liste des sûrs** |

**`confirm: true` impose la confirmation**, même pour un service sûr, sur tout ce qui en appelle un : boutons des pièces
(`actions[].confirm`), pastilles, ouvertures et meubles connectés (leur interrupteur allumer / éteindre, dans leur fiche
et dans la vue de la pièce) et widgets (interrupteurs et *Activer* de leurs lignes, −/+ du thermostat, boutons de cover et
de serrure). Cas typique : une porte de garage, un portail ou un chauffage commandé par un `switch`. `confirm: false` ne
retire jamais la confirmation d'un service sensible. `protected: true` (pastilles, ouvertures, meubles) empêche
d'éteindre l'appareil depuis le plan.

**Vérification à l'import.** *Exporter / importer › Importer* montre d'abord un récapitulatif et n'applique rien avant
votre accord : services des boutons des pièces (les sensibles marqués), entités commandées par les widgets (cover, lock,
thermostat, lignes *Activer*), liens *Plus d'infos*, valeurs retirées car invalides (avec leur chemin, par exemple
`rooms[0].poly`), éléments sans coordonnées valides et clés de tableau de bord du fichier ignorées. Réimporter le plan sans
changement l'applique directement. Limites : 2 Mo de texte, 200 000 valeurs, 40 niveaux d'imbrication, 5 000 éléments par
liste ; le YAML est lu sans ses types étendus ; les clés `__proto__`, `constructor` et `prototype` sont écartées. Les
brouillons et copies gardés dans le navigateur sont relus de la même façon.

**Ce qui n'est jamais dessiné comme du code.** Les textes, noms et états HA sont échappés ; nombres, valeurs énumérées,
couleurs, icônes et liens sont contrôlés (voir [Conventions](#conventions)) ; tout le HTML construit par la carte ou
l'éditeur passe par un filtre qui retire scripts, gestionnaires d'événements (`on…`), liens autres que `#…`, `url()` autres
que `url(#…)` et images qui ne sont pas servies par Home Assistant. La carte ne fait aucune requête hors de Home Assistant.

## Index des clés

Chaque clé publique, par ordre alphabétique, avec les sections qui la documentent.

| Clé | Section(s) |
|---|---|
| `above` | [Alertes plein plan](#alertes-plein-plan) |
| `action` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `actions` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `active` | [Pastilles d'appareils](#pastilles-dappareils), [Meubles connectés](#meubles-connectés) |
| `active_attribute` | [Pastilles d'appareils](#pastilles-dappareils), [Meubles connectés](#meubles-connectés) |
| `alert` | [Pastilles d'appareils](#pastilles-dappareils), [Animations](#animations) |
| `alert_above` | [Puces de résumé](#puces-de-résumé) |
| `alert_h` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `alert_state` | [Puces de résumé](#puces-de-résumé) |
| `alert_t` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `alerts` | [Racine de la carte](#racine-de-la-carte), [Alertes plein plan](#alertes-plein-plan) |
| `ambience` | [Racine de la carte](#racine-de-la-carte), [Ambiance](#ambiance) |
| `animation` | [Animations](#animations), [Ouvertures](#ouvertures), [Pastilles d'appareils](#pastilles-dappareils), [Meubles connectés](#meubles-connectés) |
| `animation_level` | [Racine de la carte](#racine-de-la-carte), [Niveau d'animation](#niveau-danimation) |
| `animations` | [Racine de la carte](#racine-de-la-carte), [Animations](#animations) |
| `area` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `at_home` | [Personnes](#personnes) |
| `attribute` | [Pastilles d'appareils](#pastilles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles connectés](#meubles-connectés) |
| `ask` | [Modèles](#modèles) |
| `auto_actions` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `automations` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `avatar` | [Personnes](#personnes) |
| `average` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `away` | [Personnes](#personnes) |
| `background` | [Racine de la carte](#racine-de-la-carte), [Image de fond](#image-de-fond), [Calques](#calques) |
| `badge` | [Animations](#animations) |
| `badge_style` | [Racine de la carte](#racine-de-la-carte), [Style des pastilles](#style-des-pastilles) |
| `badges` | [Racine de la carte](#racine-de-la-carte), [Pastilles d'appareils](#pastilles-dappareils), [Flux d'énergie](#flux-dénergie) |
| `battery` | [Widgets](#widgets), [Widget `ev`](#widget-ev) |
| `bay` | [Ouvertures](#ouvertures) |
| `below` | [Puces de résumé](#puces-de-résumé), [Alertes plein plan](#alertes-plein-plan) |
| `burn_in` | [Tablette murale](#tablette-murale) |
| `card` | [Fiches](#fiches), [Ouvertures](#ouvertures), [Pastilles d'appareils](#pastilles-dappareils), [Meubles connectés](#meubles-connectés) |
| `card_mod` | [Clés Home Assistant conservées](#clés-home-assistant-conservées) |
| `category` | [Modèles](#modèles) |
| `chairs` | [Meubles](#meubles) |
| `color` | [Widgets](#widgets), [Animations](#animations), [Pastilles d'appareils](#pastilles-dappareils), [Meubles connectés](#meubles-connectés), [Traces](#traces), [Flux d'énergie](#flux-dénergie) |
| `color_today` | [Widgets](#widgets), [Widget `tariff`](#widget-tariff) |
| `color_tomorrow` | [Widgets](#widgets), [Widget `tariff`](#widget-tariff) |
| `columns` | [Widgets](#widgets), [Widget `periods`](#widget-periods) |
| `confirm` | [Pièces et sous-zones](#pièces-et-sous-zones), [Ouvertures](#ouvertures), [Pastilles d'appareils](#pastilles-dappareils), [Meubles connectés](#meubles-connectés), [Fiches](#fiches), [Widgets](#widgets), [Widget `cover`](#widget-cover), [Widget `lock`](#widget-lock), [Widget `thermostat`](#widget-thermostat), [Sécurité](#sécurité) |
| `contact` | [Ouvertures](#ouvertures) |
| `data` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `day` | [Widget `periods`](#widget-periods) |
| `day_night` | [Jour et nuit](#jour-et-nuit), [Ambiance](#ambiance) |
| `decimals` | [Puces de résumé](#puces-de-résumé), [Widgets](#widgets), [Widget `gauge`](#widget-gauge), [Widget `tile`](#widget-tile), [Widget `periods`](#widget-periods), [Pastilles d'appareils](#pastilles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles connectés](#meubles-connectés) |
| `default_floor` | [Racine de la carte](#racine-de-la-carte), [Étages](#étages-et-image-de-fond) |
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
| `entity` | [Puces de résumé](#puces-de-résumé), [Widgets](#widgets), [Widget `gauge`](#widget-gauge), [Widget `tile`](#widget-tile), [Widget `cover`](#widget-cover), [Widget `lock`](#widget-lock), [Widget `thermostat`](#widget-thermostat), [Ouvertures](#ouvertures), [Pastilles d'appareils](#pastilles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles connectés](#meubles-connectés), [Météo](#météo), [Personnes](#personnes), [Alertes plein plan](#alertes-plein-plan) |
| `factor` | [Widget `periods`](#widget-periods) |
| `fences` | [Racine de la carte](#racine-de-la-carte), [Limites et clôtures](#limites-et-clôtures) |
| `floor` | [Étages](#étages-et-image-de-fond), [Meubles](#meubles) |
| `floor_selector` | [Racine de la carte](#racine-de-la-carte), [Étages](#étages-et-image-de-fond) |
| `floors` | [Racine de la carte](#racine-de-la-carte), [Étages](#étages-et-image-de-fond) |
| `full_page` | [Réglages généraux](#réglages-généraux) |
| `furniture` | [Racine de la carte](#racine-de-la-carte), [Meubles](#meubles), [Animations](#animations) |
| `glazed` | [Ouvertures](#ouvertures) |
| `grid_options` | [Clés Home Assistant conservées](#clés-home-assistant-conservées) |
| `group` | [Pièces et sous-zones](#pièces-et-sous-zones), [Groupes](#groupes), [Ouvertures](#ouvertures), [Pastilles d'appareils](#pastilles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles](#meubles) |
| `groups` | [Racine de la carte](#racine-de-la-carte), [Groupes](#groupes) |
| `h` | [Meubles personnalisés](#meubles-personnalisés) |
| `h_max` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `h_min` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `halo` | [Pastilles d'appareils](#pastilles-dappareils) |
| `height` | [Ouvertures](#ouvertures), [Image de fond](#image-de-fond) |
| `hidden` | [Pièces et sous-zones](#pièces-et-sous-zones), [Calques](#calques), [Ouvertures](#ouvertures), [Pastilles d'appareils](#pastilles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles](#meubles) |
| `hide_if` | [Puces de résumé](#puces-de-résumé) |
| `history` | [Widgets](#widgets), [Widget `tile`](#widget-tile) |
| `home` | [Personnes](#personnes) |
| `hours` | [Revoir la journée](#revoir-la-journée) |
| `humidity` | [Pièces et sous-zones](#pièces-et-sous-zones), [Réglages généraux](#réglages-généraux) |
| `humidity_attribute` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `icon` | [Puces de résumé](#puces-de-résumé), [Pièces et sous-zones](#pièces-et-sous-zones), [Widgets](#widgets), [Pastilles d'appareils](#pastilles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Modèles](#modèles), [Alertes plein plan](#alertes-plein-plan), [Étages](#étages-et-image-de-fond) |
| `id` | [Racine de la carte](#racine-de-la-carte), [Groupes](#groupes), [Modèles](#modèles), [Étages](#étages-et-image-de-fond) |
| `image` | [Image de fond](#image-de-fond) |
| `inactive` | [Style des pastilles](#style-des-pastilles) |
| `info` | [Textes et zones d'informations](#textes-et-zones-dinformations) |
| `intensity` | [Animations](#animations), [Ambiance](#ambiance), [Jour et nuit](#jour-et-nuit), [Météo](#météo) |
| `interaction` | [Racine de la carte](#racine-de-la-carte), [Interaction](#interaction) |
| `item` | [Modèles](#modèles) |
| `items` | [Modèles](#modèles) |
| `keywords` | [Modèles](#modèles) |
| `kind` | [Modèles](#modèles), [Meubles personnalisés](#meubles-personnalisés) |
| `label` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `lamps` | [Lumière](#lumière) |
| `language` | [Réglages généraux](#réglages-généraux) |
| `layers` | [Racine de la carte](#racine-de-la-carte), [Calques](#calques) |
| `layout_options` | [Clés Home Assistant conservées](#clés-home-assistant-conservées) |
| `leaves` | [Ouvertures](#ouvertures) |
| `left` | [Pièces et sous-zones](#pièces-et-sous-zones), [Panneaux](#panneaux) |
| `legend` | [Réglages généraux](#réglages-généraux) |
| `level` | [Pièces et sous-zones](#pièces-et-sous-zones), [Calques](#calques), [Ouvertures](#ouvertures), [Pastilles d'appareils](#pastilles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles](#meubles), [Alertes plein plan](#alertes-plein-plan) |
| `light` | [Animations](#animations), [Lumière](#lumière) |
| `light_color` | [Pastilles d'appareils](#pastilles-dappareils) |
| `lock_view` | [Interaction](#interaction) |
| `locked` | [Calques](#calques), [Conventions](#conventions) (sur un élément) |
| `margin` | [Réglages généraux](#réglages-généraux) |
| `marker` | [Jour et nuit](#jour-et-nuit) |
| `max` | [Widgets](#widgets), [Widget `gauge`](#widget-gauge), [Réglages généraux](#réglages-généraux) |
| `min` | [Widgets](#widgets), [Widget `gauge`](#widget-gauge), [Réglages généraux](#réglages-généraux) |
| `mirror` | [Meubles](#meubles) |
| `month` | [Widget `periods`](#widget-periods) |
| `moon` | [Lumière](#lumière) |
| `more_info` | [Fiches](#fiches) |
| `name` | [Puces de résumé](#puces-de-résumé), [Pièces et sous-zones](#pièces-et-sous-zones), [Widgets](#widgets), [Widget `periods`](#widget-periods), [Ouvertures](#ouvertures), [Pastilles d'appareils](#pastilles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles](#meubles), [Groupes](#groupes), [Modèles](#modèles), [Alertes plein plan](#alertes-plein-plan), [Réglages généraux](#réglages-généraux), [Étages](#étages-et-image-de-fond) |
| `new_line` | [Puces de résumé](#puces-de-résumé) |
| `north` | [Ambiance](#ambiance) |
| `note` | [Widgets](#widgets), [Widget `periods`](#widget-periods) |
| `opacity` | [Image de fond](#image-de-fond) |
| `opening` | [Animations](#animations) |
| `openings` | [Racine de la carte](#racine-de-la-carte), [Ouvertures](#ouvertures) |
| `outside` | [Pièces et sous-zones](#pièces-et-sous-zones), [Widgets](#widgets), [Widget `climate`](#widget-climate), [Ouvertures](#ouvertures) |
| `outward` | [Ouvertures](#ouvertures) |
| `overhang` | [Ouvertures](#ouvertures) |
| `overhang_height` | [Ouvertures](#ouvertures) |
| `overlay_order` | [Calques](#calques) |
| `palette` | [Racine de la carte](#racine-de-la-carte) |
| `panels` | [Pièces et sous-zones](#pièces-et-sous-zones), [Panneaux](#panneaux), [Racine de la carte](#racine-de-la-carte), [Tablette murale](#tablette-murale), [Étages](#étages-et-image-de-fond) |
| `people` | [Personnes](#personnes), [Ambiance](#ambiance) |
| `period` | [Widgets](#widgets), [Widget `tariff`](#widget-tariff) |
| `periods` | [Widgets](#widgets), [Widget `periods`](#widget-periods) |
| `persons` | [Personnes](#personnes) |
| `plugged` | [Widgets](#widgets), [Widget `ev`](#widget-ev) |
| `points` | [Meubles personnalisés](#meubles-personnalisés) |
| `poly` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `pos` | [Pastilles d'appareils](#pastilles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles](#meubles), [Exemples sous le plan](#exemples-sous-le-plan), [Image de fond](#image-de-fond) |
| `power` | [Widgets](#widgets), [Widget `ev`](#widget-ev) |
| `presence` | [Puces de résumé](#puces-de-résumé), [Alertes plein plan](#alertes-plein-plan), [Réglages généraux](#réglages-généraux) |
| `price` | [Widgets](#widgets), [Widget `tariff`](#widget-tariff) |
| `protected` | [Ouvertures](#ouvertures), [Fiches](#fiches), [Pastilles d'appareils](#pastilles-dappareils), [Meubles connectés](#meubles-connectés) |
| `radius` | [Meubles personnalisés](#meubles-personnalisés) |
| `range` | [Widgets](#widgets), [Widget `ev`](#widget-ev) |
| `replay` | [Racine de la carte](#racine-de-la-carte), [Revoir la journée](#revoir-la-journée) |
| `reset_after` | [Interaction](#interaction) |
| `right` | [Pièces et sous-zones](#pièces-et-sous-zones), [Panneaux](#panneaux) |
| `roof_tilt` | [Fenêtre de toit](#fenêtre-de-toit) |
| `room` | [Pastilles d'appareils](#pastilles-dappareils) |
| `room_labels` | [Réglages généraux](#réglages-généraux) |
| `room_tap` | [Interaction](#interaction) |
| `rooms` | [Racine de la carte](#racine-de-la-carte), [Pièces et sous-zones](#pièces-et-sous-zones), [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `rotation` | [Meubles](#meubles), [Image de fond](#image-de-fond) |
| `rows` | [Widgets](#widgets) |
| `seg` | [Ouvertures](#ouvertures) |
| `session_cost` | [Widgets](#widgets), [Widget `ev`](#widget-ev) |
| `severity` | [Widgets](#widgets), [Widget `gauge`](#widget-gauge) |
| `session_kwh` | [Widgets](#widgets), [Widget `ev`](#widget-ev) |
| `shape` | [Animations](#animations), [Meubles](#meubles) |
| `short` | [Étages](#étages-et-image-de-fond) |
| `show` | [Puces de résumé](#puces-de-résumé), [Image de fond](#image-de-fond) |
| `show_furniture` | [Réglages généraux](#réglages-généraux) |
| `showcase` | [Racine de la carte](#racine-de-la-carte), [Exemples sous le plan](#exemples-sous-le-plan) |
| `shutter` | [Ouvertures](#ouvertures), [Animations](#animations) |
| `shutter_animation` | [Animations](#animations), [Ouvertures](#ouvertures) |
| `shutter_only` | [Ouvertures](#ouvertures) |
| `sill` | [Ouvertures](#ouvertures) |
| `slats` | [Ouvertures](#ouvertures) |
| `sill_height` | [Fenêtre de toit](#fenêtre-de-toit) |
| `size` | [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles](#meubles), [Style des pastilles](#style-des-pastilles) |
| `source` | [Widget `periods`](#widget-periods), [Flux d'énergie](#flux-dénergie) |
| `spacing` | [Widgets](#widgets), [Widget `divider`](#widget-divider) |
| `speed` | [Revoir la journée](#revoir-la-journée) |
| `stable_h` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `stable_t` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `stat` | [Widget `periods`](#widget-periods) |
| `state` | [Alertes plein plan](#alertes-plein-plan) |
| `style` | [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles personnalisés](#meubles-personnalisés) |
| `sub_area` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `summary` | [Racine de la carte](#racine-de-la-carte), [Puces de résumé](#puces-de-résumé), [Tablette murale](#tablette-murale) |
| `sun` | [Jour et nuit](#jour-et-nuit), [Lumière](#lumière) |
| `swing` | [Ouvertures](#ouvertures) |
| `t_max` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `t_min` | [Widgets](#widgets), [Widget `climate`](#widget-climate) |
| `tablet` | [Racine de la carte](#racine-de-la-carte), [Tablette murale](#tablette-murale) |
| `tap` | [Pièces et sous-zones](#pièces-et-sous-zones), [Ouvertures](#ouvertures), [Fiches](#fiches), [Pastilles d'appareils](#pastilles-dappareils), [Meubles connectés](#meubles-connectés) |
| `target` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `temperature` | [Pièces et sous-zones](#pièces-et-sous-zones), [Réglages généraux](#réglages-généraux) |
| `temperature_attribute` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `temperature_tint` | [Réglages généraux](#réglages-généraux) |
| `templates` | [Racine de la carte](#racine-de-la-carte), [Modèles](#modèles) |
| `text` | [Textes et zones d'informations](#textes-et-zones-dinformations) |
| `texts` | [Racine de la carte](#racine-de-la-carte), [Textes et zones d'informations](#textes-et-zones-dinformations) |
| `threshold` | [Widgets](#widgets), [Widget `ev`](#widget-ev), [Pastilles d'appareils](#pastilles-dappareils), [Meubles connectés](#meubles-connectés), [Flux d'énergie](#flux-dénergie) |
| `tint` | [Meubles](#meubles) |
| `title` | [Racine de la carte](#racine-de-la-carte), [Widgets](#widgets), [Widget `divider`](#widget-divider), [Fiches](#fiches) |
| `traces` | [Traces](#traces), [Ambiance](#ambiance) |
| `type` | [Racine de la carte](#racine-de-la-carte), [Puces de résumé](#puces-de-résumé), [Widgets](#widgets), [Ouvertures](#ouvertures), [Animations](#animations), [Meubles](#meubles), [Modèles](#modèles), [Alertes plein plan](#alertes-plein-plan) |
| `unavailable` | [Style des pastilles](#style-des-pastilles) |
| `unit` | [Puces de résumé](#puces-de-résumé), [Widgets](#widgets), [Widget `gauge`](#widget-gauge), [Widget `tile`](#widget-tile), [Widget `periods`](#widget-periods), [Pastilles d'appareils](#pastilles-dappareils), [Textes et zones d'informations](#textes-et-zones-dinformations), [Meubles connectés](#meubles-connectés) |
| `value` | [Pastilles d'appareils](#pastilles-dappareils), [Meubles connectés](#meubles-connectés) |
| `values` | [Style des pastilles](#style-des-pastilles) |
| `view_button` | [Calques](#calques) |
| `view_layout` | [Clés Home Assistant conservées](#clés-home-assistant-conservées) |
| `visibility` | [Clés Home Assistant conservées](#clés-home-assistant-conservées) |
| `w` | [Meubles personnalisés](#meubles-personnalisés) |
| `walls` | [Racine de la carte](#racine-de-la-carte), [Murs](#murs) |
| `weather` | [Météo](#météo), [Ambiance](#ambiance) |
| `week` | [Widget `periods`](#widget-periods) |
| `when_away` | [Alertes plein plan](#alertes-plein-plan) |
| `widgets` | [Fiches](#fiches) |
| `width` | [Exemples sous le plan](#exemples-sous-le-plan), [Image de fond](#image-de-fond) |
| `x` | [Meubles personnalisés](#meubles-personnalisés) |
| `y` | [Meubles personnalisés](#meubles-personnalisés) |
| `year` | [Widget `periods`](#widget-periods) |
| `zoom` | [Pièces et sous-zones](#pièces-et-sous-zones) |
| `zoom_only` | [Pastilles d'appareils](#pastilles-dappareils), [Style des pastilles](#style-des-pastilles) |

## Valeurs énumérées

Chaque valeur énumérée, par clé.

`<widget>` désigne n'importe quel widget : dans `panels.left` / `panels.right`, dans les `panels` d'une pièce, dans une `card` ou dans un modèle de widget (`templates[].items`) ; `<person>` un id d'entité `person.*`.


| Chemin(s) de clé | Valeurs |
|---|---|
| `<widget>.columns[].source` | `stat` `entities` |
| `<widget>.periods[]` | `day` `week` `month` `year` |
| `<widget>.type` | `tariff` `ev` `gauge` `tile` `entities` `periods` `divider` `cover` `lock` `thermostat` `climate` |
| `alerts[].level` | `critical` `warning` `info` |
| `alerts[].type` | `openings` |
| `ambience.energy.source`<br>`furniture[].type`<br>`templates[].type` | `sofa` `corner_sofa` `armchair` `coffee_table` `tv_unit` `shelf` `rug` `plant` `fireplace` `square_table` `rect_table` `round_table` `chair` `counter` `sink` `hob` `fridge` `washing_machine` `dishwasher` `single_bed` `double_bed` `crib` `nightstand` `wardrobe` `dresser` `desk` `shower` `bathtub` `washbasin` `toilet` `boiler` `water_heater` `radiator` `electrical_panel` `router` `ev_charger` `heat_pump` `car` `bike` `tree` `pool` `area` `rect` `circle` `stairs` `skylight` `custom` |
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
| `floor_selector` | `elevator` `tabs` |
| `floors[].background.show`<br>`background.show` | `editor` `always` |
| `furniture[].shape[].kind`<br>`templates[].item.shape[].kind` | `rect` `rounded_rect` `ellipse` `line` `polygon` |
| `furniture[].shape[].style`<br>`templates[].item.shape[].style` | `filled` `outline` `dashed` |
| `interaction.room_tap` | `room_view` `more_info` `none` |
| `layers.drawing_order[]`<br>`layers.hidden[]`<br>`layers.locked[]`<br>`layers.overlay_order[]` | `rooms` `sub_areas` `halos` `furniture` `fences` `walls` `openings` `room_labels` `area_labels` `badges` `texts` |
| `openings[].type` | `window` `door` `gate` |
| `openings[].swing`<br>`templates[].item.swing` | `left` `right` `sliding` |
| `rooms[].actions[].target` | `room` |
| `show_furniture` | `desktop` |
| `summary[].show` | `away` `home` |
| `summary[].type` | `openings` `lights` `shutters` `temperature` `entity` |
| `templates[].kind` | `widget` `furniture` `badge` `opening` |
| `templates[].category` | `living` `dining` `kitchen` `bedroom` `bathroom` `utility` `shapes` `outdoor` |
| `texts[].style` | `subtle` |

Non traduites, mais restreintes par la carte :

| Clé | Valeurs |
|---|---|
| `language` | `auto` `en` `fr` (texte libre ; toute autre valeur = `auto`) |
| `show_furniture` | `true` `false` `desktop` |
| `replay.speed` | `60` `300` `900` `3600` (nombres) |
| `openings[].outside` | `[-1, 0]` `[1, 0]` `[0, -1]` `[0, 1]` |
