# Guia de Configuração do Firebase

Este guia mostra como configurar o Firebase para o projeto Fichas de Nimb.

## 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Criar projeto"** ou **"Add project"**
3. Nome do projeto: `fichas-de-nimb` (ou outro de sua preferência)
4. **Desabilite** o Google Analytics (não necessário para este projeto)
5. Clique em **"Criar projeto"**

## 2. Configurar Authentication

1. No menu lateral, vá em **"Authentication"**
2. Clique em **"Get started"**
3. Na aba **"Sign-in method"**:
   - Clique em **"Email/Password"**
   - Habilite **"Email/Password"** (primeiro toggle)
   - **NÃO** habilite "Email link" (segundo toggle)
   - Clique em **"Save"**

## 3. Obter Credenciais do Frontend

1. Na página inicial do projeto, clique no ícone **Web** (</>)
2. Registre o app:
   - Nome do app: `Fichas de Nimb Web`
   - **NÃO** marque "Firebase Hosting"
   - Clique em **"Register app"**
3. Copie as configurações que aparecem:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

4. Cole essas informações no arquivo `.env` do **frontend**:

```env
# Frontend: /.env
VITE_FIREBASE_API_KEY=cole-aqui-apiKey
VITE_FIREBASE_AUTH_DOMAIN=cole-aqui-authDomain
VITE_FIREBASE_PROJECT_ID=cole-aqui-projectId
VITE_FIREBASE_STORAGE_BUCKET=cole-aqui-storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=cole-aqui-messagingSenderId
VITE_FIREBASE_APP_ID=cole-aqui-appId

# Backend API
VITE_API_URL=http://localhost:3001
```

## 4. Obter Credenciais do Backend (Service Account)

1. No Firebase Console, clique na **engrenagem** ⚙️ ao lado de "Project Overview"
2. Selecione **"Project settings"**
3. Vá para a aba **"Service accounts"**
4. Clique em **"Generate new private key"**
5. Clique em **"Generate key"**
6. Um arquivo JSON será baixado

### Opção A: Usar variáveis separadas (Recomendado para desenvolvimento)

Abra o arquivo JSON baixado e copie os valores para o `.env` do **backend**:

```env
# Backend: /backend/.env
MONGODB_URI=mongodb://localhost:27017/fichas-de-nimb
PORT=3001

# Firebase Admin SDK
FIREBASE_PROJECT_ID=cole-aqui-project_id-do-json
FIREBASE_CLIENT_EMAIL=cole-aqui-client_email-do-json
FIREBASE_PRIVATE_KEY="cole-aqui-private_key-do-json-com-aspas"
```

⚠️ **IMPORTANTE**: A `FIREBASE_PRIVATE_KEY` deve:
- Estar entre aspas duplas
- Manter os `\n` (não converter para quebras de linha reais)
- Exemplo: `"-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"`

### Opção B: Usar o JSON completo (Para produção)

Cole o conteúdo completo do JSON como uma string no `.env`:

```env
# Backend: /backend/.env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...todo-o-json..."}'
```

## 5. Configurar MongoDB Local

### Com Docker (Recomendado):

```bash
# Rodar MongoDB
docker run -d -p 27017:27017 --name mongodb-fichas mongo

# Para parar
docker stop mongodb-fichas

# Para iniciar novamente
docker start mongodb-fichas
```

### Sem Docker:

1. [Instale MongoDB Community Edition](https://www.mongodb.com/docs/manual/installation/)
2. Inicie o serviço MongoDB:
   - Windows: Já inicia automaticamente
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

## 6. Testar a Aplicação

### Terminal 1 - Backend:

```bash
cd backend
npm install  # Se ainda não instalou
npm run dev
```

Você deve ver:
```
🚀 Server is running on http://localhost:3001
📝 API Documentation: http://localhost:3001/
🔥 Firebase Admin initialized
✅ Connected to MongoDB
```

### Terminal 2 - Frontend:

```bash
# Na raiz do projeto
npm install  # Se ainda não instalou
npm start
```

Acesse: http://localhost:5173

## 7. Testar Autenticação

1. Clique em **"Entrar"** no header
2. Clique em **"Cadastre-se"**
3. Crie uma conta com email e senha
4. Após cadastro, você será logado automaticamente
5. Verifique no menu de usuário (avatar no header)
6. Teste o logout

## 8. Verificar no Firebase Console

1. Vá em **Authentication > Users**
2. Você deve ver o usuário criado
3. No MongoDB, verifique se o usuário foi sincronizado:

```bash
# Com MongoDB Compass ou mongosh
mongosh
use fichas-de-nimb
db.users.find()
```

## Troubleshooting

### Erro: "Firebase Admin initialization error"

- Verifique se as credenciais do Service Account estão corretas no `.env` do backend
- A `FIREBASE_PRIVATE_KEY` deve estar com aspas e `\n` preservados

### Erro: "Failed to sync user with backend"

- Verifique se o backend está rodando (http://localhost:3001)
- Verifique se o MongoDB está rodando
- Confira o `VITE_API_URL` no `.env` do frontend

### Erro: "auth/invalid-api-key"

- Verifique se copiou corretamente a `apiKey` para o `.env` do frontend
- Certifique-se de usar `VITE_` como prefixo das variáveis

### Erro CORS

- O backend já está configurado para aceitar `localhost:5173`
- Se mudou a porta do frontend, atualize em `backend/src/index.ts`

## Segurança

⚠️ **NUNCA commite arquivos `.env` ou credenciais!**

Os arquivos `.env` já estão no `.gitignore`, mas sempre verifique:

```bash
git status  # Não deve mostrar .env
```

## Ambientes

### Desenvolvimento
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- MongoDB: mongodb://localhost:27017

### Produção
- Frontend: https://yurialessandro.github.io/gerador-ficha-tormenta20/
- Backend: Será necessário fazer deploy (Heroku, Railway, etc.)
- MongoDB: Use MongoDB Atlas (cloud)

---

## Resumo dos Arquivos de Configuração

```
projeto/
├── .env                    # Frontend - Credenciais Firebase App
├── .env.example            # Template para .env
└── backend/
    ├── .env                # Backend - Service Account Firebase
    └── .env.example        # Template para .env
```

## Links Úteis

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth/web/start)
- [MongoDB Installation](https://www.mongodb.com/docs/manual/installation/)
- [MongoDB Compass](https://www.mongodb.com/products/compass) (GUI para MongoDB)