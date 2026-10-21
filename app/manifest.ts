import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wortchamp",
    short_name: "Wortchamp",
    description: "Spiele Wortchamp, das Wordle auf Deutsch: tägliches Wort, Endlos-Modus und Wortsuche.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7eb",
    theme_color: "#3c9f45",
    lang: "de-DE",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png"
      }
    ]
  };
}
