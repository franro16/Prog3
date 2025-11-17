const ENDPOINT_DOCTORES = "https://6915deb7465a9144626df544.mockapi.io/doctores";
const ENDPOINT_TURNOS = "https://691af2052d8d78557570d069.mockapi.io/turnos";

const usuarioJson = sessionStorage.getItem("usuario");
const usuarioActual = usuarioJson ? JSON.parse(usuarioJson) : null;

function mostrarMensaje(texto, tipo = "exito") {
    const container = document.getElementById("alertContainer");
    if (!container) return console.error("Elemento #alertContainer no encontrado.");
    
   
    container.innerHTML = '';
    
    const div = document.createElement("div");
    div.className = tipo === "exito" ? "exito" : "alerta";
    div.textContent = texto;
    container.appendChild(div);

    setTimeout(() => div.remove(), 4000);
}

function logoutUser() {
    sessionStorage.removeItem("usuario");
    window.location.href = "index.html";
}


document.addEventListener("DOMContentLoaded", () => {
    
    if (!usuarioActual) {
        logoutUser();
        return;
    }
    

    const welcomeEl = document.getElementById("welcomeName");
    if (welcomeEl) {
        welcomeEl.textContent = `Bienvenido/a, ${usuarioActual.nombre}`;
    }


    cargarDoctores();
    cargarMisTurnos();

    document.getElementById("reserveForm")?.addEventListener("submit", manejarReservaTurno);
    
    document.getElementById("logoutBtn")?.addEventListener("click", logoutUser);
    
    
    document.getElementById("date")?.addEventListener("input", bloquearFinesDeSemana);
});

async function cargarDoctores() {
    const select = document.getElementById("selectDoctor");
    select.innerHTML = '<option value="">Cargando...</option>';

    try {
        const resp = await fetch(ENDPOINT_DOCTORES);
        const doctores = await resp.json();
        
        select.innerHTML = '<option value="">Seleccione un m茅dico</option>';
        doctores.forEach(doc => {
            const opt = document.createElement("option");
            opt.value = doc.id;
            opt.textContent = `${doc.nombre} (${doc.especialidad})`;
            select.appendChild(opt);
        });

    } catch (err) {
        console.error("Error cargando doctores:", err);
        select.innerHTML = '<option value="">Error al cargar</option>';
    }
}

async function manejarReservaTurno(e) {
    e.preventDefault();
    
    const doctorId = document.getElementById("selectDoctor").value;
    const fecha = document.getElementById("date").value;
    const hora = document.getElementById("time").value;

    if (!doctorId || !fecha || !hora) {
        mostrarMensaje("Por favor, complete todos los campos.", "alerta");
        return;
    }

    const nuevoTurno = {
        pacienteId: usuarioActual.id, 
        doctorId: doctorId,
        fecha: fecha,
        hora: hora,
        estado: "Pendiente" 
    };

    try {
        const resp = await fetch(ENDPOINT_TURNOS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoTurno)
        });

        if (resp.ok) {
            mostrarMensaje("Turno solicitado con 茅xito. Pendiente de confirmaci贸n.");
            document.getElementById("reserveForm").reset();
            cargarMisTurnos(); 
        } else {
            mostrarMensaje("Error al solicitar el turno.", "alerta");
        }
    } catch (err) {
        console.error("Error en la reserva:", err);
        mostrarMensaje("Error de conexi贸n al intentar reservar.", "alerta");
    }
}

async function cargarMisTurnos() {
    const cont = document.getElementById("misTurnos");
    cont.innerHTML = "<p>Cargando mis turnos...</p>";
    
    if (!usuarioActual) {
        cont.innerHTML = "<p>No se pudo cargar la informaci贸n del usuario.</p>";
        return;
    }

    try {
        const respDoc = await fetch(ENDPOINT_DOCTORES);
        const doctores = await respDoc.json();
        const mapDoctores = new Map(doctores.map(doc => [doc.id, doc]));

        const respTurnos = await fetch(ENDPOINT_TURNOS);
        const todosTurnos = await respTurnos.json();
        
        const misTurnos = todosTurnos.filter(t => t.pacienteId === usuarioActual.id);
        
        if (!misTurnos.length) {
            cont.innerHTML = "<p>No ten茅s turnos reservados.</p>";
            return;
        }

        cont.innerHTML = "";
        misTurnos.forEach(t => {
            const doctor = mapDoctores.get(t.doctorId);
            const nombreDoctor = doctor ? `${doctor.nombre} (${doctor.especialidad})` : `[M茅dico no encontrado]`;

            const c = document.createElement("div"); 
            c.className = `turno-card estado-${t.estado.toLowerCase()}`; 
            
           
            const botonCancelar = t.estado === "Pendiente" 
                ? `<button class="secundario" onclick="cancelarTurno('${t.id}')">Cancelar turno</button>`
                : `<span class="estado-mensaje">El turno ${t.estado} no se puede cancelar.</span>`;


            c.innerHTML = `<h4>Turno con ${nombreDoctor}</h4>
                <p><strong>Fecha:</strong> ${t.fecha}</p>
                <p><strong>Hora:</strong> ${t.hora}</p>
                <p><strong>Estado:</strong> <span class="badge">${t.estado}</span></p>
                ${botonCancelar}`;
            cont.appendChild(c);
        });
    } catch (err) {
        console.error("Error cargando mis turnos:", err);
        cont.innerHTML = "<p class='alerta'>Error al cargar turnos.</p>";
    }
}

async function cancelarTurno(idTurno) {
    if (!confirm("驴Seguro que quer茅s cancelar este turno?")) return;
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
        mostrarMensaje("Error de conexi贸n al intentar cancelar el turno.", "alerta");
    }
}

function bloquearFinesDeSemana(e) {
    const v = e.target.value;
    if (!v) return;

    const d = new Date(v);
    const diaSemana = d.getDay();

    if (diaSemana === 0 || diaSemana === 6) {
        mostrarMensaje("No se pueden seleccionar s谩bados ni domingos.", "alerta");
        e.target.value = "";
    }
}