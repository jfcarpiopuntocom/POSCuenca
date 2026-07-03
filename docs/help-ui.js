// help-ui.js — Enlace de ayuda "Ayuda(?)" bajo el botón Salir del header (NO
// es un botón flotante estilo chat/WhatsApp — JFC lo pidió explícitamente
// discreto, parte del header, no una burbuja llamativa). Contenido DISTINTO
// según el rol activo (dueño vs empleado): el dueño necesita entender todo
// el sistema (capa contable, claves, gastos); el empleado solo necesita lo
// operativo del día a día (escanear, vender, leer el semáforo). Depende de
// auth-ui.js (escucha el evento "oc-login" para saber qué rol mostrar y para
// encontrar el botón #oc-logout, debajo del cual se inserta este enlace).
//
// REACTIVADO 2026-07-01 (JFC): indispensable, sobre todo con el timeout de
// inactividad activo. NUNCA quitar/ocultar sin que JFC lo pida en el mismo turno.
(function () {
  const AYUDA_HABILITADA = true;
  if (!AYUDA_HABILITADA) return;

  const css = document.createElement("style");
  css.textContent = `
  #oc-help-btn{display:none;margin-top:6px;background:none;border:none;
    font-family:var(--font-display,sans-serif);font-size:13px;color:var(--blanco-calido,#fbf5e8);
    text-decoration:underline;cursor:pointer;padding:4px;}
  #oc-help-modal{position:fixed;inset:0;z-index:9998;background:rgba(28,48,73,.85);
    display:none;align-items:flex-end;justify-content:center;padding:0;}
  #oc-help-modal.abierto{display:flex;}
  #oc-help-sheet{background:var(--blanco-calido,#fbf5e8);width:100%;max-width:520px;max-height:82vh;
    overflow-y:auto;border-radius:16px 16px 0 0;padding:22px 20px 28px;}
  #oc-help-sheet h2{font-family:var(--font-display,sans-serif);color:var(--ink,#211c14);margin:0 0 4px;font-size:22px;}
  #oc-help-sheet .rolTag{display:inline-block;font-size:13px;font-weight:700;padding:3px 10px;border-radius:12px;
    margin-bottom:14px;background:var(--azul-medio,#2c4a68);color:var(--blanco-calido,#fbf5e8);}
  #oc-help-sheet h3{font-family:var(--font-display,sans-serif);color:var(--ink,#211c14);font-size:16px;margin:18px 0 6px;}
  #oc-help-sheet p, #oc-help-sheet li{font-size:15px;color:var(--ink-soft,#5d5340);line-height:1.5;}
  #oc-help-sheet ul{margin:0 0 4px;padding-left:20px;}
  #oc-help-cerrar{margin-top:18px;width:100%;padding:12px;border-radius:8px;border:2px solid var(--azul-medio,#2c4a68);
    background:var(--azul-medio,#2c4a68);color:var(--blanco-calido,#fbf5e8);font-family:var(--font-display,sans-serif);
    font-size:15px;cursor:pointer;min-height:44px;}
  `;
  document.head.appendChild(css);

  // Contenido del DUEÑO: cubre todo el sistema con lenguaje des-abrumador.
  // Sistema Simon: colores = vocabulario visual del dinero, no decoración.
  // Verde=saludable, Dorado=oportunidad, Naranja=urgente, Rojo=emergencia,
  // Azul=visión/contable, Negro=inventario muerto. (JFC 2026-07-03)
  const AYUDA_DUENO = `
    <span class="rolTag">Guía del dueño</span>
    <h3>Los colores son el idioma de tu negocio</h3>
    <p style="font-size:14px;line-height:1.6;margin:0 0 10px;">
      AMIGABLE convierte los números en colores para que no tengas que interpretar nada —
      el color ya te dice qué hacer. No necesitas saber de contabilidad para entenderlo.
    </p>
    <ul>
      <li><b style="color:#16A34A;">Verde</b>: saludable — fluye bien, no tocar.</li>
      <li><b style="color:#B87A10;">Dorado</b>: oportunidad — puede rendir más.</li>
      <li><b style="color:#C2410C;">Naranja</b>: urgente — requiere atención hoy.</li>
      <li><b style="color:#B91C1C;">Rojo</b>: emergencia — actúa ahora.</li>
      <li><b style="color:#1565C0;">Azul</b>: visión contable — la capa de los números reales.</li>
      <li><b style="color:#111827;">Negro</b>: inventario muerto — ocupa espacio sin generar.</li>
    </ul>
    <h3>Pestaña Hoy (tu semáforo)</h3>
    <ul>
      <li>Un solo vistazo: cuánto entró, cuánto salió, qué pide acción.</li>
      <li>El color del encabezado refleja el estado general del día.</li>
    </ul>
    <h3>Inventario y Escanear</h3>
    <ul>
      <li>Escanea o busca para vender una unidad o ajustar el stock.</li>
      <li>Cada movimiento queda registrado con motivo y quién lo hizo.</li>
    </ul>
    <h3>Avanzado (solo tú, candado aparte)</h3>
    <ul>
      <li><b>Gastos fijos</b>: arriendo, luz, sueldos — se dividen en 30 días para saber cuánto cuesta abrir mañana.</li>
      <li><b>Capa contable azul</b>: cuentas T, pérdidas y ganancias, balance. Tiene su propio código — distinto al de entrada.</li>
      <li><b>Claves y recuperación</b>: guarda tu correo antes de cambiar cualquier clave. Sin correo registrado no hay recuperación posible.</li>
    </ul>
    <h3>Seguridad sin paranoia</h3>
    <p>Tus 3 claves se guardan cifradas en este dispositivo. El teclado mezcla los números con un emoji diferente cada vez — nadie puede memorizarlos mirando por encima de tu hombro.</p>
  `;

  // Contenido del EMPLEADO: solo lo operativo del turno, lenguaje simple.
  // Sin mención a claves, gastos ni contabilidad — esa capa no le aparece.
  const AYUDA_EMPLEADO = `
    <span class="rolTag">Guía del empleado</span>
    <h3>Los colores te dicen qué está pasando</h3>
    <ul>
      <li><b style="color:#16A34A;">Verde</b>: bien. <b style="color:#C2410C;">Naranja</b>: avisar al dueño pronto. <b style="color:#B91C1C;">Rojo</b>: avisar ya.</li>
      <li>No necesitas interpretar nada — el color hace el trabajo.</li>
    </ul>
    <h3>Tu turno en 4 pasos</h3>
    <ul>
      <li><b>Hoy</b>: mira el resumen del día al entrar. Si hay rojo, avisa.</li>
      <li><b>Escanear</b>: apunta la cámara al código de barras o QR. Si la etiqueta está dañada, escribe el código a mano.</li>
      <li><b>Vender</b>: toca "Vender 1" para descontar del stock al momento.</li>
      <li><b>Ajustar</b>: si algo se rompió, se venció o el conteo estaba mal — usa Ajustar y escribe el motivo. Queda registrado.</li>
    </ul>
    <h3>Etiquetas</h3>
    <p>Si necesitas reimprimir una etiqueta perdida o dañada, búscala por nombre o código.</p>
  `;

  const modal = document.createElement("div");
  modal.id = "oc-help-modal";
  modal.innerHTML = `<div id="oc-help-sheet">
    <h2>¿Cómo funciona AMIGABLE?</h2>
    <!-- Slogan informal de Amigable (JFC 2026-07-02): "tu negocio, a color".
         Va aquí y en la bienvenida (welcome-ui.js). El formal "Amigable: punto
         de venta y control de inventario" vive en el footer y la bienvenida. -->
    <p style="font-family:var(--font-display,sans-serif);color:#E8A020;font-size:15px;font-weight:700;margin:0 0 14px;">Tu negocio, a color</p>
    <div id="oc-help-body"></div>
    <button id="oc-help-cerrar">Entendido</button>
  </div>`;
  document.body.appendChild(modal);

  const btn = document.createElement("button");
  btn.id = "oc-help-btn";
  btn.textContent = "Ayuda (?)";

  function abrir() {
    const rol = window.OCAuth ? window.OCAuth.rolActual() : null;
    document.getElementById("oc-help-body").innerHTML = rol === "empleado" ? AYUDA_EMPLEADO : AYUDA_DUENO;
    modal.classList.add("abierto");
  }
  btn.addEventListener("click", abrir);
  document.getElementById("oc-help-cerrar").addEventListener("click", () => modal.classList.remove("abierto"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("abierto"); });

  // Se inserta justo después de #oc-logout (creado por auth-ui.js al iniciar
  // sesión) para que quede debajo del botón Salir en el header, no como
  // elemento flotante encima del contenido.
  window.addEventListener("oc-login", () => {
    const logout = document.getElementById("oc-logout");
    if (logout && logout.parentNode && !document.body.contains(btn)) {
      logout.insertAdjacentElement("afterend", btn);
    }
    btn.style.display = "block";
  });
  window.addEventListener("oc-logout", () => {
    btn.remove(); // vuelve a insertarse junto al próximo #oc-logout en el siguiente login
    modal.classList.remove("abierto");
  });
})();
