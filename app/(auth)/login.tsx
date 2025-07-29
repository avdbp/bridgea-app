import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import BottomNav from "../../components/BottomNav";
import { db } from "../../firebase/config";

export default function HomeScreen() {
  const [bridges, setBridges] = useState<any[]>([]);
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
          ...(doc.data() as { [key: string]: any }),
        }));

        const bridgesWithAuthorData = await Promise.all(
          bridgesRaw.map(async (bridge: any) => {
            const userDoc = await getDoc(doc(db, "users", bridge.senderId));
            const userData = userDoc.exists() ? userDoc.data() : {};
            return {
              ...bridge,
              authorUsername: userData.username || "desconocido",
              authorName: userData.name || "",
              authorPhoto: userData.photoURL || null,
            };
          })
        );

        setBridges(bridgesWithAuthorData);
      } catch (error) {
        console.error("Error fetching bridges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicBridges();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8e44ad" />
        <Text>Cargando puentes públicos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container}>
        {bridges.length === 0 ? (
          <Text style={styles.empty}>No hay puentes públicos todavía.</Text>
        ) : (
          bridges.map((bridge) => (
            <View key={bridge.id} style={styles.bridgeCard}>
              <View style={styles.authorInfo}>
                <Image
                  source={
                    bridge.authorPhoto
                      ? { uri: bridge.authorPhoto }
                      : require("../assets/default-profile.png")
                  }
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.authorName}>{bridge.authorName}</Text>
                  <Text style={styles.authorUsername}>@{bridge.authorUsername}</Text>
                </View>
              </View>
              <Text style={styles.content}>{bridge.content}</Text>
              <Text style={styles.date}>
                {bridge.createdAt?.toDate
                  ? bridge.createdAt.toDate().toLocaleString()
                  : "Fecha desconocida"}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  empty: { textAlign: "center", marginTop: 20, color: "#999" },
  bridgeCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fdfdfd",
  },
  authorInfo: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  authorName: { fontWeight: "bold" },
  authorUsername: { color: "#666", fontSize: 12 },
  content: { marginVertical: 8 },
  date: { fontSize: 12, color: "#999", textAlign: "right" },
});
