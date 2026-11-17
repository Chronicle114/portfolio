/* CHRONICLE demo kit — shared by the six concept pages.
   Adds: a floating "back to portfolio" bar with a "demo concept" label,
   a short disclaimer at the end of the page, and a fallback for images
   that fail to load from third-party hosts.
   Everything renders inside a shadow root so the concept pages' own CSS
   cannot restyle it (and it cannot restyle them). */
(function () {
  'use strict';
  if (window.__chronicleDemoKit) return;
  window.__chronicleDemoKit = true;

  var STORAGE_KEY = 'chronicle-lang';
  var HOME = 'index.html';
  var T = {
    ru: {
      back: 'Портфолио',
      backLabel: 'Вернуться в портфолио CHRONICLE',
      demo: 'Демо-концепт',
      infoLabel: 'Что такое демо-концепт',
      info: 'Это демонстрационный концепт студии CHRONICLE. Бренд, цены, контакты и тексты вымышлены — страница показывает дизайн и функциональность.',
      cta: 'Хочу такой сайт',
      close: 'Закрыть',
      footer: 'Демонстрационный концепт студии CHRONICLE. Бренд, цены и контакты на этой странице вымышлены.',
      footerLink: '← Вернуться в портфолио',
      imgMissing: 'Изображение недоступно'
    },
    ro: {
      back: 'Portofoliu',
      backLabel: 'Înapoi la portofoliul CHRONICLE',
      demo: 'Concept demo',
      infoLabel: 'Ce este un concept demo',
      info: 'Acesta este un concept demonstrativ al studioului CHRONICLE. Brandul, prețurile, contactele și textele sunt fictive — pagina prezintă designul și funcționalitatea.',
      cta: 'Vreau un astfel de site',
      close: 'Închide',
      footer: 'Concept demonstrativ al studioului CHRONICLE. Brandul, prețurile și contactele de pe această pagină sunt fictive.',
      footerLink: '← Înapoi la portofoliu',
      imgMissing: 'Imagine indisponibilă'
    }
  };

  function getLang() {
    var v = null;
    try { v = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage unavailable */ }
    return v === 'ro' ? 'ro' : 'ru';
  }
  var lang = getLang();

  /* ---------- Image fallback for third-party hotlinks ---------- */
  function placeholder() {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b1724"/><stop offset="1" stop-color="#2c1846"/></linearGradient></defs>' +
      '<rect width="800" height="600" fill="url(#g)"/>' +
      '<rect x="370" y="270" width="26" height="26" fill="#a64dff"/><rect x="398" y="298" width="26" height="26" fill="none" stroke="#cfa6ff" stroke-width="3"/></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function fixImage(img) {
    if (!img || img.dataset.chronicleFallback) return;
    var src = img.getAttribute('src') || '';
    if (!/^https?:/i.test(src)) return;
    img.dataset.chronicleFallback = '1';
    img.src = placeholder();
    if (!img.getAttribute('alt')) img.setAttribute('alt', T[lang].imgMissing);
  }
  window.addEventListener('error', function (e) {
    if (e.target && e.target.tagName === 'IMG') fixImage(e.target);
  }, true);
  function sweepImages() {
    Array.prototype.forEach.call(document.images, function (img) {
      if (img.complete && img.naturalWidth === 0) fixImage(img);
    });
  }

  /* ---------- Floating bar ---------- */
  var CSS = [
    ':host{all:initial}',
    '*{box-sizing:border-box;margin:0;font-family:"Manrope",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}',
    '.bar{position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;align-items:center;gap:4px;padding:5px;border-radius:14px;',
    'background:rgba(10,9,13,.88);backdrop-filter:blur(14px) saturate(140%);-webkit-backdrop-filter:blur(14px) saturate(140%);',
    'border:1px solid rgba(255,255,255,.12);box-shadow:0 14px 40px -12px rgba(0,0,0,.7),0 0 0 1px rgba(0,0,0,.25);color:#f3f1f8;font-size:14px;line-height:1}',
    'a,button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;min-height:38px;padding:0 12px;border-radius:10px;font-weight:600;font-size:14px;color:#f3f1f8;transition:background .2s,color .2s}',
    'a:hover,button:hover{background:rgba(255,255,255,.07)}',
    'a:focus-visible,button:focus-visible{outline:2px solid #cfa6ff;outline-offset:2px}',
    '.mark{position:relative;width:14px;height:14px;flex:none}',
    '.mark:before,.mark:after{content:"";position:absolute;width:7px;height:7px}',
    '.mark:before{left:0;top:0;background:#a64dff;box-shadow:0 0 10px rgba(166,77,255,.6)}',
    '.mark:after{right:0;bottom:0;border:1.2px solid #cfa6ff}',
    '.arrow{width:16px;height:16px;flex:none}',
    '.sep{width:1px;height:22px;background:rgba(255,255,255,.12)}',
    '.demo{gap:7px;padding:0 10px;color:#cfa6ff;font:600 11.5px/1 "JetBrains Mono",ui-monospace,Menlo,monospace;letter-spacing:.06em;text-transform:uppercase}',
    '.demo .i{width:15px;height:15px;flex:none}',
    '.pop{position:fixed;left:16px;bottom:72px;z-index:2147483000;width:min(340px,calc(100vw - 32px));padding:18px;border-radius:16px;',
    'background:rgba(14,12,19,.97);border:1px solid rgba(166,77,255,.35);box-shadow:0 24px 60px -16px rgba(0,0,0,.8);color:#d9d5e3;font-size:14px;line-height:1.55}',
    '.pop[hidden]{display:none}',
    '.pop p{margin:0 0 14px}',
    '.pop .row{display:flex;gap:8px;flex-wrap:wrap}',
    '.pop .primary{background:#a64dff;color:#fff;padding:0 14px}',
    '.pop .primary:hover{background:#b56bff}',
    '.pop .ghost{border:1px solid rgba(255,255,255,.16);padding:0 14px}',
    '@media (max-width:480px){.bar{left:10px;bottom:10px}.pop{left:10px;bottom:62px;width:calc(100vw - 20px)}.label-back{display:none}.demo{padding:0 8px}}',
    '@media print{.bar,.pop{display:none}}'
  ].join('');

  var ICON_ARROW = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  var ICON_INFO = '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';

  function build() {
    var host = document.createElement('chronicle-demo-bar');
    var root = host.attachShadow({ mode: 'open' });
    root.innerHTML = '<style>' + CSS + '</style>' +
      '<div class="bar" role="region">' +
        '<a class="back" href="' + HOME + '#work">' + ICON_ARROW + '<span class="mark" aria-hidden="true"></span><span class="label-back"></span></a>' +
        '<span class="sep" aria-hidden="true"></span>' +
        '<button class="demo" type="button" aria-expanded="false" aria-controls="pop">' + ICON_INFO + '<span class="label-demo"></span></button>' +
      '</div>' +
      '<div class="pop" id="pop" role="dialog" hidden>' +
        '<p class="info"></p>' +
        '<div class="row"><a class="primary" href="' + HOME + '#contact"></a><button class="ghost close" type="button"></button></div>' +
      '</div>';
    document.body.appendChild(host);

    var q = function (s) { return root.querySelector(s); };
    var demoBtn = q('.demo'), pop = q('.pop');
    function render() {
      var t = T[lang];
      q('.bar').setAttribute('aria-label', 'CHRONICLE');
      q('.back').setAttribute('aria-label', t.backLabel);
      q('.label-back').textContent = t.back;
      q('.label-demo').textContent = t.demo;
      demoBtn.setAttribute('title', t.infoLabel);
      pop.setAttribute('aria-label', t.infoLabel);
      q('.info').textContent = t.info;
      q('.primary').textContent = t.cta;
      q('.close').textContent = t.close;
    }
    function setPop(open) {
      pop.hidden = !open;
      demoBtn.setAttribute('aria-expanded', String(open));
    }
    demoBtn.addEventListener('click', function () { setPop(pop.hidden); });
    q('.close').addEventListener('click', function () { setPop(false); demoBtn.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) setPop(false); });
    document.addEventListener('click', function (e) { if (!pop.hidden && e.target !== host) setPop(false); });
    render();
    return render;
  }

  function buildFooter() {
    var f = document.createElement('chronicle-demo-note');
    var root = f.attachShadow({ mode: 'open' });
    root.innerHTML = '<style>' +
      ':host{all:initial;display:block}' +
      '.note{display:flex;flex-wrap:wrap;gap:10px 24px;align-items:center;justify-content:space-between;padding:22px max(16px,4vw) 92px;' +
      'background:#08080a;color:#aea9bd;border-top:1px solid rgba(255,255,255,.08);font:400 14px/1.55 "Manrope",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
      'a{color:#cfa6ff;font-weight:600;text-decoration:none}a:hover{text-decoration:underline}' +
      'a:focus-visible{outline:2px solid #cfa6ff;outline-offset:3px;border-radius:4px}' +
      '</style><div class="note"><span class="txt"></span><a href="' + HOME + '#work"></a></div>';
    document.body.appendChild(f);
    return function () {
      root.querySelector('.txt').textContent = T[lang].footer;
      root.querySelector('a').textContent = T[lang].footerLink;
    };
  }

  function init() {
    var renderBar = build();
    var renderNote = buildFooter();
    renderNote();
    sweepImages();
    window.addEventListener('load', sweepImages);
    // Follow the concept page's own RU/RO switch when it updates <html lang>.
    new MutationObserver(function () {
      var l = (document.documentElement.lang || '').slice(0, 2);
      if ((l === 'ru' || l === 'ro') && l !== lang) { lang = l; renderBar(); renderNote(); }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    // Most concept pages switch language with [data-lang] buttons and leave <html lang> alone.
    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-lang]') : null;
      var l = el && (el.getAttribute('data-lang') || '').toLowerCase();
      if ((l === 'ru' || l === 'ro') && l !== lang) { lang = l; renderBar(); renderNote(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
