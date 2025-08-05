import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
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
import defaultProfile from "../assets/default-profile.png";
import BottomNav from "../components/BottomNav";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Typography";
import { auth, db } from "../firebase/config";
import { deleteBridgeImageFromCloudinary } from "../services/cloudinaryService";

interface Bridge {
  id: string;
  title: string;
  description: string;
  emotion: string;
  imageUrl?: string;
  createdAt: any;
  senderId: string;
  isPublic: boolean;
  type: "sent" | "received";
  isDeleting?: boolean;
  senderName?: string;
  senderUsername?: string;
  senderPhotoURL?: string;
}

export default function BridgesScreen() {
  const [myBridges, setMyBridges] = useState<Bridge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/");
      } else {
        fetchMyBridges();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchMyBridges = async () => {
    try {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      // Obtener bridges enviados
      const sentQuery = query(
        collection(db, "bridges"),
        where("senderId", "==", userId)
      );
      const sentSnapshot = await getDocs(sentQuery);
      const sentBridges: Bridge[] = sentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Bridge, "id">),
        type: "sent" as const,
      }));

      // Obtener bridges recibidos (buscar en el array recipientIds)
      const receivedQuery = query(
        collection(db, "bridges"),
        where("recipientIds", "array-contains", userId)
      );
      const receivedSnapshot = await getDocs(receivedQuery);
      const receivedBridges: Bridge[] = await Promise.all(
        receivedSnapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          // Obtener información del remitente
          const senderDoc = await getDoc(doc(db, "users", data.senderId));
          const senderData = senderDoc.exists() ? senderDoc.data() : {};
          
          return {
            id: docSnapshot.id,
            ...(data as Omit<Bridge, "id">),
            type: "received" as const,
            senderName: (senderData as any).name || "Usuario desconocido",
            senderUsername: (senderData as any).username || "desconocido",
            senderPhotoURL: (senderData as any).photoURL || null,
          };
        })
      );

      // Combinar y ordenar por fecha
      const allBridges = [...sentBridges, ...receivedBridges].sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setMyBridges(allBridges);
    } catch (error) {
      console.error("Error fetching bridges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBridge = async (bridgeId: string, bridgeTitle: string) => {
    Alert.alert(
      "Eliminar Bridge",
      `¿Estás seguro de que quieres eliminar "${bridgeTitle}"?\n\nEsta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Encontrar el bridge para obtener la imagen
              const bridgeToDelete = myBridges.find(bridge => bridge.id === bridgeId);
              
              const loadingBridges = myBridges.map(bridge =>
                bridge.id === bridgeId ? { ...bridge, isDeleting: true } : bridge
              );
              setMyBridges(loadingBridges);

              // Eliminar el bridge de Firestore
              await deleteDoc(doc(db, "bridges", bridgeId));
              console.log("Bridge eliminado exitosamente:", bridgeId);
              
              // Eliminar la imagen de Cloudinary si existe
              if (bridgeToDelete?.imageUrl) {
                await deleteBridgeImageFromCloudinary(bridgeToDelete.imageUrl);
              }
              
              setMyBridges(prevBridges =>
                prevBridges.filter(bridge => bridge.id !== bridgeId)
              );
              Alert.alert("Éxito", "Bridge eliminado correctamente");
            } catch (error) {
              console.error("Error al eliminar bridge:", error);
              Alert.alert("Error", "No se pudo eliminar el bridge. Inténtalo de nuevo.");
              setMyBridges(prevBridges =>
                prevBridges.map(bridge =>
                  bridge.id === bridgeId ? { ...bridge, isDeleting: false } : bridge
                )
              );
            }
          },
        },
      ]
    );
  };

  const renderBridge = (bridge: Bridge) => (
    <View key={bridge.id} style={[styles.bridgeCard, bridge.isDeleting && styles.deletingBridge]}>
      <View style={styles.bridgeHeader}>
        <View style={styles.bridgeTypeContainer}>
          <Feather 
            name={bridge.type === "sent" ? "send" : "inbox"} 
            size={16} 
            color={bridge.type === "sent" ? Colors.primary : Colors.secondary} 
          />
          <Text style={styles.bridgeType}>
            {bridge.type === "sent" ? "Enviado" : "Recibido"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.visibilityContainer}>
            <Feather 
              name={bridge.isPublic ? "globe" : "lock"} 
              size={14} 
              color={Colors.text.secondary} 
            />
            <Text style={styles.bridgeVisibility}>
              {bridge.isPublic ? "Público" : "Privado"}
            </Text>
          </View>
          {bridge.type === "sent" && !bridge.isDeleting && (
            <Pressable
              style={styles.deleteButton}
              onPress={() => handleDeleteBridge(bridge.id, bridge.title)}
            >
              <Feather name="trash-2" size={16} color={Colors.error} />
            </Pressable>
          )}
          {bridge.isDeleting && (
            <View style={styles.deletingIndicator}>
              <ActivityIndicator size="small" color={Colors.error} />
              <Text style={styles.deletingText}>Eliminando...</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.bridgeTitle}>{bridge.title}</Text>
      <Text style={styles.bridgeEmotion}>{bridge.emotion}</Text>
      <Text style={styles.bridgeDescription}>{bridge.description}</Text>

      {bridge.imageUrl && (
        <Image 
          source={{ uri: bridge.imageUrl }} 
          style={styles.bridgeImage} 
          resizeMode="cover"
          onError={(error) => {
            console.error("❌ Error cargando imagen:", error.nativeEvent.error);
          }}
        />
      )}

      {bridge.type === "received" && bridge.senderName && (
        <Pressable
          style={styles.senderContainer}
          onPress={() => router.push(`/user/${bridge.senderUsername}`)}
        >
          <Image
            source={
              bridge.senderPhotoURL
                ? { uri: bridge.senderPhotoURL }
                : defaultProfile
            }
            style={styles.senderAvatar}
          />
          <View style={styles.senderInfo}>
            <Text style={styles.senderName}>{bridge.senderName}</Text>
            <Text style={styles.senderUsername}>@{bridge.senderUsername}</Text>
          </View>
          <Feather name="chevron-right" size={16} color={Colors.text.light} />
        </Pressable>
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
          <Text style={styles.loadingText}>Cargando tus bridges...</Text>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Mis Bridges</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {myBridges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={64} color={Colors.text.light} />
            <Text style={styles.emptyTitle}>No tienes bridges aún</Text>
            <Text style={styles.emptyText}>
              Crea tu primer bridge para conectar con otros usuarios
            </Text>
            <Pressable style={styles.createButton} onPress={() => router.push("/create-bridge")}>
              <Text style={styles.createButtonText}>Crear mi primer bridge</Text>
            </Pressable>
          </View>
        ) : (
          myBridges.map(renderBridge)
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
    padding: 20,
    paddingBottom: 10,
  },
  pageTitle: {
    ...TextStyles.largeTitle,
    color: Colors.text.primary,
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
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    ...TextStyles.largeTitle,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    color: Colors.text.primary,
  },
  emptyText: {
    ...TextStyles.body,
    textAlign: "center",
    marginBottom: 24,
    color: Colors.text.secondary,
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
  deletingBridge: {
    opacity: 0.6,
  },
  bridgeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bridgeTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bridgeType: {
    ...TextStyles.secondary,
    color: Colors.text.secondary,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  visibilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bridgeVisibility: {
    ...TextStyles.secondary,
    color: Colors.text.secondary,
  },
  deleteButton: {
    padding: 4,
  },
  deletingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deletingText: {
    ...TextStyles.secondary,
    color: Colors.error,
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
    marginBottom: 12,
  },
  senderContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    ...TextStyles.body,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  senderUsername: {
    ...TextStyles.secondary,
    color: Colors.text.secondary,
  },
  bridgeDate: {
    fontSize: 12,
    color: Colors.text.light,
    fontFamily: TextStyles.secondary.fontFamily,
  },
});

