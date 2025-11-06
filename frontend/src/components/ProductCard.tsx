import { Product } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/hooks/useWishlist";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    debugger;
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 bg-white border-0 shadow-md overflow-hidden hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured && (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Featured
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white">
              -{discountPercentage}%
            </Badge>
          )}
          {product.stock <= 0 && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          size="sm"
          variant="ghost"
          className={`absolute top-3 right-3 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 ${
            inWishlist ? "text-red-500" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
            toast({
              title: inWishlist ? "Removed from Wishlist" : "Added to Wishlist",
              description: `${product.name} ${
                inWishlist ? "was removed from" : "has been added to"
              } your wishlist.`,
            });
          }}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
        </Button>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Category */}
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>

          {/* Product Name */}
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating} ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-600">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full py-6 text-base font-semibold transition-all duration-300 hover:shadow-lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
