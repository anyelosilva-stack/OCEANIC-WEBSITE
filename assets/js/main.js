/* ============================================================
   GRUPO OCEANIC — comportamiento compartido
   Nav · Lenis smooth scroll · GSAP reveals · contadores ·
   timeline supply chain · parallax · toggle de idioma
   ============================================================ */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (REDUCED) document.documentElement.classList.add("no-motion");

  /* ---------- Lenis (scroll suave) ---------- */
  var lenis = null;
  if (!REDUCED && window.Lenis) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
    }
  }
  window.__lenis = lenis;

  /* ---------- Nav ---------- */
  var nav = document.querySelector(".nav");
  var burger = document.querySelector(".nav-burger");
  var mobileMenu = document.querySelector(".mobile-menu");

  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
      if (lenis) open ? lenis.stop() : lenis.start();
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileMenu.classList.remove("is-open");
        burger.classList.remove("is-open");
        document.body.style.overflow = "";
        if (lenis) lenis.start();
      });
    });
  }

  /* ---------- Idioma: sitio solo en español ---------- */
  try { localStorage.removeItem("oceanic-lang"); } catch (e) {}
  document.documentElement.setAttribute("lang", "es");
  window.__getLang = function () { return "es"; };

  /* ---------- GSAP reveals ---------- */
  if (window.gsap && window.ScrollTrigger && !REDUCED) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".reveal").forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: "expo.out",
        delay: (el.dataset.delay ? parseFloat(el.dataset.delay) : 0),
        scrollTrigger: { trigger: el, start: "top 86%", once: true }
      });
    });
    gsap.utils.toArray(".reveal-l").forEach(function (el) {
      gsap.to(el, {
        opacity: 1, x: 0, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 84%", once: true }
      });
    });
    gsap.utils.toArray(".reveal-r").forEach(function (el) {
      gsap.to(el, {
        opacity: 1, x: 0, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 84%", once: true }
      });
    });

    /* Parallax en bandas de imagen */
    gsap.utils.toArray(".img-band img").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -9 }, {
        yPercent: 9, ease: "none",
        scrollTrigger: { trigger: img.closest(".img-band"), start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
    });
  } else {
    // Sin motion: mostrar todo
    document.querySelectorAll(".reveal, .reveal-l, .reveal-r").forEach(function (el) {
      el.style.opacity = 1; el.style.transform = "none";
    });
  }

  /* ---------- Contadores ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = (el.dataset.count.split(".")[1] || "").length;
    var dur = 1600, t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    }
    if (REDUCED) { el.textContent = target.toFixed(decimals); return; }
    requestAnimationFrame(step);
  }
  var counterObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { animateCount(en.target); counterObs.unobserve(en.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-count]").forEach(function (el) { counterObs.observe(el); });

  /* ---------- Barras de distribución ---------- */
  var barObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.querySelectorAll(".bar-fill").forEach(function (f, i) {
          setTimeout(function () { f.style.width = f.dataset.w + "%"; }, i * 140);
        });
        barObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll(".bars").forEach(function (el) { barObs.observe(el); });

  /* ---------- Timeline supply chain ---------- */
  var timeline = document.querySelector(".sc-timeline");
  if (timeline) {
    var fill = timeline.querySelector(".sc-line-fill");
    var phases = Array.prototype.slice.call(timeline.querySelectorAll(".sc-phase"));
    function updateTimeline() {
      var rect = timeline.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = rect.height;
      var passed = Math.min(Math.max(vh * 0.62 - rect.top, 0), total);
      if (fill) fill.style.height = passed + "px";
      phases.forEach(function (ph) {
        var r = ph.getBoundingClientRect();
        ph.classList.toggle("is-active", r.top < vh * 0.62);
      });
    }
    window.addEventListener("scroll", updateTimeline, { passive: true });
    window.addEventListener("resize", updateTimeline);
    updateTimeline();
  }

  /* ---------- Filtros de casos ---------- */
  var filterWrap = document.querySelector(".filters");
  if (filterWrap) {
    filterWrap.addEventListener("click", function (e) {
      var chip = e.target.closest(".filter-chip");
      if (!chip) return;
      filterWrap.querySelectorAll(".filter-chip").forEach(function (c) { c.classList.remove("is-on"); });
      chip.classList.add("is-on");
      var f = chip.dataset.filter;
      document.querySelectorAll(".case").forEach(function (card) {
        var show = f === "all" || card.dataset.industry === f;
        card.hidden = !show;
        if (show && window.gsap && !REDUCED) {
          gsap.fromTo(card, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" });
        }
      });
    });
  }

  /* ---------- Muro de logos: carrusel interactivo ---------- */
  document.querySelectorAll("[data-logo-wall]").forEach(function (wall) {
    var viewport = wall.querySelector(".logo-viewport");
    var track = wall.querySelector(".logo-track");
    var prev = wall.querySelector(".logo-nav--prev");
    var next = wall.querySelector(".logo-nav--next");
    if (!viewport || !track) return;

    /* Duplicar el set para el bucle continuo */
    track.innerHTML += track.innerHTML;

    /* Respaldo: si un PNG no carga, degradar al nombre en texto */
    track.querySelectorAll("img.logo-img").forEach(function (img) {
      function fallback() {
        var span = document.createElement("span");
        span.className = "logo-item";
        span.textContent = img.getAttribute("data-name") || (img.alt || "").replace(/^Logo de\s+/i, "");
        if (img.parentNode) img.parentNode.replaceChild(span, img);
      }
      img.addEventListener("error", fallback);
      if (img.complete && img.naturalWidth === 0) fallback();
    });

    var offset = 0, setW = 0, target = null;
    var paused = false, dragging = false, startX = 0, startOffset = 0;
    var AUTO = 0.35, STEP = 260;

    function measure() { setW = track.scrollWidth / 2; }
    measure();
    window.addEventListener("resize", measure);
    track.querySelectorAll("img").forEach(function (im) {
      if (!im.complete) im.addEventListener("load", measure);
    });

    function frame() {
      if (target !== null) {
        var d = target - offset;
        if (Math.abs(d) < 0.5) { offset = target; target = null; }
        else offset += d * 0.16;
      } else if (!paused && !dragging && !REDUCED) {
        offset += AUTO;
      }
      if (setW > 0) {
        if (offset >= setW) offset -= setW;
        else if (offset < 0) offset += setW;
      }
      track.style.transform = "translateX(" + (-offset) + "px)";
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    function nudge(dir) { target = (target === null ? offset : target) + dir * STEP; }
    if (prev) prev.addEventListener("click", function () { nudge(-1); });
    if (next) next.addEventListener("click", function () { nudge(1); });

    /* Pausar el auto al pasar el cursor (para leer con calma) */
    wall.addEventListener("mouseenter", function () { paused = true; });
    wall.addEventListener("mouseleave", function () { paused = false; });

    /* Arrastrar con el mouse (en táctil: auto + flechas, sin bloquear el scroll vertical) */
    viewport.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      dragging = true; target = null; startX = e.clientX; startOffset = offset;
      viewport.classList.add("is-dragging");
      try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
    });
    viewport.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      offset = startOffset - (e.clientX - startX);
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove("is-dragging");
    }
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);

    /* Rueda / trackpad horizontal */
    viewport.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        target = null; offset += e.deltaX; e.preventDefault();
      }
    }, { passive: false });
  });

  /* ---------- Año footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
