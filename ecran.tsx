import React from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Lueur } from "./Fond";
import { MODE_DEMO } from "../lib/demonstration";
import { C, E, R, TOUCHE } from "../theme/couleurs";
import { P } from "../theme/polices";

type EcranProps = {
  children: React.ReactNode;
  rafraichir?: () => void;
  enCours?: boolean;
  style?: StyleProp<ViewStyle>;
  teinte?: "violet" | "cyan" | "bleu";
};

export function Ecran({
  children,
  rafraichir,
  enCours = false,
  style,
  teinte = "violet",
}: EcranProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={s.ecran}>
      <Lueur teinte={teinte} />

      <ScrollView
        style={s.defilement}
        contentContainerStyle={[
          s.contenu,
          {
            paddingTop: insets.top + E.m,
            paddingBottom: insets.bottom + 72 + E.l,
            paddingLeft: insets.left + E.m,
            paddingRight: insets.right + E.m,
          },
          style,
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          rafraichir ? (
            <RefreshControl
              refreshing={enCours}
              onRefresh={rafraichir}
              tintColor={C.cyan}
              colors={[C.cyan, C.accentClair, C.violetVif]}
              progressBackgroundColor={C.surface}
            />
          ) : undefined
        }
      >
        {MODE_DEMO ? (
          <View style={s.demo}>
            <Text style={s.demoTexte}>
              Mode démonstration · données fictives
            </Text>
          </View>
        ) : null}

        {children}
      </ScrollView>
    </View>
  );
}

type SectionProps = {
  titre: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function Section({
  titre,
  action,
  children,
}: SectionProps) {
  return (
    <View style={s.section}>
      <View style={s.enteteSection}>
        <View style={s.titreGroupe}>
          <LinearGradient
            colors={[C.cyan, C.accentClair, C.accent, C.violetVif]}
            locations={[0, 0.35, 0.65, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={s.accentSection}
          />

          <Text accessibilityRole="header" style={s.titreSection}>
            {titre}
          </Text>
        </View>

        {action ? (
          <View style={s.actionSection}>{action}</View>
        ) : null}
      </View>

      {children}
    </View>
  );
}

export function Probleme({
  surReessayer,
}: {
  surReessayer?: () => void;
}) {
  return (
    <View style={s.probleme}>
      <Text
        accessibilityRole="header"
        accessibilityLiveRegion="polite"
        style={s.problemeTitre}
      >
        Chargement impossible
      </Text>

      <Text style={s.problemeTexte}>
        Vérifiez votre connexion, puis réessayez. Si cela se reproduit,
        fermez et rouvrez l'application : votre session a peut-être expiré.
      </Text>

      {surReessayer ? (
        <Pressable
          onPress={surReessayer}
          accessibilityRole="button"
          accessibilityLabel="Réessayer le chargement"
          style={({ pressed }) => [
            s.reessayer,
            pressed && s.reessayerPresse,
          ]}
        >
          <Text style={s.reessayerTexte}>Réessayer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Vide({
  titre,
  texte,
}: {
  titre: string;
  texte: string;
}) {
  return (
    <View style={s.vide}>
      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(255,255,255,.07)",
          "rgba(255,255,255,.015)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.reflet}
      />

      <Text accessibilityRole="header" style={s.videTitre}>
        {titre}
      </Text>

      <Text style={s.videTexte}>{texte}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  ecran: {
    flex: 1,
    backgroundColor: C.fond,
  },
  defilement: {
    flex: 1,
    backgroundColor: "transparent",
  },
  contenu: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    gap: E.l,
  },
  demo: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: R.pill,
    backgroundColor: "rgba(232,163,61,.12)",
    borderWidth: 1,
    borderColor: "rgba(232,163,61,.32)",
  },
  demoTexte: {
    color: C.alerteTexte,
    fontFamily: P.texteFort,
    fontSize: 11.5,
    lineHeight: 18,
  },
  section: {
    gap: E.m,
    minWidth: 0,
  },
  enteteSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: E.s,
  },
  titreGroupe: {
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: 10,
  },
  accentSection: {
    width: 3,
    height: 24,
    borderRadius: R.pill,
  },
  titreSection: {
    color: C.texte,
    fontFamily: P.titre,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0.2,
    textTransform: "uppercase",
    flexShrink: 1,
  },
  actionSection: {
    maxWidth: "100%",
    flexShrink: 1,
  },
  vide: {
    position: "relative",
    borderWidth: 1,
    borderColor: C.bordureForte,
    borderRadius: R.l,
    backgroundColor: C.surface,
    padding: E.l,
    gap: E.s,
  },
  reflet: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: R.l,
  },
  videTitre: {
    color: C.texte,
    fontFamily: P.titreFort,
    fontSize: 24,
    lineHeight: 30,
  },
  videTexte: {
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 14,
    lineHeight: 23,
  },
  probleme: {
    borderWidth: 1,
    borderColor: "rgba(240,68,94,.32)",
    borderRadius: R.l,
    backgroundColor: "rgba(240,68,94,.08)",
    padding: E.l,
    gap: E.s,
  },
  problemeTitre: {
    color: C.dangerTexte,
    fontFamily: P.titreFort,
    fontSize: 24,
    lineHeight: 30,
  },
  problemeTexte: {
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 14,
    lineHeight: 23,
  },
  reessayer: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    minHeight: TOUCHE + 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: E.xs,
    paddingHorizontal: E.l,
    paddingVertical: 12,
    borderRadius: R.pill,
    backgroundColor: C.texte,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.8)",
  },
  reessayerPresse: {
    opacity: 0.8,
  },
  reessayerTexte: {
    color: "#1A0B5C",
    fontFamily: P.texteFort,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
