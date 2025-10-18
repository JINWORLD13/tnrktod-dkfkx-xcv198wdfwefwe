const { sanitizeObject, buildResponse } = require("../../../common/utils/util");
const AppError = require("../../../common/errors/AppError");
const commonErrors = require("../../../common/errors/commonErrors");
const { adminService } = require("../services");
const { userService } = require("../../user/services");
const { userController } = require("./index");

// js에서의 object 형태 3
const adminController = {
  async createAdmin(req, res, next) {
    try {
      const adminInfo = await userController?.findById(req?.user);
      const newAdminInfo = { ...adminInfo, role: "admin" };
      const newAdmin = await adminService.createAdmin(newAdminInfo);
      res?.status(200).json(buildResponse(newAdmin, null, 200));
    } catch (err) {
      const customedError = new AppError(err.name, err.message, 401);
      next(customedError);
    }
  },

  // 관리자 조회: 관리자 권한 필수
  // Get admin info: admin privileges required
  // 管理者照会：管理者権限必須
  async getAdminById(req, res, next) {
    try {
      const adminId = req?.user ?? req?.session?.user?.id ?? null;
      req.user = adminId;
      const adminRole = await adminService.getAdminById(adminId).role;
      if (req?.isAuthenticated() === true && adminRole === "admin") {
        const adminInDB = await adminService.getAdminById(adminId);
        if (adminInDB === undefined || adminInDB === null) {
          // 404 Not Found: 관리자 정보 없음
          // 404 Not Found: Admin information not found
          // 404 Not Found: 管理者情報なし
          next(
            new AppError(
              commonErrors.adminControllerGetAdminByIdError,
              commonErrors.adminInfoNotFoundError,
              404
            )
          );
        }
        return res.status(200).json(buildResponse(adminInDB, null, 200));
      } else {
        // 403 Forbidden: 관리자 권한 없음
        // 403 Forbidden: No admin privileges
        // 403 Forbidden: 管理者権限なし
        next(
          new AppError(
            commonErrors.adminControllerGetAdminByIdError,
            commonErrors.forbiddenError,
            403
          )
        );
      }
    } catch (err) {
      next(new AppError(err.name, err.message, err.statusCode));
    }
  },
  async getUserByEmail(req, res, next) {
    try {
      // 여기에 토큰 체크하는 미들웨어 넣기(관리자에겐 전체 권한)
      const adminId = req?.user ?? req?.session?.user?.id ?? null;
      req.user = adminId;
      const adminRole = await adminService.getAdminById(adminId).role;
      if (req?.isAuthenticated() === true && adminRole === "admin") {
        const userEmail = req?.body.email;
        const userInDB = await adminService.getUserByEmail(userEmail, adminId);
        if (userInDB === undefined || userInDB === null) {
          next(
            new AppError(
              commonErrors.adminControllerGetUserByEmailError,
              commonErrors.adminInfoNotFoundError,
              404
            )
          );
        }
        return res.status(200).json(buildResponse(userInDB, null, 200));
      } else {
        next(
          new AppError(
            commonErrors.adminControllerGetUserByEmailError,
            commonErrors.forbiddenError,
            403
          )
        );
      }
    } catch (err) {
      next(new AppError(err.name, err.message, err.statusCode));
    }
  },

  // 역할별 사용자 조회: 관리자 전용 기능
  // Get users by role: admin-only feature
  // 役割別ユーザー照会：管理者専用機能
  async getUsersByRole(req, res, next) {
    try {
      const adminId = req?.user ?? req?.session?.user?.id ?? null;
      req.user = adminId;
      const adminRole = await adminService.getAdminById(adminId).role;
      if (req?.isAuthenticated() === true && adminRole === "admin") {
        const adminInDB = await adminService.getAdminById(adminId);
        if (adminInDB === undefined || adminInDB === null) {
          next(
            new AppError(
              commonErrors.adminControllerGetUsersByRoleError,
              commonErrors.adminInfoNotFoundError,
              404
            )
          );
        }
        let role = req?.body?.role;
        const userArrInDB = await adminService.getUsersByRole(role, adminId);
        res.status(200).json(buildResponse(userArrInDB, null, 200));
      } else {
        next(
          new AppError(
            commonErrors.adminControllerGetUsersByRoleError,
            commonErrors.forbiddenError,
            403
          )
        );
      }
    } catch (err) {
      // 403 Forbidden: 인증은 유효하나 권한 부족
      // 403 Forbidden: authenticated but insufficient permissions
      // 403 Forbidden: 認証は有効だが権限不足
      next(new AppError(err.name, err.message, err.statusCode));
    }
  },

  // 전체 사용자 조회: 관리자 전용 기능
  // Get all users: admin-only feature
  // 全ユーザー照会：管理者専用機能
  async getAllUsers(req, res, next) {
    try {
      const adminId = req?.user ?? req?.session?.user?.id ?? null;
      req.user = adminId;
      const adminRole = await adminService.getAdminById(adminId).role;
      if (req?.isAuthenticated() === true && adminRole === "admin") {
        const adminInDB = await adminService.getAdminById(adminId);
        if (adminInDB === undefined || adminInDB === null) {
          next(
            new AppError(
              commonErrors.adminControllerGetAllUsersError,
              commonErrors.adminInfoNotFoundError,
              404
            )
          );
        }
        const allInDB = await adminService.getAll();
        res?.status(200).json(buildResponse(allInDB, null, 200));
      } else {
        next(
          new AppError(
            commonErrors.adminControllerGetAllUsersError,
            commonErrors.forbiddenError,
            403
          )
        );
      }
    } catch (err) {
      next(new AppError(err.name, err.message, err.statusCode));
    }
  },

  async putAdmin(req, res, next) {
    try {
      // 여기에 토큰 체크하는 미들웨어 넣기(관리자에겐 전체 권한)
      const adminId = req?.user ?? req?.session?.user?.id ?? null;
      req.user = adminId;
      const adminInfo = await adminService.getAdminById(adminId).role;
      const adminRole = await adminInfo.role;
      if (req?.isAuthenticated() === true && adminRole === "admin") {
        const adminInDB = await adminService.getAdminById(adminId);
        if (adminInDB === undefined || adminInDB === null) {
          next(
            new AppError(
              commonErrors.adminControllerPutAdminError,
              commonErrors.adminInfoNotFoundError,
              404
            )
          );
        }

        const transfferedInfo = req?.body;
        // 빈 값 필터링: 유효한 데이터만 업데이트
        // Filter empty values: update only valid data
        // 空の値をフィルタリング：有効なデータのみ更新
        const updatedAdminDataArr = transfferedInfo?.filter(
          (elem) => elem?.length > 0
        );
        const updatedAdminInfo = { ...adminInfo, ...updatedAdminDataArr };
        const result = await adminService.updateUser(updatedAdminInfo);
        res?.status(200).json(buildResponse(result, null, 200));
      } else {
        next(
          new AppError(
            commonErrors.adminControllerPutAdminError,
            commonErrors.forbiddenError,
            403
          )
        );
      }
    } catch (err) {
      next(new AppError(err.name, err.message, err.statusCode));
    }
  },
  async putUser(req, res, next) {
    try {
      // 여기에 토큰 체크하는 미들웨어 넣기(관리자에겐 전체 권한)
      const adminId = req?.user ?? req?.session?.user?.id ?? null;
      req.user = adminId;
      const adminInfo = await adminService.getAdminById(adminId).role;
      const adminRole = await adminInfo.role;
      if (req?.isAuthenticated() === true && adminRole === "admin") {
        const adminInDB = await adminService.getAdminById(adminId);
        if (adminInDB === undefined || adminInDB === null) {
          next(
            new AppError(
              commonErrors.adminControllerPutUserError,
              commonErrors.adminInfoNotFoundError,
              404
            )
          );
        }
        const userEmail = req?.body?.email;
        const userInDB = await adminService.getUserByEmail(userEmail, adminId);
        const transfferedInfo = req?.body;
        // ? 빈값으로 업데이트 되지 않은 항목 거르기
        const updatedUserDataArr = transfferedInfo?.filter(
          (elem) => elem?.length > 0
        );
        const updatedUserInfo = { ...userInDB, ...updatedUserDataArr };
        const result = await adminService.updateUser(updatedUserInfo);
        res?.status(200).json(buildResponse(result, null, 200));
      } else {
        next(
          new AppError(
            commonErrors.adminControllerPutUserError,
            commonErrors.forbiddenError,
            403
          )
        );
      }
    } catch (err) {
      next(new AppError(err.name, err.message, err.statusCode));
    }
  },

  // // ! 나중에 하기
  // async putUsers(req, res, next) {
  //   try {
  //     // 여기에 토큰 체크하는 미들웨어 넣기(관리자에겐 전체 권한)
  //     const adminId = (req?.user ?? req?.session?.user?.id) ?? null;
  //     const adminInfo = await adminService.getAdminById(adminId).role;
  //     const adminRole = await adminInfo.role;
  //     if (req?.isAuthenticated() === true && adminRole === "admin") {
  //       const adminInDB = await adminService.getAdminById(adminId);
  //       if (adminInDB === undefined || adminInDB === null) {
  //         throw new Error("No admin info error");
  //       }
  //       const userEmailArr = req?.body?.emails;
  //       const userArrInDB = await adminService.getUsersByEmailArr(
  //         userEmailArr,
  //         adminId
  //       );
  //       const transfferedInfo = req?.body;
  //       // ? 빈값으로 업데이트 되지 않은 항목 거르기 (프론트엔드에선 EMAIL은 무조건 보내야 함...)
  //       //! transfferedInfo에 email은 무조건 있음. 이걸로 사용자 찾아서 id찾기
  //       const updatedUserDataArr = transfferedInfo?.filter((elem1) =>
  //         elem1??.filter((elem2) => elem2?.length > 0)
  //       );
  //       const updatedUserArr = userArrInDB.map((userInDB, i) => {
  //         if(userInDB.email === updatedUserDataArr[i].email){ // ! 이 부분을 id로 비교해야 함.
  //           return { ...userInDB, ...updatedUserDataArr[i] };
  //         }

  //       });

  //       const result = await adminService.updateUsers(updatedUserArr, adminId);
  //       res?.status(200).json(buildResponse(result, null, 200));
  //     } else {
  //       throw new Error("Not authorized");
  //     }
  //   } catch (err) {
  //     next(new AppError(err.name, 401, err.message));
  //   }
  // },

  // delete 버튼 누른다는 가정하에.
  async deleteAdminById(req, res, next) {
    try {
      // 여기에 토큰 체크하는 미들웨어 넣기(관리자에겐 전체 권한)
      const adminId = req?.user;
      const adminInfo = await adminService.getAdminById(adminId).role;
      const adminRole = await adminInfo.role;
      if (req?.isAuthenticated() === true && adminRole === "admin") {
        const adminInDB = await adminService.getAdminById(adminId);
        if (adminInDB === undefined || adminInDB === null) {
          next(
            new AppError(
              commonErrors.adminControllerDeleteAdminByIdError,
              "Not Found",
              404
            )
          );
        }
        await adminService.deleteAdminById(adminId);
        res?.status(204).json(buildResponse(null, null, 204)); //~ status(204)로 하면 응답값 출력 안됨. 로직은 처리가 됨.
      } else {
        next(
          new AppError(
            commonErrors.adminControllerDeleteAdminByIdError,
            "Unauthorized",
            401
          )
        );
      }
    } catch (err) {
      next(new AppError(err.name, 401, err.message));
    }
  },

  async deleteUserByEmail(req, res, next) {
    try {
      // 여기에 토큰 체크하는 미들웨어 넣기(관리자에겐 전체 권한)
      const adminId = req?.user;
      const adminInfo = await adminService.getAdminById(adminId).role;
      const adminRole = await adminInfo.role;
      if (req?.isAuthenticated() === true && adminRole === "admin") {
        const adminInDB = await adminService.getAdminById(adminId);
        if (adminInDB === undefined || adminInDB === null) {
          next(
            new AppError(
              commonErrors.adminControllerDeleteUserByEmailError,
              "Not Found",
              404
            )
          );
        }
        const userEmail = req?.body.email;
        await adminService.deleteUserByEmail(userEmail, adminId);
        res?.status(204).json(buildResponse(null, null, 204)); //~ status(204)로 하면 응답값 출력 안됨. 로직은 처리가 됨.
      } else {
        next(
          new AppError(
            commonErrors.adminControllerDeleteUserByEmailError,
            "Unauthorized",
            401
          )
        );
      }
    } catch (err) {
      next(new AppError(err.name, 401, err.message));
    }
  },

  async deleteUsersByEmail(req, res, next) {
    try {
      // 여기에 토큰 체크하는 미들웨어 넣기(관리자에겐 전체 권한)
      const adminId = req?.user;
      const adminInfo = await adminService.getAdminById(adminId).role;
      const adminRole = await adminInfo.role;
      if (req?.isAuthenticated() === true && adminRole === "admin") {
        const adminInDB = await adminService.getAdminById(adminId);
        if (adminInDB === undefined || adminInDB === null) {
          next(
            new AppError(
              commonErrors.adminControllerDeleteUsersByEmailError,
              "Not Found",
              404
            )
          );
        }
        const userEmailArr = req?.body.emails;
        await adminService.deleteUserByEmail(userEmailArr, adminId);

        const usersEmailArr = [...req?.body];
        await adminService.deleteUsersByEmail(usersEmailArr);
        res?.status(204).json(buildResponse(null, null, 204));
      } else {
        next(
          new AppError(
            commonErrors.adminControllerDeleteUsersByEmailError,
            "Unauthorized",
            401
          )
        );
      }
    } catch (err) {
      next(new AppError(err.name, 403, err.message));
    }
  },
};

