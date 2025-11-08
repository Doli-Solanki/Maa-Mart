export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  categoryId: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured?: boolean;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  gradient: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}