import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { notFound } from "next/navigation";
import { remark } from "remark";
import remarkHtml from "remark-html";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return { title: `${post.title} | Writing` };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const processed = await remark().use(remarkHtml).process(post.content);
  const contentHtml = processed.toString();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <a href="/writing" className="text-sm text-blue-700 hover:underline">
        ← Back to Writing
      </a>
      <article className="markdown mt-6 rounded-lg bg-white p-8 shadow-sm">
        <h1 className="m-0 mb-2 text-4xl font-bold leading-tight">{post.title}</h1>
        <p className="text-sm text-gray-500">
          {post.date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          })}
        </p>
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>
      <style>{`
        .markdown h1 { margin: 0 0 0.5rem 0; font-size: 2rem; font-weight: 700; line-height: 1.2; }
        .markdown h2 { margin: 2rem 0 0.75rem 0; font-size: 1.5rem; font-weight: 600; }
        .markdown h3 { margin: 1.5rem 0 0.5rem 0; font-size: 1.2rem; font-weight: 600; }
        .markdown p { margin: 1rem 0; line-height: 1.75; }
        .markdown ul, .markdown ol { margin: 1rem 0 1rem 1.5rem; }
        .markdown ul { list-style: disc; }
        .markdown ol { list-style: decimal; }
        .markdown li { margin: 0.35rem 0; }
        .markdown a { color: #1d4ed8; text-decoration: underline; }
        .markdown table { width: 100%; margin: 1.5rem 0; border-collapse: collapse; }
        .markdown th, .markdown td { border: 1px solid #d1d5db; padding: 0.6rem; text-align: left; }
        .markdown th { background: #f3f4f6; }
        .markdown img { margin: 1.5rem 0; max-width: 100%; height: auto; border-radius: 0.5rem; }
      `}</style>
    </main>
  );
}
