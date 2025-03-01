import { body } from "express-validator";

const validateSignupUser = [
	body("name")
		.notEmpty()
		.withMessage("Name is required")
		.isLength({ min: 3 })
		.withMessage("Name must be at least 3 characters long"),

	body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),

	body("password")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long"),

	body("role")
		.optional()
		.isIn(["admin", "customer"])
		.withMessage("Role must be either 'Admin' or 'Customer'"),
];

const validateLoginUser = [
	body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
	body("password").notEmpty().withMessage("Password is required"),
];

export { validateSignupUser, validateLoginUser };
