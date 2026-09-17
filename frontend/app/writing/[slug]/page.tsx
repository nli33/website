import { getAllPosts, getPostBySlug } from "@/lib/blog";
import MarkdownContent from "@/components/MarkdownContent";
import { notFound } from "next/navigation";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { toString as hastToString } from "hast-util-to-string";
import type { Root, Element } from "hast";
import type { Metadata } from "next";
import "katex/dist/katex.min.css";

interface Heading {
  id: string;
  text: string;
  depth: number;
}

function collectHeadings(headings: Heading[]) {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "h1" || node.tagName === "h2" || node.tagName === "h3") {
        const id = node.properties?.id;
        if (typeof id === "string") {
          headings.push({ id, text: hastToString(node), depth: Number(node.tagName[1]) });
        }
      }
    });
  };
}

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

  const headings: Heading[] = [];
  const processed = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeSlug)
    .use(() => collectHeadings(headings))
    .use(rehypeStringify)
    .process(post.content);
  const contentHtml = processed.toString();

  return (
    <main className="mx-auto w-full max-w-4xl bg-white px-4 py-8 sm:bg-transparent sm:px-6 sm:py-12">
      <a href="/writing" className="text-sm text-accent-600 hover:text-accent-700 hover:underline">
        ← Back to Writing
      </a>
      <article className="mt-4 sm:mt-6 sm:rounded-lg sm:border sm:border-line sm:bg-white/60 sm:p-8 sm:shadow-sm">
        <h1 className="m-0 mb-2 font-serif text-4xl font-semibold leading-tight text-accent-700">{post.title}</h1>
        <p className="text-sm text-ink/50">
          {post.date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          })}
        </p>
        {headings.length > 0 && (
          <nav className="toc mt-6 rounded-lg border border-line bg-paper/60 px-6 py-5 text-base">
            <p className="mb-3 text-lg font-semibold text-ink">Contents</p>
            <ul>
              {headings.map((h) => (
                <li key={h.id} className={h.depth === 3 ? "ml-12" : h.depth === 2 ? "ml-6" : undefined}>
                  <a href={`#${h.id}`} className="text-ink/70 hover:text-accent-600">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <MarkdownContent html={contentHtml} />
      </article>
      <style>{`
        .markdown { color: #2b2420; font-size: 1.0625rem; }
        .markdown h1 { margin: 2rem 0 0.75rem 0; font-size: 2rem; font-weight: 600; line-height: 1.2; font-family: var(--font-serif), Georgia, serif; color: #7c3419; }
        .markdown h2 { margin: 2rem 0 0.75rem 0; font-size: 1.5rem; font-weight: 600; font-family: var(--font-serif), Georgia, serif; scroll-margin-top: 1.5rem; color: #7c3419; }
        .markdown h3 { margin: 1.5rem 0 0.5rem 0; font-size: 1.2rem; font-weight: 600; font-family: var(--font-serif), Georgia, serif; scroll-margin-top: 1.5rem; color: #7c3419; }
        .toc ul { margin: 0; padding: 0; list-style: none; }
        .toc li { margin-top: 0.45rem; margin-bottom: 0.45rem; }
        .markdown p { margin: 1rem 0; line-height: 1.75; }
        .markdown ul, .markdown ol { margin: 1rem 0 1rem 1.5rem; }
        .markdown ul { list-style: disc; }
        .markdown ol { list-style: decimal; }
        .markdown li { margin: 0.35rem 0; }
        .markdown a { color: #b3502a; text-decoration: underline; }
        .markdown table { width: 100%; margin: 1.5rem 0; border-collapse: collapse; }
        .markdown th, .markdown td { border: 1px solid #e7dbc9; padding: 0.6rem; text-align: left; }
        .markdown th { background: #f7ece1; }
        .markdown img { margin: 1.5rem 0; max-width: 100%; height: auto; border-radius: 0.5rem; cursor: zoom-in; }
        .markdown pre { overflow-x: auto; background: #f3ece0; padding: 1rem; border-radius: 0.5rem; }
        .markdown code { font-size: 0.9em; background: #f0dcc7; color: #7c3419; padding: 0.15em 0.4em; border-radius: 0.3em; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
        .markdown pre code { background: none; color: inherit; padding: 0; border-radius: 0; }
      `}</style>
    </main>
  );
}
