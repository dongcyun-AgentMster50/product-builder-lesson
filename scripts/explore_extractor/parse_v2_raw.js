#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join('scenarios', 'explore_v2', 'raw');
const MANUAL_PATH = path.join('scenarios', 'explore_v2', 'manual_captures', 'manual_captures_consolidated.json');
const OUT_PATH = path.join('scenarios', 'explore_v2', 'master_v2.json');

const RAW_FILES = [
  'raw_security.txt', 'raw_energy_saving.txt', 'raw_easy_to_use.txt',
  'raw_time_saving.txt', 'raw_sleep.txt', 'raw_health.txt',
  'raw_pet_care.txt', 'raw_family_care.txt',
];

const KEEP_LOCALES = ['en-US', 'ko-KR'];

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

function extractRawObjects(filePath, errors) {
  const d = fs.readFileSync(filePath, 'utf8');
  const re = /"(\d+)":\{"image":"https?:\/\//g;
  const seen = new Set();
  const list = [];
  let m;
  while ((m = re.exec(d)) !== null) {
    const key = m[1];
    if (seen.has(key)) continue;
    const bs = d.indexOf('{', m.index + key.length + 3);
    const be = findObjectEnd(d, bs);
    if (be < 0) { errors.push({ file: path.basename(filePath), key, reason: 'unbalanced braces' }); continue; }
    try {
      const obj = JSON.parse(d.slice(bs, be + 1));
      if (obj.slug == null && !obj.title) { errors.push({ file: path.basename(filePath), key, reason: 'no slug/title' }); continue; }
      seen.add(key);
      list.push(obj);
    } catch (e) {
      errors.push({ file: path.basename(filePath), key, reason: 'JSON.parse: ' + e.message });
    }
  }
  return list;
}

function normalizeRawScenario(raw) {
  const loc = {};
  for (const k of KEEP_LOCALES) {
    const src = raw.localizations?.[k];
    if (!src) continue;
    loc[k] = {
      thumbnail_title: src.thumbnailTitle ?? null,
      thumbnail_description: src.thumbnailDescription ?? null,
      thumbnail_alt_text: src.thumbnailAltText ?? null,
      overview_title: src.overviewTitle ?? null,
      overview_description: src.overviewDescription ?? null,
    };
  }
  // merge stories: contentDetails (structural) + localizations[loc].contents (text per locale)
  const cd = Array.isArray(raw.contentDetails) ? raw.contentDetails : [];
  const stories = cd.map(s => {
    const story = {
      content_no: s.contentNo ?? null,
      image: s.imageUrl ?? null,
      smart_home_level: s.smartHomeLevel ?? null,
      tag_ids: Array.isArray(s.tagIds) ? s.tagIds : [],
      localizations: {},
    };
    for (const k of KEEP_LOCALES) {
      const arr = raw.localizations?.[k]?.contents;
      const t = Array.isArray(arr) ? arr.find(c => c.contentNo === s.contentNo) : null;
      if (t) {
        story.localizations[k] = {
          title: t.title ?? null,
          description: t.description ?? null,
          image_alt_text: t.imageAltText ?? null,
          cta: null,
        };
      }
    }
    return story;
  });
  return {
    id: `web_raw_slug_${raw.slug}`,
    source: 'web_raw',
    slug: raw.slug ?? null,
    internal_title: raw.internalTitle ?? null,
    thumbnail_image: raw.image ?? null,
    thumbnail_alt: raw.alt ?? null,
    tags: Array.isArray(raw.tags) ? raw.tags.map(t => t.trim()) : [],
    recommended_category_ids_ref: typeof raw.recommendedCategoryIds === 'string' ? raw.recommendedCategoryIds : null,
    localizations: loc,
    stories,
    device_categories: [],
    key_devices: [],
    devices_in_story: null,
    _completeness: 'basic',
  };
}

// Unified normalizer: supports 3 schemas
//   A) legacy (DOC1): icons_shown, now_available_devices, devices_in_story, localizations.{k}.{thumbnail_title, overview_title, overview_description}, stories[{content_no, en-US, ko-KR}]
//   B) spec (DOC2): device_categories, key_devices, localizations.{k}.{thumbnail_title, overview_description}, stories[{en-US, ko-KR}]
//   C) flat (DOC3): title_en/title_ko, intro_en/intro_ko, category, devices[], stories[{title_en, title_ko, desc_en, desc_ko, action}]
function extractEnTitle(m) {
  return m?.localizations?.['en-US']?.thumbnail_title ?? m?.title_en ?? null;
}
function extractKoTitle(m) {
  return m?.localizations?.['ko-KR']?.thumbnail_title ?? m?.title_ko ?? null;
}
function normalizeManualScenario(m) {
  const loc = {};
  const hasLocObj = m.localizations && typeof m.localizations === 'object';
  if (hasLocObj) {
    for (const k of KEEP_LOCALES) {
      const src = m.localizations?.[k];
      if (!src) continue;
      loc[k] = {
        thumbnail_title: src.thumbnail_title ?? null,
        thumbnail_description: null,
        thumbnail_alt_text: null,
        overview_title: src.overview_title ?? null,
        overview_description: src.overview_description ?? null,
      };
    }
  }
  if (m.title_en || m.intro_en) {
    loc['en-US'] = loc['en-US'] || { thumbnail_title: null, thumbnail_description: null, thumbnail_alt_text: null, overview_title: null, overview_description: null };
    if (m.title_en) { loc['en-US'].thumbnail_title = loc['en-US'].thumbnail_title ?? m.title_en; loc['en-US'].overview_title = loc['en-US'].overview_title ?? m.title_en; }
    if (m.intro_en) loc['en-US'].overview_description = loc['en-US'].overview_description ?? m.intro_en;
  }
  if (m.title_ko || m.intro_ko) {
    loc['ko-KR'] = loc['ko-KR'] || { thumbnail_title: null, thumbnail_description: null, thumbnail_alt_text: null, overview_title: null, overview_description: null };
    if (m.title_ko) { loc['ko-KR'].thumbnail_title = loc['ko-KR'].thumbnail_title ?? m.title_ko; loc['ko-KR'].overview_title = loc['ko-KR'].overview_title ?? m.title_ko; }
    if (m.intro_ko) loc['ko-KR'].overview_description = loc['ko-KR'].overview_description ?? m.intro_ko;
  }

  const stories = (Array.isArray(m.stories) ? m.stories : []).map((s, idx) => {
    const story = {
      content_no: s.content_no ?? idx,
      image: null,
      smart_home_level: null,
      tag_ids: [],
      localizations: {},
    };
    for (const k of KEEP_LOCALES) {
      const t = s[k];
      if (t) {
        story.localizations[k] = {
          title: t.title ?? null,
          description: t.description ?? null,
          image_alt_text: null,
          cta: t.cta ?? null,
        };
      }
    }
    if (s.title_en || s.desc_en) {
      story.localizations['en-US'] = story.localizations['en-US'] || { title: null, description: null, image_alt_text: null, cta: null };
      story.localizations['en-US'].title = story.localizations['en-US'].title ?? s.title_en ?? null;
      story.localizations['en-US'].description = story.localizations['en-US'].description ?? s.desc_en ?? null;
      story.localizations['en-US'].cta = story.localizations['en-US'].cta ?? s.action ?? null;
    }
    if (s.title_ko || s.desc_ko) {
      story.localizations['ko-KR'] = story.localizations['ko-KR'] || { title: null, description: null, image_alt_text: null, cta: null };
      story.localizations['ko-KR'].title = story.localizations['ko-KR'].title ?? s.title_ko ?? null;
      story.localizations['ko-KR'].description = story.localizations['ko-KR'].description ?? s.desc_ko ?? null;
      story.localizations['ko-KR'].cta = story.localizations['ko-KR'].cta ?? s.action ?? null;
    }
    return story;
  });

  const device_categories = Array.isArray(m.device_categories) && m.device_categories.length
    ? m.device_categories
    : (Array.isArray(m.icons_shown) ? m.icons_shown : []);
  const key_devices = Array.isArray(m.key_devices) && m.key_devices.length
    ? m.key_devices
    : (Array.isArray(m.now_available_devices) && m.now_available_devices.length
        ? m.now_available_devices
        : (Array.isArray(m.devices) ? m.devices : []));
  const tags = Array.isArray(m.tags) && m.tags.length
    ? m.tags.map(t => String(t).trim())
    : (m.category ? [String(m.category).trim()] : []);

  return {
    id: `app_capture_${m.internal_key || m.id}`,
    source: 'app_capture',
    slug: null,
    internal_title: null,
    thumbnail_image: null,
    thumbnail_alt: null,
    tags,
    recommended_category_ids_ref: null,
    localizations: loc,
    stories,
    device_categories,
    key_devices,
    devices_in_story: m.devices_in_story && typeof m.devices_in_story === 'object' ? m.devices_in_story : null,
    _completeness: 'rich',
  };
}

// Merge a manual scenario's rich fields INTO a raw scenario (upgrade basic → rich)
function upgradeRawWithManual(rawScenario, manualNorm) {
  const merged = { ...rawScenario };
  // Union device_categories (preserve order, dedupe)
  const dcSet = new Set(merged.device_categories || []);
  for (const d of manualNorm.device_categories || []) dcSet.add(d);
  merged.device_categories = [...dcSet];
  // Union key_devices (dedupe by stringified name if object)
  const kdSeen = new Set();
  const kdOut = [];
  for (const arr of [merged.key_devices || [], manualNorm.key_devices || []]) {
    for (const item of arr) {
      const key = typeof item === 'string' ? item : (item?.name || JSON.stringify(item));
      if (kdSeen.has(key)) continue;
      kdSeen.add(key);
      kdOut.push(item);
    }
  }
  merged.key_devices = kdOut;
  // devices_in_story: prefer manual's object if raw lacks it
  if (!merged.devices_in_story && manualNorm.devices_in_story) merged.devices_in_story = manualNorm.devices_in_story;
  // tags union
  const tagSet = new Set(merged.tags || []);
  for (const t of manualNorm.tags || []) tagSet.add(t);
  merged.tags = [...tagSet];
  // completeness upgrade
  if (merged.device_categories.length || merged.key_devices.length || merged.devices_in_story) {
    merged._completeness = 'rich';
    merged._merged_from_manual = manualNorm.id;
  }
  return merged;
}

const errors = [];

// Step 1: read all raw files, dedupe by slug
const rawBySlug = new Map();
const rawSlugSeen = new Set();
for (const f of RAW_FILES) {
  const fp = path.join(RAW_DIR, f);
  if (!fs.existsSync(fp)) { errors.push({ file: f, reason: 'file not found' }); continue; }
  const objects = extractRawObjects(fp, errors);
  for (const obj of objects) {
    const slug = obj.slug;
    if (slug == null) continue;
    if (!rawBySlug.has(slug)) rawBySlug.set(slug, obj);
  }
}
const rawScenarios = [...rawBySlug.values()].sort((a, b) => a.slug - b.slug).map(normalizeRawScenario);

// Step 2: read manual captures (may contain multiple concatenated JSON root objects)
function parseConcatenatedJSON(text) {
  const docs = [];
  let i = 0;
  const n = text.length;
  while (i < n) {
    while (i < n && /\s/.test(text[i])) i++;
    if (i >= n) break;
    if (text[i] !== '{') throw new Error(`unexpected char at ${i}: ${text[i]}`);
    const end = findObjectEnd(text, i);
    if (end < 0) throw new Error(`unbalanced object starting at ${i}`);
    docs.push(JSON.parse(text.slice(i, end + 1)));
    i = end + 1;
  }
  return docs;
}
const manualDocs = parseConcatenatedJSON(fs.readFileSync(MANUAL_PATH, 'utf8'));

// Collect all manual raw entries, group by canonical en_title (fallback ko_title / internal_key).
// Within each group, merge fields (union devices/tags, prefer non-null text, longest stories).
function manualGroupKey(m) {
  const en = (extractEnTitle(m) || '').trim().toLowerCase();
  if (en) return 'en::' + en;
  const ko = (extractKoTitle(m) || '').trim();
  if (ko) return 'ko::' + ko;
  return 'key::' + (m.internal_key || m.id || 'anon_' + Math.random());
}
function mergeNormalized(a, b) {
  // a, b: normalized scenarios. Prefer a's text where present; union devices/tags; longest stories.
  const out = { ...a };
  for (const k of KEEP_LOCALES) {
    const la = a.localizations?.[k];
    const lb = b.localizations?.[k];
    if (!la && lb) { out.localizations = { ...out.localizations, [k]: lb }; continue; }
    if (la && lb) {
      out.localizations = {
        ...out.localizations,
        [k]: {
          thumbnail_title: la.thumbnail_title ?? lb.thumbnail_title ?? null,
          thumbnail_description: la.thumbnail_description ?? lb.thumbnail_description ?? null,
          thumbnail_alt_text: la.thumbnail_alt_text ?? lb.thumbnail_alt_text ?? null,
          overview_title: la.overview_title ?? lb.overview_title ?? null,
          overview_description: la.overview_description ?? lb.overview_description ?? null,
        },
      };
    }
  }
  out.stories = (a.stories?.length || 0) >= (b.stories?.length || 0) ? a.stories : b.stories;
  const dcSet = new Set([...(a.device_categories || []), ...(b.device_categories || [])]);
  out.device_categories = [...dcSet];
  const kdSeen = new Set();
  const kdOut = [];
  for (const arr of [a.key_devices || [], b.key_devices || []]) {
    for (const item of arr) {
      const key = typeof item === 'string' ? item : (item?.name || JSON.stringify(item));
      if (kdSeen.has(key)) continue;
      kdSeen.add(key);
      kdOut.push(item);
    }
  }
  out.key_devices = kdOut;
  out.devices_in_story = a.devices_in_story || b.devices_in_story || null;
  out.tags = [...new Set([...(a.tags || []), ...(b.tags || [])])];
  return out;
}

const manualGroups = new Map();
for (const doc of manualDocs) {
  const arr = Array.isArray(doc.scenarios) ? doc.scenarios : [];
  for (const s of arr) {
    const norm = normalizeManualScenario(s);
    const gk = manualGroupKey(s);
    if (manualGroups.has(gk)) manualGroups.set(gk, mergeNormalized(manualGroups.get(gk), norm));
    else manualGroups.set(gk, norm);
  }
}
const manualNormalized = [...manualGroups.values()];

// Step 3: collision detection with raw by en_title.
// On collision: UPGRADE the raw scenario with manual's device info (merge).
// Else: add manual as standalone app_capture scenario.
const rawByEnTitle = new Map();
for (const s of rawScenarios) {
  const t = s.localizations['en-US']?.thumbnail_title;
  if (t) rawByEnTitle.set(t.trim().toLowerCase(), s);
}
const merged = [];
const standalone = [];
const upgradedRawSlugs = new Set();
let upgradedRaws = rawScenarios.slice();
for (const m of manualNormalized) {
  const enTitle = m.localizations?.['en-US']?.thumbnail_title;
  const key = enTitle ? enTitle.trim().toLowerCase() : null;
  const rawMatch = key ? rawByEnTitle.get(key) : null;
  if (rawMatch) {
    const idx = upgradedRaws.findIndex(r => r.slug === rawMatch.slug);
    if (idx >= 0) {
      upgradedRaws[idx] = upgradeRawWithManual(upgradedRaws[idx], m);
      upgradedRawSlugs.add(rawMatch.slug);
      merged.push({ manual_id: m.id, raw_slug: rawMatch.slug, en_title: enTitle });
    }
  } else {
    standalone.push(m);
  }
}

const allScenarios = [...upgradedRaws, ...standalone];
const dupes = merged; // kept name for existing report block; repurposed as "merged into raw"

// Aggregations
const bySource = {};
const byTag = {};
const byCompleteness = {};
for (const s of allScenarios) {
  bySource[s.source] = (bySource[s.source] || 0) + 1;
  byCompleteness[s._completeness] = (byCompleteness[s._completeness] || 0) + 1;
  for (const t of s.tags) byTag[t] = (byTag[t] || 0) + 1;
}

const master = {
  version: '2.0',
  generated_at: new Date().toISOString(),
  sources: ['Explore v2.0(web raw)', 'Explore v2.0(app manual capture)'],
  total_scenarios: allScenarios.length,
  by_source: bySource,
  by_completeness: byCompleteness,
  by_tag: byTag,
  completeness_note: 'web_raw 시나리오는 본문(thumbnail+overview+stories text)만 보유. app_capture 시나리오는 본문+구매기기(now_available_devices)+devices_in_story+icons_shown 풍부 정보 보유. 나머지 web_raw 시나리오의 디바이스 정보 보강은 후속 작업.',
  scenarios: allScenarios,
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(master, null, 2), 'utf8');

// Console report
const fileSize = fs.statSync(OUT_PATH).size;
console.log('\n=== master_v2.json 생성 완료 ===');
console.log(`경로: ${OUT_PATH}`);
console.log(`파일 사이즈: ${(fileSize / 1024).toFixed(1)} KB`);
console.log(`total_scenarios: ${allScenarios.length}`);
console.log(`by_source: ${JSON.stringify(bySource)}`);
console.log(`by_completeness: ${JSON.stringify(byCompleteness)}`);
console.log(`by_tag: ${JSON.stringify(byTag, null, 2)}`);

console.log('\n=== 시나리오 영문 제목 전체 목록 ===');
allScenarios.forEach((s, i) => {
  const t = s.localizations['en-US']?.thumbnail_title || '(no en-US title)';
  const tag = `[${s._completeness.padEnd(5)}|${s.source.padEnd(11)}]`;
  const slug = s.slug != null ? `slug=${s.slug}` : `id=${s.id}`;
  console.log(`${String(i + 1).padStart(2)}. ${tag} ${slug.padEnd(20)} ${t}`);
});

if (dupes.length) {
  console.log(`\n=== manual → raw 병합 ${dupes.length}건 (raw 본문 유지 + manual device 정보 주입) ===`);
  dupes.forEach(d => console.log(`  - ${d.manual_id} → raw slug=${d.raw_slug} "${d.en_title}"`));
} else {
  console.log('\n=== manual → raw 병합 없음 ===');
}

console.log('\n=== manual_captures 입력 요약 ===');
console.log(`  입력 JSON 문서 수: ${manualDocs.length}`);
console.log(`  원시 항목 합계: ${manualDocs.reduce((n, d) => n + (Array.isArray(d.scenarios) ? d.scenarios.length : 0), 0)}`);
console.log(`  그룹화 후 유니크: ${manualNormalized.length}`);
console.log(`  raw에 merge됨: ${merged.length}`);
console.log(`  standalone app_capture: ${standalone.length}`);

if (errors.length) {
  console.log(`\n=== 파싱 에러/skip ${errors.length}건 ===`);
  errors.forEach(e => console.log(`  - ${e.file}${e.key ? ' key=' + e.key : ''}: ${e.reason}`));
}

// Korean encoding sample
console.log('\n=== 한국어 인코딩 검증 (sample) ===');
const sampleRaw = allScenarios.find(s => s.source === 'web_raw' && s.localizations['ko-KR']?.thumbnail_title);
if (sampleRaw) console.log(`  raw sample: "${sampleRaw.localizations['ko-KR'].thumbnail_title}" (slug=${sampleRaw.slug})`);
const sampleManual = allScenarios.find(s => s.source === 'app_capture');
if (sampleManual) console.log(`  manual sample: "${sampleManual.localizations['ko-KR'].thumbnail_title}" (id=${sampleManual.id})`);
