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
├── app.html        ← 메인 앱 (화면 15개 · 실습 과제 15개)
├── data/
│   └── 가상_인사총무.json     샘플 데이터 (직원 10 · 휴가 6 · 급여 12)
├── docs/           기획서 · PRD · 강사 가이드 · 확인 기록 등
│   └── 화면/       테스트 스크린샷
├── vercel.json     Vercel 배포 설정
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

## 주의

- 입력한 내용은 **각자 브라우저에만** 저장됩니다(localStorage). 서버로 전송되지 않고, 다른 사람에게 보이지 않습니다.
- 배포 주소는 누구나 열 수 있습니다. 교육생만 보게 하려면 Vercel 프로젝트 설정에서
  **Deployment Protection**(비밀번호 보호)을 켜세요.
- `미사용/` 폴더는 git·배포 양쪽에서 제외됩니다.

---

기준일 2026-09-14 고정 · 앱 v1.0 · 실존하는 인물·법인과 무관합니다.
