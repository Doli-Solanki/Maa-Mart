import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Package, Users, ShoppingCart, DollarSign, AlertCircle } from 'lucide-react';
import ProductManagement from '@/components/admin/ProductManagement';
import UserManagement from '@/components/admin/UserManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (!isAdmin()) {
      toast.error('Admin access required');
      navigate('/');
      return;
    }

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, navigate]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setError(null);
      const data = await apiRequest('/admin/dashboard/stats');
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      const errorMsg = error?.message || 'Failed to load dashboard statistics';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your store, products, users, and orders</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingStats ? '...' : stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingStats ? '...' : stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Available products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingStats ? '...' : stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingOrders} pending, {stats.completedOrders} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${loadingStats ? '...' : stats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">All time revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Management</CardTitle>
            <CardDescription>Manage products, users, and orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>
              <TabsContent value="products" className="mt-6">
                <ProductManagement onUpdate={fetchStats} />
              </TabsContent>
              <TabsContent value="users" className="mt-6">
                <UserManagement />
              </TabsContent>
              <TabsContent value="orders" className="mt-6">
                <OrderManagement onUpdate={fetchStats} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
