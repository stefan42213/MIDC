// ═══ GLOW CARD — mouse-following spotlight ═══
document.querySelectorAll('.glow-card').forEach(card => {
  const overlay = card.querySelector('.glow-overlay');
  const border = card.querySelector('.glow-border');
  const glowColor = card.dataset.glow || 'rgba(59,130,246,0.15)';

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    overlay.style.background = `radial-gradient(600px circle at ${x}px ${y}px, ${glowColor}, transparent 40%)`;
    border.style.background = `radial-gradient(300px circle at ${x}px ${y}px, rgba(59,130,246,0.12), transparent 40%)`;
  });
});

// ═══ SCROLL-DRIVEN 3D CARD ANIMATION (ContainerScroll) ═══
function initScrollCards() {
  const isMobile = window.innerWidth <= 768;

  document.querySelectorAll('[data-scroll-card]').forEach(container => {
    const card = container.querySelector('[data-scroll-transform]');
    const header = container.querySelector('[data-scroll-header]');
    if (!card) return;

    function updateTransform() {
      const rect = container.getBoundingClientRect();
      const containerHeight = container.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Calculate progress: 0 when container top enters view, 1 when container bottom leaves
      const scrolled = viewportHeight - rect.top;
      const total = containerHeight + viewportHeight;
      const progress = Math.min(Math.max(scrolled / total, 0), 1);

      // Rotate: 20deg → 0deg
      const rotate = 20 * (1 - progress);

      // Scale
      const scaleFrom = isMobile ? 0.7 : 1.05;
      const scaleTo = isMobile ? 0.9 : 1;
      const scale = scaleFrom + (scaleTo - scaleFrom) * progress;

      // Translate header: 0 → -100px
      const translate = -100 * progress;

      card.style.transform = `perspective(1000px) rotateX(${rotate}deg) scale(${scale})`;

      if (header) {
        header.style.transform = `translateY(${translate}px)`;
      }
    }

    // Use requestAnimationFrame for smooth performance
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateTransform();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Initial update
    updateTransform();
  });
}

// ═══ SCROLL REVEAL — fade in sections on scroll ═══
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  // Add reveal class to sections
  document.querySelectorAll('.services .container > *, .pricing .container > *, .contact .container > *').forEach(el => {
    if (!el.classList.contains('bg-orb')) {
      el.classList.add('reveal');
      observer.observe(el);
    }
  });
}

// ═══ SMOOTH SCROLL for nav links ═══
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ═══ NAV background on scroll ═══
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.style.background = 'rgba(0,0,0,0.85)';
  } else {
    nav.style.background = 'rgba(0,0,0,0.6)';
  }
}, { passive: true });

// ═══ HIDE SPLINE WATERMARK ═══
function hideSplineLogo() {
  const viewer = document.querySelector('spline-viewer');
  if (!viewer) return;

  function tryHide() {
    const shadow = viewer.shadowRoot;
    if (shadow) {
      // Hide logo by ID
      const logo = shadow.querySelector('#logo');
      if (logo) { logo.style.display = 'none'; }
      // Hide any Spline links
      shadow.querySelectorAll('a[href*="spline"]').forEach(a => { a.style.display = 'none'; });
      // Inject style to hide watermark permanently
      if (!shadow.querySelector('#spline-hide-style')) {
        const style = document.createElement('style');
        style.id = 'spline-hide-style';
        style.textContent = '#logo, a[href*="spline"], div[style*="bottom: 0"] { display: none !important; opacity: 0 !important; pointer-events: none !important; }';
        shadow.appendChild(style);
      }
      // Brute-force: hide absolute-positioned bottom elements
      shadow.querySelectorAll('div, a, img').forEach(el => {
        const s = window.getComputedStyle(el);
        if (s.position === 'absolute' && (s.bottom === '0px' || s.bottom === '8px') && (s.right === '0px' || s.right === '8px')) {
          el.style.display = 'none';
        }
      });
      return true;
    }
    return false;
  }

  // Retry until hidden
  let attempts = 0;
  const interval = setInterval(() => {
    tryHide();
    if (++attempts > 80) clearInterval(interval);
  }, 50);

  // Also use MutationObserver to catch late-loaded watermarks
  const mo = new MutationObserver(() => tryHide());
  mo.observe(viewer, { childList: true, subtree: true });
}

// ═══ GENERATE FLOATING PARTICLES ═══
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 8 + 6) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
    container.appendChild(p);
  }
}

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded', () => {
  initScrollCards();
  initScrollReveal();
  hideSplineLogo();
  initParticles();
});

// Re-init on resize (for mobile/desktop switch)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    initScrollCards();
  }, 250);
});
