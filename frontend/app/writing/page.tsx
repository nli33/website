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
            <li key={post.slug} className="rounded-lg border border-line bg-white/60 p-5 shadow-sm">
              <a
                href={`/writing/${post.slug}`}
                className="font-serif text-2xl font-semibold text-ink hover:text-accent-600"
              >
                {post.title}
              </a>
              <p className="mt-2 text-ink/70">{post.description}</p>
              <p className="mt-3 text-sm text-ink/50">
                {post.date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
