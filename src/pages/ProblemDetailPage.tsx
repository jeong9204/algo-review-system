import { Link, useNavigate, useParams } from "react-router-dom";
import { useProblemStore } from "../store/useProblemStore";
import type {
  ProblemLanguage,
  ProblemRuntime,
  ReviewResult,
} from "../types/problem";

function getLanguageLabel(language: ProblemLanguage) {
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

function getRuntimeLabel(runtime: ProblemRuntime) {
  switch (runtime) {
    case "nodejs":
      return "Node.js";
    default:
      return runtime;
  }
}

function getReviewResultLabel(result: ReviewResult) {
  switch (result) {
    case "remembered":
      return "기억남";
    case "vague":
      return "애매함";
    case "forgot":
      return "모르겠음";
    default:
      return result;
  }
}

export default function ProblemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const records = useProblemStore((state) => state.records);
  const removeRecord = useProblemStore((state) => state.removeRecord);

  const record = records.find((item) => item.id === id);

  if (!record) {
    return (
      <div style={{ padding: "24px" }}>
        <h1>문제를 찾을 수 없어</h1>
        <p style={{ marginTop: "12px" }}>삭제되었거나 잘못된 경로일 수 있어.</p>
        <Link
          to="/problems"
          style={{ display: "inline-block", marginTop: "16px" }}
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    const confirmed = window.confirm("이 문제를 삭제할까?");

    if (!confirmed) return;

    removeRecord(record.id);
    navigate("/problems");
  };

  return (
    <div style={{ padding: "24px", maxWidth: "960px" }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <Link to="/problems">← 목록으로</Link>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h1 style={{ margin: 0 }}>{record.title}</h1>

        <p style={{ marginTop: "12px", color: "#666" }}>
          {record.platform}
          {record.problemNumber ? ` · ${record.problemNumber}` : ""}
          {record.language ? ` · ${getLanguageLabel(record.language)}` : ""}
          {record.runtimes.length > 0
            ? ` · ${record.runtimes.map(getRuntimeLabel).join(", ")}`
            : ""}
        </p>

        {record.problemUrl && (
          <p style={{ marginTop: "8px" }}>
            <a href={record.problemUrl} target="_blank" rel="noreferrer">
              문제 링크 열기
            </a>
          </p>
        )}
      </div>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "16px",
          padding: "20px",
          marginTop: "24px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>기본 정보</h2>

        <p>
          <strong>상태:</strong> {record.status}
        </p>
        <p>
          <strong>복습 횟수:</strong> {record.reviewCount}
        </p>
        <p>
          <strong>생성일:</strong> {new Date(record.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>수정일:</strong> {new Date(record.updatedAt).toLocaleString()}
        </p>
        {record.lastReviewedAt && (
          <p>
            <strong>마지막 복습일:</strong>{" "}
            {new Date(record.lastReviewedAt).toLocaleString()}
          </p>
        )}
      </section>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "16px",
          padding: "20px",
          marginTop: "16px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>알고리즘 분류</h2>

        {record.algorithms.length === 0 ? (
          <p>아직 입력된 분류가 없어.</p>
        ) : (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {record.algorithms.map((algorithm) => (
              <span
                key={algorithm}
                style={{
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background: "#f2f2f2",
                  fontSize: "14px",
                }}
              >
                {algorithm}
              </span>
            ))}
          </div>
        )}
      </section>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "16px",
          padding: "20px",
          marginTop: "16px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>핵심 아이디어</h2>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
          {record.summary || "아직 작성되지 않았어."}
        </p>
      </section>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "16px",
          padding: "20px",
          marginTop: "16px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>막힌 포인트</h2>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
          {record.blockedReason || "아직 작성되지 않았어."}
        </p>
      </section>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "16px",
          padding: "20px",
          marginTop: "16px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>복습 힌트</h2>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
          {record.reviewHint || "아직 작성되지 않았어."}
        </p>
      </section>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "16px",
          padding: "20px",
          marginTop: "16px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>풀이 코드</h2>
        <pre
          style={{
            margin: 0,
            padding: "16px",
            background: "#f7f7f7",
            borderRadius: "12px",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "monospace",
            lineHeight: 1.5,
          }}
        >
          {record.code || "코드가 없어."}
        </pre>
      </section>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "16px",
          padding: "20px",
          marginTop: "16px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>복습 히스토리</h2>

        {record.reviewHistory.length === 0 ? (
          <p>아직 복습 기록이 없어.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {record.reviewHistory.map((history) => (
              <div
                key={history.id}
                style={{
                  padding: "12px",
                  border: "1px solid #eee",
                  borderRadius: "12px",
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>결과:</strong> {getReviewResultLabel(history.result)}
                </p>
                <p style={{ margin: "8px 0 0 0", color: "#666" }}>
                  {new Date(history.reviewedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        <button
          type="button"
          onClick={handleDelete}
          style={{
            padding: "12px 20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            background: "white",
            cursor: "pointer",
          }}
        >
          삭제하기
        </button>
      </div>
    </div>
  );
}
