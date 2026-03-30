import type { ProblemRecord } from "../types/problem";

const PROBLEM_RECORDS_KEY = "problem-records";

export function loadProblemRecords(): ProblemRecord[] {
  try {
    const stored = localStorage.getItem(PROBLEM_RECORDS_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error("문제 기록을 불러오지 못했어.", error);
    return [];
  }
}

export function saveProblemRecords(records: ProblemRecord[]) {
  try {
    localStorage.setItem(PROBLEM_RECORDS_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("문제 기록을 저장하지 못했어.", error);
  }
}
