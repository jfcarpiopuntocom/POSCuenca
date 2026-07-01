// data.js — Capa única de acceso a datos. Server.js solo habla con este
// archivo y no le importa si los datos vienen de Loyverse (modo real) o
// de db.js (modo demo local, sin token configurado).

const { randomUUID } = require("crypto");
const db = require("./db");
const loyverse = require("./loyverse");

const MODO_LOYVERSE = loyverse.activo();
let ultimaVentaLoyverse = null; // ver anularVenta() en modo Loyverse, más abajo

function registrarMovimiento(tipo, detalle) {
  db.get("movimientos").push({ id: randomUUID(), tipo, detalle, fecha: new Date().toISOString() }).write();
}

function getActividad() {
  return db.get("movimientos").value().slice().reverse().slice(0, 100);
}

// --- Gastos mensuales: siempre locales, sin importar el modo ---
function getGastosMensuales(ubicacionId) {
  const gastos = db.get("configuracion.gastosMensuales").value() || {};
  if (!ubicacionId || ubicacionId === "todas") {
    const total = Object.values(gastos).reduce((acc, v) => acc + Number(v || 0), 0);
    return { ubicacionId: "todas", gastosMensuales: Number(total.toFixed(2)), porUbicacion: gastos };
  }
  return { ubicacionId, gastosMensuales: Number(gastos[ubicacionId] || 0) };
}

function setGastosMensuales(ubicacionId, monto) {
  db.set(`configuracion.gastosMensuales.${ubicacionId}`, Number(monto.toFixed(2))).write();
}

// Respaldo exportable/importable — ver nota larga en Olimpo Control/data.js.
function exportarTodo() {
  if (MODO_LOYVERSE) {
    return {
      modo: "loyverse",
      aviso: "Productos, ventas e inventario viven en Loyverse — respáldalos desde ahí. Este archivo solo contiene movimientos y gastos locales.",
      movimientos: db.get("movimientos").value(),
      configuracion: db.get("configuracion").value(),
    };
  }
  return { modo: "demo", ...db.getState() };
}

function importarTodo(datos) {
  if (!datos || typeof datos !== "object") return { error: "Archivo de respaldo inválido." };
  if (MODO_LOYVERSE) {
    if (datos.movimientos) db.set("movimientos", datos.movimientos).write();
    if (datos.configuracion) db.set("configuracion", datos.configuracion).write();
    return { ok: true };
  }
  if (datos.modo && datos.modo !== "demo") return { error: "Este respaldo es de otro modo (Loyverse) y no aplica aquí." };
  const { modo, ...estado } = datos;
  if (!estado.productos || !estado.ubicaciones) return { error: "El archivo no parece un respaldo válido de POSCuenca." };
  db.setState(estado);
  return { ok: true };
}

