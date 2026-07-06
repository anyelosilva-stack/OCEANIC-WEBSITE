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

  /* ---------- Marquee: duplicar contenido ---------- */
  document.querySelectorAll(".logo-track").forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ---------- Año footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
