# Architecture technique — v0 → v3

## 1. La décision structurante : v0 **local-first**

**Les données de santé de la v0 ne quittent jamais l'appareil de l'utilisateur.** Le journal (glycémies, repas) est stocké en IndexedDB dans le navigateur ; il n'existe ni compte, ni serveur applicatif, ni base de données côté nous.

Pourquoi c'est le bon choix de départ :

1. **Réglementaire** : pas d'hébergement de données de santé → la contrainte HDS ([02-reglementation.md](02-reglementation.md) §3) ne s'applique pas à la v0. On peut lancer **cette semaine** sur un hébergement statique gratuit.
2. **Confiance** : « vos données restent sur votre appareil » est un argument marketing massue dans la santé — et il est vrai.
3. **Coût** : hébergement statique = 0 €. Tout le budget va au contenu et à l'acquisition.
4. **Vitesse** : pas d'auth, pas d'API, pas de RGPD serveur à outiller → on itère sur la valeur, pas sur la plomberie.

Contreparties assumées (et traitées) : pas de synchronisation multi-appareils (→ export/import JSON fourni comme sauvegarde manuelle) ; perte possible si l'utilisateur nettoie son navigateur (→ rappels de sauvegarde dans l'UI). La synchronisation chiffrée arrive en v1 **quand** la traction le justifie.

## 2. Trajectoire

| Version | Contenu | Déclencheur pour y aller |
|---|---|---|
| **v0 (maintenant)** | Site média statique + PWA locale (journal, aliments FR, scan, stats descriptives, export) | — |
| **v1** | Comptes + synchronisation chiffrée sur infra **HDS** (OVHcloud Healthcare / Scaleway) ; premium (Stripe) ; photo IA (API vision, quota) | ≥ 2 000 utilisateurs actifs et demande explicite de sync |
| **v2** | App mobile Expo/React Native (stores), lecture Apple Santé / Health Connect | Rétention J30 ≥ 25 % sur la PWA |
| **v3** | Modules réglementés (alertes, télésurveillance) après marquage CE | MRR qui finance la certification ([02-reglementation.md](02-reglementation.md) §6) |

## 3. v0 : choix « zéro dépendance » (assumé et réversible)

Le site et l'app n'ont **aucune dépendance npm**. Générateur statique maison (~200 lignes de Node standard), JavaScript navigateur en modules ES natifs, graphiques en canvas, scan via l'API native `BarcodeDetector`.

