import React, { useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import '../css/TranscriptBox.css';

const TranscriptBox = forwardRef((props, ref) => {
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");

  useImperativeHandle(ref, () => ({
    getTextData: () => ({ transcript, summary })
  }));

  // 오디오 파일 업로드 기능 주석 처리
  // const handleLoadAudio = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const formData = new FormData();
  //   formData.append("file", file);


  //   try {
  //     const response = await axios.post("http://localhost:8000/transcribe_audio", formData, {
  //       headers: { "Content-Type": "multipart/form-data" }
  //     });
  //     setTranscript(response.data.transcription);
  //   } catch (err) {
  //     console.error("불러오기 실패:", err);
  //   }
  // };


  const handleSummarize = async () => {
    if (!transcript) return;
    try {
      const response = await axios.post("http://localhost:8000/summarize_text", {
        text: transcript
      });
      setSummary(response.data.summary);
    } catch (err) {
      console.error("요약 실패:", err);
    }
  };

  const handleDownload = (text, filename) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="transcript-box">
      {/* 오디오 파일 업로드 기능 주석 처리 */}
      {/* <input type="file" accept="audio/mp3" onChange={handleLoadAudio} className="form-item" /> */}


      <textarea
        className="form-item"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="변환된 텍스트"
        rows={10}
      />

      <div className="button-row">
        <button
          className="transcript-btn"
          disabled={!transcript}
          onClick={() => handleDownload(transcript, "원본_전사.txt")}
        >
          원본 다운로드
        </button>
        <button className="transcript-btn" onClick={handleSummarize}>
          요약
        </button>
      </div>

      <textarea
        className="form-item"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="요약 결과"
        rows={10}
      />


      <button
        className="transcript-btn"
        onClick={() => handleDownload(summary, "요약본.txt")}
        disabled={!summary}
      >
        요약본 다운로드
      </button>
    </div>
  );
});

export default TranscriptBox;
