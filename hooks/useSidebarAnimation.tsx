import { useRef } from "react";
import { Animated } from "react-native";

export const useSidebarAnimation = () => {
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const imageScaleAnim = useRef(new Animated.Value(0)).current;

  const openSidebar = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(imageScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(imageScaleAnim, {
        toValue: 0,
        useNativeDriver: true,
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
