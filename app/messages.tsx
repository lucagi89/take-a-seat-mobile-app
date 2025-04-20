import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../scripts/firebase.config";

interface Message {
  id: string;
  text: string;
  createdAt: any; // Firestore Timestamp
  userId: string;
  author: string;
}

const MessagesScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Listen for real-time updates to messages
  useEffect(() => {
    // Create a query to order messages by creation time
    const messagesQuery = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc")
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messageList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        setMessages(messageList);
      },
      (error) => {
        console.error("Firestore error:", error);
        Alert.alert("Error", "Failed to fetch messages.");
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  // Add a new message to Firestore
  const handleAddMessage = async () => {
    if (!newMessage.trim()) {
      Alert.alert("Error", "Please enter a message.");
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to send a message.");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
        author: auth.currentUser.displayName || "Anonymous",
      });
      setNewMessage(""); // Clear input
    } catch (error) {
      console.error("Error adding message:", error);
      Alert.alert("Error", "Failed to send message.");
    }
  };

  // Render each message
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageUser}>User: {item.author}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Messages</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListEmptyComponent={<Text>No messages yet.</Text>}
        style={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
        />
        <Button title="Send" onPress={handleAddMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  messageList: {
    flex: 1,
  },
  messageContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  messageText: {
    fontSize: 16,
  },
  messageUser: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    backgroundColor: "#fff",
  },
});

export default MessagesScreen;
