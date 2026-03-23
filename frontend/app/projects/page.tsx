import { projects } from "@/lib/projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Neng Li",
};

export default function ProjectsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-4xl font-bold">Projects</h1>
      <ul className="space-y-6">
        {projects.map((project) => (
          <li key={project.slug} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <a
                  href={`/projects/${project.slug}`}
                  className="text-2xl font-semibold text-blue-700 hover:underline"
                >
                  {project.title}
                </a>
                <p className="mt-2 text-gray-700">{project.description}</p>
              </div>
              <div className="flex shrink-0 gap-3">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:border-gray-500 hover:text-gray-900"
                >
                  GitHub
                </a>
                {project.demo && (
                  <a
                    href={`/projects/${project.slug}`}
                    className="rounded border border-blue-300 bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100"
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
