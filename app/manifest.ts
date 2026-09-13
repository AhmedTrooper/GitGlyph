import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GitGlyph — Dynamic GitHub SVG Stats Generator",
    short_name: "GitGlyph",
    description: "Generate beautiful, edge-cached dynamic GitHub SVG cards for your profile README.",
    start_url: "/",
    display: "standalone",
    background_color: "#090d13",
    theme_color: "#090d13",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
