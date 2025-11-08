import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Category } from "@/types";
import { Badge } from "@/components/ui/badge";

interface CategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryGrid({ onCategorySelect }: CategoryGridProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        // Normalize API categories to the frontend Category shape so the UI
        // can render even if the backend only provides id/name timestamps.
        const normalized = (data || []).map((c: any) => ({
          id: String(c.id),
          name: c.name || "",
          icon: c.icon || (c.name ? c.name.charAt(0) : "#"),
          description: c.description || "",
          color: c.color || "",
          gradient: c.gradient || "from-emerald-400 to-teal-500",
          productCount: typeof c.productCount === "number" ? c.productCount : 0,
        }));

        setCategories(normalized);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section id="category-grid" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of premium products across different
            categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="group hover:shadow-xl transition-all duration-500 cursor-pointer bg-white border-0 shadow-md hover:-translate-y-2"
              onClick={() => onCategorySelect(category.id)}
            >
              <CardHeader className="text-center pb-4">
                <div
                  className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${category.gradient} flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {category.description}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-700"
                  >
                    {category.productCount} items
                  </Badge>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full px-6"
                    onClick={(e) => {
                      // Prevent card's onClick double-fire and trigger category selection
                      e.stopPropagation();
                      onCategorySelect(category.id);
                      // Smooth scroll to the product grid if present
                      const prodEl = document.getElementById("product-grid");
                      if (prodEl) {
                        window.scrollTo({
                          top: prodEl.offsetTop - 80,
                          behavior: "smooth",
                        });
                      }
                    }}
                  >
                    Browse
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
