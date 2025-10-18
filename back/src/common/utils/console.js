const consoleForReceipt = (req) => {
    // 여기서 각 값을 사용하여 필요한 처리를 수행합니다.
    console.log("Received className:", req?.body?.className);
    console.log("Received id:", req?.body?.id);
    console.log("Received sourceReceiptClassName:", req?.body?.sourceReceiptClassName);
    console.log("Received transactionId:", req?.body?.transactionId);
    console.log("Received state:", req?.body?.state);
    console.log("Received products:", req?.body?.products);
    console.log("Received productId:", req?.body?.productId);
    console.log("Received platform:", req?.body?.platform);
    console.log("Received orderId:", req?.body?.orderId);
    console.log("Received packageName:", req?.body?.packageName);
    console.log("Received purchaseTime:", req?.body?.purchaseTime);
    console.log("Received purchaseState:", req?.body?.purchaseState);
    console.log("Received purchaseToken:", req?.body?.purchaseToken);
    console.log("Received quantity:", req?.body?.quantity);
    console.log("Received acknowledged:", req?.body?.acknowledged);
    console.log("Received getPurchaseState:", req?.body?.getPurchaseState);
    console.log("Received developerPayload:", req?.body?.developerPayload);
    console.log("Received autoRenewing:", req?.body?.autoRenewing);
    console.log("Received accountId:", req?.body?.accountId);
    console.log("Received profileId:", req?.body?.profileId);
    console.log("Received signature:", req?.body?.signature);
    console.log("Received nativeReceipt:", req?.body?.nativeReceipt);
    console.log("Received purchaseId:", req?.body?.purchaseId);
    console.log("Received purchaseDate:", req?.body?.purchaseDate);
    console.log("Received isPending:", req?.body?.isPending);
    console.log("Received isAcknowledged:", req?.body?.isAcknowledged);
    console.log("Received renewalIntent:", req?.body?.renewalIntent);
    console.log("Received sourcePlatform:", req?.body?.sourcePlatform);
    console.log("Received sourcePurchaseToken:", req?.body?.sourcePurchaseToken);
    console.log("Received sourceOrderId:", req?.body?.sourceOrderId);
    console.log("Received collection:", req?.body?.collection);
    console.log("Received latestReceipt:", req?.body?.latestReceipt);
    console.log("Received nativeTransactions:", req?.body?.nativeTransactions);
    console.log("Received validationDate:", req?.body?.validationDate);
  };
  
  module.exports = { consoleForReceipt };