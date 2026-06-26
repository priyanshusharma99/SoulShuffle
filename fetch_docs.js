const fs = require('fs');
const https = require('https');

const files = [
  'docs/Phase4_API_Reference_Table.md',
  'docs/Phase4_Frontend_Integration_Guide.md',
  'docs/auth_doc.md',
  'docs/Profile_and _questionaryes_api.md',
  'src/app.js'
];

try { fs.mkdirSync('.backend-docs', {recursive: true}); } catch(e){}

files.forEach(file => {
  const url = 'https://raw.githubusercontent.com/Elevora-Infotech/CoupleGame-Backend/main/' + file.replace(' ', '%20');
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      fs.writeFileSync('.backend-docs/' + file.split('/').pop().replace(' ', '_'), data);
      console.log('Downloaded ' + file);
    });
  });
});
