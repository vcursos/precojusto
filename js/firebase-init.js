// js/firebase-init.js (CÓDIGO CORRIGIDO E ATUALIZADO)

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
// ADICIONADO: signInWithEmailAndPassword para a função de login
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, doc, addDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Habilita o log de depuração para ajudar a diagnosticar problemas
setLogLevel('debug');

// Usando a configuração direta para garantir a conexão
const firebaseConfig = {
    apiKey: "AIzaSyAf9fJHKPYrpTskpeglXDcS3sSgKrL4CXQ",
    authDomain: "precomercado-23f20.firebaseapp.com",
    databaseURL: "https://precomercado-23f20-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "precomercado-23f20",
    storageBucket: "precomercado-23f20.appspot.com", // O padrão correto é .appspot.com
    messagingSenderId: "899496513372",
    appId: "1:899496513372:web:7ef9a274652bc4a8d07b99",
    measurementId: "G-NRTEC32Z42"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
// Exporta as instâncias principais para serem usadas em outros ficheiros
export const db = getFirestore(app);
export const auth = getAuth(app);

// A autenticação anônima pode ser mantida para o site público, mas evite no admin
try {
    const isAdminPage = typeof window !== 'undefined' && /(^|\/)admin\.html(\?|#|$)/i.test(window.location.pathname || '');
    if (!isAdminPage) {
        signInAnonymously(auth).catch((error) => {
            console.error("Erro na autenticação anônima:", error);
        });
    }
} catch (e) {
    // Ambiente sem window (tests/build) — ignore
}

// Exporta as funções do Firebase para serem usadas em outros módulos
export {
    onAuthStateChanged,
    signInWithEmailAndPassword, // <-- ESSENCIAL PARA O LOGIN
    signOut,
    collection,
    onSnapshot,
    doc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs
};