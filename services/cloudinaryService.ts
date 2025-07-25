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

    console.log("🚀 Enviando imagen a Cloudinary...");

    const res = await fetch("https://api.cloudinary.com/v1_1/dqqddecpb/image/upload", {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    console.log("✅ Cloudinary respondió:", result);

    return result.secure_url;
  } catch (error) {
    console.log("❌ Error al subir imagen:", error);
    return null;
  }
};
