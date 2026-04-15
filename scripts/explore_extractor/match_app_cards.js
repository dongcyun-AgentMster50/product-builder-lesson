#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join('scenarios', 'explore_v2', 'raw');
const FILES = [
  'raw_security.txt', 'raw_energy_saving.txt', 'raw_easy_to_use.txt',
  'raw_time_saving.txt', 'raw_sleep.txt', 'raw_health.txt',
  'raw_pet_care.txt', 'raw_family_care.txt',
];

const APP_CARDS = [
  'Simplify your life with convenient Smart lighting',
  'Receive notifications for daily life with lighting',
  'Smart changes starting with small devices',
  'The secret to sleeping well and waking up rested in your...',
  'The comfort of a safe home',
  'Safe steps for your little one',
  'Let SmartThings take care of your workouts from start to...',
  'Keep your family safe and healthy with Family Care',
  'Keep your home cool with the air conditioner',
  'Home management with Map View',
  'Caring for your beloved pet',
  'Energy saving for the planet',
  'Use SmartThings with your family',
  'Our smart life, faster than ever',
  'Smart energy saving to help reduce electricity bills',
  'Help keep your home private and protected',
  'Let AI handle the housework',
  "How to make today's meal more enjoyable",
  'Energy habits for carbon emissions awareness',
  'Getting started with SmartThings',
  'Reliable device care for your home',
  'The universal remote for your home',
  'Making a smarter home is easier than ever',
  'Effortless management and suggestions',
  'Easy checks, safer entry',
  'Personalize your comfort at home with AI',
  'Control your car at a glance with SmartThings',
];

function findObjectEnd(text, startIdx) {
  let depth = 0, inStr = false, esc = false;
  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];
    if (esc) { esc = false; continue; }
    if (inStr) { if (ch === '\\') { esc = true; continue; } if (ch === '"') inStr = false; continue; }
    if (ch === '"') { inStr = true; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return i; }
  }
  return -1;
}

