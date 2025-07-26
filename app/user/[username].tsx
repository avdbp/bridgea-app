import { router, useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import defaultProfile from "../../assets/default-profile.png";
import { auth, db } from "../../firebase/config";

export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserByUsername = async () => {
      if (!username || typeof username !== "string") return;

      try {
        const q = query(collection(db, "users"), where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setUserData(null);
        } else {
          const doc = querySnapshot.docs[0];
          setUserData({ ...doc.data(), uid: doc.id });
        }
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserByUsername();
  }, [username]);

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Usuario no encontrado</Text>
        <Pressable style={styles.backButton} onPress={() => router.replace("/search")}>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const isCurrentUser = auth.currentUser?.uid === userData.uid;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={userData.photoURL ? { uri: userData.photoURL } : defaultProfile}
        style={styles.profileImage}
      />

      <Text style={styles.name}>{userData.name}</Text>
      <Text style={styles.username}>@{userData.username}</Text>

      {isCurrentUser && (
        <>
          <Text style={styles.label}>Correo:</Text>
          <Text style={styles.value}>{userData.email}</Text>
        </>
      )}

      <Text style={styles.label}>Edad:</Text>
      <Text style={styles.value}>{calculateAge(userData.birthDate)} años</Text>

      {userData.createdAt?.toDate && (
        <>
          <Text style={styles.label}>Miembro desde:</Text>
          <Text style={styles.value}>
            {userData.createdAt.toDate().toLocaleDateString()}
          </Text>
        </>
      )}

      <Text style={styles.label}>Ciudad de residencia:</Text>
      <Text style={styles.value}>
        {userData.residenceCity || "No especificada"}
      </Text>

      <Text style={styles.label}>Ubicación actual:</Text>
      <Text style={styles.value}>
        {userData.showCurrentLocation
          ? userData.currentLocation || "No disponible"
          : "No disponible actualmente"}
      </Text>

      <Text style={styles.label}>Biografía:</Text>
      <Text style={styles.bio}>
        {userData.bio || "Este usuario aún no ha escrito una bio."}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center", backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  name: { fontSize: 24, fontWeight: "bold" },
  username: { fontSize: 16, color: "#555", marginBottom: 10 },
  label: { marginTop: 10, fontWeight: "bold", alignSelf: "flex-start" },
  value: { alignSelf: "flex-start", marginBottom: 5 },
  bio: { marginTop: 10, fontStyle: "italic", textAlign: "center", paddingHorizontal: 10 },
  notFound: { fontSize: 18, color: "red", marginBottom: 20 },
  backButton: {
    backgroundColor: "#8e44ad",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  backText: { color: "#fff", fontWeight: "bold" },
});
