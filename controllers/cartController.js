import Product from "../models/productModel.js";
import CartItem from "../models/cartItemModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Endpoints for shopping cart management
 */
class CartController {
	/**
	 * @swagger
	 * /api/v1/cart/add:
	 *   post:
	 *     summary: Add a product to the cart
	 *     description: Only customers can add products to their shopping cart while capturing the product price at the time of adding.
	 *     tags: [Cart]
	 *     security:
	 *       - bearerAuth: []
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - productId
	 *               - quantity
	 *             properties:
	 *               productId:
	 *                 type: integer
	 *                 description: The ID of the product to add.
	 *                 example: 1
	 *               quantity:
	 *                 type: integer
	 *                 description: The quantity of the product to add.
	 *                 example: 2
	 *     responses:
	 *       201:
	 *         description: Product added to cart successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 status:
	 *                   type: string
	 *                   example: success
	 *                 data:
	 *                   $ref: '#/components/schemas/CartItem'
	 *       400:
	 *         description: Bad request.
	 *       403:
	 *         description: Forbidden - Only customers can add products to the cart.
	 *       404:
	 *         description: Product not found or no stock available.
	 */
	// Add a product to the cart
	static addToCart = catchAsync(async (req, res, next) => {
		const { productId, quantity } = req.body;
		const userId = req.user.id;

		const product = await Product.findByPk(productId);
		if (!product) return next(new AppError("Product not found", 404));

		const priceAtTime = product.price;

		if (product.stock <= 0) return next(new AppError("No Stock is left", 404));

		let cartItem = await CartItem.findOne({ where: { userId, productId } });
		if (cartItem) {
			cartItem.quantity += quantity;
			await cartItem.save();
		} else {
			cartItem = await CartItem.create({
				userId,
				productId,
				quantity,
				priceAtTime,
			});
		}

		res.status(201).json({
			status: "success",
			data: cartItem,
		});
	});

	/**
	 * @swagger
	 * /api/v1/cart/view:
	 *   get:
	 *     summary: Retrieve the current user's cart
	 *     description: Only customers can view their cart, which includes cart items along with product details.
	 *     tags: [Cart]
	 *     security:
	 *       - bearerAuth: []
	 *     responses:
	 *       200:
	 *         description: Successfully retrieved cart items.
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
	 *                     $ref: '#/components/schemas/CartItem'
	 *       403:
	 *         description: Forbidden - Only customers can view their cart.
	 *       404:
	 *         description: Cart is empty or not found.
	 */
	// View the current user's cart
	static viewCart = catchAsync(async (req, res, next) => {
		const userId = req.user.id;
		const cartItems = await CartItem.findAll({
			where: { userId },
			include: [
				{
					model: Product,
					as: "product",
					attributes: ["id", "name", "price", "imageUrl"],
				},
			],
		});
		res.status(200).json({
			status: "success",
			data: cartItems,
		});
	});

	/**
	 * @swagger
	 * /api/v1/cart/delete/{cartItemId}:
	 *   delete:
	 *     summary: Remove an item from the cart
	 *     description: Only customers can remove items from their shopping cart using the cart item ID.
	 *     tags: [Cart]
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: cartItemId
	 *         required: true
	 *         schema:
	 *           type: integer
	 *         description: The ID of the cart item to remove.
	 *     responses:
	 *       204:
	 *         description: Cart item removed successfully.
	 *       403:
	 *         description: Forbidden - Only customers can remove items from the cart.
	 *       404:
	 *         description: Cart item not found.
	 */
	// Remove an item from the cart
	static removeFromCart = catchAsync(async (req, res, next) => {
		const userId = req.user.id;
		const { cartItemId } = req.params;
		const cartItem = await CartItem.findOne({
			where: { id: cartItemId, userId },
		});
		if (!cartItem) return next(new AppError("Cart item not found", 404));

		await cartItem.destroy();
		res.status(204).json({
			status: "success",
			data: null,
		});
	});
}

export default CartController;
