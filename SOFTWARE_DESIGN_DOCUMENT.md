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
