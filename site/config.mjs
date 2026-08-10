// Configuration unique du site. Le nom de travail se change ici (voir docs/04).
export default {
  // Nom de la marque (nom de travail — vérifier INPI/domaines avant usage public)
  siteName: 'Diavie',
  tagline: 'Le quotidien avec le diabète, en plus simple.',
  // URL de production, sans slash final. À mettre à jour après l'achat du domaine.
  siteUrl: 'https://diavie.netlify.app',
  description:
    "Guides pratiques, aliments français chiffrés en glucides et journal privé : Diavie aide les personnes diabétiques dans leur vie de tous les jours. Sans jargon, sans jugement.",
  // Newsletter : par défaut le formulaire utilise Netlify Forms (aucune config).
  // Quand le compte Brevo existe, coller ici l'URL d'action du formulaire Brevo :
  // le build remplace alors automatiquement le formulaire Netlify.
  formAction: '',
  // Langue et locale
  lang: 'fr',
}
