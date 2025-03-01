import rateLimit from "express-rate-limit";

export const limit = rateLimit({
	windowMs: 1 * 60 * 1000,
	max: 10,
	message: "Too many requests, please try again later.",
});
