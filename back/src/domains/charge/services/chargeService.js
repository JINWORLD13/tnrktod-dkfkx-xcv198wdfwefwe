const { chargeRepository } = require("../repositories/index");
const { userRepository } = require("../../user/repositories/index");
const commonErrors = require("../../../common/errors/commonErrors");

class ChargeService {
  async createChargeForTossPrePayment(chargePreInfo) {
    try {
      const chargeInDB = await chargeRepository.findByOrderId(
        chargePreInfo?.orderId
      );
      if (chargeInDB !== null && chargeInDB !== undefined) {
        throw new Error(commonErrors.chargePreInfoConflictError);
      } else {
        const newCharge = await chargeRepository.createPreChargeForToss(
          chargePreInfo
        );
        return newCharge;
      }
    } catch (err) {
      if (err.name === commonErrors.chargeRepositoryFindByOrderIdError)
        throw err;
      if (err.name === commonErrors.chargeRepositoryCreateError) throw err;
      err.name = commonErrors.chargeServiceCreateChargeForTossPrePayment;
      if (err.message === commonErrors.chargePreInfoConflictError)
        err.statusCode = 409;
      throw err;
    }
  }
  async createChargeForAndroidGooglePlay(chargePreInfo) {
    try {
      const chargeInDB = await chargeRepository.findByOrderId(
        chargePreInfo?.orderId
      );
      if (chargeInDB !== null && chargeInDB !== undefined) {
        throw new Error(commonErrors.chargePreInfoConflictError);
      } else {
        const newCharge = await chargeRepository.createChargeForGooglePlay(
          chargePreInfo
        );
        return newCharge;
      }
    } catch (err) {
      if (err.name === commonErrors.chargeRepositoryFindByOrderIdError)
        throw err;
      if (err.name === commonErrors.chargeRepositoryCreateError) throw err;
      err.name = commonErrors.chargeServiceCreateChargeForAndroidGooglePlay;
      if (err.message === commonErrors.chargePreInfoConflictError)
        err.statusCode = 409;
      throw err;
    }
  }

  async getChargeByObjId(chargeObjId) {
    try {
      // 결제 정보 조회: null 허용 (없으면 null 반환)
      // Get charge info: allows null (returns null if not found)
      // 決済情報照会：null許容（存在しない場合null返却）
      const chargeInDB = await chargeRepository.findByObjId(chargeObjId);
      return chargeInDB;
    } catch (err) {
      if (err.name === commonErrors.chargeRepositoryFindByObjIdError) throw err;
      err.name = commonErrors.chargeServiceGetChargeByObjIdError;
      throw err;
    }
  }

  async getChargesByProductId(productId) {
    try {
      // 상품별 결제 목록 조회
      // Get charge list by product ID
      // 商品別決済リスト照会
      const chargeInDB = await chargeRepository.findManyByProductId(productId);
      return chargeInDB;
    } catch (err) {
      if (err.name === commonErrors.chargeRepositoryFindManyByProductIdError)
        throw err;
      err.name = commonErrors.chargeServiceGetChargesByProductIdError;
      throw err;
    }
  }
  async getChargeByOrderId(orderId) {
    try {
      const chargeInDB = await chargeRepository.findByOrderId(orderId);
      return chargeInDB;
    } catch (err) {
      if (err.name === commonErrors.chargeRepositoryFindByObjIdError) throw err;
      err.name = commonErrors.chargeServiceGetChargeByOrderIdError;
      throw err;
    }
  }

  async getChargeByUserObjId(userObjId) {
    try {
      const chargeInDB = await chargeRepository.findByUserObjId(userObjId);
      return chargeInDB;
    } catch (err) {
      if (err.name === commonErrors.chargeRepositoryFindByUserObjIdError)
        throw err;
      err.name = commonErrors.chargeServiceGetChargeByUserObjIdError;
      throw err;
    }
  }

