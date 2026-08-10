// Vérifications rapides : syntaxe de tous les modules JS + validité du JSON aliments.
// Usage : node site/check.mjs
import { readFile, readdir, writeFile, mkdir, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const SITE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.dirname(SITE)
let erreurs = 0

async function checkJs(fichier) {
  // node --check exige l'extension .mjs pour la syntaxe module : copie temporaire.
  const tmp = path.join(tmpdir(), 'diavie-check')
  await mkdir(tmp, { recursive: true })
  const cible = path.join(tmp, path.basename(fichier).replace(/\.js$/, '.mjs'))
  await writeFile(cible, await readFile(fichier, 'utf8'))
  const res = spawnSync('node', ['--check', cible], { encoding: 'utf8' })
  if (res.status !== 0) {
    erreurs++
    console.error(`❌ ${path.relative(ROOT, fichier)}\n${res.stderr}`)
  } else {
    console.log(`✅ ${path.relative(ROOT, fichier)}`)
  }
  await rm(cible, { force: true })
}

// 1. Modules de l'app + service worker
const jsDir = path.join(ROOT, 'app', 'js')
for (const f of (await readdir(jsDir)).filter((f) => f.endsWith('.js'))) await checkJs(path.join(jsDir, f))
await checkJs(path.join(ROOT, 'app', 'sw.js'))

// 2. Scripts du site
for (const f of ['build.mjs', 'config.mjs']) await checkJs(path.join(SITE, f))
await checkJs(path.join(SITE, 'static', 'js', 'site.js'))

// 3. JSON aliments
try {
  const data = JSON.parse(await readFile(path.join(ROOT, 'app', 'data', 'aliments.json'), 'utf8'))
  const invalides = data.filter(
    (a) => typeof a.n !== 'string' || typeof a.c !== 'string' || typeof a.g !== 'number' || typeof a.pg !== 'number' || a.g < 0 || a.g > 100 || a.pg <= 0
  )
  if (invalides.length) {
    erreurs++
    console.error(`❌ aliments.json : ${invalides.length} entrée(s) invalide(s)`, invalides.slice(0, 3))
  } else {
    console.log(`✅ app/data/aliments.json — ${data.length} aliments valides`)
  }
} catch (e) {
  erreurs++
  console.error('❌ aliments.json illisible :', e.message)
}

if (erreurs) {
  console.error(`\n${erreurs} problème(s) détecté(s).`)
  process.exit(1)
}
console.log('\nTout est bon.')
