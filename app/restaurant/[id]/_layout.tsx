// import { Stack, Link, usePathname } from "expo-router";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ImageBackground,
//   Dimensions,
// } from "react-native";
// import {
//   RestaurantProvider,
//   useRestaurant,
// } from "../../../contexts/RestaurantContext";

// const { width: SCREEN_WIDTH } = Dimensions.get("window"); // Get screen width

// export default function RestaurantLayout() {
//   return (
//     <RestaurantProvider>
//       <LayoutContent />
//     </RestaurantProvider>
//   );
// }

// const LayoutContent = () => {
//   const { loading, restaurantId } = useRestaurant();
//   const pathname = usePathname();

//   console.log("Current Pathname:", pathname); // Keep for debugging

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     // <ImageBackground
//     //   source={require("../../../assets/images/background.png")}
//     //   style={styles.background}
//     //   resizeMode="cover"
//     // >
//     <View style={styles.container}>
//       <View style={styles.stackContainer}>
//         <Stack screenOptions={{ headerShown: false }} />
//       </View>

//       <View style={styles.navbar}>
//         {["info", "floorplan", "dishes", "reviews"].map((tab) => {
//           const isActive = pathname.includes(
//             `/restaurant/${restaurantId}/${tab}`
//           );
//           return (
//             <Link
//               key={tab}
//               href={`/restaurant/${restaurantId}/${tab}`}
//               style={[styles.navItem, isActive && styles.activeNavItem]}
//             >
//               <Text style={[styles.navText, isActive && styles.activeNavText]}>
//                 {tab.toUpperCase()}
//               </Text>
//             </Link>
//           );
//         })}
//         <Link
//           key="map"
//           href="/"
//           style={[
//             styles.navItem,
//             (pathname === "/" || pathname === "") && styles.activeNavItem,
//           ]}
//         >
//           <Text
//             style={[
//               styles.navText,
//               (pathname === "/" || pathname === "") && styles.activeNavText,
//             ]}
//           >
//             MAP
//           </Text>
//         </Link>
//       </View>
//     </View>
//     // </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   // background: {
//   //   // flex: 1,
//   //   width: "100%",
//   //   height: "100%",
//   // },
//   container: {
//     flex: 1,
//     backgroundColor: "rgba(240, 236, 227, 0.7)",
//   },
//   stackContainer: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F5F5F5",
//   },
//   loadingText: {
//     fontSize: 18,
//     color: "#2E7D32",
//     fontWeight: "600",
//   },
//   navbar: {
//     flexDirection: "row",
//     justifyContent: "space-between", // Changed to space-between for even distribution
//     paddingVertical: 8, // Reduced from 12 to make it less tall
//     paddingHorizontal: 5, // Added small horizontal padding to navbar
//     backgroundColor: "#2E7D32",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 5,
//     borderTopWidth: 1,
//     borderTopColor: "#C8E6C9",
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     width: SCREEN_WIDTH, // Explicitly set to screen width
//     zIndex: 10,
//   },
//   navItem: {
//     // flex: "20%", // Allow items to share space equally
//     paddingHorizontal: 8, // Reduced from 15 to fit better
//     paddingVertical: 6, // Reduced from 8
//     borderRadius: 8,
//     alignItems: "center", // Center text horizontally
//   },
//   navText: {
//     color: "#FFFFFF",
//     fontSize: 12, // Reduced from 14 to prevent overflow
//     fontWeight: "600",
//     textTransform: "uppercase",
//     letterSpacing: 0.5, // Reduced from 1 for tighter spacing
//     textAlign: "center",
//     ellipsizeMode: "tail", // Truncate long text with "..."
//     numberOfLines: 1, // Prevent text wrapping
//   },
//   activeNavItem: {
//     backgroundColor: "#FFCA28",
//   },
//   activeNavText: {
//     color: "#2E7D32",
//     fontWeight: "700",
//   },
// });

// app/restaurant/[id]/_layout.tsx
import { Stack, Link, usePathname } from "expo-router";
import { View, Text, StyleSheet, Dimensions, SafeAreaView } from "react-native";
import {
  RestaurantProvider,
  useRestaurant,
} from "../../../contexts/RestaurantContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function RestaurantLayout() {
  return (
    <RestaurantProvider>
      <LayoutContent />
    </RestaurantProvider>
  );
}

const LayoutContent = () => {
  const { loading, restaurantId } = useRestaurant();
  const pathname = usePathname();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* 1. Give this full-height space to the Stack */}
        <View style={styles.stackContainer}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>

        {/* 2. Now this navbar will pin to the bottom of that full-screen container */}
        <View style={styles.navbar}>
          {["info", "floorplan", "dishes", "reviews"].map((tab) => {
            const isActive = pathname.includes(
              `/restaurant/${restaurantId}/${tab}`
            );
            return (
              <Link
                key={tab}
                href={`/restaurant/${restaurantId}/${tab}`}
                style={[styles.navItem, isActive && styles.activeNavItem]}
              >
                <Text
                  style={[styles.navText, isActive && styles.activeNavText]}
                >
                  {tab.toUpperCase()}
                </Text>
              </Link>
            );
          })}

          <Link
            href="/"
            style={[
              styles.navItem,
              (pathname === "/" || pathname === "") && styles.activeNavItem,
            ]}
          >
            <Text
              style={[
                styles.navText,
                (pathname === "/" || pathname === "") && styles.activeNavText,
              ]}
            >
              X
            </Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Make the root container fill the entire overlay area
  container: {
    // flex: 1,
    backgroundColor: "rgba(254, 180, 8, 0.7)",
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  // Give the Stack room to render in the body of the modal
  stackContainer: {
    maxHeight: "100%",
    flex: 1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  loadingText: {
    fontSize: 18,
    color: "#2E7D32",
    fontWeight: "600",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around", // or space-between/space-evenly
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: "#2E7D32",
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%", // full width
    height: 50, // give it a fixed height
    zIndex: 10,
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  navItem: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  navText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  activeNavItem: {
    backgroundColor: "#FFCA28",
  },
  activeNavText: {
    color: "#2E7D32",
    fontWeight: "700",
  },
});
