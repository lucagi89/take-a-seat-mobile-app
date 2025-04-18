import { useState } from "react";
import { Animated } from "react-native";

export const useSidebarAnimation = () => {
  const slideAnim = useState(new Animated.Value(-250))[0];
  const imageScaleAnim = useState(new Animated.Value(0))[0];

  const toggleSidebar = (visible: boolean) => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -250,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (visible) {
      Animated.spring(imageScaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      imageScaleAnim.setValue(0);
    }
  };

  return { slideAnim, imageScaleAnim, toggleSidebar };
};
