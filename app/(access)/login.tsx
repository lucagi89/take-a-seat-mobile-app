import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { handleUser, signInWithGoogle } from "../../services/auth";
import { useRouter, Link } from "expo-router";
import messaging from "@react-native-firebase/messaging";
import { auth, db } from "../../scripts/firebase.config";
import { doc, setDoc } from "firebase/firestore";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const saveFcmToken = async () => {
    const token = await messaging().getToken();
    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      {
        fcmToken: token,
      },
      { merge: true }
    );
  };

  const handleLogin = async () => {
    try {
      await handleUser(email, password);
      console.log("User signed in!");
      router.push("/");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to your account</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="off"
            importantForAutofill="no"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry
            autoCapitalize="none"
            textContentType="none"
            autoComplete="off"
            importantForAutofill="no"
          />
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={signInWithGoogle}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Login with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Link href="/signup" style={styles.linkText}>
              Don’t have an account? Sign Up
            </Link>
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

export default Login;
