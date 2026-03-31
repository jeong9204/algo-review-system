import { Link, useNavigate, useParams } from "react-router-dom";
import ProblemForm from "@/features/problem/ui/ProblemForm";
import {
  useProblemStore,
  type ProblemFormValues,
} from "@/entities/problem/model/problemStore";

export default function ProblemFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const addProblem = useProblemStore((state) => state.addProblem);
  const updateProblem = useProblemStore((state) => state.updateProblem);
  const getProblemById = useProblemStore((state) => state.getProblemById);

  const isEditMode = Boolean(id);
  const targetProblem = id ? getProblemById(id) : undefined;

  if (isEditMode && !targetProblem) {
    return (
      <section className="rounded-[28px] border border-line-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-950">
          문제를 찾을 수 없습니다
        </h1>
        <Link
          to="/problems"
          className="mt-4 inline-flex text-sm font-medium text-accent-600 hover:text-accent-500"
        >
          목록으로 이동
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-ink-950 px-6 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8">
        <p className="text-sm font-medium tracking-[0.18em] text-teal-200 uppercase">
          Problem Form
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {isEditMode ? "복습용 문제 수정" : "복습용 문제 등록"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          풀이 기록을 남기는 것보다, 나중에 스스로 다시 떠올릴 수 있게 정리하는
          것이 더 중요합니다. 문제 맥락, 막힌 포인트, 복습 힌트를 함께
          남겨두세요.
        </p>
      </div>

      <ProblemForm
        initialValues={targetProblem}
        submitLabel={isEditMode ? "수정 완료" : "문제 저장"}
        onSubmit={(values: ProblemFormValues) => {
          if (isEditMode && id) {
            updateProblem(id, values);
            navigate(`/problems/${id}`);
            return;
          }

          addProblem(values);
          navigate("/problems");
        }}
      />
    </section>
  );
}
