import { router } from "expo-router";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
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
import { db } from "../firebase/config";

export default function PublicBridgesScreen() {
  const [bridgesWithAuthor, setBridgesWithAuthor] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicBridges = async () => {
      try {
        const q = query(
          collection(db, "bridges"),
          where("isPublic", "==", true),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);

        const bridgesRaw = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const bridgesWithAuthorData = await Promise.all(
          bridgesRaw.map(async (bridge: any) => {
            const userDoc = await getDoc(doc(db, "users", bridge.senderId));
            const userData = userDoc.exists() ? userDoc.data() : {};
            return {
              ...bridge,
              authorUsername: userData.username || "desconocido",
              authorName: userData.name || "",
            };
          })
        );

        setBridgesWithAuthor(bridgesWithAuthorData);
      } catch (error) {
        console.error("Error al cargar puentes públicos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicBridges();
  }, []);

  const handleUserPress = (username: string) => {
    if (username) {
      router.push(`/user/${username}`);
    }
  };

  const renderBridge = (bridge: any) => (
    <View key={bridge.id} style={styles.bridgeCard}>
      <Text style={styles.bridgeTitle}>{bridge.title}</Text>
      <Text style={styles.bridgeEmotion}>{bridge.emotion}</Text>
      <Text style={styles.bridgeDescription}>{bridge.description}</Text>

      {bridge.imageUrl && (
        <Image source={{ uri: bridge.imageUrl }} style={styles.image} />
      )}

      <Pressable onPress={() => handleUserPress(bridge.authorUsername)}>
        <Text style={styles.authorText}>@{bridge.authorUsername}</Text>
      </Pressable>

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
      <Text style={styles.sectionTitle}>🌉 Puentes públicos</Text>
      {bridgesWithAuthor.length === 0 ? (
        <Text style={styles.emptyText}>Aún no se ha publicado ningún puente público.</Text>
      ) : (
        bridgesWithAuthor.map(renderBridge)
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#8e44ad",
  },
  emptyText: {
    fontStyle: "italic",
    color: "#777",
    textAlign: "center",
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
  bridgeDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    fontStyle: "italic",
  },
  image: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  authorText: {
    color: "#8e44ad",
    fontWeight: "bold",
    marginTop: 8,
    fontSize: 14,
  },
});
