import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "HAMMAH",
    start_url: "/",
    display: "standalone",
    background_color: "#111110",
    theme_color: "#111110",
    icons: [
      {
        src: "/images/hammah/global/logo/favicon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
