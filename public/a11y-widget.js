/*! a11y-widget v1.0 (Spaces colours) — self-hosted accessibility adjustments menu (HE/EN/PT, RTL-aware).
 * It is an ASSISTIVE EXTRA, not a compliance fix: the site itself must meet WCAG 2.x AA in source.
 */
(function () {
  'use strict';
  var s = document.currentScript || {};
  var ds = (s.dataset) || {};
  var cfg = Object.assign({
    lang: ds.lang || document.documentElement.lang.slice(0, 2) || 'en',
    statementUrl: ds.statement || '/accessibility',
    position: ds.position || 'left'
  }, window.A11Y_WIDGET_CONFIG || {});

  var T = {
    he: { open: 'תפריט נגישות', title: 'התאמות נגישות', close: 'סגירה', bigger: 'הגדלת טקסט', smaller: 'הקטנת טקסט',
      contrast: 'ניגודיות גבוהה', gray: 'גווני אפור', links: 'הדגשת קישורים', font: 'גופן קריא', spacing: 'ריווח טקסט',
      motion: 'עצירת אנימציות', cursor: 'סמן גדול', focus: 'הדגשת פוקוס', reset: 'איפוס הגדרות', statement: 'הצהרת נגישות',
      size: 'גודל טקסט' },
    en: { open: 'Accessibility menu', title: 'Accessibility adjustments', close: 'Close', bigger: 'Increase text', smaller: 'Decrease text',
      contrast: 'High contrast', gray: 'Grayscale', links: 'Highlight links', font: 'Readable font', spacing: 'Text spacing',
      motion: 'Stop animations', cursor: 'Large cursor', focus: 'Highlight focus', reset: 'Reset settings', statement: 'Accessibility statement',
      size: 'Text size' },
    pt: { open: 'Menu de acessibilidade', title: 'Ajustes de acessibilidade', close: 'Fechar', bigger: 'Aumentar texto', smaller: 'Diminuir texto',
      contrast: 'Alto contraste', gray: 'Escala de cinzentos', links: 'Destacar ligações', font: 'Tipo de letra legível', spacing: 'Espaçamento do texto',
      motion: 'Parar animações', cursor: 'Cursor grande', focus: 'Destacar foco', reset: 'Repor definições', statement: 'Declaração de acessibilidade',
      size: 'Tamanho do texto' }
  };
  var t = T[cfg.lang] || T.en;
  var rtl = document.documentElement.dir === 'rtl' || cfg.lang === 'he' || cfg.lang === 'ar';
  var KEY = 'a11yw:v1';
  var TOGGLES = ['contrast', 'gray', 'links', 'font', 'spacing', 'motion', 'cursor', 'focus'];
  var state = { size: 0 };
  try { state = Object.assign(state, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}

  var css = [
    '.a11yw,.a11yw *{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif!important;letter-spacing:normal!important;line-height:1.4!important}',
    '.a11yw-btn{position:fixed;bottom:20px;' + cfg.position + ':20px;z-index:2147483646;width:52px;height:52px;border-radius:50%;border:2px solid #fff;background:#1b1b1b;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.35)}',
    '.a11yw-btn:focus-visible,.a11yw button:focus-visible,.a11yw a:focus-visible{outline:3px solid #1b1b1b!important;outline-offset:2px!important;box-shadow:0 0 0 5px #f6f3ea!important}',
    '.a11yw-panel{position:fixed;bottom:84px;' + cfg.position + ':20px;z-index:2147483647;width:300px;max-width:calc(100vw - 40px);max-height:calc(100vh - 110px);overflow:auto;background:#fff;color:#111;border:1px solid #444;border-radius:10px;padding:14px;box-shadow:0 6px 24px rgba(0,0,0,.3)}',
    '.a11yw-panel[hidden]{display:none}',
    '.a11yw-head{display:flex;justify-content:space-between;align-items:center;margin:0 0 10px}',
    '.a11yw-head h2{font-size:17px!important;margin:0;color:#111}',
    '.a11yw-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.a11yw button.a11yw-opt,.a11yw-size button{min-height:44px;padding:8px;border:2px solid #555;border-radius:8px;background:#f4f4f4;color:#111;font-size:14px!important;cursor:pointer;text-align:center}',
    '.a11yw button[aria-pressed="true"]{background:#1b1b1b;color:#f6f3ea;border-color:#1b1b1b}',
    '.a11yw-size{display:flex;gap:8px;align-items:center;margin-bottom:8px}.a11yw-size span{flex:1;font-size:14px!important}',
    '.a11yw-x{min-width:44px;min-height:44px;border:0;background:transparent;font-size:22px!important;cursor:pointer;color:#111}',
    '.a11yw-foot{display:flex;justify-content:space-between;gap:8px;margin-top:10px}',
    '.a11yw-foot a{color:#1b1b1b;font-size:14px!important;text-decoration:underline;align-self:center}',
    '.a11yw-foot button{min-height:44px;padding:8px 12px;border:2px solid #555;border-radius:8px;background:#fff;color:#111;font-size:14px!important;cursor:pointer}',
    'html.a11y-size-1{font-size:112.5%!important}html.a11y-size-2{font-size:125%!important}html.a11y-size-3{font-size:150%!important}',
    'html.a11y-contrast body,html.a11y-contrast body *:not(.a11yw):not(.a11yw *){background-color:#000!important;color:#fff!important;border-color:#fff!important}',
    'html.a11y-contrast body a:not(.a11yw *){color:#ff0!important}',
    'html.a11y-gray body>*:not(.a11yw){filter:grayscale(1)!important}',
    'html.a11y-links a:not(.a11yw *){text-decoration:underline!important;outline:2px solid currentColor!important;outline-offset:1px}',
    'html.a11y-font body *:not(.a11yw *){font-family:Arial,Helvetica,"Noto Sans Hebrew",sans-serif!important}',
    'html.a11y-spacing body *:not(.a11yw *){line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}html.a11y-spacing p{margin-bottom:2em!important}',
    'html.a11y-motion *,html.a11y-motion *::before,html.a11y-motion *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}',
    'html.a11y-cursor,html.a11y-cursor *{cursor:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\'%3E%3Cpath d=\'M4 2l28 16-12 3-6 13z\' fill=\'%23000\' stroke=\'%23fff\' stroke-width=\'2\'/%3E%3C/svg%3E") 4 2,auto!important}',
    'html.a11y-focus *:focus{outline:4px solid #1b1b1b!important;outline-offset:2px!important;box-shadow:0 0 0 7px #ffbf00!important}'
  ].join('\n');

  function apply(persist) {
    var h = document.documentElement;
    for (var i = 1; i <= 3; i++) h.classList.toggle('a11y-size-' + i, state.size === i);
    TOGGLES.forEach(function (k) { h.classList.toggle('a11y-' + k, !!state[k]); });
    if (state.motion) document.querySelectorAll('video[autoplay]').forEach(function (v) { try { v.pause(); } catch (e) {} });
    /* Store only after a user action: a user-requested preference is strictly necessary, no consent needed. */
    if (persist) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  }

  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    for (var a in attrs) n.setAttribute(a, attrs[a]);
    if (text) n.textContent = text;
    return n;
  }

  function build() {
    var style = el('style', { id: 'a11yw-style' }); style.textContent = css; document.head.appendChild(style);
    var root = el('div', { 'class': 'a11yw', dir: rtl ? 'rtl' : 'ltr', lang: cfg.lang });
    var btn = el('button', { 'class': 'a11yw-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'a11yw-panel', 'aria-label': t.open });
    btn.innerHTML = '<svg aria-hidden="true" focusable="false" width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="4" r="2"/><path d="M21 9h-6v13h-2v-6h-2v6H9V9H3V7h18z"/></svg>';
    var panel = el('div', { 'class': 'a11yw-panel', id: 'a11yw-panel', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'a11yw-title', hidden: '' });
    var head = el('div', { 'class': 'a11yw-head' });
    head.appendChild(el('h2', { id: 'a11yw-title' }, t.title));
    var x = el('button', { 'class': 'a11yw-x', type: 'button', 'aria-label': t.close }, '×');
    head.appendChild(x); panel.appendChild(head);

    var size = el('div', { 'class': 'a11yw-size', role: 'group', 'aria-label': t.size });
    var lbl = el('span', { 'aria-live': 'polite' });
    var minus = el('button', { type: 'button', 'aria-label': t.smaller }, 'A−');
    var plus = el('button', { type: 'button', 'aria-label': t.bigger }, 'A+');
    function upd() { lbl.textContent = t.size + ': ' + [100, 112, 125, 150][state.size] + '%'; }
    minus.onclick = function () { state.size = Math.max(0, state.size - 1); apply(true); upd(); };
    plus.onclick = function () { state.size = Math.min(3, state.size + 1); apply(true); upd(); };
    size.appendChild(lbl); size.appendChild(minus); size.appendChild(plus); panel.appendChild(size); upd();

    var grid = el('div', { 'class': 'a11yw-grid' });
    var optBtns = TOGGLES.map(function (k) {
      var b = el('button', { 'class': 'a11yw-opt', type: 'button', 'aria-pressed': String(!!state[k]) }, t[k]);
      b.onclick = function () { state[k] = !state[k]; b.setAttribute('aria-pressed', String(state[k])); apply(true); };
      grid.appendChild(b); return b;
    });
    panel.appendChild(grid);

    var foot = el('div', { 'class': 'a11yw-foot' });
    var link = el('a', { href: cfg.statementUrl }, t.statement);
    var reset = el('button', { type: 'button' }, t.reset);
    reset.onclick = function () {
      state = { size: 0 }; apply(true); upd();
      optBtns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    };
    foot.appendChild(link); foot.appendChild(reset); panel.appendChild(foot);

    function open(v) {
      panel.hidden = !v; btn.setAttribute('aria-expanded', String(v));
      if (v) x.focus(); else btn.focus();
    }
    btn.onclick = function () { open(panel.hidden); };
    x.onclick = function () { open(false); };
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { e.preventDefault(); open(false); } });

    root.appendChild(btn); root.appendChild(panel); document.body.appendChild(root);
    apply(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
