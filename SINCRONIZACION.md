# 🔄 Sincronización entre Dispositivos

## ¿Cómo funciona actualmente?

🔸 **Ahora mismo**: Los datos se guardan solo en tu dispositivo (localStorage)  
🔸 **Con sincronización**: Los datos se comparten entre todos tus dispositivos automáticamente

## Para habilitar sincronización:

### Opción 1: Rápida (Para desarrolladores)
Si sabes configurar Firebase:
1. Sigue las instrucciones en `FIREBASE_SETUP.md`
2. Cambia `false` por `true` en las líneas 698 y 701 de `src/App.tsx`

### Opción 2: Simple (Sin configuración)
La app funciona perfectamente sin sincronización. Los datos se guardan en cada dispositivo por separado.

### Opción 3: Alternativa fácil
Si quieres sincronización sin complicaciones, podrías usar:
- **Airtable**: Base de datos online gratuita y fácil
- **Google Sheets**: Con API gratuita
- **Supabase**: Firebase alternativo más simple

## ¿Qué datos se sincronizan?

✅ Checks/marcas de planes completados  
✅ Planes bonus que añadas  
❌ El estado "desbloqueado" (se resetea al recargar para evitar spoilers)

## Privacidad

🔒 Se genera un ID único automáticamente  
🔒 No se requiere registro ni login  
🔒 Solo se guardan las marcas de los planes
