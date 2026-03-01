import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OrderHistoryPage from './OrderHistoryPage';
import * as api from '@/lib/api';
import { Order } from '@/types';
import '@testing-library/jest-dom/vitest';

// Mock the API module
vi.mock('@/lib/api', () => ({
  apiRequest: vi.fn(),
}));

const mockApiRequest = api.apiRequest as ReturnType<typeof vi.fn>;

// Helper to render component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('OrderHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Requirement 11.1: Display all user orders', () => {
    it('should fetch and display orders from GET /api/orders', async () => {
      const mockOrders: Order[] = [
        {
          id: 1,
          userId: 1,
          items: [
            { productId: 1, productName: 'Product 1', quantity: 2, price: 50, image: '/img1.jpg' }
          ],
          totalPrice: 100,
          status: 'confirmed',
          paymentMethod: 'Razorpay',
          paymentStatus: 'completed',
          address: '123 Test St',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 2,
          userId: 1,
          items: [
            { productId: 2, productName: 'Product 2', quantity: 1, price: 75 }
          ],
          totalPrice: 75,
          status: 'pending',
          paymentMethod: 'COD',
          paymentStatus: 'pending',
          address: '456 Test Ave',
          createdAt: '2024-01-14T10:00:00Z',
          updatedAt: '2024-01-14T10:00:00Z',
        },
      ];

      mockApiRequest.mockResolvedValueOnce(mockOrders);

      renderWithRouter(<OrderHistoryPage />);

      // Wait for orders to load
      await waitFor(() => {
        expect(screen.getByText('Order #1')).toBeInTheDocument();
        expect(screen.getByText('Order #2')).toBeInTheDocument();
      });

      // Verify API was called correctly
      expect(mockApiRequest).toHaveBeenCalledWith('/orders');
    });
  });

  describe('Requirement 11.2: Display order details', () => {
    it('should show order date, order ID, total amount, status, and items', async () => {
      const mockOrders: Order[] = [
        {
          id: 123,
          userId: 1,
          items: [
            { productId: 1, productName: 'Rice', quantity: 2, price: 50 },
            { productId: 2, productName: 'Wheat', quantity: 1, price: 40 }
          ],
          totalPrice: 140,
          status: 'delivered',
          paymentMethod: 'Razorpay',
          paymentStatus: 'completed',
          address: '123 Test St',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
      ];

      mockApiRequest.mockResolvedValueOnce(mockOrders);

      renderWithRouter(<OrderHistoryPage />);

      await waitFor(() => {
        // Check order ID
        expect(screen.getByText('Order #123')).toBeInTheDocument();
        
        // Check status
        expect(screen.getByText('Delivered')).toBeInTheDocument();
        
        // Check total amount (formatted in INR)
        expect(screen.getByText(/₹140\.00/)).toBeInTheDocument();
        
        // Check date is displayed
        expect(screen.getByText(/15 January 2024/)).toBeInTheDocument();
        
        // Check item count
        expect(screen.getByText('2 items')).toBeInTheDocument();
      });
    });
  });

  describe('Requirement 11.3: Show detailed order information on click', () => {
    it('should expand order details when clicked', async () => {
      const mockOrders: Order[] = [
        {
          id: 1,
          userId: 1,
          items: [
            { productId: 1, productName: 'Rice', quantity: 2, price: 50, image: '/rice.jpg' },
            { productId: 2, productName: 'Wheat', quantity: 1, price: 40 }
          ],
          totalPrice: 140,
          status: 'confirmed',
          paymentMethod: 'Razorpay',
          paymentStatus: 'completed',
          address: '123 Test Street, Mumbai',
          razorpayPaymentId: 'pay_123456',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
      ];

      mockApiRequest.mockResolvedValueOnce(mockOrders);

      renderWithRouter(<OrderHistoryPage />);

      await waitFor(() => {
        expect(screen.getByText('Order #1')).toBeInTheDocument();
      });

      // Initially, detailed items should not be visible
      expect(screen.queryByText('Order Items')).not.toBeInTheDocument();

      // Click to expand
      const orderHeader = screen.getByText('Order #1').closest('div[class*="cursor-pointer"]');
      fireEvent.click(orderHeader!);

      // Now detailed information should be visible
      await waitFor(() => {
        expect(screen.getByText('Order Items')).toBeInTheDocument();
        expect(screen.getByText('Rice')).toBeInTheDocument();
        expect(screen.getByText('Wheat')).toBeInTheDocument();
        expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
        expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
        expect(screen.getByText('Delivery Address')).toBeInTheDocument();
        expect(screen.getByText('123 Test Street, Mumbai')).toBeInTheDocument();
        expect(screen.getByText('Payment Details')).toBeInTheDocument();
        expect(screen.getByText('Razorpay')).toBeInTheDocument();
      });
    });

    it('should collapse order details when clicked again', async () => {
      const mockOrders: Order[] = [
        {
          id: 1,
          userId: 1,
          items: [{ productId: 1, productName: 'Product 1', quantity: 1, price: 50 }],
          totalPrice: 50,
          status: 'pending',
          paymentMethod: 'COD',
          paymentStatus: 'pending',
          address: '123 Test St',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
      ];

      mockApiRequest.mockResolvedValueOnce(mockOrders);

      renderWithRouter(<OrderHistoryPage />);

      await waitFor(() => {
        expect(screen.getByText('Order #1')).toBeInTheDocument();
      });

      const orderHeader = screen.getByText('Order #1').closest('div[class*="cursor-pointer"]');
      
      // Expand
      fireEvent.click(orderHeader!);
      await waitFor(() => {
        expect(screen.getByText('Order Items')).toBeInTheDocument();
      });

      // Collapse
      fireEvent.click(orderHeader!);
      await waitFor(() => {
        expect(screen.queryByText('Order Items')).not.toBeInTheDocument();
      });
    });
  });

  describe('Requirement 11.4: Display orders in reverse chronological order', () => {
    it('should display orders with newest first', async () => {
      const mockOrders: Order[] = [
        {
          id: 3,
          userId: 1,
          items: [{ productId: 1, productName: 'Product 1', quantity: 1, price: 100 }],
          totalPrice: 100,
          status: 'pending',
          paymentMethod: 'COD',
          paymentStatus: 'pending',
          address: 'Address 3',
          createdAt: '2024-01-17T10:00:00Z', // Newest
          updatedAt: '2024-01-17T10:00:00Z',
        },
        {
          id: 2,
          userId: 1,
          items: [{ productId: 2, productName: 'Product 2', quantity: 1, price: 75 }],
          totalPrice: 75,
          status: 'confirmed',
          paymentMethod: 'COD',
          paymentStatus: 'pending',
          address: 'Address 2',
          createdAt: '2024-01-16T10:00:00Z', // Middle
          updatedAt: '2024-01-16T10:00:00Z',
        },
        {
          id: 1,
          userId: 1,
          items: [{ productId: 3, productName: 'Product 3', quantity: 1, price: 50 }],
          totalPrice: 50,
          status: 'delivered',
          paymentMethod: 'COD',
          paymentStatus: 'completed',
          address: 'Address 1',
          createdAt: '2024-01-15T10:00:00Z', // Oldest
          updatedAt: '2024-01-15T10:00:00Z',
        },
      ];

      mockApiRequest.mockResolvedValueOnce(mockOrders);

      renderWithRouter(<OrderHistoryPage />);

      await waitFor(() => {
        const orderElements = screen.getAllByText(/Order #/);
        expect(orderElements).toHaveLength(3);
        
        // Verify order: newest (3) -> middle (2) -> oldest (1)
        expect(orderElements[0]).toHaveTextContent('Order #3');
        expect(orderElements[1]).toHaveTextContent('Order #2');
        expect(orderElements[2]).toHaveTextContent('Order #1');
      });
    });
  });

  describe('Requirement 11.5: Handle empty state', () => {
    it('should display empty state message when no orders exist', async () => {
      mockApiRequest.mockResolvedValueOnce([]);

      renderWithRouter(<OrderHistoryPage />);

      await waitFor(() => {
        expect(screen.getByText('No orders yet')).toBeInTheDocument();
        expect(screen.getByText(/You haven't placed any orders yet/)).toBeInTheDocument();
        expect(screen.getByText('Start Shopping')).toBeInTheDocument();
      });
    });

    it('should provide link to start shopping in empty state', async () => {
      mockApiRequest.mockResolvedValueOnce([]);

      renderWithRouter(<OrderHistoryPage />);

      await waitFor(() => {
        const shopLink = screen.getByText('Start Shopping');
        expect(shopLink).toHaveAttribute('href', '/');
      });
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading spinner while fetching orders', () => {
      mockApiRequest.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithRouter(<OrderHistoryPage />);

      // Check for the spinner by class name instead of role
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('border-green-600');
    });

    it('should display error message when fetch fails', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Network error'));

      renderWithRouter(<OrderHistoryPage />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    it('should retry fetching orders when Try Again is clicked', async () => {
      mockApiRequest
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([]);

      renderWithRouter(<OrderHistoryPage />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('No orders yet')).toBeInTheDocument();
      });

      expect(mockApiRequest).toHaveBeenCalledTimes(2);
    });
  });

  describe('Order Status Display', () => {
    it('should display different order statuses with appropriate styling', async () => {
      const mockOrders: Order[] = [
        {
          id: 1,
          userId: 1,
          items: [{ productId: 1, productName: 'Product 1', quantity: 1, price: 50 }],
          totalPrice: 50,
          status: 'pending',
          paymentMethod: 'COD',
          paymentStatus: 'pending',
          address: 'Address 1',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 2,
          userId: 1,
          items: [{ productId: 2, productName: 'Product 2', quantity: 1, price: 75 }],
          totalPrice: 75,
          status: 'delivered',
          paymentMethod: 'Razorpay',
          paymentStatus: 'completed',
          address: 'Address 2',
          createdAt: '2024-01-14T10:00:00Z',
          updatedAt: '2024-01-14T10:00:00Z',
        },
        {
          id: 3,
          userId: 1,
          items: [{ productId: 3, productName: 'Product 3', quantity: 1, price: 100 }],
          totalPrice: 100,
          status: 'failed',
          paymentMethod: 'Razorpay',
          paymentStatus: 'failed',
          address: 'Address 3',
          createdAt: '2024-01-13T10:00:00Z',
          updatedAt: '2024-01-13T10:00:00Z',
        },
      ];

      mockApiRequest.mockResolvedValueOnce(mockOrders);

      renderWithRouter(<OrderHistoryPage />);

      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Delivered')).toBeInTheDocument();
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });
    });
  });

  describe('Currency Formatting', () => {
    it('should display all prices in INR format', async () => {
      const mockOrders: Order[] = [
        {
          id: 1,
          userId: 1,
          items: [
            { productId: 1, productName: 'Product 1', quantity: 2, price: 50.50 },
            { productId: 2, productName: 'Product 2', quantity: 1, price: 99.99 }
          ],
          totalPrice: 200.99,
          status: 'confirmed',
          paymentMethod: 'Razorpay',
          paymentStatus: 'completed',
          address: '123 Test St',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
      ];

      mockApiRequest.mockResolvedValueOnce(mockOrders);

      renderWithRouter(<OrderHistoryPage />);

      await waitFor(() => {
        expect(screen.getByText('Order #1')).toBeInTheDocument();
      });

      // Expand to see item prices
      const orderHeader = screen.getByText('Order #1').closest('div[class*="cursor-pointer"]');
      fireEvent.click(orderHeader!);

      await waitFor(() => {
        // Check that prices are formatted with ₹ symbol - use getAllByText for multiple matches
        const totalPrices = screen.getAllByText(/₹200\.99/);
        expect(totalPrices.length).toBeGreaterThan(0);
        
        const price1 = screen.getAllByText(/₹50\.50/);
        expect(price1.length).toBeGreaterThan(0);
        
        const price2 = screen.getAllByText(/₹99\.99/);
        expect(price2.length).toBeGreaterThan(0);
      });
    });
  });
});
