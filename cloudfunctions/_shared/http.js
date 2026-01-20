const https = require('https');
const http = require('http');
const { URL } = require('url');

function requestJson(url, { method = 'POST', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const data = body ? JSON.stringify(body) : undefined;

    const req = lib.request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + (u.search || ''),
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
          ...headers
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          const ok = res.statusCode >= 200 && res.statusCode < 300;
          if (!ok) return reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 500)}`));
          try {
            resolve(raw ? JSON.parse(raw) : {});
          } catch (e) {
            reject(new Error(`Invalid JSON: ${raw.slice(0, 500)}`));
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

module.exports = { requestJson };

