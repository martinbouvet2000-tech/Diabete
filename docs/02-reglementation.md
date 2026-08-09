# Réglementation — les lignes rouges qui décident de l'architecture du projet

> Ce document n'est pas un avis juridique. Il cartographie les sujets pour construire vite **sans** se disqualifier, et indique quand consulter un avocat spécialisé santé numérique (budget à prévoir : 2–5 k€ pour une revue avant lancement — c'est l'assurance la moins chère du projet).

## 1. Pourquoi c'est LE sujet structurant

Dans la santé numérique, la réglementation n'est pas une contrainte de fin de projet, c'est un **choix de produit**. La frontière entre « app de bien-être » et « dispositif médical » (DM) décide si vous lancez en 3 mois pour quelques milliers d'euros, ou en 24 mois pour plus de 100 k€. Toute la stratégie ([01-strategie.md](01-strategie.md)) repose sur : **rester du bon côté de la ligne au départ, franchir la ligne volontairement plus tard, quand les revenus le financent.**

## 2. Dispositif médical ou pas : la ligne rouge fonctionnelle

Cadre : **règlement européen MDR 2017/745**. Un logiciel est un DM si son fabricant lui donne une **finalité médicale** (diagnostic, prévention, contrôle, prédiction, traitement d'une maladie). La règle 11 du MDR classe la plupart des logiciels médicaux en classe IIa minimum → marquage CE via organisme notifié obligatoire.

Deux choses comptent : **ce que fait la fonctionnalité** et **ce que vous dites qu'elle fait** (site, stores, pubs — la « destination revendiquée »). Un wording marketing médical peut requalifier une app anodine.

### Tableau de qualification par fonctionnalité

| Fonctionnalité | Statut probable | Décision projet |
|---|---|---|
| Journal où l'utilisateur saisit lui-même repas, glycémies, notes (simple registre) | Pas DM (simple stockage/restitution, cf. guide MDCG 2019-11) | ✅ MVP |
| Recherche d'aliments, glucides par portion, scan code-barres | Pas DM (information sur l'aliment, comme une étiquette) | ✅ MVP |
| Photo d'assiette → estimation des glucides de l'assiette | Pas DM si présenté comme info nutritionnelle sur l'aliment ; **ne jamais** le présenter comme « aide au dosage d'insuline » | ✅ MVP, wording surveillé |
| Statistiques descriptives (moyennes, courbes de ce que l'utilisateur a saisi) | Zone grise basse — acceptable si purement descriptif | ✅ MVP, sans interprétation |
| Rappels génériques (penser à son rendez-vous, à son renouvellement) | Pas DM (fonction d'agenda) | ✅ MVP |
| Contenu éditorial général relu par des professionnels | Pas DM (information) | ✅ MVP |
| Messages interprétatifs (« vous êtes en hypoglycémie », « tendance dangereuse ») | **DM** (contrôle/alarme) | ❌ Interdit avant CE |
| Alertes/prédictions hypo-hyper en temps réel | **DM** classe IIa/IIb | ❌ Étage 4 |
| Calculateur de dose/bolus d'insuline | **DM**, généralement classe IIb | ❌ Étage 4 |
| Recommandations personnalisées de traitement ou d'ajustement | **DM** + risque d'exercice illégal de la médecine | ❌ Jamais sans cadre médical complet |
| Télésurveillance avec professionnel de santé dans la boucle | DM + cadre spécifique de remboursement | 🔭 Étage 4, la « voie sérieuse » |

### Garde-fous permanents
- Bandeau et CGU : « Cette application ne fournit pas de conseil médical et ne remplace pas votre équipe soignante. »
- En cas de symptômes évoquant une urgence dans un contenu : renvoyer systématiquement vers le 15 / 112.
- **Checklist à chaque nouvelle feature** : Interprète-t-elle des données de santé ? Déclenche-t-elle une action thérapeutique ? Le marketing lui prête-t-il une finalité médicale ? Un seul « oui » → revue réglementaire avant développement.

## 3. Données de santé : RGPD, HDS, CNIL

Une glycémie, un traitement, même saisis volontairement dans une app « bien-être », sont des **données de santé** au sens de l'article 9 du RGPD. Aucune astuce de positionnement ne change cela. Conséquences concrètes :

1. **Base légale** : consentement explicite, spécifique, révocable (case non pré-cochée, texte clair).
2. **Hébergement HDS** : en France, l'hébergement de données de santé exige un hébergeur **certifié HDS**. Prestataires certifiés : OVHcloud Healthcare, Scaleway, AWS, Azure, GCP (vérifier que le *service précis* utilisé est dans le périmètre de certification, pas seulement le fournisseur). Choisir HDS **dès le MVP** : migrer plus tard coûte 10× plus cher.
3. **AIPD (analyse d'impact)** : requise pour un traitement de données de santé à grande échelle — à rédiger avant le lancement (modèles CNIL disponibles).
4. **Mesures** : chiffrement au repos et en transit, minimisation (ne collecter que l'utile), journalisation des accès, suppression et export sur demande (portabilité), durées de conservation définies.
5. **DPO** : désignation recommandée dès le début (externalisable, ~200–500 €/mois), obligatoire selon l'échelle.
6. **Analytics** : pas de Google Analytics ni de SDK publicitaires dans l'app santé. Matomo ou Plausible auto-hébergés, données en Europe.
7. **CNIL** : suivre les référentiels santé de la CNIL ; le secteur est une priorité de contrôle récurrente.

## 4. Allégations, publicité, contenus

- **Interdit** : promesses de guérison ou de « réversion garantie », témoignages présentés comme preuves d'efficacité thérapeutique, comparaisons dénigrantes de traitements. (Pratiques commerciales trompeuses + réglementation santé.)
- **Professions réglementées** : « diététicien·ne » et « médecin » sont des titres protégés. Les conseils nutritionnels individualisés passent par des diététicien·nes diplômé·es partenaires ; nous, plateforme, publions de l'information générale relue.
- **Exercice illégal de la médecine** : jamais de conseil individualisé de traitement (y compris par un chatbot — attention aux features IA conversationnelles, à cadrer strictement sur l'information générale et l'organisation).
- **Loi anti-cadeaux** : toute collaboration avec des professionnels de santé (relecture, ateliers) doit être contractualisée et rémunérée dans les règles ; tout avantage consenti par un industriel de santé est encadré.
- **Influence commerciale** (loi de 2023) : si des créateurs de contenu font notre promotion, encadrer les mentions (collaboration commerciale affichée) ; la promotion de dispositifs médicaux par influence est restreinte.
- **Contenu éditorial** : chaque article santé est relu par un professionnel identifié (nom + titre affichés), avec sources citées et date de mise à jour. C'est à la fois une exigence de crédibilité (critères E-E-A-T de Google pour le SEO santé — le référencement en dépend directement) et un pare-feu juridique.

## 5. Responsabilité & structure

- **CGU/CGV** solides : limitation de responsabilité, description honnête du service, pas de garantie de résultat.
- **Assurance RC professionnelle** couvrant l'activité numérique santé/bien-être (quelques centaines d'€/an au début).
- **Structure** : SAS classique suffit au départ. Les statuts « société à mission » peuvent renforcer la marque de confiance plus tard.
- **Marque** : dépôt INPI (classes 9, 41, 44 typiquement) avant toute communication large ; vérifier l'antériorité (INPI + EUIPO + stores + domaines).

## 6. La voie réglementée « argent sérieux » (étage 4, pour mémoire)

Quand l'audience et les revenus le permettent, franchir la ligne **volontairement** ouvre des modèles fermés aux apps bien-être :

| Voie | Ce que c'est | Ticket d'entrée |
|---|---|---|
| **Marquage CE DM** (classe IIa/IIb) | Droit de faire alertes, calculs de dose, recommandations | ISO 13485 + dossier technique + organisme notifié : 12–24 mois, 50–150 k€+ |
| **Télésurveillance** (France, droit commun depuis 2023) | Suivi remboursé du diabète avec professionnel dans la boucle | DM CE + partenariats médicaux + référencement |
| **PECAN** | Prise en charge anticipée des dispositifs médicaux numériques en France | DM CE + preuve clinique en cours |
| **DiGA** (Allemagne) | Apps santé prescrites et remboursées | DM CE + étude + dossier BfArM — porte d'entrée européenne crédible |

**Décision d'architecture à prendre dès maintenant** : développer dès le MVP avec une hygiène « pré-DM » (gestion de versions rigoureuse, tests documentés, traçabilité des exigences) coûte ~10 % d'effort en plus et fera gagner 6 mois si on certifie un module plus tard.

## 7. Checklist conformité MVP (avant mise en ligne)

- [ ] Hébergement certifié HDS (service précis vérifié) — données en Europe
- [ ] Consentement explicite données de santé + politique de confidentialité lisible
- [ ] AIPD rédigée ; registre des traitements tenu
- [ ] CGU avec disclaimers médicaux + renvoi urgences (15/112)
- [ ] Aucune fonctionnalité du tableau §2 en zone ❌ ; wording stores/site relu contre la « destination médicale »
- [ ] Chiffrement, suppression de compte fonctionnelle, export des données fonctionnel
- [ ] Pas de SDK publicitaire ni GA ; analytics respectueux
- [ ] Marque déposée INPI ; mentions légales complètes
- [ ] RC pro souscrite
- [ ] Relecture juridique externe (2–5 k€) planifiée avant le lancement public
