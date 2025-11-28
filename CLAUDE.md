# CLAUDE.md - VitaSense Development Guide

## Project Overview

**VitaSense** is a personalized supplement recommendation and notification system that analyzes health checkup PDFs and provides customized supplement recommendations via KakaoTalk notifications.

**Tech Stack:**
- **Backend:** Node.js with Express.js
- **Database:** MySQL (dual database architecture)
- **Authentication:** Kakao OAuth 2.0 + JWT
- **PDF Processing:** Python (PyMuPDF, easyocr)
- **Scheduling:** node-cron
- **Notifications:** KakaoTalk Messaging API

**Repository:** https://github.com/Graduation-Project-JPD/JPDamn

---

## Directory Structure

```
/
├── index.js                    # Main server entry point (Express + Cron schedulers)
├── errors.js                   # Centralized error codes
├── package.json                # Node.js dependencies
│
├── auth/                       # Authentication module
│   ├── authController.js       # Kakao OAuth callback handlers
│   ├── authMiddleware.js       # JWT token verification middleware
│   ├── kakaoAuthService.js     # Kakao API integration
│   └── db.js                   # user_info DB connection pool
│
├── analysis/                   # Core business logic
│   ├── pdfIO.js               # Python script integration (PDF processing)
│   ├── saveRecord.js          # Health record history management
│   ├── db.js                  # vitasense DB connection pool
│   ├── VitaSenseDB.session.sql # Complete database schema
│   ├── services/
│   │   ├── alarmScheduler.js  # Alarm creation and scheduling logic
│   │   ├── notificationService.js # KakaoTalk notification service
│   │   └── supplementService.js   # Supplement recommendation queries
│   └── data/
│       └── supplements_dummy.json # Initial supplement data
│
└── extract-pdf/                # Python PDF extraction module
    └── extractor/
        ├── getResults.py       # Extract health metrics from PDF
        ├── getJudge.py         # Health status judgment logic
        ├── getScore.py         # Health score calculation
        ├── PDF_TEXT.py         # Text-based PDF extraction
        ├── PDF_ocr.py          # OCR-based PDF extraction
        └── requirements.txt    # Python dependencies
```

---

## Architecture Overview

### Dual Database Architecture

The system uses **two separate MySQL databases**:

1. **`user_info`** - User authentication and health records
   - Tables: `users`, `user_results`
   - Connection: `auth/db.js`

2. **`vitasense`** - Supplement and alarm data
   - Tables: `supplements`, `user_choices`, `user_alarms`, `supplement_conditions`, etc.
   - Connection: `analysis/db.js`

### Key Data Flow

1. **Authentication Flow:**
   ```
   User → Kakao OAuth → authController.kakaoCallback
   → Save to user_info.users → Issue JWT → Store in httpOnly cookie
   ```

2. **PDF Analysis Flow:**
   ```
   PDF Upload → pdfIO.getResults (Python) → Extract metrics
   → pdfIO.getJudges → Health status judgment
   → pdfIO.getScore → Calculate health score
   → saveRecord.submitAll → Store in user_results
   ```

3. **Alarm Flow:**
   ```
   User selects supplement → alarmScheduler.setupUserAlarms
   → Create user_choices record → Generate daily alarms (00:00 cron)
   → Check alarms every minute (cron) → Send KakaoTalk notification
   ```

---

## Database Schema

### user_info Database

**users**
- `id` (PK) - Internal user ID
- `kakao_id` (UNIQUE) - Kakao user identifier
- `nickname` - User's Kakao nickname
- `kakao_access_token` - For KakaoTalk API calls
- `kakao_refresh_token` - Token refresh

**user_results**
- `id` (PK)
- `user_id` (FK → users.id)
- `result_json` - Raw health metrics
- `judge_json` - Health status judgments
- `supplement_json` - Recommended supplements
- `created_at` - Timestamp

### vitasense Database

**supplements**
- `id` (PK)
- `item_seq` - Unique product number
- `item_name` - Supplement name
- `efficacy`, `how_to_use`, `warning`, `interaction`, etc.

**user_choices**
- `choice_id` (PK)
- `user_id`, `condition_name`, `supplement_id`
- `daily_count` (1-3 times per day)
- `meal_type` (식전/식후/상관없음)
- UNIQUE constraint on (user_id, condition_name)

