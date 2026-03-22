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
      <section className="contact mb-8">
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
    </main>
  );
}
