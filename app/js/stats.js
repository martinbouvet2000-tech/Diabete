// Statistiques descriptives + graphiques canvas. Aucune interprétation médicale :
// pas de zones cibles, pas de seuils colorés (voir docs/02-reglementation.md §2).
import { formatGlycemie } from './settings.js'

export function agreger(entrees, jours) {
  const maintenant = new Date()
  const debut = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() - (jours - 1))
  const parJour = new Map()
  for (let i = 0; i < jours; i++) {
    const d = new Date(debut.getFullYear(), debut.getMonth(), debut.getDate() + i)
    parJour.set(cleJour(d), { date: d, glucides: 0, nb: 0 })
  }
  const glycemies = []
  for (const e of entrees) {
    const k = cleJour(new Date(e.ts))
    const jour = parJour.get(k)
    if (!jour) continue
    jour.nb++
    if (e.type === 'repas') jour.glucides += e.repas.total
    if (e.type === 'glycemie') glycemies.push({ ts: e.ts, mgdl: e.glycemie.mgdl })
  }
  const joursArr = [...parJour.values()]
  const joursSaisis = joursArr.filter((j) => j.nb > 0).length
  const totalGlucides = joursArr.reduce((s, j) => s + j.glucides, 0)
  const mgdls = glycemies.map((g) => g.mgdl)
  return {
    jours: joursArr,
    glycemies: glycemies.sort((a, b) => a.ts - b.ts),
    cartes: [
      { val: String(joursSaisis), lib: `jour${joursSaisis > 1 ? 's' : ''} avec saisies (sur ${jours})` },
      { val: joursSaisis ? Math.round(totalGlucides / joursSaisis) + ' g' : '—', lib: 'glucides / jour saisi (moyenne)' },
      { val: String(mgdls.length), lib: 'glycémies saisies' },
      { val: mgdls.length ? formatGlycemie(mgdls.reduce((a, b) => a + b, 0) / mgdls.length) : '—', lib: 'glycémie moyenne (de vos saisies)' },
      { val: mgdls.length ? formatGlycemie(Math.min(...mgdls)) : '—', lib: 'plus basse saisie' },
      { val: mgdls.length ? formatGlycemie(Math.max(...mgdls)) : '—', lib: 'plus haute saisie' },
    ],
  }
}

function cleJour(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function prepCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1
  const largeur = canvas.clientWidth || 600
  const hauteur = canvas.getAttribute('height') ? Number(canvas.getAttribute('height')) : 180
  canvas.width = largeur * dpr
  canvas.height = hauteur * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, largeur, hauteur)
  ctx.font = '12px system-ui'
  return { ctx, largeur, hauteur }
}

// Barre à sommet arrondi (repli net si roundRect n'existe pas)
function barreArrondie(ctx, x, y, l, h) {
  const r = Math.min(6, l / 2, h)
  if (ctx.roundRect) {
    ctx.beginPath()
    ctx.roundRect(x, y, l, h, [r, r, 0, 0])
    ctx.fill()
  } else {
    ctx.fillRect(x, y, l, h)
  }
}

export function dessinerBarresGlucides(canvas, jours) {
  const { ctx, largeur, hauteur } = prepCanvas(canvas)
  const marge = { haut: 20, bas: 24, gauche: 34, droite: 8 }
  const zoneL = largeur - marge.gauche - marge.droite
  const zoneH = hauteur - marge.haut - marge.bas
  const max = Math.max(60, ...jours.map((j) => j.glucides))
  const pas = zoneL / jours.length

  ctx.strokeStyle = '#F0EAE0'
  ctx.fillStyle = '#8A97A3'
  for (const t of [0, Math.round(max / 2), max]) {
    const y = marge.haut + zoneH - (t / max) * zoneH
    ctx.beginPath()
    ctx.moveTo(marge.gauche, y)
    ctx.lineTo(largeur - marge.droite, y)
    ctx.stroke()
    ctx.fillText(String(t), 4, y + 4)
  }
  jours.forEach((j, i) => {
    const h = (j.glucides / max) * zoneH
    const x = marge.gauche + i * pas + pas * 0.15
    const l = pas * 0.7
    ctx.fillStyle = '#E2725B'
    barreArrondie(ctx, x, marge.haut + zoneH - h, l, h)
    if (jours.length <= 7 && j.glucides > 0) {
      ctx.fillStyle = '#C85A44'
      ctx.textAlign = 'center'
      ctx.fillText(String(j.glucides), x + l / 2, marge.haut + zoneH - h - 5)
      ctx.textAlign = 'left'
    }
    if (jours.length <= 10 || i % Math.ceil(jours.length / 8) === 0) {
      ctx.fillStyle = '#8A97A3'
      ctx.fillText(`${j.date.getDate()}/${j.date.getMonth() + 1}`, marge.gauche + i * pas + 2, hauteur - 8)
    }
  })
}

export function dessinerGlycemies(canvas, glycemies) {
  const { ctx, largeur, hauteur } = prepCanvas(canvas)
  if (!glycemies.length) {
    ctx.fillStyle = '#4A5A68'
    ctx.fillText('Aucune glycémie saisie sur la période.', 12, hauteur / 2)
    return
  }
  const marge = { haut: 14, bas: 24, gauche: 40, droite: 8 }
  const zoneL = largeur - marge.gauche - marge.droite
  const zoneH = hauteur - marge.haut - marge.bas
  const vals = glycemies.map((g) => g.mgdl)
  const min = Math.min(...vals) * 0.9
  const max = Math.max(...vals) * 1.1
  const t0 = glycemies[0].ts
  const t1 = glycemies[glycemies.length - 1].ts || t0 + 1
  const x = (ts) => marge.gauche + (t1 === t0 ? zoneL / 2 : ((ts - t0) / (t1 - t0)) * zoneL)
  const y = (v) => marge.haut + zoneH - ((v - min) / (max - min || 1)) * zoneH

  ctx.strokeStyle = '#F0EAE0'
  ctx.fillStyle = '#8A97A3'
  for (const t of [min, (min + max) / 2, max]) {
    const yy = y(t)
    ctx.beginPath()
    ctx.moveTo(marge.gauche, yy)
    ctx.lineTo(largeur - marge.droite, yy)
    ctx.stroke()
    ctx.fillText(formatGlycemie(t).split(' ')[0], 4, yy + 4)
  }
  if (glycemies.length > 1) {
    // Aplat très léger sous la courbe — purement esthétique, aucune zone « cible »
    ctx.beginPath()
    glycemies.forEach((g, i) => (i ? ctx.lineTo(x(g.ts), y(g.mgdl)) : ctx.moveTo(x(g.ts), y(g.mgdl))))
    ctx.lineTo(x(glycemies[glycemies.length - 1].ts), marge.haut + zoneH)
    ctx.lineTo(x(glycemies[0].ts), marge.haut + zoneH)
    ctx.closePath()
    ctx.fillStyle = 'rgba(122, 158, 126, .13)'
    ctx.fill()

    ctx.strokeStyle = '#7A9E7E'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.beginPath()
    glycemies.forEach((g, i) => (i ? ctx.lineTo(x(g.ts), y(g.mgdl)) : ctx.moveTo(x(g.ts), y(g.mgdl))))
    ctx.stroke()
  }
  for (const g of glycemies) {
    ctx.beginPath()
    ctx.arc(x(g.ts), y(g.mgdl), 3.5, 0, Math.PI * 2)
    ctx.fillStyle = '#3E5D42'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
}
