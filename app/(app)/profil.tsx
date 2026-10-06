import React, { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { LinearGradient } from "expo-linear-gradient";
import {
  MOTIF_LISIBLE,
  dernierAchat,
  dernierMotif,
  deviseMagasin,
} from "../../src/lib/achat-pass";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "../../src/lib/session";
import { useBiometrie } from "../../src/lib/biometrie";
import { cheminReconnaissanceEnfant } from "../../src/lib/connect";
import { supprimerMonCompte } from "../../src/lib/compte";
import { useFamille } from "../../src/lib/famille";
import { oublierPorte } from "../../src/lib/espaces";
import { MODE_DEMO } from "../../src/lib/demonstration";
import { Ecran, Section } from "../../src/ui/Ecran";
import { Ecusson } from "../../src/ui/Cartes";
import { Pastille } from "../../src/ui/Base";
import { C, E, R, TOUCHE } from "../../src/theme/couleurs";
import { P } from "../../src/theme/polices";

type LigneProps = {
  icone: keyof typeof Ionicons.glyphMap;
  titre: string;
  detail?: string;
  onPress?: () => void;
  danger?: boolean;
  enCours?: boolean;
};

function Ligne({
  icone,
  titre,
  detail,
  onPress,
  danger = false,
  enCours = false,
}: LigneProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress || enCours}
      accessibilityRole={onPress || enCours ? "button" : undefined}
      accessibilityState={
        onPress || enCours
          ? { disabled: enCours, busy: enCours }
          : undefined
      }
      accessibilityLabel={detail ? `${titre}. ${detail}` : titre}
      style={({ pressed }) => [
        s.ligne,
        pressed && onPress && s.lignePressee,
        enCours && s.ligneOccupee,
      ]}
    >
      <View style={[s.icone, danger && s.iconeDanger]}>
        <Ionicons
          name={icone}
          size={20}
          color={danger ? C.dangerTexte : C.cyanTexte}
        />
      </View>

      <View style={s.ligneContenu}>
        <Text style={[s.ligneTitre, danger && s.texteDanger]}>
          {titre}
        </Text>

        {detail ? (
          <Text style={s.ligneDetail}>{detail}</Text>
        ) : null}
      </View>

      {onPress ? (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={C.texteFaible}
        />
      ) : null}
    </Pressable>
  );
}

