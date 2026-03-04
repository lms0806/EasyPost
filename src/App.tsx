import { FormEvent, useState } from "react";
import { get, post } from "./api/client";
import "./App.css";

type HeaderRow = {
  id: number;
  key: string;
  value: string;
};

type TabId = "headers" | "body";

function App() {
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("{\n  \"example\": true\n}");
  const [headers, setHeaders] = useState<HeaderRow[]>([
    { id: 0, key: "Content-Type", value: "application/json" },
  ]);
  const [nextHeaderId, setNextHeaderId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("headers");

  function buildHeaders(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const row of headers) {
      const trimmedKey = row.key.trim();
      if (trimmedKey) {
        result[trimmedKey] = row.value;
      }
    }
    return result;
  }

  function addHeaderRow() {
    setHeaders((prev) => [
      ...prev,
      { id: nextHeaderId, key: "", value: "" },
    ]);
    setNextHeaderId((prev) => prev + 1);
  }

  function updateHeaderRow(
    id: number,
    field: "key" | "value",
    value: string,
  ) {
    setHeaders((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  }

  function removeHeaderRow(id: number) {
    setHeaders((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((row) => row.id !== id);
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setResponseText("");
    setErrorText("");

    try {
      if (!url) {
        setErrorText("요청을 보낼 URL을 입력하세요.");
        return;
      }

      const headerMap = buildHeaders();

      if (method === "GET") {
        const res = await get(url, headerMap);
        setStatus(res.status);
        if (res.ok) {
          setResponseText(
            typeof res.data === "string"
              ? res.data
              : JSON.stringify(res.data, null, 2),
          );
        } else if (res.error) {
          setErrorText(res.error);
        }
      } else {
        let parsedBody: unknown = undefined;
        if (body.trim()) {
          try {
            parsedBody = JSON.parse(body);
          } catch {
            setErrorText("POST Body 는 유효한 JSON 형식이어야 합니다.");
            return;
          }
        }

        const res = await post(url, parsedBody, headerMap);
        setStatus(res.status);
        if (res.ok) {
          setResponseText(
            typeof res.data === "string"
              ? res.data
              : JSON.stringify(res.data, null, 2),
          );
        } else if (res.error) {
          setErrorText(res.error);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-root">
      <main className="app-card">
        <header className="app-header">
          <h1 className="app-header-title">EasyPost REST Client</h1>
          <p className="app-header-subtitle">
            임의의 REST API 엔드포인트로 간단하게 GET / POST 요청을 보내고 응답을 확인해 보세요.
          </p>
        </header>

        <form className="request-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="field field-method">
              <span className="field-label">Method</span>
              <select
                className="method-select"
                value={method}
                onChange={(e) => {
                  const newMethod = e.target.value as "GET" | "POST";
                  setMethod(newMethod);
                  if (newMethod === "GET" && activeTab === "body") {
                    setActiveTab("headers");
                  }
                }}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <div className="field field-url">
              <span className="field-label">URL</span>
              <input
                className="field-input"
                value={url}
                onChange={(e) => setUrl(e.currentTarget.value)}
                placeholder="https://api.example.com/resource"
              />
            </div>

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "요청 중..." : "보내기"}
            </button>
          </div>
          <div className="tabs">
            <button
              type="button"
              className={`tab-button ${
                activeTab === "headers" ? "tab-button-active" : ""
              }`}
              onClick={() => setActiveTab("headers")}
            >
              Headers
            </button>
            <button
              type="button"
              className={`tab-button ${
                activeTab === "body" ? "tab-button-active" : ""
              }`}
              onClick={() => setActiveTab("body")}
            >
              Body
            </button>
          </div>

          {activeTab === "headers" && (
            <div className="field">
              <span className="field-label">Headers (선택)</span>
              <div className="headers-list">
                {headers.map((row) => (
                  <div className="headers-row" key={row.id}>
                    <input
                      className="field-input headers-key-input"
                      placeholder="키 (예: Authorization)"
                      value={row.key}
                      onChange={(e) =>
                        updateHeaderRow(row.id, "key", e.target.value)
                      }
                    />
                    <input
                      className="field-input headers-value-input"
                      placeholder="값"
                      value={row.value}
                      onChange={(e) =>
                        updateHeaderRow(row.id, "value", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="headers-remove-button"
                      onClick={() => removeHeaderRow(row.id)}
                      disabled={headers.length === 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="headers-add-button"
                onClick={addHeaderRow}
              >
                + 헤더 추가
              </button>
            </div>
          )}

          {activeTab === "body" && (
            <div className="field">
              <span className="field-label">POST Body (JSON)</span>
              <textarea
                className="field-textarea"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          )}
        </form>

        <section className="response-section">
          <h2 className="response-title">응답</h2>
          {status !== null && <p className="response-status">Status: {status}</p>}

          {errorText && (
            <pre className="response-box response-box-error">{errorText}</pre>
          )}

          {responseText && (
            <pre className="response-box response-box-success">{responseText}</pre>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
