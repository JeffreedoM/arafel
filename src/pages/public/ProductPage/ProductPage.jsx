import { SiteHeader } from "@/components/site-header";
import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router";
import { supabase } from "@/lib/supabase-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RelatedProducts from "./RelatedProducts";
import Cart from "../Cart/Cart"; // In-import ang Cart component natin

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false); // Binago mula isCheckingOut papuntang isAdding
  const [isCartOpen, setIsCartOpen] = useState(false); // State para sa view status ng cart drawer

  // Context hook functions
  const { addToCart } = useCart();

  // States for the Zoom Pop-up Modal
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

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

    return product.product_images
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((img) => {
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

  // Open the zoom pop-up
  const handleOpenZoom = (img) => {
    setZoomImage(img);
    setIsZoomOpen(true);
  };

  // 2. BAGONG WORKFLOW: Idagdag ang item sa cart state imbes na dumiretso agad sa checkout
  const handleAddToCart = () => {
    if (product.stock <= 0) return;

    setIsAdding(true);

    // Kunin ang public URL ng thumbnail para sa cart view icon
    const currentThumbnail =
      images.find((img) => img.is_thumbnail)?.publicUrl || images[0]?.publicUrl;

    // Patakbuhin ang context action
    addToCart(product, quantity, currentThumbnail);

    setTimeout(() => {
      setIsAdding(false);
      setIsCartOpen(true); // Awtomatikong bubukas ang Cart Panel para makita ang laman
    }, 400);
  };

  if (loading) {
    return (
      <div className="text-muted-foreground flex min-h-screen animate-pulse items-center justify-center font-[inter]">
        Loading product details...
      </div>
    );
  }

  if (!product)
    return <p className="p-10 text-center font-[inter]">Product not found.</p>;

  const isOutOfStock = product.stock === undefined || product.stock <= 0;

  return (
    <div className="min-h-screen font-[inter] text-neutral-800 antialiased dark:bg-neutral-950 dark:text-neutral-50">
      <div className="wrapper-home">
        <Header />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2">
            {/* LEFT COLUMN: VISUAL GALLERY WITH POP-UP CAPABILITY */}
            <div className="flex flex-col gap-4">
              {/* Main Stage Image */}
              <button
                onClick={() => selectedImage && handleOpenZoom(selectedImage)}
                className="group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/50 dark:bg-neutral-900 dark:ring-neutral-800"
              >
                {selectedImage ? (
                  <>
                    <img
                      src={selectedImage.publicUrl}
                      alt={product.product_name}
                      className="h-full w-full object-contain p-4 transition-all duration-300 group-hover:scale-102"
                    />
                    <div className="absolute right-4 bottom-4 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                        />
                      </svg>
                      Click to zoom
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center">
                    No image available
                  </div>
                )}
              </button>

              {/* Smart Fixed 5-Column Thumbnail Row */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {images.map((img) => {
                    const isSelected =
                      selectedImage?.image_url === img.image_url;
                    return (
                      <button
                        key={img.image_url}
                        onClick={() => setSelectedImage(img)}
                        className={`relative aspect-square w-full overflow-hidden rounded-xl bg-white p-1 ring-2 transition-all hover:opacity-90 dark:bg-neutral-900 ${
                          isSelected
                            ? "ring-blue-600 dark:ring-blue-500"
                            : "ring-neutral-200/60 hover:ring-neutral-300 dark:ring-neutral-800"
                        }`}
                      >
                        <img
                          src={img.publicUrl}
                          alt="Product preview"
                          className="h-full w-full rounded-lg object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: INFORMATION & ORDER INTERACTION */}
            <div className="flex flex-col justify-between py-2">
              <div>
                {/* Category & Stock Badges */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-neutral-200/60 font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {product.product_categories?.category_name ?? "General"}
                  </Badge>

                  {/* Modern Stock Indicator */}
                  {isOutOfStock ? (
                    <Badge className="border-none bg-rose-100 font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400">
                      Out of Stock
                    </Badge>
                  ) : product.stock <= 5 ? (
                    <Badge className="animate-pulse border-none bg-amber-100 font-semibold text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400">
                      Low Stock: {product.stock} left
                    </Badge>
                  ) : (
                    <Badge className="border-none bg-emerald-100 font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400">
                      In Stock: {product.stock} available
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
                  {product.product_name}
                </h1>

                {/* Dynamic Price Area */}
                <div className="mt-6 flex items-baseline">
                  {product.price && product.price >= 0 ? (
                    <span className="text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
                      ₱{product.price.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-xl font-medium text-neutral-500 italic">
                      {product.price_description || "Contact for pricing"}
                    </span>
                  )}
                </div>

                <Separator className="my-6 border-neutral-200/80 dark:border-neutral-800" />

                {/* Description Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold tracking-wide text-neutral-400 uppercase">
                    Description
                  </h3>
                  <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {product.product_description ||
                      "No description provided for this item."}
                  </p>
                </div>
              </div>

              {/* INTERACTION HUB */}
              <div className="mt-8 rounded-2xl bg-neutral-100 p-6 dark:bg-neutral-900/50">
                {!isOutOfStock && product.price && product.price >= 0 && (
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-500">
                      Select Quantity
                    </span>
                    <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={quantity <= 1}
                        onClick={() => setQuantity((q) => q - 1)}
                      >
                        -
                      </Button>
                      <span className="w-10 text-center text-sm font-semibold">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={quantity >= product.stock}
                        onClick={() => setQuantity((q) => q + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}

                {/* 3. BINAGONG CALL TO ACTION: Mula Messenger, naging "Add to Cart" function */}
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock}
                  className={`w-full gap-2 rounded-xl py-6 text-base font-semibold text-white shadow-lg transition-all duration-200 ${
                    isOutOfStock
                      ? "cursor-not-allowed bg-neutral-400 shadow-none dark:bg-neutral-800"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/10 active:scale-[0.99]"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  {isOutOfStock
                    ? "Sold Out"
                    : isAdding
                      ? "Adding to Cart..."
                      : "Add to Cart"}
                </Button>
              </div>
            </div>
          </div>

          {/* RELATED PRODUCTS */}
          <div className="mt-20">
            <Separator className="my-10 border-neutral-200/80 dark:border-neutral-800" />
            <RelatedProducts
              currentProductId={product.id}
              categoryId={product.category_id}
            />
          </div>
        </main>
      </div>
      <Footer />

      {/* RENDER THE SIDE SLIDE CART OVERLAY */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* LIGHTBOX POP-UP MODAL */}
      {isZoomOpen && zoomImage && (
        <div
          className="animate-in fade-in fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm duration-200"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            onClick={() => setIsZoomOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* High-Res Modal Zoomed Image Container */}
          <div
            className="max-h-[75vh] max-w-[90vw] overflow-hidden rounded-xl md:max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomImage.publicUrl}
              alt="Zoomed Product View"
              className="h-full max-h-[75vh] w-full rounded-lg object-contain"
            />
          </div>

          {/* Thumbnail Picker inside Modal Pop-up */}
          <div
            className="mt-6 flex max-w-md gap-3 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/50 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img) => (
              <button
                key={img.image_url}
                onClick={() => setZoomImage(img)}
                className={`aspect-square h-16 w-16 overflow-hidden rounded-lg bg-neutral-800 p-0.5 transition ${
                  zoomImage.image_url === img.image_url
                    ? "ring-2 ring-blue-500"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img.publicUrl}
                  alt="Preview thumbnail"
                  className="h-full w-full rounded-md object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
