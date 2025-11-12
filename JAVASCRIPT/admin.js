/* =======================================================
 * ARCHIVO: admin.js
 * Lógica para la página 'admin.html'.
 * ======================================================= */

// 1. Verificar Autenticación y Rol (¡Esto es lo primero!)
const currentUser = checkAuthAndRole('ADMIN');

// Si checkAuthAndRole falla, el script no continúa
// y el usuario es redirigido.

document.addEventListener('DOMContentLoaded', () => {
    
    // 2. Asignar evento al botón de cerrar sesión
    document.getElementById('cerrarSesion').addEventListener('click', logoutUser);

    // 3. Asignar evento al formulario de Doctores
    document.getElementById('doctorForm').addEventListener('submit', handleDoctorFormSubmit);

    // 4. Cargar la lista de médicos al iniciar la página
    loadDoctorsList();

    // 5. Cargar la lista de turnos (tarea futura)
    // loadAppointmentsList(); 
});


/**
 * Carga y renderiza la lista de médicos en el UL.
 */
async function loadDoctorsList() {
    const listElement = document.getElementById('doctorsList');
    listElement.innerHTML = '<li>Cargando...</li>'; // Feedback para el usuario

    try {
        const response = await fetch(ENDPOINT_DOCTORS);
        if (!response.ok) throw new Error('No se pudieron cargar los médicos.');
        
        const doctors = await response.json();
        
        listElement.innerHTML = ''; // Limpiar la lista
        
        if (doctors.length === 0) {
            listElement.innerHTML = '<li>No hay médicos registrados.</li>';
            return;
        }

        doctors.forEach(doctor => {
            const li = document.createElement('li');
            li.textContent = `${doctor.nombre} (${doctor.especialidad}) - Días: ${doctor.diasDisponibles.join(', ')}`;
            // (Aquí se agregarían botones de Editar/Eliminar)
            listElement.appendChild(li);
        });

    } catch (error) {
        listElement.innerHTML = `<li>Error: ${error.message}</li>`;
    }
}

/**
 * Maneja el envío del formulario de doctores (Crear/Actualizar)
 */
async function handleDoctorFormSubmit(event) {
    event.preventDefault();

    // Obtener los datos del formulario
    const doctorId = document.getElementById('doctorId').value;
    const nombre = document.getElementById('docNombre').value;
    const especialidad = document.getElementById('docEspecialidad').value;
    
    // Convertir el string de días en un array
    const diasInput = document.getElementById('docDias').value;
    const diasArray = diasInput.split(',').map(dia => dia.trim());

    // Objeto del Doctor
    const doctorData = {
        nombre,
        especialidad,
        diasDisponibles: diasArray
    };

    // Determinar si es CREAR (POST) o ACTUALIZAR (PUT)
    const isUpdating = doctorId !== '';
    const method = isUpdating ? 'PUT' : 'POST';
    const url = isUpdating ? `${ENDPOINT_DOCTORS}/${doctorId}` : ENDPOINT_DOCTORS;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(doctorData)
        });

        if (!response.ok) throw new Error('Error al guardar el médico.');

        alert(`Médico ${isUpdating ? 'actualizado' : 'creado'} con éxito.`);
        
        // Limpiar formulario y recargar lista
        document.getElementById('doctorForm').reset();
        document.getElementById('doctorId').value = ''; // Limpiar campo oculto
        loadDoctorsList(); // Recargar la lista

    } catch (error) {
        console.error('Error en el formulario de doctor:', error);
        alert('Ocurrió un error al guardar.');
    }
}