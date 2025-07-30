// app/home.tsx
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Typography";
import { auth } from "../firebase/config";

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuario autenticado, redirigir a home
        router.replace("/home");
      } else {
        // Usuario no autenticado, mostrar opciones de login/registro
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={{
            uri: "https://res.cloudinary.com/dqph2qm49/image/upload/v1753805555/bridgea/logo-beta2_pfl5jp.png",
          }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>Conecta emociones, construye puentes</Text>
        
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={() => router.push("/login")}>
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          </Pressable>
          
          <Pressable style={styles.secondaryButton} onPress={() => router.push("/register")}>
            <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
          </Pressable>
        </View>
      </View>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  logo: {
    width: 200,
    height: 120,
    marginBottom: 24,
  },
  subtitle: {
    ...TextStyles.body,
    textAlign: "center",
    marginBottom: 60,
    color: Colors.text.secondary,
    fontSize: 18,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    ...TextStyles.button,
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: Colors.card,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    ...TextStyles.button,
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
});
