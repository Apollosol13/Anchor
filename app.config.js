module.exports = {
  expo: {
    name: "Anchor",
    slug: "anchor-bible",
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    scheme: "io.anchrapp.anchor",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#000000",
    },
    updates: {
      url: "https://u.expo.dev/dd4eb5e2-67ac-4161-bceb-418044ec40a0"
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "io.anchrapp.anchor",
      associatedDomains: ["applinks:anchrapp.io"],
      infoPlist: {
        UIBackgroundModes: ["remote-notification"],
        ITSAppUsesNonExemptEncryption: false,
        NSPhotoLibraryAddUsageDescription:
          "Anchor needs access to save verse images to your photo library.",
        NSPhotoLibraryUsageDescription:
          "Anchor needs access to your photo library to select custom backgrounds.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000000",
      },
      package: "io.anchrapp.anchor",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "anchrapp.io",
              pathPrefix: "/auth",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      bundler: "metro",
      output: "server",
      favicon: "./assets/favicon.png",
    },
    experiments: {
      reactCompiler: true,
    },
    plugins: [
      "expo-router",
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#ffffff",
        },
      ],
      "expo-web-browser",
      "expo-secure-store",
      "expo-asset",
      "expo-font",
      "expo-sharing",
    ],
    extra: {
      eas: {
        projectId: "dd4eb5e2-67ac-4161-bceb-418044ec40a0",
      },
    },
  },
};
