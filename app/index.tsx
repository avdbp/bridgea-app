// app/home.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://res.cloudinary.com/dqph2qm49/image/upload/v1753805555/bridgea/logo-beta2_pfl5jp.png",
        }}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.slogan}>Conecta. Siente. Recuerda.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.registerButton]}
        onPress={() => router.push("/register")}
      >
        <Text style={styles.buttonText}>Registrarse</Text>
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
    paddingHorizontal: 30,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  slogan: {
    fontSize: 20,
    fontWeight: "600",
    color: "#444",
    textAlign: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#095C8B",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  registerButton: {
    backgroundColor: "#60AFE2",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
