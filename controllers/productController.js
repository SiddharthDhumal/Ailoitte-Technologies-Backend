import Product from "../models/productModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import cloudinary from "../configs/cloudinary.js";
import Category from "./../models/categoryModel.js";

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Endpoints for product management, filtering, and image uploads.
 */

class ProductController {
	/**
	 * @swagger
	 * /api/v1/products/create:
	 *   post:
	 *     summary: Create a new product (Admin Only)
	 *     description: This endpoint allows admin users to create a new product.
	 *     tags: [Product]
	 *     security:
	 *       - BearerAuth: []  # Requires Bearer Token (JWT)
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - name
	 *               - price
	 *               - stock
	 *               - categoryId
	 *             properties:
	 *               name:
	 *                 type: string
	 *                 example: "Awesome Product"
	 *               description:
	 *                 type: string
	 *                 example: "This is an awesome product."
	 *               price:
	 *                 type: number
	 *                 example: 49.99
	 *               stock:
	 *                 type: integer
	 *                 example: 100
	 *               categoryId:
	 *                 type: integer
	 *                 example: 1
	 *               imageUrl:
	 *                 type: string
	 *                 description: Base64 encoded image string. Optional if file upload is used.
	 *     responses:
	 *       201:
	 *         description: Product created successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 status:
	 *                   type: string
	 *                   example: "success"
	 *                 data:
	 *                   type: object
	 *                   properties:
	 *                     id:
	 *                       type: integer
	 *                       example: 1
	 *                     name:
	 *                       type: string
	 *                       example: "Awesome Product"
	 *                     description:
	 *                       type: string
	 *                       example: "This is an awesome product."
	 *                     price:
	 *                       type: number
	 *                       example: 49.99
	 *                     stock:
	 *                       type: integer
	 *                       example: 100
	 *                     categoryId:
	 *                       type: integer
	 *                       example: 1
	 *                     imageUrl:
	 *                       type: string
	 *                       example: "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/products/abc123.jpg"
	 *       400:
	 *         description: Missing required fields or invalid image format.
	 *       401:
	 *         description: Unauthorized - User must be logged in.
	 *       403:
	 *         description: Forbidden - User must have admin privileges.
	 */
	static createProduct = catchAsync(async (req, res, next) => {
		const { name, description, price, stock, categoryId, imageUrl } = req.body;
		if (!name || !price || !stock || !categoryId) {
			return next(new AppError("Missing required fields", 400));
		}

		const category = await Category.findByPk(categoryId);
		if (!category) {
			return next(new AppError("Category does not exist", 404));
		}

		let image = null;

		// Check if image is provided in base64 format
		if (imageUrl) {
			if (!imageUrl.startsWith("data:")) {
				return next(new AppError("Invalid image format", 400));
			}

			// Upload the base64 image to Cloudinary
			const result = await cloudinary.uploader.upload(imageUrl, {
				folder: "products",
			});

			image = result.secure_url;
		}

		const product = await Product.create({
			name,
			description,
			price,
			stock,
			categoryId,
			imageUrl: image,
		});

		return res.status(201).json({
			status: "success",
			data: product,
		});
	});

