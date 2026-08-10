# Design — les « vaults », les références, et notre direction

Synthèse de la veille design (août 2026) : où chercher l'inspiration en continu, ce qu'on prend à qui, et le backlog design concret de Diavie.

## 1. Les bibliothèques de référence (« vaults ») — où chercher, et comment

| Bibliothèque | Contenu | Usage pour nous |
|---|---|---|
| [Mobbin](https://mobbin.com/) | ~600 000 captures d'apps réelles, taguées par écrans, flows et composants ; recherche par pattern | **Le réflexe avant chaque nouvel écran** : chercher 3 exemples du même flow (onboarding, saisie, stats) chez les meilleurs. Gratuit limité, Pro ~10 $/mois quand on designera sérieusement |
| [Design Vault](https://designvault.io/) | Patterns et captures des meilleurs produits, curation par interaction | Complément gratuit de Mobbin, bon pour les micro-interactions |
| [Apple Design Awards](https://developer.apple.com/design/awards/) + rubrique « Behind the Design » | Les apps primées, avec interviews des équipes | La barre de qualité ; la catégorie « impact social » est notre famille |
| Dribbble / Behance | Concepts et case studies | ⚠️ À consommer avec recul : joli ≠ utilisable ; on y prend des ambiances, jamais des flows entiers (beaucoup de concepts n'ont jamais rencontré un utilisateur) |
| Page Flows / captures d'onboarding | Vidéos de parcours réels | Pour travailler notre onboarding profil |

**Règle d'usage** : on copie des **patterns éprouvés** (des mécaniques qui marchent chez des produits à millions d'utilisateurs), jamais des styles entiers — le style, c'est notre identité ([04-marque-nom-audience.md](04-marque-nom-audience.md) §4).

## 2. Les 6 références analysées — ce qu'on leur prend, ce qu'on évite

| Référence | Pourquoi elle compte | On prend | On évite |
|---|---|---|---|
| **Gentler Streak** (Apple Design Award, impact social — [Behind the Design](https://developer.apple.com/news/?id=3m0ht22s), [Sketch blog](https://www.sketch.com/blog/gentler-streak/)) | LA référence de la bienveillance visuelle : le bien-être passe avant la performance, données colorées non anxiogènes, mascotte légère (Yorhart), et un « streak » qui **pardonne les jours off** | Le ton visuel optimiste, les courbes arrondies, l'idée de régularité sans culpabilité — exactement notre « zéro moralisme » | Rien — c'est notre étoile polaire |
| **mySugr** (Roche) | Le pionnier du « diabète dédramatisé » : monstre à apprivoiser, gamification, emoji | Le ton complice, la saisie rapide gamifiée avec feedback immédiat | La surcharge gamification enfantine — notre cible T2 senior veut de la chaleur, pas une cour de récré |
| **Yuka** 🇫🇷 | La référence française du **scan → réponse limpide en 1 seconde** | La hiérarchie brutale de l'info après un scan (une donnée énorme, le reste en dessous), l'iconographie immédiate | Le verdict moralisateur (bon/mauvais) — nous, on informe, on ne juge pas |
| **Flo** | Le meilleur onboarding par profil du marché santé | La personnalisation dès l'entrée (notre questionnaire T1/T2/proche va dans ce sens), les « insight cards » quotidiennes | Le paywall agressif |
| **Headspace / Calm** | Palettes chaudes, illustrations organiques, micro-animations apaisantes | Les états vides illustrés et chaleureux, la douceur des transitions | L'infantilisation quand elle déborde |
| **Oura** | La donnée santé rendue élégante et calme | La sobriété des graphiques, la typographie généreuse, le sentiment « premium » | Le score unique qui résume tout — chez nous ce serait de l'interprétation médicale (interdit, [02](02-reglementation.md) §2) |

Ce que confirme la recherche académique sur l'engagement ([JMIR](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10007004/)) : facilité de saisie, **renforcement positif** (jamais punitif), rapports personnalisés et partage avec le soignant — notre rapport PDF imprimable est exactement ce levier.

## 3. Où en est Diavie (v0) — déjà aligné

La v0 applique déjà l'essentiel : palette chaude non médicale (crème/terracotta/sauge — pas le bleu clinique générique), gros boutons et mode « texte plus grand », badge de confiance « 🔒 Données sur cet appareil », stats descriptives sans zones rouges anxiogènes, ton complice partout.

## 4. Backlog design v0.x (par ordre d'impact)

1. **Micro-feedback d'enregistrement** : toast chaleureux à chaque saisie (« +70 g ajoutés ✓ ») — le renforcement positif est le levier n°1 d'engagement (JMIR).
2. **États vides illustrés** (journal vide, aucun résultat, stats vides) : 3 petites illustrations dans l'esprit Gentler Streak — c'est là que le premier jour se joue.
3. **Mode sombre** : usage nocturne réel (contrôles de nuit) — respecter `prefers-color-scheme`.
4. **Transitions douces** entre vues (~150 ms) et sur l'ouverture des dialogues.
5. **Pictogrammes SVG cohérents** pour remplacer progressivement les emoji système (rendu inégal selon appareils).
6. **Piste mascotte** : la goutte du logo, animée avec parcimonie — à **tester en interviews d'abord** (dignité pour les T2 seniors ; mySugr prouve que ça marche, Gentler Streak prouve que la subtilité gagne).
7. **Typographie identitaire** : à l'achat du nom définitif (v1) — pile système d'ici là.

## 4 bis. Le standard « app-builder » (Base44 & co) — les techniques qu'on s'approprie

Les générateurs d'apps modernes (Base44, etc.) ont imposé un niveau de finition « startup » reconnaissable. On s'approprie **les techniques**, jamais le look SaaS générique (notre chaleur santé est notre différenciation). La boîte à outils, appliquée sur la landing et réutilisable sur tout futur écran :

1. **Héros en deux colonnes** : message à gauche (badge d'accroche → titre display à tracking serré → sous-titre → 2 CTA → réassurance), **produit montré** à droite.
2. **Le produit dans un appareil** : téléphone dessiné en CSS pur (aucune image, net à toutes les densités) avec un vrai extrait de l'app dedans — y compris le toast de confirmation, qui « vend » la micro-interaction.
3. **Mot-clé surligné au marqueur** (gradient de fond interrompu) — un seul par page.
4. **Bandeau de chiffres honnêtes** chevauchant le héros (marge négative) — que des faits vérifiables, jamais de « +10 000 utilisateurs » inventés.
5. **Grille de fonctionnalités** à icônes SVG maison dans des pastilles teintées de la palette — pas d'emoji système sur les surfaces marketing.
6. **Rythme de sections** : alternance fond crème / fond sauge pâle, 60 px d'air, une idée par section.
7. Ce qu'on refuse du genre : logos de confiance bidon, témoignages inventés, compteurs gonflés — en santé, un seul mensonge visible coûte la marque.

## 5. Anti-patterns (vus partout dans les vaults, interdits chez nous)

- Rouge alarmiste et jauges « danger » sur des données de santé → anxiogène ET requalifiant en interprétation médicale.
- Dashboard surchargé qui veut tout montrer → notre règle : un écran, une question.
- Streaks punitifs qui cassent au premier jour manqué → l'inverse de notre philosophie (et de Gentler Streak).
- Dark patterns d'abonnement (paywall surprise, essai piégé) → mortels pour une marque de confiance santé.
- Bleu médical + croix + stéthoscope → on est la marque du quotidien, pas une clinique.

## 6. Process design (léger, permanent)

Avant chaque nouvel écran : 3 patterns comparés dans Mobbin/Design Vault → croquis → confrontation aux personas ([04](04-marque-nom-audience.md) §2) et à la checklist réglementaire ([02](02-reglementation.md) §2) → test sur 2-3 membres de la communauté avant généralisation.

---
*Sources : [Mobbin](https://mobbin.com/), [Design Vault via DesignerUp](https://designerup.co/blog/the-best-collections-of-real-ux-design-patterns/), [Apple — Behind the Design : Gentler Streak](https://developer.apple.com/news/?id=3m0ht22s), [Sketch — How Gentler Streak brings kindness to fitness](https://www.sketch.com/blog/gentler-streak/), [Merge — 8 best designed health apps](https://merge.rocks/blog/8-best-designed-health-apps-weve-seen-so-far), [Technology Rivers — 15 healthcare app designs 2025](https://technologyrivers.com/blog/15-of-the-best-healthcare-app-designs-to-inspire-you-in-2025/), [JMIR — App design features for diabetes self-management](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10007004/), [IdeaUsher — Developing a diabetes app like mySugr](https://ideausher.com/blog/developing-a-diabetes-management-app-like-mysugr/).*
