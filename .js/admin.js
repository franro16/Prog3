/**
 * Resumen de que se hace aca:
 * Lógica del Administrador (Gestión Total).
 * FUNCIONALIDAD:
 * - Gestión de Médicos:(Crear, Listar, Editar, Borrar).
 * - Gestión de Pacientes: Lo de arriba para usuarios.
 * - Gestión de Turnos: Vista global de turnos, edición y cambio de estados (Pendiente/Confirmado/Cancelado).
 * - Dashboard: Calcula estadísticas y renderiza el gráfico de torta con Chart.js segun cantidad turnos y sus estados.
 */

const ENDPOINT_DOCTORES = "https://6915deb7465a9144626df544.mockapi.io/doctores";
const ENDPOINT_USUARIOS = "https://6915deb7465a9144626df544.mockapi.io/usuarios";
const ENDPOINT_TURNOS = "https://691af2052d8d78557570d069.mockapi.io/turnos"; 

let DOCTORES_CACHED = [];
let USUARIOS_CACHED = [];
let graficoInstancia = null; 

document.addEventListener("DOMContentLoaded", () => {
    const formularioDoctor = document.getElementById("doctorForm");
    const formularioPaciente = document.getElementById("pacienteForm");
    const formularioTurno = document.getElementById("turnoForm"); 

    const botonMostrarPassword = document.getElementById("mostrarPassword");
    const inputPassword = document.getElementById("pacPassword");
    const logoutBtn = document.getElementById("logoutBtn");

    if (formularioDoctor) formularioDoctor.addEventListener("submit", manejarEnvioFormularioDoctor);
    if (formularioPaciente) formularioPaciente.addEventListener("submit", manejarEnvioFormularioPaciente);
    if (formularioTurno) formularioTurno.addEventListener("submit", manejarEnvioFormularioTurno);

    if (botonMostrarPassword && inputPassword) {
        botonMostrarPassword.addEventListener("click", () => {
            if (inputPassword.type === "password") {
                inputPassword.type = "text";
                botonMostrarPassword.textContent = "🔓";
            } else {
                inputPassword.type = "password";
                botonMostrarPassword.textContent = "🔒";
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionStorage.removeItem("usuario");
            window.location.href = "index.html";
        });
    }

    const botones = document.querySelectorAll(".nav-admin button[data-section]");
    const secciones = document.querySelectorAll(".panel-section");

    botones.forEach((boton) => {
        boton.addEventListener("click", () => {
            const seccionMostrar = boton.getAttribute("data-section");
            secciones.forEach((sec) => sec.classList.remove("active"));
            
            const seccionActiva = document.getElementById(`seccion-${seccionMostrar}`);
            if (seccionActiva) {
                seccionActiva.classList.add("active");
            }
            
            if (seccionMostrar === 'turnos') {
                cargarSelectsTurno();
            }
        });
    });

    cargarListaDoctores();
    cargarListaPacientes();
    cargarListaTurnos();
    cargarDashboard();
    cargarSelectsTurno(); 
    generarOpcionesHorario();
});


function generarOpcionesHorario() {
    const select = document.getElementById('timeTurno');
    if (!select) return;

    const startHour = 8;        
    const endHour = 20;         
    const intervalMinutes = 30; 

    select.innerHTML = '<option value="">Seleccione hora</option>';

    for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
            
            
            if (hour === endHour && minute !== 0) {
                 continue; 
            }
           
            if (hour > endHour) {
                break;
            }

            const formattedHour = String(hour).padStart(2, '0');
            const formattedMinute = String(minute).padStart(2, '0');
            
            const timeValue = `${formattedHour}:${formattedMinute}`;

            
            const option = document.createElement('option');
            option.value = timeValue;
            option.textContent = timeValue;

            
            select.appendChild(option);
            
           
            if (hour === endHour) {
                 break;
            }
        }
    }
}


async function obtenerDoctores() {
    if (DOCTORES_CACHED.length) {
        return DOCTORES_CACHED;
    }
    try {
        const res = await fetch(ENDPOINT_DOCTORES);
        DOCTORES_CACHED = await res.json();
        return DOCTORES_CACHED;
    } catch (error) {
        console.error("Error al obtener doctores:", error);
        return [];
    }
}

