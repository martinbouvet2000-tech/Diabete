// Base d'aliments locale (data/aliments.json) : recherche et catégories.
// Format d'un aliment : { n: nom, c: catégorie, g: glucides/100g, p: libellé portion, pg: grammes portion }

export const CATEGORIES = {
  pain: 'Pain & viennoiseries',
  fec: 'Féculents',
  fruit: 'Fruits',
  leg: 'Légumes',
  lait: 'Produits laitiers',
  plat: 'Plats',
  dessert: 'Desserts & sucré',
  boisson: 'Boissons',
  snack: 'Snacks & apéro',
  cereale: 'Petit-déj',
}

let aliments = []

export async function chargerAliments() {
  if (aliments.length) return aliments
  const res = await fetch('data/aliments.json')
  aliments = await res.json()
  for (const a of aliments) {
    a.norm = normaliser(a.n)
    a.glup = Math.round((a.g * a.pg) / 100) // glucides de la portion
  }
  return aliments
}

export function normaliser(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function chercher(q, categorie = null, limite = 30) {
  const nq = normaliser(q || '')
  let res = aliments
  if (categorie) res = res.filter((a) => a.c === categorie)
  if (nq) {
    const mots = nq.split(' ')
    res = res
      .map((a) => {
        let score = 0
        for (const m of mots) {
          if (!a.norm.includes(m)) return null
          score += a.norm.startsWith(m) ? 2 : 1
        }
        return { a, score }
      })
      .filter(Boolean)
      .sort((x, y) => y.score - x.score || x.a.n.localeCompare(y.a.n))
      .map((x) => x.a)
  }
  return res.slice(0, limite)
}
