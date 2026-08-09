// Générateur statique zéro dépendance (Node >= 18) — voir docs/06-architecture-technique.md
// Usage : node site/build.mjs   →  sortie dans site/dist/
import { readFile, writeFile, mkdir, readdir, rm, cp, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import config from './config.mjs'

const SITE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.dirname(SITE)
const DIST = path.join(SITE, 'dist')

// ---------- Markdown (sous-ensemble maîtrisé) ----------

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inline(s) {
  return escapeHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, txt, url) => {
      const ext = /^https?:\/\//.test(url) && !url.startsWith(config.siteUrl)
      return `<a href="${url}"${ext ? ' rel="noopener"' : ''}>${txt}</a>`
    })
}

function mdToHtml(md) {
  const lines = md.split(/\r?\n/)
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) { i++; continue }

    // Titres
    const h = line.match(/^(#{1,4})\s+(.*)$/)
    if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue }

    // Séparateur
    if (/^-{3,}\s*$/.test(line)) { out.push('<hr>'); i++; continue }

    // Citation (bloc)
    if (line.startsWith('>')) {
      const buf = []
      while (i < lines.length && lines[i].startsWith('>')) {
        buf.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      out.push(`<blockquote><p>${buf.map(inline).join('<br>')}</p></blockquote>`)
      continue
    }

    // Tableau
    if (line.trim().startsWith('|')) {
      const rows = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(lines[i].trim())
        i++
      }
      const parse = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
      const header = parse(rows[0])
      const body = rows.slice(rows[1] && /^\|[\s\-:|]+\|$/.test(rows[1]) ? 2 : 1).map(parse)
      let t = '<div class="table-scroll"><table><thead><tr>'
      t += header.map((c) => `<th>${inline(c)}</th>`).join('')
      t += '</tr></thead><tbody>'
      for (const r of body) t += '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>'
      t += '</tbody></table></div>'
      out.push(t)
      continue
    }

    // Listes (à puces, cases à cocher, numérotées)
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line)
      const re = ordered ? /^\d+\.\s+/ : /^[-*]\s+/
      const items = []
      while (i < lines.length && re.test(lines[i])) {
        let item = lines[i].replace(re, '')
        const box = item.match(/^\[( |x)\]\s+(.*)$/i)
        if (box) {
          item = `<label class="check"><input type="checkbox" disabled${box[1].toLowerCase() === 'x' ? ' checked' : ''}> ${inline(box[2])}</label>`
        } else {
          item = inline(item)
        }
        items.push(`<li>${item}</li>`)
        i++
      }
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`)
      continue
    }

    // Paragraphe (lignes consécutives)
    const buf = [line]
    i++
    while (
      i < lines.length && lines[i].trim() &&
      !/^(#{1,4}\s|[-*]\s|\d+\.\s|>|\||-{3,}\s*$)/.test(lines[i])
    ) {
      buf.push(lines[i])
      i++
    }
    out.push(`<p>${buf.map(inline).join(' ')}</p>`)
  }
  return out.join('\n')
}

// ---------- Front matter ----------

function parseFrontMatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { meta: {}, body: raw }
  const meta = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!kv) continue
    let v = kv[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    meta[kv[1]] = v
  }
  return { meta, body: raw.slice(m[0].length) }
}

// ---------- Rendu ----------

function applyTokens(html, tokens) {
  return html.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in tokens ? tokens[k] : m))
}

async function renderPage(layout, { meta, body, urlPath }) {
  const dateFr = meta.date
    ? new Date(meta.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
  const headerExtra = meta.date || meta.statut
    ? `<header class="article-entete"><h1>${escapeHtml(meta.title)}</h1><p class="meta">${dateFr ? `Publié le ${dateFr}` : ''}${meta.statut ? ` <span class="statut-relecture">${escapeHtml(meta.statut)}</span>` : ''}</p></header>`
    : `<header class="article-entete"><h1>${escapeHtml(meta.title)}</h1></header>`
  let html = applyTokens(layout, {
    TITLE: escapeHtml(meta.title),
    DESCRIPTION: escapeHtml(meta.description || config.description),
    CANONICAL: config.siteUrl + urlPath,
    CONTENT: mdToHtml(body),
    HEADER_EXTRA: headerExtra,
    FOOTER_EXTRA: meta.noindex ? '' : `<p class="prose" style="margin-top:2.5rem"><a href="/blog/">← Tous les articles</a> · <a href="/#newsletter">Recevoir la newsletter</a></p>`,
    SITE_NAME: config.siteName,
    SITE_URL: config.siteUrl,
    TAGLINE: config.tagline,
  })
  if (meta.noindex) html = html.replace('</head>', '  <meta name="robots" content="noindex">\n</head>')
  const outDir = path.join(DIST, urlPath.replace(/^\//, '').replace(/\/$/, ''))
  await mkdir(outDir, { recursive: true })
  await writeFile(path.join(outDir, 'index.html'), html)
}

async function readContent(dir) {
  const full = path.join(SITE, 'content', dir)
  let files = []
  try { files = (await readdir(full)).filter((f) => f.endsWith('.md')) } catch { return [] }
  const items = []
  for (const f of files) {
    const raw = await readFile(path.join(full, f), 'utf8')
    const { meta, body } = parseFrontMatter(raw)
    const slug = f.replace(/\.md$/, '')
    items.push({ meta, body, slug })
  }
  return items
}

// ---------- Build ----------

async function main() {
  await rm(DIST, { recursive: true, force: true })
  await mkdir(DIST, { recursive: true })

  // 1. Statique
  await cp(path.join(SITE, 'static'), DIST, { recursive: true })

  const layout = await readFile(path.join(SITE, 'templates', 'layout.html'), 'utf8')
  const urls = ['/']

  // 2. Articles
  const articles = (await readContent('articles')).sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1))
  for (const a of articles) {
    a.urlPath = `/blog/${a.slug}/`
    await renderPage(layout, a)
    urls.push(a.urlPath)
  }

  // 3. Pages (kit, légal…)
  const pages = await readContent('pages')
  for (const p of pages) {
    p.urlPath = p.meta.path || `/${p.slug}/`
    await renderPage(layout, p)
    if (!p.meta.noindex) urls.push(p.urlPath)
  }

  // 4. Index du blog
  const cards = articles.map((a) => `
    <a class="carte-lien" href="${a.urlPath}"><div class="carte">
      <span class="emoji">${a.meta.emoji || '📝'}</span>
      <p class="meta">${a.meta.cluster || 'Guide'}</p>
      <h3>${escapeHtml(a.meta.title)}</h3>
      <p>${escapeHtml(a.meta.description || '')}</p>
    </div></a>`)
  const blogBody = `## Tous les guides\n\nDes guides concrets pour le quotidien, écrits patient-à-patient. Chaque article affiche son statut de relecture médicale.\n`
  await renderPage(layout, {
    meta: { title: 'Les guides du quotidien', description: `Tous les guides pratiques ${config.siteName} : vie sociale, voyage, matériel, démarches.` },
    body: blogBody,
    urlPath: '/blog/',
  })
  // injecte les cartes après le contenu de l'index blog
  const blogFile = path.join(DIST, 'blog', 'index.html')
  let blogHtml = await readFile(blogFile, 'utf8')
  blogHtml = blogHtml.replace('</article>', `</article>\n<div class="cartes" style="margin-top:24px">${cards.join('\n')}</div>`)
  await writeFile(blogFile, blogHtml)
  urls.push('/blog/')

  // 5. Landing : tokens + derniers articles
  const idxFile = path.join(DIST, 'index.html')
  let idx = await readFile(idxFile, 'utf8')
  idx = idx.replace('<!--ARTICLES_RECENTS-->', cards.slice(0, 3).join('\n'))
  // 5b. Formulaire Brevo si configuré (sinon Netlify Forms par défaut)
  if (config.formAction) {
    idx = idx
      .replace(/ action="\/merci\/" data-netlify="true" netlify-honeypot="bot-field"/, ` action="${config.formAction}" method="POST"`)
      .replace(/<input type="hidden" name="form-name" value="newsletter">\s*/, '')
  }
  await writeFile(idxFile, applyTokens(idx, { SITE_NAME: config.siteName, SITE_URL: config.siteUrl, TAGLINE: config.tagline, DESCRIPTION: config.description }))

  // 6. Tokens sur les pages statiques restantes (merci…)
  const merciFile = path.join(DIST, 'merci', 'index.html')
  try {
    const merci = await readFile(merciFile, 'utf8')
    await writeFile(merciFile, applyTokens(merci, { SITE_NAME: config.siteName, SITE_URL: config.siteUrl, TAGLINE: config.tagline }))
  } catch {}

  // 7. App copiée dans /app
  await cp(path.join(ROOT, 'app'), path.join(DIST, 'app'), { recursive: true })
  urls.push('/app/')
  // Si le nom de marque change, répercuter dans l'app copiée (les sources restent intactes)
  if (config.siteName !== 'Diavie') {
    for (const f of ['index.html', 'manifest.webmanifest', 'js/config.js']) {
      const p = path.join(DIST, 'app', f)
      try {
        const c = await readFile(p, 'utf8')
        await writeFile(p, c.replaceAll('Diavie', config.siteName))
      } catch {}
    }
  }

  // 8. Sitemap + robots
  const today = new Date().toISOString().slice(0, 10)
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${config.siteUrl}${u}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`
  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap)
  await writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n`)

  console.log(`✅ Build OK — ${urls.length} URL(s) dans ${path.relative(ROOT, DIST)}/`)
  for (const u of urls) console.log('   ' + u)
}

main().catch((e) => { console.error('❌ Build échoué :', e); process.exit(1) })
