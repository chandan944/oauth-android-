// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import {
  saveToken,
  saveUser,
  getToken,
  getUser,
  clearStorage,
  isOnboardingComplete,
  setOnboardingComplete,
} from "../utils/storage";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    checkAuth();
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await isOnboardingComplete();
      setOnboardingCompleted(completed);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await setOnboardingComplete();
      setOnboardingCompleted(true);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const checkAuth = async () => {
    console.log("🔍 Checking authentication status...");
    try {
      const token = await getToken();
      const userData = await getUser();

      if (token && userData) {
        console.log("✅ User already authenticated:", userData.email);

        // ✅ Set token in API headers (interceptor will also add it, but this ensures it's there)
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log("ℹ️ No existing authentication found");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async (authData) => {
    console.log("🔐 Processing Google authentication...");

    if (!authData || !authData.email) {
      console.error("❌ Invalid authData:", authData);
      return {
        success: false,
        message: "Invalid authentication data",
      };
    }

    console.log("👤 User email:", authData.email);

    try {
      console.log(
        "📤 Sending to backend:",
        api.defaults.baseURL + "/auth/google"
      );

      const response = await api.post("/auth/google", {
        idToken: authData.idToken,
        email: authData.email,
        name: authData.name,
        imageUrl: authData.imageUrl,
      });

      console.log("📥 Backend response:", response.data);

      if (response.data && response.data.success && response.data.token) {
        console.log("✅ JWT token received from backend");

        const backendUser = response.data.user;
        const token = response.data.token;

        // ✅ CRITICAL: Save token and WAIT for completion
        const tokenSaved = await saveToken(token);

        if (!tokenSaved) {
          console.error("❌ Failed to save token to storage");
          return { success: false, message: "Failed to save authentication" };
        }

        console.log("💾 Token saved and verified in storage");

        // ✅ Set token in API headers immediately
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("🔑 Token set in API headers");

        const userData = {
          id: backendUser.id,
          email: backendUser.email,
          name: backendUser.name,
          imageUrl: backendUser.imageUrl || "",
          role: backendUser.role || "USER",
        };

        // ✅ Save user data and WAIT
        const userSaved = await saveUser(userData);

        if (!userSaved) {
          console.error("❌ Failed to save user data");
        } else {
          console.log("💾 User data saved to storage");
        }

        // ✅ Update state AFTER everything is saved
        setUser(userData);
        setIsAuthenticated(true);

        console.log("🎉 Authentication complete!");

        // ✅ Small delay to ensure all state updates propagate
        await new Promise((resolve) => setTimeout(resolve, 200));

        return { success: true };
      }

      console.error("❌ No token in backend response");
      return { success: false, message: "No token received from backend" };
    } catch (error) {
      console.error("❌ Google auth error:", error);
      console.error("Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Authentication failed";

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logout = async () => {
    console.log("👋 Logging out...");
    try {
      // Clear storage
      await clearStorage();

      // Remove auth header from API
      delete api.defaults.headers.common["Authorization"];

      // Update state
      setUser(null);
      setIsAuthenticated(false);

      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    onboardingCompleted,
    checkingOnboarding,
    completeOnboarding,
    handleGoogleAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};