💉 Sistema de Turnos Médicos
🎯 Objetivo

Desarrollar un sistema web que permita la administración de usuarios y perfiles, la gestión de reservas de turnos médicos, un ABM de datos de dominio y un dashboard informativo.

👥 Roles de Usuario

ADMIN: puede crear usuarios, cambiar contraseñas, gestionar médicos, pacientes y turnos.

USUARIO (Paciente): puede registrarse, iniciar sesión, ver su perfil y solicitar o cancelar turnos.

🧩 Tecnologías utilizadas

HTML5

CSS3

JavaScript (Vanilla)

MockAPI (para simular el backend)

(Opcional) Frameworks CSS como Bootstrap

🗂️ Estructura del Proyecto

/ (raíz)

│── index.html

│── .css/

│     └── estilos.css

│── .js/

│     └── app.js

│── README.md

🧠 Funcionalidades principales

Formulario de login y registro con validación.

Panel ADMIN con listado y gestión de médicos, pacientes y turnos.

Panel USUARIO para reservar y cancelar turnos.

Control de roles y menús según permisos.

Dashboard con gráficos sobre el estado de los turnos (confirmados, pendientes, cancelados).

🧾 Entidades MockAPI

usuarios: { id, nombre, email, password, rol }

doctores: { id, nombre, especialidad, diasDisponibles }

turnos: { id, pacienteId, doctorId, fecha, hora, estado }

🔒 Seguridad

Validación de roles.

Control de acceso al contenido según tipo de usuario.

Manejo correcto de sesiones (login/logout).

🧑‍💻 Criterios de evaluación

Maquetación: uso correcto de etiquetas HTML y estructura clara.

Estilos: CSS prolijo, diseño responsivo (flex, grid).

JavaScript: uso de eventos, asincronismo, funciones flecha, objetos y arrays.

Manipulación del DOM: lectura y escritura correcta.

Seguridad: control de roles y permisos.

🌐 API utilizada

👉 mockapi.io
