import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase-client.js";

// shadcn & radix components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as Accordion from "@radix-ui/react-accordion";

// icons
import {
  ChevronDown,
  LayoutTemplate,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function HeroSection() {
  const [loading, setLoading] = useState(true);
  const [heroImageUrl, setHeroImageUrl] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      hero_title: "",
      hero_description: "",
      hero_image_file: null,
      campaign_id: "",
    },
  });

  const watchedFile = watch("hero_image_file");

  // Track dynamic image changes cleanly & prevent memory leaks
  useEffect(() => {
    if (watchedFile?.[0]) {
      const objectUrl = URL.createObjectURL(watchedFile[0]);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [watchedFile]);

  // Fetch initial setup data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [pagesRes, campaignsRes] = await Promise.all([
          supabase.from("pages").select("*").eq("slug", "home").maybeSingle(),
          supabase
            .from("campaigns")
            .select("id, campaign_name")
            .order("campaign_name"),
        ]);

        if (campaignsRes.data) setCampaigns(campaignsRes.data);

        if (pagesRes.data) {
          reset({
            hero_title: pagesRes.data.hero_title || "",
            hero_description: pagesRes.data.hero_description || "",
            hero_image_file: null,
            campaign_id: pagesRes.data.campaign_id
              ? String(pagesRes.data.campaign_id)
              : "",
          });
          setHeroImageUrl(pagesRes.data.hero_image_url || null);
        }
      } catch (err) {
        console.error("Data loading failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [reset]);

  const uploadImage = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `page-images/${fileName}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return urlData?.publicUrl || null;
  };

  const onSubmit = async (formData) => {
    setStatusMessage(null);
    let imageUrl = heroImageUrl;

    if (formData.hero_image_file?.[0]) {
      const uploadedUrl = await uploadImage(formData.hero_image_file[0]);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const { error } = await supabase
      .from("pages")
      .update({
        hero_title: formData.hero_title,
        hero_description: formData.hero_description,
        hero_image_url: imageUrl,
        campaign_id: formData.campaign_id ? Number(formData.campaign_id) : null,
      })
      .eq("slug", "home");

    if (error) {
      console.error(error);
      setStatusMessage({
        type: "error",
        text: "Failed to update hero section settings.",
      });
    } else {
      setHeroImageUrl(imageUrl);
      setValue("hero_image_file", null); // Clear file selection on successful update
      setStatusMessage({
        type: "success",
        text: "Hero section configuration updated successfully!",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
        <Loader2 className="text-primary h-4 w-4 animate-spin" />
        Loading section preferences...
      </div>
    );
  }

  return (
    <Accordion.Root
      className="w-full max-w-4xl"
      type="single"
      collapsible
      defaultValue="hero-section"
    >
      <Accordion.Item
        value="hero-section"
        className="bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm"
      >
        {/* Accordion Header */}
        <Accordion.Trigger className="bg-muted/30 hover:bg-muted/50 group flex w-full items-center justify-between border-b px-6 py-4 text-left transition-all">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <LayoutTemplate className="h-4 w-4" />
            </div>
            <div>
              <h3 className="mb-1 text-sm leading-none font-semibold">
                Main Banner
              </h3>
              <p className="text-muted-foreground text-xs">
                Hero layout sitting above-the-fold on the home screen.
              </p>
            </div>
          </div>
          <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180" />
        </Accordion.Trigger>

        {/* Accordion Content Panel */}
        <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            {statusMessage && (
              <div
                className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
                  statusMessage.type === "success"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/10 border-destructive/20 text-destructive"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <p className="font-medium">{statusMessage.text}</p>
              </div>
            )}

            <FieldGroup className="grid max-w-2xl gap-6">
              {/* Title Field */}
              <Field className="space-y-1.5">
                <FieldLabel
                  htmlFor="hero_title"
                  className="text-muted-foreground text-xs font-bold tracking-wide uppercase"
                >
                  Display Header Title
                </FieldLabel>
                <Input
                  id="hero_title"
                  {...register("hero_title")}
                  placeholder="e.g., Discover Our New Summer Collection"
                  className="h-10 shadow-sm"
                />
                <FieldDescription className="text-muted-foreground text-xs">
                  Main bold statement text displayed on the header element.
                </FieldDescription>
              </Field>

              {/* Description Field */}
              <Field className="space-y-1.5">
                <FieldLabel
                  htmlFor="hero_description"
                  className="text-muted-foreground text-xs font-bold tracking-wide uppercase"
                >
                  Subheading Description
                </FieldLabel>
                <Textarea
                  id="hero_description"
                  {...register("hero_description")}
                  placeholder="Describe details regarding collections, announcements or general summaries..."
                  className="min-h-[100px] resize-none shadow-sm"
                />
                <FieldDescription className="text-muted-foreground text-xs">
                  Catchy supporting contextual lines displayed underneath the
                  title header text.
                </FieldDescription>
              </Field>

              {/* Advanced Integrated Image Upload and Preview Block */}
              <Field className="space-y-1.5">
                <FieldLabel className="text-muted-foreground text-xs font-bold tracking-wide uppercase">
                  Graphic Hero Asset
                </FieldLabel>

                <div className="grid items-start gap-4 pt-1 sm:grid-cols-2">
                  {/* Image Display Window */}
                  <div className="bg-muted/40 group/img relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border shadow-inner">
                    {previewUrl || heroImageUrl ? (
                      <img
                        src={previewUrl || heroImageUrl}
                        alt="Hero presentation layout"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground space-y-1 p-4 text-center">
                        <ImageIcon className="mx-auto h-8 w-8 stroke-[1.5] opacity-60" />
                        <p className="text-xs">No active asset found</p>
                      </div>
                    )}
                    {(previewUrl || heroImageUrl) && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-1.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover/img:opacity-100">
                        {previewUrl
                          ? "✨ Unsaved change preview"
                          : "📁 Currently stored resource"}
                      </div>
                    )}
                  </div>

                  {/* Clean Dropzone Upload Mask */}
                  <label
                    htmlFor="hero_image_file"
                    className="hover:bg-muted/40 group flex h-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors"
                  >
                    <UploadCloud className="text-muted-foreground group-hover:text-primary mb-2 h-7 w-7 stroke-[1.5] transition-colors" />
                    <span className="text-foreground mb-0.5 block text-xs font-semibold">
                      Click to replace graphics
                    </span>
                    <span className="text-muted-foreground block text-[11px]">
                      Supports transparent WebP, PNG, JPEG formats
                    </span>
                    <input
                      type="file"
                      id="hero_image_file"
                      {...register("hero_image_file")}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>
              </Field>

              {/* Linked Campaign Field Dropdown Selector */}
              <Field className="space-y-1.5">
                <FieldLabel className="text-muted-foreground text-xs font-bold tracking-wide uppercase">
                  Click Destination Linkage
                </FieldLabel>
                <Select
                  // Kung walang campaign_id o empty string ang nasa database, default natin sa "none"
                  value={watch("campaign_id")?.toString() || "none"}
                  onValueChange={(value) => setValue("campaign_id", value)}
                >
                  <SelectTrigger className="h-10 w-full shadow-sm sm:w-[280px]">
                    <SelectValue placeholder="Select active marketing campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {/* 💥 FIX: Ginawa nating "none" ang value sa halip na "" */}
                      <SelectItem value="none">
                        None (Static Non-clickable Banner)
                      </SelectItem>

                      {campaigns.map((campaign) => (
                        <SelectItem
                          key={campaign.id}
                          value={String(campaign.id)}
                        >
                          {campaign.campaign_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription className="text-muted-foreground text-xs">
                  Maps visitors clicking hero elements straight to specific deal
                  campaign modules.
                </FieldDescription>
              </Field>
            </FieldGroup>

            {/* Form Actions Section */}
            <div className="flex items-center justify-end gap-3 border-t pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[140px] shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes
                  </>
                ) : (
                  "Save Hero Section"
                )}
              </Button>
            </div>
          </form>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
