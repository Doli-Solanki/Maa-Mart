import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  Heart,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { Category, Product } from "@/types";
import { useWishlist } from "@/hooks/useWishlist";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onCategorySelect: (categoryId: string | null) => void;
  selectedCategory: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  products: Product[];
}

export function Header({
  onCategorySelect,
  selectedCategory,
  searchQuery,
  onSearchChange,
  products,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [focused, setFocused] = useState(false);
  const desktopSearchRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);

  const suggestions = (() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [] as Product[];
    const matches = products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
    return matches.slice(0, 8);
  })();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getTotalItems: getWishlistCount } = useWishlist();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inDesktop = desktopSearchRef.current?.contains(target);
      const inMobile = mobileSearchRef.current?.contains(target);
      if (!inDesktop && !inMobile) setFocused(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const selectedCat = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null;

  const totalItems = getTotalItems();
  const wishlistCount = getWishlistCount();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => {
              navigate("/");
              onCategorySelect(null);
            }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                EcoMart
              </h1>
              <p className="text-xs text-gray-500">Premium Shopping</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-2 flex-1 max-w-md mx-4">
            <div ref={desktopSearchRef} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setFocused(false);
                  } else if (e.key === "Enter" && suggestions.length > 0) {
                    e.preventDefault();
                    onSearchChange("");
                    const el = document.getElementById("product-grid");
                    if (el) {
                      window.scrollTo({
                        top: el.offsetTop - 80,
                        behavior: "smooth",
                      });
                    }
                    setFocused(false);
                  }
                }}
                className="pl-10 w-full"
              />
              {focused && searchQuery.trim() && suggestions.length > 0 && (
                <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-auto">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-3"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onSearchChange("");
                        const el = document.getElementById("product-grid");
                        if (el) {
                          window.scrollTo({
                            top: el.offsetTop - 80,
                            behavior: "smooth",
                          });
                        }
                        setFocused(false);
                      }}
                    >
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100" />
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-gray-900">
                          {p.name}
                        </div>
                        <div className="truncate text-xs text-gray-500">
                          ${p.price?.toFixed?.(2) ?? p.price}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center"
                  >
                    {selectedCat ? (
                      <>
                        <span className="mr-2">{selectedCat.icon}</span>
                        {selectedCat.name}
                      </>
                    ) : (
                      "Categories"
                    )}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Select Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => onCategorySelect(null)}>
                    All Products
                  </DropdownMenuItem>
                  {categories.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onSelect={() => onCategorySelect(c.id)}
                    >
                      <span className="mr-2">{c.icon}</span>
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => navigate("/wishlist")}
            >
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-1 min-w-[1.25rem] h-5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-1 min-w-[1.25rem] h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </Badge>
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <User className="w-4 h-4 mr-2" />
                    {user.name}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* <DropdownMenuLabel>Account</DropdownMenuLabel> */}
                  {/* <DropdownMenuSeparator /> */}
                  {/* <DropdownMenuItem onSelect={() => navigate('/')}>Home</DropdownMenuItem> */}
                  {/* <DropdownMenuItem onSelect={() => navigate('/cart')}>My Cart</DropdownMenuItem> */}
                  <DropdownMenuItem onSelect={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => navigate("/admin")}>
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => logout()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div ref={mobileSearchRef} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setFocused(false);
                } else if (e.key === "Enter" && suggestions.length > 0) {
                  e.preventDefault();
                  onSearchChange("");
                  const el = document.getElementById("product-grid");
                  if (el) {
                    window.scrollTo({
                      top: el.offsetTop - 80,
                      behavior: "smooth",
                    });
                  }
                  setFocused(false);
                }
              }}
              className="pl-10 w-full"
            />
            {focused && searchQuery.trim() && suggestions.length > 0 && (
              <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-auto">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-3"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onSearchChange("");
                      const el = document.getElementById("product-grid");
                      if (el) {
                        window.scrollTo({
                          top: el.offsetTop - 80,
                          behavior: "smooth",
                        });
                      }
                      setFocused(false);
                    }}
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100" />
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-gray-900">
                        {p.name}
                      </div>
                      <div className="truncate text-xs text-gray-500">
                        ${p.price?.toFixed?.(2) ?? p.price}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col space-y-2">
              <Button
                variant={selectedCategory === null ? "default" : "ghost"}
                onClick={() => {
                  onCategorySelect(null);
                  setIsMenuOpen(false);
                }}
                className="justify-start"
              >
                All Products
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "ghost"
                  }
                  onClick={() => {
                    onCategorySelect(category.id);
                    setIsMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <span className="mr-3">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
              <div className="pt-2 border-t border-gray-200" />
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      navigate("/profile");
                      setIsMenuOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {user.name}
                  </Button>
                  {user.role === "admin" && (
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        navigate("/admin");
                        setIsMenuOpen(false);
                      }}
                    >
                      Admin Panel
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    className="justify-start"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    className="justify-start bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      navigate("/signup");
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
