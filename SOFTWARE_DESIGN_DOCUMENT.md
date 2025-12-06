# VitaSense Software Design Document

---

## 4. Software Top-level Structure

### 4.1 System Architecture Overview

VitaSense is designed based on **Three-Tier Architecture**.

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                         │
│         (Web Frontend - React/Vue + HTML Test Page)          │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
                         │ REST API
┌────────────────────────▼────────────────────────────────────┐
│                   Application Layer                          │
│                  (Node.js + Express.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Module  │  │ PDF Analysis │  │ Alarm        │      │
│  │ (Kakao OAuth)│  │ Module       │  │ Scheduler    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Supplement   │  │ Health Record│  │ Notification │      │
│  │ Service      │  │ Management   │  │ Service      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL
                         │ MySQL Protocol
┌────────────────────────▼────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │ user_info Database   │  │ vitasense Database   │         │
│  │ (User Auth Info)     │  │ (Supplement, Alarms) │         │
│  └──────────────────────┘  └──────────────────────┘         │
│                    MySQL 8.0 (RDS)                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  External Services Integration               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Kakao OAuth  │  │ KakaoTalk    │  │ Python PDF   │      │
│  │ 2.0 API      │  │ Message API  │  │ Extractor    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Main Components

#### 4.2.1 Backend Server (Node.js + Express.js)
- **Role**: Process all business logic and provide APIs
- **Tech Stack**: Node.js 18.x, Express.js 4.x
- **Port**: 4000 (default)

#### 4.2.2 Database (MySQL 8.0)
- **Structure**: Dual database architecture
  - `user_info`: User authentication and health records
  - `vitasense`: Supplements, alarms, recommendation info
- **Connection**: Connection Pool method

#### 4.2.3 Python PDF Analysis Engine
- **Role**: Extract health indicators from PDF documents
- **Technology**: PyMuPDF, EasyOCR
- **Communication**: Executed via child_process from Node.js

#### 4.2.4 External API Integration
- **Kakao OAuth 2.0**: User authentication
- **KakaoTalk Messaging API**: Send notifications

### 4.3 Directory Structure

```
VitaSense/
├── index.js                    # Main server entry point
├── errors.js                   # Error code definitions
├── package.json                # Node.js dependencies
│
├── auth/                       # Authentication module
│   ├── authController.js       # Auth controller
│   ├── authMiddleware.js       # JWT middleware
│   ├── kakaoAuthService.js     # Kakao API service
│   └── db.js                   # user_info DB connection
│
├── analysis/                   # Core business logic
│   ├── pdfIO.js               # PDF processing interface
│   ├── saveRecord.js          # Health record storage
│   ├── db.js                  # vitasense DB connection
│   ├── VitaSenseDB.session.sql # DB schema
│   │
│   ├── services/              # Business services
│   │   ├── alarmScheduler.js  # Alarm scheduling
│   │   ├── notificationService.js # Notification sending
│   │   └── supplementService.js   # Supplement recommendation
│   │
│   └── data/                  # Initial data
│       └── supplements_dummy.json
│
└── extract-pdf/               # Python PDF analysis
    └── extractor/
        ├── getResults.py      # Extract health indicators
        ├── getJudge.py        # Health status assessment
        ├── getScore.py        # Health score calculation
        ├── PDF_TEXT.py        # Text-based extraction
        ├── PDF_ocr.py         # OCR-based extraction
        └── requirements.txt   # Python dependencies
```

### 4.4 Data Flow Diagrams

#### 4.4.1 User Authentication Flow

```
User → GET / → Return Kakao Login URL
         ↓
User → Kakao Login Page
         ↓
Kakao → Redirect with code → /kakao/callback
         ↓
authController → Kakao Token Exchange
         ↓
authController → Save user info to DB (user_info.users)
         ↓
authController → Issue JWT token → Set httpOnly Cookie
         ↓
User → Login complete
```

#### 4.4.2 PDF Analysis Flow

```
User → POST /pdf/upload (PDF file)
         ↓
pdfIO.getResults → Execute Python getResults.py
         ↓
PDF_TEXT.py or PDF_ocr.py → Extract health indicators
         ↓
pdfIO → Return JSON to Node.js
         ↓
pdfIO.getJudges → Execute Python getJudge.py
         ↓
Health status assessment (Normal/Warning/Risk)
         ↓
supplementService → Recommend supplements based on health status
         ↓
User → Return analysis results + recommended supplements
```

#### 4.4.3 Alarm Flow

```
User → POST /alarms/setup (Select supplement)
         ↓
alarmScheduler.setupUserAlarms
         ↓
Create user_choices in DB (vitasense.user_choices)
         ↓
alarmScheduler.generateAlarmTimes
         ↓
Calculate time based on before/after/anytime meal
         ↓
Create user_alarms in DB (vitasense.user_alarms)
         ↓
Daily 00:00 (Cron) → Generate new alarms
         ↓
Every minute (Cron) → Check current time alarms
         ↓
notificationService.sendKakaoTalk
         ↓
KakaoTalk API → Send notification to user
```

---

## 5. Component (Module) Function Definitions

### 5.1 Authentication Module

**Location**: `auth/`

**Key Functions**:
1. Handle Kakao OAuth 2.0 login
2. Issue and verify JWT tokens
3. Manage user sessions
4. Query and manage user information

**Components**:
- `authController.js`: Handle login/logout endpoints
- `authMiddleware.js`: JWT token verification middleware
- `kakaoAuthService.js`: Kakao API communication
- `db.js`: user_info database connection

### 5.2 PDF Analysis Module

**Location**: `analysis/pdfIO.js`, `extract-pdf/extractor/`

**Key Functions**:
1. Extract health checkup data from PDF files
2. Support text-based and OCR-based extraction
3. Assess health indicators (Normal/Warning/Risk)
4. Calculate health scores

**Components**:
- `pdfIO.js`: Interface between Node.js and Python
- `getResults.py`: Main script for extracting health indicators
- `getJudge.py`: Health status assessment logic
- `getScore.py`: Health score calculation logic
- `PDF_TEXT.py`: Text-based PDF parsing
- `PDF_ocr.py`: OCR-based PDF image recognition

### 5.3 Health Record Module

**Location**: `analysis/saveRecord.js`

**Key Functions**:
1. Save health checkup results
2. Query past health records
3. Track health changes

**Components**:
- `saveRecord.js`: Health record CRUD operations

### 5.4 Supplement Recommendation Module

**Location**: `analysis/services/supplementService.js`

**Key Functions**:
1. Recommend supplements based on health status
2. Query supplement information (efficacy, usage, precautions)
3. Search supplements (by condition)

**Components**:
- `supplementService.js`: Supplement recommendation logic

### 5.5 Alarm Scheduler Module

**Location**: `analysis/services/alarmScheduler.js`

**Key Functions**:
1. Create and manage user alarms
2. Automatically calculate before/after meal times
3. Auto-generate daily alarms (Cron: 00:00)
4. Record intake status (taken/not taken/unconfirmed)

**Components**:
- `alarmScheduler.js`: Alarm creation and management logic

### 5.6 Notification Service Module

**Location**: `analysis/services/notificationService.js`

**Key Functions**:
1. Send KakaoTalk messages
2. Manage notification templates
3. Handle sending failures

**Components**:
- `notificationService.js`: KakaoTalk API communication

### 5.7 Database Module

**Location**: `auth/db.js`, `analysis/db.js`

**Key Functions**:
1. Manage MySQL connection pool
2. Execute database queries
3. Manage transactions

**Components**:
- `auth/db.js`: user_info DB connection
- `analysis/db.js`: vitasense DB connection

### 5.8 Main Server Module

**Location**: `index.js`

**Key Functions**:
1. Initialize Express server
2. Configure routes
3. Set up middleware (CORS, JSON parser, Cookie parser)
4. Initialize Cron scheduler
5. Error handling

**Components**:
- `index.js`: Server entry point

---

## 6. Component (Module)-1 Design: Authentication Module

### 6.1 Authentication Module Class Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    AuthenticationModule                      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ AuthController│  │AuthMiddleware│  │KakaoAuthService│
├──────────────┤  ├──────────────┤  ├──────────────┤
│- express     │  │- jwt         │  │- axios       │
│- jwt         │  │              │  │- dotenv      │
├──────────────┤  ├──────────────┤  ├──────────────┤
│+kakaoCallback│  │+authenticate │  │+getKakaoLogin│
│              │  │  Token()     │  │  URL()       │
│              │  │              │  │+getKakaoToken│
│              │  │              │  │+getKakaoUser │
│              │  │              │  │  Info()      │
└──────────────┘  └──────────────┘  └──────────────┘
        │
        ▼
┌──────────────┐
│ DatabasePool │
├──────────────┤
│- mysql2/pool │
├──────────────┤
│+query()      │
│+execute()    │
└──────────────┘
```

### 6.2 Each Class Design

#### 6.2.1 AuthController (authController.js)

**Role**: Controller that handles authentication-related HTTP requests

##### Member Data Description

| Variable | Type | Description |
|----------|------|-------------|
| `db` | Connection Pool | user_info database connection pool |
| `jwt` | Library | JSON Web Token library |
| `kakaoAuthService` | Module | Kakao authentication service module |
| `JWT_SECRET` | String | JWT token encryption secret key (env var) |
| `CLIENT_URL` | String | Frontend URL (env var) |

##### Member Function Description

**1. `kakaoCallback(req, res)`**

- **Description**: Process Kakao OAuth callback to authenticate user and issue JWT token
- **Parameters**:
  - `req`: Express Request object (contains code)
  - `res`: Express Response object
- **Return**: HTTP Response (Redirect or JSON)
- **Process Flow**:
  1. Extract `code` parameter from URL
  2. Get access token via `kakaoAuthService.getKakaoToken(code)`
  3. Get user info via `kakaoAuthService.getKakaoUserInfo(accessToken)`
  4. Query user from database (`SELECT * FROM users WHERE kakao_id = ?`)
  5. Create new user if not exists (`INSERT INTO users`)
  6. Issue JWT token (`jwt.sign()`)
  7. Save token in httpOnly cookie
  8. Redirect to frontend (`CLIENT_URL/home`)

**Example Code**:
```javascript
exports.kakaoCallback = async (req, res) => {
  try {
    const { code } = req.query;

    // 1. Get Kakao access token
    const tokenData = await kakaoAuthService.getKakaoToken(code);
    const { access_token, refresh_token } = tokenData;

    // 2. Get Kakao user info
    const userInfo = await kakaoAuthService.getKakaoUserInfo(access_token);
    const { id: kakaoId, properties } = userInfo;

    // 3. Query user from DB
    const [users] = await db.query(
      'SELECT * FROM users WHERE kakao_id = ?',
      [kakaoId]
    );

    let userId;
    if (users.length === 0) {
      // 4. Create new user
      const [result] = await db.query(
        `INSERT INTO users (kakao_id, nickname, kakao_access_token, kakao_refresh_token)
         VALUES (?, ?, ?, ?)`,
        [kakaoId, properties.nickname, access_token, refresh_token]
      );
      userId = result.insertId;
    } else {
      userId = users[0].id;
      // Update tokens
      await db.query(
        `UPDATE users SET kakao_access_token = ?, kakao_refresh_token = ?
         WHERE id = ?`,
        [access_token, refresh_token, userId]
      );
    }

    // 5. Issue JWT token
    const token = jwt.sign(
      { user_id: userId, username: properties.nickname },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 6. Save token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 // 1 hour
    });

    // 7. Redirect to frontend
    res.redirect(`${process.env.CLIENT_URL}/home`);

  } catch (error) {
    console.error('Error during Kakao login:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};
```

---

#### 6.2.2 AuthMiddleware (authMiddleware.js)

**Role**: Verify JWT token from request to check authentication status

##### Member Data Description

| Variable | Type | Description |
|----------|------|-------------|
| `jwt` | Library | JSON Web Token library |
| `JWT_SECRET` | String | JWT token verification secret key (env var) |
| `ERROR_CODES` | Object | Error code definitions (errors.js) |

##### Member Function Description

**1. `authenticateToken(req, res, next)`**

- **Description**: Middleware to verify JWT token and check user authentication status
- **Parameters**:
  - `req`: Express Request object
  - `res`: Express Response object
  - `next`: Function to pass to next middleware
- **Return**: None (calls next() or sends error response)
- **Process Flow**:
  1. Extract token from cookie or Authorization header
  2. Send error response if token missing (401)
  3. Verify token with `jwt.verify()`
  4. Store user info in `req.user` if verification succeeds
  5. Call `next()` to pass to next middleware

**Example Code**:
```javascript
const jwt = require('jsonwebtoken');
const ERROR_CODES = require('../errors');

exports.authenticateToken = (req, res, next) => {
  // 1. Extract token from cookie or header
  const token = req.cookies.token ||
                (req.headers.authorization &&
                 req.headers.authorization.split(' ')[1]);

  // 2. Error if no token
  if (!token) {
    return res.status(401).json({
      code: ERROR_CODES.TOKEN_MISSING,
      message: 'Token is missing'
    });
  }

  // 3. Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Token expired or invalid
      return res.status(403).json({
        code: ERROR_CODES.TOKEN_INVALID,
        message: 'Token is invalid'
      });
    }

    // 4. Store user info
    req.user = user;  // { user_id, username }

    // 5. Pass to next middleware
    next();
  });
};
```

---

#### 6.2.3 KakaoAuthService (kakaoAuthService.js)

**Role**: Communicate with Kakao API to handle OAuth authentication

##### Member Data Description

| Variable | Type | Description |
|----------|------|-------------|
| `axios` | Library | HTTP client library |
| `KAKAO_REST_API_KEY` | String | Kakao REST API key (env var) |
| `KAKAO_REDIRECT_URI` | String | Kakao redirect URI (env var) |
| `KAKAO_CLIENT_SECRET` | String | Kakao Client Secret (env var) |
| `KAKAO_AUTH_URL` | String | Kakao auth server URL |
| `KAKAO_API_URL` | String | Kakao API server URL |

##### Member Function Description

**1. `getKakaoLoginURL()`**

- **Description**: Generate and return Kakao login URL
- **Parameters**: None
- **Return**: String (Kakao login URL)
- **Process Flow**:
  1. Create Kakao OAuth parameters (response_type, client_id, redirect_uri, scope)
  2. Combine into URL and return

**Example Code**:
```javascript
exports.getKakaoLoginURL = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.KAKAO_REST_API_KEY,
    redirect_uri: process.env.KAKAO_REDIRECT_URI,
    scope: 'talk_message,profile_nickname'
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
};
```

**2. `getKakaoToken(code)`**

- **Description**: Use authorization code to get Kakao access token
- **Parameters**:
  - `code`: String (authorization code from Kakao)
- **Return**: Object `{ access_token, refresh_token, expires_in }`
- **Process Flow**:
  1. POST request to Kakao token endpoint
  2. Extract access token and refresh token from response
  3. Return

**Example Code**:
```javascript
exports.getKakaoToken = async (code) => {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: process.env.KAKAO_REST_API_KEY,
    redirect_uri: process.env.KAKAO_REDIRECT_URI,
    code: code,
    client_secret: process.env.KAKAO_CLIENT_SECRET
  });

  const response = await axios.post(
    'https://kauth.kakao.com/oauth/token',
    params.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data;  // { access_token, refresh_token, ... }
};
```

**3. `getKakaoUserInfo(accessToken)`**

- **Description**: Query Kakao user info using access token
- **Parameters**:
  - `accessToken`: String (Kakao access token)
- **Return**: Object `{ id, properties: { nickname } }`
- **Process Flow**:
  1. GET request to Kakao API (with Authorization header)
  2. Return user info

**Example Code**:
```javascript
exports.getKakaoUserInfo = async (accessToken) => {
  const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.data;  // { id, properties: { nickname }, ... }
};
```

---

#### 6.2.4 Database Pool (db.js)

**Role**: Manage MySQL database connection pool

##### Member Data Description

| Variable | Type | Description |
|----------|------|-------------|
| `mysql` | Library | mysql2/promise library |
| `pool` | Connection Pool | MySQL connection pool object |
| `DB_HOST` | String | Database host (env var) |
| `DB_USER` | String | Database user (env var) |
| `DB_PASSWORD` | String | Database password (env var) |
| `DB_NAME` | String | Database name (env var) |

##### Member Function Description

**1. `createPool(config)`**

- **Description**: Create MySQL connection pool
- **Parameters**:
  - `config`: Object (database configuration)
- **Return**: Connection Pool
- **Process Flow**:
  1. Create pool with mysql2/promise
  2. Return pool

**Example Code**:
```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_L_HOST,
  user: process.env.DB_L_USER,
  password: process.env.DB_L_PASSWORD,
  database: process.env.DB_L_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

