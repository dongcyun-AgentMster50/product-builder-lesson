/**
 * Story Chat Module — selected story 컨텍스트 기반 BYOK 채팅
 *
 * Usage:
 *   import { mountStoryChat } from './js/story-chat.js'
 *   // or via <script src="./js/story-chat.js"></script> then window.StoryChat.mount(...)
 *
 * mount({
 *   container: HTMLElement,         // 채팅 UI를 붙일 부모 노드
 *   scenario: { title, category },  // 시나리오 메타
 *   story: { title, content, story_no }, // 선택된 스토리
 *   theme: 'light' | 'dark',
 * })
 *
 * BYOK 키 우선순위:
 *   1) localStorage 'st_api_config' (v2 형식: { provider, key })
 *   2) localStorage 'userApiKey_v2' (v1 base64 인코딩, OpenAI로 가정)
 */
(function () {
  'use strict';

  const PROVIDER_LABEL = {
    openai: 'OpenAI · gpt-4o-mini',
    anthropic: 'Anthropic · Claude Sonnet',
    gemini: 'Google · Gemini Flash',
  };

  // ── 키 로드 헬퍼 ───────────────────────────────────────────
  function loadApiConfig() {
    // v2 형식
    try {
      const raw = localStorage.getItem('st_api_config');
      if (raw) {
        const cfg = JSON.parse(raw);
        if (cfg && cfg.provider && cfg.key) return { provider: cfg.provider, key: cfg.key };
      }
    } catch (e) { /* fall through */ }

    // v1 형식 (base64 인코딩, OpenAI 가정)
    try {
      const encoded = localStorage.getItem('userApiKey_v2');
      if (encoded) {
        const decoded = decodeURIComponent(escape(atob(encoded)));
        if (decoded) return { provider: 'openai', key: decoded };
      }
    } catch (e) { /* fall through */ }

    return null;
  }

  // ── LLM 호출 라우터 ────────────────────────────────────────
  async function callLLM(provider, apiKey, systemPrompt, messages) {
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });
      if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text().catch(() => '')}`);
      const d = await res.json();
      return d.choices[0].message.content;
    }

    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 800,
          system: systemPrompt,
          messages: messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
        }),
      });
      if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text().catch(() => '')}`);
      const d = await res.json();
      return d.content[0].text;
    }

    if (provider === 'gemini') {
      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
        }),
      });
      if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text().catch(() => '')}`);
      const d = await res.json();
      return d.candidates[0].content.parts.map(p => p.text).join('');
    }

    throw new Error(`Unknown provider: ${provider}`);
  }

  // ── 시스템 프롬프트 빌더 ────────────────────────────────────
  function buildSystemPrompt(scenario, story) {
    return `당신은 Samsung SmartThings 마케팅 전략을 돕는 시나리오 큐레이터입니다.
사용자는 아래 SmartThings 시나리오와 스토리를 보고 더 깊이 파고들고 싶어합니다.

[시나리오]
- 카테고리: ${scenario.category || '(미정)'}
- 제목: ${scenario.title || ''}

[선택한 스토리]
- 번호: ${story.story_no || '?'}
- 제목: ${story.title || ''}
- 내용: ${story.content || ''}