if (MODO_LOYVERSE) {
  // ====================== MODO LOYVERSE (real) ======================
  module.exports = {
    modo: "loyverse",

    async getUbicaciones() {
      return loyverse.getUbicaciones();
    },

    // Las ubicaciones (tiendas) en modo Loyverse se administran EN Loyverse
    // mismo — es la fuente de verdad. No duplicamos su gestión aquí.
    async crearUbicacion() {
      return { error: "Con Loyverse conectado, crea ubicaciones directamente en Loyverse — se reflejarán automáticamente aquí." };
    },
    async actualizarUbicacion() {
      return { error: "Con Loyverse conectado, edita ubicaciones directamente en Loyverse." };
    },
    async setActivaUbicacion() {
      return { error: "Con Loyverse conectado, activa/desactiva tiendas directamente en Loyverse." };
    },

    async nombreUbicacion(id) {
      const u = (await loyverse.getUbicaciones()).find((x) => x.id === id);
      return u ? u.nombre : "Ubicación desconocida";
    },

    async getProductos(ubicacionId) {
      const todos = await loyverse.getProductos();
      if (!ubicacionId || ubicacionId === "todas") return todos;
      return todos.filter((p) => p.ubicacionId === ubicacionId);
    },

    async getProducto(id) {
      const todos = await loyverse.getProductos();
      return todos.find((p) => p.id === id) || null;
    },

    async buscarPorCodigo(codigo) {
      const c = String(codigo).trim().toLowerCase();
      const todos = await loyverse.getProductos();
      return todos.find((p) => String(p.barcode).toLowerCase() === c || String(p.sku).toLowerCase() === c) || null;
    },

    // Dar de alta catálogo nuevo se hace en Loyverse mismo (es la fuente de
    // verdad del inventario en este modo); acá solo se lee y refleja. Si en
    // el futuro se quiere crear desde POSCuenca, hay que llamar al
    // endpoint de creación de items de la API de Loyverse — no implementado
    // todavía porque José aún no ha conectado su cuenta real.
    async crearProducto() {
      return { error: "Con Loyverse conectado, da de alta productos nuevos directamente en Loyverse — POSCuenca los reflejará automáticamente." };
    },

    async venderUno(id, cantidad) {
      const p = await this.getProducto(id);
      if (!p) return { error: "Producto no encontrado." };
      if (p.stockActual < cantidad) return { error: `No hay suficiente stock disponible (quedan ${p.stockActual}).` };

      await loyverse.ajustarStock({ variantId: p.variantId, storeId: p.ubicacionId, delta: -cantidad, motivo: "Venta rápida desde POSCuenca" });
      registrarMovimiento("venta", {
        producto: p.nombre,
        cantidad,
        total: Number((p.precio * cantidad).toFixed(2)),
        ubicacion: await this.nombreUbicacion(p.ubicacionId),
      });
      ultimaVentaLoyverse = { ventaId: randomUUID(), productoId: id, cantidad };
      return { producto: await this.getProducto(id), ventaId: ultimaVentaLoyverse.ventaId };
    },

    async anularVenta(ventaId) {
      if (!ultimaVentaLoyverse || ultimaVentaLoyverse.ventaId !== ventaId) {
        return { error: "Esta venta ya no se puede anular (pasó el tiempo o ya se anuló)." };
      }
      const { productoId, cantidad } = ultimaVentaLoyverse;
      ultimaVentaLoyverse = null;
      const p = await this.getProducto(productoId);
      if (!p) return { error: "Producto no encontrado." };
      await loyverse.ajustarStock({ variantId: p.variantId, storeId: p.ubicacionId, delta: cantidad, motivo: "Anulación de venta (deshacer)" });
      registrarMovimiento("anulacion", { producto: p.nombre, cantidad, ubicacion: await this.nombreUbicacion(p.ubicacionId) });
      return { producto: await this.getProducto(productoId) };
    },

    async ajustar(id, delta, motivo) {
      const p = await this.getProducto(id);
      if (!p) return { error: "Producto no encontrado." };
      if (p.stockActual + delta < 0) return { error: `Ese ajuste dejaría el stock en negativo (actual: ${p.stockActual}).` };

      await loyverse.ajustarStock({ variantId: p.variantId, storeId: p.ubicacionId, delta, motivo });
      registrarMovimiento("ajuste", {
        producto: p.nombre,
        delta,
        motivo,
        stockResultante: p.stockActual + delta,
        ubicacion: await this.nombreUbicacion(p.ubicacionId),
      });
      return { producto: await this.getProducto(id) };
    },

    async getVentasHoy(ubicacionId, fechaISO) {
      return loyverse.getVentasHoy(ubicacionId, fechaISO);
    },

    getActividad,
    getGastosMensuales,
    setGastosMensuales,
    exportarTodo,
    importarTodo,
  };
} else {
  // ====================== MODO DEMO (local, sin token) ======================
  function nombreUbicacionLocal(id) {
    const u = db.get("ubicaciones").find({ id }).value();
    return u ? u.nombre : "Ubicación desconocida";
  }

  module.exports = {
    modo: "demo",

    // soloActivas=true (default) es lo que usa el selector operativo del día
    // a día — una ubicación desactivada no debe ofrecerse para vender ahí.
    // El panel de administración de ubicaciones pide soloActivas=false para
    // poder mostrar (y reactivar) las archivadas.
    async getUbicaciones(soloActivas = true) {
      const todas = db.get("ubicaciones").value();
      return soloActivas ? todas.filter((u) => u.activa !== false) : todas;
    },

    async nombreUbicacion(id) {
      return nombreUbicacionLocal(id);
    },

    async crearUbicacion({ nombre, tipo }) {
      if (!nombre || !nombre.trim()) return { error: "El nombre de la ubicación es obligatorio." };
      const u = { id: randomUUID(), nombre: nombre.trim(), tipo: tipo || "propio", activa: true };
      db.get("ubicaciones").push(u).write();
      registrarMovimiento("ubicacion-alta", { ubicacion: u.nombre });
      return u;
    },

    async actualizarUbicacion(id, { nombre, tipo }) {
      const u = db.get("ubicaciones").find({ id }).value();
      if (!u) return { error: "Ubicación no encontrada." };
      const cambios = {};
      if (nombre && nombre.trim()) cambios.nombre = nombre.trim();
      if (tipo) cambios.tipo = tipo;
      db.get("ubicaciones").find({ id }).assign(cambios).write();
      return db.get("ubicaciones").find({ id }).value();
    },

    // Desactivar NO borra nada — ventas y movimientos históricos de esta
    // ubicación siguen intactos y siguen sumando en reportes que consulten
    // "todas". Solo deja de aparecer en el selector operativo y no admite
    // ventas nuevas (ver guard en venderUno/crearProducto más abajo).
    async setActivaUbicacion(id, activa) {
      const u = db.get("ubicaciones").find({ id }).value();
      if (!u) return { error: "Ubicación no encontrada." };
      db.get("ubicaciones").find({ id }).assign({ activa: !!activa }).write();
      registrarMovimiento(activa ? "ubicacion-reactivada" : "ubicacion-desactivada", { ubicacion: u.nombre });
      return db.get("ubicaciones").find({ id }).value();
    },

    async getProductos(ubicacionId) {
      let lista = db.get("productos").value();
      if (ubicacionId && ubicacionId !== "todas") lista = lista.filter((p) => p.ubicacionId === ubicacionId);
      return lista;
    },

    async getProducto(id) {
      return db.get("productos").find({ id }).value() || null;
    },

    async buscarPorCodigo(codigo) {
      const c = String(codigo).trim().toLowerCase();
      return (
        db
          .get("productos")
          .find((x) => String(x.barcode).toLowerCase() === c || String(x.sku).toLowerCase() === c)
          .value() || null
      );
    },

    // Crea un producto nuevo (solo modo demo/local — en modo Loyverse el
    // catálogo se gestiona en Loyverse mismo; ver nota en server.js). Se usa
    // cuando el dueño escanea un código que no existe y decide darlo de alta.
    async crearProducto(datos) {
      const ubic = datos.ubicacionId && datos.ubicacionId !== "todas" ? db.get("ubicaciones").find({ id: datos.ubicacionId }).value() : null;
      if (ubic && ubic.activa === false) return { error: `"${ubic.nombre}" está desactivada — reactívala en Avanzado antes de agregar productos ahí.` };
      const p = {
        id: randomUUID(),
        nombre: datos.nombre,
        categoria: datos.categoria || "General",
        sku: datos.sku || datos.barcode,
        barcode: datos.barcode,
        ubicacionId: datos.ubicacionId || "todas",
        precio: Number(datos.precio) || 0,
        costo: Number(datos.costo) || 0,
        stockActual: Number(datos.stockInicial) || 0,
        umbralRojo: Number(datos.umbralRojo) || 5,
        umbralAmarillo: Number(datos.umbralAmarillo) || 10,
        proveedor: datos.proveedor || "",
        perecible: !!datos.perecible,
        fechaCaducidad: datos.perecible ? datos.fechaCaducidad || null : null,
        metodoCosteo: datos.metodoCosteo === "LIFO" ? "LIFO" : "FIFO",
        lotes: [], // terreno listo para costeo por lotes (fase 2, ver db.js)
      };
      db.get("productos").push(p).write();
      registrarMovimiento("alta", { producto: p.nombre, sku: p.sku, ubicacion: nombreUbicacionLocal(p.ubicacionId) });
      return p;
    },

    async venderUno(id, cantidad) {
      const p = db.get("productos").find({ id }).value();
      if (!p) return { error: "Producto no encontrado." };
      const ubic = db.get("ubicaciones").find({ id: p.ubicacionId }).value();
      if (ubic && ubic.activa === false) return { error: `"${ubic.nombre}" está desactivada — no admite ventas nuevas.` };
      if (p.stockActual < cantidad) return { error: `No hay suficiente stock disponible (quedan ${p.stockActual}).` };

      const ventaId = randomUUID();
      db.get("productos").find({ id }).assign({ stockActual: p.stockActual - cantidad }).write();
      db.get("ventas")
        .push({ id: ventaId, productoId: p.id, ubicacionId: p.ubicacionId, cantidad, precioUnit: p.precio, costoUnit: p.costo, fecha: new Date().toISOString() })
        .write();
      registrarMovimiento("venta", {
        producto: p.nombre,
        cantidad,
        total: Number((p.precio * cantidad).toFixed(2)),
        ubicacion: nombreUbicacionLocal(p.ubicacionId),
      });
      return { producto: db.get("productos").find({ id }).value(), ventaId };
    },

    async anularVenta(ventaId) {
      const venta = db.get("ventas").find({ id: ventaId }).value();
      if (!venta) return { error: "Esta venta ya no se puede anular (pasó el tiempo o ya se anuló)." };
      const p = db.get("productos").find({ id: venta.productoId }).value();
      if (!p) return { error: "Producto no encontrado." };
      db.get("productos").find({ id: venta.productoId }).assign({ stockActual: p.stockActual + venta.cantidad }).write();
      db.get("ventas").remove({ id: ventaId }).write();
      registrarMovimiento("anulacion", {
        producto: p.nombre,
        cantidad: venta.cantidad,
        ubicacion: nombreUbicacionLocal(venta.ubicacionId),
      });
      return { producto: db.get("productos").find({ id: venta.productoId }).value() };
    },

    async ajustar(id, delta, motivo) {
      const p = db.get("productos").find({ id }).value();
      if (!p) return { error: "Producto no encontrado." };
      const nuevoStock = p.stockActual + delta;
      if (nuevoStock < 0) return { error: `Ese ajuste dejaría el stock en negativo (actual: ${p.stockActual}).` };

      db.get("productos").find({ id }).assign({ stockActual: nuevoStock }).write();
      registrarMovimiento("ajuste", {
        producto: p.nombre,
        delta,
        motivo,
        stockResultante: nuevoStock,
        ubicacion: nombreUbicacionLocal(p.ubicacionId),
      });
      return { producto: db.get("productos").find({ id }).value() };
    },

    async getVentasHoy(ubicacionId, fechaISO) {
      const ZONA = "America/Guayaquil";
      const esDeHoy = (fechaISOVenta) => {
        if (!fechaISOVenta) return false;
        const f = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(new Date(fechaISOVenta));
        return f === fechaISO;
      };
      return db
        .get("ventas")
        .value()
        .filter((v) => esDeHoy(v.fecha) && (!ubicacionId || ubicacionId === "todas" || v.ubicacionId === ubicacionId));
    },

    getActividad,
    getGastosMensuales,
    setGastosMensuales,
    exportarTodo,
    importarTodo,
  };
}
