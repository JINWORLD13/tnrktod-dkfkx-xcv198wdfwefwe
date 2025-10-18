const User = require("../../user/models/user");
const commonErrors = require("../../../common/errors/commonErrors");
const { sanitizeObject } = require("../../../common/utils/util");

// js에서의 object 형태 1
const adminDAO = {
  create: async (adminInfo) => {
    try {
      const newAdmin = await User?.create(adminInfo);
      return newAdmin?.toObject();
    } catch (err) {
      err.name = commonErrors.adminDAOCreateError;
      throw err;
    }
  },

  findByEmail: async (email) => {
    try {
      const plainUser = await User?.findOne({ email })?.lean(); // lean()은 순수 스키마 값만 줌(객체에서 메소드 말고 필드만)
      return plainUser; // plain이란 말도 순수 값이란 의미. 메소드 없음.
    } catch (err) {
      // err.message로 new Error() 안의 text를 볼 수 있으며 AppError를 통해 error가 형식을 갖춰 next()로 인해 전역 에러처리 미들웨어로 보내지게 됨.
      err.name = commonErrors.adminDAOFindByEmailError;
      throw err;
    }
  },

  findManyByEmailArr: async (emailArr) => {
    try {
      const foundUsers = await emailArr.map((email, i) => {
        const plainUser = User?.findOne({ email })?.lean();
        return plainUser;
      });
      return foundUsers;
    } catch (err) {
      // err.message로 new Error() 안의 text를 볼 수 있으며 AppError를 통해 error가 형식을 갖춰 next()로 인해 전역 에러처리 미들웨어로 보내지게 됨.
      err.name = commonErrors.adminDAOFindManyByEmailArrError;
      throw err;
    }
  },

  findById: async (userId) => {
    try {
      const plainUser = await User?.findOne({ id: userId })?.lean();
      return plainUser;
    } catch (err) {
      err.name = commonErrors.adminDAOFindByIdError;
      throw err;
    }
  },

  findManyByEmail: async (usersEmailArr) => {
    try {
      const usersArrByEmail = [];
      await usersEmailArr.map((elem, i) => {
        const user = User?.find({ email: elem });
        usersArrByEmail.push(user);
      });
      return usersArrByEmail;
    } catch (err) {
      err.name = commonErrors.adminDAOFindManyByEmailError;
      throw err;
    }
  },
  findManyByRole: async (userRole) => {
    try {
      const users = await User?.find({ role: userRole });
      return users;
    } catch (err) {
      err.name = commonErrors.adminDAOFindManyByRoleError;
      throw err;
    }
  },

  findAll: async () => {
    try {
      const users = await User?.find({});
      return users;
    } catch (err) {
      err.name = commonErrors.adminDAOFindAllError;
      throw err;
    }
  },

  updateOne: async (updatedUserInfo) => {
    try {
      const filter = { id: updatedUserInfo.id };
      const option = { returnOriginal: false };
      const update = { ...updatedUserInfo };

      const updatedUser = await User?.findOneAndUpdate(filter, update, option);
      return updatedUser;
    } catch (err) {
      err.name = commonErrors.adminDAOUpdateOneError;
      throw err;
    }
  },

  updateMany: async (updatedUserArr) => {
    try {
      const updatedUsersArr = [];
      await updatedUserArr.map((updatedUserInfo, i) => {
        const filter = { id: updatedUserInfo.id };
        const option = { returnOriginal: false };
        const update = { ...updatedUserInfo };
        const updatedUser = User?.findOneAndUpdate(filter, update, option);
        updatedUsersArr.push(updatedUser);
      });
      return updatedUsersArr;
    } catch (err) {
      err.name = commonErrors.adminDAOUpdateOneError;
      throw err;
    }
  },

  deleteById: async (userId) => {
    try {
      const result = await User?.deleteOne({ id: userId });
      return result;
    } catch (err) {
      err.name = commonErrors.adminDAODeleteByIdError;
      throw err;
    }
  },

  deleteManyById: async (userIdArr) => {
    try {
      const delectedUsers = await userIdArr.map((userId, i) => {
        const result = User?.deleteOne({ id: userId });
        return result;
      });
      return delectedUsers;
    } catch (err) {
      err.name = commonErrors.adminDAODeleteManyByIdError;
      throw err;
    }
  },
};

module.exports = adminDAO;

// // 객체를 만드는거니 const UserDAO ={} 해도 됨.
// class UserDAO {
//   async findByEmail(email) {
//     try {
//       const plainUser = await User.findOne({ email }).lean(); // lean()은 순수 스키마 값만 줌(객체에서 메소드 말고 필드만)
//       return plainUser; // plain이란 말도 순수 값이란 의미. 메소드 없음.
//     } catch (err) {
//       // err.message로 new Error() 안의 text를 볼 수 있으며 AppError를 통해 error가 형식을 갖춰 next()로 인해 전역 에러처리 미들웨어로 보내지게 됨.
//       err.name = commonErrors.userDAOFindByEmailError;
//       throw err;
//     }
//   }

//   async findById(userId) {
//     try {
//       const plainUser = await User.findOne({ _id: userId }).lean();
//       return plainUser;
//     } catch (err) {
//       err.name = commonErrors.userDAOFindByIdError;
//       throw err;
//     }
//   }

//   async create(userInfo) {
//     try {
//       const newUser = await User.create(userInfo);
//       return newUser.toObject();
//     } catch (err) {
//       err.name = commonErrors.userDAOCreateError;
//       throw err;
//     }
//   }

//   async findManyByRole(userRole) {
//     const users = await User.find({role: userRole});
//     return users;
//   }

//   async findAll() {
//     const users = await User.find({});
//     return users;
//   }

//   async updateOne(updatedUserInfo) {
//     const filter = { _id: updatedUserInfo._id };
//     const option = { returnOriginal: false };
//     const update = { ...updatedUserInfo }

//     const updatedUser = await User.findOneAndUpdate(filter, update, option);
//     return updatedUser;
//   }

//   async deleteById(userId) {
//     const result = await User.deleteOne({ _id: userId });
//     return result;
//   }
// }

// const userDAO = new UserDAO();

// module.exports = userDAO;
