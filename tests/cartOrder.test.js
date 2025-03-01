// tests/cartOrder.test.js
import request from "supertest";
import app from "../app.js";

let token;
let productId;
let orderId;

beforeAll(async () => {
	// Login as a regular user
	const res = await request(app).post("/auth/login").send({
		email: "testuser@example.com",
		password: "password123",
	});
	token = res.body.token;

	// Create a product for cart testing (ensure category exists)
	const productRes = await request(app)
		.post("/products")
		.set("Authorization", `Bearer ${token}`)
		.send({
			name: "Cart Test Product",
			description: "Product for cart testing",
			price: 15.99,
			stock: 50,
			categoryId: 1,
			imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
		});
	productId = productRes.body.data.id;
});

describe("Shopping Cart & Order Processing", () => {
	it("should add a product to the cart", async () => {
		const res = await request(app)
			.post("/cart")
			.set("Authorization", `Bearer ${token}`)
			.send({
				productId,
				quantity: 2,
			});
		expect(res.statusCode).toEqual(201);
		expect(res.body.data).toHaveProperty("id");
	});

	it("should view the cart", async () => {
		const res = await request(app)
			.get("/cart")
			.set("Authorization", `Bearer ${token}`);
		expect(res.statusCode).toEqual(200);
		expect(Array.isArray(res.body.data)).toBe(true);
	});

	it("should place an order", async () => {
		const res = await request(app)
			.post("/orders")
			.set("Authorization", `Bearer ${token}`);
		expect(res.statusCode).toEqual(201);
		expect(res.body.data).toHaveProperty("id");
		orderId = res.body.data.id;
	});

	it("should retrieve order history", async () => {
		const res = await request(app)
			.get("/orders")
			.set("Authorization", `Bearer ${token}`);
		expect(res.statusCode).toEqual(200);
		expect(Array.isArray(res.body.data)).toBe(true);
	});
});