**2. `pool.query(sql, params)`**

- **Description**: Execute SQL query
- **Parameters**:
  - `sql`: String (SQL query)
  - `params`: Array (parameter array, optional)
- **Return**: Promise<[rows, fields]>
- **Process Flow**:
  1. Acquire connection from pool
  2. Execute query
  3. Return results
  4. Return connection

---

### 6.3 Authentication Module Sequence Diagram

```
User    Frontend  Express  AuthController  KakaoAuth   Kakao API  Database
 │         │         │           │           Service       │         │
 │ Click   │         │           │             │           │         │
 │ Login   │         │           │             │           │         │
 │────────>│         │           │             │           │         │
 │         │  GET /  │           │             │           │         │
 │         │────────>│           │             │           │         │
 │         │         │ getKakaoLoginURL()      │           │         │
 │         │         │────────────────────────>│           │         │
 │         │         │           │             │           │         │
 │         │<────────│ Kakao Login URL         │           │         │
 │<────────│         │           │             │           │         │
 │         │         │           │             │           │         │
 │  Redirect to Kakao│           │             │           │         │
 │────────────────────────────────────────────────────────>│         │
 │         │         │           │             │           │         │
 │  User Auth        │           │             │           │         │
 │<─────────────────────────────────────────────────────────         │
 │         │         │           │             │           │         │
 │  Redirect with code           │             │           │         │
 │───────────────────>│ /kakao/callback        │           │         │
 │         │         │──────────>│             │           │         │
 │         │         │           │ getKakaoToken(code)     │         │
 │         │         │           │────────────>│           │         │
 │         │         │           │             │  POST /oauth/token  │
 │         │         │           │             │─────────>│         │
 │         │         │           │             │<─────────│         │
 │         │         │           │<────────────│ access_token        │
 │         │         │           │             │           │         │
 │         │         │           │ getKakaoUserInfo(token) │         │
 │         │         │           │────────────>│           │         │
 │         │         │           │             │  GET /v2/user/me    │
 │         │         │           │             │─────────>│         │
 │         │         │           │             │<─────────│         │
 │         │         │           │<────────────│ user info│         │
 │         │         │           │             │           │         │
 │         │         │           │  SELECT * FROM users WHERE kakao_id=?│
 │         │         │           │─────────────────────────────────────>│
 │         │         │           │<─────────────────────────────────────│
 │         │         │           │  INSERT/UPDATE users   │         │
 │         │         │           │─────────────────────────────────────>│
 │         │         │           │<─────────────────────────────────────│
 │         │         │           │             │           │         │
 │         │         │           │  jwt.sign() │           │         │
 │         │         │           │────────────>│           │         │
 │         │         │           │<────────────│ JWT token │         │
 │         │         │           │             │           │         │
 │         │         │<──────────│ Set Cookie + Redirect   │         │
 │<────────│<────────│           │             │           │         │
 │         │         │           │             │           │         │
```

