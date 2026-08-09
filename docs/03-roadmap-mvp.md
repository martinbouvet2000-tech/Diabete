# Roadmap & MVP — de zéro à l'étage 4

Ce document traduit la stratégie ([01-strategie.md](01-strategie.md)) en exécution : quoi construire, avec quoi, dans quel ordre, et comment mesurer.

## 1. Vue d'ensemble des phases

| Phase | Période | Objectif | Livrable principal | Jalon de sortie |
|---|---|---|---|---|
| **1. Audience** | Mois 0–6 | Devenir une voix de confiance | Site média + newsletter + communauté | 2 000 emails, 500 membres actifs |
| **2. Produit** | Mois 3–9 (chevauche la 1) | L'outil quotidien indispensable | App freemium (iOS/Android/web) | 10 000 MAU, rétention J30 ≥ 25 % |
| **3. Revenus** | Mois 9–18 | Vivre du projet | Premium + programme 90 jours + affiliation | 5 000 € MRR |
| **4. Empire** | Mois 18+ | Changer d'échelle | Contrats B2B2C, option DM certifié, international francophone | 1er contrat mutuelle signé |

Le média (phase 1) ne s'arrête jamais : c'est le moteur d'acquisition permanent de tous les étages.

## 2. Phase 1 — le média et la communauté

**Site média** : 30–50 contenus longue traîne la première année, sur les requêtes que personne ne traite bien en français :
- « diabète et restaurant : comment gérer », « voyager en avion avec de l'insuline », « capteur qui se décolle que faire », « quoi manger au petit-déjeuner diabète type 2 », « diabète gestationnel menus semaine », « sport et hypoglycémie », « ALD diabète démarches », « annoncer son diabète au travail »…
- Chaque article : relu par un professionnel identifié, sources citées, date de mise à jour (E-E-A-T, voir [02-reglementation.md](02-reglementation.md) §4).

**Lead magnet** : « Le kit de survie des 90 premiers jours après le diagnostic » (PDF soigné, version T1 et version T2) contre email.

**Newsletter hebdomadaire** : le rendez-vous du quotidien — une astuce concrète, une recette chiffrée en glucides, une réponse de pro, un témoignage. Ton patient-à-patient, jamais labo-à-patient.

