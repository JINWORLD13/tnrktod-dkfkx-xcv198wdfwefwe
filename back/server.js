require("dotenv").config();
require("./src/db/mongoose/mongoose")();
const express = require("express");
const app = express();
const path = require("path");
const helmet = require("helmet");
const compression = require("compression"); 
const morgan = require("morgan");
const redisClient = require('./src/cache/redisClient');
const {
  tarotRouter,
  authRouter,
  userRouter,
  adminRouter,
  chargeRouter,
  googleRouter,
} = require("./src/routes/index");
const googlePassport = require("./src/middlewares/googlePassportForJWT");

// Trust Proxy: 프록시 서버 뒤에서 실행 (클라우드 환경 필수)
// Trust Proxy: runs behind proxy servers (required for cloud environments)
// Trust Proxy：プロキシサーバーの背後で実行（クラウド環境必須）
app.set("trust proxy", true);
if (process.env.NODE_ENV === "PRODUCTION") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}
app.use(helmet());
// CORS: 개발환경은 전체 허용, 프로덕션은 화이트리스트
// CORS: allow all in dev, whitelist in production
// CORS：開発環境は全許可、本番環境はホワイトリスト
if (process.env.NODE_ENV === "DEVELOPMENT") {
  const cors = require("cors");
  app.use(cors());
} else if (process.env.NODE_ENV === "PRODUCTION") {
  app.use((req, res, next) => {
    const allowedOrigins = ["cosmostarot:"]
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Max-Age", "3600");
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  });
}
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(googlePassport.initialize());


const API_BASE_PATHS = {
  tarot: process.env.TAROT_BASE_PATH,
  auth: process.env.AUTH_BASE_PATH,
  user: process.env.USER_BASE_PATH,
  admin: process.env.ADMIN_BASE_PATH,
  charge: process.env.CHARGE_BASE_PATH,
  google: process.env.GOOGLE_BASE_PATH,
};

app.use(API_BASE_PATHS.tarot, tarotRouter);
app.use(API_BASE_PATHS.auth, authRouter);
app.use(API_BASE_PATHS.user, userRouter);
app.use(API_BASE_PATHS.admin, adminRouter);
app.use(API_BASE_PATHS.charge, chargeRouter);
app.use(API_BASE_PATHS.google, googleRouter);
// CSP: XSS 및 인젝션 공격 방지
// CSP: prevents XSS and injection attacks
// CSP：XSSおよびインジェクション攻撃防止
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "base-uri 'self'; " +
      "object-src 'none'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' " +
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "style-src 'self' 'unsafe-inline' " +
      "https:",
      "https:",
      "https:",
      "https:",
      "img-src 'self' " +
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "font-src 'self' " +
      "https:",
      "https:",
      "https:",
      "https:",
      "connect-src 'self' " +
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "frame-src 'self' " +
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "https:",
      "worker-src 'self' blob: https:",
  );
  next();
});
app.use((req, res, next) => {
  const acceptLanguage = req.headers["accept-language"] || "en";
  const supportedLanguages = ["ko", "en", "ja"];
  const preferredLanguage =
    acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim())
      .find((lang) => supportedLanguages.includes(lang)) || "en";
  res.header("Content-Language", preferredLanguage);
  next();
});
const staticOptions = {
  maxAge: process.env.NODE_ENV === "PRODUCTION" ? "1y" : "0", 
  etag: true, 
  lastModified: true, 
  setHeaders: (res, path) => {
    if (path.endsWith(".html")) {
      res.set("Cache-Control", "no-cache");
    }
  },
};
app.use(express.static(path.join(__dirname, "front/dist"), staticOptions));
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "front/dist/index.html"));
});
const port = Number(process.env.PORT) || 8080;
let server;
redisClient.connect();
if (process.env.NODE_ENV === "DEVELOPMENT") {
  server = app.listen(port, () => {
    console.log(`Development server listening on port ${port}`);
  });
} else if (process.env.NODE_ENV === "PRODUCTION") {
  server = app.listen(port, () => {
    console.log(`Production server listening on port ${port}`);
  });
}
app.use((err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === "DEVELOPMENT";
  console.error("Error:", {
    name: err.name,
    message: err.message,
    stack: isDevelopment ? err.stack : "wrong",
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
  res.status(err.statusCode || 500).json({
    name: isDevelopment ? err.name : "Internal Server Error",
    message: isDevelopment ? err.message : "Something went wrong",
    code: err.statusCode || 500,
  });
});
