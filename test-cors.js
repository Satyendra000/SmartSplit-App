const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/sessions/create',
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'POST'
  }
};

const req = http.request(options, (res) => {
  console.log(`My-CORS-Check: ${res.headers['access-control-allow-origin']}`);
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
