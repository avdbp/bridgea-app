import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Typography";

const tabs = [
  {
    icon: "home" as const,
    label: "Inicio",
    route: "/home" as const,
  },
  {
    icon: "inbox" as const,
    label: "Bridges",
    route: "/bridges" as const,
  },
  {
    icon: "search" as const,
    label: "Buscar",
    route: "/search" as const,
  },
  {
    icon: "user" as const,
    label: "Perfil",
    route: "/profile" as const,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (route: string) => {
    return pathname === route;
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <Pressable
            key={tab.route}
            style={styles.tab}
            onPress={() => router.push(tab.route)}
          >
            <Feather
              name={tab.icon}
              size={24}
              color={isActive(tab.route) ? Colors.primary : Colors.text.light}
            />
            <Text
              style={[
                styles.tabLabel,
                isActive(tab.route) && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Botón central para crear bridge */}
      <Pressable
        style={styles.createButton}
        onPress={() => router.push("/create-bridge")}
      >
        <Feather name="plus" size={28} color={Colors.text.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabLabel: {
    ...TextStyles.secondary,
    marginTop: 4,
    color: Colors.text.light,
  },
  activeTabLabel: {
    color: Colors.primary,
    fontWeight: "600",
  },
  createButton: {
    position: "absolute",
    top: -20,
    left: "50%",
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
