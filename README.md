# (가상) 한빛상사 인사·총무 교육용 앱 — erp_demo

인사·총무 담당자 교육용 실습 앱입니다.
**설치·로그인·서버 없이** 브라우저만으로 돌아가는 정적(static) 사이트라,
Vercel에 그대로 올리면 바로 배포됩니다.

> ⚠️ **교육용 가상 자료입니다.** 회사·사원·급여액은 전부 지어낸 것이고,
> 접근 통제·암호화·감사 로그가 없습니다. **실제 인사정보를 입력하지 마세요.**

---

## 폴더 구조

```
erp_demo/
├── index.html      ← 시작 페이지 (배포 주소 첫 화면)
├── app.html        ← 메인 앱 (화면 15개 + AI 연동 테스트 · 실습 과제 15개)
├── api/
│   └── gemini.js   ← Gemini 호출 서버리스 함수 (API 키를 숨겨주는 역할)
├── data/
│   └── 가상_인사총무.json     샘플 데이터 (직원 10 · 휴가 6 · 급여 12)
├── docs/           기획서 · PRD · 강사 가이드 · 확인 기록 등
│   └── 화면/       테스트 스크린샷
├── vercel.json     Vercel 배포 설정
├── .env.example    환경변수 예시 (키 값 없음)
├── .gitignore
└── .vercelignore
```

---

## 로컬에서 확인하기

`index.html`을 더블클릭하면 끝입니다. 별도 서버가 필요 없습니다.

---

## Vercel 배포 방법

### 방법 1 — GitHub 연동 (권장, 한 번만 설정하면 자동 배포)

1. 이 폴더를 GitHub 저장소에 올린다.
   ```bash
   git remote add origin https://github.com/<본인계정>/erp_demo.git
   git push -u origin main
   ```
2. [vercel.com](https://vercel.com) 로그인 → **Add New… → Project**
3. 방금 올린 `erp_demo` 저장소를 **Import**
4. 설정은 **손대지 않고** 그대로 둔다.
   - Framework Preset: `Other`
   - Build Command: **비움**
   - Output Directory: **비움**
   - Install Command: **비움**
   
   → 정적 사이트라 빌드 과정이 아예 필요 없습니다.
5. **Deploy** 클릭 → 1분 내 `https://erp-demo-xxxx.vercel.app` 주소가 나옵니다.

이후에는 `git push` 할 때마다 Vercel이 알아서 다시 배포합니다.

### 방법 2 — CLI로 바로 올리기

```bash
npm i -g vercel
vercel        # 미리보기 배포
vercel --prod # 실제 배포
```

---

## 배포 후 주소

| 주소 | 내용 |
|---|---|
| `/` | 시작 페이지 |
| `/app` | 메인 앱 (`app.html`) |
| `/data/가상_인사총무.json` | 샘플 데이터 |
| `/docs/PRD.md` | 문서류 |

`vercel.json`의 `cleanUrls` 설정 때문에 `.html`이 주소에서 자동으로 빠집니다.

---

## 배포 설정에 들어간 것 (`vercel.json`)

| 설정 | 하는 일 |
|---|---|
| `cleanUrls` | 주소에서 `.html` 확장자를 감춥니다 (`/app.html` → `/app`) |
| `.md` → `text/plain; charset=utf-8` | 문서를 브라우저에서 **바로 열리게** 하고 한글이 깨지지 않게 합니다 |
| `.json` → `application/json; charset=utf-8` | 샘플 데이터 한글 깨짐 방지 |
| 보안 헤더 3종 | `nosniff` · `SAMEORIGIN` · `Referrer-Policy` |


---

## AI(Gemini) 연동 테스트

앱 왼쪽 메뉴 맨 아래 **`시스템 → AI 연동 테스트`** 화면에서
Gemini API가 제대로 붙었는지 버튼 두 번으로 확인할 수 있습니다.

### 구조 — 왜 이렇게 만들었나

```
브라우저(app.html)  →  /api/gemini (서버)  →  Google Gemini
                          ↑
                    API 키는 여기에만 있음
```

앱 HTML에 키를 적으면 **"페이지 소스 보기"로 누구나 키를 훔쳐볼 수 있습니다.**
이 저장소는 공개(public)라 더 위험합니다.
그래서 키는 서버 환경변수에만 두고, 서버가 대신 호출하도록 만들었습니다.
**HTML과 GitHub 저장소 어디에도 키가 들어 있지 않습니다.**

### 1) 키 발급

https://aistudio.google.com/apikey 에서 무료로 발급받습니다.

### 2) Vercel에 키 등록 (배포용)

Vercel 프로젝트 → **Settings → Environment Variables**

| Name | Value |
|---|---|
| `GEMINI_API_KEY` | 발급받은 키 |
| `GEMINI_MODEL` | (선택) 비우면 `gemini-2.0-flash` |

> 등록한 뒤 **Deployments → 최신 배포 → Redeploy** 를 눌러야 반영됩니다.
> 환경변수는 배포 시점에 주입되기 때문입니다.

### 3) 로컬에서 테스트 (선택)

`.env.local` 파일에 키를 넣고 아래로 실행합니다.

```bash
npm i -g vercel
vercel dev        # http://localhost:3000
```

> `index.html`을 **더블클릭해서 열면 AI 기능은 동작하지 않습니다.**
> 서버가 없어서 `/api/gemini`를 부를 수 없기 때문입니다. 이때 앱은
> "서버 함수에 닿지 못했습니다"라는 안내를 보여줍니다 — 고장이 아닙니다.

### 확인 순서

1. `1단계 · 연결 상태` → **[연결 상태 확인]** 클릭
   → `✔ API 키가 서버에 설정돼 있습니다` 가 나오면 키 등록 성공
2. `2단계 · 실제로 물어보기` → **[① 연결 확인]** 클릭 → **[AI에게 보내기]**
   → `✔ 성공` 과 함께 답변이 나오면 연동 완료

### 실패했을 때

| 화면 메시지 | 원인과 해결 |
|---|---|
| 서버 함수에 닿지 못했습니다 | 파일을 그냥 연 상태. Vercel 주소나 `vercel dev`로 접속 |
| API 키가 없습니다 | Vercel 환경변수 미등록, 또는 등록 후 Redeploy 안 함 |
| API 키가 잘못됐거나… (400/403) | 키를 잘못 붙여넣음. 앞뒤 공백·따옴표 확인 |
| 모델 이름을 찾을 수 없습니다 (404) | `GEMINI_MODEL` 값을 지우고 기본값 사용 |
| 호출 한도를 초과했습니다 (429) | 무료 한도 초과. 잠시 뒤 재시도 |

### 개인정보 주의

이 화면은 **입력칸에 직접 쓴 문장만** 전송합니다.
사원명부·급여 같은 앱 데이터는 자동으로 보내지 않습니다.
가상 자료라도 습관을 들이는 차원에서, **실제 개인정보는 입력하지 마세요.**

---

## 주의

- 입력한 내용은 **각자 브라우저에만** 저장됩니다(localStorage). 서버로 전송되지 않고, 다른 사람에게 보이지 않습니다.
- 배포 주소는 누구나 열 수 있습니다. 교육생만 보게 하려면 Vercel 프로젝트 설정에서
  **Deployment Protection**(비밀번호 보호)을 켜세요.
- `미사용/` 폴더는 git·배포 양쪽에서 제외됩니다.

---

기준일 2026-09-14 고정 · 앱 v1.0 · 실존하는 인물·법인과 무관합니다.
