import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

function RelatedProducts({ currentProductId, categoryId }) {
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      // Siguraduhing may valid IDs bago mag-fetch ng data
      if (!currentProductId || !categoryId) return;

      try {
        setLoading(true);

        // Supabase Query: Kumukuha ng kaparehong kategorya pero iniiwasan ang current product
        const { data, error } = await supabase
          .from("products")
          .select(
            `
            id,
            product_name,
            price,
            product_images (
              image_url,
              is_thumbnail
            )
          `,
          )
          .eq("category_id", categoryId) // Salain ang parehong kategorya [cite: 19, 50]
          .neq("id", currentProductId) // I-exclude ang tinitingnang produkto [cite: 50]
          .limit(4); // Saktong 4 items para sa isang malinis na row [cite: 30, 50]

        if (error) throw error;
        setRelatedItems(data || []);
      } catch (error) {
        console.error("Error loading related products:", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [currentProductId, categoryId]);

  // Loading State
  if (loading) {
    return (
      <div class="py-8 text-center text-gray-500">
        Loading recommendations...
      </div>
    );
  }

  // Huwag itong i-render sa UI kung walang ibang produkto sa kategoryang iyon
  if (relatedItems.length === 0) return null;

  return (
    <div class="mt-12 w-full">
      <hr class="my-8 border-gray-200" />
      <h3 class="mb-6 text-xl font-bold text-gray-900">You May Also Like</h3>

      {/* Responsive Grid System: 1 column sa mobile, 2 sa tablet, 4 sa desktop */}
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        {relatedItems.map((item) => {
          // Kunin ang imaheng naka-set bilang thumbnail, o ang unang imahe, o fallback placeholder
          const thumbnail =
            item.product_images?.find((img) => img.is_thumbnail)?.image_url ||
            item.product_images?.[0]?.image_url ||
            "https://via.placeholder.com/300";

          return (
            <div
              key={item.id}
              class="flex flex-col justify-between overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition duration-200 hover:shadow-md"
            >
              <div>
                {/* Product Thumbnail container */}
                <div class="h-48 overflow-hidden bg-gray-100">
                  <img
                    src={thumbnail}
                    alt={item.product_name}
                    class="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>

                {/* Text Information */}
                <div class="p-4">
                  {/* Ginamit ang line-clamp-1 para manatiling pantay ang taas ng card kahit mahaba ang pangalan */}
                  <h4 class="line-clamp-1 text-base font-semibold text-gray-800">
                    {item.product_name}
                  </h4>
                  {/* Pag-format ng presyo na laging may dalawang decimal places gaya ng hiningi sa thesis rules */}
                  <p class="mt-1 font-bold text-indigo-600">
                    ₱{Number(item.price).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div class="p-4 pt-0">
                <a
                  href={`/product/${item.id}`} // Palitan ito ng <Link to=...> kung gumagamit ka ng react-router-dom
                  class="block w-full rounded border border-indigo-100 bg-gray-50 px-4 py-2 text-center text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                >
                  View Product
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RelatedProducts;
