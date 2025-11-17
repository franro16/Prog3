// /* =======================================================
//  * ARCHIVO: login.js
//  * Lógica para la página 'login.html'.
//  * ======================================================= */

// // Esperar a que el DOM esté cargado
// document.addEventListener('DOMContentLoaded', () => {
    
//     // 1. Asignar evento al formulario de login
//     const loginForm = document.getElementById('loginForm');
    
//     loginForm.addEventListener('submit', async (event) => {
//         event.preventDefault(); // Evitar que el formulario se envíe

//         const email = document.getElementById('email').value;
//         const password = document.getElementById('password').value;

//         await loginUser(email, password);
//     });
// });


// /**
//  * Función principal de Login
//  */
// async function loginUser(email, password) {
//     try {
//         // 1. Buscar al usuario por email
//         // Usamos el filtro de MockAPI: ?email=valor
//         const response = await fetch(`${ENDPOINT_USERS}?email=${email}`);
        
//         if (!response.ok) {
//             throw new Error('Error en la conexión con la API.');
//         }

//         const users = await response.json(); // MockAPI devuelve un array

//         // 2. Validar si el usuario existe
//         if (users.length === 0) {
//             alert('Usuario o contraseña incorrectos.');
//             return;
//         }

//         const user = users[0]; // El usuario encontrado

//         // 3. Validar la contraseña (simulación, MockAPI no encripta)
//         if (user.password === password) {
            
//             // 4. ¡ÉXITO! Guardar datos en localStorage
//             const userData = {
//                 id: user.id,
//                 nombre: user.nombre,
//                 role: user.role
//             };
//             localStorage.setItem('currentUser', JSON.stringify(userData));
            
//             // 5. Redirigir según el rol
//             if (user.role === 'ADMIN') {
//                 window.location.href = 'admin.html'; // Asegúrate que se llame 'admin.html'
//             } else {
//                 window.location.href = 'user.html'; // Asegúrate que se llame 'user.html'
//             }
            
//         } else {
//             alert('Usuario o contraseña incorrectos.');
//         }

//     } catch (error) {
//         console.error('Error en el login:', error);
//         alert('Ocurrió un error inesperado.');
//     }
// }
// Usamos el mismo endpoint
const ENDPOINT_USUARIOS = "https://6915deb7465a9144626df544.mockapi.io/usuarios";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // 1. Obtenemos valores
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Por favor, ingresa email y contraseña.");
            return;
        }

        try {
            // 2. Obtenemos TODOS los usuarios de MockAPI
            const respuesta = await fetch(ENDPOINT_USUARIOS);
            if (!respuesta.ok) throw new Error("Error al conectar con el servidor.");
            
            const usuarios = await respuesta.json();

            // 3. Buscamos al usuario que coincida en email Y contraseña
            const usuarioEncontrado = usuarios.find(user => 
                user.email === email && user.password === password
            );

            if (usuarioEncontrado) {
                // 4. ¡Éxito! Guardamos al usuario en sessionStorage
                // Usamos JSON.stringify para guardar el objeto completo
                sessionStorage.setItem("usuarioLogueado", JSON.stringify(usuarioEncontrado));
                
                // 5. Redirigimos al panel de usuario
                window.location.href = "user.html";
            } else {
                // 4. Fracaso
                alert("Email o contraseña incorrectos.");
            }

        } catch (error) {
            console.error("Error en el login:", error);
            alert(`Error: ${error.message}`);
        }
    });
});