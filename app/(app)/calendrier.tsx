import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useSession } from "../../src/lib/session";
import {
  lireCalendrierFamille,
  useFamille,
} from "../../src/lib/famille";
import {
  lireEvenements,
  separer,
  type Evenement,
} from "../../src/lib/donnees";
import { dateDuJourParis } from "../../src/lib/dates";
import {
  useDonnees,
  cleEvenements,
} from "../../src/lib/cache";
import { Ecran, Probleme, Vide } from "../../src/ui/Ecran";
import { CarteEvenement } from "../../src/ui/Cartes";
import { MoisGrille } from "../../src/ui/MoisGrille";
import {
  BandeauEnfant,
  SelecteurEnfant,
} from "../../src/ui/Enfants";
import { C, E, R, TOUCHE } from "../../src/theme/couleurs";
import { P } from "../../src/theme/polices";

const MOIS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const FILTRES = [
  { cle: "tout", libelle: "Tout" },
  { cle: "match", libelle: "Matchs" },
  { cle: "entrainement", libelle: "Entraînements" },
  { cle: "evenement", libelle: "Événements" },
] as const;

type Filtre = (typeof FILTRES)[number]["cle"];

const EVENEMENTS_VIDES: Evenement[] = [];

function estFiltre(valeur: unknown): valeur is Filtre {
  return FILTRES.some((f) => f.cle === valeur);
}

function nomMois(mois: string): string {
  return `${MOIS[Number(mois.slice(5, 7)) - 1]} ${mois.slice(0, 4)}`;
}

