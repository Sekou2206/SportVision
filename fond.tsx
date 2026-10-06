import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Teinte = "violet" | "cyan" | "bleu";

const PALETTES = {
  violet: [
    "rgba(75,32,217,.38)",
    "rgba(53,20,168,.18)",
    "rgba(10,6,32,0)",
  ],
  cyan: [
    "rgba(0,200,242,.24)",
    "rgba(0,111,232,.12)",
    "rgba(10,6,32,0)",
  ],
  bleu: [
    "rgba(0,111,232,.32)",
    "rgba(75,32,217,.16)",
    "rgba(10,6,32,0)",
  ],
} as const;

export function Lueur({
  teinte = "violet",
}: {
  teinte?: Teinte;
}) {
  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={s.enveloppe}
    >
      <LinearGradient
        colors={PALETTES[teinte]}
        locations={[0, 0.42, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={[
          "rgba(212,44,240,.12)",
          "rgba(212,44,240,.04)",
          "rgba(212,44,240,0)",
        ]}
        locations={[0, 0.4, 1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const s = StyleSheet.create({
  enveloppe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 460,
  },
});
