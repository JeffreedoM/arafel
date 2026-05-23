import { SiteHeader } from "@/components/site-header";
import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router";
import { supabase } from "@/lib/supabase-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RelatedProducts from "./RelatedProducts";
export default function ProductPage() {
  const { id } = useParams(); // 👈 grabs 41
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch product
  useEffect(() => {
    const load = async () => {
      if (!id) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(
          `
        *,
        product_categories (
          category_name
        ),
        product_images (
          image_url,
          is_thumbnail,
          order
        )
      `,
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Fetch product error:", error);
        setLoading(false);
        return;
      }

      setProduct(data);
      setLoading(false);
    };

    load();
  }, [id]);

  // Prepare images (derived state)
  const images = useMemo(() => {
    if (!product?.product_images) return [];

    return product.product_images.map((img) => {
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(img.image_url);

      return {
        ...img,
        publicUrl: data.publicUrl,
      };
    });
  }, [product]);

  // Sync selected image when images change
  useEffect(() => {
    if (images.length === 0) return;

    const thumbnail = images.find((img) => img.is_thumbnail) || images[0];

    setSelectedImage(thumbnail);
  }, [images]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <>
      <div className="wrapper-home bg-background">
        <Header />
        <div className="flex flex-1 flex-col min-h-screen">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="container mx-auto gap-x-20 px-4 py-10 font-[inter] lg:flex">
              <div className="flex max-w-xl flex-col lg:order-2">
                <Badge variant="secondary">
                  {product.product_categories?.category_name ?? "—"}
                </Badge>

                <h1 className="mt-20 text-4xl">{product.product_name}</h1>
                <Separator className="my-8 mt-12 -ml-3" />

                {product.price && product.price >= 0 ? (
                  <p className="mt-2 text-5xl">₱ {product.price}</p>
                ) : (
                  <p className="text-muted-foreground text-xl italic">
                    {product.price_description || "Contact for price"}
                  </p>
                )}

                <Separator className="my-8 mb-12 -ml-3" />

                <p className="mb-10 line-clamp-4">
                  {product.product_description}
                </p>

                {/* <div className="mt-auto mb-10 flex gap-4">
                <Link to={`/products/${product.id}/edit`}>
                  <Button className="cursor-pointer">Edit Product</Button>
                </Link>
                <Button className="cursor-pointer" variant="destructive">
                  Delete Product
                </Button>
              </div> */}

                <div className="mt-auto mb-10 flex gap-4">
                  <a
                    href="https://m.me/100095630491878"
                    target="_blank"
                    class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white shadow transition duration-150 hover:bg-blue-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.14 2 11.25c0 2.91 1.45 5.51 3.71 7.14V22l3.43-1.88c.88.24 1.81.38 2.77.38 5.52 0 10-4.14 10-9.25S17.52 2 12 2zm1.14 11.97l-2.54-2.71-4.96 2.71 5.45-5.79 2.61 2.71 4.88-2.71-5.44 5.79z" />
                    </svg>
                    Inquire via Messenger
                  </a>
                </div>
              </div>

              <div className="w-full max-w-xl grow gap-4 lg:flex">
                {/* MAIN IMAGE */}
                <div className="mb-2 flex-1 lg:mb-0">
                  {selectedImage && (
                    <img
                      src={selectedImage.publicUrl}
                      alt="Main Product"
                      className="h-150 w-full rounded-lg object-cover"
                    />
                  )}
                </div>

                {/* THUMBNAIL OPTIONS */}
                <div className="flex justify-between gap-2 lg:flex-col">
                  {images.map((img) => (
                    <img
                      key={img.image_url}
                      src={img.publicUrl}
                      alt="Option"
                      onClick={() => setSelectedImage(img)}
                      className={`h-20 w-25 grow cursor-pointer rounded-lg border-3 object-cover transition ${
                        selectedImage?.image_url === img.image_url
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <RelatedProducts 
        currentProductId={product.id} 
        categoryId={product.category_id} 
      />
      </div>

      <Footer />
    </>
  );
}
