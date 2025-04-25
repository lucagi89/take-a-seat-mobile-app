import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
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
import { useRouter } from "expo-router";

interface Notification {
  id: string;
  text: string;
  createdAt: any;
  userId: string;
  author: string;
}

const Notifications = () => {

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotification, setNewNotification] = useState("");
  const router = useRouter();

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsData: Notification[] = [];
      querySnapshot.forEach((doc) => {
        notificationsData.push({ id: doc.id, ...doc.data() } as Notification);
      });
      setNotifications(notificationsData);
    });

    return () => unsubscribe();
  }, []);

  
