// Scan de code-barres : API native BarcodeDetector si disponible, sinon saisie
// manuelle. La recherche produit interroge Open Food Facts avec le seul code.

let flux = null
let arret = false

export function scanSupporte() {
  return 'BarcodeDetector' in window && !!navigator.mediaDevices?.getUserMedia
}

export async function demarrerCamera(video, surCode, surErreur) {
  arret = false
  try {
    flux = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    })
    video.srcObject = flux
    await video.play()
    const detecteur = new BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
    })
    const boucle = async () => {
      if (arret) return
      try {
        const codes = await detecteur.detect(video)
        if (codes.length) {
          surCode(codes[0].rawValue)
          return
        }
      } catch {}
      setTimeout(boucle, 250)
    }
    boucle()
  } catch (e) {
    surErreur(e)
  }
}

export function arreterCamera(video) {
  arret = true
  if (flux) {
    for (const piste of flux.getTracks()) piste.stop()
    flux = null
  }
  if (video) video.srcObject = null
}

// Retourne { nom, g100 } ou null si produit introuvable / sans glucides renseignés.
export async function chercherProduit(code) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 6000)
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_fr,nutriments`,
      { signal: ctrl.signal }
    )
    if (!res.ok) return null
    const data = await res.json()
    const p = data.product
    if (!p) return null
    const g100 = p.nutriments?.carbohydrates_100g
    if (typeof g100 !== 'number') return null
    return { nom: p.product_name_fr || p.product_name || `Produit ${code}`, g100 }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
