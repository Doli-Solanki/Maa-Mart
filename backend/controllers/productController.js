import Product from "../models/productModel.js";

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new product
export const addProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, image } = req.body;
    const newProduct = await Product.create({
      name,
      description,
      category,
      price,
      stock,
      image,
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
