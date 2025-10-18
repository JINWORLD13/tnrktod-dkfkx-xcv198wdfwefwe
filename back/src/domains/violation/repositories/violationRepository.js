const Violation = require("../models/violation");
const commonErrors = require("../../../common/errors/commonErrors");
const { sanitizeObject } = require("../../../common/utils/util");

const violationDAO = {
  create: async (form) => {
    try {
      const newViolation = new Violation({
        violationName: form?.violationName,
        orderId: form?.orderId,
        refundQuantity: form?.refundQuantity,
        remainingQuantity: form?.remainingQuantity,
        violationDate: form?.violationDate,
        violationDescription: form?.violationDescription,
        userInfo: form?.userObjId, // populate시, 연결할 데이터의 ObjId를 쓰면 되는 거임.
      });
      await newViolation.save();

      // Violation 데이터를 가져와 userInfo 필드를 populate하여 실제 데이터로 채워줌
      // populate("Violation 스키마에서 다른 스키마를 연결한 부분에 쓴 (다른 스키마의 ) OBJECT ID키값")
      const populatedViolation = await Violation?.findOne({
        _id: newViolation?._id,
      }).populate("userInfo");
      return populatedViolation?.toObject();
    } catch (err) {
      err.name = commonErrors.violationDAOCreateError;
      throw err;
    }
  },

  findByObjId: async (violationObjId) => {
    try {
      const plainViolation = await Violation?.findOne({
        _id: violationObjId,
      })?.lean();
      return plainViolation;
    } catch (err) {
      err.name = commonErrors.violationDAOFindByObjIdError;
      throw err;
    }
  },

  findByObjIdArr: async (violationObjIdArr) => {
    try {
      // Promise.all로 비동기 처리
      const resultArr = await Promise.all(
        violationObjIdArr.map((violationObjId) =>
          Violation?.findOne({ _id: violationObjId })?.lean()
        )
      );
      return resultArr;
    } catch (err) {
      err.name = commonErrors.violationDAOFindByObjIdArrError;
      throw err;
    }
  },

  findManyByUserObjId: async (userObjId) => {
    try {
      // populate된 부분은 ObjId로 찾아야 함.
      const plainViolationArr = await Violation?.find({ userInfo: userObjId });
      const plainViolationArrWithoutObjIdAndUserObjId = plainViolationArr.map(
        (violation, i) => {
          const {
            orderId,
            orderName,
            paymentKey,
            amount,
            currency,
            createdAt,
            updatedAt,
            ...rest
          } = violation;
          return {
            orderId,
            orderName,
            paymentKey,
            amount,
            currency,
            createdAt,
            updatedAt,
          };
        }
      );
      return plainViolationArrWithoutObjIdAndUserObjId;
    } catch (err) {
      err.name = commonErrors.violationDAOFindManyByUserObjIdError;
      throw err;
    }
  },

  // orderId로 단건 조회
  findByOrderId: async (orderId) => {
    try {
      const violation = await Violation?.findOne({ orderId })?.lean();
      return violation;
    } catch (err) {
      err.name = commonErrors.violationDAOFindByOrderIdError;
      throw err;
    }
  },

  deleteByObjId: async (violationObjId) => {
    try {
      const result = await Violation?.deleteOne({ _id: violationObjId });
      return result;
    } catch (err) {
      err.name = commonErrors.violationDAODeleteByObjIdError;
      throw err;
    }
  },

  deleteByObjIdArr: async (violationObjIdArr) => {
    try {
      // Promise.all로 비동기 처리
      const resultArr = await Promise.all(
        violationObjIdArr.map((violationObjId) =>
          Violation?.deleteOne({ _id: violationObjId })
        )
      );
      return resultArr;
    } catch (err) {
      err.name = commonErrors.violationDAODeleteByObjIdError;
      throw err;
    }
  },

  deleteManyByUserObjId: async (userObjId) => {
    try {
      // deleteMany는 lean() 불필요
      const result = await Violation?.deleteMany({
        userInfo: userObjId,
      });
      return result;
    } catch (err) {
      err.name = commonErrors.violationDAODeleteManyByUserObjIdError;
      throw err;
    }
  },

  deleteAll: async () => {
    try {
      // deleteMany는 lean() 불필요
      const result = await Violation?.deleteMany({});
      return result;
    } catch (err) {
      err.name = commonErrors.violationDAODeleteAllError;
      throw err;
    }
  },

  updateByObjId: async (violationObjId, updateForm) => {
    try {
      const result = await Violation?.updateOne(
        { _id: violationObjId },
        { ...updateForm }
      );
      return result;
    } catch (err) {
      err.name = commonErrors.violationDAOUpdateByObjIdError;
      throw err;
    }
  },

  updateByUserObjId: async (userObjId, updateForm) => {
    try {
      const result = await Violation?.updateOne(
        { userInfo: userObjId },
        { ...updateForm }
      );
      return result;
    } catch (err) {
      err.name = commonErrors.violationDAOUpdateByUserObjIdError;
      throw err;
    }
  },
};

module.exports = violationDAO;
