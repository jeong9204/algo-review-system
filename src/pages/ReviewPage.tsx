import { useProblemStore } from "../store/useProblemStore";

export default function ReviewPage() {
  const records = useProblemStore((state) => state.records);
  const reviewRecord = useProblemStore((state) => state.reviewRecord);

  const reviewTargets = records.filter(
    (record) => record.status === "new" || record.status === "review",
  );

  if (reviewTargets.length === 0) {
    return (
      <div style={{ padding: "24px" }}>
        <h1>복습하기</h1>
        <p style={{ marginTop: "16px" }}>지금 복습할 문제가 없어.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1>복습하기</h1>

      <div style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
        {reviewTargets.map((record) => (
          <article
            key={record.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <h2 style={{ margin: 0 }}>{record.title}</h2>

            <p style={{ marginTop: "8px" }}>
              <strong>복습 힌트:</strong> {record.reviewHint || "힌트 없음"}
            </p>

            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button onClick={() => reviewRecord(record.id, "remembered")}>
                기억남
              </button>
              <button onClick={() => reviewRecord(record.id, "vague")}>
                애매함
              </button>
              <button onClick={() => reviewRecord(record.id, "forgot")}>
                모르겠음
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