---

### 6.4 Authentication Module Key Data Structures

#### 6.4.1 JWT Payload

```javascript
{
  user_id: 1,              // User ID (users.id)
  username: "John Doe",    // User nickname
  iat: 1701234567,         // Issued at (Unix timestamp)
  exp: 1701238167          // Expiration (Unix timestamp, 1 hour later)
}
```

#### 6.4.2 Kakao Token Response

```javascript
{
  access_token: "xxxxxxxxxxxxxxxxxxxxx",
  token_type: "bearer",
  refresh_token: "yyyyyyyyyyyyyyyyyyy",
  expires_in: 21599,       // Seconds (about 6 hours)
  scope: "talk_message profile_nickname",
  refresh_token_expires_in: 5183999  // About 60 days
}
```

#### 6.4.3 Kakao User Info Response

```javascript
{
  id: 1234567890,          // Kakao user ID
  properties: {
    nickname: "John Doe"   // User nickname
  },
  kakao_account: {
    profile: {
      nickname: "John Doe"
    }
  }
}
```

---

### 6.5 Authentication Module Error Codes

| Code | Message | HTTP Status | Description |
|------|---------|-------------|-------------|
| 3001 | Access token missing | 401 | No Authorization header |
| 3002 | Token missing | 401 | No JWT token |
| 3003 | Token invalid | 403 | JWT verification failed |
| 3004 | Token expired | 403 | JWT expired |
| 3005 | Kakao auth failed | 500 | Kakao API error |

