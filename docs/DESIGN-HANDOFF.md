# Passation de design — direction « Modern Product Launch »

Spécification d'implémentation pour adopter, sur l'ensemble de CampusPath, le langage
visuel du template Figma Community « Modern Product Launch » (Figma Sites, tags
Landing page et SaaS).

Date : 2026-09-18.

## 1. Provenance et limites

Ce document est dérivé des **quatre aperçus publiés** de la page Community, pas du
fichier Figma lui-même. Le fichier n'a pas été ouvert ni dupliqué, et aucun
connecteur Figma n'est branché sur cette session. Les valeurs ci-dessous sont donc
une **reconstruction**, pas une extraction.

Conséquence pratique. Les tokens de cette spécification font foi pour
l'implémentation, et ils sont cohérents entre eux. Ils ne prétendent pas
reproduire au pixel les variables du fichier d'origine.

Deux façons d'obtenir les valeurs exactes si tu en as besoin.

- Dupliquer le template dans ton compte Figma, puis exporter les variables.
- Brancher le connecteur Figma, qui expose `get_variable_defs` et `get_metadata`.
  Il apparaît dans le registre mais n'est pas installé.

Ce qui a été observé, écran par écran.

| Aperçu | Contenu | Motifs à retenir |
| --- | --- | --- |
| 1 | Héros « Browse everything. » | Nav pilule, titre serif, capture produit dans un cadre arrondi, bloc vert sauge en fond, statistique en surimpression |
| 2 | « We've cracked the code. » | Surtitre capitales, titre serif, grille de 4 bénéfices, icônes en trait fin, bandeau photo pleine largeur |
| 3 | « See the Big Picture » | Section 50/50, liste numérotée 01 à 04 avec amorce en gras, bouton pilule sauge, image sable arrondie |
| 4 | « Connect with us » | Bandeau photo, appel à l'action centré, bouton pilule vert foncé, pied de page avec liens et une pilule |

## 2. Ce que cette direction change chez nous

Elle remplace la proposition éditoriale du canevas précédent. Les points communs
restent (fond chaud, titrage serif, accent vert), trois choses changent.

| Sujet | Canevas précédent | Cette direction |
| --- | --- | --- |
| Accent secondaire | Ocre `#C08A2E` | Supprimé. Le vert porte seul l'accent, l'ocre ne sert plus qu'aux avertissements |
| Rayons | Aucun, sauf les cercles de la carte | Pilules pour les actions, 20 px pour les médias, 12 px pour les surfaces |
| Serif d'affichage | Fraunces | Instrument Serif, plus proche du contraste élevé du template |

Ce qui reste du canevas et n'est pas remis en cause. Les filets d'un pixel plutôt
que des ombres portées, l'index de parcours en lignes plutôt qu'en tuiles, la carte
de parcours dessinée, les chiffres comme ancres de lecture, et les sources datées en
pied d'écran.

## 3. Tokens

À déclarer dans `src/app/globals.css` sur `:root`, en remplacement des cinq
variables actuelles (`--ink`, `--muted`, `--blue`, `--line`, `--canvas`).

### Couleur

| Token | Valeur | Usage | Remplace |
| --- | --- | --- | --- |
| `--paper` | `#FBFAF8` | Fond de page, partout | `--canvas #f7f9fc` |
| `--surface` | `#FFFFFF` | Panneaux, modales, lignes actives | — |
| `--ink` | `#17171A` | Titres et texte principal | `--ink #202d47` |
| `--ink-muted` | `#63636A` | Texte secondaire, légendes | `--muted #718096` |
| `--ink-faint` | `#8A8A90` | Texte de 24 px et plus uniquement | — |
| `--line` | `#E6E4DF` | Filets, bordures, séparateurs | `--line #e6eaf1` |
| `--olive` | `#3F5233` | Actions principales, progression, états explorés | `--blue #3159df` |
| `--olive-hover` | `#33422A` | Survol et appui de l'action principale | — |
| `--sage` | `#A8B79A` | Aplats décoratifs, fonds de section | — |
| `--sage-tint` | `#EEF1EA` | Fonds d'encart, badges positifs | — |
| `--sand` | `#D8CDBC` | Réserves d'image, vignettes sans visuel | — |
| `--warning` | `#8A5A10` | Avertissements, dates dépassées | — |
| `--warning-tint` | `#FAF2E2` | Fond des encarts d'avertissement | — |
| `--danger` | `#9E3B22` | Erreurs, refus, champs invalides | — |
| `--danger-tint` | `#FBEDE9` | Fond des encarts d'erreur | — |

