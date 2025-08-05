# 🔥 Configuración de Índices de Firestore

## ⚠️ **Error de Índices Requeridos**

El error que estás viendo indica que Firestore necesita índices compuestos para las consultas que estamos haciendo. Esto es necesario para las notificaciones y mensajes.

## 📋 **Pasos para Configurar Índices:**

### **1. Ir a la Consola de Firebase:**

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto `bridgea-app-fixed`
3. Ve a **Firestore Database** en el menú lateral
4. Haz clic en la pestaña **Índices**

### **2. Crear Índices Manualmente:**

#### **Índice 1: Notificaciones por recipientId y read**
- **Colección:** `notifications`
- **Campos:**
  - `recipientId` (Ascending)
  - `read` (Ascending)

#### **Índice 2: Notificaciones por recipientId y createdAt**
- **Colección:** `notifications`
- **Campos:**
  - `recipientId` (Ascending)
  - `createdAt` (Descending)

#### **Índice 3: Mensajes por recipientId y createdAt**
- **Colección:** `messages`
- **Campos:**
  - `recipientId` (Ascending)
  - `createdAt` (Descending)

#### **Índice 4: Mensajes por senderId y createdAt**
- **Colección:** `messages`
- **Campos:**
  - `senderId` (Ascending)
  - `createdAt` (Descending)

#### **Índice 5: Mensajes por senderId y recipientId**
- **Colección:** `messages`
- **Campos:**
  - `senderId` (Ascending)
  - `recipientId` (Ascending)

#### **Índice 6: Mensajes por recipientId y senderId**
- **Colección:** `messages`
- **Campos:**
  - `recipientId` (Ascending)
  - `senderId` (Ascending)

#### **Índice 7: Mensajes por senderId, recipientId y createdAt**
- **Colección:** `messages`
- **Campos:**
  - `senderId` (Ascending)
  - `recipientId` (Ascending)
  - `createdAt` (Ascending)

#### **Índice 8: Mensajes por recipientId, senderId y createdAt**
- **Colección:** `messages`
- **Campos:**
  - `recipientId` (Ascending)
  - `senderId` (Ascending)
  - `createdAt` (Ascending)

### **3. Usar el Archivo de Configuración (Opcional):**

Si tienes Firebase CLI configurado, puedes usar el archivo `firestore.indexes.json`:

```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar Firebase en tu proyecto
firebase init firestore

# Desplegar índices
firebase deploy --only firestore:indexes
```

### **4. Verificar Índices:**

1. En la consola de Firebase, ve a **Índices**
2. Verifica que los índices estén en estado **"Enabled"**
3. Esto puede tomar unos minutos

## 🔍 **Índices Necesarios:**

### **Para Notificaciones:**
```javascript
// Consulta: where('recipientId', '==', userId) && where('read', '==', false)
{
  "collectionGroup": "notifications",
  "fields": [
    { "fieldPath": "recipientId", "order": "ASCENDING" },
    { "fieldPath": "read", "order": "ASCENDING" }
  ]
}

// Consulta: where('recipientId', '==', userId) && orderBy('createdAt', 'desc')
{
  "collectionGroup": "notifications",
  "fields": [
    { "fieldPath": "recipientId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

### **Para Mensajes:**
```javascript
// Consulta: where('recipientId', '==', userId) && orderBy('createdAt', 'desc')
{
  "collectionGroup": "messages",
  "fields": [
    { "fieldPath": "recipientId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}

// Consulta: where('senderId', '==', userId) && orderBy('createdAt', 'desc')
{
  "collectionGroup": "messages",
  "fields": [
    { "fieldPath": "senderId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}

// Consulta: where('senderId', '==', userId) && where('recipientId', '==', otherUserId)
{
  "collectionGroup": "messages",
  "fields": [
    { "fieldPath": "senderId", "order": "ASCENDING" },
    { "fieldPath": "recipientId", "order": "ASCENDING" }
  ]
}

// Consulta: where('recipientId', '==', userId) && where('senderId', '==', otherUserId)
{
  "collectionGroup": "messages",
  "fields": [
    { "fieldPath": "recipientId", "order": "ASCENDING" },
    { "fieldPath": "senderId", "order": "ASCENDING" }
  ]
}

// Consulta: where('senderId', '==', userId) && where('recipientId', '==', otherUserId) && orderBy('createdAt', 'asc')
{
  "collectionGroup": "messages",
  "fields": [
    { "fieldPath": "senderId", "order": "ASCENDING" },
    { "fieldPath": "recipientId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "ASCENDING" }
  ]
}

// Consulta: where('recipientId', '==', userId) && where('senderId', '==', otherUserId) && orderBy('createdAt', 'asc')
{
  "collectionGroup": "messages",
  "fields": [
    { "fieldPath": "recipientId", "order": "ASCENDING" },
    { "fieldPath": "senderId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "ASCENDING" }
  ]
}

// Consulta: where('recipientId', '==', userId) && where('read', '==', false) && orderBy('createdAt', 'desc') - **NUEVO: Para notificaciones de mensajes**
{
  "collectionGroup": "messages",
  "fields": [
    { "fieldPath": "recipientId", "order": "ASCENDING" },
    { "fieldPath": "read", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}

## 🚀 **Después de Configurar Índices:**

1. **Reinicia la app** para que las consultas funcionen
2. **Prueba las notificaciones** - deberían cargar sin errores
3. **Prueba los mensajes** - deberían aparecer correctamente

## 📞 **Soporte:**

Si tienes problemas:
1. Verifica que los índices estén habilitados
2. Espera unos minutos para que se propaguen
3. Reinicia la aplicación
4. Revisa los logs de Firebase Console

## 🔧 **Comandos Útiles:**

```bash
# Ver estado de índices
firebase firestore:indexes

# Desplegar índices
firebase deploy --only firestore:indexes

# Ver logs de Firestore
firebase firestore:logs
``` 