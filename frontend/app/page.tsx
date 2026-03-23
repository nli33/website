import { projects } from "@/lib/projects";

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto p-8 font-sans antialiased leading-relaxed bg-gray-50 shadow-md rounded-lg">
      <section className="hero mb-12">
        <h1 className="text-5xl font-bold mb-6 text-gray-900">Neng Li</h1>
        <p className="text-xl text-gray-700 mb-4">
          Hi! I&apos;m Neng. I&apos;m a Software Engineering student @ University of Waterloo.
        </p>
        <p className="text-xl text-gray-700">
          I&apos;m passionate about systems programming &amp; ML, and I am currently seeking Summer 2026 opportunities.
        </p>
      </section>

      <section className="contact mb-12">
        <p className="text-lg">
          Email:{" "}
          <a href="mailto:neng.li@uwaterloo.ca" className="text-blue-600 hover:underline">
            neng.li@uwaterloo.ca
          </a>{" "}
          or connect with me on{" "}
          <a href="https://www.linkedin.com/in/neng-li/" className="text-blue-600 hover:underline">
            LinkedIn
          </a>
          .
        </p>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <a href="/projects" className="text-sm text-blue-600 hover:underline">View all →</a>
        </div>
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.slug} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <a
                    href={`/projects/${project.slug}`}
                    className="text-xl font-semibold text-blue-700 hover:underline"
                  >
                    {project.title}
                  </a>
                  <p className="mt-1 text-gray-700">{project.description}</p>
                </div>
                <div className="flex shrink-0 gap-2">
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
      </section>
    </main>
  );
}