function extractEnglishTitlesFromFile(filePath) {
  const d = fs.readFileSync(filePath, 'utf8');
  const keyRe = /"(\d+)":\{"image":"https?:\/\//g;
  const seen = new Set();
  const out = [];
  let m;
  while ((m = keyRe.exec(d)) !== null) {
    const key = m[1];
    if (seen.has(key)) continue;
    const bs = d.indexOf('{', m.index + key.length + 3);
    const be = findObjectEnd(d, bs);
    if (be < 0) continue;
    try {
      const obj = JSON.parse(d.slice(bs, be + 1));
      if (obj.slug == null && !obj.title) continue;
      seen.add(key);
      const sources = [];
      if (typeof obj.title === 'string') sources.push({ level: 'scenario.title', text: obj.title });
      for (const loc of ['en-US', 'en-GB']) {
        const L = obj.localizations?.[loc];
        if (!L) continue;
        if (typeof L.thumbnailTitle === 'string') sources.push({ level: `loc.${loc}.thumbnailTitle`, text: L.thumbnailTitle });
        if (typeof L.overviewTitle === 'string') sources.push({ level: `loc.${loc}.overviewTitle`, text: L.overviewTitle });
        if (Array.isArray(L.contents)) {
          L.contents.forEach((c, idx) => {
            if (typeof c.title === 'string') sources.push({ level: `loc.${loc}.contents[${idx}].title`, text: c.title });
          });
        }
      }
      for (const s of sources) {
        out.push({ slug: obj.slug, scenarioTitle: obj.title, source: s.level, text: s.text });
      }
    } catch (e) { /* skip */ }
  }
  return out;
}

function normalize(s) {
  return s.toLowerCase()
    .replace(/\u2026/g, '...')   // ellipsis char
    .replace(/[.,!?;:'"\[\]()\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function words(s) { return normalize(s).split(' ').filter(Boolean); }

function isTruncated(card) { return /\.{3}\s*$/.test(card.trim()); }

function prefixMatch(cardWords, titleWords, prefixLen = 5) {
  const n = Math.min(prefixLen, cardWords.length);
  if (titleWords.length < n) return false;
  for (let i = 0; i < n; i++) if (cardWords[i] !== titleWords[i]) return false;
  return true;
}

function overlapRatio(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  let inter = 0;
  for (const w of setA) if (setB.has(w)) inter++;
  const denom = Math.min(setA.size, setB.size) || 1;
  return inter / denom;
}

// Build master list from all 8 files
const allTitlesEntries = [];
for (const f of FILES) {
  const fp = path.join(RAW_DIR, f);
  for (const e of extractEnglishTitlesFromFile(fp)) {
    allTitlesEntries.push({ ...e, sourceFile: f });
  }
}

// Dedupe texts for master list but keep mapping for each unique text → files
const textToFiles = new Map();
const textToMeta = new Map();
for (const e of allTitlesEntries) {
  if (!textToFiles.has(e.text)) textToFiles.set(e.text, new Set());
  textToFiles.get(e.text).add(e.sourceFile);
  if (!textToMeta.has(e.text)) textToMeta.set(e.text, { level: e.source, scenarioTitle: e.scenarioTitle, slug: e.slug });
}
const masterList = [...textToFiles.keys()].sort();

// Match each app card
const results = [];
for (let i = 0; i < APP_CARDS.length; i++) {
  const card = APP_CARDS[i];
  const cardClean = card.replace(/\.{3}\s*$/, '').trim();
  const cardWords = words(cardClean);
  const truncated = isTruncated(card);

  // 1. exact normalized match
  let exact = null;
  for (const t of masterList) {
    if (normalize(t) === normalize(cardClean)) { exact = t; break; }
  }
  if (!exact && truncated) {
    // also accept if raw title starts with all words we have
    for (const t of masterList) {
      const tw = words(t);
      if (tw.length >= cardWords.length && cardWords.every((w, k) => tw[k] === w)) { exact = t; break; }
    }
  }

  if (exact) {
    const meta = textToMeta.get(exact);
    results.push({
      index: i + 1, card, status: 'exact', match: exact,
      scenarioTitle: meta.scenarioTitle, slug: meta.slug, level: meta.level,
      foundInFiles: [...textToFiles.get(exact)].sort(),
      truncation_corrected: truncated,
    });
    continue;
  }

  // 2. truncation prefix match (first 5 words)
  if (truncated) {
    const candidates = [];
    for (const t of masterList) {
      const tw = words(t);
      if (prefixMatch(cardWords, tw, Math.min(5, cardWords.length))) candidates.push(t);
    }
    if (candidates.length) {
      const best = candidates[0];
      const meta = textToMeta.get(best);
      results.push({
        index: i + 1, card, status: 'truncation_prefix', match: best,
        scenarioTitle: meta.scenarioTitle, slug: meta.slug, level: meta.level,
        foundInFiles: [...textToFiles.get(best)].sort(),
        other_candidates: candidates.slice(1),
      });
      continue;
    }
  }

  // 3. fuzzy: word overlap >= 0.5, best score
  let bestScore = 0, bestTitle = null;
  for (const t of masterList) {
    const score = overlapRatio(cardWords, words(t));
    if (score > bestScore) { bestScore = score; bestTitle = t; }
  }
  if (bestScore >= 0.5 && bestTitle) {
    const meta = textToMeta.get(bestTitle);
    results.push({
      index: i + 1, card, status: 'fuzzy', match: bestTitle, overlap: +bestScore.toFixed(2),
      scenarioTitle: meta.scenarioTitle, slug: meta.slug, level: meta.level,
      foundInFiles: [...textToFiles.get(bestTitle)].sort(),
    });
    continue;
  }

  results.push({ index: i + 1, card, status: 'missing', bestGuess: bestTitle, bestScore: +bestScore.toFixed(2) });
}

// Console output
console.log('=== 매칭 결과 ===');
const statusIcon = { exact: '✅', truncation_prefix: '✅', fuzzy: '⚠', missing: '❌' };
for (const r of results) {
  const icon = statusIcon[r.status];
  console.log(`[${String(r.index).padStart(2)}/27] ${icon} ${r.card}`);
  if (r.status === 'exact') {
    console.log(`       → raw 일치: "${r.match}" (level=${r.level}, slug=${r.slug}${r.truncation_corrected ? ', 잘림 보정 매칭' : ''})`);
  } else if (r.status === 'truncation_prefix') {
    console.log(`       → 잘림 보정 매칭 (앞 ${Math.min(5, words(r.card.replace(/\.{3}\s*$/, '')).length)} 단어): "${r.match}" (level=${r.level}, slug=${r.slug})`);
  } else if (r.status === 'fuzzy') {
    console.log(`       → 유사 매칭 (단어중첩 ${r.overlap}): "${r.match}" (level=${r.level}, slug=${r.slug}) — 사용자 확인 필요`);
  } else {
    console.log(`       → raw 어디에도 없음 (최대 유사도 ${r.bestScore}${r.bestGuess ? `, 후보: "${r.bestGuess}"` : ''})`);
  }
}

const exact = results.filter(r => r.status === 'exact' || r.status === 'truncation_prefix');
const fuzzy = results.filter(r => r.status === 'fuzzy');
const missing = results.filter(r => r.status === 'missing');

console.log('\n=== 요약 ===');
console.log(`✅ 정확 일치(잘림 보정 포함): ${exact.length}개`);
console.log(`⚠ 유사 매칭: ${fuzzy.length}개`);
console.log(`❌ 누락: ${missing.length}개`);

if (missing.length) {
  console.log('\n=== 누락된 시나리오 (raw 어디에도 없음 — 캡처 필요) ===');
  missing.forEach(m => console.log(`${m.index}. ${m.card}`));
}
if (fuzzy.length) {
  console.log('\n=== 유사 매칭 (사용자 검수 필요) ===');
  fuzzy.forEach(f => console.log(`${f.index}. "${f.card}"  ↔  raw "${f.match}"  (중첩 ${f.overlap})`));
}

// Save JSON report
const report = {
  checked_at: new Date().toISOString(),
  total_app_cards: APP_CARDS.length,
  exact_match: exact.map(r => ({ index: r.index, card: r.card, match: r.match, level: r.level, slug: r.slug, scenarioTitle: r.scenarioTitle, foundInFiles: r.foundInFiles, truncation_corrected: r.truncation_corrected || r.status === 'truncation_prefix' })),
  fuzzy_match: fuzzy.map(r => ({ index: r.index, card: r.card, match: r.match, overlap: r.overlap, level: r.level, slug: r.slug, scenarioTitle: r.scenarioTitle, foundInFiles: r.foundInFiles })),
  missing: missing.map(r => ({ index: r.index, title: r.card, best_guess: r.bestGuess, best_overlap: r.bestScore })),
  raw_titles_master_list: masterList,
};
const outPath = path.join('scenarios', 'explore_v2', 'match_report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
console.log(`\n리포트 저장: ${outPath} (마스터 리스트 ${masterList.length}개 제목)`);
