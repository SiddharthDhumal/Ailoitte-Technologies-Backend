import { Router } from "express";
import CartController from "../controllers/cartController.js";

import {
	authenticateUser,
	authorizeCustomerRole,
} from "../middlewares/authMiddleware.js";
const router = Router();

router.post(
	"/add",
	authenticateUser,
	authorizeCustomerRole,
	CartController.addToCart
);
router.get(
	"/view",
	authenticateUser,
	authorizeCustomerRole,
	CartController.viewCart
);
router.delete(
	"/delete/:cartItemId",
	authenticateUser,
	authorizeCustomerRole,
	CartController.removeFromCart
);

export default router;
