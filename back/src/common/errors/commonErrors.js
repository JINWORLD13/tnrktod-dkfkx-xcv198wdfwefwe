const commonErrors = {
  notFoundError: "Not Found Error", // 404
  adminInfoNotFoundError: "Admin Info Not Found Error", // 404
  userInfoNotFoundError: "User Info Not Found Error", // 404
  usersInfoNotFoundError: "Users Info Not Found Error", // 404
  deletedUserInfoNotFoundError: "Deleted User Info Not Found Error", // 404
  deletedUsersInfoNotFoundError: "Deleted Users Info Not Found Error", // 404
  tarotInfoNotFoundError: "Tarot Info Not Found Error", // 404
  tarotsInfoNotFoundError: "Tarots Info Not Found Error", // 404
  allUsersInfoNotFoundError: "All Users Info Not Found Error", // 404
  forbiddenError: "Forbidden Error", //403
  unauthorizedError: "unauthorized Error", // 401
  userUnauthorizedError: "User Unauthorized Error", // 401
  deletedUserUnauthorizedError: "Deleted User Unauthorized Error", // 401
  adminInfoConflictError: "Admin Info exists", // 409
  userInfoConflictError: "User Info exists", // 409
  usersInfoConflictError: "Users Info exists", // 409
  deletedUserInfoConflictError: "Deleted User Info exists", // 409
  deletedUsersInfoConflictError: "Deleted Users Info exists", // 409
  tarotInfoConflictError: "Tarot Info exists", // 409
  authRouterSignFailError: "authRouterSignFailError",
  FailureToSignIn: "Failure to sign in",
  refreshGoogleAccessTokenError: "refreshGoogleAccessTokenError",
  errorWhileChargingPoint: "error while charging point",

  argumentError: `Argument Error`,
  businessError: `Business Error`,
  configError: `Config Error`,
  databaseError: `DB Error`,
  fatalError: `Fatal Error`,
  objectCreationError: `Object Creation Error`,
  resourceNotFoundError: `Resource Not Found Error`,
  resourceDuplicationError: `Resource Duplication Error`,
  remoteStorageError: `Remote Storage Error`,
  requestValidationError: `Request Validation Error`,

  tokenExpiredError: "Token Expired Error",
  tokenInvalidError: "Token Invalid Error",
  tokenNotFoundError: "Token Not Found Error",
  tokenNotVerifiedError: "Token Not Verified Error",

  logInInValidError: "Log In Invalid Error",

  authRouterLogoutError: "authRouterLogoutError",

  userDAOFindByIdError: "userDAOFindByIdError",
  userDAOFindByObjIdError: "userDAOFindByObjIdError",
  userDAOFindByEmailError: "userDAOFindByEmailError",
  userDAOCreateError: "userDAOCreateError",
  userDAODeleteByIdError: "userDAODeleteByIdError",
  userDAOUpdateOneError: "userDAOUpdateOneError",
  userServiceCreateError: "userServiceCreateError",
  userServiceGetUserByIdError: "userServiceGetUserByIdError",
  userServiceGetUserByObjIdError: "userServiceGetUserByObjIdError",
  userServiceGetUsersByRoleError: "userServiceGetUsersByRoleError",
  userServiceUpdateUserError: "userServiceUpdateUserError",
  userServiceDeleteUserError: "userServiceDeleteUserError",
  userServiceDeleteUsersError: "userServiceDeleteUsersError",
  userServiceGetAllError: "userServiceGetAllError",
  userControllerDeleteUserError: "userControllerDeleteUserError",
  userControllerPutUserError: "userControllerPutUserError",
  userControllerGetUserByIdError: "userControllerGetUserByIdError",
  userControllerCreaetUserError: "userControllerCreaetUserError",

  deletedUserDAOFindByIdError: "deletedUserDAOFindByIdError",
  deletedUserDAOFindByObjIdError: "deletedUserDAOFindByObjIdError",
  deletedUserDAOFindByEmailError: "deletedUserDAOFindByEmailError",
  deletedUserDAOCreateError: "deletedUserDAOCreateError",
  deletedUserDAODeleteByIdError: "deletedUserDAODeleteByIdError",
  deletedUserDAOUpdateOneError: "deletedUserDAOUpdateOneError",
  deletedUserServiceCreateError: "deletedUserServiceCreateError",
  deletedUserServiceGetUserByIdError: "deletedUserServiceGetUserByIdError",
  deletedUserServiceGetUserByObjIdError:
    "deletedUserServiceGetUserByObjIdError",
  deletedUserServiceGetUsersByRoleError:
    "deletedUserServiceGetUsersByRoleError",
  deletedUserServiceUpdateUserError: "deletedUserServiceUpdateUserError",
  deletedUserServiceDeleteUserError: "deletedUserServiceDeleteUserError",
  deletedUserServiceDeleteUsersError: "deletedUserServiceDeleteUsersError",
  deletedUserServiceGetAllError: "deletedUserServiceGetAllError",
  deletedUserControllerDeleteUserError: "deletedUserControllerDeleteUserError",
  deletedUserControllerPutUserError: "deletedUserControllerPutUserError",
  deletedUserControllerGetUserByIdError:
    "deletedUserControllerGetUserByIdError",
  deletedUserControllerCreaetUserError: "deletedUserControllerCreaetUserError",
  deletedUserDAOFindByIdError: "deletedUserDAOFindByIdError",
  deletedUserDAOFindByObjIdError: "deletedUserDAOFindByObjIdError",
  deletedUserDAOFindByEmailError: "deletedUserDAOFindByEmailError",
  deletedUserDAOCreateError: "deletedUserDAOCreateError",
  deletedUserDAODeleteByIdError: "deletedUserDAODeleteByIdError",
  deletedUserDAOUpdateOneError: "deletedUserDAOUpdateOneError",
  deletedUserServiceCreateError: "deletedUserServiceCreateError",
  deletedUserServiceGetUserByIdError: "deletedUserServiceGetUserByIdError",
  deletedUserServiceGetUserByObjIdError:
    "deletedUserServiceGetUserByObjIdError",
  deletedUserServiceGetUsersByRoleError:
    "deletedUserServiceGetUsersByRoleError",
  deletedUserServiceUpdateUserError: "deletedUserServiceUpdateUserError",
  deletedUserServiceDeleteUserError: "deletedUserServiceDeleteUserError",
  deletedUserServiceDeleteUsersError: "deletedUserServiceDeleteUsersError",
  deletedUserServiceGetAllError: "deletedUserServiceGetAllError",
  deletedUserControllerDeleteUserError: "deletedUserControllerDeleteUserError",
  deletedUserControllerPutUserError: "deletedUserControllerPutUserError",
  deletedUserControllerGetUserByIdError:
    "deletedUserControllerGetUserByIdError",
  deletedUserControllerCreaetUserError: "deletedUserControllerCreaetUserError",

  adminDAOCreateError: "adminDAOCreateError",
  adminDAOFindByIdError: "adminDAOFindByIdError",
  adminDAOFindByEmailError: "adminDAOFindByEmailError",
  adminDAOFindAllError: "adminDAOFindAllError",
  adminDAOFindManyByEmailError: "adminDAOFindManyByEmailError",
  adminDAOFindManyByEmailArrError: "adminDAOFindManyByEmailArrError",
  adminDAOFindManyByRoleError: "adminDAOFindManyByRoleError",
  adminDAODeleteByIdError: "adminDAODeleteByIdError",
  adminDAODeleteManyByIdError: "adminDAODeleteManyByIdError",
  adminServiceCreateError: "adminServiceCreateError",
  adminServiceGetAdminByIdError: "adminServiceGetAdminByIdError",
  adminServiceGetUserByIdError: "adminServiceGetUserByIdError",
  adminServiceGetUserByEmailError: "adminServiceGetUserByEmailError",
  adminServiceGetUsersByRoleError: "adminServiceGetUsersByRoleError",
  adminServiceUpdateUserError: "adminServiceUpdateUserError",
  adminServiceUpdateAdminError: "adminServiceUpdateAdminError",
  adminServiceDeleteAdminError: "adminServiceDeleteAdminError",
  adminServiceDeleteUserError: "adminServiceDeleteUserError",
  adminServiceDeleteUsersError: "adminServiceDeleteUsersError",
  adminServiceGetAllError: "adminServiceGetAllError",
  adminControllerGetAdminByIdError: "adminControllerGetAdminByIdError",

  adminControllerGetUserByEmailError: "adminControllerGetUserByEmailError",
  adminControllerGetUserByRoleError: "adminControllerGetUserByRoleError",
  adminControllerGetUsersByRoleError: "adminControllerGetUsersByRoleError",
  adminControllerGetAllUsersError: "adminControllerGetAllUsersError",
  adminControllerPutAdminError: "adminControllerPutAdminError",
  adminControllerPutUserError: "adminControllerPutUserError",
  adminControllerDeleteAdminByIdError: "adminControllerDeleteAdminByIdError",
  adminControllerDeleteUserByEmailError:
    "adminControllerDeleteUserByEmailError",
  adminControllerDeleteUsersByEmailError:
    "adminControllerDeleteUsersByEmailError",

  tarotDAOCreateError: "tarotDAOCreateError",
  tarotDAOFindByIdError: "tarotDAOFindByIdError",
  tarotDAOFindByUserIdError: "tarotDAOFindByUserIdError",
  tarotDAOFindByAnswerError: "tarotDAOFindByAnswerError",
  tarotDAOFindManyBySpreadError: "tarotDAOFindManyBySpreadError",
  tarotDAOFindManyByUserIdError: "tarotDAOFindManyByUserIdError",
  tarotDAOFindManyByIdError: "tarotDAOFindManyByIdError",
  tarotDAOFindManyByLanguageError: "tarotDAOFindManyByLanguageError",
  tarotDAOFindAllError: "tarotDAOFindAllError",
  tarotDAOFindManyByEmailError: "tarotDAOFindManyByEmailError",
  tarotDAOFindManyByRoleError: "tarotDAOFindManyByRoleError",
  tarotDAODeleteByIdError: "tarotDAODeleteByIdError",
  tarotDAODeleteManyByIdError: "tarotDAODeleteManyByIdError",
  tarotDAODeleteManyByUserInfoError: "tarotDAODeleteManyByUserInfoError",
  tarotDAODeleteManyBySpreadError: "tarotDAODeleteManyBySpreadError",
  tarotDAODeleteAllError: "tarotDAODeleteAllError",

  tarotServiceCreateTarotError: "tarotServiceCreateTarotError",
  tarotServiceGetByIdError: "tarotServiceGetByIdError",
  tarotServiceGetManyBySpreadError: "tarotServiceGetManyBySpreadError",
  tarotServiceGetManyByUserInfoError: "tarotServiceGetManyByUserInfoError",
  tarotServiceGetManyByLanguageError: "tarotServiceGetManyByLanguageError",
  tarotServiceGetAllError: "tarotServiceGetAllError",
  tarotServiceGetTarotByIdError: "tarotServiceGetTarotByIdError",
  tarotServiceGetTarotsByIdError: "tarotServiceGetTarotsByIdError",
  tarotServiceGetTarotsByUserError: "tarotServiceGetTarotsByUserError",
  tarotServiceGetHistoryByUserIdError: "tarotServiceGetHistoryByUserIdError",
  tarotServiceGetTarotsBySpreadError: "tarotServiceGetTarotsBySpreadError",
  tarotServiceDeleteTarotByIdError: "tarotServiceDeleteTarotByIdError",
  tarotServiceDeleteTarotByAnswerError: "tarotServiceDeleteTarotByAnswerError",
  tarotServiceDeleteByIdError: "tarotServiceDeleteByIdError",
  tarotServiceDeleteManyByIdError: "tarotServiceDeleteManyByIdError",
  tarotServiceDeleteTarotsByUserIdError:
    "tarotServiceDeleteTarotsByUserIdError",
  tarotServiceDeleteTarotsByUserObjIdError:
    "tarotServiceDeleteTarotsByUserObjIdError",
  tarotServiceDeleteTarotsBySpreadError:
    "tarotServiceDeleteTarotsBySpreadError",
  tarotServiceDeleteAllError: "tarotServiceDeleteAllError",
  tarotControllerPostQuestionError: "tarotControllerPostQuestionError",
  tarotControllerGetHistoryError: "tarotControllerGetHistoryError",
  tarotControllerDeleteHistoryError: "tarotControllerDeleteHistoryError",

  // === Violation 관련 에러 추가 ===
  violationDAOCreateError: "violationDAOCreateError",
  violationDAOFindByObjIdError: "violationDAOFindByObjIdError",
  violationDAOFindByObjIdArrError: "violationDAOFindByObjIdArrError",
  violationDAOFindManyByUserObjIdError: "violationDAOFindManyByUserObjIdError",
  violationDAOFindByOrderIdError: "violationDAOFindByOrderIdError",
  violationDAODeleteByObjIdError: "violationDAODeleteByObjIdError",
  violationDAODeleteManyByUserObjIdError:
    "violationDAODeleteManyByUserObjIdError",
  violationDAODeleteAllError: "violationDAODeleteAllError",
  violationDAOUpdateByObjIdError: "violationDAOUpdateByObjIdError",
  violationDAOUpdateByUserObjIdError: "violationDAOUpdateByUserObjIdError",

  violationServiceCreateViolation: "violationServiceCreateViolation",
  violationServiceGetViolationByObjIdError:
    "violationServiceGetViolationByObjIdError",
  violationServiceGetViolationByOrderIdError:
    "violationServiceGetViolationByOrderIdError",
  violationServiceGetViolationsByUserObjIdError:
    "violationServiceGetViolationsByUserObjIdError",
  violationServiceDeleteViolationByObjIdError:
    "violationServiceDeleteViolationByObjIdError",
  violationServiceDeleteViolationByOrderIdError:
    "violationServiceDeleteViolationByOrderIdError",
  violationServiceDeleteViolationsByUserObjIdError:
    "violationServiceDeleteViolationsByUserObjIdError",
  violationServiceDeleteViolationsByObjIdArrError:
    "violationServiceDeleteViolationsByObjIdArrError",
  violationServicePutViolationByOrderIdError:
    "violationServicePutViolationByOrderIdError",
  violationServicePutViolationByUserObjIdError:
    "violationServicePutViolationByUserObjIdError",

  violationInfoNotFoundError: "Violation Info Not Found Error", // 404
  violationsInfoNotFoundError: "Violations Info Not Found Error", // 404
  violationPreInfoConflictError: "Violation Info already exists", // 409

  chargeDAOCreateError: "chargeDAOCreateError",
  chargeDAOFindByObjIdError: "chargeDAOFindByObjIdError",
  chargeDAOFindByObjIdArrError: "chargeDAOFindByObjIdArrError",
  chargeDAOFindByOrderIdError: "chargeDAOFindByOrderIdError",
  chargeDAOFindByUserObjIdError: "chargeDAOFindByUserObjIdError",
  chargeDAOFindManyByUserObjIdError: "chargeDAOFindManyByUserObjIdError",
  chargeDAOFindManyByCurrencyError: ".chargeDAOFindManyByCurrencyError",
  chargeDAODeleteByObjIdError: "chargeDAODeleteByObjIdError",
  chargeDAODeleteByOrderIdError: "chargeDAODeleteByOrderIdError",
  chargeDAODeleteManyByUserObjIdError: "chargeDAODeleteManyByUserObjIdError",
  chargeDAODeleteManyByUserObjIdAndPaymentKeyError:
    "chargeDAODeleteManyByUserObjIdAndPaymentKeyError",
  chargeDAODeleteManyByObjIdError: "chargeDAODeleteManyByObjIdError",
  chargeDAODeleteAllError: "chargeDAODeleteAllError",
  chargeDAOUpdateByObjIdError: "chargeDAOUpdateByObjIdError",
  chargeDAOUpdateByUserObjIdError: "chargeDAOUpdateByUserObjIdError",

  chargeDAOFindManyByProductIdError: "chargeDAOFindManyByProductIdError",
  chargeServiceCreateChargeForTossPrePayment:
    "chargeServiceCreateChargeForTossPrePayment",
  chargeServiceCreateChargeForAndroidGooglePlay:
    "chargeServiceCreateChargeForAndroidGooglePlay",
  chargeServiceGetChargesByProductIdError:
    "chargeServiceGetChargesByProductIdError",
  chargeServiceGetChargeByOrderIdError: "chargeServiceGetChargeByOrderIdError",
  chargeServiceGetChargeByObjIdError: "chargeServiceGetChargeByObjIdError",
  chargeServiceGetChargeByUserObjIdError:
    "chargeServiceGetChargeByUserObjIdError",
  chargeServiceGetChargesByUserObjIdError:
    "chargeServiceGetChargesByUserObjIdError",
  chargeServiceGetChargesByCurrencyError:
    "chargeServiceGetChargesByCurrencyError",
  chargeServiceDeleteChargeByOrderIdError:
    "chargeServiceDeleteChargeByOrderIdError",
  chargeServiceDeleteChargeByObjIdError:
    "chargeServiceDeleteChargeByObjIdError",
  chargeServiceDeleteChargesByObjIdArrError:
    "chargeServiceDeleteChargesByObjIdArrError",
  chargeServiceDeleteChargesByUserObjIdError:
    "chargeServiceDeleteChargesByUserObjIdError",
  chargeServiceDeleteChargesByUserObjIdAndPaymentKeyError:
    "chargeServiceDeleteChargesByUserObjIdAndPaymentKeyError",
  chargeServicePutChargeByOrderIdError: "chargeServicePutChargeByOrderIdError",
  chargeServicePutChargeByObjIdError: "chargeServicePutChargeByObjIdError",

  chargeControllerGetPrePaymentForTossError:
    "chargeControllerGetPrePaymentForTossError",
  chargeControllerPostChargeError: "chargeControllerPostChargeError",
  chargeControllerPostChargeForGooglePayError:
    "chargeControllerPostChargeForGooglePayError",
  chargeControllerPostPrePaymentForTossError:
    "chargeControllerPostPrePaymentForTossError",
  chargeControllerDeletePrePaymentForTossByOrderIdError:
    "chargeControllerDeletePrePaymentForTossByOrderIdError",
  chargeControllerDeletePrePaymentForTossByPaymentKeyError:
    "chargeControllerDeletePrePaymentForTossByPaymentKeyError",
  chargeControllerPutPrePaymentForTossError:
    "chargeControllerPutPrePaymentForTossError",

  chargePreInfoConflictError: "chargePreInfoConflictError",
  chargeInfoNotFoundError: "chargeInfoNotFoundError",
  chargesInfoNotFoundError: "chargesInfoNotFoundError",
};

module.exports = commonErrors;
