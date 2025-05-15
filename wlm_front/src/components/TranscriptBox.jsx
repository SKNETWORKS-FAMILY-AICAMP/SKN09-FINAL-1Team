import React, { useState } from 'react';

const TranscriptBox = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("파일을 선택하세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/summarize_audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      const data = await response.json();
      setText(data.summary);  // WhisperX 텍스트만 따로 넘겨줄 수도 있음
    } catch (error) {
      console.error("불러오기 실패:", error);
      alert("불러오기 실패: " + error.message);
    }
  };

  const handleSummarize = async () => {
    if (!text) {
      alert("먼저 음성을 불러와 주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/summarize_text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("요약 실패:", error);
      alert("요약 실패: " + error.message);
    }
  };

  return (
    <div className="transcript-box">
      <div className="transcript-actions">
        <input type="file" accept=".mp3" onChange={handleFileChange} />
        <button onClick={handleUpload}>🎵 불러오기</button>
        <button onClick={handleSummarize}>📄 요약</button>
      </div>

      <h4>🔊 음성 텍스트 변환</h4>
      <p>녹음이 완료되면 텍스트로 자동 전환됩니다.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="여기에 텍스트가 표시됩니다." rows={10} style={{ width: '100%' }} />

      {summary && (
        <>
          <h4>🧾 요약 결과</h4>
          <textarea value={summary} readOnly rows={10} style={{ width: '100%' }} />
        </>
      )}
    </div>
  );
};

export default TranscriptBox;
