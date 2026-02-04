import { SiteHeader } from "@/components/site-header";

export default function CreateProduct() {
  return (
    <>
      <SiteHeader title="Create Product" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="container mx-auto py-10">Create Product</div>
        </div>
      </div>
    </>
  );
}
