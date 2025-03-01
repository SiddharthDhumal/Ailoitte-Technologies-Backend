import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routers/userRouter.js";
import productRouter from "./routers/productRouter.js";
import categoryRouter from "./routers/categoryRouter.js";
import cartRouter from "./routers/cartRouter.js";
import orderRouter from "./routers/orderRouter.js";
import { globalErrorHandler } from "./controllers/errorController.js";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { xss } from "express-xss-sanitizer";
import { limit } from "./configs/rateLimit.js";
import compression from "compression";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

const app = express();

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
app.options("*", cors());

// 2) Set security HTTP headers
app.use(helmet());

// Limit requests from same API
app.use("/api/v1", limit);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Implement Compression
app.use(compression());

//Routes
app.use("/api/v1", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/order", orderRouter);

// Serve Swagger docs at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.all("*", (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