**user_alarms**
- `alarm_id` (PK)
- `choice_id` (FK → user_choices)
- `alarm_time`, `alarm_date`
- `intake_status` (미확인/복용/미복용)
- UNIQUE constraint on (choice_id, alarm_date, alarm_time)

---

## API Endpoints

All authenticated endpoints require JWT token in:
- Cookie: `token` (httpOnly)
- OR Header: `Authorization: Bearer <token>`

### Authentication
- `GET /` - Returns Kakao login URL
- `GET /kakao/callback` - OAuth callback, issues JWT
- `POST /auth/logout` - Clears token cookie
- `GET /auth/profile` - Returns current user info (requires auth)

### PDF Processing
- `POST /pdf/upload` - Upload PDF, extract health metrics (multipart/form-data)
- `POST /pdf/judge` - Get health judgments from metrics (JSON)
- `POST /pdf/score` - Calculate total health score (JSON)
- `POST /pdf/modify` - User-modified health values (JSON)

### Supplements
- `GET /supplements?condition=<name>` - Get recommended supplements by condition

### Alarms
- `POST /alarms/setup` - Create alarm schedule (JSON)
- `GET /alarms/today` - Get today's alarms
- `POST /alarms/check` - Update intake status (JSON)
- `GET /alarms/check-via-kakao?alarm_id=<id>` - Mark as taken via KakaoTalk link
- `POST /alarms/send-test` - Send test notification (JSON)

### History
- `POST /results/submit` - Save health checkup results (JSON)
- `GET /results/history` - Get user's health history

---

## Key Components

### 1. Authentication Middleware (`auth/authMiddleware.js`)

```javascript
exports.authenticateToken = (req, res, next)
```
- Checks for JWT in cookies or Authorization header
- Verifies token with `JWT_SECRET`
- Attaches `req.user` with `{user_id, username}`
- Returns error codes from `errors.js` on failure

### 2. PDF Processing (`analysis/pdfIO.js`)

Bridges Node.js and Python scripts:
- `getResults` - Calls Python `getResults.py` with PDF buffer
- `getJudges` - Calls Python `getJudge.py` with extracted metrics
- `getScore` - Calls Python `getScore.py` for health score
- Uses `child_process.spawn` for Python execution

### 3. Alarm Scheduler (`analysis/services/alarmScheduler.js`)

**Key Functions:**
- `parseMealTiming(howToUseText)` - Extracts meal timing from supplement instructions
- `generateAlarmTimes(dailyCount, mealTiming)` - Creates alarm times based on meal type
  - 식전 (before meal): -30 min offset
  - 식후 (after meal): +30 min offset
  - Default times: 07:00, 12:00, 19:00
- `setupUserAlarms(userId, condition, supplementId, dailyCount)` - Creates user_choices and initial alarms
- `createDailyAlarms(choice, today)` - Called by cron to generate daily alarms
- `getTodayAlarms(userId)` - Fetches today's alarm list
- `recordIntakeStatus(alarmId, status)` - Updates intake status

### 4. Notification Service (`analysis/services/notificationService.js`)

- `sendKakaoTalk(userId, message, alarmId)` - Sends KakaoTalk message
- Retrieves user's `kakao_access_token` from `user_info.users`
- Uses Kakao "나에게 메시지 보내기" API
- Includes deep link for quick intake confirmation

### 5. Cron Schedulers (`index.js`)

**Alarm Checker (runs every minute):**
```javascript
cron.schedule("*/1 * * * *", async () => {...})
```
- Converts to KST timezone (+9 hours)
- Queries `user_alarms` for matching time/date
- Sends KakaoTalk notifications
- Only triggers for `intake_status = '미확인'`

**Daily Alarm Generator (runs at 00:00 KST):**
```javascript
cron.schedule("0 0 * * *", async () => {...}, { timezone: "Asia/Seoul" })
```
- Fetches all `user_choices`
- Calls `createDailyAlarms` for each choice
- Generates today's alarms based on daily_count and meal_type

---

## Development Workflows

### Initial Setup

1. **Install Dependencies:**
   ```bash
   npm install
   pip install -r ./extract-pdf/extractor/requirements.txt
   ```

