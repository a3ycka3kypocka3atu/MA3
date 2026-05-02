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
  const btnServices = document.getElementById('btn-services');
  const btnProjects = document.getElementById('btn-projects');
  const closeServices = document.getElementById('close-services');
  const closeProjects = document.getElementById('close-projects');

  function openPopup(popup) {
    popup.classList.add('open');
    popup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePopup(popup) {
    popup.classList.remove('open');
    popup.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'hidden'; // keep body overflow hidden (fullscreen page)
  }

  btnServices.addEventListener('click', () => openPopup(popupServices));
  btnProjects.addEventListener('click', () => openPopup(popupProjects));

  closeServices.addEventListener('click', () => closePopup(popupServices));
  closeProjects.addEventListener('click', () => closePopup(popupProjects));

  // Close on backdrop click
  [popupServices, popupProjects].forEach(popup => {
    popup.addEventListener('click', (e) => {
      if (e.target === popup || e.target.classList.contains('popup-backdrop')) {
        closePopup(popup);
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePopup(popupServices);
      closePopup(popupProjects);
    }
  });

  // ── AGENCY BUTTON LINKS ──
  // Placeholder: links will be provided later
  const agencyLinks = {
    'btn-regular': null,
    'btn-digital': null,
    'btn-ethic': null,
  };

  Object.entries(agencyLinks).forEach(([id, url]) => {
    const btn = document.getElementById(id);
    if (btn && url) {
      btn.addEventListener('click', () => {
        window.open(url, '_blank', 'noopener');
      });
    }
  });

  // ── INIT ──
  document.addEventListener('DOMContentLoaded', () => {
    initVideos();
  });

  // Also run init if DOM is already loaded
  if (document.readyState !== 'loading') {
    initVideos();
  }

})();
