import { Product, Category } from "../models/index.js";
import { getImageUrl, deleteImageFile } from "../middleware/uploadMiddleware.js";

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
        image: getImageUrl(productData.image) || '',
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
      image: getImageUrl(productData.image) || '',
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
    console.log('Add product request body:', req.body);
    console.log('Add product request file:', req.file);
    
    // FormData sends all fields as strings, so we need to parse them
    const { name, description, categoryId, price, stock, image } = req.body || {};
    
    // Input validation
    if (!name || (typeof name !== 'string' && typeof name !== 'object') || String(name).trim().length === 0) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    
    const nameStr = String(name).trim();
    const priceNum = price ? parseFloat(price) : null;
    const stockNum = stock !== undefined && stock !== null && stock !== '' ? parseInt(stock) : 0;
    
    if (!priceNum || isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ message: 'Valid price is required' });
    }
    
    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ message: 'Stock must be a valid non-negative number' });
    }
    
    // Handle image: prioritize uploaded file, then URL from body
    let imagePath = null;
    if (req.file) {
      // File was uploaded, use the filename
      imagePath = req.file.filename;
    } else if (image && typeof image === 'string' && image.trim()) {
      // URL was provided
      imagePath = image.trim();
    }
    
    const newProduct = await Product.create({
      name: nameStr,
      description: description ? String(description).trim() : null,
      categoryId: categoryId && categoryId !== '' && categoryId !== 'none' ? parseInt(categoryId) : null,
      price: priceNum,
      stock: stockNum,
      image: imagePath,
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
      image: getImageUrl(productData.image) || '',
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
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    console.log('Update product request body:', req.body);
    console.log('Update product request file:', req.file);
    
    const { name, description, categoryId, price, stock, image } = req.body || {};
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Validation for provided fields (FormData sends strings)
    if (name !== undefined && (typeof name !== 'string' && typeof name !== 'object') || String(name).trim().length === 0) {
      return res.status(400).json({ message: 'Product name must be a non-empty string' });
    }
    
    const priceNum = price !== undefined && price !== null && price !== '' ? parseFloat(price) : null;
    if (price !== undefined && price !== null && price !== '' && (isNaN(priceNum) || priceNum <= 0)) {
      return res.status(400).json({ message: 'Price must be a valid positive number' });
    }
    
    const stockNum = stock !== undefined && stock !== null && stock !== '' ? parseInt(stock) : null;
    if (stock !== undefined && stock !== null && stock !== '' && (isNaN(stockNum) || stockNum < 0)) {
      return res.status(400).json({ message: 'Stock must be a valid non-negative number' });
    }
    
    // Handle image update: prioritize uploaded file, then URL from body, or keep existing
    let imagePath = product.image;
    if (req.file) {
      // New file uploaded - delete old image if it exists and is a local file
      if (product.image) {
        deleteImageFile(product.image);
      }
      imagePath = req.file.filename;
    } else if (image !== undefined) {
      // Image URL provided or cleared
      if (image && typeof image === 'string' && image.trim()) {
        // If it's a new URL and old image was local, delete old file
        if (product.image && !product.image.startsWith('http')) {
          deleteImageFile(product.image);
        }
        imagePath = image.trim();
      } else {
        // Image cleared - delete old file if it exists
        if (product.image) {
          deleteImageFile(product.image);
        }
        imagePath = null;
      }
    }
    
    await product.update({
      name: name !== undefined ? String(name).trim() : product.name,
      description: description !== undefined ? (description ? String(description).trim() : null) : product.description,
      categoryId: categoryId !== undefined ? (categoryId && categoryId !== '' && categoryId !== 'none' ? parseInt(categoryId) : null) : product.categoryId,
      price: priceNum !== null ? priceNum : product.price,
      stock: stockNum !== null ? stockNum : product.stock,
      image: imagePath,
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
      image: getImageUrl(productData.image) || '',
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
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete associated image file if it exists
    if (product.image) {
      deleteImageFile(product.image);
    }
    
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
