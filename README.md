# VitaSense: 개인 맞춤형 영양제 추천 및 알림 시스템


## 개요

본 프로젝트는 사용자가 업로드한 건강검진 PDF를 분석하여, 개인의 건강 상태에 맞는 영양제를 추천하고 카카오톡을 통해 정해진 시간에 복용 알림을 보내주는 **Node.js 기반의 지능형 헬스케어 시스템**입니다.

Express로 API 서버를 구축하고, Python 스크립트를 연동해 PDF에서 건강 수치를 추출합니다. 사용자는 카카오 로그인을 통해 인증되며, 모든 알람과 복용 기록은 MySQL 데이터베이스에 안전하게 관리됩니다.

## 주요 기능

  * **카카오 소셜 로그인:** 카카오 API를 이용한 간편 로그인 및 사용자 인증을 구현합니다. (JWT 발급)
  * **건강검진 PDF 분석:** Python (`PyMuPDF`, `easyocr`)을 사용해 PDF 문서에서 체질량지수, 혈압, 공복혈당 등의 건강 수치를 자동으로 추출합니다.
  * **건강 상태 판정 및 점수화:** 추출된 수치를 기반으로 "고혈압 전단계", "경도 이상" 등 건강 상태를 판정하고, 총 건강 점수를 100점 만점으로 계산합니다.
  * **맞춤형 영양제 추천:** 건강 판정 결과(키워드)를 기반으로 자체 DB에 저장된 영양제 목록을 조회하여 사용자에게 추천합니다.
  * **카카오톡 알림 스케줄러:** 사용자가 영양제와 복용 횟수를 선택해 알람을 설정할 수 있습니다. Node.js 서버는 `node-cron`을 이용해 1분마다 DB를 확인하며, 설정된 시간이 되면 카카오톡 "나에게 메시지 보내기" API를 호출하여 사용자에게 자동 알림을 전송합니다.
  * **복용 기록 관리:** 프론트엔드에서 API를 통해 오늘의 알람 목록을 조회하고(`GET /alarms/today`), 복용 여부를 "복용" 또는 "미복용" 상태로 업데이트할 수 있습니다.

## 프로젝트 구성 파일

| 파일명 | 설명 |
| :--- | :--- |
| **`index.js`** | **메인 서버 파일.** Express 서버 실행, 전체 API 라우팅, 카카오 알림 스케줄러(Cron)를 포함합니다. |
| **`auth/authController.js`** | 카카오 로그인 콜백을 처리하고, 인증 성공 시 서버의 자체 JWT를 발급합니다. |
| **`auth/authMiddleware.js`** | API 요청 시 `token` 쿠키를 검증하여 사용자를 인증하는 미들웨어입니다. |
| **`auth/kakaoAuthService.js`** | 카카오 토큰 발급, 사용자 정보 조회를 위한 API 호출 및 DB 저장을 담당합니다. |
| **`analysis/pdfIO.js`** | Node.js와 Python 스크립트(`getResults`, `getJudge`, `getScore`) 간의 데이터 입출력을 처리합니다. |
| **`analysis/services/alarmScheduler.js`** | 알람 설정(`setupUserAlarms`), 알람 조회, 복용 상태 변경(`recordIntakeStatus`) 등 알람 관련 DB 로직을 처리합니다. |
| **`analysis/services/notificationService.js`** | `alarm_id`를 받아 카카오톡 알림 전송 API(`sendKakaoTalk`)를 실행합니다. |
| **`analysis/main.js`** | **[1회성 스크립트]** `supplements_dummy.json`의 영양제 원본 데이터를 `vitasense` DB에 삽입합니다. |
| **`extract-pdf/extractor/getResults.py`** | `PyMuPDF` 또는 `easyocr`를 사용해 PDF 파일에서 건강 수치 텍스트를 추출합니다. |
| **`extract-pdf/extractor/getJudge.py`** | `getResults.py`로 추출된 수치를 받아, 건강 상태 판정 및 추천 키워드를 JSON으로 반환합니다. |
| **`extract-pdf/extractor/getScore.py`** | 건강 수치와 성별을 받아 총 건강 점수를 계산합니다. |
| **`VitaSenseDB.session.sql`** | `vitasense`와 `user_info` 두 개의 데이터베이스와 모든 테이블(users, user\_results, supplements, user\_alarms 등)을 생성하는 전체 스키마 파일입니다. |
| **`auth/db.js`** | `user_info` 데이터베이스(사용자 정보) 연결 풀입니다. |
| **`analysis/db.js`** | `vitasense` 데이터베이스(영양제, 알람 정보) 연결 풀입니다. |

-----
## 서버 실행 방법

