import * as ImagePicker from "expo-image-picker";
import {
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    where,
} from "firebase/firestore";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Typography";
import { auth, db } from "../firebase/config";
import { testCloudinaryUpload, uploadBridgeImageToCloudinary } from "../services/cloudinaryService";

const EMOTIONS = ["❤️ Amor", "😊 Felicidad", "😢 Nostalgia", "💪 Fortaleza", "🎉 Celebración"];

export default function CreateBridgeScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emotion, setEmotion] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUserSearch = async () => {
    const queryText = searchText.trim().toLowerCase();
    if (!queryText) return;

    setLoading(true);

    const endValue = queryText.replace(/.$/, (c) =>
      String.fromCharCode(c.charCodeAt(0) + 1)
    );

    try {
      const q = query(
        collection(db, "users"),
        where("username", ">=", queryText),
        where("username", "<", endValue)
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSearchResults(results);
    } catch (err) {
      console.error("❌ Error buscando usuarios:", err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (user: any) => {
    const exists = selectedUsers.find((u) => u.id === user.id);
    if (exists) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handlePickImage = async () => {
    try {
      console.log("📸 Iniciando selección de imagen...");
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permiso denegado", "Se necesita acceso a tus fotos.");
        return;
      }

      console.log("✅ Permisos concedidos, abriendo galería...");

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      console.log("📱 Resultado del picker:", pickerResult);

      if (!pickerResult.canceled && pickerResult.assets.length > 0) {
        const selectedImage = pickerResult.assets[0];
        console.log("🖼️ Imagen seleccionada:", selectedImage);
        setImage(selectedImage.uri);
      } else {
        console.log("❌ No se seleccionó ninguna imagen");
      }
    } catch (error) {
      console.error("❌ Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen. Inténtalo de nuevo.");
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !emotion) {
      Alert.alert("Campos incompletos", "Por favor llena todos los campos requeridos.");
      return;
    }

    if (isPrivate && selectedUsers.length === 0) {
      Alert.alert("Falta destinatario", "Selecciona al menos un usuario para enviar el puente.");
      return;
    }

    try {
      console.log("🚀 Iniciando creación de bridge...");
      const senderId = auth.currentUser?.uid;
      if (!senderId) {
        Alert.alert("Error", "No estás autenticado.");
        return;
      }

      let imageUrl = "";
      if (image) {
        console.log("📤 Subiendo imagen a Cloudinary...");
        setUploadingImage(true);
        
        try {
          // Probar primero con la función de prueba
          console.log("🧪 Probando subida alternativa...");
          let uploadResult = await testCloudinaryUpload(image);
          
          if (!uploadResult) {
            console.log("🔄 Probando con función original...");
            uploadResult = await uploadBridgeImageToCloudinary(image);
          }
          
          console.log("📤 Resultado de subida:", uploadResult);
          
          if (!uploadResult) {
            Alert.alert("Error", "No se pudo subir la imagen. Inténtalo de nuevo.");
            setUploadingImage(false);
            return;
          }
          imageUrl = uploadResult;
          console.log("✅ Imagen subida exitosamente:", imageUrl);
        } catch (uploadError) {
          console.error("❌ Error específico al subir imagen:", uploadError);
          Alert.alert("Error", "No se pudo subir la imagen. Inténtalo de nuevo.");
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      console.log("💾 Guardando bridge en Firestore...");
      const bridgeId = `${senderId}_${Date.now()}`;
      const commonData = {
        title,
        description,
        emotion,
        senderId,
        imageUrl,
        createdAt: new Date(),
      };

      if (isPrivate) {
        console.log("🔒 Creando bridge privado para", selectedUsers.length, "usuarios");
        for (const user of selectedUsers) {
          await setDoc(doc(collection(db, "bridges"), `${bridgeId}_${user.id}`), {
            ...commonData,
            recipientId: user.id,
            isPublic: false,
          });
        }
      } else {
        console.log("🌍 Creando bridge público");
        await setDoc(doc(collection(db, "bridges"), bridgeId), {
          ...commonData,
          isPublic: true,
        });
      }

      console.log("✅ Bridge creado exitosamente");
      Alert.alert("¡Listo!", "Tu puente ha sido creado exitosamente.");
      
      // Limpiar formulario
      setTitle("");
      setDescription("");
      setEmotion("");
      setSearchText("");
      setSearchResults([]);
      setSelectedUsers([]);
      setIsPrivate(false);
      setImage(null);
    } catch (error) {
      console.error("❌ Error al crear el puente:", error);
      Alert.alert("Error", "Hubo un problema al crear el puente. Inténtalo de nuevo.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.pageTitle}>Crear Bridge 🌉</Text>

          <Text style={styles.label}>Título del puente</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ej: Recuerdo especial"
          />

          <Text style={styles.label}>Descripción emocional</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="Describe el momento o la emoción..."
          />

          <Text style={styles.label}>Elige una emoción</Text>
          {EMOTIONS.map((e) => (
            <Pressable
              key={e}
              style={[styles.emotionButton, emotion === e && styles.emotionSelected]}
              onPress={() => setEmotion(e)}
            >
              <Text style={[styles.emotionText, emotion === e && { color: Colors.text.white }]}>{e}</Text>
            </Pressable>
          ))}

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Público</Text>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              thumbColor={isPrivate ? Colors.primary : Colors.neutral.lightGray}
              trackColor={{ false: Colors.neutral.lightGray, true: Colors.neutral.light }}
            />
            <Text style={styles.label}>Privado</Text>
          </View>

          {isPrivate && (
            <>
              <Text style={styles.label}>Buscar usuario destinatario</Text>
              <TextInput
                style={styles.input}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Escribe un username"
                autoCapitalize="none"
              />
              <Pressable style={styles.searchButton} onPress={handleUserSearch} disabled={loading}>
                <Text style={styles.searchButtonText}>
                  {loading ? "Buscando..." : "Buscar"}
                </Text>
              </Pressable>

              {searchResults.length > 0 && (
                <View style={styles.suggestionBox}>
                  <Text style={styles.label}>Usuarios encontrados:</Text>
                  {searchResults.map((user) => (
                    <Pressable
                      key={user.id}
                      style={styles.suggestionText}
                      onPress={() => toggleUserSelection(user)}
                    >
                      <Text style={[
                        styles.suggestionText,
                        selectedUsers.find((u) => u.id === user.id) && { fontWeight: "bold", color: Colors.primary }
                      ]}>
                        {selectedUsers.find((u) => u.id === user.id) ? "✅ " : "⬜ "}
                        @{user.username} - {user.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {selectedUsers.length > 0 && (
                <View style={styles.suggestionBox}>
                  <Text style={styles.label}>Destinatarios seleccionados:</Text>
                  {selectedUsers.map((user) => (
                    <Text key={user.id} style={styles.suggestionText}>
                      ✅ @{user.username} - {user.name}
                    </Text>
                  ))}
                </View>
              )}
            </>
          )}

          {!isPrivate && (
            <Text style={styles.publicInfo}>
              🌐 Este puente será <Text style={{ fontWeight: "bold" }}>público</Text> y lo podrá ver cualquier usuario.
            </Text>
          )}

          <Text style={styles.label}>Imagen (opcional)</Text>
          <Pressable style={styles.imageButton} onPress={handlePickImage} disabled={uploadingImage}>
            <Text style={styles.imageButtonText}>
              {uploadingImage ? "Subiendo imagen..." : "Seleccionar imagen"}
            </Text>
          </Pressable>
          {image && <Image source={{ uri: image }} style={styles.preview} />}

          <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={uploadingImage}>
            <Text style={styles.submitButtonText}>
              {uploadingImage ? "Subiendo..." : "Crear puente"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  pageTitle: {
    ...TextStyles.largeTitle,
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    ...TextStyles.body,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
    color: Colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.card,
    fontSize: 16,
    fontFamily: TextStyles.body.fontFamily,
  },
  emotionButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: Colors.card,
  },
  emotionSelected: {
    backgroundColor: Colors.primary,
  },
  emotionText: {
    color: Colors.text.primary,
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: TextStyles.body.fontFamily,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
    alignItems: "center",
  },
  imageButtonText: {
    color: Colors.text.white,
    fontWeight: "600",
    fontSize: 16,
    fontFamily: TextStyles.button.fontFamily,
  },
  preview: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  searchButtonText: {
    color: Colors.text.white,
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: TextStyles.button.fontFamily,
  },
  suggestionBox: {
    backgroundColor: Colors.neutral.light,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  suggestionText: {
    paddingVertical: 6,
    fontSize: 16,
    color: Colors.text.primary,
    fontFamily: TextStyles.body.fontFamily,
  },
  submitButton: {
    backgroundColor: Colors.success,
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: "center",
  },
  submitButtonText: {
    color: Colors.text.white,
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: TextStyles.button.fontFamily,
  },
  publicInfo: {
    marginTop: 20,
    fontStyle: "italic",
    color: Colors.text.secondary,
    textAlign: "center",
    fontFamily: TextStyles.body.fontFamily,
  },
});
