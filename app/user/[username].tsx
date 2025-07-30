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
import { SafeAreaView } from "react-native-safe-area-context";
import defaultProfile from "../../assets/default-profile.png";
import BottomNav from "../../components/BottomNav";
import { auth, db } from "../../firebase/config";
import { Colors } from "../../constants/Colors";
import { TextStyles } from "../../constants/Typography";

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
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.notFound}>Usuario no encontrado</Text>
          <Pressable style={styles.backButton} onPress={() => router.replace("/search")}>
            <Text style={styles.backText}>Volver</Text>
          </Pressable>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  const isCurrentUser = auth.currentUser?.uid === userData.uid;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={userData.photoURL ? { uri: userData.photoURL } : defaultProfile}
          style={styles.profileImage}
        />

        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.username}>@{userData.username}</Text>

        {isCurrentUser && (
          <View style={styles.section}>
            <Text style={styles.label}>Correo:</Text>
            <Text style={styles.value}>{userData.email}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Edad:</Text>
          <Text style={styles.value}>{calculateAge(userData.birthDate)} años</Text>
        </View>

        {userData.createdAt?.toDate && (
          <View style={styles.section}>
            <Text style={styles.label}>Miembro desde:</Text>
            <Text style={styles.value}>
              {userData.createdAt.toDate().toLocaleDateString()}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Ciudad de residencia:</Text>
          <Text style={styles.value}>
            {userData.residenceCity || "No especificada"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ubicación actual:</Text>
          <Text style={styles.value}>
            {userData.showCurrentLocation
              ? userData.currentLocation || "No disponible"
              : "No disponible actualmente"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Biografía:</Text>
          <Text style={styles.bio}>
            {userData.bio || "Este usuario aún no ha escrito una bio."}
          </Text>
        </View>
      </ScrollView>
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
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
    fontFamily: TextStyles.body.fontFamily,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  name: {
    ...TextStyles.cardTitle,
    fontSize: 24,
    marginBottom: 8,
  },
  username: {
    ...TextStyles.secondary,
    fontSize: 16,
    marginBottom: 20,
    color: Colors.text.secondary,
  },
  section: {
    width: "100%",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    ...TextStyles.body,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  value: {
    ...TextStyles.body,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  bio: {
    ...TextStyles.body,
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 10,
    color: Colors.text.secondary,
  },
  notFound: {
    ...TextStyles.cardTitle,
    color: Colors.error,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backText: {
    ...TextStyles.button,
    color: Colors.text.white,
  },
});
