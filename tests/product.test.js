import request from "supertest";
import app from "../app.js"; // Your Express app
import { Product } from "../models/product.model.js";
import { Category } from "../models/categoryModel.js";
import cloudinary from "cloudinary";
import sequelizeMock from "sequelize-mock";

// Mock Sequelize instance
const dbMock = new sequelizeMock();

// Mock dependencies
jest.mock("../models/productModel.js");
jest.mock("../models/categoryModel.js");
jest.mock("cloudinary");

describe("Product API Tests", () => {
	beforeEach(() => {
		jest.clearAllMocks(); // Reset mocks before each test
	});

	// ✅ Test Product Creation
	describe("POST /products", () => {
		it("should create a new product", async () => {
			const mockProduct = {
				id: 1,
				name: "Test Product",
				description: "This is a test product",
				price: 100,
				categoryId: 1,
				imageUrl: "https://cloudinary.com/sample.jpg",
			};

			Product.create.mockResolvedValue(mockProduct);

			const response = await request(app).post("/api/products").send({
				name: "Test Product",
				description: "This is a test product",
				price: 100,
				categoryId: 1,
				imageUrl: "https://cloudinary.com/sample.jpg",
			});

			expect(response.status).toBe(201);
			expect(response.body.status).toBe("success");
			expect(response.body.product.name).toBe("Test Product");
		});

		it("should return 400 if product data is invalid", async () => {
			const response = await request(app).post("/api/products").send({
				name: "",
				price: -10,
			});

			expect(response.status).toBe(400);
			expect(response.body.message).toMatch(/validation error/i);
		});
	});

	// ✅ Test Fetching Products
	describe("GET /products", () => {
		it("should return a list of products", async () => {
			const mockProducts = [
				{ id: 1, name: "Product A", price: 50 },
				{ id: 2, name: "Product B", price: 75 },
			];

			Product.findAll.mockResolvedValue(mockProducts);

			const response = await request(app).get("/api/products");

			expect(response.status).toBe(200);
			expect(response.body.length).toBe(2);
		});

		it("should return an empty array if no products exist", async () => {
			Product.findAll.mockResolvedValue([]);

			const response = await request(app).get("/api/products");

			expect(response.status).toBe(200);
			expect(response.body.length).toBe(0);
		});
	});

	// ✅ Test Updating a Product
	describe("PUT /products/:id", () => {
		it("should update an existing product", async () => {
			const mockProduct = {
				id: 1,
				name: "Updated Product",
				description: "Updated description",
				price: 150,
			};

			Product.findByPk.mockResolvedValue(mockProduct);
			Product.update.mockResolvedValue([1]);

			const response = await request(app).put("/api/products/1").send({
				name: "Updated Product",
				price: 150,
			});

			expect(response.status).toBe(200);
			expect(response.body.message).toMatch(/updated successfully/i);
		});

		it("should return 404 if product does not exist", async () => {
			Product.findByPk.mockResolvedValue(null);

			const response = await request(app).put("/api/products/999").send({
				name: "New Name",
			});

			expect(response.status).toBe(404);
			expect(response.body.message).toMatch(/not found/i);
		});
	});

	// ✅ Test Deleting a Product
	describe("DELETE /products/:id", () => {
		it("should delete a product", async () => {
			const mockProduct = { id: 1, name: "Test Product" };
			Product.findByPk.mockResolvedValue(mockProduct);
			Product.destroy.mockResolvedValue(1);

			const response = await request(app).delete("/api/products/1");

			expect(response.status).toBe(200);
			expect(response.body.message).toMatch(/deleted successfully/i);
		});

		it("should return 404 if product does not exist", async () => {
			Product.findByPk.mockResolvedValue(null);

			const response = await request(app).delete("/api/products/999");

			expect(response.status).toBe(404);
			expect(response.body.message).toMatch(/not found/i);
		});
	});

	// ✅ Test Image Upload
	describe("POST /products/:id/image", () => {
		it("should upload an image and update product", async () => {
			const mockProduct = { id: 1, name: "Product A", imageUrl: "" };

			Product.findByPk.mockResolvedValue(mockProduct);
			cloudinary.uploader.upload.mockResolvedValue({
				secure_url: "https://cloudinary.com/new-image.jpg",
			});

			const response = await request(app)
				.post("/api/products/1/image")
				.send({ imageUrl: "data:image/png;base64,somebase64string" });

			expect(response.status).toBe(200);
			expect(response.body.product.imageUrl).toBe(
				"https://cloudinary.com/new-image.jpg"
			);
		});

		it("should return 400 for invalid image format", async () => {
			const response = await request(app)
				.post("/api/products/1/image")
				.send({ imageUrl: "invalid-image" });

			expect(response.status).toBe(400);
			expect(response.body.message).toMatch(/invalid image format/i);
		});
	});
});
