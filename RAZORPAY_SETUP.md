# Razorpay Payment Gateway Integration

This guide will help you set up Razorpay payment gateway for your grocery store application.

## Prerequisites

1. Razorpay Account (Sign up at https://razorpay.com/)
2. Node.js and npm installed
3. Backend and frontend servers running

## Setup Instructions

### 1. Get Razorpay API Keys

1. Log in to your Razorpay Dashboard: https://dashboard.razorpay.com/
2. Navigate to **Settings** → **API Keys**
3. Generate or copy your **Key ID** and **Key Secret**
4. For testing, use **Test Mode** keys
5. For production, use **Live Mode** keys

### 2. Configure Backend

1. Open `backend/.env` file
2. Add your Razorpay credentials:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_secret_key_here
   ```
3. Replace `rzp_test_xxxxxxxxxx` with your actual Key ID
4. Replace `your_secret_key_here` with your actual Key Secret

### 3. Install Dependencies

The Razorpay package has already been installed in the backend. If you need to reinstall:

```bash
cd backend
npm install razorpay
```

### 4. Start the Servers

Start both backend and frontend servers:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Testing the Integration

### Test Mode

1. Use Razorpay test credentials in `.env`
2. Test cards provided by Razorpay:
   - **Card Number:** 4111 1111 1111 1111
   - **CVV:** Any 3 digits
   - **Expiry:** Any future date
   - **OTP:** 1234 (for 3DS authentication)

### UPI Test Payment
- Use any UPI ID ending with `@razorpay`
- Example: `success@razorpay`

### Payment Flow

1. Add items to cart
2. Click "Proceed to Pay" button
3. Razorpay checkout modal opens
4. Enter payment details
5. Complete payment
6. Payment is verified on backend
7. Cart is cleared on success

## API Endpoints

### Create Order
- **URL:** `POST /api/payment/create-order`
- **Body:**
  ```json
  {
    "amount": 1000,
    "currency": "INR",
    "receipt": "receipt_123"
  }
  ```

### Verify Payment
- **URL:** `POST /api/payment/verify-payment`
- **Body:**
  ```json
  {
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature_xxx"
  }
  ```

### Get Payment Details
- **URL:** `GET /api/payment/payment/:paymentId`

## Frontend Implementation

The payment integration is implemented in `frontend/src/pages/CartPage.tsx`:

1. **Load Razorpay Script:** Dynamically loads the Razorpay checkout script
2. **Create Order:** Calls backend API to create a Razorpay order
3. **Open Checkout:** Opens Razorpay payment modal
4. **Handle Response:** Verifies payment signature on backend
5. **Update UI:** Shows success/error messages and clears cart

## Security Notes

- **Never expose your Key Secret** in frontend code
- Key Secret should only be stored in backend `.env` file
- Always verify payment signature on backend
- Use HTTPS in production
- Implement rate limiting for payment endpoints

## Currency

The integration is set to use **INR (Indian Rupees)** by default. To change:

1. Update `currency` in `frontend/src/pages/CartPage.tsx`
2. Update `currency` default in `backend/controllers/paymentController.js`

## Troubleshooting

### Razorpay script not loading
- Check internet connection
- Verify Razorpay CDN is accessible
- Check browser console for errors

### Payment verification failing
- Verify Key Secret is correct in `.env`
- Check backend logs for signature mismatch
- Ensure all three parameters are sent to verify endpoint

### Order creation failing
- Check if backend server is running
- Verify API endpoint URL is correct
- Check backend logs for Razorpay API errors

## Production Deployment

Before going live:

1. Switch to **Live Mode** API keys in Razorpay Dashboard
2. Update `.env` with live credentials
3. Enable required payment methods in Razorpay Dashboard
4. Configure webhooks for payment notifications (optional)
5. Test thoroughly with real payment methods
6. Implement proper error handling and logging

## Additional Resources

- Razorpay Documentation: https://razorpay.com/docs/
- API Reference: https://razorpay.com/docs/api/
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/
- Support: https://razorpay.com/support/

## Features Implemented

✅ Create Razorpay order from backend  
✅ Payment verification with signature  
✅ Dynamic Razorpay script loading  
✅ Payment success/failure handling  
✅ Cart clearing on successful payment  
✅ Loading states and user feedback  
✅ Error handling and toast notifications  
✅ Secure backend integration  

## Next Steps (Optional Enhancements)

- [ ] Save order details to database after payment
- [ ] Send order confirmation email
- [ ] Implement payment webhooks for real-time updates
- [ ] Add payment history page
- [ ] Support for multiple currencies
- [ ] Refund functionality
- [ ] Partial payments support
