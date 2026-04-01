import { Link } from "react-router-dom";
import { useProblemStore } from "@/entities/problem/model/problemStore";

function getLanguageLabel(language: string) {
  switch (language) {
    case "javascript":
      return "JavaScript";
    case "typescript":
      return "TypeScript";
    case "python":
      return "Python";
    case "java":
      return "Java";
    default:
      return language;
  }
}

function getRuntimeLabel(runtime: string) {
  switch (runtime) {
    case "nodejs":
      return "Node.js";
    default:
      return runtime;
  }
}

export default function ProblemsPage() {
  const problems = useProblemStore((state) => state.problems);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium tracking-[0.18em] text-accent-600 uppercase">
            Problems
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950 dark:text-slate-50">
            문제 목록
          </h1>
        </div>

        <Link
          to="/add"
          className="inline-flex rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-600"
        >
          + 새 문제 등록
        </Link>
      </div>

      {problems.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-line-200 bg-white/70 p-10 text-center backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
          <p className="text-base text-ink-500 dark:text-slate-300">아직 등록된 문제가 없어.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {problems.map((record) => (
            <article
              key={record.id}
              className="rounded-[28px] border border-line-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_18px_50px_rgba(0,0,0,0.3)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-ink-950 dark:text-slate-50">
                    <Link
                      to={`/problems/${record.id}`}
                      className="transition hover:text-accent-600"
                    >
                      {record.title}
                    </Link>
                  </h2>

                  <p className="mt-2 text-sm text-ink-500 dark:text-slate-400">
                    {record.platform}
                    {record.problemNumber ? ` · ${record.problemNumber}` : ""}
                    {record.language
                      ? ` · ${getLanguageLabel(record.language)}`
                      : ""}
                    {record.runtimes.length > 0
                      ? ` · ${record.runtimes.map(getRuntimeLabel).join(", ")}`
                      : ""}
                  </p>
                </div>

                <div className="rounded-full bg-surface-50 px-4 py-2 text-sm font-medium text-ink-700 dark:bg-slate-800 dark:text-slate-200">
                  상태: {record.status}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {record.algorithms.map((algorithm) => (
                  <span
                    key={algorithm}
                    className="rounded-full bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-600"
                  >
                    {algorithm}
                  </span>
                ))}
              </div>

              <p className="mt-5 text-sm leading-6 text-ink-700 dark:text-slate-300">
                <span className="font-semibold text-ink-950 dark:text-slate-50">핵심 아이디어:</span>{" "}
                {record.summary || "아직 작성되지 않음"}
              </p>

              <div className="mt-5">
                <Link
                  to={`/problems/${record.id}`}
                  className="inline-flex rounded-full border border-line-200 px-4 py-2 text-sm font-medium text-ink-700 transition hover:border-accent-500 hover:text-accent-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-accent-500 dark:hover:text-teal-300"
                >
                  상세 보기
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
