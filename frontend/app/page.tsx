export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-8 antialiased leading-relaxed">
      <section className="hero mb-12">
        <h1 className="mb-6 font-serif text-5xl font-semibold text-ink">Neng Li</h1>
        <p className="mb-4 text-xl text-ink/80">
          Hi! I&apos;m Neng. I&apos;m a 2A Software Engineering student @ University of Waterloo.
        </p>
        <p className="text-xl text-ink/80">
          I&apos;m passionate about systems programming &amp; ML, and I'm currently seeking Winter 2027 opportunities.
        </p>
      </section>

      <section className="contact mb-12">
        <p className="text-lg text-ink/80">
          Email:{" "}
          <a href="mailto:neng.li@uwaterloo.ca" className="text-accent-600 hover:text-accent-700 hover:underline">
            neng.li@uwaterloo.ca
          </a>{" "}
          or connect with me on{" "}
          <a href="https://www.linkedin.com/in/neng-li/" className="text-accent-600 hover:text-accent-700 hover:underline">
            LinkedIn
          </a>
          .
        </p>
      </section>
    </main>
  );
}
