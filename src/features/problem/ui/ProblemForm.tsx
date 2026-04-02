import type { FormEvent } from "react";
import { useState } from "react";
import type {
  ProblemFormValues,
  ProblemRecord,
} from "@/entities/problem/model/problemStore";

interface ProblemFormProps {
  initialValues?: Partial<ProblemRecord>;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: ProblemFormValues) => void | Promise<void>;
}

const PLATFORM_OPTIONS = [
  { value: "baekjoon", label: "백준" },
  { value: "programmers", label: "프로그래머스" },
  { value: "etc", label: "기타" },
] as const;

const LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
] as const;

function normalizePlatform(value?: string) {
  if (!value) return "baekjoon";

  const normalized = value.trim().toLowerCase();

  if (normalized === "boj" || normalized === "baekjoon" || normalized === "백준") {
    return "baekjoon";
  }

  if (normalized === "programmers" || normalized === "프로그래머스") {
    return "programmers";
  }

  return "etc";
}

function normalizeLanguage(value?: string) {
  if (!value) return "javascript";

  const normalized = value.trim().toLowerCase();

  if (normalized === "javascript" || normalized === "js") return "javascript";
  if (normalized === "typescript" || normalized === "ts") return "typescript";
  if (normalized === "python" || normalized === "py") return "python";
  if (normalized === "java") return "java";

  return "javascript";
}

function getAutoRuntime(platform: string, language: string) {
  if (platform === "baekjoon" && language === "javascript") {
    return ["Node.js"];
  }

  return [];
}

const createDefaultFormValues = (
  initialValues?: Partial<ProblemRecord>,
): ProblemFormValues => ({
  title: initialValues?.title ?? "",
  platform: normalizePlatform(initialValues?.platform),
  problemNumber: initialValues?.problemNumber ?? "",
  problemUrl: initialValues?.problemUrl ?? "",

  code: initialValues?.code ?? "",
  language: normalizeLanguage(initialValues?.language),
  runtimes:
    initialValues?.runtimes && initialValues.runtimes.length > 0
      ? initialValues.runtimes
      : getAutoRuntime(
          normalizePlatform(initialValues?.platform),
          normalizeLanguage(initialValues?.language),
        ),

  algorithms: initialValues?.algorithms ?? [],
  summary: initialValues?.summary ?? "",
  blockedReason: initialValues?.blockedReason ?? "",
  reviewHint: initialValues?.reviewHint ?? "",
  isPriorityReview: initialValues?.isPriorityReview ?? false,
});