module.exports = adminController;

// Contorller(프론트와 req, res를 이용해 Service의 함수로 값을 구해 처리)
// Controller : 입구컷
// const adminController = {
//   async createUser(req, res, next) {
//     try {
//       const { email, name, password, address, role } = req.body;
//       if (
//         email === null ||
//         email === undefined ||
//         name === null ||
//         name === undefined ||
//         password === null ||
//         password === undefined ||
//         address === null ||
//         address == undefined ||
//         role === null ||
//         role === undefined
//       ) {
//         throw new Error("빈 값을 채워주시길 바랍니다.");
//       }
//       const user = await authService.createUser(
//         email,
//         name,
//         password,
//         address,
//         role
//       );
//       // TODO: 회원가입 직후 자동 로그인 기능 추가시 필요
//       const token = await createToken(req, res, next);
//       res.status(200).json(buildResponse(token, null, 200)); // {}형태로 보내기 위해 buildResponse씀
//     } catch (err) {
//       // 항상 뭐든 에러가 날 수 있으니 에러 처리는 필수 - 형식적으로 해주는 작업
//       let errorCode;
//       err.message == "빈 값을 채워주시길 바랍니다." ? (errorCode = 33) : null;
//       err.message == "빈 값을 채워주시길 바랍니다."
//         ? (err.name = commonErrors.authControllerPostUserError)
//         : null;
//       err.message == "이미 같은 email이 있어 가입하지 못합니다."
//         ? (errorCode = 26)
//         : null;
//       err.message == "email 형식이 맞지 않습니다." ? (errorCode = 29) : null;
//       err.message == "password 8자이상 입력해야 합니다."
//         ? (errorCode = 30)
//         : null;
//       const error = new AppError(err.name, 401, errorCode, err.message);
//       next(error);
//       // if(err.message == "빈 값을 채워주시길 바랍니다."){
//       //     err.name = commonErrors.authControllerPostUserError;
//       //     errorCode = 33
//       // }
//       // if(err.message == "이미 같은 email이 있어 가입하지 못합니다."){
//       //     err.name = commonErrors.authServiceCreateUserError;
//       //     errorCode = 26
//       // }
//       // if(err.message == "email 형식이 맞지 않습니다."){
//       //     err.name = commonErrors.authServiceCreateUserError;
//       //     errorCode = 29
//       // }
//       // if(err.message == "password 8자이상 입력해야 합니다."){
//       //     err.name = commonErrors.authServiceCreateUserError;
//       //     errorCode = 30
//       // }
//     }
//   },

