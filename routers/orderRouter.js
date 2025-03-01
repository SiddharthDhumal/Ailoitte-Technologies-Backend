import express from "express";
import OrderController from "../controllers/orderController.js";
import {
	authenticateUser,
	authorizeCustomerRole,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
	"/place",
	authenticateUser,
	authorizeCustomerRole,
	OrderController.placeOrder
);
router.get(
	"/history",
	authenticateUser,
	authorizeCustomerRole,
	OrderController.orderHistory
);

export default router;
