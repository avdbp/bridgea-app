import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
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
import defaultProfile from "../assets/default-profile.png";
import { auth, db } from "../firebase/config";
import { uploadImageToCloudinary } from "../services/cloudinaryService";

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [bio, setBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [currentCity, setCurrentCity] = useState<string | null>(null);
  const [showLocation, setShowLocation] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;

      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setBio(data.bio || "");
        setShowLocation(data.showCurrentLocation || false);
        setCurrentCity(data.currentLocation || null);
      }
    };

    fetchUserData();
  }, []);

  const calculateAge = (birthDateStr: string) => {
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso denegado", "Se necesita permiso para acceder a tus fotos.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
    });

    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      const uri = pickerResult.assets[0].uri;
      try {
        const imageUrl = await uploadImageToCloudinary(uri);

        if (!imageUrl) {
          Alert.alert("Error", "No se pudo subir la imagen a Cloudinary.");
          return;
        }

        const userRef = doc(db, "users", auth.currentUser!.uid);
        await updateDoc(userRef, { photoURL: imageUrl });

        setUserData((prev: any) => ({ ...prev, photoURL: imageUrl }));
        Alert.alert("Éxito", "Foto de perfil actualizada");
      } catch (error) {
        console.log("Error al subir la imagen:", error);
        Alert.alert("Error", "Hubo un problema al subir la imagen.");
      }
    }
  };

  const handleSaveBio = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser!.uid);
      await updateDoc(userRef, { bio });
      setEditingBio(false);
      Alert.alert("Guardado", "Tu biografía ha sido actualizada.");
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la bio.");
    }
  };

  const fetchCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "No se pudo acceder a la ubicación.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync(location.coords);

      const fullLocation = `${place.city || place.subregion || "Ubicación desconocida"}, ${place.region || ""}, ${place.country || ""}`;
      setCurrentCity(fullLocation);

      const userRef = doc(db, "users", auth.currentUser!.uid);
      await updateDoc(userRef, {
        currentLocation: fullLocation,
        showCurrentLocation: true,
      });
    } catch (error) {
      console.log("Error obteniendo ubicación:", error);
      Alert.alert("Error", "No se pudo obtener la ubicación.");
    }
  };

  const disableCurrentLocation = async () => {
    setCurrentCity(null);
    const userRef = doc(db, "users", auth.currentUser!.uid);
    await updateDoc(userRef, {
      showCurrentLocation: false,
    });
  };

  const handleToggleLocation = async (value: boolean) => {
    setShowLocation(value);
    if (value) {
      await fetchCurrentLocation();
    } else {
      await disableCurrentLocation();
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (!userData) return <Text style={styles.loading}>Cargando perfil...</Text>;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={userData.photoURL ? { uri: userData.photoURL } : defaultProfile}
          style={styles.profileImage}
        />

        <Pressable style={styles.uploadButton} onPress={handlePickImage}>
          <Text style={styles.uploadButtonText}>Cambiar foto</Text>
        </Pressable>

        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.value}>{userData.name}</Text>

        <Text style={styles.label}>Username:</Text>
        <Text style={styles.value}>{userData.username}</Text>

        <Text style={styles.label}>Correo:</Text>
        <Text style={styles.value}>{userData.email}</Text>

        <Text style={styles.label}>Edad:</Text>
        <Text style={styles.value}>{calculateAge(userData.birthDate)} años</Text>

        <Text style={styles.label}>Ciudad de residencia:</Text>
        <Text style={styles.value}>{userData.residenceCity || "No especificada"}</Text>

        <Text style={styles.label}>Ubicación actual:</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <Switch value={showLocation} onValueChange={handleToggleLocation} />
          <Text style={{ marginLeft: 10 }}>
            {showLocation && currentCity ? currentCity : "No disponible actualmente"}
          </Text>
        </View>

        <Text style={styles.label}>Fecha de registro:</Text>
        <Text style={styles.value}>
          {userData.createdAt?.toDate
            ? userData.createdAt.toDate().toLocaleDateString()
            : "No disponible"}
        </Text>

        <Text style={styles.label}>Bio:</Text>
        {editingBio ? (
          <>
            <TextInput
              style={styles.bioInput}
              multiline
              numberOfLines={3}
              value={bio}
              onChangeText={setBio}
            />
            <Pressable style={styles.button} onPress={handleSaveBio}>
              <Text style={styles.buttonText}>Guardar</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.value}>{bio || "Sin biografía aún."}</Text>
            <Pressable style={styles.button} onPress={() => setEditingBio(true)}>
              <Text style={styles.buttonText}>Editar bio</Text>
            </Pressable>
          </>
        )}

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>

        <Pressable style={styles.searchButton} onPress={() => router.push("/search")}>
          <Text style={styles.searchButtonText}>Buscar usuarios</Text>
        </Pressable>

        <Pressable style={styles.bridgeButton} onPress={() => router.push("/create-bridge")}>
          <Text style={styles.bridgeButtonText}>Crear puente</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", alignItems: "center" },
  loading: { marginTop: 50, textAlign: "center", fontSize: 16 },
  profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  uploadButton: {
    backgroundColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginBottom: 20,
  },
  uploadButtonText: { color: "#333" },
  label: { fontWeight: "bold", marginTop: 10, alignSelf: "flex-start" },
  value: { alignSelf: "flex-start", marginBottom: 8 },
  bioInput: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: "top",
    width: "100%",
  },
  button: {
    backgroundColor: "#8e44ad",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  logoutButton: {
    marginTop: 20,
    alignSelf: "center",
  },
  logoutText: {
    color: "red",
    fontWeight: "bold",
  },
  searchButton: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignSelf: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  bridgeButton: {
    backgroundColor: "#f39c12",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "center",
  },
  bridgeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
