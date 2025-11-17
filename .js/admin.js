// protection done in admin.html inline script (before DOM load)
// endpoints
const ENDPOINT_DOCTORES = "https://6915deb7465a9144626df544.mockapi.io/doctores";
const ENDPOINT_USUARIOS = "https://6915deb7465a9144626df544.mockapi.io/usuarios";

document.addEventListener("DOMContentLoaded", () => {
  // ---------- referencias ----------
  const formularioDoctor = document.getElementById("doctorForm");
  const formularioPaciente = document.getElementById("pacienteForm");
  const botonMostrarPassword = document.getElementById("mostrarPassword");
  const inputPassword = document.getElementById("pacPassword");
  const logoutBtn = document.getElementById("logoutBtn");

  // ---------- listeners ----------
  formularioDoctor && formularioDoctor.addEventListener("submit", manejarEnvioFormularioDoctor);
  formularioPaciente && formularioPaciente.addEventListener("submit", manejarEnvioFormularioPaciente);

  botonMostrarPassword && botonMostrarPassword.addEventListener("click", () => {
    if (!inputPassword) return;
    if (inputPassword.type === "password") {
      inputPassword.type = "text";
      botonMostrarPassword.textContent = "🔓";
    } else {
      inputPassword.type = "password";
      botonMostrarPassword.textContent = "🔒";
    }
  });

  logoutBtn && logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("usuario");
    window.location.href = "index.html";
  });

  // navegación entre secciones
  const botones = document.querySelectorAll(".nav-admin button[data-section]");
  const secciones = document.querySelectorAll(".panel-section");
  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      const seccionMostrar = boton.getAttribute("data-section");
      secciones.forEach((sec) => sec.classList.remove("active"));
      const objetivo = document.getElementById(`seccion-${seccionMostrar}`);
      if (objetivo) objetivo.classList.add("active");
    });
  });

  // cargar datos iniciales
  cargarListaDoctores();
  cargarListaPacientes();
  cargarListaTurnos(); // si no tenés turnos aún, función no rompe (implementada abajo)
});

// ============================
// DOCTORES
// ============================
async function cargarListaDoctores() {
  const lista = document.getElementById("listaDoctores");
  if (!lista) return;
  lista.innerHTML = "<li>Cargando...</li>";

  try {
    const respuesta = await fetch(ENDPOINT_DOCTORES);
    if (!respuesta.ok) throw new Error("Error al obtener médicos");
    const doctores = await respuesta.json();

    lista.innerHTML = "";

    if (!doctores.length) {
      lista.innerHTML = "<li>No hay médicos registrados.</li>";
      return;
    }

    doctores.forEach((doctor) => {
      const li = document.createElement("li");
      li.className = "item-doctor";
      li.innerHTML = `<strong>${escapeHtml(doctor.nombre)}</strong> (${escapeHtml(doctor.especialidad)}) - Días: ${escapeHtml(doctor.diasDisponibles)}`;

      const botonEliminar = document.createElement("button");
      botonEliminar.textContent = "🗑️";
      botonEliminar.className = "btn-accion btn-eliminar";
      botonEliminar.addEventListener("click", () => eliminarDoctor(doctor.id));

      const botonEditar = document.createElement("button");
      botonEditar.textContent = "✏️";
      botonEditar.className = "btn-accion btn-editar";
      botonEditar.addEventListener("click", () => {
        document.getElementById("doctorId").value = doctor.id;
        document.getElementById("docNombre").value = doctor.nombre;
        document.getElementById("docEspecialidad").value = doctor.especialidad;
        document.getElementById("docDias").value = doctor.diasDisponibles;
      });

      li.appendChild(botonEliminar);
      li.appendChild(botonEditar);
      lista.appendChild(li);
    });
  } catch (err) {
    lista.innerHTML = `<li>Error: ${err.message}</li>`;
  }
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
    if (!res.ok) throw new Error("Error al guardar el médico");
    alert(`Médico ${id ? "actualizado" : "creado"} con éxito`);
    e.target.reset();
    document.getElementById("doctorId").value = "";
    cargarListaDoctores();
  } catch (err) {
    console.error(err);
    alert("No se pudo guardar el médico");
  }
}

