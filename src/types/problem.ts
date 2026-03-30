export type ProblemStatus = "new" | "review" | "mastered";
export type ReviewResult = "remembered" | "vague" | "forgot";

export type ProblemLanguage = "javascript" | "typescript" | "python" | "java";
export type ProblemRuntime = "nodejs";

export interface ReviewHistoryItem {
  id: string;
  reviewedAt: string;
  result: ReviewResult;
}

export interface ProblemRecord {
  id: string;
  title: string;
  platform: "baekjoon" | "programmers" | "etc";
  problemNumber?: string;
  problemUrl?: string;

  code: string;
  language: ProblemLanguage;
  runtimes: ProblemRuntime[];

  algorithms: string[];
  summary: string;
  blockedReason: string;
  reviewHint: string;

  status: ProblemStatus;
  reviewCount: number;
  lastReviewedAt?: string;
  reviewHistory: ReviewHistoryItem[];

  createdAt: string;
  updatedAt: string;
}
