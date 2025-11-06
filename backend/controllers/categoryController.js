import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import { fn, col } from 'sequelize';

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: [
        'id',
        'name',
        [fn('COUNT', col('products.id')), 'productCount'],
      ],
      include: [
        {
          model: Product,
          as: 'products',
          attributes: [],
          required: false,
        },
      ],
      group: ['Category.id'],
      order: [['name', 'ASC']],
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export { getCategories };
