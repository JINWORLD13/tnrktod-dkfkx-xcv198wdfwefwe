const { createClient } = require("redis");

// Redis 클라이언트: 연결 관리, 재연결, 보안 검증, 하트비트
// Redis client: connection management, reconnection, security validation, heartbeat
// Redisクライアント：接続管理、再接続、セキュリティ検証、ハートビート
class RedisClient {
  constructor() {
    this.client = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 2;

    this.isAppInBackground = false;
    this.backgroundReconnectTimer = null;
    this.lastActiveTime = Date.now();
    this.heartbeatInterval = null;
    this.reconnectInProgress = false;

    // 보안: 허용된 키 prefix만 사용
    // Security: only allowed key prefixes
    // セキュリティ：許可されたキープレフィックスのみ使用
    this.allowedKeyPrefixes = [
      "user:",
      "session:",
      "cache:",
      "counter:",
      "refund:",
      "payment:",
    ];
    this.maxKeysToScan = 1000;
    this.evalEnabled = process.env.REDIS_EVAL_ENABLED === "true";
    this.trustedScripts = new Map();
  }

  // Redis 연결: keepAlive, 재연결 전략, 하트비트
  // Redis connection: keepAlive, reconnection strategy, heartbeat
  // Redis接続：keepAlive、再接続戦略、ハートビート
  async connect() {
    if (this.reconnectInProgress) {
      console.log("Reconnection already in progress, skipping...");
      return;
    }

    this.reconnectInProgress = true;

    try {
      this.client = createClient({
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        socket: {
          host: process.env.REDIS_HOST || "localhost",
          port: Number(process.env.REDIS_PORT) || 6379,
          connectTimeout: 1500,
          lazyConnect: true,
          keepAlive: true,
          noDelay: true,
          family: 0,
          keepAliveInitialDelay: 10000,
        },
        retry_unfulfilled_commands: true,
        retryDelayOnFailover: 1000,
        retryDelayOnClusterDown: 300,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        commandTimeout: 8000,
        enableOfflineQueue: true,
      });

      this.setupEventListeners();
      await this.client.connect();
      this.startHeartbeat();
      await this.registerTrustedScripts();
    } catch (error) {
      console.error("Redis connection error:", error);
      this.connected = false;
      this.scheduleReconnect();
      throw error;
    } finally {
      this.reconnectInProgress = false;
    }
  }

  // 하트비트: 연결 상태 주기적 확인
  // Heartbeat: periodic connection health check
  // ハートビート：定期的な接続状態確認
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    const interval = this.isAppInBackground ? 60000 : 30000;

