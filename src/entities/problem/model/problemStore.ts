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
  setProblems: (problems: ProblemRecord[]) => void;
  addProblem: (problem: ProblemRecord) => void;
  updateProblem: (problem: ProblemRecord) => void;
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

export const createProblemRecord = (
  payload: ProblemFormValues,
  currentProblem?: ProblemRecord,
): ProblemRecord => {
  const now = new Date().toISOString();

  return {
    id: currentProblem?.id ?? crypto.randomUUID(),
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
    status: currentProblem?.status ?? "new",
    reviewCount: currentProblem?.reviewCount ?? 0,
    reviewHistory: currentProblem?.reviewHistory ?? [],
    createdAt: currentProblem?.createdAt ?? now,
    updatedAt: now,
  };
};

export const useProblemStore = create<ProblemStore>((set, get) => ({
  problems: loadProblems(),

  setProblems: (problems) => {
    saveProblems(problems);
    set({ problems });
  },

  addProblem: (problem) => {
    set((state) => {
      const dedupedProblems = state.problems.filter(
        (item) => item.id !== problem.id,
      );
      const nextProblems = [problem, ...dedupedProblems];
      saveProblems(nextProblems);
      return { problems: nextProblems };
    });
  },

  updateProblem: (problem) => {
    set((state) => {
      const hasExistingProblem = state.problems.some(
        (item) => item.id === problem.id,
      );
      const mergedProblems = hasExistingProblem
        ? state.problems.map((item) => (item.id === problem.id ? problem : item))
        : [problem, ...state.problems];

      saveProblems(mergedProblems);
      return { problems: mergedProblems };
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
