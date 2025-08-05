import * as FileSystem from "expo-file-system";

export const uploadImageToCloudinary = async (uri: string): Promise<string | null> => {
  try {
    console.log("🔍 Leyendo archivo desde:", uri);
    const base64Img = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const data = new FormData();
    data.append("file", {
      uri,
      type: "image/jpeg",
      name: "profile.jpg",
    } as any);
    data.append("upload_preset", "bridgea-app"); // debe coincidir exactamente

    // Parámetros de optimización y compresión
    data.append("transformation", "f_auto,q_auto,w_800,c_scale"); // Formato automático, calidad automática, ancho máximo 800px
    data.append("quality", "80"); // Calidad del 80%
    data.append("fetch_format", "auto"); // Formato automático (WebP si es compatible)
    data.append("flags", "progressive"); // Carga progresiva para mejor UX

    console.log("🚀 Enviando imagen optimizada a Cloudinary...");

    const res = await fetch("https://api.cloudinary.com/v1_1/dqqddecpb/image/upload", {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    console.log("✅ Cloudinary respondió:", result);

    if (result.secure_url) {
      // Agregar parámetros adicionales a la URL para optimización en tiempo real
      const optimizedUrl = result.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_800,c_scale/');
      console.log("🔧 URL optimizada:", optimizedUrl);
      return optimizedUrl;
    }

    return result.secure_url;
  } catch (error) {
    console.log("❌ Error al subir imagen:", error);
    return null;
  }
};

// Función específica para subir imágenes de perfil (más pequeñas)
export const uploadProfileImageToCloudinary = async (uri: string): Promise<{originalUrl: string, optimizedUrl: string} | null> => {
  try {
    console.log("🔍 Leyendo imagen de perfil desde:", uri);

    const data = new FormData();
    data.append("file", {
      uri,
      type: "image/jpeg",
      name: "profile.jpg",
    } as any);
    data.append("upload_preset", "bridgea-profiles");

    // Especificar carpeta para perfiles
    data.append("folder", "profile");

    console.log("🚀 Enviando imagen de perfil a Cloudinary (carpeta: profile)...");

    const res = await fetch("https://api.cloudinary.com/v1_1/dqqddecpb/image/upload", {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    console.log("✅ Cloudinary respondió:", result);

    if (result.secure_url) {
      // URL optimizada para perfil
      const optimizedUrl = result.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_300,h_300,c_fill,g_face/');
      console.log("🔧 URL de perfil optimizada:", optimizedUrl);
      return {
        originalUrl: result.secure_url,
        optimizedUrl: optimizedUrl
      };
    }

    return null;
  } catch (error) {
    console.log("❌ Error al subir imagen de perfil:", error);
    return null;
  }
};

// Función de prueba alternativa para verificar configuración
export const testCloudinaryUpload = async (uri: string): Promise<string | null> => {
  try {
    console.log("🧪 Probando subida alternativa...");
    console.log("📁 URI de la imagen:", uri);

    if (!uri) {
      console.error("❌ URI de imagen es null o undefined");
      return null;
    }

    const data = new FormData();
    data.append("file", {
      uri,
      type: "image/jpeg",
      name: "test.jpg",
    } as any);
    
    // Agregar upload preset requerido
    data.append("upload_preset", "bridgea-app");

    console.log("🚀 Enviando imagen de prueba a Cloudinary...");

    const res = await fetch("https://api.cloudinary.com/v1_1/dqqddecpb/image/upload", {
      method: "POST",
      body: data,
    });

    console.log("📡 Respuesta de Cloudinary - Status:", res.status);
    console.log("📡 Respuesta de Cloudinary - OK:", res.ok);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Error en respuesta de Cloudinary:", errorText);
      throw new Error(`Cloudinary error: ${res.status} - ${errorText}`);
    }

    const result = await res.json();
    console.log("✅ Cloudinary respondió exitosamente:", result);

    if (result.secure_url) {
      console.log("🔧 URL de prueba obtenida:", result.secure_url);
      return result.secure_url;
    }

    console.log("⚠️ No se encontró secure_url en la respuesta:", result);
    return result.secure_url || null;
  } catch (error) {
    console.error("❌ Error en prueba alternativa:", error);
    // No mostrar detalles del error en pantalla, solo en consola
    return null;
  }
};

// Función específica para subir imágenes de bridges (tamaño medio)
export const uploadBridgeImageToCloudinary = async (uri: string): Promise<{originalUrl: string, optimizedUrl: string} | null> => {
  try {
    console.log("🔍 Leyendo imagen de bridge desde:", uri);
    console.log("📁 URI de la imagen:", uri);

    // Verificar que la URI existe
    if (!uri) {
      console.error("❌ URI de imagen es null o undefined");
      return null;
    }

    const data = new FormData();
    data.append("file", {
      uri,
      type: "image/jpeg",
      name: "bridge.jpg",
    } as any);
    data.append("upload_preset", "bridgea-bridges");

    // Especificar carpeta para bridges
    data.append("folder", "bridges");

    console.log("🚀 Enviando imagen de bridge a Cloudinary (carpeta: bridges)...");
    console.log("📤 FormData preparado:", data);

    const res = await fetch("https://api.cloudinary.com/v1_1/dqqddecpb/image/upload", {
      method: "POST",
      body: data,
    });

    console.log("📡 Respuesta de Cloudinary - Status:", res.status);
    console.log("📡 Respuesta de Cloudinary - OK:", res.ok);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Error en respuesta de Cloudinary:", errorText);
      throw new Error(`Cloudinary error: ${res.status} - ${errorText}`);
    }

    const result = await res.json();
    console.log("✅ Cloudinary respondió exitosamente:", result);

    if (result.secure_url) {
      console.log("🔧 URL de bridge obtenida:", result.secure_url);
      return {
        originalUrl: result.secure_url,
        optimizedUrl: result.secure_url
      };
    }

    console.log("⚠️ No se encontró secure_url en la respuesta:", result);
    return null;
  } catch (error) {
    console.error("❌ Error al subir imagen de bridge:", error);
    // No mostrar detalles del error en pantalla, solo en consola
    return null;
  }
};

// Función para extraer el public_id de una URL de Cloudinary
const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    // Ejemplo de URL: https://res.cloudinary.com/dqqddecpb/image/upload/v1754420464/profile/iveqesxdzpkxxvf05ghw.jpg
    // O URL transformada: https://res.cloudinary.com/dqqddecpb/image/upload/f_auto,q_auto,w_300,h_300,c_fill,g_face/v1754420464/profile/iveqesxdzpkxxvf05ghw.jpg
    
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
      console.error("❌ No se pudo extraer public_id de la URL:", url);
      return null;
    }
    
    // Buscar la versión (v1234567890) después de 'upload'
    let versionIndex = uploadIndex + 1;
    let pathStartIndex = uploadIndex + 2;
    
    // Si el siguiente elemento es una versión (empieza con 'v'), saltamos al siguiente
    if (urlParts[versionIndex] && urlParts[versionIndex].startsWith('v')) {
      pathStartIndex = uploadIndex + 2;
    } else {
      pathStartIndex = uploadIndex + 1;
    }
    
    // Obtener la ruta después de la versión
    const pathParts = urlParts.slice(pathStartIndex, -1);
    const filename = urlParts[urlParts.length - 1];
    
    // Remover la extensión del archivo
    const filenameWithoutExt = filename.includes('.') 
      ? filename.split('.')[0]
      : filename;
    
    // Construir el public_id
    const publicId = pathParts.length > 0 
      ? `${pathParts.join('/')}/${filenameWithoutExt}`
      : filenameWithoutExt;
    
    console.log("🔍 Public ID extraído:", publicId);
    return publicId;
  } catch (error) {
    console.error("❌ Error extrayendo public_id:", error);
    return null;
  }
};