    this.heartbeatInterval = setInterval(async () => {
      try {
        if (this.isConnected()) {
          await this.client.ping();
          this.lastActiveTime = Date.now();
        }
      } catch (error) {
        console.warn("Heartbeat failed, connection might be lost");
        this.connected = false;
        this.handleConnectionLoss();
      }
    }, interval);
  }

  // 연결 끊김 처리: 앱 상태에 따라 다른 재연결 전략
  // Connection loss handling: different reconnection strategies based on app state
  // 接続切断処理：アプリ状態に応じた異なる再接続戦略
  handleConnectionLoss() {
    if (this.reconnectInProgress) return;

    if (!this.isAppInBackground) {
      console.log("Active app connection lost, attempting immediate reconnect");
      this.scheduleReconnect(1000);
    } else {
      console.log(
        "Background app connection lost, scheduling gentle reconnect"
      );
      this.scheduleReconnect(5000);
    }
  }

  // 재연결 스케줄링: 지수 백오프 적용
  // Reconnection scheduling: exponential backoff applied
  // 再接続スケジューリング：指数バックオフ適用
  scheduleReconnect(delay = 2000) {
    if (this.backgroundReconnectTimer) {
      clearTimeout(this.backgroundReconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached, giving up");
      return;
    }

    const backoffDelay = Math.min(
      delay * Math.pow(2, this.reconnectAttempts),
      10000
    );

    this.backgroundReconnectTimer = setTimeout(async () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        try {
          console.log(
            `Attempting scheduled reconnect (${this.reconnectAttempts + 1}/${
              this.maxReconnectAttempts
            })`
          );
          await this.connect();
        } catch (error) {
          console.error("Scheduled reconnect failed:", error);
          this.scheduleReconnect(delay);
        }
      }
    }, backoffDelay);
  }

  setAppState(isBackground) {
    const wasBackground = this.isAppInBackground;
    this.isAppInBackground = isBackground;

    if (isBackground && !wasBackground) {
      console.log("App went to background");
      this.startHeartbeat();
    } else if (!isBackground && wasBackground) {
      console.log("App came to foreground");
      this.checkAndReconnect();
      this.startHeartbeat();
    }
  }

  async checkAndReconnect() {
    const timeSinceLastActive = Date.now() - this.lastActiveTime;

    if (timeSinceLastActive > 300000 || !this.isConnected()) {
      console.log("Connection seems stale, reconnecting...");
      try {
        if (this.client && this.client.isOpen) {
          await this.client.disconnect();
        }
        await this.connect();
      } catch (error) {
        console.error("Reconnection failed:", error);
        this.scheduleReconnect();
      }
    }
  }

  setupEventListeners() {
    this.client.on("error", (err) => {
      console.error("Redis Client Error", err);
      this.connected = false;
      this.handleConnectionLoss();
    });

    this.client.on("connect", () => {
      console.log("Redis client connected");
      this.connected = true;
      this.reconnectAttempts = 0;
      this.lastActiveTime = Date.now();
    });

    this.client.on("end", () => {
      console.log("Redis connection ended");
      this.connected = false;
      this.handleConnectionLoss();
    });

    this.client.on("reconnecting", () => {
      this.reconnectAttempts++;
      console.log(
        `Redis reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );
      this.connected = false;
    });

    this.client.on("ready", () => {
      console.log("Redis client ready");
      this.connected = true;
      this.lastActiveTime = Date.now();
    });
  }

  // 보안: 키 패턴 검증 (허용된 prefix, 위험한 문자 차단)
  // Security: validate key pattern (allowed prefix, block dangerous characters)
  // セキュリティ：キーパターン検証（許可されたprefix、危険な文字をブロック）
  validateKeyPattern(pattern) {
    const hasValidPrefix = this.allowedKeyPrefixes.some((prefix) =>
      pattern.startsWith(prefix)
    );

    if (!hasValidPrefix) {
      throw new Error(
        `Invalid key pattern. Allowed prefixes: ${this.allowedKeyPrefixes.join(
          ", "
        )}`
      );
    }

    const dangerousChars = /[;&|`$\(\)]/;
    if (dangerousChars.test(pattern)) {
      throw new Error("Pattern contains dangerous characters");
    }

    return true;
  }

  validateKey(key) {
    if (typeof key !== "string" || key.length === 0) {
      throw new Error("Key must be a non-empty string");
    }

    if (key.length > 250) {
      throw new Error("Key too long (max 250 characters)");
    }

    const hasValidPrefix = this.allowedKeyPrefixes.some((prefix) =>
      key.startsWith(prefix)
    );

    if (!hasValidPrefix) {
      throw new Error(
        `Invalid key. Allowed prefixes: ${this.allowedKeyPrefixes.join(", ")}`
      );
    }

    return true;
  }

  isConnected() {
    return this.connected && this.client && this.client.isOpen;
  }

  // 안전한 작업 실행: 재연결 시도 + 지수 백오프
  // Safe operation execution: reconnection attempts + exponential backoff
  // 安全な操作実行：再接続試行 + 指数バックオフ
  async safeExecute(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!this.isConnected()) {
          if (attempt === 1) {
            await this.checkAndReconnect();
          } else {
            throw new Error("Redis not connected");
          }
        }

        return await operation();
      } catch (error) {
        console.warn(
          `Operation failed (attempt ${attempt}/${maxRetries}):`,
          error.message
        );

        if (attempt === maxRetries) {
          throw error;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 500 * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  async set(key, data, expireSeconds = 3600) {
    try {
      return await this.safeExecute(async () => {
        this.validateKey(key);

        const maxExpire = 7 * 24 * 3600;
        const safeExpire = Math.min(expireSeconds, maxExpire);

        const value = typeof data === "string" ? data : JSON.stringify(data);
        await this.client.setEx(key, safeExpire, value);
        return true;
      });
    } catch (error) {
      console.error("Redis set error:", error);
      return false;
    }
  }

  async get(key) {
    try {
      return await this.safeExecute(async () => {
        this.validateKey(key);

        const str = await this.client.get(key);
        if (!str) return null;

        try {
          return JSON.parse(str);
        } catch {
          return str;
        }
      });
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  }

  async del(...keys) {
    try {
      return await this.safeExecute(async () => {
        keys.forEach((key) => this.validateKey(key));

        if (keys.length > 100) {
          throw new Error("Too many keys to delete at once (max 100)");
        }

        const deletedCount = await this.client.del(keys);
        return deletedCount;
      });
    } catch (error) {
      console.error("Redis del error:", error);
      return false;
    }
  }

  // SCAN: 안전한 키 조회 (keys() 대체)
  // SCAN: safe key retrieval (replaces keys())
  // SCAN：安全なキー取得（keys()を置き換え）
  async scanKeys(pattern, count = 100) {
    try {
      return await this.safeExecute(async () => {
        this.validateKeyPattern(pattern);

        const keys = [];
        let cursor = 0;
        let scannedCount = 0;

        do {
          const result = await this.client.scan(cursor, {
            MATCH: pattern,
            COUNT: Math.min(count, 100),
          });

          cursor = result.cursor;
          keys.push(...result.keys);
          scannedCount += result.keys.length;

          if (scannedCount >= this.maxKeysToScan) {
            console.warn(`Scan limit reached: ${this.maxKeysToScan}`);
            break;
          }
        } while (cursor !== 0);

        return keys;
      });
    } catch (error) {
      console.error("Redis scanKeys error:", error);
      return [];
    }
  }

  async keys(pattern) {
    console.warn("DEPRECATED: keys() is unsafe. Use scanKeys() instead.");
    return await this.scanKeys(pattern);
  }

  // 신뢰된 Lua 스크립트 등록: Lock 해제, 조건부 증가
  // Register trusted Lua scripts: unlock, conditional increment
  // 信頼されたLuaスクリプト登録：ロック解除、条件付き増加
  async registerTrustedScripts() {
    const unlockScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    const conditionalIncrScript = `
      local current = redis.call("get", KEYS[1])
      if current == false then
        current = 0
      else
        current = tonumber(current)
      end
      
      local limit = tonumber(ARGV[1])
      if current < limit then
        return redis.call("incr", KEYS[1])
      else
        return current
      end
    `;

    try {
      const unlockSha = await this.client.scriptLoad(unlockScript);
      const incrSha = await this.client.scriptLoad(conditionalIncrScript);

      this.trustedScripts.set("unlock", unlockSha);
      this.trustedScripts.set("conditionalIncr", incrSha);

      console.log("Trusted scripts registered");
    } catch (error) {
      console.error("Failed to register trusted scripts:", error);
    }
  }

  async executeTrustedScript(scriptName, keys, args) {
    try {
      return await this.safeExecute(async () => {
        if (!this.trustedScripts.has(scriptName)) {
          throw new Error(`Unknown trusted script: ${scriptName}`);
        }

        keys.forEach((key) => this.validateKey(key));

        const sha = this.trustedScripts.get(scriptName);
        return await this.client.evalSha(sha, {
          keys: keys,
          arguments: args,
        });
      });
    } catch (error) {
      console.error(`Trusted script execution error (${scriptName}):`, error);
      return null;
    }
  }

  // 보안: eval() 제한 (프로덕션 환경에서 비활성화)
  // Security: eval() restriction (disabled in production)
  // セキュリティ：eval()制限（本番環境で無効化）
  async eval(script, numKeys, ...args) {
    if (!this.evalEnabled) {
      throw new Error(
        "eval() is disabled for security. Use executeTrustedScript() instead."
      );
    }

    if (process.env.NODE_ENV === "production") {
      throw new Error("eval() is not allowed in production");
    }

    console.warn("WARNING: Using eval() in development mode");

    try {
      return await this.safeExecute(async () => {
        return await this.client.eval(script, {
          keys: args.slice(0, numKeys),
          arguments: args.slice(numKeys),
        });
      });
    } catch (error) {
      console.error("Redis eval error:", error);
      return null;
    }
  }

  // 분산 Lock 획득: 동시성 제어
  // Distributed lock acquisition: concurrency control
  // 分散ロック取得：並行性制御
  async acquireLock(lockKey, timeout = 400, retries = 2) {
    try {
      return await this.safeExecute(async () => {
        this.validateKey(lockKey);

        const lockValue = `${Date.now()}-${Math.random()}`;

        for (let i = 0; i < retries; i++) {
          const acquired = await this.client.set(lockKey, lockValue, {
            PX: timeout,
            NX: true,
          });

          if (acquired) {
            return {
              success: true,
              lockValue,
              release: async () => {
                return await this.executeTrustedScript(
                  "unlock",
                  [lockKey],
                  [lockValue]
                );
              },
            };
          }

          await new Promise((resolve) => setTimeout(resolve, 50 * (i + 1)));
        }

        return { success: false };
      });
    } catch (error) {
      console.error("Lock acquisition error:", error);
      return { success: false };
    }
  }

  async limitedIncr(key, limit = 1000) {
    try {
      this.validateKey(key);
      return await this.executeTrustedScript(
        "conditionalIncr",
        [key],
        [limit.toString()]
      );
    } catch (error) {
      console.error("Limited incr error:", error);
      return null;
    }
  }

  async incr(key) {
    try {
      return await this.safeExecute(async () => {
        this.validateKey(key);
        return await this.client.incr(key);
      });
    } catch (error) {
      console.error("Redis incr error:", error);
      return null;
    }
  }

  async setex(key, seconds, value) {
    return await this.set(key, value, seconds);
  }

  async ttl(key) {
    try {
      return await this.safeExecute(async () => {
        this.validateKey(key);
        return await this.client.ttl(key);
      });
    } catch (error) {
      console.error("Redis ttl error:", error);
      return -2;
    }
  }

  async expire(key, seconds) {
    try {
      return await this.safeExecute(async () => {
        this.validateKey(key);

        const maxExpire = 7 * 24 * 3600;
        const safeSeconds = Math.min(seconds, maxExpire);

        return await this.client.expire(key, safeSeconds);
      });
    } catch (error) {
      console.error("Redis expire error:", error);
      return false;
    }
  }

  async exists(key) {
    try {
      return await this.safeExecute(async () => {
        this.validateKey(key);
        return await this.client.exists(key);
      });
    } catch (error) {
      console.error("Redis exists error:", error);
      return false;
    }
  }

  async lpush(key, ...values) {
    try {
      return await this.safeExecute(async () => {
        this.validateKey(key);

        if (values.length > 100) {
          throw new Error("Too many values to push at once (max 100)");
        }

        const stringValues = values.map((v) =>
          typeof v === "string" ? v : JSON.stringify(v)
        );
        return await this.client.lPush(key, stringValues);
      });
    } catch (error) {
      console.error("Redis lpush error:", error);
      return 0;
    }
  }

  async lrange(key, start, stop) {
    try {
      return await this.safeExecute(async () => {
        this.validateKey(key);

        const maxRange = 1000;
        const safeStop = Math.min(stop, start + maxRange);

        return await this.client.lRange(key, start, safeStop);
      });
    } catch (error) {
      console.error("Redis lrange error:", error);
      return [];
    }
  }

  async ping() {
    try {
      return await this.safeExecute(async () => {
        const response = await this.client.ping();
        return response === "PONG";
      });
    } catch (error) {
      console.error("Redis ping error:", error);
      return false;
    }
  }

  async info(section = null) {
    try {
      return await this.safeExecute(async () => {
        return section
          ? await this.client.info(section)
          : await this.client.info();
      });
    } catch (error) {
      console.error("Redis info error:", error);
      return "";
    }
  }

  // 안전한 연결 종료: 타이머 정리 + graceful shutdown
  // Safe disconnection: timer cleanup + graceful shutdown
  // 安全な接続終了：タイマークリーンアップ + グレースフルシャットダウン
  async disconnect() {
    try {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      if (this.backgroundReconnectTimer) {
        clearTimeout(this.backgroundReconnectTimer);
        this.backgroundReconnectTimer = null;
      }

      if (this.client && this.connected) {
        await this.client.quit();
        this.connected = false;
        console.log("Redis disconnected gracefully");
      }
    } catch (error) {
      console.error("Redis disconnect error:", error);
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
