const { deletedUserRepository } = require("../repositories/index");
const commonErrors = require("../../../common/errors/commonErrors");
// const bcrypt = require("bcrypt");
const passwordCheckRegex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");

class DeletedUserService {
  async createUser(userInfo) {
    try {
      const deletedUserInDB = await deletedUserRepository.findByObjId(
        userInfo?._id
      );
      if (deletedUserInDB !== null && deletedUserInDB !== undefined) {
        throw new Error(commonErrors.deletedUserInfoConflictError);
      } else {
        const newDeletedUser = await deletedUserRepository.create(userInfo);
        return newDeletedUser;
      }
    } catch (err) {
      if (err.name === commonErrors.deletedUserRepositoryFindByIdError)
        throw err;
      if (err.name === commonErrors.deletedUserRepositoryCreateError) throw err;
      err.name = commonErrors.deletedUserServiceCreateError;
      if ((err.message = commonErrors.deletedUserInfoConflictError))
        err.statusCode = 409;
      throw err;
    }
  }

  async getUserByObjId(userObjId) {
    try {
      const deletedUserInDB = await deletedUserRepository.findByObjId(
        userObjId
      );
      return deletedUserInDB;
    } catch (err) {
      if (err.name === commonErrors.deletedUserRepositoryFindByObjIdError)
        throw err;
      err.name = commonErrors.deletedUserServiceGetUserByObjIdError;
      if (err.message === commonErrors.deletedUserInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }
  async getUserById(userId) {
    try {
      const deletedUserInDB = await deletedUserRepository.findById(userId);
      return deletedUserInDB;
    } catch (err) {
      if (err.name === commonErrors.deletedUserRepositoryFindByIdError)
        throw err;
      err.name = commonErrors.deletedUserServiceGetUserByIdError;
      if (err.message === commonErrors.deletedUserInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }

  async updateUser(updatedUserInfo) {
    try {
      const userId = updatedUserInfo.id;
      const deletedUserInDB = await deletedUserRepository.findById(userId);
      if (deletedUserInDB === undefined || deletedUserInDB === null) {
        throw new Error(commonErrors.deletedUserInfoNotFoundError);
      }
      const updatedUser = await deletedUserRepository.updateOne(
        updatedUserInfo
      );
      return updatedUser;
    } catch (err) {
      if (err.name === commonErrors.deletedUserRepositoryUpdateOneError)
        throw err;
      err.name = commonErrors.deletedUserServiceUpdateUserError;
      if (err.message === commonErrors.deletedUserInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }

  async deleteUser(userInfo) {
    try {
      const deletedUserInDB = await deletedUserRepository.findById(userInfo.id);
      if (deletedUserInDB === null || deletedUserInDB === undefined) {
        throw new Error(commonErrors.deletedUserInfoNotFoundError);
      }
      const deletedUser =
        await deletedUserRepository.deleteByIdAndReturnDeletedOne(userInfo.id);
      return deletedUser;
    } catch (err) {
      if (err.name === commonErrors.deletedUserRepositoryFindByIdError)
        throw err;
      if (err.name === commonErrors.deletedUserRepositoryDeleteByIdError)
        throw err;
      err.name = commonErrors.deletedUserServiceDeleteUserError;
      if (err.message === commonErrors.adminInfoNotFoundError)
        err.statusCode = 404;
      throw err;
    }
  }
}
const deletedUserService = new DeletedUserService();

module.exports = deletedUserService;

// const hashedPassword = await bcrypt.hash(updatedUserInfo.password, 10);
// if (passwordCheckRegex.test(updatedUserInfo.email)===false) {
//   throw new Error(`email 형식이 맞지 않습니다.`, commonErrors.inputError);
// }
// const updatedUser = await deletedUserRepository.updateOne(updatedUserInfo);
// if (updatedUserInfo.password.length < 8) {throw new Error("password 8자이상 입력해야 합니다.", commonErrors.inputError);}
