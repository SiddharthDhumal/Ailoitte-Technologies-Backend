// tests/category.test.js
import request from "supertest";
import app from "../app.js";

let token;
let categoryId;

beforeAll(async () => {
	// Login as admin if required for category management
	const res = await request(app).post("/auth/login").send({
		email: "testadmin@example.com", // Ensure this user exists and has the correct role
		password: "adminpassword",
	});
	token = res.body.token;
});

describe("Category Management", () => {
	it("should create a new category", async () => {
		const res = await request(app)
			.post("/categories")
			.set("Authorization", `Bearer ${token}`)
			.send({
				name: "Test Category",
				description: "Category for testing",
			});
		expect(res.statusCode).toEqual(201);
		expect(res.body.data).toHaveProperty("id");
		categoryId = res.body.data.id;
	});

	it("should update the category", async () => {
		const res = await request(app)
			.put(`/categories/${categoryId}`)
			.set("Authorization", `Bearer ${token}`)
			.send({
				name: "Updated Category",
			});
		expect(res.statusCode).toEqual(200);
		expect(res.body.data.name).toEqual("Updated Category");
	});

	it("should list categories", async () => {
		const res = await request(app)
			.get("/categories")
			.set("Authorization", `Bearer ${token}`);
		expect(res.statusCode).toEqual(200);
		expect(Array.isArray(res.body.data)).toBe(true);
	});

	it("should delete the category", async () => {
		const res = await request(app)
			.delete(`/categories/${categoryId}`)
			.set("Authorization", `Bearer ${token}`);
		expect(res.statusCode).toEqual(204);
	});
});
