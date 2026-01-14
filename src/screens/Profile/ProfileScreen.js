import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../utils/colors";

const { width } = Dimensions.get("window");

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Gradient Background */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          {/* Profile Avatar with Glow Effect */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarGlow}>
              <View style={styles.avatarWrapper}>
                {user?.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <LinearGradient
                    colors={['#ffecd2', '#fcb69f']}
                    style={styles.avatarPlaceholder}
                  >
                    <Text style={styles.avatarText}>
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </Text>
                  </LinearGradient>
                )}
              </View>
            </View>
          </View>

          {/* User Info */}
          <Text style={styles.name}>{user?.name || "User"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          
          {/* Role Badge with Glassmorphism */}
          <View style={styles.roleBadge}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.roleBadgeInner}
            >
              <Ionicons name="shield-checkmark" size={14} color="#fff" />
              <Text style={styles.roleText}>{user?.role || "USER"}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Decorative Circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >


        {/* Logout Button with Gradient */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#f7faf7', '#19ee23']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out-outline" size={24} color="#070707" />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          
          <Text style={styles.versionText}>😊</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarGlow: {
    padding: 6,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  email: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  roleBadge: {
    marginTop: 8,
  },
  roleBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 6,
  },
  roleText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -50,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -30,
    left: -30,
  },
  scrollContent: {
    flex: 1,
    marginTop: -20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statCardGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuItem: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  logoutButton: {
    marginHorizontal: 20,
     marginTop:200,
    borderRadius: 16,
    shadowColor: '#0e0c0c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 10,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0c0c0c',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop:-10,
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 40,
  },
  footerEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '500',
  },
});

export default ProfileScreen;