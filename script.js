const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const menuButton = document.querySelector('.menu');
const mobileNav = document.querySelector('.mobile-nav');

function closeMenu() {
  mobileNav.classList.remove('open');
  mobileNav.setAttribute('aria-hidden', 'true');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = 'Menu';
  document.body.style.overflow = '';
}

menuButton.addEventListener('click', () => {
  const isOpen = !mobileNav.classList.contains('open');
  mobileNav.classList.toggle('open', isOpen);
  mobileNav.setAttribute('aria-hidden', String(!isOpen));
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.textContent = isOpen ? 'Close' : 'Menu';
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

const filmModal = document.querySelector('.film-modal');
const filmFrame = document.querySelector('#film-frame');
const filmVideo = document.querySelector('#film-video');
const filmPlayer = document.querySelector('.film-player');
const filmTitle = document.querySelector('#film-title');
const filmClose = document.querySelector('.film-close');
const filmBackdrop = document.querySelector('.film-backdrop');
let activeFilmButton = null;

function openFilm(button) {
  const provider = button.dataset.provider || 'vimeo';
  activeFilmButton = button;
  filmTitle.textContent = button.dataset.filmTitle || 'Selected film';
  filmPlayer.classList.remove('ratio-4-3', 'ratio-1280-891');
  if (button.dataset.filmRatio) filmPlayer.classList.add(`ratio-${button.dataset.filmRatio}`);

  filmFrame.style.display = provider === 'html5' ? 'none' : 'block';
  filmVideo.style.display = provider === 'html5' ? 'block' : 'none';

  if (provider === 'html5') {
    filmVideo.src = button.dataset.videoSrc;
    filmVideo.play().catch(() => {});
  } else {
    const hash = button.dataset.vimeoHash ? `h=${button.dataset.vimeoHash}&` : '';
    filmFrame.src = `https://player.vimeo.com/video/${button.dataset.vimeoId}?${hash}autoplay=1&title=0&byline=0&portrait=0&dnt=1`;
  }
  filmModal.classList.add('open');
  filmModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('film-open');
  filmClose.focus();
}

function closeFilm() {
  filmModal.classList.remove('open');
  filmModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('film-open');
  filmFrame.src = 'about:blank';
  filmVideo.pause();
  filmVideo.removeAttribute('src');
  filmVideo.load();
  activeFilmButton?.focus();
  activeFilmButton = null;
}

document.querySelectorAll('[data-vimeo-id], [data-video-src]').forEach((button) => {
  button.addEventListener('click', () => openFilm(button));
});

filmClose.addEventListener('click', closeFilm);
filmBackdrop.addEventListener('click', closeFilm);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && filmModal.classList.contains('open')) closeFilm();
});
