import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Bouton } from "./Base";
import { Lueur } from "./Fond";
import { C, E, R } from "../theme/couleurs";
import { P } from "../theme/polices";
import type {
  PoigneeVueWeb,
  ProprietesVueWeb,
} from "./VueWeb";

export const VueWeb = forwardRef<
  PoigneeVueWeb,
  ProprietesVueWeb
>(function VueWebNavigateur(
  { surChargement, surHistorique, surRetourChoix },
  ref,
) {
  useEffect(() => {
    surChargement();
    surHistorique(false);
  }, [surChargement, surHistorique]);

  useImperativeHandle(
    ref,
    () => ({
      reculer: () => {},
    }),
    [],
  );

  return (
    <View style={s.page}>
      <Lueur teinte="violet" />

      <ScrollView
        style={s.defilement}
        contentContainerStyle={s.contenu}
      >
        <View style={s.carte}>
          <LinearGradient
            pointerEvents="none"
            colors={[
              "rgba(75,32,217,.16)",
              "rgba(255,255,255,.05)",
              "rgba(0,200,242,.03)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.reflet}
          />

          <View style={s.rond}>
            <Ionicons
              name="phone-portrait-outline"
              size={30}
              color={C.cyanTexte}
            />
          </View>

          <Text style={s.etiquette}>SportVision</Text>

          <Text accessibilityRole="header" style={s.titre}>
            Cet espace s'ouvre dans l'application
          </Text>

          <Text style={s.texte}>
            L'espace club et l'espace de production fonctionnent
            dans l'application SportVision, sur iPhone et sur
            Android. Cette démonstration web ne les ouvre pas.
          </Text>

          <View style={s.note}>
            <Ionicons
              name="information-circle-outline"
              size={19}
              color={C.cyanTexte}
              style={s.noteIcone}
            />

            <Text style={s.faible}>
              Sur un téléphone, ils s'affichent ici même, avec
              un retour et le changement d'espace.
            </Text>
          </View>

          <View style={s.action}>
            <Bouton
              titre="Revenir au choix d'espace"
              onPress={surRetourChoix}
              secondaire
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.fond,
  },
  defilement: {
    flex: 1,
    backgroundColor: "transparent",
  },
  contenu: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: E.m,
    paddingVertical: E.xl,
  },
  carte: {
    position: "relative",
    width: "100%",
    maxWidth: 560,
    alignItems: "center",
    gap: E.m,
    paddingHorizontal: E.l,
    paddingVertical: E.xl,
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
  rond: {
    width: 72,
    height: 72,
    borderRadius: R.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,200,242,.08)",
    borderWidth: 1,
    borderColor: "rgba(0,200,242,.28)",
  },
  etiquette: {
    color: C.violetTexte,
    fontFamily: P.label,
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textAlign: "center",
  },
  titre: {
    alignSelf: "stretch",
    color: C.texte,
    fontFamily: P.titre,
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -0.2,
    textTransform: "uppercase",
    textAlign: "center",
  },
  texte: {
    alignSelf: "stretch",
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 14,
    lineHeight: 23,
    textAlign: "center",
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignSelf: "stretch",
    gap: 9,
    padding: E.m,
    borderRadius: R.m,
    backgroundColor: "rgba(0,200,242,.06)",
    borderWidth: 1,
    borderColor: "rgba(0,200,242,.18)",
  },
  noteIcone: {
    marginTop: 2,
  },
  faible: {
    flex: 1,
    minWidth: 0,
    color: C.cyanTexte,
    fontFamily: P.texte,
    fontSize: 13,
    lineHeight: 21,
  },
  action: {
    width: "100%",
    maxWidth: 360,
    paddingTop: E.s,
  },
});