async function obtenerUsuarios() {
    if (USUARIOS_CACHED.length) {
        return USUARIOS_CACHED;
    }
    try {
        const res = await fetch(ENDPOINT_USUARIOS);
        USUARIOS_CACHED = await res.json();
        return USUARIOS_CACHED;
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        return [];
    }
}

async function cargarSelectsTurno() {
    generarOpcionesHorario(); 
    await cargarSelectDoctores();
    await cargarSelectPacientes();
}

async function cargarSelectDoctores() {
    const select = document.getElementById("selectDoctorTurno");
    if (!select) return; 

    select.innerHTML = '<option value="">Cargando...</option>';

    try {
        const doctores = await obtenerDoctores();
        
        select.innerHTML = '<option value="">Seleccione un médico</option>';
        doctores.forEach(doc => {
            const opt = document.createElement("option");
            opt.value = doc.id;
            opt.textContent = `${doc.nombre} (${doc.especialidad})`;
            select.appendChild(opt);
        });

    } catch (err) {
        console.error("Error cargando doctores para select:", err);
        select.innerHTML = '<option value="">Error al cargar</option>';
    }
}

async function cargarSelectPacientes() {
    const select = document.getElementById("selectPaciente");
    if (!select) return; 
    
    select.innerHTML = '<option value="">Cargando...</option>';

    try {
        const usuarios = await obtenerUsuarios();
        
        const pacientes = usuarios.filter(u => u.rol === 'paciente' || u.rol === 'admin');
        
        select.innerHTML = '<option value="">Seleccione un paciente/usuario</option>';
        pacientes.forEach(user => {
            const opt = document.createElement("option");
            opt.value = user.id;
            opt.textContent = `${user.nombre} (${user.email} - ${user.rol})`;
            select.appendChild(opt);
        });

    } catch (err) {
        console.error("Error cargando usuarios para select:", err);
        select.innerHTML = '<option value="">Error al cargar</option>';
    }
}


async function cargarListaDoctores() {
    const lista = document.getElementById("listaDoctores");
    if (!lista) return;
    
    lista.innerHTML = "<li>Cargando...</li>";

    const doctores = await obtenerDoctores();

    lista.innerHTML = "";
    if (!doctores.length) {
        lista.innerHTML = "<li>No hay médicos registrados.</li>";
        return;
    }

    doctores.forEach((doctor) => {
        const li = document.createElement("li");
        
        const infoDiv = document.createElement("div");
        infoDiv.innerHTML = `
            <strong>Nombre:</strong> ${doctor.nombre} - <strong>Especialidad:</strong> ${doctor.especialidad} <br>
            <strong>Días Disponibles:</strong> ${doctor.diasDisponibles}
        `;
        li.appendChild(infoDiv);

        const accionesDiv = document.createElement("div");
        accionesDiv.className = "turno-acciones"; 

        const botonEditar = document.createElement("button");
        botonEditar.textContent = "✏️ Editar"; 
        botonEditar.className = "btn-editar";
        botonEditar.addEventListener("click", () => {
            document.getElementById("doctorId").value = doctor.id;
            document.getElementById("docNombre").value = doctor.nombre;
            document.getElementById("docEspecialidad").value = doctor.especialidad;
            document.getElementById("docDias").value = doctor.diasDisponibles;
        });
        
        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "🗑️ Eliminar"; 
        botonEliminar.className = "btn-eliminar";
        botonEliminar.addEventListener("click", () => eliminarDoctor(doctor.id));


        accionesDiv.appendChild(botonEditar); 
        accionesDiv.appendChild(botonEliminar); 
        
        li.appendChild(accionesDiv);
        lista.appendChild(li);
    });
}

async function manejarEnvioFormularioDoctor(e) {
    e.preventDefault();
    const id = document.getElementById("doctorId").value.trim();
    const nombre = document.getElementById("docNombre").value.trim();
    const especialidad = document.getElementById("docEspecialidad").value.trim();
    const diasDisponibles = document.getElementById("docDias").value.trim();

    const datos = { nombre, especialidad, diasDisponibles };
    const metodo = id ? "PUT" : "POST";
    const url = id ? `${ENDPOINT_DOCTORES}/${id}` : ENDPOINT_DOCTORES;

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
        });

        if (res.ok) {
            alert(`Médico ${id ? "actualizado" : "creado"} con éxito`);
            e.target.reset();
            document.getElementById("doctorId").value = "";
            DOCTORES_CACHED = []; 
            cargarListaDoctores();
        } else {
            alert("No se pudo guardar el médico");
        }
    } catch (error) {
        alert("Error de conexión al guardar el médico.");
    }
}

