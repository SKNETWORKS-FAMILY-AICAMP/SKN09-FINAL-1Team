import React, { useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import '../css/TranscriptBox.css';
import InfoButton from './InfoButton.jsx';
import InfoModal from './InfoModal.jsx';
import { FaFileAudio } from 'react-icons/fa';

const TranscriptBox = forwardRef((props, ref) => {
  const { step, showTranscriptInfo, setShowTranscriptInfo, setStep } = props;
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);


  useImperativeHandle(ref, () => ({
    getTextData: () => ({ transcript, summary }),
    setTranscript: (text) => setTranscript(text),
    setSummary: (text) => setSummary(text),
    appendTranscript: (line) =>
      setTranscript((prev) => prev.trim() + '\n' + line.trim()),
    setExampleTranscript: (text) => setTranscript(text), 
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

    setUploadedFileName(file.name);
    setIsUploading(true);
    setIsUploaded(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        'http://localhost:8001/transcribe_audio',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      setTranscript(response.data.transcription);
      setStep && setStep('transcripted');
    } catch (err) {
      console.error('오디오 파일 전사 실패:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSummarize = async () => {
    if (!transcript) return;

    try {
      const response = await axios.post('http://localhost:8001/summarize_text', {
        text: transcript,
      });
      setSummary(response.data.summary);
      setStep && setStep('summarized');
    } catch (err) {
      console.error('요약 실패:', err);
    }
  };

  return (
    <div className="transcript-box">
      {/* 업로드 영역 */}
      <div className="upload-row">
        <label
          htmlFor="audio-upload"
          className={`upload-label ${isUploaded ? 'disabled' : ''}`}
          style={{ pointerEvents: isUploaded ? 'none' : 'auto', opacity: isUploaded ? 0.5 : 1 }}
        >
          🎧 음성 파일 업로드
        </label>

        {uploadedFileName && (
          <div className="file-item">
            <FaFileAudio style={{ marginRight: '6px', color: '#4f9ffb' }} />
            <span className="file-name">{uploadedFileName}</span>
          </div>
        )}

        <div className="upload-right">
          {isUploading && <span className="upload-status">⏳ 변환 중...</span>}
          <InfoButton onClick={() => setShowTranscriptInfo(true)} />
        </div>
      </div>

      <input
        id="audio-upload"
        type="file"
        accept=".mp3,.wav"
        onChange={handleLoadAudio}
        style={{ display: 'none' }}
      />

      {/* 변환 텍스트 영역 */}
      <textarea
        className="form-item"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="변환된 텍스트"
        rows={10}
        disabled={step !== 'transcripted'}
      />

      <div className="button-row">
        <button
          className="transcript-btn"
          disabled={!(step === 'transcripted' || step === 'summarized') || !transcript}
          onClick={() => handleDownload(transcript, '원본_전사.txt')}
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

      {/* 요약 텍스트 영역 */}
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
        onClick={() => handleDownload(summary, '요약본.txt')}
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
