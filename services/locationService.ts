import * as Location from 'expo-location';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  formattedAddress?: string;
}

class LocationService {
  private static instance: LocationService;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Solicitar permisos de ubicación
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ Error solicitando permisos de ubicación:', error);
      return false;
    }
  }

  /**
   * Obtener ubicación actual
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        console.log('❌ Permisos de ubicación no otorgados');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Obtener dirección a partir de coordenadas
      const address = await this.getAddressFromCoordinates(
        location.coords.latitude,
        location.coords.longitude
      );

      if (address) {
        locationData.address = address.address;
        locationData.city = address.city;
        locationData.state = address.state;
        locationData.country = address.country;
        locationData.formattedAddress = address.formattedAddress;
      }

      console.log('✅ Ubicación obtenida:', locationData);
      return locationData;
    } catch (error) {
      console.error('❌ Error obteniendo ubicación:', error);
      return null;
    }
  }

  /**
   * Obtener dirección a partir de coordenadas usando reverse geocoding
   */
  async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<{
    address: string;
    city: string;
    state: string;
    country: string;
    formattedAddress: string;
  } | null> {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const location = reverseGeocode[0];
        
        const city = location.city || location.subregion || 'Ciudad desconocida';
        const state = location.region || location.subregion || 'Estado desconocido';
        const country = location.country || 'País desconocido';
        const address = location.street || 'Dirección desconocida';
        
        const formattedAddress = `${city}, ${state}, ${country}`;

        return {
          address,
          city,
          state,
          country,
          formattedAddress,
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Error obteniendo dirección:', error);
      return null;
    }
  }

  /**
   * Actualizar ubicación del usuario en Firestore
   */
  async updateUserLocation(userId: string, locationData: LocationData): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        currentLocation: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address,
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,
          formattedAddress: locationData.formattedAddress,
          updatedAt: new Date(),
        },
      });

      console.log('✅ Ubicación actualizada en Firestore');
      return true;
    } catch (error) {
      console.error('❌ Error actualizando ubicación en Firestore:', error);
      return false;
    }
  }

  /**
   * Obtener ubicación y actualizar en Firestore
   */
  async getAndUpdateLocation(userId: string): Promise<LocationData | null> {
    try {
      const locationData = await this.getCurrentLocation();
      if (locationData) {
        await this.updateUserLocation(userId, locationData);
        return locationData;
      }
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo y actualizando ubicación:', error);
      return null;
    }
  }

  /**
   * Formatear dirección para mostrar
   */
  formatAddress(locationData: LocationData): string {
    if (locationData.formattedAddress) {
      return locationData.formattedAddress;
    }

    const parts = [];
    if (locationData.city) parts.push(locationData.city);
    if (locationData.state) parts.push(locationData.state);
    if (locationData.country) parts.push(locationData.country);

    return parts.length > 0 ? parts.join(', ') : 'Ubicación desconocida';
  }
}

export default LocationService.getInstance(); 