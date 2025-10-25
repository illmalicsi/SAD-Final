const http = require('http');
const url = 'http://localhost:5000/api/instruments';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('BODY (parsed) length:', Array.isArray(json) ? json.length : Object.keys(json).length);
      console.log(JSON.stringify(json.slice ? json.slice(0,10) : json, null, 2));
    } catch (e) {
      console.log('BODY (raw):', data);
    }
  });
}).on('error', (err) => console.error('REQUEST ERROR:', err.message));
