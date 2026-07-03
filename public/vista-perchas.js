// vista-perchas.js — Panel de fotos de perchas con semáforo de META.
// POSCuenca (demo de Amigable: punto de venta y control de inventario)
// JFC 2026-07-02 — adaptado de vista-mostradores.js (JFC), con:
//   - wording "percha" (la unidad operativa se llama PERCHA, nunca mostrador/ubicación)
//   - FOTO REAL por percha: el dueño toca la foto → cámara → resize 640px →
//     localStorage → re-render con semáforo actualizado
//   - semáforo por CUMPLIMIENTO DE META (spec JFC):
//       verde ≥100% · amarillo 70-99% · rojo <70% · azul sin meta definida
//   - badge inferior izquierdo: "% meta cumplida"
//   - fila de datos: Ventas del mes | Meta | Comisión | Promotor (SOLO dueño)
//
// INTEGRACIÓN: el botón nav data-vista="perchas" y la sección #vista-perchas
// viven ESTÁTICOS en index.html (el nav bindea handlers al cargar; un botón
// inyectado después no recibiría el handler). Este módulo solo renderiza.
// refrescarVistaActiva() llama a window.VPerchas.cargar().

(function () {
  'use strict';

  const API = '/api';
  const $ = (id) => document.getElementById(id);
  const money = (n) => '$' + Number(n || 0).toFixed(2);
  const esc = (s) => String(s == null ? '' : s)
    .replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // Colores Simon exactos — mismos que .caja en index.html
  const SIMON = {
    verde:    { bg: '#1DB954', border: '#17a347', tx: '#ffffff', txs: '#e0ffe8' },
    amarillo: { bg: '#FFB300', border: '#E6A100', tx: '#1e1a12', txs: '#5d5340' },
    rojo:     { bg: '#E53935', border: '#C62828', tx: '#ffffff', txs: '#ffe0e0' },
    azul:     { bg: '#2196F3', border: '#1976D2', tx: '#ffffff', txs: '#daeeff' },
  };
  const ORDEN = { rojo: 0, amarillo: 1, verde: 2, azul: 3 };

  // ── semáforo por cumplimiento de meta (spec JFC 2026-07-02) ────────────────
  function semaforoMeta(cumplimiento) {
    if (cumplimiento === null || cumplimiento === undefined) return 'azul'; // sin meta
    if (cumplimiento >= 100) return 'verde';
    if (cumplimiento >= 70)  return 'amarillo';
    return 'rojo';
  }

  // ── fotos en localStorage ──────────────────────────────────────────────────
  // Clave por percha. 640px JPEG ~60-120KB: caben decenas sin problema de cuota.
  const FOTO_KEY = (id) => 'vp_foto_percha_' + id;
  const getFoto = (id) => { try { return localStorage.getItem(FOTO_KEY(id)); } catch { return null; } };

  // Redimensiona a max 640px de ancho (mantiene proporción) vía canvas.
  function redimensionar(file, cb) {
    const img = new Image();
    img.onload = () => {
      const escala = Math.min(1, 640 / img.width);
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * escala);
      cv.height = Math.round(img.height * escala);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(img.src);
      cb(cv.toDataURL('image/jpeg', 0.8));
    };
    img.src = URL.createObjectURL(file);
  }

  // ── tarjeta de percha con foto ─────────────────────────────────────────────
  function _tarjeta(p) {
    const c = SIMON[p.semaforo];
    const esDueno = window.OCAuth && window.OCAuth.rolActual() === 'dueno';
    const foto = getFoto(p.id);

    // Sin foto: placeholder de color sólido Simon con la inicial — el panel
    // nace colorido aunque el dueño aún no haya fotografiado nada.
    const visual = foto
      ? `<img src="${foto}" alt="" style="width:100%;height:170px;object-fit:cover;display:block;">`
      : `<div style="width:100%;height:170px;display:flex;align-items:center;justify-content:center;
           background:${c.bg};color:${c.tx};font-family:var(--font-display);font-size:64px;font-weight:700;">
           ${esc((p.nombre || '?').trim().charAt(0).toUpperCase())}</div>`;

    const badgeMeta = p.cumplimiento === null
      ? 'sin meta'
      : p.cumplimiento.toFixed(0) + '% meta cumplida';

    // Fila financiera: SOLO dueño (empleado ve foto + semáforo, no dinero)
    const datos = esDueno ? `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;padding:12px 14px;background:var(--blanco-calido,#fbf5e8);">
        <div><span style="font-size:11px;font-family:var(--font-mono);color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em;display:block;">Ventas del mes</span>
          <strong style="font-size:16px;color:var(--ink);">${money(p.ventasMes)}</strong></div>
        <div><span style="font-size:11px;font-family:var(--font-mono);color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em;display:block;">Meta</span>
          <strong style="font-size:16px;color:var(--ink);">${p.meta ? money(p.meta) : '—'}</strong></div>
        <div><span style="font-size:11px;font-family:var(--font-mono);color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em;display:block;">Comisión</span>
          <strong style="font-size:16px;color:var(--ink);">${money(p.comision)}</strong></div>
        <div><span style="font-size:11px;font-family:var(--font-mono);color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em;display:block;">Promotor/a</span>
          <strong style="font-size:16px;color:var(--ink);">${p.promotor ? esc(p.promotor) : '—'}</strong></div>
      </div>` : '';

    return `
      <div class="tag-card" style="padding:0;overflow:hidden;border:3px solid ${c.border};border-radius:14px;">
        <div style="position:relative;cursor:${esDueno ? 'pointer' : 'default'};" ${esDueno ? `data-vp-foto="${esc(p.id)}" title="Toca para tomar una foto nueva"` : ''}>
          ${visual}
          <!-- dot semáforo, esquina superior derecha (spec JFC) -->
          <span style="position:absolute;top:10px;right:10px;width:18px;height:18px;border-radius:50%;
            background:${c.bg};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);"></span>
          <!-- badge % meta, esquina inferior izquierda (spec JFC) -->
          <span style="position:absolute;bottom:10px;left:10px;font-family:var(--font-mono);font-size:13px;
            font-weight:700;background:rgba(0,0,0,.65);color:#fff;padding:4px 10px;border-radius:20px;">${badgeMeta}</span>
          ${esDueno ? `<span style="position:absolute;bottom:10px;right:10px;font-size:16px;
            background:rgba(0,0,0,.55);padding:5px 8px;border-radius:8px;">📷</span>` : ''}
        </div>
        <div style="padding:10px 14px ${esDueno ? '0' : '12px'};background:var(--blanco-calido,#fbf5e8);">
          <strong style="font-family:var(--font-display);font-size:17px;color:var(--ink);">${esc(p.nombre)}</strong>
          ${p.activa === false ? '<span style="font-size:11px;font-family:var(--font-mono);color:var(--rojo,#a3392a);margin-left:8px;">INACTIVA</span>' : ''}
        </div>
        ${datos}
      </div>`;
  }

  // ── carga y render ─────────────────────────────────────────────────────────
  async function cargar() {
    const grid = $('vp-grid');
    if (!grid) return;
    grid.innerHTML = '<p style="font-size:14px;color:var(--ink-soft);font-family:var(--font-mono);padding:8px 0;">Cargando perchas…</p>';
    try {
      const [perchas, liq, promotoras] = await Promise.all([
        fetch(`${API}/ubicaciones?todas=1`).then((r) => r.json()),
        fetch(`${API}/liquidaciones`).then((r) => r.json()).catch(() => []),
        fetch(`${API}/promotoras`).then((r) => r.json()).catch(() => []),
      ]);
      if (!Array.isArray(perchas) || !perchas.length) {
        grid.innerHTML = '<p style="font-size:15px;color:var(--ink-soft);">No hay perchas. Créalas en Inventario → Perchas.</p>';
        return;
      }
      const liqPor = {}; (Array.isArray(liq) ? liq : []).forEach((f) => { liqPor[f.ubicacionId] = f; });
      const promPor = {}; (Array.isArray(promotoras) ? promotoras : []).forEach((pr) => { promPor[pr.id] = pr.nombre; });

      const ms = perchas.map((u) => {
        const f = liqPor[u.id];
        const cumplimiento = f ? f.cumplimientoMeta : null;   // null = sin meta → azul
        return {
          id: u.id, nombre: u.nombre, activa: u.activa !== false,
          semaforo: semaforoMeta(cumplimiento),
          cumplimiento: cumplimiento,
          ventasMes: f ? f.ventasBrutas : 0,
          meta: f ? f.metaMensual : (u.metaMensual || 0),
          comision: f ? f.comisionSocio : 0,
          promotor: u.promotoraId ? (promPor[u.promotoraId] || null) : null,
        };
      });
      ms.sort((a, b) => (ORDEN[a.semaforo] ?? 5) - (ORDEN[b.semaforo] ?? 5));
      grid.innerHTML = ms.map(_tarjeta).join('');
    } catch (err) {
      console.error('[VPerchas]', err);
      grid.innerHTML = `<p style="color:var(--rojo,#a3392a);font-size:14px;">No se pudo cargar: ${esc(err.message)}</p>`;
    }
  }

  // ── tap en la foto: cámara → resize → localStorage → re-render ────────────
  // Input file oculto reutilizable; capture="environment" abre la cámara
  // trasera directo en móvil (en desktop abre el selector de archivos).
  let perchaFotoPendiente = null;
  const inputFoto = document.createElement('input');
  inputFoto.type = 'file';
  inputFoto.accept = 'image/*';
  inputFoto.setAttribute('capture', 'environment');
  inputFoto.style.display = 'none';
  inputFoto.addEventListener('change', () => {
    const file = inputFoto.files && inputFoto.files[0];
    const id = perchaFotoPendiente;
    inputFoto.value = ''; perchaFotoPendiente = null;
    if (!file || !id) return;
    redimensionar(file, (dataUrl) => {
      try { localStorage.setItem(FOTO_KEY(id), dataUrl); } catch (e) {
        alert('No se pudo guardar la foto (espacio lleno). Borra alguna foto vieja.');
        return;
      }
      cargar(); // re-render con semáforo actualizado — "todo en 3 segundos"
    });
  });

  document.addEventListener('click', (e) => {
    const zona = e.target.closest('[data-vp-foto]');
    if (!zona) return;
    perchaFotoPendiente = zona.dataset.vpFoto;
    inputFoto.click();
  });

  function init() { document.body.appendChild(inputFoto); }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  window.VPerchas = { cargar };
})();
