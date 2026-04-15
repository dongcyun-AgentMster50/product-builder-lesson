#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const V1_BASE = 'https://cxoffering.samsungiotcloud.com/default/en-US/explore/step/results';
const V2_BASE = 'https://cxoffering.samsungiotcloud.com/v2_default/en-GB/explore/step/results';

const KEYWORDS = [
  'security',
  'energy saving',
  'easy to use',
  'time saving',
  'sleep',
  'health',
  'pet care',
  'family care',
];

const V1_OUT_DIR = path.join('scenarios', 'explore_v1', 'raw');
const V2_OUT_DIR = path.join('scenarios', 'explore_v2', 'raw');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const REQUEST_DELAY_MS = 1000;
const SIZE_WARNING_THRESHOLD = 100 * 1024;

function kwToFilename(kw) { return 'raw_' + kw.replace(/ /g, '_') + '.txt'; }

function buildUrl(base, kw, includeState) {
  const enc = encodeURIComponent(kw);
  return base + (includeState ? `?keywords=${enc}&state=PUBLISHED` : `?keywords=${enc}`);
}

function fetch(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('too many redirects'));
    const req = https.get(url, {
      headers: {
        'Accept': 'text/x-component',
        'RSC': '1',
        'User-Agent': UA,
        'Accept-Encoding': 'gzip, deflate',
      },
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        fetch(new URL(res.headers.location, url).toString(), redirects + 1).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const enc = res.headers['content-encoding'];
      let stream = res;
      if (enc === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (enc === 'deflate') stream = res.pipe(zlib.createInflate());
      else if (enc === 'br') stream = res.pipe(zlib.createBrotliDecompress());
      const chunks = [];
      stream.on('data', c => chunks.push(c));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(60000, () => req.destroy(new Error('timeout after 60s')));
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function padDot(label, width = 34) {
  const pad = Math.max(3, width - label.length);
  return label + ' ' + '.'.repeat(pad);
}

function fmtSize(n) {
  if (n < 1024) return n + 'B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + 'KB';
  return (n / 1024 / 1024).toFixed(2) + 'MB';
}

async function main() {
  fs.mkdirSync(V1_OUT_DIR, { recursive: true });
  fs.mkdirSync(V2_OUT_DIR, { recursive: true });

  const tasks = [];
  for (const kw of KEYWORDS) tasks.push({ version: 'v1', keyword: kw, base: V1_BASE, outDir: V1_OUT_DIR, includeState: true });
  for (const kw of KEYWORDS) tasks.push({ version: 'v2', keyword: kw, base: V2_BASE, outDir: V2_OUT_DIR, includeState: false });

  const s = { v1New: 0, v1Skip: 0, v2New: 0, v2Skip: 0, failures: [], warnings: [], sizes: {} };

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const outPath = path.join(t.outDir, kwToFilename(t.keyword));
    const prefix = `[${String(i + 1).padStart(2)}/${tasks.length}] ${padDot(t.version + ' ' + t.keyword)}`;

    if (fs.existsSync(outPath)) {
      console.log(`${prefix} ⏭ 이미 존재, skip`);
      s[t.version + 'Skip']++;
      s.sizes[outPath] = fs.statSync(outPath).size;
      continue;
    }

    console.log(`${prefix} ⏳ 다운로드 중`);
    const url = buildUrl(t.base, t.keyword, t.includeState);

    try {
      const buf = await fetch(url);
      fs.writeFileSync(outPath, buf);
      s.sizes[outPath] = buf.length;
      console.log(`       ✅ ${outPath} (${fmtSize(buf.length)})`);
      if (buf.length < SIZE_WARNING_THRESHOLD) {
        console.log(`       ⚠ 응답 크기 100KB 미만 — 유효 응답인지 확인 권장`);
        s.warnings.push({ path: outPath, size: buf.length });
      }
      s[t.version + 'New']++;
    } catch (e) {
      console.log(`       ❌ 실패: ${e.message}`);
      s.failures.push({ version: t.version, keyword: t.keyword, url, error: e.message });
    }

    if (i < tasks.length - 1) await sleep(REQUEST_DELAY_MS);
  }

  const totalBytes = Object.values(s.sizes).reduce((a, b) => a + b, 0);
  console.log('\n=== 다운로드 완료 ===');
  console.log(`v1.0: ${s.v1New}/${KEYWORDS.length - s.v1Skip} 신규 (+ ${s.v1Skip} skip)`);
  console.log(`v2.0: ${s.v2New}/${KEYWORDS.length - s.v2Skip} 신규 (+ ${s.v2Skip} skip)`);
  console.log(`총 파일 사이즈: ${fmtSize(totalBytes)}`);
  console.log(`실패: ${s.failures.length}건`);
  for (const f of s.failures) console.log(`  - ${f.version} ${f.keyword}: ${f.error}`);
  if (s.warnings.length) {
    console.log('경고:');
    for (const w of s.warnings) console.log(`  - ${w.path} (${fmtSize(w.size)})`);
  }
}

main().catch(e => { console.log('치명적 오류:', e.message); process.exit(1); });
