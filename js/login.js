// js/login.js (COLE ESTE CÓDIGO)
import { auth, signInWithEmailAndPassword } from './firebase-init.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('login-error');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            errorMessage.textContent = 'Por favor, preencha o email e a senha.';
            errorMessage.style.display = 'block';
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login bem-sucedido! Redirecionando...");
            localStorage.setItem('isAuthenticated', 'true');
            window.location.href = 'admin.html';
        } catch (error) {
            console.error("Erro de Login no Firebase:", error.code, error.message);
            alert("Erro: " + error.message);
            errorMessage.textContent = 'Email ou senha incorretos. Tente novamente.';
            errorMessage.style.display = 'block';
        }
    });
});