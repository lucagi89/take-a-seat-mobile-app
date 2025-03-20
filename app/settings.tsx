import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { useUser } from "../contexts/userContext";
import { handleLogout } from "../services/auth";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import the icon library

export default function Settings() {
  const { user, userData } = useUser();
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  if (!user) {
    router.push("/login");
    return null;
  }

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      setLocationEnabled(true);
      Alert.alert("Success", "Location access enabled.");
    } else {
      setLocationEnabled(false);
      Alert.alert("Permission Denied", "Location access was not granted.");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Add account deletion logic here (e.g., Firebase auth delete)
            Alert.alert("Account Deleted", "Your account has been deleted.");
            handleLogout();
          },
        },
      ]
    );
  };

  return (
    <ImageBackground
      source={require("../assets/images/background.png")} // Adjust path as needed
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your experience</Text>

          {/* Account Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.item}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/update-password")} // Hypothetical route
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>
          </View>

          {/* Notification Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.item}>
              <Text style={styles.label}>Push Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#767577", true: "#C8E6C9" }}
                thumbColor={notificationsEnabled ? "#2E7D32" : "#f4f3f4"}
              />
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>Email Notifications</Text>
              <Switch
                value={emailNotificationsEnabled}
                onValueChange={setEmailNotificationsEnabled}
                trackColor={{ false: "#767577", true: "#C8E6C9" }}
                thumbColor={emailNotificationsEnabled ? "#2E7D32" : "#f4f3f4"}
              />
            </View>
          </View>

          {/* App Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.item}>
              <Text style={styles.label}>Location Access</Text>
              <Switch
                value={locationEnabled}
                onValueChange={(value) => {
                  if (value) requestLocationPermission();
                  else setLocationEnabled(false);
                }}
                trackColor={{ false: "#767577", true: "#C8E6C9" }}
                thumbColor={locationEnabled ? "#2E7D32" : "#f4f3f4"}
              />
            </View>
            {/* Placeholder for future theme toggle */}
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.7}
              disabled
            >
              <Text style={[styles.buttonText, { color: "#666" }]}>
                Theme (Coming Soon)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Restaurant Owner Settings */}
          {userData?.isOwner && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Restaurant Owner</Text>
              <TouchableOpacity style={styles.button} activeOpacity={0.7}>
                <Link href="/my-restaurants" style={styles.buttonText}>
                  Manage Restaurants
                </Link>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} activeOpacity={0.7}>
                <Link href="/create-restaurant" style={styles.buttonText}>
                  Create New Restaurant
                </Link>
              </TouchableOpacity>
            </View>
          )}

          {/* Support and Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support & Info</Text>
            <TouchableOpacity style={styles.button} activeOpacity={0.7}>
              <Link href="/help" style={styles.buttonText}>
                Help/Support
              </Link>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} activeOpacity={0.7}>
              <Link href="/about" style={styles.buttonText}>
                About
              </Link>
            </TouchableOpacity>
          </View>

          {/* Logout and Delete Account */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#FFFFFF"
              style={styles.icon}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color="#FFFFFF"
              style={styles.icon}
            />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => {}}>
            <Link href="/">
              <Icon name="arrow-back" size={30} color="#2E7D32" />
            </Link>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "rgba(240, 236, 227, 0.7)", // Light overlay for wood texture
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  section: {
    width: "100%",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    color: "#666",
  },
  button: {
    backgroundColor: "#FFCA28",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 5,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#D32F2F",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    marginLeft: 10,
  },
  deleteButton: {
    flexDirection: "row",
    backgroundColor: "#B71C1C",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  deleteText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    marginLeft: 10,
  },
  icon: {
    marginRight: 5,
  },
  backButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    padding: 5,
  },
});
