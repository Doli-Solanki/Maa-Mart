import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalItems, getTotalPrice } = useCart();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <div className="flex flex-col items-center gap-3">
              <ShoppingBag className="w-10 h-10 text-emerald-600" />
              <h2 className="text-2xl font-semibold">Your cart is empty</h2>
              <p className="text-gray-600">Browse products and add your favorites to the cart.</p>
            </div>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="px-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Your Cart</h1>
          <Badge variant="secondary">{totalItems} items</Badge>
        </div>
        <Button variant="ghost" onClick={clearCart}>
          <Trash2 className="w-4 h-4 mr-2" /> Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(({ product, quantity }) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-md" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-emerald-600 font-semibold text-lg">${product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => updateQuantity(product.id, quantity - 1)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button size="icon" variant="outline" onClick={() => updateQuantity(product.id, quantity + 1)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="w-24 text-right font-semibold">${(product.price * quantity).toFixed(2)}</div>

                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(product.id)}>
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="text-emerald-600">Free</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
