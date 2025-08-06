import { Feather } from "@expo/vector-icons";
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
  recipientId?: string;
  recipientName?: string;
  recipientUsername?: string;
  recipientPhotoURL?: string;
  isPublic?: boolean;
}

type TabType = "sent" | "received";

export default function MyBridgesScreen() {
  const [sentBridges, setSentBridges] = useState<Bridge[]>([]);
  const [receivedBridges, setReceivedBridges] = useState<Bridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("sent");

  useEffect(() => {
    fetchBridges();
  }, []);

  const fetchBridges = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const bridgesRef = collection(db, "bridges");

      // Bridges enviados: todos los que el usuario ha enviado (públicos y privados)
      const sentQuery = query(bridgesRef, where("senderId", "==", user.uid));

      // Bridges recibidos: todos los que el usuario ha recibido (públicos y privados)
      const receivedQuery = query(bridgesRef, where("recipientId", "==", user.uid));

      const [sentSnap, receivedSnap] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery),
      ]);

      // Procesar bridges enviados con información del destinatario
      const sentBridgesWithRecipient = await Promise.all(
        sentSnap.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          const bridge: Bridge = { 
            id: docSnapshot.id, 
            title: data.title || "",
            description: data.description || "",
            emotion: data.emotion || "",
            imageUrl: data.imageUrl,
            createdAt: data.createdAt,
            senderId: data.senderId || "",
            recipientId: data.recipientId,
            isPublic: data.isPublic || false,
            ...data
          };
          
          // Obtener información del destinatario si existe
          if (bridge.recipientId) {
            try {
              const recipientDoc = await getDoc(doc(db, "users", bridge.recipientId));
              if (recipientDoc.exists()) {
                const recipientData = recipientDoc.data() as any;
                bridge.recipientName = recipientData.name || "Usuario";
                bridge.recipientUsername = recipientData.username || "usuario";
                bridge.recipientPhotoURL = recipientData.photoURL;
              }
            } catch (error) {
              console.error("Error fetching recipient data:", error);
            }
          }
          
          return bridge;
        })
      );

      // Procesar bridges recibidos con información del remitente
      const receivedBridgesWithSender = await Promise.all(
        receivedSnap.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          const bridge: Bridge = { 
            id: docSnapshot.id, 
            title: data.title || "",
            description: data.description || "",
            emotion: data.emotion || "",
            imageUrl: data.imageUrl,
            createdAt: data.createdAt,
            senderId: data.senderId || "",
            recipientId: data.recipientId,
            isPublic: data.isPublic || false,
            ...data
          };
          
          // Obtener información del remitente
          try {
            const senderDoc = await getDoc(doc(db, "users", bridge.senderId));
            if (senderDoc.exists()) {
              const senderData = senderDoc.data() as any;
              bridge.recipientName = senderData.name || "Usuario"; // Reutilizamos el campo
              bridge.recipientUsername = senderData.username || "usuario";
              bridge.recipientPhotoURL = senderData.photoURL;
            }
          } catch (error) {
            console.error("Error fetching sender data:", error);
          }
          
          return bridge;
        })
      );

      setSentBridges(sentBridgesWithRecipient);
      setReceivedBridges(receivedBridgesWithSender);
    } catch (error) {
      console.error("Error al cargar puentes:", error);
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

  const renderBridge = (bridge: Bridge, type: "sent" | "received") => (
    <View key={bridge.id} style={styles.bridgeCard}>
      {/* Header con información del usuario */}
      <View style={styles.bridgeHeader}>
        <View style={styles.userInfo}>
          <Image
            source={
              bridge.recipientPhotoURL
                ? { uri: bridge.recipientPhotoURL }
                : require("../assets/default-profile.png")
            }
            style={styles.userAvatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{bridge.recipientName || "Usuario"}</Text>
            <Text style={styles.userUsername}>@{bridge.recipientUsername || "usuario"}</Text>
          </View>
        </View>
        <View style={styles.bridgeMeta}>
          <View style={styles.bridgeType}>
            <Feather 
              name={type === "sent" ? "send" : "inbox"} 
              size={16} 
              color={Colors.primary} 
            />
            <Text style={styles.bridgeTypeText}>
              {type === "sent" ? "Enviado" : "Recibido"}
            </Text>
          </View>
          <Text style={styles.bridgeDate}>{formatDate(bridge.createdAt)}</Text>
        </View>
      </View>

      {/* Indicador de público/privado */}
      <View style={styles.visibilityContainer}>
        <View style={[
          styles.visibilityBadge, 
          bridge.isPublic ? styles.publicBadge : styles.privateBadge
        ]}>
          <Feather 
            name={bridge.isPublic ? "globe" : "lock"} 
            size={12} 
            color={bridge.isPublic ? Colors.text.white : Colors.text.white} 
          />
          <Text style={styles.visibilityText}>
            {bridge.isPublic ? "Público" : "Privado"}
          </Text>
        </View>
        
        {/* Mostrar destinatario para bridges privados enviados */}
        {type === "sent" && !bridge.isPublic && bridge.recipientName && (
          <Text style={styles.recipientText}>
            Para: {bridge.recipientName} (@{bridge.recipientUsername})
          </Text>
        )}
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
        />
      )}
    </View>
  );

  const renderTabButton = (tab: TabType, label: string, icon: string) => (
    <Pressable
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Feather 
        name={icon as any} 
        size={20} 
        color={activeTab === tab ? Colors.text.white : Colors.primary} 
      />
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {label}
      </Text>
    </Pressable>
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
        <Text style={styles.pageTitle}>Mis Bridges</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTabButton("sent", "Enviados", "send")}
        {renderTabButton("received", "Recibidos", "inbox")}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === "sent" ? (
          sentBridges.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="send" size={64} color={Colors.text.light} />
              <Text style={styles.emptyTitle}>No has enviado bridges privados</Text>
              <Text style={styles.emptyText}>
                Los bridges que envíes a usuarios específicos aparecerán aquí.
              </Text>
            </View>
          ) : (
            sentBridges.map((bridge) => renderBridge(bridge, "sent"))
          )
        ) : (
          receivedBridges.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={64} color={Colors.text.light} />
              <Text style={styles.emptyTitle}>No has recibido bridges privados</Text>
              <Text style={styles.emptyText}>
                Los bridges que otros usuarios te envíen aparecerán aquí.
              </Text>
            </View>
          ) : (
            receivedBridges.map((bridge) => renderBridge(bridge, "received"))
          )
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
  pageTitle: {
    ...TextStyles.largeTitle,
    textAlign: "center",
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    ...TextStyles.button,
    fontSize: 14,
    color: Colors.primary,
  },
  activeTabButtonText: {
    color: Colors.text.white,
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
    ...TextStyles.cardTitle,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    color: Colors.text.primary,
  },
  emptyText: {
    ...TextStyles.body,
    textAlign: "center",
    color: Colors.text.secondary,
    lineHeight: 20,
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
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...TextStyles.cardTitle,
    fontSize: 16,
    marginBottom: 2,
  },
  userUsername: {
    ...TextStyles.secondary,
    color: Colors.text.light,
    fontSize: 12,
  },
  bridgeMeta: {
    alignItems: "flex-end",
  },
  bridgeType: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    gap: 4,
  },
  bridgeTypeText: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: TextStyles.body.fontFamily,
    fontWeight: "600",
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
    height: 180,
    borderRadius: 8,
  },
  visibilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  visibilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  publicBadge: {
    backgroundColor: Colors.success,
  },
     privateBadge: {
     backgroundColor: Colors.error,
   },
  visibilityText: {
    fontSize: 12,
    color: Colors.text.white,
    fontFamily: TextStyles.body.fontFamily,
    fontWeight: "600",
  },
  recipientText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 10,
    fontFamily: TextStyles.body.fontFamily,
  },
});
