import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  loadRazorpayScript,
  openRazorpayCheckout,
  RazorpayResponse,
} from "@/utils/razorpay";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "@/services/paymentService";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/utils/currency";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const {
    cartItems,
    cartTotals,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
  } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const totalItems = getTotalItems();
  const { subtotal, gst, total: totalPrice } = cartTotals;

  const initiatePayment = async () => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to place an order.",
        variant: "destructive",
      });
      // Redirect to login page
      navigate("/login");
      return;
    }

    // Validate address input
    if (!deliveryAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter your delivery address.",
        variant: "destructive",
      });
      return;
    }

    setShowAddressDialog(false);

    try {
      setIsProcessingPayment(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast({
          title: "Error",
          description: "Failed to load Razorpay. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Prepare order data to store in our database (pending status)
      const orderDataForDB = {
        userId: user?.id ? parseInt(user.id) : undefined,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        })),
        totalPrice: totalPrice,
        address: deliveryAddress,
      };

      // Create pending order on backend + Razorpay order
      const backendOrder = await createRazorpayOrder({
        amount: totalPrice,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        orderData: orderDataForDB,
      });

      // Razorpay checkout options
      const options = {
        key: backendOrder.key_id,
        amount: backendOrder.order.amount,
        currency: backendOrder.order.currency,
        name: "Maa-Mart Grocery",
        description: "Order Payment",
        order_id: backendOrder.order.id,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment on backend and update existing order to paid
            const verificationResult = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: backendOrder.dbOrderId,
            });

            if (verificationResult.success) {
              toast({
                title: "Payment Successful!",
                description: verificationResult.dbOrderId
                  ? `Your order #${verificationResult.dbOrderId} has been placed successfully.`
                  : "Your order has been placed successfully.",
              });

              // Clear cart after successful payment
              await clearCart();
            } else {
              toast({
                title: "Payment Verification Failed",
                description: "Please contact support.",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast({
              title: "Payment Verification Failed",
              description:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: "#059669", // Emerald-600
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment.",
            });
          },
        },
      };

      // Open Razorpay checkout
      openRazorpayCheckout(options);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description:
          error instanceof Error ? error.message : "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <div className="flex flex-col items-center gap-3">
              <ShoppingBag className="w-10 h-10 text-emerald-600" />
              <h2 className="text-2xl font-semibold">Your cart is empty</h2>
              <p className="text-gray-600">
                Browse products and add your favorites to the cart.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Continue Shopping
              </Button>
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
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-emerald-600 font-semibold text-lg">
                        {formatINR(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-gray-400 line-through">
                          {formatINR(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="w-24 text-right font-semibold">
                    {formatINR(product.price * quantity)}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(product.id)}
                  >
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
                <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST (18%)</span>
                <span>{formatINR(gst)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="text-emerald-600">Free</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatINR(totalPrice)}</span>
              </div>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  // Check if user is logged in before showing address dialog
                  if (!user) {
                    toast({
                      title: "Login Required",
                      description: "Please log in to place an order.",
                      variant: "destructive",
                    });
                    navigate("/login");
                    return;
                  }
                  setShowAddressDialog(true);
                }}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? "Processing..." : "Proceed to Pay"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Address Input Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enter Delivery Details</DialogTitle>
            <DialogDescription>
              Please provide your delivery information to complete the order.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Delivery Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter your complete delivery address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddressDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={initiatePayment}
            >
              Continue to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
