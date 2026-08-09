// Diavie v0 — orchestration de l'app (voir docs/06-architecture-technique.md)
import { VERSION, APP_NAME } from './config.js'
import * as db from './db.js'
import { getPrefs, setPref, UNITES, formatGlycemie, saisiePlausible } from './settings.js'
import { chargerAliments, chercher, CATEGORIES } from './foods.js'
import { scanSupporte, demarrerCamera, arreterCamera, chercherProduit } from './scan.js'
import { agreger, dessinerBarresGlucides, dessinerGlycemies } from './stats.js'

const $ = (sel) => document.querySelector(sel)
const MOMENTS = { 'petit-dej': 'Petit-déjeuner', dejeuner: 'Déjeuner', diner: 'Dîner', collation: 'Collation' }
const CONTEXTES = { 'a-jeun': 'à jeun', 'avant-repas': 'avant repas', 'apres-repas': 'après repas', coucher: 'au coucher', autre: '' }

// Guides du site mis en avant selon le profil (le média intégré à l'app)
const GUIDES = {
  t1: [
    ['Capteur qui se décolle : 12 solutions concrètes', '/blog/capteur-qui-se-decolle/'],
    ['Diabète au restaurant : la méthode simple', '/blog/diabete-au-restaurant/'],
  ],
  t2: [
    ['Le kit des 90 premiers jours', '/kit-90-jours/'],
    ["Pieds et diabète : bien s'en occuper", '/blog/pieds-et-diabete/'],
  ],
  proche: [
    ["Aider sans surveiller : les pieds, mode d'emploi", '/blog/pieds-et-diabete/'],
    ['Le kit des 90 premiers jours (à partager)', '/kit-90-jours/'],
  ],
  decouverte: [
    ['Le kit des 90 premiers jours', '/kit-90-jours/'],
    ['Diabète au restaurant : la méthode simple', '/blog/diabete-au-restaurant/'],
  ],
}

let joursAffiches = 7
let periodeStats = 7
let repasItems = []
let scanEnCours = null

// ---------- Navigation ----------

function montrerVue(nom) {
  for (const v of document.querySelectorAll('.view')) v.classList.add('hidden')
  $(`#view-${nom}`).classList.remove('hidden')
  for (const t of document.querySelectorAll('.tab')) t.classList.toggle('actif', t.dataset.vue === nom)
  if (nom === 'journal') rendreJournal()
  if (nom === 'aliments') rendreAliments()
  if (nom === 'stats') rendreStats()
}

// ---------- Journal ----------

