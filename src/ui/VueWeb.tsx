import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { C } from "../theme/couleurs";

export interface PoigneeVueWeb {
  reculer: () => void;
}

export interface ProprietesVueWeb {
  adresse: string;
  surHistorique: (peutReculer: boolean) => void;
  surChargement: () => void;
  surRetourChoix: () => void;
}

export const VueWeb = forwardRef<
  PoigneeVueWeb,
  ProprietesVueWeb
>(function VueWeb(
  { adresse, surHistorique, surChargement },
  ref,
) {
  const vue = useRef<WebView>(null);

  useImperativeHandle(
    ref,
    () => ({
      reculer: () => vue.current?.goBack(),
    }),
    [],
  );

  return (
    <WebView
      ref={vue}
      source={{ uri: adresse }}
      style={s.vue}
      onLoadEnd={surChargement}
      onNavigationStateChange={(etat) =>
        surHistorique(etat.canGoBack)
      }
      allowsBackForwardNavigationGestures
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      domStorageEnabled
      pullToRefreshEnabled
    />
  );
});

const s = StyleSheet.create({
  vue: {
    flex: 1,
    backgroundColor: C.fond,
  },
});