	/**
	 * @swagger
	 * /api/v1/products/update/{id}:
	 *   put:
	 *     summary: Update an existing product (Admin Only)
	 *     description: Updates a product's details. Requires authentication and admin privileges.
	 *     tags: [Product]
	 *     security:
	 *       - BearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         schema:
	 *           type: integer
	 *         required: true
	 *         description: The product ID.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               name:
	 *                 type: string
	 *                 example: "Updated Product Name"
	 *               description:
	 *                 type: string
	 *                 example: "Updated description."
	 *               price:
	 *                 type: number
	 *                 example: 59.99
	 *               stock:
	 *                 type: integer
	 *                 example: 80
	 *               categoryId:
	 *                 type: integer
	 *                 example: 2
	 *               imageUrl:
	 *                 type: string
	 *                 description: Either a base64-encoded image or will be replaced by file upload.
	 *     responses:
	 *       200:
	 *         description: Product updated successfully.
	 *       400:
	 *         description: Invalid input or missing required fields.
	 *       404:
	 *         description: Product or category not found.
	 *       401:
	 *         description: Unauthorized - User must be logged in.
	 *       403:
	 *         description: Forbidden - User must have admin privileges.
	 */
	static updateProduct = catchAsync(async (req, res, next) => {
		const { id } = req.params;
		const product = await Product.findByPk(id);

		const { categoryId, ...updateFields } = req.body;

		if (categoryId) {
			const category = await Category.findByPk(categoryId);
			if (!category) {
				return next(new AppError("Category does not exist", 404));
			}
			updateFields.categoryId = categoryId;
		}

		if (!product) {
			return next(new AppError("Product not found", 404));
		}

		if (req.body.imageUrl) {
			if (!req.body.imageUrl.startsWith("data:")) {
				return next(new AppError("Invalid image format", 400));
			}

			// Upload the base64 image string to Cloudinary
			const result = await cloudinary.uploader.upload(req.body.imageUrl, {
				folder: "products",
			});
			updateFields.imageUrl = result.secure_url;
		}

		const updatedProduct = await product.update(updateFields);

		return res.status(200).json({
			status: "success",
			data: updatedProduct,
		});
	});

	/**
	 * @swagger
	 * /api/v1/products/delete/{id}:
	 *   delete:
	 *     summary: Delete a product (Admin Only)
	 *     description: Deletes a product by its ID. Requires authentication and admin privileges.
	 *     tags: [Product]
	 *     security:
	 *       - BearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         schema:
	 *           type: integer
	 *         required: true
	 *         description: The unique ID of the product to delete.
	 *     responses:
	 *       204:
	 *         description: Product deleted successfully.
	 *       404:
	 *         description: Product not found.
	 *       401:
	 *         description: Unauthorized - User must be logged in.
	 *       403:
	 *         description: Forbidden - User must have admin privileges.
	 */
	static deleteProduct = catchAsync(async (req, res, next) => {
		const { id } = req.params;
		const product = await Product.findByPk(id);
		if (!product) {
			return next(new AppError("Product not found", 404));
		}
		await product.destroy();
		res.status(204).json({
			status: "success",
			data: null,
		});
	});

	/**
	 * @swagger
	 * /api/v1/products/list:
	 *   get:
	 *     summary: Retrieve a list of products
	 *     tags: [Product]
	 *     responses:
	 *       200:
	 *         description: A list of products.
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
	 *                     $ref: '#/components/schemas/Product'
	 */
	static listOfProducts = catchAsync(async (req, res, next) => {
		const productsList = await Product.findAll({
			include: [
				{
					model: Category,
					as: "category",
					attributes: ["id", "name"],
				},
			],
		});
		return res.status(200).json({
			status: "success",
			data: productsList,
		});
	});

