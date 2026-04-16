import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";

import { supabase } from "@/lib/supabase-client.js";
import { ca, is } from "zod/locales";
import { Link } from "react-router";

export default function Home() {
  const products = [
    {
      id: 1,
      name: "Scented Candle",
      price: 20,
      image: "https://picsum.photos/id/30/260",
    },
    {
      id: 2,
      name: "RX 5600XT",
      price: 6000,
      image: "https://picsum.photos/id/40/260",
    },
    {
      id: 3,
      name: "BUY 1 TAKE 1 Black Backing Folding UV Windbreaker Umbrella Manual Operated Steel high quality",
      price: 119,
      image: "https://picsum.photos/id/50/260",
    },
    {
      id: 4,
      name: "Shabu, Marijuana, Lighter",
      price: 99.99,
      image: "https://picsum.photos/id/60/260",
    },
  ];

  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", "home")
        .single();

      if (error) {
        console.error(error);
      } else {
        console.log(data);
      }

      setHeroData(data);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*");

      if (error) {
        console.error(error);
      } else {
        console.log(data);
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  const colors = [
    "bg-teal-100",
    "bg-red-100",
    "bg-blue-100",
    "bg-yellow-100",
    "bg-purple-100",
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="wrapper-home bg-background ">
        <Header />

        {/* Hero Section */}
        <section className="mt-10 flex items-center justify-between gap-x-10 rounded-md bg-gray-50 px-[10%] py-10">
          <div className="max-w-xl text-center sm:text-left">
            <h2 className="mb-4 text-2xl leading-snug font-bold sm:text-3xl lg:text-4xl">
              {heroData?.hero_title || "Welcome to Our Store!"}
            </h2>
            <p className="mb-8">
              {heroData?.hero_description ||
                "Discover our amazing products and services."}
            </p>
            <Link
              to={`/campaign/${heroData?.campaign_id}`}
              className="bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-bold"
            >
              See More
            </Link>
          </div>
          <div>
            <img
              src={heroData?.hero_image_url || "https://picsum.photos/300"}
              alt=""
              className="hidden h-[300px] w-[300px] rounded-md object-cover sm:block"
            />
          </div>
        </section>

        {/* Categories */}
        <section className="mt-20">
          <h3 className="text-lg font-bold">Our Product Categories</h3>

          <div className="mt-6 flex flex-wrap items-center justify-start gap-6 gap-y-2">
            {categories.map((category, index) => {
              const colorClass = colors[index % colors.length];

              return (
                <Link
                  to="#"
                  key={category.id}
                  className={`w-[220px] cursor-pointer items-center rounded-lg ${colorClass} p-2 py-1.5 tracking-wide transition-transform hover:scale-105`}
                >
                  <p className="text-primary-background grow text-center text-sm font-semibold">
                    {category.category_name}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Highlighted Products */}
        <section className="mt-20 mb-20">
          <div className="mb-10 flex items-center gap-8">
            <div className="h-[1px] grow bg-gray-300"></div>
            <h3 className="text-xl font-bold">Highlighted Products</h3>
            <div className="h-[1px] grow bg-gray-300"></div>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-background hover:border-primary/50 min-h-[260px] cursor-pointer overflow-hidden rounded-sm border transition-all"
              >
                <img
                  src={product.image}
                  alt=""
                  className="mx-auto w-full origin-bottom rounded-t-sm object-cover transition-transform group-hover:scale-105"
                />
                <div className="flex flex-col justify-between p-3 pb-1.5">
                  <h4
                    className="mb-2 line-clamp-2 h-[40px] text-sm font-semibold"
                    title={product.name}
                  >
                    {product.name}
                  </h4>
                  <p className="text-sm text-red-600">
                    ₱ {Number(product.price).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
