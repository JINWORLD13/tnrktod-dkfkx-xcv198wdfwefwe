const { adminRepository } = require("../repositories/index");
const commonErrors = require("../../../common/errors/commonErrors");
// const bcrypt = require("bcrypt");
const passwordCheckRegex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");

// Service에서는 기능부분 담당(비즈니스 로직).핵심.
// js에서의 object 형태 2
// & 관리자 인증은 Controller에서 하는거임.
class AdminService {
  async createAdmin(adminInfo) {
    try {
      const adminInDB = await adminRepository.findById(adminInfo.id);
      if (adminInDB !== null || adminInDB !== undefined) {
        throw new Error(commonErrors.adminInfoConflictError);
      } else {
        const newAdmin = await adminRepository.create(adminInfo);
        return newAdmin;
      }
    } catch (err) {
      if (err.name === commonErrors.adminRepositoryFindByIdError) throw err;
      if (err.name === commonErrors.adminRepositoryCreateError) throw err;
      err.name = commonErrors.adminServiceCreateError;
      if ((err.message = commonErrors.adminInfoConflictError))
        err.statusCode = 409;
      throw err;
    }
  }

  async getAdminById(adminId) {
    try {
      const adminInDB = await adminRepository.findById(adminId);
      if (adminInDB === undefined || adminInDB === null) {
        throw new Error(commonErrors.adminInfoNotFoundError);
      } else {
        const adminRole = await adminRepository.findById(adminId).role;
        if (adminRole === "admin") {
          return adminInDB;
        } else {
          throw new Error(commonErrors.forbiddenError);
        }
      }
    } catch (err) {
      if (err.name === commonErrors.adminRepositoryFindByIdError) throw err;
      err.name = commonErrors.adminServiceGetAdminByIdError;
      if (err.message === commonErrors.adminInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.forbiddenError) err.statusCode = 403;
      throw err;
    }
  }

  async getUserByEmail(userEmail, adminId) {
    try {
      const adminInDB = await adminRepository.findById(adminId);
      if (adminInDB === undefined || adminInDB === null) {
        throw new Error(commonErrors.adminInfoNotFoundError);
      } else {
        const adminRole = await adminRepository.findById(adminId).role;
        if (adminRole === "admin") {
          const userInDB = await adminRepository.findByEmail(userEmail);
          if (userInDB === null || userInDB === undefined) {
            throw new Error(commonErrors.userInfoNotFoundError);
          }
          return userInDB;
        } else {
          throw new Error(commonErrors.forbiddenError);
        }
      }
    } catch (err) {
      if (err.name === commonErrors.adminRepositoryFindByIdError) throw err;
      if (err.name === commonErrors.adminRepositoryFindByEmailError) throw err;
      err.name = commonErrors.adminServiceGetUserByEmailError;
      if (err.message === commonErrors.adminInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.userInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.forbiddenError) err.statusCode = 403;
      throw err;
    }
  }

  async getUsersByEmailArr(userEmailArr, adminId) {
    try {
      const adminInDB = await adminRepository.findById(adminId);
      if (adminInDB === undefined || adminInDB === null) {
        throw new Error(commonErrors.adminInfoNotFoundError);
      } else {
        const adminRole = await adminRepository.findById(adminId).role;
        if (adminRole === "admin") {
          const userInDBArr = await adminRepository.findManyByEmailArr(
            userEmailArr
          );
          if (
            userInDBArr?.length === 0 ||
            userInDBArr === null ||
            userInDBArr === undefined
          ) {
            throw new Error(commonErrors.usersInfoNotFoundError);
          }
          return userInDBArr;
        } else {
          throw new Error(commonErrors.forbiddenError);
        }
      }
    } catch (err) {
      if (err.name === commonErrors.adminRepositoryFindByIdError) throw err;
      if (err.name === commonErrors.adminRepositoryFindManyByEmailArrError)
        throw err;
      err.name = commonErrors.adminServiceGetUserByEmailError;
      if (err.message === commonErrors.adminInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.usersInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.forbiddenError) err.statusCode = 403;

      throw err;
    }
  }

