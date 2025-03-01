import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";
import Product from "./productModel.js";

const Category = sequelize.define(
	"Category",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
	},
	{
		timestamps: true,
	}
);

export default Category;
