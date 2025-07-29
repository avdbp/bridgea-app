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
import { auth, db } from "../firebase/config";
import { uploadImageToCloudinary } from "../services/cloudinaryService";

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
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso denegado", "Se necesita acceso a tus fotos.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
    });

    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      setImage(pickerResult.assets[0].uri);
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
      const senderId = auth.currentUser?.uid;
      if (!senderId) return;

      let imageUrl = "";
      if (image) {
        const uploadResult = await uploadImageToCloudinary(image);
        if (!uploadResult) {
          Alert.alert("Error", "No se pudo subir la imagen.");
          return;
        }
        imageUrl = uploadResult;
      }

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
        for (const user of selectedUsers) {
          await setDoc(doc(collection(db, "bridges"), `${bridgeId}_${user.id}`), {
            ...commonData,
            recipientId: user.id,
            isPublic: false,
          });
        }
      } else {
        await setDoc(doc(collection(db, "bridges"), bridgeId), {
          ...commonData,
          isPublic: true,
        });
      }

      Alert.alert("¡Listo!", "Tu puente ha sido creado exitosamente.");
      setTitle("");
      setDescription("");
      setEmotion("");
      setSearchText("");
      setSearchResults([]);
      setSelectedUsers([]);
      setIsPrivate(false);
      setImage(null);
    } catch (error) {
      console.error("Error al crear el puente:", error);
      Alert.alert("Error", "Hubo un problema al crear el puente.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
            <Text style={[styles.emotionText, emotion === e && { color: "#fff" }]}>{e}</Text>
          </Pressable>
        ))}

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Público</Text>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            thumbColor={isPrivate ? "#8e44ad" : "#ccc"}
            trackColor={{ false: "#ccc", true: "#d5b2e5" }}
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
                {searchResults.map((user) => (
                  <Pressable key={user.id} onPress={() => toggleUserSelection(user)}>
                    <Text
                      style={[
                        styles.suggestionText,
                        selectedUsers.some((u) => u.id === user.id) && {
                          color: "#8e44ad",
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      {user.username}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {selectedUsers.length > 0 && (
              <Text style={{ marginTop: 10 }}>
                Seleccionados: {selectedUsers.map((u) => `@${u.username}`).join(", ")}
              </Text>
            )}
          </>
        )}

        {!isPrivate && (
          <Text style={{ marginTop: 20, fontStyle: "italic", color: "#555" }}>
            🌐 Este puente será <Text style={{ fontWeight: "bold" }}>público</Text> y lo podrá ver cualquier usuario.
          </Text>
        )}

        <Text style={styles.label}>Imagen (opcional)</Text>
        <Pressable style={styles.imageButton} onPress={handlePickImage}>
          <Text style={styles.imageButtonText}>Seleccionar imagen</Text>
        </Pressable>
        {image && <Image source={{ uri: image }} style={styles.preview} />}

        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Crear puente</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  emotionButton: {
    borderWidth: 1,
    borderColor: "#8e44ad",
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  emotionSelected: {
    backgroundColor: "#8e44ad",
  },
  emotionText: {
    color: "#333",
    fontWeight: "bold",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  imageButtonText: {
    color: "#333",
  },
  preview: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  searchButton: {
    backgroundColor: "#8e44ad",
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  suggestionBox: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  suggestionText: {
    paddingVertical: 6,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#27ae60",
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
