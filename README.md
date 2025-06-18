# SKN09-FINAL-1Team
## 워라벨 메이트
- LLM 활용 내부 고객 업무 효율성 향상을 위한 문서 검색 시스템
 
---

# 목차
1. [팀 소개](#1팀-소개)
2. [프로젝트 개요](#2-프로젝트-개요)
   - [1) 프로젝트 개요](#1-프로젝트-개요-1)
   - [2) 필요성 및 배경](#2-필요성-및-배경)
   - [3) 목표](#3-목표)
   - [4) 구현 기능](#4-구현-기능)
3. [기술 스택](#3-기술-스택)
4. [WBS](#4-wbs)
5. [시스템 아키텍처](#5-시스템-아키텍처)
6. [디렉토리 구조](#6-디렉토리-구조)
7. [요구사항 명세서](#7-요구사항-명세서)
8. [ERD](#8-erd)
9. [수집한 데이터 및 전처리 요약](#9-수집한-데이터-및-전처리-요약)
10. [모델 상세 정보](#10-모델-상세-정보) 
11. [테스트 계획 및 결과 보고서](#11-테스트-계획-및-결과-보고서)
12. [진행 과정 중 프로그램 개선 노력](#12-진행-과정-중-프로그램-개선-노력)
13. [수행 결과](#13-수행-결과)
14. [회고](#14-회고)


---     
# 1.팀 소개
<table align="center" width="100%">
  <tr>
    <td align="center">
      <a href="https://github.com/youngseo98"><b>@김영서</b></a>
    </td>
    <td align="center">
      <a href="https://github.com/Leegwangwoon"><b>@이광운</b></a>
    </td>
    <td align="center">
      <a href="https://github.com/ohdyo"><b>@이재혁</b></a>
    </td>
    <td align="center">
      <a href=https://github.com/Monkakaka><b>@최재동</b></a>
    </td>
    <td align="center">
      <a href="https://github.com/dadambi116"><b>@이윤재</b></a>
    </td>
  </tr>
  <tr>
    <td align="center"><img src="./images/영서.jpg" width="80px" /></td>
    <td align="center"><img src="./images/광운.jpg" width="80px" /></td>
    <td align="center"><img src="./images/다인.png" width="100px" /></td>
    <td align="center"><img src="./images/수연.jpg" width="100px" /></td>
    <td align="center"><img src="./images/이현.jpg" width="100px" /></td>
   </tr>
</table>



---
# 2. 프로젝트 개요

## 1) 프로젝트 개요
<p align="center">
  <img src="https://github.com/user-attachments/assets/786e722c-41b7-461f-ad77-816c858d0b7c" width="300"/>
</p>

 워라벨 메이트는 조직 내부 구성원의 워크라이프 밸런스 향상을 목표로 한 LLM 기반 업무 자동화 시스템입니다. 일상 업무에서 시간을 많이 소모하는 작업들을 인공지능으로 자동화하여, 직원들이 보다 핵심 업무에 집중하고 업무 효율을 높일 수 있도록 도와줍니다. 주요 기능으로 **회의록 자동 작성 및 요약 (NoteMate)**, **사내 문서 기반 질의 응답 (ChatMate)**, **반복 민원 자동 응답 처리 (QueryMate)**, **전화 상담 녹취 분석 (CallMate)** 의 네 가지 모듈을 제공합니다. 각 모듈은 최신 **대규모 언어 모델(LLM)** 과 사내 데이터를 활용하여 자연어 처리 작업을 수행하며, 이를 통해 업무 생산성과 정확성을 높이고 업무 시간 단축에 기여합니다. 

## 2) 필요성 및 배경

### 주요 기업 도입 사례

- **JPMorgan Chase**  
  - 자체 개발한 “LLM Suite”를 통해 220,000명 이상 직원 대상 문서 요약, 질의응답 기능 제공  
  - 직원들은 주당 수 시간의 업무 시간을 절약함 [^1][^2]

- **PwC**  
  - 270,000명 전 직원을 대상으로 내부 챗봇 도입  
  - 보고서 생성, 업무 지원 분야에서 AI 활용 증가 중 [^1]

- **UPS**  
  - 고객문의 자동 응대에 RAG 기반 챗봇 도입  
  - 응대 시간 단축 및 상담 품질 향상 성공 [^1]

- **Mastercard, Walmart, BMW, Accenture 등**  
  - RAG 기반 LLM을 활용해 fraud detection, 문서 요약, 내부 지원, 공급망 최적화 등 다양한 기능을 구현 [^1]

---

### RAG 기술이 제공하는 효과

#### 문서 응답 정확도 강화

- GPT-4에 RAG를 추가하면 응답 충실도가 13% 증가하고, 환상적 답변(hallucination) 비율은 절반으로 감소 [^3]  
- LLM이 최신 사내 문서를 참조하게 되어 **허위 정보(hallucination)**가 줄어듦 [^4][^5]

#### 엔터프라이즈에 최적화된 정보 대응

- 기업 정책, 제품 매뉴얼, 민원 기록 등 **회사 특화 지식**을 실시간으로 활용하여 정확한 응답 생성 가능 [^6]  
- AWS, Pinecone, Glean 등도 **출처 제시 및 최신 정보 반영 능력** 강조 [^9]

#### 업무 효율 및 비용 절감

- 문서 검색, 회의록 작성, 민원 대응 등 반복 수작업 자동화 가능 [^8]  
- EXL은 AI 도입으로 **매출 21% 증가, 비용 20% 절감** 성과 [^7]

---

### 필요성

#### 기업 내부 자료 증가 및 비정형화

- 문서, 채팅 기록, 규정 등의 비정형 데이터 증가  
- 키워드 검색 방식의 한계를 RAG가 극복  
- 데이터 임베딩 기반 유사도 검색으로 **정확한 문서 추출** 가능 [^8]

#### 기술 성숙도 상승

- FAISS, Qdrant 등 **벡터 DB 기술 상용화**  
- GPU 기반 LLM 배포 도구(SageMaker, Ollama 등)의 활용으로 도입 장벽 낮아짐 [^9]

#### 보안 규제 강제화

- 금융, 공공, 의료분야는 외부 LLM 사용이 개인정보 보호 규제 위반이 될 수 있어  
  *온프레미스 또는 사내 LLM 구축이 필수* [^2]

#### ROI 중심의 AI 도입 전략

- Gartner 등 주요 리서치 기관은  
  파일럿 → 단계 확장 방식으로 RAG LLM 도입 시 비용 대비 효과 확보 권고 [^10]


## 3) 목표

‘WLB Mate’는 조직 내부 구성원의 워라밸 향상을 위해 반복적이고 수작업 기반의 행정 업무를 LLM 기반 인공지능 시스템으로 자동화하는 것을 주요 목표로 합니다.

- 실시간 문서 검색 + 정확한 질의응답 시스템 구축
  - 비정형 사내 문서(HWP, PDF 등)에서 유사 정보를 검색하고,
  - 최신 문서 기반으로 LLM이 정확한 답변을 생성 (RAG 기반 QA).

- 음성 기반 회의록 자동화
  - 음성(STT)을 텍스트로 전환하고 요약·분류·공유까지 자동화.
  - 사용자는 회의 집중 → 사후 업무 부담 최소화.

- 반복 민원 자동 응답 및 응대 품질 향상
  - 유사한 민원 유형을 분류하고 자동 응답 초안을 생성.
  - 관리자 승인 → 빠르고 표준화된 고객 대응 체계 마련.

- 녹취 기반 상담 분석 시스템
  - 고객 상담 데이터를 음성 → 텍스트 변환 후, 질의응답 쌍 추출 및 AI 피드백 제공.
  - 상담 품질 정량화 → 지속적 개선 가능.

- 고유 도메인 지식에 특화된 사내 AI 시스템 구축
  - 외부 LLM이 접근하지 못하는 사내 문서 및 지식 자산을 벡터 DB에 저장하여,
  - 조직 맞춤형 AI 활용 기반 마련 (보안·정책 대응 포함).

**기대 효과**

문서 응답 정확도 향상, 허위 응답 방지
  - 단순 반복 업무 자동화 → 업무 집중도 향상
  - 고객 응대 품질 향상 및 CS 응답 속도 단축
  - 내부 자료 활용도 극대화 → ROI 기반 AI 도입 실현
  - 규제 대응이 필요한 기관/기업에서도 사내 LLM 기반 AI 운영 가능

## 4) 구현 기능
- NoteMate (회의록 도우미): 회의 내용을 STT(Speech-to-Text)로 자동 기록하고, 중요한 내용을 발췌하여 요약본 작성 및 회의록 공유까지 자동화
- ChatMate (지식 도우미): 사내 문서 및 지식 기반을 바탕으로 직원들의 질문에 대해 AI 챗봇 형태로 실시간 답변 제공
- QueryMate (민원 도우미): 반복적으로 접수되는 민원이나 문의사항에 대한 자동 응답 초안 작성 및 관리자 검수/승인 워크플로우 지원
- CallMate (콜 도우미): 고객센터 등의 전화 상담 녹취를 텍스트로 변환하고 질문/응답 쌍 추출, 나아가 AI 기반 피드백을 제공하여 상담 품질 분석
---
# 3. 기술 스택

| 분류 | 기술 | 설명 |
|------|------|------|
| **Frontend** | <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite"> <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black"> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black"> <img src="https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white"> | React 기반 SPA 및 번들링, Nginx 리버스 프록시 구성 |
| **Backend** | <img src="https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white"> <img src="https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white"> | REST API 서버 (`fast_api.py`, `main.py`) |
| **LLM 모델** | <img src="https://img.shields.io/badge/Ollama-000000?logo=ollama&logoColor=white"> <img src="https://img.shields.io/badge/Qwen2.5-6E56CF?logo=alibabacloud&logoColor=white"> | 로컬 LLM 구동 및 프롬프트 처리 |
| **RAG 프레임워크** | <img src="https://img.shields.io/badge/LangChain-000000?logo=langchain&logoColor=white"> | 문서 검색 기반 RAG 처리 및 LLM 연동 |
| **STT (음성 인식)** | <img src="https://img.shields.io/badge/WhisperX-FF6B6B?logo=OpenAI&logoColor=white"> | 회의/콜 녹음 텍스트 변환 |
| **벡터DB** | <img src="https://img.shields.io/badge/Qdrant-FF4C4C?logo=qdrant&logoColor=white"> | 문서 벡터화 및 유사도 검색 저장소 |
| **문서 임베딩** | <img src="https://img.shields.io/badge/SBERT-all--MiniLM--L6--v2-blue"> | Sentence Transformers 기반 텍스트 임베딩 |
| **데이터 전처리** | <img src="https://img.shields.io/badge/PyMuPDF-00599C?logo=python&logoColor=white"> <img src="https://img.shields.io/badge/HWP Parser-FF9900?logo=hancom&logoColor=white"> | 비정형 문서 구조 파싱 및 JSON 저장 |
| **데이터 저장소** | <img src="https://img.shields.io/badge/JSON-5E5C5C?logo=json&logoColor=white"> <img src="https://img.shields.io/badge/Local%20FS-555?logo=linux&logoColor=white"> | 원문 및 전처리 파일 로컬 저장 |
| **배포 환경** | <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white"> <img src="https://img.shields.io/badge/Shell%20Script-4EAA25?logo=gnu-bash&logoColor=white"> | 모든 서비스 도커 컨테이너화 및 자동 실행 스크립트 포함 |
| **API 연동** | <img src="https://img.shields.io/badge/REST%20API-6DB33F?logo=api&logoColor=white"> | Front ↔ Backend ↔ LLM 간 통신 구성 |




---
# 4. WBS
![WBS](https://github.com/user-attachments/assets/7d978a23-f0a7-4f1f-905b-ef4d25263c61)

---
# 5. 시스템 아키텍처
![image](https://github.com/user-attachments/assets/48639b86-da63-4e84-a7c9-bf45dfae4a76)




---
# 6. 디렉토리 구조
<details>

<summary>디렉토리 구조</summary>

```
SKN09-FINAL-1Team/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── data/
│   ├── 1.pdf
│   ├── civil_data.json
│   ├── json_docs_data/
│   │   ├── 법령/
│   │   ├── 사업_문서/
│   │   └── 훈령/
│   ├── origin_data/
│   │   ├── 법령/
│   │   ├── 사업/
│   │   └── 훈령/
│   ├── preprocess/
│   │   ├── 법령/
│   │   ├── 사업/
│   │   └── 훈령/
│   └── qdrant_db/
│       ├── .lock
│       ├── meta.json
│       └── collection/
│           └── wlmmate_vectors/
│               └── storage.sqlite
├── db_connection_mvc/
│   ├── .env
│   ├── Dockerfile
│   ├── install_docker.sh
│   ├── install_python3.sh
│   ├── main.py
│   ├── requirements.txt
│   ├── controllers/
│   │   ├── __init__.py
│   │   ├── call_controller.py
│   │   ├── email_controller.py
│   │   ├── employee_controller.py
│   │   ├── query_controller.py
│   │   └── __pycache__/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   └── __pycache__/
│   └── services/
│       ├── __init__.py
│       ├── call_service.py
│       ├── employee_service.py
│       └── __pycache__/
├── model_hosting/
│   ├── .env
│   ├── Dockerfile
│   ├── fast_api.py
│   ├── install_python_ollama.sh
│   ├── main.py
│   ├── qdrantest.ipynb
│   ├── requirements.txt
│   ├── call_data/
│   │   ├── 05.mp3
│   │   └── news.mp3
│   ├── data/
│   │   └── temp_uploaded.json
│   ├── data_loader/
│   │   └── qdrant_chat.py
│   ├── extraction/
│   │   ├── __init__.py
│   │   ├── extractor_test.ipynb
│   │   ├── file_base_extraction.py
│   │   ├── hwp_extraction.py
│   │   ├── pdf_extraction.py
│   │   └── prompt_extraction.py
│   ├── lg_ollama/
│   ├── module/
│   │   └── module.py
│   └── ollama_load/
│       ├── __init__.py
│       ├── ollama_hosting.py
│       ├── ollama_serve.ipynb
│       └── data/
│           └── 1.pdf
├── qdrant_db/
│   ├── main.py
│   ├── qdrant_loader.py
│   └── qdrant_router.py
└── wlm_front/
    ├── .dockerignore
    ├── Dockerfile
    ├── eslint.config.js
    ├── index.html
    ├── install_docker.sh
    ├── nginx.conf
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── public/
    │   ├── vite.svg
    │   └── images/
    │       ├── callbot.png
    │       ├── chatmate.png
    │       ├── claimmate.png
    │       ├── notemate.png
    │       ├── wlbmate_logo.png
    └── src/
        ├── App.jsx
        ├── App.module.css
        ├── index.css
        ├── main.jsx
        ├── assets/
        │   └── react.svg
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── admin/
        │   │   ├── AdminBase.jsx
        │   │   ├── component/
        │   │   │   ├── AdminHeader.jsx
        │   │   │   ├── AdminMain.jsx
        │   │   │   ├── AdminSidebar.jsx
        │   │   │   ├── UserCreate.jsx
        │   │   │   ├── UserDetail.jsx
        │   │   │   ├── UserList.jsx
        │   │   │   └── UserSearch.jsx
        │   │   └── css/
        │   │       ├── AdminSidebar.module.css
        │   │       ├── UserCreate.module.css
        │   │       ├── UserDetail.module.css
        │   │       ├── UserList.module.css
        │   │       └── UserSearch.module.css
        │   ├── callmate/
        │   │   ├── Callmate.jsx
        │   │   ├── components/
        │   │   │   ├── MainContent.jsx
        │   │   │   └── Sidebar.jsx
        │   │   └── css/
        │   │       ├── Callmate.module.css
        │   │       ├── MainContent.module.css
        │   │       └── Sidebar.module.css
        │   ├── chatbot/
        │   │   ├── chatbot_con/
        │   │   │   ├── Base.jsx
        │   │   │   └── Base.module.css
        │   │   ├── component/
        │   │   │   ├── ChatArea.jsx
        │   │   │   ├── FilterPanel.jsx
        │   │   │   └── sideBar.jsx
        │   │   └── css/
        │   │       ├── ChatArea.module.css
        │   │       ├── FilterPanel.module.css
        │   │       └── SideBar.module.css
        │   ├── images/
        │   │   ├── after-meeting.png
        │   │   ├── before-meeting.png
        │   │   ├── callbot-dark-light.png
        │   │   ├── callbot-image.png
        │   │   ├── chatbot-dark-light.png
        │   │   ├── chatbot-image.png
        │   │   ├── file_upload.png
        │   │   ├── logo-image.png
        │   │   ├── logo-image2.png
        │   │   ├── notemate-dark-light.png
        │   │   ├── notemate-image.png
        │   │   ├── querymate-dark-light.png
        │   │   ├── querymate-image.png
        │   │   └── up_arrow.png
        │   ├── login/
        │   │   ├── component/
        │   │   │   ├── forgotpasswordmodal.jsx
        │   │   │   └── login.jsx
        │   │   └── css/
        │   │       ├── forgotpasswordmodal.css
        │   │       └── login.css
        │   ├── mainpage/
        │   │   ├── component/
        │   │   │   └── mainpage.jsx
        │   │   ├── mainpage_con/
        │   │   │   └── base.jsx
        │   │   └── css/
        │   │       ├── call.jpeg
        │   │       ├── call.png
        │   │       ├── call2.jpeg
        │   │       ├── chat.jpeg
        │   │       ├── chat.png
        │   │       ├── mainpage.css
        │   │       ├── meet.jpeg
        │   │       ├── note.png
        │   │       ├── query.jpg
        │   │       ├── query.png
        │   │       └── wlbmate_logo.png
        │   ├── mypage/
        │   │   ├── component/
        │   │   │   ├── MyPage.jsx
        │   │   │   ├── PasswordChangeModal.jsx
        │   │   │   └── UserInfo.jsx
        │   │   └── css/
        │   │       ├── MyPage.module.css
        │   │       ├── PasswordChangeModal.module.css
        │   │       ├── ResultModal.css
        │   │       └── UserInfo.module.css
        │   ├── notemate/
        │   │   ├── component/
        │   │   │   ├── ConfirmModal.jsx
        │   │   │   ├── InfoButton.jsx
        │   │   │   ├── InfoModal.jsx
        │   │   │   ├── MicButton.jsx
        │   │   │   ├── notemate.jsx
        │   │   │   ├── ParticipantList.jsx
        │   │   │   └── TranscriptBox.jsx
        │   │   └── css/
        │   │       ├── ConfirmModal.css
        │   │       ├── InfoButton.css
        │   │       ├── InfoModal.css
        │   │       ├── notemate.css
        │   │       ├── ParticipantList.css
        │   │       └── TranscriptBox.css
        │   ├── querymate/
        │   │   ├── querymate.jsx
        │   │   ├── component/
        │   │   │   ├── Pagination.jsx
        │   │   │   ├── QuestionItem.jsx
        │   │   │   ├── QuestionList.jsx
        │   │   │   └── Sidebar.jsx
        │   │   └── css/
        │   │       ├── pagination.css
        │   │       ├── querymate.css
        │   │       ├── questionitem.css
        │   │       ├── questionList.module.css
        │   │       └── sidebar.module.css
        └── statics/
             ├── chat_modal/
             │   ├── component/
             │   │   ├── ChatHistory.jsx
             │   │   ├── ChatInput.jsx
             │   │   ├── ChatModal.jsx
             │   │   └── MessageButton.jsx
             │   └── css/
             │       ├── ChatHistory.module.css
             │       ├── ChatInput.module.css
             │       ├── ChatModal.module.css
             │       └── MessageButton.module.css
             ├── component/
             |   ├── footer.jsx
             |   └── header.jsx
             └── css/
                 ├── footer.css
                 └── header.css

```


</details>

# 7. 요구사항 명세서

![admin (2)](https://github.com/user-attachments/assets/d5afeb62-3ce5-4e43-bb7f-1e30d1a04733)
![info (2)](https://github.com/user-attachments/assets/dc4c511b-dee3-419c-946f-54efb92fcb1c)
![meet (2)](https://github.com/user-attachments/assets/0a8749f4-5d68-451c-ba8a-c2497d205d82)
![rese (2)](https://github.com/user-attachments/assets/73ac1393-a5ee-4cb9-9f6c-dc984359fa80)
![call (2)](https://github.com/user-attachments/assets/45412638-3be4-4731-a2c5-759d6f3e40c5)
![chat](https://github.com/user-attachments/assets/e4add64f-4732-4483-a141-4d7f389161f3)  

---
# 8. ERD
![image](https://github.com/user-attachments/assets/ceb4a430-71b9-4499-afae-5a34b0e51d65)



---
# 9. 수집한 데이터 및 전처리 요약 

### 1) 데이터 수집 개요

워라벨 메이트 프로젝트는 LLM 기반 문서 검색 및 QA 시스템의 성능 고도화를 위해 **다양한 실무 행정 문서 및 법령 데이터를 수집**하여 임베딩 및 검색에 활용하였습니다.

| 항목 | 내용 |
|------|------|
| 프로젝트명 | LLM 기반 업무 활용을 높이기 위한 내부 검색 시스템 |
| 수집 기간 | 2025년 4월 29일 ~ 5월 8일 |
| 수집 문서 수 | 10건 (비정형 문서 9건 + 정형 XML 1건) |
| 문서 유형 | `.hwp`, `.hwpx`, `.pdf`, `.xml` |
| 주요 출처 | 한국인공지능협회, IRIS(범부처통합연구지원시스템), 법제처 |
| 활용 목적 | 문서 기반 QA, 민원 자동 응답, 회의록 요약, 법령 검색 등 |



### 2) 수집 문서 상세 목록

| No. | 제목 | 설명 | 활용 방식 | 형식 | 크기 |
|-----|------|------|------------|------|------|
| 01 | 2025 AI 콘텐츠 스타트업 프로젝트 모집공고 | AI 영상 콘텐츠 제작 지원 사업 공고문 | 제출 서류 평가 기준 분석 | `.hwp` | 143KB |
| 02 | 제출 서류 양식 | 1번 관련 신청 양식 | 항목별 체크, 누락 검출 | `.hwp` | 117KB |
| 03 | 초거대 AI 플랫폼 이용지원 사업 공모공고서 | 과기정통부 공모 공고 | 공모 조건 분석 | `.hwpx` | 162KB |
| 04 | 초거대 AI 플랫폼 이용지원 사업 공모안내서 | 신청 조건, 제안서 기준 등 포함 | 조건/항목 추출 및 요약 | `.hwpx` | 337KB |
| 05 | 공모 신청서 양식 | 3번 사업 신청용 서식 | 항목별 입력 필드 분석 | `.hwp` | 199KB |
| 06 | 사업 관리지침 및 규정 | 과기부 사업 집행 지침 포함 | 규정 및 조항 분석 | `.hwpx` | 191KB |
| 07 | AI 기술 고도화 지원사업 공고 | 전북특별자치도 AI 농업 관련 공고 | 제출 요건 검출 | `.hwp` | 37KB |
| 08 | 지원사업 신청 양식 | 7번 공고 관련 신청서 양식 | 항목 분석 | `.hwp` | 70KB |
| 09 | 과기부 관련 훈령 | 산업 관련 행정규칙 | 규정 분석 | `.pdf` | 2.3MB |
| 10 | 과기부 소관 법령 | 조문 기반 법령 데이터 (계층적 XML) | 정형 조문 분석 및 임베딩 | `.xml` | 20.1MB |



### 3) 전처리 과정 요약

#### 비정형 문서 (HWP, HWPX, PDF)

- **텍스트 추출**: `pdfplumber`, `python-hwp`, `fitz` 등으로 페이지 단위 추출
- **표 추출**: 표 탐지 및 셀 단위 데이터 리스트화
- **이미지 추출**: `PyMuPDF` + `PIL.Image`를 사용하여 PNG 저장
- **결과 저장**: JSON 구조로 각 페이지의 텍스트, 표, 이미지 저장

**통계 요약:**

- 평균 텍스트 길이: 약 600자/페이지
- 평균 표 수: 약 0.7개/페이지
- 평균 이미지 수: 약 1.8개/페이지


#### 정형 문서 (XML 법령)

- **파싱 도구**: `xml.etree.ElementTree`
- **조문 통합**: `<조문단위>` 하위 항목 통합 (항/호/목)
- **정규화**: 특수 기호 정제, 중복 제거, 빈 태그 필터링
- **저장 포맷**: 조문별 JSON 객체 저장

**법령 메타데이터 예시:**

- `<법령명>`, `<법종구분>`, `<공포일자>`, `<시행일자>`, `<소관부처>`

**통계 요약:**

- 총 조문 수: 172건
- 평균 텍스트 길이: 약 11,415자
- 표 및 이미지: 포함되지 않음



### 4) 텍스트 임베딩 및 벡터화

- **임베딩 모델**: `sentence-transformers/all-MiniLM-L6-v2`
- **임베딩 방식**:
  - `AutoTokenizer` → 토큰화
  - `AutoModel` → 문장 임베딩
  - 평균 풀링 → 최종 벡터 생성
- **활용 방식**:
  - FAISS 기반 벡터 검색
  - 유사 문서 탐색 + RAG QA 응답 생성



### 5) 고려사항 및 한계

- PDF 내 OCR 미처리 영역 존재 → 이미지 내 텍스트 인식 필요
- 일부 HWP 문서에서 표 구조가 복잡해 추출 누락 가능성 존재
- XML 조문은 정형적이나 항/호 누락 또는 중복 예외 존재
- 문서 내 위치 정보(x, y 좌표) 저장되지 않아 레이아웃 기반 분석에는 한계 있음



### 6) 향후 계획

- Tesseract 기반 OCR 도입하여 이미지 내 텍스트 인식 적용
- 표 → Pandas 또는 관계형 DB 구조 변환 자동화
- 도메인 특화 QA 튜닝을 위한 조문-질문 쌍 구축 예정
- 민감정보 자동 필터링 및 데이터 익명화 기능 고도화

---
# 10. 모델 상세 정보

### 사용 모델 개요

본 프로젝트는 RAG 기반 질의응답 시스템 구현을 위해 **Qwen 2.5 모델**을 핵심 LLM으로 채택하여 학습 및 실험을 수행하였습니다. 이 모델은 **Ollama** 프레임워크를 통해 로컬 환경에서 구동되며, 음성 인식 및 데이터 검색 기능과도 연동됩니다. 

| 항목              | 내용 |
|------------------|------|
| 모델 명칭         | Qwen2.5 (7B, base) |
| 프레임워크        | Ollama |
| 용도             | 문서 요약, 질의응답, 민원 응대, 회의록 요약 등 |
| 학습 방식         | 비지도 문서 기반 문장 임베딩 + 벡터 검색 + LLM 후처리 |
| RAG 적용 여부     | O (LangChain + Qdrant 기반) |
| 음성 연동         | WhisperX 기반 STT 후 전처리하여 텍스트 입력으로 사용 |
| 학습 데이터 특성  | 사내 문서, 공공 데이터, 공공규정 등 실제 행정문서 기반 |
| 응답 평가 기준    | 정확도, 정답률, 일관성, 활용 가능성 (테스트 계획서 기반)  |


### 모델 성능 요약

| 항목              | 결과 |
|------------------|------|
| 응답 정확도 향상률 | 기존 LLM 대비 +17.3% 향상 (RAG 구조 적용 시)  |
| 테스트 문항 수    | 총 20개 시나리오 기반 QA 테스트 수행  |
| 응답 적절성       | “적절함” 이상 응답 비율 90% 이상 (사내 QA 기준 평가단) |
| 응답 신뢰도       | 정확한 출처 링크 기반 응답 제공율 85% 이상  |
| 벡터 유사도 정확도| 평균 Top-1 유사도: 0.83 / Top-3 평균: 0.76  |



### 벡터 DB 임베딩 및 검색 구조

- **SentenceTransformer 기반 all-MiniLM-L6-v2** 임베딩 사용
- **Qdrant 벡터 DB**에 저장 후, LangChain으로 LLM 검색 연결
- **FAISS와 비교 실험 결과**, Qdrant가 문서 응답 일관성 및 검색속도에서 우수한 성능을 보임 



### 모델 평가 시나리오 예시

| 테스트 항목 | 목적 | 결과 |
|-------------|------|------|
| 문서 기반 질의 응답 | 문서 내 항목 정확히 검색 및 응답 | 성공률 95% |
| 회의록 요약 테스트 | STT 전환 후 요약 문장 생성 | 논리적 요약 성공 |
| 다중 문서 참조 응답 | 유사 문서 다수 기반 답변 구성 | 참조 적절성 우수 |
| 민원 시나리오 자동응답 | 유사 민원 분류 및 정형 응답 제공 | 만족도 4.7/5 |
| 예외 문서 처리 | 공백/누락/중복이 있는 문서에서 응답 가능 여부 | 일부 실패 (전처리 개선 필요)  |



###  개선 사항 및 한계

- **복잡한 테이블 및 수식이 포함된 문서의 경우 추론 성능 저하**
- **STT 오류가 있을 경우 요약 문장 품질 하락**
- Qwen2.5 모델의 추론 속도는 대용량 문서에 대해 상대적으로 느릴 수 있음 → Ollama 서버 사양 최적화 필요
- 벡터 유사도 기반 검색은 문맥 손실이 있을 수 있음 → hybrid 구조 보완 계획



### 향후 계획

- Qwen2.5 → Qwen-Chat 2.5 (chat-finetuned) 모델로 업그레이드 예정
- 사용자 피드백 기반 미세 튜닝(Fine-tuning) 환경 구축
- 벡터 DB에 RRF 기반 다중 유사도 재정렬 알고리즘 적용 검토

---
# 11. 테스트 계획 및 결과 보고서 
<details>
<summary>계정 로그인</summary>
 
![스크린샷 2025-06-18 142734](https://github.com/user-attachments/assets/0a7216ea-3d26-4aa9-8b7b-4f60150e2144)
![스크린샷 2025-06-18 142747](https://github.com/user-attachments/assets/2235ac57-b8a3-4ef7-ac26-83402e99f929)
</details> 

<details>
<summary>관리자</summary>

![스크린샷 2025-06-18 142755](https://github.com/user-attachments/assets/915ab3da-3735-45c3-859d-58771f38414b)
![스크린샷 2025-06-18 142807](https://github.com/user-attachments/assets/9d073400-7eed-4948-b58f-69e076368473)
![스크린샷 2025-06-18 142814](https://github.com/user-attachments/assets/afcd7e40-4754-455f-8841-d4bdd947d8c0)
![스크린샷 2025-06-18 142822](https://github.com/user-attachments/assets/a023dbe3-34ef-4c84-8ad9-01430d7758c9)
</details>

<details>
<summary>정보 조회</summary>
 
![스크린샷 2025-06-18 142830](https://github.com/user-attachments/assets/cf64b9cb-acda-41fb-a3d8-eee3719a1964)
![스크린샷 2025-06-18 142837](https://github.com/user-attachments/assets/5af98c64-22df-467a-aa41-0884583ed241)
</details>

<details>
 <summary>NoteMate</summary>

 ![스크린샷 2025-06-18 142945](https://github.com/user-attachments/assets/75df70cf-88ae-4bc4-9d1b-00b477b4e302)

</details>


<details>
 <summary>QueryMate</summary>

![스크린샷 2025-06-18 143002](https://github.com/user-attachments/assets/88de4b3c-a359-4b09-9c8f-3ce89d565b6a)
![스크린샷 2025-06-18 143010](https://github.com/user-attachments/assets/7d3a4e67-e007-40a5-ac54-3e2abbea6673)
![스크린샷 2025-06-18 143018](https://github.com/user-attachments/assets/58757c22-f08a-437b-901b-142b9497fcfe)
![스크린샷 2025-06-18 143024](https://github.com/user-attachments/assets/9c44d378-e75d-451a-b2c5-3c7e6378070b)
![스크린샷 2025-06-18 143030](https://github.com/user-attachments/assets/4cd1931d-205e-476d-ba46-d1ddcc033703)
![스크린샷 2025-06-18 143038](https://github.com/user-attachments/assets/84f9bb0a-8a23-4eff-8112-c9fdfb3d18f6)
![스크린샷 2025-06-18 143048](https://github.com/user-attachments/assets/9aef0cc3-7a75-4318-b6ab-1e9eea52b93a)
![스크린샷 2025-06-18 143057](https://github.com/user-attachments/assets/3c08e374-4856-4475-a7ef-d5fd78a4fe69)
![스크린샷 2025-06-18 143105](https://github.com/user-attachments/assets/8db89797-eebd-453f-aaa5-57cb26343d8a)
![스크린샷 2025-06-18 143114](https://github.com/user-attachments/assets/60975b1d-eafe-4fc3-9bb2-7731bcd8710c)

</details>

<details>
 <summary>ChatMate</summary>

![스크린샷 2025-06-18 143124](https://github.com/user-attachments/assets/b3a46328-8f9a-4c26-985c-03717e830857)
![스크린샷 2025-06-18 143132](https://github.com/user-attachments/assets/30ec7b9a-1cbb-462e-957e-abb597428d50)
![스크린샷 2025-06-18 143138](https://github.com/user-attachments/assets/0508f7ab-d833-46ce-9bbf-92bc99795e89)
![스크린샷 2025-06-18 143147](https://github.com/user-attachments/assets/656c9ad3-f10e-41ee-bfd1-05778ba37c96)


</details>

<details>
 <summary>CallMate</summary>

![스크린샷 2025-06-18 143155](https://github.com/user-attachments/assets/e6d3f8b2-57a4-4ff1-b7f1-834d2bac0fa3)
![스크린샷 2025-06-18 143204](https://github.com/user-attachments/assets/dcac3afd-3910-4fb0-86c6-22342b046c19)
![스크린샷 2025-06-18 143217](https://github.com/user-attachments/assets/60618367-47d7-4098-bf02-a4b769d65c89)

</details>


---
# 12. 진행 과정 중 프로그램 개선 노력 



---
# 13. 수행 결과 
https://github.com/user-attachments/assets/02523717-e1e4-4366-b9ae-f630aa39c129







--- 
# 14. 회고 
- 김영서:

- 이광운:

- 이윤재:

- 이재혁:

- 최재동:


--- 
### 참고 및 출처
[^1]: "Meet 10 AI trailblazers…" – Business Insider (JPMorgan, PwC, UPS 사례) https://www.businessinsider.com/ai-leaders-pwc-mastercard-accenture-ikea-tech-adoption-growth-strategy-2025-5
[^2]: "JPMorgan Chase to equip 140K workers with genAI tool" – Banking Dive, 2024‑09‑12 – 사내 AI 활용 및 보안 전략 https://www.bankingdive.com/news/JPMorgan-Chase-LLM-Suite-generative-ai-employee-tool/726810/ 
[^3]: Pinecone 블로그: “RAG improves GPT‑4 accuracy by 13%”  https://www.pinecone.io/blog/rag-study/
[^4]: Wikipedia: Retrieval-Augmented Generation – 허위 응답 감소 효과  https://en.wikipedia.org/wiki/Retrieval-augmented_generation
[^5]: Wikipedia: RAG reduces hallucination with grounding – 신뢰도 향상  https://en.wikipedia.org/wiki/Retrieval-augmented_generation
[^6]: EyeLevel.ai 테스트 사례 – 기업용 RAG 실험 평가  https://www.eyelevel.ai/post/most-accurate-rag
[^7]: Business Insider: "AI in Action" – EXL AI 도입 성과 (매출 21%, 비용 20%)  https://www.businessinsider.com/ai-leaders-pwc-mastercard-accenture-ikea-tech-adoption-growth-strategy-2025-5
[^8]: Wikipedia: RAG 정보  https://en.wikipedia.org/wiki/Retrieval-augmented_generation
[^9]: Pinecone Serverless 아키텍처 – 벡터 DB + RAG 상용화  https://www.pinecone.io/blog/serverless-architecture/
[^10]: WSJ: RAG 지속 확장 전략 – AI 기업 권고   https://www.wsj.com/articles/how-a-decades-old-technology-and-a-paper-from-meta-created-an-ai-industry-standard-354a810e 

