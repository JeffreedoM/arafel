import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { supabase } from "@/lib/supabase-client.js";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function BannerSection() {
  const [loading, setLoading] = useState(true);
  const [heroImageUrl, setHeroImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      hero_title: "",
      hero_description: "",
      hero_image_file: null,
    },
  });

  const watchedFile = watch("hero_image_file");

  // fetch hero data from Supabase
  const fetchHeroData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", "home")
      .single();

    if (error) {
      console.error(error);
    } else if (data) {
      reset({
        hero_title: data.hero_title || "",
        hero_description: data.hero_description || "",
        hero_image_file: null,
      });
      setHeroImageUrl(data.hero_image_url || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHeroData();
  }, []);

  const uploadImage = async (file) => {
    if (!file) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `page-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    // get public URL properly
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return urlData.publicUrl; // THIS is the actual URL you want
  };

  const onSubmit = async (formData) => {
    let imageUrl = heroImageUrl; // current DB value

    console.log("Form Data:", formData);
    // upload new file if selected
    if (formData.hero_image_file?.[0]) {
      const uploadedUrl = await uploadImage(formData.hero_image_file[0]);
      console.log("Uploaded Image URL:", uploadedUrl); // this is undefined
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    console.log("imageUrl", imageUrl);

    // update DB
    const { error } = await supabase
      .from("pages")
      .update({
        hero_title: formData.hero_title,
        hero_description: formData.hero_description,
        hero_image_url: imageUrl, // <-- must pass the actual URL
      })
      .eq("slug", "home");

    if (error) {
      console.error(error);
      alert("Failed to update hero section");
    } else {
      alert("Hero section updated!");
      setHeroImageUrl(imageUrl); // update state for preview
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Accordion.Root
      className="max-w-4xl"
      type="single"
      collapsible
      defaultValue="hero-section"
    >
      <Accordion.Item value="hero-section" className="rounded-md">
        <div className="bg-accent flex items-center justify-between px-6 py-3">
          <h2 className="text-lg font-semibold">Banner Section</h2>
          <Accordion.Trigger className="cursor-pointer transition-transform duration-300 data-[state=open]:rotate-180">
            <ChevronDown className="transform" aria-hidden />
          </Accordion.Trigger>
        </div>
        <Accordion.Content>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <FieldGroup className="max-w-xl px-6 pt-4 pb-10">
              <Field>
                <FieldLabel htmlFor="banner_title">Banner Title</FieldLabel>
                <Input
                  id="banner_title"
                  {...register("banner_title")}
                  placeholder="Enter banner title"
                />
                <FieldDescription>Title of the hero section.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="hero_description">
                  Description / Tagline
                </FieldLabel>
                <Textarea
                  id="hero_description"
                  {...register("hero_description")}
                  placeholder="Enter page description or tagline"
                />
                <FieldDescription>
                  Description or tagline for the page.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="hero_image_file">Image</FieldLabel>
                {heroImageUrl && !watchedFile && (
                  <div className="bg-muted mb-2 rounded-md p-2">
                    <img
                      src={heroImageUrl}
                      alt="Current Hero"
                      className="max-h-40 w-full object-contain"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  id="hero_image_file"
                  {...register("hero_image_file")}
                  accept="image/*"
                />
                {watchedFile?.[0] && (
                  <div className="bg-muted mt-2 rounded-md p-2">
                    <img
                      src={URL.createObjectURL(watchedFile[0])}
                      alt="New Hero"
                      className="max-h-40 w-full object-contain"
                    />
                  </div>
                )}
                <FieldDescription>
                  Upload a new hero image (leave empty to keep current)
                </FieldDescription>
              </Field>
            </FieldGroup>
            <Button type="submit" className="mt-4 ml-auto" disabled={uploading}>
              {uploading ? "Uploading..." : "Save Hero Section"}
            </Button>
          </form>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
