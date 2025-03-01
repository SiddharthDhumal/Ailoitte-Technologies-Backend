import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";

const Order = sequelize.define(
	"Order",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "Users",
				key: "id",
			},
		},
		totalPrice: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM("pending", "completed", "cancelled"),
			defaultValue: "pending",
		},
	},
	{
		timestamps: true,
	}
);

export default Order;
