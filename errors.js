const ERROR_CODES = {
  // 로그인 관련
  LOGIN_ERROR: {
    code: 1001,
    message: "카카오톡 로그인 api 실행 중 오류가 발생하였습니다.",
  },

  // 토큰 인증 관련
  INVALID_TOKEN: { code: 3001, message: "유효하지 않은 토큰입니다" },
  NO_TOKEN: { code: 3002, message: "토큰이 없습니다." },
  EXPIRED_TOKEN: { code: 3002, message: "토큰이 만료되었습니다." },

  // pdf 처리 관련
  MISSING_REQUIRED_FIELDS: {
    code: 4001,
    message: "성별 혹은 결과값이 누락되었습니다.",
  },
};

module.exports = ERROR_CODES;
