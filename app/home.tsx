// import {
//   Text,
//   View,
//   TouchableOpacity,
//   SafeAreaView,
//   Image,
//   StyleSheet,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import { useUser } from "../contexts/userContext";
// import { logout } from "../services/auth";

// export default function Index() {
//   const router = useRouter();
//   const { user, loading } = useUser();
//   const [navigationInProgress, setNavigationInProgress] = useState(false);

//   // Redirect to login if user is not authenticated
//   useEffect(() => {
//     if (!loading && !user) {
//       router.replace("/login");
//     }
//   }, [user, loading]);

//   // Show loading spinner while checking auth state
//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <Text>Loading...</Text>
//       </View>
//     );
//   }

//   // Handle navigation with guard
//   const handleNavigation = (path: string) => {
//     if (navigationInProgress) return; // Prevent multiple clicks
//     setNavigationInProgress(true);
//     router.push(path);
//     setTimeout(() => setNavigationInProgress(false), 1000); // Reset after 1 second
//   };

//   return (
//     <View style={styles.parentContainer}>
//       <View style={styles.container}>
//         <Image
//           source={require("../assets/images/take-a-seat.jpg")}
//           style={styles.image}
//         />
//       </View>
//       <SafeAreaView style={styles.secondaryContainer}>
//         <View>
//           <Text>Welcome, {user?.email || "Guest"}!</Text>
//         </View>

//         <TouchableOpacity
//           style={[styles.button, navigationInProgress && styles.disabledButton]}
//           onPress={() => handleNavigation("/map")}
//           disabled={navigationInProgress}
//         >
//           <Text>Explore the Map</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.button, navigationInProgress && styles.disabledButton]}
//           onPress={() => handleNavigation("/profile")}
//           disabled={navigationInProgress}
//         >
//           <Text>Go to Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.button, navigationInProgress && styles.disabledButton]}
//           onPress={async () => {
//             if (navigationInProgress) return;
//             setNavigationInProgress(true);
//             await logout();
//             setNavigationInProgress(false);
//           }}
//           disabled={navigationInProgress}
//         >
//           <Text>Logout</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   parentContainer: {
//     height: "100%",
//   },
//   container: {
//     marginTop: 0,
//     marginHorizontal: 0,
//     width: "100%",
//     height: 400,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   image: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "cover",
//   },
//   button: {
//     marginVertical: 10,
//     textAlign: "center",
//     padding: 20,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 5,
//   },
//   disabledButton: {
//     backgroundColor: "#ccc",
//   },
//   secondaryContainer: {
//     marginVertical: 0,
//     paddingTop: 20,
//     backgroundColor: "white",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     height: "100%",
//   },
// });
