import { Link } from "react-router-dom";
import { useProblemStore } from "../store/useProblemStore";

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
  const records = useProblemStore((state) => state.records);

  return (
    <div style={{ padding: "24px" }}>
      <h1>문제 목록</h1>

      <div style={{ marginTop: "16px" }}>
        <Link to="/add">+ 새 문제 등록</Link>
      </div>

      {records.length === 0 ? (
        <p style={{ marginTop: "24px" }}>아직 등록된 문제가 없어.</p>
      ) : (
        <div style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
          {records.map((record) => (
            <article
              key={record.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                <Link to={`/problems/${record.id}`}>{record.title}</Link>
              </h2>

              <p style={{ marginTop: "8px", color: "#666" }}>
                {record.platform}
                {record.problemNumber ? ` · ${record.problemNumber}` : ""}
                {record.language
                  ? ` · ${getLanguageLabel(record.language)}`
                  : ""}
                {record.runtimes.length > 0
                  ? ` · ${record.runtimes.map(getRuntimeLabel).join(", ")}`
                  : ""}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginTop: "12px",
                }}
              >
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

              <p style={{ marginTop: "12px" }}>
                <strong>상태:</strong> {record.status}
              </p>

              <p style={{ marginTop: "8px" }}>
                <strong>핵심 아이디어:</strong>{" "}
                {record.summary || "아직 작성되지 않음"}
              </p>

              <div style={{ marginTop: "16px" }}>
                <Link to={`/problems/${record.id}`}>상세 보기</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
