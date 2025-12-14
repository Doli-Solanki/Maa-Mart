import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { Product } from "@/types";
import CartPage from "@/pages/CartPage";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import WishlistPage from "@/pages/WishlistPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminDashboard from "@/pages/AdminDashboard";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        products={products}
      />

      <Routes>
        <Route
          path="/"
          element={
            <>
              {!selectedCategory && <HeroSection />}
              {!selectedCategory && (
                <CategoryGrid onCategorySelect={handleCategorySelect} />
              )}
              <ProductGrid
                products={products}
                selectedCategory={selectedCategory}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
              />
            </>
          }
        />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>

      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
