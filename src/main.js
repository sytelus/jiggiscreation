import { createSilkSculpture } from './sculpture.js';

document.querySelector('#year').textContent = new Date().getFullYear();
const surface = document.querySelector('#sculpture');
const controls = document.querySelector('.sculpture-controls');
const motionButton = document.querySelector('#motion-toggle');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduceMotion.matches;
let sculpture;

function syncMotion() {
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.setAttribute('aria-label', paused ? 'Play sculpture animation' : 'Pause sculpture animation');
  motionButton.querySelector('span').textContent = paused ? '▷' : 'Ⅱ';
  motionButton.querySelector('.motion-label').textContent = paused ? 'Play motion' : 'Pause motion';
  sculpture?.setPaused(paused);
}

try {
  sculpture = createSilkSculpture(document.querySelector('#silk-canvas'), {
    paused,
    onReady: () => { surface.classList.add('ready'); controls.hidden = false; },
    onLost: () => { surface.classList.remove('ready'); controls.hidden = true; }
  });
} catch (error) {
  // The static illustration and all content stay available without WebGL.
  console.info('Showing the still fabric illustration.', error.message);
  controls.hidden = true;
}
syncMotion();
motionButton.addEventListener('click', () => { paused = !paused; syncMotion(); });
reduceMotion.addEventListener('change', event => { paused = event.matches; syncMotion(); });

document.querySelectorAll('[data-palette]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-palette]').forEach(swatch => swatch.setAttribute('aria-pressed', String(swatch === button)));
    sculpture?.setPalette(button.dataset.palette);
  });
});

// Defer any reveal animation until content is visible; reduced-motion users see a still page.
if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      if (reduceMotion.matches) { observer.unobserve(entry.target); continue; }
      entry.target.animate([{ opacity: .35, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'ease-out' });
      observer.unobserve(entry.target);
    }
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
