import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { supabase } from "@/lib/supabase-client";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Products() {
  const [products, setProducts] = useState([]);
  const [currentCategoryName, setCurrentCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    async function fetchAllProducts() {
      try {
        setLoading(true);
        setError(null);

        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get("search");
        const categoryQuery = searchParams.get("category");

        // RELATION JOIN QUERY BASE
        let query = supabase.from("products").select(`
            id,
            product_name,
            product_description,
            price,
            stock,
            status,
            is_featured,
            price_description,
            category_id,
            product_categories (
              category_name
            ),
            product_images (
              image_url,
              is_thumbnail
            )
          `);

        if (searchQuery) {
          query = query.ilike("product_name", `%${searchQuery}%`);
        }

        if (categoryQuery) {
          const isNumeric = /^\d+$/.test(categoryQuery);

          if (isNumeric) {
            query = query.eq("category_id", parseInt(categoryQuery, 10));
          } else {
            query = query.eq("product_categories.category_name", categoryQuery);
          }
        }

        const { data: dbData, error: dbError } = await query.order(
          "created_at",
          { ascending: false },
        );

        if (dbError) throw dbError;

        // --- FIXED DYNAMIC SETTING PARA SA HEADER TEXT ---
        if (categoryQuery) {
          const isNumeric = /^\d+$/.test(categoryQuery);

          if (isNumeric) {
            if (dbData && dbData.length > 0) {
              // Kung may produkto, kunin ang pangalan sa unang produkto
              setCurrentCategoryName(
                dbData[0].product_categories?.category_name ||
                  "Selected Category",
              );
            } else {
              // FIX: Kung walang produkto, kuhanin nang hiwalay ang pangalan mula sa categories table gamit ang ID
              const { data: catData, error: catError } = await supabase
                .from("product_categories")
                .select("category_name")
                .eq("id", parseInt(categoryQuery, 10))
                .single();

              if (!catError && catData) {
                setCurrentCategoryName(catData.category_name);
              } else {
                setCurrentCategoryName("Selected Category");
              }
            }
          } else {
            // Kung text na ang pinasa (e.g. "Men"), iyon na agad ang gagamitin natin
            setCurrentCategoryName(categoryQuery);
          }
        } else {
          setCurrentCategoryName("");
        }
        // -------------------------------------------------

        const productsWithStorageUrls = (dbData || []).map((product) => {
          const targetImageObj =
            product.product_images?.find((img) => img.is_thumbnail) ||
            product.product_images?.[0];

          let resolvedImageUrl = "https://via.placeholder.com/300";

          if (targetImageObj && targetImageObj.image_url) {
            const { data } = supabase.storage
              .from("product-images")
              .getPublicUrl(targetImageObj.image_url);

            if (data?.publicUrl) {
              resolvedImageUrl = data.publicUrl;
            }
          }

          return {
            ...product,
            computedThumbnail: resolvedImageUrl,
          };
        });

        const filteredProducts =
          categoryQuery && !/^\d+$/.test(categoryQuery)
            ? productsWithStorageUrls.filter(
                (p) => p.product_categories !== null,
              )
            : productsWithStorageUrls;

        setProducts(filteredProducts);
      } catch (err) {
        console.error("Error fetching products:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAllProducts();
  }, [location.search]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="animate-pulse text-lg font-medium text-gray-500">
          Loading products...
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

  const searchParams = new URLSearchParams(location.search);
  const activeSearchText = searchParams.get("search");

  return (
    <>
      <div className="wrapper-home bg-background">
        <Header />
        <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Header Section */}
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                {currentCategoryName
                  ? `${currentCategoryName} Collection`
                  : activeSearchText
                    ? `Search Results for "${activeSearchText}"`
                    : "Our Products"}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {currentCategoryName
                  ? `Showing items under ${currentCategoryName} category.`
                  : activeSearchText
                    ? `Showing match results for your keyword search.`
                    : "Browse through our wide selection of items."}
              </p>
            </div>

            {/* Empty State */}
            {products.length === 0 ? (
              <div className="rounded-lg border bg-white py-12 text-center shadow-sm">
                <p className="font-medium text-gray-500">
                  No products available at the moment under this filter.
                </p>
              </div>
            ) : (
              /* Main Responsive Grid Layout */
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => {
                  return (
                    <div
                      key={product.id}
                      className="flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:shadow-md"
                    >
                      <div>
                        {/* Image Container */}
                        <div className="relative h-56 overflow-hidden bg-gray-100">
                          <img
                            src={product.computedThumbnail}
                            alt={product.product_name}
                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          />

                          {/* Stock Badge */}
                          {product.stock === "0" ||
                          product.status === "Out of Stock" ? (
                            <span className="absolute top-3 right-3 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="absolute top-3 right-3 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                              In Stock
                            </span>
                          )}
                        </div>

                        {/* Content Body */}
                        <div className="p-5">
                          <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
                            {product.product_categories?.category_name ||
                              "General Item"}
                          </span>

                          <h2 className="mt-1 line-clamp-1 text-lg font-bold text-gray-900">
                            {product.product_name}
                          </h2>

                          <p className="mt-1 line-clamp-2 h-10 text-sm text-gray-500">
                            {product.product_description ||
                              "No description available."}
                          </p>

                          <div className="mt-4 flex items-baseline gap-1">
                            <span className="text-xl font-extrabold text-indigo-600">
                              ₱{Number(product.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions Button */}
                      <div className="p-5 pt-0">
                        <a
                          href={`/product/${product.id}`}
                          className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-700"
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Products;
