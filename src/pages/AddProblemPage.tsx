import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProblemStore } from "../store/useProblemStore";
import type { ProblemLanguage, ProblemRuntime } from "../types/problem";

type Platform = "baekjoon" | "programmers" | "etc";

export default function AddProblemPage() {
  const navigate = useNavigate();
  const addRecord = useProblemStore((state) => state.addRecord);

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<Platform>("baekjoon");
  const [problemNumber, setProblemNumber] = useState("");
  const [problemUrl, setProblemUrl] = useState("");
  const [language, setLanguage] = useState<ProblemLanguage>("javascript");
  const [runtimes, setRuntimes] = useState<ProblemRuntime[]>([]);
  const [code, setCode] = useState("");
  const [algorithmsText, setAlgorithmsText] = useState("");
  const [summary, setSummary] = useState("");
  const [blockedReason, setBlockedReason] = useState("");
  const [reviewHint, setReviewHint] = useState("");

  const handleRuntimeChange = (runtime: ProblemRuntime, checked: boolean) => {
    setRuntimes((prev) => {
      if (checked) {
        return prev.includes(runtime) ? prev : [...prev, runtime];
      }

      return prev.filter((item) => item !== runtime);
    });
  };

  const handleLanguageChange = (nextLanguage: ProblemLanguage) => {
    setLanguage(nextLanguage);

    // JavaScript가 아니면 Node.js runtime 선택 해제
    if (nextLanguage !== "javascript") {
      setRuntimes([]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("문제 제목을 입력해줘!");
      return;
    }

    if (!code.trim()) {
      alert("풀이 코드를 입력해줘!");
      return;
    }

    const algorithms = algorithmsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    addRecord({
      title: title.trim(),
      platform,
      problemNumber: problemNumber.trim(),
      problemUrl: problemUrl.trim(),
      language,
      runtimes,
      code: code.trim(),
      algorithms,
      summary: summary.trim(),
      blockedReason: blockedReason.trim(),
      reviewHint: reviewHint.trim(),
    });

    navigate("/problems");
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>문제 등록</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "16px",
          maxWidth: "960px",
          marginTop: "24px",
        }}
      >
        <div>
          <label htmlFor="title">문제 제목</label>
          <br />
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 부분합"
            style={{ width: "100%", padding: "12px", marginTop: "8px" }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div>
            <label htmlFor="platform">플랫폼</label>
            <br />
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              style={{ width: "100%", padding: "12px", marginTop: "8px" }}
            >
              <option value="baekjoon">백준</option>
              <option value="programmers">프로그래머스</option>
              <option value="etc">기타</option>
            </select>
          </div>

          <div>
            <label htmlFor="problemNumber">문제 번호</label>
            <br />
            <input
              id="problemNumber"
              type="text"
              value={problemNumber}
              onChange={(e) => setProblemNumber(e.target.value)}
              placeholder="예: 1806"
              style={{ width: "100%", padding: "12px", marginTop: "8px" }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="problemUrl">문제 링크</label>
          <br />
          <input
            id="problemUrl"
            type="text"
            value={problemUrl}
            onChange={(e) => setProblemUrl(e.target.value)}
            placeholder="https://www.acmicpc.net/problem/1806"
            style={{ width: "100%", padding: "12px", marginTop: "8px" }}
          />
        </div>

        <div>
          <label htmlFor="language">언어</label>
          <br />
          <select
            id="language"
            value={language}
            onChange={(e) =>
              handleLanguageChange(e.target.value as ProblemLanguage)
            }
            style={{ width: "100%", padding: "12px", marginTop: "8px" }}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        {language === "javascript" && (
          <div>
            <label>실행 환경</label>
            <div style={{ marginTop: "8px" }}>
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="checkbox"
                  checked={runtimes.includes("nodejs")}
                  onChange={(e) =>
                    handleRuntimeChange("nodejs", e.target.checked)
                  }
                />
                Node.js
              </label>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="algorithms">알고리즘 분류</label>
          <br />
          <input
            id="algorithms"
            type="text"
            value={algorithmsText}
            onChange={(e) => setAlgorithmsText(e.target.value)}
            placeholder="예: 투포인터, 슬라이딩 윈도우"
            style={{ width: "100%", padding: "12px", marginTop: "8px" }}
          />
          <p style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}>
            쉼표(,)로 구분해서 입력해줘
          </p>
        </div>

        <div>
          <label htmlFor="summary">핵심 아이디어</label>
          <br />
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="예: 합이 S 이상이 되면 left를 이동하면서 최소 길이를 갱신"
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              resize: "vertical",
            }}
          />
        </div>

        <div>
          <label htmlFor="blockedReason">막힌 포인트</label>
          <br />
          <textarea
            id="blockedReason"
            value={blockedReason}
            onChange={(e) => setBlockedReason(e.target.value)}
            placeholder="예: 최소 길이를 언제 갱신해야 하는지 헷갈렸음"
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              resize: "vertical",
            }}
          />
        </div>

        <div>
          <label htmlFor="reviewHint">복습 힌트</label>
          <br />
          <textarea
            id="reviewHint"
            value={reviewHint}
            onChange={(e) => setReviewHint(e.target.value)}
            placeholder="예: 조건 만족 시 길이 갱신 후 left 이동"
            rows={3}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              resize: "vertical",
            }}
          />
        </div>

        <div>
          <label htmlFor="code">풀이 코드</label>
          <br />
          <textarea
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="풀이 코드를 붙여넣어줘"
            rows={16}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              resize: "vertical",
              fontFamily: "monospace",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "fit-content",
            padding: "12px 20px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          저장하기
        </button>
      </form>
    </div>
  );
}
