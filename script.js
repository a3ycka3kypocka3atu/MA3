/* ═══════════════════════════════════════════════════════════
   MA3 AGENCY 3.0 — JAVASCRIPT
   Video cycling · Popups · Interactions
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── VIDEO BACKGROUND CYCLING ──
  const videos = document.querySelectorAll('.bg-video');
  let currentVideoIndex = 0;

  function initVideos() {
    // Force mute and playsinline for strict browsers (fixes Vercel/iOS autoplay blocks)
    videos.forEach(v => {
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
    });

    // Start first video
    const first = videos[0];
    first.classList.add('active');
    first.play().catch(e => console.log('Autoplay blocked:', e));

    // When each video ends, crossfade to the next
    videos.forEach((video, index) => {
      video.addEventListener('ended', () => {
        // Fade out current
        video.classList.remove('active');

        // Move to next video (loop around)
        currentVideoIndex = (index + 1) % videos.length;
        const next = videos[currentVideoIndex];

        // Reset to start and play
        next.currentTime = 0;
        next.play().catch(() => {});
        next.classList.add('active');
      });
    });
  }

  // Autoplay on user interaction fallback (some browsers block autoplay until user interacts)
  // Listen to ANY interaction to trigger playback (fixes strict mobile/Vercel policies)
  const interactionEvents = ['click', 'touchstart', 'mousemove', 'scroll'];
  const triggerPlayback = () => {
    const active = videos[currentVideoIndex];
    if (active && active.paused) {
      active.muted = true; // Force mute again just in case
      active.playsInline = true;
      const playPromise = active.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Success! Now we can safely remove the listeners
          interactionEvents.forEach(e => document.removeEventListener(e, triggerPlayback));
        }).catch(() => {
          // Failed (e.g., interaction wasn't a strict enough gesture). Keep listening.
        });
      }
    } else if (active && !active.paused) {
      // Already playing naturally, remove listeners
      interactionEvents.forEach(e => document.removeEventListener(e, triggerPlayback));
    }
  };
  interactionEvents.forEach(e => document.addEventListener(e, triggerPlayback, { passive: true }));

  // ── POPUP MANAGEMENT ──
  const popupServices = document.getElementById('popup-services');
  const popupProjects = document.getElementById('popup-projects');
  const popupCases = document.getElementById('popup-cases');
  const serviceDetail = document.getElementById('service-detail');

  const btnServices = document.getElementById('btn-services');
  const btnProjects = document.getElementById('btn-projects');
  const btnCases = document.getElementById('btn-cases');

  const closeServices = document.getElementById('close-services');
  const closeProjects = document.getElementById('close-projects');
  const closeCases = document.getElementById('close-cases');
  const closeServiceDetail = document.getElementById('close-service-detail');

  const serviceDetailTitle = document.getElementById('service-detail-title');
  const serviceDetailDescription = document.getElementById('service-detail-description');
  const serviceDetailPrice = document.getElementById('service-detail-price');
  const serviceDetailMarket = document.getElementById('service-detail-market');

  function openPopup(popup) {
    // Close any other open popups first
    [popupServices, popupProjects, popupCases].forEach(p => {
      if (p && p !== popup) closePopup(p);
    });
    popup.classList.add('open');
    popup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePopup(popup) {
    popup.classList.remove('open');
    popup.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'hidden'; // keep body overflow hidden (fullscreen page)
  }

  function openServiceDetail(card) {
    if (!serviceDetail) return;

    serviceDetailTitle.textContent = card.dataset.serviceTitle || '';
    serviceDetailDescription.textContent = card.dataset.serviceDetail || '';
    serviceDetailPrice.textContent = card.dataset.servicePrice || '';
    serviceDetailMarket.textContent = card.dataset.serviceMarket || '';

    serviceDetail.classList.add('open');
    serviceDetail.setAttribute('aria-hidden', 'false');
  }

  function closeServiceDetailPopup() {
    if (!serviceDetail) return;
    serviceDetail.classList.remove('open');
    serviceDetail.setAttribute('aria-hidden', 'true');
  }

  btnServices.addEventListener('click', () => openPopup(popupServices));
  btnProjects.addEventListener('click', () => openPopup(popupProjects));
  if (btnCases) btnCases.addEventListener('click', () => openPopup(popupCases));

  closeServices.addEventListener('click', () => closePopup(popupServices));
  closeProjects.addEventListener('click', () => closePopup(popupProjects));
  if (closeCases) closeCases.addEventListener('click', () => closePopup(popupCases));
  if (closeServiceDetail) closeServiceDetail.addEventListener('click', closeServiceDetailPopup);

  // Close on backdrop click
  [popupServices, popupProjects, popupCases].forEach(popup => {
    if (!popup) return;
    popup.addEventListener('click', (e) => {
      if (e.target === popup || e.target.classList.contains('popup-backdrop')) {
        closePopup(popup);
      }
    });
  });
  if (serviceDetail) {
    serviceDetail.addEventListener('click', (e) => {
      if (e.target === serviceDetail || e.target.classList.contains('service-detail-backdrop')) {
        closeServiceDetailPopup();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeServiceDetailPopup();
      closePopup(popupServices);
      closePopup(popupProjects);
      closePopup(popupCases);
    }
  });

  // ── AGENCY BUTTON LINKS ──
  // Agency URLs
  const agencyLinks = {
    'btn-regular': 'https://agencyb-vert.vercel.app',
    'btn-digital': 'https://marketing-agency-dusky.vercel.app',
    'btn-ethic': 'https://etic-a.vercel.app',
  };

  Object.entries(agencyLinks).forEach(([id, url]) => {
    const btn = document.getElementById(id);
    if (btn && url) {
      btn.addEventListener('click', () => {
        window.open(url, '_blank', 'noopener');
      });
    }
  });

  // ── PROJECT/CASE CARDS CLICKABLE ──
  function initProjectCards() {
    document.querySelectorAll('.project-card').forEach(card => {
      const link = card.querySelector('.project-link');
      if (!link) return;

      card.addEventListener('click', (e) => {
        // Prevent double-firing if clicking directly on the link
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          window.open(href, link.target || '_blank', 'noopener');
        }
      });
    });
  }

  // ── SERVICE CARD DETAILS ──
  function initServiceCards() {
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('click', () => openServiceDetail(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openServiceDetail(card);
        }
      });
    });
  }

  // ── INIT ──
  document.addEventListener('DOMContentLoaded', () => {
    initVideos();
    initProjectCards();
    initServiceCards();
  });

  // Also run init if DOM is already loaded
  if (document.readyState !== 'loading') {
    initVideos();
    initProjectCards();
    initServiceCards();
  }

})();