Contrastes vérifiés sur `--paper`. `--ink` 18:1, `--ink-muted` 5.4:1,
`--olive` 9.8:1. `--ink-faint` plafonne à 3.3:1, donc **interdit sous 24 px**.
Texte `--paper` sur `--olive` 8.4:1. Texte `--ink` sur `--sage` 8.5:1.

### Typographie

Deux familles, chargées depuis Google Fonts.

```
Instrument Serif : 400 (une seule graisse, c'est voulu)
Archivo          : 400, 500, 600
```

| Token | Famille | Taille / interligne | Usage |
| --- | --- | --- | --- |
| `--type-display-xl` | Instrument Serif | 72 / 1.02, `-0.02em` | Héros de la page vitrine |
| `--type-display-l` | Instrument Serif | 54 / 1.06, `-0.015em` | Titre d'écran applicatif |
| `--type-display-m` | Instrument Serif | 38 / 1.12, `-0.01em` | Titre de section |
| `--type-display-s` | Instrument Serif | 26 / 1.2 | Titre de panneau, ligne d'index |
| `--type-numeral` | Instrument Serif | 20 / 1 | Chiffres 01 à 05, compteurs |
| `--type-eyebrow` | Archivo 500 | 11 / 1, `0.18em`, capitales | Surtitres |
| `--type-body-l` | Archivo 400 | 17 / 1.6 | Chapô, texte de section |
| `--type-body` | Archivo 400 | 15 / 1.6 | Texte courant |
| `--type-body-s` | Archivo 400 | 13 / 1.55 | Listes denses, métadonnées |
| `--type-caption` | Archivo 400 | 12 / 1.5 | Mentions, sources, notes |
| `--type-label` | Archivo 500 | 14 / 1.2 | Boutons, onglets, navigation |

Règle de titrage reprise du template. Les titres sont en phrase, pas en capitales,
et se terminent par un point. « Ton avenir mérite un chemin qui te ressemble. »

Le corps de texte ne descend jamais sous 12 px. Les chiffres du corps utilisent
`font-variant-numeric: tabular-nums` dans les tableaux et les compteurs.

### Espacement, rayon, trait

| Token | Valeur | Usage |
| --- | --- | --- |
| `--space-1` … `--space-9` | 4, 8, 12, 16, 24, 32, 48, 64, 96 | Échelle unique, rien entre deux crans |
| `--radius-pill` | `999px` | Boutons, onglets actifs, badges |
| `--radius-media` | `20px` | Images, captures, cadres de démonstration |
| `--radius-surface` | `12px` | Panneaux, modales, encarts |
| `--radius-control` | `8px` | Champs de formulaire, sélecteurs |
| `--border-hairline` | `1px solid var(--line)` | Séparation par défaut |
| `--border-strong` | `2px solid var(--ink)` | Filet de tête de section |

Aucune ombre portée. Le template n'en utilise pas. La profondeur vient des filets
et des aplats. Les variables d'ombre existantes sont supprimées.

## 4. Grille et points de rupture

| Rupture | Largeur | Grille | Gouttière | Marge |
| --- | --- | --- | --- | --- |
| Large | ≥ 1280 px | 12 colonnes | 24 px | 64 px |
| Bureau | 1024 à 1279 px | 12 colonnes | 24 px | 48 px |
| Tablette | 768 à 1023 px | 8 colonnes | 20 px | 32 px |
| Mobile | < 768 px | 4 colonnes | 16 px | 20 px |

Largeur maximale du contenu vitrine 1200 px, centrée. L'application reste en pleine
largeur avec la barre latérale.

Les media queries actuelles sont à 1080, 900 et 640 px dans `orientation.css`. Elles
sont repliées sur cette échelle pendant la migration.

## 5. Composants