---

This completes the detailed design of the **Authentication Module**.
Other modules can be documented in the same way.

---

## 7. Component (Module)-2 Design: PDF Analysis Module

### 7.1 PDF Analysis Module Class Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PDFAnalysisModule                         │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   pdfIO      │  │ getResults.py│  │ getJudge.py  │
├──────────────┤  ├──────────────┤  ├──────────────┤
│- child_process│  │- PyMuPDF     │  │- numpy       │
│- Buffer      │  │- easyocr     │  │- json        │
├──────────────┤  ├──────────────┤  ├──────────────┤
│+getResults() │  │+extract_text │  │+judge_health │
│+getJudges()  │  │+extract_ocr  │  │+categorize   │
│+getScore()   │  │+parse_values │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │
        ▼                   ▼
┌──────────────┐  ┌──────────────┐
│PDF_TEXT.py   │  │ PDF_ocr.py   │
├──────────────┤  ├──────────────┤
│- PyMuPDF     │  │- easyocr     │
│- re          │  │- cv2         │
├──────────────┤  ├──────────────┤
│+extract()    │  │+extract()    │
│+parse()      │  │+preprocess() │
└──────────────┘  └──────────────┘
```

### 7.2 Class Design

#### 7.2.1 pdfIO (pdfIO.js)

**Role**: PDF processing interface that bridges Node.js and Python

##### Member Data Description

| Variable | Type | Description |
|----------|------|-------------|
| `spawn` | Function | child_process.spawn function |
| `PYTHON_PATH` | String | Python executable path |
| `EXTRACTOR_PATH` | String | Python script path |

##### Member Function Description

**1. `getResults(pdfBuffer, gender)`**

- **Description**: Extracts health indicators by passing PDF buffer to Python script
- **Parameters**:
  - `pdfBuffer`: Buffer (PDF file binary data)
  - `gender`: String ("남" or "여")
- **Return Value**: Promise<Object> (Extracted health indicators JSON)
- **Processing Flow**:
  1. Create Python getResults.py process
  2. Send PDF buffer via stdin
  3. Execute PDF_TEXT.py or PDF_ocr.py in Python
  4. Receive JSON result via stdout
  5. Parse JSON and return

**Example Code**:
```javascript
const { spawn } = require('child_process');
const path = require('path');

exports.getResults = (pdfBuffer, gender) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../extract-pdf/extractor/getResults.py');

    const pythonProcess = spawn('python3', [pythonScript, gender]);

    let dataString = '';

    // Collect stdout data
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    // Error handling
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python error: ${data}`);
    });

    // Process termination handling
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exit code: ${code}`));
      } else {
        try {
          const result = JSON.parse(dataString);
          resolve(result);
        } catch (error) {
          reject(new Error('JSON parsing failed: ' + error.message));
        }
      }
    });

    // Send PDF buffer via stdin
    pythonProcess.stdin.write(pdfBuffer);
    pythonProcess.stdin.end();
  });
};
```

**2. `getJudges(healthData)`**

- **Description**: Judges extracted health data (Normal/Warning/Risk)
- **Parameters**:
  - `healthData`: Object (Health indicator data)
- **Return Value**: Promise<Object> (Judgment result JSON)
- **Processing Flow**:
  1. Create Python getJudge.py process
  2. Send health data JSON via stdin
  3. Perform judgment for each indicator in Python
  4. Receive judgment result via stdout

**Example Code**:
```javascript
exports.getJudges = (healthData) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../extract-pdf/extractor/getJudge.py');

    const pythonProcess = spawn('python3', [pythonScript]);

    let dataString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python judgment error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Judgment process exit code: ${code}`));
      } else {
        try {
          const result = JSON.parse(dataString);
          resolve(result);
        } catch (error) {
          reject(new Error('Judgment JSON parsing failed: ' + error.message));
        }
      }
    });

    // Convert health data to JSON string and send
    pythonProcess.stdin.write(JSON.stringify(healthData));
    pythonProcess.stdin.end();
  });
};
```