  async getUsersByRole(userRole, adminId) {
    try {
      const adminInDB = await adminRepository.findById(adminId);
      if (adminInDB === undefined || adminInDB === null) {
        throw new Error(commonErrors.adminInfoNotFoundError);
      } else {
        const adminRole = await adminRepository.findById(adminId).role;
        if (adminRole === "admin") {
          const userInDBArr = await adminRepository.findManyByRole(userRole);
          if (
            userInDBArr?.length === 0 ||
            userInDBArr === null ||
            userInDBArr === undefined
          ) {
            throw new Error(commonErrors.usersInfoNotFoundError);
          }
          return userInDBArr;
        } else {
          throw new Error(commonErrors.forbiddenError);
        }
      }
    } catch (err) {
      if (err.name === commonErrors.adminRepositoryFindByIdError) throw err;
      if (err.name === commonErrors.adminRepositoryFindManyByRoleError)
        throw err;
      err.name = commonErrors.adminServiceGetUsersByRoleError;
      if (err.message === commonErrors.adminInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.usersInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.forbiddenError) err.statusCode = 403;

      throw err;
    }
  }

  async getAll(adminId) {
    try {
      const adminInDB = await adminRepository.findById(adminId);
      if (adminInDB === undefined || adminInDB === null) {
        throw new Error(commonErrors.adminInfoNotFoundError);
      } else {
        const adminRole = adminInDB.role;
        if (adminRole === "admin") {
          const allUsersInDBArr = await adminRepository.findAll();
          if (
            allUsersInDBArr === undefined ||
            allUsersInDBArr === null ||
            allUsersInDBArr.length === 0
          ) {
            throw new Error(commonErrors.allUsersInfoNotFoundError);
          }
          return allUsersInDBArr;
        } else {
          throw new Error(commonErrors.forbiddenError);
        }
      }
    } catch (err) {
      if (err.name === commonErrors.adminRepositoryFindByIdError) throw err;
      if (err.name === commonErrors.adminRepositoryFindAllError) throw err;
      err.name = commonErrors.adminServiceGetAllError;
      if (err.message === commonErrors.adminInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.allUsersInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.forbiddenError) err.statusCode = 403;
      throw err;
    }
  }

  async updateAdmin(updatedAdminInfo, adminId) {
    try {
      const adminInDB = await adminRepository.findById(adminId);
      if (adminInDB === undefined || adminInDB === null) {
        throw new Error(commonErrors.adminInfoNotFoundError);
      } else {
        const adminRole = adminInDB.role;
        if (adminRole === "admin") {
          const updatedAdmin = await adminRepository.updateOne(
            updatedAdminInfo
          );
          return updatedAdmin;
        } else {
          throw new Error(commonErrors.forbiddenError);
        }
      }
    } catch (err) {
      if (err.name === commonErrors.adminRepositoryFindByIdError) throw err;
      err.name = commonErrors.adminServiceUpdateAdminError;
      if (err.message === commonErrors.adminInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.forbiddenError) err.statusCode = 403;
      throw err;
    }
  }

  async updateUser(updatedUserInfo, adminId) {
    try {
      const adminInDB = await adminRepository.findById(adminId);
      if (adminInDB === undefined || adminInDB === null) {
        throw new Error(commonErrors.adminInfoNotFoundError);
      } else {
        const adminRole = await adminRepository.findById(adminId).role;
        if (adminRole === "admin") {
          const userEmail = updatedUserInfo.email;
          const userInDB = await adminRepository.findByEmail(userEmail);
          if (userInDB === null || userInDB === undefined) {
            throw new Error(commonErrors.userInfoNotFoundError);
          } else {
            const updatedUser = await adminRepository.updateOne(
              updatedUserInfo
            );
            return updatedUser;
          }
        } else {
          throw new Error(commonErrors.forbiddenError);
        }
      }
    } catch (err) {
      if (err.name === commonErrors.adminRepositoryFindByIdError) throw err;
      if (err.name === commonErrors.adminRepositoryFindByEmailError) throw err;
      err.name = commonErrors.adminServiceUpdateUserError;
      if (err.message === commonErrors.adminInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.userInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.forbiddenError) err.statusCode = 403;
      throw err;
    }
  }

  async updateUsers(updatedUserArr, adminId) {
    try {
      const adminInDB = await adminRepository.findById(adminId);
      if (adminInDB === undefined || adminInDB === null) {
        throw new Error(commonErrors.adminInfoNotFoundError);
      } else {
        const adminRole = await adminRepository.findById(adminId).role;
        if (adminRole === "admin") {
          const userInDBArr = await adminRepository.findManyByEmailArr(
            userEmailArr
          );
          if (
            userInDBArr === null ||
            userInDBArr === undefined ||
            userInDBArr?.length === 0
          ) {
            throw new Error(commonErrors.usersInfoNotFoundError);
          } else {
            const updatedUsers = await adminRepository.updateMany(
              updatedUserArr
            );
            return updatedUsers;
          }
        } else {
          throw new Error(commonErrors.forbiddenError);
        }
      }
    } catch (err) {
      if (err.name === commonErrors.adminRepositoryFindByIdError) throw err;
      if (err.name === commonErrors.adminRepositoryFindManyByEmailArrError)
        throw err;
      if (err.name === commonErrors.adminRepositoryUpdateManyError) throw err;
      err.name = commonErrors.adminServiceUpdateUserError;
      if (err.message === commonErrors.adminInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.usersInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.forbiddenError) err.statusCode = 403;
      throw err;
    }
  }

