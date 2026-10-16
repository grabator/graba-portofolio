// Lokalni server za pregled: node serve.mjs (pa otvori http://localhost:8080)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath: ispravna putanja i na Windowsu (C:\...) i na Linux/macOS
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2]) || 8080;
// ista zaglavlja kao na Cloudflareu (_headers), da se CSP provjeri i lokalno
const RULES = [];
try {
  let cur = null;
  for (const line of fs.readFileSync(path.join(ROOT, '_headers'), 'utf8').split('\n')) {
    if (!line.trim()) continue;
    if (!/^\s/.test(line)) { cur = { pat: line.trim(), h: [] }; RULES.push(cur); }
    else if (cur) { const i = line.indexOf(':'); cur.h.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]); }
  }
} catch (e) { /* bez _headers */ }
const match = (pat, p) => (pat.endsWith('*') ? p.startsWith(pat.slice(0, -1)) : p === pat);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm', '.xml': 'application/xml', '.txt': 'text/plain' };

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.resolve(ROOT, '.' + path.posix.normalize(p));
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('404'); }
    const head = { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' };
    const url = new URL(req.url, 'http://x').pathname;
    for (const r of RULES) if (match(r.pat, url)) for (const [k, v] of r.h) head[k.toLowerCase()] = v;
    res.writeHead(200, head);
    res.end(data);
  });
}).listen(PORT, () => console.log('Portfolio: http://localhost:' + PORT));
