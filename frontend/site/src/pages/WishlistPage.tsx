import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/hooks/useWishlist';
import { ArrowLeft, HeartCrack, Trash2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist, getTotalItems } = useWishlist();
  const { addToCart } = useCart();

  const totalItems = getTotalItems();

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <div className="flex flex-col items-center gap-3">
              <HeartCrack className="w-10 h-10 text-emerald-600" />
              <h2 className="text-2xl font-semibold">Your wishlist is empty</h2>
              <p className="text-gray-600">Save items you love to find them easily later.</p>
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
          <h1 className="text-2xl font-bold">Your Wishlist</h1>
          <Badge variant="secondary">{totalItems} items</Badge>
        </div>
        <Button variant="ghost" onClick={clearWishlist}>
          <Trash2 className="w-4 h-4 mr-2" /> Clear Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {wishlist.map((product) => (
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
                    <Button size="sm" variant="outline" onClick={() => addToCart(product)}>
                      <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeFromWishlist(product.id)}>
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Wishlist Summary</h2>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total items</span>
                <span>{totalItems}</span>
              </div>
              <p className="text-sm text-gray-500">Items in wishlist are not reserved. Add them to cart to purchase.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
