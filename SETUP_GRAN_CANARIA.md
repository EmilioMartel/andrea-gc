# Configuración de Firebase para "Conocer Gran Canaria"

## 🔥 Crear nuevo proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto" (o "Add project")
3. Nombre del proyecto: **conocer-gran-canaria**
4. Desactiva Google Analytics (no es necesario para este proyecto)
5. Haz clic en "Crear proyecto"

## 📱 Registrar aplicación web

1. En la página principal de tu proyecto, haz clic en el ícono Web `</>`
2. Registra la app con el nombre: **Conocer Gran Canaria Web**
3. NO marques "Set up Firebase Hosting"
4. Haz clic en "Registrar app"
5. **IMPORTANTE**: Copia la configuración `firebaseConfig` que aparece

## 🗄️ Crear base de datos Firestore

1. En el menú lateral, ve a **Build → Firestore Database**
2. Haz clic en "Crear base de datos"
3. Selecciona **"Empezar en modo de prueba"** (test mode)
4. Elige la región: **europe-west1** (Belgium) - la más cercana a Canarias
5. Haz clic en "Habilitar"

## 🔐 Configurar reglas de seguridad

En la pestaña "Reglas", reemplaza las reglas existentes con:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura en la colección shared_data
    match /shared_data/{document=**} {
      allow read, write: if true;
    }
  }
}
```

Haz clic en "Publicar" para guardar las reglas.

## 📝 Actualizar configuración en el proyecto

1. Copia la configuración de Firebase que obtuviste en el paso "Registrar aplicación web"
2. Abre el archivo `src/firebase.ts`
3. Reemplaza el objeto `firebaseConfig` con tu nueva configuración

Ejemplo de lo que deberías copiar:
```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "conocer-gran-canaria.firebaseapp.com",
  projectId: "conocer-gran-canaria",
  storageBucket: "conocer-gran-canaria.firebasestorage.app",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};
```

## ✅ Verificar que funciona

1. Ejecuta `pnpm dev` para iniciar el servidor de desarrollo
2. Abre la aplicación en tu navegador
3. Marca algunas actividades en el checklist
4. Abre la aplicación en otro navegador o dispositivo
5. Verifica que las marcas se sincronizan automáticamente

## 🌐 Desplegar en Vercel (opcional)

Si quieres compartir la web:

1. Ve a [Vercel](https://vercel.com)
2. Importa el repositorio desde GitHub
3. Configura el proyecto:
   - Framework Preset: **Vite**
   - Build Command: `pnpm build`
   - Output Directory: `dist`
4. Despliega

---

**Nota importante**: Mantén tu configuración de Firebase privada. No la subas a GitHub si tu repositorio es público.
