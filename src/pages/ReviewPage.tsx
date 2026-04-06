import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  createReviewedProblem,
  useProblemStore,
} from "@/entities/problem/model/problemStore";
import { auth, db } from "@/shared/config/firebase";

function getReviewSaveErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === "permission-denied") {
      return "복습 결과를 저장할 권한이 없어요. Firestore 보안 규칙을 확인해주세요.";
    }

    if (error.code === "unauthenticated") {
      return "로그인이 만료됐어요. 다시 로그인한 뒤 복습 결과를 저장해주세요.";
    }

    return `복습 결과 저장 실패: ${error.code}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "복습 결과를 저장하는 중 문제가 발생했습니다.";
}

function getPlatformLabel(platform: string) {
  switch (platform) {
    case "baekjoon":
      return "백준";
    case "programmers":
      return "프로그래머스";
    case "etc":
      return "기타";
    default:
      return platform;
  }
}

function getProgressPercent(completedCount: number, totalCount: number) {
  if (totalCount === 0) return 0;
  return Math.min(100, Math.round((completedCount / totalCount) * 100));
}

export default function ReviewPage() {
  const [savingProblemId, setSavingProblemId] = useState<string | null>(null);
  const [sessionProblemIds, setSessionProblemIds] = useState<string[]>([]);
  const [sessionTotalCount, setSessionTotalCount] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [isSolutionVisible, setIsSolutionVisible] = useState(false);

  const problems = useProblemStore((state) => state.problems);
  const updateProblem = useProblemStore((state) => state.updateProblem);

  const reviewTargets = useMemo(
    () =>
      problems.filter(
        (problem) => problem.status === "new" || problem.status === "review",
      ),
    [problems],
  );

  useEffect(() => {
    if (!sessionStarted && reviewTargets.length > 0) {
      setSessionProblemIds(reviewTargets.map((problem) => problem.id));
      setSessionTotalCount(reviewTargets.length);
      setSessionStarted(true);
    }
  }, [reviewTargets, sessionStarted]);

  const currentProblemId = sessionProblemIds[0];
  const currentProblem = currentProblemId
    ? problems.find((problem) => problem.id === currentProblemId)
    : undefined;

  const completedCount = sessionTotalCount - sessionProblemIds.length;
  const currentStep =
    currentProblem && sessionTotalCount > 0
      ? completedCount + 1
      : sessionTotalCount;
  const progressPercent = getProgressPercent(completedCount, sessionTotalCount);

  const handleReview = async (
    problemId: string,
    difficulty: "easy" | "medium" | "hard",
  ) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("복습 결과를 저장하려면 먼저 Google 로그인이 필요합니다.");
      return;
    }

    const targetProblem = problems.find((problem) => problem.id === problemId);

    if (!targetProblem) {
      alert("복습할 문제를 찾을 수 없습니다.");
      return;
    }

    const reviewedProblem = createReviewedProblem(targetProblem, difficulty);
    setSavingProblemId(problemId);

    try {
      await setDoc(
        doc(db, "users", currentUser.uid, "problems", reviewedProblem.id),
        {
          ...reviewedProblem,
          userId: currentUser.uid,
          syncedAt: serverTimestamp(),
        },
        { merge: true },
      );

      updateProblem(reviewedProblem);
      setSessionProblemIds((currentIds) =>
        currentIds.filter((id) => id !== problemId),
      );
      setIsHintVisible(false);
      setIsSolutionVisible(false);
    } catch (error) {
      console.error("review save failed", error);
      alert(getReviewSaveErrorMessage(error));
    } finally {
      setSavingProblemId(null);
    }
  };

  const handleShowHint = () => {
    setIsHintVisible(true);
  };

  const handleShowSolution = () => {
    setIsHintVisible(true);
    setIsSolutionVisible(true);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-line-100 bg-white px-6 py-7 text-ink-950 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-ink-950 dark:text-white dark:shadow-[0_24px_70px_rgba(2,6,23,0.38)] sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium tracking-[0.18em] text-accent-600 dark:text-teal-200 uppercase">
              Recall Check
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950 dark:text-white sm:text-4xl">
              복습하기
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500 dark:text-slate-300">
              문제를 한 번에 하나씩 보며 회상하고, 힌트와 정리를 단계적으로 열어
              본 뒤 최종 난도를 기록해보세요.
            </p>
          </div>

          <div className="min-w-[180px] rounded-[24px] border border-line-100 bg-surface-50 px-5 py-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-medium tracking-[0.14em] text-ink-500 uppercase dark:text-slate-400">
              진행 현황
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 dark:text-slate-50">
              {sessionTotalCount === 0
                ? "0 / 0"
                : `${currentStep} / ${sessionTotalCount}`}
            </p>
            <div className="mt-3 h-2 rounded-full bg-line-100 dark:bg-slate-800">
              <div
                className="h-2 rounded-full bg-accent-600 transition-all dark:bg-teal-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {!sessionStarted && reviewTargets.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-line-200 bg-white/70 p-10 text-center backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
          <p className="text-base font-medium text-ink-950 dark:text-slate-50">
            지금 복습할 문제가 없어.
          </p>
          <p className="mt-3 text-sm text-ink-500 dark:text-slate-300">
            새 문제를 등록하거나, 아직 복습이 필요한 문제가 생기면 이곳에서 바로
            확인할 수 있어요.
          </p>
        </div>
      ) : null}

      {sessionStarted && !currentProblem ? (
        <section className="rounded-[28px] border border-line-100 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_18px_50px_rgba(0,0,0,0.3)] sm:p-10">
          <p className="text-sm font-medium tracking-[0.18em] text-accent-600 uppercase">
            Session Complete
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink-950 dark:text-slate-50">
            오늘 복습을 마쳤어요
          </h2>
          <p className="mt-3 text-sm leading-6 text-ink-500 dark:text-slate-300">
            총 {sessionTotalCount}문제를 점검했고, 결과는 Firestore에도 함께
            저장됐습니다.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/problems"
              className="inline-flex rounded-full border border-line-200 px-4 py-2 text-sm font-medium text-ink-700 transition hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-accent-500 dark:hover:text-teal-300"
            >
              문제 목록 보기
            </Link>
            <Link
              to="/"
              className="inline-flex rounded-full bg-ink-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-600 dark:bg-white dark:text-ink-950 dark:hover:bg-teal-50"
            >
              대시보드로 이동
            </Link>
          </div>
        </section>
      ) : null}

      {currentProblem ? (
        <article className="rounded-[28px] border border-line-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_18px_50px_rgba(0,0,0,0.3)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium tracking-[0.16em] text-ink-500 uppercase dark:text-slate-400">
                Problem {currentStep}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 dark:text-slate-50 sm:text-3xl">
                {currentProblem.title}
              </h2>
              <p className="mt-3 text-sm text-ink-500 dark:text-slate-400">
                {getPlatformLabel(currentProblem.platform)}
                {currentProblem.problemNumber
                  ? ` · ${currentProblem.problemNumber}`
                  : ""}
              </p>
            </div>

            <div className="rounded-full bg-surface-50 px-4 py-2 text-sm font-medium text-ink-700 dark:bg-slate-800 dark:text-slate-200">
              남은 문제 {sessionProblemIds.length}개
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {currentProblem.algorithms.length > 0 ? (
              currentProblem.algorithms.map((algorithm) => (
                <span
                  key={algorithm}
                  className="rounded-full bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-600 dark:bg-white/10 dark:text-teal-100"
                >
                  {algorithm}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-surface-50 px-3 py-1.5 text-xs font-medium text-ink-500 dark:bg-slate-800 dark:text-slate-300">
                분류 없음
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <section className="rounded-[24px] border border-line-100 bg-surface-50 p-5 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-sm font-semibold text-ink-950 dark:text-slate-100">
                먼저 스스로 떠올려보세요
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-slate-300">
                문제 접근 방식, 핵심 알고리즘, 구현 포인트가 얼마나 떠오르는지
                먼저 점검한 뒤 필요한 순간에만 힌트와 정리를 열어보면 좋아요.
              </p>
            </section>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleShowHint}
                className="rounded-2xl border border-line-200 px-4 py-3 text-sm font-medium text-ink-700 transition hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-accent-500 dark:hover:text-teal-300"
              >
                {isHintVisible ? "힌트 확인 완료" : "힌트 보기"}
              </button>
              <button
                type="button"
                onClick={handleShowSolution}
                className="rounded-2xl border border-line-200 px-4 py-3 text-sm font-medium text-ink-700 transition hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-accent-500 dark:hover:text-teal-300"
              >
                {isSolutionVisible ? "정리 확인 완료" : "정리 보기"}
              </button>
            </div>
          </div>

          {isHintVisible ? (
            <section className="mt-5 rounded-[24px] border border-line-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-950/50">
              <p className="text-sm font-medium tracking-[0.16em] text-accent-600 uppercase">
                Review Hint
              </p>
              <p className="mt-3 text-sm leading-7 text-ink-700 dark:text-slate-300">
                {currentProblem.reviewHint || "등록된 복습 힌트가 없어요."}
              </p>
            </section>
          ) : null}

          {isSolutionVisible ? (
            <section className="mt-5 space-y-5 rounded-[24px] border border-line-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-950/50">
              <div>
                <p className="text-sm font-medium tracking-[0.16em] text-accent-600 uppercase">
                  Summary
                </p>
                <p className="mt-3 text-sm leading-7 text-ink-700 dark:text-slate-300">
                  {currentProblem.summary || "정리된 핵심 아이디어가 없어요."}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium tracking-[0.16em] text-accent-600 uppercase">
                  Blocked Reason
                </p>
                <p className="mt-3 text-sm leading-7 text-ink-700 dark:text-slate-300">
                  {currentProblem.blockedReason ||
                    "기록된 막힘 포인트가 없어요."}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium tracking-[0.16em] text-accent-600 uppercase">
                  Code
                </p>
                <pre className="mt-3 overflow-x-auto rounded-[20px] bg-ink-950 p-4 text-sm leading-7 text-slate-100">
                  <code>
                    {currentProblem.code || "// 저장된 코드가 없습니다."}
                  </code>
                </pre>
              </div>
            </section>
          ) : null}

          <section className="mt-5 border-t border-line-100 pt-6 dark:border-slate-800">
            <p className="text-sm font-semibold text-ink-950 dark:text-slate-100">
              지금 이 문제를 얼마나 떠올릴 수 있었나요?
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleReview(currentProblem.id, "easy")}
                disabled={savingProblemId === currentProblem.id}
                className="rounded-full bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-500 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700"
              >
                기억남
              </button>
              <button
                type="button"
                onClick={() => void handleReview(currentProblem.id, "medium")}
                disabled={savingProblemId === currentProblem.id}
                className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700"
              >
                애매함
              </button>
              <button
                type="button"
                onClick={() => void handleReview(currentProblem.id, "hard")}
                disabled={savingProblemId === currentProblem.id}
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700"
              >
                모르겠음
              </button>
            </div>
          </section>
        </article>
      ) : null}
    </div>
  );
}
