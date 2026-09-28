
const fs = require("fs");
let code = fs.readFileSync("components/Sidebar.tsx", "utf8");

if (!code.includes("import { logout } from")) {
  code = code.replace(
    "import AsyncStorage from",
    "import AsyncStorage from \"@react-native-async-storage/async-storage\";\nimport { logout } from \"@/services/authService\";"
  );
}

// Replace "await AsyncStorage.clear();" with "await logout();"
code = code.replace(/await AsyncStorage\.clear\(\);/g, "await logout();");

// Add setIsLoggingOut(false) right before emitting logout just in case
code = code.replace(
  "DeviceEventEmitter.emit(\"app:logout\");",
  "setIsLoggingOut(false);\n                DeviceEventEmitter.emit(\"app:logout\");"
);

fs.writeFileSync("components/Sidebar.tsx", code);
console.log("Fixed Sidebar.tsx part 2");

