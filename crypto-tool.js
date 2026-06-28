#!/usr/bin/env node
/**
 * Acreage Position Map — data encrypt/decrypt helper.
 * Zero dependencies: uses Node's built-in `crypto` (no `npm install` needed).
 *
 * Matches the browser's WebCrypto scheme exactly:
 *   AES-256-GCM, key = PBKDF2-HMAC-SHA256(password, salt, 200000 iters)
 *   file = base64( salt[16] + iv[12] + ciphertext + gcmTag[16] )
 *
 * Usage:
 *   node crypto-tool.js decrypt data.enc data.json   # password from PW env or prompt
 *   node crypto-tool.js encrypt data.json data.enc
 *
 * Provide the password via env var to avoid the prompt:
 *   PW='RF2026!' node crypto-tool.js encrypt data.json data.enc
 */
const crypto = require('crypto');
const fs = require('fs');

const ITER = 200000, KEYLEN = 32, SALTLEN = 16, IVLEN = 12, TAGLEN = 16;

function getPassword() {
  if (process.env.PW) return process.env.PW;
  // Synchronous prompt without extra deps.
  process.stdout.write('Password: ');
  const buf = Buffer.alloc(256);
  let n = 0;
  try {
    const fd = fs.openSync('/dev/tty', 'rs');   // mac/linux
    n = fs.readSync(fd, buf, 0, 256, null);
    fs.closeSync(fd);
  } catch (e) {
    n = fs.readSync(0, buf, 0, 256, null);       // fallback: stdin
  }
  return buf.slice(0, n).toString('utf8').replace(/[\r\n]+$/, '');
}

function deriveKey(pw, salt) {
  return crypto.pbkdf2Sync(Buffer.from(pw, 'utf8'), salt, ITER, KEYLEN, 'sha256');
}

function encrypt(inPath, outPath, pw) {
  const data = fs.readFileSync(inPath);
  const salt = crypto.randomBytes(SALTLEN);
  const iv = crypto.randomBytes(IVLEN);
  const key = deriveKey(pw, salt);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([c.update(data), c.final()]);
  const tag = c.getAuthTag();
  const out = Buffer.concat([salt, iv, ct, tag]).toString('base64');
  fs.writeFileSync(outPath, out);
  console.log(`Encrypted ${inPath} -> ${outPath} (${out.length} b64 chars)`);
}

function decrypt(inPath, outPath, pw) {
  const raw = Buffer.from(fs.readFileSync(inPath, 'utf8'), 'base64');
  const salt = raw.subarray(0, SALTLEN);
  const iv = raw.subarray(SALTLEN, SALTLEN + IVLEN);
  const tag = raw.subarray(raw.length - TAGLEN);
  const ct = raw.subarray(SALTLEN + IVLEN, raw.length - TAGLEN);
  const key = deriveKey(pw, salt);
  const d = crypto.createDecipheriv('aes-256-gcm', key, iv);
  d.setAuthTag(tag);
  let pt;
  try {
    pt = Buffer.concat([d.update(ct), d.final()]);
  } catch (e) {
    console.error('Decrypt failed — wrong password?');
    process.exit(1);
  }
  fs.writeFileSync(outPath, pt);
  console.log(`Decrypted ${inPath} -> ${outPath} (${pt.length} bytes)`);
}

const [mode, inPath, outPath] = process.argv.slice(2);
if (!['encrypt', 'decrypt'].includes(mode) || !inPath || !outPath) {
  console.error('Usage: node crypto-tool.js <encrypt|decrypt> <in> <out>');
  process.exit(1);
}
const pw = getPassword();
if (mode === 'encrypt') encrypt(inPath, outPath, pw);
else decrypt(inPath, outPath, pw);