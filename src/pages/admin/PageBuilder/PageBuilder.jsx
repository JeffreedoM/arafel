import { SiteHeader } from "@/components/site-header";
import HeroSection from "./HeroSection";
import BannerSection from "./BannerSection";

export default function PageBuilder() {
  return (
    <>
      <SiteHeader title="Page Builder" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="container mx-auto flex flex-col gap-2 px-4 py-10">
            <HeroSection />
            <BannerSection />
          </div>
        </div>
      </div>
    </>
  );
}
