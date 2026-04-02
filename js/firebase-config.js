// ============================================================
// Configuração do Firebase
// ============================================================
// INSTRUÇÕES: Substitua os valores abaixo pelos do seu projeto Firebase.
// 
// 1. Acesse https://console.firebase.google.com/
// 2. Crie um novo projeto (nome sugerido: "endurance-bolao")
// 3. Vá em "Configurações do Projeto" > "Seus apps" > Adicione um app Web
// 4. Copie as credenciais e cole abaixo
// 5. Ative o Firestore Database no modo "Teste" (ou configure as regras abaixo)
//
// REGRAS DE SEGURANÇA DO FIRESTORE (cole na aba "Regras" do Firestore):
// 
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /users/{userId} {
//       allow read: if true;
//       allow create: if request.time < timestamp.date(2026, 6, 11);
//       allow update: if request.time < timestamp.date(2026, 6, 11);
//     }
//     match /config/{docId} {
//       allow read: if true;
//       allow write: if true;
//     }
//   }
// }
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyA4UjNlQd3ElqksHFKOX877Wa1943RBcak",
    authDomain: "endurance-bolao.firebaseapp.com",
    projectId: "endurance-bolao",
    storageBucket: "endurance-bolao.firebasestorage.app",
    messagingSenderId: "935558417264",
    appId: "1:935558417264:web:9e33d5675f174a1b481db5"
};

firebase.initializeApp(firebaseConfig);
