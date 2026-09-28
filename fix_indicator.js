
const fs = require('fs');
let code = fs.readFileSync('components/signupForm.tsx', 'utf8');
if (!code.includes('ActivityIndicator')) {
  code = code.replace(/import \{ Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal \} from 'react-native'/, 
  'import { Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from \'react-native\'');
  fs.writeFileSync('components/signupForm.tsx', code);
}

