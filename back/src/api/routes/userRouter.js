const userRouter = require("express").Router();
const { userController } = require("../../domains/user/controllers/index");
const checkTokenWithRefresh = require("../middlewares/checkTokenWithRefresh");

const USER_PATHS = {
  userinfo: process.env.USER_USERINFO_PATH,
  userinfoChange: process.env.USER_USERINFO_CHANGE_PATH,
  userinfoWithdraw: process.env.USER_USERINFO_WITHDRAW_PATH,
};

userRouter.get(
  USER_PATHS.userinfo,
  checkTokenWithRefresh,
  userController.getUserById
);

userRouter.delete(
  USER_PATHS.userinfoWithdraw,
  checkTokenWithRefresh,
  userController.deleteUser
);

userRouter.put(
  USER_PATHS.userinfoChange,
  checkTokenWithRefresh,
  userController.putUser
);

module.exports = userRouter;
