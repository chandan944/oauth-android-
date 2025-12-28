import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../utils/colors";

const EmptyState = ({ icon = "alert-circle-outline", title, message }) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={80} color={COLORS.grey} />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default EmptyState;
