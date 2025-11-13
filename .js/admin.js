const ENDPOINT_DOCTORES = "https://6915deb7465a9144626df544.mockapi.io/doctores";
const ENDPOINT_USUARIOS = "https://6915deb7465a9144626df544.mockapi.io/usuarios";

document.addEventListener("DOMContentLoaded", () => {
  // Formularios
  const formularioDoctor = document.getElementById("doctorForm");
  formularioDoctor.addEventListener("submit", manejarEnvioFormularioDoctor);

  const formularioPaciente = document.getElementById("pacienteForm");
  formularioPaciente.addEventListener("submit", manejarEnvioFormularioPaciente);

  // Botón mostrar/ocultar contraseña
  const botonMostrarPassword = document.getElementById("mostrarPassword");
  const inputPassword = document.getElementById("pacPassword");

  botonMostrarPassword.addEventListener("click", () => {
    if (inputPassword.type === "password") {
      inputPassword.type = "text";
      botonMostrarPassword.textContent = "🔓";
    } else {
      inputPassword.type = "password";
      botonMostrarPassword.textContent = "🔒";
    }
  });

  // Cargar listas iniciales
  cargarListaDoctores();
  cargarListaPacientes();

  // Cambiar de apartados
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
});

//Func Doctores
async function cargarListaDoctores() {
  const lista = document.getElementById("listaDoctores");
  lista.innerHTML = "<li>Cargando...</li>";

  try {
    const respuesta = await fetch(ENDPOINT_DOCTORES);
    if (!respuesta.ok) throw new Error("Error al obtener los médicos");
    const doctores = await respuesta.json();

    lista.innerHTML = "";

    if (doctores.length === 0) {
      lista.innerHTML = "<li>No hay médicos registrados.</li>";
      return;
    }

    doctores.forEach((doctor) => {
      const li = document.createElement("li");
      li.textContent = `${doctor.nombre} (${doctor.especialidad}) - Días: ${doctor.diasDisponibles}`;

      // Botón eliminar
      const botonEliminar = document.createElement("button");
      botonEliminar.textContent = "🗑️";
      botonEliminar.style.marginLeft = "10px";
      botonEliminar.addEventListener("click", () => eliminarDoctor(doctor.id));
      li.appendChild(botonEliminar);

      // Botón editar
      const botonEditar = document.createElement("button");
      botonEditar.textContent = "✏️";
      botonEditar.style.marginLeft = "10px";
      botonEditar.addEventListener("click", () => {
        document.getElementById("doctorId").value = doctor.id;
        document.getElementById("docNombre").value = doctor.nombre;
        document.getElementById("docEspecialidad").value = doctor.especialidad;
        document.getElementById("docDias").value = doctor.diasDisponibles;
      });
      li.appendChild(botonEditar);

      lista.appendChild(li);
    });
  } catch (error) {
    lista.innerHTML = `<li>Error: ${error.message}</li>`;
  }
}
//formulario carga doctor
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
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (!respuesta.ok) throw new Error("Error al guardar el médico");

    alert(`Médico ${id ? "actualizado" : "creado"} con éxito`);
    document.getElementById("doctorForm").reset();
    document.getElementById("doctorId").value = "";
    cargarListaDoctores();
  } catch (error) {
    console.error(error);
    alert("No se pudo guardar el médico");
  }
}
//boton eliminar doctor
async function eliminarDoctor(id) {
  if (!confirm("¿Eliminar este médico?")) return;

  try {
    const respuesta = await fetch(`${ENDPOINT_DOCTORES}/${id}`, { method: "DELETE" });
    if (!respuesta.ok) throw new Error("Error al eliminar");
    cargarListaDoctores();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el médico");
  }
}

//Func pacientes
async function cargarListaPacientes() {
  const lista = document.getElementById("listaPacientes");
  lista.innerHTML = "<li>Cargando...</li>";

  try {
    const respuesta = await fetch(ENDPOINT_USUARIOS);
    if (!respuesta.ok) throw new Error("Error al obtener los pacientes");
    const pacientes = await respuesta.json();

    lista.innerHTML = "";

    if (pacientes.length === 0) {
      lista.innerHTML = "<li>No hay pacientes registrados.</li>";
      return;
    }

    pacientes.forEach((paciente) => {
      const li = document.createElement("li");

      // Boton Mostrar contraseña
      li.textContent = `${paciente.nombre} - Email: ${paciente.email} - DNI: ${paciente.dni} - Password: ${paciente.password}`;

      // Botón eliminar paciente
      const botonEliminar = document.createElement("button");
      botonEliminar.textContent = "🗑️";
      botonEliminar.style.marginLeft = "10px";
      botonEliminar.addEventListener("click", () => eliminarPaciente(paciente.id));
      li.appendChild(botonEliminar);

      // Botón editar paciente
      const botonEditar = document.createElement("button");
      botonEditar.textContent = "✏️";
      botonEditar.style.marginLeft = "10px";
      botonEditar.addEventListener("click", () => {
        document.getElementById("pacienteId").value = paciente.id;
        document.getElementById("pacNombre").value = paciente.nombre;
        document.getElementById("pacEmail").value = paciente.email;
        document.getElementById("pacDni").value = paciente.dni;
        document.getElementById("pacPassword").value = paciente.password || "";
      });
      li.appendChild(botonEditar);

      lista.appendChild(li);
    });
  } catch (error) {
    lista.innerHTML = `<li>Error: ${error.message}</li>`;
  }
}
//formulario paciente
async function manejarEnvioFormularioPaciente(e) {
  e.preventDefault();

  const id = document.getElementById("pacienteId").value.trim();
  const nombre = document.getElementById("pacNombre").value.trim();
  const email = document.getElementById("pacEmail").value.trim();
  const dni = document.getElementById("pacDni").value.trim();
  const password = document.getElementById("pacPassword").value.trim();

  const datos = { nombre, email, dni, password };
  const metodo = id ? "PUT" : "POST";
  const url = id ? `${ENDPOINT_USUARIOS}/${id}` : ENDPOINT_USUARIOS;

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (!respuesta.ok) throw new Error("Error al guardar el paciente");

    alert(`Paciente ${id ? "actualizado" : "creado"} con éxito`);
    document.getElementById("pacienteForm").reset();
    document.getElementById("pacienteId").value = "";
    cargarListaPacientes();
  } catch (error) {
    console.error(error);
    alert("No se pudo guardar el paciente");
  }
}
//boton eliminar paciente
async function eliminarPaciente(id) {
  if (!confirm("¿Eliminar este paciente?")) return;

  try {
    const respuesta = await fetch(`${ENDPOINT_USUARIOS}/${id}`, { method: "DELETE" });
    if (!respuesta.ok) throw new Error("Error al eliminar");
    cargarListaPacientes();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el paciente");
  }
}
