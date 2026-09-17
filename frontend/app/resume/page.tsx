import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume | Neng Li",
};

export default function ResumePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-4xl font-semibold text-ink">Resume</h1>
        <a
          href="/resume.pdf"
          download
          className="rounded-lg border border-line bg-white/60 px-4 py-2 text-sm font-medium text-ink hover:border-accent-400 hover:text-accent-600"
        >
          Download PDF
        </a>
      </div>
      <div className="overflow-hidden rounded-lg border border-line bg-white/60 shadow-sm">
        <iframe src="/resume.pdf" title="Neng Li's resume" className="h-[80vh] w-full" />
      </div>
    </main>
  );
}
