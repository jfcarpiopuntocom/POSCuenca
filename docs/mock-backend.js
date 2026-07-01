// mock-backend.js — Backend simulado dentro del navegador, para la demo
// pública en GitHub Pages (que no puede correr Node). Intercepta fetch a
// /api/* y responde con la misma lógica que server.js, usando datos de
// ejemplo en memoria. En el servidor real este archivo NO se carga.
(function () {
  // Marca global para que index.html sepa que corre sin backend real y NUNCA
  // muestre un mensaje de "el servidor no responde" en la demo pública.
  window.OC_DEMO = true;
  const ZONA = "America/Guayaquil";
  function hoyISO() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  }
  // Días reales del mes actual (28/29/30/31) — espejo de diasEnMesActual() en server.js.
  function diasEnMesActual() {
    const [anio, mes] = hoyISO().split("-").map(Number);
    return new Date(anio, mes, 0).getDate();
  }

  const ubicaciones = [
      {
          "id": "centro",
          "nombre": "Local Centro Histórico",
          "activa": true,
          "tipo": "propio"
      },
      {
          "id": "mercado",
          "nombre": "Stand Mercado 10 de Agosto",
          "activa": true,
          "tipo": "socio",
          "comisionSocio": 25,
          "metaMensual": 300,
          "escalasComision": [
              {
                  "hasta": 80,
                  "comision": 25
              },
              {
                  "hasta": 100,
                  "comision": 30
              },
              {
                  "hasta": 120,
                  "comision": 35
              },
              {
                  "hasta": 999,
                  "comision": 40
              }
          ]
      },
      {
          "id": "feria",
          "nombre": "Feria Artesanal El Otorongo",
          "activa": true,
          "tipo": "consignacion",
          "comisionSocio": 30,
          "metaMensual": 200,
          "escalasComision": []
      }
  ];

  const productos = [
    {"id":"p01","nombre":"Zhumir Seco 750ml","categoria":"Licores","sku":"ZHU-SEC-750","barcode":"7861000010019","ubicacionId":"centro","precio":8.5,"costo":5.9,"stockActual":42,"umbralRojo":10,"umbralAmarillo":20,"proveedor":"Distribuidora Azuay"},
    {"id":"p02","nombre":"Canelazo Artesanal 750ml","categoria":"Licores","sku":"CAN-ART-750","barcode":"7861000010026","ubicacionId":"centro","precio":12,"costo":6.5,"stockActual":8,"umbralRojo":10,"umbralAmarillo":18,"proveedor":"Licores del Tomebamba"},
    {"id":"p03","nombre":"Aguardiente Puntas Cuenca 1L","categoria":"Licores","sku":"AGU-PUN-1L","barcode":"7861000010033","ubicacionId":"mercado","precio":6,"costo":3.2,"stockActual":30,"umbralRojo":12,"umbralAmarillo":24,"proveedor":"Licores del Tomebamba"},
    {"id":"p04","nombre":"Ron San Miguel Añejo 750ml","categoria":"Licores","sku":"RON-SM-750","barcode":"7861000010040","ubicacionId":"centro","precio":14.5,"costo":9.8,"stockActual":16,"umbralRojo":6,"umbralAmarillo":12,"proveedor":"Distribuidora Azuay"},
    {"id":"p05","nombre":"Vino Hervido Caliente 500ml","categoria":"Licores","sku":"VIN-HER-500","barcode":"7861000010057","ubicacionId":"feria","precio":5.5,"costo":2.8,"stockActual":3,"umbralRojo":8,"umbralAmarillo":16,"proveedor":"Licores del Tomebamba","perecible":true,"fechaCaducidad":"2026-07-05","metodoCosteo":"FIFO","lotes":[]},
    {"id":"p06","nombre":"Draque de Mora Artesanal 750ml","categoria":"Licores","sku":"DRA-MOR-750","barcode":"7861000010064","ubicacionId":"mercado","precio":11,"costo":6,"stockActual":22,"umbralRojo":8,"umbralAmarillo":16,"proveedor":"Licores del Tomebamba","perecible":true,"fechaCaducidad":"2026-08-20","metodoCosteo":"FIFO","lotes":[]},
    {"id":"p07","nombre":"Sombrero de Paja Toquilla Fino","categoria":"Artesanías","sku":"SOM-PAJ-001","barcode":"7861000020017","ubicacionId":"centro","precio":45,"costo":22,"stockActual":14,"umbralRojo":4,"umbralAmarillo":8,"proveedor":"Tejedoras de Sígsig"},
    {"id":"p08","nombre":"Macana de Ikat Gualaceo","categoria":"Artesanías","sku":"MAC-IKA-001","barcode":"7861000020024","ubicacionId":"feria","precio":38,"costo":18,"stockActual":9,"umbralRojo":4,"umbralAmarillo":8,"proveedor":"Taller Gualaceo"},
    {"id":"p09","nombre":"Aretes de Filigrana de Plata","categoria":"Joyería","sku":"JOY-FIL-001","barcode":"7861000020031","ubicacionId":"centro","precio":32,"costo":14,"stockActual":18,"umbralRojo":5,"umbralAmarillo":10,"proveedor":"Orfebres Chordeleg"},
    {"id":"p10","nombre":"Figura Tallada en Tagua","categoria":"Artesanías","sku":"TAG-FIG-001","barcode":"7861000020048","ubicacionId":"mercado","precio":9.5,"costo":4,"stockActual":4,"umbralRojo":6,"umbralAmarillo":12,"proveedor":"Taller El Vergel"},
    {"id":"p11","nombre":"Jarrón de Cerámica Pintado","categoria":"Cerámica","sku":"CER-JAR-001","barcode":"7861000020055","ubicacionId":"feria","precio":18,"costo":8.5,"stockActual":12,"umbralRojo":4,"umbralAmarillo":9,"proveedor":"Cerámica San Marcos"},
    {"id":"p12","nombre":"Olla de Barro Esmaltada","categoria":"Cerámica","sku":"CER-OLL-001","barcode":"7861000020062","ubicacionId":"mercado","precio":15,"costo":7,"stockActual":20,"umbralRojo":6,"umbralAmarillo":12,"proveedor":"Cerámica San Marcos"},
    {"id":"p13","nombre":"Poncho de Lana Cañari","categoria":"Textiles","sku":"TEX-PON-001","barcode":"7861000020079","ubicacionId":"centro","precio":55,"costo":28,"stockActual":6,"umbralRojo":3,"umbralAmarillo":6,"proveedor":"Tejedoras de Sígsig"},
    {"id":"p14","nombre":"Vela Aromática Artesanal","categoria":"Artesanías","sku":"VEL-ARO-001","barcode":"7861000020086","ubicacionId":"feria","precio":6.5,"costo":2.5,"stockActual":35,"umbralRojo":10,"umbralAmarillo":20,"proveedor":"Taller El Vergel"},
    {"id":"p15","nombre":"Mermelada Artesanal de Mora 250g","categoria":"Gourmet","sku":"GOU-MER-250","barcode":"7861000020093","ubicacionId":"mercado","precio":4,"costo":1.6,"stockActual":28,"umbralRojo":10,"umbralAmarillo":18,"proveedor":"Productos del Valle","perecible":true,"fechaCaducidad":"2026-10-01","metodoCosteo":"FIFO","lotes":[]},
    {"id":"p16","nombre":"Vela Aromática Artesanal","categoria":"Artesanías","sku":"VEL-ARO-001","barcode":"7861000020086","ubicacionId":"centro","precio":6.5,"costo":2.5,"stockActual":2,"umbralRojo":10,"umbralAmarillo":20,"proveedor":"Taller El Vergel"}
  ];

  const ventas = [];
  const movimientos = [];
  const transferencias = [];
  const gastosMensuales = {"centro":0,"mercado":0,"feria":0};
  const ORDEN = { rojo: 0, amarillo: 1, azul: 2, verde: 3 };

  function nombreUbic(id) { const u = ubicaciones.find((x) => x.id === id); return u ? u.nombre : "Ubicación desconocida"; }

  // ---- Revenue sharing (espejo de data.js) ----
  function mesActualISO() { return hoyISO().slice(0, 7); }
  function esDelMesActual(fechaISO) { return fechaISO && fechaISO.slice(0, 7) === mesActualISO(); }
  function ventasMesAcumuladas(ubicacionId) {
    return ventas.filter((v) => v.ubicacionId === ubicacionId && esDelMesActual(v.fecha)).reduce((a, v) => a + v.precioUnit * v.cantidad, 0);
  }
  function comisionVigente(u, acumuladoConEsta) {
    const escalas = Array.isArray(u.escalasComision) ? u.escalasComision : [];
    if (!u.metaMensual || escalas.length === 0) return Number(u.comisionSocio) || 0;
    const pctMeta = (acumuladoConEsta / u.metaMensual) * 100;
    const ordenadas = [...escalas].sort((a, b) => a.hasta - b.hasta);
    const tier = ordenadas.find((e) => pctMeta <= e.hasta) || ordenadas[ordenadas.length - 1];
    return Number(tier.comision) || 0;
  }
  function calcularSplitVenta(u, montoBruto, acumuladoPrevio) {
    if (!u || u.tipo === "propio" || !u.tipo) return null;
    const comisionPct = comisionVigente(u, acumuladoPrevio + montoBruto);
    const montoComisionSocio = +(montoBruto * (comisionPct / 100)).toFixed(2);
    return { comisionPct, montoBruto: +montoBruto.toFixed(2), montoComisionSocio, montoNetoDueno: +(montoBruto - montoComisionSocio).toFixed(2) };
  }
  function getLiquidaciones() {
    return ubicaciones.filter((u) => u.tipo && u.tipo !== "propio").map((u) => {
      const ventasMes = ventas.filter((v) => v.ubicacionId === u.id && esDelMesActual(v.fecha) && v.split);
      const ventasBrutas = ventasMes.reduce((a, v) => a + v.split.montoBruto, 0);
      const comisionSocio = ventasMes.reduce((a, v) => a + v.split.montoComisionSocio, 0);
      const netoDueno = ventasMes.reduce((a, v) => a + v.split.montoNetoDueno, 0);
      const pendientes = ventasMes.filter((v) => !v.liquidada);
      return {
        ubicacionId: u.id, ubicacion: u.nombre, tipo: u.tipo, metaMensual: u.metaMensual || 0,
        cumplimientoMeta: u.metaMensual ? +((ventasBrutas / u.metaMensual) * 100).toFixed(1) : null,
        ventasBrutas: +ventasBrutas.toFixed(2), comisionSocio: +comisionSocio.toFixed(2), netoDueno: +netoDueno.toFixed(2),
        estado: ventasMes.length === 0 ? "sin ventas" : pendientes.length === 0 ? "pagado" : "pendiente",
        ventasPendientes: pendientes.length,
      };
    });
  }
  // ---- Inventario compartido (espejo de data.js) ----
  function estadoSimple(p) { if (p.stockActual <= 0) return "rojo"; if (p.stockActual <= p.umbralRojo) return "rojo"; if (p.stockActual <= p.umbralAmarillo) return "amarillo"; return "verde"; }
  function getSugerenciasTransferencia(productoId) {
    const p = productos.find((x) => x.id === productoId);
    if (!p || estadoSimple(p) === "verde") return [];
    const activasIds = new Set(ubicaciones.filter((u) => u.activa !== false).map((u) => u.id));
    return productos.filter((x) => x.sku === p.sku && x.id !== p.id && activasIds.has(x.ubicacionId) && estadoSimple(x) !== "rojo" && x.stockActual > x.umbralAmarillo)
      .map((x) => ({ productoDestinoId: p.id, productoOrigenId: x.id, sku: p.sku, nombre: p.nombre, desde: x.ubicacionId, desdeNombre: nombreUbic(x.ubicacionId), hacia: p.ubicacionId, haciaNombre: nombreUbic(p.ubicacionId), stockOrigen: x.stockActual, cantidadSugerida: Math.min(Math.floor(x.stockActual / 2), x.stockActual - x.umbralAmarillo) }))
      .filter((s) => s.cantidadSugerida > 0);
  }
  // Días para vencer (negativo = ya venció). Espejo de diasParaVencer() en server.js.
  function diasParaVencer(fecha) {
    if (!fecha) return null;
    const hoy = new Date(hoyISO() + "T00:00:00");
    const venc = new Date(fecha + "T00:00:00");
    return Math.round((venc - hoy) / 86400000);
  }
  // Espejo de calcularEstado() en server.js: combina stock + vencimiento,
  // se queda con la señal más grave de las dos.
  function estadoDe(p) {
    const margen = p.precio > 0 ? (p.precio - p.costo) / p.precio : 0;
    const dias = p.perecible ? diasParaVencer(p.fechaCaducidad) : null;
    let porStock;
    if (p.stockActual <= 0) porStock = { estado: "rojo", mensaje: "Sin stock — repón cuanto antes" };
    else if (p.stockActual <= p.umbralRojo) porStock = { estado: "rojo", mensaje: `Quedan ${p.stockActual} — reponer urgente` };
    else if (p.stockActual <= p.umbralAmarillo) porStock = { estado: "amarillo", mensaje: `Quedan ${p.stockActual} — revisar pronto` };
    else if (margen >= 0.5) porStock = { estado: "azul", mensaje: "Buen margen — impúlsalo esta semana" };
    else porStock = { estado: "verde", mensaje: "Stock saludable" };
    if (dias == null) return { ...porStock, dias };
    let porVenc = null;
    if (dias < 0) porVenc = { estado: "rojo", mensaje: `Venció hace ${Math.abs(dias)} día${Math.abs(dias) === 1 ? "" : "s"} — retíralo` };
    else if (dias <= 3) porVenc = { estado: "rojo", mensaje: `Vence en ${dias} día${dias === 1 ? "" : "s"} — véndelo ya` };
    else if (dias <= 7) porVenc = { estado: "amarillo", mensaje: `Vence en ${dias} días — véndelo primero` };
    if (!porVenc) return { ...porStock, dias };
    const masGrave = ORDEN[porVenc.estado] <= ORDEN[porStock.estado] ? porVenc : porStock;
    return { ...masGrave, dias };
  }
  function ficha(p) {
    const e = estadoDe(p);
    return { id: p.id, nombre: p.nombre, precio: p.precio, sku: p.sku, barcode: p.barcode, proveedor: p.proveedor, stockActual: p.stockActual, estado: e.estado, mensaje: e.mensaje, categoria: p.categoria, ubicacionId: p.ubicacionId, ubicacionNombre: nombreUbic(p.ubicacionId), perecible: !!p.perecible, fechaCaducidad: p.fechaCaducidad || null, diasParaVencer: e.dias, metodoCosteo: p.metodoCosteo || "FIFO", foto: p.foto || null };
  }
  function filtrar(uid) { return !uid || uid === "todas" ? productos : productos.filter((p) => p.ubicacionId === uid); }
  function ventasHoyDe(uid) { return ventas.filter((v) => (!uid || uid === "todas" || v.ubicacionId === uid)); }
  function mov(tipo, detalle) { movimientos.push({ id: String(Date.now() + Math.random()), tipo, detalle, fecha: new Date().toISOString() }); }
  const J = (obj, status) => new Response(JSON.stringify(obj), { status: status || 200, headers: { "Content-Type": "application/json" } });

  // Genera un QR como data URL sin dependencias: usa una API pública de imagen.
  // Para una demo es suficiente; el backend real lo genera localmente con qrcode.
  function qrDataUrl(payload) {
    return "https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=4&data=" + encodeURIComponent(payload);
  }

  const realFetch = window.fetch.bind(window);

  window.fetch = async function (url, opts) {
    try {
      const u = new URL(url, window.location.origin);
      if (!u.pathname.startsWith("/api")) return realFetch(url, opts);
      const path = u.pathname;
      const q = u.searchParams;
      const body = opts && opts.body ? JSON.parse(opts.body) : {};
      const uid = q.get("ubicacionId");

      let m;
      // Edicion libre de la ficha (nombre, foto, precios, codigo interno).
      // El gating por rol (empleado NO edita) vive en la UI; aca solo se aplica.
      if ((m = path.match(/^\/api\/productos\/([^/]+)$/)) && opts && opts.method === "PATCH") {
        const p = productos.find((x) => x.id === m[1]); if (!p) return J({ error: "Producto no encontrado." }, 404);
        const CAMPOS = ["nombre", "categoria", "precio", "costo", "proveedor", "foto", "barcode", "sku", "perecible", "fechaCaducidad", "metodoCosteo"];
        CAMPOS.forEach((k) => { if (body[k] !== undefined) p[k] = (k === "precio" || k === "costo") ? Number(body[k]) || 0 : body[k]; });
        mov("edicion", { producto: p.nombre, sku: p.sku, ubicacion: nombreUbic(p.ubicacionId) });
        return J(ficha(p));
      }
      // Borrado definitivo (dueno, doble confirmacion en la UI).
      if ((m = path.match(/^\/api\/productos\/([^/]+)$/)) && opts && opts.method === "DELETE") {
        const i = productos.findIndex((x) => x.id === m[1]); if (i === -1) return J({ error: "Producto no encontrado." }, 404);
        const borrado = productos.splice(i, 1)[0];
        mov("baja", { producto: borrado.nombre, sku: borrado.sku, ubicacion: nombreUbic(borrado.ubicacionId) });
        return J({ ok: true });
      }
      if (path === "/api/modo") return J({ modo: "demo-estatico" });
      if (path === "/api/ubicaciones" && (!opts || opts.method !== "POST")) {
        const soloActivas = q.get("todas") !== "1";
        return J(soloActivas ? ubicaciones.filter((u) => u.activa !== false) : ubicaciones);
      }
      if (path === "/api/ubicaciones" && opts && opts.method === "POST") {
        if (!body.nombre || !body.nombre.trim()) return J({ error: "El nombre de la ubicación es obligatorio." }, 400);
        const nueva = { id: "u" + Math.random().toString(36).slice(2, 9), nombre: body.nombre.trim(), tipo: body.tipo || "propio", activa: true, comisionSocio: Number(body.comisionSocio) || 0, metaMensual: Number(body.metaMensual) || 0, escalasComision: Array.isArray(body.escalasComision) ? body.escalasComision : [] };
        ubicaciones.push(nueva);
        mov("ubicacion-alta", { ubicacion: nueva.nombre });
        return J(nueva);
      }
      if ((m = path.match(/^\/api\/ubicaciones\/([^/]+)$/)) && opts && opts.method === "PUT") {
        const u = ubicaciones.find((x) => x.id === m[1]); if (!u) return J({ error: "Ubicación no encontrada." }, 404);
        if (body.nombre && body.nombre.trim()) u.nombre = body.nombre.trim();
        if (body.tipo) u.tipo = body.tipo;
        return J(u);
      }
      if ((m = path.match(/^\/api\/ubicaciones\/([^/]+)\/(activar|desactivar)$/))) {
        const u = ubicaciones.find((x) => x.id === m[1]); if (!u) return J({ error: "Ubicación no encontrada." }, 404);
        u.activa = m[2] === "activar";
        mov(u.activa ? "ubicacion-reactivada" : "ubicacion-desactivada", { ubicacion: u.nombre });
        return J(u);
      }

      if (path === "/api/dashboard") {
        const ps = filtrar(uid), vh = ventasHoyDe(uid);
        const entra = vh.reduce((a, v) => a + v.precioUnit * v.cantidad, 0);
        const sale = vh.reduce((a, v) => a + v.costoUnit * v.cantidad, 0);
        const inv = ps.reduce((a, p) => a + p.precio * p.stockActual, 0);
        const alertas = ps.map((p) => ({ p, ...estadoDe(p) })).filter((e) => e.estado === "rojo" || e.estado === "amarillo").sort((a, b) => ORDEN[a.estado] - ORDEN[b.estado]).map((e) => ({ estado: e.estado, mensaje: `${e.p.nombre}: ${e.mensaje}` }));
        let sem = "verde";
        if (alertas.some((a) => a.estado === "rojo")) sem = "rojo"; else if (alertas.some((a) => a.estado === "amarillo")) sem = "amarillo";
        return J({ semaforoGeneral: sem, resumenDia: { entra: +entra.toFixed(2), sale: +sale.toFixed(2), gananciaHoy: +(entra - sale).toFixed(2), inventarioValorizado: +inv.toFixed(2), ventasCount: vh.length }, alertas });
      }

      if (path === "/api/productos" && (!opts || opts.method !== "POST")) {
        let lista = filtrar(uid).map((p) => { const e = estadoDe(p); return { id: p.id, nombre: p.nombre, categoria: p.categoria, sku: p.sku, stockActual: p.stockActual, estado: e.estado, mensaje: e.mensaje, precio: p.precio, perecible: !!p.perecible, fechaCaducidad: p.fechaCaducidad || null, diasParaVencer: e.dias }; });
        const est = q.get("estado");
        if (est) lista = lista.filter((x) => x.estado === est);
        lista.sort((a, b) => ORDEN[a.estado] - ORDEN[b.estado] || a.nombre.localeCompare(b.nombre, "es"));
        return J(lista);
      }

      if (path === "/api/productos" && opts && opts.method === "POST") {
        if (!body.nombre || !body.barcode) return J({ error: "Falta el nombre o el código de barras." }, 400);
        if (body.perecible && !body.fechaCaducidad) return J({ error: "Si el producto expira, indica su fecha de caducidad." }, 400);
        const ubicNueva = body.ubicacionId && body.ubicacionId !== "todas" ? ubicaciones.find((x) => x.id === body.ubicacionId) : null;
        if (ubicNueva && ubicNueva.activa === false) return J({ error: `"${ubicNueva.nombre}" está desactivada — reactívala en Avanzado antes de agregar productos ahí.` }, 400);
        const nuevo = {
          id: "p" + Math.random().toString(36).slice(2, 9), nombre: body.nombre, categoria: body.categoria || "General",
          sku: body.sku || body.barcode, barcode: body.barcode, ubicacionId: body.ubicacionId || "todas",
          precio: Number(body.precio) || 0, costo: Number(body.costo) || 0, stockActual: Number(body.stockInicial) || 0,
          umbralRojo: Number(body.umbralRojo) || 5, umbralAmarillo: Number(body.umbralAmarillo) || 10, proveedor: body.proveedor || "",
          perecible: !!body.perecible, fechaCaducidad: body.perecible ? (body.fechaCaducidad || null) : null,
          metodoCosteo: body.metodoCosteo === "LIFO" ? "LIFO" : "FIFO",
        };
        productos.push(nuevo);
        mov("alta", { producto: nuevo.nombre, sku: nuevo.sku, ubicacion: nombreUbic(nuevo.ubicacionId) });
        return J(ficha(nuevo));
      }

      if ((m = path.match(/^\/api\/productos\/([^/]+)\/venta$/))) {
        const p = productos.find((x) => x.id === m[1]); if (!p) return J({ error: "Producto no encontrado." }, 404);
        const ubicP = ubicaciones.find((x) => x.id === p.ubicacionId);
        if (ubicP && ubicP.activa === false) return J({ error: `"${ubicP.nombre}" está desactivada — no admite ventas nuevas.` }, 400);
        const cant = Number.isInteger(body.cantidad) && body.cantidad > 0 ? body.cantidad : 1;
        if (p.stockActual < cant) return J({ error: `No hay suficiente stock disponible (quedan ${p.stockActual}).` }, 400);
        const montoBruto = p.precio * cant;
        const acumuladoPrevio = ubicP ? ventasMesAcumuladas(ubicP.id) : 0;
        const split = ubicP ? calcularSplitVenta(ubicP, montoBruto, acumuladoPrevio) : null;
        p.stockActual -= cant;
        const ventaId = String(Date.now() + Math.random());
        ventas.push({ id: ventaId, productoId: p.id, ubicacionId: p.ubicacionId, cantidad: cant, precioUnit: p.precio, costoUnit: p.costo, fecha: new Date().toISOString(), split, liquidada: false });
        mov("venta", { producto: p.nombre, cantidad: cant, total: +(p.precio * cant).toFixed(2), ubicacion: nombreUbic(p.ubicacionId) });
        return J({ producto: ficha(p), ventaId });
      }
      if ((m = path.match(/^\/api\/ventas\/([^/]+)\/anular$/))) {
        const idx = ventas.findIndex((v) => v.id === m[1]);
        if (idx === -1) return J({ error: "Esta venta ya no se puede anular (pasó el tiempo o ya se anuló)." }, 400);
        const venta = ventas[idx];
        const p = productos.find((x) => x.id === venta.productoId);
        if (!p) return J({ error: "Producto no encontrado." }, 404);
        p.stockActual += venta.cantidad;
        ventas.splice(idx, 1);
        mov("anulacion", { producto: p.nombre, cantidad: venta.cantidad, ubicacion: nombreUbic(p.ubicacionId) });
        return J({ producto: ficha(p) });
      }
      if ((m = path.match(/^\/api\/productos\/([^/]+)\/ajustar$/))) {
        const p = productos.find((x) => x.id === m[1]); if (!p) return J({ error: "Producto no encontrado." }, 404);
        const d = Number.isInteger(body.delta) ? body.delta : 0;
        if (p.stockActual + d < 0) return J({ error: `Ese ajuste dejaría el stock en negativo (actual: ${p.stockActual}).` }, 400);
        p.stockActual += d;
        mov("ajuste", { producto: p.nombre, delta: d, motivo: body.motivo || "Ajuste manual", stockResultante: p.stockActual, ubicacion: nombreUbic(p.ubicacionId) });
        return J(ficha(p));
      }
      if ((m = path.match(/^\/api\/productos\/([^/]+)\/etiqueta$/))) {
        const p = productos.find((x) => x.id === m[1]); if (!p) return J({ error: "Producto no encontrado." }, 404);
        // Barcode: generado local con window.OCBarcode (barcode128.js), cero llamadas
        // externas. QR: sigue usando la API pública qrserver.com solo en esta demo
        // estática (el backend real lo genera 100% local con la librería "qrcode").
        const barcodeSvg = window.OCBarcode ? window.OCBarcode.code128SVG(p.barcode, { width: 300, height: 80 }) : "";
        return J({ producto: ficha(p), qrDataUrl: qrDataUrl(JSON.stringify({ id: p.id, sku: p.sku, barcode: p.barcode })), barcodeSvg });
      }
      if ((m = path.match(/^\/api\/productos\/([^/]+)$/))) {
        const p = productos.find((x) => x.id === m[1]); if (!p) return J({ error: "Producto no encontrado." }, 404);
        return J(ficha(p));
      }

      if (path === "/api/escanear") {
        const c = String(body.codigo || "").trim().toLowerCase();
        if (!c) return J({ error: "Código vacío." }, 400);
        const p = productos.find((x) => String(x.barcode).toLowerCase() === c || String(x.sku).toLowerCase() === c);
        if (!p) return J({ error: "No se encontró ningún producto con ese código." }, 404);
        return J(ficha(p));
      }

      if (path === "/api/actividad") return J(movimientos.slice().reverse().slice(0, 100));

      if (path === "/api/respaldo/exportar") {
        return J({ modo: "demo-estatico", ubicaciones, productos, ventas, movimientos, configuracion: { gastosMensuales } });
      }
      if (path === "/api/respaldo/importar") {
        try {
          if (!body.productos || !body.ubicaciones) return J({ error: "El archivo no parece un respaldo válido." }, 400);
          productos.length = 0; productos.push(...body.productos);
          ubicaciones.length = 0; ubicaciones.push(...body.ubicaciones);
          ventas.length = 0; ventas.push(...(body.ventas || []));
          movimientos.length = 0; movimientos.push(...(body.movimientos || []));
          if (body.configuracion && body.configuracion.gastosMensuales) {
            Object.keys(gastosMensuales).forEach((k) => delete gastosMensuales[k]);
            Object.assign(gastosMensuales, body.configuracion.gastosMensuales);
          }
          return J({ ok: true });
        } catch (e) { return J({ error: "No se pudo importar: " + String(e) }, 400); }
      }

      if (path === "/api/liquidaciones") return J(getLiquidaciones());
      if ((m = path.match(/^\/api\/liquidaciones\/([^/]+)\/marcar-pagado$/))) {
        const u = ubicaciones.find((x) => x.id === m[1]); if (!u) return J({ error: "Ubicación no encontrada." }, 404);
        const pend = ventas.filter((v) => v.ubicacionId === m[1] && esDelMesActual(v.fecha) && !v.liquidada);
        pend.forEach((v) => { v.liquidada = true; });
        mov("liquidacion", { ubicacion: u.nombre, ventasLiquidadas: pend.length });
        return J({ ok: true, ventasLiquidadas: pend.length });
      }

      if ((m = path.match(/^\/api\/productos\/([^/]+)\/sugerencias-transferencia$/))) {
        return J(getSugerenciasTransferencia(m[1]));
      }
      if (path === "/api/transferencias" && (!opts || opts.method !== "POST")) {
        return J(transferencias.slice().reverse());
      }
      if (path === "/api/transferencias" && opts && opts.method === "POST") {
        const origen = productos.find((x) => x.id === body.productoOrigenId);
        const destino = productos.find((x) => x.id === body.productoDestinoId);
        if (!origen || !destino) return J({ error: "Producto no encontrado." }, 404);
        if (origen.sku !== destino.sku) return J({ error: "Los productos de origen y destino no son el mismo artículo (SKU distinto)." }, 400);
        const cant = Number(body.cantidad);
        if (!Number.isInteger(cant) || cant <= 0) return J({ error: "La cantidad debe ser un entero mayor a 0." }, 400);
        if (origen.stockActual < cant) return J({ error: `"${origen.nombre}" solo tiene ${origen.stockActual} unidades en origen.` }, 400);
        const t = { id: "t" + Math.random().toString(36).slice(2, 9), productoOrigenId: origen.id, productoDestinoId: destino.id, sku: origen.sku, nombre: origen.nombre, desde: origen.ubicacionId, desdeNombre: nombreUbic(origen.ubicacionId), hacia: destino.ubicacionId, haciaNombre: nombreUbic(destino.ubicacionId), cantidad: cant, estado: "solicitada", fecha: new Date().toISOString() };
        transferencias.push(t);
        mov("transferencia-solicitada", { producto: t.nombre, cantidad: cant, desde: t.desdeNombre, hacia: t.haciaNombre });
        return J(t);
      }
      if ((m = path.match(/^\/api\/transferencias\/([^/]+)\/aprobar$/))) {
        const t = transferencias.find((x) => x.id === m[1]); if (!t) return J({ error: "Transferencia no encontrada." }, 404);
        if (t.estado !== "solicitada") return J({ error: `Esta transferencia ya está en estado "${t.estado}".` }, 400);
        const origen = productos.find((x) => x.id === t.productoOrigenId);
        if (!origen || origen.stockActual < t.cantidad) return J({ error: "Ya no hay suficiente stock en origen para aprobar esta transferencia." }, 400);
        origen.stockActual -= t.cantidad;
        t.estado = "en_transito";
        mov("transferencia-aprobada", { producto: t.nombre, cantidad: t.cantidad, desde: t.desdeNombre, hacia: t.haciaNombre });
        return J(t);
      }
      if ((m = path.match(/^\/api\/transferencias\/([^/]+)\/confirmar-recepcion$/))) {
        const t = transferencias.find((x) => x.id === m[1]); if (!t) return J({ error: "Transferencia no encontrada." }, 404);
        if (t.estado !== "en_transito") return J({ error: `Esta transferencia está "${t.estado}", no se puede confirmar recepción.` }, 400);
        const destino = productos.find((x) => x.id === t.productoDestinoId);
        if (!destino) return J({ error: "Producto destino no encontrado." }, 404);
        destino.stockActual += t.cantidad;
        t.estado = "recibida";
        mov("transferencia-recibida", { producto: t.nombre, cantidad: t.cantidad, desde: t.desdeNombre, hacia: t.haciaNombre });
        return J(t);
      }
      if ((m = path.match(/^\/api\/transferencias\/([^/]+)\/rechazar$/))) {
        const t = transferencias.find((x) => x.id === m[1]); if (!t) return J({ error: "Transferencia no encontrada." }, 404);
        if (t.estado !== "solicitada") return J({ error: `Esta transferencia ya está en estado "${t.estado}".` }, 400);
        t.estado = "rechazada";
        return J(t);
      }

      if (path === "/api/configuracion/gastos" && (!opts || opts.method !== "POST")) {
        if (!uid || uid === "todas") return J({ ubicacionId: "todas", gastosMensuales: +Object.values(gastosMensuales).reduce((a, v) => a + v, 0).toFixed(2), porUbicacion: gastosMensuales });
        return J({ ubicacionId: uid, gastosMensuales: gastosMensuales[uid] || 0 });
      }
      if (path === "/api/configuracion/gastos") {
        const { ubicacionId, gastosMensuales: g } = body; const monto = Number(g);
        // BUG FIJADO (JFC, 2026-07-01): esta excepción de "todas" es correcta
        // en Olimpo (ubicaciones DORMANT ahí, una sola tienda virtual), pero
        // se copió sin adaptar a POSCuenca, donde ubicaciones SÍ está activo.
        // Guardar bajo "todas" aquí crearía una clave fantasma que se suma
        // aparte de los locales reales, inflando el total. POSCuenca exige
        // una ubicación específica, como siempre debió ser.
        if (!ubicacionId || ubicacionId === "todas") return J({ error: "Elige una ubicación específica para guardar sus gastos mensuales." }, 400);
        if (!isFinite(monto) || monto < 0) return J({ error: "El monto debe ser un número igual o mayor a 0." }, 400);
        gastosMensuales[ubicacionId] = +monto.toFixed(2);
        return J({ ubicacionId, gastosMensuales: gastosMensuales[ubicacionId] });
      }

      if (path === "/api/reportes/pl") {
        const IVA = 0.15; // espejo de IVA_ECUADOR en server.js
        const vh = ventasHoyDe(uid);
        const ingConIva = vh.reduce((a, v) => a + v.precioUnit * v.cantidad, 0);
        const ing = ingConIva / (1 + IVA);
        const ivaCobrado = ingConIva - ing;
        const cv = vh.reduce((a, v) => a + v.costoUnit * v.cantidad, 0);
        const ub = ing - cv;
        const gm = (!uid || uid === "todas") ? Object.values(gastosMensuales).reduce((a, v) => a + v, 0) : (gastosMensuales[uid] || 0);
        const go = +(gm / diasEnMesActual()).toFixed(2);
        return J({ ingresosConIva: +ingConIva.toFixed(2), ingresos: +ing.toFixed(2), ivaCobrado: +ivaCobrado.toFixed(2), costoVentas: +cv.toFixed(2), utilidadBruta: +ub.toFixed(2), gastosOperativos: go, utilidadNeta: +(ub - go).toFixed(2) });
      }
      if (path === "/api/reportes/balance") {
        const ps = filtrar(uid), vh = ventasHoyDe(uid);
        const ef = vh.reduce((a, v) => a + v.precioUnit * v.cantidad, 0);
        const inv = ps.reduce((a, p) => a + p.precio * p.stockActual, 0);
        return J({ activos: { efectivoEstimado: +ef.toFixed(2), inventarioValorizado: +inv.toFixed(2), total: +(ef + inv).toFixed(2) } });
      }
      if (path === "/api/reportes/valorizado") {
        const filas = filtrar(uid).map((p) => ({ nombre: p.nombre, stockActual: p.stockActual, valorCosto: +(p.costo * p.stockActual).toFixed(2), valorVenta: +(p.precio * p.stockActual).toFixed(2), utilidadPotencial: +((p.precio - p.costo) * p.stockActual).toFixed(2) }));
        const t = filas.reduce((a, f) => ({ valorCosto: a.valorCosto + f.valorCosto, valorVenta: a.valorVenta + f.valorVenta, utilidadPotencial: a.utilidadPotencial + f.utilidadPotencial }), { valorCosto: 0, valorVenta: 0, utilidadPotencial: 0 });
        return J({ productos: filas, totales: { valorCosto: +t.valorCosto.toFixed(2), valorVenta: +t.valorVenta.toFixed(2), utilidadPotencial: +t.utilidadPotencial.toFixed(2) } });
      }

      return J({ error: "Ruta no encontrada en la demo." }, 404);
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  };
})();
