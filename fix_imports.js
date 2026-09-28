
const fs = require('fs');
let code = fs.readFileSync('components/signupForm.tsx', 'utf8');
code = code.replace(/import \{ Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal \} from 'react-native'/, 
  'import { Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from \\'react-native\\'');
fs.writeFileSync('components/signupForm.tsx', code);
console.log('Fixed ActivityIndicator import');

