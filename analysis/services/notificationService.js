const axios = require('axios');
const kakaoAuthService = require('../../auth/kakaoAuthService'); 

/**
 * @param {number} userId - 알림을 받을 사용자 ID
 * @param {string} message - 전송할 메시지 내용
 * @param {number} alarmId - 상태를 변경할 알람 ID
 */
async function sendKakaoTalk(userId, message, alarmId) {
  console.log(`[Kakao] ${userId}번 사용자(알람ID: ${alarmId})에게 알림 전송 시도...`);
  try {
    const accessToken = await kakaoAuthService.getKakaoTokenByUserId(userId);
    
    if (!accessToken) {
      console.error(`[Kakao] ${userId}번 사용자의 accessToken을 찾을 수 없습니다.`);
      return;
    }

    const templateObject = {
      object_type: 'text',
      text: message,
      link: {
        web_url: `http://localhost:4000/alarms/check-via-kakao?alarm_id=${alarmId}` 
      },
      button_title: '알람 확인하기'
    };

    const messageBody = new URLSearchParams();
    messageBody.append('template_object', JSON.stringify(templateObject));

    await axios.post(
      'https://kapi.kakao.com/v2/api/talk/memo/default/send',
      messageBody,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    console.log(`[Kakao] ${userId}번 사용자에게 알림 전송 성공`);

  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error(`[Kakao] ${userId}번 사용자 토큰 만료 또는 무효. (사용자 재로그인 필요)`);
    } else {
      console.error('[Kakao] 메시지 전송 실패:', error.response ? error.response.data : error.message);
    }
  }
}

module.exports = { sendKakaoTalk };