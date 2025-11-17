/* ---------- DEBUG: user.js (temporal) ---------- */

/* Endpoints */
const ENDPOINT_DOCTORES = "https://6915deb7465a9144626df544.mockapi.io/doctores";
const ENDPOINT_TURNOS = "https://691266e052a60f10c8218cd5.mockapi.io/api/v1/turnos";

/* Intento obtener usuario real (viene de auth.js) */
let usuarioActual;
try {
    usuarioActual = typeof checkAuthAndRole === "function"
        ? checkAuthAndRole("USUARIO")
        : null;
} catch (err) {
    console.error("checkAuthAndRole lanzó excepción:", err);
    usuarioActual = null;
}

/* Si no hay usuario, creamos uno de prueba para depurar (BORRAR luego) */
if (!usuarioActual) {
    console.warn("No se obtuvo usuario real. Usando usuario de prueba para debugging.");
    usuarioActual = { id: "usuario_prueba_1", nombre: "Usuario Prueba" };
}

/* Debug: mostrar que se cargó el script */
console.log("user.js cargado. usuarioActual =", usuarioActual);

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded - inicializando UI");

    // Mostrar nombre en pantalla si existe el element
    const welcomeEl = document.getElementById("welcomeName");
    if (welcomeEl) {
        welcomeEl.textContent = Bienvenido/a, ${usuarioActual.nombre};
    } else {
        console.warn("No se encontró #welcomeName en el DOM");
    }

    // Eventos
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", () => {
        console.log("Logout pulsado (evento asignado)");
        if (typeof logoutUser === "function") logoutUser();
    });

    document.getElementById("date")?.addEventListener("change", cargarHorariosDisponibles);
    document.getElementById("selectDoctor")?.addEventListener("change", cargarHorariosDisponibles);
    document.getElementById("reserveForm")?.addEventListener("submit", registrarTurno);

    // Llamadas iniciales
    cargarDoctores();
    cargarMisTurnos();
});

/* Mostrar mensajes simples */
function mostrarMensaje(texto, tipo = "exito") {
    const cont = document.getElementById("alertContainer");
    if (!cont) {
        console.log([${tipo}] ${texto});
        return;
    }
    cont.innerHTML = <div class="${tipo}">${texto}</div>;
    setTimeout(() => cont.innerHTML = "", 3000);
}

/* Cargar médicos (con logging detallado) */
async function cargarDoctores() {
    const select = document.getElementById("selectDoctor");
    if (!select) {
        console.error("No existe #selectDoctor en el DOM");
        return;
    }
    select.innerHTML = "<option>Cargando médicos...</option>";
    console.log("Fetch -> doctores desde:", ENDPOINT_DOCTORES);

    try {
        const resp = await fetch(ENDPOINT_DOCTORES);
        console.log("Respuesta doctores status:", resp.status);
        if (!resp.ok) throw new Error(HTTP ${resp.status});

        const doctores = await resp.json();
        console.log("Doctores recibidos:", doctores);

        select.innerHTML = '<option value="">-- Seleccione un médico --</option>';
        if (!Array.isArray(doctores) || doctores.length === 0) {
            console.warn("La API devolvió 0 doctores o no es un array");
            // agregar opción de prueba para verificar UI
            const op = document.createElement("option");
            op.value = "doc_demo_1";
            op.textContent = "Dr. Demo (Cardio)";
            select.appendChild(op);
            return;
        }

        doctores.forEach(doc => {
            const op = document.createElement("option");
            op.value = doc.id;
            op.textContent = ${doc.nombre || doc.name || "Sin nombre"} (${doc.especialidad || doc.specialty || ""});
            select.appendChild(op);
        });

    } catch (err) {
        console.error("Error cargando médicos:", err);
        select.innerHTML = "<option>Error al cargar médicos</option>";
        mostrarMensaje("No se pudieron cargar los médicos (ver consola).", "alerta");
    }
}

