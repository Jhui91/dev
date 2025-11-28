const jwt = require("jsonwebtoken");
const ERROR_CODES = require("../errors");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

exports.authenticateToken = (req, res, next) => {
  console.log("authenticateToken 호출됨");

  const authHeader = req.headers["authorization"];
  const headerToken = authHeader && authHeader.split(" ")[1];

  const cookieToken = req.cookies.token;

  const token = headerToken || cookieToken;

  console.log("authenticateToken called, token:", token);

  if (!token) {
    return res.status(401).json(ERROR_CODES.NO_TOKEN);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("토큰 검증 실패:", err.message);
      return res.status(403).json(ERROR_CODES.INVALID_TOKEN);
    }
    console.log("토큰 검증 성공, user:", user);
    req.user = user;
    next();
  });
};
