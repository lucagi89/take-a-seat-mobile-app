import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
// import { auth } from "../scripts/firebase.config";
import { handleSignUp } from "../services/auth";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const handleLogin = async () => {
    try {
      await handleSignUp(email, password);
      console.log("User signed in!");
      // Navigate to the appropriate screen after successful login
      navigation.navigate("home");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
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
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
      />
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Don't have an account? Sign Up"
        onPress={() => navigation.navigate("SignUp")}
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
