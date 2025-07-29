import { Feather } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import defaultProfile from "../assets/default-profile.png";
import { auth } from "../firebase/config";

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const userPhotoURL = auth.currentUser?.photoURL;

  const tabs: { icon: any; route: "/home" | "/bridges" | "/search" | "/profile" }[] = [
    { icon: "home", route: "/home" },
    { icon: "activity", route: "/bridges" }, // ícono temporal para puentes
    { icon: "search", route: "/search" },
    { icon: "user", route: "/profile" },
  ];

  return (
    <View style={styles.navbar}>
      {tabs.map((tab, index) => (
        <Pressable
          key={index}
          onPress={() => router.push(tab.route)}
          style={styles.iconContainer}
        >
          {tab.icon === "user" ? (
            <Image
              source={userPhotoURL ? { uri: userPhotoURL } : defaultProfile}
              style={[
                styles.avatar,
                pathname === tab.route && { borderColor: "#8e44ad" },
              ]}
            />
          ) : (
            <Feather
              name={tab.icon}
              size={24}
              color={pathname === tab.route ? "#8e44ad" : "#999"}
            />
          )}
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
});

export default BottomNav;
