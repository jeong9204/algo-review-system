# Data Model Notes

AlgoNote는 단순 저장 앱이 아니라 회상 기반 복습 흐름과 추천 확장을 함께 고려합니다.  
그래서 Firestore에는 "지금 화면에 보이는 값"뿐 아니라, 나중에 추천과 통계에 활용할 수 있는 형태로 데이터를 일관되게 쌓는 것이 중요합니다.

## 1. Firestore 문서 스키마 초안

### 사용자별 문제 문서

```text
users/{uid}/problems/{problemId}
```

권장 필드 예시:

```json
{
  "id": "problem_123",
  "title": "DFS와 BFS",
  "platform": "baekjoon",
  "problemNumber": "1260",
  "problemUrl": "https://www.acmicpc.net/problem/1260",
  "language": "javascript",
  "runtimes": ["Node.js"],
  "algorithms": ["bfs", "graph"],
  "summary": "인접 리스트를 만들고 방문 순서에 맞춰 탐색한다.",
  "blockedReason": "방문 배열 초기화 타이밍을 놓쳤다.",
  "reviewHint": "인접 리스트 정렬과 방문 체크 순서를 먼저 떠올리기",
  "isPriorityReview": true,
  "status": "review",
  "reviewCount": 3,
  "lastReviewDifficulty": "medium",
  "lastReviewedAt": "2026-04-07T12:00:00.000Z",
  "createdAt": "2026-04-01T10:00:00.000Z",
  "updatedAt": "2026-04-07T12:00:00.000Z"
}
```

### 문제별 복습 이력

```text
users/{uid}/problems/{problemId}/reviewHistory/{reviewId}
```

권장 필드 예시:

```json
{
  "difficulty": "easy",
  "reviewedAt": "2026-04-07T12:00:00.000Z"
}
```

이렇게 나누면:

- 문제 문서에는 최신 복습 상태와 요약 정보
- `reviewHistory`에는 복습 로그

를 각각 저장할 수 있어, 조회와 통계 계산이 쉬워집니다.

## 2. 알고리즘 태그 정규화 규칙

추천 기능에서 가장 중요한 건 알고리즘 태그가 섞이지 않는 것입니다.

권장 규칙:

- 문자열 하나가 아니라 배열로 저장
- 저장값은 가능하면 소문자로 통일
- 쉼표 입력값은 저장 전에 trim 처리
- 동의어는 하나로 고정
- 화면 표시용 한글/영문 라벨은 저장값과 분리

예시:

- 저장값: `["bfs", "graph"]`
- 화면 표시: `BFS`, `그래프`

추천용으로 먼저 통일해두면 좋은 태그 예시:

- `dfs`
- `bfs`
- `graph`
- `tree`
- `dp`
- `greedy`
- `binary-search`
- `implementation`
- `simulation`
- `string`
- `math`

## 3. 추천용으로 미리 넣으면 좋은 필드

추천을 위해 나중에 다시 계산하지 않도록, 아래 값은 미리 문제 문서에 두는 것이 좋습니다.

- `algorithms`
  같은 알고리즘 분류 추천에 사용
- `reviewCount`
  자주 복습한 문제 / 덜 본 문제 구분
- `lastReviewDifficulty`
  최근 체감 난이도 기반 추천
- `lastReviewedAt`
  오래 안 본 문제 추천
- `isPriorityReview`
  사용자가 직접 중요하다고 표시한 문제 우선 추천
- `platform`
  플랫폼별 추천 필터
- `problemNumber`
  문제 식별 및 중복 관리

## 추천 확장 단계

### 1차

내가 저장한 문제 안에서 추천

- 같은 알고리즘 분류 문제 추천
- 오래 안 본 문제 추천
- 최근 `hard`였던 문제 우선 복습

### 2차

전체 사용자 데이터 기반 통계 추천

- 많이 저장된 문제
- 많이 어려워한 문제
- 알고리즘별 자주 복습되는 문제

### 3차

개인화 추천

- 나와 비슷한 패턴의 사용자가 자주 같이 보는 문제
- 특정 알고리즘 학습 흐름에 맞는 다음 문제

## 운영 메모

- 날짜 필드는 ISO string 또는 Firestore Timestamp 중 하나로 통일해야 함
- `platform`, `language`, `difficulty`, `status`는 enum처럼 고정값으로 유지하는 것이 좋음
- 추천 계산이 무거워지면, 나중에는 별도 집계 컬렉션이나 서버 로직을 두는 것이 안전함
