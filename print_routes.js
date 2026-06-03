require('dotenv').config({ path: './backend/.env' });
const app = require('./backend/src/app');

console.log('--- 🚀 REGISTERED BACKEND ROUTES ---');

function inspectStack(stack, prefix = '') {
  for (const layer of stack) {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ');
      console.log(`${methods} -> ${prefix}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      // Find regex or path prefix
      let pathPrefix = '';
      if (layer.regexp) {
        pathPrefix = layer.regexp.source || '';
        // Simplify a bit
        pathPrefix = pathPrefix
          .replace('^\\/', '/')
          .replace('\\/?(?=\\/|$)', '')
          .replace('\\/?$', '')
          .replace('(?=\\/|$)', '')
          .replace('\\/', '/');
        pathPrefix = pathPrefix.replace(/\\\//g, '/');
      }
      inspectStack(layer.handle.stack, prefix + pathPrefix);
    } else {
      console.log(`Layer: ${layer.name} (no route)`);
    }
  }
}

if (app.router && app.router.stack) {
  inspectStack(app.router.stack);
} else {
  console.log('No router stack found');
}
