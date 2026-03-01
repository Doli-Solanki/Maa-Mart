import { X, ShoppingBag, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatINR } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const GST_LABEL = '18% GST';

export default function CartDrawer() {
    const {
        cartItems, cartTotals, isCartOpen, closeCart,
        updateQuantity, removeFromCart, clearCart, loading,
    } = useCart();

    const [busyId, setBusyId] = useState<string | null>(null);

    const handleUpdate = async (productId: string, qty: number) => {
        setBusyId(productId);
        try { await updateQuantity(productId, qty); }
        finally { setBusyId(null); }
    };

    const handleRemove = async (productId: string) => {
        setBusyId(productId);
        try { await removeFromCart(productId); }
        finally { setBusyId(null); }
    };

    if (!isCartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 z-40 transition-opacity"
                onClick={closeCart}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
                        {cartItems.length > 0 && (
                            <Badge className="bg-emerald-500 text-white text-xs px-2">
                                {cartItems.reduce((s, i) => s + i.quantity, 0)}
                            </Badge>
                        )}
                    </div>
                    <button
                        onClick={closeCart}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        /* Loading skeleton */
                        <div className="p-4 space-y-4">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="flex gap-3 animate-pulse">
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                                    <div className="flex-1 space-y-2 pt-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : cartItems.length === 0 ? (
                        /* Empty state */
                        <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Cart is empty</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Add products to start shopping
                            </p>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={closeCart}
                            >
                                Browse Products
                            </Button>
                        </div>
                    ) : (
                        /* Item list */
                        <ul className="divide-y divide-gray-100">
                            {cartItems.map(({ product, quantity }) => {
                                const isBusy = busyId === product.id;
                                return (
                                    <li key={product.id} className="flex gap-3 p-4">
                                        {/* Image */}
                                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate pr-2">
                                                {product.name}
                                            </p>
                                            <p className="text-emerald-600 font-semibold text-sm mt-0.5">
                                                {formatINR(product.price)}
                                            </p>
                                            {!product.inStock && (
                                                <p className="text-red-500 text-xs mt-0.5">
                                                    Out of stock!
                                                </p>
                                            )}
                                            {/* Qty controls */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    disabled={isBusy}
                                                    onClick={() => handleUpdate(product.id, quantity - 1)}
                                                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-emerald-500 disabled:opacity-50 transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-6 text-center text-sm font-medium">
                                                    {quantity}
                                                </span>
                                                <button
                                                    disabled={isBusy}
                                                    onClick={() => handleUpdate(product.id, quantity + 1)}
                                                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-emerald-500 disabled:opacity-50 transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                                <button
                                                    disabled={isBusy}
                                                    onClick={() => handleRemove(product.id)}
                                                    className="ml-auto p-1 text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Line total */}
                                        <div className="text-right flex-shrink-0 pt-1">
                                            <p className="text-sm font-semibold text-gray-800">
                                                {formatINR(product.price * quantity)}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Footer — totals + actions */}
                {cartItems.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
                        {/* Price breakdown */}
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatINR(cartTotals.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>{GST_LABEL}</span>
                                <span>{formatINR(cartTotals.gst)}</span>
                            </div>
                            <Separator className="my-1" />
                            <div className="flex justify-between font-bold text-gray-900 text-base">
                                <span>Total</span>
                                <span className="text-emerald-700">{formatINR(cartTotals.total)}</span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                className="text-sm"
                                onClick={closeCart}
                                asChild
                            >
                                <Link to="/cart">View Cart</Link>
                            </Button>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                                onClick={closeCart}
                                asChild
                            >
                                <Link to="/cart">Checkout</Link>
                            </Button>
                        </div>

                        {/* Clear cart */}
                        <button
                            onClick={() => clearCart()}
                            className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors text-center"
                        >
                            Clear cart
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
