import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { auth } from "../../scripts/firebase.config";
import { signUp } from "../../services/auth";
import { addDocument } from "../../services/databaseActions";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signUp(email, password);
      if (auth.currentUser) {
        await addDocument(
          {
            id: auth.currentUser.uid || "",
            email: auth.currentUser.email || "",
            isOwner: false,
            isProfileComplete: false,
          },
          "users"
        );
      } else {
        throw new Error("User is not authenticated");
      }

      router.push("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Button title="Sign Up" onPress={handleSignUp} />

      <TouchableOpacity
        onPress={() => navigation.navigate("login")}
        style={styles.signInLink}
      >
        <Text style={styles.signInText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  signInLink: {
    marginTop: 20,
    alignItems: "center",
  },
  signInText: {
    color: "#007BFF",
    fontSize: 16,
  },
});
