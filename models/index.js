import Product from "./productModel.js"; // your existing Product model
import CartItem from "./cartItemModel.js";
import Order from "./orderModel.js";
import OrderItem from "./orderItemModel.js";
import Category from "./categoryModel.js";
import User from "./userModel.js"; // your existing User model

// Cart associations
User.hasMany(CartItem, { foreignKey: "userId", as: "cartItems" });
CartItem.belongsTo(User, { foreignKey: "userId", as: "user" });
Product.hasMany(CartItem, { foreignKey: "productId", as: "cartItems" });
CartItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Order associations
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "orderItems" });
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });
Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

// In your associations (e.g., in models/index.js or in the Product model file)
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });

export { Product, Category, CartItem, Order, OrderItem, User };