async function eliminarDoctor(id) {
    if (!confirm("¿Eliminar médico?")) return;
    try {
        const res = await fetch(`${ENDPOINT_DOCTORES}/${id}`, { method: "DELETE" });
        if (res.ok) {
            DOCTORES_CACHED = []; 
            cargarListaDoctores();
        }
        else alert("No se pudo eliminar el médico");
    } catch (error) {
        alert("Error de conexión al eliminar el médico.");
    }
}

async function cargarListaPacientes() {
    const lista = document.getElementById("listaPacientes");
    if (!lista) return;

    lista.innerHTML = "<li>Cargando...</li>";

    const usuarios = await obtenerUsuarios();

    lista.innerHTML = "";
    if (!usuarios.length) {
        lista.innerHTML = "<li>No hay usuarios registrados.</li>";
        return;
    }

    usuarios.forEach((user) => {
        const li = document.createElement("li");
        if (user.rol === "admin") {
            li.style.border = "2px solid #d33";
            li.style.background = "#fff0f0";
            li.style.padding = "12px 18px"; 
        }
        
        const infoDiv = document.createElement("div");
        infoDiv.innerHTML = `
            <strong>Nombre:</strong> ${user.nombre} - <strong>Email:</strong> ${user.email} - <strong>DNI:</strong> ${user.dni} <br>
            <strong>Rol:</strong> ${user.rol}
        `;
        li.appendChild(infoDiv);

        const accionesDiv = document.createElement("div");
        accionesDiv.className = "turno-acciones"; 

        const botonEditar = document.createElement("button");
        botonEditar.textContent = "✏️ Editar"; 
        botonEditar.className = "btn-editar";
        botonEditar.addEventListener("click", () => {
            document.getElementById("pacienteId").value = user.id;
            document.getElementById("pacNombre").value = user.nombre;
            document.getElementById("pacEmail").value = user.email;
            document.getElementById("pacDni").value = user.dni;
            const pacPassword = document.getElementById("pacPassword");
            const pacRol = document.getElementById("pacRol");
            if (pacPassword) pacPassword.value = user.password || "";
            if (pacRol) pacRol.value = user.rol || "paciente";
        });
        
        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "🗑️ Eliminar"; 
        botonEliminar.className = "btn-eliminar";
        botonEliminar.addEventListener("click", () => eliminarPaciente(user.id));

        accionesDiv.appendChild(botonEditar); 
        accionesDiv.appendChild(botonEliminar); 
        
        li.appendChild(accionesDiv);
        lista.appendChild(li);
    });
}

async function manejarEnvioFormularioPaciente(e) {
    e.preventDefault();
    const id = document.getElementById("pacienteId").value.trim();
    const nombre = document.getElementById("pacNombre").value.trim();
    const email = document.getElementById("pacEmail").value.trim();
    const dni = document.getElementById("pacDni").value.trim();
    const password = document.getElementById("pacPassword") ? document.getElementById("pacPassword").value.trim() : "";
    const rol = document.getElementById("pacRol") ? document.getElementById("pacRol").value.trim() : "paciente";

    const datos = { nombre, email, dni, password, rol };
    const metodo = id ? "PUT" : "POST";
    const url = id ? `${ENDPOINT_USUARIOS}/${id}` : ENDPOINT_USUARIOS;

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
        });

        if (res.ok) {
            alert(`Usuario ${id ? "actualizado" : "creado"} con éxito`);
            e.target.reset();
            document.getElementById("pacienteId").value = "";
            USUARIOS_CACHED = []; 
            cargarListaPacientes();
        } else {
            alert("No se pudo guardar el usuario");
        }
    } catch (error) {
        alert("Error de conexión al guardar el usuario.");
    }
}

async function eliminarPaciente(id) {
    if (!confirm("¿Eliminar usuario?")) return;
    try {
        const res = await fetch(`${ENDPOINT_USUARIOS}/${id}`, { method: "DELETE" });
        if (res.ok) {
            USUARIOS_CACHED = []; 
            cargarListaPacientes();
        }
        else alert("No se pudo eliminar el usuario");
    } catch (error) {
        alert("Error de conexión al eliminar el usuario.");
    }
}

