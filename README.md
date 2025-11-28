# 💊 VitaSense

> **개인 맞춤형 영양제 추천 및 알림 시스템**
>
> 건강검진 PDF 분석 기반 스마트 헬스케어 플랫폼

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2014.0.0-brightgreen)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-%3E%3D%203.7-blue)](https://www.python.org/)

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [시작하기](#-시작하기)
  - [사전 요구사항](#사전-요구사항)
  - [설치 방법](#설치-방법)
  - [환경 변수 설정](#환경-변수-설정)
  - [데이터베이스 설정](#데이터베이스-설정)
  - [서버 실행](#서버-실행)
- [API 문서](#-api-문서)
- [프로젝트 구조](#-프로젝트-구조)
- [배포 가이드](#-배포-가이드)
- [개발 가이드](#-개발-가이드)
- [기여하기](#-기여하기)
- [라이센스](#-라이센스)
- [팀원](#-팀원)
- [문의](#-문의)

---

## 🎯 프로젝트 소개

**VitaSense**는 사용자의 건강검진 결과를 AI가 분석하여 개인 맞춤형 영양제를 추천하고, 카카오톡을 통해 복용 알림을 제공하는 지능형 헬스케어 시스템입니다.

### 문제 정의

- 건강검진 결과를 받아도 어떤 영양제가 필요한지 판단하기 어려움
- 영양제를 구매했지만 복용 시간을 잊어버려 효과적인 관리가 어려움
- 개인의 건강 상태에 맞는 영양제 정보 접근성 부족

### 솔루션

VitaSense는 PDF 분석 기술과 머신러닝을 활용하여 건강검진 결과를 자동으로 해석하고, 개인 맞춤형 영양제를 추천합니다. 또한 카카오톡 알림을 통해 규칙적인 복용을 돕습니다.

### 핵심 가치

- ⏱️ **시간 절약**: PDF에서 자동으로 건강 수치 추출 (수동 입력 불필요)
- 🎯 **맞춤형 추천**: 건강 상태 기반 개인화된 영양제 추천
- 📱 **편리한 알림**: 카카오톡을 통한 실시간 복용 알림
- 📊 **히스토리 관리**: 건강검진 이력 및 복용 기록 추적

---

## ✨ 주요 기능

### 1. 🔐 카카오 소셜 로그인
- OAuth 2.0 기반 간편 인증
- JWT 토큰 기반 세션 관리
- 카카오 프로필 연동

### 2. 📄 건강검진 PDF 자동 분석
- **텍스트 추출**: PyMuPDF를 이용한 PDF 파싱
- **OCR 처리**: EasyOCR 기반 이미지 텍스트 인식 (백업)
- **주요 추출 항목**:
  - 체질량지수 (BMI)
  - 혈압 (수축기/이완기)
  - 공복혈당
  - 간 기능 (AST, ALT, γ-GTP)
  - 신장 기능 (크레아티닌)
  - 혈색소 (헤모글로빈)

### 3. 🏥 건강 상태 판정 및 점수화
- 추출된 수치 기반 자동 건강 판정
- 100점 만점의 종합 건강 점수 계산
- 위험도에 따른 상태 분류:
  - 정상
  - 주의 (경도 이상)
  - 위험 (고혈압 전단계 등)

### 4. 💊 맞춤형 영양제 추천
- 건강 판정 키워드 기반 영양제 매칭
- 공공 API 기반 영양제 데이터베이스 (효능, 복용법, 주의사항)
- 조건별 Top 추천 영양제 제공

### 5. ⏰ 카카오톡 자동 알림 스케줄러
- 사용자 설정 기반 복용 알림 (1일 1~3회)
- 식전/식후 자동 시간 조정
- node-cron 기반 실시간 스케줄링
- 카카오톡 "나에게 메시지 보내기" API 연동
- 알림 내 원클릭 복용 확인 링크

### 6. 📈 복용 기록 및 히스토리 관리
- 일일 알람 목록 조회
- 복용/미복용 상태 업데이트
- 건강검진 이력 저장 및 조회
- 시계열 건강 데이터 추적

---

## 🛠️ 기술 스택

### Backend
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.7+-3776AB?logo=python&logoColor=white)

- **Node.js (v20.x)**: 서버 런타임
- **Express.js**: RESTful API 서버
- **Python 3.7+**: PDF 분석 및 데이터 처리

### Database
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)

- **MySQL 8.0**: 관계형 데이터베이스
- **Dual Database Architecture**:
  - `user_info`: 사용자 인증 및 건강 기록
  - `vitasense`: 영양제 및 알람 데이터

### Authentication & Security
![JWT](https://img.shields.io/badge/JWT-Token-000000?logo=json-web-tokens&logoColor=white)
![Kakao](https://img.shields.io/badge/Kakao-OAuth-FFCD00?logo=kakao&logoColor=black)

- **JWT**: 토큰 기반 인증
- **Kakao OAuth 2.0**: 소셜 로그인
- **bcryptjs**: 비밀번호 암호화

### PDF Processing & AI
![PyMuPDF](https://img.shields.io/badge/PyMuPDF-PDF-red)
![EasyOCR](https://img.shields.io/badge/EasyOCR-OCR-blue)

- **PyMuPDF (fitz)**: PDF 텍스트 추출
- **EasyOCR**: 광학 문자 인식
- **NumPy**: 수치 계산

### Task Scheduling
![node-cron](https://img.shields.io/badge/node--cron-Scheduler-green)

- **node-cron**: 주기적 작업 스케줄링 (알림 발송)

### External APIs
- **Kakao Developers API**: 로그인, 메시지 전송
- **식품의약품안전처 공공 API**: 영양제 정보 (선택적)

### DevOps & Tools
![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white)
![PM2](https://img.shields.io/badge/PM2-Process-2B037A)

- **PM2**: 프로세스 관리 (프로덕션)
- **dotenv**: 환경 변수 관리
- **Git**: 버전 관리

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                         사용자                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ 카카오 로그인 / API 요청
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Server                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Auth Middleware (JWT 인증)                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Auth Routes  │  │ PDF Routes   │  │ Alarm Routes    │   │
│  │ - 카카오 로그인│  │ - 업로드     │  │ - 알람 설정      │   │
│  │ - JWT 발급   │  │ - 분석       │  │ - 알람 조회      │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘   │
│         │                  │                   │             │
│         ▼                  ▼                   ▼             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Business Logic Layer                    │   │
│  │  • alarmScheduler.js                                 │   │
│  │  • notificationService.js                            │   │
│  │  • supplementService.js                              │   │
│  │  • pdfIO.js (Node ↔ Python Bridge)                  │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│  Python Scripts  │          │  MySQL Database  │
│  • getResults.py │          │                  │
│  • getJudge.py   │          │  ┌────────────┐  │
│  • getScore.py   │          │  │ user_info  │  │
│  (PDF 분석)       │          │  │  - users   │  │
└──────────────────┘          │  │  - results │  │
                              │  └────────────┘  │
        │                     │                  │
        │                     │  ┌────────────┐  │
        │                     │  │ vitasense  │  │
        │                     │  │ - supple.. │  │
        │                     │  │ - alarms   │  │
        │                     │  └────────────┘  │
        │                     └──────────────────┘
        ▼
┌──────────────────┐
│   node-cron      │
│  ┌────────────┐  │          ┌─────────────────┐
│  │ 매분 실행  │─────────────▶│ Kakao Talk API  │
│  │ 알람 확인  │  │          │ (메시지 전송)    │
│  └────────────┘  │          └─────────────────┘
│  ┌────────────┐  │
│  │ 매일 00:00 │  │
│  │ 알람 생성  │  │
│  └────────────┘  │
└──────────────────┘
```

### 데이터 흐름

1. **사용자 인증**: 카카오 OAuth → JWT 발급 → 쿠키 저장
2. **PDF 분석**: PDF 업로드 → Python 스크립트 실행 → 건강 수치 추출
3. **영양제 추천**: 건강 판정 → 키워드 매칭 → DB 조회 → 추천 목록 반환
4. **알람 설정**: 영양제 선택 → user_choices 생성 → 일일 알람 생성
5. **알람 발송**: Cron 스케줄러 → DB 확인 → 카카오톡 API 호출

---

## 🚀 시작하기

### 사전 요구사항

개발 환경에 다음 프로그램이 설치되어 있어야 합니다:

- **Node.js** (v14.0 이상, v20.x 권장)
- **Python** (v3.7 이상)
- **MySQL** (v8.0 이상)
- **npm** (v6.0 이상)
- **Git**

### 설치 방법

#### 1. 저장소 클론

```bash
git clone https://github.com/Graduation-Project-JPD/JPDamn.git
cd JPDamn
```

#### 2. Node.js 의존성 설치

```bash
npm install
```

설치되는 주요 패키지:
- express, mysql2, cors, dotenv
- jsonwebtoken, bcryptjs, cookie-parser
- multer, node-cron, axios

#### 3. Python 의존성 설치

```bash
pip install -r extract-pdf/extractor/requirements.txt
```

설치되는 주요 패키지:
- PyMuPDF, easyocr, numpy
- opencv-python, pdf2image

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력합니다:

```env
# vitasense Database (영양제, 알람 데이터)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=vitasense

# user_info Database (사용자, 건강 기록)
DB_L_HOST=localhost
DB_L_USER=root
DB_L_PASSWORD=your_mysql_password
DB_L_NAME=user_info

# JWT Secret Key (랜덤 문자열 생성 권장)
JWT_SECRET=your_jwt_secret_key_here

# Kakao Developers API
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_REDIRECT_URI=http://localhost:4000/kakao/callback
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# Frontend URL (CORS 설정)
CLIENT_URL=http://localhost:5173

# Server Port
PORT=4000
```

#### 환경 변수 설명

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DB_HOST` | vitasense DB 호스트 | `localhost` 또는 RDS 엔드포인트 |
| `DB_USER` | DB 사용자명 | `root` |
| `DB_PASSWORD` | DB 비밀번호 | `your_password` |
| `DB_NAME` | vitasense DB 이름 | `vitasense` |
| `DB_L_HOST` | user_info DB 호스트 | `localhost` |
| `DB_L_USER` | user_info DB 사용자명 | `root` |
| `DB_L_PASSWORD` | user_info DB 비밀번호 | `your_password` |
| `DB_L_NAME` | user_info DB 이름 | `user_info` |
| `JWT_SECRET` | JWT 서명 키 | `openssl rand -base64 32`로 생성 |
| `KAKAO_REST_API_KEY` | 카카오 REST API 키 | 카카오 개발자 콘솔에서 발급 |
| `KAKAO_REDIRECT_URI` | OAuth 리디렉트 URI | `http://localhost:4000/kakao/callback` |
| `KAKAO_CLIENT_SECRET` | 카카오 Client Secret | 카카오 개발자 콘솔에서 발급 |
| `CLIENT_URL` | 프론트엔드 URL | `http://localhost:5173` |
| `PORT` | 서버 포트 | `4000` |

#### JWT Secret Key 생성

```bash
# 안전한 랜덤 키 생성
openssl rand -base64 32
```

#### 카카오 개발자 설정

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. **앱 키 → REST API 키** 복사
4. **카카오 로그인 활성화**
5. **Redirect URI 등록**: `http://localhost:4000/kakao/callback`
6. **동의 항목 설정**:
   - 닉네임: 필수
   - 카카오톡 메시지 전송: 필수
7. **보안 → Client Secret 발급** 및 활성화

### 데이터베이스 설정

#### 1. MySQL 데이터베이스 생성

```bash
mysql -u root -p
```

```sql
CREATE DATABASE user_info CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE vitasense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 2. 스키마 생성

```bash
mysql -u root -p < analysis/VitaSenseDB.session.sql
```

또는 MySQL Workbench에서 `analysis/VitaSenseDB.session.sql` 파일 실행

#### 3. 테이블 확인

```bash
mysql -u root -p user_info -e "SHOW TABLES;"
mysql -u root -p vitasense -e "SHOW TABLES;"
```

#### 4. 초기 데이터 로드

```bash
node analysis/main.js
```

영양제 더미 데이터가 `vitasense.supplements` 테이블에 삽입됩니다.

### 서버 실행

#### 개발 모드

```bash
node index.js
```

서버 시작 메시지:
```
VitaSense Server (Kakao Auth) running on port 4000
로그인 페이지: http://localhost:4000/
[Scheduler] 카카오톡 알람 스케줄러가 활성화되었습니다.
[Scheduler] 일일 알람 생성 스케줄러가 활성화되었습니다 (매일 00:00).
```

#### 프로덕션 모드 (PM2)

```bash
# PM2 설치
npm install -g pm2

# 서버 시작
pm2 start index.js --name vitasense

# 로그 확인
pm2 logs vitasense

# 부팅 시 자동 시작
pm2 startup
pm2 save
```

---

## 📡 API 문서

### 인증 방식

모든 인증이 필요한 API는 다음 중 하나의 방법으로 JWT 토큰을 전송해야 합니다:

1. **Cookie** (권장): `token` (httpOnly)
2. **Header**: `Authorization: Bearer <token>`

### API 엔드포인트 목록

#### 1. 인증 (Authentication)

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| `GET` | `/` | ❌ | 카카오 로그인 URL 반환 |
| `GET` | `/kakao/callback` | ❌ | 카카오 OAuth 콜백 |
| `POST` | `/auth/logout` | ❌ | 로그아웃 (쿠키 삭제) |
| `GET` | `/auth/profile` | ✅ | 현재 사용자 정보 조회 |

**예시: 로그인 URL 조회**
```bash
curl http://localhost:4000/
```

**응답:**
```json
{
  "redirect": "https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=..."
}
```

**예시: 프로필 조회**
```bash
curl -H "Authorization: Bearer <token>" http://localhost:4000/auth/profile
```

**응답:**
```json
{
  "userId": 1,
  "userName": "홍길동"
}
```

---

#### 2. PDF 및 건강 데이터 (Health Data)

| Method | Endpoint | 인증 | Content-Type | 설명 |
|--------|----------|------|--------------|------|
| `POST` | `/pdf/upload` | ✅ | `multipart/form-data` | PDF 업로드 및 수치 추출 |
| `POST` | `/pdf/judge` | ✅ | `application/json` | 건강 상태 판정 |
| `POST` | `/pdf/score` | ✅ | `application/json` | 총 건강 점수 계산 |
| `POST` | `/pdf/modify` | ✅ | `application/json` | 수치 수정 (사용자 입력) |

**예시: PDF 업로드**
```bash
curl -X POST http://localhost:4000/pdf/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@health_checkup.pdf"
```

**응답:**
```json
{
  "체질량지수": 23.5,
  "고혈압_수축기": 120,
  "고혈압_이완기": 80,
  "공복혈당": 95,
  "간기능_AST": 25,
  "간기능_ALT": 28,
  "신장기능_크레아티닌": 0.9,
  "빈혈_혈색소": 14.5
}
```

**예시: 건강 판정**
```bash
curl -X POST http://localhost:4000/pdf/judge \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "체질량지수": 23.5,
    "고혈압_수축기": 120,
    "고혈압_이완기": 80,
    "공복혈당": 95,
    "gender": "남"
  }'
```

**응답:**
```json
{
  "judgments": {
    "체질량지수_판정": "정상",
    "고혈압_판정": "정상",
    "공복혈당_판정": "정상"
  },
  "keywords": ["비타민D", "오메가3"]
}
```

---

#### 3. 영양제 추천 (Supplements)

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| `GET` | `/supplements?condition=<조건명>` | ✅ | 조건별 추천 영양제 조회 |

**예시:**
```bash
curl "http://localhost:4000/supplements?condition=고혈압" \
  -H "Authorization: Bearer <token>"
```

**응답:**
```json
[
  {
    "id": 1,
    "item_name": "오메가3",
    "efficacy": "혈행 개선, 혈중 중성지질 개선",
    "how_to_use": "1일 1회, 1캡슐을 물과 함께 섭취",
    "warning": "혈액응고억제제 복용자 주의",
    "image_url": "https://..."
  },
  ...
]
```

---

#### 4. 알람 (Alarms)

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| `POST` | `/alarms/setup` | ✅ | 알람 설정 생성 |
| `GET` | `/alarms/today` | ✅ | 오늘의 알람 목록 조회 |
| `POST` | `/alarms/check` | ✅ | 복용 상태 업데이트 |
| `GET` | `/alarms/check-via-kakao?alarm_id=<id>` | ✅ | 카카오톡 링크를 통한 복용 확인 |
| `POST` | `/alarms/send-test` | ✅ | 테스트 알림 전송 |

**예시: 알람 설정**
```bash
curl -X POST http://localhost:4000/alarms/setup \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "conditionName": "고혈압",
    "supplementId": 1,
    "selectedDailyCount": 2
  }'
```

**응답:**
```json
{
  "success": true,
  "choiceId": 1,
  "alarmCount": 2
}
```

**예시: 오늘의 알람 조회**
```bash
curl http://localhost:4000/alarms/today \
  -H "Authorization: Bearer <token>"
```

**응답:**
```json
[
  {
    "alarm_id": 1,
    "alarm_time": "07:00:00",
    "meal_type": "식전",
    "intake_status": "미확인",
    "item_name": "오메가3"
  },
  {
    "alarm_id": 2,
    "alarm_time": "19:00:00",
    "meal_type": "식후",
    "intake_status": "복용",
    "item_name": "오메가3"
  }
]
```

**예시: 복용 상태 업데이트**
```bash
curl -X POST http://localhost:4000/alarms/check \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "alarmId": 1,
    "status": "복용"
  }'
```

---

#### 5. 히스토리 (History)

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| `POST` | `/results/submit` | ✅ | 건강검진 결과 저장 |
| `GET` | `/results/history` | ✅ | 건강검진 이력 조회 |

**예시: 결과 저장**
```bash
curl -X POST http://localhost:4000/results/submit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "result": {...},
    "judge": {...},
    "supplements": [...]
  }'
```

**예시: 이력 조회**
```bash
curl http://localhost:4000/results/history \
  -H "Authorization: Bearer <token>"
```

---

## 📂 프로젝트 구조

```
JPDamn/
├── index.js                        # 메인 서버 파일 (Express + Cron)
├── errors.js                       # 에러 코드 정의
├── package.json                    # Node.js 의존성
├── .env                            # 환경 변수 (gitignore)
├── .gitignore
│
├── auth/                           # 인증 모듈
│   ├── authController.js           # 카카오 OAuth 콜백 핸들러
│   ├── authMiddleware.js           # JWT 토큰 검증 미들웨어
│   ├── kakaoAuthService.js         # 카카오 API 통신
│   └── db.js                       # user_info DB 연결 풀
│
├── analysis/                       # 핵심 비즈니스 로직
│   ├── pdfIO.js                    # Node ↔ Python 브릿지
│   ├── saveRecord.js               # 건강 기록 저장/조회
│   ├── db.js                       # vitasense DB 연결 풀
│   ├── main.js                     # 초기 데이터 로드 스크립트
│   ├── VitaSenseDB.session.sql     # 전체 DB 스키마
│   │
│   ├── services/                   # 서비스 레이어
│   │   ├── alarmScheduler.js       # 알람 생성 및 관리
│   │   ├── notificationService.js  # 카카오톡 알림 전송
│   │   └── supplementService.js    # 영양제 추천 쿼리
│   │
│   └── data/                       # 데이터 파일
│       └── supplements_dummy.json  # 영양제 더미 데이터
│
├── extract-pdf/                    # Python PDF 처리 모듈
│   └── extractor/
│       ├── getResults.py           # PDF 텍스트/OCR 추출
│       ├── getJudge.py             # 건강 상태 판정
│       ├── getScore.py             # 건강 점수 계산
│       ├── PDF_TEXT.py             # 텍스트 기반 추출
│       ├── PDF_ocr.py              # OCR 기반 추출
│       ├── PDF_keyword.py          # 키워드 추출
│       ├── judge.py                # 판정 로직
│       ├── score_calculator.py     # 점수 계산 로직
│       ├── modify.py               # 데이터 수정
│       └── requirements.txt        # Python 의존성
│
├── docs/                           # 문서 (선택사항)
│   ├── CLAUDE.md                   # AI 어시스턴트용 개발 가이드
│   ├── AWS_DEPLOYMENT.md           # AWS 배포 가이드
│   ├── DEPLOYMENT_STEP_BY_STEP.md  # 단계별 배포 가이드
│   └── DEPLOYMENT_CHEATSHEET.md    # 배포 명령어 치트시트
│
└── README.md                       # 프로젝트 소개 (이 파일)
```

### 주요 파일 설명

| 파일 | 역할 |
|------|------|
| `index.js` | Express 서버 초기화, 라우팅, Cron 스케줄러 |
| `auth/authController.js` | 카카오 로그인 콜백, JWT 발급 |
| `auth/authMiddleware.js` | JWT 토큰 검증, 요청 인증 |
| `analysis/pdfIO.js` | Python 스크립트 실행 및 결과 파싱 |
| `analysis/services/alarmScheduler.js` | 알람 생성, 시간 계산, 상태 관리 |
| `analysis/services/notificationService.js` | 카카오톡 API 호출 |
| `extract-pdf/extractor/getResults.py` | PDF → 건강 수치 JSON 변환 |
| `extract-pdf/extractor/getJudge.py` | 건강 수치 → 판정 결과 |
| `analysis/VitaSenseDB.session.sql` | MySQL 스키마 전체 정의 |

---

## 🌐 배포 가이드

### AWS EC2 + RDS 배포 (권장)

상세한 배포 가이드는 다음 문서를 참고하세요:

- **[AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)**: 배포 옵션 비교 및 상세 가이드
- **[DEPLOYMENT_STEP_BY_STEP.md](./DEPLOYMENT_STEP_BY_STEP.md)**: 프리티어 단계별 배포 가이드 (1~2시간)
- **[DEPLOYMENT_CHEATSHEET.md](./DEPLOYMENT_CHEATSHEET.md)**: 배포 명령어 빠른 참조

### 배포 요약

1. **AWS 계정 생성** (프리티어 활용)
2. **RDS MySQL 2개 생성** (user_info, vitasense)
3. **EC2 Ubuntu 인스턴스 생성** (t2.micro)
4. **Node.js, Python 환경 구축**
5. **프로젝트 클론 및 의존성 설치**
6. **환경 변수 설정** (RDS 엔드포인트)
7. **PM2로 서버 실행**
8. **보안 그룹 설정** (포트 4000 오픈)

### 예상 비용

- **프리티어 (12개월)**: ₩0~5,000/월
- **프로덕션**: ₩69,650/월 (EC2 t3.small + RDS db.t4g.micro × 2)

---

## 🛠️ 개발 가이드

### AI 어시스턴트용 개발 가이드

**[CLAUDE.md](./CLAUDE.md)**를 참고하세요. 다음 내용을 포함합니다:

- 전체 아키텍처 및 데이터 흐름
- 듀얼 데이터베이스 구조 설명
- 주요 컴포넌트 상세 설명
- 코드 컨벤션 및 스타일 가이드
- 일반적인 실수 및 주의사항
- 테스트 체크리스트

### 주요 개발 규칙

#### 1. 데이터베이스 연결
```javascript
// user_info DB (인증, 사용자 정보)
const userDb = require('./auth/db');

// vitasense DB (영양제, 알람)
const vitaDb = require('./analysis/db');
```

#### 2. 인증 미들웨어 사용
```javascript
const { authenticateToken } = require('./auth/authMiddleware');

app.get('/protected-route', authenticateToken, (req, res) => {
  const userId = req.user.user_id; // JWT에서 추출된 사용자 ID
  // ...
});
```

#### 3. Python 스크립트 실행
```javascript
const { spawn } = require('child_process');

const python = spawn('python3', ['script.py']);
python.stdout.on('data', (data) => {
  const result = JSON.parse(data.toString());
});
```

#### 4. Cron 스케줄러
```javascript
const cron = require('node-cron');

// 매분 실행
cron.schedule('*/1 * * * *', () => {
  // 알람 확인 로직
});

// 매일 자정 (KST)
cron.schedule('0 0 * * *', () => {
  // 일일 알람 생성
}, { timezone: 'Asia/Seoul' });
```

---

## 🤝 기여하기

프로젝트에 기여하고 싶으신가요? 환영합니다!

### 기여 방법

1. **Fork** 이 저장소를 포크합니다
2. **Branch** 새 기능 브랜치를 만듭니다 (`git checkout -b feature/AmazingFeature`)
3. **Commit** 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. **Push** 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. **Pull Request** PR을 생성합니다

### 코드 스타일

- **JavaScript**: CommonJS 모듈, async/await 사용
- **Python**: PEP 8 스타일 가이드 준수
- **커밋 메시지**: `[타입] 간결한 설명` 형식
  - 예: `[feat] 카카오톡 알림 재전송 기능 추가`
  - 타입: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## 📄 라이센스

이 프로젝트는 **ISC 라이센스** 하에 배포됩니다.

---

## 👥 팀원

| 이름 | 역할 | GitHub | Email |
|------|------|--------|-------|
| **홍길동** | Full-stack Developer | [@github](https://github.com/) | email@example.com |
| **김철수** | Backend Developer | [@github](https://github.com/) | email@example.com |
| **이영희** | Frontend Developer | [@github](https://github.com/) | email@example.com |

> 팀원 정보를 실제 정보로 업데이트해주세요.

---

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 편하게 연락주세요!

- **이슈 등록**: [GitHub Issues](https://github.com/Graduation-Project-JPD/JPDamn/issues)
- **이메일**: your-email@example.com
- **프로젝트 저장소**: [https://github.com/Graduation-Project-JPD/JPDamn](https://github.com/Graduation-Project-JPD/JPDamn)

---

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 라이브러리와 API를 사용합니다:

- [Express.js](https://expressjs.com/)
- [PyMuPDF](https://pymupdf.readthedocs.io/)
- [EasyOCR](https://github.com/JaidedAI/EasyOCR)
- [Kakao Developers](https://developers.kakao.com/)
- [node-cron](https://github.com/node-cron/node-cron)

---

<div align="center">

**VitaSense** - 당신의 건강한 내일을 위한 스마트한 선택 💊

Made with ❤️ by JPD Team

</div>