/* Genera horarios cada 30 min */
function generarHorarios() {
    const horarios = [];
    let hora = 8, minuto = 0;
    while (hora < 20 || (hora === 20 && minuto === 0)) {
        horarios.push(${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")});
        minuto += 30;
        if (minuto === 60) { minuto = 0; hora++; }
    }
    return horarios;
}

/* Cargar horarios disponibles (depuración) */
async function cargarHorariosDisponibles() {
    const fecha = document.getElementById("date")?.value;
    const doctorId = document.getElementById("selectDoctor")?.value;
    const selectHora = document.getElementById("time");

    console.log("cargarHorariosDisponibles llamado. fecha:", fecha, "doctorId:", doctorId);

    if (!fecha || !doctorId) {
        if (selectHora) selectHora.innerHTML = "";
        console.log("Falta fecha o doctor, saliendo.");
        return;
    }

    const dia = new Date(fecha).getDay();
    if (dia === 0 || dia === 6) {
        mostrarMensaje("Solo se permiten turnos de lunes a viernes", "alerta");
        document.getElementById("date").value = "";
        return;
    }

    try {
        console.log("Fetch -> todos los turnos desde:", ENDPOINT_TURNOS);
        const resp = await fetch(ENDPOINT_TURNOS);
        console.log("Respuesta turnos status:", resp.status);
        if (!resp.ok) throw new Error(HTTP ${resp.status} en turnos);

        const turnos = await resp.json();
        console.log("Turnos recibidos:", turnos);

        const horarios = generarHorarios();

        const ocupados = Array.isArray(turnos)
            ? turnos.filter(t => String(t.doctorId) === String(doctorId) && t.fecha === fecha).map(t => t.hora)
            : [];

        console.log("Horarios ocupados para doctor/fecha:", ocupados);

        if (!selectHora) { console.error("No existe #time en DOM"); return; }
        selectHora.innerHTML = "";

        horarios.forEach(h => {
            if (!ocupados.includes(h)) {
                const op = document.createElement("option");
                op.value = h; op.textContent = h;
                selectHora.appendChild(op);
            }
        });

        if (selectHora.children.length === 0) {
            selectHora.innerHTML = '<option>No hay horarios disponibles</option>';
        }
    } catch (err) {
        console.error("Error cargando horarios:", err);
        mostrarMensaje("Error al cargar horarios (ver consola)", "alerta");
    }
}

/* Registrar turno (con log) */
async function registrarTurno(e) {
    e.preventDefault();
    const doctorId = document.getElementById("selectDoctor")?.value;
    const fecha = document.getElementById("date")?.value;
    const hora = document.getElementById("time")?.value;

    console.log("Intento registrar turno:", { doctorId, fecha, hora });

    if (!doctorId || !fecha || !hora) {
        mostrarMensaje("Complete todos los campos.", "alerta");
        return;
    }

    const turno = { doctorId, patientId: usuarioActual.id, fecha, hora, estado: "Pendiente" };

    try {
        const resp = await fetch(ENDPOINT_TURNOS, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(turno)
        });
        console.log("POST turnos status:", resp.status);
        if (!resp.ok) throw new Error(HTTP ${resp.status} al POST);

        mostrarMensaje("Turno registrado con éxito");
        document.getElementById("reserveForm").reset();
        cargarMisTurnos();
    } catch (err) {
        console.error("Error registrando turno:", err);
        mostrarMensaje("Error al registrar turno (ver consola)", "alerta");
    }
}

/* Cargar mis turnos */
async function cargarMisTurnos() {
    const cont = document.getElementById("misTurnos");
    if (!cont) return;
    cont.innerHTML = "<p>Cargando turnos...</p>";

    try {
        const resp = await fetch(ENDPOINT_TURNOS);
        console.log("GET turnos status:", resp.status);
        if (!resp.ok) throw new Error(HTTP ${resp.status});
        const turnos = await resp.json();
        console.log("Turnos totales:", turnos);

        const mis = Array.isArray(turnos) ? turnos.filter(t => String(t.patientId) === String(usuarioActual.id)) : [];
        cont.innerHTML = "";
        if (mis.length === 0) { cont.innerHTML = "<p>No tenés turnos registrados.</p>"; return; }

        mis.forEach(t => {
            const c = document.createElement("div"); c.className = "turno-card";
            c.innerHTML = `<h4>Turno con el médico Nº ${t.doctorId}</h4>
                <p><strong>Fecha:</strong> ${t.fecha}</p><p><strong>Hora:</strong> ${t.hora}</p>
                <p><strong>Estado:</strong> ${t.estado}</p>
                <button class="secundario" onclick="cancelarTurno('${t.id}')">Cancelar turno</button>`;
            cont.appendChild(c);
        });
    } catch (err) {
        console.error("Error cargando mis turnos:", err);
        cont.innerHTML = "<p>Error al cargar turnos.</p>";
    }
}

/* Cancelar turno */
async function cancelarTurno(idTurno) {
    if (!confirm("¿Seguro que querés cancelar este turno?")) return;
    try {
        const resp = await fetch(${ENDPOINT_TURNOS}/${idTurno}, { method: "DELETE" });
        console.log("DELETE turno status:", resp.status);
        mostrarMensaje("Turno cancelado correctamente");
        cargarMisTurnos();
    } catch (err) {
        console.error("Error cancelando turno:", err);
        mostrarMensaje("Error al cancelar el turno", "alerta");
    }
}

/* Bloquear fines de semana (mantener) */
document.getElementById("date")?.addEventListener("input", (e) => {
    const v = e.target.value;
    if (!v) return;
    const day = new Date(v).getDay();
    if (day === 0 || day === 6) {
        alert("No se puede seleccionar sábado o domingo.");
        e.target.value = "";
    }
});

/* ---------- FIN DEBUG ---------- */