**Communauté** : commencer là où les gens sont (groupes existants : aider sincèrement, sans spam), puis ouvrir notre espace (groupe privé ou Discord) quand ~1 000 emails. Moments forts à exploiter : Journée mondiale du diabète (14 novembre), rentrée scolaire (parents d'enfants T1), janvier (résolutions T2).

**Partenariats** : Fédération Française des Diabétiques (AFD) et Aide aux Jeunes Diabétiques (AJD) — proposer de la valeur d'abord (contenus, outils gratuits pour leurs antennes) ; créateurs T1 francophones sur Instagram/TikTok (collaborations encadrées, voir réglementation).

## 3. Phase 2 — spécification du MVP de l'app

### User stories (V1)

1. En tant qu'utilisateur, je **scanne un code-barres** et j'obtiens les glucides par portion réelle (base OpenFoodFacts).
2. Je **cherche « raclette »** ou « couscous » et j'obtiens une estimation par portion française (table Ciqual ANSES + portions maison).
3. Je **photographie mon assiette** et l'IA me propose une estimation des glucides, aliment par aliment, que je corrige en deux taps.
4. Je **journalise en < 10 secondes** : repas, glycémie (saisie manuelle ou lue depuis Apple Santé / Health Connect quand l'app du capteur y écrit), activité, humeur.
5. Je consulte mes **7 / 30 derniers jours** (statistiques purement descriptives — voir ligne rouge réglementaire).
6. J'**exporte un PDF** propre à montrer en consultation.
7. Je lis chaque jour un **contenu court utile** dans l'app (le média intégré).

### Hors périmètre V1 (volontairement)
Alertes hypo/hyper, prédictions, calcul de dose, chatbot médical, connexion directe aux API capteurs (on passe par Apple Santé / Health Connect — la disponibilité de l'écriture par LibreLink/Dexcom varie selon capteur, plateforme et pays : à vérifier par cible, et prévoir la saisie manuelle comme chemin par défaut).

### Le standard de qualité qui fait la différence
- Saisie d'un repas complet : **< 10 s** (sinon l'usage meurt au jour 12).
- Fonctionne **hors ligne** (métro, étranger), synchronise ensuite.
- Accessibilité réelle (taille de texte, contraste — la rétinopathie existe, le public T2 est âgé).
- Français irréprochable, ton chaleureux, zéro jargon médical non expliqué.

## 4. Stack technique recommandée

| Brique | Choix | Pourquoi |
|---|---|---|
| Site média | Astro ou Next.js statique + contenu Markdown/CMS git, hébergé Vercel/Netlify | Aucune donnée de santé → pas de contrainte HDS ; performance SEO maximale |
| App | **Expo / React Native** (iOS + Android + web) | Une seule base de code, EAS pour les builds, écosystème mûr |
| Backend & DB | PostgreSQL + API Node (NestJS/Fastify) **sur hébergeur certifié HDS** (OVHcloud Healthcare ou Scaleway) ; Supabase auto-hébergé sur cette infra est une option | La glycémie impose le HDS dès le jour 1 ([02-reglementation.md](02-reglementation.md) §3) |
| Auth | Solution auto-hébergée sur la même infra HDS (ex. Keycloak, ou l'auth Supabase self-hosted) | Les comptes sont liés aux données de santé |
| Bases alimentaires | OpenFoodFacts (licence ODbL, codes-barres, très riche en produits FR) + table Ciqual ANSES (aliments génériques, licence ouverte) | Le différenciateur « à la française » ne coûte rien en licence |
| Photo → glucides | API vision LLM (ex. Claude) avec sortie JSON structurée {aliment, portion estimée, glucides}, validée par l'utilisateur | Faisable en semaines ; coût ~quelques centimes/photo → quota gratuit + illimité en premium |
| Paiement | Stripe + RevenueCat (abonnements in-app) | Standard, gère les stores |
| Emails | Brevo (français, RGPD-friendly) | Newsletter + transactionnel |
| Analytics | Matomo ou Plausible auto-hébergés en Europe | Pas de GA sur une app santé |

**Hygiène « pré-DM » dès le départ** (voir [02-reglementation.md](02-reglementation.md) §6) : versions taguées, tests automatisés documentés, changelog rigoureux, traçabilité des exigences. ~10 % d'effort en plus, 6 mois gagnés si on certifie un module plus tard.

## 5. Freemium : la frontière gratuit / premium

| Fonction | Gratuit | Premium (5,99 €/mois ou 39,99 €/an) |
|---|---|---|
| Journal repas/glycémie/activité | ✅ Illimité | ✅ |
| Scan code-barres & recherche aliments | ✅ | ✅ |
| Photo IA | 3 / semaine | Illimité |
| Historique & statistiques | 30 jours | Illimité + tendances avancées |
| Export PDF consultation | 1 / mois | Illimité + modèles |
| Multi-appareils & sauvegarde étendue | — | ✅ |
| Contenu quotidien | ✅ | ✅ + dossiers thématiques premium |

Principe intangible : **le nécessaire pour se suivre reste gratuit à vie** (éthique + acquisition) ; le premium vend du confort et de la profondeur, jamais la sécurité.

## 6. KPIs par phase

| Phase | KPIs cibles |
|---|---|
| 1 | 30 articles publiés ; 3 000 visites/mois à M3, 10 000 à M6 ; 1 500–2 000 abonnés newsletter (taux d'ouverture ≥ 40 %) ; 500 membres communauté |
| 2 | 5 000 installs à M+3 du lancement ; activation (1er repas journalisé) ≥ 60 % ; rétention J30 ≥ 25 % ; temps de saisie médian < 10 s |
| 3 | Conversion premium 2–5 % ; MRR 5 000 € ; 30 ventes/mois du programme 90 jours ; revenus d'affiliation > 500 €/mois |
| 4 | 2 pilotes mutuelles en discussion, 1 signé ; décision go/no-go certification DM d'un module |

## 7. Budget indicatif

| Scénario | Année 1 | Détail |
|---|---|---|
| Solo à temps partiel | 3–6 k€ | Outils (~150–300 €/mois : HDS, emails, IA, stores) + relecture juridique 2–5 k€ + dépôt de marque ~250 € |
| Solo temps plein + freelances ponctuels | 20–40 k€ | + design (3–6 k€), développement d'appoint (10–25 k€), contenu relu par pros (50–150 €/article) |
| Petite équipe financée | 80–150 k€ | Accélère les phases 2–3 d'environ 6 mois ; pertinent seulement une fois l'étage 1 validé |

Aides mobilisables en France : statut JEI, Bourse French Tech, concours d'innovation santé, incubateurs santé (éligibilité à vérifier selon votre situation).

## 8. Script d'interview (validation terrain — 5 entretiens minimum avant d'écrire du code)

 1. Racontez-moi votre diagnostic : qu'est-ce qui vous a le plus manqué les 3 premiers mois ?
 2. Qu'est-ce qui est le plus pénible **au quotidien** aujourd'hui ? (Laisser venir, ne pas suggérer.)
 3. Montrez-moi comment vous comptez vos glucides sur un repas réel. (Observer, chronométrer.)
 4. Quelles apps avez-vous essayées puis abandonnées ? Pourquoi, précisément ?
 5. Comment gérez-vous un restaurant ? Un voyage ? Qu'est-ce qui vous stresse avant ?
 6. Combien dépensez-vous par mois autour du diabète, non remboursé ? En quoi ?
 7. Pour quel service paieriez-vous 5 €/mois sans hésiter ? Et 100 € une fois ?
 8. Où cherchez-vous vos infos ? En qui avez-vous confiance, en qui pas du tout ?
 9. Baguette magique, hors guérison : qu'est-ce que je vous enlève comme problème ?
10. Qui d'autre devrais-je interviewer ? (Toujours finir par ça — c'est aussi le début de la communauté.)

## 9. Le plan des 7 premiers jours

- [ ] **J1–J2 — Nom & positionnement.** Critères : prononçable en français, évoque le quotidien (pas la maladie ni le médical), déclinable en média + app + programmes. Vérifier INPI, EUIPO, domaines (.fr/.com), stores, réseaux. Poser la phrase de positionnement : « Le compagnon du quotidien avec le diabète, en français. »
- [ ] **J2–J3 — Landing + capture email.** Une page, une promesse, le kit 90 jours en échange de l'email (Brevo). C'est le compteur de validation du projet.
- [ ] **J3–J5 — Premiers contenus.** 5 articles longue traîne de la liste §2 ; création des comptes Instagram/TikTok ; immersion dans 3–4 groupes existants (aider, observer, zéro promo).
- [ ] **J5–J6 — 5 interviews** avec le script §8 (recruter via les groupes et l'entourage ; mixer T1/T2/parent d'enfant T1).
- [ ] **J7 — Décisions.** Répondre aux 3 questions de [01-strategie.md](01-strategie.md#11-trois-questions-pour-affiner), figer le périmètre V1, planifier les 30 jours suivants.

## 10. Et ensuite (mois 2–6, aperçu)

Cadence : 2 contenus/semaine + 1 newsletter/semaine, sans exception. Maquettes de l'app à M2 (tester les maquettes dans la communauté avant de coder). Développement V1 à M3–M5 sur l'infra HDS. Bêta fermée avec 50 membres de la communauté à M5 (ils deviennent les ambassadeurs du lancement). Lancement public à M6 : stores + Product Hunt + créateurs partenaires + la newsletter comme rampe. La suite est écrite dans [01-strategie.md](01-strategie.md#7-la-séquence--empire--en-4-étages).