//   // ! 토큰이 발급돼 있는 상태여야 하고 checkToken가 있어야 decode로 인해 요청.user는 존재하게 됨.
//   async getAuthUser(req, res, next) {
//     try {
//       let { email } = req.user;

//       if (email === null || email === undefined) {
//         throw new Error("토큰이 존재하지 않습니다.");
//       }
//       const user = await authService.getAuthUser(email);
//       return res.status(200).json(buildResponse(user, null, 200));
//     } catch (err) {
//       err.message == "빈 값을 채워주시길 바랍니다." ? (errorCode = 33) : null;
//       err.message == "이미 같은 email이 있어 가입하지 못합니다."
//         ? (errorCode = 26)
//         : null;
//       err.message == "email 형식이 맞지 않습니다." ? (errorCode = 29) : null;
//       err.message == "password 8자이상 입력해야 합니다."
//         ? (errorCode = 30)
//         : null;
//       err.message == "토큰이 존재하지 않습니다." ? (errorCode = 27) : null;
//       err.message == "토큰이 존재하지 않습니다."
//         ? (err.name = commonErrors.authControllerGetAuthUserError)
//         : null;
//       // if(err.message == "토큰이 존재하지 않습니다."){
//       //     err.name = commonErrors.authControllerGetAuthUserError;
//       //     errorCode = 27
//       // }

