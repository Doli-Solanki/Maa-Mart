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
  stock?: number;       // optional: number of units available (from DB)
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

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed';

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  address: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: string;
  updatedAt: string;
}