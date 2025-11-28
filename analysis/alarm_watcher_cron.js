const cron = require("node-cron");
const readline = require("readline");
const db = require("./db");
const db_user = require("./db_user");
const { getTodayAlarms, recordIntakeStatus } = require("./services/alarmScheduler");

const COLOR_GRAY = '\x1b[90m';
const COLOR_RESET = '\x1b[0m';

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
}

function askTimed(question, timeout = 60000) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    let timer;
    let resolved = false;

    const timeoutFn = () => {
      if (resolved) return;
      resolved = true;
      rl.close();
      resolve(null);
    };

    timer = setTimeout(timeoutFn, timeout);

    rl.question(question, (ans) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      rl.close();
      resolve(ans.trim());
    });
  });
}

function toTodayTime(timeStr) {
  const [hour, minute, second] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, second || 0, 0);
  return date;
}

async function waitUntilAlarm(alarm) {
  const target = toTodayTime(alarm.alarm_time);
  const now = new Date();
  const delay = target - now;

  if (delay <= 0) return;

  console.log(`${alarm.item_name} 알람 예정: ${alarm.alarm_time} (${alarm.meal_type})`);

  await new Promise((resolve) => setTimeout(resolve, delay));

  console.log(`\n[${alarm.alarm_time}] ${alarm.item_name} (${alarm.meal_type}) 복용 알람입니다!\n`);

  const ans = await askTimed("복용 여부 입력 (1: 복용, 2: 미복용): ", 60000);

  if (ans === "1") {
    await recordIntakeStatus(alarm.alarm_id, "복용");
    console.log("복용으로 기록되었습니다.\n");
  } else if (ans === "2") {
    await recordIntakeStatus(alarm.alarm_id, "미복용");
    console.log("미복용으로 기록되었습니다.\n");
  } else if (ans === null) {
    const defaultStatus = "미복용"; 
    await recordIntakeStatus(alarm.alarm_id, defaultStatus);
    console.log(`\n[시간 초과] 60초 이내 응답이 없어 ${defaultStatus}으로 자동 기록되었습니다.\n`);
  } else {
    console.log("유효한 입력(1 또는 2)이 아니었으므로 복용 상태는 기록되지 않고 다음 알람으로 넘어갑니다.\n");
  }
}

async function startAlarmWatcher(userId) {
  console.log(`\n[${new Date().toLocaleString()}] ${userId}번 사용자 알람 시작\n`);

  const alarms = await getTodayAlarms(userId);

  if (alarms.length === 0) {
    console.log("오늘 등록된 알람이 없습니다.\n");
    return;
  }
  
  const now = new Date(); 

  console.log(`오늘 ${alarms.length}개의 알람이 있습니다.`);
  alarms.forEach((a) => {
    const alarmTime = toTodayTime(a.alarm_time);
    const isPassed = alarmTime.getTime() < now.getTime();
    
    const output = `- ${a.alarm_time} | ${a.item_name} (${a.meal_type}) [${a.intake_status}]`;
    
    if (isPassed) {
        console.log(COLOR_GRAY + output + COLOR_RESET);
    } else {
        console.log(output);
    }
  });
  console.log("");

  await Promise.all(alarms.map((a) => waitUntilAlarm(a)));
}

(async () => {
  console.log("\n======== 알람 스케줄러 시작 ========\n");

  const nicknameInput = await ask("Nickname 입력: ");
  
  let userId;
  
  try {
    const sql = "SELECT id FROM users WHERE nickname = ?";
    const [rows] = await db_user.query(sql, [nicknameInput]); 
    
    if (rows.length === 0) {
      console.log(`사용자 '${nicknameInput}'를 찾을 수 없습니다.`);
      await db.end();
      await db_user.end();
      process.exit(1);
    }
    
    userId = rows[0].id;
    console.log(`사용자 ${nicknameInput} (ID: ${userId})로 작업을 시작합니다.`);
  
  } catch (err) {
    console.error("DB 조회 중 오류가 발생했습니다. db_user 연결 설정을 확인하세요:", err);
    await db.end();
    await db_user.end();
    process.exit(1);
  }

  console.log("\n매일 00:00에 새로운 알람을 시작합니다!");

  startAlarmWatcher(userId);

  cron.schedule("0 0 * * *", async () => {
    console.log("\n새로운 하루가 시작되었습니다! 알람을 다시 불러옵니다...");
    await startAlarmWatcher(userId);
  });
})();