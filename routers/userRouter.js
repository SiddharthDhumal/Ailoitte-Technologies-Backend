import { Router } from "express";
import UserController from "../controllers/userController.js";
import {
	validateSignupUser,
	validateLoginUser,
} from "../middlewares/userValidation.js";
const router = Router();

router.post("/auth/signup", validateSignupUser, UserController.signup);

router.post("/auth/login", validateLoginUser, UserController.login);

export default router;
