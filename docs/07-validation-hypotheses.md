# Validation & hypothèses — le programme empirique

> Ce document répond à la revue critique externe de la stratégie (août 2026), dont le verdict tient en une phrase juste : *« la principale faiblesse n'est pas analytique mais empirique — rien n'est encore validé sur le terrain »*. Acté. Voici comment chaque hypothèse devient un test avec un seuil de succès **et un critère d'abandon**, et les portes (« gates ») qui conditionnent chaque investissement lourd.

## 1. Ce que la revue critique a challengé — et ce qu'on en fait

| Critique | Réponse opérationnelle |
|---|---|
| Conversion 2–5 % et 10 000 MAU posés sans justification | Requalifiés en **hypothèses de travail** (H4, H5 ci-dessous) avec proxys mesurables dès la v0 ; aucune projection n'entre dans un pitch avant mesure réelle |
| La frontière « info nutritionnelle » vs « aide au dosage » (photo IA) sera fragile en pratique | Garde-fou durci : voir §4 « Règle de non-dérive de la photo IA » — et la feature reste hors v0 |
| Le vrai goulot est l'étage 1 (audience), pas le produit | Acté : la **Gate G1** (audience) verrouille tout investissement produit au-delà de la v0 zéro-coût ; la landing est l'instrument de mesure, pas une vitrine |
| Les 3 questions ouvertes (incarnation, budget, cible) ne sont pas secondaires | Reclassées **bloquantes** : voir §5 — G1 ne peut pas être franchie sans réponse à « qui incarne la marque » |
| Ne pas se laisser rassurer par la qualité du document | Les 5 interviews sont le premier jalon du plan 7 jours ; aucun développement v1 avant leurs résultats |

## 2. Les hypothèses, avec seuils et critères d'abandon

