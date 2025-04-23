import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { styles } from "../../styles/main-page-style";

export const SearchButton = ({
  showSearchButton,
  onPress,
}: {
  showSearchButton: boolean;
  onPress: () => void;
}) => {
  if (!showSearchButton) return null;
  return (
    <TouchableOpacity style={styles.searchButton} onPress={onPress}>
      <Text style={styles.searchButtonText}>Search Here</Text>
    </TouchableOpacity>
  );
};
