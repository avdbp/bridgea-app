import { router } from "expo-router";
import { createUserWithEmailAndPassword, onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { TextStyles } from "../../constants/Typography";
import { auth, db } from "../../firebase/config";
import notificationService from "../../services/notificationService";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");

  useEffect(() => {
    // Verificar si el usuario ya está autenticado
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Si ya está logueado, redirigir a /home
        router.replace("/home");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRegister = async () => {
    if (!name || !username || !email || !password || !birthDate) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Actualizar perfil con nombre
      await updateProfile(user, {
        displayName: name,
      });

      // Guardar datos adicionales en Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        username: username.toLowerCase(),
        email,
        birthDate,
        createdAt: new Date(),
        photoURL: null,
        bio: "",
        residenceCity: "",
        showCurrentLocation: false,
        currentLocation: null,
      });

      // Configurar notificaciones para el nuevo usuario
      try {
        console.log("🔔 Configurando notificaciones para nuevo usuario...");
        const hasPermission = await notificationService.requestPermissions();
        if (hasPermission) {
          await notificationService.saveTokenToFirestore(user.uid);
          console.log("✅ Notificaciones configuradas para:", user.uid);
        }
      } catch (error) {
        console.error("❌ Error configurando notificaciones:", error);
      }

      router.replace("/home");
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Crear cuenta</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={name}
            onChangeText={setName}
            placeholderTextColor={Colors.text.light}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Nombre de usuario"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor={Colors.text.light}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={Colors.text.light}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={Colors.text.light}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Fecha de nacimiento (YYYY-MM-DD)"
            value={birthDate}
            onChangeText={setBirthDate}
            placeholderTextColor={Colors.text.light}
          />
          
          <Pressable style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrarse</Text>
          </Pressable>
          
          <Pressable style={styles.linkButton} onPress={() => router.push("/login")}>
            <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    ...TextStyles.largeTitle,
    textAlign: "center",
    marginBottom: 40,
    color: Colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    fontSize: 16,
    fontFamily: TextStyles.body.fontFamily,
    color: Colors.text.primary,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    ...TextStyles.button,
    textAlign: "center",
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 24,
    alignItems: "center",
  },
  linkText: {
    ...TextStyles.body,
    color: Colors.primary,
    textDecorationLine: "underline",
  },
});
