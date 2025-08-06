import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
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
  senderName?: string;
  senderUsername?: string;
  senderPhotoURL?: string;
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

      // Obtener información del autor para cada bridge
      const bridgesWithAuthor = await Promise.all(
        bridgesRaw.map(async (bridge) => {
          try {
            const userDoc = await getDoc(doc(db, "users", bridge.senderId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                ...bridge,
                senderName: userData.name || "Usuario",
                senderUsername: userData.username || "usuario",
                senderPhotoURL: userData.photoURL,
              };
            }
            return bridge;
          } catch (error) {
            console.error("Error fetching user data:", error);
            return bridge;
          }
        })
      );

      // Ordenamos en el cliente por createdAt
      bridgesWithAuthor.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB.getTime() - dateA.getTime(); // Orden descendente
      });

      setBridges(bridgesWithAuthor);
      console.log("Bridges públicos cargados:", bridgesWithAuthor.length);
    } catch (error) {
      console.log("Error al cargar bridges:", error);
      setError("Error al cargar los bridges");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "Fecha no disponible";
    
    const dateObj = date.toDate?.() || new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Hace unos minutos";
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    if (diffInHours < 48) return "Ayer";
    
    return dateObj.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEmotionIcon = (emotion: string) => {
    const emotionIcons: { [key: string]: string } = {
      'alegría': '😊',
      'tristeza': '😢',
      'nostalgia': '🥺',
      'amor': '❤️',
      'gratitud': '🙏',
      'esperanza': '✨',
      'paz': '🕊️',
      'energía': '⚡',
      'creatividad': '🎨',
      'reflexión': '🤔'
    };
    return emotionIcons[emotion.toLowerCase()] || '💭';
  };

  const renderBridge = (bridge: Bridge) => (
    <View key={bridge.id} style={styles.bridgeCard}>
      {/* Header con información del autor */}
      <View style={styles.bridgeHeader}>
        <View style={styles.authorInfo}>
          <Image
            source={
              bridge.senderPhotoURL
                ? { uri: bridge.senderPhotoURL }
                : require("../assets/default-profile.png")
            }
            style={styles.authorAvatar}
          />
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{bridge.senderName || "Usuario"}</Text>
            <Text style={styles.authorUsername}>@{bridge.senderUsername || "usuario"}</Text>
          </View>
        </View>
        <Text style={styles.bridgeDate}>{formatDate(bridge.createdAt)}</Text>
      </View>

      {/* Contenido del bridge */}
      <Text style={styles.bridgeTitle}>{bridge.title}</Text>
      
      {/* Etiqueta emocional */}
      <View style={styles.emotionTag}>
        <Text style={styles.emotionIcon}>{getEmotionIcon(bridge.emotion)}</Text>
        <Text style={styles.bridgeEmotion}>#{bridge.emotion.toLowerCase()}</Text>
      </View>
      
      <Text style={styles.bridgeDescription}>{bridge.description}</Text>
      
      {bridge.imageUrl && (
        <Image
          source={{ uri: bridge.imageUrl }}
          style={styles.bridgeImage}
          resizeMode="cover"
        />
      )}
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
        <View style={styles.headerContent}>
          <Image
            source={{
              uri: "https://res.cloudinary.com/dqph2qm49/image/upload/v1753805555/bridgea/logo-beta2_pfl5jp.png",
            }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Inicio</Text>
        </View>
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
    backgroundColor: Colors.card,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    ...TextStyles.largeTitle,
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: "bold",
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
  bridgeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    ...TextStyles.cardTitle,
    fontSize: 16,
    marginBottom: 2,
  },
  authorUsername: {
    ...TextStyles.secondary,
    color: Colors.text.light,
    fontSize: 12,
  },
  bridgeDate: {
    fontSize: 12,
    color: Colors.text.light,
    fontFamily: TextStyles.secondary.fontFamily,
  },
  bridgeTitle: {
    ...TextStyles.cardTitle,
    marginBottom: 8,
    fontSize: 18,
  },
  emotionTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  emotionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  bridgeEmotion: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: TextStyles.body.fontFamily,
    fontWeight: "600",
  },
  bridgeDescription: {
    ...TextStyles.body,
    marginBottom: 12,
    lineHeight: 20,
  },
  bridgeImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
});
