const serverless = require('serverless-http');
const app = require('../server');
console.log('Imported app:', app); // Debug to confirm server.js is loaded
module.exports.handler = async (req, res) => {
  res.status(200).json({ message: 'Test handler works!' });
};