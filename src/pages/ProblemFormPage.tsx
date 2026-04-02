import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { Link, useNavigate, useParams } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import ProblemForm from "@/features/problem/ui/ProblemForm";
import {
  createProblemRecord,
  useProblemStore,
  type ProblemFormValues,
  type ProblemRecord,
} from "@/entities/problem/model/problemStore";
import { auth, db } from "@/shared/config/firebase";

function getFirestoreSaveErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === "permission-denied") {
      return "Firestore 권한이 없어요. 보안 규칙에서 현재 로그인한 사용자의 쓰기 권한을 확인해주세요.";
    }

    if (error.code === "unauthenticated") {
      return "로그인 정보가 만료됐어요. 다시 로그인한 뒤 저장해주세요.";
    }

    if (error.code === "unavailable") {
      return "Firestore 서버에 일시적으로 연결할 수 없어요. 네트워크를 확인한 뒤 다시 시도해주세요.";
    }

    return `Firestore 저장 실패: ${error.code}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Firestore 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

export default function ProblemFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addProblem = useProblemStore((state) => state.addProblem);
  const updateProblem = useProblemStore((state) => state.updateProblem);
  const getProblemById = useProblemStore((state) => state.getProblemById);

  const isEditMode = Boolean(id);
  const targetProblem = id ? getProblemById(id) : undefined;

  const syncProblemToFirestore = async (problem: ProblemRecord) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("로그인한 사용자 정보를 찾을 수 없습니다.");
    }

    await setDoc(
      doc(db, "users", currentUser.uid, "problems", problem.id),
      {
        ...problem,
        userId: currentUser.uid,
        syncedAt: serverTimestamp(),
      },
      { merge: true },
    );
  };

  if (isEditMode && !targetProblem) {
    return (
      <section className="rounded-[28px] border border-line-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-950 dark:text-slate-50">
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
      <div className="rounded-[32px] border border-line-100 bg-white px-6 py-7 text-ink-950 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-ink-950 dark:text-white dark:shadow-[0_24px_70px_rgba(2,6,23,0.38)] sm:px-8">
        <p className="text-sm font-medium tracking-[0.18em] text-accent-600 dark:text-teal-200 uppercase">
          Problem Form
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950 dark:text-white sm:text-4xl">
          {isEditMode ? "복습용 문제 수정" : "복습용 문제 등록"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500 dark:text-slate-300">
          풀이 기록을 남기는 것보다, 나중에 스스로 다시 떠올릴 수 있게 정리하는
          것이 더 중요합니다. 문제 맥락, 막힌 포인트, 복습 힌트를 함께
          남겨두세요.
        </p>
      </div>

      <ProblemForm
        key={targetProblem?.id ?? "new-problem"}
        initialValues={targetProblem}
        isSubmitting={isSubmitting}
        submitLabel={isEditMode ? "수정 완료" : "문제 저장"}
        onSubmit={async (values: ProblemFormValues) => {
          if (!auth.currentUser) {
            alert("문제를 저장하려면 먼저 Google 로그인이 필요합니다.");
            return;
          }

          setIsSubmitting(true);

          try {
            if (isEditMode && id) {
              const updatedProblem = createProblemRecord(values, targetProblem);
              await syncProblemToFirestore(updatedProblem);
              updateProblem(updatedProblem);
              navigate(`/problems/${updatedProblem.id}`);
              return;
            }

            const createdProblem = createProblemRecord(values);
            await syncProblemToFirestore(createdProblem);
            addProblem(createdProblem);
            navigate("/problems");
          } catch (error) {
            console.error("problem save failed", error);
            alert(getFirestoreSaveErrorMessage(error));
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </section>
  );
}
