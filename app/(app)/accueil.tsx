import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "../../src/lib/session";
import {
  useFamille,
  lireCalendrierFamille,
} from "../../src/lib/famille";
import {
  derniersResultats,
  lireEvenements,
  lireGaleries,
  prochain,
  type Evenement,
  type Galerie,
} from "../../src/lib/donnees";
import { dateLongue } from "../../src/lib/dates";
import {
  useDonnees,
  cleEvenements,
  cleGaleries,
} from "../../src/lib/cache";
import {
  FOND_MATCH_DEMO,
  MODE_DEMO,
} from "../../src/lib/demonstration";
import {
  Ecran,
  Probleme,
  Section,
  Vide,
} from "../../src/ui/Ecran";
import { oublierPorte } from "../../src/lib/espaces";
import {
  CarteEvenement,
  Ecusson,
} from "../../src/ui/Cartes";
import {
  BandeauEnfant,
  SelecteurEnfant,
} from "../../src/ui/Enfants";
import { Prochain } from "../../src/ui/Prochain";
import { Raccourcis } from "../../src/ui/Raccourcis";
import { Pastille } from "../../src/ui/Base";
import { C, E, R, TOUCHE } from "../../src/theme/couleurs";
import { P } from "../../src/theme/polices";

export default function Accueil() {
  const {
    profil,
    rafraichir,
    refusInscription,
    oublierRefusInscription,
  } = useSession();

  const famille = useFamille();
  const router = useRouter();
  const parent = profil?.espace === "parent";

  const clubId = parent
    ? famille.detail?.clubId
    : profil?.clubId;

  const clubNom = parent
    ? (famille.detail?.clubNom ?? famille.choisi?.clubNom)
    : profil?.clubNom;

  const clubLogo = parent
    ? famille.detail?.clubLogoUrl
    : profil?.clubLogoUrl;

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

  const affilie = parent
    ? famille.choisi?.enAttente === false
    : !!profil?.affilie;

  const espaceInconnu =
    !parent && profil?.espace === "aucun";

  async function versLeChoixDEspace() {
    await oublierPorte();
    router.replace("/bienvenue");
  }

  const evs = useDonnees<Evenement[]>(
    profil
      ? cleEvenements(
          parent,
          profil.clubId,
          famille.choisi?.refId,
        )
      : null,
    async () => {
      if (parent) {
        const ref = famille.choisi?.refId;

        if (ref && famille.detail?.clubId) {
          return lireEvenements(famille.detail.clubId, ref);
        }

        const tout = await lireCalendrierFamille();

        return ref
          ? tout.filter((e) => e.sportifRef === ref)
          : tout;
      }

      if (profil?.clubId) {
        return lireEvenements(profil.clubId, profil.playerId);
      }

      return [];
    },
    [
      parent,
      profil?.clubId,
      profil?.playerId,
      famille.choisi?.refId,
      famille.detail?.clubId,
    ],
  );

  const gals = useDonnees<Galerie[]>(
    cleGaleries(clubId, equipeId, saisonId, playerId),
    () =>
      lireGaleries(
        clubId as string,
        equipeId as string,
        saisonId,
        playerId,
      ),
    [clubId, equipeId, saisonId, playerId],
  );

  const evenements = evs.donnees ?? [];
  const galerie = gals.donnees?.[0] ?? null;
  const chargement = evs.chargement || gals.chargement;

  const panne =
    (!!evs.erreur || !!gals.erreur) &&
    !evenements.length &&
    !galerie;

  const charger = () => {
    evs.relire();
    gals.relire();
  };

  const suivant = prochain(evenements);
  const resultats = derniersResultats(evenements, 2);

  return (
    <Ecran
      enCours={chargement}
      teinte="bleu"
      rafraichir={() => {
        rafraichir();
        famille.recharger();
        charger();
      }}
    >
      <View style={s.entete}>
        <View style={s.enteteTexte}>
          <Text style={s.bonjour}>
            Bonjour {profil?.prenom || ""}
          </Text>

          <Text style={s.sous} numberOfLines={1}>
            {[
              parent
                ? famille.choisi?.prenom
                : profil?.equipeNom,
              clubNom,
            ]
              .filter(Boolean)
              .join(" · ") || "Votre espace SportVision"}
          </Text>
        </View>

        {clubNom ? (
          <Ecusson
            url={clubLogo}
            nom={clubNom}
            taille={46}
          />
        ) : null}
      </View>

      {parent && famille.choisi ? (
        <View style={s.groupe}>
          <SelecteurEnfant />
          <BandeauEnfant />
        </View>
      ) : null}

      {refusInscription ? (
        <View style={s.aiguillage}>
          <Text style={s.aiguillageTitre}>
            Votre rattachement n'a pas abouti
          </Text>

          <Text style={s.aiguillageTexte}>
            {refusInscription}
          </Text>

          <Pressable
            onPress={() => {
              oublierRefusInscription();
            }}
            accessibilityRole="button"
            accessibilityLabel="J'ai compris, masquer ce message"
            style={({ pressed }) => [
              s.aiguillageBouton,
              pressed && s.presse,
            ]}
          >
            <Ionicons
              name="checkmark"
              size={16}
              color={C.texte}
            />
            <Text style={s.aiguillageBoutonTexte}>
              J'ai compris
            </Text>
          </Pressable>
        </View>
      ) : null}

      {espaceInconnu ? (
        <View style={s.aiguillage}>
          <Text style={s.aiguillageTitre}>
            Ce compte n'est rattaché à aucun sportif
          </Text>

          <Text style={s.aiguillageTexte}>
            Cet espace est celui des joueurs et de leurs parents.
            Si vous êtes coach, président ou secrétaire, votre espace
            est celui du club. Si vous travaillez pour SportVision,
            c'est l'espace de production.
          </Text>

          <Pressable
            onPress={versLeChoixDEspace}
            accessibilityRole="button"
            accessibilityLabel="Changer d'espace"
            style={({ pressed }) => [
              s.aiguillageBouton,
              pressed && s.presse,
            ]}
          >
            <Ionicons
              name="swap-horizontal"
              size={16}
              color={C.texte}
            />
            <Text style={s.aiguillageBoutonTexte}>
              Changer d'espace
            </Text>
          </Pressable>
        </View>
      ) : null}

      {parent &&
      !famille.chargement &&
      !famille.sportifs.length ? (
        <View style={s.aiguillage}>
          <Text style={s.aiguillageTitre}>
            Aucun enfant rattaché
          </Text>

          <Text style={s.aiguillageTexte}>
            Rattachez votre enfant à son club pour retrouver son
            calendrier, ses résultats et ses photos. Vous pouvez
            le faire ici, ou demander à son club de s'en charger.
          </Text>

          <Pressable
            onPress={() => router.push("/connect/affiliations")}
            accessibilityRole="button"
            accessibilityLabel="Rattacher mon enfant"
            style={({ pressed }) => [
              s.aiguillageBouton,
              pressed && s.presse,
            ]}
          >
            <Ionicons
              name="person-add"
              size={16}
              color={C.texte}
            />
            <Text style={s.aiguillageBoutonTexte}>
              Rattacher mon enfant
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!clubNom && !parent && !espaceInconnu ? (
        <Vide
          titre="Rejoignez votre club"
          texte="Associez votre profil à votre club pour retrouver votre calendrier, vos résultats et vos photos."
        />
      ) : null}

      <Section
        titre="Prochainement"
        action={
          <Pressable
            onPress={() => router.push("/calendrier")}
            accessibilityRole="link"
            accessibilityLabel="Voir tout le calendrier"
            style={({ pressed }) => [
              s.boutonLien,
              pressed && s.presse,
            ]}
          >
            <Text style={s.lien}>Calendrier</Text>
          </Pressable>
        }
      >
        {chargement && !evenements.length ? (
          <View style={s.attente}>
            <ActivityIndicator
              color={C.cyan}
              accessibilityLabel="Chargement des événements"
            />
          </View>
        ) : panne ? (
          <Probleme surReessayer={charger} />
        ) : suivant ? (
          <Prochain
            e={suivant}
            clubNom={clubNom}
            clubLogoUrl={clubLogo}
            fond={MODE_DEMO ? FOND_MATCH_DEMO : null}
            onPress={() =>
              suivant.genre === "match"
                ? router.push({
                    pathname: "/match/[id]",
                    params: { id: suivant.id },
                  })
                : router.push("/calendrier")
            }
          />
        ) : (
          <Vide
            titre="Rien de prévu pour l'instant"
            texte={
              clubId
                ? "Les matchs et les entraînements apparaîtront ici dès que le club les publie."
                : "Le calendrier se remplira dès que le club aura validé le rattachement."
            }
          />
        )}
      </Section>

      <Raccourcis
        elements={[
          {
            icone: "calendar",
            libelle: "Calendrier",
            teinte: C.cyan,
            onPress: () => router.push("/calendrier"),
          },
          {
            icone: "images",
            libelle: parent ? "Ses photos" : "Mes photos",
            teinte: C.accentClair,
            onPress: () => router.push("/photos"),
          },
          {
            icone: "trophy",
            libelle: "Résultats",
            teinte: C.violetVif,
            onPress: () =>
              router.push({
                pathname: "/calendrier",
                params: { filtre: "match" },
              }),
          },
        ]}
      />

      {galerie ? (
        <Section
          titre="Dernière galerie"
          action={
            <Pressable
              onPress={() => router.push("/photos")}
              accessibilityRole="link"
              accessibilityLabel="Voir toutes les photos"
              style={({ pressed }) => [
                s.boutonLien,
                pressed && s.presse,
              ]}
            >
              <Text style={s.lien}>Tout voir</Text>
            </Pressable>
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ouvrir la galerie ${galerie.titre}`}
            onPress={() =>
              playerId
                ? router.push({
                    pathname: "/galerie/[id]",
                    params: {
                      id: galerie.id,
                      titre: galerie.titre,
                      joueur: playerId,
                      numeroUtile:
                        galerie.numeroUtile === false ? "0" : "1",
                      entrainement:
                        galerie.typeEvenement === "entrainement"
                          ? "1"
                          : "0",
                      club: clubId ?? "",
                      pourEnfant: parent ? "1" : "0",
                    },
                  })
                : router.push("/photos")
            }
            style={({ pressed }) => [
              s.galerie,
              pressed && s.presse,
            ]}
          >
            {galerie.apercuUrl ? (
              <Image
                source={{ uri: galerie.apercuUrl }}
                style={s.vignette}
                contentFit="cover"
                transition={160}
              />
            ) : (
              <View style={[s.vignette, s.vignetteVide]}>
                <Ionicons
                  name="images-outline"
                  size={24}
                  color={C.cyanTexte}
                />
              </View>
            )}

            <View style={s.galerieInformations}>
              <Text style={s.galerieTitre} numberOfLines={2}>
                {galerie.titre}
              </Text>

              <Text style={s.detail}>
                {[
                  galerie.date ? dateLongue(galerie.date) : null,
                  `${galerie.nbPhotos} photos`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>

              {galerie.mesPhotos ? (
                <Pastille
                  ton="info"
                  texte={`${galerie.mesPhotos} photo${
                    galerie.mesPhotos > 1 ? "s" : ""
                  } ${
                    parent
                      ? `de ${famille.choisi?.prenom ?? "lui"}`
                      : "de vous"
                  }`}
                />
              ) : null}
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={C.texteDoux}
            />
          </Pressable>
        </Section>
      ) : null}

      {resultats.length ? (
        <Section
          titre="Derniers résultats"
          action={
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/calendrier",
                  params: { filtre: "match" },
                })
              }
              accessibilityRole="link"
              accessibilityLabel="Voir tous les résultats"
              style={({ pressed }) => [
                s.boutonLien,
                pressed && s.presse,
              ]}
            >
              <Text style={s.lien}>Tout voir</Text>
            </Pressable>
          }
        >
          <View style={s.groupe}>
            {resultats.map((e) => (
              <CarteEvenement
                key={e.id}
                e={e}
                ecussonClub={clubLogo}
                onPress={() =>
                  router.push({
                    pathname: "/match/[id]",
                    params: { id: e.id },
                  })
                }
              />
            ))}
          </View>
        </Section>
      ) : null}

      {clubNom ? (
        <View style={s.carteClub}>
          <Ecusson
            url={clubLogo}
            nom={clubNom}
            taille={44}
          />

          <View style={s.clubInformations}>
            <Text style={s.label}>
              {parent ? "Son club" : "Mon club"}
            </Text>
            <Text style={s.nomClub} numberOfLines={2}>
              {clubNom}
            </Text>
          </View>

          <Pastille
            ton={affilie ? "succes" : "alerte"}
            texte={affilie ? "Affilié" : "En attente"}
          />
        </View>
      ) : null}
    </Ecran>
  );
}

const s = StyleSheet.create({
  groupe: {
    gap: E.s,
  },
  presse: {
    opacity: 0.85,
  },
  entete: {
    flexDirection: "row",
    alignItems: "center",
    gap: E.m,
    paddingHorizontal: E.m,
    paddingVertical: 18,
    borderRadius: R.l,
    backgroundColor: "rgba(255,255,255,.06)",
    borderWidth: 1,
    borderColor: C.bordureForte,
  },
  enteteTexte: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  bonjour: {
    color: C.texte,
    fontFamily: P.titre,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.3,
    textTransform: "uppercase",
  },
  sous: {
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 4,
  },
  label: {
    color: C.cyanTexte,
    fontFamily: P.label,
    fontSize: 10.5,
    lineHeight: 16,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  nomClub: {
    color: C.texte,
    fontFamily: P.texteGras,
    fontSize: 16,
    lineHeight: 24,
  },
  carteClub: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: E.m,
    backgroundColor: "rgba(255,255,255,.06)",
    borderRadius: R.l,
    borderWidth: 1,
    borderColor: C.bordureForte,
    padding: E.m,
  },
  clubInformations: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 120,
    minWidth: 0,
    gap: 2,
  },
  boutonLien: {
    minHeight: TOUCHE,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: R.m,
    backgroundColor: "rgba(0,200,242,.08)",
    borderWidth: 1,
    borderColor: "rgba(0,200,242,.22)",
  },
  lien: {
    color: C.cyanTexte,
    fontFamily: P.texteFort,
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
  },
  attente: {
    minHeight: 150,
    paddingVertical: E.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,.04)",
    borderRadius: R.l,
    borderWidth: 1,
    borderColor: C.bordure,
  },
  aiguillage: {
    gap: E.s,
    padding: E.l,
    borderRadius: R.l,
    backgroundColor: "rgba(232,163,61,.08)",
    borderWidth: 1,
    borderColor: "rgba(232,163,61,.3)",
  },
  aiguillageTitre: {
    color: C.alerteTexte,
    fontFamily: P.titreFort,
    fontSize: 25,
    lineHeight: 30,
  },
  aiguillageTexte: {
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 14,
    lineHeight: 23,
  },
  aiguillageBouton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: E.s,
    alignSelf: "flex-start",
    maxWidth: "100%",
    minHeight: TOUCHE + 4,
    paddingHorizontal: E.m,
    paddingVertical: 12,
    borderRadius: R.pill,
    marginTop: E.xs,
    backgroundColor: "rgba(255,255,255,.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.28)",
  },
  aiguillageBoutonTexte: {
    color: C.texte,
    fontFamily: P.texteFort,
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
    textAlign: "center",
  },
  galerie: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: R.l,
    borderWidth: 1,
    borderColor: C.bordureForte,
    padding: 12,
    minHeight: 112,
    shadowColor: "#140650",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },
  galerieInformations: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  vignette: {
    width: 76,
    height: 88,
    borderRadius: R.m,
    backgroundColor: "rgba(255,255,255,.05)",
  },
  vignetteVide: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(75,32,217,.16)",
    borderWidth: 1,
    borderColor: "rgba(75,32,217,.35)",
  },
  galerieTitre: {
    color: C.texte,
    fontFamily: P.texteGras,
    fontSize: 15,
    lineHeight: 22,
  },
  detail: {
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 12,
    lineHeight: 19,
  },
});
