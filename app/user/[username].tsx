import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
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
import { Colors } from "../../constants/Colors";
import { TextStyles } from "../../constants/Typography";
import { db } from "../../firebase/config";

interface UserData {
  id: string;
  name: string;
  username: string;
  email: string;
  photoURL?: string;
  bio?: string;
  residenceCity?: string;
  createdAt: any;
}

interface Bridge {
  id: string;
  title: string;
  description: string;
  emotion: string;
  imageUrl?: string;
  createdAt: any;
}

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userBridges, setUserBridges] = useState<Bridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar usuario por username
      const usersQuery = query(
        collection(db, "users"),
        where("username", "==", username)
      );
      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        setError("Usuario no encontrado");
        return;
      }

      const userDoc = usersSnapshot.docs[0];
      const user = {
        id: userDoc.id,
        ...userDoc.data(),
      } as UserData;

      setUserData(user);

      // Buscar bridges públicos del usuario
      const bridgesQuery = query(
        collection(db, "bridges"),
        where("senderId", "==", user.id),
        where("isPublic", "==", true)
      );
      const bridgesSnapshot = await getDocs(bridgesQuery);

      const bridges: Bridge[] = bridgesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Bridge));

      // Ordenar por fecha de creación (más recientes primero)
      bridges.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setUserBridges(bridges);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      fetchUserData();
    }
  }, [username, fetchUserData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  if (error || !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Feather name="user-x" size={64} color={Colors.text.light} />
          <Text style={styles.errorTitle}>Usuario no encontrado</Text>
          <Text style={styles.errorText}>
            {error || "El usuario que buscas no existe"}
          </Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </Pressable>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={Colors.primary} />
          </Pressable>
          <Text style={styles.pageTitle}>Perfil de Usuario</Text>
        </View>

        <View style={styles.profileSection}>
          <Image
            source={
              userData.photoURL
                ? { uri: userData.photoURL }
                : defaultProfile
            }
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userUsername}>@{userData.username}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="mail" size={20} color={Colors.text.primary} />
            <Text style={styles.sectionTitle}>Información de Contacto</Text>
          </View>
          <Text style={styles.sectionText}>{userData.email}</Text>
        </View>

        {userData.residenceCity && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="map-pin" size={20} color={Colors.text.primary} />
              <Text style={styles.sectionTitle}>Ubicación</Text>
            </View>
            <Text style={styles.sectionText}>{userData.residenceCity}</Text>
          </View>
        )}

        {userData.bio && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="user" size={20} color={Colors.text.primary} />
              <Text style={styles.sectionTitle}>Biografía</Text>
            </View>
            <Text style={styles.sectionText}>{userData.bio}</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="calendar" size={20} color={Colors.text.primary} />
            <Text style={styles.sectionTitle}>Miembro desde</Text>
          </View>
          <Text style={styles.sectionText}>
            {userData.createdAt?.toDate?.().toLocaleDateString() || "Fecha no disponible"}
          </Text>
        </View>

        <View style={styles.bridgesSection}>
          <View style={styles.sectionHeader}>
            <Feather name="inbox" size={20} color={Colors.text.primary} />
            <Text style={styles.sectionTitle}>Bridges Públicos</Text>
            <Text style={styles.bridgeCount}>({userBridges.length})</Text>
          </View>

          {userBridges.length === 0 ? (
            <View style={styles.emptyBridges}>
              <Feather name="inbox" size={48} color={Colors.text.light} />
              <Text style={styles.emptyBridgesText}>
                Este usuario aún no tiene bridges públicos
              </Text>
            </View>
          ) : (
            userBridges.map((bridge) => (
              <View key={bridge.id} style={styles.bridgeCard}>
                <Text style={styles.bridgeTitle}>{bridge.title}</Text>
                <Text style={styles.bridgeEmotion}>{bridge.emotion}</Text>
                <Text style={styles.bridgeDescription}>{bridge.description}</Text>
                {bridge.imageUrl && (
                  <Image
                    source={{ uri: bridge.imageUrl }}
                    style={styles.bridgeImage}
                    resizeMode="cover"
                  />
                )}
                <Text style={styles.bridgeDate}>
                  {bridge.createdAt?.toDate?.().toLocaleString() || "Fecha no disponible"}
                </Text>
              </View>
            ))
          )}
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
  },
  centered: {
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
  errorTitle: {
    ...TextStyles.largeTitle,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    color: Colors.text.primary,
  },
  errorText: {
    ...TextStyles.body,
    textAlign: "center",
    marginBottom: 24,
    color: Colors.text.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  pageTitle: {
    ...TextStyles.largeTitle,
    marginLeft: 12,
    color: Colors.text.primary,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  userName: {
    ...TextStyles.largeTitle,
    textAlign: "center",
    marginBottom: 4,
    color: Colors.text.primary,
  },
  userUsername: {
    ...TextStyles.body,
    textAlign: "center",
    color: Colors.text.secondary,
  },
  section: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    ...TextStyles.cardTitle,
    color: Colors.text.primary,
  },
  sectionText: {
    ...TextStyles.body,
    color: Colors.text.secondary,
  },
  bridgesSection: {
    marginTop: 8,
  },
  bridgeCount: {
    ...TextStyles.secondary,
    color: Colors.text.light,
    marginLeft: 4,
  },
  emptyBridges: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyBridgesText: {
    ...TextStyles.body,
    textAlign: "center",
    marginTop: 16,
    color: Colors.text.secondary,
  },
  bridgeCard: {
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
  bridgeTitle: {
    ...TextStyles.cardTitle,
    marginBottom: 8,
  },
  bridgeEmotion: {
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 8,
    fontFamily: TextStyles.body.fontFamily,
  },
  bridgeDescription: {
    ...TextStyles.body,
    marginBottom: 12,
  },
  bridgeImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  bridgeDate: {
    fontSize: 12,
    color: Colors.text.light,
    fontFamily: TextStyles.secondary.fontFamily,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    ...TextStyles.button,
    color: Colors.primary,
  },
});
