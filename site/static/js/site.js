// Couche signature du site : révélations au défilement, entête au scroll,
// parallaxe du téléphone. Zéro dépendance ; tout est optionnel et dégradable.
document.documentElement.classList.add('js')

// Révélations au défilement (IntersectionObserver natif)
const io = new IntersectionObserver(
  (entrees) => entrees.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
  { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
)
document.querySelectorAll('.reveal').forEach((el) => io.observe(el))

// L'entête gagne son ombre dès qu'on quitte le sommet
const entete = document.querySelector('.site-header')
if (entete) {
  const maj = () => entete.classList.toggle('scrolled', window.scrollY > 8)
  addEventListener('scroll', maj, { passive: true })
  maj()
}

// Téléphone du héros : inclinaison douce au curseur (souris uniquement)
const tel = document.querySelector('.telephone')
const zone = tel && tel.closest('.hero-visuel')
if (
  tel && zone &&
  matchMedia('(pointer: fine)').matches &&
  !matchMedia('(prefers-reduced-motion: reduce)').matches
) {
  zone.addEventListener('mousemove', (ev) => {
    const r = zone.getBoundingClientRect()
    const x = (ev.clientX - r.left) / r.width - 0.5
    const y = (ev.clientY - r.top) / r.height - 0.5
    tel.style.transform = `rotate(-2deg) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`
  })
  zone.addEventListener('mouseleave', () => { tel.style.transform = '' })
}