async function cargarListaTurnos() {
    const lista = document.getElementById("listaTurnos");
    if (!lista) return;

    lista.innerHTML = "<li>Cargando turnos...</li>";

    try {
        const doctores = await obtenerDoctores();
        const usuarios = await obtenerUsuarios();
        const resTurnos = await fetch(ENDPOINT_TURNOS);
        const turnos = await resTurnos.json();

        const doctorMap = new Map(doctores.map(d => [d.id, d]));
        const usuarioMap = new Map(usuarios.map(u => [u.id, u]));

        lista.innerHTML = "";
        if (!turnos.length) {
            lista.innerHTML = "<li>No hay turnos registrados.</li>";
            return;
        }

        turnos.forEach(turno => {
            const doctor = doctorMap.get(turno.doctorId);
            const paciente = usuarioMap.get(turno.pacienteId);
            
            const doctorNombre = doctor ? `${doctor.nombre}` : `[Doctor ID: ${turno.doctorId}]`;
            const pacienteNombre = paciente ? `${paciente.nombre} <br> <strong>DNI:</strong> ${paciente.dni}` : `[Paciente ID: ${turno.pacienteId}]`;

            const estadoActual = turno.estado || 'Desconocido';

            const li = document.createElement("li");
            li.className = `turno-item estado-${estadoActual.toLowerCase()}`;
            
            
            li.innerHTML = `
                <div class="turno-info-principal">
                    <strong>Doctor:</strong> ${doctorNombre} <br>
                    <strong>Paciente:</strong> ${pacienteNombre} <br>
                    <strong>Fecha:</strong> ${turno.fecha} |<br> <strong>Hora:</strong> ${turno.hora} | 
                    <br> <strong>Estado:</strong> <span class="badge-estado">${estadoActual}</span>
                </div>

                <div class="turno-acciones"> 
                    <select id="estado-${turno.id}" class="select-estado" data-id="${turno.id}" data-current-state="${estadoActual}">
                        <option value="Pendiente" ${estadoActual === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="Confirmado" ${estadoActual === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
                        <option value="Cancelado" ${estadoActual === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                        <option value="Finalizado" ${estadoActual === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
                    </select>
                    <button class="btn-editar" onclick='cargarFormularioTurno(${JSON.stringify(turno)})'>✏️ Editar</button>
                    <button class="btn-eliminar" onclick="eliminarTurno('${turno.id}')">🗑️ Eliminar</button>
                </div>
            `;
            lista.appendChild(li);
        });

        document.querySelectorAll('.select-estado').forEach(select => {
            select.addEventListener('change', (e) => cambiarEstadoTurno(e.target.dataset.id, e.target.value));
        });

    } catch (error) {
        console.error("Error al cargar lista de turnos:", error);
        lista.innerHTML = "<li>Error al cargar la lista de turnos. Verifica tu ENDPOINT_TURNOS y conexión.</li>";
    }
}


function cargarFormularioTurno(turno) {
    document.querySelectorAll(".panel-section").forEach((sec) => sec.classList.remove("active"));
    const seccionTurnos = document.getElementById(`seccion-turnos`);
    if(seccionTurnos) seccionTurnos.classList.add("active");
    
    const form = document.getElementById("turnoForm");
    
    document.getElementById("turnoId").value = turno.id;
    document.getElementById("selectDoctorTurno").value = turno.doctorId;
    document.getElementById("selectPaciente").value = turno.pacienteId;
    document.getElementById("dateTurno").value = turno.fecha;
    document.getElementById("timeTurno").value = turno.hora;
    
    document.getElementById("guardarTurno").textContent = "Actualizar Turno";
    
    if(form) form.scrollIntoView({ behavior: 'smooth' });
}

