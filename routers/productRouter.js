import { Router } from "express";
import ProductController from "./../controllers/productController.js";
import {
	authorizeAdminRole,
	authenticateUser,
	authorizeCustomerRole,
} from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadImage.js";
const router = Router();

router.post(
	"/create",
	authenticateUser,
	authorizeAdminRole,
	upload.single("image"),
	ProductController.createProduct
);
router.put(
	"/update/:id",
	authenticateUser,
	authorizeAdminRole,
	upload.single("image"),
	ProductController.updateProduct
);
router.delete(
	"/delete/:id",
	authenticateUser,
	authorizeAdminRole,
	ProductController.deleteProduct
);

router.get(
	"/list/filters",
	authenticateUser,
	authorizeCustomerRole,
	ProductController.listOfProductsWithFilters
);

router.get(
	"/list",
	authenticateUser,
	authorizeAdminRole,
	ProductController.listOfProducts
);

router.put(
	"/uploadImage/:id",
	authenticateUser,
	authorizeAdminRole,
	upload.single("image"),
	ProductController.uploadProductImage
);

router.put(
	"/assign-category/:productId",
	authenticateUser,
	authorizeAdminRole,
	ProductController.assignProductCategory
);

export default router;
