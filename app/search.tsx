import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import React, { useState, useEffect, useCallback } from "react";
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
  const [hasSearched, setHasSearched] = useState(false);

  // Búsqueda automática con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.trim().length >= 1) {
        handleSearch();
      } else if (searchText.trim().length === 0) {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, 300); // Reducido a 300ms para mejor respuesta

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const handleSearch = useCallback(async () => {
    const queryText = searchText.trim().toLowerCase();
    if (!queryText || queryText.length < 1) return;

    console.log("🔍 Buscando usuarios con:", queryText);
    setLoading(true);
    setHasSearched(true);

    try {
      // Estrategia simple: Obtener todos los usuarios y filtrar en el cliente
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);
      const allUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("📊 Total de usuarios en BD:", allUsers.length);

      // Filtrar en el cliente
      const filteredUsers = allUsers.filter((user: any) => {
        const username = (user.username || "").toLowerCase();
        const name = (user.name || "").toLowerCase();
        
        return username.includes(queryText) || name.includes(queryText);
      });

      console.log("📊 Usuarios filtrados:", filteredUsers.length);
      console.log("👥 Usuarios encontrados:", filteredUsers.map((u: any) => u.username));

      setSearchResults(filteredUsers);
    } catch (err) {
      console.error("❌ Error buscando usuarios:", err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  const handleUserPress = (username: string) => {
    console.log("👆 Usuario seleccionado:", username);
    router.push(`/user/${username}`);
  };

  const renderSearchResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Buscando usuarios...</Text>
        </View>
      );
    }

    if (searchResults.length > 0) {
      return (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Feather name="users" size={20} color={Colors.text.primary} />
            <Text style={styles.resultsTitle}>
              {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
            </Text>
          </View>
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
                <Text style={styles.userName}>{user.name || "Usuario"}</Text>
                <Text style={styles.userUsername}>@{user.username}</Text>
                {user.residenceCity && (
                  <Text style={styles.userLocation}>📍 {user.residenceCity}</Text>
                )}
              </View>
              <Feather name="chevron-right" size={20} color={Colors.text.light} />
            </Pressable>
          ))}
        </View>
      );
    }

    if (hasSearched && searchText.trim().length >= 1) {
      return (
        <View style={styles.noResultsContainer}>
          <Feather name="search" size={64} color={Colors.text.light} />
          <Text style={styles.noResultsText}>No se encontraron usuarios</Text>
          <Text style={styles.noResultsSubtext}>
            Intenta con un username diferente o verifica la ortografía
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.initialStateContainer}>
        <Feather name="search" size={64} color={Colors.text.light} />
        <Text style={styles.initialStateText}>Busca usuarios por username</Text>
        <Text style={styles.initialStateSubtext}>
          Escribe al menos 1 carácter para comenzar la búsqueda
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Buscar Usuarios</Text>
          </View>
          
          <View style={styles.searchContainer}>
            <View style={styles.inputContainer}>
              <Feather name="search" size={20} color={Colors.text.light} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Buscar por username o nombre..."
                value={searchText}
                onChangeText={setSearchText}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={Colors.text.light}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              {searchText.length > 0 && (
                <Pressable 
                  style={styles.clearButton} 
                  onPress={() => setSearchText("")}
                >
                  <Feather name="x" size={20} color={Colors.text.light} />
                </Pressable>
              )}
            </View>
            
            {searchText.trim().length >= 1 && (
              <Text style={styles.searchHint}>
                Búsqueda automática en tiempo real
              </Text>
            )}
          </View>

          {renderSearchResults()}
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
    marginBottom: 24,
  },
  title: {
    ...TextStyles.largeTitle,
    textAlign: "center",
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: "bold",
  },
  searchContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 12,
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: TextStyles.body.fontFamily,
    color: Colors.text.primary,
    paddingVertical: 16,
  },
  clearButton: {
    padding: 8,
  },
  searchHint: {
    fontSize: 12,
    color: Colors.text.light,
    fontFamily: TextStyles.secondary.fontFamily,
    marginTop: 8,
    marginLeft: 4,
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
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  resultsTitle: {
    ...TextStyles.cardTitle,
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
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 12,
    color: Colors.text.light,
    fontFamily: TextStyles.secondary.fontFamily,
  },
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    ...TextStyles.cardTitle,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    color: Colors.text.primary,
  },
  noResultsSubtext: {
    ...TextStyles.body,
    textAlign: "center",
    color: Colors.text.secondary,
  },
  initialStateContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  initialStateText: {
    ...TextStyles.cardTitle,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    color: Colors.text.primary,
  },
  initialStateSubtext: {
    ...TextStyles.body,
    textAlign: "center",
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});
