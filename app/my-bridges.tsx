import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { auth, db } from "../firebase/config";

export default function MyBridgesScreen() {
  const [sentBridges, setSentBridges] = useState<any[]>([]);
  const [receivedBridges, setReceivedBridges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBridges = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const bridgesRef = collection(db, "bridges");

        const sentQuery = query(bridgesRef, where("senderId", "==", user.uid), where("isPublic", "==", false));
        const receivedQuery = query(bridgesRef, where("recipientId", "==", user.uid), where("isPublic", "==", false));

        const [sentSnap, receivedSnap] = await Promise.all([
          getDocs(sentQuery),
          getDocs(receivedQuery),
        ]);

        setSentBridges(sentSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setReceivedBridges(receivedSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error al cargar puentes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBridges();
  }, []);

  const renderBridge = (bridge: any, type: "sent" | "received") => (
    <View key={bridge.id} style={styles.bridgeCard}>
      <Text style={styles.bridgeTitle}>{bridge.title}</Text>
      <Text style={styles.bridgeEmotion}>{bridge.emotion}</Text>
      <Text style={styles.bridgeDescription}>{bridge.description}</Text>
      {bridge.imageUrl ? (
        <Image source={{ uri: bridge.imageUrl }} style={styles.image} />
      ) : null}
      <Text style={styles.bridgeType}>
        {type === "sent" ? "📤 Enviado" : "📥 Recibido"}
      </Text>
      <Text style={styles.bridgeDate}>
        {bridge.createdAt?.toDate().toLocaleString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8e44ad" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>📤 Puentes enviados</Text>
      {sentBridges.length === 0 ? (
        <Text style={styles.emptyText}>No has enviado ningún puente aún.</Text>
      ) : (
        sentBridges.map((bridge) => renderBridge(bridge, "sent"))
      )}

      <Text style={styles.sectionTitle}>📥 Puentes recibidos</Text>
      {receivedBridges.length === 0 ? (
        <Text style={styles.emptyText}>No has recibido ningún puente todavía.</Text>
      ) : (
        receivedBridges.map((bridge) => renderBridge(bridge, "received"))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    paddingBottom: 60,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#8e44ad",
  },
  emptyText: {
    fontStyle: "italic",
    color: "#777",
    marginBottom: 20,
  },
  bridgeCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  bridgeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  bridgeEmotion: {
    fontSize: 14,
    color: "#8e44ad",
    marginBottom: 5,
  },
  bridgeDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  bridgeType: {
    fontSize: 13,
    color: "#555",
    fontStyle: "italic",
    marginTop: 5,
  },
  bridgeDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: 10,
  },
});
