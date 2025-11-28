require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
//const upload = multer();
const app = express();
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const db = require("./analysis/db");
const notificationService = require("./analysis/services/notificationService");

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ======================================================
//  Auth (회원가입 / 로그인 / 토큰 인증)
// ======================================================
const authController = require("./auth/authController");
const { authenticateToken } = require("./auth/authMiddleware");

app.get("/", (req, res) => {
  try {
    // .env 파일에 KAKAO_REST_API_KEY와 KAKAO_REDIRECT_URI가 있어야 합니다.
    const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
    const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&scope=talk_message,profile_nickname`;
    res.json({ redirect: kakaoAuthURL });
  } catch (e) {
    console.error("카카오 로그인 실패 : " + e);
    res.status(500).json(ERROR_CODES.LOGIN_ERROR);
  }
});

app.get("/kakao/callback", authController.kakaoCallback);

app.post("/auth/logout", authController.logout);

app.get("/auth/profile", authenticateToken, (req, res) => {
  res.json({ userId: req.user.user_id, userName: req.user.username });
});

// ======================================================
//  Health Data Extraction (PDF 업로드 → 결과 추출 & 판정)
// ======================================================
const pdfIO = require("./analysis/pdfIO");

// PDF 업로드 & Python 실행 → 결과 JSON 반환
app.post(
  "/pdf/upload",
  authenticateToken,
  upload.single("file"),
  pdfIO.getResults
);

// 판정 실행
app.post("/pdf/judge", authenticateToken, pdfIO.getJudges);

// 수정된 결과 저장
app.post("/pdf/modify", authenticateToken, pdfIO.modifyResults);

// Total 점수 계산
app.post("/pdf/score", authenticateToken, pdfIO.getScore);

// ======================================================
//  Save User Result (히스토리 저장 및 조회)
// ======================================================
const saveRecord = require("./analysis/saveRecord");

app.post("/results/submit", authenticateToken, saveRecord.submitAll);
app.get("/results/history", authenticateToken, saveRecord.getHistory);

// ======================================================
//  Supplement Recommendation (조건별 추천 영양제 제공)
// ======================================================
const supplementService = require("./analysis/services/supplementService");

app.get("/supplements", authenticateToken, async (req, res) => {
  const { condition } = req.query;
  const supplements = await supplementService.getTopNSupplements(condition);
  res.json(supplements);
});

// ======================================================
//  Alarm & Intake Tracking (영양제 복용 알람 생성 및 기록)
// ======================================================
const alarmScheduler = require("./analysis/services/alarmScheduler");
const ERROR_CODES = require("./errors");

app.post("/alarms/setup", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { conditionName, supplementId, selectedDailyCount } = req.body;
    const result = await alarmScheduler.setupUserAlarms(
      userId,
      conditionName,
      supplementId,
      selectedDailyCount
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/alarms/today", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const alarms = await alarmScheduler.getTodayAlarms(userId);
    res.json(alarms);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/alarms/check", authenticateToken, async (req, res) => {
  try {
    const { alarmId, status } = req.body;
    const result = await alarmScheduler.recordIntakeStatus(alarmId, status);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/alarms/check-via-kakao", authenticateToken, async (req, res) => {
  try {
    const alarmId = req.query.alarm_id;
    const userId = req.user.user_id;

    if (!alarmId) {
      return res
        .status(400)
        .send(
          "<html><body><h1>오류</h1><p>알람 ID가 없습니다.</p></body></html>"
        );
    }

    await alarmScheduler.recordIntakeStatus(alarmId, "복용");

    res.send(
      "<html><body><h1>복용 완료!</h1><p>VitaSense: 알람이 '복용' 상태로 기록되었습니다.</p></body></html>"
    );
  } catch (e) {
    console.error("[Kakao Check Error]", e);
    res
      .status(500)
      .send(
        "<html><body><h1>오류 발생</h1><p>알람 상태 변경 중 오류가 발생했습니다.</p></body></html>"
      );
  }
});

app.post("/alarms/send-test", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const message = req.body.message || "VitaSense 테스트 알람입니다!";
    await notificationService.sendKakaoTalk(userId, message);
    res.json({ success: true, message: "테스트 메시지 전송 시도 완료" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ======================================================
//  Server Start
// ======================================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`VitaSense Server (Kakao Auth) running on port ${PORT}`);
  console.log(`로그인 페이지: http://localhost:${PORT}/`);

  console.log("[Scheduler] 카카오톡 알람 스케줄러가 활성화되었습니다.");
  cron.schedule("*/1 * * * *", async () => {
    const now = new Date();
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    const year = kstNow.getUTCFullYear();
    const month = String(kstNow.getUTCMonth() + 1).padStart(2, "0");
    const day = String(kstNow.getUTCDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    const hours = String(kstNow.getUTCHours()).padStart(2, "0");
    const minutes = String(kstNow.getUTCMinutes()).padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;

    console.log(`[Scheduler] ${today} ${currentTime} 알람 확인 중...`);

    try {
      const sql = `
        SELECT 
          ua.alarm_id, 
          uc.user_id, 
          s.item_name,
          ua.meal_type,
          u.nickname
        FROM 
          user_alarms ua
        JOIN 
          user_choices uc ON ua.choice_id = uc.choice_id
        JOIN 
          vitasense.supplements s ON uc.supplement_id = s.id
        JOIN
          user_info.users u ON uc.user_id = u.id
        WHERE 
          ua.alarm_date = ? 
          AND ua.alarm_time = ? 
          AND ua.intake_status = '미확인'
      `;

      const [alarms] = await db.query(sql, [today, `${currentTime}:00`]);

      if (alarms.length > 0) {
        console.log(`[Scheduler] ${alarms.length}개의 알람 발견. 전송 시작...`);
        await Promise.all(
          alarms.map((alarm) => {
            const message = `💊 ${alarm.nickname}님, ${alarm.item_name} (${alarm.meal_type}) 드실 시간입니다!`;
            return notificationService.sendKakaoTalk(
              alarm.user_id,
              message,
              alarm.alarm_id
            );
          })
        );
      }
    } catch (err) {
      console.error("[Scheduler] 알람 쿼리 또는 전송 중 오류:", err);
    }
  });

  console.log(
    "[Scheduler] 일일 알람 생성 스케줄러가 활성화되었습니다 (매일 00:00)."
  );
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("[Daily Cron] 00:00. 일일 알람 생성을 시작합니다.");

      const now = new Date();
      const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

      const year = kstNow.getUTCFullYear();
      const month = String(kstNow.getUTCMonth() + 1).padStart(2, "0");
      const day = String(kstNow.getUTCDate()).padStart(2, "0");
      const today = `${year}-${month}-${day}`;

      try {
        const [allChoices] = await db.query("SELECT * FROM user_choices");
        if (allChoices.length === 0) {
          console.log("[Daily Cron] 알람을 설정한 사용자가 없습니다.");
          return;
        }

        console.log(
          `[Daily Cron] ${allChoices.length}개의 알람 설정을 발견. 오늘 날짜(${today})의 알람을 생성합니다.`
        );

        await Promise.all(
          allChoices.map((choice) => {
            return alarmScheduler.createDailyAlarms(choice, today);
          })
        );

        console.log("[Daily Cron] 일일 알람 생성이 완료되었습니다.");
      } catch (err) {
        console.error("[Daily Cron] 일일 알람 생성 중 오류:", err);
      }
    },
    {
      timezone: "Asia/Seoul",
    }
  );
});
