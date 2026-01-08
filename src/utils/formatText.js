import React from "react";
import { Text } from "react-native";

export const formatText = (text) => {
  if (!text) return null;

  const regex = /(\*.*?\*|#.*?#|\$.*?\$|_.*?_|\~.*?\~|\^.*?\^|!.*?!)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // 🌿 *bold green*
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <Text key={index} style={{ fontWeight: "bold", color: "green" }}>
          {part.slice(1, -1)}
        </Text>
      );
    }

    // 🟨 #highlight#
    if (part.startsWith("#") && part.endsWith("#")) {
      return (
        <Text
          key={index}
          style={{
            
            backgroundColor: "yellow",
            color: "#000",
            paddingHorizontal: 4,
            borderRadius: 10,
            marginHorizontal:3
          }}
        >
          {part.slice(1, -1)}
        </Text>
      );
    }

    // 🌸 $pink$
    if (part.startsWith("$") && part.endsWith("$")) {
      return (
        <Text key={index} style={{ color: "hotpink", fontStyle: "italic" }}>
          {part.slice(1, -1)}
        </Text>
      );
    }

    // 🔵 _underline_
    if (part.startsWith("_") && part.endsWith("_")) {
      return (
        <Text key={index} style={{ textDecorationLine: "underline" }}>
          {part.slice(1, -1)}
        </Text>
      );
    }

    // 💙 ~blue~
    if (part.startsWith("~") && part.endsWith("~")) {
      return (
        <Text key={index} style={{ color: "dodgerblue" }}>
          {part.slice(1, -1)}
        </Text>
      );
    }

    // 🔍 ^big^
    if (part.startsWith("^") && part.endsWith("^")) {
      return (
        <Text key={index} style={{ fontSize: 22, fontWeight: "600" }}>
          {part.slice(1, -1)}
        </Text>
      );
    }

    // ❤️‍🔥 !glow!
    if (part.startsWith("!") && part.endsWith("!")) {
      return (
        <Text
          key={index}
          style={{
            color: "red",
            fontWeight: "bold",
            textShadowColor: "red",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 6,
          }}
        >
          {part.slice(1, -1)}
        </Text>
      );
    }

    return <Text key={index}>{part}</Text>;
  });
};
