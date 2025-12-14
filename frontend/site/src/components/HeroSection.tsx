import { Button } from "@/components/ui/button";
import { ShoppingBag, Truck, Shield, Clock } from "lucide-react";
import heroImage from "../assets/heroImage.png";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Fresh & Quality
                </span>
                <br />
                <span className="text-gray-900">Products</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Discover premium quality products from fresh vegetables to
                elegant jewelry. Your one-stop destination for everything you
                need.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  const el = document.getElementById("product-grid");
                  if (el) {
                    window.scrollTo({
                      top: el.offsetTop - 80,
                      behavior: "smooth",
                    });
                  }
                }}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg rounded-full border-2 hover:bg-emerald-50 transition-all duration-300"
                onClick={() => {
                  const el = document.getElementById("category-grid");
                  if (el) {
                    window.scrollTo({
                      top: el.offsetTop - 80,
                      behavior: "smooth",
                    });
                  }
                }}
              >
                View Categories
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Free Delivery</p>
                  <p className="text-sm text-gray-500">On orders over $50</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Secure Payment</p>
                  <p className="text-sm text-gray-500">100% protected</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">24/7 Support</p>
                  <p className="text-sm text-gray-500">Always here to help</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Fresh vegetables and grocery items"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Floating Cards */}
            {/* <div className="absolute -left-4 top-8 bg-white rounded-2xl shadow-xl p-4 animate-bounce">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🥕</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Fresh Vegetables</p>
                  <p className="text-xs text-gray-500">Farm to table</p>
                </div>
              </div>
            </div> */}

            {/* <div className="absolute -right-4 bottom-8 bg-white rounded-2xl shadow-xl p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💎</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Premium Jewelry</p>
                  <p className="text-xs text-gray-500">Elegant designs</p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-emerald-100/50 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-teal-100/50 to-transparent rounded-full blur-3xl" />
      </div>
    </section>
  );
}
