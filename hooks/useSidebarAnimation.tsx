import { useRef } from "react";
import { Animated } from "react-native";

export const useSidebarAnimation = () => {
  const slideAnim = useRef(new Animated.Value(-250)).current;

  const imageScaleAnim = useRef(new Animated.Value(0)).current;

  const openSidebar = () => {
    console.log("Opening sidebar...");
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.spring(imageScaleAnim, {
        toValue: 1,
        useNativeDriver: false,
      }),
    ]).start(() => {});
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -250,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.spring(imageScaleAnim, {
        toValue: 0,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return {
    slideAnim,
    imageScaleAnim,
    openSidebar,
    closeSidebar,
  };
};