function libelleJour(d) {
  const auj = new Date()
  const hier = new Date(auj.getFullYear(), auj.getMonth(), auj.getDate() - 1)
  const meme = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  if (meme(d, auj)) return "Aujourd'hui"
  if (meme(d, hier)) return 'Hier'
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function htmlEntree(e) {
  const heure = new Date(e.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  let picto = '📝', titre = 'Note', detail = e.note || '', valeur = ''
  if (e.type === 'repas') {
    picto = '🍽️'
    titre = MOMENTS[e.repas.moment] || 'Repas'
    detail = e.repas.aliments.map((a) => a.nom).join(', ')
    valeur = `${e.repas.total} g`
  } else if (e.type === 'glycemie') {
    picto = '🩸'
    titre = 'Glycémie'
    detail = CONTEXTES[e.glycemie.contexte] || ''
    valeur = formatGlycemie(e.glycemie.mgdl)
  } else if (e.type === 'activite') {
    picto = '🏃'
    titre = e.activite.label || 'Activité'
    detail = ''
    valeur = `${e.activite.minutes} min`
  }
  return `<div class="entree" data-id="${e.id}">
    <span class="picto">${picto}</span>
    <div class="corps"><div class="titre">${echapper(titre)} <span class="heure">· ${heure}</span></div>
    ${detail ? `<div class="detail">${echapper(detail)}</div>` : ''}</div>
    ${valeur ? `<span class="valeur">${echapper(valeur)}</span>` : ''}
    <button class="suppr" title="Supprimer" aria-label="Supprimer cette entrée">✕</button>
  </div>`
}

function echapper(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function rendreJournal() {
  const depuis = Date.now() - joursAffiches * 24 * 3600 * 1000
  const entrees = await db.getEntriesSince(depuis)

  const auj = new Date()
  const debutJour = new Date(auj.getFullYear(), auj.getMonth(), auj.getDate()).getTime()
  const duJour = entrees.filter((e) => e.ts >= debutJour)
  const totalJour = duJour.filter((e) => e.type === 'repas').reduce((s, e) => s + e.repas.total, 0)
  $('#total-jour').textContent = String(totalJour)
  const nbGly = duJour.filter((e) => e.type === 'glycemie').length
  $('#resume-jour').textContent = duJour.length
    ? `${duJour.length} saisie${duJour.length > 1 ? 's' : ''}${nbGly ? ` · ${nbGly} glycémie${nbGly > 1 ? 's' : ''}` : ''}`
    : 'Aucune saisie pour l’instant'

  const groupes = new Map()
  for (const e of entrees) {
    const d = new Date(e.ts)
    const cle = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!groupes.has(cle)) groupes.set(cle, { date: d, entrees: [] })
    groupes.get(cle).entrees.push(e)
  }
  $('#liste-entrees').innerHTML = [...groupes.values()]
    .map((g) => `<div class="jour-groupe"><h3>${libelleJour(g.date)}</h3>${g.entrees.map(htmlEntree).join('')}</div>`)
    .join('')
  $('#msg-vide').classList.toggle('hidden', entrees.length > 0)
  $('#btn-voir-plus').classList.toggle('hidden', joursAffiches > 7)
}

function rendreGuides() {
  const liens = GUIDES[getPrefs().profil] || GUIDES.decouverte
  $('#guides-pour-vous').innerHTML =
    `<h3>📚 Guides pour vous</h3>` +
    liens.map(([titre, url]) => `<a href="${url}">${echapper(titre)} →</a>`).join('')
}

// ---------- Dialogue repas ----------

function ouvrirRepas() {
  repasItems = []
  $('#repas-recherche').value = ''
  $('#repas-resultats').innerHTML = ''
  $('#libre-nom').value = ''
  $('#libre-glucides').value = ''
  const h = new Date().getHours()
  $('#repas-moment').value = h < 11 ? 'petit-dej' : h < 15 ? 'dejeuner' : h < 18 ? 'collation' : 'diner'
  rendreRepasItems()
  $('#dlg-repas').showModal()
  $('#repas-recherche').focus()
}

function gluItem(it) {
  return it.g100 != null && it.q != null ? Math.round((it.g100 * it.q) / 100) : Math.round(it.glu || 0)
}

function rendreRepasItems() {
  const conteneur = $('#repas-items')
  conteneur.innerHTML = repasItems
    .map((it, i) => {
      const editable = it.g100 != null
      return `<div class="item" data-i="${i}">
        <span class="nom">${echapper(it.nom)}</span>
        ${editable ? `<input type="number" min="0" max="2000" value="${it.q}" inputmode="numeric" aria-label="Quantité en grammes"><span class="unite">g${it.pLabel ? '' : ''}</span>` : `<span class="unite">direct</span>`}
        <span class="glu-item">${gluItem(it)} g</span>
        <button class="suppr" aria-label="Retirer">✕</button>
      </div>`
    })
    .join('')
  $('#repas-total').textContent = `${repasItems.reduce((s, it) => s + gluItem(it), 0)} g`
}

function ajouterItemLocal(a) {
  repasItems.push({ nom: `${a.n} — ${a.p}`, g100: a.g, q: a.pg, pLabel: a.p })
  $('#repas-recherche').value = ''
  $('#repas-resultats').innerHTML = ''
  rendreRepasItems()
}

async function enregistrerRepas() {
  if (!repasItems.length) {
    $('#dlg-repas').close()
    return
  }
  const total = repasItems.reduce((s, it) => s + gluItem(it), 0)
  await db.addEntry({
    id: db.newId(),
    ts: Date.now(),
    type: 'repas',
    repas: {
      moment: $('#repas-moment').value,
      aliments: repasItems.map((it) => ({ nom: it.nom, glucides: gluItem(it) })),
      total,
    },
  })
  $('#dlg-repas').close()
  rendreJournal()
}

// ---------- Dialogue glycémie ----------

let glyConfirmee = false

function ouvrirGlycemie() {
  const u = UNITES[getPrefs().unite]
  $('#gly-unite-label').textContent = u.label
  $('#gly-valeur').value = ''
  $('#gly-avertissement').classList.add('hidden')
  glyConfirmee = false
  $('#dlg-glycemie').showModal()
  $('#gly-valeur').focus()
}

async function enregistrerGlycemie() {
  const brut = String($('#gly-valeur').value).replace(',', '.')
  const valeur = parseFloat(brut)
  if (!isFinite(valeur) || valeur <= 0) return
  const unite = getPrefs().unite
  if (!saisiePlausible(valeur, unite) && !glyConfirmee) {
    $('#gly-avertissement').classList.remove('hidden')
    glyConfirmee = true
    return
  }
  await db.addEntry({
    id: db.newId(),
    ts: Date.now(),
    type: 'glycemie',
    glycemie: { mgdl: UNITES[unite].versMgdl(valeur), saisie: valeur, unite, contexte: $('#gly-contexte').value },
  })
  $('#dlg-glycemie').close()
  rendreJournal()
}

// ---------- Scan ----------

function ouvrirScan() {
  scanEnCours = null
  $('#scan-resultat').classList.add('hidden')
  $('#scan-code').value = ''
  $('#dlg-scan').showModal()
  const video = $('#scan-video')
  if (scanSupporte()) {
    $('#scan-statut').textContent = 'Visez le code-barres avec la caméra…'
    video.classList.remove('hidden')
    demarrerCamera(video, (code) => {
      $('#scan-code').value = code
      lancerRechercheProduit(code)
    }, () => {
      video.classList.add('hidden')
      $('#scan-statut').textContent = 'Caméra indisponible — saisissez le code ci-dessous.'
    })
  } else {
    $('#scan-statut').textContent = 'Scan caméra non supporté sur ce navigateur — saisissez le code ci-dessous.'
  }
}

async function lancerRechercheProduit(code) {
  $('#scan-statut').textContent = 'Recherche du produit…'
  const produit = await chercherProduit(code.trim())
  if (!produit) {
    $('#scan-statut').textContent = 'Produit introuvable (ou glucides non renseignés). Utilisez l’« ajout libre » du repas.'
    return
  }
  scanEnCours = produit
  $('#scan-nom').textContent = produit.nom
  $('#scan-glucides').textContent = `${produit.g100.toLocaleString('fr-FR')} g de glucides`
  $('#scan-resultat').classList.remove('hidden')
  $('#scan-statut').textContent = 'Produit trouvé :'
}

function fermerScan() {
  arreterCamera($('#scan-video'))
  $('#dlg-scan').close()
}

// ---------- Aliments ----------

let categorieActive = null

async function rendreAliments() {
  await chargerAliments()
  const conteneurCat = $('#categories')
  if (!conteneurCat.childElementCount) {
    conteneurCat.innerHTML =
      `<button class="chip actif" data-cat="">Tout</button>` +
      Object.entries(CATEGORIES).map(([k, v]) => `<button class="chip" data-cat="${k}">${v}</button>`).join('')
  }
  filtrerAliments()
}

function filtrerAliments() {
  const q = $('#recherche-aliments').value
  const res = chercher(q, categorieActive, 40)
  $('#resultats-aliments').innerHTML = res.length
    ? res
        .map(
          (a) => `<div class="aliment"><div><div class="nom">${echapper(a.n)}</div><div class="portion">${echapper(a.p)}</div></div>
          <div class="glu"><strong>${a.glup} g</strong><small>${a.g.toLocaleString('fr-FR')} g / 100 g</small></div></div>`
        )
        .join('')
    : `<p class="vide">Aucun résultat — essayez un mot plus simple (« pain », « riz »…), ou le scan de code-barres depuis un repas.</p>`
}

// ---------- Stats ----------

async function rendreStats() {
  const entrees = await db.getEntriesSince(Date.now() - periodeStats * 24 * 3600 * 1000)
  const agg = agreger(entrees, periodeStats)
  $('#cartes-stats').innerHTML = agg.cartes
    .map((c) => `<div class="carte-stat"><div class="val">${echapper(c.val)}</div><div class="lib">${echapper(c.lib)}</div></div>`)
    .join('')
  dessinerBarresGlucides($('#graph-glucides'), agg.jours)
  dessinerGlycemies($('#graph-glycemies'), agg.glycemies)
}

// ---------- Export / import / rapport ----------

async function exporterJSON() {
  const entries = await db.getAllEntries()
  const blob = new Blob(
    [JSON.stringify({ app: 'diavie', version: VERSION, exporteLe: new Date().toISOString(), prefs: { unite: getPrefs().unite }, entries }, null, 2)],
    { type: 'application/json' }
  )
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `diavie-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

async function importerJSON(fichier) {
  try {
    const data = JSON.parse(await fichier.text())
    if (data.app !== 'diavie' || !Array.isArray(data.entries)) throw new Error('format')
    const valides = data.entries.filter((e) => e && e.id && e.ts && e.type)
    const n = await db.importEntries(valides)
    alert(`${n} entrée(s) importée(s).`)
    rendreJournal()
  } catch {
    alert("Ce fichier ne ressemble pas à une sauvegarde de l'app.")
  }
}

async function imprimerRapport() {
  const entrees = await db.getEntriesSince(Date.now() - 30 * 24 * 3600 * 1000)
  const lignes = entrees
    .slice()
    .reverse()
    .map((e) => {
      const d = new Date(e.ts)
      const quand = `${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
      if (e.type === 'repas')
        return `<tr><td>${quand}</td><td>Repas — ${MOMENTS[e.repas.moment] || ''}</td><td>${echapper(e.repas.aliments.map((a) => a.nom).join(', '))}</td><td>${e.repas.total} g</td><td></td></tr>`
      if (e.type === 'glycemie')
        return `<tr><td>${quand}</td><td>Glycémie ${CONTEXTES[e.glycemie.contexte] || ''}</td><td></td><td></td><td>${formatGlycemie(e.glycemie.mgdl)}</td></tr>`
      if (e.type === 'activite')
        return `<tr><td>${quand}</td><td>Activité</td><td>${echapper(e.activite.label || '')} (${e.activite.minutes} min)</td><td></td><td></td></tr>`
      return `<tr><td>${quand}</td><td>Note</td><td>${echapper(e.note || '')}</td><td></td><td></td></tr>`
    })
    .join('')
  $('#rapport').innerHTML = `
    <h1>${APP_NAME} — journal des 30 derniers jours</h1>
    <p>Édité le ${new Date().toLocaleDateString('fr-FR')} — document préparé par le patient avec l'application ${APP_NAME} (saisies personnelles, glucides estimés).</p>
    <table><thead><tr><th>Date</th><th>Type</th><th>Détail</th><th>Glucides</th><th>Glycémie</th></tr></thead><tbody>${lignes}</tbody></table>
    <p class="note-rapport">Les glucides sont des estimations saisies par le patient. Ce document n'est pas un dispositif médical.</p>`
  window.print()
}

// ---------- Initialisation ----------

function initEvenements() {
  for (const t of document.querySelectorAll('.tab')) t.addEventListener('click', () => montrerVue(t.dataset.vue))

  for (const b of document.querySelectorAll('.btn-action'))
    b.addEventListener('click', () => {
      const type = b.dataset.add
      if (type === 'repas') ouvrirRepas()
      if (type === 'glycemie') ouvrirGlycemie()
      if (type === 'activite') { $('#act-label').value = ''; $('#act-minutes').value = ''; $('#dlg-activite').showModal() }
      if (type === 'note') { $('#note-texte').value = ''; $('#dlg-note').showModal() }
    })

  $('#liste-entrees').addEventListener('click', async (ev) => {
    const btn = ev.target.closest('button.suppr')
    if (!btn) return
    const id = btn.closest('.entree').dataset.id
    if (confirm('Supprimer cette entrée ?')) {
      await db.deleteEntry(id)
      rendreJournal()
    }
  })

  $('#btn-voir-plus').addEventListener('click', () => { joursAffiches = 30; rendreJournal() })

  // Repas
  $('#repas-recherche').addEventListener('input', async () => {
    await chargerAliments()
    const q = $('#repas-recherche').value
    const res = q.trim() ? chercher(q, null, 6) : []
    $('#repas-resultats').innerHTML = res
      .map((a, i) => `<button type="button" data-i="${i}"><span>${echapper(a.n)}</span><span class="p">${echapper(a.p)} · ${a.glup} g</span></button>`)
      .join('')
    $('#repas-resultats').dataset.resultats = JSON.stringify(res)
  })
  $('#repas-resultats').addEventListener('click', (ev) => {
    const btn = ev.target.closest('button')
    if (!btn) return
    const res = JSON.parse($('#repas-resultats').dataset.resultats || '[]')
    ajouterItemLocal(res[Number(btn.dataset.i)])
  })
  $('#repas-items').addEventListener('input', (ev) => {
    const item = ev.target.closest('.item')
    if (!item) return
    repasItems[Number(item.dataset.i)].q = Math.max(0, Number(ev.target.value) || 0)
    rendreRepasItems()
  })
  $('#repas-items').addEventListener('click', (ev) => {
    const btn = ev.target.closest('button.suppr')
    if (!btn) return
    repasItems.splice(Number(btn.closest('.item').dataset.i), 1)
    rendreRepasItems()
  })
  $('#btn-libre-ajouter').addEventListener('click', () => {
    const nom = $('#libre-nom').value.trim()
    const glu = parseFloat(String($('#libre-glucides').value).replace(',', '.'))
    if (!nom || !isFinite(glu) || glu < 0) return
    repasItems.push({ nom, g100: null, q: null, glu })
    $('#libre-nom').value = ''
    $('#libre-glucides').value = ''
    rendreRepasItems()
  })
  $('#btn-repas-enregistrer').addEventListener('click', enregistrerRepas)

  // Glycémie / activité / note
  $('#btn-gly-enregistrer').addEventListener('click', enregistrerGlycemie)
  $('#btn-act-enregistrer').addEventListener('click', async () => {
    const minutes = parseInt($('#act-minutes').value, 10)
    if (!isFinite(minutes) || minutes <= 0) return
    await db.addEntry({ id: db.newId(), ts: Date.now(), type: 'activite', activite: { label: $('#act-label').value.trim() || 'Activité', minutes } })
    $('#dlg-activite').close()
    rendreJournal()
  })
  $('#btn-note-enregistrer').addEventListener('click', async () => {
    const texte = $('#note-texte').value.trim()
    if (!texte) return
    await db.addEntry({ id: db.newId(), ts: Date.now(), type: 'note', note: texte })
    $('#dlg-note').close()
    rendreJournal()
  })

  // Scan
  $('#btn-scan').addEventListener('click', ouvrirScan)
  $('#btn-scan-chercher').addEventListener('click', () => {
    const code = $('#scan-code').value.trim()
    if (code) lancerRechercheProduit(code)
  })
  $('#btn-scan-utiliser').addEventListener('click', () => {
    if (!scanEnCours) return
    repasItems.push({ nom: scanEnCours.nom, g100: scanEnCours.g100, q: 100, pLabel: null })
    rendreRepasItems()
    fermerScan()
  })

  // Aliments
  $('#recherche-aliments').addEventListener('input', filtrerAliments)
  $('#categories').addEventListener('click', (ev) => {
    const chip = ev.target.closest('.chip')
    if (!chip) return
    categorieActive = chip.dataset.cat || null
    for (const c of $('#categories').children) c.classList.toggle('actif', c === chip)
    filtrerAliments()
  })

  // Stats
  for (const chip of document.querySelectorAll('[data-periode]'))
    chip.addEventListener('click', () => {
      periodeStats = Number(chip.dataset.periode)
      for (const c of document.querySelectorAll('[data-periode]')) c.classList.toggle('actif', c === chip)
      rendreStats()
    })
  $('#btn-imprimer').addEventListener('click', imprimerRapport)

  // Réglages
  $('#select-unite').value = getPrefs().unite
  $('#select-unite').addEventListener('change', () => { setPref('unite', $('#select-unite').value); rendreJournal() })
  $('#select-profil').value = getPrefs().profil
  $('#select-profil').addEventListener('change', () => { setPref('profil', $('#select-profil').value); rendreGuides() })
  $('#check-texte-grand').checked = getPrefs().texteGrand
  $('#check-texte-grand').addEventListener('change', () => {
    setPref('texteGrand', $('#check-texte-grand').checked)
    document.documentElement.classList.toggle('texte-grand', $('#check-texte-grand').checked)
  })
  $('#btn-export').addEventListener('click', exporterJSON)
  $('#input-import').addEventListener('change', (ev) => { if (ev.target.files[0]) importerJSON(ev.target.files[0]); ev.target.value = '' })
  $('#btn-effacer').addEventListener('click', async () => {
    if (confirm('Effacer TOUTES vos données de cet appareil ? Cette action est définitive.') && confirm('Vraiment sûr·e ? Pensez à exporter une sauvegarde avant.')) {
      await db.clearAll()
      rendreJournal()
    }
  })

  // Fermeture générique des dialogues
  for (const b of document.querySelectorAll('[data-fermer]'))
    b.addEventListener('click', () => {
      const dlg = b.closest('dialog')
      if (dlg.id === 'dlg-scan') fermerScan()
      else dlg.close()
    })
}

async function init() {
  $('#version').textContent = `v${VERSION}`
  document.documentElement.classList.toggle('texte-grand', getPrefs().texteGrand)
  initEvenements()
  if (!getPrefs().bienvenueVue) {
    $('#dlg-bienvenue').showModal()
    for (const b of document.querySelectorAll('[data-profil]'))
      b.addEventListener('click', () => {
        setPref('profil', b.dataset.profil)
        setPref('bienvenueVue', true)
        $('#select-profil').value = b.dataset.profil
        $('#dlg-bienvenue').close()
        rendreGuides()
      })
  }
  rendreGuides()
  await rendreJournal()
  chargerAliments()
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {})
  }
}

init()
