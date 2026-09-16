import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GitGlyph — Dynamic GitHub SVG Stats Generator",
    short_name: "GitGlyph",
    description: "Generate beautiful, edge-cached dynamic GitHub SVG cards for your profile README.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e1217",
    theme_color: "#0e1217",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