**3. `getScore(healthData)`**

- **Description**: Calculates comprehensive health score based on health data
- **Parameters**:
  - `healthData`: Object (Health indicator data)
- **Return Value**: Promise<Object> `{ total_score: Number, category_scores: Object }`
- **Processing Flow**:
  1. Create Python getScore.py process
  2. Send health data JSON via stdin
  3. Calculate scores for each category in Python
  4. Calculate total score (out of 100)
  5. Receive score result via stdout

**Example Code**:
```javascript
exports.getScore = (healthData) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../extract-pdf/extractor/getScore.py');

    const pythonProcess = spawn('python3', [pythonScript]);

    let dataString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python score calculation error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Score calculation process exit code: ${code}`));
      } else {
        try {
          const result = JSON.parse(dataString);
          resolve(result);
        } catch (error) {
          reject(new Error('Score JSON parsing failed: ' + error.message));
        }
      }
    });

    pythonProcess.stdin.write(JSON.stringify(healthData));
    pythonProcess.stdin.end();
  });
};
```

---

#### 7.2.2 getResults.py

**Role**: Main Python script for extracting health indicators from PDF

##### Member Data Description

| Variable | Type | Description |
|----------|------|-------------|
| `fitz` | Library | PyMuPDF library |
| `sys` | Library | System input/output |
| `json` | Library | JSON processing |
| `PDF_TEXT` | Module | Text-based extraction module |
| `PDF_ocr` | Module | OCR-based extraction module |

##### Member Function Description

**1. `extract_from_pdf(pdf_data, gender)`**

- **Description**: Extracts health indicators from PDF data (text first, OCR fallback)
- **Parameters**:
  - `pdf_data`: bytes (PDF binary data)
  - `gender`: str ("남" or "여")
- **Return Value**: dict (Health indicator dictionary)
- **Processing Flow**:
  1. Open PDF with PyMuPDF
  2. Attempt PDF_TEXT.extract() (text-based)
  3. If failed, attempt PDF_ocr.extract() (OCR-based)
  4. Normalize extracted data
  5. Convert to JSON and return

**Example Code**:
```python
import fitz  # PyMuPDF
import sys
import json
import PDF_TEXT
import PDF_ocr

def extract_from_pdf(pdf_data, gender):
    """Extract health indicators from PDF"""
    try:
        # Open PDF
        doc = fitz.open(stream=pdf_data, filetype="pdf")

        # First try text-based extraction
        try:
            results = PDF_TEXT.extract(doc, gender)
            if results and len(results) > 0:
                return results
        except Exception as e:
            print(f"Text extraction failed: {e}", file=sys.stderr)

        # If text extraction fails, try OCR
        try:
            results = PDF_ocr.extract(doc, gender)
            return results
        except Exception as e:
            print(f"OCR extraction failed: {e}", file=sys.stderr)
            return {}

    except Exception as e:
        print(f"PDF processing failed: {e}", file=sys.stderr)
        return {}

if __name__ == "__main__":
    # Get gender argument
    gender = sys.argv[1] if len(sys.argv) > 1 else "남"

    # Read PDF data from stdin
    pdf_data = sys.stdin.buffer.read()

    # Extract health indicators
    results = extract_from_pdf(pdf_data, gender)

    # Output as JSON
    print(json.dumps(results, ensure_ascii=False))
```

---

#### 7.2.3 getJudge.py

**Role**: Judges health indicators and classifies as Normal/Warning/Risk

##### Member Data Description

| Variable | Type | Description |
|----------|------|-------------|
| `NORMAL_RANGES` | dict | Normal ranges for each indicator |
| `WARNING_RANGES` | dict | Warning ranges for each indicator |

##### Member Function Description

**1. `judge_health_indicator(indicator_name, value, gender)`**

- **Description**: Judges individual health indicator
- **Parameters**:
  - `indicator_name`: str (Indicator name, e.g., "체질량지수")
  - `value`: float (Measured value)
  - `gender`: str ("남" or "여")
- **Return Value**: str ("정상" | "주의" | "위험")
- **Processing Flow**:
  1. Check normal range for indicator
  2. Consider gender (some indicators have gender-specific criteria)
  3. Compare value and return judgment

**Example Code**:
```python
import sys
import json

# Define normal ranges
NORMAL_RANGES = {
    "체질량지수": {"min": 18.5, "max": 24.9},
    "고혈압_수축기": {"min": 90, "max": 119},
    "고혈압_이완기": {"min": 60, "max": 79},
    "공복혈당": {"min": 70, "max": 99},
    "간기능_AST": {"min": 0, "max": 40},
    "간기능_ALT": {"min": 0, "max": 40},
    "신장기능_크레아티닌": {"min": 0.7, "max": 1.3},
    "빈혈_혈색소": {
        "남": {"min": 13.0, "max": 17.0},
        "여": {"min": 12.0, "max": 16.0}
    }
}

def judge_health_indicator(indicator_name, value, gender="남"):
    """Judge individual health indicator"""
    if indicator_name not in NORMAL_RANGES:
        return "Unknown"

    ranges = NORMAL_RANGES[indicator_name]

    # If gender-specific ranges exist
    if isinstance(ranges, dict) and gender in ranges:
        ranges = ranges[gender]

    # If no value
    if value is None or value == "":
        return "Not measured"

    try:
        value = float(value)
    except:
        return "Not measured"

    # Check normal range
    if ranges["min"] <= value <= ranges["max"]:
        return "정상"

    # Warning range (10% deviation from normal range)
    warning_margin = (ranges["max"] - ranges["min"]) * 0.1
    if (ranges["min"] - warning_margin) <= value <= (ranges["max"] + warning_margin):
        return "주의"

    # Risk
    return "위험"

def judge_all(health_data):
    """Judge all health indicators"""
    gender = health_data.get("gender", "남")
    judgments = {}

    for indicator_name, value in health_data.items():
        if indicator_name == "gender":
            continue
        judgments[f"{indicator_name}_판정"] = judge_health_indicator(indicator_name, value, gender)

    return judgments

