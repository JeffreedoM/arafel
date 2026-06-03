// PageBuilder/sections-map.js
import HeroSection from "./HeroSection";
import BannerSection from "./BannerSection";
import FeaturedProductsSection from "./FeaturedProductsSection"; // 👈 Idagdag ito rito

export const HOMEPAGE_SECTIONS = {
  hero: HeroSection,
  banner: BannerSection,
  featured_products: FeaturedProductsSection, // 👈 At i-map dito para mabasa ng loop!
};
