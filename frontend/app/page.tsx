import { getAllPosts, formatShortDate } from "@/lib/blog";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";

export default function Home() {
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <main className="mx-auto max-w-4xl p-8 antialiased leading-relaxed">
      <section className="hero mb-6">
        <h1 className="mb-6 font-serif text-5xl font-semibold text-ink">Neng Li</h1>
        <p className="mb-4 text-xl text-ink/80">
          Hi! I&apos;m Neng. I&apos;m a 2A Software Engineering student @ University of Waterloo.
        </p>
        <p className="text-xl text-ink/80">
          I like ML &amp; systems programming.
        </p>
      </section>

      <hr className="my-8 border-line" />

      <section className="links mb-6">
        <ul className="space-y-2 text-xl">
          {[
            ["/photos", "Cool photos I took"],
            ["/media", "Favourite media"],
          ].map(([href, label]) => (
            <li key={href}>
              <a href={href} className="font-serif font-semibold text-accent-600 hover:text-accent-700 hover:underline">
                {label}
                <span className="ml-2">&gt;&gt;</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <hr className="my-8 border-line" />

      {recentPosts.length > 0 && (
        <section className="recent-writing mb-6">
          <a
            href="/writing"
            className="mb-3 inline-block font-serif text-xl font-semibold text-accent-600 hover:text-accent-700 hover:underline"
          >
            Recent Writing
            <span className="ml-2">&gt;&gt;</span>
          </a>
          <ul className="space-y-3">
            {recentPosts.map((post) => (
              <li key={post.slug} className="rounded-lg border border-line bg-white/60 p-4 shadow-sm">
                <a href={`/writing/${post.slug}`} className="block">
                  <p className="font-serif text-lg font-semibold text-ink hover:text-accent-600">{post.title}</p>
                  <p className="mt-1 text-sm text-ink/50">
                    {formatShortDate(post.date)}
                    <span className="mx-2">·</span>
                    {post.readingMinutes} min read
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <hr className="my-8 border-line" />

      <section className="contact mb-12">
        <h2 className="mb-3 font-serif text-2xl font-semibold text-ink">Socials</h2>
        <ul className="list-disc space-y-2 pl-5 text-lg text-ink/80">
          <li>
            GitHub:{" "}
            <a href="https://github.com/nli33" className="text-accent-600 hover:text-accent-700 hover:underline">
              nli33
            </a>
          </li>
          <li>
            LinkedIn:{" "}
            <a href="https://www.linkedin.com/in/neng-li/" className="text-accent-600 hover:text-accent-700 hover:underline">
              in/neng-li
            </a>
          </li>
          <li>
            Email: <ObfuscatedEmail user="neng.li" domain="uwaterloo.ca" />
          </li>
        </ul>
      </section>
    </main>
  );
}
