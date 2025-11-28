const jwt = require("jsonwebtoken");
const kakaoAuthService = require("./kakaoAuthService");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

exports.kakaoCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("인가 코드가 없습니다.");

  try {
    const tokenData = await kakaoAuthService.getKakaoTokens(code);
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    const userInfo = await kakaoAuthService.getKakaoUserInfo(accessToken);
    console.log(userInfo);

    const user = await kakaoAuthService.saveOrUpdateUser(
      userInfo,
      accessToken,
      refreshToken
    );

    const token = jwt.sign(
      { user_id: user.id, username: user.nickname },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: "strict",
    });

    res.redirect(process.env.CLIENT_URL + "/home");
    // res.json({
    //   nickname: user.nickname,
    // });
  } catch (error) {
    console.error("카카오 로그인 처리 중 에러 발생 :", error);
    res.status(500).send("로그인 처리에 실패했습니다.");
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
  });
  res.json({ message: "로그아웃 성공" });
};
