import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import AppError from "../utils/appError.js";
import { validationResult } from "express-validator";
import catchAsync from "../utils/catchAsync.js";

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and authentication endpoints
 */

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with name, email, password, and optional role.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user.
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: User's email address.
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 description: User's password.
 *                 example: password123
 *               role:
 *                 type: string
 *                 description: Role of the user.
 *                 enum: [admin, customer]
 *                 example: customer
 *     responses:
 *       201:
 *         description: User created successfully and returns a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                   description: JWT token.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 12345
 *                         name:
 *                           type: string
 *                           example: John Doe
 *                         email:
 *                           type: string
 *                           example: john@example.com
 *                         role:
 *                           type: string
 *                           example: customer
 *       400:
 *         description: Bad request or user already exists.
 */

class UserController {
	static signup = catchAsync(async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty())
			return res.status(400).json({ errors: errors.array() });

		const { name, email, password, role } = req.body;

		const existingUser = await User.findOne({ where: { email } });
		if (existingUser) return next(new AppError("User already exists", 400));

		const newUser = await User.create({ name, email, password, role });

		if (!process.env.JWT_SECRET_KEY || !process.env.JWT_EXPIRES_IN) {
			return next(new AppError("Missing JWT environment variables!", 400));
		}

		const token = jwt.sign(
			{ id: newUser.id, email: newUser.email, role: newUser.role },
			process.env.JWT_SECRET_KEY,
			{ expiresIn: process.env.JWT_EXPIRES_IN }
		);

		return res.status(201).json({
			status: "success",
			token,
			data: {
				user: {
					id: newUser.id,
					name: newUser.name,
					email: newUser.email,
					role: newUser.role,
				},
			},
		});
	});

	/**
	 * @swagger
	 * /api/v1/auth/login:
	 *   post:
	 *     summary: Authenticate an existing user
	 *     description: Login an existing user using email and password, and return a JWT token.
	 *     tags: [User]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - email
	 *               - password
	 *             properties:
	 *               email:
	 *                 type: string
	 *                 description: User's email address.
	 *                 example: john@example.com
	 *               password:
	 *                 type: string
	 *                 description: User's password.
	 *                 example: password123
	 *     responses:
	 *       200:
	 *         description: Login successful, returns JWT token and user details.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 status:
	 *                   type: string
	 *                   example: success
	 *                 token:
	 *                   type: string
	 *                   description: JWT token.
	 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
	 *                 data:
	 *                   type: object
	 *                   properties:
	 *                     user:
	 *                       type: object
	 *                       properties:
	 *                         id:
	 *                           type: string
	 *                           example: 12345
	 *                         name:
	 *                           type: string
	 *                           example: John Doe
	 *                         email:
	 *                           type: string
	 *                           example: john@example.com
	 *                         role:
	 *                           type: string
	 *                           example: customer
	 *       400:
	 *         description: Invalid credentials.
	 */

	static login = catchAsync(async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty())
			return res.status(400).json({ errors: errors.array() });

		const { email, password } = req.body;

		const user = await User.scope("withPassword").findOne({ where: { email } });

		if (!user) return next(new AppError("Invalid credentials", 400));

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) return next(new AppError("Invalid credentials", 400));

		if (!process.env.JWT_SECRET_KEY || !process.env.JWT_EXPIRES_IN) {
			return next(new AppError("Missing JWT environment variables!", 400));
		}

		const token = jwt.sign(
			{ id: user.id, email: user.email, role: user.role },
			process.env.JWT_SECRET_KEY,
			{ expiresIn: process.env.JWT_EXPIRES_IN }
		);
		res.cookie("jwt", token, {
			expires: new Date(
				Date.now() +
					parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
			),
			httpOnly: true,
		});

		res.status(200).json({
			status: "success",
			token,
			data: {
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
				},
			},
		});
	});
}

export default UserController;
