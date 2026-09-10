import { projects } from "@/lib/projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Neng Li",
};

export default function ProjectsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="mb-8 font-serif text-4xl font-semibold text-ink">Projects</h1>
      <ul className="space-y-6">
        {projects.map((project) => (
          <li key={project.slug} className="rounded-lg border border-line bg-white/60 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <a
                  href={`/projects/${project.slug}`}
                  className="font-serif text-2xl font-semibold text-ink hover:text-accent-600"
                >
                  {project.title}
                </a>
                <p className="mt-2 text-ink/70">{project.description}</p>
              </div>
              <div className="flex shrink-0 gap-3">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-line px-3 py-1 text-sm text-ink/60 hover:border-accent-400 hover:text-ink"
                >
                  GitHub
                </a>
                {project.demo && (
                  <a
                    href={`/projects/${project.slug}`}
                    className="rounded border border-accent-100 bg-accent-50 px-3 py-1 text-sm text-accent-600 hover:bg-accent-100"
                  >
                    Demo
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
