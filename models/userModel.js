import { DataTypes } from "sequelize";
import { sequelize } from "../db/database.js";
import bcrypt from "bcryptjs";

const User = sequelize.define(
	"User",
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
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true,
			},
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		role: {
			type: DataTypes.ENUM("admin", "customer"),
			defaultValue: "customer",
		},
	},
	{
		defaultScope: {
			attributes: { exclude: ["password"] },
		},
		scopes: {
			withPassword: {
				attributes: { include: ["id", "name", "email", "password", "role"] },
			},
		},
		hooks: {
			beforeCreate: async (user) => {
				const salt = await bcrypt.genSalt(10);
				user.password = await bcrypt.hash(user.password, salt);
			},
			beforeUpdate: async (user) => {
				if (user.changed("password")) {
					const salt = await bcrypt.genSalt(10);
					user.password = await bcrypt.hash(user.password, salt);
				}
			},
		},
	}
);

// Method to compare passwords during login
User.prototype.comparePassword = async function (enteredPassword) {
	return bcrypt.compare(enteredPassword, this.password);
};

export default User;
