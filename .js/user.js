/**
 * Esto hace el archivo: Lógica del Paciente.
 * FUNCIONALIDAD:
 * - Carga y muestra doctores en el select (GET).
 * - Genera horarios disponibles y no deja elegir fines de semana.
 * - Reservar Turno: Crea un turno nuevo en la API (POST).
 * - Mis Turnos: Trae todos los turnos y filtra solo los de este usuario (GET + Filter).
 * - Cancelar: Permite cancelar turnos si están pendientes (PUT).
 */

// ENDPOINTS: URLs donde guardamos doctores y turnos
const ENDPOINT_DOCTORES = "https://6915deb7465a9144626df544.mockapi.io/doctores";
const ENDPOINT_TURNOS = "https://691af2052d8d78557570d069.mockapi.io/turnos";


// Recuperamos al usuario que está logueado usando sessionStorage
// Si no existe, usuarioActual será null
const usuarioJson = sessionStorage.getItem("usuario");
const usuarioActual = usuarioJson ? JSON.parse(usuarioJson) : null;


// Función para mostrar mensajes arriba del formulario
// Se usa para errores o avisos
function mostrarMensaje(texto, tipo = "exito") {
    const contenedor = document.getElementById("alertContainer");
    if (!contenedor) return console.error("Elemento #alertContainer no encontrado.");
    
    contenedor.innerHTML = '';
    
    const div = document.createElement("div");
    div.className = tipo === "exito" ? "exito" : "alerta";
    div.textContent = texto;
    contenedor.appendChild(div);

    setTimeout(() => div.remove(), 4000);
}


// Cerrar sesión
// Borra el usuario guardado y vuelve al login
function cerrarSesion() {
    sessionStorage.removeItem("usuario");
    window.location.href = "index.html";
}

// -------------------------------------------------------
// Cuando la página carga
// - Verificamos sesión
// - Mostramos nombre del usuario
// - Cargamos doctores y turnos
// - Activamos eventos del formulario
// -------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    if (!usuarioActual) {
        cerrarSesion();
        return;
    }

    const elementoBienvenida = document.getElementById("welcomeName");
    if (elementoBienvenida) {
        elementoBienvenida.textContent = `Bienvenido/a, ${usuarioActual.nombre}`;
    }

    cargarDoctores();
    cargarMisTurnos();

    document.getElementById("reserveForm")?.addEventListener("submit", reservarTurno);
    document.getElementById("logoutBtn")?.addEventListener("click", cerrarSesion);
    document.getElementById("date")?.addEventListener("input", bloquearFinesDeSemana);

    generarOpcionesHorario();
});


// Cargar la lista de doctores desde la API
// Los pone dentro del <select>
async function cargarDoctores() {
    const select = document.getElementById("selectDoctor");
    select.innerHTML = '<option value="">Cargando...</option>';

    try {
        const resp = await fetch(ENDPOINT_DOCTORES);
        const doctores = await resp.json();
        
        select.innerHTML = '<option value="">Seleccione un médico</option>';
        doctores.forEach(doc => {
            const opcion = document.createElement("option");
            opcion.value = doc.id;
            opcion.textContent = `${doc.nombre} (${doc.especialidad})`;
            select.appendChild(opcion);
        });

    } catch (err) {
        console.error("Error cargando doctores:", err);
        select.innerHTML = '<option value="">Error al cargar</option>';
    }
}


// Generar horarios disponibles (8:00 a 20:00 cada 30min)
// Se cargan dentro del select del horario
function generarOpcionesHorario() {
    const select = document.getElementById('time');
    if (!select) return;

    const horaInicio = 8;
    const horaFin = 20;
    const intervaloMinutos = 30;

    select.innerHTML = '<option value="">Seleccione hora</option>';

    for (let hora = horaInicio; hora <= horaFin; hora++) {
        for (let minuto = 0; minuto < 60; minuto += intervaloMinutos) {
            if (hora === horaFin && minuto !== 0) continue;

            const horaFormateada = String(hora).padStart(2, '0');
            const minutoFormateado = String(minuto).padStart(2, '0');
            const valorHora = `${horaFormateada}:${minutoFormateado}`;

            const opcion = document.createElement('option');
            opcion.value = valorHora;
            opcion.textContent = valorHora;
            select.appendChild(opcion);

            if (hora === horaFin) break;
        }
    }
}