	/**
	 * @swagger
	 * /api/v1/products/list/filters:
	 *   get:
	 *     summary: Retrieve a filtered list of products with pagination
	 *     description: Allows customers to filter products based on price, category, and search queries, with pagination support.
	 *     tags: [Product]
	 *     security:
	 *       - BearerAuth: []  # Ensures only authenticated customers can access
	 *     parameters:
	 *       - in: query
	 *         name: minPrice
	 *         schema:
	 *           type: number
	 *         description: Minimum price for filtering.
	 *       - in: query
	 *         name: maxPrice
	 *         schema:
	 *           type: number
	 *         description: Maximum price for filtering.
	 *       - in: query
	 *         name: categoryId
	 *         schema:
	 *           type: integer
	 *         description: Category ID for filtering.
	 *       - in: query
	 *         name: search
	 *         schema:
	 *           type: string
	 *         description: Search term for product name.
	 *       - in: query
	 *         name: page
	 *         schema:
	 *           type: integer
	 *           default: 1
	 *         description: Page number for pagination.
	 *       - in: query
	 *         name: limit
	 *         schema:
	 *           type: integer
	 *           default: 10
	 *         description: Number of products per page.
	 *     responses:
	 *       200:
	 *         description: Filtered list of products retrieved successfully.
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
	 *                     $ref: '#/components/schemas/Product'
	 *       401:
	 *         description: Unauthorized. Only customers can access this endpoint.
	 *       400:
	 *         description: Invalid query parameters.
	 */
	static listOfProductsWithFilters = catchAsync(async (req, res, next) => {
		const {
			minPrice,
			maxPrice,
			categoryId,
			search,
			page = 1,
			limit = 10,
		} = req.query;
		const offset = (page - 1) * limit;

		const products = await Product.scope({
			method: ["filtered", { minPrice, maxPrice, categoryId, search }],
		}).findAll({
			// where,
			offset,
			limit: parseInt(limit),
			include: [
				{
					model: Category,
					as: "category",
					attributes: ["id", "name"],
				},
			],
		});

		res.status(200).json({
			status: "success",
			data: products,
		});
	});

	/**
	 * @swagger
	 * /api/v1/products/uploadImage/{id}:
	 *   put:
	 *     summary: Update product image
	 *     tags: [Product]
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         schema:
	 *           type: integer
	 *         required: true
	 *         description: The product ID.
	 *     requestBody:
	 *       description: Image data either as multipart/form-data or a base64 encoded string in JSON.
	 *       required: true
	 *       content:
	 *         multipart/form-data:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               imageUrl:
	 *                 type: string
	 *                 format: binary
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               imageUrl:
	 *                 type: string
	 *                 description: Base64 encoded image string.
	 *                 example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
	 *     responses:
	 *       200:
	 *         description: Image updated successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 message:
	 *                   type: string
	 *                   example: "Image updated successfully"
	 *                 product:
	 *                   $ref: '#/components/schemas/Product'
	 */
	static uploadProductImage = catchAsync(async (req, res, next) => {
		const { id } = req.params;
		const product = await Product.findByPk(id);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		let image = req.body.imageUrl;

		if (product.imageUrl) {
			const oldImageUrl = product.imageUrl;

			const publicId = oldImageUrl.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(`products/${publicId}`);
		}

		if (image) {
			if (!image.startsWith("data:")) {
				return next(new AppError("Invalid image format", 400));
			}
			const result = await cloudinary.uploader.upload(image, {
				folder: "products",
			});
			product.imageUrl = result.secure_url;
		}

		// Save the updated product without overwriting imageUrl
		await product.save();

		return res.json({ message: "Image updated successfully", product });
	});

	/**
	 * @swagger
         /api/v1/products/assign-category/{productId}:
	 *   put:
	 *     summary: Assign a category to a product
	 *     tags: [Product]
	 *     parameters:
	 *       - in: path
	 *         name: productId
	 *         schema:
	 *           type: integer
	 *         required: true
	 *         description: The product ID.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - categoryId
	 *             properties:
	 *               categoryId:
	 *                 type: integer
	 *                 example: 2
	 *     responses:
	 *       200:
	 *         description: Category assigned successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 status:
	 *                   type: string
	 *                   example: "success"
	 *                 data:
	 *                   $ref: '#/components/schemas/Product'
	 *       404:
	 *         description: Product or Category not found.
	 */
	static assignProductCategory = catchAsync(async (req, res, next) => {
		const { productId } = req.params;

		const { categoryId } = req.body;

		const product = await Product.findByPk(productId);
		if (!product) return next(new AppError("Product not found", 404));

		const category = await Category.findByPk(categoryId);
		if (!category) return next(new AppError("Category not found", 404));

		product.categoryId = categoryId;
		await product.save();

		res.status(200).json({
			status: "success",
			data: product,
		});
	});
}

export default ProductController;
