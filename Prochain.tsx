import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, DEGRADE_DOUX, E, R } from "../theme/couleurs";
import { P } from "../theme/polices";
import {
  dateLongue,
  dateDuJourParis,
  heureCourte,
  versDate,
} from "../lib/dates";
import type { Evenement } from "../lib/donnees";
import { Ecusson } from "./Cartes";

function distance(iso: string): string {
  const jour = versDate(dateDuJourParis()).getTime();
  const cible = versDate(iso).getTime();
  const jours = Math.round((cible - jour) / 86400000);

  if (!Number.isFinite(jours)) return "À venir";
  if (jours === -1) return "Hier";
  if (jours < -1) return `Il y a ${Math.abs(jours)} jours`;
  if (jours === 0) return "Aujourd'hui";
  if (jours === 1) return "Demain";
  if (jours < 7) return `Dans ${jours} jours`;
  if (jours < 14) return "La semaine prochaine";

  return `Dans ${Math.round(jours / 7)} semaines`;
}

type ProchainProps = {
  e: Evenement;
  clubNom?: string | null;
  clubLogoUrl?: string | null;
  fond?: string | null;
  onPress?: () => void;
};

export function Prochain({
  e,
  clubNom,
  clubLogoUrl,
  fond,
  onPress,
}: ProchainProps) {
  const heure = heureCourte(e.heure);
  const match = e.genre === "match";
  const adversaire = e.adversaire ?? (match ? e.titre : null);

  const statut =
    e.statut === "annule"
      ? "Annulé"
      : e.statut === "reporte"
        ? "Reporté"
        : null;

  const libelle = [
    match
      ? `Match contre ${adversaire || "l'adversaire"}`
      : e.titre,
    statut,
    dateLongue(e.date),
    heure,
    e.lieu,
    e.score ? `Score ${e.score}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={libelle}
      style={({ pressed }) => [
        s.enveloppe,
        pressed && onPress ? s.presse : null,
      ]}
    >
      <LinearGradient
        colors={DEGRADE_DOUX}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.liseret}
      >
        <View style={s.corps}>
          <View
            pointerEvents="none"
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={StyleSheet.absoluteFill}
          >
            {fond ? (
              <>
                <Image
                  source={{ uri: fond }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={180}
                />

                <LinearGradient
                  colors={[
                    "rgba(10,6,32,.72)",
                    "rgba(10,6,32,.86)",
                    "rgba(10,6,32,.97)",
                  ]}
                  locations={[0, 0.5, 1]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </>
            ) : (
              <LinearGradient
                colors={[
                  "rgba(75,32,217,.24)",
                  "rgba(53,20,168,.10)",
                  "rgba(10,6,32,0)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            )}

            <LinearGradient
              colors={[
                "rgba(255,255,255,.08)",
                "rgba(255,255,255,0)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>

          <View style={s.haut}>
            <View style={s.pastilleQuand}>
              <Ionicons
                name="time-outline"
                size={14}
                color={C.cyanTexte}
              />
              <Text style={s.quand}>{distance(e.date)}</Text>
            </View>

            {e.competition ? (
              <Text style={s.competition}>
                {e.competition}
              </Text>
            ) : null}
          </View>

          {statut ? (
            <View style={s.statut}>
              <Text style={s.statutTexte}>{statut}</Text>
            </View>
          ) : null}

          {match ? (
            <View style={s.affiche}>
              <View style={s.camp}>
                <View style={s.ecussonCadre}>
                  <Ecusson
                    url={clubLogoUrl}
                    nom={clubNom}
                    taille={50}
                  />
                </View>

                <Text style={s.campNom}>
                  {e.equipe || clubNom || "Notre équipe"}
                </Text>
              </View>

              <View style={s.milieu}>
                <Text style={s.versus}>
                  {e.score || "VS"}
                </Text>

                {e.domicile !== undefined ? (
                  <Text style={s.lieuType}>
                    {e.domicile ? "à domicile" : "à l'extérieur"}
                  </Text>
                ) : null}
              </View>

              <View style={s.camp}>
                <View style={s.ecussonCadre}>
                  <Ecusson
                    url={e.ecussonAdversaire}
                    nom={adversaire}
                    taille={50}
                    neutre={!e.ecussonAdversaire}
                  />
                </View>

                <Text style={s.campNom}>
                  {adversaire || "Adversaire"}
                </Text>
              </View>
            </View>
          ) : (
            <Text
              style={[
                s.titreSimple,
                e.statut === "annule" && s.titreAnnule,
              ]}
            >
              {e.titre}
            </Text>
          )}

          <View style={s.pied}>
            <View style={s.info}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={C.cyanTexte}
                style={s.infoIcone}
              />

              <Text style={s.infoTexte}>
                {dateLongue(e.date)}
                {heure ? ` · ${heure}` : ""}
              </Text>
            </View>

            {e.lieu ? (
              <View style={s.info}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={C.cyanTexte}
                  style={s.infoIcone}
                />

                <Text style={s.infoTexte}>{e.lieu}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const s = StyleSheet.create({
  enveloppe: {
    borderRadius: R.l + 1,
    shadowColor: "#140650",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 22,
  },
  presse: {
    opacity: 0.88,
  },
  liseret: {
    borderRadius: R.l + 1,
    padding: 1,
  },
  corps: {
    position: "relative",
    backgroundColor: C.surface,
    borderRadius: R.l,
    padding: E.m,
    gap: E.m,
    overflow: "hidden",
  },
  haut: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: E.s,
  },
  pastilleQuand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    maxWidth: "100%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: R.pill,
    backgroundColor: "rgba(0,200,242,.09)",
    borderWidth: 1,
    borderColor: "rgba(0,200,242,.24)",
  },
  quand: {
    color: C.cyanTexte,
    fontFamily: P.label,
    fontSize: 11,
    lineHeight: 16,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    flexShrink: 1,
  },
  competition: {
    color: C.texteDoux,
    fontFamily: P.texteMoyen,
    fontSize: 11.5,
    lineHeight: 18,
    flexShrink: 1,
  },
  statut: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: R.pill,
    backgroundColor: "rgba(232,163,61,.12)",
    borderWidth: 1,
    borderColor: "rgba(232,163,61,.30)",
  },
  statutTexte: {
    color: C.alerteTexte,
    fontFamily: P.texteFort,
    fontSize: 12,
    lineHeight: 18,
  },
  affiche: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: E.s,
  },
  camp: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 12,
  },
  ecussonCadre: {
    padding: 7,
    borderRadius: R.m + 4,
    backgroundColor: "rgba(255,255,255,.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.16)",
  },
  campNom: {
    alignSelf: "stretch",
    color: C.texte,
    fontFamily: P.texteGras,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  milieu: {
    width: 76,
    flexShrink: 1,
    alignItems: "center",
    gap: 5,
    paddingTop: 12,
  },
  versus: {
    alignSelf: "stretch",
    color: C.texte,
    fontFamily: P.chiffre,
    fontSize: 27,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  lieuType: {
    alignSelf: "stretch",
    color: C.texteDoux,
    fontFamily: P.texteMoyen,
    fontSize: 10.5,
    lineHeight: 16,
    textAlign: "center",
  },
  titreSimple: {
    color: C.texte,
    fontFamily: P.titre,
    fontSize: 32,
    lineHeight: 38,
    textTransform: "uppercase",
    paddingVertical: E.s,
  },
  titreAnnule: {
    textDecorationLine: "line-through",
    color: C.texteDoux,
  },
  pied: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: C.bordureForte,
    paddingTop: E.m,
  },
  info: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  infoIcone: {
    marginTop: 3,
  },
  infoTexte: {
    flex: 1,
    minWidth: 0,
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 13,
    lineHeight: 22,
  },
});
