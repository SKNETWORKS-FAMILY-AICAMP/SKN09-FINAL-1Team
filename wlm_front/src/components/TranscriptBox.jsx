import React, { useState } from 'react';
import axios from 'axios';

const TranscriptBox = ({ isRecording, elapsed, onSave, onSummary }) => {
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");

  // 🎯 1. 음성 → 텍스트 변환
  const handleLoadAudio = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/transcribe_audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const text = response.data.transcription;
      setTranscript(text);  // 변환된 텍스트 보여주기
    } catch (err) {
      console.error("불러오기 실패:", err);
    }
  };

  // 🎯 2. 텍스트 → 요약
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

  return (
    <div className="transcript-box">
      <input type="file" accept="audio/mp3" onChange={handleLoadAudio} />
      <textarea value={transcript} readOnly placeholder="변환된 텍스트" rows={10} />
      <button onClick={handleSummarize}>요약</button>
      <textarea value={summary} readOnly placeholder="요약 결과" rows={5} />
    </div>
  );
};

export default TranscriptBox;
