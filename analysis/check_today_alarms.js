const readline = require('readline');
const db = require('./db');
const db_user = require('./db_user'); 
const { getTodayAlarms, recordIntakeStatus } = require('./services/alarmScheduler');

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve =>
    rl.question(question, ans => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

function displayAlarms(alarms) {
    console.log("오늘의 알람 목록:");
    alarms.forEach((a, i) => {
        console.log(
            `${i + 1}. ${a.item_name} | ${a.alarm_time} | ${a.meal_type} | 상태: ${a.intake_status}`
        );
    });
}

async function run() {
  console.log("\n======== 오늘의 영양제 복용 관리 CLI ========\n");

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

  console.log("\n오늘의 복용 알람을 불러오는 중...\n");

  let alarms = await getTodayAlarms(userId);

  if (alarms.length === 0) {
    console.log("오늘 복용해야 할 알람이 없습니다.\n");
    await db.end();
    await db_user.end();
    process.exit(0);
  }

  displayAlarms(alarms);

  while (true) {
    const prompt = `\n수정할 알람 번호 입력 (1~${alarms.length}, Q: 종료): `;
    const choice = await ask(prompt);

    if (choice.toUpperCase() === 'Q') {
      console.log("복용 기록 수정을 종료합니다.");
      break;
    }

    const selectedIndex = parseInt(choice, 10) - 1;

    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= alarms.length) {
      console.log("잘못된 알람 번호입니다. 다시 입력하세요.");
      continue;
    }

    const alarmToUpdate = alarms[selectedIndex];
    console.log(`\n[${selectedIndex + 1}] ${alarmToUpdate.item_name} (${alarmToUpdate.alarm_time}, ${alarmToUpdate.meal_type})`);
    console.log(`현재 상태: ${alarmToUpdate.intake_status}`);

    let status;
    while (true) {
      const ans = await ask("복용 여부 입력 (1: 복용, 2: 미복용, Enter=건너뛰기): ");
      if (ans === "") {
        console.log("상태 변경 건너뜀");
        break;
      } else if (ans === "1") {
        status = "복용";
        break;
      } else if (ans === "2") {
        status = "미복용";
        break;
      }
      console.log("잘못된 입력입니다. 1 또는 2로 입력하세요.");
    }

    if (status && status !== alarmToUpdate.intake_status) {
      await recordIntakeStatus(alarmToUpdate.alarm_id, status);
      console.log(`상태 업데이트 완료: ${alarmToUpdate.intake_status} → ${status}\n`);
      
      alarms = await getTodayAlarms(userId);
      displayAlarms(alarms);
    } else {
        console.log("상태 변경 없음.");
    }

  }

  console.log("\n오늘의 복용 관리가 완료되었습니다!\n");

  await db.end();
  await db_user.end();
  process.exit(0);
}

run().catch(err => {
  console.error("실행 중 오류:", err);
  process.exit(1);
});