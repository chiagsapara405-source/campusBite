/**
 * CampusBite — College Cafeteria Food Ordering System
 * Landing Page Interaction & GSAP Animation Script
 * 
 * Includes:
 * 1. Mobile navigation menu toggle (pure CSS transitions for instant response)
 * 2. Navbar shadow on scroll
 * 3. Add-to-cart toast notification ("Please visit the Menu to add items to your cart.")
 * 4. Phase 2 page placeholder handlers (login.html, register.html, menu.html, orders.html)
 * 5. Smooth scrolling for internal anchor links
 * 6. GSAP entrance animations:
 *    - Navbar entrance (logo first, staggered links, CTA)
 *    - Hero entrance timeline (badge, heading lines, SVG underline draw, subtext, CTAs, trust badges, food visual, floating cards)
 *    - Continuous subtle floating animation for hero decorative cards (yoyo sine)
 *    - ScrollTrigger reveals for Menu categories, Student favorites, How it works steps, Why choose us, and CTA
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initNavbarScrollShadow();
  initAddToCartToast();
  initPhase2Placeholders();
  initSmoothScroll();
  initGsapAnimations();
});

/* ============================================================
   1. MOBILE NAVIGATION TOGGLE
   ============================================================ */
function initMobileNav() {
  const toggleBtn = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!toggleBtn || !mobileMenu) return;

  function toggleMenu(forceOpen) {
    const isCurrentlyOpen = toggleBtn.classList.contains('open');
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !isCurrentlyOpen;

    if (shouldOpen) {
      toggleBtn.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.remove('hidden');
      // small frame delay to trigger CSS keyframe animation
      requestAnimationFrame(() => {
        mobileMenu.classList.add('open');
      });
    } else {
      toggleBtn.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      mobileMenu.classList.add('hidden');
    }
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close when clicking any link inside the mobile menu
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  // Close when clicking outside of navbar
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      if (toggleBtn.classList.contains('open')) {
        toggleMenu(false);
      }
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggleBtn.classList.contains('open')) {
      toggleMenu(false);
    }
  });
}

/* ============================================================
   2. NAVBAR SCROLL SHADOW
   ============================================================ */
function initNavbarScrollShadow() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============================================================
   3. ADD TO CART TOAST NOTIFICATION
   ============================================================ */
let toastTimer = null;

function initAddToCartToast() {
  const addToCartButtons = document.querySelectorAll('[data-add-to-cart]');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  if (!toast) return;

  addToCartButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Please visit the Menu to add items to your cart.');
    });
  });
}

/**
 * Show accessible toast notification
 * @param {string} message 
 */
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  if (!toast) return;

  if (toastMessage && message) {
    toastMessage.textContent = message;
  }

  // Clear previous timer if clicked in quick succession
  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  // Animate toast in
  toast.classList.remove('opacity-0', 'translate-y-6', 'pointer-events-none');
  toast.classList.add('opacity-100', 'translate-y-0');

  // Auto hide after 3.2 seconds
  toastTimer = setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-6', 'pointer-events-none');
  }, 3200);
}

/* ============================================================
   4. PHASE 2 PLACEHOLDER LINKS
   ============================================================ */
function initPhase2Placeholders() {
  // Only the unfinished orders page remains a placeholder.
  // Login, registration, and the menu destination navigate normally.
  const phase2Selectors = 'a[href$=".html"]';
  const phase2Links = document.querySelectorAll(phase2Selectors);

  phase2Links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      // If the file doesn't exist yet, show an informative toast preview
      if (href && href.includes('orders')) {
        e.preventDefault();
        const pageLabel = link.textContent.trim() || 'This module';
        showToast(`${pageLabel} is part of Phase 2 and will be connected soon!`);
      }
    });
  });
}

/* ============================================================
   5. SMOOTH SCROLLING FOR INTERNAL ANCHORS
   ============================================================ */
