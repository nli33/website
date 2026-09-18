import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface PostMeta {
  title: string;
  description: string;
  date: Date;
  slug: string;
  thumbnail?: string;
  readingMinutes: number;
}

const WORDS_PER_MINUTE = 200;

function estimateReadingMinutes(content: string): number {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

export interface Post extends PostMeta {
  content: string;
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      return {
        title: data.title as string,
        description: data.description as string,
        date: new Date(data.date),
        slug: (data.slug as string) || file.replace(/\.md$/, ""),
        thumbnail: data.thumbnail as string | undefined,
        readingMinutes: estimateReadingMinutes(content),
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

const SHORT_MONTHS = [
  "Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.",
  "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec.",
];

export function formatShortDate(date: Date): string {
  return `${SHORT_MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
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
        thumbnail: data.thumbnail as string | undefined,
        readingMinutes: estimateReadingMinutes(content),
        content,
      };
    }
  }
  return null;
}
