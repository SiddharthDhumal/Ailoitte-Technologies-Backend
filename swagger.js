// swagger.js
import swaggerJSDoc from "swagger-jsdoc";

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "My API",
			version: "1.0.0",
			description: `API documentation for:
        - User authentication
        - Product management
        - Category management
        - Product listing with filters
        - Shopping cart & order management
        - Image upload functionality`,
		},
		servers: [
			{
				url: "http://localhost:8000",
			},
		],
		components: {
			securitySchemes: {
				BearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
	},
	apis: ["./routers/*.js", "./controllers/*.js", "./models/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