export default function Profil() {
  const { session, profil, deconnexion } = useSession();
  const biometrie = useBiometrie();
  const famille = useFamille();
  const router = useRouter();

  const [sortie, setSortie] = useState(false);
  const [suppression, setSuppression] = useState(false);

  const parent = profil?.espace === "parent";

  const clubNom = parent
    ? (famille.detail?.clubNom ?? famille.choisi?.clubNom)
    : profil?.clubNom;

  const clubLogo = parent
    ? famille.detail?.clubLogoUrl
    : profil?.clubLogoUrl;

  const equipeNom = parent
    ? famille.detail?.categorie
    : profil?.equipeNom;

  const affilie = parent
    ? famille.choisi?.enAttente === false
    : !!profil?.affilie;

  async function basculerBiometrie() {
    if (biometrie.active) {
      Alert.alert(
        "Ne plus verrouiller",
        `SportVision s'ouvrira sans demander ${biometrie.nom}. Vous resterez connecté.`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Désactiver",
            style: "destructive",
            onPress: biometrie.desactiver,
          },
        ],
      );
      return;
    }

    const ok = await biometrie.activer();
    if (!ok) return;

    Alert.alert(
      "C'est activé",
      `SportVision demandera ${biometrie.nom} à chaque ouverture. Vos photos ne s'affichent plus si quelqu'un d'autre prend votre téléphone.`,
    );
  }

  async function changerEspace() {
    await oublierPorte();
    router.replace("/bienvenue");
  }

  function demanderDeconnexion() {
    if (MODE_DEMO) {
      router.replace("/connexion");
      return;
    }

    Alert.alert(
      "Se déconnecter",
      "Vous devrez saisir à nouveau votre mot de passe.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Se déconnecter",
          style: "destructive",
          onPress: async () => {
            setSortie(true);

            try {
              await deconnexion();
            } catch {
              Alert.alert(
                "Déconnexion impossible",
                "Veuillez réessayer dans quelques instants.",
              );
            } finally {
              setSortie(false);
            }
          },
        },
      ],
    );
  }

  function demanderSuppression() {
    if (MODE_DEMO) {
      Alert.alert(
        "Mode démonstration",
        "La suppression de compte fonctionne dans l'application, mais elle est désactivée ici : ce compte est fictif.",
      );
      return;
    }

    Alert.alert(
      "Supprimer mon compte",
      "Votre compte, votre rattachement au club et vos accès aux galeries seront supprimés. " +
        "Vos factures éventuelles sont conservées et anonymisées, comme la loi l'impose. " +
        "Cette action est définitive.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Continuer",
          style: "destructive",
          onPress: () =>
            Alert.alert(
              "Vous êtes sûr ?",
              "Il n'y a pas de retour en arrière. Vous devrez recréer un compte et redemander votre rattachement au club.",
              [
                { text: "Annuler", style: "cancel" },
                {
                  text: "Supprimer définitivement",
                  style: "destructive",
                  onPress: async () => {
                    setSuppression(true);

                    try {
                      const r = await supprimerMonCompte();

                      if (!r.ok) {
                        Alert.alert("Suppression impossible", r.message);
                        return;
                      }

                      await deconnexion();
                      router.replace("/connexion");
                    } catch {
                      Alert.alert(
                        "Une erreur est survenue",
                        "Impossible de confirmer la fin de l'opération. Vérifiez votre connexion puis rouvrez l'application.",
                      );
                    } finally {
                      setSuppression(false);
                    }
                  },
                },
              ],
            ),
        },
      ],
    );
  }

  const version = Constants.expoConfig?.version ?? "1.0.0";

  const misAJour = Updates.updateId
    ? `mise à jour du ${new Date(
        Updates.createdAt ?? Date.now(),
      ).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "version d'origine du build";

  return (
    <Ecran teinte="violet">
      <Text accessibilityRole="header" style={s.titre}>
        Mon profil
      </Text>

      <View style={s.identite}>
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(75,32,217,.24)",
            "rgba(212,44,240,.08)",
            "rgba(255,255,255,.02)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.reflet}
        />

        <View style={s.ecussonCadre}>
          <Ecusson
            url={clubLogo}
            nom={clubNom ?? profil?.prenom}
            taille={54}
          />
        </View>

        <View style={s.identiteTexte}>
          <Text style={s.nom}>
            {profil?.prenom || "Mon compte"}
          </Text>

          {session?.user?.email ? (
            <Text style={s.detail} selectable>
              {session.user.email}
            </Text>
          ) : null}

          <View style={s.affiliation}>
            <Pastille
              ton={affilie ? "succes" : "alerte"}
              texte={
                parent
                  ? affilie
                    ? "Parent affilié"
                    : "Rattachement en attente"
                  : affilie
                    ? "Joueur affilié"
                    : "Affiliation en attente"
              }
            />
          </View>
        </View>
      </View>

      <View style={s.groupe}>
        <Ligne
          icone="swap-horizontal-outline"
          titre="Changer d'espace"
          detail="Joueur ou parent, espace club, équipe de production"
          onPress={changerEspace}
        />
      </View>

      <Section titre="Mon compte">
        <View style={s.groupe}>
          <Ligne
            icone="person-circle-outline"
            titre="Mes informations"
            detail="Nom, adresse e-mail, mot de passe"
            onPress={() => router.push("/connect/profil")}
          />

          <Ligne
            icone="trash-outline"
            titre={
              suppression
                ? "Suppression en cours…"
                : "Supprimer mon compte"
            }
            detail="Définitif, sans retour en arrière"
            danger
            enCours={suppression}
            onPress={suppression ? undefined : demanderSuppression}
          />
        </View>
      </Section>

      <Section titre={parent ? "Son club" : "Mon club"}>
        <View style={s.groupe}>
          <Ligne
            icone="shield-checkmark-outline"
            titre={clubNom ?? "Aucun club"}
            detail={
              affilie
                ? "Affiliation validée par le club"
                : "En attente de validation par le club"
            }
          />

          {!parent && profil?.categorie ? (
            <Ligne
              icone="people-outline"
              titre={profil.categorie}
              detail="Catégorie"
            />
          ) : null}

          {equipeNom ? (
            <Ligne
              icone="shirt-outline"
              titre={equipeNom}
              detail={parent ? "Catégorie" : "Équipe"}
            />
          ) : null}
        </View>
      </Section>

      <Section titre="Mes accès">
        <View style={s.groupe}>
          <Ligne
            icone="key-outline"
            titre="Comment j'accède aux photos"
            detail="Ce qu'est le Pass Photo et qui le transmet"
            onPress={() => router.push("/aide-photos")}
          />

          <Ligne
            icone="shield-half-outline"
            titre="Accès à mon profil"
            detail="Qui peut voir votre profil, et les demandes en attente"
            onPress={() => router.push("/connect/acces")}
          />

          <Ligne
            icone="scan-outline"
            titre={
              parent
                ? `Reconnaître ${famille.choisi?.prenom ?? "mon enfant"}`
                : "Me reconnaître sur les photos"
            }
            detail="Votre accord, révocable à tout moment"
            onPress={
              parent && !famille.choisi
                ? undefined
                : () => {
                    if (parent) {
                      const c = famille.choisi;
                      if (!c) return;

                      router.push({
                        pathname: "/connect/[page]",
                        params: {
                          page: "reconnaissance",
                          chemin: cheminReconnaissanceEnfant(
                            c.kind,
                            c.refId,
                          ),
                        },
                      });
                      return;
                    }

                    router.push("/connect/reconnaissance");
                  }
            }
          />

          <Ligne
            icone="finger-print-outline"
            titre="Verrouillage biométrique"
            detail={
              biometrie.disponible
                ? biometrie.active
                  ? `Activé, ${biometrie.nom}`
                  : `Protéger l'ouverture avec ${biometrie.nom}`
                : "Non disponible sur cet appareil"
            }
            onPress={
              biometrie.disponible
                ? basculerBiometrie
                : undefined
            }
          />
        </View>
      </Section>

      <Section titre="Mon univers">
        <View style={s.groupe}>
          <Ligne
            icone="link-outline"
            titre="Mon affiliation"
            detail="Rejoindre un club, suivre une demande en cours"
            onPress={() => router.push("/connect/affiliations")}
          />

          <Ligne
            icone="people-circle-outline"
            titre="Mes équipes"
            detail="Les groupes que vous avez rejoints ou créés"
            onPress={() => router.push("/connect/equipes")}
          />

          <Ligne
            icone="chatbubbles-outline"
            titre="Messages"
            detail="Vos échanges avec SportVision et votre club"
            onPress={() => router.push("/connect/messages")}
          />
        </View>
      </Section>

      {MODE_DEMO ? (
        <Section titre="Démonstration">
          <View style={s.groupe}>
            <Ligne
              icone="log-in-outline"
              titre="Voir le tunnel de connexion"
              detail="L'écran que voit une personne non connectée"
              onPress={() => router.push("/connexion")}
            />

            <Ligne
              icone="person-add-outline"
              titre="Voir le tunnel d'inscription"
              detail="Profil, informations, club"
              onPress={() => router.push("/creer-compte")}
            />
          </View>
        </Section>
      ) : null}

      <Section titre="Assistance">
        <View style={s.groupe}>
          <Ligne
            icone="mail-outline"
            titre="Nous écrire"
            detail="contact@sportvision-an.fr"
            onPress={() =>
              Linking.openURL("mailto:contact@sportvision-an.fr")
            }
          />

          <Ligne
            icone="document-text-outline"
            titre="Conditions et confidentialité"
            onPress={() =>
              Linking.openURL(
                "https://sportvision-an.fr/confidentialite",
              )
            }
          />

          <Ligne
            icone="information-circle-outline"
            titre="Version"
            detail={`SportVision ${version} (${
              Constants.expoConfig?.ios?.buildNumber ?? "?"
            }) · ${misAJour}`}
          />

          {dernierMotif.motif ? (
            <Ligne
              icone="pricetag-outline"
              titre="Pass Photo"
              detail={`${dernierMotif.sku ?? "aucun produit"} — ${
                MOTIF_LISIBLE[dernierMotif.motif]
              }`}
            />
          ) : null}

          {dernierAchat && dernierAchat.issue === "erreur" ? (
            <Ligne
              icone="alert-circle-outline"
              titre="Dernier achat"
              detail={`${new Date(
                dernierAchat.quand,
              ).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })} — ${dernierAchat.detail ?? "sans détail"}`}
            />
          ) : null}

          {deviseMagasin.devise &&
          deviseMagasin.devise.toUpperCase() !== "EUR" ? (
            <Ligne
              icone="warning-outline"
              titre="Devise du magasin"
              detail={`${deviseMagasin.devise} (${
                deviseMagasin.brut ?? "?"
              }) — ce compte App Store n'est pas sur la boutique française`}
            />
          ) : null}
        </View>
      </Section>

      <View style={[s.groupe, s.groupeDeconnexion]}>
        <Ligne
          icone="log-out-outline"
          titre={sortie ? "Déconnexion…" : "Se déconnecter"}
          danger
          enCours={sortie}
          onPress={sortie ? undefined : demanderDeconnexion}
        />
      </View>
    </Ecran>
  );
}

