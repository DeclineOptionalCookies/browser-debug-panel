/**
 * browser-debug-panel
 * Lightweight zero-dependency debug overlay for the browser.
 * Toggle with Ctrl+Shift+D / Cmd+Shift+D
 */
(function () {
  'use strict';

  if (window.DebugPanel) return; // already loaded

  const STYLE_ID = 'debug-panel-styles';
  const PANEL_ID = 'debug-panel-root';

  // ---------- styles ----------
  const css = `
    #${PANEL_ID} {
      --dp-bg: #0f1115;
      --dp-surface: #1a1d24;
      --dp-border: #2a2f3a;
      --dp-text: #e6e8ec;
      --dp-muted: #8b92a5;
      --dp-accent: #5b8def;
      --dp-warn: #f0b429;
      --dp-error: #ef5b5b;
      --dp-ok: #3ecf8e;
      position: fixed;
      top: 12px;
      right: 12px;
      width: min(380px, calc(100vw - 24px));
      max-height: calc(100vh - 24px);
      background: var(--dp-bg);
      color: var(--dp-text);
      font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      border: 1px solid var(--dp-border);
      border-radius: 10px;
      box-shadow: 0 12px 40px rgba(0,0,0,.45);
      z-index: 2147483646;
      display: none;
      flex-direction: column;
      overflow: hidden;
      user-select: text;
    }
    #${PANEL_ID}.dp-open { display: flex; }
    #${PANEL_ID} * { box-sizing: border-box; }
    #${PANEL_ID} .dp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: var(--dp-surface);
      border-bottom: 1px solid var(--dp-border);
      cursor: move;
      user-select: none;
    }
    #${PANEL_ID} .dp-title {
      font-weight: 600;
      letter-spacing: 0.02em;
      color: var(--dp-accent);
    }
    #${PANEL_ID} .dp-close {
      background: transparent;
      border: none;
      color: var(--dp-muted);
      font-size: 16px;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
    }
    #${PANEL_ID} .dp-close:hover { color: var(--dp-text); }
    #${PANEL_ID} .dp-tabs {
      display: flex;
      gap: 0;
      background: var(--dp-surface);
      border-bottom: 1px solid var(--dp-border);
      overflow-x: auto;
    }
    #${PANEL_ID} .dp-tab {
      flex: 1;
      padding: 8px 6px;
      text-align: center;
      background: transparent;
      border: none;
      color: var(--dp-muted);
      cursor: pointer;
      font: inherit;
      white-space: nowrap;
    }
    #${PANEL_ID} .dp-tab.dp-active {
      color: var(--dp-accent);
      box-shadow: inset 0 -2px 0 var(--dp-accent);
    }
    #${PANEL_ID} .dp-body {
      flex: 1;
      overflow: auto;
      padding: 10px 12px;
      min-height: 180px;
      max-height: 420px;
    }
    #${PANEL_ID} .dp-section { margin-bottom: 14px; }
    #${PANEL_ID} .dp-section h4 {
      margin: 0 0 6px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--dp-muted);
    }
    #${PANEL_ID} .dp-row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      padding: 3px 0;
      border-bottom: 1px solid transparent;
    }
    #${PANEL_ID} .dp-row:hover { border-bottom-color: var(--dp-border); }
    #${PANEL_ID} .dp-key { color: var(--dp-muted); }
    #${PANEL_ID} .dp-val { color: var(--dp-text); text-align: right; word-break: break-all; }
    #${PANEL_ID} .dp-fps { font-variant-numeric: tabular-nums; }
    #${PANEL_ID} .dp-btn-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }
    #${PANEL_ID} .dp-btn {
      background: var(--dp-surface);
      border: 1px solid var(--dp-border);
      color: var(--dp-text);
      padding: 5px 10px;
      border-radius: 6px;
      cursor: pointer;
      font: inherit;
    }
    #${PANEL_ID} .dp-btn:hover {
      border-color: var(--dp-accent);
      color: var(--dp-accent);
    }
    #${PANEL_ID} .dp-storage-item {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 4px;
      padding: 6px 0;
      border-bottom: 1px solid var(--dp-border);
    }
    #${PANEL_ID} .dp-storage-key {
      font-weight: 600;
      color: var(--dp-accent);
      word-break: break-all;
    }
    #${PANEL_ID} .dp-storage-val {
      grid-column: 1 / -1;
      color: var(--dp-muted);
      word-break: break-all;
      max-height: 60px;
      overflow: auto;
      white-space: pre-wrap;
    }
    #${PANEL_ID} .dp-input {
      width: 100%;
      background: var(--dp-bg);
      border: 1px solid var(--dp-border);
      color: var(--dp-text);
      padding: 6px 8px;
      border-radius: 6px;
      font: inherit;
      margin-top: 4px;
    }
    #${PANEL_ID} .dp-log {
      max-height: 280px;
      overflow: auto;
      font-size: 11px;
    }
    #${PANEL_ID} .dp-log-entry {
      padding: 3px 0;
      border-bottom: 1px solid var(--dp-border);
      word-break: break-word;
    }
    #${PANEL_ID} .dp-log-entry.dp-log-error { color: var(--dp-error); }
    #${PANEL_ID} .dp-log-entry.dp-log-warn { color: var(--dp-warn); }
    #${PANEL_ID} .dp-log-entry.dp-log-info { color: var(--dp-accent); }
    #${PANEL_ID} .dp-empty { color: var(--dp-muted); font-style: italic; }
  `;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ---------- state ----------
  let panelEl = null;
  let currentTab = 'info';
  let fps = 0;
  let frameTime = 0;
  let lastTs = performance.now();
  let frames = 0;
  let rafId = null;
  const logs = [];
  const MAX_LOGS = 100;

  // ---------- FPS loop ----------
  function tick(ts) {
    frames++;
    const delta = ts - lastTs;
    if (delta >= 1000) {
      fps = Math.round((frames * 1000) / delta);
      frameTime = +(delta / frames).toFixed(1);
      frames = 0;
      lastTs = ts;
      updateFpsDisplay();
    }
    rafId = requestAnimationFrame(tick);
  }

  function startFps() {
    if (rafId) return;
    lastTs = performance.now();
    frames = 0;
    rafId = requestAnimationFrame(tick);
  }

  function stopFps() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function updateFpsDisplay() {
    const el = panelEl && panelEl.querySelector('.dp-fps');
    if (el) el.textContent = `${fps} fps · ${frameTime} ms`;
  }

  // ---------- console capture ----------
  const original = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
  };

  function captureConsole() {
    ['log', 'warn', 'error', 'info'].forEach((level) => {
      console[level] = function (...args) {
        original[level].apply(console, args);
        const msg = args
          .map((a) => {
            try {
              if (typeof a === 'object') return JSON.stringify(a);
              return String(a);
            } catch {
              return String(a);
            }
          })
          .join(' ');
        logs.unshift({ level, msg, time: new Date().toLocaleTimeString() });
        if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
        if (currentTab === 'console' && panelEl) renderConsole();
      };
    });
  }

  // ---------- helpers ----------
  function getDeviceInfo() {
    const nav = navigator;
    return {
      'User Agent': nav.userAgent,
      Platform: nav.platform || '—',
      Language: nav.language || '—',
      Online: nav.onLine ? 'yes' : 'no',
      Cookies: nav.cookieEnabled ? 'enabled' : 'disabled',
      Hardware concurrency: nav.hardwareConcurrency || '—',
      Device memory: nav.deviceMemory ? nav.deviceMemory + ' GB' : '—',
      'Max touch points': nav.maxTouchPoints || 0,
    };
  }

  function getViewportInfo() {
    return {
      'Viewport (inner)': `${window.innerWidth} × ${window.innerHeight}`,
      'Screen': `${screen.width} × ${screen.height}`,
      'Available': `${screen.availWidth} × ${screen.availHeight}`,
      'Device pixel ratio': window.devicePixelRatio,
      'Color depth': screen.colorDepth + ' bit',
      Orientation: screen.orientation ? screen.orientation.type : '—',
    };
  }

  function storageEntries(store) {
    const items = [];
    try {
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        items.push({ key, value: store.getItem(key) });
      }
    } catch (e) {
      items.push({ key: '(error)', value: String(e) });
    }
    return items;
  }

  // ---------- rendering ----------
  function renderInfo() {
    const body = panelEl.querySelector('.dp-body');
    const device = getDeviceInfo();
    const viewport = getViewportInfo();

    let html = `<div class="dp-section"><h4>Performance</h4>
      <div class="dp-row"><span class="dp-key">FPS</span><span class="dp-val dp-fps">${fps} fps · ${frameTime} ms</span></div>
    </div>`;

    html += `<div class="dp-section"><h4>Viewport</h4>`;
    for (const [k, v] of Object.entries(viewport)) {
      html += `<div class="dp-row"><span class="dp-key">${k}</span><span class="dp-val">${v}</span></div>`;
    }
    html += `</div>`;

    html += `<div class="dp-section"><h4>Device</h4>`;
    for (const [k, v] of Object.entries(device)) {
      html += `<div class="dp-row"><span class="dp-key">${k}</span><span class="dp-val">${v}</span></div>`;
    }
    html += `</div>`;

    body.innerHTML = html;
  }

  function renderStorage(type) {
    const body = panelEl.querySelector('.dp-body');
    const store = type === 'local' ? localStorage : sessionStorage;
    const items = storageEntries(store);

    let html = `<div class="dp-section"><h4>${type === 'local' ? 'localStorage' : 'sessionStorage'} (${items.length})</h4>`;

    if (items.length === 0) {
      html += `<div class="dp-empty">Empty</div>`;
    } else {
      items.forEach(({ key, value }) => {
        const short = value && value.length > 120 ? value.slice(0, 120) + '…' : value;
        html += `<div class="dp-storage-item">
          <div class="dp-storage-key">${escapeHtml(key)}</div>
          <button class="dp-btn dp-del" data-key="${escapeAttr(key)}" data-type="${type}">×</button>
          <div class="dp-storage-val">${escapeHtml(short)}</div>
        </div>`;
      });
    }

    html += `</div>
      <div class="dp-section">
        <h4>Add / Update</h4>
        <input class="dp-input" id="dp-store-key" placeholder="key" />
        <input class="dp-input" id="dp-store-val" placeholder="value" />
        <div class="dp-btn-row">
          <button class="dp-btn" id="dp-store-set" data-type="${type}">Set</button>
          <button class="dp-btn" id="dp-store-clear" data-type="${type}">Clear all</button>
        </div>
      </div>`;

    body.innerHTML = html;

    // events
    body.querySelectorAll('.dp-del').forEach((btn) => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.key;
        const t = btn.dataset.type;
        (t === 'local' ? localStorage : sessionStorage).removeItem(k);
        renderStorage(t);
      });
    });

    const setBtn = body.querySelector('#dp-store-set');
    if (setBtn) {
      setBtn.addEventListener('click', () => {
        const k = body.querySelector('#dp-store-key').value;
        const v = body.querySelector('#dp-store-val').value;
        if (!k) return;
        (type === 'local' ? localStorage : sessionStorage).setItem(k, v);
        renderStorage(type);
      });
    }

    const clearBtn = body.querySelector('#dp-store-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm(`Clear all ${type}Storage?`)) {
          (type === 'local' ? localStorage : sessionStorage).clear();
          renderStorage(type);
        }
      });
    }
  }

  function renderConsole() {
    const body = panelEl.querySelector('.dp-body');
    let html = `<div class="dp-section"><h4>Console (${logs.length})</h4>
      <div class="dp-btn-row" style="margin-bottom:8px">
        <button class="dp-btn" id="dp-log-clear">Clear</button>
      </div>
      <div class="dp-log">`;

    if (logs.length === 0) {
      html += `<div class="dp-empty">No captured logs yet</div>`;
    } else {
      logs.forEach((entry) => {
        html += `<div class="dp-log-entry dp-log-${entry.level}">[${entry.time}] ${escapeHtml(entry.msg)}</div>`;
      });
    }
    html += `</div></div>`;
    body.innerHTML = html;

    const clear = body.querySelector('#dp-log-clear');
    if (clear) {
      clear.addEventListener('click', () => {
        logs.length = 0;
        renderConsole();
      });
    }
  }

  function renderActions() {
    const body = panelEl.querySelector('.dp-body');
    body.innerHTML = `
      <div class="dp-section">
        <h4>Quick Actions</h4>
        <div class="dp-btn-row">
          <button class="dp-btn" id="dp-act-reload">Hard Reload</button>
          <button class="dp-btn" id="dp-act-copy">Copy URL</button>
          <button class="dp-btn" id="dp-act-clear-ls">Clear localStorage</button>
          <button class="dp-btn" id="dp-act-clear-ss">Clear sessionStorage</button>
          <button class="dp-btn" id="dp-act-dark">Toggle page dark mode</button>
        </div>
      </div>
      <div class="dp-section">
        <h4>Location</h4>
        <div class="dp-row"><span class="dp-key">URL</span><span class="dp-val">${escapeHtml(location.href)}</span></div>
        <div class="dp-row"><span class="dp-key">Path</span><span class="dp-val">${escapeHtml(location.pathname)}</span></div>
      </div>
    `;

    body.querySelector('#dp-act-reload').addEventListener('click', () => location.reload(true));
    body.querySelector('#dp-act-copy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        alert('URL copied');
      } catch {
        prompt('Copy this URL:', location.href);
      }
    });
    body.querySelector('#dp-act-clear-ls').addEventListener('click', () => {
      if (confirm('Clear localStorage?')) localStorage.clear();
    });
    body.querySelector('#dp-act-clear-ss').addEventListener('click', () => {
      if (confirm('Clear sessionStorage?')) sessionStorage.clear();
    });
    body.querySelector('#dp-act-dark').addEventListener('click', () => {
      document.documentElement.style.filter =
        document.documentElement.style.filter === 'invert(1) hue-rotate(180deg)'
          ? ''
          : 'invert(1) hue-rotate(180deg)';
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, '"');
  }

  function switchTab(tab) {
    currentTab = tab;
    panelEl.querySelectorAll('.dp-tab').forEach((t) => {
      t.classList.toggle('dp-active', t.dataset.tab === tab);
    });
    if (tab === 'info') renderInfo();
    else if (tab === 'local') renderStorage('local');
    else if (tab === 'session') renderStorage('session');
    else if (tab === 'console') renderConsole();
    else if (tab === 'actions') renderActions();
  }

  // ---------- panel creation ----------
  function createPanel() {
    injectStyles();
    panelEl = document.createElement('div');
    panelEl.id = PANEL_ID;
    panelEl.innerHTML = `
      <div class="dp-header">
        <span class="dp-title">Debug Panel</span>
        <button class="dp-close" title="Close">×</button>
      </div>
      <div class="dp-tabs">
        <button class="dp-tab dp-active" data-tab="info">Info</button>
        <button class="dp-tab" data-tab="local">localStorage</button>
        <button class="dp-tab" data-tab="session">session</button>
        <button class="dp-tab" data-tab="console">Console</button>
        <button class="dp-tab" data-tab="actions">Actions</button>
      </div>
      <div class="dp-body"></div>
    `;
    document.body.appendChild(panelEl);

    panelEl.querySelector('.dp-close').addEventListener('click', hide);
    panelEl.querySelectorAll('.dp-tab').forEach((tab) => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // simple drag
    const header = panelEl.querySelector('.dp-header');
    let dragging = false, ox = 0, oy = 0;
    header.addEventListener('mousedown', (e) => {
      dragging = true;
      ox = e.clientX - panelEl.offsetLeft;
      oy = e.clientY - panelEl.offsetTop;
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      panelEl.style.left = e.clientX - ox + 'px';
      panelEl.style.top = e.clientY - oy + 'px';
      panelEl.style.right = 'auto';
    });
    window.addEventListener('mouseup', () => { dragging = false; });

    switchTab('info');
  }

  function show() {
    if (!panelEl) createPanel();
    panelEl.classList.add('dp-open');
    startFps();
  }

  function hide() {
    if (panelEl) panelEl.classList.remove('dp-open');
    stopFps();
  }

  function toggle() {
    if (panelEl && panelEl.classList.contains('dp-open')) hide();
    else show();
  }

  function isVisible() {
    return !!(panelEl && panelEl.classList.contains('dp-open'));
  }

  // ---------- keyboard ----------
  function onKey(e) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
      e.preventDefault();
      toggle();
    }
  }

  // ---------- public API ----------
  window.DebugPanel = {
    toggle,
    show,
    hide,
    isVisible,
  };

  // auto init
  function init() {
    captureConsole();
    document.addEventListener('keydown', onKey);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