async function manejarEnvioFormularioTurno(e) {
    e.preventDefault();
    const id = document.getElementById("turnoId").value.trim();
    
    const doctorId = document.getElementById("selectDoctorTurno").value;
    const pacienteId = document.getElementById("selectPaciente").value;
    const fecha = document.getElementById("dateTurno").value;
    const hora = document.getElementById("timeTurno").value;

    const datosBase = { doctorId, pacienteId, fecha, hora };

    const metodo = id ? "PUT" : "POST";
    const url = id ? `${ENDPOINT_TURNOS}/${id}` : ENDPOINT_TURNOS;
    
    let datosAEnviar = { ...datosBase };

    if (metodo === "POST") {
        datosAEnviar.estado = "Pendiente"; 
    }
    
    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosAEnviar),
        });

        if (res.ok) {
            alert(`Turno ${id ? "actualizado" : "creado"} con éxito.`);
            e.target.reset();
            document.getElementById("turnoId").value = "";
            document.getElementById("guardarTurno").textContent = "Guardar Turno";
            cargarListaTurnos(); 
            cargarDashboard(); 
        } else {
            alert(`Error al ${id ? "actualizar" : "crear"} el turno.`);
        }
    } catch (error) {
        alert(`Error de conexión al ${id ? "actualizar" : "crear"} el turno.`);
    }
}

async function cambiarEstadoTurno(id, nuevoEstado) {
    if (!confirm(`¿Cambiar estado del turno ${id} a ${nuevoEstado}?`)) {
        const select = document.getElementById(`estado-${id}`);
        select.value = select.dataset.currentState;
        return;
    }

    try {
        const res = await fetch(`${ENDPOINT_TURNOS}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: nuevoEstado }),
        });

        if (res.ok) {
            alert(`Estado del turno ${id} actualizado a ${nuevoEstado}.`);
            document.getElementById(`estado-${id}`).dataset.currentState = nuevoEstado;
            cargarListaTurnos(); 
            cargarDashboard(); 
        } else {
            alert("No se pudo actualizar el estado del turno.");
        }
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        alert("Ocurrió un error al intentar cambiar el estado del turno.");
    }
}

async function eliminarTurno(id) {
    if (!confirm("¿Eliminar turno? Esta acción es irreversible.")) return;

    try {
        const res = await fetch(`${ENDPOINT_TURNOS}/${id}`, { method: "DELETE" });

        if (res.ok) {
            alert("Turno eliminado con éxito.");
            cargarListaTurnos();
            cargarDashboard();
        } else {
            alert("No se pudo eliminar el turno.");
        }
    } catch (error) {
        alert("Ocurrió un error al intentar eliminar el turno.");
    }
}


async function cargarDashboard() {
    const infoDiv = document.getElementById("dashboardInfo"); 
    const canvas = document.getElementById("graficoTurnos");

    if (!infoDiv || !canvas) return; 

    infoDiv.innerHTML = "Cargando estadísticas...";

    try {
        const resTurnos = await fetch(ENDPOINT_TURNOS);
        const turnos = await resTurnos.json();

        const conteoEstados = turnos.reduce((acc, t) => {
            const estado = t.estado || 'Desconocido';
            acc[estado] = (acc[estado] || 0) + 1;
            return acc;
        }, {});

        let resumenHTML = '<h3>Resumen de Estados de Turnos</h3><ul>';
        let totalTurnos = 0;
        for (const [estado, cantidad] of Object.entries(conteoEstados)) {
            resumenHTML += `<li><strong>${estado}:</strong> ${cantidad}</li>`;
            totalTurnos += cantidad;
        }
        resumenHTML += `<li><hr><strong>TOTAL:</strong> ${totalTurnos}</li></ul>`;
        infoDiv.innerHTML = resumenHTML;
        
        dibujarGraficoTurnos(conteoEstados, canvas);

    } catch (error) {
        console.error("Error al cargar dashboard:", error);
        infoDiv.innerHTML = "<p class='alerta'>Error al cargar el dashboard.</p>";
    }
}

function dibujarGraficoTurnos(conteoEstados, canvas) {
    if (typeof Chart === 'undefined') {
        return;
    }
    
    if (graficoInstancia) {
        graficoInstancia.destroy();
    }
    
    const labels = Object.keys(conteoEstados);
    const data = Object.values(conteoEstados);
    
    const colors = {
        'Pendiente': '#f1c40f',
        'Confirmado': '#2ecc71',
        'Cancelado': '#e74c3c',
        'Finalizado': '#3498db',
        'Desconocido': '#95a5a6',
    };
    
    const backgroundColors = labels.map(label => colors[label] || '#95a5a6'); 
    
    graficoInstancia = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad de Turnos',
                data: data,
                backgroundColor: backgroundColors,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}