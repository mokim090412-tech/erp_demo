/* =====================================================================
   Gemini 연동 테스트용 서버리스 함수  (Vercel Serverless Function)
   ---------------------------------------------------------------------
   왜 이 파일이 필요한가
     앱(app.html)에서 Gemini API 를 직접 부르면 안 된다. 이유가 두 가지다.
       1) 키 노출 — HTML 은 누구나 "페이지 소스 보기"로 읽을 수 있다.
                    이 저장소는 공개(public)라 키를 적는 순간 전 세계에 공개된다.
       2) CORS    — 브라우저가 구글 API 응답을 막는 경우가 있다.
     그래서 키는 Vercel 환경변수에만 두고, 이 함수가 대신 호출한다.
     브라우저는 이 함수(/api/gemini)만 부르므로 키를 절대 볼 수 없다.

   사용법
     GET  /api/gemini   → 키가 설정돼 있는지만 알려준다 (키 값은 안 돌려줌)
     POST /api/gemini   → { "prompt": "질문" } 을 보내면 Gemini 답변을 돌려준다

   환경변수
     GEMINI_API_KEY  (필수)  https://aistudio.google.com/apikey 에서 발급
     GEMINI_MODEL    (선택)  기본값 gemini-2.0-flash
   ===================================================================== */

const DEFAULT_MODEL = 'gemini-2.0-flash';
const MAX_PROMPT = 2000;      // 교육용 테스트라 길이를 넉넉히 제한
const TIMEOUT_MS = 20000;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  // ── 1. 상태 확인 (키 값은 절대 돌려주지 않는다) ──────────────────────
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      keyConfigured: Boolean(key),
      keyLength: key ? key.length : 0,   // 길이만 — 값은 노출 안 함
      model,
      message: key
        ? 'API 키가 설정돼 있습니다. 아래에서 실제 호출을 테스트해 보세요.'
        : 'API 키가 없습니다. Vercel 프로젝트 설정 → Environment Variables 에 GEMINI_API_KEY 를 추가하세요.',
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'GET 또는 POST 만 됩니다.' });
  }

  // ── 2. 키 확인 ──────────────────────────────────────────────────────
  if (!key) {
    return res.status(500).json({
      ok: false,
      error: 'GEMINI_API_KEY 환경변수가 없습니다.',
      hint: 'Vercel 프로젝트 → Settings → Environment Variables 에 추가한 뒤 다시 배포(Redeploy)하세요. 로컬에서는 .env.local 파일에 넣고 `vercel dev` 로 실행합니다.',
    });
  }

  // ── 3. 입력 검사 ────────────────────────────────────────────────────
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const prompt = (body && body.prompt ? String(body.prompt) : '').trim();

  if (!prompt) {
    return res.status(400).json({ ok: false, error: '질문(prompt)이 비어 있습니다.' });
  }
  if (prompt.length > MAX_PROMPT) {
    return res.status(400).json({ ok: false, error: `질문이 너무 깁니다. ${MAX_PROMPT}자 이내로 줄여주세요.` });
  }

  // ── 4. Gemini 호출 ──────────────────────────────────────────────────
  const started = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      signal: ctrl.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
      }),
    });

    const data = await r.json().catch(() => null);

    if (!r.ok) {
      // 구글이 준 에러 메시지를 그대로 전달하되, 키가 섞여 들어가지 않도록 잘라낸다
      const raw = (data && data.error && data.error.message) || `HTTP ${r.status}`;
      return res.status(r.status).json({
        ok: false,
        error: String(raw).replace(key, '***'),
        status: r.status,
        hint: r.status === 400 || r.status === 403
          ? 'API 키가 잘못됐거나, 키에 이 모델 사용 권한이 없을 수 있습니다.'
          : r.status === 404
            ? `모델 이름(${model})을 찾을 수 없습니다. GEMINI_MODEL 환경변수를 확인하세요.`
            : r.status === 429
              ? '호출 한도를 초과했습니다. 잠시 뒤 다시 시도하세요.'
              : undefined,
      });
    }

    const cand = data && data.candidates && data.candidates[0];
    const text = cand && cand.content && cand.content.parts
      ? cand.content.parts.map(p => p.text || '').join('').trim()
      : '';

    if (!text) {
      return res.status(502).json({
        ok: false,
        error: '응답은 받았지만 본문이 비어 있습니다.',
        finishReason: cand ? cand.finishReason : null,
      });
    }

    return res.status(200).json({
      ok: true,
      text,
      model,
      ms: Date.now() - started,
      usage: data.usageMetadata || null,
    });

  } catch (e) {
    const aborted = e && e.name === 'AbortError';
    return res.status(aborted ? 504 : 500).json({
      ok: false,
      error: aborted ? `응답이 ${TIMEOUT_MS / 1000}초 안에 오지 않았습니다.` : '호출 중 오류가 발생했습니다.',
      detail: aborted ? null : String(e && e.message || e).replace(key, '***'),
    });
  } finally {
    clearTimeout(timer);
  }
};
