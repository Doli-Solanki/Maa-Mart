import { Product, Category } from "../models/index.js";

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name']
      }]
    });
    
    // Transform products to match frontend expectations
    const transformedProducts = products.map(product => {
      const productData = product.toJSON();
      return {
        id: String(productData.id),
        name: productData.name,
        description: productData.description || '',
        price: productData.price,
        originalPrice: productData.originalPrice || null,
        image: productData.image || '',
        category: productData.category?.name || 'Uncategorized',
        categoryId: String(productData.categoryId || productData.category_id || ''),
        rating: productData.rating || 4.5, // Default rating
        reviews: productData.reviews || 0, // Default reviews
        inStock: (productData.stock || 0) > 0,
        stock: productData.stock || 0,
        featured: productData.featured || false,
        createdAt: productData.createdAt,
        updatedAt: productData.updatedAt
      };
    });
    
    res.json(transformedProducts);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name']
      }]
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Transform product to match frontend expectations
    const productData = product.toJSON();
    const transformedProduct = {
      id: String(productData.id),
      name: productData.name,
      description: productData.description || '',
      price: productData.price,
      originalPrice: productData.originalPrice || null,
      image: productData.image || '',
      category: productData.category?.name || 'Uncategorized',
      categoryId: String(productData.categoryId || productData.category_id || ''),
      rating: productData.rating || 4.5,
      reviews: productData.reviews || 0,
      inStock: (productData.stock || 0) > 0,
      stock: productData.stock || 0,
      featured: productData.featured || false,
      createdAt: productData.createdAt,
      updatedAt: productData.updatedAt
    };
    
    res.json(transformedProduct);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add new product
export const addProduct = async (req, res) => {
  try {
    const { name, description, categoryId, price, stock, image } = req.body || {};
    
    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    
    if (!price || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ message: 'Valid price is required' });
    }
    
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
      return res.status(400).json({ message: 'Stock must be a non-negative number' });
    }
    
    const newProduct = await Product.create({
      name: name.trim(),
      description: description?.trim() || null,
      categoryId: categoryId || null,
      price,
      stock: stock !== undefined ? stock : 0,
      image: image?.trim() || null,
    });
    
    const productWithCategory = await Product.findByPk(newProduct.id, {
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name']
      }]
    });
    
    // Transform product to match frontend expectations
    const productData = productWithCategory.toJSON();
    const transformedProduct = {
      id: String(productData.id),
      name: productData.name,
      description: productData.description || '',
      price: productData.price,
      originalPrice: productData.originalPrice || null,
      image: productData.image || '',
      category: productData.category?.name || 'Uncategorized',
      categoryId: String(productData.categoryId || productData.category_id || ''),
      rating: productData.rating || 4.5,
      reviews: productData.reviews || 0,
      inStock: (productData.stock || 0) > 0,
      stock: productData.stock || 0,
      featured: productData.featured || false,
      createdAt: productData.createdAt,
      updatedAt: productData.updatedAt
    };
    
    res.status(201).json(transformedProduct);
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, categoryId, price, stock, image } = req.body || {};
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Validation for provided fields
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({ message: 'Product name must be a non-empty string' });
    }
    
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }
    
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
      return res.status(400).json({ message: 'Stock must be a non-negative number' });
    }
    
    await product.update({
      name: name !== undefined ? name.trim() : product.name,
      description: description !== undefined ? (description?.trim() || null) : product.description,
      categoryId: categoryId !== undefined ? categoryId : product.categoryId,
      price: price !== undefined ? price : product.price,
      stock: stock !== undefined ? stock : product.stock,
      image: image !== undefined ? (image?.trim() || null) : product.image,
    });
    
    const updatedProduct = await Product.findByPk(product.id, {
      include: [{ 
        model: Category, 
        as: 'category',
        attributes: ['id', 'name']
      }]
    });
    
    // Transform product to match frontend expectations
    const productData = updatedProduct.toJSON();
    const transformedProduct = {
      id: String(productData.id),
      name: productData.name,
      description: productData.description || '',
      price: productData.price,
      originalPrice: productData.originalPrice || null,
      image: productData.image || '',
      category: productData.category?.name || 'Uncategorized',
      categoryId: String(productData.categoryId || productData.category_id || ''),
      rating: productData.rating || 4.5,
      reviews: productData.reviews || 0,
      inStock: (productData.stock || 0) > 0,
      stock: productData.stock || 0,
      featured: productData.featured || false,
      createdAt: productData.createdAt,
      updatedAt: productData.updatedAt
    };
    
    res.json(transformedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
