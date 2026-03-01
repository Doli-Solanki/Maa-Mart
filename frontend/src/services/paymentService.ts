const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface OrderDataPayload {
  userId?: number;
  items: any[];
  totalPrice: number;
  address: string;
}

export interface CreateOrderRequest {
  amount: number;
  currency?: string;
  receipt?: string;
  orderData?: OrderDataPayload;
}

export interface CreateOrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  };
  key_id: string;
  dbOrderId?: number;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderData?: OrderDataPayload;
  dbOrderId?: number;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  paymentId?: string;
  orderId?: string;
  dbOrderId?: number;
}

// Create Razorpay order
export const createRazorpayOrder = async (
  data: CreateOrderRequest
): Promise<CreateOrderResponse> => {
  const token = localStorage.getItem('auth_token_v1');
  
  const response = await fetch(`${API_URL}/payment/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create order');
  }

  return response.json();
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (
  data: VerifyPaymentRequest
): Promise<VerifyPaymentResponse> => {
  const token = localStorage.getItem('auth_token_v1');
  
  const response = await fetch(`${API_URL}/payment/verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Payment verification failed');
  }

  return response.json();
};