export default function ProblemForm({
  initialValues,
  submitLabel,
  isSubmitting = false,
  onSubmit,
}: ProblemFormProps) {
  const defaultFormValues = createDefaultFormValues(initialValues);
  const [form, setForm] = useState<ProblemFormValues>(
    defaultFormValues,
  );
  const [runtimeInput, setRuntimeInput] = useState(
    defaultFormValues.runtimes.join(", "),
  );
  const [algorithmInput, setAlgorithmInput] = useState(
    defaultFormValues.algorithms.join(", "),
  );

  const handleChange = <K extends keyof ProblemFormValues>(
    key: K,
    value: ProblemFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePlatformChange = (platform: string) => {
    setForm((prev) => {
      const nextRuntimes = getAutoRuntime(platform, prev.language);
      const shouldResetRuntime =
        nextRuntimes.length > 0 ||
        (prev.platform === "baekjoon" &&
          prev.language === "javascript" &&
          prev.runtimes.join(", ") === "Node.js");

      return {
        ...prev,
        platform,
        runtimes: shouldResetRuntime ? nextRuntimes : prev.runtimes,
      };
    });

    if (platform === "baekjoon" && form.language === "javascript") {
      setRuntimeInput("Node.js");
    }
  };

  const handleLanguageChange = (language: string) => {
    setForm((prev) => {
      const nextRuntimes = getAutoRuntime(prev.platform, language);
      const shouldResetRuntime =
        nextRuntimes.length > 0 ||
        (prev.platform === "baekjoon" &&
          prev.language === "javascript" &&
          prev.runtimes.join(", ") === "Node.js");

      return {
        ...prev,
        language,
        runtimes: shouldResetRuntime ? nextRuntimes : prev.runtimes,
      };
    });

    if (form.platform === "baekjoon" && language === "javascript") {
      setRuntimeInput("Node.js");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("문제 제목을 입력해주세요.");
      return;
    }

    if (!form.code.trim()) {
      alert("코드를 입력해주세요.");
      return;
    }

    await onSubmit({
      ...form,
      runtimes: form.runtimes,
      algorithms: form.algorithms,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-6"
    >
      <section className="rounded-[28px] border border-line-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8">
        <p className="text-sm font-medium tracking-[0.18em] text-accent-600 uppercase">
          Problem Context
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink-950 dark:text-slate-50">
          문제 기본 정보
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-slate-300">
          나중에 다시 봤을 때 어떤 문제였는지 빠르게 떠올릴 수 있도록 기본
          맥락을 남겨주세요.
        </p>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-ink-700 dark:text-slate-200">문제 제목</label>
          <input
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="예: DFS와 BFS"
            className="mt-2 w-full rounded-2xl border border-line-200 bg-surface-50 px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-500 focus:border-accent-500 focus:bg-white focus:ring-4 focus:ring-accent-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-800"
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-slate-200">플랫폼</label>
            <select
              value={form.platform}
              onChange={(e) => handlePlatformChange(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-line-200 bg-surface-50 px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-500 focus:border-accent-500 focus:bg-white focus:ring-4 focus:ring-accent-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
            >
              {PLATFORM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-slate-200">문제 번호</label>
            <input
              value={form.problemNumber}
              onChange={(e) => handleChange("problemNumber", e.target.value)}
              placeholder="예: 1260"
              className="mt-2 w-full rounded-2xl border border-line-200 bg-surface-50 px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-500 focus:border-accent-500 focus:bg-white focus:ring-4 focus:ring-accent-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-slate-200">문제 링크</label>
            <input
              value={form.problemUrl}
              onChange={(e) => handleChange("problemUrl", e.target.value)}
              placeholder="https://..."
              className="mt-2 w-full rounded-2xl border border-line-200 bg-surface-50 px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-500 focus:border-accent-500 focus:bg-white focus:ring-4 focus:ring-accent-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-800"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-line-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8">
        <p className="text-sm font-medium tracking-[0.18em] text-accent-600 uppercase">
          Recall Material
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink-950 dark:text-slate-50">
          회상에 필요한 단서
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-slate-300">
          언어, 런타임, 알고리즘 분류와 함께 어떤 생각으로 풀었는지 복습 재료를
          남겨두세요.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-slate-200">언어</label>
            <select
              value={form.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-line-200 bg-surface-50 px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-500 focus:border-accent-500 focus:bg-white focus:ring-4 focus:ring-accent-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-slate-200">런타임</label>
            <input
              value={runtimeInput}
              onChange={(e) => {
                const nextValue = e.target.value;
                setRuntimeInput(nextValue);
                handleChange(
                  "runtimes",
                  nextValue
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                );
              }}
              placeholder="예: Node.js"
              className="mt-2 w-full rounded-2xl border border-line-200 bg-surface-50 px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-500 focus:border-accent-500 focus:bg-white focus:ring-4 focus:ring-accent-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-800"
            />
            {form.platform === "baekjoon" && form.language === "javascript" ? (
              <p className="mt-2 text-xs text-ink-500 dark:text-slate-400">
                백준에서 JavaScript를 선택하면 런타임은 보통 Node.js로 사용됩니다.
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-slate-200">
              알고리즘 분류
            </label>
            <input
              value={algorithmInput}
              onChange={(e) => {
                const nextValue = e.target.value;
                setAlgorithmInput(nextValue);
                handleChange(
                  "algorithms",
                  nextValue
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                );
              }}
              placeholder="예: BFS, 그래프"
              className="mt-2 w-full rounded-2xl border border-line-200 bg-surface-50 px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-500 focus:border-accent-500 focus:bg-white focus:ring-4 focus:ring-accent-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-800"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-line-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8">
        <p className="text-sm font-medium tracking-[0.18em] text-accent-600 uppercase">
          Review Notes
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink-950 dark:text-slate-50">
          복습 메모
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-slate-300">
          다음 복습 때 바로 떠올릴 수 있도록 핵심 개념과 막혔던 지점을 짧게
          정리해두세요.
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-slate-200">
              핵심 아이디어
            </label>
            <textarea
              rows={4}
              value={form.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-line-200 bg-surface-50 px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-500 focus:border-accent-500 focus:bg-white focus:ring-4 focus:ring-accent-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-slate-200">
              막힌 포인트
            </label>
            <textarea
              rows={4}
              value={form.blockedReason}
              onChange={(e) => handleChange("blockedReason", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-line-200 bg-surface-50 px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-500 focus:border-accent-500 focus:bg-white focus:ring-4 focus:ring-accent-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-slate-200">
              복습 힌트
            </label>
            <textarea
              rows={4}
              value={form.reviewHint}
              onChange={(e) => handleChange("reviewHint", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-line-200 bg-surface-50 px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-500 focus:border-accent-500 focus:bg-white focus:ring-4 focus:ring-accent-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-800"
            />
          </div>

          <label className="block rounded-2xl border border-line-200 bg-surface-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={form.isPriorityReview}
                onChange={(e) =>
                  handleChange("isPriorityReview", e.target.checked)
                }
                className="mt-1 h-4 w-4 rounded border-line-200 text-accent-600 focus:ring-accent-500"
              />
              <div>
                <span className="block text-sm font-semibold text-ink-950 dark:text-slate-100">
                  복습 우선 문제로 표시
                </span>
                <p className="mt-1 text-sm leading-6 text-ink-500 dark:text-slate-300">
                  다시 보고 싶은 문제거나, 나중에 퀴즈로 한 번 더 만나고 싶은
                  문제예요.
                </p>
              </div>
            </div>
          </label>
        </div>
      </section>

      <section className="rounded-[28px] border border-line-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8">
        <p className="text-sm font-medium tracking-[0.18em] text-accent-600 uppercase">
          Solution Record
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink-950 dark:text-slate-50">
          풀이 코드
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-slate-300">
          실제 코드도 함께 저장해두면 회상 결과와 구현 디테일을 나중에 비교하기
          쉬워집니다.
        </p>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-ink-700 dark:text-slate-200">
            코드
          </label>
          <textarea
            rows={18}
            value={form.code}
            onChange={(e) => handleChange("code", e.target.value)}
            placeholder="풀이 코드를 입력하세요"
            className="mt-2 min-h-80 w-full rounded-2xl border border-line-200 bg-ink-950 px-4 py-3 font-mono text-sm leading-7 text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-4 focus:ring-accent-50 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-ink-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700"
        >
          {isSubmitting ? "저장 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
