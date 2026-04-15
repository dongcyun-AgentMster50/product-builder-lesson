#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  console.error('Usage: node parse_rsc.js <input.txt> <output.json>');
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, 'utf8');

function findObjectEnd(text, startIdx) {
  let depth = 0;
  let inStr = false;
  let escape = false;
  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (inStr) {
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const KEEP_LOCALES = ['en-US', 'ko-KR'];

function localizedContentsList(locObj) {
  const arr = locObj && Array.isArray(locObj.contents) ? locObj.contents : [];
  return arr.map(c => ({
    content_no: c.contentNo ?? null,
    title: c.title ?? null,
    description: c.description ?? null,
    image_alt_text: c.imageAltText ?? null,
  }));
}

function pickLocales(locObj) {
  const out = {};
  if (!locObj || typeof locObj !== 'object') return out;
  for (const k of KEEP_LOCALES) {
    const src = locObj[k];
    if (!src) continue;
    out[k] = {
      thumbnail_title: src.thumbnailTitle ?? null,
      thumbnail_description: src.thumbnailDescription ?? null,
      thumbnail_alt_text: src.thumbnailAltText ?? null,
      overview_title: src.overviewTitle ?? null,
      overview_description: src.overviewDescription ?? null,
      contents: localizedContentsList(src),
    };
  }
  return out;
}

function mergeContents(contentDetails, enContents) {
  const structural = Array.isArray(contentDetails) ? contentDetails : [];
  const text = Array.isArray(enContents) ? enContents : [];
  const textByNo = new Map();
  for (const t of text) if (t && t.contentNo != null) textByNo.set(t.contentNo, t);
  return structural.map(s => {
    const t = textByNo.get(s.contentNo) || {};
    return {
      content_no: s.contentNo ?? null,
      title: t.title ?? null,
      description: t.description ?? null,
      image_alt_text: t.imageAltText ?? null,
      image: s.imageUrl ?? null,
      smart_home_level: s.smartHomeLevel ?? null,
      tag_ids: Array.isArray(s.tagIds) ? s.tagIds : [],
    };
  });
}

function normalizeScenario(obj) {
  const enContents = obj.localizations?.['en-US']?.contents;
  return {
    slug: obj.slug ?? null,
    internal_title: obj.internalTitle ?? null,
    thumbnail_image: obj.image ?? null,
    thumbnail_alt: obj.alt ?? null,
    tags: Array.isArray(obj.tags) ? obj.tags : [],
    recommended_category_ids_ref:
      typeof obj.recommendedCategoryIds === 'string' ? obj.recommendedCategoryIds : null,
    localizations: pickLocales(obj.localizations),
    contents: mergeContents(obj.contentDetails, enContents),
  };
}

const keyRe = /"(\d+)":\{"image":"https?:\/\//g;
const scenarios = [];
const errors = [];
const seenKeys = new Set();

let m;
while ((m = keyRe.exec(raw)) !== null) {
  const key = m[1];
  if (seenKeys.has(key)) continue;
  const braceStart = raw.indexOf('{', m.index + key.length + 3);
  if (braceStart < 0) {
    errors.push({ key, reason: 'no opening brace found' });
    continue;
  }
  const braceEnd = findObjectEnd(raw, braceStart);
  if (braceEnd < 0) {
    errors.push({ key, reason: 'unbalanced braces' });
    continue;
  }
  const slice = raw.slice(braceStart, braceEnd + 1);
  try {
    const obj = JSON.parse(slice);
    if (obj.slug == null && !obj.title) {
      errors.push({ key, reason: 'missing slug and title (not a scenario)' });
      continue;
    }
    scenarios.push({ _key: Number(key), ...normalizeScenario(obj) });
    seenKeys.add(key);
  } catch (e) {
    errors.push({ key, reason: 'JSON.parse failed: ' + e.message });
  }
}

scenarios.sort((a, b) => a._key - b._key);
const finalScenarios = scenarios.map(({ _key, ...rest }) => rest);

const output = {
  source: 'Explore v1.0(web)',
  source_url: 'https://cxoffering.samsungiotcloud.com/default/en-US/explore/step',
  extracted_at: new Date().toISOString(),
  request_keyword: 'family care',
  scenario_count: finalScenarios.length,
  scenarios: finalScenarios,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

console.log(`추출된 시나리오 ${finalScenarios.length}개 → ${outputPath}`);
if (errors.length) {
  console.log(`skip/오류 ${errors.length}건:`);
  for (const e of errors) console.log(`  - key=${e.key}: ${e.reason}`);
}