// Función para eliminar imagen de Cloudinary
export const deleteImageFromCloudinary = async (imageUrl: string): Promise<boolean> => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      console.log("⚠️ URL no válida de Cloudinary:", imageUrl);
      return false;
    }

    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
      console.error("❌ No se pudo extraer public_id de la URL");
      return false;
    }

    console.log("🗑️ Eliminando imagen de Cloudinary:", publicId);

    // Intentar eliminar usando la API de administración
    const cloudName = 'dqqddecpb';
    const apiKey = process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.log("⚠️ Credenciales de API de Cloudinary no configuradas");
      console.log("💡 Para habilitar eliminación, configura EXPO_PUBLIC_CLOUDINARY_API_KEY y EXPO_PUBLIC_CLOUDINARY_API_SECRET");
      return false;
    }

    // Usar la API de Cloudinary con parámetros en la URL
    const deleteUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
    
    const deleteData = new FormData();
    deleteData.append('public_id', publicId);
    deleteData.append('api_key', apiKey);
    deleteData.append('api_secret', apiSecret);
    
    const deleteRes = await fetch(deleteUrl, {
      method: 'POST',
      body: deleteData,
    });

    if (deleteRes.ok) {
      const deleteResult = await deleteRes.json();
      console.log("✅ Imagen eliminada exitosamente:", deleteResult);
      return true;
    } else {
      const errorText = await deleteRes.text();
      console.error("❌ Error eliminando imagen:", errorText);
      return false;
    }
  } catch (error) {
    console.error("❌ Error eliminando imagen de Cloudinary:", error);
    return false;
  }
};

// Función para eliminar imagen de perfil (con manejo de errores silencioso)
export const deleteProfileImageFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    if (!imageUrl) return;
    
    console.log("👤 Eliminando imagen de perfil:", imageUrl);
    
    // Para presets unsigned, no podemos eliminar imágenes
    console.log("ℹ️ Los presets unsigned no permiten eliminación de imágenes");
    console.log("💡 Para habilitar eliminación, configura presets signed en Cloudinary");
    
  } catch (error) {
    console.log("⚠️ Error eliminando imagen de perfil (continuando...):", error);
  }
};

// Función para eliminar imagen de bridge (con manejo de errores silencioso)
export const deleteBridgeImageFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    if (!imageUrl) return;
    
    console.log("🌉 Eliminando imagen de bridge:", imageUrl);
    
    // Para presets unsigned, no podemos eliminar imágenes
    console.log("ℹ️ Los presets unsigned no permiten eliminación de imágenes");
    console.log("💡 Para habilitar eliminación, configura presets signed en Cloudinary");
    
  } catch (error) {
    console.log("⚠️ Error eliminando imagen de bridge (continuando...):", error);
  }
};