//       next(new AppError(err.name, 401, errorCode, err.message));
//     }
//   },

//   // ! 토큰이 발급돼 있는 상태여야 하고 checkToken가 있어야 decode로 인해 요청.user는 존재하게 됨.
//   async getUser(req, res, next) {
//     try {
//       let { email, password } = req.user;
//       let userInfoObject = { email, password };
//       if (email === null || email === undefined) {
//         throw new Error("토큰이 존재하지 않습니다.");
//       }

//       let copiedUserInfoObject = { ...userInfoObject };
//       if (req.body.email != null && req.body.password != null) {
//         // & 프론트에서 이메일, 비번 입력 후 토큰 관련없이 isLoggedIn만 있을 때 필요
//         copiedUserInfoObject = req.body;
//       } else {
//         throw new Error("빈 값을 채워주시길 바랍니다.");
//       }

//       const user = await authService.getUser(email, password);
//       return res.status(200).json(buildResponse(user, null, 200));
//     } catch (err) {
//       let errorCode = null;
//       err.message == "빈 값을 채워주시길 바랍니다." ? (errorCode = 33) : null;
//       err.message == "빈 값을 채워주시길 바랍니다." ? (errorCode = 33) : null;
//       err.message == "email 형식이 맞지 않습니다." ? (errorCode = 29) : null;
//       err.message == "토큰이 존재하지 않습니다." ? (errorCode = 27) : null;
//       err.message == "토큰이 존재하지 않습니다."
//         ? (err.name = commonErrors.authControllerGetUserError)
//         : null;
//       err.message == "password가 일치하지 않습니다."
//         ? (err.name = commonErrors.authControllerGetUserError)
//         : null;
//       // if(err.message == "토큰이 존재하지 않습니다."){
//       //     err.name = commonErrors.authControllerGetUserError;
//       //     errorCode = 27
//       // }
//       // if(err.message == "빈 값을 채워주시길 바랍니다."){
//       //     err.name = commonErrors.authControllerGetUserError;
//       //     errorCode = 33
//       // }
//       // if(err.message == "email이 일치하지 않습니다."){
//       //     err.name = commonErrors.authServiceGetUserError;
//       //     errorCode = 24
//       // }
//       // if(err.message === "password가 일치하지 않습니다."){
//       //     err.name = commonErrors.authServiceGetUserError;
//       //     errorCode = 25
//       // }

