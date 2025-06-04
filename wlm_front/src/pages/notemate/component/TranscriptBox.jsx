import React, { useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import '../css/TranscriptBox.css';
import InfoButton from './InfoButton.jsx';
import InfoModal from './InfoModal.jsx';

const TranscriptBox = forwardRef((props, ref) => {
  const { step, showTranscriptInfo, setShowTranscriptInfo, setStep } = props;
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');

  useImperativeHandle(ref, () => ({
    getTextData: () => ({ transcript, summary }),
    setTranscript: (text) => setTranscript(text),
    setSummary: (text) => setSummary(text),
    appendTranscript: (line) => setTranscript(prev => prev.trim() + '\n' + line.trim()),
  }));

  const handleDownload = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadAudio = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8001/transcribe_audio", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setTranscript(response.data.transcription);
      setStep && setStep("transcripted");
    } catch (err) {
      console.error("오디오 파일 전사 실패:", err);
    }
  };

  const handleSummarize = async () => {
    if (!transcript) return;

    try {
      const response = await axios.post("http://localhost:8001/summarize_text", {
        text: transcript
      });
      setSummary(response.data.summary);
      setStep && setStep("summarized");
    } catch (err) {
      console.error("요약 실패:", err);
    }
  };

  return (
    <div className="transcript-box">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <InfoButton onClick={() => setShowTranscriptInfo(true)} />
      </div>

      <textarea
        className="form-item"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="변환된 텍스트"
        rows={10}
        // disabled={step !== 'transcripted'}
      />

      {/* 🎙 오디오 파일 업로드 */}
      <input
        type="file"
        accept=".mp3,.wav"
        onChange={handleLoadAudio}
        style={{ margin: '8px 0' }}
      />

      <div className="button-row">
        <button
          className="transcript-btn"
          disabled={!(step === 'transcripted' || step === 'summarized') || !transcript}
          onClick={() => handleDownload(transcript, "원본_전사.txt")}
        >
          원본 다운로드
        </button>
        <button
          className="transcript-btn"
          onClick={handleSummarize}
          disabled={step !== 'transcripted'}
        >
          요약
        </button>
      </div>

      <textarea
        className="form-item"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="요약 결과"
        rows={10}
        disabled={step !== 'summarized'}
      />

      <button
        className="transcript-btn"
        onClick={() => handleDownload(summary, "요약본.txt")}
        disabled={step !== 'summarized' || !summary}
      >
        요약본 다운로드
      </button>

      <InfoModal open={showTranscriptInfo} onClose={() => setShowTranscriptInfo(false)}>
        <b>변환된 텍스트/요약 결과 입력 안내</b><br />
        - 회의 종료 후 변환된 텍스트가 자동으로 생성됩니다.<br />
        - 텍스트는 필요에 따라 직접 수정할 수 있습니다.<br />
        - 요약 버튼을 누르면 요약 결과가 생성되며, 이 역시 수정 가능합니다.<br />
        - 모든 입력이 완료되면 다운로드 및 전송 기능이 활성화됩니다.
      </InfoModal>
    </div>
  );
});

export default TranscriptBox;
