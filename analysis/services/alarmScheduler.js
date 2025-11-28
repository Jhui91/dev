const db = require('../db');

function parseMealTiming(howToUseText) {
  if (!howToUseText) return '상관없음';
  if (howToUseText.includes('식전')) return '식전';
  if (howToUseText.includes('식후')) return '식후';
  return '상관없음'; 
}

function generateAlarmTimes(dailyCount, mealTiming) {
  const defaultTimes = {
    1: ['07:00:00'],
    2: ['07:00:00', '19:00:00'],
    3: ['07:00:00', '12:00:00', '19:00:00']
  };
  
  const baseTimes = defaultTimes[dailyCount] || defaultTimes[1];
  
  if (mealTiming === '상관없음') {
    return baseTimes;
  }
  
  const offsetMinutes = (mealTiming === '식전') ? -30 : 30; 
  
  return baseTimes.map(baseTime => {
    
    const tempDate = new Date(`1970-01-01T${baseTime}Z`);
    
    tempDate.setUTCMinutes(tempDate.getUTCMinutes() + offsetMinutes);

    const hours = String(tempDate.getUTCHours()).padStart(2, '0');
    const minutes = String(tempDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(tempDate.getUTCSeconds()).padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  });
}

async function createDailyAlarms(choice, today) {
  const { choice_id, daily_count, meal_type } = choice;
  
  const alarmTimes = generateAlarmTimes(daily_count, meal_type);
  const alarmsToSave = alarmTimes.map(time => {
    return [choice_id, time, meal_type, today];
  });
  
  if (alarmsToSave.length === 0) {
    return;
  }
  
  const alarmSql = `INSERT IGNORE INTO user_alarms (choice_id, alarm_time, meal_type, alarm_date) VALUES ?`;
  await db.query(alarmSql, [alarmsToSave]);
}

async function setupUserAlarms(userId, conditionName, supplementId, selectedDailyCount) {
  const [[supplement]] = await db.query('SELECT how_to_use FROM supplements WHERE id = ?', [supplementId]);
  if (!supplement) throw new Error("Supplement not found.");

  const howToUse = supplement.how_to_use;
  const mealTiming = parseMealTiming(howToUse);
  
  const choiceSql = `
    INSERT INTO user_choices (user_id, condition_name, supplement_id, daily_count, meal_type) 
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
        supplement_id = VALUES(supplement_id),
        daily_count = VALUES(daily_count),
        meal_type = VALUES(meal_type)
  `;
    
  await db.execute(choiceSql, [userId, conditionName, supplementId, selectedDailyCount, mealTiming]);

  const [rows] = await db.query('SELECT * FROM user_choices WHERE user_id = ? AND condition_name = ?', [userId, conditionName]);
  if (rows.length === 0) {
    throw new Error("Failed to create or find user choice.");
  }
  const newChoice = rows[0];

  const now = new Date();
  const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));

  const year = kstNow.getUTCFullYear();
  const month = String(kstNow.getUTCMonth() + 1).padStart(2, '0');
  const day = String(kstNow.getUTCDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  await createDailyAlarms(newChoice, today);

  const alarmTimes = generateAlarmTimes(selectedDailyCount, mealTiming);
  return { success: true, choiceId: newChoice.choice_id, alarmCount: alarmTimes.length };
}

async function recordIntakeStatus(alarmId, status) {
  if (!['복용', '미복용'].includes(status)) throw new Error("Invalid status.");

  const sql = `
    UPDATE user_alarms
    SET intake_status = ?
    WHERE alarm_id = ?
  `;
  await db.execute(sql, [status, alarmId]);
  return { success: true };
}

async function getTodayAlarms(userId) {
  const now = new Date();
  const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));

  const year = kstNow.getUTCFullYear();
  const month = String(kstNow.getUTCMonth() + 1).padStart(2, '0');
  const day = String(kstNow.getUTCDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  const sql = `
    SELECT
      ua.alarm_id,
      ua.alarm_time,
      ua.meal_type,
      ua.intake_status,
      s.item_name
    FROM
      user_alarms ua
    JOIN
      user_choices uc ON ua.choice_id = uc.choice_id
    JOIN
      vitasense.supplements s ON uc.supplement_id = s.id
    WHERE
      uc.user_id = ? AND ua.alarm_date = ?
    ORDER BY
      ua.alarm_time ASC;
  `;
  
  const [rows] = await db.query(sql, [userId, today]);
  return rows;
}

module.exports = { setupUserAlarms, recordIntakeStatus, parseMealTiming, generateAlarmTimes, getTodayAlarms, createDailyAlarms };