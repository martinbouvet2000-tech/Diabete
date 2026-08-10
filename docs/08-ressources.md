# Bibliothèque de ressources

Liens de référence du projet (issus de la veille externe d'août 2026, vérifiés et annotés). La position stratégique sur chacun est dans [06-architecture-technique.md](06-architecture-technique.md) §9.

## Données nutritionnelles & glucides

| Ressource | Lien | Usage projet |
|---|---|---|
| Open Food Facts | https://world.openfoodfacts.org/ | ✅ Intégré en v0 (scan code-barres) |
| Open Food Facts — doc API | https://openfoodfacts.github.io/api-documentation/ | Référence d'intégration (endpoint v2 utilisé dans `app/js/scan.js`) |
| Table Ciqual (ANSES) | https://ciqual.anses.fr/ | v0.x : import complet (licence ouverte) pour remplacer/enrichir notre base curée |
| LogMeal | https://logmeal.es/ | Alternative payante pour la photo IA (v1, gate G1) |
| Passio.ai | https://www.passio.ai/ | Idem — à benchmarker contre l'approche LLM vision |

## Écosystème open source diabète

| Ressource | Lien | Usage projet |
|---|---|---|
| Nightscout — documentation | https://nightscout.github.io/ | v2 : import/affichage pour crédibilité auprès des T1 technophiles |
| Nightscout — GitHub | https://github.com/nightscout | Étude du modèle de données temps réel |
| Tidepool | https://www.tidepool.org/ | Référence de plateforme données diabète à but non lucratif |
| Tidepool Developer Hub | https://developer.tidepool.org/ | Leur format de données = standard à suivre pour notre export/sync v1+ |

## Organismes & recommandations médicales

| Ressource | Lien | Usage projet |
|---|---|---|
| Société Francophone du Diabète (SFD) | https://www.sfdiabete.org/ | Validation clinique des contenus (pied diabétique, suivi) |
| Fédération Française des Diabétiques (FFD) | https://www.federationdesdiabetiques.org/ | Vécu patient, partenariats associatifs (docs/03 §2) |
| American Diabetes Association (ADA) | https://diabetes.org/ | Veille internationale |
| ADA — Standards of Care | https://diabetesjournals.org/care | Référence annuelle mondiale (à lire côté fond, jamais à retranscrire en conseil individualisé) |
| Assurance Maladie | https://www.ameli.fr/ | Remboursements, ALD, gradation podologique — source n°1 des contenus démarches |
| Aide aux Jeunes Diabétiques (AJD) | https://www.ajd-diabete.fr/ | Partenariat cluster « Parents & école » |

## Accessibilité

| Ressource | Lien | Usage projet |
|---|---|---|
| WCAG (W3C) | https://www.w3.org/WAI/standards-guidelines/wcag/ | Socle — appliqué : contrastes, cibles ≥ 44 px, mode « texte plus grand » (v0) |
| RGAA (France) | https://accessibilite.numerique.gouv.fr/ | Référentiel français — audit à prévoir avant tout contrat B2B2C public/mutuelle |

## Stack & outils (pour mémoire)

Next.js (https://nextjs.org/) · Tailwind (https://tailwindcss.com/) · Supabase (https://supabase.com/ — ⚠️ cloud non HDS, voir docs/02 §3 et docs/06 §9) · Flutter (https://flutter.dev/) · FlutterFlow (https://flutterflow.io/) · Glide (https://www.glideapps.com/ — no-code : inadapté aux données de santé et à notre exigence de maîtrise, écarté).

---

Règle d'hygiène : toute nouvelle ressource entre ici **avec** une ligne « usage projet » — une liste de liens sans position, c'est du bruit.
