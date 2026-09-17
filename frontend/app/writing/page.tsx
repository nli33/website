import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing | Neng Li",
};

export default function WritingPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="mb-2 font-serif text-4xl font-semibold text-ink">Writing</h1>
      {posts.length === 0 ? (
        <p className="text-ink/60">No posts yet.</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="group relative rounded-lg border border-line bg-white/60 p-5 shadow-sm transition-colors hover:border-accent-400"
            >
              <a href={`/writing/${post.slug}`} className="absolute inset-0" aria-label={post.title} />
              <div className="flex gap-4">
                {post.thumbnail && (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="h-16 w-16 shrink-0 rounded-md border border-line object-cover sm:h-24 sm:w-24"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-2xl font-semibold text-ink group-hover:text-accent-600">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-ink/70">{post.description}</p>
                  <p className="mt-3 text-sm text-ink/50">
                    {post.date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
