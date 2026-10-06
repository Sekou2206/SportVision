import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { C, E, R } from "../theme/couleurs";
import { P } from "../theme/polices";
import {
  heureCourte,
  jourNumero,
  moisCourt,
  quand,
} from "../lib/dates";
import {
  issueDuMatch,
  MOT_ISSUE,
  type Evenement,
} from "../lib/donnees";

const STYLE_GENRE = {
  match: {
    texte: C.violetTexte,
    bordure: "rgba(75,32,217,.55)",
    fond: "rgba(75,32,217,.16)",
  },
  entrainement: {
    texte: C.cyanTexte,
    bordure: "rgba(0,200,242,.40)",
    fond: "rgba(0,200,242,.10)",
  },
  evenement: {
    texte: C.violetTexte,
    bordure: "rgba(212,44,240,.40)",
    fond: "rgba(212,44,240,.10)",
  },
  rendez_vous: {
    texte: C.alerteTexte,
    bordure: "rgba(232,163,61,.40)",
    fond: "rgba(232,163,61,.10)",
  },
} as const;

const ICONE_GENRE = {
  match: "football",
  entrainement: "fitness",
  evenement: "sparkles",
  rendez_vous: "calendar",
} as const;

export function Ecusson({
  url,
  nom,
  taille = 46,
  neutre,
}: {
  url?: string | null;
  nom?: string | null;
  taille?: number;
  neutre?: boolean;
}) {
  const dimensions = {
    width: taille,
    height: taille,
    borderRadius: Math.min(R.m, taille * 0.28),
  };

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        accessibilityLabel={nom ? `Écusson ${nom}` : "Écusson du club"}
        style={[s.ecussonImage, dimensions]}
        contentFit="contain"
      />
    );
  }

  const initiales = neutre
    ? ""
    : (nom ?? "")
        .split(/\s+/)
        .map((mot) => mot.replace(/[^\p{L}\p{N}]/gu, ""))
        .filter((mot) => mot.length > 1 && !/^[uU]?\d/.test(mot))
        .map((mot) =>
          mot === mot.toUpperCase()
            ? mot
            : (mot[0]?.toUpperCase() ?? "")
        )
        .join("")
        .slice(0, 3);

  return (
    <View style={[s.ecussonVide, dimensions]}>
      {initiales ? (
        <Text
          style={[
            s.initiales,
            { fontSize: taille * 0.34 },
          ]}
        >
          {initiales}
        </Text>
      ) : (
        <Ionicons
          name="shield-outline"
          size={taille * 0.46}
          color={C.texteFaible}
        />
      )}
    </View>
  );
}

