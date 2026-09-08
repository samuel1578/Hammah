import { HomeEditorialHero } from "@/components/home/home-editorial-hero";
import { HomeCollection001 } from "@/components/home/home-collection";
import { HomeHammahWorld } from "@/components/home/home-world";
import { HomeDetailCraft } from "@/components/home/home-craft";
import { HomeFeaturedPieces } from "@/components/home/home-featured";
import { HomePointOfView } from "@/components/home/home-pov";
import { HomeLegacy } from "@/components/home/home-legacy";
import { HomeFaq } from "@/components/home/home-faq";
import { HomeClosing } from "@/components/home/home-closing";

export default function HomePage() {
  return (
    <>
      <HomeEditorialHero />
      <HomeCollection001 />
      <HomeHammahWorld />
      <HomeDetailCraft />
      <HomeFeaturedPieces />
      <HomePointOfView />
      <HomeLegacy />
      <HomeFaq />
      <HomeClosing />
    </>
  );
}
