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
export const uploadProfileImageToCloudinary = async (uri: string): Promise<string | null> => {
  try {
    console.log("🔍 Leyendo imagen de perfil desde:", uri);

    const data = new FormData();
    data.append("file", {
      uri,
      type: "image/jpeg",
      name: "profile.jpg",
    } as any);
    data.append("upload_preset", "bridgea-app");

    // Parámetros específicos para imágenes de perfil (más pequeñas)
    data.append("transformation", "f_auto,q_auto,w_300,h_300,c_fill,g_face"); // 300x300px, recorte centrado en rostro
    data.append("quality", "85"); // Calidad ligeramente mayor para perfiles
    data.append("fetch_format", "auto");
    data.append("flags", "progressive");

    console.log("🚀 Enviando imagen de perfil optimizada a Cloudinary...");

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
      return optimizedUrl;
    }

    return result.secure_url;
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
    
    // Probar sin upload preset primero
    // data.append("upload_preset", "bridgea-app");

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
    console.error("❌ Detalles del error:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
};

// Función específica para subir imágenes de bridges (tamaño medio)
export const uploadBridgeImageToCloudinary = async (uri: string): Promise<string | null> => {
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
    data.append("upload_preset", "bridgea-app");

    // Simplificar parámetros para evitar problemas
    // data.append("transformation", "f_auto,q_auto,w_600,c_scale");
    // data.append("quality", "75");
    // data.append("fetch_format", "auto");
    // data.append("flags", "progressive");

    console.log("🚀 Enviando imagen de bridge a Cloudinary...");
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
      return result.secure_url;
    }

    console.log("⚠️ No se encontró secure_url en la respuesta:", result);
    return result.secure_url || null;
  } catch (error) {
    console.error("❌ Error al subir imagen de bridge:", error);
    console.error("❌ Detalles del error:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
};
