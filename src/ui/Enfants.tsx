import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFamille } from "../lib/famille";
import { C, E, R, TOUCHE } from "../theme/couleurs";
import { P } from "../theme/polices";

export function SelecteurEnfant() {
  const { sportifs, choisi, choisir } = useFamille();

  if (sportifs.length < 2) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={st.defilement}
      contentContainerStyle={st.liste}
    >
      {sportifs.map((sportif) => {
        const actif =
          choisi?.refId === sportif.refId &&
          choisi?.kind === sportif.kind;

        return (
          <Pressable
            key={`${sportif.kind}:${sportif.refId}`}
            onPress={() => choisir(sportif)}
            accessibilityRole="button"
            accessibilityState={{ selected: actif }}
            accessibilityLabel={`Voir ${sportif.prenom}${
              sportif.enAttente
                ? ", rattachement en attente"
                : ""
            }`}
            style={({ pressed }) => [
              st.puce,
              actif && st.puceActive,
              pressed && st.presse,
            ]}
          >
            <Ionicons
              name={actif ? "person" : "person-outline"}
              size={16}
              color={actif ? "#1A0B5C" : C.cyanTexte}
            />

            <Text style={[st.texte, actif && st.texteActif]}>
              {sportif.prenom}
            </Text>

            {sportif.enAttente ? (
              <Ionicons
                name="time-outline"
                size={15}
                color={actif ? "#1A0B5C" : C.alerteTexte}
              />
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function BandeauEnfant() {
  const { choisi } = useFamille();
  const router = useRouter();

  if (!choisi) return null;

  const nomComplet = [choisi.prenom, choisi.nom]
    .filter(Boolean)
    .join(" ");

  return (
    <View style={st.bandeau}>
      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(75,32,217,.16)",
          "rgba(0,200,242,.05)",
          "rgba(255,255,255,.02)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={st.reflet}
      />

      <View style={st.informations}>
        <Text style={st.bandeauLabel}>
          Espace parent · vous consultez
        </Text>

        <Text style={st.bandeauNom}>{nomComplet}</Text>

        {choisi.categorie ? (
          <Text style={st.categorie}>{choisi.categorie}</Text>
        ) : null}

        {choisi.enAttente ? (
          <View style={st.attenteLigne}>
            <Ionicons
              name="time-outline"
              size={14}
              color={C.alerteTexte}
              style={st.attenteIcone}
            />

            <Text style={st.attente}>
              Rattachement en attente de validation par le club
            </Text>
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={() => router.push("/connect/affiliations")}
        accessibilityRole="button"
        accessibilityLabel="Ajouter un enfant"
        style={({ pressed }) => [
          st.ajouter,
          pressed && st.presse,
        ]}
      >
        <Ionicons
          name="add"
          size={18}
          color={C.cyanTexte}
        />
        <Text style={st.ajouterTexte}>Ajouter un enfant</Text>
      </Pressable>
    </View>
  );
}

const st = StyleSheet.create({
  defilement: {
    flexGrow: 0,
    flexShrink: 0,
  },
  liste: {
    gap: E.s,
    paddingVertical: 2,
    paddingRight: E.s,
  },
  puce: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: TOUCHE,
    paddingHorizontal: E.m,
    paddingVertical: 11,
    borderRadius: R.pill,
    backgroundColor: "rgba(255,255,255,.06)",
    borderWidth: 1,
    borderColor: C.bordureForte,
  },
  puceActive: {
    backgroundColor: C.texte,
    borderColor: C.texte,
  },
  texte: {
    color: C.texteDoux,
    fontFamily: P.texteMoyen,
    fontSize: 13,
    lineHeight: 20,
  },
  texteActif: {
    color: "#1A0B5C",
    fontFamily: P.texteFort,
  },
  presse: {
    opacity: 0.8,
  },
  bandeau: {
    position: "relative",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: E.m,
    backgroundColor: C.surface,
    borderRadius: R.l,
    borderWidth: 1,
    borderColor: C.bordureForte,
    padding: E.m,
    overflow: "hidden",
  },
  reflet: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: R.l,
  },
  informations: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 180,
    minWidth: 0,
    gap: 5,
  },
  bandeauLabel: {
    color: C.cyanTexte,
    fontFamily: P.label,
    fontSize: 10.5,
    lineHeight: 17,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  bandeauNom: {
    color: C.texte,
    fontFamily: P.texteGras,
    fontSize: 17,
    lineHeight: 25,
  },
  categorie: {
    color: C.texteDoux,
    fontFamily: P.texteMoyen,
    fontSize: 12.5,
    lineHeight: 20,
  },
  attenteLigne: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 3,
  },
  attenteIcone: {
    marginTop: 2,
  },
  attente: {
    flex: 1,
    minWidth: 0,
    color: C.alerteTexte,
    fontFamily: P.texte,
    fontSize: 11.5,
    lineHeight: 18,
  },
  ajouter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    maxWidth: "100%",
    minHeight: TOUCHE,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: R.pill,
    backgroundColor: "rgba(0,200,242,.08)",
    borderWidth: 1,
    borderColor: "rgba(0,200,242,.28)",
  },
  ajouterTexte: {
    color: C.cyanTexte,
    fontFamily: P.texteFort,
    fontSize: 12,
    lineHeight: 19,
    flexShrink: 1,
    textAlign: "center",
  },
});