2. **Configure Environment (`.env`):**
   ```env
   # vitasense database
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=vitasense

   # user_info database
   DB_L_HOST=localhost
   DB_L_USER=root
   DB_L_PASSWORD=your_password
   DB_L_NAME=user_info

   # JWT
   JWT_SECRET=your_jwt_secret_key

   # Kakao API
   KAKAO_REST_API_KEY=your_kakao_rest_api_key
   KAKAO_REDIRECT_URI=http://localhost:4000/kakao/callback
   KAKAO_CLIENT_SECRET=your_kakao_client_secret

   # Frontend URL
   CLIENT_URL=http://localhost:5173
   ```

3. **Database Setup:**
   ```bash
   mysql -u root -p < analysis/VitaSenseDB.session.sql
   ```

4. **Load Supplement Data:**
   ```bash
   node analysis/main.js
   ```

5. **Start Server:**
   ```bash
   node index.js
   ```

### Adding New Features

1. **New API Endpoint:**
   - Add route in `index.js`
   - Use `authenticateToken` middleware for protected routes
   - Follow REST conventions

2. **New Database Table:**
   - Update `analysis/VitaSenseDB.session.sql`
   - Follow existing naming conventions (snake_case)
   - Add proper foreign keys and indexes

3. **New Python Processing:**
   - Add script in `extract-pdf/extractor/`
   - Create Node.js bridge function in `analysis/pdfIO.js`
   - Use `child_process.spawn` for execution

---

## Code Style and Conventions

### JavaScript (Node.js)

- **Module System:** CommonJS (`require`/`module.exports`)
- **Async Handling:** `async/await` preferred over callbacks
- **Database Queries:** Use parameterized queries (prepared statements)
  ```javascript
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  ```
- **Error Handling:** Use centralized error codes from `errors.js`
- **Logging:** Console.log with prefixes (e.g., `[Scheduler]`, `[Auth]`)

### Database Naming

- **Tables:** snake_case (e.g., `user_alarms`, `user_choices`)
- **Columns:** snake_case (e.g., `created_at`, `kakao_id`)
- **Foreign Keys:** Explicit naming with table reference

### Python

- **Imports:** Group standard library, third-party, then local
- **Functions:** snake_case naming
- **Data Exchange:** JSON via stdin/stdout with Node.js

---

## Important Notes for AI Assistants

### Critical Constraints

1. **Two Separate Databases:** Always use correct connection pool
   - User auth → `auth/db.js` → `user_info` DB
   - Business logic → `analysis/db.js` → `vitasense` DB

2. **Timezone Handling:** All times are KST (UTC+9)
   - Cron jobs use KST conversion: `new Date(now.getTime() + 9 * 60 * 60 * 1000)`
   - Always format as `YYYY-MM-DD HH:mm:ss` for DB storage

3. **Kakao Token Management:**
   - Access tokens stored in `user_info.users.kakao_access_token`
   - Required for sending KakaoTalk messages
   - Tokens can expire - implement refresh logic if needed

4. **JWT Authentication:**
   - Token stored in httpOnly cookie for web security
   - Also accept Authorization header for API clients
   - 1-hour expiration (`expiresIn: '1h'`)

### Common Pitfalls

1. **PDF Processing:**
   - Python scripts expect binary data via stdin
   - Always handle both text extraction and OCR fallback
   - Check for null/missing values in extracted metrics

2. **Alarm Timing:**
   - `generateAlarmTimes` uses UTC calculations, converts to KST
   - Meal timing offset: 식전 = -30min, 식후 = +30min
   - Ensure UNIQUE constraint on (choice_id, alarm_date, alarm_time)

3. **CORS Configuration:**
   - Server allows `CLIENT_URL` origin with credentials
   - Always include `credentials: true` in frontend requests

4. **Database Transactions:**
   - Use transactions for multi-table operations (e.g., creating user_choices + alarms)
   - Current code doesn't use transactions - consider adding for atomicity

### Testing Checklist

When modifying the codebase:

