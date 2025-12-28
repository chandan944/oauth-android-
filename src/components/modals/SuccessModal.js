import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../utils/colors";

const SuccessModal = ({
  visible,
  onClose,
  title = "Success!",
  message = "Operation completed successfully",
  autoClose = true,
  duration = 2000,
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Zoom in animation
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Auto close
      if (autoClose) {
        const timer = setTimeout(() => {
          Animated.timing(scaleValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onClose());
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      scaleValue.setValue(0);
    }
  }, [visible, autoClose, duration, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: pulseValue }],
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={80}
              color={COLORS.success}
            />
          </Animated.View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {!autoClose && (
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Got it!</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default SuccessModal;
