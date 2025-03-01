import catchAsync from "../utils/catchAsync.js";
import Category from "./../models/categoryModel.js";

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Endpoints for category management
 */

/**
 * @swagger
 * /api/v1/categories/create:
 *   post:
 *     summary: Create a new category
 *     description: Only admins can create new categories.
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *               description:
 *                 type: string
 *                 example: "Category for electronic items"
 *     responses:
 *       201:
 *         description: Category created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request - Name is required.
 *       403:
 *         description: Forbidden - Only admins can create categories.
 */
class CategoryController {
	static createCategory = catchAsync(async (req, res, next) => {
		const { name, description } = req.body;
		if (!name) {
			return next(new AppError("Name is required", 400));
		}
		const category = await Category.create({ name, description });
		res.status(201).json({
			status: "success",
			data: category,
		});
	});

	/**
	 * @swagger
	 * /api/v1/categories/update/{id}:
	 *   put:
	 *     summary: Update an existing category
	 *     description: Only admins can update a category.
	 *     tags: [Category]
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         required: true
	 *         description: ID of the category to update.
	 *         schema:
	 *           type: integer
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               name:
	 *                 type: string
	 *                 example: "Updated Category Name"
	 *               description:
	 *                 type: string
	 *                 example: "Updated description for the category."
	 *     responses:
	 *       200:
	 *         description: Category updated successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 status:
	 *                   type: string
	 *                   example: "success"
	 *                 data:
	 *                   $ref: '#/components/schemas/Category'
	 *       400:
	 *         description: Invalid request body.
	 *       403:
	 *         description: Forbidden - Only admins can update categories.
	 *       404:
	 *         description: Category not found.
	 */
	static updateCategory = catchAsync(async (req, res, next) => {
		const { id } = req.params;
		const category = await Category.findByPk(id);
		if (!category) {
			return next(new AppError("Category not found", 404));
		}
		await category.update(req.body);
		res.status(200).json({
			status: "success",
			data: category,
		});
	});

	/**
	 * @swagger
	 * /api/v1/categories/delete/{id}:
	 *   delete:
	 *     summary: Delete a category
	 *     description: Only admins can delete a category.
	 *     tags: [Category]
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         required: true
	 *         description: ID of the category to delete.
	 *         schema:
	 *           type: integer
	 *     responses:
	 *       204:
	 *         description: Category deleted successfully.
	 *       400:
	 *         description: Invalid category ID.
	 *       403:
	 *         description: Forbidden - Only admins can delete categories.
	 *       404:
	 *         description: Category not found.
	 */
	static deleteCategory = catchAsync(async (req, res, next) => {
		const { id } = req.params;
		const category = await Category.findByPk(id);
		if (!category) {
			return next(new AppError("Category not found", 404));
		}
		await category.destroy();
		res.status(204).json({
			status: "success",
			data: null,
		});
	});

	/**
	 * @swagger
	 * /api/v1/categories/list:
	 *   get:
	 *     summary: Retrieve a list of categories
	 *     description: Only admins can view the category list.
	 *     tags: [Category]
	 *     security:
	 *       - bearerAuth: []
	 *     responses:
	 *       200:
	 *         description: A list of categories.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 status:
	 *                   type: string
	 *                   example: "success"
	 *                 data:
	 *                   type: array
	 *                   items:
	 *                     $ref: '#/components/schemas/Category'
	 *       403:
	 *         description: Forbidden - Only admins can access this resource.
	 */
	static listOfCategories = catchAsync(async (req, res, next) => {
		const categories = await Category.findAll();

		if (!categories) {
			return next(new AppError("Categories not found", 404));
		}
		res.status(200).json({
			status: "success",
			data: categories,
		});
	});
}

export default CategoryController;
