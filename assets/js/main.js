// ArthRegen — site interactions

(function () {
  'use strict';

  /* ---------- Language toggle (EN / KR) ---------- */
  var STORAGE_KEY = 'arthregen-lang';
  var root = document.body;
  var saved = localStorage.getItem(STORAGE_KEY) || document.documentElement.getAttribute('data-default-lang') || 'ko';
  setLang(saved);

  document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLang(btn.getAttribute('data-lang-btn'));
    });
  });

  function setLang(lang) {
    if (lang !== 'en' && lang !== 'ko') lang = 'ko';
    root.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang === 'ko' ? 'ko' : 'en');
    localStorage.setItem(STORAGE_KEY, lang);
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-lang-btn') === lang);
    });
  }

  /* ---------- Mobile nav ---------- */
  var nav = document.querySelector('.site-nav');
  var toggle = document.querySelector('.nav-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
    nav.querySelectorAll('.site-nav__links a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        // If this anchor is a dropdown trigger and we're on mobile (drawer open),
        // first tap toggles the sub-menu instead of navigating.
        var dd = a.parentElement && a.parentElement.classList.contains('has-dropdown');
        var isMobile = window.matchMedia('(max-width: 960px)').matches;
        if (dd && isMobile) {
          var li = a.parentElement;
          if (!li.classList.contains('is-open')) {
            e.preventDefault();
            // Close any other open dropdowns
            li.parentElement.querySelectorAll('.has-dropdown.is-open').forEach(function(o){
              if (o !== li) o.classList.remove('is-open');
            });
            li.classList.add('is-open');
            a.setAttribute('aria-expanded', 'true');
            return;
          }
        }
        nav.classList.remove('is-open');
      });
    });
  }

  /* ---------- News dropdown — keyboard + outside-click handling ---------- */
  document.querySelectorAll('.site-nav__links li.has-dropdown').forEach(function (li) {
    var trigger = li.querySelector(':scope > a');
    var menu = li.querySelector('.site-nav__dropdown');
    if (!trigger || !menu) return;

    // Sync aria-expanded with hover/focus state on desktop
    function setExpanded(state) {
      trigger.setAttribute('aria-expanded', state ? 'true' : 'false');
    }
    li.addEventListener('mouseenter', function () { setExpanded(true); });
    li.addEventListener('mouseleave', function () {
      setExpanded(false);
      li.classList.remove('is-open');
    });
    li.addEventListener('focusin', function () { setExpanded(true); });
    li.addEventListener('focusout', function (e) {
      if (!li.contains(e.relatedTarget)) {
        setExpanded(false);
        li.classList.remove('is-open');
      }
    });

    // Close on Escape
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        li.classList.remove('is-open');
        setExpanded(false);
        trigger.focus();
      }
    });
  });

  // Close dropdowns when clicking outside the nav
  document.addEventListener('click', function (e) {
    if (e.target.closest('.site-nav')) return;
    document.querySelectorAll('.site-nav__links .has-dropdown.is-open').forEach(function (li) {
      li.classList.remove('is-open');
      var t = li.querySelector(':scope > a');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Zoom / lightbox ---------- */
  (function initZoom() {
    var triggers = document.querySelectorAll('[data-zoom]');
    if (!triggers.length) return;

    var lightbox = null;
    var lightboxImg = null;
    var lightboxCap = null;
    var lastTrigger = null;

    function build() {
      lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.setAttribute('role', 'dialog');
      lightbox.setAttribute('aria-modal', 'true');
      lightbox.setAttribute('aria-label', 'Image viewer');
      lightbox.innerHTML =
        '<div class="lightbox__inner">' +
          '<button type="button" class="lightbox__close" aria-label="Close image viewer">×</button>' +
          '<img class="lightbox__img" alt="" />' +
          '<p class="lightbox__cap"></p>' +
          '<div class="lightbox__hint">Click anywhere or press ESC to close</div>' +
        '</div>';
      document.body.appendChild(lightbox);
      lightboxImg = lightbox.querySelector('.lightbox__img');
      lightboxCap = lightbox.querySelector('.lightbox__cap');

      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox || e.target.classList.contains('lightbox__inner') || e.target.classList.contains('lightbox__close')) {
          close();
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
      });
    }

    function open(src, alt, caption) {
      if (!lightbox) build();
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      lightboxCap.textContent = caption || '';
      lightboxCap.style.display = caption ? '' : 'none';
      lightbox.classList.add('is-open');
      document.body.classList.add('is-locked');
      var closeBtn = lightbox.querySelector('.lightbox__close');
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    }

    function close() {
      if (!lightbox) return;
      lightbox.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        lastTrigger.focus({ preventScroll: true });
      }
    }

    function findCaption(el) {
      var fig = el.closest('figure');
      if (fig) {
        var fc = fig.querySelector('figcaption, .product-figure__cap');
        if (fc) {
          // pick visible caption span (matching current language)
          var lang = (document.body.getAttribute('data-lang') || 'ko');
          var langed = fc.querySelector('[lang="' + lang + '"]');
          return (langed && langed.textContent.trim()) || fc.textContent.trim();
        }
      }
      var capEl = el.querySelector('img');
      return (capEl && capEl.alt) || '';
    }

    triggers.forEach(function (el) {
      // make focusable for keyboard activation
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', el.getAttribute('aria-label') || 'Enlarge image');

      function fire() {
        var img = el.tagName === 'IMG' ? el : el.querySelector('img');
        if (!img) return;
        lastTrigger = el;
        open(img.currentSrc || img.src, img.alt || '', findCaption(el));
      }
      el.addEventListener('click', function (e) {
        // ignore if user clicked an inner anchor or button
        if (e.target.closest('a, button')) return;
        e.preventDefault();
        fire();
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fire();
        }
      });
    });
  })();

  /* ---------- Carousel (announcement gallery) ---------- */
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.carousel__track');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.carousel__slide'));
    var prev = root.querySelector('.carousel__arrow--prev');
    var next = root.querySelector('.carousel__arrow--next');
    var dotsWrap = root.querySelector('.carousel__dots');
    var counter = root.querySelector('.carousel__count');
    if (!track || slides.length === 0) return;

    if (slides.length <= 1) {
      root.classList.add('is-single');
      return;
    }

    var index = 0;

    // Build dots
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach(function (_, i) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
        d.setAttribute('aria-label', 'Image ' + (i + 1) + ' of ' + slides.length);
        d.addEventListener('click', function () { go(i); });
        dotsWrap.appendChild(d);
      });
    }

    // Build thumbnail strip (inserted after the carousel viewport).
    // One <button> per slide containing a clone of the slide's <img>.
    var thumbsWrap = root.querySelector('.carousel__thumbs');
    if (!thumbsWrap) {
      thumbsWrap = document.createElement('div');
      thumbsWrap.className = 'carousel__thumbs';
      thumbsWrap.setAttribute('role', 'tablist');
      thumbsWrap.setAttribute('aria-label', 'Image thumbnails');
      var footer = root.querySelector('.carousel__footer');
      if (footer) root.insertBefore(thumbsWrap, footer);
      else root.appendChild(thumbsWrap);
    }
    thumbsWrap.innerHTML = '';
    slides.forEach(function (slide, i) {
      var src = slide.querySelector('img') ? slide.querySelector('img').src : '';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'carousel__thumb' + (i === 0 ? ' is-active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', 'Show image ' + (i + 1) + ' of ' + slides.length);
      btn.innerHTML = '<img src="' + src + '" alt="" loading="lazy" />';
      btn.addEventListener('click', function () { go(i); });
      thumbsWrap.appendChild(btn);
    });

    function update() {
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      if (counter) counter.textContent = (index + 1) + ' / ' + slides.length;
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.carousel__dot').forEach(function (d, i) {
          d.classList.toggle('is-active', i === index);
        });
      }
      if (thumbsWrap) {
        thumbsWrap.querySelectorAll('.carousel__thumb').forEach(function (t, i) {
          t.classList.toggle('is-active', i === index);
        });
      }
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index === slides.length - 1;
    }

    function go(i) {
      index = Math.max(0, Math.min(slides.length - 1, i));
      update();
    }

    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });

    // Keyboard arrows when carousel has focus
    root.tabIndex = 0;
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    });

    // Touch swipe (mobile)
    var startX = 0, startY = 0, deltaX = 0, deltaY = 0, touching = false;
    var THRESHOLD = 40;     // px to register a swipe
    var LOCK = 14;          // px before locking horizontal/vertical intent
    var horizontalLocked = false;
    var verticalLocked = false;

    track.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      touching = true;
      horizontalLocked = false;
      verticalLocked = false;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      deltaX = 0;
      deltaY = 0;
      track.style.transition = 'none';
    }, { passive: true });

    track.addEventListener('touchmove', function (e) {
      if (!touching) return;
      deltaX = e.touches[0].clientX - startX;
      deltaY = e.touches[0].clientY - startY;
      // Decide swipe axis once user has moved beyond LOCK
      if (!horizontalLocked && !verticalLocked) {
        if (Math.abs(deltaX) > LOCK || Math.abs(deltaY) > LOCK) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) horizontalLocked = true;
          else verticalLocked = true;
        }
      }
      if (horizontalLocked) {
        e.preventDefault();
        // Resistance at edges
        var resist = 1;
        if ((index === 0 && deltaX > 0) || (index === slides.length - 1 && deltaX < 0)) resist = 0.35;
        track.style.transform = 'translateX(calc(' + (-index * 100) + '% + ' + (deltaX * resist) + 'px))';
      }
    }, { passive: false });

    function endTouch() {
      if (!touching) return;
      touching = false;
      track.style.transition = '';
      if (horizontalLocked && Math.abs(deltaX) > THRESHOLD) {
        if (deltaX < 0) go(index + 1);
        else go(index - 1);
      } else {
        update();
      }
    }
    track.addEventListener('touchend',    endTouch);
    track.addEventListener('touchcancel', endTouch);

    update();
  });

  /* ---------- Contact form (client-side only demo) ---------- */
  var form = document.querySelector('#contact-form, [data-contact-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('cf-status') || form.querySelector('[data-form-success]');
      var curLang = root.getAttribute('data-lang') || 'en';
      var msg = curLang === 'ko'
        ? '메시지가 전송되었습니다. 곧 연락드리겠습니다.'
        : 'Thanks — your message has been sent. We\'ll be in touch shortly.';
      if (status) {
        status.textContent = msg;
        status.style.color = 'var(--teal-700, #1f8e84)';
      }
      form.reset();
    });
  }

  /* ---------- Hero video — slow-motion playback ---------- */
  var heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    var setRate = function () { heroVideo.playbackRate = 0.55; };
    setRate();
    heroVideo.addEventListener('loadedmetadata', setRate);
    heroVideo.addEventListener('play', setRate);
  }
})();