- [ ] Test Kakao login flow end-to-end
- [ ] Verify JWT token expiration and renewal
- [ ] Test PDF upload with various PDF formats
- [ ] Check alarm generation at midnight (use manual time injection)
- [ ] Verify KakaoTalk notifications are sent correctly
- [ ] Test intake status updates (복용/미복용)
- [ ] Ensure CORS works with frontend
- [ ] Check database connection pool doesn't leak
- [ ] Verify timezone conversions are correct
- [ ] Test error codes return properly

### Key Files to Modify

| Task | Primary Files |
|------|--------------|
| Add new API endpoint | `index.js` |
| Change auth logic | `auth/authController.js`, `auth/authMiddleware.js` |
| Modify alarm behavior | `analysis/services/alarmScheduler.js`, `index.js` (cron) |
| Update PDF extraction | `extract-pdf/extractor/getResults.py`, `analysis/pdfIO.js` |
| Change database schema | `analysis/VitaSenseDB.session.sql` |
| Add supplement logic | `analysis/services/supplementService.js` |
| Modify notifications | `analysis/services/notificationService.js` |
| Add error codes | `errors.js` |

### Performance Considerations

1. **Database Connection Pools:**
   - Both `auth/db.js` and `analysis/db.js` use `mysql2` pools
   - Default pool size is usually 10 connections
   - Monitor for connection leaks in long-running cron jobs

2. **Cron Job Efficiency:**
   - Every-minute cron queries all pending alarms
   - Consider indexing `(alarm_date, alarm_time, intake_status)` for faster lookups
   - Current implementation already uses `INSERT IGNORE` for idempotency

3. **Python Process Spawning:**
   - Each PDF upload spawns a Python process
   - Consider keeping a Python worker pool for high traffic
   - Current implementation is fine for low-moderate usage

### Security Notes

1. **Environment Variables:**
   - Never commit `.env` file
   - All secrets must be in environment variables
   - JWT_SECRET should be cryptographically random

2. **SQL Injection:**
   - Always use parameterized queries
   - Current code follows this pattern - maintain it

3. **Token Storage:**
   - JWT in httpOnly cookie prevents XSS attacks
   - Consider adding CSRF protection for state-changing operations

4. **Input Validation:**
   - Add validation for user inputs (currently minimal)
   - Validate enum values (e.g., intake_status, meal_type)
   - Sanitize PDF upload filenames

---

## Future Enhancements

Consider these improvements:

1. **Token Refresh Logic:** Implement Kakao token refresh before expiration
2. **Transaction Support:** Add database transactions for atomic operations
3. **Error Recovery:** Implement retry logic for failed KakaoTalk sends
4. **Monitoring:** Add logging/monitoring for cron job execution
5. **Rate Limiting:** Add rate limits to API endpoints
6. **Input Validation:** Use validation library (e.g., Joi, express-validator)
7. **Testing:** Add unit tests for alarm scheduler and PDF processing
8. **Documentation:** Add API documentation (Swagger/OpenAPI)
9. **Deployment:** Add Docker configuration for containerization
10. **Conflict Detection:** Implement supplement-supplement and drug-supplement conflict checking using existing tables

---

## Quick Reference

### Start Development Server
```bash
node index.js
```

### Test Endpoints
```bash
# Get Kakao login URL
curl http://localhost:4000/

# Check profile (with auth)
curl -H "Authorization: Bearer <token>" http://localhost:4000/auth/profile

# Get today's alarms
curl -b "token=<jwt_token>" http://localhost:4000/alarms/today
```

### Common MySQL Queries
```sql
-- View all alarms for today
SELECT * FROM user_alarms WHERE alarm_date = CURDATE();

-- View user supplement choices
SELECT uc.*, s.item_name
FROM user_choices uc
JOIN supplements s ON uc.supplement_id = s.id;

-- View alarm history with intake status
SELECT ua.*, s.item_name, u.nickname
FROM user_alarms ua
JOIN user_choices uc ON ua.choice_id = uc.choice_id
JOIN supplements s ON uc.supplement_id = s.id
JOIN user_info.users u ON uc.user_id = u.id
WHERE ua.alarm_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);
```

---

## Contact and Repository

- **Repository:** https://github.com/Graduation-Project-JPD/JPDamn
- **License:** ISC
- **Node Version:** Compatible with Node.js 14+
- **Python Version:** Python 3.7+

---

**Last Updated:** 2025-11-28