당신의 역할:
1. 이 스토리를 출발점으로 삼아, 사용자가 매장·캠페인·고객 응대에서 바로 쓸 수 있는 형태로 확장하세요.
2. 페르소나 각색, 카피 변형, 추가 디바이스 제안, 매장 데모 스크립트, 광고 헤드라인 등 마케터에게 실용적인 답을 우선합니다.
3. 한국어로 답하고, 길어지면 불릿 또는 짧은 단락으로 정리합니다.
4. SmartThings 공식 톤 ("AI Home", "AI Living") 유지, 경쟁사 언급 금지.
5. 답변은 간결·구체·실행 가능하게.`;
  }

  // ── HTML 템플릿 ────────────────────────────────────────────
  function buildHTML(theme) {
    const t = theme === 'dark' ? 'dark' : 'light';
    return `
      <div class="storychat storychat-${t}">
        <div class="storychat-head">
          <div class="storychat-title">
            <span class="storychat-emoji">💬</span>
            <span>이 스토리로 더 파보기</span>
          </div>
          <div class="storychat-provider" data-storychat-provider>—</div>
        </div>
        <div class="storychat-presets" data-storychat-presets>
          <button type="button" class="storychat-preset" data-prompt="우리 매장 고객용으로 각색해 줘. 30초 안에 들려줄 수 있는 짧은 데모 스크립트로.">🛍 매장 데모용 30초 스크립트</button>
          <button type="button" class="storychat-preset" data-prompt="이 스토리를 신혼부부 페르소나에 맞춰 다시 써 줘. 감정 포인트를 강조해서.">💑 신혼 페르소나로 변환</button>
          <button type="button" class="storychat-preset" data-prompt="이 스토리에 추가하면 좋을 SmartThings 디바이스 3개를 추천해 줘. 왜 잘 어울리는지 한 줄씩.">🔌 추가 디바이스 3개 추천</button>
          <button type="button" class="storychat-preset" data-prompt="이 스토리를 인스타그램 카드뉴스 5장 분량의 카피로 만들어 줘.">📱 인스타 카피 5장</button>
        </div>
        <div class="storychat-log" data-storychat-log></div>
        <form class="storychat-form" data-storychat-form>
          <textarea class="storychat-input" data-storychat-input rows="2" placeholder="이 스토리에 대해 무엇이든 물어보세요. (예: 다른 톤으로 바꿔줘, 매장에서 어떻게 시연하지)"></textarea>
          <button type="submit" class="storychat-send" data-storychat-send>보내기</button>
        </form>
        <div class="storychat-foot">
          <span data-storychat-status>BYOK 키로 호출 · 본인 API 사용량으로 차감됩니다.</span>
        </div>
      </div>
    `;
  }

  // ── CSS 인젝션 (한 번만) ───────────────────────────────────
  function injectStyles() {
    if (document.getElementById('storychat-styles')) return;
    const css = `
      .storychat { margin-top: 14px; padding: 14px 16px; border-radius: 12px;
        font-family: inherit; font-size: 13px; }
      .storychat-light { background: #f7f8fa; border: 1px solid #e3e7ee; color: #15171a; }
      .storychat-dark  { background: #0e1230; border: 1px solid #1f2654; color: #e7eaf6; }
      .storychat-head { display:flex; align-items:center; justify-content:space-between;
        gap:10px; margin-bottom: 10px; }
      .storychat-title { display:flex; align-items:center; gap:6px; font-weight:600; font-size:13px; }
      .storychat-emoji { font-size: 14px; }
      .storychat-provider { font-size: 11px; opacity: 0.7; }
      .storychat-presets { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; }
      .storychat-preset { font-size:11px; padding:5px 9px; border-radius:14px;
        border:1px solid currentColor; background:transparent; color:inherit;
        cursor:pointer; opacity:0.85; font-family:inherit; transition: all 0.15s; }
      .storychat-preset:hover { opacity:1; transform: translateY(-1px); }
      .storychat-light .storychat-preset { border-color:#c9d0db; color:#1a3a8f; }
      .storychat-light .storychat-preset:hover { background:#eef1f6; }
      .storychat-dark  .storychat-preset { border-color:#3a4380; color:#aab3ff; }
      .storychat-dark  .storychat-preset:hover { background:#1a2050; }
      .storychat-log { display:flex; flex-direction:column; gap:8px; max-height: 320px;
        overflow-y:auto; margin-bottom:10px; padding:0 2px; }
      .storychat-msg { padding:9px 12px; border-radius:9px; font-size:12.5px; line-height:1.6;
        white-space: pre-wrap; word-break: break-word; }
      .storychat-light .storychat-msg.user { background:#1a3a8f; color:#fff; align-self:flex-end; max-width:85%; }
      .storychat-light .storychat-msg.assistant { background:#fff; border:1px solid #e3e7ee; color:#15171a; align-self:flex-start; max-width:95%; }
      .storychat-light .storychat-msg.error { background:#fef2f2; border:1px solid #fca5a5; color:#991b1b; }
      .storychat-dark  .storychat-msg.user { background:#3a4dff; color:#fff; align-self:flex-end; max-width:85%; }
      .storychat-dark  .storychat-msg.assistant { background:#1a1f48; border:1px solid #2a3170; color:#e7eaf6; align-self:flex-start; max-width:95%; }
      .storychat-dark  .storychat-msg.error { background:#3a1217; border:1px solid #8a1d2a; color:#fca5a5; }
      .storychat-msg.thinking { opacity:0.6; font-style: italic; }
      .storychat-form { display:flex; gap:8px; align-items:flex-end; }
      .storychat-input { flex:1; padding:9px 11px; border-radius:8px;
        border:1px solid #d0d4da; background:#fff; color:#15171a; font-family:inherit;
        font-size:12.5px; line-height:1.5; resize: vertical; min-height: 44px; }
      .storychat-dark .storychat-input { background:#0a0f2a; border-color:#2a3170; color:#e7eaf6; }
      .storychat-input:focus { outline:none; border-color:#1a3a8f; box-shadow: 0 0 0 3px rgba(26,58,143,0.15); }
      .storychat-send { padding:0 16px; height:44px; border-radius:8px; border:none;
        background:#1a3a8f; color:#fff; font-weight:600; font-size:12.5px; cursor:pointer;
        font-family:inherit; transition: all 0.15s; }
      .storychat-send:hover:not(:disabled) { background:#0f2766; }
      .storychat-send:disabled { opacity:0.5; cursor:not-allowed; }
      .storychat-foot { margin-top:8px; font-size:10.5px; opacity:0.65; }
      .storychat-foot a { color:inherit; text-decoration: underline; }
      .storychat-noauth { padding:12px; border-radius:8px; font-size:12px; line-height:1.6; }
      .storychat-light .storychat-noauth { background:#fff; border:1px dashed #c9d0db; color:#505864; }
      .storychat-dark  .storychat-noauth { background:#0a0f2a; border:1px dashed #2a3170; color:#aab3ff; }
      .storychat-noauth a { font-weight:600; color:#1a3a8f; }
      .storychat-dark .storychat-noauth a { color:#7fa3ff; }
    `;
    const style = document.createElement('style');
    style.id = 'storychat-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── 메인 mount ────────────────────────────────────────────
  function mount({ container, scenario, story, theme = 'light' }) {
    if (!container) return;
    injectStyles();
    container.innerHTML = buildHTML(theme);

    const config = loadApiConfig();
    const providerEl = container.querySelector('[data-storychat-provider]');
    const statusEl = container.querySelector('[data-storychat-status]');
    const formEl = container.querySelector('[data-storychat-form]');
    const inputEl = container.querySelector('[data-storychat-input]');
    const sendBtn = container.querySelector('[data-storychat-send]');
    const logEl = container.querySelector('[data-storychat-log]');
    const presetsEl = container.querySelector('[data-storychat-presets]');

    if (!config) {
      // BYOK 키 미설정 안내
      const themeClass = theme === 'dark' ? 'storychat-dark' : 'storychat-light';
      container.innerHTML = `
        <div class="storychat ${themeClass}">
          <div class="storychat-head">
            <div class="storychat-title"><span class="storychat-emoji">💬</span><span>이 스토리로 더 파보기</span></div>
          </div>
          <div class="storychat-noauth">
            BYOK API 키가 아직 설정되지 않았어요.<br>
            <a href="./index.html" target="_self">메인 화면으로 가서 AI 연결 설정</a> 또는
            <a href="./v2.html" target="_self">v2 빌더에서 키 등록</a> 후 다시 돌아오면 채팅이 활성화됩니다.
          </div>
        </div>
      `;
      return;
    }

    providerEl.textContent = PROVIDER_LABEL[config.provider] || config.provider;

    const messages = [];
    const systemPrompt = buildSystemPrompt(scenario, story);

    function addMsg(role, content, extraClass = '') {
      const el = document.createElement('div');
      el.className = `storychat-msg ${role} ${extraClass}`.trim();
      el.textContent = content;
      logEl.appendChild(el);
      logEl.scrollTop = logEl.scrollHeight;
      return el;
    }

    async function send(userText) {
      if (!userText) return;
      addMsg('user', userText);
      messages.push({ role: 'user', content: userText });
      inputEl.value = '';
      sendBtn.disabled = true;
      const thinkingEl = addMsg('assistant', '생각 중...', 'thinking');
      try {
        const reply = await callLLM(config.provider, config.key, systemPrompt, messages);
        thinkingEl.remove();
        addMsg('assistant', reply);
        messages.push({ role: 'assistant', content: reply });
      } catch (err) {
        thinkingEl.remove();
        addMsg('assistant', `오류가 발생했습니다: ${err.message}`, 'error');
      } finally {
        sendBtn.disabled = false;
        inputEl.focus();
      }
    }

    formEl.addEventListener('submit', e => {
      e.preventDefault();
      const text = inputEl.value.trim();
      if (text) send(text);
    });
    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = inputEl.value.trim();
        if (text) send(text);
      }
    });
    presetsEl.addEventListener('click', e => {
      const btn = e.target.closest('.storychat-preset');
      if (!btn) return;
      const prompt = btn.dataset.prompt;
      if (prompt) send(prompt);
    });
  }

  // ── 글로벌 노출 ────────────────────────────────────────────
  window.StoryChat = { mount };
})();
