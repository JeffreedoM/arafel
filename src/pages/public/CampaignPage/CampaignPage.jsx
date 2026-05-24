import { useParams, Link } from "react-router";
import { supabase } from "@/lib/supabase-client.js";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function Campaign() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    if (!id) {
      console.error("Error: Walang campaign ID sa URL!");
      return;
    }

    const fetchData = async () => {
      // 1. Fetch campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (campaignError) {
        console.error(campaignError);
        return;
      }

      setCampaign(campaignData);

      // 2. Fetch products
      const { data: productData, error: productError } = await supabase
        .from("campaign_products")
        .select(
          `
        products (
          *,
          product_images (*)
        )
      `,
        )
        .eq("campaign_id", id);

      if (productError) {
        console.error(productError);
        return;
      }

      const formatted = productData.map((item) => {
        const product = item.products;

        const thumbnailPath = product?.product_images?.find(
          (img) => img.is_thumbnail,
        )?.image_url;

        const { data: publicData } = supabase.storage
          .from("product-images")
          .getPublicUrl(thumbnailPath);

        return {
          ...product,
          thumbnail: publicData?.publicUrl,
        };
      });

      setProducts(formatted);
    };

    fetchData();
  }, [id]);

  return (
    <>
      <div className="wrapper-home bg-background">
        <Header />

        <h1 className="mt-20 text-center font-bold">
          {campaign?.campaign_name}
        </h1>
        <div className="mx-auto mb-6 max-w-5xl px-4 py-8">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.id}
                className="group bg-background hover:border-primary/50 min-h-[260px] cursor-pointer overflow-hidden rounded-sm border transition-all"
                to={`/product/${product.id}`}
              >
                <img
                  src={product.thumbnail}
                  alt=""
                  className="mx-auto w-full origin-bottom rounded-t-sm object-cover transition-transform group-hover:scale-105"
                />
                <div className="flex flex-col justify-between p-3 pb-1.5">
                  <h4
                    className="mb-2 line-clamp-2 h-[40px] text-sm font-semibold"
                    title={product.product_name}
                  >
                    {product.product_name}
                  </h4>
                  <p className="text-sm text-red-600">
                    ₱ {Number(product.price).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
