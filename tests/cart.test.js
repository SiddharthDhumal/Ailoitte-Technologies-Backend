// tests/cart.test.js
import request from "supertest";
import app from "../index.js"; // Your Express app
import { sequelize } from "../db/database.js"; // Sequelize instance

let token;
let productId;
let cartItemId;

describe("CartController Endpoints", () => {
	beforeAll(async () => {
		const resLogin = await request(app).post("/api/v1/auth/login").send({
			email: "testuser@example.com",
			password: "password123",
		});

		expect(resLogin.statusCode).toBe(200);
		token = resLogin.body.token;

		// Create a test product to add to the cart (ensure category 1 exists)
		const resProduct = await request(app)
			.post("/products")
			.set("Authorization", `Bearer ${token}`)
			.send({
				name: "Test Product",
				description: "This is a test product",
				price: 9.99,
				stock: 10,
				categoryId: 1,
				imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", // example base64 image string
			});
		expect(resProduct.statusCode).toBe(201);
		productId = resProduct.body.data.id;
	});

	afterAll(async () => {
		// Optionally, clean up test data or close database connection
		await sequelize.close();
	});

	it("should add a product to the cart", async () => {
		const res = await request(app)
			.post("/cart")
			.set("Authorization", `Bearer ${token}`)
			.send({
				productId,
				quantity: 2,
			});

		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty("data");
		expect(res.body.data).toHaveProperty("id");
		cartItemId = res.body.data.id;
	});

	it("should view the current user's cart", async () => {
		const res = await request(app)
			.get("/cart")
			.set("Authorization", `Bearer ${token}`);

		expect(res.statusCode).toBe(200);
		expect(Array.isArray(res.body.data)).toBe(true);
		// Optionally check that the cart includes the recently added item
		const cartItem = res.body.data.find((item) => item.id === cartItemId);
		expect(cartItem).toBeDefined();
	});

	it("should remove an item from the cart", async () => {
		const res = await request(app)
			.delete(`/cart/${cartItemId}`)
			.set("Authorization", `Bearer ${token}`);

		expect(res.statusCode).toBe(204);

		// Optionally verify the cart is now empty or the item is removed
		const resAfterDelete = await request(app)
			.get("/cart")
			.set("Authorization", `Bearer ${token}`);
		const removedItem = resAfterDelete.body.data.find(
			(item) => item.id === cartItemId
		);
		expect(removedItem).toBeUndefined();
	});
});
