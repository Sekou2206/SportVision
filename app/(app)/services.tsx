import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Ecran, Section } from "../../src/ui/Ecran";
import { C, E, R, TOUCHE } from "../../src/theme/couleurs";
import { P } from "../../src/theme/polices";

type LigneProps = {
  icone: keyof typeof Ionicons.glyphMap;
  titre: string;
  detail: string;
  onPress: () => void;
  teinte?: string;
  derniere?: boolean;
};

function Ligne({
  icone,
  titre,
  detail,
  onPress,
  teinte = C.cyanTexte,
  derniere = false,
}: LigneProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titre}. ${detail}`}
      style={({ pressed }) => [
        s.ligneHote,
        !derniere && s.ligneSeparateur,
        pressed && s.lignePressee,
      ]}
    >
      <View style={s.rond}>
        <View
          pointerEvents="none"
          style={[
            s.rondFond,
            { backgroundColor: teinte },
          ]}
        />
        <View
          pointerEvents="none"
          style={[
            s.rondBordure,
            { borderColor: teinte },
          ]}
        />

        <Ionicons
          name={icone}
          size={21}
          color={teinte}
        />
      </View>

      <View style={s.ligneContenu}>
        <Text style={s.ligneTitre}>{titre}</Text>
        <Text style={s.ligneDetail}>{detail}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={16}
        color={C.texteFaible}
      />
    </Pressable>
  );
}

export default function Services() {
  const router = useRouter();

  return (
    <Ecran teinte="cyan">
      <View style={s.entete}>
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(0,200,242,.12)",
            "rgba(75,32,217,.12)",
            "rgba(255,255,255,.02)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.reflet}
        />

        <Text accessibilityRole="header" style={s.titre}>
          Services
        </Text>

        <Text style={s.chapeau}>
          Demander une captation, participer à une collecte,
          retrouver vos reçus.
        </Text>
      </View>

      <Section titre="Faire venir SportVision">
        <View style={s.groupe}>
          <Ligne
            icone="videocam-outline"
            teinte={C.violetTexte}
            titre="Prestations"
            detail="Photo, vidéo, drone : voir les formules et demander une date"
            onPress={() => router.push("/connect/prestations")}
          />

          <Ligne
            icone="people-outline"
            teinte={C.cyanTexte}
            titre="Paiement collectif"
            detail="Lancer une collecte, ou participer à celle du groupe"
            onPress={() => router.push("/connect/cotisations")}
            derniere
          />
        </View>
      </Section>

      <Section titre="Mes paiements">
        <View style={s.groupe}>
          <Ligne
            icone="receipt-outline"
            teinte={C.cyanTexte}
            titre="Mes commandes"
            detail="Ce que vous avez commandé, et où ça en est"
            onPress={() => router.push("/connect/commandes")}
          />

          <Ligne
            icone="document-text-outline"
            teinte={C.violetTexte}
            titre="Factures et paiements"
            detail="Vos factures, à télécharger à tout moment"
            onPress={() => router.push("/connect/factures")}
            derniere
          />
        </View>
      </Section>

      <Section titre="Besoin d'aide ?">
        <View style={s.groupe}>
          <Ligne
            icone="help-buoy-outline"
            teinte={C.cyanTexte}
            titre="Aide"
            detail="Les questions qu'on nous pose le plus souvent"
            onPress={() => router.push("/connect/aide")}
            derniere
          />
        </View>
      </Section>
    </Ecran>
  );
}

const s = StyleSheet.create({
  entete: {
    position: "relative",
    gap: 8,
    padding: E.m,
    backgroundColor: C.surface,
    borderRadius: R.l,
    borderWidth: 1,
    borderColor: C.bordureForte,
    overflow: "hidden",
  },
  reflet: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: R.l,
  },
  titre: {
    color: C.texte,
    fontFamily: P.titre,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.3,
    textTransform: "uppercase",
  },
  chapeau: {
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 14,
    lineHeight: 23,
  },
  groupe: {
    backgroundColor: C.surface,
    borderRadius: R.l,
    borderWidth: 1,
    borderColor: C.bordureForte,
    overflow: "hidden",
  },
  ligneHote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: E.m,
    paddingVertical: E.m,
    minHeight: TOUCHE + 32,
  },
  ligneSeparateur: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.bordure,
  },
  lignePressee: {
    backgroundColor: "rgba(255,255,255,.07)",
  },
  rond: {
    position: "relative",
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: R.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  rondFond: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: R.pill,
    opacity: 0.08,
  },
  rondBordure: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: R.pill,
    borderWidth: 1,
    opacity: 0.25,
  },
  ligneContenu: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  ligneTitre: {
    color: C.texte,
    fontFamily: P.texteFort,
    fontSize: 15,
    lineHeight: 22,
  },
  ligneDetail: {
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 12.5,
    lineHeight: 20,
  },
});
