/**
 * Story Chat Module — selected story 컨텍스트 기반 BYOK 채팅
 *
 * P7-A-5 (2026-04-28): UI 리팩터 — sticky bottom + 컨텍스트 전환.
 * 입력창 1개를 페이지 sticky 영역에 배치, 응답은 각 스토리 카드 안 mount 영역에 표시.
 *
 * Public API:
 *   StoryChat.mountInputBar(container, options?)
 *     · 페이지 1회 호출 (sticky bar 영역에)
 *     · BYOK 키 검증 + 라벨 표시 + storage 이벤트 리스너 등록
 *
 *   StoryChat.mountResponseArea(container, scenarioNo, storyNo)
 *     · 각 스토리 카드의 .story-chat-mount 안에 호출 (응답 표시 전용)
 *
 *   StoryChat.activate(scenarioNo, storyNo, scenario, story)
 *     · 사용자가 "이 스토리로 더 파보기" 클릭 시 호출
 *     · sticky bar 컨텍스트 헤더 갱신, history Map 로드
 *
 *   StoryChat.deactivate()
 *     · 활성 스토리가 사라질 때 (카테고리 필터 등). sticky bar 를 빈 상태로
 *
 *   StoryChat.refreshAllToggles()
 *     · 모든 .story-chat-toggle 버튼의 BYOK 단서 (자물쇠/배지) 갱신
 *
 *   StoryChat.isAuthenticated()
 *     · 현재 BYOK 키 등록 상태 boolean
 *
 * BYOK 키 우선순위:
 *   1) localStorage 'st_api_config' (v2 형식: { provider, key })
 *   2) localStorage 'userApiKey_v2' (v1 base64 인코딩, OpenAI 가정)
 */