//       next(new AppError(err.name, 401, errorCode, err.message));
//     }
//   },

//   async getUsers(req, res, next) {
//     //! 관리자가 전체 유저 조회해야 함
//     let { role } = req.body;
//     try {
//       if (role === null || role === undefined) {
//         throw new Error("빈 값을 채워주시길 바랍니다.");
//       }
//       const users = await authService.getUsers(role);
//       res.status(200).json(buildResponse(users, null, 200));
//     } catch (err) {
//       let errorCode;
//       err.message == "빈 값을 채워주시길 바랍니다." ? (errorCode = 33) : null;
//       err.message == "빈 값을 채워주시길 바랍니다."
//         ? (err.name = commonErrors.authControllerGetUsersError)
//         : null;
//       err.message == `${role} 계정이 없습니다.` ? (errorCode = 34) : null;
//       // if(err.message == "빈 값을 채워주시길 바랍니다."){
//       //     err.name = commonErrors.authControllerGetUsersError;
//       //     errorCode = 33
//       // }
//       // if(err.message == `${role} 계정이 없습니다.`){
//       //     err.name = commonErrors.authServiceGetUsersError;
//       //     errorCode = 34
//       // }
//       next(new AppError(err.name, 403, errorCode, err.message));
//     }
//   },
//   async putUser(req, res, next) {
//     try {
//       let id = req.user._id; // ! 토큰이 발급돼 있는 상태여야 하고 checkToken가 있어야 decode로 인해 요청.user는 존재하게 됨.
//      const userInDB = await adminService.getUserById(id);
//      const updatedInfo = req.body;
//      const updatedUser = { ...updatedInfo, ...userInDB };
//       if (req.user._id === null) {
//         throw new Error(
//           "토큰이 존재하지 않습니다.",
//           commonErrors.adminControllerPostUserError
//         );
//       }
//       let {
//         updatedEmail,
//         updatedName,
//         updatedPassword,
//         updatedAddress,
//         updatedRole,
//       } = req.body; //& 프론트엔드에서 INPUT태그 작성해야 함.
//       if (
//         updatedEmail === null ||
//         updatedName === null ||
//         updatedPassword === null ||
//         updatedAddress === null
//       ) {
//         throw new Error(
//           "빈 값을 채워주시길 바랍니다.",
//           commonErrors.adminControllerPostUserError
//         );
//       }
//       let user;
//       if (req.user.role === "user") {
//         user = await adminService.updateUser(id, {
//           updatedEmail,
//           updatedName,
//           updatedPassword,
//           updatedAddress,
//           updatedRole: "user",
//         });
//       }
//       if (req.user.role === "admin") {
//         user = await adminService.updateUser(id, {
//           updatedEmail,
//           updatedName,
//           updatedPassword,
//           updatedAddress,
//           updatedRole,
//         });
//       }
//       res.status(200).json(buildResponse(user, null, 200));
//     } catch (err) {
//       err.name = commonErrors.adminControllerPutUserError;
//       let errorCode;
//       err.message == "빈 값을 채워주시길 바랍니다." ? (errorCode = 33) : null;
//       err.message == "빈 값을 채워주시길 바랍니다."
//         ? (err.name = commonErrors.adminControllerPutUserError)
//         : null;
//       err.message == "email 형식이 맞지 않습니다." ? (errorCode = 29) : null;
//       err.message == "password 8자이상 입력해야 합니다."
//         ? (errorCode = 30)
//         : null;
//       err.message == "토큰이 존재하지 않습니다." ? (errorCode = 27) : null;
//       err.message == "토큰이 존재하지 않습니다."
//         ? (err.name = commonErrors.adminControllerPutUserError)
//         : null;

