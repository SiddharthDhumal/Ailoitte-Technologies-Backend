import { sequelize } from "../db/database.js";
import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";
import CartItem from "../models/cartItemModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Product from "../models/productModel.js";

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Endpoints for shopping cart and order management.
 */
class OrderController {
	/**
	 * @swagger
	 * /api/v1/order/place:
	 *   post:
	 *     summary: Place an order
	 *     description: Converts cart items into an order by creating order items, reducing product stock, and clearing the cart. Only customers can place an order.
	 *     tags: [Order]
	 *     security:
	 *       - bearerAuth: []
	 *     responses:
	 *       201:
	 *         description: Order placed successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 status:
	 *                   type: string
	 *                   example: success
	 *                 data:
	 *                   $ref: '#/components/schemas/Order'
	 *       400:
	 *         description: Cart is empty or insufficient stock.
	 *       403:
	 *         description: Forbidden - Only customers can place orders.
	 *       500:
	 *         description: Order could not be placed due to a server error.
	 */
	// Place an order (convert cart items into an order)
	static placeOrder = catchAsync(async (req, res, next) => {
		const userId = req.user.id;
		const cartItems = await CartItem.findAll({ where: { userId } });
		if (!cartItems.length) return next(new AppError("Cart is empty", 400));

		const totalPrice = cartItems.reduce((total, item) => {
			return total + item.priceAtTime * item.quantity;
		}, 0);

		const transaction = await sequelize.transaction();

		const order = await Order.create(
			{ userId, totalPrice, status: "success" },
			{ transaction }
		);

		await Promise.all(
			cartItems.map(async (item) => {
				// Create order item
				await OrderItem.create(
					{
						orderId: order.id,
						productId: item.productId,
						quantity: item.quantity,
						priceAtTime: item.priceAtTime,
					},
					{ transaction }
				);

				const product = await Product.findByPk(item.productId, {
					transaction,
				});
				if (product) {
					if (product.stock > 0) {
						product.stock = product.stock - item.quantity;
						await product.save({ transaction });
					} else {
						return next(new AppError("No Stock Left", 400));
					}
				}
			})
		);

		await CartItem.destroy({ where: { userId }, transaction });

		await transaction.commit();

		res.status(201).json({
			status: "success",
			data: order,
		});

		if (res.error) {
			await transaction.rollback();
			return next(new AppError("Order could not be placed", 500));
		}
	});

	/**
	 * @swagger
	 * /api/v1/order/history:
	 *   get:
	 *     summary: Retrieve order history
	 *     description: Retrieves the order history for the authenticated customer, including order items and associated product details.
	 *     tags: [Order]
	 *     security:
	 *       - bearerAuth: []
	 *     responses:
	 *       200:
	 *         description: Order history retrieved successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 status:
	 *                   type: string
	 *                   example: success
	 *                 data:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       id:
	 *                         type: integer
	 *                         example: 1
	 *                       totalPrice:
	 *                         type: number
	 *                         example: 150.50
	 *                       status:
	 *                         type: string
	 *                         example: success
	 *                       createdAt:
	 *                         type: string
	 *                         format: date-time
	 *                         example: "2024-03-01T12:34:56Z"
	 *                       orderItems:
	 *                         type: array
	 *                         items:
	 *                           type: object
	 *                           properties:
	 *                             productId:
	 *                               type: integer
	 *                               example: 5
	 *                             quantity:
	 *                               type: integer
	 *                               example: 2
	 *                             priceAtTime:
	 *                               type: number
	 *                               example: 75.25
	 *                             product:
	 *                               type: object
	 *                               properties:
	 *                                 id:
	 *                                   type: integer
	 *                                   example: 5
	 *                                 name:
	 *                                   type: string
	 *                                   example: "Wireless Headphones"
	 *                                 imageUrl:
	 *                                   type: string
	 *                                   example: "https://example.com/product-image.jpg"
	 *       403:
	 *         description: Forbidden - Only customers can view order history.
	 *       500:
	 *         description: Could not retrieve order history due to a server error.
	 */
	// Get order history for the current user
	static orderHistory = catchAsync(async (req, res, next) => {
		const userId = req.user.id;
		const orders = await Order.findAll({
			where: { userId },
			include: [
				{
					model: OrderItem,
					as: "orderItems",
					include: [
						{
							model: Product,
							as: "product",
							attributes: ["id", "name", "imageUrl"],
						},
					],
				},
			],
			order: [["createdAt", "DESC"]],
		});

		res.status(200).json({
			status: "success",
			data: orders,
		});
	});
}

export default OrderController;
