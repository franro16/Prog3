// /* =======================================================
//  * ARCHIVO: user.js
//  * Lógica para la página 'user.html'.
//  * ======================================================= */

// // 1. Verificar Autenticación y Rol
// const currentUser = checkAuthAndRole('USUARIO');

// document.addEventListener('DOMContentLoaded', () => {
//     if (!currentUser) return; // Si el chequeo falló, no ejecutar nada más

//     // 2. Personalizar bienvenida
//     document.getElementById('welcomeName').textContent = `Bienvenido/a, ${currentUser.nombre}`;

//     // 3. Asignar evento al botón de cerrar sesión
//     document.getElementById('logoutBtn').addEventListener('click', logoutUser);

//     // 4. Cargar doctores en el <select>
//     loadDoctorsDropdown();

//     // 5. Asignar evento al formulario de reserva
//     document.getElementById('reserveForm').addEventListener('submit', handleReservationSubmit);
// });


// /**
//  * Carga la lista de médicos en el <select> del formulario.
//  */
// async function loadDoctorsDropdown() {
//     const selectElement = document.getElementById('selectDoctor');
//     selectElement.innerHTML = '<option value="">Cargando médicos...</option>';

//     try {
//         const response = await fetch(ENDPOINT_DOCTORS);
//         if (!response.ok) throw new Error('No se pudieron cargar los médicos.');
        
//         const doctors = await response.json();
        
//         selectElement.innerHTML = '<option value="">-- Seleccione un médico --</option>'; // Opción default

//         doctors.forEach(doctor => {
//             const option = document.createElement('option');
//             option.value = doctor.id; // Guardamos el ID del médico
//             option.textContent = `${doctor.nombre} (${doctor.especialidad})`;
//             selectElement.appendChild(option);
//         });

//     } catch (error) {
//         selectElement.innerHTML = `<option value="">Error al cargar</option>`;
//         console.error('Error cargando doctores:', error);
//     }
// }


// /**
//  * Maneja el envío del formulario de reserva de turno.
//  */
// async function handleReservationSubmit(event) {
//     event.preventDefault();

//     // Obtener datos del formulario
//     const doctorId = document.getElementById('selectDoctor').value;
//     const fecha = document.getElementById('date').value;
//     const hora = document.getElementById('time').value;

//     // Obtener el ID del paciente (el usuario logueado)
//     const patientId = currentUser.id;

//     if (!doctorId || !fecha || !hora) {
//         alert('Por favor, complete todos los campos.');
//         return;
//     }

//     // Objeto del Turno
//     const appointmentData = {
//         patientId, // ID del usuario actual
//         doctorId,  // ID del médico seleccionado
//         fecha,
//         hora,
//         estado: 'Pendiente' // Estado inicial
//     };

//     try {
//         // Usamos el endpoint del Proyecto B
//         const response = await fetch(ENDPOINT_APPOINTMENTS, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(appointmentData)
//         });

//         if (!response.ok) throw new Error('No se pudo agendar el turno.');

//         alert('¡Turno solicitado con éxito! Queda pendiente de confirmación.');
//         document.getElementById('reserveForm').reset();
        
//         // (Aquí se podría recargar una lista de "Mis Turnos")

//     } catch (error) {
//         console.error('Error al reservar turno:', error);
//         alert('Ocurrió un error al intentar reservar.');
//     }
// }