(function () {
  'use strict';

  // V2 모델 정책 미러 (변경 시 다음 5곳 동시 갱신):
  //   1. functions/api/_provider.js DEFAULT_MODELS / DEFAULT_MODEL_LABELS (SSOT)
  //   2. server.js V2_DEFAULT_MODELS
  //   3. v2.html V2_DEFAULT_MODELS
  //   4. v2.html V2_MODEL_LABELS
  //   5. js/story-chat.js V2_MODEL_LABELS + PROVIDER_LABEL (← 본 위치)
  const PROVIDER_LABEL = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    gemini: 'Google',
  };
  const V2_MODEL_LABELS = {
    openai: 'GPT-5.5',
    anthropic: 'Claude Sonnet 4.6',
    gemini: 'Gemini 3.1 Pro',
  };

  const STORAGE_KEYS = ['st_api_config', 'userApiKey_v2'];

  // ── BYOK 키 헬퍼 ────────────────────────────────────────────
  function normalizeProvider(p) {
    const v = String(p || '').toLowerCase().trim();
    if (v === 'claude' || v === 'anthropic') return 'anthropic';
    if (v === 'openai' || v === 'gpt' || v === 'chatgpt') return 'openai';
    if (v === 'gemini' || v === 'google') return 'gemini';
    return null;
  }
  function detectProviderFromKey(key) {
    const k = String(key || '').trim();
    if (!k) return null;
    if (k.startsWith('AIza')) return 'gemini';
    if (k.startsWith('sk-ant-')) return 'anthropic';
    if (k.startsWith('sk-')) return 'openai';
    return null;
  }
  function loadApiConfig() {
    try {
      const raw = localStorage.getItem('st_api_config');
      if (raw) {
        const cfg = JSON.parse(raw);
        if (cfg && cfg.key) {
          const provider = normalizeProvider(cfg.provider) || detectProviderFromKey(cfg.key);
          if (provider) return { provider, key: cfg.key };
        }
      }
    } catch (e) { /* fall through */ }
    try {
      const encoded = localStorage.getItem('userApiKey_v2');
      if (encoded) {
        const decoded = decodeURIComponent(escape(atob(encoded)));
        if (decoded) {
          const hinted = normalizeProvider(
            sessionStorage.getItem('userProvider') || sessionStorage.getItem('aiProvider')
          );
          const provider = hinted || detectProviderFromKey(decoded);
          if (provider) return { provider, key: decoded };
        }
      }
    } catch (e) { /* fall through */ }
    return null;
  }

  // ── 백엔드 호출 ─────────────────────────────────────────────
  async function callStoryChatBackend({ apiKey, scenario, story, userMessage, history }) {
    const res = await fetch('/api/story-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Api-Key': apiKey },
      body: JSON.stringify({
        scenario: {
          id: scenario?.id || scenario?.scenario_id || null,
          category: scenario?.category || '',
          title: scenario?.title || '',
        },
        story: {
          number: story?.story_no || story?.number || null,
          title: story?.title || '',
          content: story?.content || '',
        },
        userMessage,
        history,
      }),
    });
    let data = null;
    try { data = await res.json(); } catch { /* fall through */ }
    if (!res.ok || !data || data.ok === false) {
      const code = data?.error?.code || `HTTP_${res.status}`;
      const msg = data?.error?.message || `요청이 실패했습니다 (${res.status}).`;
      throw new Error(`${code}: ${msg}`);
    }
    return String(data.reply || '').trim();
  }

  // ── 모듈 상태 ───────────────────────────────────────────────
  let apiConfig = null;
  let activeStoryKey = null;
  let activeContext = null; // { scenarioNo, storyNo, scenario, story, responseContainer }
  const historyMap = new Map(); // storyKey -> history[]
  const responseAreas = new Map(); // storyKey -> response container element

  // sticky bar refs (mountInputBar 가 채움)
  let barEl = null;
  let barHeaderEl = null;
  let barProviderEl = null;
  let barFormEl = null;
  let barInputEl = null;
  let barSendBtn = null;
  let barNoauthEl = null;
  let barPresetsEl = null;

  function storyKeyOf(scenarioNo, storyNo) {
    return `${scenarioNo}-${storyNo}`;
  }

  // ── CSS 인젝션 (한 번만) ───────────────────────────────────
  function injectStyles() {
    if (document.getElementById('storychat-styles')) return;
    const css = `
      /* sticky bottom bar (페이지 레벨) */
      .storychat-bar {
        position: sticky; bottom: 0; left: 0; right: 0;
        z-index: 50;
        background: #ffffff;
        border-top: 1px solid #d6dae2;
        box-shadow: 0 -4px 14px rgba(15, 24, 60, 0.07);
        padding: 12px 18px;
        padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
        font-family: inherit;
      }
      .storychat-bar.is-noauth { background: #f7f8fa; }
      .storychat-bar-inner {
        max-width: 1100px; margin: 0 auto;
        display: flex; flex-direction: column; gap: 8px;
      }
      .storychat-bar-head {
        display: flex; align-items: center; justify-content: space-between;
        gap: 10px; min-height: 22px;
      }
      .storychat-bar-context {
        font-size: 12.5px; color: #15171a; font-weight: 600;
        display: flex; align-items: center; gap: 6px;
        min-width: 0; flex: 1;
      }
      .storychat-bar-context .ctx-label {
        color: #6b7280; font-weight: 500; font-size: 12px;
      }
      .storychat-bar-context .ctx-title {
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .storychat-bar-provider {
        font-size: 11px; color: #6b7280; flex-shrink: 0;
      }
      .storychat-bar-presets {
        display: flex; flex-wrap: wrap; gap: 6px;
      }
      .storychat-bar-presets.hidden { display: none; }
      .storychat-bar-preset {
        font-size: 11px; padding: 4px 9px; border-radius: 14px;
        border: 1px solid #c9d0db; background: transparent; color: #1a3a8f;
        cursor: pointer; font-family: inherit; transition: all 0.15s;
      }
      .storychat-bar-preset:hover { background: #eef1f6; }
      .storychat-bar-form {
        display: flex; gap: 8px; align-items: flex-end;
      }
      .storychat-bar-input {
        flex: 1; padding: 9px 11px; border-radius: 8px;
        border: 1px solid #d0d4da; background: #fff; color: #15171a;
        font-family: inherit; font-size: 13px; line-height: 1.5;
        resize: none; min-height: 44px; max-height: 120px;
      }
      .storychat-bar-input:focus {
        outline: none; border-color: #1a3a8f;
        box-shadow: 0 0 0 3px rgba(26, 58, 143, 0.15);
      }
      .storychat-bar-input:disabled { background: #f0f2f5; color: #8a92a0; cursor: not-allowed; }
      .storychat-bar-send {
        padding: 0 16px; height: 44px; border-radius: 8px; border: none;
        background: #1a3a8f; color: #fff; font-weight: 600; font-size: 13px;
        cursor: pointer; font-family: inherit; transition: all 0.15s;
        flex-shrink: 0;
      }
      .storychat-bar-send:hover:not(:disabled) { background: #0f2766; }
      .storychat-bar-send:disabled { opacity: 0.5; cursor: not-allowed; }

      /* noauth (BYOK 키 미설정) 패널 — sticky bar 내부 */
      .storychat-bar-noauth {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; padding: 8px 0;
      }
      .storychat-bar-noauth.hidden { display: none; }
      .storychat-bar-noauth-msg {
        display: flex; align-items: center; gap: 8px;
        font-size: 13px; color: #15171a; font-weight: 500;
      }
      .storychat-bar-noauth-msg .lock { font-size: 16px; }
      .storychat-bar-noauth-actions { display: flex; gap: 8px; }
      .storychat-bar-noauth-action {
        padding: 7px 14px; border-radius: 8px;
        background: #1a3a8f; color: #fff; text-decoration: none;
        font-size: 12.5px; font-weight: 600; font-family: inherit;
        border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
      }
      .storychat-bar-noauth-action:hover { background: #0f2766; }
      .storychat-bar-noauth-action.secondary {
        background: transparent; color: #1a3a8f; border: 1px solid #c9d0db;
      }
      .storychat-bar-noauth-action.secondary:hover { background: #eef1f6; }

      /* 응답 영역 (각 카드 안 .story-chat-mount) */
      .storychat-response {
        margin-top: 14px; padding: 14px 16px; border-radius: 12px;
        background: #f7f8fa; border: 1px solid #e3e7ee; color: #15171a;
        font-family: inherit; font-size: 13px;
      }
      .storychat-response-empty {
        font-size: 12px; color: #8a92a0; padding: 4px 0;
      }
      .storychat-log {
        display: flex; flex-direction: column; gap: 8px;
      }
      .storychat-msg {
        padding: 9px 12px; border-radius: 9px; font-size: 12.5px; line-height: 1.6;
        white-space: pre-wrap; word-break: break-word;
      }
      .storychat-msg.user { background: #1a3a8f; color: #fff; align-self: flex-end; max-width: 85%; }
      .storychat-msg.assistant { background: #fff; border: 1px solid #e3e7ee; color: #15171a; align-self: flex-start; max-width: 95%; }
      .storychat-msg.error { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; align-self: flex-start; }
      .storychat-msg.thinking { opacity: 0.6; font-style: italic; }

      /* 페이지 본문 padding (sticky bar 가리지 않게) */
      body.has-storychat-bar { padding-bottom: 130px; }

      /* BYOK 단서 — .story-chat-toggle 버튼에 부착 */
      .story-chat-toggle.locked .lock-icon { font-size: 13px; }
      .story-chat-toggle .byok-badge {
        display: inline-block; margin-left: 4px;
        padding: 1px 6px; border-radius: 8px;
        background: rgba(220, 138, 0, 0.15); color: #8a5a00;
        font-size: 10px; font-weight: 700; letter-spacing: 0.2px;
      }
      .story-chat-toggle:not(.locked) .byok-badge { display: none; }
      .story-chat-toggle:not(.locked) .lock-icon { display: none; }
    `;
    const style = document.createElement('style');
    style.id = 'storychat-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── sticky bar HTML ────────────────────────────────────────
  function buildBarHTML() {
    return `
      <div class="storychat-bar-inner">
        <div class="storychat-bar-noauth hidden" data-bar-noauth>
          <div class="storychat-bar-noauth-msg">
            <span class="lock">🔒</span>
            <span>BYOK 키 등록 후 사용 가능 — 본인 API 사용량으로 차감</span>
          </div>
          <div class="storychat-bar-noauth-actions">
            <a href="./v2.html" class="storychat-bar-noauth-action">키 등록하기 →</a>
            <a href="./index.html" class="storychat-bar-noauth-action secondary">v1에서 등록</a>
          </div>
        </div>
        <div class="storychat-bar-head">
          <div class="storychat-bar-context" data-bar-context>
            <span class="ctx-label">스토리를 선택하면 해당 컨텍스트로 질문할 수 있어요</span>
          </div>
          <div class="storychat-bar-provider" data-bar-provider>—</div>
        </div>
        <div class="storychat-bar-presets hidden" data-bar-presets>
          <button type="button" class="storychat-bar-preset" data-prompt="우리 매장 고객용으로 각색해 줘. 30초 안에 들려줄 수 있는 짧은 데모 스크립트로.">🛍 매장 데모 30초</button>
          <button type="button" class="storychat-bar-preset" data-prompt="이 스토리를 신혼부부 페르소나에 맞춰 다시 써 줘. 감정 포인트를 강조해서.">💑 신혼 페르소나</button>
          <button type="button" class="storychat-bar-preset" data-prompt="이 스토리에 추가하면 좋을 SmartThings 디바이스 3개를 추천해 줘. 왜 잘 어울리는지 한 줄씩.">🔌 추가 디바이스 3개</button>
          <button type="button" class="storychat-bar-preset" data-prompt="이 스토리를 인스타그램 카드뉴스 5장 분량의 카피로 만들어 줘.">📱 인스타 카피 5장</button>
        </div>
        <form class="storychat-bar-form" data-bar-form>
          <textarea class="storychat-bar-input" data-bar-input rows="1" placeholder="스토리를 선택하면 입력할 수 있어요"></textarea>
          <button type="submit" class="storychat-bar-send" data-bar-send disabled>보내기</button>
        </form>
      </div>
    `;
  }

  // ── sticky bar 상태 갱신 ────────────────────────────────────
  function refreshInputBarLabel() {
    if (!barEl) return;
    const isAuth = !!apiConfig;
    barEl.classList.toggle('is-noauth', !isAuth);
    if (barNoauthEl) barNoauthEl.classList.toggle('hidden', isAuth);

    if (!isAuth) {
      barProviderEl.textContent = '—';
      barInputEl.disabled = true;
      barInputEl.value = '';
      barInputEl.placeholder = '🔒 BYOK 키 등록 후 사용 가능';
      barSendBtn.disabled = true;
      barPresetsEl.classList.add('hidden');
      barHeaderEl.innerHTML = `<span class="ctx-label">BYOK 키를 등록하면 시나리오 컨텍스트로 질문할 수 있어요</span>`;
      return;
    }

    // 인증됨
    const provName = PROVIDER_LABEL[apiConfig.provider] || apiConfig.provider;
    const modelName = V2_MODEL_LABELS[apiConfig.provider] || '';
    barProviderEl.textContent = modelName ? `${provName} · ${modelName}` : provName;

    if (activeContext) {
      const sc = activeContext.scenario || {};
      const st = activeContext.story || {};
      const ctxNumber = st.story_no || st.number || activeContext.storyNo || '?';
      const ctxTitle = st.title || '(스토리 제목 없음)';
      const scTitle = sc.title || sc.category || '';
      barHeaderEl.innerHTML = `
        <span class="ctx-label">${escapeHTML(scTitle)} · 스토리 ${ctxNumber}</span>
        <span class="ctx-title">— ${escapeHTML(ctxTitle)}</span>
      `;
      barInputEl.disabled = false;
      barInputEl.placeholder = '이 스토리에 대해 무엇이든 물어보세요. (예: 다른 톤으로, 매장 시연 방법)';
      barSendBtn.disabled = false;
      barPresetsEl.classList.remove('hidden');
    } else {
      barHeaderEl.innerHTML = `<span class="ctx-label">스토리를 선택하면 해당 컨텍스트로 질문할 수 있어요</span>`;
      barInputEl.disabled = true;
      barInputEl.placeholder = '먼저 스토리를 선택하세요';
      barSendBtn.disabled = true;
      barPresetsEl.classList.add('hidden');
    }
  }

  // ── 모든 .story-chat-toggle 버튼 라벨 갱신 (BYOK 단서) ──────
  function refreshAllToggles() {
    const isAuth = !!apiConfig;
    document.querySelectorAll('.story-chat-toggle').forEach(btn => {
      btn.classList.toggle('locked', !isAuth);
      // active 상태(현재 활성 스토리)는 별도. BYOK 단서만 갱신.
      const isActive = btn.classList.contains('active');
      const baseLabel = '이 스토리로 더 파보기';
      if (isActive) {
        btn.innerHTML = `✕ 채팅 닫기`;
      } else if (!isAuth) {
        btn.innerHTML = `<span class="lock-icon">🔒</span> 💬 ${baseLabel}<span class="byok-badge">BYOK 필요</span>`;
      } else {
        btn.innerHTML = `💬 ${baseLabel}`;
      }
    });
  }

  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ── 응답 영역 메시지 추가 ───────────────────────────────────
  function addResponseMsg(container, role, content, extraClass = '') {
    if (!container) return null;
    let log = container.querySelector('[data-storychat-log]');
    const empty = container.querySelector('.storychat-response-empty');
    if (empty) empty.remove();
    if (!log) {
      const wrap = document.createElement('div');
      wrap.className = 'storychat-log';
      wrap.setAttribute('data-storychat-log', '');
      container.appendChild(wrap);
      log = wrap;
    }
    const el = document.createElement('div');
    el.className = `storychat-msg ${role} ${extraClass}`.trim();
    el.textContent = content;
    log.appendChild(el);
    container.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return el;
  }

  // ── 응답 영역 렌더 (히스토리 복원) ─────────────────────────
  function renderResponseFromHistory(container, history) {
    if (!container) return;
    container.innerHTML = '';
    if (!history || !history.length) {
      const empty = document.createElement('div');
      empty.className = 'storychat-response-empty';
      empty.textContent = '아래 입력창에서 질문을 보내면 여기에 응답이 표시돼요.';
      container.appendChild(empty);
      return;
    }
    const log = document.createElement('div');
    log.className = 'storychat-log';
    log.setAttribute('data-storychat-log', '');
    container.appendChild(log);
    for (const m of history) {
      const el = document.createElement('div');
      el.className = `storychat-msg ${m.role === 'assistant' ? 'assistant' : 'user'}`;
      el.textContent = m.content;
      log.appendChild(el);
    }
  }

  // ── send (sticky bar input → activeContext → response area) ───
  async function send(userText) {
    if (!userText) return;
    if (!apiConfig) return;
    if (!activeContext) return;

    const key = activeStoryKey;
    const ctx = activeContext;
    const responseContainer = ctx.responseContainer || responseAreas.get(key);
    const history = historyMap.get(key) || [];

    addResponseMsg(responseContainer, 'user', userText);
    barInputEl.value = '';
    barSendBtn.disabled = true;
    barInputEl.disabled = true;
    const thinkingEl = addResponseMsg(responseContainer, 'assistant', '생각 중...', 'thinking');
    const historySnapshot = history.slice();

    try {
      const reply = await callStoryChatBackend({
        apiKey: apiConfig.key,
        scenario: ctx.scenario,
        story: ctx.story,
        userMessage: userText,
        history: historySnapshot,
      });
      if (thinkingEl) thinkingEl.remove();
      addResponseMsg(responseContainer, 'assistant', reply);
      const newHistory = history.concat([
        { role: 'user', content: userText },
        { role: 'assistant', content: reply },
      ]);
      historyMap.set(key, newHistory);
    } catch (err) {
      if (thinkingEl) thinkingEl.remove();
      console.error('[StoryChat] /api/story-chat 호출 실패', { provider: apiConfig.provider, error: err });
      addResponseMsg(responseContainer, 'assistant', `오류가 발생했습니다 (${apiConfig.provider}): ${err.message}`, 'error');
    } finally {
      // 같은 스토리가 여전히 활성이면 입력 재활성화
      if (activeStoryKey === key && apiConfig) {
        barSendBtn.disabled = false;
        barInputEl.disabled = false;
        barInputEl.focus();
      }
    }
  }

  // ── Public API: mountInputBar (페이지 1회) ─────────────────
  function mountInputBar(container, options = {}) {
    // P7-A-5.1: 방어적 폴백 — container 가 없거나 invalid 면 자동 생성.
    // HTML 파싱 순서 / DOMContentLoaded 타이밍 이슈로 호출자가 div 를 못 찾는
    // 경우라도 sticky bar 가 누락되지 않도록 보장. 조용한 실패 금지 — warn 로그.
    if (!container || !(container instanceof HTMLElement)) {
      console.warn('[StoryChat] mountInputBar: container missing or invalid, creating fallback');
      container = document.createElement('div');
      container.id = 'global-storychat-bar';
      container.setAttribute('aria-label', '스토리 채팅 입력 바');
      document.body.appendChild(container);
    }
    injectStyles();
    container.classList.add('storychat-bar');
    container.innerHTML = buildBarHTML();
    barEl = container;
    barNoauthEl = container.querySelector('[data-bar-noauth]');
    barHeaderEl = container.querySelector('[data-bar-context]');
    barProviderEl = container.querySelector('[data-bar-provider]');
    barFormEl = container.querySelector('[data-bar-form]');
    barInputEl = container.querySelector('[data-bar-input]');
    barSendBtn = container.querySelector('[data-bar-send]');
    barPresetsEl = container.querySelector('[data-bar-presets]');

    document.body.classList.add('has-storychat-bar');

    apiConfig = loadApiConfig();
    refreshInputBarLabel();
    refreshAllToggles();

    barFormEl.addEventListener('submit', e => {
      e.preventDefault();
      const text = barInputEl.value.trim();
      if (text) send(text);
    });
    barInputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = barInputEl.value.trim();
        if (text) send(text);
      }
    });
    barPresetsEl.addEventListener('click', e => {
      const btn = e.target.closest('.storychat-bar-preset');
      if (!btn || barInputEl.disabled) return;
      const prompt = btn.dataset.prompt;
      if (prompt) send(prompt);
    });

    // 다른 탭/창에서 BYOK 키 변경 감지
    window.addEventListener('storage', e => {
      if (!e.key || STORAGE_KEYS.includes(e.key)) {
        apiConfig = loadApiConfig();
        refreshInputBarLabel();
        refreshAllToggles();
      }
    });
  }

  // ── Public API: mountResponseArea (각 카드별 1회) ──────────
  function mountResponseArea(container, scenarioNo, storyNo) {
    if (!container) return;
    injectStyles();
    container.classList.add('storychat-response');
    const key = storyKeyOf(scenarioNo, storyNo);
    responseAreas.set(key, container);
    const history = historyMap.get(key) || [];
    renderResponseFromHistory(container, history);
  }

  // ── Public API: activate (스토리 컨텍스트 전환) ────────────
  function activate(scenarioNo, storyNo, scenario, story) {
    const key = storyKeyOf(scenarioNo, storyNo);
    activeStoryKey = key;
    const responseContainer = responseAreas.get(key) || null;
    activeContext = { scenarioNo, storyNo, scenario, story, responseContainer };
    apiConfig = loadApiConfig(); // 활성화 직전 재확인 (같은 탭 내 변경 대응)
    refreshInputBarLabel();
    refreshAllToggles();
    if (apiConfig && barInputEl) {
      // 입력창 활성 시 자동 포커스 (모바일 키보드 트리거)
      try { barInputEl.focus({ preventScroll: true }); } catch { barInputEl.focus(); }
    }
  }

  // ── Public API: deactivate ─────────────────────────────────
  function deactivate() {
    activeStoryKey = null;
    activeContext = null;
    refreshInputBarLabel();
    refreshAllToggles();
  }

  function isAuthenticated() {
    return !!apiConfig;
  }

  // ── 글로벌 노출 ────────────────────────────────────────────
  window.StoryChat = {
    mountInputBar,
    mountResponseArea,
    activate,
    deactivate,
    refreshAllToggles,
    isAuthenticated,
  };
})();
