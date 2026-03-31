import { useProblemStore } from "@/entities/problem/model/problemStore";

export default function ReviewPage() {
  const problems = useProblemStore((state) => state.problems);
  const reviewProblem = useProblemStore((state) => state.reviewProblem);

  const reviewTargets = problems.filter(
    (problem) => problem.status === "new" || problem.status === "review",
  );

  if (reviewTargets.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-line-200 bg-white/70 p-10 text-center backdrop-blur">
        <h1 className="text-3xl font-semibold tracking-tight text-ink-950">
          복습하기
        </h1>
        <p className="mt-4 text-sm text-ink-500">지금 복습할 문제가 없어.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium tracking-[0.18em] text-accent-600 uppercase">
          Recall Check
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">
          복습하기
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          정답을 다시 보는 대신, 문제를 보고 핵심 아이디어와 구현 흐름이 얼마나
          떠오르는지 먼저 점검해보세요.
        </p>
      </div>

      <div className="grid gap-5">
        {reviewTargets.map((record) => (
          <article
            key={record.id}
            className="rounded-[28px] border border-line-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
          >
            <h2 className="text-xl font-semibold tracking-tight text-ink-950">
              {record.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-ink-700">
              <span className="font-semibold text-ink-950">복습 힌트:</span>{" "}
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
    </div>
  );
}
