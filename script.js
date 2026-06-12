/* =====================================================
   PORTFOLIO SCRIPT
   ===================================================== */

/* ── Dark / Light Mode Toggle ── */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = themeToggle.querySelector('.theme-icon');
const html        = document.documentElement;

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}

// Load saved preference or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ── Hamburger Menu ── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
});

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

/* ── Portfolio Filter ── */
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards  = document.querySelectorAll('.project-card');
const noResults     = document.getElementById('noResults');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    // Update active button
    filterButtons.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    // Show / hide cards
    let visibleCount = 0;
    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      if (match) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    noResults.hidden = visibleCount > 0;
  });
});

/* ── YouTube Lightbox ── */
const lightbox      = document.getElementById('videoLightbox');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxIframe = document.getElementById('lightboxIframe');

document.querySelectorAll('.yt-placeholder').forEach(placeholder => {
  placeholder.addEventListener('click', () => {
    const ytId = placeholder.dataset.youtubeId;
    if (!ytId) return;
    lightboxIframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  });
});

function closeLightbox() {
  lightbox.hidden = true;
  lightboxIframe.src = '';
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
});

/* ── Contact Form Validation & Submission ── */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn   = document.getElementById('submitBtn');

function showError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  if (error) error.textContent = message;
  if (field) field.style.borderColor = '#ef4444';
}

function clearError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  if (error) error.textContent = '';
  if (field) field.style.borderColor = '';
}

contactForm.addEventListener('submit', e => {
  e.preventDefault();

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  let valid = true;

  // Validate name
  if (name.length < 2) {
    showError('name', 'nameError', 'Please enter your name.');
    valid = false;
  } else {
    clearError('name', 'nameError');
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('email', 'emailError', 'Please enter a valid email address.');
    valid = false;
  } else {
    clearError('email', 'emailError');
  }

  // Validate message
  if (message.length < 10) {
    showError('message', 'messageError', 'Message must be at least 10 characters.');
    valid = false;
  } else {
    clearError('message', 'messageError');
  }

  if (!valid) return;

  // Simulate submission (replace with your backend / EmailJS / Formspree endpoint)
  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-text').textContent = 'Sending…';

  setTimeout(() => {
    formSuccess.hidden = false;
    contactForm.reset();
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').textContent = 'Send Message';
    setTimeout(() => { formSuccess.hidden = true; }, 5000);
  }, 1200);
});

/* ── Navbar: add scrolled class for subtle shadow ── */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 10
    ? '0 2px 16px rgba(0,0,0,.12)'
    : 'none';
}, { passive: true });

/* ── Scroll reveal (Intersection Observer) ── */
const revealElements = document.querySelectorAll(
  '.project-card, .about-inner, .contact-inner, .stat'
);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

revealElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});
