import { create } from "zustand";
import type {
  ProblemRecord,
  ReviewResult,
  ProblemLanguage,
  ProblemRuntime,
} from "../types/problem";
import { loadProblemRecords, saveProblemRecords } from "../utils/storage";

export interface CreateProblemRecordInput {
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
}

interface ProblemStore {
  records: ProblemRecord[];
  addRecord: (input: CreateProblemRecordInput) => void;
  removeRecord: (id: string) => void;
  reviewRecord: (id: string, result: ReviewResult) => void;
}

export const useProblemStore = create<ProblemStore>((set) => ({
  records: loadProblemRecords(),

  addRecord: (input) =>
    set((state) => {
      const now = new Date().toISOString();

      const newRecord: ProblemRecord = {
        id: crypto.randomUUID(),
        title: input.title,
        platform: input.platform,
        problemNumber: input.problemNumber || "",
        problemUrl: input.problemUrl || "",
        code: input.code,
        language: input.language,
        runtimes: input.runtimes,
        algorithms: input.algorithms,
        summary: input.summary,
        blockedReason: input.blockedReason,
        reviewHint: input.reviewHint,
        status: "new",
        reviewCount: 0,
        lastReviewedAt: undefined,
        reviewHistory: [],
        createdAt: now,
        updatedAt: now,
      };

      const nextRecords: ProblemRecord[] = [newRecord, ...state.records];
      saveProblemRecords(nextRecords);

      return { records: nextRecords };
    }),

  removeRecord: (id) =>
    set((state) => {
      const nextRecords: ProblemRecord[] = state.records.filter(
        (record) => record.id !== id,
      );

      saveProblemRecords(nextRecords);

      return { records: nextRecords };
    }),

  reviewRecord: (id, result) =>
    set((state) => {
      const nextRecords: ProblemRecord[] = state.records.map((record) => {
        if (record.id !== id) return record;

        const nextStatus = result === "remembered" ? "mastered" : "review";

        return {
          ...record,
          status: nextStatus,
          reviewCount: record.reviewCount + 1,
          lastReviewedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reviewHistory: [
            {
              id: crypto.randomUUID(),
              reviewedAt: new Date().toISOString(),
              result,
            },
            ...record.reviewHistory,
          ],
        };
      });

      saveProblemRecords(nextRecords);

      return { records: nextRecords };
    }),
}));
