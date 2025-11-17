const API = "https://6915deb7465a9144626df544.mockapi.io/usuarios";

const loginForm = document.getElementById("loginForm");
const registroForm = document.getElementById("registroForm");

document.getElementById("irARegistro").addEventListener("click", () => {
    loginForm.style.display = "none";
    registroForm.style.display = "block";
});

document.getElementById("irALogin").addEventListener("click", () => {
    registroForm.style.display = "none";
    loginForm.style.display = "block";
});

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const res = await fetch(API);
    const usuarios = await res.json();

    const encontrado = usuarios.find(u => u.email === email && u.password === password);

    if (!encontrado) {
        alert("Email o contraseña incorrectos");
        return;
    }

    sessionStorage.setItem("usuario", JSON.stringify(encontrado));

    if (encontrado.rol === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "user.html";
    }
});

registroForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("regNombre").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const dni = document.getElementById("regDni").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    const res = await fetch(API);
    const usuarios = await res.json();

    const existe = usuarios.find(u => u.email === email);

    if (existe) {
        alert("Ese correo ya está registrado");
        return;
    }

    const nuevo = {
        nombre,
        email,
        dni,
        password,
        rol: "paciente"
    };

    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo)
    });

    alert("Registro exitoso. Iniciá sesión.");

    registroForm.style.display = "none";
    loginForm.style.display = "block";
});