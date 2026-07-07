# TinyWords 🐣

영어 유치원에 다니는 아이(5~7세)가 **잘 안 외워지는 단어 / 시험에서 틀린 단어**를
등록해두고, **게임으로 재미있게 복습**하고 **간단한 테스트**로 확인하는 PWA.

- **스택**: Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase · PWA · Vercel
- 상세 기획은 [`docs/PLANNING.md`](docs/PLANNING.md), 개발 규칙은 `.cursor/rules/` 참고.

## 주요 기능 (현재 구현된 1차 슬라이스)

- 부모 이메일 로그인/회원가입 (Supabase Auth)
- 아이 프로필 생성/선택 (한 계정에 여러 아이)
- 부모 모드 **PIN 잠금** — 단어 관리 · 통계 · 설정
- 단어 CRUD (영어/대표뜻/추가뜻/예문/이모지/이미지/카테고리)
- 게임 3종: 카드 뒤집기 · 뜻 맞히기 · 듣고 고르기 (TTS 발음)
- 테스트 모드 (문항 수 5~10 설정) → 채점 · 오답 자동 기록
- 통계: 자주 틀리는 단어 · 최근 테스트 · 숙련도(연속 3회 정답 시 ⭐)
- 설정: 테스트 문항 수, 세션 단어 수, 원어민 음성/속도/톤
- 설치형 PWA (manifest + service worker)

> 이후 확장 예정: 스펠링 빈칸, 그림 보고 단어 맞히기, 문장 빈칸, 발음 따라 말하기.

## 로컬 실행

### 1. 사전 준비

- Node.js 18+ (이 저장소는 Node 26에서 개발)
- Supabase 프로젝트 (무료 티어 가능)

### 2. Supabase 설정

1. [supabase.com](https://supabase.com) 에서 프로젝트 생성.
2. **SQL Editor** 에 [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) 내용을
   붙여넣고 실행 (테이블 · RLS · 이미지 스토리지 버킷 생성).
3. **Authentication > Providers > Email** 활성화.
   - 빠른 테스트를 원하면 **"Confirm email" 을 꺼두면** 가입 즉시 로그인됩니다.
4. **Project Settings > API** 에서 `Project URL` 과 `anon public` 키 복사.

### 3. 환경변수

`.env.local.example` 를 복사해 `.env.local` 을 만들고 값을 채웁니다.

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://<프로젝트-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
```

### 4. 설치 & 실행

```bash
npm install
npm run dev       # http://localhost:3000
```

## Vercel 배포

1. 이 저장소를 GitHub 에 푸시.
2. [vercel.com](https://vercel.com) 에서 New Project → 저장소 임포트.
3. **Environment Variables** 에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가.
4. Deploy. (프레임워크는 Next.js 로 자동 감지)
5. 배포된 도메인을 Supabase **Authentication > URL Configuration** 의
   Site URL / Redirect URLs 에 추가.

## 첫 사용 순서

1. 회원가입(부모 이메일) → 아이 프로필 만들기.
2. ⚙️(부모 모드) → PIN 4자리 설정 → 단어 등록.
3. 아이 홈에서 "공부하기" 또는 "시험 보기".

## 프로젝트 구조

```
app/            # 라우트 (로그인/프로필/홈/study/test/parent)
components/      # 재사용 UI (게임, 스피커 버튼 등)
lib/             # supabase 클라이언트, TTS, 게임 로직, 데이터 접근
types/           # 공용 타입
supabase/        # DB 마이그레이션 SQL
public/          # PWA manifest, service worker, 아이콘
docs/PLANNING.md # 상세 기획서
```