서버를 켜기 전에, Node.js와 Python 실행 환경이 준비되어 있어야 합니다.

1.  **필요한 라이브러리 설치 (최초 1회):**

      * **Node.js (JavaScript):**
        ```bash
        # express, mysql2, cors, dotenv, jsonwebtoken, node-cron 등을 설치합니다.
        npm install
        ```
      * **Python:**
        ```bash
        # PyMuPDF, pdf2image, easyocr, numpy 등을 설치합니다.
        pip install -r ./extract-pdf/extractor/requirements.txt
        ```

2.  **.env 파일 설정:**

      * 프로젝트 루트 경로에 `.env` 파일을 생성하고, DB 접속 정보와 카카오 API 키, JWT 비밀 키를 입력해야 합니다.
        ```.env
        # DB (vitasense)
        DB_HOST=...
        DB_USER=...
        DB_PASSWORD=...
        DB_NAME=vitasense

        # DB (user_info)
        DB_L_HOST=...
        DB_L_USER=...
        DB_L_PASSWORD=...
        DB_L_NAME=user_info

        # JWT
        JWT_SECRET=your_jwt_secret_key

        # Kakao
        KAKAO_REST_API_KEY=...
        KAKAO_REDIRECT_URI=http://localhost:4000/kakao/callback
        KAKAO_CLIENT_SECRET=...
        ```

3.  **서버 실행:**

      * 다음 명령어를 입력해 메인 서버를 실행합니다.
        ```bash
        node index.js
        ```
      * 서버가 시작되면, 카카오톡 알림을 위한 스케줄러(Cron Job)도 자동으로 실행됩니다.

-----

## API 명세서

  * **`[인증]`** : `httpOnly` 쿠키에 담긴 `token`이 필요한 API입니다.

### 1\. 인증 (Auth)

| Method | Endpoint | 인증 | 설명 |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | ❌ | 카카오 로그인 링크가 포함된 HTML 페이지를 반환합니다. |
| **GET** | `/kakao/callback` | ❌ | 카카오 로그인 성공 시 리디렉션되는 경로입니다. 서버 JWT를 발급하고 쿠키에 저장합니다. |
| **POST** | `/auth/logout` | ❌ | `token` 쿠키를 삭제하여 로그아웃합니다. |
| **GET** | `/auth/profile` | ✅ | 현재 로그인된 사용자의 정보(ID, 닉네임)를 반환합니다. |

### 2\. PDF 및 건강 데이터 (PDF/Health Data)

| Method | Endpoint | 인증 | 설명 |
| :--- | :--- | :--- | :--- |
| **POST** | `/pdf/upload` | ✅ | (FormData)PDF 파일을 업로드하여 건강 수치를 텍스트로 추출합니다. |
| **POST** | `/pdf/judge` | ✅ | (JSON)건강 수치를 받아 **판정 결과**와 **추천 키워드**를 반환합니다. |
| **POST** | `/pdf/score` | ✅ | (JSON)건강 수치와 성별을 받아 **총 건강 점수**를 계산합니다. |
| **POST** | `/pdf/modify` | ✅ | (JSON)PDF 추출 결과를 사용자가 수정한 값을 받아 처리합니다 (현재는 받은 값을 반환). |

### 3\. 영양제 추천 (Supplements)

| Method | Endpoint | 인증 | 설명 |
| :--- | :--- | :--- | :--- |
| **GET** | `/supplements` | ✅ | 쿼리 스트링(`?condition=...`)으로 **조건명**을 보내면, 추천 영양제 목록을 받습니다. |

### 4\. 알람 (Alarms)

| Method | Endpoint | 인증 | 설명 |
| :--- | :--- | :--- | :--- |
| **POST** | `/alarms/setup` | ✅ | (JSON)`supplementId`와 횟수 등을 보내 알람을 DB에 저장합니다. |
| **GET** | `/alarms/today` | ✅ | 오늘 날짜의 모든 알람 목록을 조회합니다. |
| **POST** | `/alarms/check` | ✅ | (JSON) `alarmId`와 `status`("복용"/"미복용")를 보내 알람 상태를 수정합니다. |
| **POST** | `/alarms/send-test` | ✅ | (JSON) 현재 로그인한 사용자에게 즉시 카카오톡 테스트 알림을 보냅니다. |

### 5\. 히스토리 (History)

| Method | Endpoint | 인증 | 설명 |
| :--- | :--- | :--- | :--- |
| **POST** | `/results/submit` | ✅ | (JSON) 검진 수치(`result`)와 판정 결과(`judge`)를 DB에 히스토리로 저장합니다. |
| **GET** | `/results/history` | ✅ | 현재 사용자의 모든 검진 히스토리 목록을 최신순으로 조회합니다. |
