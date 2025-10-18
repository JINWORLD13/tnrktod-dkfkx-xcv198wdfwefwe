const DeletedUser = require("../models/deletedUser");
const commonErrors = require("../../../common/errors/commonErrors");
const { sanitizeObject } = require("../../../common/utils/util");

const deletedUserDAO = {
  create: async (userInfo) => {
    try {
      const newDeletedUser = await DeletedUser?.create(userInfo);
      return newDeletedUser?.toObject();
    } catch (err) {
      err.name = commonErrors.deletedUserDAOCreateError;
      throw err;
    }
  },

  findByEmail: async (email) => {
    try {
      const plainUser = await DeletedUser?.findOne({ email })?.lean(); // lean()은 순수 스키마 값만 줌(객체에서 메소드 말고 필드만)
      return plainUser; // plain이란 말도 순수 값이란 의미. 메소드 없음.
    } catch (err) {
      // err.message로 new Error() 안의 text를 볼 수 있으며 AppError를 통해 error가 형식을 갖춰 next()로 인해 전역 에러처리 미들웨어로 보내지게 됨.
      err.name = commonErrors.deletedUserDAOFindByEmailError;
      throw err;
    }
  },

  findByObjId: async (userObjId) => {
    try {
      const plainUser = await DeletedUser?.findOne({ _id: userObjId })?.lean();
      return plainUser;
    } catch (err) {
      err.name = commonErrors.deletedUserDAOFindByObjIdError;
      throw err;
    }
  },
  findById: async (userId) => {
    try {
      const plainUser = await DeletedUser?.findOne({ id: userId })?.lean();
      return plainUser;
    } catch (err) {
      err.name = commonErrors.deletedUserDAOFindByIdError;
      throw err;
    }
  },

  updateOne: async (updatedUserInfo) => {
    try {
      const filter = { id: updatedUserInfo.id };
      const option = { returnOriginal: false };
      const update = { ...updatedUserInfo };

      const updatedUser = await DeletedUser?.findOneAndUpdate(
        filter,
        update,
        option
      );
      return updatedUser;
    } catch (err) {
      err.name = commonErrors.deletedUserDAOUpdateOneError;
      throw err;
    }
  },

  deleteById: async (userId) => {
    try {
      const result = await DeletedUser?.deleteOne({ id: userId });
      return result;
    } catch (err) {
      err.name = commonErrors.deletedUserDAODeleteByIdError;
      throw err;
    }
  },

  deleteByIdAndReturnDeletedOne: async (userId) => {
    try {
      const result = await DeletedUser?.findOneAndDelete({ id: userId });
      return result;
    } catch (err) {
      err.name = commonErrors.deletedUserDAODeleteByIdError;
      throw err;
    }
  },
};

module.exports = deletedUserDAO;
