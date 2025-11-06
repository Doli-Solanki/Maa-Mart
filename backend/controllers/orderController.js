import { Order } from '../models/index.js';

export const placeOrder = async (req, res) => {
  try {
    // Get userId from authenticated user, not from request body (security fix)
    const userId = req.user.id;
    const { items, totalPrice, paymentMethod, address } = req.body || {};
    
    // Input validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }
    
    if (!totalPrice || typeof totalPrice !== 'number' || totalPrice <= 0) {
      return res.status(400).json({ message: 'Valid total price is required' });
    }
    
    if (!paymentMethod || typeof paymentMethod !== 'string') {
      return res.status(400).json({ message: 'Payment method is required' });
    }
    
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ message: 'Delivery address is required' });
    }
    
    const order = await Order.create({
      userId,
      items,
      totalPrice,
      paymentMethod,
      address,
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending'
    });
    
    res.status(201).json(order);
  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const listOrders = async (req, res) => {
  try {
    // Users can only see their own orders, admins can see all
    const whereClause = req.user.role === 'admin' 
      ? {} 
      : { userId: req.user.id };
    
    const orders = await Order.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(orders);
  } catch (err) {
    console.error('List orders error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