export function CarteEvenement({
  e,
  onPress,
  ecussonClub,
}: {
  e: Evenement;
  onPress?: () => void;
  ecussonClub?: string | null;
}) {
  const couleurs = STYLE_GENRE[e.genre];
  const heure = heureCourte(e.heure);
  const issue = issueDuMatch(e.score);

  const genre =
    e.genre === "match"
      ? "Match"
      : e.genre === "entrainement"
        ? "Entraînement"
        : e.genre === "rendez_vous"
          ? "Rendez-vous"
          : "Événement";

  const statut =
    e.statut === "reporte"
      ? "reporté"
      : e.statut === "annule"
        ? "annulé"
        : null;

  const libelleGenre = statut
    ? `${genre} · ${statut}`
    : e.genre === "match" && e.domicile !== undefined
      ? `Match · ${e.domicile ? "domicile" : "extérieur"}`
      : genre;

  const titre =
    e.genre === "match" && e.adversaire
      ? e.adversaire
      : e.titre;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={[
        libelleGenre,
        e.genre === "match" && e.adversaire
          ? `contre ${e.adversaire}`
          : e.titre,
        quand(e.date),
        e.score ? `score ${e.score}` : heure,
        e.score && issue ? MOT_ISSUE[issue] : null,
        e.lieu,
        e.genre === "match" ? e.equipe : null,
      ]
        .filter(Boolean)
        .join(", ")}
      style={({ pressed }) => [
        s.carte,
        pressed && onPress ? s.cartePressee : null,
      ]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(255,255,255,.09)",
          "rgba(255,255,255,.025)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.reflet}
      />

      <View style={s.ligne}>
        <View
          style={[
            s.pastilleDate,
            {
              borderColor: couleurs.bordure,
              backgroundColor: couleurs.fond,
            },
          ]}
        >
          <Text style={s.pastilleJour}>
            {jourNumero(e.date)}
          </Text>
          <Text
            style={[
              s.pastilleMois,
              { color: couleurs.texte },
            ]}
          >
            {moisCourt(e.date)}
          </Text>
        </View>

        <View style={s.informations}>
          <View style={s.genreLigne}>
            <Ionicons
              name={ICONE_GENRE[e.genre]}
              size={14}
              color={couleurs.texte}
            />
            <Text
              style={[
                s.genre,
                {
                  color: statut
                    ? C.alerteTexte
                    : couleurs.texte,
                },
              ]}
            >
              {libelleGenre}
            </Text>
          </View>

          <Text
            style={[
              s.titreCarte,
              e.statut === "annule" && s.barre,
            ]}
            numberOfLines={2}
          >
            {titre}
          </Text>

          <Text style={s.detail}>
            {[quand(e.date), e.score ? null : heure]
              .filter(Boolean)
              .join(" · ")}
          </Text>

          {e.lieu ? (
            <Text style={s.detail}>{e.lieu}</Text>
          ) : null}

          {e.genre === "match" && e.equipe ? (
            <Text style={s.equipe}>{e.equipe}</Text>
          ) : null}
        </View>

        {e.genre === "match" && !e.score ? (
          <View style={s.affiche}>
            <Ecusson
              url={ecussonClub}
              nom={e.equipe}
              taille={28}
            />
            <Text style={s.contre}>
              {e.domicile === false ? "@" : "vs"}
            </Text>
            <Ecusson
              url={e.ecussonAdversaire}
              nom={e.adversaire}
              taille={28}
              neutre={!e.ecussonAdversaire}
            />
          </View>
        ) : null}

        {e.score ? (
          <View style={s.resultat}>
            <Text style={s.score}>{e.score}</Text>

            {issue ? (
              <Text
                style={[
                  s.issue,
                  {
                    color:
                      issue === "gagne"
                        ? C.succesTexte
                        : issue === "perdu"
                          ? C.dangerTexte
                          : C.texteDoux,
                  },
                ]}
              >
                {MOT_ISSUE[issue]}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  carte: {
    position: "relative",
    backgroundColor: C.surface,
    borderRadius: R.l,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.18)",
    padding: E.m,
    shadowColor: "#140650",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },
  cartePressee: {
    opacity: 0.82,
    borderColor: C.cyan,
  },
  reflet: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: R.l,
  },
  ligne: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  informations: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  genreLigne: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  affiche: {
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  contre: {
    color: C.texteFaible,
    fontFamily: P.label,
    fontSize: 10,
  },
  pastilleDate: {
    width: 52,
    minHeight: 64,
    paddingVertical: 8,
    borderRadius: R.m,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    gap: 2,
  },
  pastilleJour: {
    color: C.texte,
    fontFamily: P.chiffre,
    fontSize: 24,
    lineHeight: 29,
    fontVariant: ["tabular-nums"],
  },
  pastilleMois: {
    fontFamily: P.label,
    fontSize: 10.5,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  genre: {
    fontFamily: P.label,
    fontSize: 10.5,
    lineHeight: 16,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    flexShrink: 1,
  },
  titreCarte: {
    color: C.texte,
    fontFamily: P.texteGras,
    fontSize: 16,
    lineHeight: 23,
  },
  barre: {
    textDecorationLine: "line-through",
    color: C.texteDoux,
  },
  detail: {
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 13,
    lineHeight: 20,
  },
  equipe: {
    color: C.texteFaible,
    fontFamily: P.texteMoyen,
    fontSize: 12,
    lineHeight: 18,
  },
  resultat: {
    alignItems: "flex-end",
    flexShrink: 1,
    maxWidth: "32%",
    gap: 4,
  },
  score: {
    color: C.texte,
    fontFamily: P.chiffre,
    fontSize: 23,
    fontVariant: ["tabular-nums"],
    textAlign: "right",
  },
  issue: {
    fontFamily: P.texteFort,
    fontSize: 10,
    lineHeight: 15,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    textAlign: "right",
  },
  ecussonImage: {
    backgroundColor: "rgba(255,255,255,.06)",
  },
  ecussonVide: {
    backgroundColor: "rgba(255,255,255,.07)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.bordureForte,
  },
  initiales: {
    color: C.texteDoux,
    fontFamily: P.texteGras,
  },
});
