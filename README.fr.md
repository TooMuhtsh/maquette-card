# Maquette

🇬🇧 [English version](README.md)

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/docs/faq/custom_repositories/)
[![Release](https://img.shields.io/github/v/release/TooMuhtsh/maquette-card)](https://github.com/TooMuhtsh/maquette-card/releases)
[![Licence : MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Un plan de maison vivant pour Home Assistant.**

Maquette est une carte Lovelace qui montre votre logement vu de dessus, en direct : les lumières allumées avec leur halo,
les fenêtres ouvertes en rouge, les volets à leur vraie position, les pièces teintées selon leur température, l'énergie
qui circule vers les appareils. Le plan se dessine directement dans votre tableau de bord avec l'éditeur intégré :
pas d'image de plan, pas d'outil externe, pas de YAML.

![Maquette : l'appartement de démonstration en direct, thème sombre](images/plan-pc-dark.png)

## Bêta 0.2.0

La prochaine version est sortie en bêta, sur la branche `dev`. Le gros morceau, c'est la lumière : le soleil et le ciel
qui entrent par les fenêtres (volets et météo compris), la lune la nuit, et des halos de lampes qui mélangent leurs
couleurs. L'éditeur a aussi perdu son panneau latéral : chaque élément s'ouvre maintenant dans sa propre fenêtre, avec
un aperçu en direct. Elle tourne sur mon propre tableau de bord, mais ça reste une bêta : si quelque chose cloche,
dites-le-moi dans les [issues](https://github.com/TooMuhtsh/maquette-card/issues). Le détail est sur le wiki :
[Nouveautés de la 0.2.0](https://github.com/TooMuhtsh/maquette-card/wiki/Home-FR#nouveautés-de-la-020).

| Lumière du jour | Nuit |
|---|---|
| ![Lumière du jour dans l'appartement de démo : taches de soleil et lumière du ciel derrière les fenêtres](images/light-day-pc-dark.png) | ![Nuit dans l'appartement de démo : lune et halos de lampes colorés](images/light-night-pc-dark.png) |

**Essayer la bêta avec HACS** (Maquette déjà installée par HACS) :

1. Paramètres → Appareils et services → **HACS** → appareil **Maquette** → entité **Pre-release**. Elle est
   désactivée par défaut : activez-la, puis allumez-la.
2. HACS propose alors `v0.2.0-beta.1` comme mise à jour de Maquette. Installez-la et rechargez le navigateur.

Sans l'interrupteur : HACS → Maquette → ⋮ → **Retélécharger** → *Need a different version?* → `v0.2.0-beta.1`.
Pour revenir en arrière, éteignez l'interrupteur et retéléchargez `v0.1.0` de la même façon. Installation manuelle :
prenez `maquette-card.js` dans la [release v0.2.0-beta.1](https://github.com/TooMuhtsh/maquette-card/releases/tag/v0.2.0-beta.1).

## Fonctionnalités

- **Plan en direct** : halos des lumières limités à leur pièce, portes et fenêtres en rouge quand elles sont ouvertes,
  volets dessinés selon leur position, pièces teintées selon la température, meubles connectés (borne de recharge,
  frigo, TV…) avec leur puissance.
- **Éditeur intégré** (administrateurs seulement) : murs, pièces, ouvertures, 45 meubles vus de dessus, calques,
  groupes, aimantation, annuler / rétablir, vos pièces Home Assistant et leurs appareils en un clic, une fenêtre
  d'édition avec aperçu en direct pour chaque élément. Enregistrement direct dans la configuration du tableau de bord.
- **Ateliers** : *Créer une ouverture*, *Créer un meuble* (dessinez vos propres meubles à partir de formes) et *Créer
  un widget*, avec un aperçu en direct, enregistrés dans *Mes modèles*.
- **65 widgets prêts à l'emploi** (CO₂, fuite, serrure, voiture, tarif, pH de piscine…) en plus des 11 types de
  widgets, pour les panneaux latéraux et pour la fiche que chaque élément ouvre au toucher. Les entités sont
  pré-remplies depuis Home Assistant.
- **Ambiance** : jour et nuit d'après le soleil, vraie météo sur les extérieurs, traces qui s'estompent de ce qui vient
  de changer, flux d'énergie, personnes à la maison ou absentes dans leur vraie direction, lumière du soleil, du ciel
  et de la lune par les fenêtres. Facultative et discrète.
- **Revoir la journée** : tout le plan, panneaux compris, redessiné à n'importe quel moment des 1 à 72 dernières heures.
- **Nettoyer le plan** : trouve les jours, les bouts de mur, les doublons et les ouvertures à côté de leur mur, et les
  corrige en une seule action annulable.
- **Sécurité** : les actions sensibles (déverrouiller, ouvrir un garage, désarmer, lancer un script…) sont toujours
  confirmées dans un dialogue qui nomme le vrai service ; un plan importé montre ce qu'il peut commander avant d'être
  appliqué.
- Vue pièce, puces de résumé, alertes plein plan, mode tablette murale, panneau ⚙ Paramètres, démo intégrée.
  Material Design 3, clair et sombre, téléphone et PC, français et anglais.

<p>
  <img src="images/plan-phone-light.png" width="22%" alt="Téléphone, thème clair">
  <img src="images/plan-phone-dark.png" width="22%" alt="Téléphone, thème sombre">
  <img src="images/plan-pc-light.png" width="52%" alt="PC, thème clair">
</p>

## Dessinez votre maison dans la carte

Cliquez sur le bouton d'édition en haut à droite de la carte.

1. **Partez de vos pièces.** Sur un plan vide, *Démarrer avec mes pièces* crée une pièce par pièce de Home Assistant,
   avec ses appareils prêts à placer. Ou dessinez une pièce, ou importez un plan.
2. **Dessinez les pièces.** L'outil rectangle (**R**) trace une pièce et ses murs en deux clics, aimantés à la grille.
   Réglez ensuite la largeur et la hauteur exactes dans la fenêtre d'édition de la pièce. Les murs communs restent communs quand
   une pièce est redimensionnée.
3. **Placez portes et fenêtres.** La fenêtre d'édition de la pièce liste les ouvertures de cette pièce pas encore sur le plan :
   un clic dessus, puis un clic sur le mur. Les capteurs sont reliés depuis la pièce.
4. **Meublez.** Choisissez un symbole dans *Ajouter › Meubles* ; il s'aimante aux murs. Reliez-le à un appareil et sa
   fiche se remplit toute seule.
5. **Enregistrez.** Le plan est stocké dans le tableau de bord comme n'importe quelle carte.

![Deux pièces dessinées, puis des meubles posés](images/draw-your-home.gif)

| Plan vide | Fenêtre d'édition et son aperçu | Créer un meuble |
|---|---|---|
| ![Démarrer avec mes pièces, dessiner une pièce ou importer un plan](images/empty-editor-pc-light.png) | ![Fenêtre d'édition d'une pièce, avec son aperçu en direct](images/editor-room-dialog-pc-dark.png) | ![Atelier des meubles : formes et aperçu](images/create-furniture-pc-light.png) |

| 65 widgets prêts à l'emploi | Nettoyer le plan |
|---|---|
| ![Ajouter un widget : types de base et widgets prêts par catégorie](images/add-widget-pc-light.png) | ![Défauts entourés, corrections à cocher](images/cleanup-pc-dark.png) |

## Captures

| Du jour à la nuit | Fiche au toucher | Vue pièce |
|---|---|---|
| ![Coucher du soleil, les lumières s'allument](images/day-night.gif) | ![Fiche de la borne de recharge](images/card-ev-pc-light.png) | ![Vue du séjour](images/room-view-pc-dark.png) |

| Revoir la journée | Alerte plein plan | Confirmation d'une action sensible |
|---|---|---|
| ![Replay avec sa frise](images/replay-pc-dark.png) | ![Alerte fumée](images/alert-pc-dark.png) | ![Un bouton « Lights » qui déverrouille en réalité la porte](images/confirm-dialog-pc-dark.png) |

| Vérifier avant d'importer |
|---|
| ![Services, valeurs retirées et clés ignorées d'un plan importé](images/import-check-pc-light.png) |

Les captures viennent de l'appartement de démonstration intégré, en anglais ; l'interface suit la langue de votre
profil Home Assistant (français ou anglais).

## Prérequis

- Home Assistant **2023.9** ou plus récent.
- Un navigateur récent ou l'application compagnon : **Chrome / Edge 111+, Safari 16.4+, Firefox 121+**.
- Un compte **administrateur** Home Assistant pour modifier le plan. Les autres utilisateurs le voient et s'en servent.

## Installation

### HACS (dépôt personnalisé)

[![Ouvrir dans HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=TooMuhtsh&repository=maquette-card&category=plugin)

1. HACS → ⋮ → **Dépôts personnalisés** → ajoutez `https://github.com/TooMuhtsh/maquette-card`, type **Dashboard**.
2. Téléchargez **Maquette**, puis rechargez le navigateur.

### Manuelle

1. Téléchargez `maquette-card.js` depuis la [dernière version](https://github.com/TooMuhtsh/maquette-card/releases/latest).
2. Copiez-le dans `/config/www/maquette-card.js`.
3. Paramètres → Tableaux de bord → ⋮ → **Ressources** → ajoutez `/local/maquette-card.js` en tant que **module
   JavaScript**.

## Premiers pas

Ajoutez la carte **Maquette** (idéalement seule dans une vue de type **Panneau**), ou créez un tableau de bord
**Maquette** :

```yaml
type: custom:maquette-card
title: Ma maison
```

Cliquez ensuite sur le bouton d'édition et dessinez. Pour faire le tour d'abord, ajoutez la carte **Maquette — démo** :
un appartement simulé où tout fonctionne et où rien ne touche à votre maison.

## Documentation

Tout le reste est dans le **[wiki](https://github.com/TooMuhtsh/maquette-card/wiki/Home-FR)** : premiers pas, guide de
l'éditeur, entités, widgets, ambiance, recettes, FAQ, [sécurité](https://github.com/TooMuhtsh/maquette-card/wiki/Security-FR)
et la [référence de configuration](docs/reference.fr.md) complète (les clés de configuration sont en anglais).
Les changements sont dans le [CHANGELOG](CHANGELOG.md) ; pour signaler une faille, voir [SECURITY.md](SECURITY.md).

Retours, signalements de bugs et aide à la traduction sont les bienvenus dans les
[issues](https://github.com/TooMuhtsh/maquette-card/issues), en français comme en anglais.

Réalisé avec [Claude Code](https://claude.com/claude-code) sous la direction de l'auteur, et testé sur une vraie maison.

## Licence

[MIT](LICENSE).
