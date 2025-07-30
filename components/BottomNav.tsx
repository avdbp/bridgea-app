import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Typography";

const tabs = [
  {
    name: "Inicio",
    icon: "home" as const,
    route: "/home" as const,
  },
  {
    name: "Bridges",
    icon: "heart" as const,
    route: "/bridges" as const,
  },
  {
    name: "Buscar",
    icon: "search" as const,
    route: "/search" as const,
  },
  {
    name: "Perfil",
    icon: "user" as const,
    route: "/profile" as const,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <View style={styles.navbar}>
      {tabs.map((tab, index) => (
        <Pressable
          key={index}
          onPress={() => router.push(tab.route)}
          style={styles.iconContainer}
        >
          <Feather
            name={tab.icon as any}
            size={24}
            color={pathname === tab.route ? Colors.primary : Colors.neutral.gray}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: pathname === tab.route ? Colors.primary : Colors.neutral.gray,
              },
            ]}
          >
            {tab.name}
          </Text>
        </Pressable>
      ))}

      {/* Botón de crear bridge en el centro */}
      <Pressable
        style={styles.createButton}
        onPress={() => router.push("/create-bridge")}
      >
        <Feather
          name="plus"
          size={28}
          color={Colors.text.white}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
    backgroundColor: Colors.card,
    position: "relative",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: TextStyles.secondary.fontFamily,
  },
  createButton: {
    position: "absolute",
    top: -20,
    left: "50%",
    marginLeft: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
