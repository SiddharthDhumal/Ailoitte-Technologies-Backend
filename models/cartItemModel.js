import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";

const CartItem = sequelize.define(
	"CartItem",
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
		productId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "Products",
				key: "id",
			},
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

export default CartItem;
