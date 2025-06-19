import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import axios from 'axios';
import '../css/TranscriptBox.css';
import InfoButton from './InfoButton.jsx';
import InfoModal from './InfoModal.jsx';
import { FaFileAudio } from 'react-icons/fa';
import { useReactMediaRecorder } from 'react-media-recorder';

const TranscriptBox = forwardRef((props, ref) => {
  const { step, showTranscriptInfo, setShowTranscriptInfo, setStep, isRecording = false, onUploadStateChange } = props;
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [elapsed, setElapsed] = useState(0);

  // react-media-recorder 훅 사용
  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({ audio: true, mimeType: 'audio/webm' });

  // 타이머
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // 녹음 파일 저장 함수 (호스트명+날짜+시간.wav)
  const saveRecording = async () => {
    if (!mediaBlobUrl) {
      return;
    }

    try {
      const response = await fetch(mediaBlobUrl);
      const blob = await response.blob();

      const hostname = window.location.hostname;
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      const filename = `${hostname}_${dateStr}_${timeStr}.wav`;

      // 파일 다운로드(기존)
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      setUploadedFileName(filename);
      setIsUploaded(true);
      clearBlobUrl();

      // === 서버로 업로드 및 텍스트 변환 요청 ===
      setIsUploading(true);
      if (onUploadStateChange) onUploadStateChange(true);
      const formData = new FormData();
      formData.append('file', new File([blob], filename, { type: blob.type }));
      try {
        const res = await fetch('/model/transcribe_audio_chunked', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.chunk_transcripts && Array.isArray(data.chunk_transcripts)) {
          await showChunksLive(data.chunk_transcripts);
        } else {
          setLiveText(data.transcription || '');
          setTranscript(data.transcription || '');
        }
        setStep && setStep('transcripted');
      } catch (err) {
        console.error('녹음 파일 업로드/전사 실패:', err);
      } finally {
        setIsUploading(false);
      }
    } catch (err) {
      console.error('녹음 파일 저장 실패:', err);
    }
  };

  // 녹음 시작/종료 로직을 'step' 프롭에 따라 처리
  useEffect(() => {
    if (step === 'recording' && status === 'idle') {
      startRecording();
      setUploadedFileName('');
      setIsUploaded(false);
      clearBlobUrl();
    } else if (step !== 'recording' && status === 'recording') {
      stopRecording();
    }
  }, [step, status, startRecording, stopRecording, clearBlobUrl]);

  // mediaBlobUrl이 생성되고 녹음 상태가 'stopped'가 되면 자동 다운로드
  useEffect(() => {
    if (mediaBlobUrl && status === 'stopped') {
      saveRecording();
    }
  }, [mediaBlobUrl, status, saveRecording]); // saveRecording도 종속성에 포함

  useImperativeHandle(ref, () => ({
    getTextData: () => ({ transcript, summary }),
    setTranscript: (text) => setTranscript(text),
    setSummary: (text) => setSummary(text),
    appendTranscript: (line) =>
      setTranscript((prev) => prev.trim() + '\n' + line.trim()),
    setExampleTranscript: (text) => setTranscript(text),
  }));

  const showChunksLive = async (chunks) => {
    setLiveText('');
    let current = '';
    for (let i = 0; i < chunks.length; i++) {
      current += (i > 0 ? ' ' : '') + chunks[i];
      setLiveText(current);
      await new Promise((res) => setTimeout(res, 700));
    }
    setTranscript(current);
  };

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
    if (onUploadStateChange) onUploadStateChange(true);
    setLiveText('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(
        '/model/transcribe_audio_chunked',
        {
          method: 'POST',
          body: formData
        }
      );
      const data = await response.json();
      if (data.chunk_transcripts && Array.isArray(data.chunk_transcripts)) {
        await showChunksLive(data.chunk_transcripts);
      } else {
        setLiveText(data.transcription || '');
        setTranscript(data.transcription || '');
      }
      setStep && setStep('transcripted');
    } catch (err) {
      console.error('오디오 파일 전사 실패:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSummarize = async () => {
    if (!transcript) return;
    setIsSummarizing(true);
    try {
      const response = await axios.post('/model/summarize_text', {
        text: transcript,
      });
      setSummary(response.data.summary);
      setStep && setStep('summarized');
    } catch (err) {
      console.error('요약 실패:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  // 타이머 포맷 함수
  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="transcript-box">
      {/* 마이크 아이콘 및 타이머는 녹음 상태에 따라 표시됩니다. */}
      <div className="mic-icon" style={{ marginBottom: '12px' }}>
        {isRecording && <div className="timer-text">⏱ {formatTime(elapsed)}</div>}
      </div>

      {/* 업로드 영역 */}
      <div className="upload-row">
        <label
          htmlFor="audio-upload"
          className={`upload-label ${isUploaded || isRecording ? 'disabled' : ''}`}
          style={{
            pointerEvents: (isUploaded || isRecording) ? 'none' : 'auto',
            opacity: (isUploaded || isRecording) ? 0.5 : 1,
          }}
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
          <InfoButton className="info-btn" onClick={() => setShowTranscriptInfo(true)} />
        </div>
      </div>

      <input
        id="audio-upload"
        type="file"
        accept=".mp3,.wav"
        onChange={handleLoadAudio}
        style={{ display: 'none' }}
        disabled={isRecording || isUploaded}
      />

      {/* 변환 텍스트 영역 */}
      <textarea
        className="form-item"
        value={step === 'transcripted' ? transcript : liveText}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="변환된 텍스트"
        rows={10}
        readOnly={step === 'summarized' || step === 'recording' || isUploading}
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
          disabled={!transcript || isSummarizing || step === 'summarized'}
          style={{ marginRight: isSummarizing ? '8px' : 0 }}
        >
          요약
        </button>
        {isSummarizing && (
          <span className="upload-status" style={{ alignSelf: 'center' }}>
            ⏳ 요약 중...
          </span>
        )}
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

      <InfoModal
        open={showTranscriptInfo}
        onClose={() => setShowTranscriptInfo(false)}
      >
        <b>변환된 텍스트/요약 결과 입력 안내</b>
        <br />
        - 회의 종료 후 변환된 텍스트가 자동으로 생성됩니다.
        <br />
        - 텍스트는 필요에 따라 직접 수정할 수 있습니다.
        <br />
        - 요약 버튼을 누르면 요약 결과가 생성되며, 이 역시 수정 가능합니다.
        <br />
        - 모든 입력이 완료되면 다운로드 및 전송 기능이 활성화됩니다.
      </InfoModal>
    </div>
  );
});

export default TranscriptBox;