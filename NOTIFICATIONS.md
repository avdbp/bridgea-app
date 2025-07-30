# 🔔 Sistema de Notificaciones Push - Bridgea

## 📋 **Descripción General**

El sistema de notificaciones push permite a los usuarios recibir alertas cuando otros usuarios les envían bridges privados. Utiliza Expo Notifications con Firebase Cloud Messaging para enviar notificaciones tanto locales como push.

## 🏗️ **Arquitectura del Sistema**

### **Componentes Principales:**

1. **`services/notificationService.ts`** - Servicio principal para manejar notificaciones
2. **`hooks/useNotifications.ts`** - Hook personalizado para configurar listeners
3. **`components/NotificationStatus.tsx`** - Componente UI para mostrar estado de notificaciones
4. **Configuración en `app.json`** - Configuración de Expo Notifications

## 🔧 **Funcionalidades Implementadas**

### **✅ Notificaciones Automáticas**
- **Registro de usuarios:** Se solicitan permisos y se guarda el token automáticamente
- **Login de usuarios:** Se actualiza el token de notificación al iniciar sesión
- **Creación de bridges privados:** Se envían notificaciones automáticamente a los destinatarios

### **✅ Gestión de Permisos**
- Solicitud automática de permisos al registrar/iniciar sesión
- Verificación del estado de permisos
- Interfaz para activar notificaciones manualmente

### **✅ Notificaciones Push**
- Envío de notificaciones push a usuarios específicos
- Notificaciones locales para pruebas
- Manejo de badges (contador de notificaciones)

### **✅ Navegación Inteligente**
- Al tocar una notificación de bridge recibido, se navega automáticamente a la pantalla de bridges
- Limpieza automática del badge al abrir la app

## 📱 **Tipos de Notificaciones**

### **1. Bridge Privado Recibido**
```
Título: 🔒 Bridge privado de [Nombre del remitente]
Cuerpo: "[Título del bridge]" - Toca para ver el bridge
```

### **2. Bridge Público Recibido**
```
Título: 🌍 Bridge público de [Nombre del remitente]
Cuerpo: "[Título del bridge]" - Toca para ver el bridge
```

### **3. Notificación de Prueba**
```
Título: 🔔 Notificación de prueba
Cuerpo: ¡Las notificaciones están funcionando correctamente!
```

## 🗄️ **Estructura de Datos en Firestore**

### **Colección: `notificationTokens`**
```typescript
interface NotificationToken {
  userId: string;           // ID del usuario
  token: string;           // Token de notificación de Expo
  platform: 'ios' | 'android' | 'web';  // Plataforma del dispositivo
  createdAt: Date;         // Fecha de creación
  lastUpdated: Date;       // Última actualización
}
```

## 🚀 **Flujo de Funcionamiento**

### **1. Registro de Usuario**
```
Usuario se registra → Solicitar permisos → Obtener token → Guardar en Firestore
```

### **2. Login de Usuario**
```
Usuario inicia sesión → Verificar permisos → Actualizar token → Guardar en Firestore
```

### **3. Creación de Bridge Privado**
```
Usuario crea bridge → Obtener tokens de destinatarios → Enviar notificaciones push
```

### **4. Recepción de Notificación**
```
Notificación llega → Mostrar alerta → Al tocar → Navegar a /bridges
```

## 🔧 **Configuración Técnica**

### **Dependencias Instaladas:**
```bash
expo-notifications    # Manejo de notificaciones
expo-device          # Información del dispositivo
expo-constants       # Configuración de la app
```

### **Configuración en app.json:**
```json
{
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/images/notification-icon.png",
        "color": "#FF7F00",
        "sounds": ["./assets/sounds/notification.wav"]
      }
    ]
  ]
}
```

## 📋 **Métodos del Servicio**

### **`notificationService.requestPermissions()`**
Solicita permisos de notificación al usuario.

### **`notificationService.getToken()`**
Obtiene el token de notificación del dispositivo.

### **`notificationService.saveTokenToFirestore(userId)`**
Guarda el token en Firestore para el usuario especificado.

### **`notificationService.sendPushNotification(userId, notification)`**
Envía una notificación push a un usuario específico.

### **`notificationService.sendBridgeReceivedNotification(recipientId, senderName, bridgeTitle, isPrivate)`**
Envía una notificación específica de bridge recibido.

### **`notificationService.sendLocalNotification(notification)`**
Envía una notificación local (para pruebas).

### **`notificationService.clearBadge()`**
Limpia el contador de notificaciones (badge).

## 🎯 **Casos de Uso**

### **✅ Caso 1: Usuario Nuevo**
1. Usuario se registra
2. Se solicitan permisos automáticamente
3. Se guarda el token en Firestore
4. Usuario puede recibir notificaciones

### **✅ Caso 2: Usuario Existente**
1. Usuario inicia sesión
2. Se verifica/actualiza el token
3. Usuario puede recibir notificaciones

### **✅ Caso 3: Bridge Privado**
1. Usuario A crea bridge privado para Usuario B
2. Sistema obtiene token de Usuario B
3. Se envía notificación push a Usuario B
4. Usuario B recibe notificación y puede navegar al bridge

### **✅ Caso 4: Prueba de Notificaciones**
1. Usuario va a perfil
2. Toca "Probar notificación"
3. Recibe notificación local de prueba

## 🔍 **Debugging y Logs**

El sistema incluye logs detallados para debugging:

- `🔔` - Notificaciones
- `✅` - Operaciones exitosas
- `❌` - Errores
- `⚠️` - Advertencias

### **Logs Principales:**
```
🔔 Configurando notificaciones para nuevo usuario...
✅ Permisos de notificación otorgados
🔔 Token de notificación obtenido: [token]
✅ Token guardado en Firestore para usuario: [userId]
🔔 Enviando notificaciones a destinatarios...
✅ Notificación push enviada a usuario: [userId]
```

## 🚨 **Consideraciones de Seguridad**

1. **Tokens únicos:** Cada usuario tiene su propio token de notificación
2. **Validación de permisos:** Se verifica que el usuario tenga permisos antes de enviar
3. **Manejo de errores:** Errores no críticos no bloquean la funcionalidad principal
4. **Limpieza de datos:** Los tokens se actualizan automáticamente

## 🔮 **Próximas Mejoras**

- [ ] Notificaciones para bridges públicos
- [ ] Configuración de preferencias de notificación
- [ ] Notificaciones de comentarios/likes
- [ ] Notificaciones programadas
- [ ] Soporte para múltiples dispositivos por usuario

## 📞 **Soporte**

Para problemas con notificaciones:
1. Verificar permisos en configuración del dispositivo
2. Revisar logs en consola
3. Probar con notificación local
4. Verificar conexión a internet para notificaciones push 