// Upiše klasičnu verziju (sav sadržaj kao pravi HTML) u index.html, da je vide Google i čitači bez JavaScripta,
// i osvježi hasheve inline skripti u CSP zaglavlju (_headers).
// Pokretanje poslije svake izmjene u js/i18n.js, js/classic.js ili inline skriptama u index.html:  node tools/staticno.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/i18n.js'), 'utf8'), ctx);
const src = fs.readFileSync(path.join(ROOT, 'js/classic.js'), 'utf8');
const { classicHTML } = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));

const file = path.join(ROOT, 'index.html');
const html = fs.readFileSync(file, 'utf8');
const out = html.replace(/<!--classic-->[\s\S]*?<!--\/classic-->/, '<!--classic-->' + classicHTML(ctx.window.PF, 'en') + '<!--/classic-->');
if (out === html) console.log('index.html je već ažuran');
else { fs.writeFileSync(file, out); console.log('index.html: klasična verzija upisana'); }

// CSP: dozvoljene su samo inline skripte čiji hash odgovara (uvodna skripta i import map)
const page = fs.readFileSync(file, 'utf8');
const hashes = [...page.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g)]
  .map((m) => "'sha256-" + crypto.createHash('sha256').update(m[1]).digest('base64') + "'");
const hf = path.join(ROOT, '_headers');
const headers = fs.readFileSync(hf, 'utf8').replace(/script-src 'self'[^;]*;/, "script-src 'self' " + hashes.join(' ') + ';');
fs.writeFileSync(hf, headers);
console.log('_headers: ' + hashes.length + ' hasha za inline skripte');
