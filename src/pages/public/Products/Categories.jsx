import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase-client";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FolderHeart } from "lucide-react";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);

        // Match sa iyong schema: table ay 'product_categories', columns ay 'id' at 'category_name'
        const { data, error: dbError } = await supabase
          .from("product_categories")
          .select("id, category_name");

        if (dbError) throw dbError;
        setCategories(data || []);
      } catch (err) {
        console.error("Error fetching categories:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Kapag klinek ang isang category card, ipapasa natin ang ID sa URL query parameter
  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="animate-pulse text-lg font-medium text-gray-500">
          Loading categories...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="wrapper bg-background min-h-screen">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Browse by Category
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Find the perfect gifts by selecting from our specialized
              categories.
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="rounded-lg border bg-white py-12 text-center shadow-sm">
              <p className="font-medium text-gray-500">No categories found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm transition duration-200 hover:border-indigo-500 hover:shadow-md"
                >
                  <div className="mb-4 rounded-full bg-indigo-50 p-3 text-indigo-600 transition duration-200 group-hover:bg-indigo-600 group-hover:text-white">
                    <FolderHeart size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 transition duration-100 group-hover:text-indigo-600">
                    {cat.category_name}
                  </h3>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Categories;
