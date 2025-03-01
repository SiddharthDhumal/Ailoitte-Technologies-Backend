import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";

const OrderItem = sequelize.define(
	"OrderItem",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		orderId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		productId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1,
		},
		priceAtTime: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
	},
	{
		timestamps: true,
	}
);

export default OrderItem;
