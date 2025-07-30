# 🔧 Configuración de Notificaciones Push

## ⚠️ **Importante: Configuración Requerida**

Para que las notificaciones push funcionen correctamente, necesitas configurar el `projectId` de EAS.

## 📋 **Pasos para Configurar:**

### **1. Crear un proyecto en EAS:**

```bash
# Instalar EAS CLI si no lo tienes
npm install -g @expo/eas-cli

# Iniciar sesión en Expo
eas login

# Inicializar EAS en tu proyecto
eas init
```

### **2. Obtener el Project ID:**

Después de ejecutar `eas init`, se creará un archivo `app.json` con el projectId real.

### **3. Actualizar app.json:**

Reemplaza `"your-project-id-here"` en `app.json` con tu projectId real:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "tu-project-id-real-aqui"
      }
    }
  }
}
```

## 🔄 **Funcionamiento Actual:**

### **✅ Notificaciones Locales (Funcionan sin projectId):**
- Notificaciones de prueba
- Notificaciones cuando la app está abierta
- Fallback automático cuando no hay projectId

### **❌ Notificaciones Push (Requieren projectId):**
- Notificaciones cuando la app está cerrada
- Notificaciones push remotas
- Requieren configuración de EAS

## 🧪 **Probar Notificaciones:**

### **1. Notificaciones Locales (Siempre funcionan):**
1. Ve a tu perfil
2. Toca "Probar notificación"
3. Deberías recibir una notificación inmediatamente

### **2. Notificaciones Push (Requieren projectId):**
1. Configura el projectId como se indica arriba
2. Crea un bridge privado para otro usuario
3. El otro usuario debería recibir una notificación push

## 🔍 **Logs de Debugging:**

El sistema mostrará estos logs:

- `⚠️ ProjectId no configurado, usando notificaciones locales únicamente`
- `🔔 Token de notificación obtenido: [token]`
- `✅ Notificación push enviada a usuario: [userId]`
- `⚠️ No se encontró token para el usuario: [userId] - usando notificación local`

## 🚀 **Próximos Pasos:**

1. **Configurar EAS** siguiendo los pasos arriba
2. **Probar notificaciones locales** (ya funcionan)
3. **Configurar projectId** para notificaciones push
4. **Probar notificaciones push** entre usuarios

## 📞 **Soporte:**

Si tienes problemas:
1. Verifica que el projectId esté correcto en `app.json`
2. Revisa los logs en la consola
3. Prueba primero las notificaciones locales
4. Asegúrate de estar usando un dispositivo físico (no simulador) 