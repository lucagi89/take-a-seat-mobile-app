import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { handleUser, signInWithGoogle } from "../../services/auth";
import { useRouter } from "expo-router";

// import { NavigationProp } from "@react-navigation/native";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const handleLogin = async () => {
    try {
      await handleUser(email, password);
      console.log("User signed in!");
      router.push("/");
    } catch (error) {
      console.error(error);
      setErrorMessage((error as any).message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
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
        secureTextEntry
        autoCapitalize="none"
        textContentType="none" // Prevents auto-fill suggestions
        autoComplete="off" // Disables auto-complete
        importantForAutofill="no"
      />
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <Button title="Login" onPress={handleLogin} />
      <Button title="Login with Google" onPress={signInWithGoogle} />
      <Button
        title="Don't have an account? Sign Up"
        onPress={() => router.push("/signup")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

export default Login;
