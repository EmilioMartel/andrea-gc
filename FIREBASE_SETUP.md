# Configuración de Firebase para Sincronización

Para habilitar la sincronización entre dispositivos, necesitas configurar Firebase. Aquí te explico paso a paso:

## 1. Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz click en "Agregar proyecto"
3. Nombra tu proyecto (ej: "mision-diversion")
4. Deja las opciones por defecto y crea el proyecto

## 2. Configurar Firestore

1. En el menú lateral, ve a "Firestore Database"
2. Haz click en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba" (permite lectura/escritura por 30 días)
4. Elige una ubicación cercana (ej: europe-west3)

## 3. Obtener configuración

1. Ve a "Configuración del proyecto" (ícono de engranaje)
2. En la pestaña "General", baja hasta "Tus aplicaciones"
3. Haz click en el ícono de web "</>"
4. Registra tu app con un nombre (ej: "mision-diversion-web")
5. NO marques "Firebase Hosting"
6. Copia la configuración que aparece

## 4. Configurar en tu código

Reemplaza los valores en `src/firebase.ts` con tu configuración:

```typescript
const firebaseConfig = {
  apiKey: "tu-api-key-real",
  authDomain: "tu-proyecto-real.firebaseapp.com",
  projectId: "tu-proyecto-id-real",
  storageBucket: "tu-proyecto-real.appspot.com",
  messagingSenderId: "tu-numero-real",
  appId: "tu-app-id-real"
};
```

## 5. Reglas de seguridad (opcional pero recomendado)

Para mayor seguridad, ve a Firestore > Reglas y reemplaza con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura solo a documentos userData
    match /userData/{userId} {
      allow read, write: if true;
    }
  }
}
```

## Características de la sincronización

✅ **Funcionamiento offline**: Si no hay internet, usa localStorage  
✅ **Sincronización automática**: Se actualiza en tiempo real entre dispositivos  
✅ **Sin autenticación**: Usa un ID único generado automáticamente  
✅ **Gratuito**: Firebase tiene un plan gratuito muy generoso  

## ¿Qué pasa si no configuro Firebase?

La app seguirá funcionando perfectamente usando localStorage, pero los datos no se sincronizarán entre dispositivos.