| # | Hypothèse | Test | Succès si | Pivot/abandon si | Échéance |
|---|---|---|---|---|---|
| H1 | On peut construire une audience francophone « quotidien diabète » | Landing + 5 contenus + 4 semaines de présence utile dans les communautés existantes | ≥ 300 emails en 30 jours de distribution active, conversion landing ≥ 15 % | < 100 emails et < 8 % de conversion malgré ≥ 2 itérations de la promesse | M1–M2 |
| H2 | L'alimentation est la douleur n°1 du quotidien | 5 interviews (script [03-roadmap-mvp.md](03-roadmap-mvp.md) §8), question ouverte avant toute suggestion | ≥ 4/5 la citent spontanément dans leur top 3 | ≤ 2/5 → l'angle produit change (charge mentale ? administratif ?), le média reste | Semaine 1 |
| H3 | Une saisie < 10 s crée un usage durable | v0 testée par 10 membres de la communauté, chrono + usage réel | Médiane < 10 s et ≥ 4 jours d'usage sur 7 | Saisie > 20 s ou abandon J3 majoritaire → refonte UX avant toute feature nouvelle | M2–M3 |
| H4 | Il existe une disposition à payer ~5 €/mois | Interviews Q7 + bouton « Premium — bientôt » dans la v0 (mesure d'intention par clic, sans dark pattern : on annonce la couleur) | ≥ 30 % des interviewés citent une feature précise qu'ils paieraient ; taux de clic premium ≥ 8 % des actifs | Personne ne nomme de feature payable → monétisation par programmes/B2B2C, pas par abonnement | M2–M4 |
| H5 | Conversion freemium 2–5 % | Mesurable seulement en v1 (paiement réel) | ≥ 2 % à M+3 du lancement premium | < 1 % malgré itérations → revoir la frontière gratuit/premium ([03-roadmap-mvp.md](03-roadmap-mvp.md) §5) | v1 + 3 mois |
| H6 | Le SEO peut encore amener du trafic malgré l'érosion par les IA | 15 articles longue traîne publiés et indexés | ≥ 3 000 visites/mois à M4 | < 800 visites/mois à M4 → bascule du budget temps vers réseaux + communautés + partenariats créateurs (le média devient newsletter-first) | M4 |

## 3. Les portes (gates) — rien de lourd ne se construit avant sa porte

```
G0  Stratégie écrite ────────────────────── franchie (ce dépôt)
G1  AVANT tout développement v1 (comptes, sync HDS, premium, photo IA) :
      H1 validée + H2 validée + réponse à « qui incarne la marque » (§5)
G2  AVANT d'investir en paid marketing :
      H3 validée + H6 tranchée (on sait quel canal scale)
G3  AVANT la certification DM / télésurveillance (étage 4) :
      MRR ≥ 5 k€ + 1 mutuelle en discussion avancée
```

La v0 (site + app locale, zéro dépendance, ~0 €/mois) est **exemptée de gate** : c'est l'instrument de mesure de G1, pas un investissement à protéger.

## 4. Règle de non-dérive de la photo IA (v1+)

La revue a raison : la pression produit poussera vers « toujours plus personnalisé ». Règle écrite, opposable à nous-mêmes :

1. La photo IA décrit **l'assiette** (aliments, portions, glucides estimés) — jamais l'utilisateur, jamais sa glycémie, jamais sa dose.
2. **Interdit** de coupler automatiquement le résultat photo avec une valeur de glycémie ou un quelconque calcul en aval. L'utilisateur note ce qu'il veut ; l'app ne suggère rien.
3. Wording verrouillé : « estimation des glucides de ce plat », jamais « pour votre dose/bolus » — stores et marketing inclus (destination revendiquée, [02-reglementation.md](02-reglementation.md) §2).
4. Toute évolution de cette feature passe la checklist réglementaire **avant** développement, et la réponse est écrite dans ce dépôt (traçabilité pré-DM).

## 5. « Qui incarne la marque » — ✅ TRANCHÉ : proche aidant

**Décision (août 2026)** : le fondateur est **proche aidant** — un parent direct vit avec un diabète de type 2. La légitimité est native : le projet est né d'une histoire familiale réelle, pas d'une opportunité de marché.

Conséquences opérationnelles :

1. **La voix de la marque** : le fondateur signe la newsletter et raconte le « pourquoi » à la première personne (« je construis ça pour mon père, et pour tous les autres »). C'est l'archétype le plus universel du marché T2 : des millions d'enfants adultes s'inquiètent pour un parent.
2. **Règle de consentement** : l'histoire du parent lui appartient. Elle n'est racontée publiquement que dans les termes qu'il approuve, avec son accord explicite — et elle est plus forte ainsi (idéalement : il participe). Aucun détail médical d'un tiers ne figure dans ce dépôt ni dans la communication sans cet accord.
3. **Garde-fou éditorial de l'aidant** : construire pour un proche donne un carburant immense et un biais connu — vouloir « convaincre » les patients. Notre ton l'interdit ([04-marque-nom-audience.md](04-marque-nom-audience.md) §3) : l'app et les contenus rendent le bon choix facile, ils ne font jamais la morale. Un parent n'a pas besoin d'une app qui le surveille ; il a besoin d'outils qui lui simplifient la vie.
4. **La cible s'enrichit** : les **aidants familiaux** (conjoint·es, enfants adultes) deviennent un persona central — voir le persona « Julien » ([04-marque-nom-audience.md](04-marque-nom-audience.md) §2) et les clusters « Corps & prévention » et « Aidants & famille » ([05-plan-contenu-seo.md](05-plan-contenu-seo.md)).
5. **Interviews (H2)** : sur les 5 entretiens, inclure au moins 1 aidant familial d'un parent T2 en plus des personnes diabétiques elles-mêmes.

Rappel maintenu : prétendre une proximité qu'on n'a pas est interdit — ici, la proximité est réelle, c'est l'actif le plus précieux du projet.

## 6. Tableau de bord de validation (à tenir à jour ici)

| Date | Jalon | Résultat | Décision |
|---|---|---|---|
| 2026-08 | Incarnation de la marque | Fondateur proche aidant (parent T2) | ✅ Configuration « proche aidant » actée (§5) — condition d'incarnation de G1 levée |
| — | 5 interviews réalisées (dont ≥ 1 aidant familial) | à venir | — |
| — | Landing en ligne + 30 jours de mesure | à venir | — |
| — | v0 testée par 10 utilisateurs | à venir | — |
