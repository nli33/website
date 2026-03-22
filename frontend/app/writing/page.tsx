import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing | Neng Li",
};

export default function WritingPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="mb-2 text-4xl font-bold">Writing</h1>
      {posts.length === 0 ? (
        <p className="text-gray-600">No posts yet.</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <a
                href={`/writing/${post.slug}`}
                className="text-2xl font-semibold text-blue-700 hover:underline"
              >
                {post.title}
              </a>
              <p className="mt-2 text-gray-700">{post.description}</p>
              <p className="mt-3 text-sm text-gray-500">
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
