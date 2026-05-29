import { useEffect, useState } from "react";
import { Link } from "react-router"; // Clean client-side routing
import { supabase } from "@/lib/supabase-client";

function RelatedProducts({ currentProductId, categoryId }) {
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      if (!currentProductId || !categoryId) return;

      try {
        setLoading(true);

        // Supabase Query: Pull data from the products table
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
          .eq("category_id", categoryId)
          .neq("id", currentProductId)
          .limit(4);

        if (error) throw error;

        // Map through items to dynamically reconstruct bucket storage URLs
        const itemsWithPublicUrls = (data || []).map((item) => {
          // Identify raw image asset text pointer
          const rawImg =
            item.product_images?.find((img) => img.is_thumbnail) ||
            item.product_images?.[0];

          let fallbackOrPublicUrl = "https://via.placeholder.com/300";

          if (rawImg?.image_url) {
            // Fetch authentic public URL straight from your bucket
            const { data: urlData } = supabase.storage
              .from("product-images")
              .getPublicUrl(rawImg.image_url);

            fallbackOrPublicUrl = urlData.publicUrl;
          }

          return {
            ...item,
            resolvedThumbnail: fallbackOrPublicUrl,
          };
        });

        setRelatedItems(itemsWithPublicUrls);
      } catch (error) {
        console.error("Error loading related products:", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [currentProductId, categoryId]);

  if (loading) {
    return (
      <div className="animate-pulse py-12 text-center text-sm font-medium text-neutral-400">
        Loading recommendations...
      </div>
    );
  }

  if (relatedItems.length === 0) return null;

  return (
    <div className="mt-16 w-full">
      <h3 className="mb-8 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
        You May Also Like
      </h3>

      {/* Modern Responsive Card Grid Layout */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        {relatedItems.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div>
              {/* Product Thumbnail Container */}
              <div className="relative aspect-square overflow-hidden bg-neutral-100 p-3 dark:bg-neutral-950">
                <img
                  src={item.resolvedThumbnail}
                  alt={item.product_name}
                  className="h-full w-full object-contain transition duration-300 group-hover:scale-103"
                  loading="lazy"
                />
              </div>

              {/* Text Information */}
              <div className="p-5">
                <h4 className="line-clamp-1 text-base font-semibold text-neutral-800 dark:text-neutral-200">
                  {item.product_name}
                </h4>
                <p className="mt-1.5 font-extrabold text-neutral-950 dark:text-neutral-50">
                  ₱
                  {Number(item.price || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {/* Premium Interactive Action Button */}
            <div className="p-5 pt-0">
              <Link
                to={`/product/${item.id}`}
                className="block w-full rounded-xl border border-neutral-200 bg-neutral-50/50 py-2.5 text-center text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;
