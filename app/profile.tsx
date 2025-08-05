import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import defaultProfile from "../assets/default-profile.png";
import BottomNav from "../components/BottomNav";

import NotificationBell from "../components/NotificationBell";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Typography";
import { auth, db } from "../firebase/config";
import { uploadProfileImageToCloudinary, deleteProfileImageFromCloudinary } from "../services/cloudinaryService";
import locationService, { LocationData } from "../services/locationService";

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [residenceCity, setResidenceCity] = useState("");
  const [bio, setBio] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editingResidenceCity, setEditingResidenceCity] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/");
      } else {
        fetchUserData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setName(data.name || "");
        setResidenceCity(data.residenceCity || "");
        setBio(data.bio || "");
        
        // Cargar ubicación actual si existe
        if (data.currentLocation) {
          setCurrentLocation(data.currentLocation);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso denegado", "Se necesita acceso a tus fotos.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      const uri = pickerResult.assets[0].uri;
      try {
        // Guardar la URL de la imagen anterior para eliminarla después
        const previousImageUrl = userData?.photoURL;
        
        const imageUrl = await uploadProfileImageToCloudinary(uri);

        if (!imageUrl) {
          Alert.alert("Error", "No se pudo subir la imagen.");
          return;
        }

        // Actualizar en Firebase Auth
        await updateProfile(auth.currentUser!, {
          photoURL: imageUrl,
        });

        // Actualizar en Firestore
        await updateDoc(doc(db, "users", auth.currentUser!.uid), {
          photoURL: imageUrl,
        });

        // Actualizar estado local
        setUserData({ ...userData, photoURL: imageUrl });
        
        // Eliminar la imagen anterior de Cloudinary si existe
        if (previousImageUrl && previousImageUrl !== imageUrl) {
          await deleteProfileImageFromCloudinary(previousImageUrl);
        }
        
        Alert.alert("Éxito", "Foto de perfil actualizada.");
      } catch (error) {
        console.error("Error updating profile image:", error);
        Alert.alert("Error", "No se pudo actualizar la foto de perfil.");
      }
    }
  };

  const handleSaveName = async () => {
    try {
      await updateDoc(doc(db, "users", auth.currentUser!.uid), {
        name: name,
      });
      setUserData({ ...userData, name: name });
      setEditingName(false);
      Alert.alert("Éxito", "Nombre actualizado.");
    } catch (error) {
      console.error("Error updating name:", error);
      Alert.alert("Error", "No se pudo actualizar el nombre.");
    }
  };

  const handleSaveResidenceCity = async () => {
    try {
      await updateDoc(doc(db, "users", auth.currentUser!.uid), {
        residenceCity: residenceCity,
      });
      setUserData({ ...userData, residenceCity: residenceCity });
      setEditingResidenceCity(false);
      Alert.alert("Éxito", "Ciudad de residencia actualizada.");
    } catch (error) {
      console.error("Error updating residence city:", error);
      Alert.alert("Error", "No se pudo actualizar la ciudad de residencia.");
    }
  };

  const handleSaveBio = async () => {
    try {
      await updateDoc(doc(db, "users", auth.currentUser!.uid), {
        bio: bio,
      });
      setUserData({ ...userData, bio: bio });
      setEditingBio(false);
      Alert.alert("Éxito", "Biografía actualizada.");
    } catch (error) {
      console.error("Error updating bio:", error);
      Alert.alert("Error", "No se pudo actualizar la biografía.");
    }
  };

  const handleToggleLocation = async () => {
    try {
      const newLocationStatus = !userData?.showCurrentLocation;
      await updateDoc(doc(db, "users", auth.currentUser!.uid), {
        showCurrentLocation: newLocationStatus,
      });
      setUserData({ ...userData, showCurrentLocation: newLocationStatus });
    } catch (error) {
      console.error("Error updating location status:", error);
    }
  };

  const handleUpdateLocation = async () => {
    if (!auth.currentUser) return;
    
    setUpdatingLocation(true);
    try {
      const locationData = await locationService.getAndUpdateLocation(auth.currentUser.uid);
      if (locationData) {
        setCurrentLocation(locationData);
        setUserData({ ...userData, currentLocation: locationData });
        Alert.alert("Éxito", "Ubicación actualizada correctamente");
      } else {
        Alert.alert("Error", "No se pudo obtener la ubicación actual");
      }
    } catch (error) {
      console.error("Error updating location:", error);
      Alert.alert("Error", "No se pudo actualizar la ubicación");
    } finally {
      setUpdatingLocation(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Mi Perfil</Text>
            <NotificationBell onPress={() => router.push('/notifications')} />
          </View>

          <View style={styles.profileSection}>
            <Image
              source={
                userData?.photoURL
                  ? { uri: userData.photoURL }
                  : defaultProfile
              }
              style={styles.profileImage}
            />
            <Pressable style={styles.changePhotoButton} onPress={handlePickImage}>
              <Feather name="camera" size={16} color={Colors.text.white} />
              <Text style={styles.changePhotoText}>Cambiar foto</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Nombre:</Text>
            {editingName ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Tu nombre"
                  placeholderTextColor={Colors.text.light}
                />
                <Pressable style={styles.saveButton} onPress={handleSaveName}>
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.valueContainer}>
                <Text style={styles.value}>{userData?.name || "No especificado"}</Text>
                <Pressable style={styles.editButton} onPress={() => setEditingName(true)}>
                  <Feather name="edit-3" size={16} color={Colors.primary} />
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.value}>@{userData?.username || "desconocido"}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userData?.email || "No disponible"}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Ciudad de residencia:</Text>
            {editingResidenceCity ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={residenceCity}
                  onChangeText={setResidenceCity}
                  placeholder="Tu ciudad"
                  placeholderTextColor={Colors.text.light}
                />
                <Pressable style={styles.saveButton} onPress={handleSaveResidenceCity}>
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.valueContainer}>
                <Text style={styles.value}>{userData?.residenceCity || "No especificada"}</Text>
                <Pressable style={styles.editButton} onPress={() => setEditingResidenceCity(true)}>
                  <Feather name="edit-3" size={16} color={Colors.primary} />
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Biografía:</Text>
            {editingBio ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[styles.editInput, { height: 80, textAlignVertical: "top" }]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Cuéntanos sobre ti..."
                  placeholderTextColor={Colors.text.light}
                  multiline
                />
                <Pressable style={styles.saveButton} onPress={handleSaveBio}>
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.valueContainer}>
                <Text style={styles.value}>{userData?.bio || "No especificada"}</Text>
                <Pressable style={styles.editButton} onPress={() => setEditingBio(true)}>
                  <Feather name="edit-3" size={16} color={Colors.primary} />
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Miembro desde:</Text>
            <Text style={styles.value}>
              {userData?.createdAt?.toDate?.().toLocaleDateString() || "Fecha no disponible"}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Ubicación actual:</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>
                {userData?.showCurrentLocation ? "Visible públicamente" : "Oculta"}
              </Text>
              <Pressable 
                style={styles.toggleButton} 
                onPress={handleToggleLocation}
              >
                <Feather 
                  name={userData?.showCurrentLocation ? "eye-off" : "eye"} 
                  size={16} 
                  color={Colors.primary} 
                />
              </Pressable>
            </View>
            
            {currentLocation && (
              <View style={styles.locationContainer}>
                <Text style={styles.locationText}>
                  📍 {locationService.formatAddress(currentLocation)}
                </Text>
                <Pressable 
                  style={styles.updateLocationButton} 
                  onPress={handleUpdateLocation}
                  disabled={updatingLocation}
                >
                  <Feather 
                    name="refresh-cw" 
                    size={16} 
                    color={Colors.primary} 
                  />
                  <Text style={styles.updateLocationText}>
                    {updatingLocation ? "Actualizando..." : "Actualizar"}
                  </Text>
                </Pressable>
              </View>
            )}
            
            {!currentLocation && (
              <Pressable 
                style={styles.getLocationButton} 
                onPress={handleUpdateLocation}
                disabled={updatingLocation}
              >
                <Feather name="map-pin" size={16} color={Colors.text.white} />
                <Text style={styles.getLocationText}>
                  {updatingLocation ? "Obteniendo ubicación..." : "Obtener ubicación actual"}
                </Text>
              </Pressable>
            )}
          </View>



          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={18} color={Colors.text.white} />
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </Pressable>
        </ScrollView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontFamily: TextStyles.body.fontFamily,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pageTitle: {
    ...TextStyles.largeTitle,
    textAlign: "center",
    flex: 1,
    color: Colors.text.primary,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  changePhotoButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  changePhotoText: {
    ...TextStyles.button,
    fontSize: 14,
  },
  section: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    ...TextStyles.body,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  value: {
    ...TextStyles.body,
    color: Colors.text.secondary,
  },
  valueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editButton: {
    padding: 8,
  },
  toggleButton: {
    padding: 8,
  },
  locationContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationText: {
    ...TextStyles.body,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  updateLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  updateLocationText: {
    ...TextStyles.body,
    color: Colors.primary,
    fontSize: 14,
  },
  getLocationButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  getLocationText: {
    ...TextStyles.body,
    color: Colors.text.white,
    fontSize: 14,
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    fontSize: 16,
    fontFamily: TextStyles.body.fontFamily,
    color: Colors.text.primary,
  },
  saveButton: {
    backgroundColor: Colors.success,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    ...TextStyles.button,
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    gap: 8,
  },
  logoutButtonText: {
    ...TextStyles.button,
    fontSize: 16,
    fontWeight: "bold",
  },
});
