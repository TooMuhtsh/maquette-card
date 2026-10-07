# Maquette

🇬🇧 [English version](README.md)

**Un plan de maison vivant pour Home Assistant.**

Maquette est une carte Lovelace (custom card) qui montre votre logement vu de dessus, en direct : les lumières
allumées avec leur halo dans la pièce, les fenêtres ouvertes en rouge, les volets à leur vraie position, chaque pièce
teintée selon sa température, l'énergie qui circule vers les appareils qui consomment. Le plan se dessine directement
dans votre tableau de bord grâce à un éditeur intégré, façon logiciel de plan : pas d'image à préparer, pas d'outil
externe.

> **La première version (0.1.0) est en cours de finalisation : le code sera publié dans ce dépôt très bientôt.**
> Interface en français et en anglais (elle suit la langue de votre profil Home Assistant).

![Maquette : plan en direct, thème sombre](images/plan-pc-sombre.png)

## Fonctionnalités

- **Plan en direct** : halos des lumières limités à leur pièce, portes / fenêtres / portails en rouge quand ils sont
  ouverts, volets dessinés selon leur position et animés pendant le mouvement, pièces teintées selon la température
  avec l'humidité dans l'étiquette, meubles connectés (borne de recharge, frigo, TV, tableau électrique…) avec leur
  puissance.
- **Fiches au toucher** : chaque meuble, bulle d'appareil ou ouverture peut ouvrir sa propre fiche composée de widgets
  (voiture électrique, commande de volet / portail avec confirmation, courbes, compteurs), remplie automatiquement à
  partir de l'appareil.
- **Vue pièce** : un toucher sur une pièce pour zoomer dessus, avec des boutons automatiques (tout éteindre, volets),
  vos propres boutons, les scènes, les appareils avec interrupteurs et les automatisations liées.
- **Puces de résumé, bulles et zones d'informations** : puces personnalisables au-dessus du plan (n'importe quelle
  entité, règles d'alerte), bulles sur le plan et encadrés de valeurs en direct.
- **Panneaux latéraux** : tarif en direct (couleurs Tempo), voiture électrique, jauge, tuile avec courbe sur 24 h,
  thermostat, climat des pièces, tableaux jour / semaine / mois / année à partir des statistiques longue durée de
  Home Assistant.
- **Ambiance** : facultative et discrète par défaut. Jour / nuit d'après `sun.sun` avec la lumière venant du vrai côté
  du soleil, vraie météo de Home Assistant sur les extérieurs (nuages, pluie, neige, grêle, brouillard, orage, vent),
  traces qui s'estompent de ce qui vient de changer, flux d'énergie animés, personnes à la maison ou absentes dans leur
  vraie direction.
- **Alertes plein plan** : fumée, fuite d'eau, ouverture alors que personne n'est là, congélateur trop chaud : voile
  pulsant, bandeau, éléments entourés.
- **Revoir la journée (replay)** : tout le plan, panneaux compris, redessiné à n'importe quel moment des 1 à 72
  dernières heures, avec une frise, des vitesses de ×60 à ×3600 et des repères pour les ouvertures, les lumières et
  les arrivées.
- **Éditeur intégré** (administrateurs seulement) : murs, limites, ouvertures, pièces et sous-zones, 45 symboles de
  meubles vus de dessus, calques, groupes, aimantation, sélection multiple, annuler / rétablir, import des pièces de
  Home Assistant avec leurs appareils, modèles, export et import YAML / JSON ; enregistrement direct dans la
  configuration du tableau de bord.
