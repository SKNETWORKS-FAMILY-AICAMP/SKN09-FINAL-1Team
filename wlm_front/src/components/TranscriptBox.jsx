import React, { useState } from 'react';
import axios from 'axios';
// import './TranscriptBox.css';


const TranscriptBox = ({ isRecording, elapsed, onSave, onSummary }) => {
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");

  const [meetingDate, setMeetingDate] = useState("");
  const [host, setHost] = useState("");
  const [participants, setParticipants] = useState("");

  // 음성 → 텍스트 변환
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
      setTranscript(text);
    } catch (err) {
      console.error("불러오기 실패:", err);
    }
  };

  // 텍스트 → 요약
  const handleSummarize = async () => {
    if (!transcript) return;

    try {
      const response = await axios.post("http://localhost:8000/summarize_text", {
        text: transcript,
        date: meetingDate || "미상",
        host: host || "미상",
        participants: participants || "참석자 명단 미제공"
      });

      setSummary(response.data.summary);
    } catch (err) {
      console.error("요약 실패:", err);
    }
  };

  // 텍스트 다운로드
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
      <input type="file" accept="audio/mp3" onChange={handleLoadAudio} className="form-item"  />

      {/* <div style={{ margin: '10px 0' }}>
        <input type="text" placeholder="회의 일자" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
        <input type="text" placeholder="주최자" value={host} onChange={(e) => setHost(e.target.value)} />
        <input type="text" placeholder="참석자" value={participants} onChange={(e) => setParticipants(e.target.value)} />
      </div> */}

      <textarea
        className="form-item"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="변환된 텍스트"
        rows={10}
      />
      <button onClick={() => handleDownload(transcript, "원본_전사.txt")} disabled={!transcript}>
        원본 다운로드
      </button>

        <button className="form-item" onClick={handleSummarize}>
            요약
        </button>

      <textarea
        className="form-item"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="요약 결과"
        rows={10}
      />
      <button onClick={() => handleDownload(summary, "요약본.txt")} disabled={!summary}>
        요약본 다운로드
      </button>
    </div>
  );
};

export default TranscriptBox;