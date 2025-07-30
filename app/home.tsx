import { router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
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
import BottomNav from "../components/BottomNav";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Typography";
import { auth, db } from "../firebase/config";

interface Bridge {
  id: string;
  title: string;
  description: string;
  emotion: string;
  imageUrl?: string;
  createdAt: any;
  senderId: string;
}

export default function HomeScreen() {
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/");
      }
    });

    fetchBridges();
    return () => unsubscribe();
  }, []);

  const fetchBridges = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(collection(db, "bridges"), where("isPublic", "==", true));
      const querySnapshot = await getDocs(q);

      const bridgesRaw: Bridge[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...(data as Omit<Bridge, "id">),
        };
      });

      // Ordenamos en el cliente por createdAt
      bridgesRaw.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB.getTime() - dateA.getTime(); // Orden descendente
      });

      setBridges(bridgesRaw);
      console.log("Bridges públicos cargados:", bridgesRaw.length);
    } catch (error) {
      console.log("Error al cargar bridges:", error);
      setError("Error al cargar los bridges");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const renderBridge = (bridge: Bridge) => (
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
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando bridges...</Text>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://res.cloudinary.com/dqph2qm49/image/upload/v1753805555/bridgea/logo-beta2_pfl5jp.png",
          }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchBridges}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : bridges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>¡Bienvenido a Bridgea!</Text>
            <Text style={styles.emptyText}>
              Aún no hay bridges públicos. Sé el primero en crear uno y conectar con otros usuarios.
            </Text>
            <Pressable style={styles.createButton} onPress={() => router.push("/create-bridge")}>
              <Text style={styles.createButtonText}>Crear mi primer bridge</Text>
            </Pressable>
          </View>
        ) : (
          bridges.map(renderBridge)
        )}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
  },
  logo: {
    width: 120,
    height: 40,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    ...TextStyles.button,
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
    fontFamily: TextStyles.body.fontFamily,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    ...TextStyles.body,
    color: Colors.error,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    ...TextStyles.button,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    ...TextStyles.largeTitle,
    textAlign: "center",
    marginBottom: 16,
    color: Colors.text.primary,
  },
  emptyText: {
    ...TextStyles.body,
    textAlign: "center",
    marginBottom: 24,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    ...TextStyles.button,
    fontSize: 16,
    fontWeight: "bold",
  },
  bridgeCard: {
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
});