if __name__ == "__main__":
    # Read health data JSON from stdin
    health_data = json.load(sys.stdin)

    # Perform judgment
    judgments = judge_all(health_data)

    # Output as JSON
    print(json.dumps(judgments, ensure_ascii=False))
```

---

### 7.3 PDF Analysis Module Sequence Diagram

```
User      Express   pdfIO.js   getResults.py   PDF_TEXT.py   PDF_ocr.py   getJudge.py
 │         │          │             │               │             │            │
 │ Upload  │          │             │               │             │            │
 │────────>│          │             │               │             │            │
 │         │ getResults(buffer)     │               │             │            │
 │         │─────────>│             │               │             │            │
 │         │          │ spawn       │               │             │            │
 │         │          │────────────>│               │             │            │
 │         │          │ stdin(PDF)  │               │             │            │
 │         │          │────────────>│               │             │            │
 │         │          │             │ extract_text  │             │            │
 │         │          │             │──────────────>│             │            │
 │         │          │             │<──────────────│ text_data   │            │
 │         │          │             │               │             │            │
 │         │          │             │ (if text fails) extract_ocr │            │
 │         │          │             │──────────────────────────────>│            │
 │         │          │             │<──────────────────────────────│ ocr_data   │
 │         │          │             │               │             │            │
 │         │          │<────────────│ JSON (health data)          │            │
 │         │<─────────│             │               │             │            │
 │         │          │             │               │             │            │
 │         │ getJudges(health_data) │               │             │            │
 │         │─────────>│             │               │             │            │
 │         │          │ spawn       │               │             │            │
 │         │          │──────────────────────────────────────────────────────>│
 │         │          │ stdin(JSON) │               │             │            │
 │         │          │──────────────────────────────────────────────────────>│
 │         │          │             │               │             │  judge_all │
 │         │          │             │               │             │<───────────│
 │         │          │<──────────────────────────────────────────────────────│
 │         │<─────────│ JSON (judgments)           │             │            │
 │<────────│          │             │               │             │            │
 │  Return │          │             │               │             │            │
```

---

### 7.4 PDF Analysis Module Key Data Structures

#### 7.4.1 Health Indicator Extraction Result (getResults return value)

```javascript
{
  "gender": "남",
  "체질량지수": 23.5,
  "고혈압_수축기": 120,
  "고혈압_이완기": 80,
  "공복혈당": 95,
  "간기능_AST": 25,
  "간기능_ALT": 28,
  "신장기능_크레아티닌": 0.9,
  "빈혈_혈색소": 14.5,
  "총콜레스테롤": 180,
  "중성지방": 120
}
```

#### 7.4.2 Health Judgment Result (getJudges return value)

```javascript
{
  "체질량지수_판정": "정상",
  "고혈압_수축기_판정": "정상",
  "고혈압_이완기_판정": "정상",
  "공복혈당_판정": "정상",
  "간기능_AST_판정": "정상",
  "간기능_ALT_판정": "정상",
  "신장기능_크레아티닌_판정": "정상",
  "빈혈_혈색소_판정": "정상"
}
```

#### 7.4.3 Health Score Result (getScore return value)

```javascript
{
  "total_score": 85,
  "category_scores": {
    "비만도": 100,
    "혈압": 100,
    "혈당": 100,
    "간기능": 90,
    "신장기능": 80,
    "빈혈": 85
  }
}
```

---

### 7.5 PDF Analysis Module Error Codes

| Code | Message | HTTP Status | Description |
|------|---------|-------------|-------------|
| 4001 | Not a PDF file | 400 | Invalid file format |
| 4002 | PDF parsing failed | 500 | PDF read error |
| 4003 | Health indicator extraction failed | 500 | Both text and OCR failed |
| 4004 | Python process error | 500 | Python execution failed |
| 4005 | JSON parsing failed | 500 | Python output parsing error |

---

## 8. Component (Module)-3 Design: Alarm Scheduler Module

### 8.1 Alarm Scheduler Module Class Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   AlarmSchedulerModule                       │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│AlarmScheduler│  │ CronJobs     │  │ Database     │
├──────────────┤  ├──────────────┤  ├──────────────┤
│- db          │  │- node-cron   │  │- user_choices│
│- moment-tz   │  │- timezone    │  │- user_alarms │
├──────────────┤  ├──────────────┤  ├──────────────┤
│+setupUser    │  │+everyMinute  │  │+INSERT       │
│  Alarms()    │  │+dailyMidnight│  │+SELECT       │
│+generateAlarm│  │              │  │+UPDATE       │
│  Times()     │  │              │  │              │
│+parseMeal    │  │              │  │              │
│  Timing()    │  │              │  │              │
│+getTodayAlarms│  │              │  │              │
│+recordIntake │  │              │  │              │
│  Status()    │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 8.2 Class Design

#### 8.2.1 AlarmScheduler (alarmScheduler.js)

**Role**: User-specific alarm creation and management, time calculation

##### Member Data Description

| Variable | Type | Description |
|----------|------|-------------|
| `db` | Connection Pool | vitasense database connection |
| `MEAL_TIMES` | Object | Default meal times (breakfast, lunch, dinner) |
| `MEAL_OFFSET` | Object | Before/after meal time offset (in minutes) |

##### Member Function Description

**1. `parseMealTiming(howToUseText)`**

- **Description**: Extracts before/after meal information from supplement usage text
- **Parameters**:
  - `howToUseText`: String (Supplement usage text)
- **Return Value**: String ("식전" | "식후" | "상관없음")
- **Processing Flow**:
  1. Search for "식전", "식후" keywords in text
  2. Return matching keyword
  3. Return "상관없음" if no match

**Example Code**:
```javascript
const db = require('../db');

// Default meal times (KST)
const MEAL_TIMES = {
  breakfast: '07:00',
  lunch: '12:00',
  dinner: '19:00'
};

// Before/after meal offset (minutes)
const MEAL_OFFSET = {
  before: -30,  // Before meal: 30 minutes before
  after: 30     // After meal: 30 minutes after
};

/**
 * Parse before/after meal from usage text
 */
