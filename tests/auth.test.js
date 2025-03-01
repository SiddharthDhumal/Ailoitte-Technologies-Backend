// tests/auth.test.js
import request from "supertest";
import app from "../index.js";

describe("User Authentication", () => {
	let token;

	it("should sign up a new user", async () => {
		const res = await request(app).post("/api/v1/auth/signup").send({
			name: "Test User",
			email: "testuser@example.com",
			password: "password123",
			role: "customer",
		});
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty("token");
	});

	it("should log in an existing user", async () => {
		const res = await request(app).post("/api/v1/auth/login").send({
			email: "testuser@example.com",
			password: "password123",
		});
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty("token");
		token = res.body.token;
	});
});
