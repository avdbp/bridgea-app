import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Typography";

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Explorar</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.placeholder}>
          <Feather name="compass" size={64} color={Colors.text.light} />
          <Text style={styles.placeholderTitle}>Explorar Bridges</Text>
          <Text style={styles.placeholderText}>
            Descubre nuevos bridges y conecta con otros usuarios
          </Text>
        </View>
      </View>
      
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  },
  pageTitle: {
    ...TextStyles.largeTitle,
    textAlign: "center",
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholder: {
    alignItems: "center",
    paddingVertical: 40,
  },
  placeholderTitle: {
    ...TextStyles.largeTitle,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    color: Colors.text.primary,
  },
  placeholderText: {
    ...TextStyles.body,
    textAlign: "center",
    color: Colors.text.secondary,
    lineHeight: 20,
  },
}); 