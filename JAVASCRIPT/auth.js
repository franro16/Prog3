/* =======================================================
 * ARCHIVO: auth.js (Global)
 * Este archivo debe cargarse en TODAS las páginas HTML.
 * Contiene las URLS de la API y las funciones de autenticación.
 * ======================================================= */

// --- 1. CONSTANTES (URLs Reales del Proyecto) ---

// URL para usuarios y médicos
const API_BASE_AUTH = 'https://691262ad52a60f10c8217e55.mockapi.io/api/v1'; 

// URL para turnos (SIN /:endpoint)
const API_BASE_APPOINTMENTS = 'https://691266e052a60f10c8218cd5.mockapi.io/api/v1';

// Endpoints (El resto del código usará esto)
const ENDPOINT_USERS = `${API_BASE_AUTH}/usuario`;
const ENDPOINT_DOCTORS = `${API_BASE_AUTH}/medicos`;
const ENDPOINT_APPOINTMENTS = `${API_BASE_APPOINTMENTS}/turnos`; // Asegúrate que tu recurso se llame 'turnos'


// --- 2. FUNCIONES GLOBALES DE AUTENTICACIÓN ---

/**
 * Cierra la sesión del usuario borrando sus datos del localStorage
 * y redirigiendo al login.
 */
function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html'; // Asegúrate que tu login se llame 'login.html'
}

/**
 * Verifica si el usuario tiene sesión activa y el rol requerido
 * para acceder a una página.
 * @param {string} requiredRole - El rol requerido ('ADMIN' o 'USUARIO').
 * @returns {object} El objeto del usuario si la validación es exitosa.
 */
function checkAuthAndRole(requiredRole) {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    // 1. Si no hay usuario en localStorage, redirige a login
    if (!user) {
        alert('Acceso denegado. Por favor, inicie sesión.');
        window.location.href = 'login.html';
        return null;
    }

    // 2. Si la página requiere un rol y el usuario no lo tiene
    if (requiredRole && user.role !== requiredRole) {
        alert('No tiene permisos para acceder a esta página.');
        
        // Redirige al dashboard correcto
        const targetDashboard = user.role === 'ADMIN' ? 'admin.html' : 'user.html';
        window.location.href = targetDashboard;
        return null;
    }

    // 3. Si todo está bien, devuelve el usuario
    return user;
}

/**
 * Obtiene el usuario actual del localStorage.
 * Es un atajo útil.
 */
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}