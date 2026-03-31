import { create } from "zustand";

export type ProblemStatus = "new" | "review" | "mastered";
export type ReviewDifficulty = "easy" | "medium" | "hard";

export interface ReviewHistoryItem {
  id: string;
  reviewedAt: string;
  difficulty: ReviewDifficulty;
}

export interface ProblemRecord {
  id: string;
  title: string;
  platform: string;
  problemNumber: string;
  problemUrl: string;

  code: string;
  language: string;
  runtimes: string[];

  algorithms: string[];
  summary: string;
  blockedReason: string;
  reviewHint: string;
  isPriorityReview: boolean;

  status: ProblemStatus;
  reviewCount: number;
  reviewHistory: ReviewHistoryItem[];

  createdAt: string;
  updatedAt: string;
}

export interface ProblemFormValues {
  title: string;
  platform: string;
  problemNumber: string;
  problemUrl: string;

  code: string;
  language: string;
  runtimes: string[];

  algorithms: string[];
  summary: string;
  blockedReason: string;
  reviewHint: string;
  isPriorityReview: boolean;
}

interface ProblemStore {
  problems: ProblemRecord[];
  addProblem: (payload: ProblemFormValues) => void;
  updateProblem: (id: string, payload: ProblemFormValues) => void;
  reviewProblem: (id: string, difficulty: ReviewDifficulty) => void;
  deleteProblem: (id: string) => void;
  getProblemById: (id: string) => ProblemRecord | undefined;
}

const STORAGE_KEY = "algonote-problems";

const loadProblems = (): ProblemRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error("problems load failed", error);
    return [];
  }
};

const saveProblems = (problems: ProblemRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
  } catch (error) {
    console.error("problems save failed", error);
  }
};

const normalizeList = (value: string[] | string) => {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const useProblemStore = create<ProblemStore>((set, get) => ({
  problems: loadProblems(),

  addProblem: (payload) => {
    const now = new Date().toISOString();

    const newProblem: ProblemRecord = {
      id: crypto.randomUUID(),
      title: payload.title.trim(),
      platform: payload.platform.trim(),
      problemNumber: payload.problemNumber.trim(),
      problemUrl: payload.problemUrl.trim(),

      code: payload.code,
      language: payload.language.trim(),
      runtimes: normalizeList(payload.runtimes),

      algorithms: normalizeList(payload.algorithms),
      summary: payload.summary.trim(),
      blockedReason: payload.blockedReason.trim(),
      reviewHint: payload.reviewHint.trim(),
      isPriorityReview: payload.isPriorityReview,

      status: "new",
      reviewCount: 0,
      reviewHistory: [],

      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      const nextProblems = [newProblem, ...state.problems];
      saveProblems(nextProblems);
      return { problems: nextProblems };
    });
  },

  updateProblem: (id, payload) => {
    set((state) => {
      const nextProblems = state.problems.map((problem) => {
        if (problem.id !== id) return problem;

        return {
          ...problem,
          title: payload.title.trim(),
          platform: payload.platform.trim(),
          problemNumber: payload.problemNumber.trim(),
          problemUrl: payload.problemUrl.trim(),

          code: payload.code,
          language: payload.language.trim(),
          runtimes: normalizeList(payload.runtimes),

          algorithms: normalizeList(payload.algorithms),
          summary: payload.summary.trim(),
          blockedReason: payload.blockedReason.trim(),
          reviewHint: payload.reviewHint.trim(),
          isPriorityReview: payload.isPriorityReview,

          updatedAt: new Date().toISOString(),
        };
      });

      saveProblems(nextProblems);
      return { problems: nextProblems };
    });
  },

  reviewProblem: (id, difficulty) => {
    set((state) => {
      const nextProblems: ProblemRecord[] = state.problems.map((problem) => {
        if (problem.id !== id) return problem;

        const nextStatus: ProblemStatus =
          difficulty === "easy" ? "mastered" : "review";

        return {
          ...problem,
          status: nextStatus,
          reviewCount: problem.reviewCount + 1,
          reviewHistory: [
            {
              id: crypto.randomUUID(),
              reviewedAt: new Date().toISOString(),
              difficulty,
            },
            ...problem.reviewHistory,
          ],
          updatedAt: new Date().toISOString(),
        };
      });

      saveProblems(nextProblems);
      return { problems: nextProblems };
    });
  },

  deleteProblem: (id) => {
    set((state) => {
      const nextProblems = state.problems.filter(
        (problem) => problem.id !== id,
      );
      saveProblems(nextProblems);
      return { problems: nextProblems };
    });
  },

  getProblemById: (id) => {
    return get().problems.find((problem) => problem.id === id);
  },
}));
