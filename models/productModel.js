import { DataTypes, Op } from "sequelize";
import { sequelize } from "../db/database.js";

const Product = sequelize.define(
	"Product",
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
		price: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
		stock: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		categoryId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "Categories",
				key: "id",
			},
		},
		imageUrl: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		timestamps: true,
		scopes: {
			filtered(filters) {
				let where = {};

				if (filters.minPrice || filters.maxPrice) {
					where.price = {};
					if (filters.minPrice) {
						where.price[Op.gte] = parseFloat(filters.minPrice);
					}
					if (filters.maxPrice) {
						where.price[Op.lte] = parseFloat(filters.maxPrice);
					}
				}

				if (filters.categoryId) {
					where.categoryId = filters.categoryId;
				}

				if (filters.search) {
					where.name = { [Op.iLike]: `%${filters.search}%` };
				}

				return { where };
			},
		},
	}
);

export default Product;
