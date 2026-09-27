const fs = require('fs');
let code = fs.readFileSync('components/Sidebar.tsx', 'utf8');

// Fix imports
code = code.replace(
  "import { ActivityIndicator, Alert, Image, Modal, Platform, Text, TouchableOpacity, View, DeviceEventEmitter, ScrollView } from 'react-native';",
  "import { ActivityIndicator, Alert, Image, Modal, Platform, Text, TouchableOpacity, View, DeviceEventEmitter, ScrollView, NativeModules } from 'react-native';"
);

code = code.replace(
  "import { router } from 'expo-router';",
  "import { router, usePathname } from 'expo-router';"
);

// Add usePathname inside Sidebar
code = code.replace(
  "export default function Sidebar() {",
  "export default function Sidebar() {\n  const pathname = usePathname();"
);

// Fix Logout crash
const logoutTarget = `              try {
                // Lazily require to prevent crashing Expo Go
                const { GoogleSignin } = require('@react-native-google-signin/google-signin');
                
                // Configure must be called before signOut, otherwise it fails
                GoogleSignin.configure({
                  webClientId: '950734388938-qm61e894mghl4dnsi2jb27aglo1eqhbm.apps.googleusercontent.com',
                  iosClientId: '950734388938-8hldjaul248pmbdcjpj0o65m8s8o03qp.apps.googleusercontent.com',
                  offlineAccess: false,
                });

                try {
                  // If the app was restarted, the native SDK might not know we are signed in,
                  // so we should try to restore the session silently before signing out,
                  // otherwise signOut() might throw an error and fail to clear Play Services.
                  try {
                    await GoogleSignin.signInSilently();
                  } catch (e) {}
                  
                  await GoogleSignin.signOut();
                  console.log('[LOGOUT] Google session cleared.');
                } catch (e) {
                  console.log('[LOGOUT] signOut error: ', e);
                }
                
                try {
                  await GoogleSignin.revokeAccess();
                  console.log('[LOGOUT] Google access revoked to force account picker next time.');
                } catch (e) {
                  console.log('[LOGOUT] revokeAccess error: ', e);
                }
              } catch (googleErr) {
                console.log('[LOGOUT] Google sign out error (ignoring):', googleErr);
              }`;

const logoutReplacement = `              try {
                if (NativeModules.RNGoogleSignin) {
                  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
                  GoogleSignin.configure({
                    webClientId: '950734388938-qm61e894mghl4dnsi2jb27aglo1eqhbm.apps.googleusercontent.com',
                    iosClientId: '950734388938-8hldjaul248pmbdcjpj0o65m8s8o03qp.apps.googleusercontent.com',
                    offlineAccess: false,
                  });
                  try {
                    await GoogleSignin.signInSilently();
                  } catch (e) {}
                  
                  await GoogleSignin.signOut();
                  console.log('[LOGOUT] Google session cleared.');
                  
                  try {
                    await GoogleSignin.revokeAccess();
                  } catch (e) {}
                } else {
                  console.log('[LOGOUT] RNGoogleSignin not found. Skipping Google logout (Expo Go mode).');
                }
              } catch (googleErr) {
                console.log('[LOGOUT] Google sign out error (ignoring):', googleErr);
              }`;

code = code.replace(logoutTarget, logoutReplacement);

// Fix Menu Links for dynamic highlights
const menuTarget = `{/* Menu Links */}
            <View style={{ flex: 1 }}>
              <MenuItem icon="home" label="Home" path="/" isActive={true} />
              <MenuItem icon="trophy" label="Challenges" path="/dares" />
              <MenuItem icon="time" label="History" path="/history" />
              <MenuItem icon="cart" label="Store" path="/store" />
              <MenuItem icon="pricetag" label="Coin Toss" path="/coin-toss" />
              <MenuItem icon="settings" label="Settings" path="/profile" />
              <MenuItem icon="log-out-outline" label="Log Out" isLogout={true} />
            </View>`;

const menuReplacement = `{/* Menu Links */}
            <View style={{ flex: 1 }}>
              <MenuItem icon="home" label="Home" path="/" isActive={pathname === '/' || pathname === ''} />
              <MenuItem icon="trophy" label="Challenges" path="/dares" isActive={pathname === '/dares'} />
              <MenuItem icon="time" label="History" path="/history" isActive={pathname === '/history'} />
              <MenuItem icon="cart" label="Store" path="/store" isActive={pathname === '/store'} />
              <MenuItem icon="pricetag" label="Coin Toss" path="/coin-toss" isActive={pathname === '/coin-toss'} />
              <MenuItem icon="settings" label="Settings" path="/profile" isActive={pathname === '/profile'} />
              <MenuItem icon="log-out-outline" label="Log Out" isLogout={true} />
            </View>`;

code = code.replace(menuTarget, menuReplacement);

fs.writeFileSync('components/Sidebar.tsx', code);
console.log('Dynamic active states and logout crash fix applied!');
