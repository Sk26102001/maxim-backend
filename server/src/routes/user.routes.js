import { Router } from "express"
import { changeMyPassword, changePassword, deleteUser, getAllUsers, getCurrentUser, getUserById, login, register, toggleUserStatus, updateUser } from "../controllers/user.controller.js"
import { accessController } from "../middlewares/accessController.middleware.js"

const userRouter = Router()

userRouter.route("/login").post(login)

userRouter.route("/current-user").post(accessController("super-admin", "admin", "staff"), getCurrentUser)

userRouter.use(accessController("super-admin", "admin", "staff"))
userRouter.route("/").post(register).get(getAllUsers)
userRouter.route("/:id").delete(deleteUser).get(getUserById).put(updateUser)
userRouter.patch("/change-password/:id", accessController("super-admin", "admin", "staff"), changePassword)
userRouter.patch("/change-my-password", accessController("super-admin", "admin", "staff"), changeMyPassword)

userRouter.patch("/:id/status", accessController("super-admin", "admin", "staff"), toggleUserStatus)


export default userRouter
