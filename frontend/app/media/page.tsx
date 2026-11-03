import type { Metadata } from "next";
import { media } from "@/lib/media";

export const metadata: Metadata = {
  title: "Favourite stuff | Neng Li",
};

export default function MediaPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="mb-8 font-serif text-4xl font-semibold text-ink">Favourite Stuff</h1>
      <ul className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4">
        {media.map((item) => (
          <li
            key={item.title}
            className="relative w-64 shrink-0 snap-start overflow-hidden rounded-xl border border-line bg-white shadow-sm"
          >
            <img src={item.image} alt={item.title} loading="lazy" className="aspect-[3/4] w-full object-cover" />
            <div className="absolute left-3 top-3 rounded-lg bg-paper/90 px-2.5 py-1 text-center leading-none shadow-sm">
              <div className="font-serif text-2xl font-bold text-accent-600">{item.ovr}</div>
              <div className="mt-0.5 text-[10px] font-semibold tracking-widest text-ink/70">OVR</div>
            </div>
            <div className="p-4">
              <h2 className="font-serif text-lg font-semibold text-ink">{item.title}</h2>
              <p className="text-sm text-ink/70">{item.subtitle}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
