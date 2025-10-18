const User = require("../models/user");
const commonErrors = require("../../../common/errors/commonErrors");
const { sanitizeObject } = require("../../../common/utils/util");

// User Repository: MongoDB 사용자 데이터 접근 계층
// User Repository: MongoDB user data access layer
// Userリポジトリ：MongoDBユーザーデータアクセス層
const userDAO = {
  create: async (userInfo) => {
    try {
      const newUser = await User?.create(userInfo);
      return newUser?.toObject();
    } catch (err) {
      err.name = commonErrors.userDAOCreateError;
      throw err;
    }
  },

  findByEmail: async (email) => {
    try {
      // lean(): Mongoose 문서를 순수 JavaScript 객체로 변환
      // lean(): converts Mongoose document to plain JavaScript object
      // lean()：Mongooseドキュメントを純粋なJavaScriptオブジェクトに変換
      const plainUser = await User?.findOne({ email })?.lean();
      return plainUser;
    } catch (err) {
      err.name = commonErrors.userDAOFindByEmailError;
      throw err;
    }
  },

  findByObjId: async (userObjId) => {
    try {
      const plainUser = await User?.findOne({ _id: userObjId })?.lean();
      return plainUser;
    } catch (err) {
      err.name = commonErrors.userDAOFindByObjIdError;
      throw err;
    }
  },
  findById: async (userId) => {
    try {
      const plainUser = await User?.findOne({ id: userId })?.lean();
      return plainUser;
    } catch (err) {
      err.name = commonErrors.userDAOFindByIdError;
      throw err;
    }
  },

  updateOne: async (updatedUserInfo, session = null) => {
    try {
      const filter = { id: updatedUserInfo.id };
      const update = { ...updatedUserInfo };
      const option = { returnOriginal: false, session };

      const updatedUser = await User?.findOneAndUpdate(filter, update, option);
      return updatedUser;
    } catch (err) {
      err.name = commonErrors.userDAOUpdateOneError;
      throw err;
    }
  },

  deleteById: async (userId) => {
    try {
      const result = await User?.deleteOne({ id: userId });
      return result;
    } catch (err) {
      err.name = commonErrors.userDAODeleteByIdError;
      throw err;
    }
  },

  deleteByIdAndReturnDeletedOne: async (userId) => {
    try {
      const result = await User?.findOneAndDelete({ id: userId });
      return result;
    } catch (err) {
      err.name = commonErrors.userDAODeleteByIdError;
      throw err;
    }
  },
};

module.exports = userDAO;
