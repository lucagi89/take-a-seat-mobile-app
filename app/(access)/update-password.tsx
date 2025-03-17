import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../../scripts/firebase.config"; // Adjust path to your Firebase config
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

const ChangePassword = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChangePassword = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please fill out all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setErrorMessage("No user is signed in.");
      return;
    }

    try {
      // Reauthenticate the user with their current credentials
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update the password
      await updatePassword(user, newPassword);

      setSuccessMessage("Password updated successfully!");
      setTimeout(() => router.push("/profile"), 2000); // Redirect after 2 seconds
    } catch (error) {
      console.error("Error changing password:", error);
      setErrorMessage(
        error.message || "An error occurred while updating your password."
      );
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background.png")} // Verify this path
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>Update your account password</Text>

          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current Password"
            placeholderTextColor="#666"
            secureTextEntry
            autoCapitalize="none"
            textContentType="none"
            autoComplete="off"
            importantForAutofill="no"
          />
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New Password"
            placeholderTextColor="#666"
            secureTextEntry
            autoCapitalize="none"
            textContentType="none"
            autoComplete="off"
            importantForAutofill="no"
          />
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm New Password"
            placeholderTextColor="#666"
            secureTextEntry
            autoCapitalize="none"
            textContentType="none"
            autoComplete="off"
            importantForAutofill="no"
          />

          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          {successMessage && (
            <Text style={styles.successText}>{successMessage}</Text>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleChangePassword}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Update Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push("/profile")}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Back to Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(245, 245, 245, 0.7)", // Semi-transparent overlay
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
    width: "90%",
    maxWidth: 400,
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
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#C8E6C9",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  successText: {
    color: "#2E7D32",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FFCA28",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
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
  linkButton: {
    marginVertical: 10,
  },
  linkText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});

export default ChangePassword;