- **Pourquoi** : rien à installer, rien qui casse, déployable sur n'importe quel hébergeur statique, auditable en une heure, aucune surface d'attaque supply-chain — et l'environnement de build le plus simple possible pour un projet naissant.
- **Limites connues** : pas de composants réutilisables sophistiqués, pas d'écosystème. C'est voulu pour la v0.
- **Critère de migration** (vers Astro pour le site, Expo pour l'app) : dès que 2 personnes contribuent au code ou que la V1 (comptes/sync) démarre. Le contenu est déjà en Markdown et le CSS en variables — la migration est un recopiage, pas une réécriture.

## 4. Arborescence du dépôt

```
/site                  Média + landing (générateur statique maison)
  build.mjs            Build zéro dépendance : Markdown → HTML, sitemap, copie de l'app
  config.mjs           Nom, URL, description — le nom de travail se change ICI
  templates/           layout.html (gabarit unique)
  content/articles/    Articles en Markdown + front matter
  static/              index.html (landing), CSS, logo, robots.txt, pages légales
  dist/                Sortie de build (non versionnée)
/app                   PWA v0 locale (copiée dans dist/app au build)
  index.html           Application monopage (vues par ancres)
  css/app.css
  js/                  db.js, foods.js, journal.js, scan.js, stats.js, settings.js, app.js
  data/aliments.json   ~190 aliments français, valeurs moyennes
  manifest.webmanifest, sw.js, icons/
/docs                  Stratégie & décisions (01 → 06)
netlify.toml           Build + publication + en-têtes de sécurité
```

## 5. Modèle de données (journal, IndexedDB `diavie` / store `entries`)

```js
{
  id: string,            // horodatage + aléa
  ts: number,            // epoch ms
  type: 'repas' | 'glycemie' | 'activite' | 'note',
  repas?:    { moment: 'petit-dej'|'dejeuner'|'diner'|'collation',
               aliments: [{ nom, glucides, detail? }], total: number },
  glycemie?: { mgdl: number,            // canonique : mg/dL
               affichage: 'gL'|'mgdl'|'mmol' , contexte: 'a-jeun'|'avant-repas'|'apres-repas'|'coucher'|'autre' },
  activite?: { label: string, minutes: number },
  note?:     string
}
```

Conversions : 1 g/L = 100 mg/dL ; 1 mmol/L = 18 mg/dL. La France affiche g/L par défaut ; mmol/L proposé (Belgique/Suisse/Canada). **Aucune interprétation des valeurs** (pas de zones colorées, pas de « trop haut/bas ») — ligne rouge réglementaire du [02-reglementation.md](02-reglementation.md) §2 : l'app enregistre et restitue, elle ne juge pas.

## 6. Données aliments

- `data/aliments.json` : ~190 aliments et plats **français** avec glucides/100 g et une **portion maison** réaliste (« 1/2 baguette (125 g) », « 1 part de tartiflette (300 g) »). Valeurs moyennes issues des tables nutritionnelles publiques, arrondies — l'UI affiche systématiquement « estimation : vérifiez l'étiquette ».
- Scan code-barres : API native `BarcodeDetector` (Android/Chrome) + saisie manuelle du code en secours → requête **Open Food Facts** (`/api/v2/product/{code}`), champ `carbohydrates_100g`. Hors ligne : bascule proprement sur la base locale.
- Étape suivante (v0.x) : import complet de la table **Ciqual** (ANSES, licence ouverte) via un script de conversion dans `site/build.mjs` ou un script dédié.

## 7. Sécurité & vie privée v0

- Aucune donnée de santé transmise ; le seul appel réseau applicatif est Open Food Facts (code-barres uniquement, pas d'identifiant).
- En-têtes durcis via `netlify.toml` (CSP sans script tiers, Referrer-Policy, X-Content-Type-Options, Permissions-Policy caméra limitée à l'app).
- Pas d'analytics dans l'app en v0 ; sur le site, brancher plus tard Plausible/Matomo UE ([02-reglementation.md](02-reglementation.md) §3.6).
- Service worker : cache versionné des ressources statiques ; les réponses Open Food Facts en réseau d'abord.
- Export/import JSON : la sauvegarde appartient à l'utilisateur, format documenté, réversible.

## 8. Hébergement & déploiement

- **Netlify** (recommandé v0) : `netlify.toml` fourni — build `node site/build.mjs`, publication `site/dist`, formulaire newsletter via **Netlify Forms** (100 soumissions/mois gratuites, aucune configuration). Brancher ensuite Brevo via `site/config.mjs` (`formAction`) quand le compte existe.
- Alternatives : Vercel/Cloudflare Pages (mêmes commandes ; formulaires à brancher sur Brevo directement).
- Domaine : à acheter après validation du nom ([04-marque-nom-audience.md](04-marque-nom-audience.md)) ; mettre à jour `siteUrl` dans `site/config.mjs`.

## 9. Écosystème & intégrations (veille intégrée, revue août 2026)

Synthèse d'une revue externe des ressources disponibles, avec notre position :

| Ressource | Ce que c'est | Notre position |
|---|---|---|
| **Open Food Facts** | Base collaborative, 3 M+ produits, forte en France | ✅ **Intégré en v0** (scan). Limite connue : données contributives, valeurs parfois manquantes — l'UI invite toujours à vérifier l'étiquette |
| **Table Ciqual (ANSES)** | Référence officielle française des aliments bruts et plats | ✅ Prévu v0.x : import complet via script (notre base de 207 aliments curés est l'intérim). Fiabilité maximale pour le fait-maison |
| **Nightscout** | Projet open source de référence de la communauté DIY : agrégation temps réel des capteurs, tableau de bord partageable | 🔭 v2 : proposer l'import/affichage des données Nightscout est un signal de crédibilité fort auprès des T1 technophiles (nos prescripteurs). Pas en v0 : exige un hébergement par l'utilisateur et du support |
| **Tidepool** | Plateforme à but non lucratif, format de données diabète standardisé, validée cliniquement | 🔭 v2+ : leur modèle de données est la référence à suivre pour notre format d'export/sync — l'adopter tôt évite une migration |
| **APIs photo-vers-nutrition (LogMeal, Passio…)** | Reconnaissance d'aliments par vision, payantes | Alternative à notre plan « LLM vision » pour la photo IA (v1, gate G1). À benchmarker le moment venu ; la règle de non-dérive ([07](07-validation-hypotheses.md) §4) s'applique quel que soit le fournisseur |
| **Web Speech API (saisie vocale)** | Dicter au lieu de taper — pertinent pour la neuropathie des doigts | ⚠️ Nuance : les claviers iOS/Android intègrent déjà la dictée dans tous nos champs (elle marche dès la v0, gratuitement). Un vrai parcours « je dis mon repas, l'app calcule » = interprétation de phrase, prévu v1 si les tests utilisateurs le réclament |
| **Next.js + Tailwind + Supabase** | Stack généraliste souvent recommandée | Notre trajectoire diffère **volontairement** : v0 zéro dépendance livrée et testée ; pour la v1, Supabase *cloud* n'est pas certifié HDS → auto-hébergement sur infra HDS ou backend dédié (§2), point que les recommandations généralistes ignorent systématiquement |
| **Références médicales : SFD, Fédération Française des Diabétiques, ADA** | Recommandations cliniques et fiches patients | Sources officielles de nos contenus (avec Ameli/HAS) ; la SFD est la référence à citer pour tout contenu « pied diabétique » et objectifs de suivi |

**Accessibilité renforcée (appliqué en v0)** : cibles tactiles agrandies et mode « texte plus grand » persistant dans les Réglages — la neuropathie touche aussi les doigts, et la rétinopathie la vue ; c'est un critère produit de premier rang pour notre cible T2 senior, pas une finition.

## 10. Qualité

- Build reproductible : `node site/build.mjs` (Node ≥ 18, rien d'autre).
- Vérification syntaxe JS : `node site/check.mjs` (contrôle tous les modules + validité du JSON aliments).
- Avant chaque publication de contenu : passer la checklist réglementaire ([02-reglementation.md](02-reglementation.md) §7) et le standard éditorial ([05-plan-contenu-seo.md](05-plan-contenu-seo.md) §3).
