const db = require("./db"); 
const axios = require("axios");

/**
 * @param {object} userInfo
 * @param {string} accessToken
 * @param {string} refreshToken
 * @returns {object} { id, nickname }
 */
async function saveOrUpdateUser(userInfo, accessToken, refreshToken) {
  const connection = await db.getConnection();
  try {
    const kakaoId = userInfo.id;
    const nickname = userInfo.properties.nickname;

    let [rows] = await connection.query(
      'SELECT id, nickname FROM users WHERE kakao_id = ?', 
      [kakaoId]
    );

    if (rows.length > 0) {
      console.log(`[DB] 기존 사용자 (${kakaoId}) 토큰 업데이트`);
      await connection.query(
        'UPDATE users SET kakao_access_token = ?, kakao_refresh_token = ?, nickname = ? WHERE kakao_id = ?',
        [accessToken, refreshToken, nickname, kakaoId]
      );
      return { id: rows[0].id, nickname: nickname };
    } else {
      console.log(`[DB] 신규 사용자 (${kakaoId}) 정보 추가`);
      const [result] = await connection.query(
        'INSERT INTO users (kakao_id, nickname, kakao_access_token, kakao_refresh_token) VALUES (?, ?, ?, ?)',
        [kakaoId, nickname, accessToken, refreshToken]
      );
      return { id: result.insertId, nickname: nickname };
    }
  } catch (error) {
    console.error('[DB] 작업 중 에러 발생:', error);
    throw error;
  } finally {
    connection.release();
  }
}

async function getKakaoTokens(code) {
  const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
  const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;

  const tokenResponse = await axios.post(
    'https://kauth.kakao.com/oauth/token',
    new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: KAKAO_REDIRECT_URI,
      code: code,
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' 
      }
    }
  );
  return tokenResponse.data;
}

async function getKakaoUserInfo(accessToken) {
  const userInfoResponse = await axios.get(
    'https://kapi.kakao.com/v2/user/me',
    {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }
  );
  return userInfoResponse.data;
}

/**
 * @param {number} userId - 알림을 받을 사용자 ID
 * @returns {string | null} - 카카오 액세스 토큰 또는 null
 */
async function getKakaoTokenByUserId(userId) {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT kakao_access_token FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length > 0) {
      return rows[0].kakao_access_token;
    }
    return null; 
  } catch (error) {
    console.error('[DB] 카카오 토큰 조회 중 에러:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  saveOrUpdateUser,
  getKakaoTokens,
  getKakaoUserInfo,
  getKakaoTokenByUserId
};