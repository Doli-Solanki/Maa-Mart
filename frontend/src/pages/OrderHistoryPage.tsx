import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/utils/currency';
import { Package, ChevronDown, ChevronUp, Calendar, MapPin, CreditCard, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const OrderHistoryPage = () => {
  const { user, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before deciding what to do
    if (authLoading) return;

    // If user is not logged in, redirect to login
    if (!user || !token) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }

    fetchOrders();
  }, [authLoading, user, token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      // apiRequest automatically attaches Bearer token from localStorage
      const data = await apiRequest('/orders');
      // Normalize items: support both 'name' and 'productName' field names
      const normalized = (Array.isArray(data) ? data : []).map((order: Order) => ({
        ...order,
        items: (order.items || []).map((item) => ({
          ...item,
          // Cart stores items with 'name'; OrderHistoryPage displays 'productName'
          productName: item.productName || (item as unknown as { name?: string }).name || 'Unknown Product',
        })),
      }));
      setOrders(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show spinner while auth state is being restored from localStorage
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated (before redirect kicks in)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <LogIn className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">Please log in to view your order history.</p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your order history here.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {/* Order Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatINR(order.totalPrice)}
                      </p>
                    </div>
                    {expandedOrderId === order.id ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Order Details (Expanded) */}
              {expandedOrderId === order.id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white p-4 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{item.productName}</p>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatINR(item.price * item.quantity)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatINR(item.price)} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Delivery Address
                      </h4>
                      <p className="text-gray-700 bg-white p-4 rounded-lg">
                        {order.address}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Details
                      </h4>
                      <div className="bg-white p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-medium text-gray-900">
                            {order.paymentMethod}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status:</span>
                          <span className="font-medium text-gray-900">
                            {order.paymentStatus}
                          </span>
                        </div>
                        {order.razorpayPaymentId && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment ID:</span>
                            <span className="font-mono text-xs text-gray-900">
                              {order.razorpayPaymentId}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