// Cuando el usuario reserva un turno:
// - valida datos
// - arma un objeto
// - lo envía a la API de turnos
async function reservarTurno(e) {
    e.preventDefault();
    
    const idDoctor = document.getElementById("selectDoctor").value;
    const fecha = document.getElementById("date").value;
    const hora = document.getElementById("time").value;

    if (!idDoctor || !fecha || !hora) {
        mostrarMensaje("Por favor, complete todos los campos.", "alerta");
        return;
    }

    const turnoNuevo = {
        pacienteId: usuarioActual.id,
        doctorId: idDoctor,
        fecha: fecha,
        hora: hora,
        estado: "Pendiente"
    };

    try {
        const resp = await fetch(ENDPOINT_TURNOS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(turnoNuevo)
        });

        if (resp.ok) {
            mostrarMensaje("Turno solicitado con éxito. Pendiente de confirmación.");
            document.getElementById("reserveForm").reset();
            cargarMisTurnos();
        } else {
            mostrarMensaje("Error al solicitar el turno.", "alerta");
        }
    } catch (err) {
        console.error("Error en la reserva:", err);
        mostrarMensaje("Error de conexión al intentar reservar.", "alerta");
    }
}

// Cargar los turnos del usuario actual
// Muestra fecha, hora, estado y un botón para cancelar
async function cargarMisTurnos() {
    const contenedor = document.getElementById("misTurnos");
    contenedor.innerHTML = "<p>Cargando mis turnos...</p>";
    
    if (!usuarioActual) {
        contenedor.innerHTML = "<p>No se pudo cargar la información del usuario.</p>";
        return;
    }

    try {
        const respDoctores = await fetch(ENDPOINT_DOCTORES);
        const doctores = await respDoctores.json();
        const mapaDoctores = new Map(doctores.map(doc => [doc.id, doc]));

        const respTurnos = await fetch(ENDPOINT_TURNOS);
        const todosTurnos = await respTurnos.json();
        
        const misTurnos = todosTurnos.filter(t => t.pacienteId === usuarioActual.id);
        
        if (!misTurnos.length) {
            contenedor.innerHTML = "<p>No tenés turnos reservados.</p>";
            return;
        }

        contenedor.innerHTML = "";
        misTurnos.forEach(t => {
            const doctor = mapaDoctores.get(t.doctorId);
            const nombreDoctor = doctor ? `${doctor.nombre} (${doctor.especialidad})` : `[Médico no encontrado]`;

            const tarjeta = document.createElement("div");
            tarjeta.className = `turno-card estado-${t.estado.toLowerCase()}`;
            
            const botonCancelar = t.estado === "Pendiente" 
                ? `<button class="secundario" onclick="cancelarTurno('${t.id}')">Cancelar turno</button>`
                : `<span class="estado-mensaje">El turno ${t.estado} no se puede cancelar.</span>`;

            tarjeta.innerHTML = `
                <h4>Turno con ${nombreDoctor}</h4>
                <p><strong>Fecha:</strong> ${t.fecha}</p>
                <p><strong>Hora:</strong> ${t.hora}</p>
                <p><strong>Estado:</strong> <span class="badge">${t.estado}</span></p>
                ${botonCancelar}
            `;
            contenedor.appendChild(tarjeta);
        });
    } catch (err) {
        console.error("Error cargando mis turnos:", err);
        contenedor.innerHTML = "<p class='alerta'>Error al cargar turnos.</p>";
    }
}


// Cancelar turno (solo si está pendiente)
// Cambia el estado del turno en la API
async function cancelarTurno(idTurno) {
    if (!confirm("¿Seguro que querés cancelar este turno?")) return;

    try {
        const resp = await fetch(`${ENDPOINT_TURNOS}/${idTurno}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: "Cancelado" })
        });
        
        if (resp.ok) {
            mostrarMensaje("Turno cancelado correctamente.");
            cargarMisTurnos();
        } else {
            mostrarMensaje("Error al cancelar el turno.", "alerta");
        }
    } catch (err) {
        console.error("Error cancelando turno:", err);
        mostrarMensaje("Error de conexión al intentar cancelar el turno.", "alerta");
    }
}


// Evita que se elijan sábados o domingos

function bloquearFinesDeSemana(e) {
    const valor = e.target.value;
    if (!valor) return;

    const fecha = new Date(valor);
    const diaSemana = fecha.getDay();

    if (diaSemana === 0 || diaSemana === 6) {
        mostrarMensaje("No se pueden seleccionar sábados ni domingos.", "alerta");
        e.target.value = "";
    }
}
