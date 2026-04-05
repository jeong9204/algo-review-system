import { useProblemStore } from "@/entities/problem/model/problemStore";

export default function ReviewPage() {
  const problems = useProblemStore((state) => state.problems);
  const reviewProblem = useProblemStore((state) => state.reviewProblem);

  const reviewTargets = problems.filter(
    (problem) => problem.status === "new" || problem.status === "review",
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-line-100 bg-white px-6 py-7 text-ink-950 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-ink-950 dark:text-white dark:shadow-[0_24px_70px_rgba(2,6,23,0.38)] sm:px-8">
        <p className="text-sm font-medium tracking-[0.18em] text-accent-600 dark:text-teal-200 uppercase">
          Recall Check
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950 dark:text-white sm:text-4xl">
          복습하기
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500 dark:text-slate-300">
          정답을 다시 보는 대신, 문제를 보고 핵심 아이디어와 구현 흐름이 얼마나
          떠오르는지 먼저 점검해보세요.
        </p>
      </section>

      {reviewTargets.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-line-200 bg-white/70 p-10 text-center backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
          <p className="text-base font-medium text-ink-950 dark:text-slate-50">
            지금 복습할 문제가 없어.
          </p>
          <p className="mt-3 text-sm text-ink-500 dark:text-slate-300">
            새 문제를 등록하거나, 아직 복습이 필요한 문제가 생기면 이곳에서 바로
            확인할 수 있어요.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {reviewTargets.map((record) => (
            <article
              key={record.id}
              className="rounded-[28px] border border-line-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_18px_50px_rgba(0,0,0,0.3)]"
            >
              <h2 className="text-xl font-semibold tracking-tight text-ink-950 dark:text-slate-50">
                {record.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-ink-700 dark:text-slate-300">
                <span className="font-semibold text-ink-950 dark:text-slate-50">복습 힌트:</span>{" "}
                {record.reviewHint || "힌트 없음"}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => reviewProblem(record.id, "easy")}
                  className="rounded-full bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-500"
                >
                  기억남
                </button>
                <button
                  onClick={() => reviewProblem(record.id, "medium")}
                  className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-400"
                >
                  애매함
                </button>
                <button
                  onClick={() => reviewProblem(record.id, "hard")}
                  className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
                >
                  모르겠음
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
