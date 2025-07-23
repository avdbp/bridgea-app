import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../../firebase/config";

export default function Welcome() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (!firebaseUser) {
        router.replace("/"); // vuelve al home si no está logueado
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/"); // al cerrar sesión vuelve al home
    } catch (error) {
      Alert.alert("Error", "No se pudo cerrar sesión");
    }
  };

  if (loading) return null; // evita render mientras carga usuario

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://res.cloudinary.com/dqph2qm49/image/upload/v1752853768/bridgea/logo-beta_uava2a.png",
        }}
        style={styles.logo}
      />
      <Text style={styles.tagline}>Conecta. Siente. Recuerda.</Text>

      <Text style={styles.welcomeText}>
        ¡Bienvenido, {user?.displayName || user?.email || "usuario"}!
      </Text>

      <Text style={styles.infoText}>Ya estás logueado en Bridgea.</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    marginBottom: 30,
  },
  tagline: {
    fontSize: 20,
    fontWeight: "500",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#095C8B",
    marginBottom: 10,
    textAlign: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#C51D15",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: "70%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
