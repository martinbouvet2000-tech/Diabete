// Préférences (localStorage) + conversions d'unités de glycémie.
// Canonique interne : mg/dL. 1 g/L = 100 mg/dL ; 1 mmol/L = 18 mg/dL.
const KEY = 'diavie.prefs'

const defauts = { unite: 'gL', bienvenueVue: false, texteGrand: false }

export function getPrefs() {
  try {
    return { ...defauts, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { ...defauts }
  }
}

export function setPref(k, v) {
  const p = getPrefs()
  p[k] = v
  localStorage.setItem(KEY, JSON.stringify(p))
}

export const UNITES = {
  gL: { label: 'g/L', versMgdl: (v) => v * 100, depuisMgdl: (v) => v / 100, decimales: 2 },
  mgdl: { label: 'mg/dL', versMgdl: (v) => v, depuisMgdl: (v) => v, decimales: 0 },
  mmol: { label: 'mmol/L', versMgdl: (v) => v * 18, depuisMgdl: (v) => v / 18, decimales: 1 },
}

export function formatGlycemie(mgdl, unite = getPrefs().unite) {
  const u = UNITES[unite] || UNITES.gL
  const v = u.depuisMgdl(mgdl)
  return `${v.toLocaleString('fr-FR', { maximumFractionDigits: u.decimales, minimumFractionDigits: 0 })} ${u.label}`
}

// Plausibilité de saisie (contrôle de saisie, pas d'interprétation médicale) :
// équivalent 20–600 mg/dL, hors de ça la valeur est probablement une erreur d'unité.
export function saisiePlausible(valeur, unite) {
  const u = UNITES[unite] || UNITES.gL
  const mgdl = u.versMgdl(valeur)
  return mgdl >= 20 && mgdl <= 600
}
