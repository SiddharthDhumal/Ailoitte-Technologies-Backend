import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import "dotenv/config";

export const authenticateUser = catchAsync(async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	} else {
		return next(new AppError("UnAuthorized", 401));
	}

	if (!token) {
		return next(
			new AppError("You are not logged in! Please log in to get access.", 401)
		);
	}

	const decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);

	if (!decodedUser) {
		return next(new AppError("UnAuthorized", 400));
	}

	req.user = decodedUser;
	next();
});

export const authorizeAdminRole = (req, res, next) => {
	if (!req.user) {
		return next(new AppError("User not authenticated", 401));
	}

	if (req.user.role !== "admin") {
		return next(new AppError("Access denied: Admins only", 403));
	}

	next();
};

export const authorizeCustomerRole = (req, res, next) => {
	if (!req.user) {
		return next(new AppError("User not authenticated", 401));
	}

	if (req.user.role !== "customer") {
		return next(new AppError("Access denied: Admins only", 403));
	}

	next();
};
