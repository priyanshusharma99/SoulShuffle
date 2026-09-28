
const fs = require("fs");
let code = fs.readFileSync("components/Sidebar.tsx", "utf8");

if (!code.includes("expo-constants")) {
  code = code.replace(
    "import { View, Text, TouchableOpacity, Alert, ActivityIndicator, NativeModules, DeviceEventEmitter } from \"react-native\";",
    "import { View, Text, TouchableOpacity, Alert, ActivityIndicator, NativeModules, DeviceEventEmitter } from \"react-native\";\nimport Constants, { ExecutionEnvironment } from \"expo-constants\";"
  );
  // Also try replacing without DeviceEventEmitter just in case
  code = code.replace(
    "import { View, Text, TouchableOpacity, Alert, ActivityIndicator, NativeModules } from \"react-native\";",
    "import { View, Text, TouchableOpacity, Alert, ActivityIndicator, NativeModules } from \"react-native\";\nimport Constants, { ExecutionEnvironment } from \"expo-constants\";"
  );
}

const newBlock = `const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
                  if (!isExpoGo) {
                    const { GoogleSignin } = require("@react-native-google-signin/google-signin");
                    GoogleSignin.configure({
                      webClientId: "950734388938-qm61e894mghl4dnsi2jb27aglo1eqhbm.apps.googleusercontent.com",
                      iosClientId: "950734388938-8hldjaul248pmbdcjpj0o65m8s8o03qp.apps.googleusercontent.com",
                      offlineAccess: false,
                    });
                    try { await GoogleSignin.signInSilently(); } catch (e) {}
                    await GoogleSignin.signOut();
                    console.log("[LOGOUT] Google session cleared.");
                    try { await GoogleSignin.revokeAccess(); } catch (e) {}
                  } else {
                    console.log("[LOGOUT] Skipping Google logout (Expo Go mode).");
                  }`;

const regex = /if \(NativeModules\.RNGoogleSignin\) \{[\s\S]*?\} else \{[\s\S]*?\}/;
code = code.replace(regex, newBlock);

fs.writeFileSync("components/Sidebar.tsx", code);
console.log("Fixed Sidebar.tsx");

