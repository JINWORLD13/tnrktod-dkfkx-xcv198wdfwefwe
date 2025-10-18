const { userRepository } = require("../repositories/index");
const commonErrors = require("../../../common/errors/commonErrors");
// const bcrypt = require("bcrypt");
const passwordCheckRegex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");

class UserService {
  async createUser(userInfo) {
    try {
      const userInDB = await userRepository.findById(userInfo.id);
      if (userInDB !== null && userInDB !== undefined) {
        throw new Error(commonErrors.userInfoConflictError);
      } else {
        const newUser = await userRepository.create(userInfo);
        return newUser;
      }
    } catch (err) {
      if (err.name === commonErrors.userRepositoryFindByIdError) throw err;
      if (err.name === commonErrors.userRepositoryCreateError) throw err;
      err.name = commonErrors.userServiceCreateError;
      if ((err.message = commonErrors.userInfoConflictError))
        err.statusCode = 409;
      throw err;
    }
  }

  async getUserByObjId(userObjId) {
    try {
      const userInDB = await userRepository.findByObjId(userObjId);
      return userInDB;
    } catch (err) {
      if (err.name === commonErrors.userRepositoryFindByObjIdError) throw err;
      err.name = commonErrors.userServiceGetUserByObjIdError;
      if (err.message === commonErrors.userInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }
  async getUserById(userId) {
    try {
      const userInDB = await userRepository.findById(userId);
      return userInDB;
    } catch (err) {
      if (err.name === commonErrors.userRepositoryFindByIdError) throw err;
      err.name = commonErrors.userServiceGetUserByIdError;
      if (err.message === commonErrors.userInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }

  async updateUser(updatedUserInfo, session = null) {
    try {
      const userId = updatedUserInfo.id;
      const userInDB = await userRepository.findById(userId);
      if (userInDB === undefined || userInDB === null) {
        throw new Error(commonErrors.userInfoNotFoundError);
      }
      const updatedUser = await userRepository.updateOne(
        updatedUserInfo,
        session
      );
      return updatedUser;
    } catch (err) {
      if (err.name === commonErrors.userRepositoryUpdateOneError) throw err;
      err.name = commonErrors.userServiceUpdateUserError;
      if (err.message === commonErrors.userInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }

  async deleteUser(userInfo) {
    try {
      const userInDB = await userRepository.findById(userInfo.id);
      if (userInDB === null || userInDB === undefined) {
        throw new Error(commonErrors.userInfoNotFoundError);
      }
      const deletedUser = await userRepository.deleteByIdAndReturnDeletedOne(
        userInfo.id
      );
      return deletedUser;
    } catch (err) {
      if (err.name === commonErrors.userRepositoryFindByIdError) throw err;
      if (err.name === commonErrors.userRepositoryDeleteByIdError) throw err;
      err.name = commonErrors.userServiceDeleteUserError;
      if (err.message === commonErrors.adminInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }
}
const userService = new UserService();

module.exports = userService;

// const hashedPassword = await bcrypt.hash(updatedUserInfo.password, 10);
// if (passwordCheckRegex.test(updatedUserInfo.email)===false) {
//   throw new Error(`email 형식이 맞지 않습니다.`, commonErrors.inputError);
// }
// const updatedUser = await userRepository.updateOne(updatedUserInfo);
// if (updatedUserInfo.password.length < 8) {throw new Error("password 8자이상 입력해야 합니다.", commonErrors.inputError);}
