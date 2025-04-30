import React from "react";
// import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";
// import { useTranslation } from "react-i18next";
import { View, Text } from "react-native";

export default function justBookMeIn() {
  const router = useRouter();
  // const { t } = useTranslation();
  // const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <Text>loading</Text>;
  }

  return (
    <View>
      <Text>Just Book Me In</Text>
      <Text>This is the Just Book Me In page.</Text>
      <Text>Just Book Me In is a booking system for restaurants.</Text>
      <Text>
        It allows users to book tables at their favourite restaurants with ease.
      </Text>
      <Text>It also allows restaurants to manage their bookings.</Text>
      <Text>It is a simple and easy to use application.</Text>
    </View>
  );
}
// This is a simple React component that displays information about the Just Book Me In application.