- **Panneau ⚙ Paramètres** : tous les réglages de fonctionnement au même endroit (langue, affichage, personnes, bulles,
  interaction, mode tablette murale, niveau d'animation…).
- **Démo intégrée** : un appartement simulé où tout fonctionne et où rien ne touche à votre maison (`demo: true`, ou la
  carte et le tableau de bord « Maquette — démo »).
- **Material Design 3**, thèmes clair et sombre, téléphone et PC (pleine page sans barre de défilement sur PC, panneaux
  en bas d'écran et zoom à deux doigts sur téléphone).

## Simple à mettre en place : dessinez votre maison dans la carte

Pas d'image de plan à préparer, pas d'outil externe, pas de YAML à écrire : tout se passe dans l'éditeur intégré,
directement sur votre tableau de bord (bouton en haut à droite de la carte).

**1. Partez de vos pièces Home Assistant.** Sur un plan vide, *Démarrer avec mes pièces* crée une pièce par pièce de
Home Assistant, avec ses appareils prêts à placer. Vous pouvez aussi dessiner une pièce vous-même ou importer un plan
existant.

![Plan vide : partir de ses pièces, dessiner une pièce ou importer un plan](images/editeur-vide-pc-clair.png)

**2. Dessinez les pièces.** L'outil rectangle trace une pièce et ses murs d'un seul geste ; tapez la largeur × la
hauteur en centimètres pour une taille exacte. Les murs communs restent communs quand vous redimensionnez une pièce, et
tout s'aimante à la grille.

**3. Placez portes, fenêtres et volets.** Le panneau de la pièce liste les ouvertures de cette pièce qui ne sont pas
encore sur le plan : un clic, puis un clic sur le mur où elle se trouve.

**4. Meublez.** Glissez l'un des 45 symboles du catalogue (canapés, lits, cuisine, borne de recharge, voiture…) ; les
meubles s'aimantent aux murs et se redimensionnent par leurs coins. Reliez un meuble à un appareil et sa fiche se
remplit toute seule à partir de cet appareil.

| Catalogue | Glisser, aimanter, redimensionner |
|---|---|
| ![Catalogue des meubles vus de dessus, avec recherche](images/editeur-catalogue-pc-sombre.png) | ![Un canapé glissé dans l'éditeur](images/editeur.gif) |

**5. Enregistrez.** Le plan est stocké dans la configuration de votre tableau de bord, comme n'importe quelle carte.
Annuler / rétablir, groupes, calques, sélection multiple et export YAML / JSON sont là quand vous en avez besoin.

![Réglage d'un meuble : taille, orientation, appareil connecté](images/editeur-pc-sombre.png)

> Les captures viennent de l'appartement de démonstration fourni avec la carte.

## Captures

| Ambiance | Replay | Éditeur |
|---|---|---|
| ![Du jour à la nuit, les lumières s'allument](images/jour-nuit.gif) | ![Replay de la soirée](images/replay.gif) | ![Un canapé glissé dans l'éditeur](images/editeur.gif) |

| Fiche au toucher | Vue pièce | Alerte plein plan |
|---|---|---|
| ![Fiche de la borne de recharge](images/fiche-borne-pc-sombre.png) | ![Vue du séjour](images/piece-pc-sombre.png) | ![Alerte fumée](images/alerte.gif) |

| Météo | Flux d'énergie | Téléphone (clair / sombre) |
|---|---|---|
| ![Pluie, neige et orage sur le balcon](images/meteo.gif) | ![L'énergie part du tableau électrique](images/energie.gif) | ![Téléphone, thème clair](images/mobile-clair.png) |

## Installation

### HACS (dépôt personnalisé)

1. HACS → ⋮ → **Dépôts personnalisés** → ajoutez `https://github.com/TooMuhtsh/maquette-card`, catégorie **Dashboard**.
2. Installez **Maquette**, puis rechargez votre navigateur.

### Manuelle

1. Copiez `dist/maquette-card.js` dans `/config/www/maquette-card.js`.
2. Paramètres → Tableaux de bord → ⋮ → **Ressources** → ajoutez `/local/maquette-card.js` en tant que **module
   JavaScript**.

## Premiers pas

Créez un nouveau tableau de bord **Maquette** (vierge) ou **Maquette — démo**, ou ajoutez la carte ; elle est à son
meilleur seule dans une vue de type **panneau** :

```yaml
type: custom:maquette-card
title: Ma maison
```

Cliquez ensuite sur le bouton d'édition en haut à droite de la carte et dessinez, ou partez de vos pièces
Home Assistant. Les clés de configuration sont en anglais ; la référence complète est dans
[docs/configuration.md](docs/configuration.md) (en anglais).

## Où en est le projet

Projet jeune, en développement actif (première version 0.1.0 très bientôt). Les retours et les signalements de bugs
sont les bienvenus, en français comme en anglais : ouvrez une *issue*, ou venez aider à améliorer la traduction
française !
Feuille de route : éditeur visuel dans l'éditeur de cartes standard de Lovelace, image de fond (plan scanné) sous le
dessin.

## Réalisé avec Claude Code

Maquette est développé avec [Claude Code](https://claude.com/claude-code), l'assistant de programmation d'Anthropic :
le code est écrit avec Claude Code sous la direction de l'auteur, et chaque fonctionnalité est testée sur une vraie
maison.

## Licence

[MIT](LICENSE).