function parseMealTiming(howToUseText) {
  if (!howToUseText) return '상관없음';

  const text = howToUseText.toLowerCase();

  if (text.includes('식전')) {
    return '식전';
  } else if (text.includes('식후')) {
    return '식후';
  } else {
    return '상관없음';
  }
}

module.exports.parseMealTiming = parseMealTiming;
```

**2. `generateAlarmTimes(dailyCount, mealTiming)`**

- **Description**: Generates alarm times based on daily intake frequency and meal timing
- **Parameters**:
  - `dailyCount`: Number (1, 2, or 3)
  - `mealTiming`: String ("식전" | "식후" | "상관없음")
- **Return Value**: Array<String> (Time array, e.g., ["07:00", "12:00"])
- **Processing Flow**:
  1. Select base meal times according to dailyCount
  2. Apply offset according to mealTiming
  3. Return time array in HH:mm format

**Example Code**:
```javascript
/**
 * Generate alarm times
 */
function generateAlarmTimes(dailyCount, mealTiming) {
  let baseTimes = [];

  // Select base times according to dailyCount
  switch (dailyCount) {
    case 1:
      baseTimes = [MEAL_TIMES.breakfast];
      break;
    case 2:
      baseTimes = [MEAL_TIMES.breakfast, MEAL_TIMES.lunch];
      break;
    case 3:
      baseTimes = [MEAL_TIMES.breakfast, MEAL_TIMES.lunch, MEAL_TIMES.dinner];
      break;
    default:
      baseTimes = [MEAL_TIMES.breakfast];
  }

  // Apply before/after meal offset
  let offset = 0;
  if (mealTiming === '식전') {
    offset = MEAL_OFFSET.before;
  } else if (mealTiming === '식후') {
    offset = MEAL_OFFSET.after;
  }

  // Calculate times
  const alarmTimes = baseTimes.map(timeStr => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + offset;

    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  });

  return alarmTimes;
}

module.exports.generateAlarmTimes = generateAlarmTimes;
```

**3. `setupUserAlarms(userId, conditionName, supplementId, selectedDailyCount)`**

- **Description**: Creates user alarm settings and initial alarms
- **Parameters**:
  - `userId`: Number (User ID)
  - `conditionName`: String (Health condition name)
  - `supplementId`: Number (Supplement ID)
  - `selectedDailyCount`: Number (Daily intake frequency)
- **Return Value**: Promise<Object> (Created choice information)
- **Processing Flow**:
  1. Query supplement information (check usage instructions)
  2. Determine before/after meal with parseMealTiming()
  3. INSERT into user_choices table
  4. Calculate alarm times with generateAlarmTimes()
  5. Create today's alarms (INSERT into user_alarms)

**Example Code**:
```javascript
/**
 * Setup user alarms
 */
async function setupUserAlarms(userId, conditionName, supplementId, selectedDailyCount) {
  try {
    // 1. Query supplement information
    const [supplements] = await db.query(
      'SELECT how_to_use FROM supplements WHERE id = ?',
      [supplementId]
    );

    if (supplements.length === 0) {
      throw new Error('Supplement not found.');
    }

    const howToUse = supplements[0].how_to_use;

    // 2. Determine before/after meal
    const mealTiming = parseMealTiming(howToUse);

    // 3. Create user_choices (prevent duplicates with UNIQUE constraint)
    const [result] = await db.query(
      `INSERT INTO user_choices (user_id, condition_name, supplement_id, daily_count, meal_type)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE supplement_id = ?, daily_count = ?, meal_type = ?`,
      [userId, conditionName, supplementId, selectedDailyCount, mealTiming,
       supplementId, selectedDailyCount, mealTiming]
    );

    const choiceId = result.insertId || (await db.query(
      'SELECT choice_id FROM user_choices WHERE user_id = ? AND condition_name = ?',
      [userId, conditionName]
    ))[0][0].choice_id;

    // 4. Generate alarm times
    const alarmTimes = generateAlarmTimes(selectedDailyCount, mealTiming);

    // 5. Create today's alarms
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    for (const alarmTime of alarmTimes) {
      await db.query(
        `INSERT IGNORE INTO user_alarms (choice_id, alarm_date, alarm_time, meal_type, intake_status)
         VALUES (?, ?, ?, ?, ?)`,
        [choiceId, today, alarmTime, mealTiming, '미확인']
      );
    }

    return {
      choiceId,
      dailyCount: selectedDailyCount,
      mealTiming,
      alarmTimes
    };

  } catch (error) {
    console.error('Alarm setup error:', error);
    throw error;
  }
}

module.exports.setupUserAlarms = setupUserAlarms;
```

**4. `createDailyAlarms(choiceId, date)`**

- **Description**: Creates alarms for a specific choice on a specific date (called by Cron)
- **Parameters**:
  - `choiceId`: Number (user_choices ID)
  - `date`: String (YYYY-MM-DD format)
- **Return Value**: Promise<void>
- **Processing Flow**:
  1. Query choice information (daily_count, meal_type)
  2. Calculate times with generateAlarmTimes()
  3. INSERT IGNORE into user_alarms

**Example Code**:
```javascript
/**
 * Create daily alarms (called by Cron)
 */
async function createDailyAlarms(choiceId, date) {
  try {
    // Query choice information
    const [choices] = await db.query(
      'SELECT daily_count, meal_type FROM user_choices WHERE choice_id = ?',
      [choiceId]
    );

    if (choices.length === 0) return;

    const { daily_count, meal_type } = choices[0];

    // Generate alarm times
    const alarmTimes = generateAlarmTimes(daily_count, meal_type);

    // Insert alarms
    for (const alarmTime of alarmTimes) {
      await db.query(
        `INSERT IGNORE INTO user_alarms (choice_id, alarm_date, alarm_time, meal_type, intake_status)
         VALUES (?, ?, ?, ?, ?)`,
        [choiceId, date, alarmTime, meal_type, '미확인']
      );
    }

    console.log(`[Scheduler] Created alarms for choiceId ${choiceId} on ${date}`);

  } catch (error) {
    console.error('Daily alarm creation error:', error);
  }
}

