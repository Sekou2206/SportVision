import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSession } from "../../src/lib/session";
import { PrechauffageConnect } from "../../src/ui/PrechauffageConnect";
import { C, E, R } from "../../src/theme/couleurs";
import { P } from "../../src/theme/polices";

type IconeProps = {
  nom: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  size: number;
  focused: boolean;
};

function IconeOnglet({
  nom,
  color,
  size,
  focused,
}: IconeProps) {
  return (
    <View style={[s.icone, focused && s.iconeActive]}>
      <Ionicons
        name={nom}
        color={focused ? "#1A0B5C" : color}
        size={Math.min(size, 23)}
      />
    </View>
  );
}

function FondOnglets() {
  return (
    <View pointerEvents="none" style={s.fondOnglets}>
      <BlurView
        tint="dark"
        intensity={34}
        style={StyleSheet.absoluteFill}
      />

      <View style={s.voile} />

      <LinearGradient
        colors={[
          "rgba(0,200,242,0)",
          "rgba(0,200,242,.55)",
          "rgba(75,32,217,.65)",
          "rgba(212,44,240,.55)",
          "rgba(212,44,240,0)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.lisere}
      />
    </View>
  );
}

export default function OngletsEspace() {
  const { session, profil, chargement } = useSession();
  const parent = profil?.espace === "parent";

  if (chargement) {
    return (
      <View style={s.chargement}>
        <ActivityIndicator
          size="large"
          color={C.cyan}
          accessibilityLabel="Chargement de votre espace"
        />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/connexion" />;
  }

  return (
    <>
      <PrechauffageConnect />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: C.texte,
          tabBarInactiveTintColor: C.texteDoux,
          tabBarStyle: s.barre,
          tabBarBackground: () => <FondOnglets />,
          tabBarLabelStyle: s.libelle,
          tabBarLabelPosition: "below-icon",
          tabBarItemStyle: s.onglet,
          sceneStyle: s.scene,
        }}
      >
        <Tabs.Screen
          name="accueil"
          options={{
            title: "Accueil",
            tabBarIcon: (props) => (
              <IconeOnglet
                {...props}
                nom={props.focused ? "home" : "home-outline"}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="calendrier"
          options={{
            title: "Calendrier",
            tabBarIcon: (props) => (
              <IconeOnglet
                {...props}
                nom={props.focused ? "calendar" : "calendar-outline"}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="photos"
          options={{
            title: parent ? "Ses photos" : "Mes photos",
            tabBarIcon: (props) => (
              <IconeOnglet
                {...props}
                nom={props.focused ? "images" : "images-outline"}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="services"
          options={{
            title: "Services",
            tabBarIcon: (props) => (
              <IconeOnglet
                {...props}
                nom={props.focused ? "pricetags" : "pricetags-outline"}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="galerie/[id]"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="match/[id]"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="aide-photos"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="connect/[page]"
          options={{ href: null }}
        />

        <Tabs.Screen
          name="profil"
          options={{
            title: "Profil",
            tabBarIcon: (props) => (
              <IconeOnglet
                {...props}
                nom={props.focused ? "person" : "person-outline"}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const s = StyleSheet.create({
  chargement: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.fond,
  },
  scene: {
    backgroundColor: C.fond,
  },
  barre: {
    position: "absolute",
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
  },
  fondOnglets: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    borderTopLeftRadius: R.l,
    borderTopRightRadius: R.l,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: C.bordureForte,
  },
  voile: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,6,32,.88)",
  },
  lisere: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 1,
  },
  onglet: {
    paddingTop: E.xs,
  },
  libelle: {
    fontFamily: P.texteFort,
    fontSize: 10.5,
    marginBottom: 2,
  },
  icone: {
    width: 44,
    height: 30,
    borderRadius: R.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  iconeActive: {
    backgroundColor: C.texte,
  },
});
