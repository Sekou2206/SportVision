import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from "react-native";
import { C, E, R, TOUCHE } from "../theme/couleurs";
import { P } from "../theme/polices";

type TexteProps = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

export function Titre({ children, style }: TexteProps) {
  return <Text style={[s.titre, style]}>{children}</Text>;
}

export function SousTitre({ children, style }: TexteProps) {
  return <Text style={[s.sousTitre, style]}>{children}</Text>;
}

export function Champ({
  label,
  style,
  onFocus,
  onBlur,
  multiline,
  ...props
}: TextInputProps & { label: string }) {
  const [actif, setActif] = useState(false);

  return (
    <View style={s.champGroupe}>
      <Text style={s.label}>{label}</Text>

      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={C.texteFaible}
        selectionColor={C.cyan}
        accessibilityLabel={label}
        {...props}
        multiline={multiline}
        onFocus={(event) => {
          setActif(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setActif(false);
          onBlur?.(event);
        }}
        style={[
          s.champ,
          multiline && s.champMultiligne,
          actif && s.champActif,
          props.editable === false && s.champDesactive,
          style,
        ]}
      />
    </View>
  );
}

type BoutonProps = {
  titre: string;
  onPress: () => void;
  enCours?: boolean;
  secondaire?: boolean;
  discret?: boolean;
  desactive?: boolean;
  icone?: React.ReactNode;
};

export function Bouton({
  titre,
  onPress,
  enCours = false,
  secondaire = false,
  discret = false,
  desactive = false,
  icone,
}: BoutonProps) {
  const inactif = desactive || enCours;
  const principal = !secondaire && !discret;
  const couleurTexte = principal ? "#1A0B5C" : C.texte;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactif}
      accessibilityRole="button"
      accessibilityLabel={titre}
      accessibilityState={{
        disabled: inactif,
        busy: enCours,
      }}
      style={({ pressed }) => [
        s.bouton,
        principal
          ? s.boutonPrimaire
          : discret
            ? s.boutonDiscret
            : s.boutonSecondaire,
        pressed && !inactif && s.boutonPresse,
        inactif && s.boutonDesactive,
      ]}
    >
      {enCours ? (
        <ActivityIndicator color={couleurTexte} />
      ) : (
        <View style={s.boutonContenu}>
          {icone}
          <Text style={[s.boutonTexte, { color: couleurTexte }]}>
            {titre}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const TONS = {
  neutre: {
    texte: C.texteDoux,
    fond: "rgba(255,255,255,.08)",
    bordure: "rgba(255,255,255,.18)",
  },
  succes: {
    texte: C.succesTexte,
    fond: "rgba(18,183,106,.12)",
    bordure: "rgba(18,183,106,.32)",
  },
  alerte: {
    texte: C.alerteTexte,
    fond: "rgba(232,163,61,.12)",
    bordure: "rgba(232,163,61,.32)",
  },
  danger: {
    texte: C.dangerTexte,
    fond: "rgba(240,68,94,.12)",
    bordure: "rgba(240,68,94,.32)",
  },
  info: {
    texte: C.cyanTexte,
    fond: "rgba(0,200,242,.10)",
    bordure: "rgba(0,200,242,.30)",
  },
} as const;

export function Pastille({
  texte,
  ton = "neutre",
}: {
  texte: string;
  ton?: keyof typeof TONS;
}) {
  const couleurs = TONS[ton];

  return (
    <View
      style={[
        s.pastille,
        {
          backgroundColor: couleurs.fond,
          borderColor: couleurs.bordure,
        },
      ]}
    >
      <Text style={[s.pastilleTexte, { color: couleurs.texte }]}>
        {texte}
      </Text>
    </View>
  );
}

export function Erreur({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <View style={s.erreur} accessibilityLiveRegion="polite">
      <Text style={s.erreurTexte}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  titre: {
    color: C.texte,
    fontFamily: P.titre,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -0.4,
    textTransform: "uppercase",
    flexShrink: 1,
  },
  sousTitre: {
    color: C.texteDoux,
    fontFamily: P.texte,
    fontSize: 15,
    lineHeight: 24,
    flexShrink: 1,
  },
  champGroupe: {
    gap: E.s,
  },
  label: {
    color: C.texteDoux,
    fontFamily: P.label,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  champ: {
    minHeight: 54,
    borderRadius: R.m,
    paddingHorizontal: E.m,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,.05)",
    borderWidth: 1,
    borderColor: C.bordureForte,
    color: C.texte,
    fontFamily: P.texte,
    fontSize: 16,
  },
  champMultiligne: {
    minHeight: 132,
    textAlignVertical: "top",
  },
  champActif: {
    borderColor: C.cyan,
    backgroundColor: "rgba(0,200,242,.06)",
  },
  champDesactive: {
    opacity: 0.55,
  },
  bouton: {
    minHeight: TOUCHE + 8,
    borderRadius: R.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: E.l,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  boutonPrimaire: {
    backgroundColor: C.texte,
    borderColor: "rgba(255,255,255,.8)",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  boutonSecondaire: {
    backgroundColor: "rgba(255,255,255,.08)",
    borderColor: "rgba(255,255,255,.28)",
  },
  boutonDiscret: {
    backgroundColor: "transparent",
  },
  boutonPresse: {
    opacity: 0.8,
  },
  boutonDesactive: {
    opacity: 0.45,
  },
  boutonContenu: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: E.s,
    maxWidth: "100%",
  },
  boutonTexte: {
    fontFamily: P.texteFort,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    flexShrink: 1,
  },
  pastille: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: R.pill,
    borderWidth: 1,
  },
  pastilleTexte: {
    fontFamily: P.texteFort,
    fontSize: 11.5,
    lineHeight: 17,
  },
  erreur: {
    backgroundColor: "rgba(240,68,94,.10)",
    borderWidth: 1,
    borderColor: "rgba(240,68,94,.35)",
    borderRadius: R.m,
    padding: E.m,
  },
  erreurTexte: {
    color: C.dangerTexte,
    fontFamily: P.texte,
    fontSize: 13.5,
    lineHeight: 21,
  },
});