function initSmoothScroll() {
  const internalAnchors = document.querySelectorAll('a[href^="#"]');

  internalAnchors.forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ============================================================
   6. GSAP LANDING PAGE ANIMATIONS
   ============================================================ */
function initGsapAnimations() {
  // Graceful fallback if GSAP is unavailable or user has reduced motion preference
  if (typeof gsap === 'undefined') {
    console.warn('GSAP library not detected. Running with clean static presentation.');
    return;
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    console.log('Reduced motion requested. GSAP entrance animations disabled.');
    return;
  }

  // Register ScrollTrigger if available
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ----------------------------------------------------------
  // A. NAVBAR ENTRANCE (Initial Page Load)
  // Subtle and fast: Logo -> nav links staggered -> CTA buttons
  // ----------------------------------------------------------
  const navTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  navTl
    .from('#nav-logo', {
      y: -20,
      opacity: 0,
      duration: 0.5,
      clearProps: 'all'
    })
    .from('.nav-link', {
      y: -16,
      opacity: 0,
      stagger: 0.06,
      duration: 0.4,
      clearProps: 'all'
    }, '-=0.3')
    .from('.nav-action', {
      y: -14,
      opacity: 0,
      stagger: 0.08,
      duration: 0.35,
      clearProps: 'all'
    }, '-=0.25');

  // ----------------------------------------------------------
  // B. HERO ENTRANCE TIMELINE
  // Sequence:
  // 1. Hero badge fades in & moves upward
  // 2. Main heading lines fade/slide upward
  // 3. SVG underline draws smoothly
  // 4. Supporting paragraph appears
  // 5. CTA buttons appear with a small stagger
  // 6. Trust/benefit indicators stagger in
  // 7. Food image scales from slightly smaller to normal size
  // 8. Floating food cards enter with subtle movement
  // 9. Start continuous subtle floating
  // ----------------------------------------------------------
  const heroTl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    delay: 0.1
  });

  // Prepare SVG underline stroke animation
  const underlinePath = document.querySelector('#hero-underline path');
  if (underlinePath) {
    gsap.set(underlinePath, {
      strokeDasharray: 1,
      strokeDashoffset: 1
    });
  }

  heroTl
    // 1. Hero badge
    .from('#hero-badge', {
      y: 18,
      opacity: 0,
      duration: 0.5,
      clearProps: 'transform,opacity'
    })
    // 2. Main heading lines
    .from('.hero-line', {
      y: 28,
      opacity: 0,
      stagger: 0.12,
      duration: 0.65,
      clearProps: 'transform,opacity'
    }, '-=0.3')
    // 3. SVG Underline draw
    .to(underlinePath || {}, {
      strokeDashoffset: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.2')
    // 4. Supporting text
    .from('#hero-sub', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      clearProps: 'transform,opacity'
    }, '-=0.35')
    // 5. CTA buttons
    .from('.hero-btn', {
      y: 18,
      opacity: 0,
      stagger: 0.1,
      duration: 0.45,
      clearProps: 'transform,opacity'
    }, '-=0.3')
    // 6. Trust indicators
    .from('.hero-benefit', {
      y: 14,
      opacity: 0,
      stagger: 0.08,
      duration: 0.4,
      clearProps: 'transform,opacity'
    }, '-=0.2')
    // 7. Main food visual scale in
    .from('#hero-visual', {
      scale: 0.92,
      opacity: 0,
      duration: 0.75,
      ease: 'back.out(1.3)',
      clearProps: 'transform,opacity'
    }, '-=0.6')
    // 8. Floating food cards enter
    .from('.float-card', {
      scale: 0.75,
      y: 24,
      opacity: 0,
      stagger: 0.14,
      duration: 0.6,
      ease: 'back.out(1.5)',
      clearProps: 'opacity'
    }, '-=0.4')
    // 9. Continuous floating trigger
    .call(startSubtleFloating);

  // ----------------------------------------------------------
  // C. CONTINUOUS SUBTLE FLOATING (Selected cards only)
  // Gentle, calm sine float without aggressive or rapid bouncing
  // ----------------------------------------------------------
  function startSubtleFloating() {
    const fries = document.getElementById('float-fries');
    const coffee = document.getElementById('float-coffee');
    const pizza = document.getElementById('float-pizza');

    if (fries) {
      gsap.to(fries, {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    if (coffee) {
      gsap.to(coffee, {
        y: 10,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.4
      });
    }

    if (pizza) {
      gsap.to(pizza, {
        y: -8,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.8
      });
    }
  }

  // ----------------------------------------------------------
  // D. LIGHTWEIGHT SCROLL-TRIGGERED REVEALS
  // ----------------------------------------------------------
  if (typeof ScrollTrigger !== 'undefined') {
    // 1. Food Categories Section
    gsap.from('#categories-grid .category-card', {
      scrollTrigger: {
        trigger: '#categories-grid',
        start: 'top 88%'
      },
      y: 25,
      opacity: 0,
      stagger: 0.07,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: function () {
        // Clear transform & opacity so Tailwind hover transitions work cleanly
        gsap.set('#categories-grid .category-card', { clearProps: 'transform,opacity' });
      }
    });

    // 2. Student Favorites Section
    gsap.from('#favorites-grid .food-card', {
      scrollTrigger: {
        trigger: '#favorites-grid',
        start: 'top 88%'
      },
      y: 30,
      opacity: 0,
      stagger: 0.09,
      duration: 0.55,
      ease: 'power2.out',
      onComplete: function () {
        gsap.set('#favorites-grid .food-card', { clearProps: 'transform,opacity' });
      }
    });

    // 3. How It Works Steps
    gsap.from('#steps-grid .step', {
      scrollTrigger: {
        trigger: '#steps-grid',
        start: 'top 88%'
      },
      y: 25,
      opacity: 0,
      stagger: 0.12,
      duration: 0.55,
      ease: 'power2.out',
      onComplete: function () {
        gsap.set('#steps-grid .step', { clearProps: 'transform,opacity' });
      }
    });

    // 4. Why CampusBite Features
    gsap.from('#features-grid > div', {
      scrollTrigger: {
        trigger: '#features-grid',
        start: 'top 88%'
      },
      y: 24,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: function () {
        gsap.set('#features-grid > div', { clearProps: 'transform,opacity' });
      }
    });

    // 5. Final CTA Card Entrance
    gsap.from('#cta-card', {
      scrollTrigger: {
        trigger: '#cta',
        start: 'top 85%'
      },
      scale: 0.96,
      opacity: 0,
      duration: 0.65,
      ease: 'power2.out',
      onComplete: function () {
        gsap.set('#cta-card', { clearProps: 'transform,opacity' });
      }
    });

    gsap.from('#cta-visual', {
      scrollTrigger: {
        trigger: '#cta-card',
        start: 'top 80%'
      },
      scale: 0.85,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.3)',
      clearProps: 'transform,opacity'
    });
  }
}
