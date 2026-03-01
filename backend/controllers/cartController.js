import { CartItem, Product } from '../models/index.js';
import { getImageUrl } from '../middleware/uploadMiddleware.js';

const GST_RATE = 0.18; // 18% GST

/**
 * Format DB rows into the shape the frontend expects.
 */
const formatCart = (items) =>
    items
        .filter((item) => item.product) // skip orphaned rows
        .map((item) => {
            const p = item.product;
            return {
                productId: String(p.id),
                productName: p.name,
                price: parseFloat(p.price),
                image: getImageUrl(p.image) || '',
                description: p.description || '',
                stock: p.stock ?? 0,
                quantity: item.quantity,
            };
        });

/**
 * Fetch and return formatted cart for a user.
 */
const getUserCart = (userId) =>
    CartItem.findAll({
        where: { userId },
        include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price', 'stock', 'image', 'description'],
        }],
    });

// ─── GET /api/cart ────────────────────────────────────────────────────────────
export const getCart = async (req, res) => {
    try {
        const rows = await getUserCart(req.user.id);
        res.json(formatCart(rows));
    } catch (err) {
        console.error('getCart error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ─── POST /api/cart ───────────────────────────────────────────────────────────
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        if (!productId) return res.status(400).json({ message: 'productId is required' });

        const qty = parseInt(quantity);
        if (isNaN(qty) || qty < 1) return res.status(400).json({ message: 'quantity must be ≥ 1' });

        const product = await Product.findByPk(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.stock < qty) {
            return res.status(400).json({ message: `Only ${product.stock} unit(s) in stock` });
        }

        const [item, created] = await CartItem.findOrCreate({
            where: { userId: req.user.id, productId: parseInt(productId) },
            defaults: { quantity: qty },
        });

        if (!created) {
            const newQty = item.quantity + qty;
            if (product.stock < newQty) {
                return res.status(400).json({ message: `Only ${product.stock} unit(s) in stock` });
            }
            item.quantity = newQty;
            await item.save();
        }

        const rows = await getUserCart(req.user.id);
        res.status(created ? 201 : 200).json(formatCart(rows));
    } catch (err) {
        console.error('addToCart error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ─── PUT /api/cart/:productId ─────────────────────────────────────────────────
export const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty < 0) return res.status(400).json({ message: 'quantity must be ≥ 0' });

        const item = await CartItem.findOne({
            where: { userId: req.user.id, productId: parseInt(req.params.productId) },
        });
        if (!item) return res.status(404).json({ message: 'Cart item not found' });

        if (qty === 0) {
            await item.destroy();
        } else {
            // Stock check
            const product = await Product.findByPk(req.params.productId);
            if (product && product.stock < qty) {
                return res.status(400).json({ message: `Only ${product.stock} unit(s) in stock` });
            }
            item.quantity = qty;
            await item.save();
        }

        const rows = await getUserCart(req.user.id);
        res.json(formatCart(rows));
    } catch (err) {
        console.error('updateCartItem error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ─── DELETE /api/cart/:productId ──────────────────────────────────────────────
export const removeCartItem = async (req, res) => {
    try {
        await CartItem.destroy({
            where: { userId: req.user.id, productId: parseInt(req.params.productId) },
        });
        const rows = await getUserCart(req.user.id);
        res.json(formatCart(rows));
    } catch (err) {
        console.error('removeCartItem error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ─── DELETE /api/cart ─────────────────────────────────────────────────────────
export const clearCart = async (req, res) => {
    try {
        await CartItem.destroy({ where: { userId: req.user.id } });
        res.json([]);
    } catch (err) {
        console.error('clearCart error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ─── POST /api/cart/sync ─────────────────────────────────────────────────────
// Merge guest cart into DB on login — takes max qty if item already exists.
export const syncCart = async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) return res.status(400).json({ message: 'items must be an array' });

        for (const { productId, quantity } of items) {
            const qty = parseInt(quantity);
            if (!productId || isNaN(qty) || qty < 1) continue;

            const [item, created] = await CartItem.findOrCreate({
                where: { userId: req.user.id, productId: parseInt(productId) },
                defaults: { quantity: qty },
            });

            if (!created) {
                item.quantity = Math.max(item.quantity, qty); // keep higher quantity
                await item.save();
            }
        }

        const rows = await getUserCart(req.user.id);
        res.json(formatCart(rows));
    } catch (err) {
        console.error('syncCart error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ─── POST /api/cart/validate ──────────────────────────────────────────────────
// Server-side price recalculation + stock check before checkout.
export const validateCart = async (req, res) => {
    try {
        const rows = await getUserCart(req.user.id);
        const formatted = formatCart(rows);

        if (formatted.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const stockErrors = [];
        let subtotal = 0;

        for (const item of formatted) {
            if (item.stock < item.quantity) {
                stockErrors.push({
                    productId: item.productId,
                    productName: item.productName,
                    available: item.stock,
                    requested: item.quantity,
                });
            }
            // Always use DB price — never trust frontend price
            subtotal += item.price * item.quantity;
        }

        const gst = parseFloat((subtotal * GST_RATE).toFixed(2));
        const total = parseFloat((subtotal + gst).toFixed(2));
        subtotal = parseFloat(subtotal.toFixed(2));

        res.json({
            items: formatted,
            subtotal,
            gst,
            gstRate: GST_RATE,
            total,
            stockErrors, // empty array = all good
        });
    } catch (err) {
        console.error('validateCart error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
