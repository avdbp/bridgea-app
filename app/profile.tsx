import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import defaultProfile from "../assets/default-profile.png";
import { auth, db } from "../firebase/config";

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [bio, setBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;

      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setBio(data.bio || "");
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
      const base64Img = `data:image/jpg;base64,${pickerResult.assets[0].base64}`;

      const data = {
        file: base64Img,
        upload_preset: "bridgea", // 👈🏼 recuerda que este preset debe estar activo en tu Cloudinary
      };

      try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dqph2qm49/image/upload", {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "content-type": "application/json" },
        });

        const file = await res.json();
        const imageUrl = file.secure_url;

        // update Firestore
        const userRef = doc(db, "users", auth.currentUser!.uid);
        await updateDoc(userRef, { photoURL: imageUrl });

        // update local state
        setUserData((prev: any) => ({ ...prev, photoURL: imageUrl }));
        Alert.alert("Éxito", "Foto de perfil actualizada");
      } catch (error) {
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

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (!userData) return <Text style={styles.loading}>Cargando perfil...</Text>;

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  loading: { marginTop: 50, textAlign: "center", fontSize: 16 },
  profileImage: { width: 120, height: 120, borderRadius: 60, alignSelf: "center", marginBottom: 20 },
  uploadButton: {
    backgroundColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    alignSelf: "center",
    marginBottom: 20,
  },
  uploadButtonText: { color: "#333" },
  label: { fontWeight: "bold", marginTop: 10 },
  value: { marginBottom: 8 },
  bioInput: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: "top",
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
    marginTop: 30,
    alignSelf: "center",
  },
  logoutText: {
    color: "red",
    fontWeight: "bold",
  },
});
