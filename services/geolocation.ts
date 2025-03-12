import * as Location from 'expo-location';

export const geocodeAddress = async (address: string) => {
  try {
    // Request permission (iOS-specific, Android handles this differently)
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    // Geocode the address
    const geocodedLocation = await Location.geocodeAsync(address);

    if (geocodedLocation.length > 0) {
      const { latitude, longitude } = geocodedLocation[0];
      return { latitude, longitude };
    } else {
      alert('No coordinates found for this address.');
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
  }
};