module.exports.createDailyAlarms = createDailyAlarms;
```

**5. `getTodayAlarms(userId)`**

- **Description**: Queries today's alarm list for a specific user
- **Parameters**:
  - `userId`: Number (User ID)
- **Return Value**: Promise<Array> (Alarm list)
- **Processing Flow**:
  1. Get today's date
  2. user_alarms JOIN user_choices JOIN supplements
  3. Filter by userId
  4. Sort by alarm_time

**Example Code**:
```javascript
/**
 * Query today's alarms
 */
async function getTodayAlarms(userId) {
  const today = new Date().toISOString().split('T')[0];

  const [alarms] = await db.query(
    `SELECT
      ua.alarm_id,
      ua.alarm_date,
      ua.alarm_time,
      ua.meal_type,
      ua.intake_status,
      s.item_name,
      s.how_to_use,
      uc.condition_name
    FROM user_alarms ua
    JOIN user_choices uc ON ua.choice_id = uc.choice_id
    JOIN supplements s ON uc.supplement_id = s.id
    WHERE uc.user_id = ? AND ua.alarm_date = ?
    ORDER BY ua.alarm_time`,
    [userId, today]
  );

  return alarms;
}

module.exports.getTodayAlarms = getTodayAlarms;
```

**6. `recordIntakeStatus(alarmId, status)`**

- **Description**: Updates alarm intake status
- **Parameters**:
  - `alarmId`: Number (Alarm ID)
  - `status`: String ("복용" | "미복용" | "미확인")
- **Return Value**: Promise<void>
- **Processing Flow**:
  1. UPDATE user_alarms table
  2. Change intake_status value

**Example Code**:
```javascript
/**
 * Record intake status
 */
async function recordIntakeStatus(alarmId, status) {
  const validStatuses = ['복용', '미복용', '미확인'];

  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status value.');
  }

  await db.query(
    'UPDATE user_alarms SET intake_status = ? WHERE alarm_id = ?',
    [status, alarmId]
  );

  console.log(`[Scheduler] Updated alarm ${alarmId} status: ${status}`);
}

module.exports.recordIntakeStatus = recordIntakeStatus;
```

---

### 8.3 Alarm Scheduler Module Sequence Diagram

```
User      Express   AlarmScheduler   CronJob(00:00)   CronJob(Every Min)   NotificationService   Database
 │         │            │                  │                  │                      │               │
 │Setup    │            │                  │                  │                      │               │
 │────────>│            │                  │                  │                      │               │
 │         │ setupUserAlarms               │                  │                      │               │
 │         │───────────>│                  │                  │                      │               │
 │         │            │ parseMealTiming  │                  │                      │               │
 │         │            │─────────────────>│                  │                      │               │
 │         │            │<─────────────────│ "식후"           │                      │               │
 │         │            │                  │                  │                      │               │
 │         │            │ generateAlarmTimes                  │                      │               │
 │         │            │─────────────────────────────────────>│                      │               │
 │         │            │<─────────────────────────────────────│ ["07:30", "12:30"]  │               │
 │         │            │                  │                  │                      │               │
 │         │            │ INSERT user_choices                 │                      │               │
 │         │            │───────────────────────────────────────────────────────────────────────────>│
 │         │            │<───────────────────────────────────────────────────────────────────────────│
 │         │            │ INSERT user_alarms (today)          │                      │               │
 │         │            │───────────────────────────────────────────────────────────────────────────>│
 │         │            │<───────────────────────────────────────────────────────────────────────────│
 │         │<───────────│                  │                  │                      │               │
 │<────────│            │                  │                  │                      │               │
 │         │            │                  │                  │                      │               │
 │         │            │                  │  Daily 00:00     │                      │               │
 │         │            │                  │<─────────────────│                      │               │
 │         │            │ createDailyAlarms│                  │                      │               │
 │         │            │<─────────────────│                  │                      │               │
 │         │            │ INSERT alarms    │                  │                      │               │
 │         │            │───────────────────────────────────────────────────────────────────────────>│
 │         │            │<───────────────────────────────────────────────────────────────────────────│
 │         │            │                  │                  │                      │               │
 │         │            │                  │                  │  Every minute        │               │
 │         │            │                  │                  │<─────────────────────│               │
 │         │            │ SELECT alarms    │                  │                      │               │
 │         │            │<──────────────────────────────────────────────────────────────────────────│
 │         │            │───────────────────────────────────────────────────────────────────────────>│
 │         │            │                  │                  │  sendKakaoTalk       │               │
 │         │            │──────────────────────────────────────────────────────────>│               │
 │         │            │                  │                  │<─────────────────────│               │
 │  KakaoTalk          │                  │                  │                      │               │
 │  Notification       │                  │                  │                      │               │
 │<────────────────────────────────────────────────────────────────────────────────────────────────│
```

---

### 8.4 Alarm Scheduler Module Key Data Structures

#### 8.4.1 user_choices Table Record

```javascript
{
  choice_id: 1,
  user_id: 123,
  condition_name: "고혈압",
  supplement_id: 456,
  daily_count: 2,
  meal_type: "식후",
  created_at: "2024-12-06T09:30:00.000Z"
}
```

#### 8.4.2 user_alarms Table Record

```javascript
{
  alarm_id: 789,
  choice_id: 1,
  alarm_date: "2024-12-06",
  alarm_time: "07:30:00",
  meal_type: "식후",
  intake_status: "미확인",
  created_at: "2024-12-06T00:00:00.000Z"
}
```

#### 8.4.3 Alarm Time Generation Examples

```javascript
// Input
dailyCount = 3
mealTiming = "식전"

// Output
alarmTimes = ["06:30", "11:30", "18:30"]  // Each with -30min offset

// Input
dailyCount = 2
mealTiming = "식후"

// Output
alarmTimes = ["07:30", "12:30"]  // Each with +30min offset
```

---

### 8.5 Alarm Scheduler Module Error Codes

| Code | Message | HTTP Status | Description |
|------|---------|-------------|-------------|
| 5001 | Supplement not found | 404 | Invalid supplement_id |
| 5002 | Invalid daily count | 400 | daily_count must be 1~3 |
| 5003 | Alarm creation failed | 500 | DB INSERT failed |
| 5004 | Alarm not found | 404 | Invalid alarm_id |
| 5005 | Invalid status value | 400 | intake_status error |

---

This completes the detailed design of the **Authentication Module**, **PDF Analysis Module**, and **Alarm Scheduler Module**.
Other modules can be documented in the same way.
