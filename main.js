/* ══════════════════════════════════════════
   SUMMER CAMP SOMERSON — main.js
   Módulos:
   1. Navbar — scroll class + mobile toggle
   2. Canvas Bubbles — animación hero
   3. Hero Scroll Fade — fade-out + parallax
   4. Intersection Observer — fade-up elements
   5. Form — submit feedback
══════════════════════════════════════════ */

/* ──────────────────────────────────────────
   1. NAVBAR — scroll class + mobile toggle
──────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

// Add .scrolled class after 30px of scroll to trigger glassmorphism
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) navbar.classList.add('scrolled');
  else                      navbar.classList.remove('scrolled');
}, { passive: true });

// Mobile menu toggle
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile menu when any link is tapped
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});


/* ──────────────────────────────────────────
   2. CANVAS BUBBLES
   Burbujas flotantes con brillo especular,
   rebote lateral y oscilación sinusoidal.
──────────────────────────────────────────── */
const canvas = document.getElementById('bubbleCanvas');
const ctx    = canvas.getContext('2d');

const COLORS = [
  'rgba(127,216,255,0.55)',
  'rgba(255,255,255,0.35)',
  'rgba(100,220,180,0.45)',
  'rgba(255,200,80,0.40)',
  'rgba(200,140,255,0.40)',
  'rgba(80,200,255,0.50)',
  'rgba(255,120,160,0.38)',
];

let bubbles = [], W, H;

/** Ajusta el canvas al tamaño real del elemento */
function resize() {
  W = canvas.width  = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
}
resize();
window.addEventListener('resize', () => { resize(); spawnBubbles(); });

/**
 * Crea un objeto burbuja con posición, velocidad y propiedades visuales.
 * @param {boolean} randomY — true: posición Y aleatoria (inicio);
 *                            false: aparece por la base (bucle continuo)
 */
function makeBubble(randomY = false) {
  const r = 8 + Math.random() * 38;
  return {
    x:           r + Math.random() * (W - r * 2),
    y:           randomY ? Math.random() * H : H + r * 2,
    r,
    color:       COLORS[Math.floor(Math.random() * COLORS.length)],
    vx:          (Math.random() - 0.5) * 0.6,
    vy:          -(0.25 + Math.random() * 0.55),
    wobblePhase: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.012 + Math.random() * 0.02,
    wobbleAmp:   0.5 + Math.random() * 1.5,
    alpha:       0.5 + Math.random() * 0.5,
  };
}

/** Inicializa el arreglo de burbujas según el área del canvas */
function spawnBubbles() {
  const count = Math.floor((W * H) / 22000);
  bubbles = Array.from({ length: count }, () => makeBubble(true));
}
spawnBubbles();

/**
 * Dibuja una burbuja individual con:
 * - gradiente radial (efecto esférico)
 * - borde translúcido
 * - punto de brillo especular
 */
function drawBubble(b) {
  ctx.save();
  ctx.globalAlpha = b.alpha;

  const grad = ctx.createRadialGradient(
    b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.05,
    b.x, b.y, b.r
  );
  grad.addColorStop(0, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.5, b.color);
  grad.addColorStop(1, b.color.replace(/[\d.]+\)$/, '0.05)'));

  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Borde
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r - 1, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Brillo especular
  ctx.beginPath();
  ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.3, b.r * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fill();

  ctx.restore();
}

/** Loop de animación principal */
function animate() {
  ctx.clearRect(0, 0, W, H);

  bubbles.forEach(b => {
    b.wobblePhase += b.wobbleSpeed;
    b.x += b.vx + Math.sin(b.wobblePhase) * b.wobbleAmp * 0.05;
    b.y += b.vy;

    // Rebote en paredes laterales
    if (b.x - b.r < 0) { b.x = b.r;     b.vx =  Math.abs(b.vx); }
    if (b.x + b.r > W) { b.x = W - b.r; b.vx = -Math.abs(b.vx); }

    // Reiniciar si sale por arriba
    if (b.y + b.r < 0) Object.assign(b, makeBubble(false));

    drawBubble(b);
  });

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);


/* ──────────────────────────────────────────
   3. HERO SCROLL FADE
   Desvanece y reduce levemente el hero
   conforme el usuario hace scroll.
   También aplica parallax al canvas.
──────────────────────────────────────────── */
const heroEl      = document.getElementById('hero');
const heroContent = document.getElementById('heroContent');

function onScroll() {
  const scrollY  = window.scrollY;
  const vh       = window.innerHeight;

  // progress: 0 (en el top) → 1 (al 75% del viewport)
  const progress = Math.min(Math.max((scrollY - vh * 0.05) / (vh * 0.7), 0), 1);
  const opacity  = 1 - progress;

  heroEl.style.opacity      = opacity;
  heroEl.style.transform    = `scale(${1 - progress * 0.04})`;
  heroContent.style.opacity = opacity;

  // Parallax suave en las burbujas
  canvas.style.transform = `translateY(${scrollY * 0.25}px)`;
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // ejecutar al cargar para estado inicial correcto


/* ──────────────────────────────────────────
   4. INTERSECTION OBSERVER — fade-up
   Anima con stagger los elementos .desc-block
   y .fade-up al entrar en el viewport.
──────────────────────────────────────────── */
const allFadeTargets = document.querySelectorAll('.desc-block, .fade-up');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = Array.from(allFadeTargets).indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 80);
      observer.unobserve(entry.target); // solo una vez
    }
  });
}, { threshold: 0.1 });

allFadeTargets.forEach(el => observer.observe(el));


/* ──────────────────────────────────────────
   5. FORM — submit feedback
   Cambia el botón a estado de confirmación
   visual al hacer clic.
──────────────────────────────────────────── */
document.querySelector('.btn-submit').addEventListener('click', function () {
  this.textContent = '✅ Solicitud enviada — ¡Te contactaremos pronto!';
  this.style.background = 'linear-gradient(135deg, #06d6a0, #0096c7)';
  this.disabled = true;
});