export default function Calendrier() {
  const { profil } = useSession();
  const famille = useFamille();
  const router = useRouter();

  const { filtre: filtreDemande } = useLocalSearchParams<{
    filtre?: string;
  }>();

  const parent = profil?.espace === "parent";

  const ecussonClub = parent
    ? famille.detail?.clubLogoUrl
    : profil?.clubLogoUrl;

  const affilie = parent
    ? famille.choisi?.enAttente === false
    : !!profil?.affilie;

  const {
    donnees,
    chargement,
    erreur: souci,
    relire: charger,
  } = useDonnees<Evenement[]>(
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

  const evenements = donnees ?? EVENEMENTS_VIDES;
  const panne = !!souci && donnees === undefined;

  const [vue, setVue] = useState<"planning" | "mois">("planning");
  const [filtre, setFiltre] = useState<Filtre>(
    estFiltre(filtreDemande) ? filtreDemande : "tout",
  );
  const [mois, setMois] = useState<string | null>(null);
  const [jourChoisi, setJourChoisi] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!estFiltre(filtreDemande)) return;

      setFiltre(filtreDemande);
      router.setParams({ filtre: "" });
    }, [filtreDemande, router]),
  );

  const moisDisponibles = useMemo(() => {
    const vus = new Set<string>();

    for (const e of evenements) {
      vus.add(e.date.slice(0, 7));
    }

    return [...vus].sort();
  }, [evenements]);

  const aujourdhui = dateDuJourParis();

  useEffect(() => {
    if (!moisDisponibles.length) return;
    if (mois && moisDisponibles.includes(mois)) return;

    const courant = aujourdhui.slice(0, 7);
    const moisInitial = moisDisponibles.includes(courant)
      ? courant
      : (
          moisDisponibles.find((m) => m >= courant) ??
          moisDisponibles[moisDisponibles.length - 1]
        );

    setMois(moisInitial);
    setJourChoisi(null);
  }, [moisDisponibles, mois, aujourdhui]);

  const duMois = useMemo(
    () =>
      evenements
        .filter((e) => (mois ? e.date.startsWith(mois) : true))
        .filter((e) => (filtre === "tout" ? true : e.genre === filtre)),
    [evenements, mois, filtre],
  );

  const { aVenir, termines } = useMemo(
    () => separer(duMois),
    [duMois],
  );

  const titreMois = mois ? nomMois(mois) : "";

  function ouvrir(e: Evenement) {
    if (e.genre === "match") {
      router.push({
        pathname: "/match/[id]",
        params: { id: e.id },
      });
    }
  }

  return (
    <Ecran
      enCours={chargement}
      rafraichir={charger}
      teinte="cyan"
    >
      <View style={s.entete}>
        <Text accessibilityRole="header" style={s.titre}>
          Calendrier
        </Text>

        <View style={s.bascule}>
          {(["planning", "mois"] as const).map((v) => {
            const actif = vue === v;

            return (
              <Pressable
                key={v}
                onPress={() => setVue(v)}
                accessibilityRole="button"
                accessibilityState={{ selected: actif }}
                accessibilityLabel={
                  v === "planning"
                    ? "Afficher le planning"
                    : "Afficher le calendrier du mois"
                }
                style={({ pressed }) => [
                  s.basculeItem,
                  actif && s.basculeActive,
                  pressed && s.presse,
                ]}
              >
                <Text
                  style={[
                    s.basculeTexte,
                    actif && s.basculeTexteActif,
                  ]}
                >
                  {v === "planning" ? "Planning" : "Mois"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {parent ? (
        <View style={s.groupe}>
          <SelecteurEnfant />
          <BandeauEnfant />
        </View>
      ) : null}

      {moisDisponibles.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.defilementMois}
          contentContainerStyle={s.listeMois}
        >
          {moisDisponibles.map((m) => {
            const actif = m === mois;

            return (
              <Pressable
                key={m}
                onPress={() => {
                  setMois(m);
                  setJourChoisi(null);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: actif }}
                accessibilityLabel={`Voir ${nomMois(m)}`}
                style={({ pressed }) => [
                  s.puce,
                  actif && s.puceActive,
                  pressed && s.presse,
                ]}
              >
                <Text
                  style={[
                    s.puceTexte,
                    actif && s.puceTexteActif,
                  ]}
                >
                  {nomMois(m)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      <View style={s.filtres}>
        {FILTRES.map((f) => {
          const actif = f.cle === filtre;

          return (
            <Pressable
              key={f.cle}
              onPress={() => setFiltre(f.cle)}
              accessibilityRole="button"
              accessibilityState={{ selected: actif }}
              accessibilityLabel={`Filtrer : ${f.libelle}`}
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
                {f.libelle}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {chargement && !evenements.length ? (
        <View style={s.attente}>
          <ActivityIndicator
            color={C.cyan}
            accessibilityLabel="Chargement du calendrier"
          />
        </View>
      ) : panne ? (
        <Probleme surReessayer={charger} />
      ) : vue === "mois" && mois ? (
        <MoisGrille
          mois={mois}
          evenements={duMois}
          aujourdhui={aujourdhui}
          jourChoisi={jourChoisi}
          surJour={setJourChoisi}
          surEvenement={ouvrir}
          ecussonClub={ecussonClub}
        />
      ) : duMois.length ? (
        <View style={s.sections}>
          {aVenir.length ? (
            <View style={s.groupe}>
              <View style={s.enteteSection}>
                <Text
                  accessibilityRole="header"
                  style={s.libelleSection}
                >
                  À venir
                </Text>
                <Text style={s.compte}>{titreMois}</Text>
              </View>

              {aVenir.map((e) => (
                <View key={e.id} style={s.evenement}>
                  {e.date === aujourdhui ? (
                    <View style={s.pastilleJour}>
                      <Text style={s.marqueur}>
                        Aujourd'hui
                      </Text>
                    </View>
                  ) : null}

                  <CarteEvenement
                    e={e}
                    ecussonClub={ecussonClub}
                    onPress={
                      e.genre === "match"
                        ? () => ouvrir(e)
                        : undefined
                    }
                  />
                </View>
              ))}
            </View>
          ) : null}

          {termines.length ? (
            <View style={s.groupe}>
              <View style={s.enteteSection}>
                <Text
                  accessibilityRole="header"
                  style={s.libelleSection}
                >
                  Terminés
                </Text>
                <Text style={s.compte}>
                  {termines.length}
                </Text>
              </View>

              {termines.map((e) => (
                <CarteEvenement
                  key={e.id}
                  e={e}
                  ecussonClub={ecussonClub}
                  onPress={
                    e.genre === "match"
                      ? () => ouvrir(e)
                      : undefined
                  }
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : (
        <Vide
          titre={
            evenements.length
              ? "Rien ce mois-ci"
              : "Calendrier vide"
          }
          texte={
            evenements.length
              ? "Changez de mois ci-dessus, ou retirez le filtre pour voir tout ce que le club a publié."
              : !affilie
                ? parent
                  ? "Le calendrier apparaîtra dès que le club aura validé le rattachement de votre enfant."
                  : "Votre calendrier apparaîtra dès que votre club aura validé votre affiliation."
                : parent
                  ? "Le club n'a encore publié aucun match ni entraînement pour son équipe."
                  : "Votre club n'a encore publié aucun match ni entraînement."
          }
        />
      )}
    </Ecran>
  );
}

const s = StyleSheet.create({
  entete: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: E.m,
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
    flexShrink: 1,
  },
  bascule: {
    flexDirection: "row",
    flexWrap: "wrap",
    maxWidth: "100%",
    backgroundColor: "rgba(10,6,32,.45)",
    borderRadius: R.l,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: C.bordureForte,
  },
  basculeItem: {
    minHeight: TOUCHE,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: R.pill,
  },
  basculeActive: {
    backgroundColor: C.texte,
  },
  basculeTexte: {
    color: C.texteDoux,
    fontFamily: P.texteMoyen,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  basculeTexteActif: {
    color: "#1A0B5C",
    fontFamily: P.texteFort,
  },
  defilementMois: {
    flexGrow: 0,
    flexShrink: 0,
  },
  listeMois: {
    gap: E.s,
    paddingVertical: 2,
    paddingRight: E.s,
  },
  puce: {
    minHeight: TOUCHE,
    paddingHorizontal: E.m,
    paddingVertical: 11,
    borderRadius: R.pill,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,.05)",
    borderWidth: 1,
    borderColor: C.bordureForte,
  },
  puceActive: {
    backgroundColor: "rgba(0,200,242,.12)",
    borderColor: "rgba(0,200,242,.5)",
  },
  puceTexte: {
    color: C.texteDoux,
    fontFamily: P.texteMoyen,
    fontSize: 13,
    lineHeight: 20,
  },
  puceTexteActif: {
    color: C.cyanTexte,
    fontFamily: P.texteFort,
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
    borderWidth: 1,
    borderColor: "transparent",
  },
  filtreActif: {
    backgroundColor: C.texte,
    borderColor: C.texte,
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
  presse: {
    opacity: 0.8,
  },
  groupe: {
    gap: E.s,
  },
  sections: {
    gap: E.l,
  },
  evenement: {
    gap: 8,
  },
  enteteSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: E.s,
    marginBottom: 4,
  },
  libelleSection: {
    color: C.texte,
    fontFamily: P.titre,
    fontSize: 27,
    lineHeight: 33,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  compte: {
    color: C.texteDoux,
    fontFamily: P.label,
    fontSize: 12,
    lineHeight: 18,
    flexShrink: 1,
  },
  pastilleJour: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: R.pill,
    backgroundColor: "rgba(0,200,242,.09)",
    borderWidth: 1,
    borderColor: "rgba(0,200,242,.25)",
  },
  marqueur: {
    color: C.cyanTexte,
    fontFamily: P.label,
    fontSize: 11,
    lineHeight: 17,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  attente: {
    minHeight: 160,
    paddingVertical: E.xl * 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,.04)",
    borderRadius: R.l,
    borderWidth: 1,
    borderColor: C.bordure,
  },
});