| Composant | Variantes | Spécification | Fichier |
| --- | --- | --- | --- |
| Bouton principal | — | Pilule, fond `--olive`, texte `--paper`, hauteur 48 px, padding `0 28px`, `--type-label` | `globals.css` `.button.primary` |
| Bouton secondaire | — | Pilule, fond transparent, bordure `--border-hairline`, texte `--ink`, mêmes métriques | `.button` |
| Bouton discret | — | Sans bordure, texte `--ink-muted`, soulignement au survol | `.button.ghost` |
| Lien texte | — | Texte `--ink`, soulignement `--olive` au survol, jamais de couleur au repos | `.text-link` |
| Surtitre | — | `--type-eyebrow`, couleur `--olive` | nouveau `.eyebrow` |
| Badge d'état | vérifié, à vérifier, manquant, incohérent | Pilule, 11 px, fond teinté, texte de la même famille foncée | `.badge` |
| Encart | neutre, avertissement, erreur, succès | Fond teinté, `--border-hairline` de la même teinte, `--radius-surface`, padding `--space-5`. Pas de barre colorée à gauche | `.notice` |
| Panneau | — | Fond `--surface`, `--radius-surface`, `--border-hairline`, aucune ombre | `.panel` |
| Ligne d'index | par défaut, survol, enregistrée | Ligne de tableau séparée par `--border-hairline`, numéro en `--type-numeral` couleur `--olive` | `orientation.css` `.orient-card` devient `.orient-row` |
| Nœud de carte | à explorer, exploré, actif | Cercle 48 px. À explorer, bordure `--line`. Exploré, fond `--olive`, texte `--paper`. Actif, anneau `--olive` de 3 px à 12 % | `.orient-node` |
| Voie de carte | par défaut, active | Pilule, bordure pointillée `--line`, texte `--ink` | `.orient-branches button` |
| Grille de bénéfices | 4, 3 ou 2 colonnes | Colonnes sans encadré, icône en trait fin 24 px, titre `--type-label`, texte `--type-body-s` | vitrine, nouveau |
| Liste numérotée | — | `01` à `04` en `--type-numeral` `--olive`, amorce en Archivo 600, suite en `--ink-muted` | vitrine et inspecteur |
| Réserve d'image | — | Fond `--sand`, `--radius-media`, ratio 4/3 par défaut | documents, formations |
| Champ | repos, focus, erreur, désactivé | `--radius-control`, bordure `--line`. Focus, bordure `--olive` et anneau 3 px à 12 %. Erreur, bordure `--danger` et message dessous en `--type-caption` | `Field` dans `ui.tsx` |
| Barre de progression | — | Piste 3 px `--line`, remplissage `--olive`, sans rayon | `.progress-line` |
| Modale | standard, large | `--surface`, `--radius-media`, largeur 560 ou 880 px, fond `--ink` à 40 % | `Modal` dans `ui.tsx` |
| Tableau de comparaison | — | Filets uniquement, en-têtes `--type-eyebrow`, cellules `--type-body-s` | `.orient-comparison` |
| Barre latérale | — | Fond `--paper`, filet à droite, élément actif en `--ink` avec pastille `--olive` de 6 px, pas de fond plein | `workspace.css` `.sidebar` |

## 6. États et interactions

| Élément | État | Comportement |
| --- | --- | --- |
| Bouton principal | Survol | Fond `--olive-hover`, transition 120 ms |
| Bouton principal | Appui | Fond `--olive-hover`, translation `1px` vers le bas |
| Bouton principal | Chargement | Texte remplacé par « Un instant… », bouton désactivé, pas de spinner tournant |
| Bouton principal | Désactivé | Opacité 0.45, curseur interdit, pas de changement au survol |
| Tout élément focusable | Focus clavier | Contour `2px solid var(--olive)`, `outline-offset: 3px`. Jamais supprimé |
| Ligne d'index | Survol | Fond `--sage-tint`, la flèche de fin avance de 3 px |
| Ligne d'index | Enregistrée | Marque-page plein `--olive` |
| Nœud de carte | Sélection | Le panneau d'inspection se met à jour, et sous 1024 px la page défile jusqu'à lui et lui donne le focus |
| Onglet | Actif | Texte `--ink`, filet `--olive` de 2 px dessous |
| Champ | Focus | Bordure `--olive`, anneau `0 0 0 3px` `--olive` à 12 % |
| Champ | Erreur | Bordure `--danger`, message en `--danger` sous le champ, `aria-describedby` vers ce message |
| Import de document | En cours | Barre de progression déterminée si la taille est connue, sinon libellé « Envoi en cours » |
| Import de document | Refusé | Encart `--danger` avec la raison exacte renvoyée par l'API, jamais un message générique |

## 7. Responsive

| Rupture | Changements |
| --- | --- |
| ≥ 1280 px | Disposition de référence. Carte de parcours et inspecteur côte à côte, 800 px et 488 px |
| 1024 à 1279 px | Inspecteur passe sous la carte, largeur pleine, il cesse d'être collant |
| 768 à 1023 px | Barre latérale repliée en bandeau supérieur. Grille de bénéfices sur 2 colonnes. Héros sur une colonne |
| < 768 px | Une seule colonne. Titre avant tout élément décoratif. Filtres en défilement horizontal sans barre visible. Tableau de comparaison en défilement horizontal, première colonne figée |

Sur mobile, le contenu passe avant la décoration. Le bloc de chiffres du héros se
place après le titre et le bouton, jamais avant.

## 8. Cas limites