//       // if(err.message == "토큰이 존재하지 않습니다."){
//       //     err.name = commonErrors.adminControllerPutUserError;
//       //     errorCode = 27
//       // }
//       // if(err.message == "빈 값을 채워주시길 바랍니다."){
//       //     err.name = commonErrors.adminControllerPutUserError;
//       //     errorCode = 33
//       // }
//       // if(err.message == "email 형식이 맞지 않습니다."){
//       //     err.name = commonErrors adminServiceUpdateUserError;
//       //     errorCode = 29
//       // }
//       // if(err.message == "password 8자이상 입력해야 합니다."){
//       //     err.name = commonErrors.authServiceCreateUserError;
//       //     errorCode = 30
//       // }
//       next(new AppError(err.name, 401, errorCode, err.message));
//     }
//   },

//   async deleteUser(req, res, next) {
//     try {
//       let id = req.user._id;
//       let email = req.user.email;
//       let password = req.body.password; //! 여기 프론트에서 처리해줘야.

//       if (id === null) {
//         //& 여기서 에러 뜨는지 주시하기
//         throw new Error("토큰이 존재하지 않습니다."); // ! 토큰이 발급돼 있는 상태여야 하고 checkToken가 있어야 decode로 인해 요청.user는 존재하게 됨.
//       }

