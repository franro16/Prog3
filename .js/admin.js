/* =======================================================
 * ARCHIVO: admin.js
 * Lógica para la página 'admin.html'.
 * ======================================================= */

const ENDPOINT_DOCTORS = "https://6915deb7465a9144626df544.mockapi.io/doctores";

document.addEventListener("DOMContentLoaded", () => {
  console.log("admin.js cargado correctamente");

  // Asignar evento al formulario
  const form = document.getElementById("doctorForm");
  form.addEventListener("submit", handleDoctorFormSubmit);

  // Cargar lista al iniciar
  loadDoctorsList();
});

/**
 * Carga y muestra los médicos desde MockAPI
 */
async function loadDoctorsList() {
  const listElement = document.getElementById("doctorsList");
  listElement.innerHTML = "<li>Cargando...</li>";

  try {
    const res = await fetch(ENDPOINT_DOCTORS);
    if (!res.ok) throw new Error("Error al obtener los médicos");
    const doctors = await res.json();

    listElement.innerHTML = "";

    if (doctors.length === 0) {
      listElement.innerHTML = "<li>No hay médicos registrados.</li>";
      return;
    }

    doctors.forEach((doctor) => {
      const li = document.createElement("li");
      li.textContent = `${doctor.nombre} (${doctor.especialidad}) - Días: ${doctor.diasDisponibles}`;

      // Botón eliminar
      const btnDel = document.createElement("button");
      btnDel.textContent = "🗑️";
      btnDel.style.marginLeft = "10px";
      btnDel.addEventListener("click", () => deleteDoctor(doctor.id));

      li.appendChild(btnDel);
      listElement.appendChild(li);
    });
  } catch (err) {
    listElement.innerHTML = `<li>Error: ${err.message}</li>`;
  }
}

/**
 * Maneja el envío del formulario (crear o actualizar médico)
 */
async function handleDoctorFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("doctorId").value.trim();
  const nombre = document.getElementById("docNombre").value.trim();
  const especialidad = document.getElementById("docEspecialidad").value.trim();
  const diasDisponibles = document.getElementById("docDias").value.trim();

  const data = { nombre, especialidad, diasDisponibles };
  const method = id ? "PUT" : "POST";
  const url = id ? `${ENDPOINT_DOCTORS}/${id}` : ENDPOINT_DOCTORS;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al guardar el médico");

    alert(`Médico ${id ? "actualizado" : "creado"} con éxito`);
    document.getElementById("doctorForm").reset();
    document.getElementById("doctorId").value = "";
    loadDoctorsList();
  } catch (err) {
    console.error(err);
    alert("No se pudo guardar el médico");
  }
}

/**
 * Eliminar un médico por ID
 */
async function deleteDoctor(id) {
  if (!confirm("¿Eliminar este médico?")) return;

  try {
    const res = await fetch(`${ENDPOINT_DOCTORS}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar");
    loadDoctorsList();
  } catch (err) {
    console.error(err);
    alert("No se pudo eliminar el médico");
  }
}
