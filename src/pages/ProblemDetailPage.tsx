import { Link, useNavigate, useParams } from "react-router-dom";
import { useProblemStore } from "@/entities/problem/model/problemStore";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProblemDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const problem = useProblemStore((state) => state.getProblemById(id));
  const deleteProblem = useProblemStore((state) => state.deleteProblem);

  if (!problem) {
    return (
      <section className="rounded-[28px] border border-line-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-medium tracking-[0.18em] text-accent-600 uppercase">
          Problem Detail
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950">
          문제를 찾을 수 없습니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-500">
          삭제되었거나 잘못된 주소로 접근했을 수 있어요.
        </p>
        <Link
          to="/problems"
          className="mt-5 inline-flex rounded-full border border-line-200 px-4 py-2 text-sm font-medium text-ink-700 transition hover:border-accent-500 hover:text-accent-600"
        >
          목록으로 돌아가기
        </Link>
      </section>
    );
  }

  const handleDelete = () => {
    const confirmed = window.confirm("정말 삭제할까요?");
    if (!confirmed) return;

    deleteProblem(id);
    navigate("/problems");
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-ink-950 px-6 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium tracking-[0.18em] text-teal-200 uppercase">
              Problem Detail
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {problem.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {problem.platform}
              {problem.problemNumber ? ` · ${problem.problemNumber}` : ""}
              {problem.language ? ` · ${problem.language}` : ""}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {problem.algorithms.map((algorithm) => (
                <span
                  key={algorithm}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-teal-100"
                >
                  {algorithm}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/problems"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              목록
            </Link>
            <Link
              to={`/problems/${id}/edit`}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-teal-50"
            >
              수정
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              삭제
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-line-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-ink-500">상태</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ink-950">
            {problem.status}
          </p>
        </div>

        <div className="rounded-[24px] border border-line-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-ink-500">복습 횟수</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ink-950">
            {problem.reviewCount}
          </p>
        </div>

        <div className="rounded-[24px] border border-line-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-ink-500">문제 링크</p>
          {problem.problemUrl ? (
            <a
              href={problem.problemUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex text-sm font-medium text-accent-600 hover:text-accent-500"
            >
              원문 보기
            </a>
          ) : (
            <p className="mt-2 text-sm text-ink-500">등록된 링크 없음</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-line-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold tracking-tight text-ink-950">
              핵심 아이디어
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-700">
              {problem.summary || "아직 정리된 핵심 아이디어가 없어요."}
            </p>
          </section>

          <section className="rounded-[28px] border border-line-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold tracking-tight text-ink-950">
              막힌 포인트
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-700">
              {problem.blockedReason || "기록된 막힘 포인트가 없어요."}
            </p>
          </section>

          <section className="rounded-[28px] border border-line-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold tracking-tight text-ink-950">
              복습 힌트
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-700">
              {problem.reviewHint || "복습 힌트가 아직 없어요."}
            </p>
          </section>

          <section className="rounded-[28px] border border-line-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold tracking-tight text-ink-950">코드</h2>
            <pre className="mt-4 overflow-x-auto rounded-[24px] bg-ink-950 p-5 text-sm leading-7 text-slate-100">
              <code>{problem.code || "// 아직 저장된 코드가 없습니다."}</code>
            </pre>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-line-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold tracking-tight text-ink-950">
              메타 정보
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-ink-500">언어</dt>
                <dd className="mt-1 font-medium text-ink-950">
                  {problem.language || "미입력"}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">런타임</dt>
                <dd className="mt-1 font-medium text-ink-950">
                  {problem.runtimes.length > 0
                    ? problem.runtimes.join(", ")
                    : "미입력"}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">생성일</dt>
                <dd className="mt-1 font-medium text-ink-950">
                  {formatDate(problem.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">수정일</dt>
                <dd className="mt-1 font-medium text-ink-950">
                  {formatDate(problem.updatedAt)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[28px] border border-line-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold tracking-tight text-ink-950">
              최근 복습 기록
            </h2>
            {problem.reviewHistory.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-ink-500">
                아직 복습 기록이 없습니다.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {problem.reviewHistory.slice(0, 5).map((item) => (
                  <li
                    key={item.id}
                    className="rounded-2xl bg-surface-50 px-4 py-3 text-sm"
                  >
                    <p className="font-medium text-ink-950">{item.difficulty}</p>
                    <p className="mt-1 text-ink-500">
                      {formatDate(item.reviewedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
