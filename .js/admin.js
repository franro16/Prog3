const ENDPOINT_DOCTORES = "https://6915deb7465a9144626df544.mockapi.io/doctores";
const ENDPOINT_USUARIOS = "https://6915deb7465a9144626df544.mockapi.io/usuarios";

document.addEventListener("DOMContentLoaded", () => {
  const formularioDoctor = document.getElementById("doctorForm");
  const formularioPaciente = document.getElementById("pacienteForm");
  const botonMostrarPassword = document.getElementById("mostrarPassword");
  const inputPassword = document.getElementById("pacPassword");
  const logoutBtn = document.getElementById("logoutBtn");

  formularioDoctor.addEventListener("submit", manejarEnvioFormularioDoctor);
  formularioPaciente.addEventListener("submit", manejarEnvioFormularioPaciente);

  botonMostrarPassword.addEventListener("click", () => {
    if (inputPassword.type === "password") {
      inputPassword.type = "text";
      botonMostrarPassword.textContent = "🔓";
    } else {
      inputPassword.type = "password";
      botonMostrarPassword.textContent = "🔒";
    }
  });

  logoutBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // Navegación entre secciones
  const botones = document.querySelectorAll(".nav-admin button[data-section]");
  const secciones = document.querySelectorAll(".panel-section");

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      const seccionMostrar = boton.getAttribute("data-section");
      secciones.forEach((sec) => sec.classList.remove("active"));
      document.getElementById(`seccion-${seccionMostrar}`).classList.add("active");
    });
  });

  // Cargar datos
  cargarListaDoctores();
  cargarListaPacientes();
  cargarListaTurnos();
});

// ============================
// DOCTORES
// ============================
async function cargarListaDoctores() {
  const lista = document.getElementById("listaDoctores");
  lista.innerHTML = "<li>Cargando...</li>";

  const respuesta = await fetch(ENDPOINT_DOCTORES);
  const doctores = await respuesta.json();

  lista.innerHTML = "";
  if (!doctores.length) {
    lista.innerHTML = "<li>No hay médicos registrados.</li>";
    return;
  }

  doctores.forEach((doctor) => {
    const li = document.createElement("li");
    li.textContent = `${doctor.nombre} (${doctor.especialidad}) - Días: ${doctor.diasDisponibles}`;

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "🗑️";
    botonEliminar.addEventListener("click", () => eliminarDoctor(doctor.id));

    const botonEditar = document.createElement("button");
    botonEditar.textContent = "✏️";
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

  const res = await fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (res.ok) {
    alert(`Médico ${id ? "actualizado" : "creado"} con éxito`);
    e.target.reset();
    document.getElementById("doctorId").value = "";
    cargarListaDoctores();
  } else {
    alert("No se pudo guardar el médico");
  }
}

async function eliminarDoctor(id) {
  if (!confirm("¿Eliminar médico?")) return;
  const res = await fetch(`${ENDPOINT_DOCTORES}/${id}`, { method: "DELETE" });
  if (res.ok) cargarListaDoctores();
  else alert("No se pudo eliminar el médico");
}

// ============================
// USUARIOS / PACIENTES
// ============================
async function cargarListaPacientes() {
  const lista = document.getElementById("listaPacientes");
  lista.innerHTML = "<li>Cargando...</li>";

  const res = await fetch(ENDPOINT_USUARIOS);
  const usuarios = await res.json();

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
      li.style.padding = "8px";
    }

    li.textContent = `${user.nombre} - ${user.email} - DNI: ${user.dni} - Rol: ${user.rol}`;

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "🗑️";
    botonEliminar.addEventListener("click", () => eliminarPaciente(user.id));

    const botonEditar = document.createElement("button");
    botonEditar.textContent = "✏️";
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

  const res = await fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (res.ok) {
    alert(`Usuario ${id ? "actualizado" : "creado"} con éxito`);
    e.target.reset();
    document.getElementById("pacienteId").value = "";
    cargarListaPacientes();
  } else {
    alert("No se pudo guardar el usuario");
  }
}

async function eliminarPaciente(id) {
  if (!confirm("¿Eliminar usuario?")) return;
  const res = await fetch(`${ENDPOINT_USUARIOS}/${id}`, { method: "DELETE" });
  if (res.ok) cargarListaPacientes();
  else alert("No se pudo eliminar el usuario");
}

// ============================
// TURNOS (sólo placeholder)
// ============================
async function cargarListaTurnos() {
  const lista = document.getElementById("listaTurnos");
  lista.innerHTML = "<li>No hay turnos configurados.</li>";
}
