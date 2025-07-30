import { router } from "expo-router";
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
import BottomNav from "../components/BottomNav";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Typography";
import { auth, db } from "../firebase/config";

interface Bridge {
  id: string;
  senderId: string;
  recipientId?: string;
  title: string;
  description: string;
  emotion: string;
  imageUrl?: string;
  isPublic: boolean;
  createdAt: any;
  type: "sent" | "received";
  senderName?: string;
  senderUsername?: string;
  senderPhoto?: string | null;
  isDeleting?: boolean;
}

export default function BridgesScreen() {
  const [myBridges, setMyBridges] = useState<Bridge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBridges = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const bridgesRef = collection(db, "bridges");

        // Obtener todos los bridges del usuario (enviados y recibidos)
        const sentQuery = query(bridgesRef, where("senderId", "==", user.uid));
        const receivedQuery = query(bridgesRef, where("recipientId", "==", user.uid));

        const [sentSnap, receivedSnap] = await Promise.all([
          getDocs(sentQuery),
          getDocs(receivedQuery),
        ]);

        const sentBridges: Bridge[] = sentSnap.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data(),
          type: "sent"
        } as Bridge));
        
        const receivedBridges: Bridge[] = receivedSnap.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data(),
          type: "received"
        } as Bridge));

        // Obtener información del remitente para bridges recibidos
        const bridgesWithSenderInfo = await Promise.all(
          receivedBridges.map(async (bridge) => {
            try {
              const senderDoc = await getDoc(doc(db, "users", bridge.senderId));
              const senderData = senderDoc.exists() ? senderDoc.data() : {};
              return {
                ...bridge,
                senderName: senderData.name || "Usuario desconocido",
                senderUsername: senderData.username || "desconocido",
                senderPhoto: senderData.photoURL || null,
              };
            } catch (error) {
              console.error("Error obteniendo información del remitente:", error);
              return {
                ...bridge,
                senderName: "Usuario desconocido",
                senderUsername: "desconocido",
                senderPhoto: null,
              };
            }
          })
        );

        // Combinar y ordenar por fecha
        const allBridges = [...sentBridges, ...bridgesWithSenderInfo].sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return dateB.getTime() - dateA.getTime(); // Orden descendente
        });

        setMyBridges(allBridges);
        console.log("Mis bridges cargados:", allBridges);
      } catch (error) {
        console.error("Error al cargar mis bridges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBridges();
  }, []);

  const handleSenderPress = (senderUsername: string) => {
    if (senderUsername && senderUsername !== "desconocido") {
      router.push(`/user/${senderUsername}`);
    }
  };

  const handleDeleteBridge = async (bridgeId: string, bridgeTitle: string) => {
    Alert.alert(
      "🗑️ Eliminar Bridge",
      `¿Estás seguro de que quieres eliminar "${bridgeTitle}"?\n\nEsta acción no se puede deshacer y el bridge desaparecerá permanentemente.`,
      [
        {
          text: "❌ Cancelar",
          style: "cancel",
        },
        {
          text: "🗑️ Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Mostrar indicador de carga solo para esta operación
              const loadingBridges = myBridges.map(bridge => 
                bridge.id === bridgeId ? { ...bridge, isDeleting: true } : bridge
              );
              setMyBridges(loadingBridges);
              
              await deleteDoc(doc(db, "bridges", bridgeId));
              console.log("Bridge eliminado exitosamente:", bridgeId);
              
              // Actualizar la lista local removiendo el bridge eliminado
              setMyBridges(prevBridges => 
                prevBridges.filter(bridge => bridge.id !== bridgeId)
              );
              
              Alert.alert("✅ Éxito", "Bridge eliminado correctamente");
            } catch (error) {
              console.error("Error al eliminar bridge:", error);
              Alert.alert("❌ Error", "No se pudo eliminar el bridge. Inténtalo de nuevo.");
              
              // Restaurar el bridge en caso de error
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
        <Text style={styles.bridgeType}>
          {bridge.type === "sent" ? "📤 Enviado" : "📥 Recibido"}
        </Text>
        <View style={styles.headerRight}>
          <Text style={styles.bridgeVisibility}>
            {bridge.isPublic ? "🌍 Público" : "🔒 Privado"}
          </Text>
          {/* Botón de eliminar solo para bridges enviados */}
          {bridge.type === "sent" && !bridge.isDeleting && (
            <Pressable
              style={styles.deleteButton}
              onPress={() => handleDeleteBridge(bridge.id, bridge.title)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </Pressable>
          )}
          {/* Indicador de eliminación */}
          {bridge.isDeleting && (
            <View style={styles.deletingIndicator}>
              <ActivityIndicator size="small" color="#e74c3c" />
              <Text style={styles.deletingText}>Eliminando...</Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Mostrar información del remitente para bridges recibidos */}
      {bridge.type === "received" && (
        <Pressable 
          style={styles.senderContainer}
          onPress={() => handleSenderPress(bridge.senderUsername || "")}
        >
          <Image
            source={
              bridge.senderPhoto
                ? { uri: bridge.senderPhoto }
                : require("../assets/default-profile.png")
            }
            style={styles.senderAvatar}
          />
          <View style={styles.senderInfo}>
            <Text style={styles.senderName}>{bridge.senderName}</Text>
            <Text style={styles.senderUsername}>@{bridge.senderUsername}</Text>
          </View>
          <Text style={styles.senderLabel}>te envió este bridge</Text>
        </Pressable>
      )}
      
      <Text style={styles.bridgeTitle}>{bridge.title}</Text>
      <Text style={styles.bridgeEmotion}>{bridge.emotion}</Text>
      <Text style={styles.bridgeDescription}>{bridge.description}</Text>
      
      {bridge.imageUrl ? (
        <Image source={{ uri: bridge.imageUrl }} style={styles.image} />
      ) : null}
      
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Mis Bridges 🌉</Text>
        
        {myBridges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Aún no tienes bridges</Text>
            <Text style={styles.emptyText}>
              Crea tu primer bridge para empezar a conectar con otros usuarios
            </Text>
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
  pageTitle: {
    ...TextStyles.largeTitle,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    ...TextStyles.cardTitle,
    marginBottom: 10,
  },
  emptyText: {
    ...TextStyles.body,
    textAlign: "center",
    color: Colors.text.secondary,
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
    marginBottom: 8,
  },
  bridgeType: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
    fontFamily: TextStyles.secondary.fontFamily,
  },
  bridgeVisibility: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "500",
    fontFamily: TextStyles.secondary.fontFamily,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 6,
    backgroundColor: Colors.error,
  },
  deleteButtonText: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: TextStyles.button.fontFamily,
  },
  deletingBridge: {
    opacity: 0.6,
  },
  deletingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  deletingText: {
    fontSize: 12,
    color: Colors.error,
    marginLeft: 4,
    fontWeight: "500",
    fontFamily: TextStyles.secondary.fontFamily,
  },
  senderContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.light,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    fontFamily: TextStyles.body.fontFamily,
  },
  senderUsername: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: TextStyles.secondary.fontFamily,
  },
  senderLabel: {
    fontSize: 12,
    color: Colors.primary,
    fontStyle: "italic",
    fontFamily: TextStyles.secondary.fontFamily,
  },
  bridgeTitle: {
    ...TextStyles.cardTitle,
    marginBottom: 4,
  },
  bridgeEmotion: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 8,
    fontFamily: TextStyles.body.fontFamily,
  },
  bridgeDescription: {
    ...TextStyles.body,
    marginBottom: 12,
  },
  bridgeDate: {
    fontSize: 12,
    color: Colors.text.light,
    marginTop: 8,
    fontFamily: TextStyles.secondary.fontFamily,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
});

