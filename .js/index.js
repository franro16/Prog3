/**
 * Esto hace el archivo: Lógica de Login y Registro.
 * FUNCIONALIDAD:
 * - Permite ver formulario de Login o Registro.
 * - Login: Verifica credenciales segun la API, guarda sesión y redirige según rol (Admin/User).
 * - Registro: Verifica que el email no exista y crea el usuario nuevo en la API.
 */


// API donde están guardados los usuarios
const API_USUARIOS = "https://6915deb7465a9144626df544.mockapi.io/usuarios";

// Tomamos los formularios del HTML
const formularioLogin = document.getElementById("loginForm");
const formularioRegistro = document.getElementById("registroForm");


// BOTÓN: Pasar de Login → Registro
// Oculta el login y muestra el formulario de registro

document.getElementById("irARegistro").addEventListener("click", () => {
    formularioLogin.style.display = "none";
    formularioRegistro.style.display = "block";
});


// BOTÓN: Pasar de Registro → Login
// Vuelve a mostrar el login

document.getElementById("irALogin").addEventListener("click", () => {
    formularioRegistro.style.display = "none";
    formularioLogin.style.display = "block";
});


//PROCESO DE LOGIN
formularioLogin.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita recargar la página

    // Tomamos los datos que escribió el usuario
    const correo = document.getElementById("email").value.trim();
    const contrasena = document.getElementById("password").value.trim();

    // Traemos TODOS los usuarios de la API
    const respuesta = await fetch(API_USUARIOS);
    const listaUsuarios = await respuesta.json();

    // Buscamos si hay un usuario con ese email y esa contraseña
    const usuarioEncontrado = listaUsuarios.find(u => u.email === correo && u.password === contrasena);

    // Si no coincide, mostramos error
    if (!usuarioEncontrado) {
        alert("Email o contraseña incorrectos");
        return;
    }

    // Si existe, lo guardamos en sessionStorage (sesión actual)
    sessionStorage.setItem("usuario", JSON.stringify(usuarioEncontrado));

    // Redirigimos según el rol
    if (usuarioEncontrado.rol === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "user.html";
    }
});


//PROCESO DE REGISTRO
formularioRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Datos escritos por el usuario en el registro
    const nombre = document.getElementById("regNombre").value.trim();
    const correo = document.getElementById("regEmail").value.trim();
    const dni = document.getElementById("regDni").value.trim();
    const contrasena = document.getElementById("regPassword").value.trim();

    // Traemos todos los usuarios para verificar que no exista el email
    const respuesta = await fetch(API_USUARIOS);
    const listaUsuarios = await respuesta.json();

    // Revisamos si el email ya fue usado
    const existeUsuario = listaUsuarios.find(u => u.email === correo);

    if (existeUsuario) {
        alert("Ese correo ya está registrado");
        return;
    }

    // Creamos el nuevo usuario con rol por defecto "paciente"
    const nuevoUsuario = {
        nombre,
        email: correo,
        dni,
        password: contrasena,
        rol: "paciente"
    };

    // Enviamos el usuario nuevo a la API
    await fetch(API_USUARIOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario)
    });

    // Avisamos que se registró ok
    alert("Registro exitoso. Iniciá sesión.");

    // Volvemos a mostrar el login
    formularioRegistro.style.display = "none";
    formularioLogin.style.display = "block";
});
