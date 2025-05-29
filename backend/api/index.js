const serverless = require('serverless-http');
const app = require('../server');
console.log('Imported app:', app); // Debug to confirm server.js is loaded
module.exports.handler = serverless(app);