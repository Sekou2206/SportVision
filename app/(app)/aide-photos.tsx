import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "../../src/lib/session";
import { Ecran } from "../../src/ui/Ecran";
import { C, E, R, TOUCHE } from "../../src/theme/couleurs";
import { P } from "../../src/theme/polices";
import { retourner } from "../../src/lib/retour";

type Etape = {
  icone: keyof typeof Ionicons.glyphMap;
  titre: string;
  texte: string;
};

function points(parent: boolean): Etape[] {
  return [
    {
      icone: "camera-outline",
      titre: "SportVision photographie le match",
      texte:
        "Les photos sont triées, retouchées, puis publiées dans une galerie réservée à l'équipe.",
    },
    {
      icone: "person-circle-outline",
      titre: parent
        ? "Ses photos sont repérées"
        : "Vos photos sont repérées",
      texte: parent
        ? "Celles où votre enfant apparaît vous sont signalées, sans que personne d'autre ne les voie."
        : "Celles où vous apparaissez vous sont signalées, sans que personne d'autre ne les voie.",
    },
    {
      icone: "key-outline",
      titre: parent
        ? "Un Pass Photo par enfant"
        : "Le Pass Photo",
      texte: parent
        ? "Il se prend pour chaque enfant, dans l'application, et vaut toute la saison. Il ouvre ses photos de match, les photos de groupe et toute la galerie des entraînements de sa catégorie, toutes équipes confondues."
        : "Il se prend dans l'application et vaut toute la saison. Il ouvre vos photos de match, les photos de groupe et toute la galerie des entraînements de votre catégorie, toutes équipes confondues.",
    },
  ];
}

export default function Acces() {
  const { profil } = useSession();
  const parent = profil?.espace === "parent";

  return (
    <Ecran teinte="violet">
      <Pressable
        onPress={() => retourner("/photos")}
        accessibilityRole="button"
        accessibilityLabel="Retour aux photos"
        style={({ pressed }) => [
          s.retour,
          pressed && s.presse,
        ]}
      >
        <Ionicons
          name="chevron-back"
          size={18}
          color={C.texte}
        />
        <Text style={s.retourTexte}>Photos</Text>
      </Pressable>

      <View style={s.entete}>
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(75,32,217,.22)",
            "rgba(212,44,240,.07)",
            "rgba(255,255,255,.02)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.reflet}
        />

        <Text accessibilityRole="header" style={s.titre}>
          Comment j'accède aux photos
        </Text>

        <Text style={s.sous}>
          {parent
            ? "Les galeries de sa catégorie, matchs et entraînements, suivent toutes le même chemin."
            : "Les galeries de votre catégorie, matchs et entraînements, suivent toutes le même chemin."}
        </Text>
      </View>

      <View style={s.etapes}>
        {points(parent).map((p, i) => (
          <View key={p.titre} style={s.etape}>
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

            <View style={s.enteteEtape}>
              <View style={s.numero}>
                <Text style={s.numeroTexte}>{i + 1}</Text>
              </View>

              <Text style={s.etiquette}>
                Étape {i + 1}
              </Text>

              <View style={s.icone}>
                <Ionicons
                  name={p.icone}
                  size={21}
                  color={C.cyanTexte}
                />
              </View>
            </View>

            <Text
              accessibilityRole="header"
              style={s.etapeTitre}
            >
              {p.titre}
            </Text>

            <Text style={s.etapeTexte}>{p.texte}</Text>
          </View>
        ))}
      </View>

      <View style={s.note}>
        <Ionicons
          name="information-circle-outline"
          size={21}
          color={C.cyanTexte}
          style={s.noteIcone}
        />

        <Text style={s.noteTexte}>
          Une galerie reste fermée ? Rapprochez-vous de votre club :
          c'est lui qui décide des rencontres couvertes et des accès
          ouverts aux familles.
        </Text>
      </View>
    </Ecran>
  );
}

const s = StyleSheet.create({
  retour: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "flex-start",
    minHeight: TOUCHE,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: R.pill,
    backgroundColor: "rgba(255,255,255,.07)",
    borderWidth: 1,
    borderColor: C.bordureForte,
  },
  retourTexte: {
    color: C.texte,
    fontFamily: P.texteFort,
    fontSize: 13,
    lineHeight: 20,
  },
  presse: {
    opacity: 0.8,
  },
  entete: {
    position: "relative",
    gap: 10,
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
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -0.2,
    textTransform: "uppercase",
  },
  sous: {
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 14,
    lineHeight: 23,
  },
  etapes: {
    gap: E.m,
  },
  etape: {
    position: "relative",
    gap: 12,
    padding: E.m,
    backgroundColor: C.surface,
    borderRadius: R.l,
    borderWidth: 1,
    borderColor: C.bordureForte,
    overflow: "hidden",
  },
  enteteEtape: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  numero: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: R.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.texte,
  },
  numeroTexte: {
    color: "#1A0B5C",
    fontFamily: P.chiffre,
    fontSize: 16,
    fontVariant: ["tabular-nums"],
  },
  etiquette: {
    flex: 1,
    color: C.violetTexte,
    fontFamily: P.label,
    fontSize: 11,
    lineHeight: 18,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  icone: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: R.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,200,242,.07)",
    borderWidth: 1,
    borderColor: "rgba(0,200,242,.2)",
  },
  etapeTitre: {
    color: C.texte,
    fontFamily: P.titreFort,
    fontSize: 25,
    lineHeight: 31,
  },
  etapeTexte: {
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 14,
    lineHeight: 23,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: E.m,
    backgroundColor: "rgba(0,200,242,.07)",
    borderWidth: 1,
    borderColor: "rgba(0,200,242,.25)",
    borderRadius: R.l,
  },
  noteIcone: {
    marginTop: 2,
  },
  noteTexte: {
    flex: 1,
    minWidth: 0,
    color: C.cyanTexte,
    fontFamily: P.texte,
    fontSize: 13.5,
    lineHeight: 22,
  },
});