  async getChargesByUserObjId(userObjId) {
    try {
      const chargeArrInDB = await chargeRepository.findManyByUserObjId(
        userObjId
      );
      return chargeArrInDB;
    } catch (err) {
      if (err.name === commonErrors.chargeRepositoryFindManyByUserObjIdError)
        throw err;
      err.name = commonErrors.chargeServiceGetChargesByUserObjIdError;
      if (err.message === commonErrors.chargesInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }

  async getChargesByCurrency(currency) {
    try {
      const chargeArrInDB = await chargeRepository.findManyByCurrency(currency);
      return chargeArrInDB;
    } catch (err) {
      if (err.name === commonErrors.chargeRepositoryFindManyByCurrencyError)
        throw err;
      err.name = commonErrors.chargeServiceGetChargesByCurrencyError;
      if (err.message === commonErrors.chargesInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }

  async deleteChargeByOrderId(orderId, session = null) {
    try {
      const chargeInDB = await chargeRepository.findByOrderId(orderId);
      if (chargeInDB !== null && chargeInDB !== undefined) {
        const deletedCharge = await chargeRepository.deleteByObjId(
          chargeInDB._id,
          session
        );
        return deletedCharge;
      } else {
        throw new Error(commonErrors.chargeInfoNotFoundError);
      }
    } catch (err) {
      if (err.name === commonErrors.chargeRepositoryFindByOrderIdError)
        throw err;
      if (err.name === commonErrors.chargeRepositoryDeleteByOrderIdError)
        throw err;
      err.name = commonErrors.chargeServiceDeleteChargeByOrderIdError;
      if (err.message === commonErrors.chargeInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }
  async deleteChargeByObjId(chargeObjId, session = null) {
    try {
      const chargeInDB = await chargeRepository.findByObjId(chargeObjId);
      if (chargeInDB !== null && chargeInDB !== undefined) {
        const deletedCharge = await chargeRepository.deleteByObjId(
          chargeInDB._id,
          session
        );
        return deletedCharge;
      } else {
        throw new Error(commonErrors.chargeInfoNotFoundError);
      }
    } catch (err) {
      if (err.name === commonErrors.chargeRepositoryFindByObjIdError) throw err;
      if (err.name === commonErrors.chargeRepositoryDeleteByObjIdError)
        throw err;
      err.name = commonErrors.chargeServiceDeleteChargeByObjIdError;
      if (err.message === commonErrors.chargeInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }

  async deleteChargesByUserObjId(userObjId, session = null) {
    try {
      const chargeArrInDB = await chargeRepository.findManyByUserObjId(
        userObjId
      );
      if (chargeArrInDB !== null && chargeArrInDB !== undefined) {
        const result = await chargeRepository.deleteManyByUserObjId(
          userObjId,
          session
        );
        return result;
      } else {
        throw new Error(commonErrors.chargesInfoNotFoundError);
      }
    } catch (err) {
      if (err.name === commonErrors.chargeRepositoryFindManyByUserObjIdError)
        throw err;
      if (err.name === commonErrors.chargeRepositoryDeleteManyByObjIdError)
        throw err;
      err.name = commonErrors.chargeServiceDeleteChargesByUserObjIdError;
      if (err.message === commonErrors.chargesInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }

  async deleteChargeByUserObjIdAndPaymentKey(
    userObjId,
    paymentKey,
    session = null
  ) {
    try {
      const chargeArrInDB = await chargeRepository.findManyByUserObjId(
        userObjId
      );
      if (chargeArrInDB !== null && chargeArrInDB !== undefined) {
        const result =
          await chargeRepository.deleteManyByUserObjIdAndPaymentKey(
            userObjId,
            paymentKey,
            session
          );
        return result;
      } else {
        throw new Error(commonErrors.chargesInfoNotFoundError);
      }
    } catch (err) {
      if (err.name === commonErrors.chargeRepositoryFindManyByUserObjIdError)
        throw err;
      if (
        err.name ===
        commonErrors.chargeRepositoryDeleteManyByUserObjIdAndPaymentKeyError
      )
        throw err;
      err.name =
        commonErrors.chargeServiceDeleteChargesByUserObjIdAndPaymentKeyError;
      if (err.message === commonErrors.chargesInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }

  async deleteChargesByObjIdArr(chargeObjIdArr, session = null) {
    try {
      const chargeArrInDB = await chargeRepository.findByObjIdArr(
        chargeObjIdArr
      );
      if (
        chargeArrInDB !== null &&
        chargeArrInDB !== undefined &&
        chargeArrInDB.length > 0
      ) {
        const deletedCharge = await chargeRepository.deleteByObjIdArr(
          chargeObjIdArr,
          session
        );
        return deletedCharge;
      } else {
        throw new Error(commonErrors.chargeInfoNotFoundError);
      }
    } catch (err) {
      if (err.name === commonErrors.chargeRepositoryFindByObjIdArrError)
        throw err;
      if (err.name === commonErrors.chargeRepositoryDeleteByObjIdError)
        throw err;
      err.name = commonErrors.chargeServiceDeleteChargesByObjIdArrError;
      if (err.message === commonErrors.chargeInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }

  async putChargeByOrderId(orderId, updateForm, session = null) {
    try {
      const chargeInDB = await chargeRepository.findByOrderId(orderId);
      if (chargeInDB !== null && chargeInDB !== undefined) {
        const updatedCharge = await chargeRepository.updateByObjId(
          chargeInDB._id,
          updateForm,
          session
        );
        return updatedCharge;
      } else {
        throw new Error(commonErrors.chargeInfoNotFoundError);
      }
    } catch (err) {
      if (err.name === commonErrors.chargeRepositoryFindByObjIdError) throw err;
      if (err.name === commonErrors.chargeRepositoryUpdateByObjIdError)
        throw err;
      err.name = commonErrors.chargeServicePutChargeByOrderIdError;
      if (err.message === commonErrors.chargeInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }
  async putChargeByUserObjId(userObjId, updateForm, session = null) {
    try {
      const chargeInDB = await chargeRepository.findByUserObjId(userObjId);
      if (chargeInDB !== null && chargeInDB !== undefined) {
        const updatedCharge = await chargeRepository.updateByObjId(
          chargeInDB._id,
          updateForm,
          session
        );
        return updatedCharge;
      } else {
        throw new Error(commonErrors.chargeInfoNotFoundError);
      }
    } catch (err) {
      if (err.name === commonErrors.chargeRepositoryFindByObjIdError) throw err;
      if (err.name === commonErrors.chargeRepositoryUpdateByObjIdError)
        throw err;
      err.name = commonErrors.chargeServicePutChargeByObjIdError;
      if (err.message === commonErrors.chargeInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }
}
const chargeService = new ChargeService();

module.exports = chargeService;
