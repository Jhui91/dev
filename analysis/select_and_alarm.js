const readline = require('readline');
const db = require('./db');
const db_user = require('./db_user');
const keywords = require('../extract-pdf/keyword.json');
const { getTopNSupplements } = require('./services/supplementService');
const { setupUserAlarms } = require('./services/alarmScheduler');

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

async function run() {
  console.log("\n======== 조건별 영양제 선택 & 알람 설정 CLI ========\n");

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

  const conditions = Object.keys(keywords);

  console.log(`\n총 ${conditions.length}개의 컨디션에 대해 선택을 진행합니다.\n`);

  for (const condition of conditions) {
    console.log(`\n===== Condition: ${condition} =====`);

    const supplements = await getTopNSupplements(condition, 10);

    if (supplements.length === 0) {
      console.log(`해당 컨디션에 대한 추천 영양제가 없음.`);
      continue;
    }

    supplements.forEach((supp, idx) => {
      const countInfo = supp.isRange
          ? `1일 최대: ${supp.dailyCountMax}회`
          : `1일 ${supp.dailyCountMax}회 (자동 선택)`;
          
      console.log(`${idx + 1}. ${supp.itemName} | ${countInfo}`);
    });

    let selectedIndex;
    while (true) {
      const choice = await ask(`번호 선택 (1~${supplements.length}): `);
      selectedIndex = parseInt(choice, 10) - 1;

      if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < supplements.length) break;
      console.log("잘못된 입력입니다. 다시 선택하세요.");
    }

    const selectedSupp = supplements[selectedIndex];
    console.log(`선택됨: ${selectedSupp.itemName}`);

    // 사용자에게 daily count 선택 받기
    let dailyCount;
    if (!selectedSupp.isRange) {
        dailyCount = selectedSupp.dailyCountMax;
        console.log(`1일 복용 횟수: ${dailyCount}회 (자동 설정)`);
    } else {
        while (true) {
            const ans = await ask(`1일 복용 횟수 선택 (1~${selectedSupp.dailyCountMax}): `);
            dailyCount = parseInt(ans, 10);

            if (!isNaN(dailyCount) && dailyCount >= 1 && dailyCount <= selectedSupp.dailyCountMax) break;
            console.log("잘못된 입력입니다. 다시 입력하세요.");
        }
    }

    const result = await setupUserAlarms(userId, condition, selectedSupp.id, dailyCount);

    console.log(`알람 ${result.alarmCount}개 생성 완료! (choiceId: ${result.choiceId})`);
  }

  console.log("\n모든 컨디션에 대한 선택 및 알람 생성 완료!\n");

  await db.end();
  await db_user.end();
  process.exit(0);
}

run().catch(err => {
  console.error("실행 중 오류:", err);
  process.exit(1);
});
