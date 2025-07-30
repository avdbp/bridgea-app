import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Typography";
import { auth, db } from "../firebase/config";
import { testCloudinaryUpload, uploadBridgeImageToCloudinary } from "../services/cloudinaryService";
import notificationService from "../services/notificationService";

const EMOTIONS = [
  { name: "Amor", icon: "heart" },
  { name: "Felicidad", icon: "smile" },
  { name: "Nostalgia", icon: "clock" },
  { name: "Fortaleza", icon: "zap" },
  { name: "Celebración", icon: "gift" },
];

interface User {
  id: string;
  username: string;
  displayName: string; // Este campo se mapea desde 'name' en Firestore
  photoURL?: string;
}

export default function CreateBridgeScreen() {
  const { recipientUsername } = useLocalSearchParams<{ recipientUsername?: string }>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para selección de usuarios
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("🔐 Estado de autenticación cambiado:", user ? `Usuario: ${user.uid}` : "No autenticado");
      if (!user) {
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, []);

  // Cargar usuario destinatario si se proporciona un username
  useEffect(() => {
    const loadRecipientUser = async () => {
      if (recipientUsername) {
        try {
          const usersQuery = query(
            collection(db, 'users'),
            where('username', '==', recipientUsername.toLowerCase())
          );
          const userSnapshot = await getDocs(usersQuery);
          
          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data() as any;
            const recipientUser: User = {
              id: userDoc.id,
              username: userData.username,
              displayName: userData.name,
              photoURL: userData.photoURL,
            };
            
            setSelectedUsers([recipientUser]);
            setIsPublic(false); // Hacer el bridge privado por defecto
            console.log("✅ Usuario destinatario cargado:", recipientUser.username);
          }
        } catch (error) {
          console.error("❌ Error cargando usuario destinatario:", error);
        }
      }
    };

    loadRecipientUser();
  }, [recipientUsername]);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso denegado", "Se necesita acceso a tus fotos.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      console.log("📸 Imagen seleccionada:", pickerResult.assets[0].uri);
      setImage(pickerResult.assets[0].uri);
    }
  };

  const searchUsers = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    // Verificar autenticación
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("❌ No hay usuario autenticado");
      return;
    }

    setSearching(true);
    try {
      console.log("🔍 Búsqueda:", searchQuery);
      
      const usersRef = collection(db, "users");
      const currentUserId = currentUser.uid;
      
      // Obtener todos los usuarios
      const allUsersSnapshot = await getDocs(usersRef);
      console.log("🔍 Total usuarios:", allUsersSnapshot.size);
      
      const foundUsers: User[] = [];
      
      allUsersSnapshot.forEach((docSnapshot) => {
        if (docSnapshot.id === currentUserId) return;
        
        const userData = docSnapshot.data() as any;
        const username = userData.username || "";
        const name = userData.name || userData.displayName || "";
        
        // Búsqueda simple
        if (username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            name.toLowerCase().includes(searchQuery.toLowerCase())) {
          foundUsers.push({
            id: docSnapshot.id,
            username: username,
            displayName: name,
            photoURL: userData.photoURL || "",
          });
        }
      });
      
      console.log(`🔍 Encontrados: ${foundUsers.length} usuarios`);
      setUsers(foundUsers);
    } catch (error) {
      console.error("❌ Error en búsqueda:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleUserSearch = (text: string) => {
    setSearchQuery(text);
    
    // Buscar inmediatamente cuando se escribe
    if (text.trim().length >= 1) {
      searchUsers(text);
    } else {
      setUsers([]);
    }
  };

  const toggleUserSelection = (user: User) => {
    const isSelected = selectedUsers.some(u => u.id === user.id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleVisibilityChange = (isPublicBridge: boolean) => {
    setIsPublic(isPublicBridge);
    if (!isPublicBridge) {
      setShowUserSelector(true);
      setSelectedUsers([]);
    } else {
      setShowUserSelector(false);
      setSelectedUsers([]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !selectedEmotion) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    if (!isPublic && selectedUsers.length === 0) {
      Alert.alert("Error", "Por favor selecciona al menos un usuario para enviar el bridge privado.");
      return;
    }

    try {
      console.log("🚀 Iniciando creación de bridge...");
      const senderId = auth.currentUser?.uid;
      if (!senderId) {
        Alert.alert("Error", "No se pudo identificar al usuario.");
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
            return;
          }
          imageUrl = uploadResult;
          console.log("✅ Imagen subida exitosamente:", imageUrl);
        } catch (uploadError) {
          console.error("❌ Error al subir imagen:", uploadError);
          // No mostrar alerta, solo continuar sin imagen
          console.log("⚠️ Continuando sin imagen debido a error de subida");
          imageUrl = "";
        } finally {
          setUploadingImage(false);
        }
      }

      setSubmitting(true);

      const bridgeData = {
        title: title.trim(),
        description: description.trim(),
        emotion: selectedEmotion,
        imageUrl,
        isPublic,
        senderId,
        createdAt: new Date(),
        recipientIds: isPublic ? [] : selectedUsers.map(u => u.id),
      };

      console.log("💾 Guardando bridge en Firestore...");
      const bridgeRef = doc(collection(db, "bridges"));
      await setDoc(bridgeRef, bridgeData);

      console.log("✅ Bridge creado exitosamente!");

      // Enviar notificaciones a los destinatarios
      if (!isPublic && selectedUsers.length > 0) {
        console.log("🔔 Enviando notificaciones a destinatarios...");
        
        // Obtener información del remitente
        const senderDoc = await getDoc(doc(db, "users", senderId));
        const senderData = senderDoc.exists() ? senderDoc.data() : {};
        const senderName = senderData.name || "Usuario";
        
        // Enviar notificación a cada destinatario
        const notificationPromises = selectedUsers.map(user =>
          notificationService.sendBridgeReceivedNotification(
            user.id,
            senderName,
            title.trim(),
            senderId,
            true // Es privado
          )
        );
        
        try {
          await Promise.all(notificationPromises);
          console.log("✅ Notificaciones enviadas a todos los destinatarios");
        } catch (error) {
          console.error("❌ Error enviando notificaciones:", error);
        }
      }

      Alert.alert("¡Éxito!", "Tu bridge ha sido creado correctamente.", [
        {
          text: "Ver mis bridges",
          onPress: () => router.push("/bridges"),
        },
        {
          text: "Crear otro",
          onPress: () => {
            setTitle("");
            setDescription("");
            setSelectedEmotion("");
            setImage(null);
            setSelectedUsers([]);
            setShowUserSelector(false);
          },
        },
      ]);
    } catch (error) {
      console.error("❌ Error al crear bridge:", error);
      // Solo mostrar error en consola, no en pantalla
      console.log("⚠️ Error en creación de bridge:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.some(u => u.id === item.id);
    
    return (
      <Pressable
        style={[styles.userItem, isSelected && styles.selectedUserItem]}
        onPress={() => toggleUserSelection(item)}
      >
        <View style={styles.userInfo}>
          <Image
            source={
              item.photoURL
                ? { uri: item.photoURL }
                : require("../assets/default-profile.png")
            }
            style={styles.userAvatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userDisplayName}>{item.displayName}</Text>
            <Text style={styles.userUsername}>@{item.username}</Text>
          </View>
        </View>
        <Feather
          name={isSelected ? "check-circle" : "circle"}
          size={20}
          color={isSelected ? Colors.primary : Colors.text.light}
        />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Feather name="plus-circle" size={24} color={Colors.primary} />
            <Text style={styles.pageTitle}>Crear Bridge</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Feather name="edit-3" size={20} color={Colors.text.primary} />
              <Text style={styles.label}>Título:</Text>
            </View>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Título de tu bridge"
              placeholderTextColor={Colors.text.light}
              maxLength={100}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Feather name="file-text" size={20} color={Colors.text.primary} />
              <Text style={styles.label}>Descripción:</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe tu bridge..."
              placeholderTextColor={Colors.text.light}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Feather name="heart" size={20} color={Colors.text.primary} />
              <Text style={styles.label}>Emoción:</Text>
            </View>
            <View style={styles.emotionsContainer}>
              {EMOTIONS.map((emotion) => (
                <Pressable
                  key={emotion.name}
                  style={[
                    styles.emotionButton,
                    selectedEmotion === emotion.name && styles.selectedEmotion,
                  ]}
                  onPress={() => setSelectedEmotion(emotion.name)}
                >
                  <Feather 
                    name={emotion.icon as any} 
                    size={16} 
                    color={selectedEmotion === emotion.name ? Colors.text.white : Colors.text.primary} 
                  />
                  <Text
                    style={[
                      styles.emotionText,
                      selectedEmotion === emotion.name && styles.selectedEmotionText,
                    ]}
                  >
                    {emotion.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Feather name="image" size={20} color={Colors.text.primary} />
              <Text style={styles.label}>Imagen (opcional):</Text>
            </View>
            <Pressable
              style={styles.imageButton}
              onPress={handlePickImage}
              disabled={uploadingImage}
            >
              {image ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: image }} style={styles.previewImage} />
                  <Pressable
                    style={styles.removeImageButton}
                    onPress={() => setImage(null)}
                  >
                    <Feather name="x" size={16} color={Colors.text.white} />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="image" size={32} color={Colors.text.light} />
                  <Text style={styles.imagePlaceholderText}>
                    {uploadingImage ? "Subiendo..." : "Seleccionar imagen"}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.section}>
            <View style={styles.visibilityContainer}>
              <View style={styles.visibilityInfo}>
                <Feather 
                  name={isPublic ? "globe" : "lock"} 
                  size={20} 
                  color={Colors.text.primary} 
                />
                <Text style={styles.label}>Visibilidad:</Text>
              </View>
              <View style={styles.visibilityButtons}>
                <Pressable
                  style={[
                    styles.visibilityButton,
                    isPublic && styles.activeVisibilityButton,
                  ]}
                  onPress={() => handleVisibilityChange(true)}
                >
                  <Feather name="globe" size={16} color={isPublic ? Colors.text.white : Colors.primary} />
                  <Text style={[styles.visibilityText, isPublic && styles.activeVisibilityText]}>
                    Público
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.visibilityButton,
                    !isPublic && styles.activeVisibilityButton,
                  ]}
                  onPress={() => handleVisibilityChange(false)}
                >
                  <Feather name="lock" size={16} color={!isPublic ? Colors.text.white : Colors.primary} />
                  <Text style={[styles.visibilityText, !isPublic && styles.activeVisibilityText]}>
                    Privado
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {showUserSelector && (
            <View style={styles.section}>
              <View style={styles.labelContainer}>
                <Feather name="users" size={20} color={Colors.text.primary} />
                <Text style={styles.label}>Seleccionar destinatarios:</Text>
              </View>
              
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleUserSearch}
                placeholder="Buscar usuarios por username..."
                placeholderTextColor={Colors.text.light}
              />

              {selectedUsers.length > 0 && (
                <View style={styles.selectedUsersContainer}>
                  <Text style={styles.selectedUsersTitle}>Usuarios seleccionados:</Text>
                  <View style={styles.selectedUsersList}>
                    {selectedUsers.map((user) => (
                      <View key={user.id} style={styles.selectedUserTag}>
                        <Text style={styles.selectedUserText}>{user.displayName}</Text>
                        <Pressable
                          style={styles.removeUserButton}
                          onPress={() => removeSelectedUser(user.id)}
                        >
                          <Feather name="x" size={14} color={Colors.text.white} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {searching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>Buscando usuarios...</Text>
                </View>
              ) : (
                <View style={styles.usersListContainer}>
                  <View style={styles.usersList}>
                    {users.length === 0 ? (
                      searchQuery ? (
                        <View style={styles.emptyContainer}>
                          <Text style={styles.emptyText}>No se encontraron usuarios</Text>
                          <Pressable 
                            style={styles.testButton}
                            onPress={async () => {
                              console.log("🧪 === DIAGNÓSTICO COMPLETO ===");
                              
                              // 1. Verificar autenticación
                              const currentUser = auth.currentUser;
                              console.log("🧪 1. Usuario autenticado:", currentUser ? currentUser.uid : "NO");
                              
                              if (!currentUser) {
                                console.log("🧪 ❌ No hay usuario autenticado");
                                Alert.alert("Error", "Debes estar autenticado para usar esta función.");
                                return;
                              }
                              
                              try {
                                // 2. Verificar configuración de Firebase
                                console.log("🧪 2. Configuración de Firebase:", {
                                  projectId: db.app.options.projectId,
                                  authDomain: db.app.options.authDomain
                                });
                                
                                // 3. Probar conexión básica
                                const usersRef = collection(db, "users");
                                console.log("🧪 3. Referencia a colección creada");
                                
                                // 4. Intentar obtener datos
                                console.log("🧪 4. Intentando obtener datos...");
                                const snapshot = await getDocs(usersRef);
                                console.log("🧪 ✅ Conexión exitosa. Total de usuarios:", snapshot.size);
                                
                                // 5. Mostrar datos de ejemplo
                                console.log("🧪 5. Datos de usuarios:");
                                snapshot.forEach((doc) => {
                                  const data = doc.data();
                                  console.log("🧪   - Usuario:", { 
                                    id: doc.id, 
                                    username: data.username, 
                                    name: data.name,
                                    email: data.email 
                                  });
                                });
                                
                                // 6. Verificar reglas de seguridad
                                console.log("🧪 6. Verificando reglas de seguridad...");
                                try {
                                  // Intentar escribir un documento de prueba (debería fallar si las reglas están bien)
                                  const testRef = doc(collection(db, "test"));
                                  await setDoc(testRef, { test: true });
                                  console.log("🧪 ⚠️ Las reglas de seguridad podrían estar muy permisivas");
                                } catch (error) {
                                  console.log("🧪 ✅ Reglas de seguridad funcionando correctamente");
                                }
                                
                                // 7. Ejecutar búsqueda de prueba
                                console.log("🧪 7. Ejecutando búsqueda de prueba...");
                                searchUsers("test");
                                
                              } catch (error) {
                                console.error("🧪 ❌ Error en diagnóstico:", error);
                                console.error("🧪 Detalles del error:", {
                                  message: error instanceof Error ? error.message : 'Unknown error',
                                  code: (error as any)?.code,
                                  stack: error instanceof Error ? error.stack : undefined,
                                });
                                Alert.alert("Error de conexión", `No se pudo conectar a la base de datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                              }
                            }}
                          >
                            <Text style={styles.testButtonText}>Diagnóstico completo</Text>
                          </Pressable>
                        </View>
                      ) : (
                        <Text style={styles.emptyText}>Busca usuarios para seleccionar</Text>
                      )
                    ) : (
                      users.map((user) => (
                        <View key={user.id}>
                          {renderUserItem({ item: user })}
                        </View>
                      ))
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

          <Pressable
            style={[
              styles.submitButton,
              (submitting || uploadingImage) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={submitting || uploadingImage}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={Colors.text.white} />
            ) : (
              <Feather name="send" size={18} color={Colors.text.white} />
            )}
            <Text style={styles.submitButtonText}>
              {submitting ? "Creando..." : "Crear Bridge"}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  pageTitle: {
    ...TextStyles.largeTitle,
    color: Colors.text.primary,
  },
  section: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    ...TextStyles.body,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    fontSize: 16,
    fontFamily: TextStyles.body.fontFamily,
    color: Colors.text.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  emotionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  emotionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    backgroundColor: Colors.card,
  },
  selectedEmotion: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  emotionText: {
    ...TextStyles.body,
    color: Colors.text.primary,
  },
  selectedEmotionText: {
    color: Colors.text.white,
    fontWeight: "bold",
  },
  imageButton: {
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    backgroundColor: Colors.card,
  },
  imagePlaceholder: {
    alignItems: "center",
    gap: 8,
  },
  imagePlaceholderText: {
    ...TextStyles.body,
    color: Colors.text.light,
  },
  imagePreview: {
    position: "relative",
    width: "100%",
    height: 200,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  visibilityContainer: {
    marginBottom: 8,
  },
  visibilityInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  visibilityButtons: {
    flexDirection: "row",
    gap: 12,
  },
  visibilityButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    flex: 1,
    justifyContent: "center",
  },
  activeVisibilityButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  visibilityText: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: "600",
  },
  activeVisibilityText: {
    color: Colors.text.white,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.card,
    fontSize: 14,
    fontFamily: TextStyles.body.fontFamily,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  selectedUsersContainer: {
    marginBottom: 16,
  },
  selectedUsersTitle: {
    ...TextStyles.body,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  selectedUsersList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedUserTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedUserText: {
    ...TextStyles.body,
    color: Colors.text.white,
    fontSize: 12,
  },
  removeUserButton: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 20,
    justifyContent: "center",
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.text.light,
  },
  usersListContainer: {
    maxHeight: 200,
  },
  usersList: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    maxHeight: 200,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  selectedUserItem: {
    backgroundColor: Colors.primary + "20",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userDetails: {
    flex: 1,
  },
  userDisplayName: {
    ...TextStyles.body,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  userUsername: {
    ...TextStyles.body,
    color: Colors.text.light,
    fontSize: 12,
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.text.light,
    textAlign: "center",
    padding: 20,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...TextStyles.button,
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
  },
  testButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  testButtonText: {
    ...TextStyles.body,
    color: Colors.text.white,
    fontSize: 14,
  },
});