async function eliminarDoctor(id) {
  if (!confirm("¿Eliminar médico?")) return;
  try {
    const res = await fetch(`${ENDPOINT_DOCTORES}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar");
    cargarListaDoctores();
  } catch (err) {
    console.error(err);
    alert("No se pudo eliminar el médico");
  }
}

// ============================
// USUARIOS / PACIENTES
// ============================
async function cargarListaPacientes() {
  const lista = document.getElementById("listaPacientes");
  if (!lista) return;
  lista.innerHTML = "<li>Cargando...</li>";

  try {
    const res = await fetch(ENDPOINT_USUARIOS);
    if (!res.ok) throw new Error("Error al obtener usuarios");
    let usuarios = await res.json();

    // ordenar admin arriba (si hay varios admins, quedan al inicio)
    usuarios.sort((a, b) => {
      if (a.rol === b.rol) return 0;
      if (a.rol === "admin") return -1;
      if (b.rol === "admin") return 1;
      return 0;
    });

    lista.innerHTML = "";

    if (!usuarios.length) {
      lista.innerHTML = "<li>No hay usuarios registrados.</li>";
      return;
    }

    usuarios.forEach((user) => {
      const li = document.createElement("li");
      li.className = "item-usuario";

      // estilo visual para admin
      if (user.rol === "admin") {
        li.style.border = "2px solid #d33";
        li.style.background = "#fff0f0";
        li.style.padding = "8px";
      }

      // mostrar campos — NO uses innerHTML con datos sin escapar si podés evitar XSS
      li.innerHTML = `<strong>${escapeHtml(user.nombre)}</strong> - ${escapeHtml(user.email)} - DNI: ${escapeHtml(user.dni)} - <em>Rol: ${escapeHtml(user.rol)}</em>`;

      // botones
      const botonEliminar = document.createElement("button");
      botonEliminar.textContent = "🗑️";
      botonEliminar.className = "btn-accion btn-eliminar";
      botonEliminar.addEventListener("click", () => eliminarPaciente(user.id));

      const botonEditar = document.createElement("button");
      botonEditar.textContent = "✏️";
      botonEditar.className = "btn-accion btn-editar";
      botonEditar.addEventListener("click", () => {
        document.getElementById("pacienteId").value = user.id;
        document.getElementById("pacNombre").value = user.nombre;
        document.getElementById("pacEmail").value = user.email;
        document.getElementById("pacDni").value = user.dni;
        document.getElementById("pacPassword").value = user.password || "";
        document.getElementById("pacRol").value = user.rol || "paciente";
      });

      li.appendChild(botonEliminar);
      li.appendChild(botonEditar);
      lista.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    lista.innerHTML = `<li>Error: ${err.message}</li>`;
  }
}

async function manejarEnvioFormularioPaciente(e) {
  e.preventDefault();
  const id = document.getElementById("pacienteId").value.trim();
  const nombre = document.getElementById("pacNombre").value.trim();
  const email = document.getElementById("pacEmail").value.trim();
  const dni = document.getElementById("pacDni").value.trim();
  const password = document.getElementById("pacPassword").value.trim();
  const rol = document.getElementById("pacRol").value.trim();

  const datos = { nombre, email, dni, password, rol };
  const metodo = id ? "PUT" : "POST";
  const url = id ? `${ENDPOINT_USUARIOS}/${id}` : ENDPOINT_USUARIOS;

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    if (!res.ok) throw new Error("Error al guardar usuario");
    alert(`Usuario ${id ? "actualizado" : "creado"} con éxito`);
    e.target.reset();
    document.getElementById("pacienteId").value = "";
    cargarListaPacientes();
  } catch (err) {
    console.error(err);
    alert("No se pudo guardar el usuario");
  }
}

async function eliminarPaciente(id) {
  if (!confirm("¿Eliminar usuario?")) return;
  try {
    const res = await fetch(`${ENDPOINT_USUARIOS}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar usuario");
    cargarListaPacientes();
  } catch (err) {
    console.error(err);
    alert("No se pudo eliminar el usuario");
  }
}

// ============================
// TURNOS (minimal — adaptá si tenés lógica extra)
// ============================
async function cargarListaTurnos() {
  const lista = document.getElementById("listaTurnos");
  if (!lista) return;
  lista.innerHTML = "<li>Cargando...</li>";

  // Si no tenés endpoint de turnos definido, dejamos vacío por ahora
  // Podés agregar ENDPOINT_TURNOS y la lógica similar a doctores/usuarios
  lista.innerHTML = "<li>No hay turnos configurados.</li>";
}

// ============================
// UTIL
// ============================
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
