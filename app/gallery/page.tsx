"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface GalleryImage {
  name: string;
  url: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadImages() {
      const { data, error } = await supabase.storage
        .from("photos")
        .list("gallery", { sortBy: { column: "created_at", order: "desc" } });

      if (error) {
        setError("Couldn't load the gallery right now.");
        return;
      }

      const withUrls = (data ?? [])
        .filter((file) => file.name !== ".emptyFolderPlaceholder")
        .map((file) => {
          const { data: urlData } = supabase.storage
            .from("photos")
            .getPublicUrl(`gallery/${file.name}`);
          return { name: file.name, url: urlData.publicUrl };
        });

      setImages(withUrls);
    }
    loadImages();
  }, []);

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display italic text-3xl text-cream mb-8">Gallery</h1>

      {error && <p className="text-sage">{error}</p>}

      {!error && images.length === 0 && (
        <p className="text-sage">Photos coming soon.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.name}
            src={img.url}
            alt="Gel-x nail set"
            className="w-full aspect-square object-cover rounded-lg"
          />
        ))}
      </div>
    </section>
  );
}