  async deleteAdminById(adminId) {
    try {
      const adminInDB = await adminRepository.findById(adminId);
      const adminRole = adminInDB.role;
      if (adminInDB === undefined || adminInDB === null) {
        throw new Error(commonErrors.adminInfoNotFoundError);
      } else {
        if (adminRole === "admin") {
          const deletedAdmin = await adminRepository.deleteById(adminId);
          return deletedAdmin;
        } else {
          throw new Error(commonErrors.forbiddenError);
        }
      }
    } catch (err) {
      if (err.name === commonErrors.adminRepositoryFindByIdError) throw err;
      if (err.name === commonErrors.adminRepositoryDeleteByIdError) throw err;
      err.name = commonErrors.adminServiceDeleteAdminError;
      if (err.message === commonErrors.adminInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.forbiddenError) err.statusCode = 403;
      throw err;
    }
  }

  async deleteUserByEmail(userEmail, adminId) {
    try {
      const adminInDB = await adminRepository.findById(adminId);
      if (adminInDB === undefined || adminInDB === null) {
        throw new Error(commonErrors.adminInfoNotFoundError);
      } else {
        const adminRole = await adminRepository.findById(adminId).role;
        if (adminRole === "admin") {
          const userInDB = await adminRepository.findByEmail(userEmail);
          if (userInDB === null || userInDB === undefined) {
            throw new Error(commonErrors.userInfoNotFoundError);
          } else {
            const userId = userInDB?.id;
            const deletedUser = await adminRepository.deleteById(userId);
            return deletedUser;
          }
        } else {
          throw new Error(commonErrors.forbiddenError);
        }
      }
    } catch (err) {
      if (err.name === commonErrors.adminRepositoryFindByIdError) throw err;
      if (err.name === commonErrors.adminRepositoryFindByEmailError) throw err;
      if (err.name === commonErrors.adminRepositoryDeleteByIdError) throw err;
      err.name = commonErrors.adminServiceDeleteUserError;
      if (err.message === commonErrors.adminInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.userInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.forbiddenError) err.statusCode = 403;
      throw err;
    }
  }

  async deleteUsersByEmail(userEmailArr, adminId) {
    try {
      const adminInDB = await adminRepository.findById(adminId);
      if (adminInDB === undefined || adminInDB === null) {
        throw new Error(commonErrors.adminInfoNotFoundError);
      } else {
        const adminRole = await adminRepository.findById(adminId).role;
        if (adminRole === "admin") {
          const userInDBArr = await adminRepository.findManyByEmailArr(
            userEmailArr
          );
          if (
            userInDBArr === null ||
            userInDBArr === undefined ||
            userInDBArr?.length === 0
          ) {
            throw new Error(commonErrors.usersInfoNotFoundError);
          } else {
            const userIdArr = userInDBArr.map((user, i) => {
              return user.id;
            });
            const deletedUser = await adminRepository.deleteManyById(userIdArr);
            return deletedUser;
          }
        } else {
          throw new Error(commonErrors.forbiddenError);
        }
      }
    } catch (err) {
      if (err.name === commonErrors.adminRepositoryFindByIdError) throw err;
      if (err.name === commonErrors.adminRepositoryFindManyByEmailArrError)
        throw err;
      if (err.name === commonErrors.adminRepositoryDeleteManyByIdError)
        throw err;
      err.name = commonErrors.adminServiceDeleteUsersError;
      if (err.message === commonErrors.adminInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.usersInfoNotFoundError)
        err.statusCode = 404;
      if (err.message === commonErrors.forbiddenError) err.statusCode = 403;
      throw err;
    }
  }
}

const adminService = new AdminService();

module.exports = adminService;

// async getUserByEmailAndPassword(email, password) {
//   try{
//     const user = await adminRepository.findOne(email);
//     if( user === null){
//       throw new Error("email이 일치하지 않습니다.");
//     }
//     if(await bcrypt.compare(password, user.password)===false){
//       throw new Error("password가 일치하지 않습니다.");
//     }
//     return user;
// } catch(err){
//     err.name = commonErrors.authServiceGetUserError;
//     throw err;
//   }
// },
