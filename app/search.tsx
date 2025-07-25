import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import defaultProfile from "../assets/default-profile.png";
import { db } from "../firebase/config";

export default function SearchScreen() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Ingresa un username para buscar.");
      return;
    }

    setLoading(true);

    try {
      const searchValue = username.trim().toLowerCase();
      const endValue = searchValue.replace(/.$/, c =>
        String.fromCharCode(c.charCodeAt(0) + 1)
      );

      const q = query(
        collection(db, "users"),
        where("username", ">=", searchValue),
        where("username", "<", endValue)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setResults([]);
        Alert.alert("Sin resultados", `No se encontraron usuarios con "${username}"`);
      } else {
        const foundUsers = snapshot.docs.map(doc => doc.data());
        setResults(foundUsers);
      }
    } catch (error) {
      console.log("Error buscando usuario:", error);
      Alert.alert("Error", "Hubo un problema al buscar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }: { item: any }) => (
    <Pressable
      style={styles.resultItem}
      onPress={() => router.push(`/user/${item.username}`)}
    >
      <Image
        source={item.photoURL ? { uri: item.photoURL } : defaultProfile}
        style={styles.avatar}
      />
      <View>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultUsername}>@{item.username}</Text>
      </View>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Buscar usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa el username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <Pressable style={styles.button} onPress={handleSearch} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? "Buscando..." : "Buscar"}
          </Text>
        </Pressable>

        <FlatList
          data={results}
          keyExtractor={item => item.uid}
          renderItem={renderUser}
          contentContainerStyle={styles.resultsList}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#8e44ad",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  resultsList: {
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  resultName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  resultUsername: {
    color: "#666",
  },
});
