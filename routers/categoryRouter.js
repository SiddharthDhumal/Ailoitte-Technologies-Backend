import { Router } from "express";
import CategoryController from "../controllers/categoryController.js";
import {
	authorizeAdminRole,
	authenticateUser,
} from "../middlewares/authMiddleware.js";
const router = Router();

router.post(
	"/create",
	authenticateUser,
	authorizeAdminRole,
	CategoryController.createCategory
);
router.put(
	"/update/:id",
	authenticateUser,
	authorizeAdminRole,
	CategoryController.updateCategory
);
router.delete(
	"/delete/:id",
	authenticateUser,
	authorizeAdminRole,
	CategoryController.deleteCategory
);

router.get(
	"/list",
	authenticateUser,
	authorizeAdminRole,
	CategoryController.listOfCategories
);

export default router;
