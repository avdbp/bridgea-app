import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import defaultProfile from "../assets/default-profile.png";
import BottomNav from "../components/BottomNav";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Typography";
import { db } from "../firebase/config";

export default function SearchScreen() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const queryText = searchText.trim().toLowerCase();
    if (!queryText) return;

    setLoading(true);

    const endValue = queryText.replace(/.$/, (c) =>
      String.fromCharCode(c.charCodeAt(0) + 1)
    );

    try {
      const q = query(
        collection(db, "users"),
        where("username", ">=", queryText),
        where("username", "<", endValue)
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSearchResults(results);
    } catch (err) {
      console.error("Error buscando usuarios:", err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (username: string) => {
    router.push(`/user/${username}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Buscar Usuarios 🔍</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Buscar por username..."
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            placeholderTextColor={Colors.text.light}
          />
          
          <Pressable style={styles.searchButton} onPress={handleSearch} disabled={loading}>
            <Text style={styles.searchButtonText}>
              {loading ? "Buscando..." : "Buscar"}
            </Text>
          </Pressable>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Buscando usuarios...</Text>
            </View>
          )}

          {searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>Resultados encontrados:</Text>
              {searchResults.map((user) => (
                <Pressable
                  key={user.id}
                  style={styles.resultItem}
                  onPress={() => handleUserPress(user.username)}
                >
                  <Image
                    source={
                      user.photoURL
                        ? { uri: user.photoURL }
                        : defaultProfile
                    }
                    style={styles.avatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userUsername}>@{user.username}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {searchResults.length === 0 && !loading && searchText.trim() !== "" && (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No se encontraron usuarios</Text>
              <Text style={styles.noResultsSubtext}>
                Intenta con un username diferente
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    ...TextStyles.largeTitle,
    textAlign: "center",
    marginBottom: 24,
    color: Colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    fontSize: 16,
    fontFamily: TextStyles.body.fontFamily,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    ...TextStyles.button,
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
    fontFamily: TextStyles.body.fontFamily,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    ...TextStyles.cardTitle,
    marginBottom: 16,
    color: Colors.text.primary,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...TextStyles.cardTitle,
    marginBottom: 4,
    color: Colors.text.primary,
  },
  userUsername: {
    ...TextStyles.secondary,
    color: Colors.text.secondary,
  },
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    ...TextStyles.cardTitle,
    textAlign: "center",
    marginBottom: 8,
    color: Colors.text.primary,
  },
  noResultsSubtext: {
    ...TextStyles.body,
    textAlign: "center",
    color: Colors.text.secondary,
  },
});
