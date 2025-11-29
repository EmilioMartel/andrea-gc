# 🎉 Resumen de Cambios - Conocer Gran Canaria

## ✅ Cambios Completados

### 1. **Contenido actualizado** 
- ✨ Título cambiado: "Operación: Planazos Épicos" → "Conocer Gran Canaria 🌴"
- 🗓️ Plan adaptado: De 2 meses a **1 mes (4 semanas)**
- 🏝️ **Nuevas actividades** enfocadas en turismo en Gran Canaria:
  - Semana 1: Bienvenida a la isla (Las Canteras, Vegueta, Triana)
  - Semana 2: Norte de la isla (Teror, Agaete, Jardín Botánico)
  - Semana 3: Montañas y vistas (Roque Nublo, Tejeda, Artenara)
  - Semana 4: Sur y despedida (Maspalomas, Mogán, playas secretas)

### 2. **Actividades Bonus actualizadas**
Ahora incluyen atracciones turísticas de Gran Canaria:
- Cueva Pintada de Gáldar
- Cenobios de Valerón
- Museo Casa de Colón
- Acuario Poema del Mar
- Barranco de Guayadeque
- Bodegas y vinos canarios
- Y más...

### 3. **Nuevo sistema de contraseña**
- 🔐 Contraseña: `plátano`
- 💡 Pista: "¿Qué fruta tropical amarilla es famosa en Canarias?"

### 4. **Textos adaptados**
- Preguntas del scroll storytelling actualizadas
- Mensajes de bienvenida y footer personalizados
- Descripciones enfocadas en experiencia turística

### 5. **Configuración del proyecto**
- ✏️ Nombre del paquete: `mision-diversion` → `conocer-gran-canaria`
- 🏷️ Título HTML: "Adri 💖" → "Conocer Gran Canaria 🌴"
- 📚 README actualizado con documentación completa

## 🚀 Próximos Pasos

### IMPORTANTE: Configurar Firebase

**La aplicación actual todavía usa la base de datos antigua.** Para tener una base de datos nueva y separada:

1. **Crea un nuevo proyecto de Firebase:**
   - Sigue las instrucciones en `SETUP_GRAN_CANARIA.md`
   - Nombre sugerido: `conocer-gran-canaria`

2. **Actualiza la configuración:**
   - Archivo: `src/firebase.ts`
   - Reemplaza `firebaseConfig` con tu nueva configuración

3. **Configura Firestore:**
   - Crea la base de datos en modo de prueba
   - Configura las reglas de seguridad (ver `SETUP_GRAN_CANARIA.md`)

### Opcional: Desplegue

Si quieres compartir la web con tu compañera:

1. **GitHub**: Sube el código a un repositorio
2. **Vercel**: Despliega gratis en [vercel.com](https://vercel.com)
3. **Comparte el link**: Ella podrá acceder desde su móvil

## 🎨 Personalización adicional

Si quieres personalizar más:

### Cambiar colores
Edita en `src/App.tsx` las clases de Tailwind:
- `from-indigo-600` → Cambia el color principal
- `from-amber-50` → Cambia el color de fondo

### Añadir/quitar actividades
Edita el array `PLAN_DATA` en `src/App.tsx`

### Cambiar el acertijo
Modifica en `src/App.tsx`:
```typescript
const PASSWORD_HINT = "Tu pista aquí";
const PASSWORD_PHRASE = "tu-contraseña";
```

## 📱 Cómo usar

1. **Desarrollo local:**
   ```bash
   pnpm dev
   ```
   Abre http://localhost:5174

2. **Compartir:**
   - Opción 1: Despliega en Vercel y comparte el link
   - Opción 2: Tu compañera accede a tu IP local (mismo WiFi)

## ❓ Preguntas Frecuentes

**¿Se sincronizan los cambios entre dispositivos?**
Sí, una vez configures Firebase, todos los checkmarks se sincronizan en tiempo real.

**¿Puedo usar esto sin Firebase?**
Sí, los datos se guardarán solo en localStorage (no se sincronizarán entre dispositivos).

**¿Cómo añado más actividades?**
Edita el array `PLAN_DATA` en `src/App.tsx` o usa el botón "Añadir" en la sección Bonus.

---

🎊 **¡Listo para que tu compañera descubra Gran Canaria!** 🏝️
