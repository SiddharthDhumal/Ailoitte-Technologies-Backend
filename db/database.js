import { Sequelize } from "sequelize";
import "dotenv/config";

const DATABASE_NAME = process.env.DB_NAME;
const USERNAME = process.env.DB_USERNAME;
const PASSWORD = process.env.DB_PASSWORD;
const HOST = process.env.DB_HOST;

export const sequelize = new Sequelize(DATABASE_NAME, USERNAME, PASSWORD, {
	host: HOST,
	dialect: "postgres",
	logging: false,
});

export const testConnection = async () => {
	try {
		await sequelize.authenticate();
		await sequelize.sync({ alter: true });
		console.log("✅ Database connected!");
	} catch (error) {
		console.error("❌ Database connection failed:", error);
	}
};
