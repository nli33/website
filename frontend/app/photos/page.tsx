import type { Metadata } from "next";
import { photos } from "@/lib/photos";
import PhotoGallery from "@/components/PhotoGallery";

export const metadata: Metadata = {
  title: "Photos | Neng Li",
};

export default function PhotosPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="mb-8 font-serif text-4xl font-semibold text-ink">Cool Photos</h1>
      <PhotoGallery photos={photos} />
    </main>
  );
}