const s = StyleSheet.create({
  titre: {
    color: C.texte,
    fontFamily: P.titre,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.3,
    textTransform: "uppercase",
  },
  identite: {
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
  ecussonCadre: {
    padding: 7,
    borderRadius: R.l,
    backgroundColor: "rgba(255,255,255,.06)",
    borderWidth: 1,
    borderColor: C.bordureForte,
  },
  identiteTexte: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 170,
    minWidth: 0,
    gap: 6,
  },
  nom: {
    color: C.texte,
    fontFamily: P.titre,
    fontSize: 31,
    lineHeight: 37,
    letterSpacing: -0.2,
  },
  detail: {
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 13,
    lineHeight: 21,
  },
  affiliation: {
    marginTop: 3,
    alignItems: "flex-start",
  },
  groupe: {
    backgroundColor: C.surface,
    borderRadius: R.l,
    borderWidth: 1,
    borderColor: C.bordureForte,
    overflow: "hidden",
  },
  groupeDeconnexion: {
    backgroundColor: "rgba(240,68,94,.06)",
    borderColor: "rgba(240,68,94,.28)",
  },
  ligne: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: E.m,
    paddingVertical: E.m,
    minHeight: TOUCHE + 28,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.bordure,
  },
  lignePressee: {
    backgroundColor: "rgba(255,255,255,.07)",
  },
  ligneOccupee: {
    opacity: 0.6,
  },
  icone: {
    width: 40,
    height: 40,
    borderRadius: R.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,200,242,.07)",
    borderWidth: 1,
    borderColor: "rgba(0,200,242,.18)",
  },
  iconeDanger: {
    backgroundColor: "rgba(240,68,94,.10)",
    borderColor: "rgba(240,68,94,.25)",
  },
  ligneContenu: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  ligneTitre: {
    color: C.texte,
    fontFamily: P.texteFort,
    fontSize: 14,
    lineHeight: 21,
  },
  ligneDetail: {
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 12.5,
    lineHeight: 20,
  },
  texteDanger: {
    color: C.dangerTexte,
  },
});
