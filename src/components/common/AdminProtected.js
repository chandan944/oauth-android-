// src/components/common/AdminProtected.js

import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext"; // ✅ Use Auth Context
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../utils/colors";

/**
 * Higher-Order Component to protect admin-only screens
 * Uses AuthContext to check if user is admin
 */
const AdminProtected = ({ children, navigation }) => {
  const { user } = useAuth(); // ✅ Get user from context
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    // Check admin access when component mounts
    console.log("🔐 AdminProtected - Checking access...");
    console.log("👤 User:", user);
    console.log("🎭 Role:", user?.role);
    console.log("✅ Is Admin:", isAdmin);

    if (!isAdmin) {
      // Not admin - go back immediately
      console.log("❌ Access denied - Redirecting back");
      navigation.goBack();
    }
  }, [isAdmin, navigation]);

  // If not admin, show nothing (will navigate back anyway)
  if (!isAdmin) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Ionicons name="lock-closed" size={64} color={COLORS.error} />
        <Text style={styles.unauthorizedTitle}>Access Denied</Text>
        <Text style={styles.unauthorizedText}>
          You don't have permission to access this page
        </Text>
      </View>
    );
  }

  // User is admin - render the protected content
  return <>{children}</>;
};

const styles = StyleSheet.create({
  unauthorizedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 32,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  unauthorizedText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
  },
});

export default AdminProtected;