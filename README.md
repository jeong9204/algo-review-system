# AlgoNote

알고리즘 문제를 단순히 저장하는 CRUD 앱이 아니라,
문제를 다시 떠올리고 회상하는 연습에 초점을 둔 복습 시스템입니다.

## 프로젝트 소개

알고리즘 문제는 한 번 풀었다고 끝나지 않습니다.
시간이 지나면 "어떻게 풀었는지", "왜 그 방식이었는지", "어디서 막혔는지"를 쉽게 잊게 됩니다.

AlgoNote는 이 지점을 해결하기 위해 만들었습니다.
문제의 정답 코드만 남기는 대신, 다음 복습 때 스스로 다시 회상할 수 있도록
핵심 아이디어, 막힌 포인트, 복습 힌트, 복습 상태를 함께 관리합니다.

## 핵심 기능

### 1. 복습용 문제 등록 / 수정

- 문제 제목, 플랫폼, 문제 번호, 링크 저장
- 언어 / 런타임 / 알고리즘 분류 저장
- 핵심 아이디어, 막힌 포인트, 복습 힌트 기록
- 복습 우선 문제 체크
- 문제 등록과 수정은 하나의 `ProblemFormPage + ProblemForm` 구조로 재사용

### 2. 회상 기반 복습 흐름

- 문제 상태를 `new / review / mastered`로 관리
- 복습 결과를 `easy / medium / hard` 기준으로 기록
- 복습할수록 상태와 히스토리가 누적

### 3. 문제 상세 페이지

- 저장한 문제 정보, 코드, 복습 메모 확인
- 생성일 / 수정일 / 런타임 / 최근 복습 기록 조회
- 수정 / 삭제 바로 수행 가능

### 4. 대시보드 시각화

- 총 문제 수 / 복습 필요 / 익숙해진 문제 / 복습 우선 문제 요약
- 문제 등록 활동을 잔디 스타일 히트맵으로 확인
- 최근 주차 기준으로 활동 밀도 시각화

## 화면 구성

- `Dashboard`
  회상 기반 복습 현황과 활동 잔디를 보여줍니다.
- `Problems`
  저장된 문제 목록과 상태, 핵심 아이디어를 확인합니다.
- `Problem Form`
  문제 등록 / 수정 폼입니다.
- `Problem Detail`
  문제 단건 상세 정보와 복습 메모를 확인합니다.
- `Review`
  복습이 필요한 문제를 빠르게 회상 점검합니다.

## 기술 스택

- React 19
- TypeScript
- Vite 5
- React Router DOM 7
- Zustand
- Firebase Auth
- Cloud Firestore
- Tailwind CSS 3
- localStorage

## 실행 방법

```bash
npm install
npm run dev
```

빌드:

```bash
npm run build
```

타입 체크:

```bash
npx tsc --noEmit -p tsconfig.app.json
```

## 프로젝트 구조

```bash
src/
├─ app/
│  └─ router.tsx
├─ entities/
│  └─ problem/
│     └─ model/
│        ├─ problemStore.ts
│        └─ types.ts
├─ features/
│  └─ problem/
│     └─ ui/
│        └─ ProblemForm.tsx
├─ pages/
│  ├─ DashboardPage.tsx
│  ├─ ProblemFormPage.tsx
│  ├─ ProblemsPage.tsx
│  ├─ ProblemDetailPage.tsx
│  ├─ ReviewPage.tsx
│  └─ RootLayout.tsx
└─ main.tsx
```

## 설계 포인트

- 단순 문제 저장보다 "다시 떠올릴 수 있는가"에 집중
- 문제 등록 / 수정 폼을 공용 컴포넌트로 유지
- 헤더 중심 네비게이션으로 흐름 통일
- 상세 페이지와 등록 페이지의 톤을 카드형 UI로 통일
- 상태 기반 복습 흐름과 활동 기록 시각화 결합

## 데이터 구조 메모

추천 기능과 복습 통계를 나중에 확장하기 위해, Firestore에는 가능한 한 같은 형식으로 데이터를 쌓는 것을 목표로 합니다.

### 1. Firestore 문서 스키마 초안

- 사용자별 문제 저장 경로
  `users/{uid}/problems/{problemId}`
- 문제별 복습 이력 경로
  `users/{uid}/problems/{problemId}/reviewHistory/{reviewId}`

문제 문서에는 아래 같은 필드를 일관되게 유지하는 것이 좋습니다.

- `platform`
  `baekjoon | programmers | etc`
- `language`
  `javascript | typescript | python | java`
- `algorithms`
  문자열 하나가 아니라 `string[]`
- `status`
  `new | review | mastered`
- `reviewCount`
  총 복습 횟수
- `lastReviewDifficulty`
  `easy | medium | hard`
- `lastReviewedAt`
  마지막 복습 시각
- `createdAt`, `updatedAt`
  날짜 기준 필드

### 2. 알고리즘 태그 정규화 규칙

- 알고리즘 분류는 배열로 저장
- 가능한 한 소문자 기준으로 통일
- 공백 제거 후 저장
- 동의어 표기는 하나로 고정
  예: `bfs`, `dfs`, `graph`, `dp`, `greedy`
- 화면 표시용 라벨은 저장값과 분리해서 나중에 매핑

예시:

```json
["bfs", "graph"]
```

### 3. 추천용으로 미리 넣으면 좋은 필드

- `algorithms`
- `reviewCount`
- `lastReviewDifficulty`
- `lastReviewedAt`
- `isPriorityReview`
- `platform`
- `problemNumber`

이 필드들이 쌓이면 나중에 다음과 같은 추천으로 확장하기 좋아집니다.

- 같은 알고리즘 기반 복습 문제 추천
- 오래 안 본 문제 추천
- 최근에 `애매함 / 모르겠음`으로 남긴 문제 우선 추천
- 전체 사용자 데이터 기반 통계 추천

상세 설계 메모는 [docs/data-model.md](/Users/jeong-yeji/algo-review-system/docs/data-model.md)에서 이어서 볼 수 있습니다.

## 앞으로 확장해볼 수 있는 방향

- 복습 우선 문제를 기반으로 한 별도 큐
- 망각 곡선 기반 복습 추천
- 코드 하이라이팅
- 복습 질문 자동 생성
- 활동 잔디를 등록 기준 / 복습 기준으로 전환하는 토글
