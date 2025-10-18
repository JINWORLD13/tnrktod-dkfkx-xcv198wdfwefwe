const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const NodeCache = require("node-cache");

// 소비 토큰 캐시: 중복 소비 방지 (RAM 기반)
// Consumption token cache: prevent duplicate consumption (RAM-based)
// 消費トークンキャッシュ：重複消費防止（RAMベース）
const myCache = new NodeCache({ stdTTL: 110, checkperiod: 120 });

const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../../.secret/cosmos-tarot-2024-ef33be4bcecf.json"),
    "utf8"
  )
);

const createJWT = () => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  return jwt.sign(payload, serviceAccount.private_key, { algorithm: "RS256" });
};

const getAccessToken = async () => {
  const token = createJWT();
  const response = await axios.post("https://oauth2.googleapis.com/token", {
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: token,
  });
  return response.data.access_token;
};

// Google Play 환불 목록 조회: 최근 30일
// Get Google Play refund list: last 30 days
// Google Play払い戻しリスト照会：最近30日
const getVoidedPurchases = async (packageName) => {
  console.log(`[START] getVoidedPurchases for package: ${packageName}`);
  try {
    const accessToken = await getAccessToken();
    const url = `https://www.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/voidedpurchases`;
    const now = Math.floor(Date.now() / 1000); // 초 단위로 변환
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

    const response = await axios.get(url, {
      params: {
        startTime: thirtyDaysAgo.toString(),
        endTime: now.toString(),
        maxResults: 1000,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("Voided Purchases:", response.data.voidedPurchases);
    return response.data.voidedPurchases;
  } catch (error) {
    console.error("Error fetching voided purchases:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
    }
    throw error;
  } finally {
    console.log(`[END] getVoidedPurchases`);
  }
};

// Google Play 소비 처리: 중복 방지 + 검증
// Google Play consumption: duplication prevention + verification
// Google Play消費処理：重複防止 + 検証
const consumeInAppPurchase = async (
  packageName,
  productId,
  purchaseToken,
  isFirstConsumption = true
) => {
  console.log(`[START] consumeInAppPurchase`);
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    console.log(
      `Attempting to consume in-app purchase: PackageName: ${packageName}, ProductId: ${productId}, PurchaseToken: ${purchaseToken}, IsFirstConsumption: ${isFirstConsumption}`
    );
  } else {
    console.log(`Attempting to consume in-app purchase`);
  }

  if (myCache.has(purchaseToken)) {
    console.log("This token has already been consumed recently (Cache hit)");
    return;
  }

  try {
    const accessToken = await getAccessToken();

    if (!isFirstConsumption) {
      console.log("[VERIFY] Verifying purchase before consumption");
      const verifyUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}`;
      const verifyRes = await axios.get(verifyUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log(
        "[VERIFY] Verification response:",
        JSON.stringify(verifyRes.data, null, 2)
      );

      if (verifyRes.data.consumptionState === 1) {
        console.log("This purchase has already been consumed (API check)");
        myCache.set(purchaseToken, true);
        return;
      }
    }

    console.log("[CONSUME] Proceeding with purchase consumption");
    const consumeUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}:consume`;
    const consumeRes = await axios.post(
      consumeUrl,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    myCache.set(purchaseToken, true);
    console.log(
      "[CONSUME] Purchase consumed successfully. Response:",
      JSON.stringify(consumeRes.data, null, 2)
    );
    return consumeRes.data;
  } catch (err) {
    console.error("[ERROR] Error in consumeInAppPurchase:", err);
    if (err.response) {
      console.error(
        "Error response:",
        JSON.stringify(err.response.data, null, 2)
      );
    }

    if (err.response && err.response.status === 410) {
      console.log("This purchase has already been consumed (410 error)");
      myCache.set(purchaseToken, true);
    } else {
      throw err;
    }
  } finally {
    console.log(`[END] consumeInAppPurchase`);
  }
};

module.exports = { consumeInAppPurchase, getVoidedPurchases };
