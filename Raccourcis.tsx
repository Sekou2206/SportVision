import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { C, E, R, TOUCHE } from "../theme/couleurs";
import { P } from "../theme/polices";

export interface Raccourci {
  icone: keyof typeof Ionicons.glyphMap;
  libelle: string;
  teinte: string;
  onPress: () => void;
}

export function Raccourcis({
  elements,
}: {
  elements: Raccourci[];
}) {
  if (!elements.length) return null;

  return (
    <View style={s.rangee}>
      {elements.map((r) => (
        <Pressable
          key={r.libelle}
          onPress={r.onPress}
          accessibilityRole="button"
          accessibilityLabel={r.libelle}
          style={({ pressed }) => [
            s.case_,
            pressed && {
              opacity: 0.85,
              borderColor: r.teinte,
            },
          ]}
        >
          <LinearGradient
            pointerEvents="none"
            colors={[
              "rgba(255,255,255,.09)",
              "rgba(255,255,255,.02)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.reflet}
          />

          <View style={s.rond}>
            <View
              pointerEvents="none"
              style={[
                s.teinteFond,
                { backgroundColor: r.teinte },
              ]}
            />

            <View
              pointerEvents="none"
              style={[
                s.teinteBordure,
                { borderColor: r.teinte },
              ]}
            />

            <Ionicons
              name={r.icone}
              size={21}
              color={r.teinte}
            />
          </View>

          <Text style={s.libelle}>
            {r.libelle}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  rangee: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    gap: E.s,
  },
  case_: {
    position: "relative",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 88,
    minWidth: 88,
    minHeight: TOUCHE + 64,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
    paddingHorizontal: 8,
    paddingVertical: E.m,
    backgroundColor: C.surface,
    borderRadius: R.l,
    borderWidth: 1,
    borderColor: C.bordureForte,
    shadowColor: "#140650",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  reflet: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: R.l,
  },
  rond: {
    position: "relative",
    width: 44,
    height: 44,
    borderRadius: R.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,.03)",
  },
  teinteFond: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: R.pill,
    opacity: 0.12,
  },
  teinteBordure: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: R.pill,
    borderWidth: 1,
    opacity: 0.45,
  },
  libelle: {
    alignSelf: "stretch",
    color: C.texte,
    fontFamily: P.texteFort,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
