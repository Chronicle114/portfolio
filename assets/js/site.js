/* CHRONICLE — main site behaviour: language switch, mobile menu, reveal, brief form. */
(function () {
  'use strict';

  var I18N = window.CHRONICLE_I18N || { ro: {}, meta: {}, js: {} };
  var STORAGE_KEY = 'chronicle-lang';
  var LANGS = ['ru', 'ro'];
  var WA_NUMBER = '37368800967';
  var current = 'ru';

  /* ---------- Language ---------- */
  var textNodes = document.querySelectorAll('[data-i18n]');
  var htmlNodes = document.querySelectorAll('[data-i18n-html]');
  var attrNodes = document.querySelectorAll('[data-i18n-attr]');

  // Russian lives in the markup: remember it so we can switch back without a reload.
  var ru = {};
  textNodes.forEach(function (el) { ru[el.dataset.i18n] = el.textContent; });
  htmlNodes.forEach(function (el) { ru[el.dataset.i18nHtml] = el.innerHTML; });
  attrNodes.forEach(function (el) {
    el.dataset.i18nAttr.split(';').forEach(function (pair) {
      var p = pair.split(':');
      ru[p[1]] = el.getAttribute(p[0]);
    });
  });
  var dict = { ru: ru, ro: I18N.ro || {} };

  function t(key, lang) {
    var d = dict[lang || current];
    return (d && d[key] != null) ? d[key] : ru[key];
  }
  function tjs(key) {
    var d = (I18N.js && I18N.js[current]) || {};
    return d[key] || (I18N.js && I18N.js.ru && I18N.js.ru[key]) || '';
  }

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function store(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage unavailable */ }
  }

  function setMeta(lang) {
    var m = I18N.meta && I18N.meta[lang];
    if (!m) return;
    document.title = m.title;
    var d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute('content', m.description);
    var og = document.querySelector('meta[property="og:locale"]');
    if (og) og.setAttribute('content', m.ogLocale);
  }

  function applyLang(lang, opts) {
    if (LANGS.indexOf(lang) === -1) lang = 'ru';
    current = lang;
    document.documentElement.lang = lang;
    textNodes.forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    htmlNodes.forEach(function (el) { el.innerHTML = t(el.dataset.i18nHtml); });
    attrNodes.forEach(function (el) {
      el.dataset.i18nAttr.split(';').forEach(function (pair) {
        var p = pair.split(':');
        el.setAttribute(p[0], t(p[1]));
      });
    });
    document.querySelectorAll('.lang-switch button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    setMeta(lang);
    syncMenuLabel();
    if (!opts || !opts.silent) {
      store(lang);
      var url = new URL(window.location.href);
      if (lang === 'ru') url.searchParams.delete('lang'); else url.searchParams.set('lang', lang);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  }

  document.querySelectorAll('.lang-switch button').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.dataset.lang); });
  });

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.getElementById('mobile-panel');

  function syncMenuLabel() {
    if (!toggle) return;
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-label', tjs(open ? 'menu_close' : 'menu_open'));
  }
  function setMenu(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    panel.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    syncMenuLabel();
    if (open) { var first = panel.querySelector('a'); if (first) first.focus(); }
  }
  if (toggle && panel) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1081px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });
  }

  /* ---------- Header state ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Floating WhatsApp: hide while another WhatsApp CTA is on screen ---------- */
  var fab = document.querySelector('.fab-wa');
  var fabZones = [document.querySelector('.hero'), document.getElementById('contact')].filter(Boolean);
  if (fab && fabZones.length && 'IntersectionObserver' in window) {
    var inView = new Set();
    var fabIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) inView.add(en.target); else inView.delete(en.target); });
      fab.classList.toggle('is-hidden', inView.size > 0);
    }, { threshold: 0.12 });
    fabZones.forEach(function (z) { fabIo.observe(z); });
  }

  /* ---------- Brief form → WhatsApp ---------- */
  var form = document.getElementById('brief-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      if (!name) {
        form.elements.name.setCustomValidity(tjs('form_err_name'));
        form.elements.name.reportValidity();
        return;
      }
      var sel = form.elements.type;
      var type = sel.options[sel.selectedIndex].textContent.trim();
      var msg = form.elements.message.value.trim();
      var text = tjs('wa_template').replace('{name}', name).replace('{type}', type).replace('{msg}', msg).trim();
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
    form.elements.name.addEventListener('input', function () { this.setCustomValidity(''); });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  /* ---------- Initial language ---------- */
  var fromUrl = new URLSearchParams(window.location.search).get('lang');
  var initial = LANGS.indexOf(fromUrl) !== -1 ? fromUrl : (readStored() || 'ru');
  if (initial !== 'ru' || fromUrl) applyLang(initial, { silent: !fromUrl });
  if (fromUrl) store(fromUrl);
})();
