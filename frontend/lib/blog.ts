import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface PostMeta {
  title: string;
  description: string;
  date: Date;
  slug: string;
}

export interface Post extends PostMeta {
  content: string;
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data } = matter(raw);
      return {
        title: data.title as string,
        description: data.description as string,
        date: new Date(data.date),
        slug: (data.slug as string) || file.replace(/\.md$/, ""),
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getPostBySlug(slug: string): Post | null {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    const postSlug = (data.slug as string) || file.replace(/\.md$/, "");
    if (postSlug === slug) {
      return {
        title: data.title as string,
        description: data.description as string,
        date: new Date(data.date),
        slug: postSlug,
        content,
      };
    }
  }
  return null;
}
