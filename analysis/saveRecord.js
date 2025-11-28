const db = require('./db');
const db_user = require('./db_user');

async function submitAll(req, res) {
  console.log('submitAll called');
  console.log('userId:', req.user?.user_id);
  console.log('req.body:', req.body);

  const userId = req.user.user_id;
  const { result, judge } = req.body;

  if (!userId || !result || !judge) {
    return res.status(400).json({ error: '필수 정보 누락' });
  }

  try {
    const [supplements] = await db.execute('SELECT * FROM supplements');

    await db_user.execute(
      'INSERT INTO user_results (user_id, result_json, judge_json, supplement_json) VALUES (?, ?, ?, ?)',
      [userId, JSON.stringify(result), JSON.stringify(judge), JSON.stringify(supplements)]
    );
    res.status(200).json({ message: '저장 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '저장 실패' });
  }
}

async function getHistory(req, res) {
  const userId = req.user.user_id;

  if (!userId) {
    return res.status(401).json({ error: '로그인 필요' });
  }

  try {
    const [rows] = await db_user.execute(
      'SELECT id, result_json, judge_json, supplement_json, created_at FROM user_results WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.status(200).json({ history: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '조회 실패' });
  }
}

module.exports = { submitAll, getHistory };