//       await adminService.deleteUser(id, email, password);
//       res.status(204).json(buildResponse(null, null, 204)); //~ 204로 하면 응답값 출력 안됨. 로직은 처리가 됨.
//     } catch (err) {
//       let errorCode;
//       err.message == "토큰이 존재하지 않습니다." ? (errorCode = 27) : null;
//       err.message == "토큰이 존재하지 않습니다."
//         ? (err.name = commonErrors.adminControllerDeleteUserError)
//         : null;
//       err.message == "password가 일치하지 않습니다." ? (errorCode = 25) : null;
//       // if(err.message == "토큰이 존재하지 않습니다."){
//       //     err.name = commonErrors.adminControllerDeleteUserError;
//       //     errorCode = 27
//       // }
//       // if(err.message == "password가 일치하지 않습니다."){
//       //     err.name = commonErrors adminServiceDeleteUserError;
//       //     errorCode = 25
//       // }
//       next(new AppError(err.name, 401, errorCode, err.message));
//     }
//   },

//   async deleteUsers(req, res, next) {
//     try {
//       let { name, role } = req.body;
//       if (name === null || role === null) {
//         throw new Error("빈 값을 채워주시길 바랍니다.");
//       }
//       await adminService.deleteUsers(name, role);
//       res.status(204).json(buildResponse(null, null, 204));
//     } catch (err) {
//       let errorCode;
//       err.message == "빈 값을 채워주시길 바랍니다." ? (errorCode = 33) : null;
//       err.message == "빈 값을 채워주시길 바랍니다."
//         ? commonErrors.adminControllerDeleteUsersError
//         : null;
//       err.message == "name이 일치하지 않습니다." ? (errorCode = 35) : null;

//       // if(err.message == "빈 값을 채워주시길 바랍니다."){
//       //     err.name = commonErrors.adminControllerDeleteUsersError;
//       //     errorCode = 33
//       // }
//       // if(err.message == "name이 일치하지 않습니다."){
//       //     err.name = commonErrors adminServiceDeleteUsersError;
//       //     errorCode = 35
//       // }
//       next(new AppError(err.name, 403, errorCode, err.message));
//     }
//   },
// };

// module.exports = adminController;
