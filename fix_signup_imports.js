
const fs = require('fs');
let code = fs.readFileSync('components/signupForm.tsx', 'utf8');
code = code.replace(/import \{ signUp \} from '\.\.\/services\/authService'/, 
  'import { signUp, googleLogin, appleLogin } from \\'../services/authService\\'');
fs.writeFileSync('components/signupForm.tsx', code);

