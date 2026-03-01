import { User, Order, Product, Category } from '../models/index.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Admin controller error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Order, as: 'orders' }]
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Admin controller error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('Admin controller error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Admin controller error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update order status
const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'];

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`
      });
    }
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Admin controller error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalOrders = await Order.count();
    const totalProducts = await Product.count();
    const totalRevenue = await Order.sum('totalPrice') || 0;
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const completedOrders = await Order.count({ where: { status: 'delivered' } });

    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      pendingOrders,
      completedOrders
    });
  } catch (error) {
    console.error('Admin controller error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

