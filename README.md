# Diabete — QG du projet « Diavie »

> **Vision** : quand quelqu'un vit avec le diabète en francophonie, notre marque doit être son réflexe quotidien — pas son médecin, pas son capteur : **son quotidien**.

Ce dépôt contient la stratégie complète **et la v0 fonctionnelle** : le site média avec ses premiers guides, et l'application locale (journal + glucides français). Nom de travail : « Diavie » (à vérifier INPI avant usage public — docs/04).

## Démarrer en 30 secondes

```bash
node site/build.mjs     # construit le site + l'app dans site/dist/ (zéro dépendance, Node ≥ 18)
node site/check.mjs     # vérifie la syntaxe JS et la base d'aliments
npx serve site/dist     # ou n'importe quel serveur statique, pour tester en local
```

Déploiement : connecter le dépôt à **Netlify** (le `netlify.toml` fait tout : build, en-têtes de sécurité, formulaire newsletter via Netlify Forms). L'app est servie sur `/app/`, le site à la racine.

## Ce qu'il y a dans la v0

- **Site média** (`site/`) : landing avec capture email, le kit des 90 premiers jours, 3 guides complets (avion, capteur qui se décolle, restaurant), pages légales, sitemap/SEO — générateur statique maison sans dépendance.
- **App locale** (`app/`) : journal (repas, glycémies, activité, notes), ~210 aliments français avec portions maison, scan de code-barres (Open Food Facts), stats descriptives, export/import JSON, rapport imprimable pour la consultation, PWA hors-ligne. **Les données restent sur l'appareil** — pas de compte, pas de serveur, pas de contrainte HDS en v0 (docs/06).

## TL;DR de la stratégie

1. **On ne commence pas par une app, on commence par une audience.** Média + newsletter + communauté francophone sur le quotidien avec le diabète : c'est l'actif fondamental de l'« empire », et personne ne le possède aujourd'hui en français.
2. **Le coin d'attaque produit : l'alimentation à la française.** Compter ses glucides est la douleur n°1, 3 à 6 fois par jour, et les apps américaines ne connaissent ni la baguette tradition, ni la raclette, ni le couscous. Base OpenFoodFacts + Ciqual + estimation photo par IA.
3. **On reste hors du champ « dispositif médical » au départ** (pas de calcul de dose d'insuline, pas d'alertes médicales, pas de recommandations de traitement) : mise sur le marché rapide, sans marquage CE. La voie réglementée viendra plus tard, financée par les revenus.
4. **L'argent sérieux est en B2B2C** (mutuelles, employeurs, programmes structurés) — l'abonnement B2C finance le début, l'audience sert de levier pour les contrats. Référence : Livongo, parti du coaching diabète B2B, fusionné avec Teladoc pour 18,5 Md$.
5. **La confiance est la seule monnaie qui compte en santé.** Pas de promesses de guérison, pas de vente de données, le cœur de l'app reste gratuit. C'est à la fois l'éthique et la stratégie : en santé, la marque de confiance rafle tout.

## Documents

| Document | Contenu |
|---|---|
| [docs/01-strategie.md](docs/01-strategie.md) | Marché, douleurs du quotidien, concurrence, 7 angles évalués, recommandation, séquence « empire », modèle économique |
| [docs/02-reglementation.md](docs/02-reglementation.md) | Les lignes rouges : dispositif médical (MDR), données de santé (RGPD/HDS), allégations, responsabilité |
| [docs/03-roadmap-mvp.md](docs/03-roadmap-mvp.md) | Phases, spécification du MVP, stack technique, KPIs, budget, plan des 7 premiers jours, script d'interviews |
| [docs/04-marque-nom-audience.md](docs/04-marque-nom-audience.md) | Nom de travail « Diavie », candidats, personas, ton éditorial, identité visuelle |
| [docs/05-plan-contenu-seo.md](docs/05-plan-contenu-seo.md) | 7 clusters, 50 titres prêts à produire, standard de production, distribution, newsletter |
| [docs/06-architecture-technique.md](docs/06-architecture-technique.md) | Décision v0 local-first, trajectoire v0→v3, modèle de données, sécurité, déploiement |
| [docs/07-validation-hypotheses.md](docs/07-validation-hypotheses.md) | Hypothèses H1–H6 avec seuils et critères d'abandon, gates G1–G3, règle de non-dérive de la photo IA |

## Prochaines actions (7 jours)

Détail dans [docs/03-roadmap-mvp.md](docs/03-roadmap-mvp.md#9-le-plan-des-7-premiers-jours) :

- [ ] Choisir le nom, vérifier INPI / domaines / stores / réseaux sociaux
- [ ] Landing page + capture email avec un guide offert (« Kit de survie des 90 premiers jours après le diagnostic »)
- [ ] 5 premiers contenus SEO longue traîne + comptes Instagram/TikTok
- [ ] Interviewer 5 personnes diabétiques (script fourni)
- [ ] Trancher les 3 questions ouvertes de [docs/01-strategie.md](docs/01-strategie.md#11-trois-questions-pour-affiner)

## Avertissement

Ce projet fournit de l'information et des outils d'organisation du quotidien. Il ne fournit **aucun conseil médical** et ne remplace jamais l'avis d'un professionnel de santé. Cette règle est non négociable — voir [docs/02-reglementation.md](docs/02-reglementation.md).
