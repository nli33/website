import { projects } from "@/lib/projects";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ChessDemo from "@/components/ChessDemo";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return { title: `${project.title} | Projects` };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <a href="/projects" className="text-sm text-blue-700 hover:underline">
        ← Back to Projects
      </a>

      <div className="mt-6 rounded-lg bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-500 hover:text-gray-900"
          >
            View on GitHub →
          </a>
        </div>

        <p className="mb-4 text-lg text-gray-700">{project.description}</p>

        <ul className="mb-8 list-disc space-y-2 pl-5 text-gray-700">
          {project.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>

        {/* Demo section */}
        {project.demo === "chess" && <ChessDemo />}

        {project.demo === "video" && project.videoUrl && (
          <div className="mt-4">
            <h2 className="mb-3 text-xl font-semibold">Demo</h2>
            {project.videoUrl.includes("youtube") || project.videoUrl.includes("youtu.be") ? (
              <iframe
                src={project.videoUrl}
                className="h-64 w-full rounded-lg border border-gray-200 sm:h-96"
                allowFullScreen
              />
            ) : (
              <img src={project.videoUrl} alt="Demo" className="rounded-lg border border-gray-200" />
            )}
          </div>
        )}

        {project.demo === "screenshot" && project.screenshotUrl && (
          <div className="mt-4">
            <h2 className="mb-3 text-xl font-semibold">Screenshot</h2>
            <img
              src={project.screenshotUrl}
              alt={`${project.title} screenshot`}
              className="rounded-lg border border-gray-200"
            />
          </div>
        )}

        {project.demo === "video" && !project.videoUrl && (
          <p className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-500 italic">
            Demo video coming soon.
          </p>
        )}

        {project.demo === "screenshot" && !project.screenshotUrl && (
          <p className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-500 italic">
            Screenshot coming soon.
          </p>
        )}
      </div>
    </main>
  );
}
