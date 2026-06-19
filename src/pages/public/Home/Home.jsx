import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { supabase } from "@/lib/supabase-client.js";
import { Link } from "react-router";

export default function Home() {
  const [heroData, setHeroData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Dynamic Hero Data from 'pages' table
  useEffect(() => {
    const fetchHeroData = async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", "home")
        .single();

      if (error) {
        console.error("Error fetching hero data:", error);
      } else {
        setHeroData(data);
      }
    };

    fetchHeroData();
  }, []);

  // 2. Fetch Product Categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*");

      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  // 3. Fetch Top 4 Highlighted/Featured Products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(
          `
        id,
        product_name,
        price,
        is_featured,
        product_images (
          image_url,
          is_thumbnail
        )
      `,
        )
        .eq("is_featured", true)
        .limit(4);

      if (error) {
        console.error("Error fetching featured products:", error);
      } else {
        // I-map para makuha ang tamang thumbnail at i-transform ang relative path gamit ang Supabase Storage
        const formattedProducts = data.map((product) => {
          // 1. Hanapin ang image na minarkahang thumbnail, o gamitin ang unang image bilang fallback
          const thumbnail =
            product.product_images?.find((img) => img.is_thumbnail) ||
            product.product_images?.[0];

          let finalImageUrl = "https://picsum.photos/260"; // Default fallback kapag walang image talaga

          if (thumbnail && thumbnail.image_url) {
            // 2. Check kung absolute URL na ang naka-save (for backward compatibility)
            if (thumbnail.image_url.startsWith("http")) {
              finalImageUrl = thumbnail.image_url;
            } else {
              // 3. Kung relative path (e.g., 'products/uuid.jpg'), kunin ang public URL mula sa 'product-images' bucket
              const { data: storageData } = supabase.storage
                .from("product-images")
                .getPublicUrl(thumbnail.image_url);

              finalImageUrl = storageData?.publicUrl || finalImageUrl;
            }
          }

          return {
            ...product,
            image: finalImageUrl,
          };
        });

        setFeaturedProducts(formattedProducts);
      }
      setLoading(false);
    };

    fetchFeaturedProducts();
  }, []);

  // Tailwind Background Colors para sa Categories
  const colors = [
    "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
    "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
    "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  ];

  if (loading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg font-medium text-gray-600">
          Loading shop experience...
        </div>
      </div>
    );
  }

  // Tukuyin ang dynamic link para sa CTA button ng Hero section
  const ctaLink = heroData?.campaign_id
    ? `/campaign/${heroData.campaign_id}`
    : heroData?.hero_button_link || "/products";

  return (
    <div className="bg-background flex min-h-screen flex-col justify-between">
      <div className="wrapper-home">
        <Header />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* 1. HERO SECTION (Responsive & Dynamic) */}
          <section className="mt-6 flex flex-col-reverse items-center justify-between gap-y-8 rounded-2xl border border-gray-100 bg-gradient-to-r from-gray-50 to-stone-50 p-6 sm:p-10 md:mt-10 md:flex-row md:gap-x-10 lg:p-16">
            <div className="flex max-w-xl flex-col items-center text-center md:items-start md:text-left">
              <h2 className="mb-4 text-3xl leading-tight font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                {heroData?.hero_title ||
                  "Fresh Blooms Handcrafted For Your Moments"}
              </h2>
              <p className="mb-8 max-w-md text-sm text-gray-600 sm:text-base md:text-lg">
                {heroData?.hero_description ||
                  "Create custom arrangements or pick from our curated collection of beautiful floral designs."}
              </p>
              <Link
                to={ctaLink}
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block rounded-full px-8 py-3.5 text-sm font-bold tracking-wide shadow-md transition-all active:scale-95"
              >
                {heroData?.hero_button_text || "Start Customizing"}
              </Link>
            </div>

            <div className="flex w-full justify-center md:w-auto">
              <img
                src={
                  heroData?.hero_image_url || "https://picsum.photos/400/400"
                }
                alt={heroData?.hero_title || "Featured Flower Arrangement"}
                className="h-[260px] w-[260px] rounded-2xl border-4 border-white object-cover shadow-lg sm:h-[320px] sm:w-[320px] lg:h-[400px] lg:w-[400px]"
              />
            </div>
          </section>

          {/* 2. CATEGORIES SECTION */}
          <section className="mt-16 md:mt-24">
            <div className="mb-6 text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-900 md:text-2xl">
                Browse by Category
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Find the perfect design format for your needs.
              </p>
            </div>

            <div className="grid grid-cols-2 items-center justify-start gap-4 sm:grid-cols-3 md:flex md:flex-wrap">
              {categories.map((category, index) => {
                const colorStyle = colors[index % colors.length];

                return (
                  <Link
                    to={`/products?category=${category.id}`}
                    key={category.id}
                    className={`flex min-w-[140px] grow items-center justify-center rounded-xl border p-4 text-center tracking-wide transition-all hover:-translate-y-1 hover:shadow-sm md:w-[200px] md:grow-0 ${colorStyle}`}
                  >
                    <span className="text-sm font-bold">
                      {category.category_name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* 3. PRODUCT HIGHLIGHTS (Customizable Flowers) */}
          <section className="mt-20 md:mt-28">
            <div className="mb-10 flex items-center justify-between">
              <div className="hidden h-[1px] grow bg-gray-200 sm:block"></div>
              <h3 className="w-full px-6 text-center text-2xl font-extrabold whitespace-nowrap text-gray-900 sm:w-auto">
                🌸 Featured Masterpieces
              </h3>
              <div className="hidden h-[1px] grow bg-gray-200 sm:block"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-card hover:border-primary/40 flex flex-col justify-between overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={product.image}
                      alt={product.product_name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex grow flex-col justify-between p-4">
                    <div className="mb-4">
                      <h4
                        className="group-hover:text-primary line-clamp-2 h-10 text-sm font-semibold text-gray-800 transition-colors"
                        title={product.product_name}
                      >
                        {product.product_name}
                      </h4>
                    </div>

                    <div className="flex flex-col justify-between gap-y-2 sm:flex-row sm:items-center">
                      <span className="text-base font-bold text-rose-600">
                        ₱{Number(product.price).toLocaleString()}
                      </span>
                      <Link
                        to={`/product/${product.id}`}
                        className="hover:bg-primary hover:text-primary-foreground rounded-lg bg-stone-900 px-3 py-2 text-center text-xs font-bold text-stone-50 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Button */}
            <div className="mt-12 text-center">
              <Link
                to="/products"
                className="hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-600 transition-colors"
              >
                View More ...
              </Link>
            </div>
          </section>

          {/* 4. SOCIAL PROOF (Facebook Integration Area) */}
          <section className="mt-20 mb-16 rounded-2xl border border-blue-100 bg-blue-50/50 p-6 text-center sm:p-10 md:mt-28">
            <h3 className="mb-2 text-xl font-bold text-blue-900 md:text-2xl">
              Join Us On Facebook!
            </h3>
            <p className="mx-auto mb-6 max-w-xl text-sm text-blue-700 md:text-base">
              Aktibo kaming nagse-share ng mga actual photos ng aming latest
              custom arrangements at client reactions doon. I-like at i-follow
              kami para sa mga daily designs!
            </p>

            {/* FB Interactive/Feed Placeholder Area */}
            <div className="mx-auto flex min-h-[120px] max-w-lg flex-col items-center justify-center rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs tracking-wider text-gray-400 uppercase">
                Latest Update From Our Feed
              </p>
              <span className="mb-4 text-sm font-semibold text-gray-700">
                👍 Arafel's Gift Shop
              </span>
              <a
                href="https://facebook.com" // Palitan ng totoong Facebook Page link mo
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-[#1877F2] px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-[#166FE5]"
              >
                Visit Facebook Page
              </a>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
