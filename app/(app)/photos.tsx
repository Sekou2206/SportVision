import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "../../src/lib/session";
import { useFamille } from "../../src/lib/famille";
import {
  libelleTypeEvenement,
  lireGaleries,
  type Galerie,
} from "../../src/lib/donnees";
import {
  useDonnees,
  cleGaleries,
} from "../../src/lib/cache";
import { dateLongue } from "../../src/lib/dates";
import { Ecran, Probleme, Vide } from "../../src/ui/Ecran";
import {
  BandeauEnfant,
  SelecteurEnfant,
} from "../../src/ui/Enfants";
import { Erreur } from "../../src/ui/Base";
import { C, E, R, TOUCHE } from "../../src/theme/couleurs";
import { P } from "../../src/theme/polices";

const FILTRES = [
  ["tout", "Toutes"],
  ["ouvertes", "Accessibles"],
  ["verrouillees", "Verrouillées"],
] as const;

type Filtre = (typeof FILTRES)[number][0];

export default function Photos() {
  const { profil } = useSession();
  const famille = useFamille();
  const router = useRouter();
  const parent = profil?.espace === "parent";

  const clubId = parent
    ? famille.detail?.clubId
    : profil?.clubId;

  const equipeId = parent
    ? famille.detail?.equipeId
    : profil?.equipeId;

  const saisonId = parent
    ? (famille.detail?.saisonId ?? null)
    : (profil?.saisonId ?? null);

  const playerId = parent
    ? (
        famille.choisi?.kind === "club"
          ? famille.choisi.refId
          : undefined
      )
    : profil?.playerId;

  const equipeNom = parent
    ? famille.detail?.categorie
    : profil?.equipeNom;

  const [filtre, setFiltre] = useState<Filtre>("tout");
  const [erreurVideo, setErreurVideo] = useState<string | null>(null);

  const cle = cleGaleries(
    clubId,
    equipeId,
    saisonId,
    playerId,
  );

  const {
    donnees,
    chargement,
    erreur: souci,
    relire: charger,
  } = useDonnees<Galerie[]>(
    cle,
    () =>
      lireGaleries(
        clubId as string,
        equipeId as string,
        saisonId,
        playerId,
      ),
    [clubId, equipeId, saisonId, playerId],
  );

  const galeries = donnees ?? [];
  const panne = !!souci && donnees === undefined;

  const erreur =
    souci && donnees !== undefined
      ? "Liste affichée telle qu'à la dernière ouverture : la mise à jour n'a pas abouti."
      : null;

  const galeriesFiltrees = galeries.filter((g) =>
    filtre === "tout"
      ? true
      : filtre === "ouvertes"
        ? g.ouverte
        : !g.ouverte,
  );

  function ouvrirGalerie(g: Galerie) {
    if (!playerId) return;

    router.push({
      pathname: "/galerie/[id]",
      params: {
        id: g.id,
        titre: g.titre,
        joueur: playerId,
        numeroUtile: g.numeroUtile === false ? "0" : "1",
        entrainement:
          g.typeEvenement === "entrainement" ? "1" : "0",
        club: clubId ?? "",
        pourEnfant: parent ? "1" : "0",
      },
    });
  }

  async function ouvrirVideo(url: string) {
    setErreurVideo(null);

    try {
      await Linking.openURL(url);
    } catch {
      setErreurVideo(
        "Impossible d'ouvrir la vidéo pour le moment. Réessayez dans quelques instants.",
      );
    }
  }

  return (
    <Ecran
      enCours={chargement}
      rafraichir={charger}
      teinte="violet"
    >
      <View style={s.entete}>
        <Text accessibilityRole="header" style={s.titre}>
          {parent ? "Ses photos" : "Mes photos"}
        </Text>

        <Text style={s.sous}>
          {parent
            ? equipeNom
              ? `Les galeries de la catégorie ${equipeNom}, toutes équipes confondues.`
              : "Les galeries de sa catégorie, toutes équipes confondues."
            : equipeNom
              ? `Les galeries de votre catégorie, toutes équipes confondues (équipe ${equipeNom}).`
              : "Les galeries de votre catégorie, toutes équipes confondues."}
        </Text>
      </View>

      {parent ? (
        <View style={s.groupe}>
          <SelecteurEnfant />
          <BandeauEnfant />
        </View>
      ) : null}

      <View style={s.mediasLiens}>
        <Pressable
          onPress={() => router.push("/connect/galeries")}
          accessibilityRole="button"
          accessibilityLabel="Mes achats, les photos que vous avez achetées par un lien"
          style={({ pressed }) => [
            s.mediasLien,
            pressed && s.presse,
          ]}
        >
          <View style={s.iconeMedia}>
            <Ionicons
              name="albums-outline"
              size={20}
              color={C.cyanTexte}
            />
          </View>
          <Text style={s.mediasLienTexte}>Mes achats</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/connect/contenus")}
          accessibilityRole="button"
          accessibilityLabel="Mes contenus, photos et vidéos livrées par SportVision"
          style={({ pressed }) => [
            s.mediasLien,
            pressed && s.presse,
          ]}
        >
          <View style={[s.iconeMedia, s.iconeMediaViolet]}>
            <Ionicons
              name="film-outline"
              size={20}
              color={C.violetTexte}
            />
          </View>
          <Text style={s.mediasLienTexte}>Mes contenus</Text>
        </Pressable>
      </View>

      {galeries.length > 1 || filtre !== "tout" ? (
        <View style={s.filtres}>
          {FILTRES.map(([cleFiltre, libelle]) => {
            const actif = filtre === cleFiltre;

            return (
              <Pressable
                key={cleFiltre}
                onPress={() => setFiltre(cleFiltre)}
                accessibilityRole="button"
                accessibilityState={{ selected: actif }}
                accessibilityLabel={`Filtrer : ${libelle}`}
                style={({ pressed }) => [
                  s.filtre,
                  actif && s.filtreActif,
                  pressed && s.presse,
                ]}
              >
                <Text
                  style={[
                    s.filtreTexte,
                    actif && s.filtreTexteActif,
                  ]}
                >
                  {libelle}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Erreur message={erreur} />
      <Erreur message={erreurVideo} />

      {chargement && !galeries.length ? (
        <View style={s.attente}>
          <ActivityIndicator
            color={C.cyan}
            accessibilityLabel="Chargement des galeries"
          />
        </View>
      ) : panne ? (
        <Probleme surReessayer={charger} />
      ) : galeriesFiltrees.length ? (
        <View style={s.liste}>
          {galeriesFiltrees.map((g) => {
            const personne = parent
              ? `de ${famille.choisi?.prenom || "votre enfant"}`
              : "de vous";

            return (
              <View key={g.id} style={s.carte}>
                <Pressable
                  disabled={!playerId}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !playerId }}
                  accessibilityLabel={[
                    g.titre,
                    `${g.nbPhotos} photos`,
                    g.ouverte
                      ? "galerie accessible"
                      : "galerie verrouillée",
                    g.mesPhotos
                      ? `${g.mesPhotos} photos ${personne}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  onPress={() => ouvrirGalerie(g)}
                  style={({ pressed }) => [
                    s.visuel,
                    pressed && playerId ? s.presse : null,
                  ]}
                >
                  <View
                    pointerEvents="none"
                    style={StyleSheet.absoluteFill}
                  >
                    {g.apercuUrl ? (
                      <Image
                        source={{ uri: g.apercuUrl }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                        transition={160}
                      />
                    ) : (
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          s.visuelVide,
                        ]}
                      >
                        <Ionicons
                          name="images-outline"
                          size={42}
                          color={C.violetTexte}
                        />
                      </View>
                    )}

                    <LinearGradient
                      colors={[
                        "rgba(10,6,32,.25)",
                        "rgba(10,6,32,.58)",
                        "rgba(10,6,32,.97)",
                      ]}
                      locations={[0, 0.45, 1]}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </View>

                  <View style={s.badges}>
                    {g.mesPhotos ? (
                      <View style={s.mesPhotos}>
                        <Ionicons
                          name="person"
                          size={12}
                          color={C.texte}
                        />
                        <Text style={s.mesPhotosTexte}>
                          {g.mesPhotos} photo
                          {g.mesPhotos > 1 ? "s" : ""} {personne}
                        </Text>
                      </View>
                    ) : null}

                    <View
                      style={[
                        s.statut,
                        g.ouverte && s.statutAccessible,
                      ]}
                    >
                      <Ionicons
                        name={
                          g.ouverte
                            ? "checkmark-circle-outline"
                            : "lock-closed-outline"
                        }
                        size={14}
                        color={
                          g.ouverte ? C.succesTexte : C.texte
                        }
                      />
                      <Text
                        style={[
                          s.statutTexte,
                          g.ouverte && s.statutTexteAccessible,
                        ]}
                      >
                        {g.ouverte ? "Accessible" : "Verrouillée"}
                      </Text>
                    </View>
                  </View>

                  <View style={s.surVisuel}>
                    <Text
                      style={s.titreGalerie}
                      numberOfLines={3}
                    >
                      {g.titre}
                    </Text>

                    <Text style={s.sousClair}>
                      {[
                        libelleTypeEvenement(g.typeEvenement),
                        g.date ? dateLongue(g.date) : null,
                        `${g.nbPhotos} photo${
                          g.nbPhotos > 1 ? "s" : ""
                        }`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  </View>
                </Pressable>

                {!g.ouverte || g.videoUrl ? (
                  <View style={s.piedCarte}>
                    {!g.ouverte ? (
                      <View style={s.groupe}>
                        <Text style={s.note}>
                          L'accès à cette galerie est géré par
                          votre club.
                        </Text>

                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Comprendre mon accès aux photos"
                          onPress={() => router.push("/aide-photos")}
                          style={({ pressed }) => [
                            s.action,
                            pressed && s.presse,
                          ]}
                        >
                          <Ionicons
                            name="information-circle-outline"
                            size={18}
                            color={C.texte}
                          />
                          <Text style={s.actionTexte}>
                            Comprendre mon accès
                          </Text>
                        </Pressable>
                      </View>
                    ) : null}

                    {g.videoUrl ? (
                      <Pressable
                        onPress={() => {
                          if (g.videoUrl) {
                            void ouvrirVideo(g.videoUrl);
                          }
                        }}
                        style={({ pressed }) => [
                          s.lienVideo,
                          pressed && s.presse,
                        ]}
                        accessibilityRole="link"
                        accessibilityLabel="Voir la vidéo du match"
                      >
                        <Ionicons
                          name="play-circle"
                          size={21}
                          color={C.cyanTexte}
                        />
                        <Text style={s.lienVideoTexte}>
                          Voir la vidéo du match
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : galeries.length ? (
        <View style={s.groupe}>
          <Vide
            titre="Aucune galerie pour ce filtre"
            texte={
              filtre === "ouvertes"
                ? "Aucune galerie accessible ne correspond à votre sélection."
                : "Aucune galerie verrouillée ne correspond à votre sélection."
            }
          />

          <Pressable
            onPress={() => setFiltre("tout")}
            accessibilityRole="button"
            accessibilityLabel="Afficher toutes les galeries"
            style={({ pressed }) => [
              s.action,
              pressed && s.presse,
            ]}
          >
            <Text style={s.actionTexte}>
              Afficher toutes les galeries
            </Text>
          </Pressable>
        </View>
      ) : (
        <Vide
          titre="Aucune galerie pour le moment"
          texte={
            equipeId
              ? "Les photos prises par SportVision apparaissent ici après chaque match ou événement couvert."
              : "Le club doit d'abord rattacher le sportif à une équipe pour que ses galeries soient proposées."
          }
        />
      )}
    </Ecran>
  );
}

const s = StyleSheet.create({
  entete: {
    gap: 8,
    padding: E.m,
    borderRadius: R.l,
    backgroundColor: "rgba(255,255,255,.06)",
    borderWidth: 1,
    borderColor: C.bordureForte,
  },
  titre: {
    color: C.texte,
    fontFamily: P.titre,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.3,
    textTransform: "uppercase",
  },
  sous: {
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 13.5,
    lineHeight: 22,
  },
  groupe: {
    gap: E.s,
  },
  liste: {
    gap: E.l,
  },
  presse: {
    opacity: 0.85,
  },
  mediasLiens: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: E.s,
  },
  mediasLien: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 140,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 68,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: R.l,
    backgroundColor: "rgba(255,255,255,.06)",
    borderWidth: 1,
    borderColor: C.bordureForte,
  },
  iconeMedia: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: R.pill,
    backgroundColor: "rgba(0,200,242,.10)",
    borderWidth: 1,
    borderColor: "rgba(0,200,242,.25)",
  },
  iconeMediaViolet: {
    backgroundColor: "rgba(75,32,217,.18)",
    borderColor: "rgba(212,44,240,.28)",
  },
  mediasLienTexte: {
    color: C.texte,
    fontFamily: P.texteFort,
    fontSize: 13,
    lineHeight: 20,
    flexShrink: 1,
  },
  filtres: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    backgroundColor: "rgba(255,255,255,.04)",
    padding: 6,
    borderRadius: R.l,
    borderWidth: 1,
    borderColor: C.bordure,
  },
  filtre: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: TOUCHE,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: R.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  filtreActif: {
    backgroundColor: C.texte,
  },
  filtreTexte: {
    color: C.texteDoux,
    fontFamily: P.texteMoyen,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
  },
  filtreTexteActif: {
    color: "#1A0B5C",
    fontFamily: P.texteFort,
  },
  attente: {
    minHeight: 160,
    paddingVertical: E.xl * 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: R.l,
    backgroundColor: "rgba(255,255,255,.04)",
    borderWidth: 1,
    borderColor: C.bordure,
  },
  carte: {
    backgroundColor: C.surface,
    borderRadius: R.l,
    borderWidth: 1,
    borderColor: C.bordureForte,
    overflow: "hidden",
  },
  visuel: {
    position: "relative",
    minHeight: 250,
    justifyContent: "space-between",
    backgroundColor: C.surfaceHaute,
  },
  visuelVide: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(75,32,217,.15)",
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
  },
  statut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "100%",
    marginLeft: "auto",
    backgroundColor: "rgba(10,6,32,.85)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.22)",
  },
  statutAccessible: {
    borderColor: "rgba(18,183,106,.4)",
  },
  statutTexte: {
    color: C.texte,
    fontFamily: P.texteFort,
    fontSize: 11,
    lineHeight: 17,
    flexShrink: 1,
  },
  statutTexteAccessible: {
    color: C.succesTexte,
  },
  mesPhotos: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "100%",
    backgroundColor: C.accent,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.24)",
  },
  mesPhotosTexte: {
    color: C.texte,
    fontFamily: P.texteFort,
    fontSize: 11,
    lineHeight: 17,
    flexShrink: 1,
  },
  surVisuel: {
    padding: E.m,
    paddingTop: 48,
    gap: 8,
  },
  titreGalerie: {
    color: C.texte,
    fontFamily: P.titre,
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  sousClair: {
    color: "rgba(255,255,255,.85)",
    fontFamily: P.texte,
    fontSize: 12.5,
    lineHeight: 20,
  },
  piedCarte: {
    padding: E.m,
    gap: E.m,
    borderTopWidth: 1,
    borderTopColor: C.bordure,
  },
  note: {
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 13.5,
    lineHeight: 22,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: TOUCHE + 4,
    paddingHorizontal: E.m,
    paddingVertical: 12,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.28)",
    backgroundColor: "rgba(255,255,255,.08)",
  },
  actionTexte: {
    color: C.texte,
    fontFamily: P.texteFort,
    fontSize: 13,
    lineHeight: 20,
    flexShrink: 1,
    textAlign: "center",
  },
  lienVideo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    maxWidth: "100%",
    minHeight: TOUCHE,
    paddingVertical: 10,
  },
  lienVideoTexte: {
    color: C.cyanTexte,
    fontFamily: P.texteFort,
    fontSize: 13,
    lineHeight: 20,
    flexShrink: 1,
  },
});
