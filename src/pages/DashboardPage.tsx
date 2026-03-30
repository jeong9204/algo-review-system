import { Link } from "react-router-dom";
import { useProblemStore } from "../store/useProblemStore";

export default function DashboardPage() {
  const records = useProblemStore((state) => state.records);

  const reviewCount = records.filter(
    (record) => record.status === "review",
  ).length;
  const masteredCount = records.filter(
    (record) => record.status === "mastered",
  ).length;

  return (
    <div style={{ padding: "24px" }}>
      <h1>알고리즘 복습 시스템</h1>

      <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
        <Link to="/add">문제 등록</Link>
        <Link to="/problems">문제 목록</Link>
        <Link to="/review">복습하기</Link>
      </div>

      <div
        style={{
          display: "grid",
          gap: "16px",
          marginTop: "24px",
          maxWidth: "480px",
        }}
      >
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <strong>총 문제 수</strong>
          <p style={{ fontSize: "24px", marginTop: "8px" }}>{records.length}</p>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <strong>복습 필요</strong>
          <p style={{ fontSize: "24px", marginTop: "8px" }}>{reviewCount}</p>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <strong>익숙해진 문제</strong>
          <p style={{ fontSize: "24px", marginTop: "8px" }}>{masteredCount}</p>
        </div>
      </div>
    </div>
  );
}
