const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const DB_URL = process.env.MONGO_DB_URL;

// MongoDB 연결 관리: 커넥션 풀, 재연결 전략
// MongoDB connection management: connection pooling, reconnection strategy
// MongoDB接続管理：コネクションプール、再接続戦略
let isConnecting = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

const DBConnect = async () => {
  if (isConnecting) {
    console.log("⏳ 이미 연결 시도 중입니다...");
    return;
  }

  isConnecting = true;

  try {
    await mongoose.connect(DB_URL, {
      dbName: "cosmos",
      maxPoolSize: 7,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 2000,
    });

    isConnecting = false;
    reconnectAttempts = 0;

    if (process.env.NODE_ENV === "DEVELOPMENT") {
      console.log(`🎯🏊‍♂️ 커넥션 풀: 최소 2개 ~ 최대 7개 - mongoose.js`);
    } else {
      console.log("🏭 C.S");
    }
  } catch (err) {
    isConnecting = false;
    console.error("❌ mongoDB connection err: ", err.message);

    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      if (process.env.NODE_ENV === "DEVELOPMENT") {
        console.log(
          `🔄 Server restarting ${reconnectAttempts}/${maxReconnectAttempts} 10 sec later`
        );
      }

      setTimeout(async () => {
        await DBConnect();
      }, 10000);
    } else {
      if (process.env.NODE_ENV === "DEVELOPMENT") {
        console.error(
          "💀 Maximum reconnection attempts exceeded. Please restart the server."
        );
      }
    }
  }
};

const db = mongoose.connection;

db.on("error", (error) => {
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    console.error("❌ mongoDB connection error: ", error.message);
  }
});

db.on("disconnected", () => {
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    console.error("📴 mongoDB disconnected");
  }
  if (!isConnecting && reconnectAttempts < maxReconnectAttempts) {
    if (process.env.NODE_ENV === "DEVELOPMENT") {
      console.log("🔄 restaring 5 sec later...");
    }
    setTimeout(async () => {
      await DBConnect();
    }, 5000);
  }
});

db.on("connected", () => {
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    console.log("✅ mongoDB connection success!");
  }
});

db.on("reconnected", () => {
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    console.log("🔄 mongoDB reconnection success!");
  }
  reconnectAttempts = 0;
});

// Graceful shutdown
// Graceful shutdown: clean database connection termination
// グレースフルシャットダウン：クリーンなDB接続終了
process.on("SIGINT", async () => {
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    console.log("\n👋 Server shutting down... Closing MongoDB connections.");
  }
  await mongoose.connection.close();
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    console.log("✅ mongoDB disconnection success!");
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    console.log("\n👋 Server shutting down... Closing MongoDB connections.");
  }
  await mongoose.connection.close();
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    console.log("✅ mongoDB disconnection success!");
  }
  process.exit(0);
});

module.exports = DBConnect;
