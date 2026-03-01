import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Order, Product, sequelize } from '../models/index.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
// New flow:
// 1) Create a pending order in DB with paymentStatus = 'pending'
// 2) Create Razorpay order and link its id to the DB order
// 3) Return both Razorpay order details and dbOrderId to frontend
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, orderData } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
      });
    }

    // 1) Validate stock availability and create order atomically
    let savedOrder = null;

    if (orderData && orderData.items && orderData.items.length > 0) {
      // Use a transaction to ensure atomicity
      const transaction = await sequelize.transaction();

      try {
        // Check stock availability for all items
        for (const item of orderData.items) {
          if (!item.productId || !item.quantity) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: 'Invalid order item: productId and quantity are required',
            });
          }

          const product = await Product.findByPk(item.productId, { transaction });

          if (!product) {
            await transaction.rollback();
            return res.status(404).json({
              success: false,
              message: `Product with ID ${item.productId} not found`,
            });
          }

          if (product.stock < item.quantity) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
            });
          }
        }

        // All stock checks passed, create the order
        // Use authenticated user ID from request, not from orderData (security)
        const userId = req.user?.id || orderData.userId || null;

        // Normalize item field names: 'name' → 'productName' for consistent display
        const normalizedItems = orderData.items.map((item) => ({
          productId: item.productId,
          productName: item.productName || item.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.price,
          image: item.image || null,
        }));

        savedOrder = await Order.create({
          userId: userId,
          items: normalizedItems,
          totalPrice: orderData.totalPrice || amount,
          paymentMethod: 'Razorpay',
          paymentStatus: 'pending',
          address: orderData.address || 'Not provided',
        }, { transaction });

        // Reduce stock for each order item
        for (const item of orderData.items) {
          await Product.decrement(
            'stock',
            {
              by: item.quantity,
              where: { id: item.productId },
              transaction
            }
          );
        }

        // Commit the transaction
        await transaction.commit();
      } catch (dbError) {
        // Rollback the transaction on any error
        await transaction.rollback();
        console.error('Error creating pending order in database:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create order',
        });
      }
    }

    // 2) Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise (multiply by 100)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        userId: req.user?.id || 'guest',
        orderId: savedOrder ? savedOrder.id : receipt || `order_${Date.now()}`,
      },
    };

    const order = await razorpay.orders.create(options);

    // Optionally link Razorpay order id back to our DB order
    if (savedOrder) {
      try {
        await savedOrder.update({
          razorpayOrderId: order.id,
        });
      } catch (updateError) {
        console.error('Error updating order with Razorpay order id:', updateError);
      }
    }

    // 3) Return both Razorpay order info and our DB order id
    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      key_id: process.env.RAZORPAY_KEY_ID,
      dbOrderId: savedOrder?.id || null,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

// Verify Razorpay payment signature
// New flow:
// 1) Verify signature
// 2) Update existing order's paymentStatus from 'pending' -> 'paid' on success
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters',
      });
    }

    // Create signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Verify signature
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      let updatedOrder = null;

      if (dbOrderId) {
        try {
          const order = await Order.findByPk(dbOrderId);

          if (order) {
            updatedOrder = await order.update({
              paymentStatus: 'paid',
              razorpayOrderId: razorpay_order_id,
              razorpayPaymentId: razorpay_payment_id,
              razorpaySignature: razorpay_signature,
            });
          } else {
            console.warn(`Order with id ${dbOrderId} not found while verifying payment`);
          }
        } catch (dbError) {
          console.error('Error updating order to paid:', dbError);
          // We still return success for payment, but no dbOrderId
        }
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        dbOrderId: updatedOrder?.id || dbOrderId || null,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
};

// Get payment details
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const payment = await razorpay.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        createdAt: payment.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
};
