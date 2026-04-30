import type { MetadataRoute } from "next";
import { config } from "@/lib/utils/metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: config.title,
    short_name: "アクションボード",
    description: config.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2aa693",
    lang: "ja",
    icons: [
      {
        src: "/img/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/img/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
