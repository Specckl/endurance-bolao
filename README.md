# 🏆 Endurance Bolão - Copa do Mundo 2026

Aplicativo de bolão para a fase de grupos da Copa do Mundo 2026.

## 📁 Estrutura do Projeto

```
Endurance Bolao/
├── index.html              # Página principal
├── css/
│   └── style.css           # Estilos
├── js/
│   ├── app.js              # Lógica principal
│   ├── matches-data.js     # Dados dos 72 jogos
│   └── firebase-config.js  # Configuração do Firebase
└── README.md               # Este arquivo
```

## 🚀 Como Configurar (Custo ZERO)

### Passo 1: Criar Projeto no Firebase (Gratuito)

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Criar um projeto"**
3. Nome: `endurance-bolao` (ou outro de sua preferência)
4. Desative Google Analytics (não é necessário)
5. Clique em **"Criar projeto"**

### Passo 2: Ativar o Firestore Database

1. No painel lateral, vá em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Selecione **"Iniciar no modo de teste"**
4. Escolha a região mais próxima (ex: `southamerica-east1` para Brasil)
5. Clique em **"Ativar"**

### Passo 3: Registrar o App Web

1. Na página inicial do projeto, clique no ícone **"Web"** (`</>`)
2. Nome do app: `Endurance Bolao`
3. Marque **"Também configurar o Firebase Hosting"** (opcional)
4. Clique em **"Registrar app"**
5. **Copie as credenciais** (`firebaseConfig`) que aparecer
6. Cole no arquivo `js/firebase-config.js` substituindo os valores de exemplo

### Passo 4: Configurar Regras de Segurança do Firestore

1. Vá em **"Firestore Database"** > aba **"Regras"**
2. Substitua todo o conteúdo por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow create: if request.time < timestamp.date(2026, 6, 11);
      allow update: if request.time < timestamp.date(2026, 6, 11);
    }
    match /config/{docId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

3. Clique em **"Publicar"**

### Passo 5: Hospedar Gratuitamente (3 Opções)

#### Opção A: Firebase Hosting (Recomendado)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

#### Opção B: GitHub Pages (Mais Simples)
1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos
3. Vá em Settings > Pages > Branch: main
4. Seu site estará em `https://seuusuario.github.io/endurance-bolao/`

#### Opção C: Vercel / Netlify
1. Conecte seu repositório GitHub
2. Deploy automático e gratuito

## 📋 Funcionalidades

- ✅ **72 jogos** da fase de grupos (12 grupos × 6 jogos)
- ✅ **Classificação geral** dos participantes na tela principal
- ✅ **Código de acesso** de 6 caracteres gerado automaticamente
- ✅ **Prazo de envio** até 10/06/2026
- ✅ **Painel Admin** para inserir resultados reais
- ✅ **Cálculo automático** de pontuação

## ⚽ Sistema de Pontuação

| Situação | Pontos |
|----------|--------|
| Placar exato | **12 pts** |
| Acertou o vencedor + 1 total de gols | **6 pts** |
| Acertou o vencedor OU 1 total de gols | **3 pts** |
| Acertou apenas 2 totais de gols (sem vencedor) | **6 pts** |
| Errou tudo | **0 pts** |

### Exemplos (Resultado real: Brasil 3 × 0 Canadá)

| Palpite | Pontos | Motivo |
|---------|--------|--------|
| 3 × 0 | 12 | Placar exato |
| 2 × 0 | 6 | Acertou vencedor (3) + gols do Canadá=0 (3) |
| 2 × 1 | 3 | Acertou apenas o vencedor |
| 0 × 0 | 3 | Acertou gols do Canadá=0 |
| 1 × 1 | 0 | Errou tudo |
| 3 × 3 | 3 | Acertou gols do Brasil=3 |
| 3 × 4 | 3 | Acertou gols do Brasil=3 |

## 🔐 Painel Admin

- Acesse pela aba **"⚙️ Admin"**
- Senha padrão: `endurance2026` (altere no arquivo `js/app.js`)
- Insira os resultados reais conforme os jogos acontecem
- A pontuação é recalculada automaticamente para todos os participantes

## 💰 Custos

| Serviço | Plano | Limite Gratuito |
|---------|-------|-----------------|
| Firebase Firestore | Spark (gratuito) | 1 GiB storage, 50K leituras/dia |
| Firebase Hosting | Spark (gratuito) | 10 GB transferência/mês |
| GitHub Pages | Gratuito | Ilimitado para sites estáticos |

Para um bolão com até ~500 participantes, o plano gratuito é mais que suficiente.

## ⚠️ Observações

- A senha do admin deve ser alterada em `js/app.js` (variável `ADMIN_PASSWORD`)
- Os dados dos jogos já estão preenchidos com o calendário oficial da FIFA
- O app funciona 100% no navegador (desktop e celular)