- **Titre long.** Les titres serif ne sont jamais tronqués. Ils passent à la ligne.
  Prévoir trois lignes au héros et deux ailleurs.
- **Résumé long.** Trois lignes maximum dans une ligne d'index, coupure par
  `-webkit-line-clamp`, texte complet sur la fiche.
- **Aucun résultat de filtre.** Titre, une phrase qui dit quoi essayer, et un bouton
  qui remet les filtres à zéro. Jamais une illustration seule.
- **Aucun favori.** Message qui explique le geste du marque-page, pas un vide muet.
- **Chargement.** Squelettes aux dimensions réelles des lignes, pas de spinner
  plein écran. Durée minimale d'affichage 300 ms pour éviter le clignotement.
- **Données manquantes.** Un champ non renseigné affiche « Non renseigné » en
  `--ink-muted`, jamais un tiret seul ni une chaîne vide.
- **Texte international.** Les libellés en darija sont 10 à 25 % plus longs que le
  français. Aucun bouton à largeur fixe, aucun libellé sur une seule ligne forcée.
- **Connexion lente.** Les images de réserve `--sand` s'affichent immédiatement, la
  photo se substitue une fois chargée, sans saut de mise en page.
- **100 éléments et plus.** L'index reste une liste, pagination à 40 lignes, le
  compteur de résultats est annoncé en `aria-live="polite"`.

## 9. Mouvement

| Élément | Déclencheur | Animation | Durée | Courbe |
| --- | --- | --- | --- | --- |
| Bouton, lien, ligne | Survol | Couleur et fond | 120 ms | `cubic-bezier(0.2, 0, 0, 1)` |
| Panneau d'inspection | Changement d'étape | Fondu du contenu | 180 ms | même courbe |
| Modale | Ouverture | Fondu du fond, remontée de 8 px du panneau | 200 ms | même courbe |
| Barre de progression | Mise à jour | Largeur | 240 ms | `ease-out` |
| Squelette | Chargement | Balayage d'opacité 0.6 à 1 | 1200 ms | `ease-in-out` |

Sous `prefers-reduced-motion: reduce`, toutes les transitions passent à 0 ms et le
balayage des squelettes devient une opacité fixe.

## 10. Accessibilité

- Ordre de tabulation. Fil d'Ariane, navigation principale, contenu, puis actions de
  pied de page. Le panneau d'inspection vient après la carte, jamais avant.
- Un lien d'évitement « Aller au contenu » en premier élément focusable.
- La carte de parcours est une `<ol>` de `<button>`. Chaque nœud porte
  `aria-pressed` et `aria-controls` vers l'inspecteur, qui porte `aria-live="polite"`.
- Les boutons à icône seule portent un `aria-label` explicite, marque-page compris,
  avec l'intitulé du parcours dans le libellé.
- Les icônes décoratives portent `aria-hidden="true"`.
- Cible tactile de 44 px minimum, y compris les marque-pages et les onglets de filtre.
- Le contraste ne repose jamais sur la couleur seule. Un état exploré porte un
  changement de forme ou un libellé, pas uniquement le vert.
- Les champs ont tous un `<label>` visible. Le placeholder n'est jamais le libellé.

## 11. Ordre d'application

1. `src/app/globals.css`. Tokens, familles de polices, base typographique, `.button`,
   `.text-link`, focus visible. Rien d'autre ne bouge tant que ce socle n'est pas posé.
2. `src/components/ui.tsx`. `Button`, `Badge`, `Notice`, `Field`, `Modal`, `Progress`,
   `Empty`. Ce sont les primitives, tout le reste en dépend.
3. `src/app/orientation.css`. L'écran le plus abouti, il sert de test grandeur nature.
4. `src/app/workspace.css`. Barre latérale, bandeau supérieur, panneaux, tableaux,
   puis les vues une par une.
5. Nouvelle page vitrine. C'est là que le template s'applique le plus directement,
   héros, bénéfices, liste numérotée, appel à l'action.

Vérification à chaque étape. `npx tsc --noEmit`, `npx eslint src --max-warnings=0`,
puis un rendu de l'écran touché en 1440 px et en 390 px.

## 12. Ce qui n'est pas repris du template

- La capture produit dans un cadre de portable. CampusPath n'a pas de produit à
  montrer en photo, la carte de parcours joue ce rôle.
- Les bandeaux photographiques pleine largeur. Aucune banque d'images n'est
  disponible, et des photos génériques affaibliraient la crédibilité d'un outil
  d'orientation. Remplacés par des aplats `--sage` et `--sand`.
- Le vocabulaire marketing du template. Les titres restent ceux du produit.
