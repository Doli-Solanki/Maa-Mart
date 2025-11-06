import { Order } from '../models/index.js';

export const placeOrder = async (req, res) => {
  try {
    const { userId, items, totalPrice, paymentMethod, address } = req.body;
    const order = await Order.create({ userId, items, totalPrice, paymentMethod, address, paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listOrders = async (req, res) => {
  const orders = await Order.findAll();
  res.json(orders);
};
